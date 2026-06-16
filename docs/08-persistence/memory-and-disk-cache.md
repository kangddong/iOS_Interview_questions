# 메모리 / 디스크 캐시 (NSCache · URLCache · 직접 만든 LRU)

> 한 줄 요약 — *재계산/재네트워크 비용 > 저장 비용*일 때 캐시한다. iOS에서는 **NSCache(메모리, 자동 해제)** + **URLCache(HTTP 의미론)** + **수동 LRU 디스크 캐시**의 2-tier 조합이 표준이며, hit rate를 *측정하지 않으면* 캐시는 메모리만 잡아먹는 죽은 코드가 된다.

## 핵심 개념

### NSCache (메모리 캐시)
- `NSDictionary`와 달리 **메모리 압박 시 OS가 자동으로 비운다** (UIApplicationDidReceiveMemoryWarning에 자동 반응).
- **thread-safe** — 락 직접 잡지 않아도 됨. 대조: `Dictionary`는 직접 동기화해야 한다.
- 키는 **클래스 타입**만 가능 (`NSString`, `NSNumber`). Swift `String`은 bridging됨.
- `totalCostLimit` (바이트), `countLimit` (개수) — 둘 중 하나 도달 시 evict. eviction 순서는 **문서화되지 않음** (LRU 보장 X).
- *왜 NSCache인가*: 메모리 압박 자동 응답 + thread-safe. 둘 다 직접 구현하면 버그 온상.

### URLCache (HTTP 캐시)
- `URLSession`이 자동으로 사용. `Cache-Control`, `ETag`, `Expires` 같은 **HTTP 캐시 의미론**을 그대로 따른다.
- 메모리 + 디스크 2-tier 내장. `URLCache(memoryCapacity:diskCapacity:directory:)`로 사이즈 지정.
- *왜 직접 캐시 만들지 말고 URLCache 쓰나*: 서버가 `ETag`/`Last-Modified` 주면 자동으로 `If-None-Match` 요청 → 304면 본문 재사용. 직접 구현하면 거의 항상 부정확하게 만든다.
- 한계: 응답이 **그대로** 캐시됨. 디코딩된 `UIImage` 같은 형태로는 보관 X → 디스크 read + decode를 매번. 이미지 파이프라인은 따로 둘 것.

### 직접 만든 LRU 디스크 캐시
- 큰 blob(이미지, 영상 썸네일, 디코딩된 모델) 보관용.
- *왜 필요한가*: URLCache는 HTTP 응답 단위라 "디코딩된 `UIImage`"나 "리사이즈된 썸네일" 같은 가공 후 산출물을 못 담는다.
- 위치는 `Library/Caches` — OS가 디스크 압박 시 삭제 가능(앱 켜진 동안에는 보통 안 지움).
- LRU 구현: 더블 링크드 리스트 + 딕셔너리, 혹은 단순하게 마지막 접근 시각(파일 mtime)으로 정렬.

### 2-tier 패턴 (Memory + Disk)
```
read(key):
  1. NSCache hit?    → return (L1)
  2. Disk hit?       → decode → put NSCache → return (L2 promote)
  3. Network         → decode → put both → return
```
- L1 (NSCache): 디코딩된 객체. 빠르지만 메모리 압박 시 날아감.
- L2 (디스크 LRU): 원본 또는 디코딩 직전 데이터. 앱 재시작 후에도 유지.

## 비교

| 항목 | NSCache | URLCache | 직접 만든 LRU disk |
|---|---|---|---|
| 위치 | RAM | RAM + 디스크 | 디스크 |
| 자동 메모리 압박 응답 | O (즉시 evict) | RAM 분만 | X (직접 구현) |
| HTTP 의미론 (ETag/Cache-Control) | X | O | X |
| 키 타입 | AnyObject (NSString 권장) | URLRequest | 자유 (보통 SHA-256(url)) |
| read 비용 | ~수 ns (dict lookup) | RAM hit ns / disk hit ~ms | 디스크 ~ms + decode |
| write 비용 | ns | RAM ns / disk ~ms | ~ms (atomic write) |
| 동시성 | thread-safe 내장 | thread-safe (URLSession 큐) | 직접 락/큐 필요 |
| 앱 재시작 후 유지 | X | 디스크분만 O | O |
| eviction 정책 | 불명 (cost/count 한도) | LRU 추정 + HTTP 의미론 | 직접 정의 (LRU/LFU/...) |
| 적합 데이터 | 디코딩된 객체 | HTTP 응답 그대로 | 가공된 blob, 큰 데이터 |

## 코드 예시

### 2-tier 이미지 캐시 (최소 골격)

```swift
final class ImageCache {
    static let shared = ImageCache()

    private let memory: NSCache<NSString, UIImage> = {
        let c = NSCache<NSString, UIImage>()
        c.totalCostLimit = 100 * 1024 * 1024 // 100MB
        c.countLimit = 500
        return c
    }()

    private let diskQueue = DispatchQueue(label: "image.disk", qos: .utility)
    private let diskURL: URL = {
        let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        let dir = caches.appendingPathComponent("images", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    func image(for key: String) async -> UIImage? {
        let nsKey = key as NSString
        if let hit = memory.object(forKey: nsKey) {
            Signpost.cacheHit(.memory); return hit
        }
        let file = diskURL.appendingPathComponent(key.sha256())
        if let img = await loadDisk(file) {
            memory.setObject(img, forKey: nsKey, cost: img.estimatedBytes)
            Signpost.cacheHit(.disk)
            return img
        }
        Signpost.cacheMiss()
        return nil
    }

    func insert(_ image: UIImage, for key: String, data: Data) {
        memory.setObject(image, forKey: key as NSString, cost: image.estimatedBytes)
        diskQueue.async { [diskURL] in
            let url = diskURL.appendingPathComponent(key.sha256())
            try? data.write(to: url, options: .atomic) // mtime = 마지막 접근 (LRU 정렬용)
        }
    }

    private func loadDisk(_ url: URL) async -> UIImage? {
        await withCheckedContinuation { cont in
            diskQueue.async {
                guard let data = try? Data(contentsOf: url),
                      let img = UIImage(data: data) else { cont.resume(returning: nil); return }
                // 접근 시각 갱신 (LRU)
                try? FileManager.default.setAttributes([.modificationDate: Date()], ofItemAtPath: url.path)
                cont.resume(returning: img)
            }
        }
    }
}
```

### URLCache 설정 (HTTP 응답 캐시)

```swift
let cache = URLCache(
    memoryCapacity: 20 * 1024 * 1024,
    diskCapacity: 200 * 1024 * 1024,
    directory: nil
)
let config = URLSessionConfiguration.default
config.urlCache = cache
config.requestCachePolicy = .useProtocolCachePolicy // 서버 Cache-Control 우선
let session = URLSession(configuration: config)
```

## 측정 / 벤치마크

### hit rate 측정 (os_signpost)
```swift
import os.signpost
let log = OSLog(subsystem: "app.cache", category: .pointsOfInterest)
enum Tier: String { case memory, disk }
enum Signpost {
    static func cacheHit(_ t: Tier) {
        os_signpost(.event, log: log, name: "cache.hit", "%{public}@", t.rawValue)
    }
    static func cacheMiss() { os_signpost(.event, log: log, name: "cache.miss") }
}
```
- Instruments → **Points of Interest** + **os_signpost** 트랙으로 hit/miss 카운트 추적.
- hit rate = hits / (hits + miss). **70% 미만이면 캐시 정책 재설계**가 신호.

### eviction 측정
- `NSCacheDelegate.cache(_:willEvictObject:)` 카운터로 evict 빈도 추적.
- 디스크: 주기적으로 디렉터리 사이즈와 파일 수 로깅 (`FileManager.allocatedSizeOfDirectory`).

### 함정
- **메모리만 측정하고 디스크 무시**: 디스크 캐시가 무한 증가해 100MB+ 차지하는 케이스가 흔하다. 사이즈 캡과 정리 주기를 반드시.
- **NSCache eviction을 LRU로 착각**: 문서화 안 됨. LRU가 중요하면 직접 구현.
- **JPEG/PNG 데이터를 NSCache에 넣고 매번 decode**: cost는 *디코딩 후 RAM 점유*로 계산해야 정확. `width × height × 4 bytes`.

## 흔한 함정 / Follow-up

- **Q. NSCache의 eviction은 LRU인가?**
  보장되지 않는다. `totalCostLimit`/`countLimit`을 넘으면 evict하지만 *순서는 문서화 없음*. LRU가 중요하면 직접 LRU 자료구조 + lock 사용.

- **Q. URLCache가 있는데 왜 이미지 캐시를 따로 만드나?**
  URLCache는 `Data`만 보관 — 매번 `UIImage(data:)` 디코딩 비용이 든다. 또한 디코딩된 `CGImage`는 GPU 업로드까지 추가됨. 디코딩 결과를 메모리 캐시에 보관해야 스크롤 hitch가 사라진다.

- **Q. NSCache를 thread-safe하다고 했는데, 왜 `if let _ = cache.object(...); cache.setObject(...)` 패턴은 race가 생기나?**
  *개별 호출*은 atomic이지만 *복합 동작*은 아니다. read-modify-write는 외부 락이 필요.

- **Q. Caches 디렉터리는 언제 비워지는가?**
  앱이 백그라운드/종료 상태일 때 디스크 압박이 있으면 OS가 일부/전체를 지울 수 있다. **앱이 켜져 있는 동안은 안전**으로 보되, 데이터 손실 가정하에 코드 작성.

- **Q. 이미지 다운샘플링은 어디서?**
  decode 직후 `CGImageSourceCreateThumbnailAtIndex`로 표시 사이즈에 맞춰 축소한 뒤 NSCache에 보관. 원본 풀사이즈 디코딩을 캐시하는 게 메모리 폭발의 주범.

- **Q. URLCache는 POST를 캐시하나?**
  기본적으로 GET만. POST 응답 캐시는 거의 항상 버그.

## 참고
- WWDC 2018 **Image and Graphics Best Practices** (다운샘플링)
- Apple Docs: `NSCache`, `URLCache`, `URLSessionConfiguration.requestCachePolicy`
- RFC 7234 (HTTP Caching) — `Cache-Control`, `ETag` 의미론
- Kingfisher / SDWebImage 소스 (2-tier 구현 레퍼런스)
