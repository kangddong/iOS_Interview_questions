# Observation 매크로 (@Observable / @Bindable)

> 한 줄 요약 — iOS 17+에서 도입된 새 관찰 모델. **`ObservableObject` + `@Published`의 보일러플레이트를 없애고**, View가 *실제로 읽은 프로퍼티*만 정밀하게 추적해 불필요한 재계산을 줄인다.

도입 버전: iOS 17+ / macOS 14+ (Swift 5.9 매크로 기반)

## 무엇이 좋아졌나

기존 `ObservableObject`의 문제:

- 모든 변경이 *전체 View 갱신*을 일으킴 (의존하지 않은 프로퍼티가 바뀌어도).
- `@Published`를 매 프로퍼티마다 적어야 함.
- struct 형태의 model을 못 씀 (반드시 class).

`@Observable`은:

- *읽힌 프로퍼티 단위*로 정밀 추적 → 더 적은 body 호출.
- `@Published` 없이 모든 stored property 자동 추적.
- `ObservableObject` 채택 불필요.

## 기본

```swift
import Observation

@Observable
final class VM {
    var name = ""
    var age = 0

    @ObservationIgnored var cache: [String: Data] = [:]   // 추적 제외
}

struct ContentView: View {
    @State private var vm = VM()       // 직접 @State 사용 — @StateObject 불필요
    var body: some View {
        TextField("name", text: $vm.name)   // 어... 이건 @Bindable 필요
        Text(vm.name)
    }
}
```

## @Bindable — binding이 필요할 때

```swift
struct EditView: View {
    @Bindable var vm: VM     // 외부에서 받은 @Observable에 binding을 만들 때
    var body: some View {
        TextField("name", text: $vm.name)
    }
}
```

또는 직접 만든 경우:

```swift
struct ContentView: View {
    @State private var vm = VM()
    var body: some View {
        @Bindable var vm = vm    // 인라인으로 bindable 변환
        TextField("name", text: $vm.name)
    }
}
```

## 정밀 추적의 의미

```swift
@Observable class VM { var a = 0; var b = 0 }

struct V: View {
    let vm: VM
    var body: some View {
        Text("\(vm.a)")        // a만 읽음
    }
}
```

`vm.b`만 변경되면 `V.body`는 **호출되지 않는다**. 기존 `ObservableObject`라면 `b`만 바뀌어도 갱신 트리거가 들어왔다.

## 마이그레이션 전후

```swift
// Before (iOS 13+)
final class VM: ObservableObject {
    @Published var name = ""
    @Published var age = 0
}

struct V: View {
    @StateObject var vm = VM()
    var body: some View { Text(vm.name) }
}

// After (iOS 17+)
@Observable
final class VM {
    var name = ""
    var age = 0
}

struct V: View {
    @State var vm = VM()
    var body: some View { Text(vm.name) }
}
```

`@StateObject` → `@State`, `@ObservedObject` → 그냥 프로퍼티(let), `@EnvironmentObject` → `@Environment(VM.self)`.

## @Observable + Environment

```swift
@main
struct App: App {
    @State private var session = Session()
    var body: some Scene {
        WindowGroup {
            Root()
                .environment(session)         // environmentObject가 아니라 environment
        }
    }
}

struct Deep: View {
    @Environment(Session.self) private var session
    var body: some View { Text(session.user?.name ?? "") }
}
```

## 비교 — ObservableObject vs @Observable

| 구분 | `ObservableObject` | `@Observable` |
|---|---|---|
| OS 요구 | iOS 13+ | iOS 17+ |
| 보일러플레이트 | `@Published` 매번 | 자동 |
| 추적 단위 | 객체 전체 | 읽힌 프로퍼티 단위 |
| 성능 | 과도한 갱신 | 정밀 |
| 사용 래퍼 | `@StateObject`/`@ObservedObject` | `@State`/`@Bindable`/`@Environment` |
| 호환 | 가장 넓음 | 신규 코드 권장 |

## 흔한 함정 / Follow-up

- **Q. `@Observable` 클래스를 `@StateObject`로 받아도 되나?**
  안 됨. `@StateObject`는 `ObservableObject` 전용. `@State`로 받아라.

- **Q. struct에도 쓸 수 있나?**
  아니, class 전용. struct는 SwiftUI가 자체 diffing.

- **Q. `@ObservationIgnored`는 언제?**
  추적 비용이 부담되는 큰 캐시, 변경되어도 UI에 영향 없는 데이터.

- **Q. iOS 17 미만 지원이 필요하면?**
  계속 `ObservableObject` 사용. `@Observable`은 backport 안 됨.

- **Q. View body에서 `vm.a` 안 읽고 메서드만 호출했더니 갱신이 안 와요.**
  매크로는 *프로퍼티 접근*을 hook. body에서 직접 안 읽었으면 추적 대상이 아님 — 메서드 안에서 읽혀도 자동 추적되지 않으니, 보여 줄 데이터는 body에서 직접 읽어야 함.

## 참고

- WWDC 2023: Discover Observation in SwiftUI
- Swift Evolution: SE-0395 (Observation)
