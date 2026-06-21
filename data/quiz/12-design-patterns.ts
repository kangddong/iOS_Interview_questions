import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ─── composition-over-inheritance (5) ───────────────────────────────────────
  {
    id: "objective-c12-basic-composition-over-inheritance-001",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 Composition over Inheritance 원칙이 권장되는 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "클래스 상속은 단일 상속만 가능하고 부모 변경이 모든 자식에 전파되어 결합도가 높기 때문",
      },
      {
        id: "b",
        text: "Swift에서 class 키워드 사용이 금지되어 있어 구조체를 사용해야 하기 때문",
      },
      {
        id: "c",
        text: "상속을 사용하면 컴파일 타임 에러가 반드시 발생하기 때문",
      },
      {
        id: "d",
        text: "protocol extension은 저장 프로퍼티를 정의할 수 있어 상속보다 강력하기 때문",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift 클래스는 단일 상속만 허용하며, 부모(base class) 변경이 모든 자식 클래스에 전파되는 취약한 기반 클래스(fragile base class) 문제가 있어 결합도가 높아집니다. Composition은 protocol + extension으로 동작을 여러 조각으로 나눠 다중 채택하고, 의존성 주입으로 테스트를 쉽게 하는 방식을 선호합니다. 참고로 protocol extension은 저장 프로퍼티를 선언할 수 없습니다.",
    relatedTopicSlugs: ["12-design-patterns/composition-over-inheritance"],
  },
  {
    id: "objective-c12-basic-composition-over-inheritance-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "다음 Swift 코드에서 Composition(합성) 패턴이 적용된 부분은 어디인가?\n\n```swift\nfinal class ImageLoader {\n    private let cache: ImageCache\n    private let downloader: Downloader\n    init(cache: ImageCache, downloader: Downloader) {\n        self.cache = cache\n        self.downloader = downloader\n    }\n}\n```",
    choices: [
      { id: "a", text: "ImageLoader가 ImageCache와 Downloader를 프로퍼티로 갖는(has-a) 구조" },
      { id: "b", text: "ImageLoader가 ImageCache를 상속(is-a)하는 구조" },
      { id: "c", text: "init 메서드가 private으로 선언된 부분" },
      { id: "d", text: "final 키워드로 서브클래싱을 막은 부분" },
    ],
    correctChoiceId: "a",
    explanation:
      "Composition(합성)은 '가지고 있다(has-a)' 관계로 표현됩니다. ImageLoader는 ImageCache와 Downloader를 *상속*하는 것이 아니라 *소유*합니다. 이를 통해 각 의존성을 독립적으로 mock으로 교체하여 테스트할 수 있습니다. final 키워드는 상속 방지이고, private init은 Singleton 패턴에서 사용되는 관용구입니다.",
    relatedTopicSlugs: ["12-design-patterns/composition-over-inheritance"],
  },
  {
    id: "objective-c12-intermediate-composition-over-inheritance-003",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Protocol-Oriented Composition에서 protocol extension의 한계로 올바른 것은?",
    choices: [
      { id: "a", text: "protocol extension에서는 저장 프로퍼티를 선언할 수 없다" },
      { id: "b", text: "protocol extension의 메서드는 override할 수 없다" },
      { id: "c", text: "protocol은 struct에 채택할 수 없고 class에만 가능하다" },
      { id: "d", text: "protocol extension은 iOS 15 이상에서만 사용 가능하다" },
    ],
    correctChoiceId: "a",
    explanation:
      "protocol extension은 *저장 프로퍼티(stored property)*를 선언할 수 없습니다. 연산 프로퍼티(computed property)와 메서드는 기본 구현을 제공할 수 있지만, 저장 프로퍼티가 필요하다면 named type(class/struct)을 사용해야 합니다. 또한 기본 구현은 동적 디스패치(dynamic dispatch)가 아닌 정적 디스패치로 동작할 수 있다는 점도 주의해야 합니다.",
    relatedTopicSlugs: ["12-design-patterns/composition-over-inheritance"],
  },
  {
    id: "objective-c12-intermediate-composition-over-inheritance-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "상속(Inheritance)과 합성(Composition)을 비교했을 때 합성의 장점이 아닌 것은?",
    choices: [
      { id: "a", text: "부모 코드가 자동으로 상속되어 코드 작성량이 줄어든다" },
      { id: "b", text: "protocol 다중 채택으로 여러 동작을 독립적으로 추가할 수 있다" },
      { id: "c", text: "의존성 주입으로 테스트 시 mock으로 교체하기 쉽다" },
      { id: "d", text: "결합도가 낮아 부모(컴포넌트) 변경의 영향이 적다" },
    ],
    correctChoiceId: "a",
    explanation:
      "부모 코드가 자동으로 재사용된다는 것은 *상속(Inheritance)*의 특성입니다. 합성에서는 동작을 명시적으로 위임(delegation)해야 하므로 코드 작성량이 줄어드는 이점은 없습니다. 반면 합성은 낮은 결합도, 다중 동작 추가, 테스트 용이성이라는 장점을 제공합니다.",
    relatedTopicSlugs: ["12-design-patterns/composition-over-inheritance"],
  },
  {
    id: "objective-c12-advanced-composition-over-inheritance-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "SwiftUI 뷰 설계에서 Composition over Inheritance 원칙이 자연스럽게 실현되는 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "SwiftUI View는 struct 기반으로 작은 View 타입들을 조합하는 트리 구조이므로",
      },
      {
        id: "b",
        text: "SwiftUI에서 class 기반 View를 만들 수 없어 상속이 불가능하므로",
      },
      {
        id: "c",
        text: "SwiftUI의 @State가 상속된 상태를 자동으로 차단하므로",
      },
      {
        id: "d",
        text: "SwiftUI는 UIKit과 달리 @objc dynamic 속성을 지원하지 않으므로",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "SwiftUI의 View는 struct 기반이며, body 안에서 여러 작은 View struct들을 조합하는 트리 구조를 형성합니다. 이 구조 자체가 Composition(합성)입니다. 큰 화면 하나를 UIViewController 상속으로 만드는 UIKit과 달리, SwiftUI는 작은 View 단위를 모아 조립하는 방식을 강제합니다. SwiftUI에서도 기술적으로 protocol을 채택한 struct를 사용하므로 상속이 '불가능'한 것은 아닙니다.",
    relatedTopicSlugs: ["12-design-patterns/composition-over-inheritance"],
  },

  // ─── delegate (4) ───────────────────────────────────────────────────────────
  {
    id: "objective-c12-basic-delegate-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Delegate 패턴에서 delegate 프로퍼티를 `weak`으로 선언해야 하는 이유는?",
    choices: [
      { id: "a", text: "retain cycle 방지를 위해 delegate가 참조하는 객체를 약하게 잡아야 하므로" },
      { id: "b", text: "weak 없이는 Swift 컴파일러가 protocol 타입을 인식하지 못하므로" },
      { id: "c", text: "delegate 메서드가 비동기로 호출될 때 약한 참조가 필수이므로" },
      { id: "d", text: "AnyObject 제약 없이도 weak 선언이 가능하게 하기 위해" },
    ],
    correctChoiceId: "a",
    explanation:
      "Delegate 패턴에서 자식 VC가 부모를 delegate로 두는 경우, 부모(A)가 자식(B)을 strong으로 보유하고 B도 A를 strong으로 잡으면 retain cycle이 발생합니다. `weak var delegate`로 선언하면 delegate가 먼저 사라져도 안전하고 cycle을 막을 수 있습니다. weak을 사용하려면 delegate protocol이 `AnyObject`(class-only)여야 합니다.",
    relatedTopicSlugs: ["12-design-patterns/delegate"],
  },
  {
    id: "objective-c12-basic-delegate-003",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 `protocol Foo: AnyObject`처럼 AnyObject 제약을 붙이는 주된 이유는?",
    choices: [
      { id: "a", text: "struct나 enum이 Foo를 채택하지 못하게 막기 위해" },
      { id: "b", text: "delegate 프로퍼티를 weak으로 선언할 수 있게 하기 위해" },
      { id: "c", text: "protocol에 @objc optional 메서드를 정의하기 위해" },
      { id: "d", text: "protocol의 메서드에서 self를 참조하기 위해" },
    ],
    correctChoiceId: "b",
    explanation:
      "`weak` 참조는 참조 타입(class)에만 사용할 수 있습니다. `AnyObject` 제약을 추가하면 해당 protocol을 class 타입만 채택할 수 있게 되어, `weak var delegate: Foo?` 선언이 가능해집니다. AnyObject 없이는 컴파일러가 weak 선언을 거부합니다.",
    relatedTopicSlugs: ["12-design-patterns/delegate"],
  },
  {
    id: "objective-c12-intermediate-delegate-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "UITableView가 Delegate와 DataSource를 분리해서 갖는 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "상호작용(이벤트 응답) 책임과 데이터 공급 책임이 서로 다르기 때문에 단일 책임 원칙 적용",
      },
      {
        id: "b",
        text: "Delegate와 DataSource를 합치면 메서드 수가 10개를 넘어 Swift 컴파일러 제한에 걸리므로",
      },
      {
        id: "c",
        text: "DataSource는 struct로, Delegate는 class로 구현하는 것이 강제되어 있어 분리가 필요하므로",
      },
      {
        id: "d",
        text: "Delegate 메서드는 메인 스레드에서만, DataSource 메서드는 백그라운드에서만 호출되므로",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Delegate는 '어떤 이벤트가 일어났을 때 어떻게 반응할지'를 다루고, DataSource는 '어떤 데이터를 표시할지'를 다룹니다. 두 가지는 명확히 다른 책임(SRP, Single Responsibility Principle)이므로 분리합니다. 덕분에 한 객체는 Delegate만 담당하거나 DataSource만 담당할 수 있어 유연성이 높아집니다.",
    relatedTopicSlugs: ["12-design-patterns/delegate"],
  },
  {
    id: "objective-c12-advanced-delegate-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "Swift-only protocol에서 Objective-C의 `@optional` 메서드와 동일한 효과를 내는 관용적인 방법은?",
    choices: [
      {
        id: "a",
        text: "extension에서 빈 기본 구현을 제공하여 채택 시 구현을 강제하지 않음",
      },
      {
        id: "b",
        text: "protocol 앞에 @optional 어노테이션을 붙임",
      },
      {
        id: "c",
        text: "메서드 반환 타입을 Optional(?)로 선언함",
      },
      {
        id: "d",
        text: "protocol에 required 키워드를 붙이지 않으면 자동으로 optional이 됨",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`@objc optional`은 ObjC 호환 protocol에서만 사용 가능합니다. Swift-only protocol에서는 `extension`에서 빈 기본 구현을 제공함으로써 사실상 optional과 같은 효과를 냅니다. 채택하는 타입이 원하면 자체 구현으로 override하고, 그렇지 않으면 extension의 기본 구현이 사용됩니다. `required` 키워드는 init에서만 사용합니다.",
    relatedTopicSlugs: ["12-design-patterns/delegate"],
  },

  // ─── factory-strategy-builder (5) ───────────────────────────────────────────
  {
    id: "objective-c12-basic-factory-strategy-builder-001",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Factory 패턴의 핵심 목적으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "객체 생성 책임을 분리하여 호출자가 구체 타입을 몰라도 되게 함" },
      { id: "b", text: "앱 전체에서 인스턴스를 하나만 유지하기 위한 패턴" },
      { id: "c", text: "런타임에 알고리즘을 동적으로 교체하기 위한 패턴" },
      { id: "d", text: "복잡한 객체를 단계별로 구성하기 위한 패턴" },
    ],
    correctChoiceId: "a",
    explanation:
      "Factory 패턴은 *어떤 구체 타입을 생성할지*의 결정을 호출자에서 분리합니다. 호출자는 protocol 타입만 알면 되고, 실제 어떤 구현체가 생성되는지 알 필요가 없습니다. 인스턴스 유일성은 Singleton, 알고리즘 교체는 Strategy, 단계별 구성은 Builder의 목적입니다.",
    relatedTopicSlugs: ["12-design-patterns/factory-strategy-builder"],
  },
  {
    id: "objective-c12-basic-factory-strategy-builder-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Strategy 패턴과 가장 잘 어울리는 iOS 실무 사용 사례는?",
    choices: [
      { id: "a", text: "결제 수단(카드, ApplePay, 계좌이체)을 런타임에 교체할 수 있도록 추상화" },
      { id: "b", text: "URLSession 인스턴스를 앱 전역에서 하나만 유지" },
      { id: "c", text: "ViewController를 생성하는 책임을 Coordinator에게 위임" },
      { id: "d", text: "URLRequest에 헤더/body를 순서대로 추가해 최종 요청 객체 생성" },
    ],
    correctChoiceId: "a",
    explanation:
      "Strategy 패턴은 *런타임에 알고리즘(동작)을 교체*하는 패턴입니다. 결제 수단처럼 실행 중에 사용자 선택에 따라 다른 구현체로 바꿔야 하는 경우가 전형적인 사례입니다. URLSession 유일성은 Singleton, VC 생성 위임은 Factory, URLRequest 단계별 구성은 Builder입니다.",
    relatedTopicSlugs: ["12-design-patterns/factory-strategy-builder"],
  },
  {
    id: "objective-c12-intermediate-factory-strategy-builder-003",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Builder 패턴에서 각 설정 메서드가 `return self`를 반환하는 이유는?",
    choices: [
      { id: "a", text: "메서드를 체이닝(chaining)하여 연속으로 호출하는 Fluent Interface를 구현하기 위해" },
      { id: "b", text: "Swift 컴파일러가 Builder 클래스를 자동으로 인식하기 위한 필수 조건이므로" },
      { id: "c", text: "각 설정이 독립적인 새 인스턴스를 반환해 불변성을 보장하기 위해" },
      { id: "d", text: "@discardableResult 어노테이션이 없으면 경고가 발생하는 것을 막기 위해" },
    ],
    correctChoiceId: "a",
    explanation:
      "Builder 패턴에서 `return self`는 `.method1().method2().method3().build()` 형태의 *메서드 체이닝(Fluent Interface)*을 가능하게 합니다. 각 설정 메서드가 self를 반환하므로 연속 호출이 자연스러워집니다. `@discardableResult`는 반환값을 무시할 때 경고를 억제하기 위한 부가적인 장치입니다.",
    relatedTopicSlugs: ["12-design-patterns/factory-strategy-builder"],
  },
  {
    id: "objective-c12-intermediate-factory-strategy-builder-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Strategy 패턴을 protocol 대신 *클로저*로 표현하는 것이 더 적합한 경우는?",
    choices: [
      { id: "a", text: "전략이 상태를 보유하지 않고 메서드가 하나뿐인 단순한 경우" },
      { id: "b", text: "런타임에 전략을 교체해야 하는 경우" },
      { id: "c", text: "외부 모듈에서 새로운 전략을 추가해야 하는 경우" },
      { id: "d", text: "전략 간 공통 인터페이스를 강제해야 하는 경우" },
    ],
    correctChoiceId: "a",
    explanation:
      "Strategy 패턴을 protocol로 표현할지 closure로 표현할지는 *상태 보유 여부*와 *메서드 수*로 결정합니다. 전략이 내부 상태 없이 단일 함수로 표현 가능하다면 closure가 더 간결하고 직관적입니다. 상태가 있거나 메서드가 여러 개이거나 외부 확장이 필요하면 protocol이 적합합니다.",
    relatedTopicSlugs: ["12-design-patterns/factory-strategy-builder"],
  },
  {
    id: "objective-c12-advanced-factory-strategy-builder-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "SwiftUI의 `VStack { ... }` 구문과 관련이 있는 Swift 언어 기능은?",
    choices: [
      { id: "a", text: "@resultBuilder — DSL 스타일 표현을 위한 Builder 변형" },
      { id: "b", text: "@discardableResult — 반환값 무시를 허용하는 어노테이션" },
      { id: "c", text: "@propertyWrapper — 프로퍼티 접근 패턴을 래핑하는 기능" },
      { id: "d", text: "@dynamicMemberLookup — 동적 멤버 접근을 가능하게 하는 기능" },
    ],
    correctChoiceId: "a",
    explanation:
      "SwiftUI의 `VStack { Text(...) Image(...) }` 구문은 `@resultBuilder`로 구현된 Builder 패턴의 변형입니다. `@resultBuilder`는 클로저 안의 여러 표현식을 하나의 결과로 합쳐주는 DSL(Domain Specific Language) 스타일 API를 만들 수 있게 합니다. `@propertyWrapper`는 @State/@Binding 같은 프로퍼티 동작 래핑에 사용됩니다.",
    relatedTopicSlugs: ["12-design-patterns/factory-strategy-builder"],
  },

  // ─── observer (5) ───────────────────────────────────────────────────────────
  {
    id: "objective-c12-basic-observer-001",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "iOS에서 NotificationCenter를 사용하는 가장 적절한 상황은?",
    choices: [
      { id: "a", text: "앱 라이프사이클 이벤트나 키보드 표시 같은 시스템 이벤트를 여러 객체가 수신할 때" },
      { id: "b", text: "ViewController 간 1:1 데이터 전달이 필요할 때" },
      { id: "c", text: "Swift 순수 객체의 특정 프로퍼티 값 변화를 추적할 때" },
      { id: "d", text: "연산자를 조합해 이벤트 스트림을 변환/합성할 때" },
    ],
    correctChoiceId: "a",
    explanation:
      "NotificationCenter는 *느슨한 결합*으로 발신자와 수신자가 서로 모르는 1:N broadcast에 적합합니다. 특히 앱 라이프사이클, 키보드, 시스템 이벤트처럼 *어디서나 받을 수 있어야 하는* 이벤트에 사용합니다. 1:1 데이터 전달은 delegate/closure, Swift 프로퍼티 관찰은 Combine, 스트림 합성은 Combine이 더 적합합니다.",
    relatedTopicSlugs: ["12-design-patterns/observer"],
  },
  {
    id: "objective-c12-basic-observer-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 KVO(Key-Value Observing)를 사용하기 위한 필수 조건이 아닌 것은?",
    choices: [
      { id: "a", text: "관찰 대상 클래스가 Codable 프로토콜을 채택해야 한다" },
      { id: "b", text: "관찰 대상 클래스가 NSObject를 상속해야 한다" },
      { id: "c", text: "관찰할 프로퍼티에 @objc dynamic을 붙여야 한다" },
      { id: "d", text: "관찰자가 NSKeyValueObservation 결과를 보관해 관찰 수명을 유지해야 한다" },
    ],
    correctChoiceId: "a",
    explanation:
      "KVO의 *필수 조건*은 (1) NSObject 상속, (2) 관찰 프로퍼티에 `@objc dynamic`, (3) 관찰자 측에서 `NSKeyValueObservation` 토큰을 유지하는 것입니다. Codable 채택은 JSON 직렬화와 관련된 것으로 KVO와 무관합니다. 참고: KVO가 ObjC 런타임에 의존하므로 순수 Swift struct에는 사용할 수 없고, 이 경우 Combine이나 @Observable이 대안입니다 — 이는 *조건*이 아니라 *제약*입니다.",
    relatedTopicSlugs: ["12-design-patterns/observer"],
  },
  {
    id: "objective-c12-intermediate-observer-003",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Combine에서 `AnyCancellable`을 `Set<AnyCancellable>`에 저장하는 이유는?",
    choices: [
      {
        id: "a",
        text: "AnyCancellable이 Set에서 해제될 때(deinit) 자동으로 구독이 취소되므로",
      },
      {
        id: "b",
        text: "Set의 중복 제거 기능으로 동일 publisher에 중복 구독하는 것을 막기 위해",
      },
      {
        id: "c",
        text: "AnyCancellable은 배열(Array)에 저장할 수 없도록 설계되어 있으므로",
      },
      {
        id: "d",
        text: "Set에 저장된 AnyCancellable은 메인 스레드에서 자동으로 실행이 보장되므로",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Combine의 `AnyCancellable`은 deinit 시 자동으로 `cancel()`을 호출합니다. 따라서 `Set<AnyCancellable>`을 인스턴스 프로퍼티로 보유하면, 해당 인스턴스가 해제될 때 Set도 해제되고 모든 구독이 자동으로 취소됩니다. `.store(in: &cancellables)`가 이 Set에 저장하는 관용구입니다. Set 외에 배열에 저장하는 것도 기술적으로 가능합니다.",
    relatedTopicSlugs: ["12-design-patterns/observer"],
  },
  {
    id: "objective-c12-intermediate-observer-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "`@Published` 프로퍼티가 변경될 때 Combine sink에서 UI를 업데이트하려면 어떻게 해야 하는가?",
    choices: [
      {
        id: "a",
        text: "`.receive(on: DispatchQueue.main)` 또는 `@MainActor`로 메인 스레드에서 수신하도록 지정",
      },
      {
        id: "b",
        text: "@Published는 항상 메인 스레드에서 값을 emit하므로 별도 처리 불필요",
      },
      {
        id: "c",
        text: "sink 클로저 내에서 DispatchQueue.global()을 명시적으로 사용",
      },
      {
        id: "d",
        text: "@Published 대신 PassthroughSubject를 사용하면 자동으로 메인 스레드 보장",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`@Published` 프로퍼티는 변경이 발생한 스레드에서 값을 emit합니다. 백그라운드에서 값이 변경되면 sink도 백그라운드에서 호출됩니다. UI 업데이트는 반드시 메인 스레드에서 해야 하므로 `.receive(on: DispatchQueue.main)`을 파이프라인에 추가하거나 `@MainActor`를 활용해야 합니다.",
    relatedTopicSlugs: ["12-design-patterns/observer"],
  },
  {
    id: "objective-c12-advanced-observer-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "WWDC23 이후 Apple이 신규 API 설계에서 Combine보다 AsyncSequence를 선호하는 주된 이유는?",
    choices: [
      {
        id: "a",
        text: "AsyncSequence는 Swift Concurrency와 자연스럽게 통합되고 Task 취소로 구독 해제가 자동화되기 때문",
      },
      {
        id: "b",
        text: "Combine이 iOS 16에서 deprecated되어 더 이상 사용할 수 없기 때문",
      },
      {
        id: "c",
        text: "AsyncSequence는 100개 이상의 연산자를 기본 제공하여 Combine보다 강력하기 때문",
      },
      {
        id: "d",
        text: "Combine의 AnyCancellable이 메모리 누수를 항상 일으키는 근본적인 버그가 있으므로",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "AsyncSequence는 Swift Concurrency(async/await) 모델과 자연스럽게 통합되어, for-await 루프로 직관적인 소비가 가능하고 Task가 취소되면 구독도 자동 해제됩니다. Combine은 deprecated되지 않았으나 Apple의 신규 framework API 설계 방향이 AsyncSequence 쪽으로 이동하고 있습니다. Combine의 기본 연산자는 100개 이상이지만 AsyncSequence는 swift-async-algorithms 라이브러리를 추가해야 풍부한 연산자를 쓸 수 있습니다.",
    relatedTopicSlugs: ["12-design-patterns/observer"],
  },

  // ─── singleton (5) ──────────────────────────────────────────────────────────
  {
    id: "objective-c12-basic-singleton-001",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 Singleton을 구현하는 표준 코드로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "`static let shared = MyClass()` + `private init()`",
      },
      {
        id: "b",
        text: "`static var shared = MyClass()` + `public init()`",
      },
      {
        id: "c",
        text: "`lazy var shared = MyClass()` + `private init()`",
      },
      {
        id: "d",
        text: "`class var shared: MyClass { return MyClass() }` + `private init()`",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`static let`은 Swift 런타임이 lazy 초기화와 thread-safety를 자동으로 보장합니다. `private init()`으로 외부에서 인스턴스를 추가 생성하는 것을 막습니다. `static var`는 thread-safety가 보장되지 않고, `class var`에 `return MyClass()`를 넣으면 호출할 때마다 새 인스턴스가 생성되어 Singleton이 아닙니다.",
    relatedTopicSlugs: ["12-design-patterns/singleton"],
  },
  {
    id: "objective-c12-basic-singleton-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "다음 중 Apple SDK에서 Singleton 패턴으로 설계된 객체가 아닌 것은?",
    choices: [
      { id: "a", text: "URLRequest" },
      { id: "b", text: "UIApplication.shared" },
      { id: "c", text: "FileManager.default" },
      { id: "d", text: "NotificationCenter.default" },
    ],
    correctChoiceId: "a",
    explanation:
      "URLRequest는 HTTP 요청을 표현하는 struct 타입으로, 매번 새로운 인스턴스를 생성해서 사용합니다. 반면 UIApplication.shared, FileManager.default, NotificationCenter.default, UserDefaults.standard 등은 시스템 자원이나 디바이스 단일 자원에 대한 공유 접근점으로 Singleton 패턴을 사용합니다.",
    relatedTopicSlugs: ["12-design-patterns/singleton"],
  },
  {
    id: "objective-c12-intermediate-singleton-003",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Singleton이 *안티패턴*이 되는 가장 큰 이유는?",
    choices: [
      {
        id: "a",
        text: "숨은 의존성과 전역 상태 공유로 인해 테스트가 불가능해지고 코드 추적이 어려워진다",
      },
      {
        id: "b",
        text: "static let 초기화가 앱 시작 시 무조건 실행되어 성능이 저하된다",
      },
      {
        id: "c",
        text: "Swift 컴파일러가 Singleton 클래스를 final로 강제하여 확장이 불가능하다",
      },
      {
        id: "d",
        text: "Singleton은 멀티스레드 환경에서 항상 데이터 경쟁(data race)을 일으킨다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Singleton 남용의 핵심 문제는 ①테스트 불가능(mock으로 교체 불가), ②숨은 의존성(init에 드러나지 않음), ③전역 상태 공유(다른 화면의 mutation이 영향을 미침), ④초기화 순서 의존성입니다. `static let`은 lazy 초기화라 앱 시작 시 무조건 실행되지 않으며, Singleton이 항상 data race를 일으키는 것도 아닙니다(내부 동기화로 안전하게 구현 가능).",
    relatedTopicSlugs: ["12-design-patterns/singleton"],
  },
  {
    id: "objective-c12-intermediate-singleton-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Singleton을 유지하면서도 테스트 가능한 코드를 만드는 가장 좋은 방법은?",
    choices: [
      {
        id: "a",
        text: "protocol 추상화 후 생성자 주입, 기본값으로 `.shared` 사용",
      },
      {
        id: "b",
        text: "Singleton 클래스에 reset() 메서드를 추가해 테스트 후 상태를 초기화",
      },
      {
        id: "c",
        text: "static let shared를 static var shared로 변경해 테스트에서 교체 가능하게",
      },
      {
        id: "d",
        text: "Singleton을 사용하는 코드에서 직접 호출 대신 NotificationCenter로 간접 호출",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "가장 권장되는 방법은 Singleton을 protocol로 추상화하고, 이를 사용하는 객체는 protocol 타입을 생성자(init)에서 주입받는 것입니다. 기본값으로 `.shared`를 지정하면 운영 코드는 변경 없이 사용하고, 테스트에서는 mock을 주입할 수 있습니다. `static var`로 변경하는 방법은 전역 상태를 바꾸는 위험이 있고, reset() 패턴은 테스트 간 상태 오염 가능성이 있습니다.",
    relatedTopicSlugs: ["12-design-patterns/singleton"],
  },
  {
    id: "objective-c12-advanced-singleton-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "Singleton 내부에 mutable state가 있을 때 thread-safety를 보장하는 방법으로 Swift 현대 관용구는?",
    choices: [
      { id: "a", text: "actor로 선언하여 Swift Concurrency가 데이터 접근을 직렬화하게 함" },
      { id: "b", text: "static let shared가 자동으로 내부 프로퍼티도 thread-safe하게 만들어줌" },
      { id: "c", text: "Singleton 클래스에 @synchronized 어노테이션 추가" },
      { id: "d", text: "내부 프로퍼티를 @Published로 선언하면 자동으로 thread-safe해짐" },
    ],
    correctChoiceId: "a",
    explanation:
      "`static let shared`는 인스턴스 *생성*만 thread-safe하게 보장합니다. 내부 mutable state의 동시 접근은 별도로 동기화해야 합니다. Swift 현대 관용구로는 클래스를 `actor`로 선언하면 Swift Concurrency가 모든 접근을 직렬화해줍니다. 전통적으로는 DispatchQueue(concurrent queue + barrier)를 사용할 수 있습니다. `@synchronized`는 ObjC 키워드이고, `@Published`는 thread-safety를 보장하지 않습니다.",
    relatedTopicSlugs: ["12-design-patterns/singleton"],
  },

  // ─── swift-idiomatic-patterns (5) ───────────────────────────────────────────
  {
    id: "objective-c12-basic-swift-idiomatic-patterns-001",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 *일회성* 응답을 처리하는 가장 가볍고 직관적인 패턴은?",
    choices: [
      { id: "a", text: "Closure (completion handler)" },
      { id: "b", text: "Delegate protocol" },
      { id: "c", text: "Combine PassthroughSubject" },
      { id: "d", text: "AsyncStream" },
    ],
    correctChoiceId: "a",
    explanation:
      "네트워크 요청 완료처럼 *한 번* 응답하고 끝나는 경우에는 Closure(completion handler)가 가장 가볍고 직관적입니다. Delegate는 여러 이벤트를 하나의 protocol로 묶을 때, Combine과 AsyncStream은 지속적인 이벤트 스트림에 적합합니다.",
    relatedTopicSlugs: ["12-design-patterns/swift-idiomatic-patterns"],
  },
  {
    id: "objective-c12-basic-swift-idiomatic-patterns-002",
    type: "objective",
    level: "basic",
    category: "Design Patterns",
    prompt:
      "Swift에서 *여러 이벤트 종류*를 하나의 묶음으로 위임하는 1:1 패턴으로 가장 적합한 것은?",
    choices: [
      { id: "a", text: "Delegate (protocol)" },
      { id: "b", text: "Closure (단일 callback)" },
      { id: "c", text: "NotificationCenter" },
      { id: "d", text: "AsyncSequence" },
    ],
    correctChoiceId: "a",
    explanation:
      "여러 종류의 이벤트(탭, 스크롤, 선택 등)를 한 객체에게 위임하는 1:1 관계에서는 Delegate(protocol)이 적합합니다. 메서드 수가 3개 이상이면 개별 closure보다 protocol로 묶는 것이 더 명확합니다. NotificationCenter는 1:N broadcast, AsyncSequence는 지속적인 스트림에 어울립니다.",
    relatedTopicSlugs: ["12-design-patterns/swift-idiomatic-patterns"],
  },
  {
    id: "objective-c12-intermediate-swift-idiomatic-patterns-003",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "기존 completion handler 기반 API를 async/await으로 래핑할 때 사용하는 Swift 표준 방법은?",
    choices: [
      { id: "a", text: "withCheckedContinuation / withCheckedThrowingContinuation" },
      { id: "b", text: "AsyncStream으로 직접 변환" },
      { id: "c", text: "DispatchQueue.main.async 내에서 await 호출" },
      { id: "d", text: "Combine의 Future<Output, Failure>로 변환 후 .values 사용" },
    ],
    correctChoiceId: "a",
    explanation:
      "`withCheckedContinuation`은 기존 callback 기반 API를 async 함수로 래핑하는 Swift 표준 방법입니다. 클로저 내에서 `cont.resume(with:)` 또는 `cont.resume(returning:)`을 한 번 호출하면 async 함수가 결과를 반환합니다. 주의: continuation은 반드시 *정확히 한 번* resume해야 합니다. 여러 번 호출하는 API라면 AsyncStream을 사용해야 합니다.",
    relatedTopicSlugs: ["12-design-patterns/swift-idiomatic-patterns"],
  },
  {
    id: "objective-c12-intermediate-swift-idiomatic-patterns-004",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt:
      "Combine의 `assign(to: \\.x, on: self)` 사용 시 발생할 수 있는 문제는?",
    choices: [
      { id: "a", text: "self를 강참조하여 메모리 누수(retain cycle)가 발생할 수 있다" },
      { id: "b", text: "assign은 메인 스레드에서만 동작하여 백그라운드 업데이트 시 크래시가 발생한다" },
      { id: "c", text: "assign은 Error 타입이 Never인 publisher에서만 사용 가능하다" },
      { id: "d", text: "저장된 AnyCancellable이 즉시 해제되어 구독이 취소된다" },
    ],
    correctChoiceId: "a",
    explanation:
      "`assign(to: \\.x, on: self)`는 self를 강참조(strong reference)합니다. ViewModel이 자기 자신의 프로퍼티에 assign하면 self → publisher → AnyCancellable → self 형태의 retain cycle이 발생할 수 있습니다. SwiftUI에서는 `assign(to: &$published)` 형태를 사용하면 @Published 프로퍼티 수명과 연동되어 자동 cancel됩니다. 참고로 assign은 실제로 Error가 Never인 publisher에서만 사용 가능한 것도 맞지만, 이것이 '문제'는 아닙니다.",
    relatedTopicSlugs: ["12-design-patterns/swift-idiomatic-patterns"],
  },
  {
    id: "objective-c12-advanced-swift-idiomatic-patterns-005",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt:
      "AsyncStream에서 기본 buffering 정책을 명시하지 않으면 발생할 수 있는 문제는?",
    choices: [
      { id: "a", text: "unbounded buffering으로 이벤트가 빠르게 쌓일 경우 메모리 사용량이 무한 증가할 수 있다" },
      { id: "b", text: "기본 정책이 bufferingOldest(0)이라 모든 이벤트가 즉시 버려진다" },
      { id: "c", text: "consumer가 이벤트를 소비하지 않으면 producer가 자동으로 중단된다" },
      { id: "d", text: "AsyncStream은 Task 취소 시 buffer의 이벤트도 모두 즉시 삭제된다" },
    ],
    correctChoiceId: "a",
    explanation:
      "AsyncStream의 기본 buffering 정책은 `unbounded`입니다. Consumer 처리 속도보다 Producer가 빠를 경우 버퍼에 이벤트가 무한히 쌓여 메모리가 폭증할 수 있습니다. 이를 방지하기 위해 `.bufferingNewest(N)` 또는 `.bufferingOldest(N)`을 명시해 최대 N개만 보관하도록 제한하는 것이 권장됩니다.",
    relatedTopicSlugs: ["12-design-patterns/swift-idiomatic-patterns"],
  },

  // ─── coordinator (add: 3) ────────────────────────────────────────────────
  {
    id: "objective-c12-intermediate-coordinator-001",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt: "Coordinator 패턴을 도입하는 가장 직접적인 동기는?",
    choices: [
      { id: "a", text: "ViewController가 화면 전환·딥링크·플로우 분기 로직까지 떠안아 비대해지는 것을 막고, 그 책임을 별도 객체로 분리하기 위해" },
      { id: "b", text: "UINavigationController를 제거하기 위해" },
      { id: "c", text: "Storyboard segue를 자동 생성하기 위해" },
      { id: "d", text: "SwiftUI NavigationStack과 호환되지 않는 화면을 강제로 재사용하기 위해" },
    ],
    correctChoiceId: "a",
    explanation:
      "Coordinator는 ViewController가 \"무엇을 보여줄지\"에만 집중하도록, *다음 어디로 갈지*에 대한 결정과 의존성 조립을 빼내는 패턴이다. UIKit의 push/present 호출이 VC에 흩어지면 화면 간 결합도가 올라가고 딥링크/로그인 흐름 분기 같은 게 누더기처럼 박힌다. Coordinator는 이 결정을 별도 객체에 모아 VC를 가볍게 유지하고 화면 재사용성을 높인다.",
    relatedTopicSlugs: ["12-design-patterns/coordinator"],
  },
  {
    id: "objective-c12-intermediate-coordinator-002",
    type: "objective",
    level: "intermediate",
    category: "Design Patterns",
    prompt: "부모 Coordinator가 자식 Coordinator를 `childCoordinators` 배열로 보관하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "Swift는 strong 참조를 자동으로 막아주므로 추가 보관이 필수다" },
      { id: "b", text: "자식 Coordinator가 비동기 흐름 도중 deallocate되어 화면이 중간에 사라지는 것을 막고, 흐름이 끝나면 명시적으로 제거해 메모리를 해제하기 위해" },
      { id: "c", text: "Coordinator는 UIViewController의 서브클래스라서 navigation stack과 동기화가 필요하다" },
      { id: "d", text: "Combine publisher의 cancellable과 동일한 동작을 자동으로 제공한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Coordinator는 보통 UIKit의 strong 참조 체인 밖에 있다(VC가 Coordinator를 모르거나 weak로만 안다). 부모가 `childCoordinators`에 push해 두지 않으면 자식이 ARC로 즉시 해제되어 진행 중이던 흐름이 도중에 끊긴다. 흐름이 끝나면 부모가 명시적으로 자식을 제거(`childCoordinators.removeAll { $0 === child }`)해 메모리도 깔끔히 회수한다.",
    relatedTopicSlugs: ["12-design-patterns/coordinator"],
  },
  {
    id: "objective-c12-advanced-coordinator-003",
    type: "objective",
    level: "advanced",
    category: "Design Patterns",
    prompt: "딥링크(예: myapp://order/123)를 받아 다단계 화면 스택을 재현해야 할 때 Coordinator 구조에서 자연스러운 처리 방식은?",
    choices: [
      { id: "a", text: "AppCoordinator가 URL을 파싱해 필요한 자식 Coordinator를 순차 push하면서 각 단계의 상태를 주입한다" },
      { id: "b", text: "각 ViewController가 직접 URL을 파싱해 다음 VC를 present한다" },
      { id: "c", text: "UIApplication.shared.open(url)을 다시 호출해 OS가 자동으로 화면을 복원하게 한다" },
      { id: "d", text: "딥링크 처리는 반드시 SwiftUI NavigationStack을 통해서만 가능하다" },
    ],
    correctChoiceId: "a",
    explanation:
      "Coordinator 트리는 화면 전환 결정 권한이 한곳(루트 Coordinator)에 모여 있어 딥링크 복원에 적합하다. AppCoordinator가 URL을 해석해 \"이 흐름은 로그인됐을 때만 가능 → 로그인 Coordinator 거치고 → Tab Coordinator 거치고 → Order Coordinator 거쳐서 상세 화면\" 같은 *순차 조립*을 수행한다. VC가 직접 처리하면 같은 화면에 도달하는 경로가 늘 때마다 분기 로직이 흩어진다.",
    relatedTopicSlugs: ["12-design-patterns/coordinator"],
  },
];
