# 07. Networking

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
