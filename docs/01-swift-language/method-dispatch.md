# Method Dispatch

> 한 줄 요약 — Swift는 *선언 위치/타입 종류/속성*에 따라 메서드 호출 방식을 4가지 중 하나로 결정한다. 이걸 알면 *왜 어떤 함수가 override 안 되는지*, *왜 final이 성능에 영향을 주는지* 답이 된다.

## 4가지 디스패치

| 종류 | 비용 | 사용 위치 |
|---|---|---|
| Static (direct) | 0, 인라인 가능 | struct/enum 메서드, `final` class, 프로토콜 익스텐션의 비요구사항 |
| Virtual table (vtable) | 1번 간접 호출 | 일반 class 메서드 (override 가능한 것) |
| Witness table | 1번 간접 호출 | 프로토콜 *요구사항* 메서드 |
| Message (`objc_msgSend`) | 가장 비쌈 | `@objc dynamic`, NSObject 자식의 `dynamic` |

## 결정 규칙

```
선언이 struct/enum?           → static
class인데 final/private?      → static
프로토콜 요구사항?             → witness
프로토콜 익스텐션 + 비요구사항?  → static (변수의 컴파일 타임 타입 따라감)
@objc dynamic / NSObject?     → message
그 외 class 메서드?            → vtable
```

## 코드로 확인

```swift
class Animal { func sound() { print("...") } }
class Dog: Animal { override func sound() { print("woof") } }

let a: Animal = Dog()
a.sound()   // "woof"  ← vtable 동적 디스패치

protocol P { func a() }
extension P {
    func a() { print("ext a") }
    func b() { print("ext b") }   // 요구사항 아님 → 정적
}
struct S: P {
    func a() { print("S a") }
    func b() { print("S b") }
}
let p: P = S()
p.a()  // "S a"   (witness)
p.b()  // "ext b" (정적, 변수 타입 P 기준)
```

## 성능 시사점

- **`final`** 또는 **`private`**: 컴파일러가 정적 디스패치로 낙인 → 인라이닝 가능 → 핫패스에서 의미 있음
- **whole module optimization**: 컴파일러가 모듈 전체를 보고 *override 없음을 증명*하면 자동으로 정적 호출로 변환 (devirtualization)
- 프로토콜 메서드 호출은 witness table 통한 간접 호출. 빈번한 호출이면 제네릭 특수화로 정적화하는 게 빠름

## 흔한 함정 / Follow-up

- **Q. 프로토콜 익스텐션에서 정의한 메서드를 채택 타입이 같은 시그니처로 구현하면?**
  *override가 아니라 shadowing*. 변수의 컴파일 타임 타입에 따라 다른 게 호출됨 ([POP 문서](protocol-oriented-programming.md) 참고). 헷갈리면 프로토콜 요구사항으로 끌어올려라.

- **Q. KVO를 쓰려면 왜 `@objc dynamic`이 필요한가?**
  KVO는 ObjC 런타임의 method swizzling 기반. `dynamic`은 메시지 디스패치를 강제 → swizzling 가능.

- **Q. SwiftUI에서 final 안 써도 빠른 이유?**
  대부분 struct(정적 디스패치) + result builder. class가 거의 없음.

- **Q. extension으로 class 메서드 override 가능?**
  같은 모듈에서 *재정의*는 가능. 다른 모듈에서 stored override나 디자이너 의도 외 override는 막힘. extension에서 새 final 메서드 추가는 OK.

## 참고

- WWDC 2016: Understanding Swift Performance
- Apple: Increasing Performance by Reducing Dynamic Dispatch
