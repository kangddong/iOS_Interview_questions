# 14. Network

iOS 면접에서 네트워크는 *URLSession 사용법*보다 **HTTP 메서드/상태 코드/캐시/TLS handshake** 같은 프로토콜 이해를 더 자주 묻는다.

## 항목

- [OSI / TCP-IP 계층](osi-and-tcp-ip.md) — 7층 vs 4층, 데이터가 떠나는 순서
- [TCP vs UDP](tcp-vs-udp.md) — 3-way handshake, 4-way close, QUIC
- [HTTP 기본](http-basics.md) — 메서드, 상태 코드, 헤더, 캐시, 멱등성
- [HTTPS / TLS / Pinning](https-and-tls.md) — handshake, 인증서 검증, ATS, public-key pinning
- [HTTP/2 / HTTP/3](http2-http3.md) — multiplexing, QUIC, connection migration
- [REST API 설계](rest-api-design.md) — 6 제약, URL 규칙, 페이지네이션, 멱등 처리
- [WebSocket](websocket.md) — Upgrade handshake, ping/pong, 재연결, APNs와 비교
- [DNS / 네트워크 캐싱](dns-and-caching.md) — 레코드, TTL, URLCache, CDN

## 관련 (다른 디렉토리)

- URLSession 사용법 → [07-networking/urlsession.md](../07-networking/urlsession.md)
- Codable → [07-networking/codable.md](../07-networking/codable.md)
- 토큰 갱신 동시성 → [07-networking/auth-and-token-refresh.md](../07-networking/auth-and-token-refresh.md)

## 자주 묻는 질문

- TCP와 UDP 차이 → [tcp-vs-udp.md](tcp-vs-udp.md)
- 3-way handshake / 4-way close → [tcp-vs-udp.md](tcp-vs-udp.md)
- TLS handshake 단계 → [https-and-tls.md](https-and-tls.md)
- HTTPS pinning을 왜 하나 → [https-and-tls.md](https-and-tls.md)
- POST와 PUT 차이 / 멱등성 → [http-basics.md](http-basics.md)
- 401 vs 403 → [http-basics.md](http-basics.md) + [07-networking/auth-and-token-refresh.md](../07-networking/auth-and-token-refresh.md)
- HTTP/3가 모바일에 좋은 이유 → [http2-http3.md](http2-http3.md)
- 채팅 앱 — WebSocket vs APNs → [websocket.md](websocket.md)
- 검색 페이지네이션은 offset vs cursor → [rest-api-design.md](rest-api-design.md)
- DNS 도메인 옮겼는데 일부만 옛 IP → [dns-and-caching.md](dns-and-caching.md)
- URL 입력 → 화면 표시까지 흐름 → [osi-and-tcp-ip.md](osi-and-tcp-ip.md)
