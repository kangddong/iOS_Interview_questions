# View Identity와 Lifetime

> 한 줄 요약 — SwiftUI에서 *같은 View인가 다른 View인가*를 결정하는 것은 **identity**다. identity가 같으면 상태/애니메이션이 이어지고, 달라지면 *새로 만들어지며 @State가 초기화*된다.

## 두 종류의 identity

### 1) Structural identity

View 트리에서의 *위치*로 결정. 같은 자리에 같은 종류의 View가 있으면 동일 identity.

```swift
if isOn {
    Text("ON")
} else {
    Text("OFF")
}
```

이 둘은 *서로 다른 위치*로 간주 → 토글 시 새 View로 교체.

### 2) Explicit identity (`.id(...)`)

```swift
ForEach(items) { item in
    Row(item: item).id(item.id)
}
```

`.id()`로 명시한 값이 바뀌면 SwiftUI는 *전혀 다른 View*로 간주. 내부 `@State`도 reset.

## @State는 identity에 묶여 있다

```swift
struct Counter: View {
    @State var count = 0
    var body: some View { Button("\(count)") { count += 1 } }
}

struct Parent: View {
    @State var key = UUID()
    var body: some View {
        Counter().id(key)
        Button("reset") { key = UUID() }      // counter의 count가 0으로 초기화
    }
}
```

`.id(key)`가 바뀌는 순간 Counter는 *새 인스턴스*로 간주되어 `count`도 리셋된다.

## ForEach에서 잘못된 id

```swift
ForEach(items, id: \.self) { ... }   // items 요소가 동등성 깨지면 reorder/insert 추적 실패
```

올바른 식별 키 (보통 별도 `id: UUID`)를 쓰지 않으면:
- 잘못된 row가 애니메이션됨
- 입력 중인 TextField가 reset되는 등의 버그

`Identifiable` 채택해서 `id` 명확히 표현하는 게 베스트.

## if/else, switch — branch가 identity를 만든다

```swift
if user.isLoggedIn {
    HomeView()
} else {
    LoginView()
}
```

이 분기는 *서로 다른 identity*. 전환 시 HomeView가 통째로 새로 만들어짐.

같은 identity로 *내용만 바꾸려면* 같은 View 안에서 데이터로 분기:

```swift
HomeView(state: user.isLoggedIn ? .home : .login)
```

## AnyView — identity 정보 손실

```swift
@ViewBuilder
var content: some View {
    if foo { A() } else { B() }      // ✅ ViewBuilder가 type-erase 없이 처리
}

var content: AnyView {
    foo ? AnyView(A()) : AnyView(B()) // ❌ identity 추적이 단순 AnyView로 합쳐져 버림
}
```

`AnyView`는 가능한 피하라 — 성능과 identity 추적에 불리.

## onAppear / onDisappear

identity가 같은 View가 *재계산만* 되면 `onAppear`는 다시 호출되지 않는다. identity가 바뀌어 *새로 만들어졌을 때* 호출됨.

```swift
.onAppear { /* identity가 새로 등장한 시점 */ }
```

## task 모디파이어와 cancel

```swift
.task(id: searchText) {
    let result = try? await search(searchText)
    self.result = result
}
```

`task(id:)`는 id가 바뀌면 *이전 task를 취소하고 새 task 시작*. 검색어가 빠르게 바뀌는 경우 자동 디바운스 비슷한 효과.

## 흔한 함정 / Follow-up

- **Q. View가 사라졌다 다시 나타나면 @State가 보존되나?**
  identity가 같다면 보존. 부모가 분기로 다른 가지를 그렸다 돌아왔다면 identity가 새로 생긴 것 → 초기화.

- **Q. `.id(uuid)`를 매 frame마다 새 UUID로 주면?**
  매번 새 View로 인식 → @State 초기화 + 애니메이션 안 됨. 의도한 게 아니면 절대 금지.

- **Q. ForEach에서 `id: \.self`를 쓰는 게 안 좋은 이유?**
  값 동등성에 의존. 두 row가 같은 값이면 충돌, 값이 바뀌면 *새 row*로 인식. `Identifiable`로 안정적인 키 사용.

- **Q. NavigationStack에서 push했다 pop하면 화면이 새로 만들어지나?**
  push 시 새 destination View 생성. pop 시 destruction. 다시 push하면 또 새 인스턴스.

- **Q. `onAppear`이 두 번 호출돼요.**
  TabView의 lazy loading, NavigationStack 전이, geometry 변화로 부모 view가 재구성될 때 등. 멱등하게 짤 것.

## 참고

- WWDC 2021: Demystify SwiftUI (Identity, Lifetime, Dependencies)
- WWDC 2023: Demystify SwiftUI performance
