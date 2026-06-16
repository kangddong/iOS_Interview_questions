# HTTP/2 / HTTP/3

> 한 줄 요약 — HTTP/2는 **TCP 위 멀티플렉싱**, HTTP/3는 **UDP 위 QUIC + 통합 TLS**. 모두 모바일 환경에서의 *지연/연결 끊김*을 줄이는 방향. iOS `URLSession`은 자동 협상.

## HTTP/1.1의 한계

- 한 TCP 연결 = 한 요청 처리 (pipelining은 거의 안 씀).
- *Head-of-line blocking* — 한 응답 늦으면 그 뒤가 모두 막힘.
- 헤더가 매번 텍스트 평문 (큰 쿠키/토큰이 반복 전송).

## HTTP/2 핵심

### Multiplexing (Streams)

```
한 TCP 연결 안에서 여러 stream 병렬
Stream 1: GET /a
Stream 2: GET /b
Stream 3: GET /c
```

- 단일 연결로 동시 다발 요청.
- Stream 단위로 우선순위 부여 가능.
- 1.1 대비 RTT 절감.

### Header Compression (HPACK)

자주 보내는 헤더(`User-Agent`, `Authorization`)는 *인덱스 번호*로. 100바이트 → 1바이트 수준 가능.

### Server Push (deprecated 추세)

서버가 *요청 없이* 리소스를 미리 보냄 (예: HTML과 함께 CSS). 활용도 낮아 *사실상 폐기*.

### 한계 — TCP HoL

여러 stream이 같은 *TCP 연결* 위라, **TCP 패킷 손실 한 번**이 모든 stream을 막아버림.

## HTTP/3 — QUIC

UDP 위에서 *TCP 신뢰성 + TLS + multiplexing*을 다시 구현. Google이 만든 후 IETF 표준화.

### 장점

| 항목 | 효과 |
|---|---|
| **0-RTT / 1-RTT 연결** | TLS handshake가 QUIC에 통합 |
| **Stream 독립 재전송** | TCP HoL 해결 — 손실된 stream만 재전송 |
| **Connection Migration** | IP 바뀌어도 연결 유지 (Wi-Fi ↔ LTE) |
| **암호화 강제** | 평문 헤더 없음 |

### 모바일 친화적

iOS는 셀룰러 ↔ Wi-Fi 자주 전환. TCP는 매번 재연결, QUIC는 *Connection ID*로 유지. 체감 속도 차이 큼.

## iOS에서

```swift
let config = URLSessionConfiguration.default
config.assumesHTTP3Capable = true    // iOS 16+ — 서버의 HTTP/3 지원을 가정하고 첫 요청부터 QUIC racing 활성화
let session = URLSession(configuration: config)
```

기본은 자동 협상 (Alt-Svc 헤더로 HTTP/3 가용성 알림 → 다음 요청부터 사용).

## 비교

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| 전송 계층 | TCP | TCP | UDP (QUIC) |
| 다중 요청 | 연결 여러 개 | 단일 연결 multiplex | 단일 연결, stream 독립 |
| 헤더 압축 | X | HPACK | QPACK |
| TLS | 별도 layer | 별도 | 통합 |
| HoL | TCP + HTTP 양쪽 | TCP만 | 거의 없음 |
| 모바일 IP 전환 | 끊김 | 끊김 | Connection migration |
| 보급 | 폭넓음 | 보편 | 점차 확산 |

## 흔한 함정 / Follow-up

- **Q. HTTP/2에서도 한 번에 6개 연결을 쓰던 패턴은 여전히 유효?**
  과거 1.1 시절 도메인 샤딩(여러 서브도메인). HTTP/2에선 *역효과* — 단일 연결 multiplex가 더 빠름. 전략 폐기.

- **Q. HTTP/3가 무조건 빠른가?**
  네트워크 좋은 데스크톱에선 1.1/2와 큰 차이 없을 수도. *모바일/모바일망*에서 효과 큼.

- **Q. 서버는 어떻게 HTTP/3 알림?**
  HTTP/2 응답에 `Alt-Svc: h3=":443"` 헤더 → 클라가 다음부터 HTTP/3 시도.

- **Q. 0-RTT의 보안 우려?**
  Replay attack 가능 → *멱등하지 않은 요청*은 0-RTT 금지. POST/Idempotency-Key 조합으로 완화.

- **Q. URLSession이 어떤 버전 사용?**
  서버 협상 결과에 따라 자동. iOS 15+ HTTP/3 정식 지원, Safari/Apple 서비스 일부에서 적극 사용.

## 참고

- RFC 9113 (HTTP/2), RFC 9114 (HTTP/3), RFC 9000 (QUIC)
- WWDC 2021: Accelerate networking with HTTP/3 and QUIC
