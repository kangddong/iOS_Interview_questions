# 03. Concurrency

GCD부터 Swift Concurrency까지. 시기별 도구의 *왜*를 이해하는 것이 핵심.

## 항목

- [GCD](gcd.md) — DispatchQueue, sync vs async, QoS, barrier
- [RunLoop과 메인 스레드](runloop-and-main-thread.md) — UI 업데이트가 메인이어야 하는 이유, 렌더링 파이프라인
- [OperationQueue](operation-queue.md) — GCD 대비 장점, 의존성/취소
- [async / await](async-await.md) — Swift 5.5+, 구조적 동시성, Task, async let, TaskGroup
- [Actor와 @MainActor](actor-and-mainactor.md) — 데이터 격리, reentrancy, 글로벌 액터
- [Sendable](sendable.md) — 컴파일 타임 동시성 검증, @unchecked Sendable, strict checking

## 심화 (3년차+)

- [Continuation — 콜백 → async 변환](continuation.md)
- [AsyncSequence / AsyncStream](async-sequence-and-stream.md)
- [Swift 6 Strict Concurrency](swift6-strict.md)

## 자주 묻는 질문

- `DispatchQueue.main.sync`가 데드락 나는 이유 → [gcd.md](gcd.md)
- GCD vs async/await 선택 기준 → [async-await.md](async-await.md)
- Actor reentrancy 문제 → [actor-and-mainactor.md](actor-and-mainactor.md)
- `@MainActor` 동작 원리 → [actor-and-mainactor.md](actor-and-mainactor.md)
- `Sendable`이 필요한 이유 → [sendable.md](sendable.md)
- async 함수에서 await 후 스레드가 바뀌는가 → [async-await.md](async-await.md)
