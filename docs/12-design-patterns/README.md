# 12. Design Patterns

> 한 줄 요약 — iOS에서 자주 쓰는 패턴은 **통신 패턴(Delegate/Closure/Combine/AsyncSequence)** 과 **객체 협력 패턴(Composition/Factory/Strategy/Observer)** 두 축. *왜 이 상황엔 이 패턴인가*를 트레이드오프로 설명하는 게 면접 답변.

iOS 컨텍스트에서의 패턴. *언제 쓰는가*가 답변의 핵심.

## 통신 패턴 4종 비교

| 방식 | 카디널리티 | 흐름 | 적합 |
| --- | --- | --- | --- |
| **Delegate** | 1:1 | pull (요청형) + push | 명확한 역할, 강한 계약, 양방향 협상 (`UITableViewDelegate`) |
| **Closure** | 1:1 | push, 1회성 | 결과 콜백, 짧은 비동기 |
| **Notification** | N:N | push, 익명 | 글로벌 이벤트 (앱 백그라운드, 메모리 워닝) |
| **Combine / AsyncSequence** | 1:N | 스트림 | 시간 흐름의 값, backpressure, 합성 가능 |

→ Delegate vs Closure vs Combine 선택 단골 질문: *요청 횟수 / 양방향 여부 / 합성 필요성*으로 답.

## 핵심 개념 5선

### 1. Delegate
- 객체 A가 B에게 *어떤 일을 해도 되는지/했을 때 알림을 받을지* 위임.
- **반드시 weak** — A가 B를 strong으로 잡으면 사이클.
- protocol + AnyObject (class only) 제약으로 weak 강제.
- Apple API의 기본 패턴. 명확한 계약, IDE 자동완성, debugger 트레이스 쉬움.

### 2. Singleton — 정당한가?
- 전역 상태는 *테스트 어려움 + 숨은 의존*. 대부분 안티패턴.
- 정당한 경우: 시스템이 *하나만 존재해야 하는* 자원 (`UIApplication.shared`, `NotificationCenter.default`, `URLSession.shared`).
- 안티패턴 변환: **추상 + 주입** — `AnalyticsService` 프로토콜 + 생성자 주입. 기본 인스턴스만 싱글톤.

### 3. Observer 계열의 진화
- **NSNotificationCenter**: ObjC 시절 N:N. 타입 안전성 약함, 글로벌 상태.
- **KVO**: ObjC runtime의 isa-swizzling. NSObject 전용, 깨지기 쉬움.
- **Combine** (iOS 13+): Publisher/Subscriber, 합성, backpressure 처리. SwiftUI와 한 시대.
- **AsyncSequence** (Swift 5.5+): for-await 문법, 구조적 동시성과 일관.
- 현 시점 권장: SwiftUI 데이터는 `@Observable`, 비동기 스트림은 AsyncSequence.

### 4. Composition over Inheritance
- 상속은 *컴파일 시점에 고정되는 강한 결합*. 변경 시 영향 큼.
- 합성: protocol + struct 조각으로 행동 조립. Swift의 POP 정신.
- "is-a (상속) vs has-a (합성)" — 대부분 has-a가 안전.

### 5. Factory / Strategy / Builder
- **Factory**: 생성 책임 분리 (URLSessionConfiguration, ViewController 조립). DI 컨테이너의 기본.
- **Strategy**: 알고리즘을 *프로토콜로* 추상 → 런타임에 교체. 정렬, 인증 방식, 캐시 정책.
- **Builder**: 단계별 옵션이 많을 때 (`NSDecimalNumberHandler`). SwiftUI의 modifier 체이닝이 사실상 builder.

## 패턴을 *왜* 쓰는가

```
변경이 잦은 코드     → 추상화 (protocol)
교체가 필요한 의존    → DI + Factory
일대다 알림          → Observer (Combine / AsyncSequence)
일대일 명확 계약     → Delegate / Closure
객체 협력 복잡       → Coordinator + UseCase 분리
상태 + 시간 의존     → 단방향 (TCA) 또는 @Observable
```

→ 패턴을 *외우는 것*보다 *왜 도입하는지* (변경 영향 / 테스트성 / 가독성) 를 설명해야 시니어 답변.

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
