# XCTest 기본

> 한 줄 요약 — Apple의 표준 테스트 프레임워크. **`XCTestCase` 서브클래스 안의 `test...` 메서드**가 테스트 단위. assertion으로 결과를 검증한다.

## 기본 구조

```swift
import XCTest
@testable import MyApp

final class CalculatorTests: XCTestCase {

    var sut: Calculator!         // System Under Test

    override func setUp() {
        super.setUp()
        sut = Calculator()
    }

    override func tearDown() {
        sut = nil
        super.tearDown()
    }

    func test_add_returnsSum() {
        XCTAssertEqual(sut.add(2, 3), 5)
    }
}
```

- 메서드 이름은 반드시 `test`로 시작.
- `setUp`/`tearDown`은 *각 테스트마다* 호출 (격리 보장).
- `setUpWithError() throws`/`tearDownWithError() throws`도 사용 가능.

## 자주 쓰는 assertion

| assertion | 의미 |
|---|---|
| `XCTAssertEqual(a, b)` | 같음 |
| `XCTAssertTrue(c)` / `XCTAssertFalse(c)` | bool |
| `XCTAssertNil(x)` / `XCTAssertNotNil(x)` | optional |
| `XCTAssertThrowsError(try x())` | throw 검증 |
| `XCTAssertNoThrow(try x())` | throw 안 함 |
| `XCTFail("...")` | 무조건 실패 |

## 비동기 테스트

### XCTestExpectation

```swift
func test_loginSucceeds() {
    let exp = expectation(description: "login")
    sut.login("a", "b") { result in
        XCTAssertNoThrow(try result.get())
        exp.fulfill()
    }
    wait(for: [exp], timeout: 1.0)
}
```

`fulfill`을 두 번 호출하거나 한 번도 안 부르면 실패.

### async/await (Xcode 13+)

```swift
func test_loginSucceeds() async throws {
    let user = try await sut.login("a", "b")
    XCTAssertEqual(user.id, expected)
}
```

훨씬 간결. 신규 코드는 이 형태가 표준.

## 테스트 격리 — 왜 매번 setUp?

테스트는 *서로의 결과에 영향을 받지 않아야* 한다. 한 테스트가 SUT를 망가뜨리면 다음 테스트가 잘못된 상태에서 시작 → 거짓 통과/실패.

매 테스트마다 새 SUT를 만들고 mock도 새로 만드는 게 안전하다.

## given-when-then (BDD 스타일)

```swift
func test_login_withInvalidEmail_returnsValidationError() async {
    // given
    sut.email = "not-email"
    // when
    let result = await sut.tapLogin()
    // then
    XCTAssertEqual(result, .failure(.invalidEmail))
}
```

테스트 이름과 본문이 *읽기 쉬운 명세*가 됨.

## 의존성 주입과 mock

```swift
final class MockAuth: AuthAPIType {
    var loginResult: Result<User, Error> = .success(.fixture())
    var didCallLogin = false
    func login(_ email: String, _ pw: String) async throws -> User {
        didCallLogin = true
        return try loginResult.get()
    }
}

func test_login_callsAPI() async throws {
    let mock = MockAuth()
    let sut = LoginVM(auth: mock)
    _ = try await sut.tapLogin()
    XCTAssertTrue(mock.didCallLogin)
}
```

VM이 protocol을 통해 API를 받기 때문에 mock 가능.

## 측정 (Performance)

```swift
func test_perf_compute() {
    measure { sut.compute() }
}
```

여러 번 실행해 평균/표준편차 측정. 회귀 감시용. CI에서는 노이즈가 커서 별도 환경 권장.

## 코드 커버리지

스킴 → Test → Code Coverage 활성화. 라인/함수 커버리지 표시. 100%가 목표가 아니라 *위험한 영역(돈, 인증, 데이터 변환)*이 충분히 덮였는지 체크.

## 비교 — XCTest vs Swift Testing

| 구분 | XCTest | Swift Testing |
|---|---|---|
| 도입 | 오래됨 | Xcode 16+ |
| 문법 | 클래스/메서드 | `@Test` 매크로, free function |
| assert | `XCTAssert*` | `#expect`/`#require` |
| parameterized | 보일러플레이트 | `@Test(arguments:)` 자동 |
| 호환 | iOS 전체 | Swift 5.10+ |

→ [swift-testing.md](swift-testing.md)

## 흔한 함정 / Follow-up

- **Q. `@testable import`가 뭔가?**
  internal 멤버까지 테스트 타깃에 노출. 단, 같은 모듈 내 테스트 코드여야 가능.

- **Q. 테스트가 *가끔* 실패한다 (flaky).**
  보통 *비동기/타이머/공유 상태*. expectation timeout, sleep 의존, singleton 잔재. 의존성을 명시 주입하고, 시간은 *fake clock*으로 제어.

- **Q. UI 테스트와 단위 테스트 차이?**
  단위 테스트는 코드 단위(VM, util)을 빠르게. UI 테스트(XCUITest)는 *실제 앱 실행 + 화면 조작*. 느리고 깨지기 쉬워서 *적게 + 핵심 시나리오*만.

- **Q. 어떤 코드를 단위 테스트하나?**
  결정적이고 비즈니스 가치가 큰 부분: ViewModel, UseCase, util, 데이터 변환. 단순 wrapper나 UI 코드는 굳이.

- **Q. 메인 스레드 가정 코드는?**
  `@MainActor` 표시 + `await MainActor.run { ... }`. XCTest도 `@MainActor` 적용 가능.

## 참고

- Apple Docs: XCTest
- WWDC 2018: Engineering for Testability
- WWDC 2021: Meet AsyncSequence (XCTest async 발전)
