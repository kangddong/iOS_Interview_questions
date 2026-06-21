# 09. Testing

> 한 줄 요약 — iOS 테스팅은 **XCTest → Swift Testing** 전환기. 면접에선 *피라미드(단위/통합/UI) 비율 + Mocking 전략 + 시간/비동기 결정성 + flaky 분류*가 시니어 변별점.

## 테스트 피라미드

```
         ┌───────────┐
         │  UI Test  │  ← 비싸고 느림, 적게
         ├───────────┤
         │Integration│  ← 중간
         ├───────────┤
         │   Unit    │  ← 빠르고 많이
         └───────────┘
```

- **단위 테스트**: 순수 로직 (ViewModel, UseCase). 의존성은 모두 주입·교체.
- **통합 테스트**: 여러 컴포넌트 협력 (Repository + URL 매핑). 실제 네트워크 X, `URLProtocol` mock.
- **UI 테스트**: 사용자 흐름 (XCUITest). 느려서 *스모크*만.
- **스냅샷**: 시각 회귀. 디자인 시스템·복잡한 layout 보호.

## 핵심 개념 5선

### 1. XCTest vs Swift Testing
- **XCTest** (Apple): `XCTestCase` 상속, `XCTAssert*`, `setUp/tearDown`. iOS 7+ 지원.
- **Swift Testing** (Xcode 16+, Swift 6): `@Test`, `#expect(x == y)`, **parameterized**, **trait** 시스템, async 기본. 인스턴스 매번 생성 → 격리 보장.
- 차이: Swift Testing은 *값 비교 표현식 그대로* 출력, parameterized로 표 형태 케이스 작성.

### 2. Mocking 전략
- **Stub**: 정해진 답을 돌려줌.
- **Mock**: 호출 *검증* (몇 번 / 어떤 인자로 호출됐는지).
- **Spy**: 실제 객체 + 호출 기록.
- **Fake**: 동작하는 가짜 (in-memory DB 같은 것).
- iOS 패턴: protocol 추상화 + 생성자 주입 → 테스트에서 fake 교체. 네트워크는 `URLProtocol`로 가짜 응답.

### 3. 비동기 / 시간 결정성
- `async` 테스트: `func test_x() async throws { ... }` 직접 await.
- 시간 의존 코드: `Clock` 추상화 + `ImmediateClock` 주입 또는 `Date` 공급자 주입.
- Combine: `.test` scheduler 또는 `XCTestExpectation`.
- `Task.sleep` / `DispatchQueue.main.asyncAfter`는 *실제로 기다리지 마라* — fake clock으로 advance.

### 4. Flaky 테스트 분류
- **타이밍 의존**: `wait(for:timeout:)`을 늘리지 말고 *결정론적 신호*로 바꿔라.
- **상태 누수**: 이전 테스트가 남긴 UserDefaults/Keychain/싱글톤. `setUp`에서 초기화.
- **외부 의존**: 실제 네트워크/시계. mock으로 격리.
- **순서 의존**: 테스트 격리 깨짐. 매번 fresh 인스턴스.

### 5. Snapshot 테스트의 *놓치는 것*
- 시각 비교는 강력하지만 *동작*은 검증 못 함.
- 다국어 (RTL/긴 문자열) / Dynamic Type / 다크 모드 / iPhone SE까지 *변형 차원*을 명시.
- 환경 의존 (폰트 렌더링 차이)으로 깨질 수 있음 → 시뮬레이터 고정.

## 어떤 테스트를 작성할 것인가

```
도메인 로직 (UseCase, Reducer, Mapper)        → 단위 테스트 (다수, 빠르게)
의존성 경계 (Repository + URL 매핑 + Decoder) → 통합 테스트
사용자 흐름 (로그인 → 핵심 화면)              → UI 테스트 (스모크만)
복잡한 layout / 디자인 시스템                  → 스냅샷
```

→ "Singleton을 어떻게 테스트하나?" → 추상화 + 주입으로 변환. 즉, 테스트 가능한 코드를 *설계* 단계에서 만들어야 한다.

## 항목

- [XCTest 기본](xctest.md) — `XCTestCase`, assertion, setUp/tearDown, async 테스트
- [Swift Testing](swift-testing.md) — Xcode 16+, `@Test`, `#expect`, parameterized
- [Mocking 전략](mocking.md) — Stub/Mock/Spy/Fake, protocol 추상화, URLProtocol 가짜 응답
- [Snapshot / UI Testing](snapshot-and-ui-testing.md) — *3년차+*. 시각 회귀, XCUITest, page object, launchArguments

## 시니어

- [Test Strategy (피라미드 / Flaky 분류 / Snapshot이 놓치는 회귀 / Swift Testing vs XCTest)](test-strategy.md)

## 자주 묻는 질문

- XCTest와 Swift Testing 차이 → [swift-testing.md](swift-testing.md)
- 비동기 코드 테스트 → [xctest.md](xctest.md)
- Mock과 Stub 차이 → [mocking.md](mocking.md)
- Singleton 코드를 어떻게 테스트하나 → [mocking.md](mocking.md)
- flaky 테스트 원인 → [xctest.md](xctest.md)
- 시간 의존 코드 테스트 → [mocking.md](mocking.md)
