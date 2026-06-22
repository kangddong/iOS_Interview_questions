# 03. Concurrency

> 한 줄 요약 — *동시성은 "여러 일을 동시에 진행"하는 것이고, 병렬성은 "여러 일을 동시에 실행"하는 것이다.* Swift Concurrency는 컴파일러가 데이터 경합을 막으면서 동시성을 표현하게 해주는 모델.

GCD부터 Swift Concurrency까지. 시기별 도구의 *왜* 를 이해하는 것이 핵심.

## Concurrency vs Parallelism

| 구분 | Concurrency (동시성) | Parallelism (병렬성) |
| --- | --- | --- |
| 정의 | 여러 작업을 *진행 중* 상태로 두는 것 (인터리빙) | 여러 작업을 *물리적으로 동시에* 실행 |
| 자원 | 단일 코어로도 가능 | 다중 코어 필수 |
| Swift | `async/await`, `Task`, `Actor` | `TaskGroup`, GCD `.concurrent`, `DispatchQueue.concurrentPerform` |
| 목적 | I/O 대기 시간 숨김, 응답성 | 처리량 (throughput) |

→ Swift Concurrency는 둘 다 표현 가능하지만, *기본 모델은 동시성*이다. 병렬화는 `TaskGroup` 같은 명시적 도구가 필요.

## 핵심 개념 5선

### 1. 구조적 동시성 (Structured Concurrency)
- **부모 Task의 생명주기 = 자식 Task의 생명주기**. 부모가 끝나면 자식은 자동 취소·대기.
- `async let`, `withTaskGroup`이 표현하는 트리 구조. 콜백 지옥과 달리 **취소·에러·반환값이 호출 스택 모양 그대로 전파**된다.
- 비구조적 = `Task { ... }` 또는 `Task.detached { ... }`. 부모 컨텍스트와 분리되므로 *명시적으로 관리*해야 함.
- 면접 질문: "구조적 동시성과 비구조적 동시성의 차이는?" → 취소 전파 / 우선순위 상속 / 액터 컨텍스트 상속 여부 3가지로 답하면 깔끔.

### 2. Actor와 데이터 격리
- Actor는 *mutable state를 직렬화*해서 보호하는 참조 타입. 외부에서 actor 메서드 호출은 **자동으로 await**가 붙음 (cross-actor call).
- 같은 actor 내부 호출은 동기. 다른 actor 호출은 비동기(suspend point).
- `@MainActor`는 글로벌 액터의 대표 케이스 — UI 코드를 메인 스레드에 고정.
- 함정: **Actor reentrancy** — actor 메서드가 await로 중단되면 다른 메서드가 끼어들 수 있다. 상태 가정이 깨질 위험.

### 3. Actor Hopping
- await 지점에서 호출자 액터 → 대상 액터로 **실행 컨텍스트가 옮겨가는 것**.
- 비용: continuation 생성 + executor 큐 enqueue + thread hop 가능성. **잦은 hop은 성능 저하**의 주범.
- 줄이는 패턴:
  - 같은 actor 안에서 묶어서 처리(여러 번의 small hop → 한 번의 큰 작업).
  - `nonisolated` 메서드로 hop 없이 호출 가능한 read-only 진입점 제공.
  - Pure 함수는 actor 밖으로 분리.

### 4. Cooperative Thread Pool
- Swift Concurrency 런타임은 **CPU 코어 수만큼의 작은 스레드 풀**을 공유한다. GCD처럼 큐마다 스레드를 생성하지 않음.
- *Forward progress* 보장 — 모든 Task는 결국 진행되어야 하므로, 풀의 스레드를 **블로킹하면 안 됨**(`sleep`, semaphore wait, `DispatchSemaphore.wait`, 동기 I/O 금지).
- 블로킹이 필요하면 `Task.detached` + `DispatchQueue`(또는 별도 스레드)로 격리.

### 5. Sendable과 컴파일 타임 데이터 경합 방지
- 액터 경계를 *값으로* 넘는 모든 타입은 `Sendable` 이어야 함. 컴파일러가 강제.
- struct/enum + 모든 멤버 Sendable → 자동 Sendable. class는 `final + let` + 모든 멤버 Sendable 만 가능, 또는 `@unchecked Sendable`로 직접 보증.
- Swift 6 Strict Concurrency에서는 워닝이 에러로 격상. 마이그레이션 핵심 이슈.

## Swift 동시성 진화 한눈에

```
GCD (2009) ─ DispatchQueue / 콜백 ─→ 콜백 지옥, 취소 어려움
   ↓
OperationQueue ─ 의존성/취소 ─→ 보일러플레이트 많음
   ↓
async/await (Swift 5.5) ─ 호출 스택 모양 그대로 비동기 표현
   ↓
구조적 동시성 + Actor ─ 데이터 격리 모델
   ↓
Swift 6 Strict Concurrency ─ 컴파일러가 경합 차단
```

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

## 시니어

- [Swift Concurrency Runtime (cooperative pool, executor, hop)](concurrency-runtime.md)
- [Concurrency Pitfalls (reentrancy / priority inversion / blocking / continuation)](concurrency-pitfalls.md)

## 자주 묻는 질문

- 동시성과 병렬성의 차이 → 본 페이지 상단 표
- 구조적 동시성 vs 비구조적 (`Task {}` / `Task.detached`) → [async-await.md](async-await.md)
- Actor hopping 비용을 어떻게 줄이나 → [concurrency-runtime.md](concurrency-runtime.md)
- Actor reentrancy 문제 → [actor-and-mainactor.md](actor-and-mainactor.md)
- `@MainActor` 동작 원리 → [actor-and-mainactor.md](actor-and-mainactor.md)
- `Sendable`이 필요한 이유 → [sendable.md](sendable.md)
- `DispatchQueue.main.sync`가 데드락 나는 이유 → [gcd.md](gcd.md)
- async 함수에서 await 후 스레드가 바뀌는가 → [async-await.md](async-await.md)
- Cooperative pool에서 블로킹하면 안 되는 이유 → [concurrency-runtime.md](concurrency-runtime.md)
