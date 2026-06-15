# 15. Programming Paradigms (OOP / FP / 명령형 / 선언형)

iOS 면접에서 *왜 SwiftUI는 선언형인가*, *왜 Swift는 POP을 권장하는가* 같은 질문은 **프로그래밍 패러다임**에 대한 이해를 묻는 것. 단일 패러다임에 매몰되지 않고 *언제 무엇을 고르는가*가 시니어 변별 포인트.

## 항목

- [Object-Oriented Programming (OOP)](oop.md) — 4 원칙, SOLID, class와의 관계, 한계
- [Functional Programming (FP)](fp.md) — 순수 함수, 불변성, 고차 함수, Monad 직관
- [OOP vs FP](oop-vs-fp.md) — 상태 관리 철학, 재사용 방식, Swift의 하이브리드
- [명령형 vs 선언형](imperative-vs-declarative.md) — UIKit vs SwiftUI, what vs how

## 관련 (다른 디렉토리)

- Protocol-Oriented Programming → [01-swift-language/protocol-oriented-programming.md](../01-swift-language/protocol-oriented-programming.md)
- Composition over Inheritance → [12-design-patterns/composition-over-inheritance.md](../12-design-patterns/composition-over-inheritance.md)
- Swift Idiomatic Patterns → [12-design-patterns/swift-idiomatic-patterns.md](../12-design-patterns/swift-idiomatic-patterns.md)

## 자주 묻는 질문

- OOP의 4가지 원칙은? → [oop.md](oop.md)
- SOLID 원칙을 iOS에서 어떻게 적용? → [oop.md](oop.md)
- 순수 함수가 왜 중요? → [fp.md](fp.md)
- Optional/Result는 사실 Monad인가? → [fp.md](fp.md)
- 클래스 상속 대신 합성을 권장하는 이유 → [oop-vs-fp.md](oop-vs-fp.md) + [composition-over-inheritance](../12-design-patterns/composition-over-inheritance.md)
- SwiftUI는 왜 선언형으로 설계됐나? → [imperative-vs-declarative.md](imperative-vs-declarative.md)
- 명령형 코드를 선언형으로 옮길 때 트레이드오프 → [imperative-vs-declarative.md](imperative-vs-declarative.md)
