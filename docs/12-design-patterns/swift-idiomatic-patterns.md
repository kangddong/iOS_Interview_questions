# Swift Idiomatic Patterns (Closure vs Delegate vs Combine vs AsyncStream)

> 한 줄 요약 — 같은 *알림/이벤트 전파* 문제도 Swift에서 4가지 도구가 경쟁한다: **Closure**, **Delegate**, **Combine**, **AsyncSequence/AsyncStream**. 선택은 *방향성(1:1 vs 1:N)*, *수명(short vs long)*, *백프레셔/취소 필요성*, *API 클라이언트 친화도*로 결정.

## 4가지 선택지 한눈에

| 도구 | 방향성 | 수명 | 취소 | 백프레셔 |
|---|---|---|---|---|
| Closure (callback / handler) | 1:1 | short, 일회성 많음 | 약함 | 없음 |
| Delegate (protocol) | 1:1 | long (objects 수명 동안) | 강함 (weak) | 없음 |
| Combine (Publisher) | 1:N broadcasting | long | Cancellable | request(_:) |
| AsyncSequence / Stream | 1:1 또는 1:N (broadcast 직접 구현) | iterator 동안 | Task cancellation | buffering policy |

## 1) Closure

```swift
func fetch(id: String, completion: @escaping (Result<User, Error>) -> Void) { ... }
fetch(id: "1") { res in /* one-shot */ }
```

**언제**:
- *한 번* 응답 + 끝
- 콜백 API, 가장 가볍고 직관적

**단점**:
- 다수 이벤트 표현 어려움 (callback hell)
- 캡처로 retain cycle 위험 ([01-swift-language/closures.md](../01-swift-language/closures.md))

## 2) Delegate

```swift
protocol CellDelegate: AnyObject {
    func cellDidTap(_ cell: Cell)
    func cellDidLongPress(_ cell: Cell)
}

class Cell {
    weak var delegate: CellDelegate?
}
```

**언제**:
- 여러 이벤트를 *한 묶음*으로 위임
- *1:1* 관계, host에 책임 위임 (Apple SDK 패턴)
- 메서드 수 ≥ 3개일 때 closure보다 깔끔

**단점**:
- protocol 정의/채택의 *보일러플레이트*
- 1:N 확장 어려움
- Swift Concurrency와 자연스럽지 않음 (async delegate는 가능하지만 까다로움)

## 3) Combine

```swift
let publisher = PassthroughSubject<Event, Never>()
let cancellable = publisher
    .receive(on: DispatchQueue.main)
    .sink { event in handle(event) }
```

**언제**:
- *N명 listener*에게 동일 이벤트 broadcast
- 변환/조합 파이프라인 (`map`, `combineLatest`, `debounce`)
- 시간 기반 (timer, throttle, debounce)

**단점**:
- iOS 13+
- 학습 곡선 (operator 100+)
- Swift Concurrency 대비 *fluent 인터페이스의 비용* (메모리, 디버깅)
- Apple 자체가 *Combine 후속 약속 없음* → 신규 코드는 AsyncSequence가 안전한 선택

## 4) AsyncSequence / AsyncStream

```swift
let stream = AsyncStream<Event> { cont in
    timer.handler = { cont.yield(timer.value) }
    cont.onTermination = { _ in timer.invalidate() }
}

for await event in stream { handle(event) }
```

**언제**:
- async/await 모델과 자연스러운 통합
- Swift Concurrency 기반 신규 코드
- *백프레셔/buffering* 명시 제어
- *cancel* 자연스러움 (Task.cancel)

**단점**:
- broadcast(N consumer)는 직접 multiplex 필요
- 일부 operators는 표준에 없어 swift-async-algorithms 라이브러리 사용

## 결정 트리

```
일회성 응답?
└─ Closure

여러 이벤트, 1:1, 위임 의미?
└─ Delegate

다수 listener에 broadcast / 강력한 stream operator?
└─ Combine (단, 신규 코드는 AsyncSequence + swift-async-algorithms 고려)

async/await 모델 + 정밀 cancel/buffer 제어?
└─ AsyncStream / AsyncSequence
```

## 패턴 변환

### Closure → async

```swift
func legacyFetch(_ cb: @escaping (Result<Data, Error>) -> Void) { ... }

// adapter
func fetch() async throws -> Data {
    try await withCheckedThrowingContinuation { cont in
        legacyFetch { result in cont.resume(with: result) }
    }
}
```

자세히는 [03-concurrency/continuation.md](../03-concurrency/continuation.md).

### Delegate → AsyncStream

```swift
class Sensor {
    private var continuation: AsyncStream<Reading>.Continuation?
    var readings: AsyncStream<Reading> {
        AsyncStream { [weak self] cont in
            self?.continuation = cont
            cont.onTermination = { [weak self] _ in self?.stop() }
            self?.start()
        }
    }
    func didReceive(_ r: Reading) { continuation?.yield(r) }
}

for await r in sensor.readings { handle(r) }
```

### Combine → AsyncSequence

`.values` 속성으로 Publisher를 AsyncSequence로 (`AnyPublisher.values`).

## Idiomatic Swift 선택 가이드

| 상황 | 추천 |
|---|---|
| 새 API 설계 (async 가능) | async/await + throws |
| Stream API | AsyncSequence |
| 다수 listener broadcast | Combine, 또는 직접 multicast AsyncStream |
| UI 이벤트 (탭, 스크롤) | Closure (SwiftUI) / Delegate (UIKit) |
| 시간 의존 (debounce, throttle) | Combine 또는 swift-async-algorithms |
| 외부 SDK 콜백 → 내부 async | withCheckedContinuation |

## 흔한 함정 / Follow-up

- **Q. Combine vs AsyncSequence — Apple은 어느 쪽?**
  공식 입장은 *공존*. 신규 framework(SwiftUI iOS 17+, Observation)는 AsyncSequence/Concurrency 친화. Combine은 *유지보수만* 받는다는 인상이 강함.

- **Q. closure에 `self` 캡처 빠뜨려서 무한 루프?**
  closure가 *저장*되면 self를 retain → [02-memory-management/retain-cycle.md](../02-memory-management/retain-cycle.md).

- **Q. delegate 다중 등록?**
  *명시적으로 1:1*이라 안 됨. 다중 listener면 Notification, Combine, AsyncStream multiplexer.

- **Q. Combine에서 `assign(to:)`이 cycle?**
  `assign(to: \.x, on: self)`은 self 강참조 → leak. SwiftUI에선 `assign(to: &$published)` 사용해 자동 cancel.

- **Q. AsyncStream의 buffering 누락?**
  기본은 unbounded → 메모리 폭증. `.bufferingNewest(_:)` 명시 권장.

- **Q. 외부 SDK가 *클로저를 여러 번* 호출?**
  `withCheckedContinuation`은 1회 보장만 안전. *반복 호출*은 AsyncStream으로 wrapping.

## 참고

- WWDC 2021: Meet async/await
- WWDC 2019: Introducing Combine
- swift-async-algorithms (GitHub)
- Apple: Asynchronous Sequences
