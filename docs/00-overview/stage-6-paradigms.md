# 6단계 — 프로그래밍 패러다임

> 한 줄 요약 — 언어 위에서 *어떻게 모델링하는가*. **OOP / FP / 명령형 / 선언형의 *직교 분리*가 시니어 답변의 근거**. *왜 SwiftUI는 선언형*, *왜 Swift는 POP을 권장*인가의 답이 여기 있다.

## 학습 목표

- OOP 4원칙 + SOLID + Swift class와의 관계 + 한계
- FP 핵심(순수 함수, 불변성, 1급/고차 함수, Monad 직관)
- OOP vs FP의 *직교 분리* — 정체성/공유 상태는 OOP, 변환/흐름은 FP
- 명령형(UIKit) vs 선언형(SwiftUI)의 본질 차이와 트레이드오프
- *Functional Core, Imperative Shell* 패턴
- POP가 OOP 상속 모델과 다른 점

## 카테고리

### [15-paradigms](../15-paradigms/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [Object-Oriented Programming (OOP)](../15-paradigms/oop.md) | 주니어~시니어 |
| [Functional Programming (FP)](../15-paradigms/fp.md) | 주니어~시니어 |
| [OOP vs FP](../15-paradigms/oop-vs-fp.md) | 미들 |
| [명령형 vs 선언형](../15-paradigms/imperative-vs-declarative.md) | 미들 필수 |

### 관련 토픽 (다른 카테고리)

| 토픽 | 카테고리 |
|---|---|
| [Protocol-Oriented Programming](../01-swift-language/protocol-oriented-programming.md) | Swift Language |
| [Composition over Inheritance](../12-design-patterns/composition-over-inheritance.md) | Design Patterns |
| [Swift Idiomatic Patterns](../12-design-patterns/swift-idiomatic-patterns.md) | Design Patterns |

## 권장 학습 순서

1. **OOP 기반** — 4원칙 + SOLID + Swift class 특징
2. **FP 진입** — 순수 함수 + 불변성 + Optional/Result Monad
3. **비교 + 합성** — OOP vs FP의 직교 분리 + Functional Core Imperative Shell
4. **선언형 모델** — UIKit vs SwiftUI에 패러다임을 매핑

## 예상 소요 시간

- 주니어 깊이: **3~4일** (4원칙 + 순수 함수)
- 미들 깊이: **1주** (트레이드오프 + Monad 직관)
- 시니어 깊이: **2주** (실무 적용 + 패턴 비교 + 답변 흐름)

## 대표 질문

### 주니어
- OOP 4원칙은?
- 순수 함수의 조건?
- 명령형과 선언형 코드의 차이?

### 미들
- SOLID의 D(IP)는 어떻게 적용?
- Optional의 `flatMap`이 `map`과 어떻게 다른가?
- Swift에서 값/참조 + OOP/FP를 어떻게 직교 분리?
- POP가 OOP 상속과 다른 점?
- SwiftUI에서 선언형 사고가 적용된 결과?

### 시니어
- Liskov Substitution 위반 예시 + 모델링 수정?
- Functional Core, Imperative Shell 패턴 + TCA에서의 적용?
- 동시성 안전성에서 FP가 OOP 대비 유리한 이유?
- 선언형 모델의 *숨은 비용*?
- *완전 FP 또는 완전 OOP*가 iOS에서 실용적이지 않은 이유?

## 다음 단계 — 통합 검증

- [ ] *"OOP vs FP 어느 쪽을 선호?"* 질문에 *양자택일 안 함* + 직교 분리로 답변
- [ ] 본인 코드에서 *Functional Core / Imperative Shell* 분리 예시 즉답
- [ ] *SwiftUI vs UIKit*을 패러다임 관점에서 비교
- [ ] Optional/Result를 *Monad 패턴*으로 설명

→ stage 1~6을 모두 마쳤다면 **[/exam](/exam)** 모의고사로 통합 검증. 카테고리 총정리 모의고사 → 전체 모의고사 순서.

## 모듈 확장 가이드

- 패러다임은 *비교* 위주 — 단일 패러다임 옹호는 함정
- *iOS 코드 예제*가 매번 들어가야 함 (UIKit/SwiftUI/Combine/AsyncSequence)
- *왜 Swift가 멀티 패러다임을 선택*한 동기를 항상 연결
