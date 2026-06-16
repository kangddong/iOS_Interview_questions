# Initialization (designated / convenience / required / failable / 2-phase)

> 한 줄 요약 — Swift는 모든 stored property를 *초기화 완료* 시점까지 강제하기 위해 **2단계 초기화(2-phase init)**를 한다. designated init이 모든 stored를 채우면, convenience init이 designated를 *반드시 호출*한다.

## struct vs class init

```swift
struct Point {
    var x: Double; var y: Double
    // 멤버와이즈 init 자동 합성 (모든 stored가 internal 이상일 때)
}
let p = Point(x: 1, y: 2)

class Node {
    let id: String
    var next: Node?
    init(id: String) {                  // designated
        self.id = id
        // self.next는 옵셔널 → 기본 nil
    }
}
```

- **struct**는 모든 stored가 기본값을 가지면 *기본 init도 자동 합성*
- **class**는 자동 합성 없음. 모든 stored를 init에서 채워야 함

## 2-Phase Initialization

```
Phase 1
  designated init이 자기 클래스의 stored를 *전부* 초기화
  super.init() 호출 — 슈퍼클래스 designated init이 슈퍼의 stored를 초기화
  (위로 끝까지 — root까지)

Phase 2
  슈퍼 → 자신 순서로, self를 사용한 추가 커스터마이즈
  (이때부터 self의 메서드/computed property 호출 가능)
```

규칙:
1. designated init은 슈퍼 designated init *호출 전에* 자기 stored를 다 채워야 함
2. *상속받은* property는 슈퍼 init *호출 후*에야 수정 가능
3. convenience init은 *결국* 같은 클래스의 designated init을 호출해야 함

## Initializer 종류

| 종류 | 역할 | 키워드 |
|---|---|---|
| Designated | "주" 초기화. 모든 stored 책임 | `init(...)` |
| Convenience | designated에 위임하는 *편의* init | `convenience init(...)` |
| Required | 서브클래스가 *반드시* 구현 (또는 자동 상속) | `required init(...)` |
| Failable | nil 반환 가능 | `init?(...)` 또는 `init!(...)` |
| Throwing | throw 가능 | `init(...) throws` |

## Convenience Init 위임 규칙

```
Convenience init 
  → 같은 클래스의 다른 init (convenience 또는 designated)
  → ... 최종적으로 designated init 도달
  → designated가 super designated 호출
```

```swift
class Loader {
    let url: URL
    let timeout: TimeInterval

    init(url: URL, timeout: TimeInterval) {       // designated
        self.url = url
        self.timeout = timeout
    }

    convenience init(url: URL) {                  // convenience
        self.init(url: url, timeout: 30)
    }
}
```

## Failable & Throwing

```swift
struct Version {
    let major: Int; let minor: Int
    init?(string: String) {
        let parts = string.split(separator: ".").compactMap { Int($0) }
        guard parts.count == 2 else { return nil }
        major = parts[0]; minor = parts[1]
    }
}

enum DecodeError: Error { case invalid }
struct User {
    let name: String
    init(json: [String: Any]) throws {
        guard let n = json["name"] as? String else { throw DecodeError.invalid }
        name = n
    }
}
```

선택 기준:
- *왜* 실패했는지 호출자가 알아야 하면 `throws`
- 단순 *값 없음* 한 가지 의미면 `init?`

## Required & 상속 규칙

```swift
class A {
    required init() { }
}
class B: A {
    required init() {                            // 다시 명시 (자동 상속이 아닐 때)
        super.init()
    }
}
```

상속 시 init 자동 상속 규칙:
1. 서브클래스가 *어떤 designated init도 추가하지 않으면* → 슈퍼의 designated/convenience 전부 자동 상속
2. 서브클래스가 슈퍼의 *모든 designated를 override*하면 → 슈퍼의 convenience 자동 상속

## Member-wise Init과 자동 합성

| 타입 | 합성 조건 | 메모 |
|---|---|---|
| struct | 모든 stored 기본값 있거나 명시 가능 | access 수준은 모든 stored 최소값 |
| class | 자동 합성 없음 | 명시적 init 작성 필요 |
| actor | struct와 동일 (수동 작성도 가능) | nonisolated 가능 |

## class에 init 추가하면 멤버와이즈?

class는 *자동 멤버와이즈 init 없음*. struct만의 특권.

```swift
struct S { var a: Int; var b: Int }
S(a: 1, b: 2)                                    // ✅ 자동

class C { var a: Int; var b: Int }
// C(a:b:) ❌ 컴파일 에러 — 직접 작성해야
```

## 흔한 함정 / Follow-up

- **Q. Phase 1에서 `self.foo()` 호출 가능?**
  불가. self의 메서드/computed property는 Phase 2부터. 컴파일 에러로 막힘.

- **Q. designated init에서 슈퍼 init 호출 *전에* `self.x = 1` 같은 stored 할당은?**
  자기 클래스의 stored는 가능(Phase 1). 슈퍼 stored는 불가.

- **Q. `required` 없이 protocol init은 어떻게?**
  protocol이 init을 요구하면 채택 class는 `required init`으로 구현해야 함 (서브클래스가 protocol 채택을 보장하기 위해).

- **Q. struct에 init을 직접 정의하면 멤버와이즈가 사라지는가?**
  같은 파일 내 *extension*에 init을 두면 멤버와이즈 유지. struct 본문에 두면 사라짐.

- **Q. `Codable` synthesized init은 designated인가?**
  Yes. `init(from:) throws` 형태로 합성됨. 직접 override해서 partial decoding 가능.

- **Q. actor의 init은?**
  isolated이지만 `nonisolated init`도 가능. 단, isolated state는 init 동안 직접 접근 가능 (외부 await 필요 없음).

- **Q. 왜 Swift는 2-phase init이 필요한가?**
  Objective-C는 `[[Foo alloc] init]`에서 init 중에 nil 자기 자신을 받아 부분 초기화 상태를 노출할 수 있었음. Swift는 *모든 stored가 초기화 완료된 상태만 self로 노출*하도록 강제해 buggy state를 차단.

## 참고

- Swift Language Guide: Initialization
- WWDC: Designed by Convention (Phase 1/2)
