# SwiftUI Performance (View Update / drawingGroup / Equatable / Lazy)

> 한 줄 요약 — SwiftUI는 *body 호출 비용은 싸지만, body가 너무 자주 호출되거나 너무 큰 view tree가 매번 diff*되면 hitch가 발생한다. 핵심은 ① **view identity 안정화** ② **Equatable로 body 호출 차단** ③ **Lazy 컨테이너로 자식 평가 지연** ④ **drawingGroup으로 Metal 합성**.

## body 호출 ≠ render

```
state change → diff → 실제 변경된 view만 render
```

body가 여러 번 호출돼도 *동일 결과*면 SwiftUI가 render는 건너뜀. 그래도 *큰 body는 diff 비용*이 들기 때문에 무한정 자주 호출되면 hitch.

## `@Observable` (iOS 17+)이 ObservableObject보다 빠른 이유

- ObservableObject: `@Published` 하나 변경 시 *전체 ObservedObject 의존 View body 재호출*
- @Observable: KeyPath 단위 *접근 추적* → 그 KeyPath 의존 View만 재호출 (precise tracking)

→ Hello/카운터 같은 작은 예는 차이 없지만 *큰 모델 + 많은 화면*에선 측정 가능한 차이.

자세히는 [observation-macro.md](observation-macro.md).

## Identity 안정화

```swift
ForEach(items, id: \.self) { item in ... }    // ❌ Hashable 값이 같으면 id 동일
ForEach(items, id: \.id) { item in ... }      // ✅ 도메인 id
ForEach(items) { item in ... }                 // Identifiable 자동
```

ID 불안정 → 매 업데이트마다 *create/destroy* → 상태 초기화, 애니메이션 깨짐, 비싼 onAppear 재실행.

자세히는 [view-identity-and-lifetime.md](view-identity-and-lifetime.md).

## `Equatable` View로 body 호출 차단

```swift
struct ExpensiveRow: View, Equatable {
    let item: Item

    var body: some View { ... }

    static func == (l: Self, r: Self) -> Bool {
        l.item.id == r.item.id && l.item.title == r.item.title
    }
}

// 사용
ExpensiveRow(item: item).equatable()
```

부모 state가 바뀌어도 `==`가 true면 SwiftUI가 body 호출 skip.

주의: state 의존 *모든 필드*를 `==`에 포함해야 함. 누락 시 stale UI.

## Lazy 컨테이너

```swift
ScrollView { VStack { ForEach(items) { ... } } }       // ❌ 모든 자식 즉시 평가
ScrollView { LazyVStack { ForEach(items) { ... } } }   // ✅ on-screen 직전 평가
```

- VStack/HStack: 모든 자식 항상 평가
- LazyVStack/LazyHStack/LazyVGrid/LazyHGrid: 보이는 영역만 평가
- List: 자동 lazy (UITableView 기반)

큰 목록은 무조건 Lazy.

## `drawingGroup`

```swift
ComplexGraphics()
    .drawingGroup()    // Metal layer로 단일 합성
```

- 복잡한 그라데이션, 블러, 다중 shape를 *off-screen Metal 렌더링*
- 정적 콘텐츠에 유리. 자주 변하는 콘텐츠엔 *역효과*
- iOS 13+

## `Canvas` (iOS 15+)

```swift
Canvas { context, size in
    context.fill(Path(...), with: .color(.blue))
}
```

- 즉시 모드 Metal 렌더링. 데이터 시각화/게임에 유리
- ViewBuilder의 *수많은 작은 View*보다 효율적

## `task` vs `onAppear`

```swift
.task { await load() }       // view lifetime에 묶인 async, 자동 cancel
.onAppear { Task { ... } }   // 매번 직접 관리
```

`.task`가 *cancellation, lifecycle 자동화* 측면에서 우수. iOS 15+.

## State Hoisting

자식이 자주 변경되는 작은 state를 가지면 그 자식만 body 호출:

```swift
// ❌ 부모에서 textField text 보관
struct Parent: View {
    @State var text = ""
    var body: some View {
        VStack {
            TextField("...", text: $text)   // 부모 body 매 keystroke 재호출
            ExpensiveList()
        }
    }
}

// ✅ 자식으로 state 내림
struct Parent: View {
    var body: some View {
        VStack {
            TextFieldChild()      // 자체 @State, 부모는 영향 없음
            ExpensiveList()
        }
    }
}
```

## 프로파일링

- **Xcode → Debug → SwiftUI**: body 호출 횟수, identity 변화 시각화
- **Instruments → SwiftUI**: view update 비용, animation hitch
- **`_printChanges()`** (iOS 17+): body 호출 시 *어떤 state가 변해서*인지 콘솔에 출력

```swift
var body: some View {
    let _ = Self._printChanges()
    Text("...")
}
```

## 흔한 함정 / Follow-up

- **Q. AnyView가 비싼 이유?**
  type erase → SwiftUI가 *구조 동일성 추적 불가* → 매번 새로운 view로 취급. 비싼 reconciliation. *모든 case에 같은 구체 타입*을 반환하도록 ViewBuilder/`@ViewBuilder` 활용.

- **Q. `id` modifier로 강제 재생성?**
  `.id(value)` 사용 시 value 변경 = *완전 새 view* → state 초기화. transition도 한다. *원할 때만* 사용.

- **Q. `if` 분기는 비싼가?**
  자식 type이 바뀌면 destroy/create. `if let` 옵셔널 풀기는 흔하지만 분기 *내부 view tree가 크면* 비용. 가능하면 *modifier*로 표현.

- **Q. `GeometryReader` 남용 시?**
  레이아웃 종속성 추가로 *상위 layout pass 영향*. flexible하면 `containerRelativeFrame`(iOS 17+) 등 대안.

- **Q. *view가 너무 작아* identity가 흔들리는 경우?**
  `EmptyView` + extension으로 inline modifier 결합 시 SwiftUI가 *최적화 못 함*. ViewModifier 별도 struct로 정의.

## 참고

- WWDC 2020: Stacks, Grids, and Outlines (Lazy)
- WWDC 2021: Demystify SwiftUI
- WWDC 2023: Demystify SwiftUI performance
- Apple: SwiftUI Performance
