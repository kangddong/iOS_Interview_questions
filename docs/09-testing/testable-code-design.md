# 테스트 가능한 코드 설계 (Testable Code Design)

> 한 줄 요약 — 테스트는 *나중에 붙이는 것*이 아니라 *설계의 결과*다. "테스트하기 어렵다"는 곧 *결합도가 높다·책임이 섞였다·숨은 의존이 있다*는 설계 신호. DI는 이 설계를 이루는 *여러 도구 중 하나*일 뿐이다.

> 관련 문서: [의존성 주입](../06-architecture/dependency-injection.md) · [Test Strategy](test-strategy.md) · [Mocking 전략](mocking.md)

## 왜 — "테스트하기 어렵다"는 설계 냄새다

면접에서 "이 코드 테스트 어떻게 하죠?"에 *테크닉*만 답하면 주니어, *"이건 테스트가 어렵다 = 설계를 바꿔야 한다는 신호"*라고 답하면 시니어다.

테스트가 어려운 코드의 공통점:
- **숨은 의존성** — `Date()`, `URLSession.shared`, `Foo.shared`를 함수 *안에서* 직접 호출.
- **부수효과와 로직이 한 덩어리** — 계산하면서 네트워크 쏘고 디스크에 쓰고 UI까지 갱신.
- **비결정성** — 같은 입력에 다른 출력 (`Date()`, `UUID()`, `Int.random`).
- **전역 가변 상태** — 싱글턴/static var에 의존 → 테스트 간 상태 누수.

→ 테스트를 위해 코드를 *비트는* 게 아니라, 테스트가 *자연스럽게 되도록* 경계를 긋는다.

## 1. Functional Core, Imperative Shell

핵심 원칙: **순수 로직(결정적·부수효과 없음)을 가운데로 모으고, 부수효과는 가장자리(shell)로 밀어낸다.**

```swift
// ❌ 로직 + 부수효과 혼재 — 테스트하려면 네트워크·시계가 필요
func applyDiscount() async {
    let now = Date()                          // 숨은 시간 의존
    let products = try! await api.fetch()     // 숨은 네트워크 의존
    for p in products where p.expiry > now {
        p.price *= 0.9                        // ← 검증하고 싶은 건 이 규칙뿐
    }
    try! await db.save(products)              // 숨은 디스크 의존
}
```

```swift
// ✅ 규칙을 순수 함수로 추출 — 입력→출력, 부수효과 0
func discounted(_ products: [Product], now: Date) -> [Product] {
    products.map { p in
        guard p.expiry > now else { return p }
        var copy = p; copy.price *= 0.9; return copy
    }
}

// shell: 부수효과(I/O)만 담당, 로직은 위 순수 함수에 위임
func applyDiscount() async throws {
    let products = try await api.fetch()
    let result = discounted(products, now: clock.now())
    try await db.save(result)
}
```

`discounted`는 mock·DI·async 없이 `#expect(discounted(input, now: fixed) == expected)` 한 줄로 끝난다. 검증하고 싶은 *비즈니스 규칙*의 90%는 이렇게 순수 함수로 떨어진다.

## 2. 비결정성을 의존성으로 끌어내라

`Date()`, `UUID()`, `random`, 파일·네트워크는 *전부 주입 가능한 의존성*이다. 함수 안에서 직접 부르는 순간 테스트는 비결정적이 된다.

```swift
// ❌                                  // ✅
struct Order {                         struct Order {
    let id = UUID()                        let id: UUID
    let at = Date()                        let at: Date
}                                          init(id: UUID, at: Date) { ... }
                                       }
// 테스트마다 값이 달라 검증 불가      // Order(id: fixedUUID, at: fixedDate) → 결정적
```

TCA의 `swift-dependencies`는 이걸 표준화했다 — `@Dependency(\.date)`, `@Dependency(\.uuid)`, `@Dependency(\.continuousClock)`. 테스트에서 `withDependencies { $0.uuid = .incrementing }` 한 줄로 교체. (→ [DI 문서](../06-architecture/dependency-injection.md))

## 3. Humble Object — 테스트 못 하는 경계는 *얇게*

`UIViewController`, `View`, 셀처럼 프레임워크가 생명주기를 쥐고 있어 *직접 테스트가 어려운 객체*는 **로직을 들고 있지 않게** 만든다. 로직은 전부 testable한 객체(ViewModel/Reducer/Presenter)로 옮기고, 경계 객체는 *바인딩만* 하는 "겸손한 객체"로 남긴다.

```swift
// ViewController는 로직 0 — ViewModel 출력을 그리기만
final class CartVC: UIViewController {
    let vm: CartViewModel
    func render(_ state: CartViewModel.State) { totalLabel.text = state.totalText }
}

// 검증하고 싶은 건 전부 여기 — VC 없이 단위 테스트
struct CartViewModel {
    func add(_ item: Item, to state: State) -> State { ... }   // 순수
    var totalText: String { ... }
}
```

이게 MVVM/MVP/TCA가 "테스트 가능"한 근본 이유다 — 아키텍처가 곧 *humble object 강제 장치*.

## 4. 전역 상태·싱글턴 직접 호출 제거

`Analytics.shared.log()`를 메서드 안에서 직접 부르면 *글로벌 의존*이라 교체·검증 불가, 테스트 간 상태도 샌다. protocol로 추상화해 주입하되, 기본값으로 싱글턴을 넘기면 호출부는 안 바꿔도 된다.

```swift
protocol AnalyticsType { func log(_ e: Event) }
extension Analytics: AnalyticsType {}

final class HomeVM {
    private let analytics: AnalyticsType
    init(analytics: AnalyticsType = Analytics.shared) { self.analytics = analytics }
    // 테스트: HomeVM(analytics: SpyAnalytics()) → 호출 여부 검증
}
```

## 5. "Seam" — 테스트가 끼어들 이음새를 남겨라

Seam이란 *코드를 수정하지 않고 동작을 바꿔 끼울 수 있는 지점*. protocol 경계, 생성자 파라미터, `URLProtocol` 등록 지점이 전부 seam이다. seam이 없는 코드(= 구체 타입에 직접 결합)는 테스트를 위해 *원본을 뜯어고쳐야* 한다.

| Seam 종류 | 예시 | 끼워 넣는 것 |
|---|---|---|
| 객체 seam | protocol + 생성자 주입 | Mock/Stub/Spy |
| 네트워크 seam | `URLProtocol` 등록 | 가짜 HTTP 응답 |
| 시간 seam | `Clock`/`@Dependency(\.date)` | 고정/즉시 시계 |
| 전역 seam | static 함수 → 주입형 의존 | Fake 구현 |

## 비교 — 같은 로직, testability 차이

| 설계 | 테스트 비용 | 신호 |
|---|---|---|
| 함수 안에서 `Date()`/`shared`/I/O 직접 호출 | 통합 테스트 필요, flaky | ❌ 결합·은닉 |
| 의존성 주입 + 부수효과 분리 | 순수 단위 테스트, 결정적 | ✅ |
| 로직을 VC/View 안에 작성 | 시뮬레이터·UI 테스트 필요 | ❌ humble 위반 |
| 로직을 VM/Reducer로 분리 | VM 단독 단위 테스트 | ✅ |

## 흔한 함정 / Follow-up 질문

- **Q. "테스트 때문에 production 코드를 바꾸는 건 본말전도 아닌가?"**
  - A. 바꾸는 방향이 *대부분 좋은 설계*와 일치한다 — 결합도↓, 책임 분리, 의존성 명시. 테스트는 설계 품질의 *리트머스*. 다만 *테스트만을 위한* 부자연스러운 추상화(과한 protocol 폭발)는 경계.

- **Q. private 메서드가 테스트하기 어렵다.**
  - A. public 인터페이스로 검증하라. private을 직접 테스트하고 싶다면 그건 *별도 책임이 숨어 있다*는 신호 — 타입으로 추출하면 자연히 public이 되고 testable해진다.

- **Q. 모든 걸 protocol로 추상화해야 하나?**
  - A. 아니다. *교체·검증이 필요한 경계*(네트워크, 시계, 영속성, 분석)에만. 순수 값 타입/순수 함수는 추상화 없이 그대로 테스트가 가장 쉽다. 추상화는 비용이다.

- **Q. 레거시 코드라 seam이 하나도 없다. 어디부터?**
  - A. 가장 흔한 진입점 — 생성자 파라미터 추가(기본값으로 기존 동작 유지) → 그 의존을 protocol로 → 테스트 작성 → 리팩터. *characterization test*(현재 동작을 박제하는 테스트)부터 깔고 움직인다.

- **Q. SwiftUI `View`는 어떻게 testable하게?**
  - A. View에 로직을 넣지 말 것. `@Observable` 모델/Reducer로 상태와 전이를 빼고, View는 *상태→픽셀* 매핑만. 모델은 단위 테스트, View 레이아웃은 snapshot으로. (→ [Test Strategy](test-strategy.md))

## 참고

- Michael Feathers, *Working Effectively with Legacy Code* — seam, characterization test
- Gary Bernhardt, *Boundaries* — Functional Core / Imperative Shell
- Martin Fowler — Humble Object, Self-Initializing Fake
- Point-Free — swift-dependencies, "Designing Dependencies"
