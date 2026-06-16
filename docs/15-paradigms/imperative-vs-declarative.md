# 명령형 vs 선언형 (Imperative vs Declarative)

> 한 줄 요약 — *명령형*은 **어떻게(how)** 단계별로 지시, *선언형*은 **무엇(what)** 결과만 기술하고 *어떻게는 framework가 결정*. UIKit이 명령형, SwiftUI가 선언형의 대표. 선언형은 *의도가 명확*하지만 *상태 도출 책임*이 framework로 넘어가 디버깅 모델이 달라진다.

## 본질적 차이

```swift
// 명령형 — 단계 지시
var sum = 0
for x in [1, 2, 3, 4] {
    if x % 2 == 0 { sum += x }
}

// 선언형 — 결과 기술
let sum = [1, 2, 3, 4].filter { $0 % 2 == 0 }.reduce(0, +)
```

선언형 코드의 핵심은:
1. *최종 형태/결과*를 기술
2. 그 *경로*는 framework/런타임이 결정
3. 코드의 *의도*와 *구현*이 분리

## UIKit (명령형)

```swift
class HomeViewController: UIViewController {
    private let tableView = UITableView()
    private var items: [Item] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(tableView)
        tableView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            // ...
        ])
        tableView.dataSource = self
    }

    func fetchAndReload() {
        Task {
            items = try await api.fetchItems()
            await MainActor.run { tableView.reloadData() }
        }
    }
}
```

명시적 단계:
1. view 만들기
2. 자식으로 추가
3. constraint 거기
4. data 받아서
5. data source 갱신 *호출*

→ *모든 transition*을 직접 명령.

## SwiftUI (선언형)

```swift
struct HomeView: View {
    @State private var items: [Item] = []

    var body: some View {
        List(items) { item in
            Text(item.title)
        }
        .task {
            items = (try? await api.fetchItems()) ?? []
        }
    }
}
```

선언:
- "items가 있으면 List 형태로 보여줘"
- "task 시점에 items를 가져와"

→ *최종 상태*만 기술. 어떻게 그릴지는 SwiftUI가 결정.

## 트레이드오프

| 측면 | 명령형 (UIKit) | 선언형 (SwiftUI) |
|---|---|---|
| 코드량 | 보통 더 많음 | 적음 |
| 학습 곡선 | 흐름이 *눈에 보임* | 처음엔 직관에 안 맞음 |
| 상태 흐름 | 명시적 (`reloadData`) | 암묵적 (state 변경 → 자동) |
| 디버깅 | 단계별 추적 | "왜 안 그려지지?" → identity 의심 |
| 동적/imperative API | 자유 | 제한 (escape hatch 필요) |
| 성능 모델 | 직접 제어 | framework 위임 |
| 코드 진단 | breakpoint 단계별 | `_printChanges()` 같은 도구 |

## 선언형의 *숨은 비용*

### 1) Identity 책임

```swift
ForEach(items, id: \.self) { item in ... }    // ❌ 위험
ForEach(items) { item in ... }                 // ✅ Identifiable
```

명시적 id가 잘못되면 diff 실패 → state 초기화/transition 깨짐.

자세히는 [05-swiftui/view-identity-and-lifetime.md](../05-swiftui/view-identity-and-lifetime.md).

### 2) body 호출 빈도

SwiftUI는 *body를 자주 호출*. 비싼 작업을 body에 두면 hitch. *순수 view 표현* 외엔 빼야 함.

### 3) Escape hatch가 필요한 경우

- complex animation
- custom drawing 일부
- 외부 SDK가 UIKit 기반
- imperative API (TextEditor의 정확한 cursor 위치 등)

→ `UIViewRepresentable`로 다리 놓음. 선언형 모델 안에 *imperative 섬* 만듦.

## 명령형이 *여전히* 필요한 곳

- **시스템 통합**: AVFoundation, Metal, MapKit detail API
- **복잡한 인터랙션**: 정밀한 gesture 조합, pan/drag 미세 제어
- **OS 통합**: NotificationCenter 옵저버, KVO, ObjC 인터롭
- **알고리즘 자체**: 정렬/탐색 같은 *단계 알고리즘*은 명령형이 자연스러움

## 선언형 사고 전환의 핵심

명령형: *"이 버튼 누르면 → A 실행 → B 갱신"*
선언형: *"이 상태일 땐 이렇게 보이고, 이 상태일 땐 저렇게 보임"*

즉:
- **state machine을 명시적으로 만든다**
- 상태 변화 = 새 값 부여 (불변 데이터, FP 친화)
- view는 *현재 상태의 함수* (`f(state) = UI`)

## 면접 답변 흐름

*"SwiftUI는 왜 선언형으로 설계됐는가"*:

1. **UI 코드의 *의도*와 *구현*을 분리** — 가독성/유지보수
2. **diff 기반 update**로 *수동 reload 코드 제거*
3. **상태와 UI의 *일관성 보장*** — UIKit의 cell 상태 누락 같은 버그 제거
4. **multi-platform** (iOS/macOS/watchOS/tvOS/visionOS) 자연스러운 추상화
5. *그러나* identity/lifetime/성능 모델을 이해해야 함 → 시니어 변별점

## 흔한 함정 / Follow-up

- **Q. *완전 선언형*이 항상 좋은가?**
  아니다. 정밀 제어가 필요한 영역은 명령형이 적합. 하이브리드가 현실.

- **Q. SwiftUI의 *imperative API*?**
  `ScrollViewProxy.scrollTo`, `FocusState` 등. 선언형 모델 안의 명령적 호출.

- **Q. *상태 도출이 모호*해서 디버깅이 어렵다?**
  Apple이 `_printChanges()` (iOS 17+)로 보강. SwiftUI Instruments도 사용.

- **Q. SwiftUI Body가 *매번 호출*돼도 괜찮은 이유?**
  값 타입 + 작은 단위 + diffing. body 비용 < UIKit `reloadData` 비용인 경우 많음.

- **Q. *React/Flutter*와 SwiftUI의 차이?**
  본질은 같음 — *state → declarative UI*. SwiftUI는 *값 타입*과 *KeyPath 기반 관찰*에서 차별화.

- **Q. UIKit 앱을 *부분적으로* SwiftUI로 옮긴다면?**
  `UIHostingController`로 wrapping. 신규 화면부터 점진적. 완전 일원화 아니어도 OK.

- **Q. 명령형/선언형이 *FP/OOP*와 직교?**
  맞다. UIKit = OOP + imperative, SwiftUI = OOP(View struct는 OOP 표현) + declarative + FP-influenced.

## 참고

- WWDC 2019: Introducing SwiftUI
- WWDC 2021: Demystify SwiftUI
- WWDC 2023: Demystify SwiftUI performance
- *Reactive Programming with Combine* / *Thinking in React* (개념 공유)
