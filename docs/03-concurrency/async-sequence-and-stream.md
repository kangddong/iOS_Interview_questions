# AsyncSequence / AsyncStream

> 한 줄 요약 — `AsyncSequence`는 **for-await-in으로 비동기 값들을 순차 소비**하는 추상. `AsyncStream`은 *콜백/델리게이트/notification* 같은 외부 이벤트를 AsyncSequence로 *발행*하는 도구.

도입 버전: Swift 5.5+

## 소비 — for-await-in

```swift
for try await line in url.lines {
    print(line)
    if Task.isCancelled { break }
}
```

- 일반 for-in과 동일한 흐름.
- Task가 cancel되면 `break` 또는 자동으로 종료 처리되도록 설계.
- `try`는 throw 가능한 sequence에서.

## AsyncSequence가 자연스러운 곳

- `URL.lines` — 큰 파일/네트워크 줄 단위
- `URLSession.bytes(from:)` — 바이트 스트림
- `NotificationCenter.notifications(named:)` — iOS 15+
- `FileHandle.bytes` — 바이트
- Combine `Publisher.values` — 변환

## AsyncStream 만들기

콜백 API → Stream으로 변환:

```swift
let stream = AsyncStream<Int> { continuation in
    legacy.observe { value in
        continuation.yield(value)
    }
    legacy.onEnd = { continuation.finish() }

    continuation.onTermination = { _ in legacy.stop() }
}

for await v in stream { print(v) }
```

- `yield(_:)`: 값을 발행.
- `finish()`: 스트림 종료.
- `onTermination`: 소비자가 break/cancel 시 호출 — 외부 자원 정리.

## AsyncThrowingStream

```swift
let stream = AsyncThrowingStream<Data, Error> { cont in
    socket.onData = { cont.yield($0) }
    socket.onError = { cont.finish(throwing: $0) }
    socket.onClose = { cont.finish() }
    cont.onTermination = { _ in socket.disconnect() }
}
```

## Buffering Policy

빠른 producer + 느린 consumer 시 메모리 폭증 방지:

```swift
AsyncStream<Int>(bufferingPolicy: .bufferingNewest(100)) { ... }
```

- `.unbounded` (기본): 무한히 쌓임
- `.bufferingNewest(n)`: 최근 n개만
- `.bufferingOldest(n)`: 처음 n개만 (이후는 drop)

## Combine 대비

| | AsyncSequence | Combine |
|---|---|---|
| 흐름 | 직선 (for-await) | operator chain |
| 합성 | 제한적 (Algorithms 패키지로 보강) | 풍부 (debounce, combineLatest 등) |
| 에러 | `throws` | `Error` 타입 파라미터 |
| 취소 | Task 연동 | AnyCancellable |
| 멀티 구독 | 직접 구현 | 기본 |
| Apple 추세 | 권장 | 점차 후순위 |

대규모 합성이 필요하면 Combine, 단순 비동기 스트림은 AsyncSequence.

## 멀티 구독 (fan-out)

`AsyncStream`은 1개 consumer 가정. 여러 곳에서 같은 값을 받아야 하면:
- 직접 multiplex (구독자 배열에 yield 전달)
- `AsyncBroadcaster` 같은 패턴 직접 구현
- swift-async-algorithms / AsyncChannel 등의 라이브러리

## 취소 전파

```swift
let task = Task {
    for await v in stream { ... }
}

task.cancel()    // for-await가 종료되고 onTermination 호출
```

소비자 Task가 cancel되면 자동으로 stream도 종료. 외부 자원 정리는 onTermination에서.

## 흔한 패턴 — Notification → AsyncStream

```swift
extension NotificationCenter {
    func stream(name: Notification.Name) -> AsyncStream<Notification> {
        AsyncStream { cont in
            let token = self.addObserver(forName: name, object: nil, queue: nil) { note in
                cont.yield(note)
            }
            cont.onTermination = { _ in self.removeObserver(token) }
        }
    }
}
```

iOS 15+엔 `NotificationCenter.notifications(named:)`가 표준 제공.

## 흔한 함정 / Follow-up

- **Q. AsyncStream의 buffer가 무한이라 메모리 폭주.**
  bufferingPolicy 명시. 또는 producer side에서 backpressure 처리.

- **Q. for-await가 영원히 안 끝남.**
  finish()를 호출하지 않은 stream. 종료 조건 명시.

- **Q. AsyncSequence를 Combine으로 변환?**
  `Publisher` 만들기 어렵지 않지만 보통 반대 방향(Combine→Async)을 더 자주. 큰 파이프라인은 Combine 그대로 유지가 편함.

- **Q. 취소되었을 때 외부 리소스 누수?**
  반드시 `onTermination`에서 cleanup (소켓 close, observer 제거 등).

- **Q. `swift-async-algorithms` 패키지?**
  debounce/throttle/merge/zip 같은 합성 연산자 제공. 표준화 진행 중.

- **Q. iOS 13에서 사용 가능?**
  Swift Concurrency는 iOS 13+ backdeploy 가능 (Xcode 13.2+). NotificationCenter.notifications는 iOS 15+.

## 참고

- SE-0298 (AsyncSequence)
- WWDC 2021: Meet AsyncSequence
- swift-async-algorithms
