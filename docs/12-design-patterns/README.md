# 12. Design Patterns

iOS 컨텍스트에서의 패턴. *언제 쓰는가*가 답변의 핵심.

## 항목

- [Delegate](delegate.md) — 1:1 통신, weak/AnyObject, Closure/Combine과 비교
- [Singleton](singleton.md) — 정당한 사용처, 안티패턴, DI로 푸는 법
- [Observer](observer.md) — NotificationCenter / KVO / Combine / AsyncSequence
- [Composition over Inheritance](composition-over-inheritance.md) — protocol + struct 합성
- [Factory / Strategy / Builder](factory-strategy-builder.md) — *3년차+*. 객체 생성 / 알고리즘 교체 / 단계별 구성

## 시니어

- [Swift Idiomatic Patterns (Closure vs Delegate vs Combine vs AsyncSequence)](swift-idiomatic-patterns.md) — 선택 기준 + 변환 어댑터

## 관련 (다른 디렉토리)

- Coordinator → [06-architecture/coordinator.md](../06-architecture/coordinator.md)
- Protocol-Oriented Programming → [01-swift-language/protocol-oriented-programming.md](../01-swift-language/protocol-oriented-programming.md)
- 의존성 주입 → [06-architecture/dependency-injection.md](../06-architecture/dependency-injection.md)

## 자주 묻는 질문

- Delegate vs Closure vs Combine 선택 기준 → [delegate.md](delegate.md) + [observer.md](observer.md)
- Singleton의 문제와 대안 → [singleton.md](singleton.md)
- KVO와 Combine 차이 → [observer.md](observer.md)
- NotificationCenter 남용의 위험 → [observer.md](observer.md)
- 상속을 줄이고 합성으로 풀려면 → [composition-over-inheritance.md](composition-over-inheritance.md)
