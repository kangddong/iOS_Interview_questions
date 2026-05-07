# 05. SwiftUI

선언형 모델의 *왜*와 상태 관리 도구의 차이가 핵심.

## 항목

- [선언형과 View struct](declarative-and-view-struct.md) — 명령형 vs 선언형, 왜 struct인가, body 재호출
- [상태 관리](state-management.md) — `@State`/`@Binding`/`@StateObject`/`@ObservedObject`/`@EnvironmentObject`
- [Observation 매크로](observation-macro.md) — iOS 17+ `@Observable`, `@Bindable`
- [View Identity와 Lifetime](view-identity-and-lifetime.md) — structural identity, `.id()`, ForEach
- [Layout 시스템](layout-system.md) — parent proposes / child decides, GeometryReader, PreferenceKey

## 심화 (3년차+)

- [Custom Layout / Animatable / Transaction](custom-layout-and-animatable.md) — `Layout` 프로토콜, 보간, AnyLayout
- [View Graph와 Diffing](view-graph-and-diffing.md) — ViewBuilder, Equatable 최적화, AnyView가 비싼 이유

## 자주 묻는 질문

- `@StateObject` vs `@ObservedObject` → [state-management.md](state-management.md)
- `@State` vs `@Binding` → [state-management.md](state-management.md)
- Observation이 기존 `ObservableObject` 대비 좋은 점 → [observation-macro.md](observation-macro.md)
- View가 struct인 이유 → [declarative-and-view-struct.md](declarative-and-view-struct.md)
- body가 자주 호출돼도 괜찮은가 → [declarative-and-view-struct.md](declarative-and-view-struct.md)
- `.id()`와 `@State` 초기화 관계 → [view-identity-and-lifetime.md](view-identity-and-lifetime.md)
- frame이 적용 안 되는 것처럼 보일 때 → [layout-system.md](layout-system.md)
