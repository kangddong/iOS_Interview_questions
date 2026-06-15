# Test Strategy (피라미드, Flaky, Contract, Snapshot이 잡는 회귀)

> 한 줄 요약 — 시니어 답변은 *"무슨 테스트를 쓰는가"*가 아니라 *"어떤 종류의 회귀를 막기 위해 어떤 비율로 어디에 두는가"*다. 테스트 피라미드(unit ≫ integration ≫ E2E) + flaky 원인 분류 + snapshot이 *놓치는* 회귀 인지 = 시니어 변별 포인트.

## 테스트 피라미드

```
        /  E2E  \         적음, 비싸고 느림 — 핵심 user flow만
       /---------\
      / Integ.    \       middle: real DB, network mock
     /-------------\
    /   Unit Tests  \     많음, 빠름 — 로직/상태 검증
   /-----------------\
```

실무 비율 (대략):
- Unit: 70-80%
- Integration: 15-25%
- E2E: 5-10%

비율은 *도메인 안정성*과 *외부 의존성 정도*에 따라 조절. 결제는 integration 비중 ↑, 알고리즘은 unit 비중 ↑.

## Unit Test의 좋은 단위

**잘된 unit**:
- 1개 함수/메서드/Reducer의 *동작 명세*
- 외부 의존성 모두 mock/stub
- 1~10ms

**의심되는 unit**:
- *구현 디테일*까지 assert (구현 바뀌면 깨짐)
- *너무 작은 단위*에 mock이 너무 많음 → 사실상 mock 동작 테스트
- *너무 큰 단위*에 의존성 5개+

## Integration Test

- 여러 컴포넌트 *함께* 검증
- 진짜 DB(in-memory SQLite, Core Data NSInMemoryStoreType)
- Network은 `URLProtocol` 가로채기로 응답 주입
- TCA의 *Reducer + Dependency 조합* 같은 *작은 통합*

## E2E (XCUITest)

- 실 디바이스/시뮬레이터에서 *사용자 관점* 검증
- 가장 비싸고 느리고 flaky 위험 큼
- 핵심 happy path 5-10개에 한정
- accessibilityIdentifier 필수 (라벨 기반 selector는 i18n에 깨짐)

## Flaky 테스트의 원인 분류

| 원인 | 식별 |
|---|---|
| 시간 의존 | `Date()`, `sleep`, async race |
| 순서 의존 | 다른 테스트가 남긴 상태 |
| 네트워크 | 실제 호출, DNS, 캐시 |
| UI 동기화 | 화면 전환 중 assert |
| 외부 리소스 | 시뮬레이터 상태, 토큰 만료 |
| 비결정 정렬 | dictionary 순회 |

대응:
- `Clock` 추상화 + `swift-dependencies`로 fake clock 주입
- 각 테스트 *완전 독립* (setUp/tearDown 검증)
- 모든 외부 호출 mock (`URLProtocol`, `URLSession.shared` 분리)
- XCUITest는 `waitForExistence`/`expectation`으로 *명시적 동기화*

## 시간 의존 코드

```swift
struct Clock { var now: () -> Date = { Date() } }

class TokenManager {
    let clock: Clock
    let expiry: Date
    var isExpired: Bool { clock.now() >= expiry }
}

// 테스트
let m = TokenManager(clock: Clock(now: { fixedTime }), expiry: ...)
```

`swift-dependencies` (TCA 의존성)도 `@Dependency(\.date)` 패턴 제공.

## Snapshot 테스트가 *잡는* 것과 *놓치는* 것

**잡는 회귀**:
- 레이아웃 변경 (intentional unless 의도)
- 텍스트 잘림, 색상 회귀
- Dark mode 깨짐, dynamic type 깨짐
- 비주얼 regression 전반

**놓치는 회귀**:
- 인터랙션 동작 (탭/스와이프)
- 상태 변화 후 UI (스냅샷은 *한 시점*)
- 애니메이션 중간 단계
- 접근성 라벨/순서
- 비주얼은 같은데 *근본 로직이 깨진* 경우

→ Snapshot은 *얇은 UI 레이어 회귀 방지*. 비즈니스 로직은 unit으로.

## Mocking 전략

### Protocol-driven

```swift
protocol UserService { func load(id: String) async throws -> User }
struct MockUserService: UserService { var loadResult: Result<User, Error> = ... }
```

가장 일반적. *얇은 protocol* + *작은 구현 표면*.

### `swift-dependencies` (TCA)

```swift
struct AppDependencies: DependencyKey {
    var userService: UserService
    static let liveValue = Self(userService: LiveUserService())
    static let testValue = Self(userService: MockUserService())
}
```

global lookup + *override* + struct-only DI. Reducer 테스트와 자연스럽게 통합.

### `URLProtocol` for network

```swift
class MockURLProtocol: URLProtocol { /* startLoading에서 응답 주입 */ }
config.protocolClasses = [MockURLProtocol.self]
```

URLSession 그대로 사용, 응답만 가짜. *실제 URLSession 코드 경로 검증* 가능.

## Swift Testing (Xcode 16+) vs XCTest

| 항목 | XCTest | Swift Testing |
|---|---|---|
| 진입점 | `class XCTestCase` | `@Test` 함수 |
| Assert | `XCTAssert*` | `#expect(...)` / `#require(...)` |
| 매개변수화 | `XCTestObservation` 우회 | `@Test(arguments: ...)` 네이티브 |
| Trait | 제한적 | tag, bug, timeLimit 등 |
| 비동기 | `XCTestExpectation` + async test | 자연스러운 async/await |
| 병렬화 | 메서드 단위 | 자동 + 명시 가능 |

신규는 Swift Testing 우선. 기존 XCTest는 *공존 가능*.

## Test Pyramid을 *어떤 비율로* 답해야 하나

면접 모범:
- "Unit 70% / Integration 20% / E2E 10% 권장"이라고 *수치*를 든다
- 그러나 "비율은 *변경 빈도*와 *외부 의존성*에 따라 조정. 결제 모듈은 integration 비중 늘림"
- 절대수가 아니라 *근거*를 제시

## 흔한 함정 / Follow-up

- **Q. Singleton 코드 어떻게 테스트?**
  Protocol로 추상화 + DI. 또는 *test reset* 메서드 (`resetForTesting()`). 더 나은 길은 singleton 제거.

- **Q. private 메서드 테스트?**
  *공개 인터페이스를 통해* 검증. private을 *직접* 테스트하려는 충동 = 클래스 책임 분리 신호.

- **Q. flaky 테스트를 어떻게 *재현* 가능하게?**
  랜덤 시드 고정, clock 주입, *반복 실행* (xcodebuild `-runs-until-failure`).

- **Q. CI에서 테스트 시간이 너무 길다?**
  병렬화 (xcodebuild `-parallel-testing-enabled`), 분할 (`-only-testing`), 우선순위 (changed module 먼저).

- **Q. Mutation testing?**
  코드를 일부러 변형해 *테스트가 잡아내는지* 확인. iOS 도구 빈약 (Muter for Swift). 시도해 볼 만하지만 도입 비용 큼.

- **Q. 100% 커버리지가 좋은가?**
  *target이 100%면 잘못된 인센티브*. *변경 시 깨질 risk가 큰 부분*에 집중. 핫스팟 70-80% + 안정 코드 50%가 현실적.

## 참고

- WWDC 2024: Meet Swift Testing
- Apple: Testing Asynchronous Operations with Expectations
- Point-Free: swift-dependencies
- Martin Fowler: Test Pyramid
