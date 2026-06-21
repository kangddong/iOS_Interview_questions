# 14. Network

> 한 줄 요약 — 14는 **프로토콜 자체** (OSI/TCP/HTTP/TLS/DNS) 중심, 07-networking은 **iOS에서 어떻게 쓰는가** (URLSession/Codable/인증). 면접의 *왜*는 14에서, *어떻게*는 07에서 답한다.

iOS 면접에서 네트워크는 *URLSession 사용법*보다 **HTTP 메서드/상태 코드/캐시/TLS handshake** 같은 프로토콜 이해를 더 자주 묻는다.

## OSI 7계층 / TCP-IP 4계층

```
OSI                 TCP-IP        예시
─────────────────────────────────────────────
7. Application      Application   HTTP, DNS, WebSocket
6. Presentation        │          TLS (위치 논쟁 있음)
5. Session             │
─────────────────────────────────────────────
4. Transport        Transport     TCP, UDP, QUIC
─────────────────────────────────────────────
3. Network          Internet      IP, ICMP
─────────────────────────────────────────────
2. Data Link        Link          Ethernet, Wi-Fi
1. Physical            │          전기/광/RF
```

→ 면접 답변용: 데이터가 떠나는 순서로 *계층마다 헤더가 붙는다* (encapsulation).

## 핵심 개념 6선

### 1. TCP vs UDP vs QUIC
- **TCP**: 연결 지향, 신뢰성 (재전송, 순서, 흐름 제어). **3-way handshake** (SYN → SYN-ACK → ACK), **4-way close** (FIN → ACK → FIN → ACK).
- **UDP**: 비연결, 빠르고 무책임. DNS·비디오·게임.
- **QUIC** (HTTP/3 기반): UDP 위에 TCP-급 신뢰성 + TLS 1.3 내장. **0-RTT** 재연결, connection migration (Wi-Fi ↔ LTE 전환에 강함). 모바일 친화.

### 2. HTTP 메서드와 멱등성
| 메서드 | 멱등? | 캐시 | 용도 |
| --- | --- | --- | --- |
| GET | O | O | 조회 |
| POST | **X** | X | 생성 (서버가 ID 부여) |
| PUT | O | X | 전체 교체 (같은 요청 = 같은 결과) |
| PATCH | (X 보통) | X | 부분 수정 |
| DELETE | O | X | 삭제 |

→ 재시도 가능 여부 = 멱등성. POST 재시도 시 `Idempotency-Key` 헤더로 서버가 중복 감지.

### 3. HTTPS / TLS Handshake
- TLS 1.2: 2-RTT — ClientHello → ServerHello+Cert → KeyExchange → Finished.
- TLS 1.3: **1-RTT** (재방문 시 **0-RTT**). 안전성·속도 개선, 모든 cipher가 forward secrecy 보장.
- 인증서 검증: 체인(루트 CA → 중간 → 서버), 만료, 도메인 일치, revocation (OCSP/CRL).
- **Pinning**: 인증서 또는 public key를 앱에 박아 MITM 차단. public-key pinning이 회전에 강함.

### 4. HTTP/2 / HTTP/3
- **HTTP/2**: 단일 TCP 연결 위에 **multiplexing** (스트림 N개), 헤더 압축(HPACK), 서버 푸시. 단점: TCP **head-of-line blocking**.
- **HTTP/3**: QUIC 위에서. **스트림 독립** → 한 스트림 패킷 손실이 다른 스트림 막지 않음. 모바일 wifi/LTE 전환 강함.

### 5. DNS와 캐싱
- 이름 → IP. 레코드: **A** (IPv4), **AAAA** (IPv6), **CNAME** (별칭), **MX** (메일), **TXT** (검증).
- **TTL**: 캐시 유효시간. 도메인 옮긴 뒤 일부 사용자가 옛 IP로 가는 이유.
- iOS는 시스템 resolver + 자체 캐시.

### 6. REST 설계 vs WebSocket
- **REST**: 자원 중심 URL, HTTP 의미론 따름, 멱등성. 페이지네이션은 offset(간단) vs cursor(스케일).
- **WebSocket**: Upgrade handshake로 양방향 지속 채널. 채팅·실시간 알림.
- **APNs와 비교**: 앱이 *백그라운드/종료* 상태에서도 알림 받으려면 APNs (push). 앱이 *살아 있을 때만* 충분하면 WebSocket.

## 상태 코드 빈출 정리

```
2xx 성공      ─ 200 OK / 201 Created / 204 No Content
3xx 리다이렉트 ─ 301 영구 / 302 임시 / 304 Not Modified (ETag/If-None-Match)
4xx 클라      ─ 400 Bad Request / 401 Unauthorized (인증 X) / 403 Forbidden (권한 X) / 404 / 409 Conflict / 429 Too Many
5xx 서버      ─ 500 Internal / 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout
```

→ **401 vs 403**: 401은 *너 누군지 모름*(토큰 재발급) / 403은 *너 누군지 알지만 안 됨*(권한 없음).

## 항목

- [OSI / TCP-IP 계층](osi-and-tcp-ip.md) — 7층 vs 4층, 데이터가 떠나는 순서
- [TCP vs UDP](tcp-vs-udp.md) — 3-way handshake, 4-way close, QUIC
- [HTTP 기본](http-basics.md) — 메서드, 상태 코드, 헤더, 캐시, 멱등성
- [HTTPS / TLS / Pinning](https-and-tls.md) — handshake, 인증서 검증, ATS, public-key pinning
- [HTTP/2 / HTTP/3](http2-http3.md) — multiplexing, QUIC, connection migration
- [REST API 설계](rest-api-design.md) — 6 제약, URL 규칙, 페이지네이션, 멱등 처리
- [WebSocket](websocket.md) — Upgrade handshake, ping/pong, 재연결, APNs와 비교
- [DNS / 네트워크 캐싱](dns-and-caching.md) — 레코드, TTL, URLCache, CDN

## 시니어

- [TLS Handshake 심화 (1.2 vs 1.3, 0-RTT, OCSP, ATS)](tls-handshake-deep.md)

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
