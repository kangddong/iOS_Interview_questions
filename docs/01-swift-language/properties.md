# Properties (stored / computed / lazy / observers / wrapper)

> 한 줄 요약 — 프로퍼티는 *값을 저장*하거나 *값을 계산*해 노출하는 멤버. 추가로 `lazy`(지연 초기화), 옵저버(`willSet`/`didSet`), `@propertyWrapper`(횡단 관심사 캡슐화)로 확장된다.

## 종류

### Stored

```swift
struct User { var name: String; let id: Int }   // var/let
```

- struct/class에서 사용. enum은 stored property 불가 (case 자체가 값)
- `let` stored는 한 번만 할당

### Computed

```swift
struct Rect {
    var w: Double; var h: Double
    var area: Double {
        get { w * h }
        set { w = sqrt(newValue); h = sqrt(newValue) }
    }
}
```

- 저장 공간 없음. get/set만 정의
- read-only면 `get` 키워드 생략 가능
- enum에서도 사용 가능

### Lazy

```swift
class Heavy { lazy var loader = makeLoader() }
```

- 첫 접근 시 초기화. 그 전에는 메모리 점유 X
- **`lazy`는 thread-safe하지 않다** — 동시에 첫 접근 시 두 번 초기화될 수 있음
- 반드시 `var` (값이 나중에 설정되므로)

### Type Property (static / class)

```swift
struct API { static let baseURL = URL(...)! }
class V { class var override: Int { 0 } }   // class은 subclass에서 override 가능
```

## Property Observer

```swift
class Counter {
    var n: Int = 0 {
        willSet { print("will: \(n) -> \(newValue)") }
        didSet  { print("did:  \(oldValue) -> \(n)") }
    }
}
```

- stored property에만 사용 (computed는 set 안에서 직접 처리)
- 초기화 중에는 호출되지 않음

## Property Wrapper

```swift
@propertyWrapper
struct Clamped<T: Comparable> {
    var value: T; let range: ClosedRange<T>
    var wrappedValue: T {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }
    init(wrappedValue: T, _ range: ClosedRange<T>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
}

struct Player {
    @Clamped(0...100) var hp: Int = 50
}
```

- *get/set 로직 + 저장 영역*을 하나의 타입으로 묶어 횡단 관심사 캡슐화
- `projectedValue` (`$prop`)로 부가 정보 노출 (예: `Binding`)
- 대표 예: `@Published`, `@State`, `@Binding`, `@AppStorage`

## 비교

| 종류 | 저장 공간 | get/set 커스텀 | observer 가능 | enum 사용 |
|---|---|---|---|---|
| stored | O | X | O | X |
| computed | X | O | X | O |
| lazy | O (지연) | X | X | X |
| type (static) | O | 가능 | 가능 | O |

## 흔한 함정 / Follow-up

- **Q. computed property에 영향 없는 변수에 didSet 걸기?**
  observer는 stored에만. computed는 set 안에서 직접 처리.

- **Q. 초기화 시 didSet이 안 불리는 이유?**
  init은 *값을 처음 부여*하는 단계라 변경이 아님. 의도적으로 호출하려면 별도 메서드.

- **Q. lazy가 thread-safe 하려면?**
  `DispatchQueue` 동기화, `NSLock`, 또는 `static let` (Swift는 static let만 thread-safe 보장).

- **Q. Property wrapper와 `@State`의 관계?**
  `@State`는 SwiftUI가 제공하는 property wrapper. wrappedValue는 현재 값, projectedValue(`$value`)는 `Binding`.

- **Q. didSet에서 자기 자신 변경하면 무한 루프?**
  observer 안에서 같은 프로퍼티에 새 값을 할당해도 *재귀적으로 didSet이 다시 호출되지는 않는다* (Swift 컴파일러가 한 번만 호출).

## 참고

- Swift Language Guide: Properties
- SE-0258 Property Wrappers
