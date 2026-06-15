# 07. Networking

## 항목

- [URLSession](urlsession.md) — Configuration/Session/Task, async/await API, 캐시, 백그라운드, delegate
- [Codable](codable.md) — JSONEncoder/Decoder, key strategy, 커스텀 디코딩, 다형성
- [인증과 토큰 갱신](auth-and-token-refresh.md) — Bearer, OAuth, refresh token 동시성

## 시니어

- [TLS Pinning / Trust Evaluation](network-stack-and-pinning.md) — server trust challenge, public key pinning, ATS
- [Background URLSession / Retry / Cache / Multipart](background-tasks-and-retry.md) — 백오프+jitter, idempotency, HTTP/2/3, 스트리밍

## 자주 묻는 질문

- `URLSession.shared`를 그대로 쓰면 안 되는 경우 → [urlsession.md](urlsession.md)
- Codable 커스텀 디코딩 → [codable.md](codable.md)
- 토큰 갱신 동시성 처리 → [auth-and-token-refresh.md](auth-and-token-refresh.md)
- HTTPS pinning → [urlsession.md](urlsession.md)
- 백그라운드 다운로드 동작 → [urlsession.md](urlsession.md)
- 401 / 403 차이 → [auth-and-token-refresh.md](auth-and-token-refresh.md)
