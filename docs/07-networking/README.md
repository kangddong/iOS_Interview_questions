# 07. Networking

> 한 줄 요약 — iOS 네트워킹의 중심은 **URLSession** (Foundation 제공). 면접에선 *URLSession 옵션 + Codable 매핑 + 인증 + 캐시 + 백그라운드 + 보안(TLS pinning)* 6축이 반복된다.

iOS에서 *어떻게* 통신하는가 (07) vs *프로토콜 자체*의 이해 (14-network)는 분리되어 있다. URL 입력 → 화면까지의 흐름은 둘 다 알아야.

## URLSession 구성 요소

```
URLSessionConfiguration  ─ 캐시 / 쿠키 / TLS / 타임아웃 / Background 설정
        ↓ 1개 설정으로
URLSession              ─ 1개의 세션 (쿠키·캐시 공유)
        ↓ N개 task 발행
URLSessionTask          ─ data / upload / download / websocket
```

→ `URLSession.shared`는 **편의용**이지만 캐시·쿠키가 *프로세스 전역*에 공유되고 background도 못 함. 토큰을 다루는 통신이면 별도 session 권장.

## 핵심 개념 6선

### 1. URLSession Configuration
- **default**: 디스크 캐시·쿠키·credential 영구.
- **ephemeral**: 모두 메모리만 — 시크릿 모드.
- **background**: 앱 종료 후에도 OS가 다운로드/업로드 지속. `URLSessionDelegate`로 결과 받아야.
- 함정: background는 *동시 작업 수 제한*, *밤에 wifi/충전 대기*, *재시작 시 delegate 재구성* 필요.

### 2. Codable
- `Encodable` + `Decodable` 자동 합성. 서버 키 ≠ Swift 키일 때 `CodingKeys` 또는 `keyDecodingStrategy = .convertFromSnakeCase`.
- **다형성** (Discriminated Union): `type` 필드로 분기. 직접 `init(from:)` 작성.
- **null vs 누락**: 서버 계약에 따라 `Optional` 디코딩이 다르게 동작. `decodeIfPresent` vs `decode`.

### 3. 인증과 토큰 갱신
- Bearer 토큰을 *모든 요청*의 `Authorization` 헤더에 주입.
- **동시 401 → refresh race condition**: 여러 요청이 동시에 401을 받으면 refresh가 여러 번 호출됨. 핵심 패턴은 **single-flight** (진행 중인 refresh를 await + 결과 공유).
- Refresh 실패 시: 모든 보류 요청을 *동일 에러로* 실패 처리, 로그아웃 트리거.

### 4. 캐시 전략
- HTTP 캐시는 `Cache-Control`, `ETag`, `Last-Modified` 헤더가 *서버와 클라이언트의 계약*.
- `URLCache`: URLSession이 자동 사용. policy: `.useProtocolCachePolicy` (서버 헤더 따름) / `.reloadIgnoringCache` 등.
- **SWR (stale-while-revalidate)**: 오래된 캐시 즉시 반환 + 백그라운드에서 갱신. 체감 속도 개선.
- 자세한 알고리즘 → [08-persistence/cache-strategy-and-invalidation.md](../08-persistence/cache-strategy-and-invalidation.md).

### 5. 재시도와 멱등성
- 일시적 실패는 **exponential backoff + jitter** 로 재시도 (1s → 2s → 4s + random).
- *POST는 기본 멱등이 아님* → `Idempotency-Key` 헤더로 서버가 중복 감지.
- **Circuit Breaker**: 연속 실패 시 한동안 호출 차단 → 백엔드 보호.

### 6. TLS Pinning
- 서버 인증서를 *번들에 포함*해 비교 → MITM 방지.
- **public-key pinning**이 인증서 회전에 강함 (인증서 갱신해도 key만 같으면 됨).
- ATS(App Transport Security): iOS 9+. HTTP 차단, TLS 1.2+ 강제. 예외는 `Info.plist`에 명시.

## URLSession API 흐름 (async/await)

```swift
let (data, response) = try await session.data(for: request)
guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
    throw NetworkError.bad(http: response)
}
let dto = try JSONDecoder().decode(MyDTO.self, from: data)
let model = mapper.map(dto)
```

→ 면접 답변 구조: *요청 만들기 → 세션·인증 부착 → 응답 분류 → 디코딩 → 도메인 매핑* 5단계로 설명.

## 항목

- [URLSession](urlsession.md) — Configuration/Session/Task, async/await API, 캐시, 백그라운드, delegate
- [Codable](codable.md) — JSONEncoder/Decoder, key strategy, 커스텀 디코딩, 다형성
- [인증과 토큰 갱신](auth-and-token-refresh.md) — Bearer, OAuth, refresh token 동시성

## 시니어

- [TLS Pinning / Trust Evaluation](network-stack-and-pinning.md) — server trust challenge, public key pinning, ATS
- [Background URLSession / Retry / Cache / Multipart](background-tasks-and-retry.md) — 백오프+jitter, idempotency, HTTP/2/3, 스트리밍
- [Request Interceptor / Middleware](request-interceptor.md) — URLProtocol, adapter/retrier, middleware pipeline, 로깅·메트릭 헤더
- [OAuth 2.0 & JWT](oauth-and-jwt.md) — Authorization Code + PKCE, JWT 구조, refresh rotation, 검증 vs 신뢰
- [Retry & Circuit Breaker](retry-and-circuit-breaker.md) — exponential backoff + jitter, 멱등성/Idempotency-Key, closed/open/half-open
- [API Client Design](api-client-design.md) — generic `Endpoint`/`Request`, 응답 디코딩 파이프라인, type-safe path, error mapping

## Codable / 직렬화

- [Codable](codable.md) — 기본 개요
- [Codable Deep](codable-deep.md) — Encodable/Decodable 분리, KeyedContainer / UnkeyedContainer / SingleValueContainer, `init(from:)` / `encode(to:)`, super class encoding
- [JSON Strategies](json-strategies.md) — `keyDecodingStrategy`, `dateDecodingStrategy`, `dataDecodingStrategy`, `nonConformingFloat`, `userInfo`, `outputFormatting`
- [DTO Pattern](dto-pattern.md) — DTO vs Domain Model, 매핑 레이어(Adapter), 서버 schema 변경 대응, BFF
- [Custom Codable / Polymorphism](custom-codable-polymorphism.md) — Discriminated Union, 동적 키, `AnyCodable`, null vs 누락 정책

## 자주 묻는 질문

- `URLSession.shared`를 그대로 쓰면 안 되는 경우 → [urlsession.md](urlsession.md)
- Codable 커스텀 디코딩 → [codable.md](codable.md)
- 토큰 갱신 동시성 처리 → [auth-and-token-refresh.md](auth-and-token-refresh.md)
- HTTPS pinning → [urlsession.md](urlsession.md)
- 백그라운드 다운로드 동작 → [urlsession.md](urlsession.md)
- 401 / 403 차이 → [auth-and-token-refresh.md](auth-and-token-refresh.md)
