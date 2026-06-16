# Mocking 전략 (Mock / Stub / Spy / Fake)

> 한 줄 요약 — 외부 의존성을 *진짜로 호출하지 않고* 테스트 가능한 가짜로 바꾸는 기법. **protocol 추상화 + 생성자 주입**이 iOS 표준 전략.

## 용어 정리

| 종류 | 역할 |
|---|---|
| **Stub** | *정해진 응답*을 돌려주는 객체. "조회하면 이 값 반환." |
| **Mock** | 호출 *기록*까지 검증. "이 메서드가 정확히 한 번 호출됐어야 한다." |
| **Spy** | 진짜 객체 위에 *호출 기록만* 추가. |
| **Fake** | 동작은 하지만 *간단한 구현*. 인메모리 DB 같은 것. |

엄밀한 구분이 항상 필요하진 않음. iOS 인터뷰 답변에선 `mock`/`stub`을 같은 의미로 쓰는 사람도 많음.

## protocol 추상화 → mock

```swift
protocol AuthAPIType {
    func login(_ email: String, _ pw: String) async throws -> User
}

final class AuthAPI: AuthAPIType {
    func login(_ email: String, _ pw: String) async throws -> User { /* 실제 네트워크 */ }
}

// 테스트
final class MockAuth: AuthAPIType {
    var loginResult: Result<User, Error> = .success(.fixture())
    private(set) var calls: [(String, String)] = []

    func login(_ email: String, _ pw: String) async throws -> User {
        calls.append((email, pw))
        return try loginResult.get()
    }
}
```

- `protocol`로 의존성을 추상화.
- 실제 구현과 mock 구현 둘 다 채택.
- 테스트에서 mock 주입.

## 사용 예

```swift
func test_login_success_storesToken() async throws {
    let mock = MockAuth()
    mock.loginResult = .success(User(id: "u1"))
    let sut = LoginVM(auth: mock)

    try await sut.tapLogin()

    #expect(mock.calls.count == 1)
    #expect(mock.calls.first?.0 == sut.email)
    #expect(sut.user?.id == "u1")
}
```

## Spy 패턴

```swift
final class AnalyticsSpy: AnalyticsType {
    private(set) var logged: [String] = []
    func log(_ event: String) { logged.append(event) }
}
```

값 반환 없이 *호출됐는지*만 보면 됨. spy 가장 단순.

## Fake — 인메모리 저장소

```swift
final class InMemoryUserRepo: UserRepository {
    private var store: [UUID: User] = [:]
    func save(_ u: User) async { store[u.id] = u }
    func find(id: UUID) async -> User? { store[id] }
}
```

DB나 디스크를 띄우지 않고 *동일 인터페이스*로 동작. Core Data를 in-memory store로 띄워 fake로 쓰는 패턴도 흔함.

## 시간 / 무작위 — Controllable

```swift
protocol DateProviding { var now: Date { get } }
struct SystemDate: DateProviding { var now: Date { Date() } }
struct FixedDate: DateProviding { let now: Date }
```

`Date()`/`UUID()`/`arc4random` 같은 *비결정적 의존*을 주입 가능하게. swift-dependencies처럼 매크로로 자동화도 가능.

## 라이브러리

| 라이브러리 | 특징 |
|---|---|
| Cuckoo | 코드 생성 기반. Mock 자동 생성 |
| Mockingbird | 매크로/코드 생성, 기능 풍부 |
| swift-dependencies | TCA 생태. 환경 키 기반 |
| 직접 작성 | 가장 단순. 작은 앱은 충분 |

## URLProtocol로 네트워크 가짜 응답

`URLSession`을 *protocol로 감싸지 않고* 가짜 응답을 주려면:

```swift
final class MockURLProtocol: URLProtocol {
    static var handler: ((URLRequest) -> (HTTPURLResponse, Data))?

    override class func canInit(with: URLRequest) -> Bool { true }
    override class func canonicalRequest(for r: URLRequest) -> URLRequest { r }
    override func startLoading() {
        let (resp, data) = MockURLProtocol.handler!(request)
        client?.urlProtocol(self, didReceive: resp, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: data)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}

// 테스트 setup
let cfg = URLSessionConfiguration.ephemeral
cfg.protocolClasses = [MockURLProtocol.self]
let session = URLSession(configuration: cfg)
```

URL 단에서 가짜 응답을 주입. 실제 네트워크 호출 일어나지 않음.

## 비교 — 직접 구현 vs 라이브러리

| 직접 | 라이브러리 |
|---|---|
| 단순/명시적 | 보일러플레이트 절약 |
| 작은 앱에 적합 | 큰 코드베이스 |
| 의존성 추가 없음 | 도구 학습 필요 |

## 흔한 함정 / Follow-up

- **Q. Singleton이라 mock이 어렵다.**
  싱글턴 직접 부르는 건 *글로벌 의존*. protocol로 감싸 생성자 주입. 기본값으로 `Foo.shared`를 주는 패턴이 호환에 좋음.

- **Q. `static` 메서드는 mock 못 한다.**
  맞다. instance 메서드로 감싸 추상화. 또는 `swift-dependencies`처럼 환경에서 가짜 함수 주입.

- **Q. async/await 함수 mocking?**
  protocol에 `async throws`로 선언하고 mock도 그 시그니처 채택. continuation 안 써도 됨.

- **Q. mock이 너무 많아 테스트가 깨지기 쉽다.**
  *상호작용 테스트*가 너무 많음. 결과 *상태*를 보는 단위 테스트로 균형. 또는 fake로 대체.

- **Q. UI 컴포넌트는 어떻게 테스트?**
  ViewModel 위주로 단위 테스트. UI 자체는 snapshot 테스트(`swift-snapshot-testing`) 또는 XCUITest로 핵심 시나리오만.

## 참고

- Martin Fowler: Mocks Aren't Stubs
- Point-Free: Designing Dependencies
- swift-dependencies, swift-snapshot-testing
