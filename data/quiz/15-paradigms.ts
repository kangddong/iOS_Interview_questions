import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── 15-paradigms/fp ──────────────────────────────────────────────────────
  {
    id: "objective-c15-intermediate-fp-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt:
      "Swift에서 `lazy` 시퀀스를 사용하는 것이 항상 성능에 유리하지 않은 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "lazy는 중간 배열을 생성하지 않지만, 모든 원소를 평가해야 할 때는 오히려 오버헤드만 추가된다.",
      },
      {
        id: "b",
        text: "lazy 시퀀스는 멀티스레드 환경에서 안전하지 않아 race condition이 발생할 수 있다.",
      },
      {
        id: "c",
        text: "lazy를 쓰면 컴파일러가 최적화를 적용할 수 없어 실행 시간이 느려진다.",
      },
      {
        id: "d",
        text: "lazy 시퀀스는 filter만 지원하고 map, reduce는 지원하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`lazy`는 원소 일부만 필요한 경우(예: `first(where:)`)에 중간 배열 생성을 생략해 이득을 얻습니다. 그러나 결국 전체 원소를 평가해야 한다면 eager 평가보다 `lazy` 래퍼 오버헤드만 추가될 수 있습니다. 따라서 '일부만 필요한 경우'에 선택적으로 사용하는 것이 핵심입니다.",
    relatedTopicSlugs: ["15-paradigms/fp"],
  },
  {
    id: "objective-c15-advanced-fp-002",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt:
      "Swift의 `Optional`과 `Result`가 Monad 패턴에 가깝다고 할 때, `flatMap`이 단순 `map`과 구별되는 핵심 역할은?",
    choices: [
      {
        id: "a",
        text: "flatMap은 함수 적용 후 중첩된 컨테이너를 한 겹 풀어(flatten) 반환하므로, 변환 함수 자체가 컨테이너를 반환할 때 중첩을 방지한다.",
      },
      {
        id: "b",
        text: "flatMap은 nil이 아닌 값만 필터링하여 새 컬렉션을 만드는 compactMap의 다른 이름이다.",
      },
      {
        id: "c",
        text: "flatMap은 비동기 클로저에서만 사용 가능하며 동기 컨텍스트에서는 컴파일 오류가 발생한다.",
      },
      {
        id: "d",
        text: "flatMap은 컨테이너 밖의 값에 함수를 적용하지 않아 부작용을 완전히 제거한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`map`은 컨테이너 안의 값을 변환하여 다시 같은 컨테이너에 담습니다. 변환 함수 자체가 컨테이너를 반환하면 `Optional<Optional<T>>`처럼 중첩됩니다. `flatMap`은 변환 후 이 중첩을 한 겹 풀어주므로(Monad의 `bind`/`>>=` 연산에 해당), 연속 변환 체인에서 중첩 없이 이어나갈 수 있습니다.",
    relatedTopicSlugs: ["15-paradigms/fp"],
  },

  // ── 15-paradigms/imperative-vs-declarative ───────────────────────────────
  {
    id: "objective-c15-basic-imperative-vs-declarative-001",
    type: "objective",
    level: "basic",
    category: "Paradigms",
    prompt:
      "다음 중 선언형(declarative) 프로그래밍의 특성을 가장 잘 설명한 것은?",
    choices: [
      {
        id: "a",
        text: "결과가 어떠해야 하는지를 기술하고, 구체적인 실행 경로는 프레임워크나 런타임이 결정한다.",
      },
      {
        id: "b",
        text: "각 단계를 순서대로 명시해 컴파일러가 최적화할 여지를 최소화한다.",
      },
      {
        id: "c",
        text: "모든 상태 변화를 개발자가 직접 호출로 제어해 부작용을 명확히 한다.",
      },
      {
        id: "d",
        text: "반복문(for/while)을 통해 컬렉션을 순회하며 조건을 검사하는 방식이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "선언형 프로그래밍은 '무엇(what)'을 원하는지를 표현하고 '어떻게(how)'는 프레임워크/런타임에 위임합니다. SwiftUI의 `body`가 대표적으로, '이 상태일 때 이런 뷰를 보여줘'라고 선언하면 SwiftUI가 diff·렌더링 방법을 결정합니다. 반면 b·c·d는 명령형(imperative)의 특성입니다.",
    relatedTopicSlugs: ["15-paradigms/imperative-vs-declarative"],
  },
  {
    id: "objective-c15-intermediate-imperative-vs-declarative-002",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt:
      "SwiftUI에서 선언형 모델의 '숨은 비용' 중 하나로, `ForEach`에 잘못된 `id`를 제공했을 때 발생하는 가장 직접적인 문제는?",
    choices: [
      {
        id: "a",
        text: "메모리 릭 — id가 없으면 SwiftUI가 뷰를 해제하지 않아 retain cycle이 발생한다.",
      },
      {
        id: "b",
        text: "diff 실패 — identity가 잘못되면 뷰 재사용/전환 계산이 틀려 state 초기화나 transition 오동작이 일어난다.",
      },
      {
        id: "c",
        text: "컴파일 오류 — SwiftUI는 id 타입을 컴파일 타임에 강제 검증하므로 잘못되면 빌드가 실패한다.",
      },
      {
        id: "d",
        text: "데이터 경쟁 — 같은 id를 여러 뷰가 공유하면 메인 스레드 외부에서 상태가 수정된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "SwiftUI는 뷰 트리를 diff할 때 각 항목의 identity를 기준으로 변경·추가·삭제를 판단합니다. `id: \\.self`처럼 안정적이지 않은 identity를 사용하면 diff 결과가 틀려, 실제로는 같은 뷰인데 새로 생성하거나(state 초기화), 다른 뷰인데 재사용(전환 오동작)할 수 있습니다. 이는 선언형 모델이 identity를 개발자에게 명확히 요구하는 이유입니다.",
    relatedTopicSlugs: ["15-paradigms/imperative-vs-declarative"],
  },

  // ── 15-paradigms/oop-vs-fp ───────────────────────────────────────────────
  {
    id: "objective-c15-intermediate-oop-vs-fp-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt:
      "'Functional Core, Imperative Shell' 패턴에서 Functional Core와 Imperative Shell이 각각 담당하는 역할로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "Functional Core — 네트워크·DB 등 부작용 처리 / Imperative Shell — 순수 비즈니스 로직 변환",
      },
      {
        id: "b",
        text: "Functional Core — 순수 함수로 구성된 비즈니스 로직 변환 / Imperative Shell — UI·IO·네트워크 등 부작용 처리",
      },
      {
        id: "c",
        text: "Functional Core — SwiftUI 선언형 뷰 / Imperative Shell — UIKit 명령형 뷰",
      },
      {
        id: "d",
        text: "Functional Core — 모든 테스트 코드 / Imperative Shell — 프로덕션 코드",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "'Functional Core, Imperative Shell'은 핵심 비즈니스 로직을 순수 함수로 구현해 테스트 가능성을 극대화하고, 부작용(UI 업데이트·네트워크·파일 시스템)은 얇은 명령형 셸에서 처리하는 패턴입니다. TCA의 Reducer(순수 함수) + Effect(셸)가 이 철학의 대표 구현입니다. Functional Core는 unit test로 대규모 커버, Imperative Shell은 통합 테스트로 얇게 검증합니다.",
    relatedTopicSlugs: ["15-paradigms/oop-vs-fp"],
  },
  {
    id: "objective-c15-advanced-oop-vs-fp-002",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt:
      "Swift에서 FP 스타일 코드가 '동시성 안전'하다고 볼 수 있는 근본 이유는 무엇인가?",
    choices: [
      {
        id: "a",
        text: "Swift 컴파일러가 FP 스타일 함수에 자동으로 `@Sendable`을 붙여주기 때문이다.",
      },
      {
        id: "b",
        text: "불변 값(immutable value)은 공유해도 상태가 변하지 않으므로 race condition의 전제인 '가변 공유 상태'가 존재하지 않는다.",
      },
      {
        id: "c",
        text: "map/filter/reduce는 내부적으로 GCD serial queue를 사용해 단일 스레드에서 실행되기 때문이다.",
      },
      {
        id: "d",
        text: "FP 함수는 클로저를 캡처하지 않으므로 외부 참조로 인한 race가 원천 차단된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Race condition은 여러 스레드가 같은 가변 상태에 동시 접근할 때 발생합니다. 불변 값(struct, let)은 변경이 불가하므로, 여러 Task가 같은 데이터를 읽어도 상태 변화 자체가 없습니다. 이것이 FP의 동시성 안전의 근거입니다. 단, 클로저가 외부 가변 참조를 캡처하면 race가 가능하므로 capture list와 `Sendable` 준수로 차단해야 합니다.",
    relatedTopicSlugs: ["15-paradigms/oop-vs-fp"],
  },

  // ── 15-paradigms/oop ─────────────────────────────────────────────────────
  {
    id: "objective-c15-intermediate-oop-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt:
      "SOLID 원칙 중 LSP(Liskov Substitution Principle)를 위반하는 사례로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "Rectangle 슈퍼클래스를 상속한 Square 서브클래스에서 `setWidth` 호출 시 height도 같이 변경되어, 슈퍼클래스의 '너비·높이 독립' 계약을 깨뜨린다.",
      },
      {
        id: "b",
        text: "한 ViewController가 네트워크 호출과 UI 렌더링을 모두 담당해 SRP를 위반한다.",
      },
      {
        id: "c",
        text: "protocol에 필요하지 않은 메서드까지 포함해 구현체가 빈 메서드를 강제로 선언한다.",
      },
      {
        id: "d",
        text: "고수준 모듈이 저수준 구현체에 직접 의존해 교체가 어렵다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "LSP는 서브타입이 슈퍼타입의 *계약*을 완전히 따라야 한다는 원칙입니다. Rectangle에서 너비와 높이는 독립적으로 설정 가능하다는 계약이 있을 때, Square 서브클래스가 `setWidth`에서 height도 바꾸면 이 계약을 위반합니다. 결과적으로 `Rectangle` 타입 변수에 `Square`를 대입했을 때 예상치 못한 동작이 발생합니다. 이 경우 Square는 상속 대신 별개 타입으로 모델링해야 합니다. b는 SRP, c는 ISP, d는 DIP 위반입니다.",
    relatedTopicSlugs: ["15-paradigms/oop"],
  },

  // ─── pop (add: 2) ────────────────────────────────────────────────────────
  {
    id: "objective-c15-intermediate-pop-fundamentals-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "Swift 프로토콜 *extension의 default implementation*과 *프로토콜 요구 사항(requirement)*의 디스패치 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "프로토콜 requirement는 witness table을 통한 동적 디스패치, extension에만 정의된 메서드(요구사항 아님)는 컴파일 시 정적 디스패치된다" },
      { id: "b", text: "둘 다 항상 동적 디스패치되므로 차이가 없다" },
      { id: "c", text: "둘 다 항상 정적 디스패치되므로 채택 타입에서 override가 불가능하다" },
      { id: "d", text: "extension의 default impl은 ObjC 런타임을 통해 동적 디스패치된다" },
    ],
    correctChoiceId: "a",
    explanation:
      "프로토콜 본문에 선언된 *요구사항*은 채택 타입이 반드시 제공해야 하며 witness table을 거쳐 동적 디스패치된다. 반면 extension에만 정의되고 본문에 요구사항이 없는 메서드는 채택 타입이 같은 시그니처의 메서드를 정의해도 *컴파일 시 변수의 정적 타입*으로 디스패치되므로, `let p: P = S()`에서 `p.foo()`를 부르면 S가 override해도 P의 default impl이 호출된다. 이 차이가 POP의 흔한 함정.",
    relatedTopicSlugs: ["15-paradigms/fp", "01-swift-language/protocol-oriented-programming"],
  },
  {
    id: "objective-c15-basic-higher-order-functions-001",
    type: "objective",
    level: "basic",
    category: "Paradigms",
    prompt: "*순수 함수(pure function)* 의 정의로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "같은 입력에 대해 항상 같은 출력을 반환하고, 외부 상태를 읽거나 변경하지 않는 함수" },
      { id: "b", text: "throws를 사용하지 않는 함수" },
      { id: "c", text: "@inlinable이 붙은 함수" },
      { id: "d", text: "Swift Concurrency의 async 함수" },
    ],
    correctChoiceId: "a",
    explanation:
      "순수 함수는 *referential transparency*를 만족한다 — 동일 인자에 대해 항상 같은 결과를 반환하고, 외부 상태(전역 변수, I/O, 시계 등)에 의존하거나 변경하지 않는다. 이 성질 덕분에 테스트·캐시·병렬화·합성이 쉬워진다. `map`/`filter`/`reduce` 같은 고차함수는 인자로 받은 함수가 pure할 때 안전하게 합성된다.",
    relatedTopicSlugs: ["15-paradigms/fp"],
  },
];
