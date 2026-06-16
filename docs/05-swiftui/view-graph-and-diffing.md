# SwiftUI 내부 — View Graph, Diffing, ViewBuilder

> 한 줄 요약 — 우리가 짠 *View struct*는 *기술서*. SwiftUI는 이를 받아 **내부 ViewGraph(노드 트리)**를 만들고, *struct의 새 값과 이전 값을 비교(diff)*해 변경된 부분만 렌더 트리에 반영한다.

## 3가지 트리

```
View Hierarchy (내가 작성한 struct 트리)
        │
        ▼
View Graph (SwiftUI 내부 — identity, lifetime, dependency 추적)
        │
        ▼
Render Tree (CoreAnimation/Metal로 렌더되는 실체)
```

내가 만든 View struct는 *값*이라 매번 새로 생성되지만, 그 위치(structural identity)에 대응하는 *Graph 노드*는 유지된다.

## ViewBuilder의 정체

```swift
@ViewBuilder
var body: some View {
    if isOn { Text("ON") } else { Text("OFF") }
}
```

`@ViewBuilder`는 *result builder*. 컴파일러가 위 분기를:

```swift
_ConditionalContent<Text, Text>(...)
```

같은 *컴파일 타임에 정해진* generic 타입으로 변환. AnyView 없이 분기 표현이 가능한 이유.

→ [01-swift-language/result-builder-and-macro.md](../01-swift-language/result-builder-and-macro.md)

## Identity — 두 종류

### Structural identity
View 트리의 *위치*로 결정. 같은 자리에 같은 종류 View면 동일 노드.

### Explicit identity (`.id()`)
명시적으로 부여. 값이 바뀌면 *새 View*로 인식.

→ [view-identity-and-lifetime.md](view-identity-and-lifetime.md)

## Diffing 동작

SwiftUI는 prev/new View struct를 비교해:

1. **구조가 같다** (같은 generic 타입) → 자식들로 재귀 비교.
2. **자식 View가 `Equatable`이거나 reflection으로 동일** → skip.
3. **다르다** → 노드 갱신, 필요한 경우 자식 트리 교체.

따라서 *값 비교 비용이 낮은 작은 struct*를 유지하는 것이 성능 핵심.

## Equatable 활용

```swift
struct Row: View, Equatable {
    let item: Item
    static func == (a: Row, b: Row) -> Bool { a.item.id == b.item.id }
    var body: some View { ... }
}

// 또는
.equatable()    // SwiftUI가 reflection 대신 Equatable 사용
```

큰 struct에서 *동일성 판단 비용*을 줄여 diffing을 빠르게.

## body 호출 vs 실제 렌더

- **body 호출**: SwiftUI가 *struct를 다시 evaluate*. 가벼움.
- **diff**: 새 struct vs 이전 struct.
- **render commit**: 변경이 있을 때만.

따라서 *body가 호출되는 횟수* ≠ 실제 렌더 비용. 하지만 body 안에 무거운 작업을 두면 호출만으로도 비싸짐.

## `Self._printChanges()` — 디버깅

```swift
var body: some View {
    let _ = Self._printChanges()
    Text(name)
}
```

이 View가 다시 렌더된 *원인*(어떤 dependency가 변했는지)을 콘솔 출력. iOS 17+ Observation은 더 정밀한 추적.

## Dependency 추적

View가 *읽은* 값만 갱신 트리거에 등록.

- ObservableObject: 객체의 *어떤 변경*이든 갱신.
- `@Observable` (iOS 17+): *읽힌 프로퍼티*만.
- `@State`/`@Binding`: 자기 정의된 의존성.

ObservableObject보다 Observation이 *불필요한 갱신*을 더 줄임.

## 큰 트리 성능 팁

- 이미 변경 없을 게 확실한 큰 서브트리는 *별도 View struct로 분리*하면 diffing 단위가 작아짐.
- `LazyVStack`/`LazyHStack`/`LazyVGrid`: 보이는 영역만 evaluate.
- `List`: 자체적으로 lazy.
- `EquatableView`로 명시적 동등성 단축.

## AnyView가 비싼 이유

`AnyView(...)`는 *generic 타입을 erase*해 단일 wrapper 타입으로 만든다 → diffing이 *내부 비교 정보를 잃음*. 모든 변경에서 보수적으로 갱신. **자주 변하는 곳에 AnyView를 쓰지 말 것.**

분기는 `@ViewBuilder` if/else로 충분.

## 흔한 함정 / Follow-up

- **Q. body가 너무 자주 호출돼서 걱정.**
  호출 자체는 가볍다. 다만 body 안에서 *비싼 계산*을 하면 비용. 계산은 store/computed property에 캐시.

- **Q. `@State`와 `@Observable`이 같이 있을 때?**
  서로 다른 의존성으로 등록. 변경 시 별도 갱신 경로.

- **Q. `.equatable()` 항상 쓰면 좋은가?**
  Equatable 판단이 *동등성 비교 비용 < diff 비용*일 때 유리. 큰 struct에 effective.

- **Q. preview에서 갱신이 이상하게 동작.**
  preview는 *실제 lifetime과 다른* 환경. State 값이 매번 새로 만들어지거나 environment가 다를 수 있음. mock과 함께.

- **Q. `LazyVStack` vs `VStack`?**
  VStack은 *모든 자식을 evaluate*. 100개 행이면 100번 body. LazyVStack은 보이는 만큼만. 큰 리스트면 lazy.

## 참고

- WWDC 2021: Demystify SwiftUI
- WWDC 2023: Demystify SwiftUI performance
- WWDC 2024: Migrate to Observation
