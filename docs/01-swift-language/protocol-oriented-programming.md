# Protocol-Oriented Programming (POP)

> 한 줄 요약 — *클래스 상속 대신 프로토콜 + 익스텐션*으로 동작을 구성한다. 값 타입에서도 다형성을 얻고, 횡적인 능력 조립이 가능해진다.

## 핵심 원칙

1. *Protocol first* — 인터페이스를 먼저 정의
2. *익스텐션으로 기본 구현* — 디폴트 동작 제공
3. *값 타입 활용* — 상속 트리를 만들지 않음
4. *Composition over inheritance* — 작은 프로토콜을 조립

## 코드

```swift
protocol Identifiable { var id: String { get } }
protocol Named        { var name: String { get } }

extension Named {
    func greet() -> String { "Hello, \(name)" }   // default 구현
}

struct User: Identifiable, Named {
    let id: String
    let name: String
}

User(id: "1", name: "A").greet()  // "Hello, A"
```

## 클래스 상속 vs POP

| 측면 | 클래스 상속 | POP |
|---|---|---|
| 다형성 | vtable | witness table |
| 다중 확장 | 단일 상속만 | 여러 프로토콜 채택 |
| 값 타입 | 불가 | 가능 |
| 디폴트 동작 | superclass 메서드 | extension 메서드 |
| 결합도 | 높음 (수직) | 낮음 (수평) |

## 정적 vs 동적 디스패치

- 프로토콜 *요구사항*: witness table 통한 동적 디스패치
- 프로토콜 *익스텐션의 비요구사항 메서드*: 정적 디스패치 (overriding 안 됨!)

```swift
protocol P { func a() }
extension P {
    func a() { print("ext a") }
    func b() { print("ext b") }   // 요구사항 아님
}

struct S: P {
    func a() { print("S a") }
    func b() { print("S b") }     // 요구사항 아니라 override가 아니라 shadowing
}

let p: P = S()
p.a()  // "S a"   ← witness 통해 동적 디스패치
p.b()  // "ext b" ← 정적 디스패치, P로 보이는 시점의 타입 따라감
```

## 흔한 함정 / Follow-up

- **Q. POP가 만능인가?**
  아니다. 정체성/공유 상태/자원 정리(`deinit`)가 필요하면 class가 자연스러움. UIKit/Cocoa는 여전히 클래스 기반.

- **Q. 익스텐션 메서드의 shadowing 함정?**
  요구사항이 아닌 메서드는 동적 디스패치되지 않으므로, 변수의 *컴파일 타임 타입*에 따라 다른 구현이 호출됨 → 위 코드의 `b()`. 헷갈리면 프로토콜 요구사항으로 끌어올려라.

- **Q. associated type이 있으면 어떤 제약?**
  PAT 프로토콜은 일반 타입처럼 못 쓰고 `some`/`any` 또는 제네릭 제약으로 사용 ([generics-and-pat.md](generics-and-pat.md)).

- **Q. 프로토콜 컴포지션 (`P & Q`)?**
  여러 프로토콜을 동시에 만족해야 하는 타입을 표현. 함수 시그니처에 자주 사용.

## 참고

- WWDC 2015: Protocol-Oriented Programming in Swift
- Apple: Protocols (Swift Language Guide)
