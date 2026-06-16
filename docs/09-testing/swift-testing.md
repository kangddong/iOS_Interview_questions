# Swift Testing

> 한 줄 요약 — Xcode 16+에서 도입된 새 테스트 프레임워크. **`@Test` 매크로 + `#expect` 매크로**로 클래스 상속 없이 간결하게 테스트를 짠다.

도입 버전: Xcode 16+ / Swift 5.10+

## 무엇이 좋아졌나

- 클래스 상속, `func test_` 접두사 불필요.
- assertion 실패 시 *값을 자동 표시*해서 디버깅이 빠름.
- **parameterized test**가 일급 시민.
- tag 기반 그룹화, parallel by default.
- XCTest와 같은 Test target에서 *공존* 가능.

## 기본

```swift
import Testing
@testable import MyApp

@Test
func add_returnsSum() {
    let calc = Calculator()
    #expect(calc.add(2, 3) == 5)
}
```

`@Test`는 함수에 직접 붙음 (free function 또는 struct/enum/class의 메서드 모두 가능).

## #expect vs #require

```swift
#expect(value == 5)             // 실패해도 테스트 계속
let v = try #require(optional)  // nil이면 throw — 이후 코드 중단
```

`#require`는 *이후 단계가 의미 없을 때*. assertion fail 후 nil unwrap 같은 후속 크래시를 막음.

## 실패 메시지가 똑똑함

```swift
#expect(user.name == "kdy")
// 실패 시:
// Expectation failed: user.name → "alice" == "kdy"
```

XCTAssertEqual은 메시지를 직접 적어야 했는데, `#expect`는 표현식 자체를 *해체해서* 보여 줌.

## Parameterized Tests

```swift
@Test(arguments: [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0)
])
func add(a: Int, b: Int, expected: Int) {
    #expect(Calculator().add(a, b) == expected)
}
```

각 케이스가 별도 테스트로 실행. 어느 케이스가 실패했는지 정확히 표시.

## Trait

```swift
@Test("로그인 성공", .tags(.auth), .timeLimit(.seconds(3)))
func login_succeeds() async throws {
    let user = try await sut.login("a", "b")
    #expect(user.id == "u1")
}
```

- 사람이 읽는 *이름* (한국어 OK)
- `.tags()`로 그룹
- `.timeLimit()`으로 자동 timeout

## setUp/tearDown

XCTest의 `setUp/tearDown` 대신 *suite 타입으로 묶고 init*에서 설정:

```swift
struct CalculatorTests {
    let sut: Calculator
    init() { sut = Calculator() }     // setUp 역할

    @Test
    func add() { #expect(sut.add(1, 1) == 2) }
}
```

- 각 테스트마다 *suite 타입의 새 인스턴스*가 만들어져 격리된다.
- struct에는 `deinit`이 없다. tearDown이 필요하면 다음 중 골라 쓴다:
  - `defer { ... }` — 테스트 본문 끝에 정리 코드.
  - **helper class fixture** — suite를 `final class`로 만들면 `deinit`을 tearDown처럼 쓸 수 있다. 또는 별도 RAII helper class를 프로퍼티로 보유.
  - **trait/custom Trait** — 여러 테스트가 공통 정리를 공유할 때.

## 비동기 / async

```swift
@Test
func login_succeeds() async throws {
    let user = try await sut.login("a", "b")
    #expect(user.id == "u1")
}
```

`async` / `throws` 모두 자연 지원.

## Suite (그룹화)

```swift
@Suite("Calculator")
struct CalculatorTests {
    @Test func add() { ... }
    @Test func sub() { ... }
}
```

## 비교 — XCTest vs Swift Testing

| 구분 | XCTest | Swift Testing |
|---|---|---|
| 선언 | class + `func test_` | `@Test` |
| assert | `XCTAssert*` | `#expect` / `#require` |
| 파라미터 | 수동 (forEach 등) | `@Test(arguments:)` |
| setUp/tearDown | 명시적 메서드 | struct init/deinit |
| 병렬 | 옵션 | 기본 병렬 |
| 호환 | iOS 전체 | Swift 5.10+, Xcode 16+ |

## 흔한 함정 / Follow-up

- **Q. 기존 XCTest 코드를 한 번에 마이그레이션?**
  공존 가능하므로 점진적 권장. 새 테스트만 Swift Testing, 기존은 그대로.

- **Q. UI 테스트도 가능?**
  Swift Testing은 *유닛 테스트* 중심. UI 테스트(XCUITest)는 여전히 XCTest 기반.

- **Q. 병렬 실행이 기본인데 공유 상태 있으면?**
  flaky 테스트의 원인. 각 테스트는 독립적이어야. 공유 자원이 필요하면 `.serialized` trait 사용.

- **Q. `#expect`의 어디서 실패했는지 모르겠다.**
  Xcode가 표현식을 자동 해체. 직접 메시지 추가는 `#expect(x == y, "맥락")`.

- **Q. CI에서 둘 다 돌아가게?**
  같은 test target에서 가능. `xcodebuild test`가 둘 다 실행.

## 참고

- WWDC 2024: Meet Swift Testing
- swiftlang/swift-testing
