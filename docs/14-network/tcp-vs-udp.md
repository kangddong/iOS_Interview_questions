# TCP vs UDP

> 한 줄 요약 — TCP는 **연결 + 신뢰성 + 순서**를 보장하는 무거운 프로토콜, UDP는 **연결 없이 보내는 가벼운 프로토콜**. 모바일 앱은 거의 TCP 위 HTTP/HTTPS, 음성/영상/실시간만 UDP.

## 비교

| 구분 | TCP | UDP |
|---|---|---|
| 연결 | 3-way handshake | 없음 |
| 신뢰성 | 보장 (재전송, ACK) | 안 함 |
| 순서 | 보장 | 안 함 |
| 흐름 제어 | O | X |
| 혼잡 제어 | O | X |
| 헤더 | 20+ byte | 8 byte |
| 속도 | 느림 (오버헤드) | 빠름 |
| 사용 | HTTP, SSH, 메일 | DNS, VoIP, 게임, 영상 스트리밍, QUIC |

## TCP 3-way Handshake (연결 수립)

```
Client                    Server
  │  ── SYN ──────────────→  │
  │  ←──── SYN+ACK ───────  │
  │  ── ACK ──────────────→  │
       (연결 완료, 데이터 송수신)
```

- SYN: "연결하자, 내 시퀀스 번호는 X"
- SYN+ACK: "OK, 내 번호는 Y, 너 X+1 받았어"
- ACK: "알았어, Y+1"

핵심: 양쪽이 *서로의 시퀀스 번호*를 합의 → 이후 패킷 순서/누락 검증 가능.

## TCP 4-way Close

```
Client                    Server
  │  ── FIN ──────────────→  │
  │  ←──── ACK ───────────  │
  │  ←──── FIN ───────────  │
  │  ── ACK ──────────────→  │
                         (TIME_WAIT)
```

양방향 종료. *TIME_WAIT* 상태로 일정 시간(2*MSL) 대기 — 늦게 도착하는 패킷 처리.

면접 포인트: 닫는 쪽 (Active Close)이 TIME_WAIT으로 잠시 자원 점유. 서버에 동시 연결이 폭주하면 TIME_WAIT 누적 문제.

## TCP 신뢰성 메커니즘

- **Sequence Number**: 모든 byte에 번호. 누락 검출.
- **ACK**: 받은 패킷 확인.
- **Retransmission**: ACK 안 오면 재전송 (timeout 기반).
- **Sliding Window**: 한 번에 보낼 수 있는 양 (수신 버퍼 크기).
- **Congestion Control**: 네트워크 혼잡 시 송신 속도 조절 (Slow Start, Cubic, BBR 등).

## UDP의 단순함

```
[UDP header (8B) | data]
```

- src port / dst port / length / checksum.
- 그게 전부. 받는 쪽이 잃었는지 모름.
- 손실/순서가 *덜 중요*하거나 *애플리케이션이 직접 처리*하는 경우 사용.

## 흔한 사용

| | TCP | UDP |
|---|---|---|
| HTTP/1, 2 | O | - |
| HTTP/3 (QUIC) | - | O (QUIC는 UDP 기반) |
| SSH | O | - |
| DNS 일반 | - | O (큰 응답은 TCP fallback) |
| VoIP, 영상 | - | O |
| 게임 | 일부 | O (low latency) |

## QUIC = UDP 위의 신뢰성 프로토콜

HTTP/3가 *UDP 위 QUIC*인 이유:
- TCP head-of-line blocking 회피.
- TLS 통합으로 handshake 횟수 감소.
- 이동 중 IP 바뀌어도 connection 유지 (모바일 친화적).

## 모바일 컨텍스트

- 셀룰러 → Wi-Fi 전환 시 TCP는 끊겼다 다시. QUIC/HTTP/3는 connection migration.
- 약한 네트워크에서 TCP는 *재전송 + congestion control*로 더 느려짐 — QUIC가 빠름.
- iOS는 `URLSession`이 자동으로 HTTP/2 → HTTP/3 협상 (서버 지원 시).

## 비교 — 신뢰성이 보장되지 않는 게 *왜* 좋은가

영상 스트리밍 / 음성 통화에서 *지연이 더 치명적*. 손실된 frame을 기다리느니 *그냥 다음 frame*. 그래서 UDP가 적합.

## 흔한 함정 / Follow-up

- **Q. 3-way handshake가 왜 *3*인가?**
  양쪽이 서로의 시퀀스 번호와 *상대가 받았다는 사실*을 모두 확인해야. 양쪽 ACK 필요. 4번째는 데이터로 piggyback 가능.

- **Q. TCP가 보장한다고 해서 *모든 데이터가 항상 도착*?**
  네트워크가 완전히 끊기면 일정 횟수 재전송 후 *connection 종료*. 그때 앱은 에러 받음. *언제까지*가 OS/설정에 따라 다름.

- **Q. UDP가 빠르지만 손실이 있는데 어떻게 사용?**
  앱 단에서 *재전송이 필요한 데이터만* 다시 요청. 또는 손실을 무시해도 되는 도메인 (음성/영상).

- **Q. TIME_WAIT가 왜 그렇게 길어 보이나?**
  지연된 옛 패킷이 새 연결에 섞이는 걸 막기 위함. 서버 SO_REUSEADDR로 완화.

- **Q. iOS에서 직접 TCP 소켓?**
  `Network.framework`의 `NWConnection`. 일반 HTTP는 URLSession이 표준.

## 참고

- TCP/IP Illustrated
- RFC 793 (TCP), RFC 768 (UDP)
- HTTP/3 spec (RFC 9114)
