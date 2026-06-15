# 1단계 — 언어/메모리 기반 (필수)

> 한 줄 요약 — Swift 언어 자체 + 메모리 + 동시성. **iOS 면접의 90% 이상이 이 영역에서 시작**한다. 다른 stage로 넘어가기 전 *반드시* 통과해야 하는 베이스.

## 학습 목표

이 단계를 마치면 다음 질문에 *왜*까지 답할 수 있어야 한다:

- struct와 class를 언제 어떻게 골라야 하는가
- 옵셔널이 *왜 enum*인가, force unwrap이 위험한 이유
- ARC가 retain cycle을 *못 잡는* 이유와 해결 방법
- weak vs unowned 선택 기준
- GCD에서 async/await로 넘어간 동기와 차이
- actor가 lock과 다른 점
- Sendable이 *컴파일 타임에* 막아주는 것

## 카테고리

### [01-swift-language](../01-swift-language/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [struct vs class](../01-swift-language/struct-vs-class.md) | 주니어 필수 |
| [Optional](../01-swift-language/optional.md) | 주니어 필수 |
| [Closures (escaping/autoclosure/capture)](../01-swift-language/closures.md) | 주니어~미들 |
| [Generics + some/any/PAT](../01-swift-language/generics-and-pat.md) | 미들 |
| [Protocol-Oriented Programming](../01-swift-language/protocol-oriented-programming.md) | 미들 |
| [Property Wrapper / KeyPath / Subscript](../01-swift-language/properties.md) | 미들 |
| [Method Dispatch / Runtime Internals](../01-swift-language/method-dispatch.md) | 시니어 |
| [ABI Stability](../01-swift-language/abi-and-resilience.md) | 시니어 |
| [Ownership (consuming/borrowing)](../01-swift-language/ownership.md) | 시니어 |

### [02-memory-management](../02-memory-management/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [ARC 동작](../02-memory-management/arc.md) | 주니어 필수 |
| [weak vs unowned](../02-memory-management/weak-vs-unowned.md) | 주니어 필수 |
| [Retain Cycle 발생 패턴](../02-memory-management/retain-cycle.md) | 주니어 필수 |
| [Capture List](../02-memory-management/capture-list.md) | 미들 |
| [Heap vs Stack](../02-memory-management/heap-vs-stack.md) | 미들 |
| [ARC Optimization (+0/+1)](../02-memory-management/arc-optimization.md) | 시니어 |
| [Memory Tools (Memory Graph / Sanitizers)](../02-memory-management/memory-tools.md) | 시니어 |

### [03-concurrency](../03-concurrency/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [GCD](../03-concurrency/gcd.md) | 주니어 필수 |
| [RunLoop과 Main Thread](../03-concurrency/runloop-and-main-thread.md) | 주니어 필수 |
| [async / await](../03-concurrency/async-await.md) | 주니어~미들 |
| [Actor와 @MainActor](../03-concurrency/actor-and-mainactor.md) | 미들 |
| [Sendable](../03-concurrency/sendable.md) | 미들 |
| [Continuation](../03-concurrency/continuation.md) | 미들 |
| [Concurrency Runtime (cooperative pool / hop)](../03-concurrency/concurrency-runtime.md) | 시니어 |
| [Swift 6 Strict Concurrency](../03-concurrency/swift6-strict.md) | 시니어 |
| [Concurrency Pitfalls (reentrancy 등)](../03-concurrency/concurrency-pitfalls.md) | 시니어 |

## 권장 학습 순서

1. **언어 기본** — Optional, struct vs class, enum, closures
2. **메모리 즉시 연결** — ARC, weak/unowned, retain cycle, capture list
3. **동시성 진입** — GCD → async/await → actor 흐름 *순차적으로*
4. **심화 (시니어)** — runtime internals, ABI, ownership, cooperative pool

## 예상 소요 시간

- 주니어 깊이: **3~5일**
- 미들 깊이: **1.5~2주**
- 시니어 깊이: **3~4주** (런타임/ABI/Swift 6 strict까지)

## 대표 질문

### 주니어
- struct와 class의 본질적 차이는?
- `?`와 `!`의 차이? force unwrap이 왜 위험?
- ARC가 무엇인가? GC와 어떻게 다른가?
- weak과 unowned 어떤 걸 언제 쓰나?
- `DispatchQueue.main.sync`를 main에서 호출하면?

### 미들
- `some` vs `any`의 메모리/성능 차이?
- closure의 캡처는 어떻게 일어나며 왜 strong인가?
- Actor reentrancy 문제와 해결?
- `@MainActor` 클래스에서 무거운 작업을 어떻게 분리?
- `withCheckedContinuation`의 안전 규칙?

### 시니어
- vtable vs witness table vs existential container 메모리 레이아웃?
- `final` + WMO가 ARC 비용을 어떻게 줄이나?
- `@frozen`/`@inlinable`이 ABI 호환성에 미치는 영향?
- Swift 6 strict concurrency 마이그레이션 절차?
- Swift Concurrency cooperative thread pool 내부?

## 다음 단계 진입 조건

체크 퀴즈가 통과되면 *객관적으로 검증*되지만, 그 외 기준:

- [ ] 주니어 질문 10개를 *3분 안에* 막힘 없이 답변
- [ ] retain cycle 코드를 *코드만 보고* 즉시 식별
- [ ] async/await로 작성된 짧은 코드를 *thread/actor 흐름*으로 설명
- [ ] *지원 포지션이 UIKit/SwiftUI 어느 쪽*인지 알고 다음 stage 진입

→ [stage-2-ui](stage-2-ui.md)로 진입.

## 모듈 확장 가이드 (서브 에이전트용)

이 stage 파일을 더 채우고 싶다면:
- **표 형태 토픽 리스트** 유지 (markdown table)
- **권장 학습 순서**는 *번호 매김*으로 명확히
- **대표 질문은 레벨별 3개씩** 유지
- 다른 stage 파일은 *건드리지 말 것* — 모듈 경계 = 파일 경계
