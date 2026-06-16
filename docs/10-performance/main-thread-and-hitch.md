# 메인 스레드와 hitch

> 한 줄 요약 — 60Hz 화면은 **한 프레임 16.67ms** 안에 메인 스레드가 그릴 내용을 *커밋*해야 한다. 초과하면 프레임 드롭(hitch) → 사용자가 끊김으로 체감.

## 프레임 예산

| 디바이스 | 주사율 | 한 프레임 |
|---|---|---|
| 일반 | 60 Hz | 16.67ms |
| ProMotion (iPhone Pro, iPad Pro) | 120 Hz | 8.33ms |

이 예산 안에서 *메인 스레드가* 다음을 끝내야 함:
- 이벤트 처리
- 레이아웃 계산
- draw / commit (CALayer 트리)

GPU 렌더링은 별도 스레드에서 일어나지만, 메인 스레드가 commit을 늦게 주면 GPU도 놀게 됨.

## hitch vs hang

| | 정의 | 체감 |
|---|---|---|
| **hitch** | 한 프레임 놓침 | 한 번 *툭* 끊김 |
| **hang** | 메인이 *수백 ms 이상* 멈춤 | 앱이 얼어버린 느낌 |

hang이 250ms 넘어가면 사용자는 *앱이 죽었다*고 느낌. 1s 넘으면 OS가 ANR 비슷하게 인지.

## 메인 스레드를 막는 흔한 원인

1. **무거운 계산** — 큰 배열 정렬, 정규식, 압축/해제
2. **JSON 파싱** — 큰 응답을 메인에서 디코드
3. **디스크 I/O** — `Data(contentsOf:)`, Core Data save
4. **이미지 디코드** — 큰 JPEG/PNG를 메인에서 그리기 직전 디코드
5. **AutoLayout 폭주** — 셀 높이 계산이 비대
6. **Lock 대기** — 다른 스레드가 잡고 있는 락
7. **NotificationCenter 동기 핸들러 폭주**

## 해결 패턴

### 1) 백그라운드로 옮기기

```swift
Task.detached(priority: .userInitiated) {
    let parsed = try JSONDecoder().decode([Item].self, from: data)
    await MainActor.run { self.items = parsed }
}
```

### 2) 점진적 표시

대량 데이터를 한 번에 보여 주려 하지 말고 *처음 화면 분량*만 빠르게, 나머지는 lazy.

### 3) 캐시

매 프레임 다시 계산하는 값(예: 텍스트 크기 측정)을 캐시. 단, 무한 증가 주의.

### 4) 이미지 downsampling

```swift
let options: [CFString: Any] = [
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceShouldCacheImmediately: true,
    kCGImageSourceCreateThumbnailWithTransform: true,
    kCGImageSourceThumbnailMaxPixelSize: maxDimension
]
let src = CGImageSourceCreateWithData(data, nil)!
let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, options as CFDictionary)!
let image = UIImage(cgImage: cg)
```

원본 8000x8000 사진을 200x200 셀에 띄울 때 메모리/디코드 시간 모두 절감.

## 측정

- **Instruments → Animation Hitches**: 사용자 스크롤 등 시뮬레이션, 어느 프레임에서 hitch 발생했는지.
- **Xcode Organizer → Hangs**: 실제 사용자 앱에서 발생한 hang 통계.
- **MetricKit**: 디바이스에서 자동 수집된 hang/render 데이터를 앱이 받아 분석.

## SwiftUI에서

`body`가 자주 호출되어도 가벼우면 OK이지만, body 안에 *비싼 표현식*이 있으면 매 프레임 비용. 정렬/필터/포맷팅은 *외부 store에서 캐시*해 body에선 단순 읽기만.

```swift
// ❌ body마다 정렬
var body: some View {
    List(items.sorted(by: { $0.date > $1.date })) { ... }
}

// ✅ store에서 정렬된 결과를 보유
@Observable class Store { var sorted: [Item] = [] }
```

## UIScrollView/Table에서

- 셀 안에 `cornerRadius` + `masksToBounds` + 그림자 + 비투명 배경 → off-screen pass 폭증.
- `shouldRasterize`는 *변하지 않는* layer에만.
- prefetching API로 콘텐츠 미리 준비.
- 이미지 디코드는 백그라운드, 표시는 메인.

## 흔한 함정 / Follow-up

- **Q. 스크롤이 끊긴다. 어디부터?**
  Animation Hitches로 측정 → 어느 프레임이 길었는지 확인 → Time Profiler로 그 시점 메인 스레드 스택 → 자주 등장하는 함수 추적.

- **Q. 큰 이미지로 메모리가 폭발한다.**
  표시 크기에 맞게 downsampling. UIImage는 *디코드 시 비트맵 메모리*가 크기 비례로 잡힘.

- **Q. 메인 스레드 체크 어떻게 자동화?**
  Xcode Scheme → Diagnostics → Main Thread Checker. 백그라운드에서 UIKit을 만지면 즉시 경고.

- **Q. async/await로 옮겼는데 여전히 메인이 막힌다.**
  await 호출 후 *재개 지점*이 자동으로 백그라운드는 아님. 함수가 `@MainActor`라면 결과 처리도 메인. 무거운 계산은 actor/detached로.

- **Q. UI 변경을 일괄적으로 처리?**
  여러 view 변경을 한 frame에 묶어 *unnecessary layout*을 줄임. UIKit `UIView.performWithoutAnimation`, SwiftUI `withAnimation`.

## 참고

- WWDC 2021: Eliminate animation hitches
- WWDC 2022: Track down hangs with Xcode and on-device detection
- WWDC 2023: Analyze hangs with Instruments
