# async / await — Swift Concurrency

> 한 줄 요약 — 비동기 코드를 **동기 코드처럼 위에서 아래로** 쓰게 해 주고, 컴파일러가 *구조적 동시성*과 *데이터 격리*를 강제한다.

도입 버전: Swift 5.5+ / iOS 13+ (백포팅 일부 제한), Swift 5.7부터 안정.

## 핵심 개념

- **`async` 함수**: 호출 도중 *중단(suspend)* 했다 재개될 수 있는 함수.
- **`await`**: suspend 가능 지점. 이 지점에서 스레드가 풀려나 다른 일을 할 수 있음.
- **`Task`**: 비동기 작업의 단위. 스레드가 아니라 *논리적 실행 컨텍스트*.
- **구조적 동시성**: 자식 Task의 수명이 부모 스코프에 묶임 → 누락된 await/누수 방지.

## 콜백 → async/await 비교

```swift
// 콜백 지옥
fetchUser { user in
    fetchPosts(user) { posts in
        fetchComments(posts[0]) { comments in
            ...
        }
    }
}

// async/await
let user = try await fetchUser()
let posts = try await fetchPosts(user)
let comments = try await fetchComments(posts[0])
```

## Task 생성

```swift
// 비구조적 — UI에서 async 함수로 진입할 때
Task {
    let value = try await load()
    label.text = value      // @MainActor면 자동 메인
}

// Task.detached — 부모 컨텍스트(actor, priority) 단절
Task.detached(priority: .background) { ... }
```

## 병렬 실행 — `async let`, `TaskGroup`

```swift
// 두 작업 동시 실행
async let a = fetchA()
async let b = fetchB()
let (x, y) = try await (a, b)
```

```swift
// 동적 개수 — TaskGroup
let results = try await withThrowingTaskGroup(of: Data.self) { group in
    for url in urls {
        group.addTask { try await fetch(url) }
    }
    var datas: [Data] = []
    for try await d in group { datas.append(d) }
    return datas
}
```

`async let`은 *컴파일 타임*에 개수가 정해진 경우, `TaskGroup`은 *런타임*에 개수가 정해질 때.

## 취소 (협력적)

```swift
let task = Task {
    for url in urls {
        try Task.checkCancellation()    // 취소 체크 포인트
        let data = try await fetch(url)
    }
}

task.cancel()
```

- `cancel()`은 *플래그만* 세움. 실제 멈춤은 코드가 `isCancelled`/`checkCancellation()`을 확인해야 함.
- `URLSession.data(from:)` 등 표준 API는 자동 취소 지원.

## 스레드 모델

- async 함수는 스레드를 *점유하지 않는다*. await에서 풀려난 뒤, 재개 시 *시스템 스레드 풀의 어느 스레드에서든* 이어질 수 있음.
- 따라서 **await 전후로 스레드가 바뀐다고 가정**해야 한다.
- UI 갱신은 `@MainActor`로 격리.

```swift
@MainActor
func update() async {
    let data = await fetch()    // 백그라운드에서 실행되어도
    label.text = data           // 여기는 다시 메인
}
```

## 비교 — GCD vs async/await

| 구분 | GCD | async/await |
|---|---|---|
| 흐름 | 콜백 중첩 | 직선적 |
| 에러 | 수동 (Result, 콜백 분기) | `throws` |
| 취소 | 어려움 | 협력적 취소 |
| 격리 | 개발자 책임 | actor / Sendable |
| 디버깅 | 스택 추적 끊김 | 연속된 스택 |
| 사용 시점 | 레거시 호환, 저수준 | 신규 코드 기본 |

## 콜백 API → async 변환

```swift
func legacy(completion: @escaping (Result<Data, Error>) -> Void) { ... }

// withCheckedThrowingContinuation
func modern() async throws -> Data {
    try await withCheckedThrowingContinuation { cont in
        legacy { result in cont.resume(with: result) }
    }
}
```

**주의**: `cont.resume`은 *정확히 한 번*만 호출. 두 번 호출하면 크래시, 한 번도 안 부르면 영원히 await 멈춤.

## 흔한 함정 / Follow-up

- **Q. `Task { await foo() }` vs `Task.detached { await foo() }`?**
  앞은 호출자 컨텍스트(actor, priority, task-local) 상속, 뒤는 단절. 대부분 비-detached가 정답. 메인 액터 안에서 detached 쓰면 메인 컨텍스트가 사라짐.

- **Q. `await`마다 스레드 전환이 일어나나?**
  반드시 그렇진 않다. 같은 스레드에서 재개될 수도, 다른 스레드에서 재개될 수도 있음. 스레드 동일성을 가정하면 안 됨.

- **Q. async 함수에서 `DispatchQueue.main.async`를 써도 되나?**
  되지만 안티패턴. `@MainActor`로 격리하거나 메인 액터 메서드를 await하라.

- **Q. async 함수가 *블로킹*하면?**
  스레드 풀 고갈 위험. 디스크/네트워크는 async API를 쓰고, CPU 바운드 동기 작업은 `Task.detached(priority: ...)`로 분리.

- **Q. `Task`가 비구조적이라는 의미?**
  `Task { ... }`는 부모 스코프와 무관하게 살아남음 (즉, 함수가 끝나도 Task는 계속 실행). 누수 가능 → 결과를 await하거나 cancel을 보관해야 함. 반면 `async let`/`TaskGroup`은 스코프 종료 시 자동 정리.

## 참고

- Swift Evolution: SE-0296 (async/await), SE-0304 (Structured Concurrency)
- WWDC 2021: Meet async/await in Swift / Explore structured concurrency
