# 동기화 Primitive (Mutex / Semaphore / RWLock / Atomic / Deadlock)

> 한 줄 요약 — 여러 스레드가 *공유 자원*에 동시에 접근할 때 데이터 레이스를 막는 표준 도구들. 잘못 쓰면 *데드락/라이브락/기아*. iOS는 보통 GCD/Actor로 추상화하지만 원리를 알아야 한다.

## 데이터 레이스란

서로 다른 스레드가 *같은 메모리*를 *동시에* 접근하고, 그 중 *최소 하나가 쓰기*. 결과 비결정적 → 가끔 잘못된 값/크래시.

```
Thread A: counter = counter + 1
Thread B: counter = counter + 1
```

각 연산은 read-modify-write 3단계. 인터리빙 시 한 번 증가가 사라질 수 있음.

## 핵심 Primitive

### Mutex (Mutual Exclusion Lock)

한 번에 한 스레드만 *임계 영역*에 들어옴.

```swift
let lock = NSLock()
lock.lock()
counter += 1
lock.unlock()

// 또는 안전한 형태
lock.withLock { counter += 1 }     // iOS 16+ NSLock도 with 패턴
```

비용: lock/unlock 자체는 보통 빠르지만, *경합 시* 대기 → context switch.

### Recursive Lock

같은 스레드가 같은 락을 *여러 번* 잡아도 OK. 일반 mutex는 자기 자신이 다시 잡으면 데드락.

```swift
let rlock = NSRecursiveLock()
```

### Semaphore

*카운트 기반* 동시 접근 제한. N=1이면 mutex와 비슷, N>1이면 *동시 N개 허용*.

```swift
let sem = DispatchSemaphore(value: 3)   // 동시 3개

DispatchQueue.global().async {
    sem.wait()                          // 자리 기다림
    defer { sem.signal() }              // 끝나면 자리 비움
    doWork()
}
```

흔한 사용: API 동시 호출 제한, 리소스 풀.

### Read-Write Lock

*읽기는 동시 허용 / 쓰기는 단독*. 읽기 多 / 쓰기 少 패턴에 효율.

```swift
let queue = DispatchQueue(label: "rw", attributes: .concurrent)
queue.sync { read() }                                  // 동시 가능
queue.async(flags: .barrier) { write() }               // barrier — 단독
```

GCD의 concurrent queue + barrier가 RW lock 패턴.

### Spinlock (`os_unfair_lock`)

대기를 *busy wait*로 처리. 매우 짧은 임계 영역에 적합. iOS의 `os_unfair_lock`은 우선순위 역전을 피한 빠른 스핀락.

```swift
import os
var lock = os_unfair_lock()
os_unfair_lock_lock(&lock)
counter += 1
os_unfair_lock_unlock(&lock)
```

긴 임계 영역에 쓰면 CPU 낭비.

### Atomic 연산

CPU 명령 단일 instruction으로 보장되는 read-modify-write (예: x86 `LOCK CMPXCHG`).

Swift는 표준 atomic API가 부족해 보통 lock 또는 actor로 대체. C의 `<stdatomic.h>` / `OSAtomic` (deprecated).

## 데드락 — 4가지 조건

다음이 *모두* 만족되면 데드락 가능:

1. **Mutual Exclusion**: 자원을 한 번에 한 스레드만.
2. **Hold and Wait**: 자원 점유한 채 다른 자원 대기.
3. **No Preemption**: 자원을 강제로 빼앗을 수 없음.
4. **Circular Wait**: A가 B 자원, B가 A 자원을 기다림.

해결:
- 락 획득 *순서를 전역적으로 통일* (4번 깨기).
- 한 번에 모든 자원을 잡거나 대기 (2번 깨기).
- timeout 두고 fail-fast.

```swift
// ❌ 데드락 가능 — 락 순서 다름
Thread A: lockA → lockB
Thread B: lockB → lockA

// ✅ 통일
Thread A: lockA → lockB
Thread B: lockA → lockB
```

`DispatchQueue.main.sync` from main thread = 자기 자신을 기다림 → 데드락.

## Live Lock / Starvation

- **Live Lock**: 둘 다 양보하다 진행 못 함.
- **Starvation**: 우선순위 낮은 스레드가 영원히 자원 못 받음.

해결: *공정성*을 보장하는 락 (FIFO), 우선순위 동등화.

## iOS에서의 추상화 — 무엇을 골라야

| 케이스 | 추천 |
|---|---|
| 매우 짧은 임계 영역 | `os_unfair_lock` |
| 일반 임계 영역 | `NSLock` / `pthread_mutex` |
| 카운트/리소스 풀 | `DispatchSemaphore` |
| 읽기 多 / 쓰기 少 | `DispatchQueue(concurrent) + barrier` |
| 신규 코드 | **`actor`** |
| async/await 환경 | actor 또는 직렬 큐 |

직접 락보다 `actor`가 컴파일러로 *데이터 레이스 자체를 막아 주므로* 신규 코드 기본 선택.

## 비교 — Lock vs Actor

| | Lock | Actor |
|---|---|---|
| 검증 | 런타임 (놓치면 버그) | 컴파일 타임 |
| 데드락 | 가능 | 거의 없음 (협력적 await) |
| 비용 | 일반적으로 빠름 | actor hop 비용 |
| 호환 | 모든 코드 | async 컨텍스트 |
| iOS 도입 | 오래됨 | 5.5+ |

## 흔한 함정 / Follow-up

- **Q. `DispatchSemaphore.wait()`을 메인에서?**
  메인이 막힘 → UI 멈춤. 절대 금지. `Task` + `await` 패턴.

- **Q. 락이 풀리지 않은 상태에서 throw?**
  `defer` 또는 `withLock`/`withCheckedLock` 패턴으로 *반드시* unlock 보장.

- **Q. recursive lock이 좋아 보이는데 왜 기본이 아닌가?**
  설계가 *재진입을 막아야 하는 상황*까지 가려 버림. 명시적 mutex로 잘못된 재진입을 *에러로 잡는 게* 보통 안전.

- **Q. atomic이라고 다 thread-safe?**
  단일 변수 atomic만 보장. *복합 상태*는 락이나 트랜잭션 필요. "isReady = true; data = ..." 두 줄은 atomic 따로따로여도 함께 안전하지 않음.

- **Q. iOS Swift에서 atomic counter?**
  `actor`로 감싸기. 또는 `OSAllocatedUnfairLock` (iOS 16+) + 변수.

- **Q. ARC가 thread-safe?**
  Apple은 ARC retain/release를 thread-safe하게 구현. 단, *프로퍼티 접근*까지 thread-safe인 것은 아님.

## 참고

- Operating System Concepts
- Apple Docs: Synchronization, os_unfair_lock
- WWDC 2021: Protect mutable state with Swift actors
