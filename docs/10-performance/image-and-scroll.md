# 이미지 / 스크롤 최적화

> 한 줄 요약 — 셀 스크롤이 끊기는 이유는 거의 항상 **이미지 디코드 + 레이아웃 + off-screen rendering** 셋 중 하나. 디코드를 *표시 시점이 아닌 미리*, 표시는 *적절한 픽셀 크기로*가 핵심.

## UIImage의 비밀 — 지연 디코드

`UIImage(named:)`는 *파일 메타*만 들고 있다가, **실제로 화면에 그릴 때 디코드**한다. 즉 디코드 비용이 메인 스레드 commit 직전에 발생 → hitch.

해결: 백그라운드에서 미리 디코드해 비트맵으로 캐시.

```swift
extension UIImage {
    func decoded() -> UIImage {
        let format = UIGraphicsImageRendererFormat.default()
        format.opaque = false
        return UIGraphicsImageRenderer(size: size, format: format).image { _ in
            draw(in: CGRect(origin: .zero, size: size))
        }
    }
}

DispatchQueue.global(qos: .userInitiated).async {
    let img = UIImage(data: data)!.decoded()
    DispatchQueue.main.async { cell.imageView.image = img }
}
```

## Downsampling — 표시 크기로 줄이기

```swift
func downsample(_ url: URL, maxPixel: CGFloat, scale: CGFloat) -> UIImage? {
    let opts: [CFString: Any] = [kCGImageSourceShouldCache: false]
    guard let src = CGImageSourceCreateWithURL(url as CFURL, opts as CFDictionary) else { return nil }
    let thumbnailOpts: [CFString: Any] = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: maxPixel * scale
    ]
    guard let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, thumbnailOpts as CFDictionary) else { return nil }
    return UIImage(cgImage: cg, scale: scale, orientation: .up)
}
```

- 원본 8000x8000을 셀(400x400)에 띄울 때 디코드/메모리 *수십 배* 절약.
- `kCGImageSourceShouldCacheImmediately`로 미리 디코드.

## 캐시

```swift
final class ImageCache {
    static let shared = ImageCache()
    private let cache = NSCache<NSURL, UIImage>()
    init() { cache.totalCostLimit = 50 * 1024 * 1024 }      // 50MB

    func image(for url: URL) -> UIImage? { cache.object(forKey: url as NSURL) }
    func set(_ img: UIImage, for url: URL, cost: Int) { cache.setObject(img, forKey: url as NSURL, cost: cost) }
}
```

`NSCache`는 메모리 워닝 시 자동으로 일부 항목 제거. 디스크 캐시는 별도.

라이브러리: Kingfisher, SDWebImage, Nuke. 프로덕션에선 보통 이쪽 사용.

## 스크롤 최적화 체크리스트

- 이미지: 비동기 + downsampling + 캐시.
- 셀 안 *영구 작업* 없게: 무거운 작업은 prefetching API에서 미리.
- `cornerRadius` + `masksToBounds`: 단순 컨텐츠면 OK, 복잡하면 *snapshot 이미지로 대체*.
- 그림자: `shadowPath` 명시.
- AutoLayout 우선순위 충돌 없게 — 셀마다 100ms씩 쓰면 끝.
- self-sizing 셀: estimated 정확히, 잘못 추정하면 스크롤바 이상.
- `prefetchDataSource`로 다음 셀 미리 준비.
- `cellForRow`에서 *동기적 디스크/네트워크* 금지.

## prefetching

```swift
extension VC: UITableViewDataSourcePrefetching {
    func tableView(_ t: UITableView, prefetchRowsAt indexPaths: [IndexPath]) {
        for ip in indexPaths { ImagePipeline.shared.prefetch(items[ip.row].url) }
    }
    func tableView(_ t: UITableView, cancelPrefetchingForRowsAt indexPaths: [IndexPath]) {
        for ip in indexPaths { ImagePipeline.shared.cancelPrefetch(items[ip.row].url) }
    }
}
```

스크롤 방향으로 미리 데이터를 받아 두면 첫 표시가 즉각.

## 셀 재사용 시 이미지 잘못 표시되는 문제

비동기 로드 결과가 다른 row를 위해 재사용된 셀에 도달:

```swift
let token = items[ip.row].id
cell.token = token
ImageCache.load(url) { [weak cell] img in
    guard cell?.token == token else { return }   // 가드
    cell?.imageView.image = img
}
```

또는 셀에 *cancel 핸들*을 보관, `prepareForReuse`에서 cancel.

## 측정 포인트

- Instruments → Animation Hitches: 어느 프레임이 길었는지.
- Time Profiler: 메인 스레드의 어디서.
- Allocations: 이미지로 인한 메모리 폭증.
- Core Animation: off-screen pass 횟수.

## 흔한 함정 / Follow-up

- **Q. `UIImageView.image = ...`만 했는데 끊긴다.**
  지연 디코드. 백그라운드에서 디코드 후 메인에서 set.

- **Q. 이미지가 깨끗한데 메모리가 너무 큼.**
  표시 크기 대비 원본이 큼. downsampling.

- **Q. `cornerRadius`로 동그란 프로필 이미지에서 끊김.**
  복잡한 콘텐츠 + masks → off-screen. 미리 마스크된 비트맵을 만들어 놓거나, `UIBezierPath`로 자른 이미지를 캐싱.

- **Q. 같은 셀 스크롤하면 부드러운데 처음만 끊김.**
  캐시 미스 + 디코드. prefetching으로 완화.

- **Q. SwiftUI `Image`는?**
  내부에서 자동 캐시/디코드. 그러나 *대용량 원본*은 마찬가지로 줄여서 사용. SwiftUI는 `AsyncImage`가 단순 케이스용, 대규모는 별도 파이프라인.

- **Q. WebP/HEIC?**
  HEIC는 iOS 11+ 기본 지원. WebP는 iOS 14+. 용량은 줄지만 디코드 비용은 또 다른 변수 — 측정 후 선택.

## 참고

- WWDC 2018: Image and Graphics Best Practices
- WWDC 2021: Eliminate Animation Hitches
- Kingfisher / SDWebImage 문서 (캐시/파이프라인)
