# UIViewController 라이프사이클

> 한 줄 요약 — VC는 *뷰 로딩*, *화면 전환*, *레이아웃*의 세 축에서 콜백을 제공한다. **각 콜백이 호출되는 시점**과 **그때 뷰가 어떤 상태인지**를 정확히 매칭해서 외울 것.

## 호출 순서 (단순 push 한 번)

```
init
loadView                  // 뷰 계층 생성 (수동 시)
viewDidLoad               // 뷰 메모리 적재 후 1회
viewWillAppear            // 화면에 등장하기 직전 (매번)
viewIsAppearing           // 뷰가 view hierarchy에 추가됨, 첫 layout 직전 (iOS 17 SDK / Xcode 15에서 공개, iOS 13까지 back-deploy)
viewWillLayoutSubviews    // 레이아웃 계산 직전
viewDidLayoutSubviews     // 레이아웃 직후 (frame 확정)
viewDidAppear             // 등장 완료 (애니메이션 끝)

// 사라질 때
viewWillDisappear
viewDidDisappear
deinit (참조 끊기면)
```

## 각 시점의 의미와 *해야 할 일*

| 콜백 | 호출 빈도 | 적합한 작업 |
|---|---|---|
| `viewDidLoad` | 1회 | 한 번만 하면 되는 초기 설정 (subview 추가, 색상, target-action) |
| `viewWillAppear` | 매번 | 데이터 갱신, 네비게이션 바 스타일 변경 |
| `viewIsAppearing` | 매번 (iOS 17 SDK 공개, iOS 13까지 back-deploy) | 첫 layout 전, 안전한 frame 의존 코드 |
| `viewDidLayoutSubviews` | 자주 | 동적 레이아웃 후처리 (CALayer 그라디언트 frame 등) |
| `viewDidAppear` | 매번 | 애니메이션 시작, analytics, 첫 응답자 지정 |
| `viewWillDisappear` | 매번 | 진행 중 작업 일시 중단, edit 모드 종료 |
| `viewDidDisappear` | 매번 | 무거운 리소스 해제 |

## viewDidLoad에서 frame을 쓰면 안 되는 이유

`viewDidLoad` 시점에는 view가 *메모리에 적재만* 됐을 뿐, **부모 뷰에 들어가지 않아 frame이 storyboard 기준값**이거나 `.zero`. 디바이스 크기 기준으로 계산하려면 `viewDidLayoutSubviews` (또는 iOS 17+ `viewIsAppearing`)에서 해야 한다.

```swift
// ❌ viewDidLoad에서 view.bounds 기반 그라디언트
override func viewDidLoad() {
    gradient.frame = view.bounds      // 잘못된 크기로 설정될 수 있음
}

// ✅ layout 후
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    gradient.frame = view.bounds
}
// 또는 iOS 13+ 배포 환경에서 viewIsAppearing (Xcode 15 SDK 필요, iOS 13까지 back-deploy)
```

## present / push 시 호출 차이

```
A → B push:
  A.viewWillDisappear → B.viewWillAppear → B.viewIsAppearing → B.viewDidAppear → A.viewDidDisappear

A → B present (full screen):
  동일 패턴

A → B present (.overFullScreen, .formSheet 등 비투명):
  A.viewWillDisappear/DidDisappear가 호출되지 않을 수 있음 — 모달 종류에 따라 다름
```

`.overFullScreen`/`.overCurrentContext`는 *밑의 화면을 보존*하므로 disappear가 호출되지 않는다는 점이 면접 단골.

## Container ViewController

`UINavigationController`, `UITabBarController`, custom container의 자식 VC는 라이프사이클이 부모를 통해 전달된다. 커스텀 컨테이너 만들 때:

```swift
addChild(child)
view.addSubview(child.view)
child.didMove(toParent: self)
```

`didMove(toParent:)`/`willMove(toParent:)`를 빼먹으면 자식 VC의 appearance 콜백이 깨진다.

## UIView 계층 이동 콜백 — didMoveToWindow가 핵심

VC 콜백과는 별개로 **UIView 자체에도 계층 이동 콜백**이 있다. 실무에서 가장 자주 쓰이는 건 윈도우 관련 콜백.

| 콜백 | 의미 |
|---|---|
| `willMove(toSuperview:)` / `didMoveToSuperview()` | 슈퍼뷰에 추가·제거. `didMoveToSuperview`에서 인자(=구 superview)가 `nil`이 아니면 *추가된 것* |
| `willMove(toWindow:)` / `didMoveToWindow()` | 뷰가 실제 **윈도우(화면)** 에 올라오거나 내려갈 때 |

뷰가 계층에 있다고 해서 화면에 보이는 건 아니다. **윈도우에 붙어야 진짜 보인다.** 그래서 "화면에 실제로 보일 때만 시작해야 하는 작업" — 반복 애니메이션, 타이머, 디스플레이 링크 — 은 `didMoveToWindow()`에서 `window != nil` 확인하고 시작/중지하는 게 정석.

```swift
override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
        startPulseAnimation()       // 화면에 올라옴
    } else {
        stopPulseAnimation()        // 화면에서 내려감 → 메모리/배터리 절약
    }
}
```

`viewDidLoad`/`init`에서 애니메이션을 시작하면 안 되는 이유가 여기 있다. 그 시점엔 아직 윈도우에 없고 frame도 확정 전.

## init? vs loadView vs viewDidLoad

| 시점 | 뷰 상태 |
|---|---|
| `init` | 아직 view 없음 (`view`에 접근하면 강제 로드됨) |
| `loadView` | 뷰 계층을 *만드는* 타이밍 (storyboard 안 쓸 때 override) |
| `viewDidLoad` | 뷰 적재 직후 |

`init`에서 `view.foo`를 만지면 의도치 않게 `loadView`가 즉시 호출되어 순서가 꼬일 수 있다.

## 흔한 함정 / Follow-up

- **Q. `viewWillAppear`와 `viewDidAppear`의 차이?**
  WillAppear는 *전이 직전*(아직 화면에 일부만 보이거나 가려진 상태도 가능), DidAppear는 *애니메이션이 완전히 끝난 뒤*. 첫 응답자 지정, analytics 같이 "사용자가 보고 있는 것이 확정"된 시점이 필요하면 DidAppear.

- **Q. `viewIsAppearing`이 추가된 이유?**
  iOS 17 SDK / Xcode 15에서 공개됐고 **iOS 13까지 back-deploy되는 API**(즉, 배포 타깃은 iOS 13 이상이면 사용 가능. 단 Xcode 15+ SDK로 빌드해야 함). `viewWillAppear`보다 늦고 `viewDidAppear`보다 이른, **trait collection과 view hierarchy가 모두 확정된 첫 시점**. 기존엔 trait 기반 코드가 willAppear에서 잘못 동작하는 케이스가 있어 보강된 것.

- **Q. `deinit`이 호출되지 않는 이유?**
  retain cycle. 보통 closure에서 self 강참조, NotificationCenter observer 미해제, delegate가 strong인 경우.

- **Q. `viewDidLayoutSubviews`가 여러 번 호출되는데 OK?**
  맞다. 회전, 키보드 등장, sub view 변경 시마다 호출. 무거운 작업을 매번 하면 성능 문제 → 변경 감지 후 필요한 때만.

- **Q. memory warning 시 `viewWillUnload`?**
  iOS 6에서 deprecate. 지금은 OS가 자동으로 보이지 않는 VC의 view를 해제. `didReceiveMemoryWarning`만 남음.

- **Q. 반복 애니메이션 / 타이머는 어디서 시작?**
  `didMoveToWindow()`에서 `window != nil` 확인 후 시작. `nil`이면 중지. `viewDidLoad`나 `init`은 아직 화면에 없는 시점이라 부적절. → [Auto Layout 사이클 ↔ 화면 등장](auto-layout.md#layout-사이클--3단계-패스)

- **Q. `viewDidLoad`에서 `view.bounds`로 그라디언트 frame을 잡았는데 크기가 이상하다?**
  `viewDidLoad`의 bounds는 storyboard/이전 화면 기준. 첫 레이아웃 패스 이후의 값이 아니다. `viewDidLayoutSubviews`(또는 커스텀 뷰면 `layoutSubviews`)에서 잡아라. CALayer는 Auto Layout을 안 타므로 frame 수동 갱신은 거기서. → [Auto Layout — CALayer는 Auto Layout을 안 탄다](auto-layout.md#calayer는-auto-layout을-안-탄다)

## 참고

- Apple Docs: UIViewController lifecycle
- WWDC 2023: What's new in UIKit (viewIsAppearing 도입)
