# Pattern Matching

> 한 줄 요약 — Swift의 `switch`는 **exhaustive** + **pattern-based**가 핵심. enum/tuple/optional/range/type 패턴과 `where`로 *조건부 분기*를 표현 타입 안전하게 한다. 함수형 언어의 ADT 매칭에 가깝다.

## 패턴 종류

| 패턴 | 예 |
|---|---|
| Wildcard | `case _:` |
| Identifier | `case .success(let v):` |
| Value binding | `case let user where user.isAdmin:` |
| Tuple | `case (0, _):` |
| Enum case | `case .failure(let err):` |
| Optional | `case .some(let x):` / `case let x?:` |
| Range | `case 0..<10:` |
| Type cast | `case let n as Int:` |
| Expression (`~=`) | 사용자 정의 |

## 기본 switch — Exhaustiveness

```swift
enum Status { case ok, redirect(Int), error(Error) }

func describe(_ s: Status) -> String {
    switch s {
    case .ok: return "OK"
    case .redirect(let code) where code >= 300 && code < 400: return "Redirect \(code)"
    case .redirect: return "Invalid redirect"
    case .error(let e): return "Error: \(e)"
    }
}
```

- 모든 케이스 다루지 않으면 컴파일 에러
- `@unknown default`는 *non-frozen enum*(라이브러리 안정성) 대응

```swift
switch s {
case .ok: ...
case .redirect: ...
case .error: ...
@unknown default: ...   // 새 케이스 추가 시 경고
}
```

## if/guard case + for case

```swift
if case .success(let v) = result, v > 0 {
    use(v)
}

guard case .success(let v) = result else { return }

for case .success(let v) in results {  // success만 골라 순회
    use(v)
}

for case let v? in optionals {          // 옵셔널 풀고 nil 스킵
    use(v)
}
```

## Tuple + Range 결합

```swift
func classify(point: (Int, Int)) -> String {
    switch point {
    case (0, 0): return "origin"
    case (_, 0): return "x-axis"
    case (0, _): return "y-axis"
    case (-10...10, -10...10): return "near origin"
    case let (x, y) where x == y: return "diagonal"
    default: return "elsewhere"
    }
}
```

## `~=` 사용자 정의 매칭

`switch x { case pattern: ... }`은 내부적으로 `pattern ~= x`를 호출. 직접 정의 가능:

```swift
struct EmailDomain { let value: String }
func ~= (pattern: EmailDomain, address: String) -> Bool {
    address.hasSuffix("@\(pattern.value)")
}

let work = EmailDomain(value: "company.com")
switch "kim@company.com" {
case work: print("회사 메일")
default: print("기타")
}
```

`Range`와 `String`이 `~=` 기본 구현을 가지므로 `case 0..<10:`, `case "foo":`가 동작하는 원리.

## Type Pattern

```swift
func describe(_ any: Any) {
    switch any {
    case let n as Int where n < 0: print("negative int")
    case let n as Int: print("int \(n)")
    case let s as String: print("string \(s)")
    case is Date: print("date type, value unused")
    case let arr as [Int]: print("array of int \(arr)")
    default: print("기타")
    }
}
```

Type pattern은 *런타임 다운캐스트* 비용이 듦. 핫패스에서 다수 case는 dispatch 테이블이 아니라 *순차 검사*임을 인지.

## Optional pattern (`?` syntax)

```swift
let xs: [Int?] = [1, nil, 3]
for case let x? in xs { print(x) }    // 1, 3

if case let url? = optionalURL { use(url) }
```

`x?`는 `.some(x)`의 syntactic sugar.

## Switch Expression (Swift 5.9+)

```swift
let label = switch result {
    case .success: "OK"
    case .failure: "FAIL"
}
```

if expression도 같은 방식. 짧은 분기를 *값*으로 다룸 → 변수 mutation 제거.

## 흔한 함정 / Follow-up

- **Q. `switch`의 case 순서가 중요한가?**
  중요함. *위→아래* 첫 매칭이 선택됨. 가장 구체적인 케이스를 위에.

- **Q. `case 1, 2, 3:` 처럼 합쳐 쓸 때 binding?**
  같은 이름/타입의 binding이 필요. `case .a(let x), .b(let x):`는 가능.

- **Q. enum 케이스를 *기본값으로 매칭*하는 가장 짧은 방법?**
  `if case .foo = x { ... }`. 값이 필요하면 `if case .foo(let v) = x`.

- **Q. switch는 정수 lookup table을 만드나?**
  단순 정수 case가 *연속 범위*이면 jump table, 그 외엔 분기 시퀀스. 컴파일러 결정.

- **Q. exhaustive를 어떻게 보장하나 (non-frozen에서)?**
  라이브러리 enum이 `@frozen`이 아니면 *새 케이스 추가 가능성* → `@unknown default` 권장. 컴파일러가 누락 시 경고.

- **Q. `if let`과 `if case let .some(_)`의 차이?**
  같다. `if let`이 옵셔널 전용 syntactic sugar.

- **Q. `where` 절은 매칭 시 어디서 평가?**
  패턴이 일치한 *후*. 일치하지 않으면 다음 case로 진행.

## 참고

- Swift Language Guide: Patterns, Control Flow
- SE-0380 (if/switch expressions)
