import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ────────────────────────────────────────────────────────────
  // 05-swiftui/custom-layout-and-animatable  (add: 5)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-intermediate-custom-layout-and-animatable-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "SwiftUI의 `Layout` 프로토콜(iOS 16+)에서 반드시 구현해야 하는 두 메서드는 무엇인가?",
    choices: [
      { id: "a", text: "sizeThatFits(proposal:subviews:cache:)와 placeSubviews(in:proposal:subviews:cache:)" },
      { id: "b", text: "layoutSize(for:)와 layoutChildren(_:)" },
      { id: "c", text: "preferredSize(for:)와 arrange(in:)" },
      { id: "d", text: "measureContent(_:)와 commitLayout(_:)" },
    ],
    correctChoiceId: "a",
    explanation:
      "`Layout` 프로토콜은 `sizeThatFits(proposal:subviews:cache:)`와 `placeSubviews(in:proposal:subviews:cache:)` 두 메서드를 필수 구현으로 요구한다. 전자는 부모 제안에 대해 내가 원하는 크기를 반환하고, 후자는 결정된 영역 안에 자식들을 배치한다.",
    relatedTopicSlugs: ["05-swiftui/custom-layout-and-animatable"],
  },
  {
    id: "objective-c05-intermediate-custom-layout-and-animatable-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`AnyLayout`을 사용하면 레이아웃 전환 시 자식 View의 `@State`가 보존된다. 그 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "AnyLayout이 자식 View를 항상 새로운 인스턴스로 교체하기 때문이다." },
      { id: "b", text: "자식 View들의 identity가 유지되고 레이아웃 컨테이너만 교체되기 때문이다." },
      { id: "c", text: "@State가 AnyLayout 내부에 별도로 백업·복원되기 때문이다." },
      { id: "d", text: "레이아웃 전환 애니메이션 중에는 SwiftUI가 body 호출을 억제하기 때문이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`AnyLayout`은 레이아웃 컨테이너만 교체하고 자식 View들의 identity를 유지한다. identity가 같으면 SwiftUI는 같은 graph 노드로 인식하므로 `@State`가 보존되고 자연스러운 재배치 애니메이션이 가능하다.",
    relatedTopicSlugs: ["05-swiftui/custom-layout-and-animatable"],
  },
  {
    id: "objective-c05-advanced-custom-layout-and-animatable-003",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "Shape를 커스텀 애니메이션으로 보간하려면 `Animatable` 프로토콜의 어떤 프로퍼티를 구현해야 하는가?",
    choices: [
      { id: "a", text: "animationDuration" },
      { id: "b", text: "interpolatedValue" },
      { id: "c", text: "animatableData" },
      { id: "d", text: "transitionKey" },
    ],
    correctChoiceId: "c",
    explanation:
      "`Animatable` 프로토콜에서는 `animatableData`를 구현한다. SwiftUI가 이 값을 애니메이션 진행률에 따라 보간하고, 보간 단계마다 path 재계산을 트리거한다. 여러 값을 보간하려면 `AnimatablePair`로 묶는다.",
    relatedTopicSlugs: ["05-swiftui/custom-layout-and-animatable"],
  },
  {
    id: "objective-c05-intermediate-custom-layout-and-animatable-004",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`withAnimation`과 `withTransaction`의 차이를 가장 정확히 설명한 것은?",
    choices: [
      { id: "a", text: "withAnimation은 비동기, withTransaction은 동기로 동작한다." },
      { id: "b", text: "withTransaction은 애니메이션을 비활성화할 수 없지만 withAnimation은 가능하다." },
      { id: "c", text: "withTransaction은 disablesAnimations 등 더 세밀한 Transaction 제어가 가능하다." },
      { id: "d", text: "withAnimation은 iOS 13+이고 withTransaction은 iOS 16+에서만 사용 가능하다." },
    ],
    correctChoiceId: "c",
    explanation:
      "`withAnimation`은 편의 API로 일시적인 Transaction을 만들어 변경을 적용한다. `withTransaction`은 Transaction 객체를 직접 구성할 수 있어 `disablesAnimations`, `isContinuous` 등 더 세밀한 제어가 가능하다. 두 API 모두 iOS 13+에서 사용 가능하다.",
    relatedTopicSlugs: ["05-swiftui/custom-layout-and-animatable"],
  },
  {
    id: "objective-c05-intermediate-custom-layout-and-animatable-005",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "SwiftUI에서 Animation(값 보간)과 Transition(추가/제거 효과)의 차이를 올바르게 설명한 것은?",
    choices: [
      { id: "a", text: "Animation은 View가 tree에 새로 추가/제거될 때, Transition은 위치·크기·색상 보간에 사용된다." },
      { id: "b", text: "Animation은 위치·크기·색상 보간에, Transition은 View 추가/제거 시 페이드·슬라이드 등 효과에 사용된다." },
      { id: "c", text: "Animation과 Transition은 동일한 개념으로 사용 방법만 다르다." },
      { id: "d", text: "Transition은 Animatable을 구현한 View에서만 적용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Animation은 값(위치, 크기, 색상 등)의 변화를 부드럽게 보간하는 것이고, Transition은 View가 view tree에 추가되거나 제거될 때 적용되는 시각 효과(페이드, 슬라이드 등)다. 두 개념은 서로 다르며 조합해서 사용할 수 있다.",
    relatedTopicSlugs: ["05-swiftui/custom-layout-and-animatable"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/declarative-and-view-struct  (add: 2)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-basic-declarative-and-view-struct-001",
    type: "objective",
    level: "basic",
    category: "SwiftUI",
    prompt:
      "SwiftUI의 View가 class가 아닌 struct(값 타입)로 설계된 주된 이유는?",
    choices: [
      { id: "a", text: "struct는 class보다 상속이 자유롭기 때문이다." },
      { id: "b", text: "값 비교를 통한 diffing 모델로 변경된 부분만 다시 계산할 수 있기 때문이다." },
      { id: "c", text: "struct는 ARC 오버헤드가 없어서 화면을 장기간 유지할 수 있기 때문이다." },
      { id: "d", text: "UIView 클래스 계층과의 충돌을 피하기 위해서이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "View struct는 값 타입이므로 이전 struct 값과 새 struct 값을 비교(Equatable 또는 reflection)해 변경 영역만 다시 그릴 수 있다. 클래스라면 참조 동일성 때문에 변경 추적이 복잡해지고 diffing이 어렵다.",
    relatedTopicSlugs: ["05-swiftui/declarative-and-view-struct"],
  },
  {
    id: "objective-c05-intermediate-declarative-and-view-struct-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "SwiftUI에서 `some View` 반환 타입(opaque type)을 사용하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "런타임에 반환 타입을 동적으로 바꾸기 위해서이다." },
      { id: "b", text: "컴파일러는 구체 타입을 알지만 호출자에게 복잡한 제네릭 타입을 노출하지 않기 위해서이다." },
      { id: "c", text: "AnyView와 동일하게 타입 소거(type erasure)를 수행하기 위해서이다." },
      { id: "d", text: "body 프로퍼티의 반환 타입을 Void로 취급하기 위해서이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`some View`는 opaque type으로, 컴파일러는 `VStack<TupleView<...>>` 같은 구체 타입을 알지만 호출자에게는 숨긴다. 덕분에 복잡한 제네릭 트리 타입을 직접 적지 않아도 되며 AnyView와 달리 타입 소거 비용이 없다.",
    relatedTopicSlugs: ["05-swiftui/declarative-and-view-struct"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/layout-system  (add: 5)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-basic-layout-system-001",
    type: "objective",
    level: "basic",
    category: "SwiftUI",
    prompt:
      "SwiftUI 레이아웃 협상의 핵심 원칙을 올바르게 설명한 것은?",
    choices: [
      { id: "a", text: "부모가 자식의 크기를 강제로 결정한다." },
      { id: "b", text: "자식이 제안된 크기를 항상 거부하고 자신의 기본 크기를 사용한다." },
      { id: "c", text: "부모가 크기를 제안하고 자식이 자신의 크기를 결정하면 부모가 위치를 정한다." },
      { id: "d", text: "Auto Layout처럼 제약식을 서로 교환하여 크기를 결정한다." },
    ],
    correctChoiceId: "c",
    explanation:
      "SwiftUI 레이아웃은 '부모 → 자식에게 크기 제안, 자식이 자신의 크기 결정, 부모가 위치 결정'의 재귀적 협상 구조다. 부모의 제안은 강제가 아니며, 자식(예: Text)은 자신에게 적합한 크기를 독립적으로 답한다.",
    relatedTopicSlugs: ["05-swiftui/layout-system"],
  },
  {
    id: "objective-c05-intermediate-layout-system-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "아래 두 코드의 배경색 범위가 다른 이유는 무엇인가?\n```swift\n// A: Text(\"hi\").padding(20).background(Color.red)\n// B: Text(\"hi\").background(Color.red).padding(20)\n```",
    choices: [
      { id: "a", text: "background modifier는 항상 전체 화면을 채우므로 순서가 무관하다." },
      { id: "b", text: "A는 padding 영역까지 빨강이고, B는 텍스트 영역만 빨강이다. modifier 순서가 부모-자식 관계를 바꾸기 때문이다." },
      { id: "c", text: "B는 padding 영역까지 빨강이고, A는 텍스트 영역만 빨강이다." },
      { id: "d", text: "두 코드는 동일한 결과를 낸다. SwiftUI가 자동으로 순서를 최적화하기 때문이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "각 modifier는 새 View를 감싸는 형태라서 순서가 부모-자식 관계를 결정한다. A에서는 padding이 먼저 적용되어 padding 영역까지 background가 덮고, B에서는 background가 먼저 텍스트에 적용되어 빨강 영역은 텍스트 크기만큼이다.",
    relatedTopicSlugs: ["05-swiftui/layout-system"],
  },
  {
    id: "objective-c05-intermediate-layout-system-003",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`GeometryReader`의 동작 특성으로 옳은 것은?",
    choices: [
      { id: "a", text: "자식 크기에 맞게 자동으로 크기가 결정된다." },
      { id: "b", text: "항상 부모가 제안한 크기를 모두 채운다(greedy)." },
      { id: "c", text: "자식 뷰보다 항상 작은 크기를 사용한다." },
      { id: "d", text: "PreferenceKey 없이도 자식 크기를 부모에 전달할 수 있다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`GeometryReader`는 항상 부모가 제안한 크기를 모두 채우는 greedy 컨테이너다. 부모의 제안 크기를 읽어 자식 레이아웃에 사용할 수 있으며, 자식 크기를 부모로 전달하려면 `PreferenceKey`를 별도로 사용해야 한다.",
    relatedTopicSlugs: ["05-swiftui/layout-system"],
  },
  {
    id: "objective-c05-intermediate-layout-system-004",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`HStack`에서 자식 View들의 공간 분배 방식으로 올바른 것은?",
    choices: [
      { id: "a", text: "모든 자식에게 동등하게 공간을 먼저 배분한 뒤 남은 공간을 처리한다." },
      { id: "b", text: "layoutPriority가 낮은 자식에게 공간을 먼저 배분한다." },
      { id: "c", text: "고정 크기(유연하지 않은) 자식을 먼저 처리하고 남은 공간을 유연한 자식에게 배분한다." },
      { id: "d", text: "자식 선언 순서대로 공간을 순차 배분한다." },
    ],
    correctChoiceId: "c",
    explanation:
      "Stack은 유연한 자식(Spacer, frame(minWidth:) 등)보다 고정 크기 자식을 먼저 처리하고, 남은 공간을 유연한 자식에게 배분한다. `layoutPriority`로 유연한 자식 간의 우선순위를 조절할 수 있다.",
    relatedTopicSlugs: ["05-swiftui/layout-system"],
  },
  {
    id: "objective-c05-advanced-layout-system-005",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "`PreferenceKey`를 사용하는 주된 목적은?",
    choices: [
      { id: "a", text: "부모 View가 제안한 크기를 자식에게 전달하기 위해." },
      { id: "b", text: "자식 View의 측정값이나 데이터를 부모 View로 전파하기 위해." },
      { id: "c", text: "@Environment 값을 override하기 위해." },
      { id: "d", text: "SwiftUI 렌더 트리의 우선순위를 지정하기 위해." },
    ],
    correctChoiceId: "b",
    explanation:
      "`PreferenceKey`는 자식의 크기, 위치 등 측정값을 부모로 거슬러 올리는 표준 패턴이다. 자식이 `.preference(key:value:)`로 값을 설정하면 부모가 `.onPreferenceChange`로 받아 처리한다. 무한 루프(자식 크기에 따라 부모 크기가 변경되어 다시 자식 크기가 변경)에 주의해야 한다.",
    relatedTopicSlugs: ["05-swiftui/layout-system"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/observation-macro  (add: 4)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-intermediate-observation-macro-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`@Observable` 매크로(iOS 17+)가 기존 `ObservableObject`보다 성능상 유리한 핵심 이유는?",
    choices: [
      { id: "a", text: "class 대신 struct를 사용하므로 ARC 오버헤드가 없다." },
      { id: "b", text: "객체 전체가 아닌 실제로 읽힌 프로퍼티 단위로 정밀하게 추적하여 불필요한 body 재호출을 줄인다." },
      { id: "c", text: "@Published를 사용하지 않으므로 컴파일 타임이 단축된다." },
      { id: "d", text: "UI 업데이트를 백그라운드 스레드에서 처리할 수 있다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`ObservableObject`는 어떤 `@Published` 프로퍼티가 변경되어도 해당 객체를 구독하는 View 전체를 갱신한다. `@Observable`은 View가 실제로 읽은 KeyPath만 추적하여, 읽지 않은 프로퍼티가 변경되어도 해당 View의 body는 호출되지 않는다.",
    relatedTopicSlugs: ["05-swiftui/observation-macro"],
  },
  {
    id: "objective-c05-intermediate-observation-macro-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`@Observable` 클래스에서 추적에서 제외하고 싶은 프로퍼티에 사용하는 속성은?",
    choices: [
      { id: "a", text: "@ObservationIgnored" },
      { id: "b", text: "@Untracked" },
      { id: "c", text: "@NotPublished" },
      { id: "d", text: "@ObservationSkipped" },
    ],
    correctChoiceId: "a",
    explanation:
      "`@ObservationIgnored`를 프로퍼티에 붙이면 `@Observable` 매크로의 자동 추적 대상에서 제외된다. 추적 비용이 부담되는 큰 캐시나 변경되어도 UI에 영향이 없는 데이터에 활용한다.",
    relatedTopicSlugs: ["05-swiftui/observation-macro"],
  },
  {
    id: "objective-c05-intermediate-observation-macro-003",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`@Observable` 클래스를 View에서 사용할 때 올바른 프로퍼티 래퍼 조합은?",
    choices: [
      { id: "a", text: "직접 생성·소유 시 @StateObject, 외부 주입 시 @ObservedObject" },
      { id: "b", text: "직접 생성·소유 시 @State, binding 필요 시 @Bindable" },
      { id: "c", text: "항상 @StateObject만 사용한다." },
      { id: "d", text: "직접 생성·소유 시 @ObservedObject, binding 필요 시 @State" },
    ],
    correctChoiceId: "b",
    explanation:
      "`@Observable` 클래스는 `@StateObject`/`@ObservedObject`가 아닌 `@State`(직접 생성·소유 시)와 `@Bindable`(binding이 필요할 때) 조합으로 사용한다. `@StateObject`는 `ObservableObject` 전용이다.",
    relatedTopicSlugs: ["05-swiftui/observation-macro"],
  },
  {
    id: "objective-c05-advanced-observation-macro-004",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "`@Observable` 클래스의 인스턴스를 View body에서 메서드만 호출하고 프로퍼티를 직접 읽지 않았을 때 발생하는 문제는?",
    choices: [
      { id: "a", text: "컴파일 에러가 발생한다." },
      { id: "b", text: "메서드가 프로퍼티를 수정해도 해당 View의 body가 갱신되지 않는다." },
      { id: "c", text: "메서드 내부 프로퍼티 접근도 자동 추적되어 정상 동작한다." },
      { id: "d", text: "런타임에 무한 루프가 발생한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`@Observable` 매크로는 body에서 직접 프로퍼티에 접근할 때만 추적 의존성을 등록한다. 메서드만 호출하면 해당 메서드 안에서 읽히는 프로퍼티가 추적 대상이 되지 않아, 프로퍼티가 바뀌어도 body가 재호출되지 않는다. 보여줄 데이터는 body에서 직접 읽어야 한다.",
    relatedTopicSlugs: ["05-swiftui/observation-macro"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/performance  (add: 5)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-intermediate-performance-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "ScrollView 안에 수백 개의 아이템을 렌더링할 때 `VStack` 대신 `LazyVStack`을 사용해야 하는 이유는?",
    choices: [
      { id: "a", text: "LazyVStack은 스크롤 속도가 VStack보다 빠르다." },
      { id: "b", text: "LazyVStack은 화면에 보이는 영역의 자식만 평가(evaluate)하여 메모리와 연산을 절약한다." },
      { id: "c", text: "VStack은 100개 이상의 자식을 지원하지 않는다." },
      { id: "d", text: "LazyVStack은 ScrollView 없이도 스크롤 기능을 내장한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`VStack`은 모든 자식을 즉시 평가하지만 `LazyVStack`은 화면에 보이는 영역 직전에만 자식을 평가한다. 수백~수천 개의 아이템을 표시할 때 `LazyVStack`(또는 `List`)을 사용해야 불필요한 body 호출과 메모리 낭비를 막을 수 있다.",
    relatedTopicSlugs: ["05-swiftui/performance"],
  },
  {
    id: "objective-c05-intermediate-performance-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`AnyView`를 자주 사용하면 성능이 저하되는 이유는?",
    choices: [
      { id: "a", text: "AnyView는 Metal 렌더링을 지원하지 않기 때문이다." },
      { id: "b", text: "타입 소거로 인해 SwiftUI가 구조 동일성을 추적하지 못해 보수적으로 매번 재렌더링하기 때문이다." },
      { id: "c", text: "AnyView는 Equatable을 채택하지 않아서 비교 비용이 증가하기 때문이다." },
      { id: "d", text: "AnyView 사용 시 SwiftUI가 LazyVStack 최적화를 비활성화하기 때문이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`AnyView`는 제네릭 타입을 소거해 단일 wrapper 타입으로 만들기 때문에 SwiftUI가 내부 구조 동일성 정보를 잃는다. 결과적으로 모든 변경에서 보수적으로 전체 갱신을 수행하여 성능이 저하된다. 분기는 `@ViewBuilder if/else`로 표현하는 것이 바람직하다.",
    relatedTopicSlugs: ["05-swiftui/performance"],
  },
  {
    id: "objective-c05-intermediate-performance-003",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "부모 View의 `@State`가 자주 변경될 때 특정 자식 View의 body 재호출을 막으려면 어떻게 해야 하는가?",
    choices: [
      { id: "a", text: "자식 View에 @MainActor를 붙인다." },
      { id: "b", text: "자식 View를 View, Equatable로 채택하고 .equatable()을 적용한다." },
      { id: "c", text: "자식 View를 final class로 선언한다." },
      { id: "d", text: "부모의 @State를 @StateObject로 변경한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "자식 View를 `Equatable`로 채택하고 `.equatable()` modifier를 적용하면 부모 state가 바뀌어도 `==`가 true인 경우 SwiftUI가 body 호출을 skip한다. 단, 상태에 영향을 주는 모든 필드를 `==`에 포함해야 stale UI를 방지할 수 있다.",
    relatedTopicSlugs: ["05-swiftui/performance"],
  },
  {
    id: "objective-c05-advanced-performance-004",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "`drawingGroup()` modifier를 적용하기에 적합한 상황은?",
    choices: [
      { id: "a", text: "콘텐츠가 매 프레임 자주 변경되는 애니메이션 뷰." },
      { id: "b", text: "복잡한 그라데이션, 블러, 다중 Shape가 정적으로 합성되는 뷰." },
      { id: "c", text: "ScrollView 안의 수백 개 행을 lazy 렌더링할 때." },
      { id: "d", text: "TextField의 입력 반응성을 높일 때." },
    ],
    correctChoiceId: "b",
    explanation:
      "`drawingGroup()`은 복잡한 그라데이션, 블러, 다중 Shape를 off-screen Metal 렌더링으로 단일 합성하여 성능을 높인다. 정적 콘텐츠에 유리하며, 자주 변하는 콘텐츠에는 오히려 역효과가 날 수 있다.",
    relatedTopicSlugs: ["05-swiftui/performance"],
  },
  {
    id: "objective-c05-advanced-performance-005",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "자주 변경되는 작은 `@State`를 부모 View가 아닌 자식 View로 옮기는(state colocation, \"push state down\") 것이 유리한 이유는?",
    choices: [
      { id: "a", text: "자식 View는 부모의 @State에 접근할 수 없기 때문이다." },
      { id: "b", text: "자식이 직접 state를 가지면 그 자식의 body만 재호출되어 부모와 형제 View의 불필요한 재계산이 줄어든다." },
      { id: "c", text: "SwiftUI는 부모 View의 @State 변경을 자식에 전파하지 않는다." },
      { id: "d", text: "자식 View에 @State를 두면 ARC 사이클이 방지된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "부모 View에 자주 변경되는 state가 있으면 부모 body가 재호출될 때 비용이 큰 형제 View(예: ExpensiveList)도 함께 평가된다. 해당 state를 자식으로 내리는 *state colocation* (\"push state down\") 패턴을 쓰면 그 자식 body만 재호출되어 전체 트리의 불필요한 재계산이 줄어든다.",
    relatedTopicSlugs: ["05-swiftui/performance"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/state-management  (add: 1)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-intermediate-state-management-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`@StateObject`와 `@ObservedObject`의 가장 핵심적인 차이는?",
    choices: [
      { id: "a", text: "@StateObject는 struct 타입에, @ObservedObject는 class 타입에만 쓴다." },
      { id: "b", text: "@StateObject는 해당 View가 객체의 수명을 소유·유지하고, @ObservedObject는 외부에서 받은 객체를 관찰만 한다." },
      { id: "c", text: "@ObservedObject는 @Published가 필요하지 않지만 @StateObject는 필수이다." },
      { id: "d", text: "@StateObject는 iOS 13+, @ObservedObject는 iOS 15+에서 사용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`@StateObject`는 해당 View가 객체를 생성하고 View 재생성에도 수명을 유지한다. `@ObservedObject`는 외부에서 주입받은 객체를 관찰할 뿐 수명을 책임지지 않는다. `@ObservedObject`를 쓰면서 객체를 View 외부에서 관리하지 않으면 View 재생성 시 상태가 초기화될 수 있다.",
    relatedTopicSlugs: ["05-swiftui/state-management"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/view-graph-and-diffing  (add: 5)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-basic-view-graph-and-diffing-001",
    type: "objective",
    level: "basic",
    category: "SwiftUI",
    prompt:
      "SwiftUI 내부의 3가지 트리를 올바르게 나열한 것은?",
    choices: [
      { id: "a", text: "View Hierarchy → View Graph → Render Tree" },
      { id: "b", text: "Render Tree → View Graph → View Hierarchy" },
      { id: "c", text: "View Graph → View Hierarchy → Render Tree" },
      { id: "d", text: "View Hierarchy → Render Tree → View Graph" },
    ],
    correctChoiceId: "a",
    explanation:
      "SwiftUI는 개발자가 작성한 View struct 트리(View Hierarchy)를 기반으로 내부 View Graph(identity, lifetime, dependency 추적)를 구성하고, 변경된 부분만 실제 렌더(CoreAnimation/Metal)를 수행하는 Render Tree에 반영한다.",
    relatedTopicSlugs: ["05-swiftui/view-graph-and-diffing"],
  },
  {
    id: "objective-c05-intermediate-view-graph-and-diffing-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`@ViewBuilder`가 if/else 분기를 AnyView 없이 처리할 수 있는 이유는?",
    choices: [
      { id: "a", text: "ViewBuilder는 런타임에 타입을 동적으로 결정하기 때문이다." },
      { id: "b", text: "ViewBuilder는 result builder로, 컴파일러가 분기를 _ConditionalContent<A, B> 같은 컴파일 타임 제네릭 타입으로 변환하기 때문이다." },
      { id: "c", text: "ViewBuilder가 내부적으로 AnyView를 생성하기 때문이다." },
      { id: "d", text: "SwiftUI가 if/else를 하나의 View 타입으로 병합하기 때문이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`@ViewBuilder`는 Swift result builder다. 컴파일러가 if/else 분기를 `_ConditionalContent<TrueContent, FalseContent>` 같은 컴파일 타임에 결정되는 제네릭 타입으로 변환한다. 이를 통해 AnyView 없이 타입 안전하게 분기를 표현할 수 있다.",
    relatedTopicSlugs: ["05-swiftui/view-graph-and-diffing"],
  },
  {
    id: "objective-c05-intermediate-view-graph-and-diffing-003",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "SwiftUI diffing에서 자식 View가 `Equatable`을 채택하거나 reflection으로 동일하다고 판단될 때 SwiftUI가 취하는 동작은?",
    choices: [
      { id: "a", text: "해당 View의 body를 한 번 더 호출해 확인한다." },
      { id: "b", text: "해당 View 서브트리를 건너뛰어(skip) 불필요한 재계산을 방지한다." },
      { id: "c", text: "해당 View를 Render Tree에서 제거한다." },
      { id: "d", text: "해당 View의 @State를 초기화한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "SwiftUI diffing 과정에서 자식 View가 Equatable을 채택하거나 reflection으로 이전 값과 동일하다고 판단되면 해당 서브트리의 body 재호출을 건너뛴다. 이것이 SwiftUI 성능 최적화의 핵심 원리 중 하나다.",
    relatedTopicSlugs: ["05-swiftui/view-graph-and-diffing"],
  },
  {
    id: "objective-c05-intermediate-view-graph-and-diffing-004",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`ObservableObject`와 `@Observable`의 dependency 추적 단위 차이를 가장 잘 설명한 것은?",
    choices: [
      { id: "a", text: "ObservableObject는 프로퍼티 단위, @Observable은 객체 단위로 추적한다." },
      { id: "b", text: "ObservableObject는 객체의 어떤 변경에도 의존 View를 갱신하고, @Observable은 실제로 읽힌 프로퍼티만 추적한다." },
      { id: "c", text: "두 방식 모두 프로퍼티 단위로 동일하게 추적한다." },
      { id: "d", text: "@Observable은 객체 수준에서만 추적하여 더 빠르다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`ObservableObject`는 objectWillChange Publisher를 통해 객체의 어떤 `@Published` 프로퍼티가 변경되어도 해당 객체를 구독하는 모든 View를 갱신한다. `@Observable`은 각 View가 body에서 실제로 읽은 KeyPath만 추적하므로, 읽지 않은 프로퍼티가 변경되어도 해당 View는 갱신되지 않는다.",
    relatedTopicSlugs: ["05-swiftui/view-graph-and-diffing"],
  },
  {
    id: "objective-c05-advanced-view-graph-and-diffing-005",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt:
      "`Self._printChanges()`를 body에서 호출하면 출력되는 정보는?",
    choices: [
      { id: "a", text: "View의 렌더링 소요 시간." },
      { id: "b", text: "body가 다시 호출된 원인(어떤 dependency가 변경되었는지)." },
      { id: "c", text: "View Graph의 현재 노드 수." },
      { id: "d", text: "@State 프로퍼티의 현재 값 목록." },
    ],
    correctChoiceId: "b",
    explanation:
      "`Self._printChanges()`는 해당 View의 body가 재호출된 이유, 즉 어떤 dependency(state, binding, observable 등)가 변경되어 body가 트리거됐는지 콘솔에 출력한다. SwiftUI 성능 디버깅에 유용하다.",
    relatedTopicSlugs: ["05-swiftui/view-graph-and-diffing"],
  },

  // ────────────────────────────────────────────────────────────
  // 05-swiftui/view-identity-and-lifetime  (add: 2)
  // ────────────────────────────────────────────────────────────
  {
    id: "objective-c05-intermediate-view-identity-and-lifetime-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "SwiftUI에서 `.id(newValue)`로 명시적 identity 값을 변경할 때 발생하는 일은?",
    choices: [
      { id: "a", text: "해당 View의 body만 재호출되고 @State는 유지된다." },
      { id: "b", text: "해당 View를 완전히 새로운 View로 인식하여 @State가 초기화되고 transition이 발생한다." },
      { id: "c", text: "부모 View의 body가 재호출된다." },
      { id: "d", text: "영향 없음. id modifier는 ForEach 내부에서만 동작한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`.id(value)`의 value가 변경되면 SwiftUI는 해당 View를 전혀 다른 새 View로 인식한다. 내부 `@State`가 초기화되고 transition 효과도 적용된다. 의도적인 상태 리셋에 사용할 수 있지만, 매 프레임 새 UUID를 넣으면 안 된다.",
    relatedTopicSlugs: ["05-swiftui/view-identity-and-lifetime"],
  },
  {
    id: "objective-c05-intermediate-view-identity-and-lifetime-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt:
      "`ForEach(items, id: \\.self)`를 사용할 때 발생할 수 있는 문제는?",
    choices: [
      { id: "a", text: "Identifiable을 채택한 타입에는 적용할 수 없다." },
      { id: "b", text: "두 row의 값이 동일하면 id 충돌이 발생하고, 값 변경 시 새 row로 인식되어 애니메이션 버그와 TextField 리셋이 생길 수 있다." },
      { id: "c", text: "items 배열이 비어 있을 때 크래시가 발생한다." },
      { id: "d", text: "컴파일 에러가 발생한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`id: \\.self`는 요소의 값 자체를 id로 사용한다. 두 요소가 같은 값이면 id 충돌이 발생하고, 요소 값이 바뀌면 SwiftUI가 새 row로 인식하여 잘못된 애니메이션, TextField 리셋 등의 버그가 발생할 수 있다. `Identifiable`을 채택하여 안정적인 id를 사용하는 것이 권장된다.",
    relatedTopicSlugs: ["05-swiftui/view-identity-and-lifetime"],
  },
];
