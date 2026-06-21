# 05. SwiftUI

> 한 줄 요약 — SwiftUI는 *상태 → view*의 **선언형 + 함수형 UI 프레임워크**. `body`는 *값으로 비교 가능한 struct*를 반환하고, 프레임워크가 직접 diffing해서 변경된 부분만 갱신한다.

선언형 모델의 *왜*와 상태 관리 도구의 차이가 핵심.

## 선언형이 푸는 문제

| 문제 | UIKit (명령형) | SwiftUI (선언형) |
| --- | --- | --- |
| 상태와 UI 불일치 | 수동 동기화, 누락 시 버그 | 상태 → view 자동 도출 |
| 분기 UI | `if`로 isHidden 토글, frame 갱신 | `body` 안 `if` 분기, 자동 transition |
| 리스트 갱신 | `reloadData` 또는 batch update 계산 | Identity로 자동 diffing |
| 코드 분량 | 라이프사이클·delegate·layout 많음 | View struct + modifier 체이닝 |

## 핵심 개념 5선

### 1. View는 struct, body는 자주 호출된다
- `View`는 *값 타입* — 가볍게 만들고 버린다. *식별성*은 별도(structural identity).
- `body` 호출 = view 트리 *기술서* 만들기. 실제 렌더링은 프레임워크가 결정. 따라서 `body`에서 무거운 일 금지(상태 계산은 외부로).
- 면접 단골: "body가 자주 호출돼도 괜찮은가?" → 네, struct 생성·diffing은 *값*이라 싸다. 단 *부수효과*는 절대 금지.

### 2. 상태 관리 도구 비교
| 프로퍼티 래퍼 | 소유권 | 용도 |
| --- | --- | --- |
| `@State` | view가 *소유* | view 로컬 상태 (값 타입) |
| `@Binding` | 다른 곳이 소유, 양방향 참조 | 자식이 부모 상태를 쓸 때 |
| `@StateObject` | view가 *소유* (1회 생성) | ObservableObject 인스턴스 |
| `@ObservedObject` | 외부 소유 | 상위에서 주입받은 OO |
| `@EnvironmentObject` | 환경에 주입 | 깊은 트리 전체에 공유 |
| `@Observable` (iOS 17+) | macro 기반, 매크로가 의존 추적 | OO 대체, *읽은 필드만* 추적 |

→ "왜 `@StateObject`가 필요한가?" → `@ObservedObject`만 쓰면 view가 재생성될 때 *모델도* 재생성. `@StateObject`는 view 식별성에 묶여 1회 생성.

### 3. View Identity & Lifetime
- **Structural Identity**: view 위치(부모 트리에서의 경로)로 식별. 같은 위치 = 같은 view → `@State` 유지.
- **Explicit Identity**: `.id(x)` 명시. id가 바뀌면 *완전히 새 view* — `@State` 초기화, transition 발생.
- `ForEach`의 `id:` 파라미터가 element identity를 결정 → 잘못 주면 행 전체가 깜빡임.

### 4. Layout 시스템
- **Parent proposes, child decides**: 부모가 *제안 크기*를 내려보내면 자식이 *원하는 크기*를 반환.
- `frame()`은 modifier이지 강제 크기가 아님. 컨테이너가 거부할 수 있음.
- `GeometryReader`로 부모 크기 측정, `PreferenceKey`로 자식→부모 정보 전달.
- AnyLayout(iOS 16+): 런타임에 레이아웃 교체.

### 5. View Graph & Diffing
- 프레임워크가 view 트리를 *internal graph*로 변환 → 변경 시 *이전 트리와 비교*해서 변경 노드만 갱신.
- diffing 효율의 핵심은 **Equatable**. `EquatableView` / `.equatable()`로 비교 비용 절감.
- **`AnyView`가 비싼 이유**: 타입 정보가 사라져 prediffing 불가, 트리 전체를 재구성.

## 데이터 흐름 한눈에

```
@State / @StateObject     ─→ owner view
       │
       ▼
@Binding                  ─→ 자식 (양방향)
       │
       ▼
@EnvironmentObject / .environment  ─→ 트리 전체
```

→ Single source of truth. 같은 데이터를 여러 곳에서 *복제*하지 말고 *전달*하라.

## 항목

- [선언형과 View struct](declarative-and-view-struct.md) — 명령형 vs 선언형, 왜 struct인가, body 재호출
- [상태 관리](state-management.md) — `@State`/`@Binding`/`@StateObject`/`@ObservedObject`/`@EnvironmentObject`
- [Observation 매크로](observation-macro.md) — iOS 17+ `@Observable`, `@Bindable`
- [View Identity와 Lifetime](view-identity-and-lifetime.md) — structural identity, `.id()`, ForEach
- [Layout 시스템](layout-system.md) — parent proposes / child decides, GeometryReader, PreferenceKey

## 심화 (3년차+)

- [Custom Layout / Animatable / Transaction](custom-layout-and-animatable.md) — `Layout` 프로토콜, 보간, AnyLayout
- [View Graph와 Diffing](view-graph-and-diffing.md) — ViewBuilder, Equatable 최적화, AnyView가 비싼 이유

## 시니어

- [SwiftUI Performance](performance.md) — drawingGroup, `.equatable()`, Lazy 컨테이너, state hoisting, `_printChanges`

## 자주 묻는 질문

- `@StateObject` vs `@ObservedObject` → [state-management.md](state-management.md)
- `@State` vs `@Binding` → [state-management.md](state-management.md)
- Observation이 기존 `ObservableObject` 대비 좋은 점 → [observation-macro.md](observation-macro.md)
- View가 struct인 이유 → [declarative-and-view-struct.md](declarative-and-view-struct.md)
- body가 자주 호출돼도 괜찮은가 → [declarative-and-view-struct.md](declarative-and-view-struct.md)
- `.id()`와 `@State` 초기화 관계 → [view-identity-and-lifetime.md](view-identity-and-lifetime.md)
- frame이 적용 안 되는 것처럼 보일 때 → [layout-system.md](layout-system.md)
