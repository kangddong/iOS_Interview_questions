import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── actor-and-mainactor (add: 1) ──────────────────────────────────────────
  {
    id: "objective-c03-intermediate-actor-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "Actor의 reentrancy(재진입성)에 대한 설명으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "actor 메서드 안에서 await를 만나 suspend되면, 그 사이 동일한 actor에 다른 작업이 끼어들 수 있다.",
      },
      {
        id: "b",
        text: "actor는 재진입이 불가능하도록 설계되어 await 중에도 다른 호출이 대기한다.",
      },
      {
        id: "c",
        text: "nonisolated 메서드만 재진입이 가능하고, isolation된 메서드는 재진입이 불가능하다.",
      },
      {
        id: "d",
        text: "reentrancy는 Global Actor에서만 발생하며, 일반 actor에서는 발생하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "actor는 기본적으로 reentrant입니다. await 지점에서 suspend되면 동일한 actor의 다른 메서드가 실행될 수 있습니다. 이로 인해 데이터 일관성 문제가 생길 수 있으므로, await 이후에는 상태를 다시 검사해야 합니다.",
    relatedTopicSlugs: ["03-concurrency/actor-and-mainactor"],
  },

  // ── async-await (add: 2) ──────────────────────────────────────────────────
  {
    id: "objective-c03-basic-async-await-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`async let`과 `TaskGroup`의 차이에 대한 설명으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "`async let`은 컴파일 타임에 개수가 정해진 병렬 작업에, `TaskGroup`은 런타임에 개수가 정해지는 동적 병렬 작업에 적합하다.",
      },
      {
        id: "b",
        text: "`async let`은 런타임에 개수가 정해지는 동적 병렬 작업에, `TaskGroup`은 컴파일 타임에 개수가 정해진 병렬 작업에 적합하다.",
      },
      {
        id: "c",
        text: "`async let`과 `TaskGroup`은 완전히 동일하며, 어떤 상황에서도 대체 가능하다.",
      },
      {
        id: "d",
        text: "`async let`은 에러를 throw할 수 없으나, `TaskGroup`은 에러를 throw할 수 있다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`async let`은 컴파일 타임에 작업 수가 고정된 경우에 사용하고, `TaskGroup`(또는 `withThrowingTaskGroup`)은 배열의 원소마다 작업을 동적으로 추가하는 등 런타임에 개수가 결정되는 경우에 사용합니다.",
    relatedTopicSlugs: ["03-concurrency/async-await"],
  },
  {
    id: "objective-c03-intermediate-async-await-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`Task { await foo() }`와 `Task.detached { await foo() }`의 차이로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "Task는 부모 컨텍스트(actor, priority, task-local)를 상속하고, Task.detached는 부모 컨텍스트를 단절한다.",
      },
      {
        id: "b",
        text: "Task.detached는 부모 컨텍스트를 상속하고, Task는 부모 컨텍스트를 단절한다.",
      },
      {
        id: "c",
        text: "두 방법 모두 항상 메인 스레드에서 실행된다.",
      },
      {
        id: "d",
        text: "Task는 취소가 불가능하고, Task.detached는 취소가 가능하다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`Task { }`는 부모의 actor isolation, priority, task-local 값을 상속합니다. 반면 `Task.detached { }`는 완전히 새로운 컨텍스트로 시작하며, 메인 액터 안에서 detached를 사용하면 메인 컨텍스트가 사라집니다.",
    relatedTopicSlugs: ["03-concurrency/async-await"],
  },

  // ── async-sequence-and-stream (add: 5) ────────────────────────────────────
  {
    id: "objective-c03-basic-async-sequence-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`AsyncStream`에서 값을 발행하는 메서드와 스트림을 종료하는 메서드를 올바르게 짝지은 것은?",
    choices: [
      { id: "a", text: "`yield(_:)` / `finish()`" },
      { id: "b", text: "`send(_:)` / `complete()`" },
      { id: "c", text: "`emit(_:)` / `close()`" },
      { id: "d", text: "`publish(_:)` / `terminate()`" },
    ],
    correctChoiceId: "a",
    explanation:
      "`AsyncStream`의 continuation에서 값을 발행할 때는 `continuation.yield(_:)`를 사용하고, 스트림을 종료할 때는 `continuation.finish()`를 호출합니다.",
    relatedTopicSlugs: ["03-concurrency/async-sequence-and-stream"],
  },
  {
    id: "objective-c03-intermediate-async-sequence-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`AsyncStream`의 `bufferingPolicy`에서 빠른 producer와 느린 consumer 상황에서 최근 100개 값만 유지하려면 어떤 설정을 사용해야 하는가?",
    choices: [
      { id: "a", text: "`.bufferingNewest(100)`" },
      { id: "b", text: "`.bufferingOldest(100)`" },
      { id: "c", text: "`.unbounded`" },
      { id: "d", text: "`.bufferingOldest(1)`" },
    ],
    correctChoiceId: "a",
    explanation:
      "`.bufferingNewest(n)`은 버퍼가 가득 찼을 때 가장 오래된 값을 버리고 최신 n개를 유지합니다. `.bufferingOldest(n)`은 처음 n개를 유지하고 이후 값을 drop하며, `.unbounded`는 무한히 쌓아 메모리 폭증 위험이 있습니다.",
    relatedTopicSlugs: ["03-concurrency/async-sequence-and-stream"],
  },
  {
    id: "objective-c03-basic-async-sequence-003",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`AsyncStream`의 consumer Task가 cancel될 때 외부 리소스(예: observer, 소켓)를 정리하려면 어디에 cleanup 코드를 작성해야 하는가?",
    choices: [
      {
        id: "a",
        text: "`continuation.onTermination` 클로저 안에",
      },
      {
        id: "b",
        text: "`continuation.finish()` 호출 직전에",
      },
      {
        id: "c",
        text: "`continuation.yield(_:)` 호출 직후에",
      },
      {
        id: "d",
        text: "별도의 `deinit` 메서드에서 처리해야 한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`continuation.onTermination`은 소비자가 for-await 루프를 break하거나 Task가 cancel될 때 호출됩니다. observer 제거, 소켓 연결 해제 등 외부 리소스 정리는 여기에 작성해야 누수를 방지할 수 있습니다.",
    relatedTopicSlugs: ["03-concurrency/async-sequence-and-stream"],
  },
  {
    id: "objective-c03-intermediate-async-sequence-004",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`AsyncSequence`와 Combine의 차이에 대한 설명으로 틀린 것은?",
    choices: [
      {
        id: "a",
        text: "AsyncSequence는 기본적으로 멀티 구독(fan-out)을 지원한다.",
      },
      {
        id: "b",
        text: "AsyncSequence는 for-await-in으로 직선적으로 소비한다.",
      },
      {
        id: "c",
        text: "Combine은 debounce, combineLatest 등 풍부한 합성 연산자를 기본 제공한다.",
      },
      {
        id: "d",
        text: "AsyncSequence의 취소는 Task와 연동된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`AsyncStream`은 기본적으로 1개의 consumer를 가정합니다. 멀티 구독(fan-out)은 직접 multiplex 구현이나 `swift-async-algorithms` 같은 라이브러리를 통해 처리해야 합니다. 기본 지원은 Combine의 특징입니다.",
    relatedTopicSlugs: ["03-concurrency/async-sequence-and-stream"],
  },
  {
    id: "objective-c03-advanced-async-sequence-005",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "`AsyncThrowingStream`을 사용하는 적절한 시나리오는?",
    choices: [
      {
        id: "a",
        text: "소켓처럼 데이터 수신 중 에러가 발생할 수 있고, 에러 발생 시 스트림을 종료해야 하는 경우",
      },
      {
        id: "b",
        text: "에러가 절대 발생하지 않는 단순 타이머 이벤트 스트림을 만드는 경우",
      },
      {
        id: "c",
        text: "단일 값을 한 번만 반환하는 비동기 작업을 래핑하는 경우",
      },
      {
        id: "d",
        text: "Combine Publisher를 AsyncSequence로 변환하는 경우",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`AsyncThrowingStream`은 값을 여러 번 yield하다가 에러가 발생할 수 있는 시나리오에 적합합니다. `cont.finish(throwing: error)`로 에러를 전달하며 스트림을 종료할 수 있습니다. 에러가 없는 경우는 `AsyncStream`, 단일 값은 continuation, Combine→Async 변환은 `publisher.values`를 사용합니다.",
    relatedTopicSlugs: ["03-concurrency/async-sequence-and-stream"],
  },

  // ── concurrency-pitfalls (add: 4) ─────────────────────────────────────────
  {
    id: "objective-c03-advanced-concurrency-pitfalls-001",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "아래 코드에서 발생할 수 있는 문제는?\n\n```swift\nactor Cache {\n    var data: [String: Data] = [:]\n    func fetch(_ key: String) async -> Data {\n        if let d = data[key] { return d }\n        let d = await network.load(key)\n        data[key] = d\n        return d\n    }\n}\n```",
    choices: [
      {
        id: "a",
        text: "await 지점에서 다른 호출이 끼어들어 같은 key에 대해 중복 네트워크 요청이 발생할 수 있다.",
      },
      {
        id: "b",
        text: "actor는 완전히 직렬화되므로 await 중에도 다른 호출이 끼어들 수 없어서 문제 없다.",
      },
      {
        id: "c",
        text: "data 딕셔너리가 Sendable이 아니라 컴파일 에러가 발생한다.",
      },
      {
        id: "d",
        text: "network.load가 nonisolated가 아니면 호출할 수 없다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "actor의 reentrancy 문제입니다. `await network.load(key)` 지점에서 suspend되면 같은 key로 또 다른 fetch 호출이 진입할 수 있습니다. 첫 번째 호출이 아직 완료되지 않았으므로 캐시 히트가 없어 중복 네트워크 요청이 발생합니다. 해결책은 진행 중인 Task를 dictionary로 추적하는 것입니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-pitfalls"],
  },
  {
    id: "objective-c03-advanced-concurrency-pitfalls-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "Swift Concurrency에서 `semaphore.wait()`을 actor 또는 @MainActor 메서드 안에서 호출하면 안 되는 이유는?",
    choices: [
      {
        id: "a",
        text: "협력적 스레드 풀의 worker를 blocking하여 다른 Task가 실행되지 못하게 막고, 최악의 경우 deadlock이 발생할 수 있다.",
      },
      {
        id: "b",
        text: "semaphore는 GCD 전용 API이므로 Swift Concurrency와 혼용하면 컴파일 에러가 발생한다.",
      },
      {
        id: "c",
        text: "actor 안에서의 semaphore.wait()은 Swift 6에서 에러로 격상되어 빌드 실패한다.",
      },
      {
        id: "d",
        text: "semaphore.wait()은 우선순위 역전만 발생시킬 뿐 데드락은 발생하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift Concurrency의 cooperative thread pool은 코어 수만큼 고정된 worker thread를 사용합니다. `semaphore.wait()`은 그 worker를 blocking하여 다른 Task가 실행되지 못하게 합니다. 모든 worker가 blocking되면 신호를 보내줄 Task도 실행 못 하는 deadlock이 발생할 수 있습니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-pitfalls"],
  },
  {
    id: "objective-c03-intermediate-concurrency-pitfalls-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "아래 코드에서 발생할 수 있는 문제와 해결 방법을 올바르게 설명한 것은?\n\n```swift\nfor item in items {\n    await cache.set(item.id, item)\n}\n```",
    choices: [
      {
        id: "a",
        text: "매 iteration마다 actor hop이 발생해 비용이 누적된다. `cache.setMany(items)`처럼 배치 API를 만들어 호출 횟수를 줄여야 한다.",
      },
      {
        id: "b",
        text: "for 루프 안에서 await를 사용하면 컴파일 에러가 발생한다.",
      },
      {
        id: "c",
        text: "순차적으로 실행되므로 성능 문제가 없다.",
      },
      {
        id: "d",
        text: "TaskGroup을 사용해 병렬로 실행하면 actor hop 비용을 완전히 제거할 수 있다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "actor 메서드를 반복 호출하면 매번 actor hop(컨텍스트 전환) 비용이 발생합니다. 이를 해결하기 위해 actor 안에 배치 처리 API를 노출하여 단일 호출로 여러 작업을 처리하도록 설계해야 합니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-pitfalls"],
  },
  {
    id: "objective-c03-advanced-concurrency-pitfalls-004",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "구조적 동시성(structured concurrency)에서 TaskGroup의 자식 Task 중 하나가 에러를 throw하면 어떻게 되는가?",
    choices: [
      {
        id: "a",
        text: "나머지 자식 Task들이 자동으로 cancel된다.",
      },
      {
        id: "b",
        text: "에러가 발생한 자식 Task만 종료되고 나머지는 계속 실행된다.",
      },
      {
        id: "c",
        text: "전체 앱이 크래시된다.",
      },
      {
        id: "d",
        text: "에러는 무시되고 성공한 자식 Task의 결과만 반환된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "구조적 동시성에서 `withThrowingTaskGroup`의 자식 Task 중 하나가 에러를 throw하면, 그 TaskGroup이 에러를 전파하고 나머지 자식 Task들은 자동으로 cancel됩니다. `async let`도 마찬가지로 하나가 실패하면 나머지가 자동 정리됩니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-pitfalls"],
  },

  // ── concurrency-runtime (add: 4) ──────────────────────────────────────────
  {
    id: "objective-c03-intermediate-concurrency-runtime-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "Swift Concurrency의 cooperative thread pool에 대한 설명으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "worker thread 수는 CPU 코어 수에 맞게 고정되어 있으며, thread를 추가로 생성하지 않는다.",
      },
      {
        id: "b",
        text: "GCD처럼 작업이 많아질수록 thread를 동적으로 증가시킨다.",
      },
      {
        id: "c",
        text: "thread 수를 개발자가 직접 설정하여 성능을 최적화할 수 있다.",
      },
      {
        id: "d",
        text: "단일 스레드에서 모든 async 작업을 순차적으로 처리한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift Concurrency의 cooperative thread pool은 CPU 코어 수에 맞게 고정된 수의 worker thread를 사용합니다. GCD의 thread explosion 문제를 해결하기 위해 thread를 늘리는 대신, await 지점에서 thread를 양보(yield)하는 방식으로 동작합니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-runtime"],
  },
  {
    id: "objective-c03-advanced-concurrency-runtime-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "Custom Executor(SerialExecutor)를 사용하는 주요 시나리오는?",
    choices: [
      {
        id: "a",
        text: "thread-pinned 레거시 라이브러리(예: SQLite) 위에 actor 격리를 얹어 기존 GCD 큐와 인터롭하기 위해",
      },
      {
        id: "b",
        text: "cooperative thread pool의 worker 수를 늘리기 위해",
      },
      {
        id: "c",
        text: "async/await 없이 동기 코드를 실행하기 위해",
      },
      {
        id: "d",
        text: "MainActor의 동작을 오버라이드하여 백그라운드에서 UI를 업데이트하기 위해",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Custom Executor(Swift 5.9+, `SerialExecutor`)는 기존 GCD serial queue 위에 actor 격리를 얹거나, 특정 스레드에 종속된 레거시 라이브러리와 Swift Concurrency를 인터롭할 때 사용합니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-runtime"],
  },
  {
    id: "objective-c03-intermediate-concurrency-runtime-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "await 전후로 `Thread.current`에 의존하는 코드가 위험한 이유는?",
    choices: [
      {
        id: "a",
        text: "await 지점에서 suspend되었다가 재개될 때 다른 worker thread에서 실행될 수 있어, thread identity를 가정하는 코드가 깨진다.",
      },
      {
        id: "b",
        text: "await 이후에는 항상 메인 스레드에서 재개되므로, 백그라운드 작업에서 문제가 생긴다.",
      },
      {
        id: "c",
        text: "`Thread.current`는 deprecated API이므로 사용 자체가 금지되어 있다.",
      },
      {
        id: "d",
        text: "Swift Concurrency에서는 await 전후 thread가 항상 동일하게 유지된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "async 함수는 await 지점에서 현재 thread를 반납하고, 재개 시 cooperative pool의 *어느 worker thread에서든* 이어질 수 있습니다. 따라서 thread-local 변수, Metal/OpenGL context, 특정 thread에 묶인 핸들 등은 await 전후로 깨질 수 있습니다.",
    relatedTopicSlugs: ["03-concurrency/concurrency-runtime"],
  },
  {
    id: "objective-c03-basic-concurrency-runtime-004",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "Swift Concurrency에서 `.userInitiated` Task가 `.background` 우선순위 actor/Task의 완료를 await하고 있을 때 런타임이 수행하는 동작은?",
    choices: [
      {
        id: "a",
        text: "런타임이 점유 중(낮은 우선순위)인 작업의 우선순위를 호출자(높은 우선순위)에 맞춰 임시로 승격(priority escalation)시킨다.",
      },
      {
        id: "b",
        text: "대기 중인 userInitiated Task의 우선순위를 background로 떨어뜨려 맞춘다.",
      },
      {
        id: "c",
        text: "background Task가 자동으로 취소된다.",
      },
      {
        id: "d",
        text: "두 Task가 동시에 실행되어 데이터 레이스가 발생한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Priority inversion은 높은 우선순위 작업이 낮은 우선순위 작업의 완료를 기다릴 때 발생한다. Swift Concurrency 런타임은 *기다림의 대상이 된 낮은 우선순위 작업*을 호출자 우선순위에 맞춰 임시로 승격(escalation)시켜 역전을 완화한다. waiter(높은 쪽)를 끌어내리는 게 아니라 점유자(낮은 쪽)를 끌어올리는 방향이라는 점이 핵심.",
    relatedTopicSlugs: ["03-concurrency/concurrency-runtime"],
  },

  // ── continuation (add: 4) ─────────────────────────────────────────────────
  {
    id: "objective-c03-basic-continuation-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`withCheckedContinuation`에서 `continuation.resume`을 두 번 호출하면 어떻게 되는가?",
    choices: [
      {
        id: "a",
        text: "checked 버전은 즉시 fatalError로 크래시된다.",
      },
      {
        id: "b",
        text: "두 번째 resume은 무시된다.",
      },
      {
        id: "c",
        text: "await 중이던 작업이 두 번 깨어나서 결과가 중복으로 처리된다.",
      },
      {
        id: "d",
        text: "`withUnsafeContinuation`과 달리 컴파일 에러가 발생한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`withCheckedContinuation`은 resume 횟수를 런타임에 검사합니다. resume을 두 번 호출하면 즉시 `fatalError`로 앱이 크래시됩니다. `withUnsafeContinuation`은 이 검사를 생략하여 성능을 높이지만 두 번 호출 시 undefined behavior가 발생합니다.",
    relatedTopicSlugs: ["03-concurrency/continuation"],
  },
  {
    id: "objective-c03-intermediate-continuation-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "continuation에서 `resume`이 한 번도 호출되지 않으면 어떤 결과가 발생하는가?",
    choices: [
      {
        id: "a",
        text: "await 중인 작업이 영원히 중단되며 메모리 누수가 발생한다.",
      },
      {
        id: "b",
        text: "타임아웃 후 자동으로 nil을 반환한다.",
      },
      {
        id: "c",
        text: "컴파일러가 이를 감지하여 빌드 에러를 발생시킨다.",
      },
      {
        id: "d",
        text: "Task가 자동 취소되어 CancellationError를 throw한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "continuation의 resume이 호출되지 않으면 해당 await 지점이 영원히 멈추고, continuation 객체가 해제되지 않아 메모리 누수로 이어집니다. UI가 응답하지 않거나 Task가 영원히 진행되지 않는 버그가 됩니다.",
    relatedTopicSlugs: ["03-concurrency/continuation"],
  },
  {
    id: "objective-c03-intermediate-continuation-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`Task.cancel()`을 호출해도 continuation 기반으로 래핑된 레거시 API가 자동으로 취소되지 않는 이유와 올바른 해결 방법은?",
    choices: [
      {
        id: "a",
        text: "`Task.cancel()`은 취소 플래그만 세우고 continuation을 자동 resume하지 않는다. `withTaskCancellationHandler`를 사용해 onCancel에서 레거시 API의 cancel을 직접 호출해야 한다.",
      },
      {
        id: "b",
        text: "continuation을 사용하면 취소가 자동으로 전파되므로 별도 처리가 필요 없다.",
      },
      {
        id: "c",
        text: "`withCheckedThrowingContinuation` 대신 `withUnsafeContinuation`을 사용하면 취소가 자동으로 처리된다.",
      },
      {
        id: "d",
        text: "레거시 API의 취소는 불가능하므로 continuation 기반 래핑을 포기해야 한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`Task.cancel()`은 협력적 취소로, 취소 플래그를 세울 뿐 실행 중인 코드를 강제 종료하지 않습니다. Continuation은 자동으로 resume되지 않으므로, `withTaskCancellationHandler { } onCancel: { legacyAPI.cancel() }` 패턴으로 취소 시점에 레거시 API를 직접 취소하여 콜백이 resume을 호출하도록 해야 합니다.",
    relatedTopicSlugs: ["03-concurrency/continuation"],
  },
  {
    id: "objective-c03-advanced-continuation-004",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "여러 번 호출되는 콜백(progress + completion)을 continuation으로 래핑할 때 올바른 접근법은?",
    choices: [
      {
        id: "a",
        text: "boolean 플래그나 actor로 resume이 한 번만 실행되도록 보장하고, 반복 이벤트가 필요하면 AsyncStream을 사용한다.",
      },
      {
        id: "b",
        text: "콜백마다 별도의 continuation을 만들어 각각 resume한다.",
      },
      {
        id: "c",
        text: "`withUnsafeContinuation`을 사용하면 여러 번 resume해도 안전하다.",
      },
      {
        id: "d",
        text: "continuation은 단일 완료 이벤트에만 사용할 수 있으므로 이 패턴은 불가능하다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "continuation은 정확히 한 번 resume해야 합니다. 여러 번 호출되는 콜백에서는 `var resumed = false` 플래그나 actor를 통해 최초 한 번만 resume되도록 보장해야 합니다. progress 같은 반복 이벤트가 필요한 경우에는 continuation 대신 `AsyncStream`을 사용하는 것이 더 적합합니다.",
    relatedTopicSlugs: ["03-concurrency/continuation"],
  },

  // ── gcd (add: 3) ──────────────────────────────────────────────────────────
  {
    id: "objective-c03-basic-gcd-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`DispatchQueue(label:)`로 생성된 큐의 기본 동작은 무엇인가?",
    choices: [
      {
        id: "a",
        text: "시리얼(serial) 큐로 생성되며, 작업이 순차적으로 실행된다.",
      },
      {
        id: "b",
        text: "컨커런트(concurrent) 큐로 생성되며, 작업이 병렬로 실행된다.",
      },
      {
        id: "c",
        text: "메인 큐와 동일하게 동작한다.",
      },
      {
        id: "d",
        text: "QoS를 명시하지 않으면 큐가 생성되지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`DispatchQueue(label:)`의 기본값은 시리얼 큐입니다. 컨커런트 큐로 만들려면 `attributes: .concurrent`를 명시해야 합니다. 메인 큐도 시리얼이지만, 메인 스레드에 묶여 있다는 추가 제약이 있습니다.",
    relatedTopicSlugs: ["03-concurrency/gcd"],
  },
  {
    id: "objective-c03-intermediate-gcd-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "GCD에서 `DispatchQueue.async(flags: .barrier)`를 사용하는 목적은?",
    choices: [
      {
        id: "a",
        text: "컨커런트 큐에서 쓰기 작업 중 다른 작업이 실행되지 않도록 단독 실행 구간을 만드는 reader-writer 패턴 구현",
      },
      {
        id: "b",
        text: "시리얼 큐에서 특정 작업을 최우선으로 처리하기 위해",
      },
      {
        id: "c",
        text: "메인 큐에서 UI 업데이트를 즉시 실행하기 위해",
      },
      {
        id: "d",
        text: "여러 큐 간 작업 완료를 동기화하기 위해",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`flags: .barrier`는 컨커런트 큐에서만 의미가 있습니다. barrier 작업은 이전 작업이 모두 완료된 후 단독으로 실행되고, 완료 후에야 뒤의 작업들이 다시 동시에 실행됩니다. 이를 통해 reader-writer 패턴을 구현할 수 있습니다.",
    relatedTopicSlugs: ["03-concurrency/gcd"],
  },
  {
    id: "objective-c03-intermediate-gcd-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "GCD에서 작업 취소가 async/await보다 어려운 이유는?",
    choices: [
      {
        id: "a",
        text: "`DispatchWorkItem.cancel()`은 아직 시작되지 않은 작업만 취소 가능하며, 실행 중인 작업은 내부에서 `isCancelled`를 직접 폴링해야 한다.",
      },
      {
        id: "b",
        text: "GCD는 취소 기능 자체가 없다.",
      },
      {
        id: "c",
        text: "GCD는 취소 시 자동으로 에러를 throw하여 별도 처리가 어렵다.",
      },
      {
        id: "d",
        text: "GCD의 `DispatchWorkItem`은 취소 후 자동으로 메모리에서 해제된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`DispatchWorkItem.cancel()`은 큐에서 아직 시작되지 않은 작업에만 효과가 있습니다. 이미 실행 중인 작업은 강제 종료가 불가능하며, 코드 내부에서 `workItem.isCancelled`를 주기적으로 확인하고 빠져나와야 합니다. async/await의 협력적 취소(`Task.cancel()` + `checkCancellation()`)가 훨씬 자연스럽습니다.",
    relatedTopicSlugs: ["03-concurrency/gcd"],
  },

  // ── operation-queue (add: 5) ───────────────────────────────────────────────
  {
    id: "objective-c03-basic-operation-queue-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`OperationQueue`에서 `maxConcurrentOperationCount = 1`로 설정하면 어떻게 동작하는가?",
    choices: [
      {
        id: "a",
        text: "GCD의 시리얼 큐처럼 작업이 순차적으로 하나씩 실행된다.",
      },
      {
        id: "b",
        text: "큐에 작업을 추가할 수 없게 된다.",
      },
      {
        id: "c",
        text: "메인 스레드에서만 작업이 실행된다.",
      },
      {
        id: "d",
        text: "최대 1개의 Operation 객체만 생성 가능하다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`maxConcurrentOperationCount = 1`로 설정하면 동시에 하나의 작업만 실행되어 GCD의 시리얼 큐와 유사하게 동작합니다. 단, OperationQueue는 Operation 객체로 작업을 다루며 의존성, 취소, KVO 관찰 기능을 추가로 제공합니다.",
    relatedTopicSlugs: ["03-concurrency/operation-queue"],
  },
  {
    id: "objective-c03-basic-operation-queue-002",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "`OperationQueue`가 GCD보다 유리한 경우는?",
    choices: [
      {
        id: "a",
        text: "작업 간 의존성 설정, 취소, 동시 실행 수 제한이 모두 필요한 복잡한 작업 흐름",
      },
      {
        id: "b",
        text: "단순한 백그라운드 작업을 빠르게 실행할 때",
      },
      {
        id: "c",
        text: "메인 스레드에서 UI를 업데이트할 때",
      },
      {
        id: "d",
        text: "Swift 6의 strict concurrency 검사를 통과해야 할 때",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`OperationQueue`는 `addDependency(_:)`, `cancel()`, `maxConcurrentOperationCount`를 기본 제공하여 작업 간 의존성 그래프와 복잡한 실행 제어가 필요한 경우에 GCD보다 명확한 코드를 작성할 수 있습니다. 단순한 작업은 GCD나 async/await가 더 간결합니다.",
    relatedTopicSlugs: ["03-concurrency/operation-queue"],
  },
  {
    id: "objective-c03-intermediate-operation-queue-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`Operation.cancel()`을 호출해도 실행 중인 작업이 즉시 멈추지 않는 이유는?",
    choices: [
      {
        id: "a",
        text: "GCD와 마찬가지로 협력적 취소 방식이므로, 실행 중인 코드가 `isCancelled`를 확인하고 직접 빠져나와야 한다.",
      },
      {
        id: "b",
        text: "`cancel()`은 큐 전체를 취소하며 개별 Operation은 취소할 수 없다.",
      },
      {
        id: "c",
        text: "`cancel()`을 호출하면 iOS가 강제로 해당 스레드를 종료시킨다.",
      },
      {
        id: "d",
        text: "비동기 Operation은 취소가 불가능하다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`Operation.cancel()`은 `isCancelled` 플래그를 true로 설정할 뿐, 실행 중인 코드를 강제 중단하지 않습니다. 실행 중인 Operation이 취소에 반응하려면 내부에서 주기적으로 `isCancelled`를 확인하고 조기에 종료해야 합니다. 이는 GCD의 `DispatchWorkItem.isCancelled`와 동일한 협력적 취소 모델입니다.",
    relatedTopicSlugs: ["03-concurrency/operation-queue"],
  },
  {
    id: "objective-c03-intermediate-operation-queue-004",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "다음 코드에서 `display` Operation은 언제 실행되는가?\n\n```swift\nlet download = BlockOperation { ... }\nlet parse    = BlockOperation { ... }\nlet display  = BlockOperation { ... }\n\nparse.addDependency(download)\ndisplay.addDependency(parse)\nqueue.addOperations([download, parse, display], waitUntilFinished: false)\n```",
    choices: [
      {
        id: "a",
        text: "`download`가 완료된 후 `parse`가 실행되고, `parse`가 완료된 후 `display`가 실행된다.",
      },
      {
        id: "b",
        text: "세 Operation이 동시에 병렬로 실행된다.",
      },
      {
        id: "c",
        text: "`display`는 `download`가 완료되면 바로 실행된다.",
      },
      {
        id: "d",
        text: "`waitUntilFinished: false`이므로 의존성이 무시된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`addDependency`는 실행 순서를 체인 형태로 강제합니다. `parse`는 `download` 완료 후, `display`는 `parse` 완료 후 실행됩니다. `waitUntilFinished: false`는 호출한 스레드(현재 스레드)가 기다리지 않는다는 의미이며, 의존성 자체는 그대로 적용됩니다.",
    relatedTopicSlugs: ["03-concurrency/operation-queue"],
  },
  {
    id: "objective-c03-advanced-operation-queue-005",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "현대 Swift 코드에서 `OperationQueue` 대신 async/await을 권장하는 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "async/await과 TaskGroup이 의존성 체인, 구조적 취소, 에러 전파를 더 간결하고 타입 안전하게 표현하며 컴파일러 지원을 받는다.",
      },
      {
        id: "b",
        text: "OperationQueue는 Swift 5.5부터 deprecated되었다.",
      },
      {
        id: "c",
        text: "OperationQueue는 메인 스레드에서만 실행되는 제한이 있다.",
      },
      {
        id: "d",
        text: "OperationQueue는 의존성 설정을 지원하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "async/await + TaskGroup은 `async let` / `addTask`로 의존성 흐름을 직선적으로 표현하고, `try-catch`로 에러를 자연스럽게 전파하며, 구조적 취소를 컴파일러가 추적합니다. `OperationQueue`는 deprecated되지는 않았지만 레거시 유지보수나 의존성 그래프가 복잡한 특수 케이스 외엔 신규 코드에서 덜 사용됩니다.",
    relatedTopicSlugs: ["03-concurrency/operation-queue"],
  },

  // ── runloop-and-main-thread (add: 2) ──────────────────────────────────────
  {
    id: "objective-c03-basic-runloop-main-thread-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt:
      "스크롤 중에 `Timer`가 동작하지 않는 버그의 원인으로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "Timer가 `.default` 모드에만 등록되어 있어, `.tracking` 모드인 스크롤 중에는 처리되지 않기 때문이다.",
      },
      {
        id: "b",
        text: "UIScrollView가 실행 중이면 RunLoop이 완전히 정지되기 때문이다.",
      },
      {
        id: "c",
        text: "Timer는 메인 스레드에서만 동작하는데, 스크롤 중에는 메인 스레드가 다른 스레드로 전환되기 때문이다.",
      },
      {
        id: "d",
        text: "DispatchQueue에서 생성된 Timer는 스크롤 이벤트와 충돌한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "RunLoop은 현재 모드에 등록된 소스만 처리합니다. UIScrollView 추적 중에는 RunLoop이 `.tracking` 모드로 전환되는데, Timer가 `.default` 모드에만 등록되어 있으면 이 시간 동안 호출되지 않습니다. 스크롤 중에도 동작하게 하려면 `RunLoop.main.add(timer, forMode: .common)`으로 `.common` 모드(default + tracking 포함)에 등록해야 합니다.",
    relatedTopicSlugs: ["03-concurrency/runloop-and-main-thread"],
  },
  {
    id: "objective-c03-intermediate-runloop-main-thread-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "iOS 렌더링 파이프라인에서 60Hz 기준으로 hitch(프레임 드롭)가 발생하는 조건은?",
    choices: [
      {
        id: "a",
        text: "메인 스레드가 한 프레임 당 16.67ms 이내에 레이아웃/그리기 커밋을 완료하지 못할 때",
      },
      {
        id: "b",
        text: "백그라운드 스레드에서 네트워크 요청이 16.67ms를 초과할 때",
      },
      {
        id: "c",
        text: "GPU 렌더링이 33ms를 초과할 때",
      },
      {
        id: "d",
        text: "RunLoop이 `.tracking` 모드로 전환될 때마다 발생한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "60Hz 디스플레이에서는 한 프레임당 약 16.67ms가 주어집니다. 메인 스레드가 이 시간 안에 레이아웃, 그리기, 커밋을 완료하지 못하면 프레임이 드롭되어 hitch(끊김)가 발생합니다. 120Hz ProMotion에서는 8.33ms로 더 엄격합니다.",
    relatedTopicSlugs: ["03-concurrency/runloop-and-main-thread"],
  },

  // ── sendable (add: 2) ─────────────────────────────────────────────────────
  {
    id: "objective-c03-intermediate-sendable-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "`Sendable`과 `@Sendable`의 차이로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "`Sendable`은 타입(struct/class/actor)이 채택하는 프로토콜이고, `@Sendable`은 클로저/함수 타입에 붙이는 속성이다.",
      },
      {
        id: "b",
        text: "`@Sendable`은 타입(struct/class/actor)이 채택하는 프로토콜이고, `Sendable`은 클로저/함수 타입에 붙이는 속성이다.",
      },
      {
        id: "c",
        text: "두 개념은 동일하며 어떤 상황에서도 혼용할 수 있다.",
      },
      {
        id: "d",
        text: "`@Sendable`은 Swift 6에서 추가된 새로운 개념이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`Sendable`은 struct, class, actor 같은 타입이 채택하는 마커 프로토콜로, 해당 타입의 값이 동시성 경계를 안전하게 넘을 수 있음을 선언합니다. `@Sendable`은 클로저나 함수 타입에 부여하는 속성으로, 클로저가 캡처하는 모든 값이 Sendable이어야 함을 요구합니다. `Task { }`나 `TaskGroup.addTask { }`의 클로저가 `@Sendable`입니다.",
    relatedTopicSlugs: ["03-concurrency/sendable"],
  },
  {
    id: "objective-c03-advanced-sendable-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "`@unchecked Sendable`을 사용하는 적절한 시나리오는?",
    choices: [
      {
        id: "a",
        text: "내부적으로 NSLock/DispatchQueue로 동시성을 직접 관리하는 스레드 안전 캐시 클래스를 Sendable로 표시할 때",
      },
      {
        id: "b",
        text: "모든 저장 프로퍼티가 immutable인 final class를 Sendable로 표시할 때",
      },
      {
        id: "c",
        text: "actor 타입을 Sendable로 표시할 때",
      },
      {
        id: "d",
        text: "Swift 5에서 Sendable 검사를 전부 비활성화하고 싶을 때",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`@unchecked Sendable`은 컴파일러의 자동 검증을 우회하고 개발자가 직접 thread safety를 보장할 때 사용합니다. NSLock, DispatchQueue 등으로 내부 동시성을 직접 관리하는 클래스가 대표적입니다. 모든 프로퍼티가 immutable인 final class나 actor는 `@unchecked` 없이 자동으로 Sendable을 준수합니다.",
    relatedTopicSlugs: ["03-concurrency/sendable"],
  },

  // ── swift6-strict (add: 4) ────────────────────────────────────────────────
  {
    id: "objective-c03-intermediate-swift6-strict-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt:
      "Swift 6의 strict concurrency 마이그레이션 단계를 올바른 순서로 나타낸 것은?",
    choices: [
      {
        id: "a",
        text: "minimal → targeted → complete",
      },
      {
        id: "b",
        text: "complete → targeted → minimal",
      },
      {
        id: "c",
        text: "targeted → complete → minimal",
      },
      {
        id: "d",
        text: "complete → minimal → targeted",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift 6 마이그레이션은 `minimal`(명시적 Sendable만 검사) → `targeted`(동시성 사용 코드만 검사) → `complete`(전체 검사, Swift 6 동작)의 단계로 진행하는 것이 권장됩니다. 한 번에 `complete`로 올리면 에러가 너무 많아 대응이 어렵습니다.",
    relatedTopicSlugs: ["03-concurrency/swift6-strict"],
  },
  {
    id: "objective-c03-advanced-swift6-strict-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "Swift 6에서 아래 코드가 에러가 되는 이유와 올바른 해결책은?\n\n```swift\nfinal class VM {\n    var value = 0\n    func bind() {\n        Task { self.value = 1 }\n    }\n}\n```",
    choices: [
      {
        id: "a",
        text: "Task 클로저는 @Sendable인데 VM이 non-Sendable이므로 self 캡처가 에러가 된다. `@MainActor final class VM` 또는 `actor VM`으로 전환하거나 VM을 Sendable로 만들어야 한다.",
      },
      {
        id: "b",
        text: "`var value`를 `let`으로 바꾸면 해결된다.",
      },
      {
        id: "c",
        text: "Task를 Task.detached로 바꾸면 해결된다.",
      },
      {
        id: "d",
        text: "Swift 6에서는 class 내부에서 Task를 사용할 수 없으므로 OperationQueue로 대체해야 한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`Task { ... }`의 클로저는 `@Sendable`을 요구합니다. `VM`은 가변 class이므로 기본적으로 non-Sendable이라 Swift 6에서 self 캡처가 에러가 됩니다. 해결책은 `@MainActor final class VM`으로 메인 격리하거나, `actor VM`으로 전환하거나, 모든 프로퍼티를 immutable하게 만들어 `Sendable`을 준수하는 것입니다.",
    relatedTopicSlugs: ["03-concurrency/swift6-strict"],
  },
  {
    id: "objective-c03-advanced-swift6-strict-003",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "Swift 6의 region-based isolation에서 \"Sending 'foo' risks causing data races\" 에러를 해결하는 올바른 방법은?",
    choices: [
      {
        id: "a",
        text: "객체를 actor 안에서 생성한 직후 전달하고, 이후 그 객체를 다시 사용하지 않아 region을 비운다.",
      },
      {
        id: "b",
        text: "객체에 `@unchecked Sendable`을 붙여 컴파일러 검사를 우회한다.",
      },
      {
        id: "c",
        text: "객체를 `weak` 참조로 전달하면 data race가 발생하지 않는다.",
      },
      {
        id: "d",
        text: "Region-based isolation은 런타임에만 검사하므로 컴파일 에러는 발생하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift 6의 region-based isolation은 컴파일러가 객체의 소유권 region을 추적합니다. 객체를 외부로 전달(send)하려면 전달 이후 해당 region에서 더 이상 사용하지 않아야 합니다. actor 안에서 값을 만들어 바로 전달하고 이후 접근하지 않으면 컴파일러가 안전하다고 판단합니다.",
    relatedTopicSlugs: ["03-concurrency/swift6-strict"],
  },
  {
    id: "objective-c03-advanced-swift6-strict-004",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt:
      "Swift 6에서 `nonisolated(unsafe) static var counter = 0` 선언의 의미는?",
    choices: [
      {
        id: "a",
        text: "전역 가변 변수임을 명시하되, 개발자가 직접 thread safety를 보장하겠다는 선언으로, Swift 6의 전역 mutable 검사를 통과시킨다.",
      },
      {
        id: "b",
        text: "해당 변수를 자동으로 actor-isolated로 만든다.",
      },
      {
        id: "c",
        text: "counter를 Sendable로 자동 추론하게 한다.",
      },
      {
        id: "d",
        text: "변수를 상수로 변환하여 데이터 레이스를 방지한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift 6에서 전역 mutable 변수는 기본적으로 동시성 위험으로 에러가 됩니다. `nonisolated(unsafe)`를 붙이면 컴파일러의 격리 검사를 통과하지만, thread safety에 대한 책임은 전적으로 개발자에게 있습니다. 실제로 안전하게 하려면 actor 또는 lock으로 보호하는 wrapper가 필요합니다.",
    relatedTopicSlugs: ["03-concurrency/swift6-strict"],
  },
];
