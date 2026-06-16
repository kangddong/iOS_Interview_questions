# Coordinator 패턴

> 한 줄 요약 — **화면 전환 책임을 ViewController/View에서 분리**하는 객체. 누가 어디로 가야 하는지를 한 곳에 모아 두면 *재사용 가능한 화면*과 *깊은 흐름 추적*이 쉬워진다.

## 무엇을 해결하나

VC가 `present`/`pushViewController`를 직접 호출하면:
- 그 VC는 *어떤 컨텍스트에서 띄워졌는지*를 알아야 함 → 재사용성 ↓
- 화면 전환 분기(로그인 했는지/온보딩 봤는지/푸시로 진입했는지)가 VC 안에 흩어짐
- 딥링크/푸시로 *임의 화면으로 점프*가 어려움

Coordinator는 이 모든 이동 결정을 한 객체에 위임한다.

## 기본 구조

```swift
protocol Coordinator: AnyObject {
    var children: [Coordinator] { get set }
    func start()
}

final class AppCoordinator: Coordinator {
    var children: [Coordinator] = []
    let nav: UINavigationController

    init(nav: UINavigationController) { self.nav = nav }

    func start() {
        if !Auth.isLoggedIn { showLogin() } else { showHome() }
    }

    func showLogin() {
        let c = LoginCoordinator(nav: nav)
        c.onLoggedIn = { [weak self, weak c] in
            self?.children.removeAll { $0 === c }
            self?.showHome()
        }
        children.append(c)
        c.start()
    }

    func showHome() {
        let c = HomeCoordinator(nav: nav)
        children.append(c)
        c.start()
    }
}
```

자식 coordinator의 *완료 콜백*으로 다음을 결정. VC는 자기 안에서 `onTapLogin?()` 같은 이벤트만 외부에 알린다.

## 자식 Coordinator의 라이프타임

부모가 `children` 배열로 보유 → ARC가 살려둠. *완료 시 배열에서 제거*하지 않으면 누수.

```swift
c.onFinish = { [weak self, weak c] in
    self?.children.removeAll { $0 === c }
}
```

## SwiftUI에서

SwiftUI는 NavigationStack/sheet/fullScreenCover 같은 *상태 기반 라우팅*이 강해서, "Coordinator object"보다는 **Router 객체 + path/sheet state**로 구현하는 경우가 많다.

```swift
@Observable
final class Router {
    var path = NavigationPath()
    var sheet: SheetRoute?

    enum SheetRoute: Identifiable { case settings, profile(User); var id: String { ... } }

    func push<T: Hashable>(_ value: T) { path.append(value) }
}

struct RootView: View {
    @State var router = Router()
    var body: some View {
        NavigationStack(path: $router.path) {
            Home()
                .navigationDestination(for: PostID.self) { id in PostView(id: id) }
        }
        .sheet(item: $router.sheet) { route in ... }
        .environment(router)
    }
}
```

## 딥링크 처리

Coordinator/Router가 외부 진입점을 한 번에 받음.

```swift
// AppDelegate / Scene 진입
func handleDeepLink(_ url: URL) {
    appCoordinator.handle(url)   // 내부에서 적절한 자식 coordinator로 라우팅
}
```

VC 내부에 흩어지면 같은 화면이 어디서 진입하든 같은 결과를 보장하기 어려움.

## 비교 — VC 직접 전환 vs Coordinator

| 구분 | VC 직접 | Coordinator |
|---|---|---|
| 화면 전환 책임 | VC | 별도 객체 |
| 재사용성 | 낮음 | 높음 (VC가 컨텍스트 모름) |
| 딥링크 | 어렵게 흩어짐 | 한 점에서 처리 |
| 보일러플레이트 | 적음 | 약간 증가 |
| 학습 곡선 | 없음 | 있음 |

## 흔한 함정 / Follow-up

- **Q. VC를 화면 전환 모르게 만드는 방법?**
  closure / delegate / Combine subject로 *이벤트만 외부에 노출*. VC는 "로그인 버튼이 눌렸어"만 말하고, 그 다음 화면을 누가 정할지는 모름.

- **Q. Coordinator가 너무 비대해지면?**
  화면 그룹별로 자식 coordinator로 분리 (LoginCoordinator, OnboardingCoordinator). 트리 구조.

- **Q. UINavigationController의 delegate를 coordinator가 가지면?**
  Pop 같은 *시스템 트리거 전이*를 알아채려면 필요. 다만 Storyboard 기반에서는 까다로움.

- **Q. SwiftUI에서 굳이 coordinator 객체가 필요한가?**
  iOS 16+ NavigationStack과 path 기반 라우팅이 잘 만들어져서, *상태 객체(Router)*로 충분한 경우가 많음. 명시적 Coordinator는 UIKit 시절 패턴.

## 참고

- Soroush Khanlou: The Coordinator (2015)
- Hacking with Swift: How to use the coordinator pattern in iOS apps
