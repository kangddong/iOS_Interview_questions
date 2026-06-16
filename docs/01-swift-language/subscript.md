# Subscript

> 한 줄 요약 — `[]` 문법으로 *인덱스/키 접근*을 정의하는 멤버. 메서드와 프로퍼티의 *중간* 성격. 제네릭, 다중 파라미터, `static`, `set` 동시 정의가 가능하고 `@dynamicMemberLookup`/KeyPath와 결합해 메타프로그래밍의 핵심 도구가 된다.

## 기본 정의

```swift
struct Matrix {
    private var rows: [[Double]]
    let r: Int; let c: Int

    init(_ r: Int, _ c: Int) {
        self.r = r; self.c = c
        rows = Array(repeating: Array(repeating: 0, count: c), count: r)
    }

    subscript(i: Int, j: Int) -> Double {
        get {
            precondition(i < r && j < c, "out of bounds")
            return rows[i][j]
        }
        set {
            precondition(i < r && j < c, "out of bounds")
            rows[i][j] = newValue
        }
    }
}

var m = Matrix(2, 3)
m[0, 1] = 9.0
print(m[0, 1])     // 9.0
```

## Generic Subscript

```swift
extension Dictionary {
    subscript<T>(key: Key, as type: T.Type) -> T? {
        self[key] as? T
    }
}

let info: [String: Any] = ["count": 42]
let n = info["count", as: Int.self]    // Int?
```

## Read-Only Subscript

```swift
subscript(index: Int) -> Element { rows[index] }   // get만, 키워드 생략
```

## Static Subscript (Swift 5.1+)

```swift
enum Config {
    static var values: [String: Any] = [:]
    static subscript(key: String) -> Any? {
        get { values[key] }
        set { values[key] = newValue }
    }
}

Config["theme"] = "dark"
```

## Subscript와 KeyPath

KeyPath는 *프로퍼티 접근*만 표현. subscript는 KeyPath 직접 표현은 불가하지만, `@dynamicMemberLookup`과 결합하면 우회 가능:

```swift
@dynamicMemberLookup
struct Box<T> {
    let inner: T
    subscript<U>(dynamicMember kp: KeyPath<T, U>) -> U {
        inner[keyPath: kp]
    }
}

struct User { var name: String; var age: Int }
let box = Box(inner: User(name: "A", age: 20))
box.name          // "A"  ← dynamicMemberLookup이 KeyPath 통해 inner.name
```

## `@dynamicMemberLookup` + Subscript

```swift
@dynamicMemberLookup
struct JSON {
    let raw: [String: Any]
    subscript(dynamicMember key: String) -> JSON? {
        guard let v = raw[key] as? [String: Any] else { return nil }
        return JSON(raw: v)
    }
}

let j = JSON(raw: ["user": ["name": "A"]])
j.user?.name      // 컴파일러가 string subscript로 해석
```

SwiftUI `@Bindable`, TCA의 store scope, KeyPath-driven DSL이 이 구조 기반.

## String이 정수 subscript를 안 받는 이유

```swift
let s = "café"
s[1]                                  // ❌ 컴파일 에러
s[s.index(s.startIndex, offsetBy: 1)] // ✅
```

→ 정수 인덱싱이 O(1) 거짓말을 만들기 때문. 자세히는 [string-and-unicode.md](string-and-unicode.md).

## 흔한 함정 / Follow-up

- **Q. `[Int]`의 subscript는 trap을 발생시키는가?**
  Yes. 범위 초과 시 `Fatal error: Index out of range`. 안전한 접근은 `arr.indices.contains(i)` 또는 `arr.first`/`last`/`dropFirst`.

- **Q. `Dictionary` subscript는 왜 옵셔널 반환?**
  키 부재가 *값으로* 나와야 하므로 (`Value?`). default 값을 주려면 `dict[key, default: 0]`.

- **Q. subscript에 throws 가능?**
  Swift 6 미만에선 불가. *property accessor*도 throws/async 불가. 워크어라운드: 일반 메서드로 분리.

- **Q. subscript는 정적 디스패치인가?**
  struct/final class면 정적. 일반 class에선 vtable. protocol requirement면 witness table. 즉 다른 멤버와 동일한 디스패치 규칙.

- **Q. subscript에 `inout` 파라미터는?**
  파라미터는 일반 값. 단, `_modify` accessor를 정의하면 in-place 접근 효율화 가능 (Swift 5.0+, 비공개 SPI).

- **Q. subscript와 method의 차이?**
  의미만 다름. *인덱스/키 접근*이라는 의도 표현. 함수형으로 같은 일 가능하지만 호출 사이트의 가독성이 다름.

## 참고

- Swift Language Guide: Subscripts
- SE-0252 Dynamic member lookup with key paths
