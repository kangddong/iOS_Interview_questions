# Swift Concurrency Runtime (Cooperative Pool / Executor / Hop)

> 한 줄 요약 — Swift Concurrency는 *코어 수만큼*의 worker thread를 가진 **cooperative thread pool**을 쓴다. await 지점은 *threadhop* 후보고, actor는 자기 executor로의 *hop*을 강제한다. GCD처럼 thread를 *늘려* 해결하지 않고, *덜 만들고 양보(yield)*하는 모델이 핵심.

## 핵심 모델

```
+-----------+ +-----------+ +-----------+    <- Cooperative pool
| Worker 1  | | Worker 2  | | Worker N  |       (코어 수만큼 고정)
+-----------+ +-----------+ +-----------+
       ▲             ▲             ▲
       └───────── Tasks (job) ─────┘
                     │
                Executor (MainActor / actor / global)
```

- N개 worker thread (코어 수와 동일)
- *thread를 양보*하면서 여러 Task를 *non-preemptive*로 실행
- `await`에서 yield → worker가 다른 task 잡음
- thread 폭증 없음 (GCD의 *thread explosion* 문제 해결)

## Executor와 Isolation

| Executor | 누가 사용 |
|---|---|
| Global concurrent executor | 기본 task, async let, TaskGroup 등 |
| MainActor executor | `@MainActor` 표시 코드, UI 작업 |
| Custom actor executor | 일반 actor 인스턴스마다 1개 |
| Custom executor (Swift 5.9+) | `SerialExecutor` 직접 구현 |

actor 호출은 *자기 executor로 hop*한다. hop은 다음 단계:
1. 현재 task 일시 정지
2. 대상 executor의 큐에 enqueue
3. 대상 executor가 자유로워지면 resume

비용: GCD `async`보다 가벼움, 그러나 lock 미사용은 아님 (executor 내부 큐 보호).

## await의 의미

```swift
let user = await fetchUser()
// ↑ 여기서 hop 가능
```

- `await`는 *hop 후보*. 컴파일러가 *반드시 hop*하지는 않음 (이미 같은 executor면 인라이닝 가능)
- `await` 전후 *스레드가 바뀔 수 있다* → `Thread.current`나 thread-local 의존 코드는 *위험*

```swift
// ❌ thread local 의존
DispatchQueue.main.async { ... }   // GCD 패턴 안에선 안전
await loadData()
DispatchQueue.main.async { ... }   // await 후 main thread인지 보장 X
```

## Task vs Task.detached

```swift
Task { await foo() }              // 부모 task 컨텍스트 상속
Task.detached { await foo() }     // 컨텍스트 끊기, 우선순위·actor 격리·task-local 미상속
```

- 부모 Task의 *우선순위*, *@TaskLocal 변수*, *actor isolation context* 상속
- detached는 *완전히 새 task* — UI 호출이면 명시적 `@MainActor` 필요
- SwiftUI View의 `.task { ... }`는 view lifetime에 묶인 Task

## 우선순위 (`TaskPriority`)

```swift
Task(priority: .userInitiated) { ... }
```

| priority | 용도 |
|---|---|
| .high / .userInitiated | UI 직접 반응 |
| .medium / default | 일반 |
| .low / .utility | 백그라운드 |
| .background | 미세 우선순위 (오프스크린) |

**Priority Inversion** 방지: actor 호출 시 호출자보다 낮은 우선순위 작업이 *호출자 우선순위로 끌어올려짐*(escalation). GCD에선 비슷한 기제로 QoS 전파.

## Structured vs Unstructured Concurrency

| 구조 | 예 | 자동 취소 |
|---|---|---|
| Structured | `async let`, `TaskGroup` | 부모 종료 시 child 자동 cancel |
| Unstructured | `Task { }`, `Task.detached { }` | 직접 관리 필요 |

- 가능한 한 structured 우선. 자식 task의 lifetime이 컴파일러 추적됨
- unstructured는 `Task.handle.cancel()`로 명시 취소

## Cancellation 모델

*협력적 취소*. 컴파일러/runtime이 강제 종료 X:

```swift
for await item in stream {
    try Task.checkCancellation()   // 명시적 체크
    await process(item)
}
```

- `URLSession.data`, `Task.sleep` 등 stdlib API는 *자동 cancellation 인지*
- 직접 작성한 긴 루프는 명시 체크 필요
- `withTaskCancellationHandler { } onCancel: { }`로 즉시 정리 가능

## Custom Executor (Swift 5.9+)

```swift
final class MyExecutor: SerialExecutor {
    func enqueue(_ job: UnownedJob) { ... }
}

actor LegacyBackedActor {
    nonisolated unowned let unownedExecutor: UnownedSerialExecutor
}
```

- 기존 GCD 큐 위에 actor 격리를 얹을 수 있음
- 레거시 thread-pinned 라이브러리와의 인터롭

## GCD와의 공존

- GCD `DispatchQueue.main.async`로 main hop = Swift `await MainActor.run { }`과 *동등 의미*
- 단, GCD는 thread 폭증 가능, Swift Concurrency는 worker 고정
- 마이그레이션은 점진적: `withCheckedContinuation`으로 콜백 → async 변환

```swift
func legacyFetch() async throws -> Data {
    try await withCheckedThrowingContinuation { cont in
        legacyAPI { result in cont.resume(with: result) }
    }
}
```

자세히는 [continuation.md](continuation.md).

## 흔한 함정 / Follow-up

- **Q. cooperative pool 크기를 조절할 수 있나?**
  거의 불가. OS가 코어 수 기반으로 결정. *thread 더 만들기*는 모델의 의도와 반대.

- **Q. actor 안에서 blocking 호출은?**
  *최악의 패턴*. 그 executor를 점유해 다른 actor 메서드가 멈춤. C 라이브러리 sync 호출이라면 detached task에서 분리.

- **Q. `await` 전후 `Thread.current`가 같다고 가정하면 어떤 버그?**
  렌더링 컨텍스트, OpenGL/Metal API, thread-local 키체인 핸들 등 *스레드 affinity 의존* 코드가 깨짐. UIKit 호출도 main thread 보장 X → `@MainActor` 명시 필요.

- **Q. Priority inversion이 일어나면?**
  스케줄러가 *우선순위 escalation*으로 부분적 회피. 그래도 actor 큐 대기 시간이 길면 UI hitch 발생 — *long actor 메서드*는 분할.

- **Q. async/await가 GCD보다 느린 케이스?**
  아주 작은 비동기 단위가 매우 많을 때 hop 비용 누적. 대부분의 실제 워크로드에선 GCD와 동등 또는 빠름.

- **Q. `Sendable` 미충족 캡처는 컴파일 에러?**
  Swift 5에선 경고, Swift 6 strict mode에선 에러. 자세히는 [sendable.md](sendable.md), [swift6-strict.md](swift6-strict.md).

## 참고

- WWDC 2021: Meet async/await in Swift / Explore structured concurrency
- WWDC 2022: Visualize and optimize Swift concurrency
- WWDC 2023: Beyond the basics of structured concurrency
- swift-evolution: SE-0304 structured concurrency, SE-0306 actors, SE-0392 custom executors
