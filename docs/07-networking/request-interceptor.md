# Request Interceptor / Middleware

> 한 줄 요약 — 요청을 보내기 직전·응답을 받은 직후의 공통 처리(인증 헤더 첨부, 로깅, 메트릭, 재시도)를 **호출부에서 분리**하기 위해 존재한다.

도입 버전: `Foundation` (URLProtocol: iOS 2.0+), `URLSession` (iOS 7+), Swift 동시성 기반 패턴: `Swift 5.5+` / `iOS 15+`
관련: Alamofire `RequestInterceptor`, Moya `Plugin`, RFC 9110 (HTTP Semantics)

## 핵심 개념

- **Interceptor**: 모든 요청/응답이 통과하는 *체인의 한 노드*. `adapt(request) -> request` + `retry(request, error) -> decision` 두 책임을 갖는다.
- **URLProtocol**: Foundation 레벨에서 특정 스킴/호스트의 트래픽을 **가로채는** 저수준 훅. 테스트에서 네트워크 stub용으로 흔히 쓰임. 프로덕션에서는 권장하지 않음 (URLSession custom config 일부와 충돌).
- **Adapter (Request 변형)**: 요청 직전에 헤더 추가/URL 치환. 예: `Authorization: Bearer ...`, `X-Request-Id`, `Accept-Language`.
- **Retrier (응답 평가)**: 실패 응답을 보고 `.retry`, `.retryWithDelay`, `.doNotRetry` 결정. 토큰 만료(401) → refresh 후 단 1회 재시도.
- **Pipeline/Middleware**: Express/Server-side와 동일 개념. `(Request, Next) -> Response`를 합성. 순서가 의미를 가짐 — *로깅은 가장 바깥, 인증은 안쪽*.

## 동작 원리 — 요청 한 건의 흐름

```
[Call Site]
   │  Endpoint
   ▼
[Pipeline.send]
   │
   ├─► Middleware 1 (Logging)           ─ before: log request
   │   ├─► Middleware 2 (Metrics)       ─ before: start timer
   │   │   ├─► Middleware 3 (Auth)      ─ adapt: 헤더 첨부
   │   │   │   ├─► Middleware 4 (Retry) ─ try once
   │   │   │   │   └─► URLSession.data  ─ 실제 I/O
   │   │   │   └─◄ 401 → refresh → retry
   │   │   └─◄ status, latency 기록
   │   └─◄ stop timer
   └─◄ log response
   ▼
[Result]
```

핵심: **각 단계는 다음 단계의 인터페이스만 안다**. 인증 미들웨어는 로깅 존재를 모른다 → 조립/테스트가 독립적.

## 코드 예시

```swift
// 1. 인터페이스 — Next는 다음 미들웨어를 호출하는 클로저
protocol Middleware {
    func intercept(
        _ request: URLRequest,
        next: (URLRequest) async throws -> (Data, HTTPURLResponse)
    ) async throws -> (Data, HTTPURLResponse)
}

// 2. 파이프라인 — 배열을 역순으로 감아 합성
struct Pipeline {
    let middlewares: [Middleware]
    let session: URLSession

    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        // terminal: 실제 URLSession 호출
        var next: (URLRequest) async throws -> (Data, HTTPURLResponse) = { req in
            let (data, resp) = try await session.data(for: req)
            return (data, resp as! HTTPURLResponse)
        }
        // 뒤에서부터 감싸 외곽 → 내부 순서로 실행되게 만듦
        for mw in middlewares.reversed() {
            let captured = next
            next = { req in try await mw.intercept(req, next: captured) }
        }
        return try await next(request)
    }
}

// 3. 인증 미들웨어 — adapt + retry 결합
struct AuthMiddleware: Middleware {
    let tokenStore: TokenStore // actor

    func intercept(
        _ request: URLRequest,
        next: (URLRequest) async throws -> (Data, HTTPURLResponse)
    ) async throws -> (Data, HTTPURLResponse) {
        var signed = request
        if let token = await tokenStore.access() {
            signed.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let (data, resp) = try await next(signed)
        guard resp.statusCode == 401 else { return (data, resp) }

        // 단 1회 재시도 — 무한 루프 방지 위해 마커 헤더 사용
        if request.value(forHTTPHeaderField: "X-Retried") != nil {
            throw URLError(.userAuthenticationRequired)
        }
        try await tokenStore.refresh()
        var retried = signed
        retried.setValue("1", forHTTPHeaderField: "X-Retried")
        if let token = await tokenStore.access() {
            retried.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return try await next(retried)
    }
}

// 4. 로깅 — 가장 바깥. PII 마스킹 필수
struct LoggingMiddleware: Middleware {
    func intercept(_ request: URLRequest, next: (URLRequest) async throws -> (Data, HTTPURLResponse)) async throws -> (Data, HTTPURLResponse) {
        let id = UUID().uuidString.prefix(8)
        let start = ContinuousClock.now
        var req = request
        req.setValue(String(id), forHTTPHeaderField: "X-Request-Id")
        Logger.net.debug("→ [\(id)] \(req.httpMethod ?? "?") \(req.url?.path ?? "")")
        do {
            let (data, resp) = try await next(req)
            Logger.net.debug("← [\(id)] \(resp.statusCode) \(start.duration(to: .now))")
            return (data, resp)
        } catch {
            Logger.net.error("✗ [\(id)] \(error.localizedDescription)")
            throw error
        }
    }
}
```

## 비교

| 구분 | URLProtocol | URLSession Delegate | Middleware Pipeline |
|---|---|---|---|
| 동작 위치 | Foundation 전역 (등록 기반) | 세션 단위 콜백 | 앱 레이어 (Endpoint 호출 위) |
| 사용 시점 | 테스트 stub, 디버그 트래픽 가로채기 | TLS challenge, 리다이렉트 정책, 인증 챌린지 | 비즈니스 헤더, 토큰, 로깅, 재시도 |
| 비용 | 전역 영향, 디버깅 난이도↑ | 콜백 분기 비대 | 추상화 1단, 합성 비용 미미 |
| 테스트 | URLProtocolMock 패턴 | mock delegate 필요 | 미들웨어 단위 테스트 용이 |
| async/await 친화 | 낮음 (콜백 기반) | iOS 15+ 일부 async | 네이티브 async |

## 흔한 함정 / Follow-up

- **Q. 로깅 미들웨어를 안쪽에 두면?**
  Retry로 인한 *재시도 요청*은 로그에 안 찍힌다. 메트릭이 왜곡되니 *재시도까지 한 묶음*으로 보고 싶다면 로깅이 더 바깥. 반대로 *물리적 요청 한 건씩* 보고 싶다면 안쪽.
- **Q. URLProtocol을 프로덕션에 쓰면?**
  `URLSessionConfiguration.background`와 호환되지 않고, `protocolClasses`를 강제로 흔들면 다른 라이브러리(예: Firebase) trace가 깨진다. 테스트 전용으로 한정.
- **Q. 토큰 자동 첨부 인터셉터의 보안 공격면은?**
  ① 로그에 `Authorization` 헤더가 평문으로 찍힐 위험 → 마스킹 필수. ② 외부 호스트로 요청이 redirect되면 토큰이 *외부 도메인에 노출*됨 → `URLSessionTaskDelegate.willPerformHTTPRedirection`에서 호스트 화이트리스트 확인 후 헤더 제거. ③ 인터셉터가 `http://` 요청에 토큰을 붙이면 평문 송신 → 스킴 검증.
- **Q. 재시도 무한 루프 방지?**
  `X-Retried` 마커 헤더 또는 `URLRequest`에 attempt count를 wrapping. Alamofire는 `Request.retryCount` 자체로 관리.
- **Q. 미들웨어 순서를 강제할 방법?**
  타입 레벨 phantom type으로 *Outer → Inner* 순서 enforce 가능. 실무에서는 builder에 명시적 주석/팩토리로 처리.

## 참고

- Alamofire `RequestInterceptor` / `RequestAdapter` / `RequestRetrier`
- Moya `PluginType`
- URLProtocol stub 패턴: `OHHTTPStubs`, `Mocker`
- WWDC 2017 — Advances in Networking
