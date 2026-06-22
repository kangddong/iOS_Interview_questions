# 15. Programming Paradigms (OOP / FP / 명령형 / 선언형)

> 한 줄 요약 — Swift는 **멀티 패러다임**. OOP(class), FP(map/filter/reduce, 순수 함수), POP(protocol + value type), 선언형(SwiftUI/Result Builder) 을 *상황별로* 고른다. 면접의 본체는 *왜 이 상황엔 이 패러다임인가*.

iOS 면접에서 *왜 SwiftUI는 선언형인가*, *왜 Swift는 POP을 권장하는가* 같은 질문은 **프로그래밍 패러다임**에 대한 이해를 묻는 것. 단일 패러다임에 매몰되지 않고 *언제 무엇을 고르는가*가 시니어 변별 포인트.

## 패러다임 축 비교

| 패러다임 | 핵심 단위 | 상태 | 다형성 | iOS 사례 |
| --- | --- | --- | --- | --- |
| **명령형** | 문장 (statement) | 가변 | 함수 오버로딩 | UIKit, for 루프 |
| **선언형** | 식 (expression) | 불변 선호 | 패턴 | SwiftUI, Auto Layout DSL |
| **OOP** | 클래스 + 인스턴스 | 가변 (캡슐화) | 상속·다형성 | UIKit 클래스 계층 |
| **FP** | 함수 | **불변** | 고차 함수 | `map`/`filter`/`reduce`, Combine |
| **POP** | 프로토콜 + 값 타입 | 불변 선호 | 프로토콜 합성 | Swift 표준 라이브러리, SwiftUI Modifier |

## 핵심 개념 4선

### 1. 명령형 vs 선언형 — *how vs what*
- **명령형**: "이것을 *어떻게* 하라" — 단계별 명령. UIKit: `tableView.reloadData()`, `cell.label.text = ...`.
- **선언형**: "결과가 *무엇이어야* 하라" — 상태 → 결과 매핑. SwiftUI: `Text(model.title)`.
- 선언형의 장점: 상태와 UI 불일치 제거, 합성 가능. 비용: 프레임워크 학습 + 디버깅 (선언이 결과가 됨).

### 2. OOP — 캡슐화·상속·다형성·추상화
- **캡슐화**: 데이터 + 그 데이터를 다루는 함수를 한 단위로. `private`로 외부 차단.
- **상속**: 코드 재사용. 단점 — *강결합*, 컴파일 시 고정. Swift는 *합성 우선* 권장.
- **다형성**: 같은 인터페이스, 다른 구현. 프로토콜로도 표현 가능 (POP).
- **SOLID**: 단일 책임 / 개방-폐쇄 / 리스코프 치환 / 인터페이스 분리 / 의존성 역전.

### 3. FP — 순수 함수·불변성·고차 함수
- **순수 함수**: 같은 입력 → 같은 출력, 부수효과 없음. 테스트 결정적, 캐싱 가능.
- **불변성**: 한 번 만든 값을 안 바꿈 — 동시성 안전 (Sendable의 정신).
- **고차 함수**: 함수를 인자/반환으로. `map`/`filter`/`reduce`/`flatMap`.
- **Monad의 직관**: `Optional` / `Result` 는 *문맥을 담은 값* + flatMap으로 체이닝. 어떤 단계든 실패하면 전파.

### 4. POP — Swift만의 답
- 클래스 상속의 한계 (단일 상속, ABI 제약) → *프로토콜 합성*으로 풂.
- **프로토콜 + 기본 구현 (extension)** 으로 코드 재사용.
- **값 타입 + 프로토콜** = 동시성 친화 + 다형성 둘 다.
- `some` / `any` 로 컴파일 시 / 런타임 비용 분리.

## 패러다임을 *언제* 고르는가

```
상태 변경이 핵심        → OOP (class)
변환 파이프라인         → FP (map/filter/reduce)
명확한 UI 흐름          → 선언형 (SwiftUI)
값 + 다형성             → POP (protocol + struct)
복잡한 단계별 절차       → 명령형 (algorithm 구현)
```

→ "왜 Swift는 POP을 미는가?" → ARC 비용 절감 + 동시성 안전 + 컴파일 specialization. "왜 SwiftUI는 선언형인가?" → 상태-UI 불일치 버그 제거 + 합성 가능성.

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
