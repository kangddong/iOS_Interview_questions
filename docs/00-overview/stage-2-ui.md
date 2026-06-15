# 2단계 — UI 프레임워크

> 한 줄 요약 — UIKit (명령형, 성숙) vs SwiftUI (선언형, iOS 13+). **지원 포지션의 비중에 따라 학습 시간 배분이 달라진다.** 신규 프로젝트는 SwiftUI 비중이 늘고 있지만 *유지보수 중심* 회사는 UIKit이 여전히 핵심.

## 학습 목표

- ViewController 라이프사이클의 *각 단계가 정확히 언제* 호출되는가
- Auto Layout 우선순위 충돌을 *어떻게 디버깅*하나
- 셀 재사용 시 이미지 깜빡임을 *왜 일어나고 어떻게 해결*
- SwiftUI View가 *struct*인 이유와 그 결과
- @State / @Binding / @StateObject / @Observable의 차이와 선택 기준
- View identity가 깨질 때 *어떤 증상*이 나타나나
- off-screen rendering / hitch / hierarchy 비용을 측정·해결

## 카테고리

### [04-uikit](../04-uikit/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [App Lifecycle](../04-uikit/app-lifecycle.md) | 주니어 |
| [ViewController Lifecycle](../04-uikit/viewcontroller-lifecycle.md) | 주니어 필수 |
| [frame vs bounds](../04-uikit/frame-vs-bounds.md) | 주니어 필수 |
| [Auto Layout](../04-uikit/auto-layout.md) | 주니어~미들 |
| [Responder Chain](../04-uikit/responder-chain.md) | 미들 |
| [TableView / CollectionView](../04-uikit/tableview-collectionview.md) | 미들 |
| [Core Animation](../04-uikit/core-animation.md) | 미들 |
| [Rendering Pipeline](../04-uikit/rendering-pipeline.md) | 시니어 |
| [RunLoop 심화](../04-uikit/runloop-deep.md) | 시니어 |
| [Off-Screen Rendering](../04-uikit/offscreen-rendering.md) | 시니어 |

### [05-swiftui](../05-swiftui/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [선언형과 View struct](../05-swiftui/declarative-and-view-struct.md) | 주니어 필수 |
| [State Management](../05-swiftui/state-management.md) | 주니어 필수 |
| [Observation Macro (iOS 17+)](../05-swiftui/observation-macro.md) | 미들 |
| [Layout System](../05-swiftui/layout-system.md) | 미들 |
| [View Identity & Lifetime](../05-swiftui/view-identity-and-lifetime.md) | 미들 |
| [View Graph & Diffing](../05-swiftui/view-graph-and-diffing.md) | 시니어 |
| [Custom Layout & Animatable](../05-swiftui/custom-layout-and-animatable.md) | 시니어 |
| [SwiftUI Performance](../05-swiftui/performance.md) | 시니어 |

## 권장 학습 순서

지원 포지션이:

**UIKit 위주**:
1. ViewController Lifecycle → frame/bounds → Auto Layout
2. TableView/CollectionView (실무 90%가 리스트)
3. Responder Chain → Core Animation
4. (시니어) Rendering Pipeline → Off-Screen → RunLoop 심화

**SwiftUI 위주**:
1. 선언형 모델 + View struct → @State/@Binding
2. @StateObject / @Observable (iOS 17+ 우선)
3. View Identity → Layout System
4. (시니어) View Graph & Diffing → Performance → Custom Layout

**둘 다 묻는 회사**:
- UIKit 주니어 깊이 + SwiftUI 주니어 깊이를 *수평 학습*
- 그 후 각자 미들로 진입

## 예상 소요 시간

- 한 쪽만: 주니어 5일 / 미들 1.5주 / 시니어 3주
- 양쪽 모두: 주니어 1.5주 / 미들 3주 / 시니어 1.5~2개월

## 대표 질문

### 주니어
- `viewDidLoad`와 `viewWillAppear`의 차이?
- `frame`과 `bounds`의 차이?
- UITableViewCell 재사용 메커니즘?
- `@State`와 `@Binding`의 차이?
- SwiftUI에서 View가 struct인 이유?

### 미들
- Auto Layout 우선순위 충돌은 어떻게 해결?
- Responder Chain 이벤트 전달 흐름?
- `@StateObject` vs `@ObservedObject` 선택 기준?
- iOS 17 `@Observable`이 ObservableObject 대비 갱신을 줄이는 원리?
- View Identity가 깨질 때 어떤 증상?

### 시니어
- off-screen rendering이 발생하는 트리거와 대응?
- 60/120Hz 환경에서 hitch는 어떻게 정량화/측정?
- SwiftUI body가 잦은 호출되는 게 왜 괜찮은가?
- AnyView가 비싼 이유와 회피 방법?
- Custom Layout 프로토콜로 flow 레이아웃 구현?

## 다음 단계 진입 조건

- [ ] 셀 재사용 + 이미지 비동기 로드 코드를 *처음부터* 작성 가능
- [ ] Auto Layout 우선순위로 *복잡한 레이아웃* 해결
- [ ] SwiftUI에서 *왜 안 그려지는지* 디버깅 가능
- [ ] hitch 발생 원인을 *3분류*(메인/commit/GPU)로 답변

→ [stage-3-architecture](stage-3-architecture.md)로 진입.

## 모듈 확장 가이드

- UIKit / SwiftUI 비율은 *시장 트렌드 데이터* 인용
- 토픽 표는 카테고리 → 깊이 순으로 정렬 유지
- 시니어 질문엔 *측정 도구*가 들어가야 함 (Instruments, Animation Hitches 등)
