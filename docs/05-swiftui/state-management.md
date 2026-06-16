# 상태 관리: @State / @Binding / @StateObject / @ObservedObject / @EnvironmentObject

> 한 줄 요약 — SwiftUI에서 *상태의 소유권*과 *전달 방향*에 따라 다른 프로퍼티 래퍼를 쓴다. **누가 만들고 누가 빌리느냐**가 선택의 핵심.

도입 버전: 모두 iOS 13+, `@StateObject`는 iOS 14+

## 한눈에

| 래퍼 | 타입 | 소유권 | 용도 |
|---|---|---|---|
| `@State` | 값 타입 | 자기 자신 | View 내부의 작은 상태 |
| `@Binding` | 값 타입 | 부모가 소유, 자식이 빌림 | 자식에게 *읽기/쓰기* 권한 |
| `@StateObject` | class (`ObservableObject`) | 자기 자신이 *생성/유지* | 화면에서 한 번 만들 ViewModel |
| `@ObservedObject` | class (`ObservableObject`) | 외부에서 받은 객체 | 부모가 만든 ViewModel을 자식이 관찰 |
| `@EnvironmentObject` | class (`ObservableObject`) | 환경에서 주입 | 깊은 트리에 공유 |

## @State — View 내부 상태

```swift
struct CounterView: View {
    @State private var count = 0
    var body: some View {
        Button("inc \(count)") { count += 1 }
    }
}
```

- 이 View가 *최초 등장할 때 한 번* 백킹 스토리지가 만들어지고, View struct가 매번 새로 만들어져도 보존됨.
- 값 타입 전용 (struct, enum, primitives).
- 보통 `private` — 외부에서 접근하지 않는 진짜 *내부* 상태.

## @Binding — 자식에게 권한 위임

```swift
struct Parent: View {
    @State private var text = ""
    var body: some View { Child(text: $text) }   // $로 binding 생성
}

struct Child: View {
    @Binding var text: String
    var body: some View { TextField("", text: $text) }
}
```

- `$state`는 binding을 만들어 줌 (projected value).
- 자식은 *읽고 쓰지만 소유하지 않음*. 부모의 state가 진실.

## @StateObject vs @ObservedObject

이 둘이 가장 헷갈리는 포인트.

```swift
class VM: ObservableObject {
    @Published var name = ""
}

// ✅ 화면이 만든다 — 한 번만 생성, View 재생성에도 살아남음
struct A: View {
    @StateObject private var vm = VM()
    var body: some View { B(vm: vm) }
}

// ✅ 외부에서 받음
struct B: View {
    @ObservedObject var vm: VM
    var body: some View { Text(vm.name) }
}
```

**핵심 차이**: `@ObservedObject`는 객체 *수명을 책임지지 않음*. View가 부모에 의해 자주 재생성되면, 매번 새로운 VM을 받게 되어 상태가 날아감.

```swift
// ❌ 부모가 재생성되면 VM도 재생성
struct A: View {
    var body: some View { B(vm: VM()) }
}
```

→ 이 경우 B에서 `@ObservedObject`로 받으면 매번 새 VM. `@StateObject`로 *B 안에서* 만들어야 안정적. 또는 *부모가 `@StateObject`로 가지고 있다가 자식에 전달*.

## @EnvironmentObject — 깊은 트리 공유

```swift
class Session: ObservableObject { @Published var user: User? }

@main
struct App: App {
    @StateObject var session = Session()
    var body: some Scene {
        WindowGroup { Root().environmentObject(session) }
    }
}

struct DeepView: View {
    @EnvironmentObject var session: Session
    var body: some View { Text(session.user?.name ?? "") }
}
```

- 중간 view들이 prop을 *드릴링하지 않아도* 됨.
- 단, `environmentObject`를 안 넣고 사용하면 **런타임 크래시**. 컴파일러가 못 잡음.

## @Environment — 시스템 값 (덤)

```swift
@Environment(\.colorScheme) var scheme
@Environment(\.dismiss) var dismiss
```

테마, 로케일, dismiss 액션 등 SwiftUI/시스템이 채워 주는 값.

## iOS 17+ — Observation 매크로 등장

iOS 17부터 `@Observable` 매크로로 `ObservableObject` + `@Published` 보일러플레이트를 없앨 수 있고, 자식에서는 `@State`/`@Bindable`/`@Environment` 만으로 충분 (Object 시리즈 거의 불필요).

→ 자세히는 [observation-macro.md](observation-macro.md)

## 비교 — 언제 무엇을 쓰나

```
값 타입 작은 상태?
 ├─ 자기 거 → @State
 └─ 부모 것 빌림 → @Binding

ObservableObject?
 ├─ 이 View가 만들고 유지 → @StateObject
 ├─ 외부에서 받음 → @ObservedObject
 └─ 깊은 트리에 공유 → @EnvironmentObject (+ @Environment)

iOS 17+ → @Observable + @State/@Bindable/@Environment 권장
```

## 흔한 함정 / Follow-up

- **Q. `@StateObject`를 자식 View에서 받는 객체에 쓰면?**
  자식이 처음 만나는 객체로 *고정* — 부모가 다른 객체를 넘겨도 무시됨. 외부 주입은 `@ObservedObject`.

- **Q. `@ObservedObject`로 받았는데 상태가 날아가요.**
  부모가 자식 View struct를 자주 재생성하는데, 객체 수명 관리자가 없는 경우. 객체 소유는 *상위 어딘가에서* `@StateObject`로 해야 함.

- **Q. `@Published` 없이 변경하면?**
  변경되어도 SwiftUI가 모름. View가 갱신되지 않음. iOS 17+ `@Observable`은 자동 추적이라 이 문제 없음.

- **Q. struct에 `@Published`?**
  불가. `@Published`는 `ObservableObject` 클래스 안에서만.

- **Q. `@EnvironmentObject`를 SwiftUI Preview에서 쓰면 크래시.**
  `previewProvider`에서도 `.environmentObject(...)`를 줘야 함. Preview만의 mock을 주입하는 흔한 패턴.

- **Q. `@State`를 외부에서 set 하고 싶다.**
  `@State`는 internal 용도. 외부 노출이 필요하면 `@Binding`으로 받거나 ObservableObject 패턴.

## 참고

- Apple Docs: Managing model data in your app
- WWDC 2020: Data Essentials in SwiftUI
- WWDC 2023: Discover Observation in SwiftUI
