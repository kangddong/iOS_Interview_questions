# URLSession

> 한 줄 요약 — Apple이 제공하는 **HTTP/HTTPS, WebSocket, 백그라운드 다운로드**를 모두 다루는 표준 네트워킹 API. Configuration / Session / Task의 3계층 구조.

## 3계층 구조

```
URLSessionConfiguration   ← 정책 (캐시, 타임아웃, 헤더, 백그라운드)
       │ 만든다
URLSession                ← 큐, delegate, 인증
       │ 만든다
URLSessionTask            ← 실제 작업 (data/upload/download/websocket/streaming)
```

## Configuration 종류

| 종류 | 특징 |
|---|---|
| `.default` | 디스크 캐시/쿠키/credential 영속 |
| `.ephemeral` | 모두 메모리. 시크릿 모드 |
| `.background(withIdentifier:)` | 앱이 죽어도 시스템이 이어서 진행 (다운/업로드) |

```swift
let config = URLSessionConfiguration.default
config.timeoutIntervalForRequest = 30
config.timeoutIntervalForResource = 120
config.httpAdditionalHeaders = ["X-App-Version": "1.0"]
config.waitsForConnectivity = true
let session = URLSession(configuration: config)
```

`URLSession.shared`는 *간단한 fetch용*. 헤더/타임아웃/캐시 정책 커스텀이 필요하면 직접 구성.

## async/await API

```swift
let url = URL(string: "https://api.example.com/users/1")!
let (data, response) = try await URLSession.shared.data(from: url)

guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
    throw APIError.badStatus
}
let user = try JSONDecoder().decode(User.self, from: data)
```

### URLRequest 사용

```swift
var req = URLRequest(url: url)
req.httpMethod = "POST"
req.setValue("application/json", forHTTPHeaderField: "Content-Type")
req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
req.httpBody = try JSONEncoder().encode(payload)

let (data, response) = try await URLSession.shared.data(for: req)
```

## Task 종류

| Task | 용도 |
|---|---|
| `dataTask` | 일반 응답 수신 (메모리) |
| `uploadTask` | 큰 데이터 POST (스트리밍) |
| `downloadTask` | 큰 파일을 디스크로 직접 |
| `webSocketTask` | WebSocket |
| `streamTask` | TCP 스트림 |

다운로드는 `downloadTask`가 메모리 압박이 적다. `dataTask`로 큰 파일 받으면 메모리 폭발.

## 캐시

`URLCache`가 자동 관리. `URLRequest.cachePolicy`로 동작 변경.

```swift
req.cachePolicy = .reloadIgnoringLocalCacheData
```

서버가 `Cache-Control` 헤더를 주면 그 정책 그대로 사용. 이미지 캐시는 보통 `URLCache` 또는 별도(SDWebImage, Kingfisher).

## 타임아웃

| | 의미 |
|---|---|
| `timeoutIntervalForRequest` | 요청 도중 *데이터가 안 올 때* 끊는 시간. 기본 60초 |
| `timeoutIntervalForResource` | 전체 다운로드 *완료까지* 허용 시간. 기본 7일 (백그라운드용 길게) |

리소스 타임아웃을 짧게 줘서 거대 파일 무한 대기를 막는 패턴.

## Delegate가 필요한 경우

대부분 async/await로 충분하지만 다음은 delegate 필요:

- HTTPS pinning (인증서 검증 커스텀)
- 진행률(progress) 추적
- 백그라운드 세션 완료 알림

```swift
final class API: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        // 서버 인증서 검증 로직
    }
}
```

## 백그라운드 다운로드

```swift
let config = URLSessionConfiguration.background(withIdentifier: "io.app.dl")
config.isDiscretionary = true        // 시스템 적절 시점에 실행
config.sessionSendsLaunchEvents = true
let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
let task = session.downloadTask(with: url)
task.resume()
```

앱이 종료된 뒤에도 시스템이 계속 진행. 완료되면 시스템이 앱을 깨워 `application(_:handleEventsForBackgroundURLSession:completionHandler:)` 호출.

## 비교 — async/await vs Combine vs Closure

| 방식 | 장점 | 단점 |
|---|---|---|
| async/await | 직선 흐름, 에러 자연스럼 | iOS 13+ |
| Combine | 스트림 합성 | 학습 곡선, Apple은 점차 후순위 |
| Closure | 가장 호환 | 콜백 지옥, 취소 불편 |

신규 코드는 async/await 기본.

## 흔한 함정 / Follow-up

- **Q. `URLSession.shared`를 그대로 써도 되나?**
  단순 fetch면 OK. 하지만 *공통 헤더*, *인증 토큰*, *재시도*, *로깅*이 필요하면 별도 session/래퍼가 필요.

- **Q. HTTP 401(인증 만료) 처리?**
  refresh token으로 새 access token 발급 → 원래 요청 재시도. 동시에 여러 요청이 401이면 *한 번만 refresh*하도록 직렬화 필요.

- **Q. HTTPS pinning은 어떻게?**
  delegate에서 `URLAuthenticationChallenge`의 `serverTrust`를 검증. 인증서 또는 public key 비교. App Store 정책상 도메인별 ATS 설정도 함께 고려.

- **Q. 멀티파트 업로드?**
  boundary 문자열로 구분된 본문을 직접 만들거나 라이브러리(`Alamofire`) 사용. `Content-Type: multipart/form-data; boundary=...`.

- **Q. 응답 본문이 JSON이 아닌 경우?**
  status code 검사 후 raw `Data`로 처리. `Decodable` 타입을 분기 (`Result<Success, ServerError>` 패턴).

- **Q. 취소는?**
  async API는 `Task.cancel()`이 자동 전파. URLSessionTask는 `task.cancel()`. 진행 중 부분 데이터는 버림.

## 참고

- Apple Docs: URLSession
- WWDC 2017: Advances in Networking
- WWDC 2021: Use async/await with URLSession
