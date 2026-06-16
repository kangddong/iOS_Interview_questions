# KeyPath

> 한 줄 요약 — *프로퍼티 접근*을 일급값으로 표현하는 타입. `\Type.path` 표기로 만들고, 함수 인자/Combine/SwiftUI/UIKit binding 어디서나 재사용된다.

## 종류

| 타입 | 의미 |
|---|---|
| `KeyPath<Root, Value>` | 읽기 전용 |
| `WritableKeyPath<Root, Value>` | 값 타입의 쓰기 가능 |
| `ReferenceWritableKeyPath<Root, Value>` | 참조 타입의 쓰기 가능 (Root가 let이어도 OK) |
| `PartialKeyPath<Root>` | Value 타입을 모름 |
| `AnyKeyPath` | Root, Value 모두 모름 |

## 기본 사용

```swift
struct User { var name: String; var age: Int }

let nameKP: WritableKeyPath<User, String> = \User.name

var u = User(name: "A", age: 20)
let n = u[keyPath: nameKP]      // "A"
u[keyPath: nameKP] = "B"        // 쓰기

// 함수 자리 sugar
let users = [User(name: "B", age: 1), User(name: "A", age: 2)]
let names = users.map(\.name)             // ["B", "A"]
let sorted = users.sorted(by: { $0.name < $1.name })
```

## 활용 패턴

### SwiftUI Binding

```swift
@Bindable var user: User
TextField("name", text: $user.name)   // KeyPath 기반 동적 멤버 lookup
```

### Combine

```swift
Just(User(name: "A", age: 1))
    .map(\.name)
    .sink { print($0) }
```

### UIKit `bind`/KVO

```swift
let obs = user.observe(\.name, options: [.new]) { _, change in ... }
```

### Dynamic Member Lookup과 결합

```swift
@dynamicMemberLookup
struct Wrapper<T> {
    let inner: T
    subscript<U>(dynamicMember kp: KeyPath<T, U>) -> U { inner[keyPath: kp] }
}
```

## 흔한 함정 / Follow-up

- **Q. `\.foo` 단축 표기가 가능한 조건?**
  컴파일러가 Root 타입을 추론할 수 있을 때(예: `.map(\.foo)`). 모호하면 `\Type.foo` 명시.

- **Q. KeyPath는 런타임 비용이 있나?**
  생성된 KeyPath 객체 자체는 한 번 만들어지고 캐시됨. 접근은 간접 호출 한 번 정도. 핫 루프에선 직접 접근 대비 약간 느림.

- **Q. `WritableKeyPath` vs `ReferenceWritableKeyPath`?**
  값 타입은 *root이 var*여야 쓰기 가능 → WritableKeyPath. 참조 타입은 root이 let이어도 인스턴스 내부를 변경할 수 있으므로 별도 타입.

- **Q. Computed property에 KeyPath 가능?**
  가능. read-only면 KeyPath, get/set 다 있으면 WritableKeyPath.

- **Q. KeyPath는 ObjC `keyPath` 문자열과 같은가?**
  의미는 비슷하지만 Swift의 KeyPath는 *타입 안전*. 컴파일 타임 검증 + 자동완성 + 리팩터링 안전.

## 참고

- Swift Language Guide: KeyPath Expressions
- SE-0161 (Smart KeyPaths)
