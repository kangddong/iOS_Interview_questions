# Snapshot 테스트 / UI 테스트 (XCUITest)

> 한 줄 요약 — **Snapshot 테스트**는 *UI 결과 이미지*를 저장해 회귀를 잡고, **XCUITest**는 *실제 앱 실행 + 화면 조작 시나리오*를 검증한다. 단위 테스트가 못 잡는 *시각/통합* 회귀를 보완.

## Snapshot Testing

### swift-snapshot-testing (Point-Free)

```swift
import SnapshotTesting
import XCTest

final class CardSnapshotTests: XCTestCase {
    func test_card_default() {
        let view = CardView(model: .preview)
        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))
    }

    func test_card_dark() {
        let vc = UIHostingController(rootView: CardView(model: .preview))
        vc.overrideUserInterfaceStyle = .dark
        assertSnapshot(of: vc, as: .image(on: .iPhone13))
    }
}
```

### 동작

- 첫 실행: *현재 결과 이미지*를 디스크에 저장 (`__Snapshots__/`). 검토 후 commit.
- 이후 실행: 새 결과를 저장된 이미지와 *바이트 비교*. 다르면 실패 + diff 이미지 출력.

### 다양한 strategy

- `.image(...)` — UIView/SwiftUI/UIViewController
- `.recursiveDescription` — UIKit 뷰 계층 텍스트
- `.json` — Codable 객체
- `.dump` — 임의 객체 reflection

### 주의

- 시뮬레이터/디바이스/iOS 버전마다 *픽셀 차이*. CI에서 *고정 시뮬레이터*로 통일.
- 동적 콘텐츠(Date.now, UUID, 랜덤)는 mock해야 안정적.
- 파일 commit 필수 — git에 들어감.

## XCUITest — UI 테스트

### 기본

```swift
final class LoginUITests: XCTestCase {
    func test_login_success() {
        let app = XCUIApplication()
        app.launchArguments = ["-uitesting"]
        app.launch()

        app.textFields["email"].tap()
        app.typeText("a@b.com")
        app.secureTextFields["password"].tap()
        app.typeText("pw")
        app.buttons["login"].tap()

        XCTAssertTrue(app.staticTexts["Welcome"].waitForExistence(timeout: 3))
    }
}
```

- `XCUIApplication`이 *별도 프로세스*로 앱을 실행.
- 접근성(accessibilityIdentifier)으로 요소 찾기 — 텍스트 의존 X.
- `waitForExistence(timeout:)`: 비동기 UI에 견고.

### accessibilityIdentifier

```swift
emailField.accessibilityIdentifier = "email"
loginButton.accessibilityIdentifier = "login"
```

UI 텍스트가 변해도 테스트가 안 깨지게.

### Launch Arguments / Environment

```swift
app.launchArguments = ["-uitesting"]
app.launchEnvironment = ["MOCK_API": "1"]
```

앱은 시작 시 이 값을 보고 *mock 모드*로 동작 (API 응답 mock, 로그인 우회 등).

```swift
// 앱 코드
if CommandLine.arguments.contains("-uitesting") {
    AppEnvironment.shared = .mockedForUI
}
```

### Page Object 패턴

테스트 코드 양이 늘면 *화면별로 페이지 객체*를 만들어 액션을 캡슐화.

```swift
struct LoginScreen {
    let app: XCUIApplication
    func login(email: String, pw: String) {
        app.textFields["email"].tap(); app.typeText(email)
        app.secureTextFields["password"].tap(); app.typeText(pw)
        app.buttons["login"].tap()
    }
}
```

테스트는 시나리오만:

```swift
LoginScreen(app: app).login(email: "a@b.com", pw: "pw")
HomeScreen(app: app).assertWelcomeShown()
```

### 비교 — 단위 vs Snapshot vs UI

| | 단위 | Snapshot | UI |
|---|---|---|---|
| 빠르기 | ms | 빠름 | 매우 느림 |
| 안정성 | 높음 | 픽셀 차 변수 | flaky 가능 |
| 잡는 회귀 | 로직 | 시각 | 통합/시나리오 |
| 양 | 많이 | 핵심 화면 | 핵심 시나리오 5~20개 |

테스트 피라미드: 단위 다수 + snapshot 적당 + UI 소수.

### 일반 함정

- **시뮬레이터 환경 차이**: snapshot 픽셀 미스. CI를 *동일 시뮬레이터/iOS 버전*으로 고정.
- **서버 의존 UI 테스트**: 외부 API 응답이 흔들리면 깨짐. 반드시 mock.
- **시간/랜덤**: 고정값으로.
- **애니메이션**: `UIView.setAnimationsEnabled(false)` 또는 Launch arg로 비활성.

## 비교 — XCTest vs Swift Testing에서

UI 테스트는 여전히 XCTest 기반. Swift Testing은 *unit test 중심*. 단위 테스트만 점진 마이그레이션.

## 흔한 함정 / Follow-up

- **Q. snapshot이 매번 깨진다.**
  서로 다른 디바이스/iOS/색상 모드. CI 환경 고정. 또는 *허용 오차*(`precision: 0.99`) 옵션.

- **Q. UI 테스트가 *가끔* 실패.**
  flaky의 신호. 비동기 콘텐츠 → `waitForExistence`. 애니메이션 → 비활성. 외부 의존 → mock.

- **Q. snapshot 파일이 너무 커서 PR이 무거움.**
  Git LFS 또는 별도 저장소. 또는 *해시 비교*로 대체.

- **Q. UI 테스트로 단위 테스트를 대체?**
  속도/안정성 모두 손해. 단위 가능한 건 단위로, 통합 시나리오만 UI.

- **Q. Accessibility를 테스트?**
  XCUITest에서 `XCUIAccessibilityAuditType` (Xcode 15+)으로 자동 audit.

## 참고

- swift-snapshot-testing (Point-Free)
- WWDC 2019: Testing in Xcode
- WWDC 2023: Build accessibility into your app from the start
