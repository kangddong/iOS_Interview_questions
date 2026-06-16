# Background URLSession, Retry, Cache, Multipart

> 한 줄 요약 — 앱이 *종료된 후에도* 진행되는 다운로드/업로드는 **background URLSession**, 일시적 실패에 강한 호출은 **지수 백오프 + jitter + idempotency 검증**, 응답 비용 절감은 **HTTP 캐시(URLCache)와 ETag/Last-Modified**, 큰 파일 업로드는 **streaming + multipart**가 정답.

## Background URLSession

```swift
let config = URLSessionConfiguration.background(withIdentifier: "com.app.bg")
config.isDiscretionary = true        // 시스템이 적절한 시점 선택
config.sessionSendsLaunchEvents = true
let session = URLSession(configuration: config, delegate: handler, delegateQueue: nil)

let task = session.downloadTask(with: url)
task.resume()
```

- 앱이 *종료/백그라운드*여도 OS가 진행 → 완료 시 *앱을 깨워서* 콜백
- `application(_:handleEventsForBackgroundURLSession:completionHandler:)` (UIKit)에서 *완료 핸들러 보관 후* delegate에서 호출
- 단점: *진행 즉시성* 보장 X, 정책에 의해 지연 가능
- `isDiscretionary`로 *전력/네트워크 효율 우선* 표시

## Retry & 백오프

### 지수 백오프 + jitter

```swift
func withRetry<T>(
    max: Int = 3,
    base: Double = 0.5,
    op: () async throws -> T
) async throws -> T {
    var attempt = 0
    while true {
        do { return try await op() }
        catch {
            attempt += 1
            if attempt > max { throw error }
            let delay = base * pow(2.0, Double(attempt)) + Double.random(in: 0...0.2)
            try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
        }
    }
}
```

- Jitter는 *동시 retry로 인한 thundering herd* 방지
- 5xx, network timeout, connection reset에만 재시도. *4xx는 재시도 무의미* (요청 자체가 잘못됨)
- POST/PUT 재시도는 *멱등성* 확인 후 — 중복 결제/주문 위험

### Idempotency Key

```
POST /orders
Idempotency-Key: 18b3-...
```

서버가 같은 키 요청을 *중복 처리하지 않음*. 클라이언트에서 *주문 생성 시점*에 UUID 생성하고 retry 동안 유지.

## HTTP 캐시 (`URLCache`)

```swift
let cache = URLCache(memoryCapacity: 10_000_000, diskCapacity: 100_000_000, directory: nil)
config.urlCache = cache
config.requestCachePolicy = .useProtocolCachePolicy
```

캐시 정책 결정 트리:
- 서버 응답에 `Cache-Control: max-age=N` → 그동안 캐시
- `Etag`/`Last-Modified` → 조건부 요청 (`If-None-Match`/`If-Modified-Since`) → 304면 본문 안 받음
- 클라이언트는 *별 추가 코드 없이* `useProtocolCachePolicy`로 위 동작 자동

특수 정책:
- `.reloadIgnoringLocalCacheData` — 강제 갱신
- `.returnCacheDataElseLoad` — 오프라인 우선
- `.returnCacheDataDontLoad` — 캐시 hit만

## 멀티파트 업로드

```
POST /upload
Content-Type: multipart/form-data; boundary=----xyz

------xyz
Content-Disposition: form-data; name="metadata"

{"id":1}
------xyz
Content-Disposition: form-data; name="file"; filename="img.jpg"
Content-Type: image/jpeg

<binary>
------xyz--
```

직접 구현:

```swift
var body = Data()
let boundary = "----\(UUID().uuidString)"
func field(_ name: String, _ value: String) {
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
    body.append(value.data(using: .utf8)!); body.append("\r\n".data(using: .utf8)!)
}
func file(_ name: String, _ filename: String, _ mime: String, _ data: Data) {
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: \(mime)\r\n\r\n".data(using: .utf8)!)
    body.append(data); body.append("\r\n".data(using: .utf8)!)
}
// ...
body.append("--\(boundary)--\r\n".data(using: .utf8)!)

var req = URLRequest(url: url)
req.httpMethod = "POST"
req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
let (data, _) = try await URLSession.shared.upload(for: req, from: body)
```

큰 파일은 *Data로 메모리에 모두 올리지 말고* `uploadTask(with:fromFile:)`로 *file URL 스트리밍*.

## Streaming Response

대용량 다운로드/SSE/JSON Lines:

```swift
let (bytes, response) = try await session.bytes(from: url)
for try await line in bytes.lines {
    process(line)
}
```

- 메모리 효율 (chunk 단위 처리)
- chat streaming, log tailing에 적합

## WebSocket

```swift
let task = URLSession.shared.webSocketTask(with: url)
task.resume()
task.send(.string("hello")) { error in ... }
let message = try await task.receive()
```

- HTTP upgrade로 시작 → 양방향 메시지
- *ping/pong*으로 keepalive 직접 관리
- 재연결 로직 + 메시지 큐가 보통 직접 구현 (라이브러리: Starscream, swift-nio)

## HTTP/2 vs HTTP/3

- iOS는 기본 HTTP/2 사용 (서버 지원 시), iOS 15+ HTTP/3 (QUIC)
- *동일 호스트 다중 요청*은 connection multiplexing 자동
- 별도 설정 없이 빠른 path

## 흔한 함정 / Follow-up

- **Q. timeout 설정 무한 디폴트?**
  `URLSessionConfiguration.timeoutIntervalForRequest` 기본 60초. 모바일 환경엔 *적절히 짧게* 설정해 사용자 경험 개선.

- **Q. cancel된 요청의 상태?**
  `URLSession.dataTask`는 `Task.cancel()`과 cooperative. `URLError.cancelled` 발생. 직접 정리 필요 없음.

- **Q. 토큰 갱신 동시성 문제?**
  401 받은 *모든 in-flight 요청*이 동시에 refresh 시도 → 중복 갱신, 충돌. `Actor`로 *단일 refresh task* 공유. 자세히는 [auth-and-token-refresh.md](auth-and-token-refresh.md).

- **Q. background session에서 cookies/credential은?**
  `HTTPCookieStorage.shared` 자동 사용. URL credential도 keychain에 있으면 자동.

- **Q. discretionary와 immediate의 차이?**
  Discretionary는 *WiFi 우선, 충전 중일 때 진행 가능*. 사진 백업 같은 비긴급. immediate는 즉시.

- **Q. multipart에서 boundary 충돌?**
  UUID 사용으로 사실상 0. 명시적 검증은 불필요.

## 참고

- WWDC 2018: Modern Network Programming
- WWDC 2021: Accelerate networking with HTTP/3 and QUIC
- Apple: URLSession Documentation
- RFC 7234 (HTTP Caching)
