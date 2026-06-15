# Concurrency Pitfalls (시니어 함정 모음)

> 한 줄 요약 — Swift Concurrency가 *컴파일 타임에 많이 막아주지만*, **actor reentrancy**, **priority inversion**, **hop 비용 누적**, **blocking 호출**, **continuation 누수**는 여전히 사람이 직접 다뤄야 한다. 면접에서 *어떤 함정이 있는가*는 시니어 변별 질문.

## 1) Actor Reentrancy

actor는 *순차 실행*하지만, **`await` 지점에서 다른 메서드가 끼어들 수 있음**.

```swift
actor Cache {
    var data: [String: Data] = [:]
    var inFlight: Set<String> = []

    func fetch(_ key: String) async throws -> Data {
        if let cached = data[key] { return cached }
        if inFlight.contains(key) {
            // 다른 호출이 이미 fetch 중
            return try await wait(key)            // ❌ 잘못된 대기 구현 시 무한
        }
        inFlight.insert(key)
        let fetched = try await network.fetch(key)   // ← 여기서 reenter 가능
        data[key] = fetched
        inFlight.remove(key)
        return fetched
    }
}
```

문제: `await network.fetch(...)` 중에 같은 key로 fetch가 또 호출되면 inFlight 검사 시점엔 *이미 inFlight*. 그 호출은 *완료 신호*를 기다려야 함.

해결 패턴:
- `Task` continuation을 *공유*하는 dictionary
- `AsyncSemaphore` 또는 1-shot async stream으로 신호

```swift
private var pending: [String: Task<Data, Error>] = [:]

func fetch(_ key: String) async throws -> Data {
    if let cached = data[key] { return cached }
    if let task = pending[key] { return try await task.value }
    let task = Task { try await network.fetch(key) }
    pending[key] = task
    defer { pending[key] = nil }
    let result = try await task.value
    data[key] = result
    return result
}
```

## 2) Priority Inversion

낮은 우선순위 task가 actor를 잡고 있으면, 높은 우선순위 task가 *그 actor 호출에서 대기*. → 효과적으로 낮은 우선순위로 강등.

런타임 완화:
- **Priority escalation**: 대기 중인 task의 우선순위가 *현재 점유자에게 임시 전파*
- *완전 해결 X* — 긴 작업은 분할 권장

UI 응답이 떨어지면 main actor 안의 *긴 작업*을 detached로 분리:

```swift
// ❌ main actor 점유
@MainActor func loadImage(_ data: Data) async -> UIImage {
    return await decode(data)   // decode가 무거우면 main hitch
}

// ✅ heavy work를 main 밖으로
@MainActor func loadImage(_ data: Data) async -> UIImage {
    let image = await Task.detached { decode(data) }.value
    return image
}
```

## 3) Hop 비용 누적

작은 actor 메서드를 *반복 호출*하면 hop이 모여 비용.

```swift
for item in items {
    await cache.set(item.id, item)   // 매 iteration마다 hop
}
```

→ 한 번에 묶기:

```swift
await cache.setMany(items)
```

actor 안에서 *batch API*를 노출해 호출 횟수 자체를 줄인다.

## 4) Blocking 호출 (대죄)

actor/MainActor 안에서 *동기 blocking*:

```swift
@MainActor func work() {
    Thread.sleep(forTimeInterval: 2)   // ❌ main thread blocked
    let data = synchronousNetwork()    // ❌ 동기 네트워크
    semaphore.wait()                   // ❌ 다른 task 차단
}
```

협력적 모델이 *실패*. UI hitch + ANR + deadlock 가능.

해결:
- async API로 대체 (`Task.sleep`, `URLSession.data` 등)
- 정말 sync 코드라면 `Task.detached`로 분리

## 5) Continuation 누수/이중 호출

`withCheckedContinuation`/`withUnsafeContinuation`은 **정확히 한 번** resume 필요:

```swift
func legacyCallback() async -> Result {
    await withCheckedContinuation { cont in
        api.fetch { result in
            cont.resume(returning: result)
        }
        // 콜백이 *영원히 안 오면* → leak, await 영원히 대기
    }
}
```

함정:
- 콜백이 *0번* 호출 → 영원히 대기 (메모리 누수 + UI 멈춤)
- 콜백이 *2번* 호출 → checked 버전은 *fatalError*, unsafe는 UB

해결:
- `withCheckedThrowingContinuation` + 타임아웃 wrapper
- 콜백이 *정확히 1회 보장 안 되면* `AsyncStream`이 더 안전

```swift
return await withTaskCancellationHandler {
    await withCheckedContinuation { cont in /* ... */ }
} onCancel: {
    api.cancel()
}
```

## 6) Task 취소 무시

```swift
Task {
    let data = try await fetchHuge()   // cancel 안 됨?
    await process(data)                  // cancel 후에도 계속 처리?
}
```

- stdlib API는 자동 취소 인지(`URLSession`, `Task.sleep`)
- 직접 작성한 긴 루프는 *명시적 검사* 필요:

```swift
for item in giantList {
    try Task.checkCancellation()
    process(item)
}
```

자식 task는 부모 취소 시 *자동 cancel*. unstructured Task는 직접 관리.

## 7) `nonisolated` 남용

```swift
actor Box {
    var values: [Int] = []
    nonisolated func count() -> Int { values.count }   // ❌ race
}
```

`nonisolated`는 *isolation 없이 호출 가능*하다는 선언 → actor의 stored state 접근 불가. 컴파일러가 잡지만 *let 컴퓨티드*나 *unsafe pointer 우회*로 race 만들 수 있음.

`nonisolated let` (불변 + Sendable)만 안전.

## 8) `@MainActor` 클래스의 *모든* 메서드가 main

```swift
@MainActor
class ViewModel {
    func loadHeavy() async {
        await decode()                     // decode도 @MainActor일 가능성!
    }
}
```

class 전체 `@MainActor`면 *모든 메서드가 main isolation*. heavy work를 분리하려면:

```swift
func loadHeavy() async {
    let result = await Task.detached { /* nonisolated heavy work */ }.value
}
```

## 9) AsyncStream 누수

```swift
let stream = AsyncStream<Int> { cont in
    timer.handler = { cont.yield(timer.value) }
}

for await x in stream { ... }   // for-await 종료 안 하면 영원히 흐름
```

- `cont.onTermination = { ... }`으로 *consumer가 사라질 때* 정리
- buffering policy 명시 (`.bufferingNewest(_:)`)로 메모리 폭증 방지

## 흔한 함정 / Follow-up

- **Q. actor를 lock 대용으로 쓰면 안 되는가?**
  쓸 수는 있지만 *비동기 경계*가 생김. 1-shot critical section에 actor가 무거울 수 있음. small 동기 lock이면 `OSAllocatedUnfairLock`도 고려.

- **Q. `Task { @MainActor in ... }`의 의미?**
  새 Task를 main actor isolation으로 실행. UI 업데이트에 자주 사용.

- **Q. `MainActor.run { }`은 즉시 실행?**
  현재 main이면 즉시, 아니면 hop 후 실행. async block.

- **Q. structured concurrency에서 한 자식이 실패하면?**
  TaskGroup의 경우 *다른 자식들이 자동 cancel*. `async let`도 비슷.

- **Q. *고정 thread에 종속된* 라이브러리(SQLite, GLES) 안전?**
  Swift Concurrency 위에서 직접 호출하면 *스레드 바뀜* → 깨짐. dedicated executor 또는 GCD serial queue로 wrapping.

## 참고

- WWDC 2022: Eliminate data races using Swift Concurrency
- WWDC 2023: Beyond the basics of structured concurrency
- Apple: Discovering and Diagnosing Memory and Thread Issues
