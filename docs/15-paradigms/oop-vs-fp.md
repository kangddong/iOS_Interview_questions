# OOP vs FP — 상태 관리 철학과 Swift의 하이브리드

> 한 줄 요약 — OOP는 *상태를 객체에 가두고 메시지로 협력*, FP는 *상태 변경 없이 값을 변환*. Swift는 둘을 *직교 분리*해 객체로 *정체성*을, 값/함수로 *변환과 흐름*을 모델링하는 **멀티 패러다임** 언어다. 면접에서 *어느 한 쪽을 옹호*하는 답변은 위험.

## 비교 매트릭스

| 측면 | OOP | FP |
|---|---|---|
| 1차 단위 | 객체 (상태 + 동작) | 함수 (변환) |
| 상태 | 객체 내부 가변 | 불변 + 새 값 생성 |
| 재사용 | 상속 / 합성 | 함수 합성 / 고차 함수 |
| 다형성 | vtable, witness | parametric polymorphism (제네릭) |
| 동시성 | lock, actor 필요 | 값 불변으로 *기본 안전* |
| 부작용 | 객체 메서드에 내재 | 경계로 격리 |
| 도메인 모델링 | 정체성 가진 엔티티 | 데이터 흐름/변환 |
| 디버깅 | 상태 추적 어려움 | 함수 합성 추적 어려움 |

## Swift의 *직교 분리*

```
정체성/공유 상태 → class / actor   (OOP)
값/스냅샷/변환    → struct / enum / 함수  (FP)
```

전형적 구조:

```swift
// FP-friendly: 도메인 데이터
struct User: Codable, Identifiable, Equatable {
    let id: UUID
    let name: String
    let email: String
}

// OOP-friendly: 정체성 + 라이프사이클
final class UserSession {
    private var current: User?
    func login(_ user: User) { current = user }
    func logout() { current = nil }
}

// FP-friendly: 순수 변환
extension Array where Element == User {
    func sorted(by name: ()) -> [User] { self.sorted { $0.name < $1.name } }
    func active() -> [User] { /* ... */ self }
}
```

## 면접 사례별 선택 기준

### 1) 새 화면의 ViewModel — class? struct?

대부분 *class* (`@Observable`) — UI lifetime 동안 *살아 있어야 할* 상태 보관.

내부 *순수 변환 로직*은 별도 함수/static으로:

```swift
@Observable
final class HomeViewModel {
    var items: [Item] = []
    var query: String = ""
    var filteredItems: [Item] { Self.filter(items, by: query) }   // 순수

    static func filter(_ items: [Item], by query: String) -> [Item] {
        guard !query.isEmpty else { return items }
        return items.filter { $0.title.localizedCaseInsensitiveContains(query) }
    }
}
```

### 2) 동시성 안전

OOP: lock 또는 actor로 *상태 보호*
FP: 불변 값을 *각 task가 자기 사본 처리*

```swift
// OOP — actor
actor Counter {
    private var n = 0
    func incr() { n += 1 }
}

// FP — 변환만, 상태 X
func incrementAll(_ xs: [Int]) -> [Int] { xs.map { $0 + 1 } }
```

### 3) 코드 재사용

OOP — 상속 또는 strategy 객체 주입
FP — 고차 함수 인자

```swift
// OOP
protocol Sortable { func key() -> String }
final class CaseInsensitiveSorter { /* ... */ }

// FP
[user1, user2].sorted { $0.name.lowercased() < $1.name.lowercased() }
```

대부분 FP가 짧음. OOP가 *상태나 정체성을 동반*해야 의미 있음.

## SwiftUI는 FP 친화적

```swift
struct ContentView: View {
    @State private var items: [Item] = []
    var body: some View {
        List(items) { item in
            Text(item.title)
        }
        .task {
            items = await fetchItems()       // 불변 데이터를 *재할당*
        }
    }
}
```

- View는 *값 타입 + 선언적*
- state 변화 → 새 body 계산 → diff 후 렌더
- mutation 자체가 *재할당으로 표현*

자세히는 [imperative-vs-declarative.md](imperative-vs-declarative.md).

## UIKit은 OOP

```swift
class HomeViewController: UIViewController {
    private let tableView = UITableView()
    private var items: [Item] = [] { didSet { tableView.reloadData() } }
}
```

- *명시적 상태 변경*과 *imperative UI 호출*
- view = 객체, lifecycle 메서드로 상태 전이
- 대신 *불변 모델 데이터* + *함수형 변환 파이프*를 안에 두는 게 좋음

## *Functional Core, Imperative Shell*

실용 패턴: 핵심 비즈니스 로직은 *순수 함수*, 부작용/UI/IO는 *얇은 객체 셸*에서.

```
┌──────────────────────────┐
│ Imperative Shell         │  UIKit/SwiftUI, Network, DB
│   ↓ pure inputs          │
│ ┌────────────────────┐  │
│ │ Functional Core    │  │  순수 변환, 정렬, 합산, 비즈니스 규칙
│ │ pure / immutable   │  │
│ └────────────────────┘  │
│   ↑ pure outputs         │
└──────────────────────────┘
```

테스트:
- Functional Core → unit test로 *대규모 커버*
- Imperative Shell → 통합/UI test로 *얇게* 검증

TCA가 이 철학의 대표 구현. Reducer = 순수 함수, Effect = 셸.

## 면접 답변 흐름

*"OOP와 FP 중 어느 쪽을 선호하나"*:

1. **양자택일이 아니라 직교 분리** — 정체성/공유 상태는 OOP, 변환/흐름은 FP
2. **Swift가 둘을 *직접 지원***: class/actor + struct/enum + 고차 함수 + Sendable
3. **SwiftUI는 FP 친화, UIKit는 OOP 기반** — 도메인 선택 시 합리적 매칭
4. **Functional Core, Imperative Shell** 패턴이 실용적 정답에 가까움
5. *경험상* 큰 앱일수록 *상태 격리 + 순수 변환*이 유지보수에 유리

## 흔한 함정 / Follow-up

- **Q. OOP가 *더 느리다*?**
  case-by-case. vtable 1 인디렉션 vs 함수 합성 오버헤드. 핫패스만 측정/최적화.

- **Q. FP가 *항상 안전*한가?**
  데이터가 불변이라도 *closure가 외부 가변 참조 캡처*하면 race 가능. capture list와 Sendable로 차단.

- **Q. iOS *시니어 면접*에서 자주 묻는 비교는?**
  *왜 SwiftUI는 선언형인가*, *왜 Swift는 POP를 권장*, *Redux/TCA가 FP-influenced인 이유*.

- **Q. *완전 FP*로 iOS 앱 만들기?**
  Apple SDK가 OOP라 실용적으로 불가. *셸은 OOP, 코어는 FP*가 합리적.

- **Q. 데이터바인딩(@State/@Binding)이 FP 위반?**
  사용자 인터랙션이라는 *부작용*을 *값 변화*로 추상화. 본질적으론 FP 친화적.

- **Q. 객체 정체성이 *없어도 되는 도메인*?**
  값 자체로 의미 완결한 것 (좌표, 색상, 시간, 금액). 정체성 비교가 의미 없으면 struct.

## 참고

- *Composable Architecture* (Point-Free)
- *Domain Modeling Made Functional* (Scott Wlaschin)
- *Object-Oriented Programming versus Abstract Data Types* (W. R. Cook)
- WWDC 2015: Protocol-Oriented Programming + Building Better Apps with Value Types
