# Type Casting (`is` / `as` / `as?` / `as!`, `Any`, `AnyObject`)

> 한 줄 요약 — Swift 다운캐스트는 *런타임 검증*을 동반하므로 비용이 있다. `is`로 검사, `as?`로 안전 캐스트, `as!`로 강제(실패 시 trap), 그리고 **`as`(같은/업캐스트)**는 0 비용 *컴파일 타임 변환*. `Any`/`AnyObject`는 *모든 타입을 담는 박스*이며 existential container 비용을 동반한다.

## 5가지 캐스트

| 표현 | 의미 | 비용 |
|---|---|---|
| `x as T` | 업캐스트 / Bridging | 컴파일 타임, 0 |
| `x is T` | 타입 검사 | 런타임, witness table lookup |
| `x as? T` | 안전 다운캐스트, 실패 시 nil | 런타임 |
| `x as! T` | 강제 다운캐스트, 실패 시 trap | 런타임 + 추가 검증 비용 |
| `x as Any` / `as T?` | 일반 변환 | 케이스 따라 0 또는 박싱 |

## `as` (업캐스트)

```swift
let s: String = "hello"
let a: Any = s              // 업캐스트, 0 비용 (existential 박싱은 발생)
let opt: Int? = 5
let any: Any = opt          // Int? → Any
```

## `is` / `as?` / `as!`

```swift
func describe(_ x: Any) {
    if x is String { print("string") }

    if let n = x as? Int { print("int \(n)") }

    let forced = x as! Double            // 실패 시 크래시
    print(forced)
}
```

`as!`는 *절대 nil이 아님을 보장*할 때만. 가장 흔한 크래시 원인 중 하나.

## `Any` vs `AnyObject`

| 구분 | `Any` | `AnyObject` |
|---|---|---|
| 담을 수 있는 것 | 모든 타입 (값/참조/함수/옵셔널) | class 인스턴스만 (or @objc 호환) |
| 내부 표현 | Existential container | Class reference |
| 비용 | 박싱(작으면 inline), 메타 정보 보관 | 단순 포인터 |
| 디스패치 | 다운캐스트 후 메서드 호출 | ObjC 메시지 디스패치 가능 |
| 용도 | 최후 보루, 일반 컨테이너 | UIKit/Foundation 인터롭 |

```swift
let any: Any = 42                    // Int 박싱
let obj: AnyObject = NSObject()      // 참조만
let mixed: [Any] = [1, "a", 1.0]     // 이종 컨테이너
```

## Existential Container 비용

`Any`, `any P` 같은 *existential* 타입은 다음을 담는 16~32바이트 구조:

```
+--------------------------+
| Inline buffer (3 words)  | 작은 값은 여기 inline
| Witness Table pointer    | 프로토콜 메서드 디스패치
| Metadata pointer         | 타입 정보 (size, align, dtor)
+--------------------------+
```

- **Inline buffer 한도**: 3 words (24바이트 on 64bit). 초과 시 heap 박스 할당
- **다운캐스트**: 메타데이터의 *type identity* 비교 → 일치하면 inline buffer/heap에서 꺼냄
- **호출**: witness table을 통한 간접 호출 (vtable 비슷)

핫패스에서 `Any`/`any P` 다수 다운캐스트는 측정 가능하게 느려진다. 제네릭으로 *특수화*시키면 0 비용.

## Bridged Casts (Foundation)

Swift ↔ ObjC 인터롭에서 `as` 캐스트가 *실제 메모리 복사*를 동반할 수 있음:

```swift
let s = "hello"
let ns = s as NSString          // bridged, lazy. 실제 복사는 mutating 직전에
let arr = [1,2,3]
let nsArr = arr as NSArray      // bridged, 즉시 NSArray 생성 가능
```

성능 핫패스에선 Foundation 타입을 직접 사용해 bridging 피하기.

## `as` 캐스트의 컴파일러 분류

```swift
let n = 5
let d = n as Double          // ❌ 컴파일 에러 — Int는 Double로 implicit 변환 불가
let d2 = Double(n)           // ✅ 명시적 init
```

`as`는 *타입 관계*가 있을 때만 (서브타입/슈퍼타입/브리지). 일반 변환은 `Type(value)`.

```swift
let opt: Int? = 5
let unwrapped = opt as Int   // ❌ — Optional은 Int의 슈퍼타입이 아님
let any: Any = opt as Any    // ✅
```

## 흔한 함정 / Follow-up

- **Q. `as?`의 비용은?**
  메타데이터 비교 + (성공 시) 박싱/언박싱. 작은 값일수록 빠름. `[Any] → [Int]` 같은 컬렉션 캐스트는 *원소별* 검사 + 새 배열 할당.

- **Q. `as!` 실패 시 메시지?**
  `Could not cast value of type 'X' to 'Y'`. 디버깅 어려움. 안전하게는 `guard let` 패턴.

- **Q. `Any`에서 nil을 검사하려면?**
  `if case Optional<Any>.none = x { print("nil") }` 또는 `x as? Optional<Any> == .some(nil)`. `Any`에 nil을 담을 때 *옵셔널 박싱*이 두 번 일어나는 함정 주의.

- **Q. `as AnyObject`로 struct를 캐스트하면?**
  Swift 4+에선 자동으로 **__SwiftValue 박스**로 감싸 ObjC 런타임에 노출. 비용 큼.

- **Q. `as` vs `Type(...)`?**
  `as`는 *형변환 없는 view*. `Type(value)`는 *새 인스턴스 생성*. 의미가 다름.

- **Q. 제네릭 `T` 안에서 `as T` 가능?**
  타입 매개변수 자체로 다운캐스트는 가능하지만, 컴파일러가 그 비용을 인지하지 못해 의도치 않은 비용 발생 가능. 가능한 특수화로 풀라.

- **Q. `Mirror`와 type casting의 관계?**
  `Mirror`는 *런타임 reflection*. type casting과 다르지만 같은 metadata에 접근.

## 참고

- Swift Language Guide: Type Casting
- WWDC 2016: Understanding Swift Performance (existential 비용)
- swift-evolution: SE-0335 (any keyword)
