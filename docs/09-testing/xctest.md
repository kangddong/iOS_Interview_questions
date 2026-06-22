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

## 리액티브 코드 테스트 (Combine / RxSwift)

> 왜 따로 다루나 — 스트림은 *값이 시간에 걸쳐 여러 번 방출*되고 비동기 스케줄러를 탄다. 단순 `XCTAssertEqual` 한 줄로는 "어떤 순서로, 몇 개가, completion까지" 검증이 안 된다. 핵심은 *방출 시퀀스를 모아서 한 번에 비교*하는 것.

### Combine — sink + expectation

가장 기본 패턴. publisher를 구독해 값을 배열에 모으고 expectation으로 완료를 기다린다.

```swift
func test_search_emitsResults() {
    var received: [String] = []
    let exp = expectation(description: "completion")

    let cancellable = sut.$results            // @Published
        .dropFirst()                          // 초기값 스킵
        .sink { value in
            received.append(value)
            if received.count == 2 { exp.fulfill() }
        }

    sut.search("a")
    wait(for: [exp], timeout: 1.0)

    XCTAssertEqual(received, ["loading", "done"])
    cancellable.cancel()
}
```

- `dropFirst()`로 `@Published`의 *현재값 즉시 방출*을 걸러낸다 (자주 놓치는 함정).
- completion(`.finished`/`.failure`)도 검증하려면 `receiveCompletion`에서 기록.

### Combine — 동기 publisher는 expectation 없이

`Just`, `Sequence`, map 체인처럼 *동기적으로 끝나는* publisher는 기다릴 필요 없이 수집만 하면 된다.

```swift
func test_transform_mapsValues() {
    var received: [Int] = []
    _ = [1, 2, 3].publisher
        .map { $0 * 2 }
        .sink { received.append($0) }

    XCTAssertEqual(received, [2, 4, 6])
}
```

### Combine — 스케줄러 주입으로 결정성 확보

`.debounce`, `.delay`, `DispatchQueue.main`이 끼면 실제 시간을 기다리게 되어 flaky·느림. **스케줄러를 주입**해 테스트에서 교체한다.

```swift
// 프로덕션: DispatchQueue.main / 테스트: ImmediateScheduler 또는 가짜
final class SearchVM {
    let scheduler: AnySchedulerOf<DispatchQueue>   // 주입
    func bind() {
        query
            .debounce(for: .milliseconds(300), scheduler: scheduler)
            .sink { ... }
    }
}
```

- 직접 만들기보다 **pointfree의 `CombineSchedulers`** 라이브러리(`TestScheduler`, `ImmediateScheduler`)가 사실상 표준.
- `TestScheduler`는 `scheduler.advance(by: .milliseconds(300))`로 *가상 시간*을 전진 → 실제 sleep 없이 debounce 검증.

```swift
func test_debounce_emitsOnceAfterDelay() {
    let scheduler = DispatchQueue.test
    let sut = SearchVM(scheduler: scheduler.eraseToAnyScheduler())
    var received: [String] = []
    let c = sut.$results.sink { received.append($0) }

    sut.query.send("a"); sut.query.send("ab")
    scheduler.advance(by: .milliseconds(299))
    XCTAssertEqual(received, [])               // 아직 방출 안 됨
    scheduler.advance(by: .milliseconds(1))
    XCTAssertEqual(received, ["ab"])           // debounce 통과
    c.cancel()
}
```

### RxSwift — TestScheduler (RxTest)

RxSwift는 `RxTest`의 `TestScheduler`가 표준. *언제 이벤트를 넣고*, *언제 무엇이 나왔는지*를 가상 시간(`@(시간)`)으로 기록·검증한다.

```swift
import RxTest
import RxSwift

func test_search_debounce() {
    let scheduler = TestScheduler(initialClock: 0)
    let bag = DisposeBag()

    // 입력: 가상 시간 10, 20에 값 방출
    let input = scheduler.createHotObservable([
        .next(10, "a"),
        .next(20, "ab"),
        .completed(30)
    ])

    let observer = scheduler.createObserver(String.self)
    input.asObservable()
        .debounce(.seconds(5), scheduler: scheduler)
        .subscribe(observer)
        .disposed(by: bag)

    scheduler.start()

    XCTAssertEqual(observer.events, [
        .next(25, "ab"),        // 20 + 5
        .completed(30)
    ])
}
```

- `createHotObservable` / `createColdObservable`: hot은 구독과 무관하게 흐르고, cold는 구독 시점부터.
- `createObserver`가 `Recorded<Event<T>>` 배열로 *방출 시각까지* 기록 → `XCTAssertEqual(observer.events, ...)`로 한 방에 비교.
- 가상 스케줄러라 `debounce(5초)`도 *즉시* 검증된다.

### RxSwift — RxBlocking (간단한 경우)

방출이 동기적이거나 첫 값만 필요할 때는 `RxBlocking`이 간결.

```swift
import RxBlocking

func test_first_value() throws {
    let value = try sut.fetchUser()       // Single<User>
        .toBlocking(timeout: 1.0)
        .first()
    XCTAssertEqual(value?.id, expected)
}
```

`toBlocking()`은 *현재 스레드를 블록*하므로 복잡한 시간 의존 스트림에는 부적합 → 그때는 `TestScheduler`.

### 비교 — Combine vs RxSwift 테스트 도구

| 구분 | Combine | RxSwift |
|---|---|---|
| 가상 시간 | `TestScheduler` (CombineSchedulers, 서드파티) | `TestScheduler` (RxTest, 공식 동반) |
| 즉시 실행 | `ImmediateScheduler` | `MainScheduler.instance` 교체 |
| 동기 차단 수집 | sink로 배열 수집 | `RxBlocking.toBlocking()` |
| 이벤트 기록 | 수동 (`received.append`) | `createObserver` → `Recorded` 자동 |
| 시각까지 검증 | 직접 타임스탬프 기록 필요 | `.next(시각, 값)`으로 내장 |

→ 공통 원칙: **스케줄러를 주입**해 실제 시간을 제거하고, **방출 시퀀스 전체를 모아** 한 번에 단언한다. `expectation`은 *진짜 비동기 경계*에서만, 가상 시간으로 대체 가능하면 그쪽이 빠르고 안정적.

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

- **Q. `@Published` 테스트가 항상 초기값을 한 번 더 받는다.**
  `@Published`/`CurrentValueSubject`는 구독 즉시 *현재값*을 방출한다. `dropFirst()`로 거르거나, 그 초기 방출까지 기대 시퀀스에 포함시켜라.

- **Q. debounce/delay가 들어간 스트림이 느리거나 flaky하다.**
  실제 시간을 기다리지 마라. **스케줄러를 주입**하고 테스트에서 가상 시계(Combine `TestScheduler` / Rx `TestScheduler`)로 `advance`. → 본문 [리액티브 코드 테스트](#리액티브-코드-테스트-combine--rxswift)

## 참고

- Apple Docs: XCTest
- WWDC 2018: Engineering for Testability
- WWDC 2021: Meet AsyncSequence (XCTest async 발전)
