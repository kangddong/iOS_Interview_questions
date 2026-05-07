# WebSocket

> 한 줄 요약 — HTTP로 시작해 **Upgrade로 전환**되는 양방향 영속 연결. 서버 → 클라 *능동 push*가 자연스럽고, 채팅/실시간 알림/주가/협업 편집에 적합.

## 왜 WebSocket인가

기존 HTTP는 *클라가 요청해야 응답*. 서버가 먼저 보낼 수 없다. 우회 방법:
- **Polling**: 매초 GET. 낭비 + 지연.
- **Long Polling**: 응답을 *서버가 들고 있다가* 데이터 생기면 응답. 한 번 응답 후 다시 연결.
- **Server-Sent Events**: 서버 → 클라 단방향 push (HTTP 위).
- **WebSocket**: 양방향 영속. 가장 일반적.

## Handshake

```
Client →
GET /ws HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

Server ←
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

이후 같은 TCP 연결 위에서 *프레임 단위*로 양방향 메시지.

## 메시지 종류

- **Text** (UTF-8)
- **Binary**
- **Ping / Pong** — 연결 살아있는지 확인.
- **Close** — 종료 신호.

## iOS 구현

### URLSessionWebSocketTask (iOS 13+)

```swift
let task = URLSession.shared.webSocketTask(with: URL(string: "wss://...")!)
task.resume()

// 송신
task.send(.string("hello")) { error in ... }

// 수신
func listen() {
    task.receive { result in
        switch result {
        case .success(let msg):
            switch msg {
            case .string(let s): print(s)
            case .data(let d): print(d)
            @unknown default: break
            }
            self.listen()        // 재귀로 계속 수신
        case .failure(let e): print(e)
        }
    }
}
listen()
```

핵심: `receive`는 한 번 호출하면 *한 메시지만* 받는다. 계속 듣고 싶으면 *재귀 호출*.

### Ping 보내기

```swift
task.sendPing { error in
    // pong 수신 후 콜백
}
```

idle 연결을 *살아있는 상태로 유지* + 끊김 감지. 보통 30초~1분 주기.

## 재연결 전략

```
연결 끊김 감지
   ↓
지수 백오프로 재연결 시도
   ↓ (최대 N회)
사용자에게 알림 / 폴링으로 폴백
```

- 즉시 재연결은 서버 폭주 위험 — *exponential backoff* + jitter.
- 재연결 시 *마지막 메시지 ID*를 보내 누락 메시지 동기화.

## 메시지 안정성

WebSocket 자체는 메시지 *순서*만 보장 (TCP 위). 서버가 *받았다*는 ACK는 애플리케이션이 직접 구현.

```json
{ "type": "msg", "id": "uuid-1", "text": "hi" }
{ "type": "ack", "id": "uuid-1" }
```

## 대안 — Server-Sent Events (SSE)

서버 → 클라 단방향. WebSocket보다 단순. 알림, 라이브 피드에 충분한 경우.

iOS는 표준 SSE 클라이언트가 없어 직접 구현 또는 라이브러리.

## 주의 / 함정

- **백그라운드**: iOS 앱이 백그라운드 가면 보통 *5초 안에* 연결 끊김. APNs 푸시로 대체.
- **프록시**: 일부 기업 프록시가 WebSocket 차단. fallback 필요.
- **메모리**: 무한히 받는 메시지를 *전부 누적*하면 메모리 폭증. window 또는 페이지네이션.
- **TLS**: `wss://` 사용. App Store 정책상 평문 `ws://` 거의 불가.

## 비교 — 실시간 통신 옵션

| | WebSocket | SSE | Long Polling | APNs Push |
|---|---|---|---|---|
| 방향 | 양방향 | 서버→클라 | 양방향 (느림) | 서버→클라 (foreground/background) |
| 백그라운드 | 끊김 | 끊김 | 끊김 | 동작 |
| 서버 부하 | 영속 연결 | 영속 연결 | 짧은 연결 다수 | Apple 인프라 |
| 사용처 | 채팅, 게임 | 알림, 피드 | 옛 호환 | 백그라운드 알림 |

## 흔한 함정 / Follow-up

- **Q. WebSocket이 끊겼는지 어떻게 감지?**
  주기적 ping. timeout 안에 pong 없으면 끊김 처리. URLSession은 *명시적 재연결 로직* 직접.

- **Q. 같은 메시지가 두 번 도착할 수 있나?**
  WebSocket 자체는 안 보장. 서버가 *재연결 시* 누락 분 다시 보낼 수 있음 → 클라가 *메시지 ID*로 dedup.

- **Q. 채팅 앱을 WebSocket vs APNs?**
  포그라운드 = WebSocket, 백그라운드 = APNs. 둘 다 사용. 메시지 도착 시 *서버가 둘 모두 송신*, 클라는 dedup.

- **Q. URLSession `receive`가 한 메시지만 받는 이유는?**
  API 디자인. 매번 callback 호출 → 흐름 제어. AsyncStream으로 감싸면 for-await 형태로.

- **Q. WebSocket 메시지가 큰 경우?**
  프레임 분할 (fragmentation). 라이브러리/서버가 자동. 진짜 큰 데이터(파일 업로드)는 HTTP 별도.

- **Q. iOS 백그라운드에서 WebSocket 유지?**
  거의 불가능. VoIP background mode 등 특수 권한이 있어야. 일반 앱은 APNs로 대체.

## 참고

- RFC 6455 (WebSocket)
- Apple Docs: URLSessionWebSocketTask
- WWDC 2019: Advances in Networking
