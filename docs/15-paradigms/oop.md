# Object-Oriented Programming (OOP)

> 한 줄 요약 — *데이터(상태)와 그 데이터를 다루는 함수를 한 단위(객체)에 묶어*, 메시지를 주고받는 모델. 4원칙(캡슐화/상속/다형성/추상화) + SOLID로 *변경에 강한* 구조를 만든다. 단, 무분별한 상속 트리는 *결합도*를 키워 Swift에선 POP/composition을 더 권장한다.

## 4가지 원칙

| 원칙 | 의미 | Swift 표현 |
|---|---|---|
| **캡슐화** (Encapsulation) | 상태를 객체 내부에 숨기고 인터페이스로만 접근 | `private`, `private(set)`, computed property |
| **상속** (Inheritance) | 슈퍼클래스의 멤버/동작을 재사용 | `class B: A` |
| **다형성** (Polymorphism) | 같은 인터페이스가 *타입에 따라 다른 동작* | vtable / protocol witness table |
| **추상화** (Abstraction) | 구현이 아닌 *역할*에 의존 | protocol, abstract class(없음 → protocol 대체) |

## SOLID 원칙

| 약자 | 의미 | iOS 적용 예 |
|---|---|---|
| **S**RP | Single Responsibility — 한 클래스 = 한 책임 | MVVM에서 ViewController는 *조립자*, 비즈니스 로직은 ViewModel |
| **O**CP | Open/Closed — 확장엔 열림, 수정엔 닫힘 | protocol + extension으로 추가 동작 |
| **L**SP | Liskov Substitution — 서브타입은 슈퍼타입을 *대체 가능* | 슈퍼클래스 계약을 위반하는 override 금지 |
| **I**SP | Interface Segregation — 큰 protocol 1개보다 작은 여러 개 | `Equatable`, `Hashable`, `Codable` 분리 |
| **D**IP | Dependency Inversion — 고수준이 저수준 *추상*에 의존 | Repository protocol에 의존, 구현은 주입 |

## Swift class와의 관계

```swift
class Animal {
    var name: String
    init(name: String) { self.name = name }
    func sound() { print("...") }      // 슈퍼 기본
}

class Dog: Animal {
    override func sound() { print("woof") }   // 다형성
}

let pets: [Animal] = [Dog(name: "A"), Animal(name: "B")]
for p in pets { p.sound() }            // vtable 동적 디스패치
```

- `final` 키워드로 상속 차단 시 정적 디스패치
- `private`/`fileprivate`/`internal`/`public`/`open`으로 캡슐화 레벨
- override 가능한 메서드는 `open` 또는 같은 모듈 내 `public`

자세히는 [01-swift-language/method-dispatch.md](../01-swift-language/method-dispatch.md).

## OOP의 강점

- 도메인 모델링이 *자연어와 가깝다* (User, Order, Payment...)
- 상태와 동작을 *같이 다루는* 응집도
- 다형성으로 *확장 가능한* 인터페이스
- UIKit/Foundation 등 *Apple SDK 전반의 모델*

## OOP의 함정

### 1) 깊은 상속 트리

```
UIView
 └─ UIControl
     └─ UIButton
         └─ MyCustomButton
             └─ MyEvenMoreCustomButton    ← 변경 비용 증가
```

깊을수록 *슈퍼클래스 변경의 영향 추적* 어려움. 의존이 수직으로 묶임.

### 2) Fragile Base Class

슈퍼클래스의 메서드를 *내부 호출*에 의존하면, 슈퍼 변경 시 서브가 깨짐. 다형성과 캡슐화의 충돌.

### 3) Diamond Problem

다중 상속 시 같은 슈퍼가 두 경로로 등장. Swift는 *class 다중 상속 금지*로 회피하지만 protocol 다중 채택에서 default 구현 충돌 가능.

### 4) God Class

캡슐화 핑계로 *모든 상태와 동작*을 한 클래스에 박는 안티패턴. Massive View Controller의 원인.

## Swift가 OOP에서 *덜 의존*하게 만든 이유

- **POP (Protocol-Oriented Programming)**: 상속 트리 대신 *작은 protocol 조립*
- **Composition over Inheritance**: has-a 관계 우선
- **값 타입 강조**: struct를 1차 모델링 단위로
- **POP는 상속의 *능력*을 protocol + extension으로 흡수**

자세히는 [01-swift-language/protocol-oriented-programming.md](../01-swift-language/protocol-oriented-programming.md), [12-design-patterns/composition-over-inheritance.md](../12-design-patterns/composition-over-inheritance.md).

## 면접 답변 흐름

*"OOP의 4원칙을 설명하고 Swift에서 어떻게 변형됐나"*:

1. **4원칙 요약** (캡슐화/상속/다형성/추상화) 한 문장씩
2. **Swift는 클래스 + protocol + 값 타입의 하이브리드**
3. **상속을 줄이고 POP/composition을 권장** — 이유: 결합도, 값 타입 지원, 다중 채택
4. **그러나 *정체성/공유 상태/리소스 정리*가 필요하면 여전히 class**
5. **SOLID는 *언어 독립*이라 그대로 적용**, 특히 SRP/DIP가 iOS 아키텍처(MVVM/Clean)의 기반

## 흔한 함정 / Follow-up

- **Q. 상속이 *항상* 나쁜가?**
  아니다. *is-a 관계*가 명확하고 슈퍼 계약을 정확히 따르면 OK. UIKit 상속이 좋은 예. 단 *2~3 level까지*가 권장 깊이.

- **Q. SOLID에서 *가장 많이 위반*되는 원칙은?**
  SRP — 한 클래스에 여러 책임. View + Network + Persistence를 한 곳에. ViewController에서 흔히 발생.

- **Q. abstract class가 Swift에 없는 이유?**
  protocol + extension의 default 구현으로 완전 대체. abstract class는 *상속 강제*인데 Swift는 *protocol 채택*으로 더 유연하게 표현.

- **Q. 다형성 비용?**
  class 메서드 = vtable 1 인디렉션. protocol 요구사항 = witness table 1 인디렉션. 핫패스에선 `final`/특수화로 정적 디스패치 회복.

- **Q. Liskov violation 예시?**
  Rectangle 슈퍼에 Square 서브 — `setWidth`가 자동으로 height도 바꾸면 슈퍼 계약 위반. *상속 관계가 아닌 별개 타입*으로 모델링.

- **Q. ObjC vs Swift의 OOP 차이?**
  ObjC는 *동적 메시지 디스패치* (objc_msgSend) — runtime swizzling 가능. Swift는 *정적 + 제한적 동적* 혼합. KVO 같은 ObjC 기능은 `@objc dynamic` 필요.

## 참고

- *Design Patterns* (Gang of Four)
- *Clean Architecture* (Robert C. Martin)
- WWDC 2015: Protocol-Oriented Programming in Swift
- Apple: The Swift Programming Language → Inheritance, Initialization
