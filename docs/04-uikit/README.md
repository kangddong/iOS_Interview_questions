# 04. UIKit

UIKit 포지션이면 라이프사이클/Responder Chain은 100% 묻는다.

## 항목

- [App 라이프사이클](app-lifecycle.md) — UIApplicationDelegate, SceneDelegate, scenePhase
- [UIViewController 라이프사이클](viewcontroller-lifecycle.md) — `viewDidLoad`~`viewDidDisappear`, `viewIsAppearing` (iOS 17+)
- [Responder Chain](responder-chain.md) — hit-testing, first responder, 이벤트 전달
- [Auto Layout](auto-layout.md) — constraint 우선순위, intrinsicContentSize, CHP/CCRP
- [frame vs bounds](frame-vs-bounds.md) — 좌표계 차이, transform과의 관계
- [UITableView / UICollectionView](tableview-collectionview.md) — 셀 재사용, prefetch, diffable data source
- [Core Animation / CALayer](core-animation.md) — implicit/explicit animation, off-screen rendering
- [렌더링 파이프라인](rendering-pipeline.md) — *3년차+*. 메인 → Render Server → GPU, off-screen pass

## 관련 (다른 디렉토리)

- 메인 스레드와 렌더링 파이프라인 → [03-concurrency/runloop-and-main-thread.md](../03-concurrency/runloop-and-main-thread.md)

## 자주 묻는 질문

- `viewWillAppear`와 `viewDidAppear` 호출 시점 → [viewcontroller-lifecycle.md](viewcontroller-lifecycle.md)
- `frame`과 `bounds` 차이 → [frame-vs-bounds.md](frame-vs-bounds.md)
- 셀 재사용 시 이미지 깜빡임 원인 → [tableview-collectionview.md](tableview-collectionview.md)
- Auto Layout 우선순위 충돌 해결 → [auto-layout.md](auto-layout.md)
- hit-testing 흐름 → [responder-chain.md](responder-chain.md)
- UI를 백그라운드에서 만지면 안 되는 이유 → [03-concurrency/runloop-and-main-thread.md](../03-concurrency/runloop-and-main-thread.md)
