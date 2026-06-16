# TCA (The Composable Architecture)

> 한 줄 요약 — Point-Free에서 만든 **단방향 데이터 흐름 + 순수 함수형 reducer + 명시적 Effect** 기반의 SwiftUI/UIKit 아키텍처. 테스트 가능성과 컴포지션을 최우선으로 한다.

도입: 2020 ~ (현재 v1.x, Swift 5.9 매크로 활용)

## 핵심 4가지

```
   View → sends Action → Reducer (pure)
                          ↓ updates State
                          ↓ returns Effect (side effect)
                          ↓
                       Effect 실행 → 새 Action 다시 보냄 → Reducer
```

1. **State**: 화면이 가질 모든 상태를 한 struct에.
2. **Action**: 일어날 수 있는 모든 사건의 enum.
3. **Reducer**: `(State, Action) -> Effect`. *순수 함수* — 같은 입력엔 같은 출력.
4. **Effect**: 비동기 작업. 결과를 다시 Action으로 돌려보냄.

## 최소 예시 (Reducer 매크로)

```swift
@Reducer
struct CounterFeature {
    @ObservableState
    struct State: Equatable { var count = 0 }

    enum Action {
        case incrementButtonTapped
        case decrementButtonTapped
        case timerTicked
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .incrementButtonTapped: state.count += 1; return .none
            case .decrementButtonTapped: state.count -= 1; return .none
            case .timerTicked: state.count += 1; return .none
            }
        }
    }
}

struct CounterView: View {
    @Bindable var store: StoreOf<CounterFeature>
    var body: some View {
        VStack {
            Text("\(store.count)")
            Button("+") { store.send(.incrementButtonTapped) }
            Button("-") { store.send(.decrementButtonTapped) }
        }
    }
}
```

## Effect

```swift
case .startTimer:
    return .run { send in
        for await _ in clock.timer(interval: .seconds(1)) {
            await send(.timerTicked)
        }
    }
    .cancellable(id: TimerID.self)
```

비동기/네트워크/타이머 같은 부수효과는 항상 *Effect*로 표현. State 변경은 Reducer 안에서만.

## 컴포지션

여러 작은 reducer를 조립해 큰 feature를 만든다.

```swift
@Reducer
struct AppFeature {
    @ObservableState
    struct State { var counter = CounterFeature.State(); var login = LoginFeature.State() }
    enum Action { case counter(CounterFeature.Action); case login(LoginFeature.Action) }

    var body: some ReducerOf<Self> {
        Scope(state: \.counter, action: \.counter) { CounterFeature() }
        Scope(state: \.login, action: \.login)     { LoginFeature() }
    }
}
```

## 의존성

`@Dependency` 매크로로 외부 의존성을 주입:

```swift
@Reducer
struct LoginFeature {
    @Dependency(\.authClient) var auth
    @Dependency(\.uuid) var uuid
    ...
}
```

테스트에서 `withDependencies { $0.authClient = .mock }`으로 한 줄 교체.

## 테스트 — 가장 큰 강점

```swift
let store = TestStore(initialState: CounterFeature.State()) { CounterFeature() }
await store.send(.incrementButtonTapped) { $0.count = 1 }
await store.send(.decrementButtonTapped) { $0.count = 0 }
```

- *State 변화*가 일치하지 않으면 컴파일러처럼 정확한 차이를 알려 줌.
- *예상하지 못한 effect*가 남아있으면 테스트 실패. → 누락된 부수효과를 못 본 척 못 함.

## 비교 — TCA vs MVVM

| 구분 | MVVM | TCA |
|---|---|---|
| 흐름 | 양방향 가능 | 단방향 강제 |
| 부수효과 | VM 안에 섞임 | Effect로 분리/명시 |
| 테스트 | VM 단위 (수동) | TestStore가 강제적 검증 |
| 보일러플레이트 | 적음 | 많음 (매크로로 완화) |
| 학습 곡선 | 낮음 | 높음 |
| 적정 규모 | 모든 규모 | 중~대, 팀 단위 |

## 흔한 함정 / Follow-up

- **Q. 모든 Action을 enum case로 적어야 하나?**
  맞다. *발생 가능한 사건의 닫힌 집합*이 핵심 가정. 케이스가 많아지면 부분 enum으로 그룹화 (`enum Action { case view(View); case delegate(Delegate) }`).

- **Q. SwiftUI `@Observable`와 어떻게 협력?**
  TCA 1.x는 `@ObservableState` 매크로로 SwiftUI Observation에 통합. View에서 store를 자연스럽게 읽음.

- **Q. 단방향이 강제되면 불편하지 않나?**
  중소 화면에선 분명 보일러플레이트 비용. 다만 *상태가 폭발적으로 늘 때*, *팀이 같은 패턴으로 짤 때*, *스냅샷 테스트가 중요할 때* 가치가 크게 나타남.

- **Q. Effect 취소는?**
  `.cancellable(id:)` + `.cancel(id:)`. 화면이 사라질 때 자동 취소되는 모디파이어도 있음.

- **Q. UIKit에서도 쓸 수 있나?**
  가능. ViewStore를 UIKit VC에 연결. 보통 SwiftUI 환경에서 더 자연스러움.

## 참고

- pointfreeco/swift-composable-architecture
- Point-Free 시리즈 영상
