# 앱 런치 타임

> 한 줄 요약 — 사용자가 *아이콘을 눌러서 첫 인터랙션 가능 시점*까지의 시간. **pre-main → main → first frame** 구간으로 나눠 측정한다.

## 단계

```
[ 아이콘 탭 ]
    │
    ▼
[ pre-main ]  — dyld가 동적 라이브러리/심볼 로드, ObjC 런타임 초기화
    │
    ▼
[ main ] — UIApplicationMain → didFinishLaunching → SceneDelegate 등장
    │
    ▼
[ first frame ] — 루트 뷰가 그려져 화면에 등장
    │
    ▼
[ first interactive ] — 사용자 입력 받을 준비 완료
```

면접에서 "콜드 스타트가 느려요. 어디부터 보나요?"가 단골.

## 측정

### Xcode Organizer / MetricKit

실제 사용자 디바이스에서 모인 *실측* 런치 타임 통계. 가장 신뢰도 높음.

### Instruments — App Launch

각 단계별 시간 + 호출 스택. *어떤 dylib가 오래 걸리는지*, `+load`/`init`이 얼마나 무거운지.

### XCTest measure

```swift
class LaunchTests: XCTestCase {
    override class var runsForEachTargetApplicationUIConfiguration: Bool { true }

    func test_launchPerformance() throws {
        if #available(iOS 13.0, *) {
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
```

CI에서 회귀 감시. 단, 측정 환경이 일정해야 의미 있음.

## 흔한 원인

### pre-main이 느림

- 동적 프레임워크가 너무 많음 (특히 ObjC 카테고리/`+load`).
- App Store가 권장: dylib 6개 이하. 더 많으면 *static link* 검토.
- Swift는 `+load` 없지만 글로벌 변수 초기화가 비슷한 효과.

### didFinishLaunching이 느림

- 분석/Crashlytics/광고 SDK 다수 *동시 초기화*.
- 큰 Core Data store load.
- 동기 네트워크 요청.
- 글로벌 변수 lazy init이 무거움.

해결: 필수가 아닌 SDK는 *lazy*하게 (첫 화면 보여 준 뒤). `Task.detached`로 백그라운드 초기화.

### first frame이 느림

- 루트 뷰 안에서 큰 데이터 즉시 로드.
- 큰 이미지 디코드.
- AutoLayout 충돌 폭주.

해결: 루트는 placeholder 빠르게 → 콘텐츠는 점진 로드.

## 콜드/웜/핫 차이

| 종류 | 정의 |
|---|---|
| **Cold launch** | 앱이 메모리에 없음. 모든 단계 전부 |
| **Warm launch** | 앱은 종료됐지만 디스크 캐시 따끈 |
| **Hot launch** | 백그라운드에서 다시 포그라운드 — 거의 즉시 |

Cold가 가장 느리고, 사용자 첫 인상에 직접 영향.

## 빠른 점검 리스트

- `didFinishLaunching` 안의 작업이 *정말* 메인 스레드에서 즉시 필요한가?
- 글로벌 싱글턴들의 init이 무겁지는 않은가?
- 동적 프레임워크 개수 (Build Phases → Embed Frameworks).
- Storyboard launch screen이 첫 화면과 *연속적*인가? (튀는 인상 방지)
- 첫 화면이 *네트워크 응답 없이* 먼저 보이는 구조인가? (skeleton/cached)
- `+load`/Swift 글로벌 var가 무거운 일을 하지 않는가?

## 흔한 함정 / Follow-up

- **Q. SDK 5개 동기 초기화로 1초 걸린다. 어떻게?**
  필수만 즉시(예: 분석), 나머지는 첫 화면 후 background로 이동. *광고 SDK 같이 첫 화면 직전이 아니어도 되는 것*은 lazy.

- **Q. SwiftUI App protocol에서 측정?**
  `AppLaunch` Instruments + MetricKit 동일. SwiftUI는 `WindowGroup`의 첫 evaluation 시점이 first frame과 가깝다.

- **Q. App Thinning, Bitcode, 사이즈와 런치?**
  IPA 사이즈가 *직접* 런치에 영향 X (최초 다운로드 시간엔 영향). 다만 dylib 개수는 영향.

- **Q. Static vs Dynamic 라이브러리가 런치에 미치는 영향?**
  Static은 main 안에 통합되어 dylib 로드 줄어들지만, 그만큼 `pre-main`이 짧아지고 `main` 시작은 동일/약간 길어질 수 있음. 일반적으로 *너무 많은 dylib* 보다 *적절한 static link*가 유리.

- **Q. *체감 런치*를 줄이는 트릭?**
  Launch Screen을 첫 화면과 *닮게* 만들어 끊김을 가림. 첫 화면 자체에 placeholder/skeleton.

## 참고

- WWDC 2019: Optimizing App Launch
- WWDC 2022: Eliminate data races using Swift Concurrency (간접: 메인 격리로 첫 작업 명확화)
- Apple Docs: Reducing Your App's Launch Time
