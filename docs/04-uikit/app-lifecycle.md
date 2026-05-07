# App Lifecycle (UIApplicationDelegate / SceneDelegate)

> 한 줄 요약 — iOS 13부터 **여러 화면(Scene)을 지원**하기 위해 앱 레벨(AppDelegate)과 화면 레벨(SceneDelegate)로 책임이 분리되었다.

도입 버전: SceneDelegate는 iOS 13+

## 책임 분리

| 책임 | 어디서 |
|---|---|
| 앱 자체의 생애 (런치, 종료, 푸시 등록, 백그라운드 페치) | `AppDelegate` |
| UI 화면(Scene)의 생애 (foreground/background 전환, URL 오픈) | `SceneDelegate` |
| Scene 설정 (UISceneSession 구성) | `AppDelegate` 의 `configurationForConnecting` |

iOS 12 이하 또는 SwiftUI App protocol에서는 SceneDelegate가 없을 수도 있다.

## 앱 상태

```
Not Running → Inactive → Active
                  ↑↓
              Background → Suspended
```

- **Active**: 사용자와 상호작용 중. 메인 스레드 이벤트 수신.
- **Inactive**: 일시 정지(전화/제어센터/앱 전환 화면).
- **Background**: 화면 안 보임. 짧게 작업 가능.
- **Suspended**: 메모리에만 있고 코드 실행 안 됨.

## 주요 콜백 (UIKit)

```swift
// AppDelegate
func application(_:didFinishLaunchingWithOptions:) -> Bool
func application(_:configurationForConnecting:options:) -> UISceneConfiguration

// SceneDelegate
func scene(_:willConnectTo:options:)         // Scene 등장
func sceneDidBecomeActive(_:)                // 활성화
func sceneWillResignActive(_:)               // 비활성화 (전화 등)
func sceneDidEnterBackground(_:)             // 백그라운드
func sceneWillEnterForeground(_:)            // 다시 포그라운드
func scene(_:openURLContexts:)               // 딥링크
```

## SwiftUI App 라이프사이클

```swift
@main
struct MyApp: App {
    @Environment(\.scenePhase) var scenePhase

    var body: some Scene {
        WindowGroup { ContentView() }
            .onChange(of: scenePhase) { _, phase in
                switch phase {
                case .active: ...
                case .inactive: ...
                case .background: ...
                @unknown default: break
                }
            }
    }
}
```

UIKit AppDelegate를 함께 쓰려면 `@UIApplicationDelegateAdaptor`.

## 백그라운드 작업

- **단기 작업**: `beginBackgroundTask(expirationHandler:)` — 30초 정도.
- **장기/주기 작업**: `BGTaskScheduler` (iOS 13+) — 시스템이 적절한 시점에 깨움.
- **백그라운드 페치/푸시**: `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`.

## 흔한 함정 / Follow-up

- **Q. `applicationDidEnterBackground` vs `applicationWillResignActive`?**
  resignActive는 *짧은 인터럽트* (전화, 알림 센터)로도 호출. didEnterBackground는 실제로 백그라운드 진입. 데이터 저장은 보통 didEnterBackground.

- **Q. iOS 13에서 multi-scene을 안 쓰는 앱도 SceneDelegate가 필요한가?**
  Info.plist에서 Scene Manifest를 비활성화하면 안 써도 됨. 단, iPad multitasking을 포기하게 됨.

- **Q. 앱이 죽었을 때(foreced kill) 호출되는 콜백?**
  사용자가 앱 스위처에서 강제 종료 → `applicationWillTerminate` 호출 *안 됨*. 즉, 그 시점에 저장하려면 늦음. 백그라운드 진입 시점에 저장해야 함.

- **Q. `didFinishLaunching`에서 무거운 작업을 하면?**
  앱 시작 시간(Time to First Frame)이 늘어나 첫 인상 나빠짐. 필수 아닌 초기화는 *지연*하거나 백그라운드로 미뤄라.

- **Q. URL 스킴 처리는 어디서?**
  iOS 13+ Scene 사용 시 `scene(_:openURLContexts:)`. AppDelegate-only 환경이면 `application(_:open:options:)`.

## 참고

- Apple Docs: Managing Your App's Life Cycle
- WWDC 2019: Architecting Your App for Multiple Windows
