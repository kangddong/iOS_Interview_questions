# 04. UIKit

> 한 줄 요약 — UIKit은 **명령형 + UIView 계층 + RunLoop 기반** GUI 프레임워크. 모든 UI 업데이트는 **메인 스레드**에서, 이벤트는 **Responder Chain**으로 전달, 레이아웃은 **Auto Layout 제약**으로 표현된다.

UIKit 포지션이면 라이프사이클/Responder Chain은 100% 묻는다.

## UIKit vs SwiftUI

| 축 | UIKit | SwiftUI |
| --- | --- | --- |
| 패러다임 | **명령형** — 객체 만들고 직접 조작 | **선언형** — 상태로부터 view 도출 |
| 단위 | `UIView` / `UIViewController` (class) | `View` (struct) |
| 레이아웃 | Auto Layout 제약 | Parent proposes / Child decides |
| 갱신 | `setNeedsLayout` / `setNeedsDisplay` 명시 | 상태 변경 시 자동 diffing |
| 출시 | iOS 2 (2008) | iOS 13 (2019) |

→ "왜 UIKit은 view가 class이고 SwiftUI는 struct인가?" — 명령형은 *식별성과 mutation*이 필요, 선언형은 *값으로 비교*하면 충분.

## 핵심 개념 6선

### 1. ViewController 라이프사이클
- `init` → `loadView` → `viewDidLoad` → `viewWillAppear` → **`viewIsAppearing` (iOS 17+)** → `viewWillLayoutSubviews` → `viewDidLayoutSubviews` → `viewDidAppear` → ... → `viewWillDisappear` → `viewDidDisappear`.
- `viewDidLoad`는 **1회**, `viewWillAppear`/`viewDidAppear`는 **매번**. 데이터 로딩은 `viewDidLoad`, 화면별 갱신은 `viewWillAppear`.
- `viewIsAppearing` (iOS 17+): trait/safeArea/bounds 확정 뒤 호출 — `viewWillAppear`의 한계 해결.

### 2. Responder Chain & Hit-Testing
- 터치는 **hit-test** (가장 깊은 view 찾기) → **Responder Chain** (이벤트 처리할 responder 탐색) 두 단계.
- 체인: `view` → `superview` → ... → `UIViewController` → `UIWindow` → `UIApplication` → `AppDelegate`.
- `becomeFirstResponder()`로 키보드 등 명시적 first responder 지정.

### 3. Auto Layout
- 제약(`NSLayoutConstraint`)으로 *관계*를 선언 → 시스템이 풂. Cassowary 알고리즘.
- **Intrinsic Content Size**: view가 *자신이 원하는 크기*를 알려줌 (label은 텍스트 크기).
- **CHP / CCRP**: Content Hugging Priority (커지기 싫음) / Content Compression Resistance Priority (줄어들기 싫음). 우선순위 충돌 해결 핵심.

### 4. frame vs bounds
- **frame**: *부모 좌표계*에서 view의 위치/크기. transform 적용 후의 값.
- **bounds**: *자신의 좌표계*에서 자신의 크기. scroll view에선 `origin`이 콘텐츠 오프셋.
- transform이 걸리면 frame은 의미가 모호 → bounds + center로 사고.

### 5. 셀 재사용 (UITableView/UICollectionView)
- `dequeueReusableCell`로 화면 밖 셀을 재활용 → 메모리 절약.
- 함정: 비동기 이미지 로드 후 *재사용된 셀*에 잘못된 이미지 표시. `prepareForReuse()`에서 상태 초기화 + indexPath 검증 필수.
- **Diffable Data Source** (iOS 13+): snapshot 기반 자동 애니메이션, 인덱스 계산 버그 제거.

### 6. 렌더링 파이프라인
- 메인 스레드: layout/draw → CALayer 트리 commit.
- **Render Server (backboardd)**: layer 트리를 GPU에 그리기 명령으로 전달.
- 프레임 1개 ≈ 16.67ms (60Hz) / 8.33ms (120Hz ProMotion). 초과 시 **hitch** → [10-performance](../10-performance/README.md).
- **Off-screen rendering** 트리거: `cornerRadius + masksToBounds`, `shadow`, `mask`, `rasterize` → GPU 별도 패스 비용.

## UI 업데이트의 메인 스레드 규칙

```
- UIKit API 호출은 반드시 메인 스레드
- 백그라운드에서 만지면? 미정의 동작 (대부분 크래시, 가끔 그냥 안 그려짐)
- 메인이 16.67ms를 못 지키면? hitch (사용자가 느낌)
- 메인이 250ms+ 멈추면? hang
- 메인이 ~20초 멈추면? watchdog 크래시
```

→ 무거운 작업은 background queue/Task로 분리, 결과만 main으로 hop. → [03-concurrency](../03-concurrency/README.md).

## 항목

- [App 라이프사이클](app-lifecycle.md) — UIApplicationDelegate, SceneDelegate, scenePhase
- [UIViewController 라이프사이클](viewcontroller-lifecycle.md) — `viewDidLoad`~`viewDidDisappear`, `viewIsAppearing` (iOS 17+)
- [Responder Chain](responder-chain.md) — hit-testing, first responder, 이벤트 전달
- [Auto Layout](auto-layout.md) — constraint 우선순위, intrinsicContentSize, CHP/CCRP
- [frame vs bounds](frame-vs-bounds.md) — 좌표계 차이, transform과의 관계
- [UITableView / UICollectionView](tableview-collectionview.md) — 셀 재사용, prefetch, diffable data source
- [Core Animation / CALayer](core-animation.md) — implicit/explicit animation, off-screen rendering
- [렌더링 파이프라인](rendering-pipeline.md) — *3년차+*. 메인 → Render Server → GPU, off-screen pass

## 시니어

- [RunLoop 심화 — UIKit 메인 스레드의 동작 단위](runloop-deep.md)
- [Off-Screen Rendering 트리거와 대응](offscreen-rendering.md)

## 관련 (다른 디렉토리)

- 메인 스레드와 렌더링 파이프라인 → [03-concurrency/runloop-and-main-thread.md](../03-concurrency/runloop-and-main-thread.md)

## 자주 묻는 질문

- `viewWillAppear`와 `viewDidAppear` 호출 시점 → [viewcontroller-lifecycle.md](viewcontroller-lifecycle.md)
- `frame`과 `bounds` 차이 → [frame-vs-bounds.md](frame-vs-bounds.md)
- 셀 재사용 시 이미지 깜빡임 원인 → [tableview-collectionview.md](tableview-collectionview.md)
- Auto Layout 우선순위 충돌 해결 → [auto-layout.md](auto-layout.md)
- hit-testing 흐름 → [responder-chain.md](responder-chain.md)
- UI를 백그라운드에서 만지면 안 되는 이유 → [03-concurrency/runloop-and-main-thread.md](../03-concurrency/runloop-and-main-thread.md)
