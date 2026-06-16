import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── arc-optimization (3) ──────────────────────────────────────────────────
  {
    id: "objective-c02-intermediate-arc-optimization-001",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "Swift ARC에서 '+0 (guaranteed)' 호출 컨벤션이 '+1 (owned)'과 다른 점은 무엇인가?",
    choices: [
      {
        id: "a",
        text: "함수가 인자를 받을 때 retain을 추가하지 않고 빌려 쓰므로, 함수 내에서 release를 호출할 필요가 없다.",
      },
      {
        id: "b",
        text: "함수가 인자를 받을 때 항상 retain을 1회 추가하고, 함수가 직접 release를 호출할 책임을 진다.",
      },
      {
        id: "c",
        text: "컴파일러가 호출 경계에서 retain/release 쌍을 무조건 삽입하되, 런타임이 이를 취소한다.",
      },
      {
        id: "d",
        text: "+0 컨벤션은 오직 struct 인자에만 적용되며 class에는 적용되지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift는 기본적으로 +0(guaranteed) 컨벤션을 사용해 호출자가 객체를 빌려준다. 함수는 retain을 추가하지 않으므로 release 책임도 없다. 반면 +1(owned)은 호출자가 retain된 객체를 건네주고 피호출자가 release한다. ObjC ARC는 기본이 +1이라는 점이 Swift ARC와 큰 차이다.",
    relatedTopicSlugs: ["02-memory-management/arc-optimization"],
  },
  {
    id: "objective-c02-advanced-arc-optimization-002",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt:
      "Swift 컴파일러의 ARC 최적화 패스(SIL 단계)가 수행하는 동작으로 옳지 않은 것은?",
    choices: [
      { id: "a", text: "hot path 밖으로 retain을 늦추고 release를 앞당긴다." },
      {
        id: "b",
        text: "짧은 스코프 내에서 짝이 맞는 retain-release 쌍을 공동 제거한다.",
      },
      {
        id: "c",
        text: "루프 불변 retain/release를 루프 밖으로 이동한다(code motion).",
      },
      {
        id: "d",
        text: "retain cycle을 탐지하고 자동으로 weak 참조로 변환한다.",
      },
    ],
    correctChoiceId: "d",
    explanation:
      "ARC 최적화 패스는 retain/release 쌍 제거, movement, block reordering, code motion을 수행하지만, retain cycle 탐지나 자동 weak 변환은 하지 않는다. retain cycle은 개발자가 수동으로 weak/unowned로 끊어야 한다.",
    relatedTopicSlugs: ["02-memory-management/arc-optimization"],
  },
  {
    id: "objective-c02-advanced-arc-optimization-003",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt:
      "Swift 객체에서 side table이 생성되는 주된 조건은 무엇인가?",
    choices: [
      {
        id: "a",
        text: "unowned 참조가 처음 추가될 때 객체 헤더 비트가 부족해지면 자동으로 생성된다.",
      },
      {
        id: "b",
        text: "weak 참조가 처음 생성될 때 기존 inline count 구조 대신 weak count를 저장하기 위해 분리된다.",
      },
      {
        id: "c",
        text: "클래스 상속 계층이 3단계 이상일 때 isa pointer 충돌을 막기 위해 생성된다.",
      },
      { id: "d", text: "retain count가 Int32 최댓값을 초과하면 생성된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift 클래스는 기본적으로 객체 헤더에 strong/unowned 카운트를 비트필드로 직접 저장(inline counts)한다. weak 참조가 최초로 생성되는 시점에 side table이 분리되며, weak count는 side table에 저장된다. 이후 weak 접근 비용이 약간 증가한다.",
    relatedTopicSlugs: ["02-memory-management/arc-optimization"],
  },

  // ── arc (3) ───────────────────────────────────────────────────────────────
  {
    id: "objective-c02-basic-arc-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "Swift ARC에서 retain count가 0이 되는 시점에 발생하는 일은 무엇인가?",
    choices: [
      {
        id: "a",
        text: "가비지 컬렉터가 다음 GC 사이클에서 메모리를 회수한다.",
      },
      {
        id: "b",
        text: "deinit이 즉시 호출된 후 메모리가 해제된다.",
      },
      {
        id: "c",
        text: "autoreleasepool에 등록되어 RunLoop 끝에 메모리가 해제된다.",
      },
      {
        id: "d",
        text: "컴파일러가 다음 빌드 시점에 불필요 코드로 제거한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "ARC는 마지막 strong 참조가 사라져 count가 0이 되는 즉시 deinit을 호출하고 메모리를 해제한다. GC처럼 지연 수거가 없어 결정적(deterministic) 해제가 보장된다.",
    relatedTopicSlugs: ["02-memory-management/arc"],
  },
  {
    id: "objective-c02-basic-arc-002",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt: "다음 중 ARC의 직접 적용 대상이 아닌 것은?",
    choices: [
      { id: "a", text: "class 인스턴스" },
      { id: "b", text: "closure" },
      { id: "c", text: "actor 인스턴스" },
      { id: "d", text: "struct 인스턴스" },
    ],
    correctChoiceId: "d",
    explanation:
      "ARC는 참조 타입(class, actor, closure)에만 적용된다. struct/enum 같은 값 타입은 스코프 기반으로 해제되므로 ARC 대상이 아니다. 단, 값 타입 내부에 참조 타입 프로퍼티가 있으면 그 참조에 한해 ARC가 적용된다.",
    relatedTopicSlugs: ["02-memory-management/arc"],
  },
  {
    id: "objective-c02-intermediate-arc-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "ARC가 retain cycle을 자동으로 해결하지 못하는 근본 이유는?",
    choices: [
      {
        id: "a",
        text: "retain/release 삽입이 컴파일 타임에 이루어져 런타임 그래프 탐색이 불가능하기 때문이다.",
      },
      {
        id: "b",
        text: "cycle 내 객체들은 서로가 서로를 strong 참조해 count가 0으로 떨어지지 않으므로, 도달 가능성을 추적하는 GC만 해결할 수 있다.",
      },
      {
        id: "c",
        text: "Swift 컴파일러가 순환 의존 코드를 빌드 에러로 차단하기 때문이다.",
      },
      {
        id: "d",
        text: "ARC는 힙이 아닌 스택 메모리만 관리하기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "ARC는 reference count 기반으로 동작하므로, 두 객체가 서로 strong 참조하면 어느 쪽도 count가 0이 되지 않아 deinit이 호출되지 않는다. 도달 가능성(reachability) 분석을 통해 순환을 탐지하는 GC와 달리, ARC는 이를 처리하지 못한다.",
    relatedTopicSlugs: ["02-memory-management/arc"],
  },

  // ── autoreleasepool (5) ───────────────────────────────────────────────────
  {
    id: "objective-c02-basic-autoreleasepool-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "iOS 메인 스레드에서 autoreleasepool을 직접 작성하지 않아도 되는 이유는?",
    choices: [
      {
        id: "a",
        text: "메인 스레드는 Swift ARC가 자동으로 모든 객체를 즉시 release하기 때문이다.",
      },
      {
        id: "b",
        text: "RunLoop이 매 사이클마다 autoreleasepool을 자동으로 비워주기 때문이다.",
      },
      {
        id: "c",
        text: "메인 스레드에서는 Foundation 객체가 생성되지 않기 때문이다.",
      },
      {
        id: "d",
        text: "Xcode가 빌드 시점에 autoreleasepool 블록을 자동으로 삽입하기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS 앱의 메인 스레드는 RunLoop이 매 사이클마다 autoreleasepool을 자동으로 비운다. 따라서 일반적인 경우 명시적 pool이 필요 없지만, 한 메서드에서 대량의 임시 객체를 생성한다면 그 사이클이 끝나기 전까지 메모리가 회수되지 않으므로 명시적 pool이 의미 있다.",
    relatedTopicSlugs: ["02-memory-management/autoreleasepool"],
  },
  {
    id: "objective-c02-intermediate-autoreleasepool-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "백그라운드 스레드(Thread/pthread)에서 ObjC 계열 객체를 다량 생성할 때 autoreleasepool을 명시적으로 사용해야 하는 이유는?",
    choices: [
      {
        id: "a",
        text: "백그라운드 스레드는 자동 autoreleasepool이 없으므로, pool 없이 autorelease 객체를 만들면 앱 종료 시점까지 메모리가 회수되지 않는다.",
      },
      {
        id: "b",
        text: "백그라운드 스레드에서 Swift ARC가 비활성화되어 수동 retain/release가 필요하기 때문이다.",
      },
      {
        id: "c",
        text: "GCD가 백그라운드 큐에서 ARC를 완전히 우회하기 때문이다.",
      },
      {
        id: "d",
        text: "백그라운드 스레드는 힙 메모리에 접근할 수 없어 스택에만 쌓이기 때문이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Thread/pthread로 만든 백그라운드 스레드는 RunLoop이 없으므로 자동 autoreleasepool도 없다. autorelease 객체들이 pool 없이 쌓이면 앱 종료 전까지 해제되지 않을 수 있다. 따라서 스레드 진입점 또는 반복 루프 단위에 명시적 autoreleasepool {}을 감싸야 한다.",
    relatedTopicSlugs: ["02-memory-management/autoreleasepool"],
  },
  {
    id: "objective-c02-intermediate-autoreleasepool-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "순수 Swift 객체에 대해 autoreleasepool의 효과가 제한적인 이유는?",
    choices: [
      {
        id: "a",
        text: "Swift는 모든 객체를 스택에만 할당하므로 pool이 관여할 수 없다.",
      },
      {
        id: "b",
        text: "Swift ARC는 각 release 지점에서 즉시 해제를 수행하므로 autorelease 지연이 필요 없다. 단, ObjC bridge API를 사용하면 autorelease 객체가 생길 수 있다.",
      },
      {
        id: "c",
        text: "Swift 컴파일러가 autoreleasepool 블록을 자동으로 제거하도록 최적화하기 때문이다.",
      },
      {
        id: "d",
        text: "Swift 객체는 reference count 대신 가비지 컬렉터를 사용하기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "순수 Swift는 ARC가 각 release 지점에서 즉시 메모리를 회수하므로 autorelease pool의 효과가 거의 없다. 그러나 Foundation, UIKit, CoreGraphics 등 ObjC 계열 API를 사용할 때는 autorelease 객체가 만들어질 수 있으며, 이 경우 대량 처리 루프에서 autoreleasepool이 메모리 폭증을 방지한다.",
    relatedTopicSlugs: ["02-memory-management/autoreleasepool"],
  },
  {
    id: "objective-c02-basic-autoreleasepool-004",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "다음 코드에서 autoreleasepool {}을 루프 안에 적용하는 주목적은 무엇인가?\n\n```swift\nfor url in urls {\n    autoreleasepool {\n        let img = UIImage(data: try! Data(contentsOf: url))\n        // 처리\n    }\n}\n```",
    choices: [
      {
        id: "a",
        text: "반복마다 autorelease 객체를 즉시 비워 루프 전체 실행 중 메모리가 누적되지 않도록 한다.",
      },
      {
        id: "b",
        text: "UIImage 생성 속도를 높이기 위해 멀티스레딩을 활성화한다.",
      },
      {
        id: "c",
        text: "try! 예외가 발생할 때 rollback 메커니즘을 제공한다.",
      },
      {
        id: "d",
        text: "루프 변수 url이 스코프를 벗어나도 이미지가 살아있도록 retain한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "UIImage 등 ObjC 계열 API는 내부적으로 autorelease 객체를 생성할 수 있다. autoreleasepool을 루프 내부에 두면 각 이터레이션이 끝날 때마다 pool이 비워져 메모리가 즉시 회수된다. 그렇지 않으면 루프가 끝날 때까지 임시 객체가 모두 메모리에 쌓인다.",
    relatedTopicSlugs: ["02-memory-management/autoreleasepool"],
  },
  {
    id: "objective-c02-intermediate-autoreleasepool-005",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "Instruments → Allocations에서 루프 중 메모리 사용량이 급증하는 것을 발견했다. autoreleasepool 도입 여부를 결정하는 올바른 접근법은?",
    choices: [
      {
        id: "a",
        text: "모든 반복문에 무조건 autoreleasepool을 추가한다.",
      },
      {
        id: "b",
        text: "Instruments에서 Persistent/Transient 추이를 관찰하고, pool 적용 전후를 비교해 실질적 차이가 있을 때만 도입한다.",
      },
      {
        id: "c",
        text: "autoreleasepool은 ObjC 전용이므로 Swift 프로젝트에서는 사용하지 않는다.",
      },
      {
        id: "d",
        text: "루프를 async/await로 전환하면 자동으로 pool 문제가 해결된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "autoreleasepool은 가독성 비용이 있으므로, Instruments → Allocations에서 Persistent/Transient 객체 추이를 확인해 실제로 차이가 발생하는 경우에만 도입한다. 효과가 없으면 불필요하게 추가하지 않는 것이 권장 방식이다.",
    relatedTopicSlugs: ["02-memory-management/autoreleasepool"],
  },

  // ── capture-list (4) ──────────────────────────────────────────────────────
  {
    id: "objective-c02-basic-capture-list-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "다음 코드에서 retain cycle이 발생하는 이유는?\n\n```swift\nclass ViewModel {\n    var onUpdate: (() -> Void)?\n    func bind() {\n        onUpdate = { self.refresh() }\n    }\n}\n```",
    choices: [
      {
        id: "a",
        text: "onUpdate closure가 self를 strong 캡처하고, self가 onUpdate를 strong 보유해 서로가 서로를 살린다.",
      },
      {
        id: "b",
        text: "refresh()가 동기 함수라 closure가 즉시 실행되므로 retain cycle이 발생한다.",
      },
      {
        id: "c",
        text: "Optional 타입의 프로퍼티는 항상 retain cycle을 만든다.",
      },
      {
        id: "d",
        text: "class 내부에서 self를 참조하면 컴파일러가 강제로 strong 참조를 두 배로 만들기 때문이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "onUpdate closure가 self를 strong 캡처(기본 캡처)하고, self는 onUpdate를 strong 프로퍼티로 보유한다. 두 strong 참조가 순환을 이루어 어느 쪽도 count가 0이 되지 않는다. 해결책은 `{ [weak self] in self?.refresh() }`처럼 [weak self]를 사용하는 것이다.",
    relatedTopicSlugs: [
      "02-memory-management/capture-list",
      "02-memory-management/retain-cycle",
    ],
  },
  {
    id: "objective-c02-intermediate-capture-list-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "아래 코드의 실행 결과는?\n\n```swift\nvar counter = 0\nlet f = { [counter] in print(counter) }\ncounter = 100\nf()\n```",
    choices: [
      { id: "a", text: "0" },
      { id: "b", text: "100" },
      { id: "c", text: "컴파일 에러" },
      { id: "d", text: "런타임 크래시" },
    ],
    correctChoiceId: "a",
    explanation:
      "캡처 리스트 `[counter]`는 closure가 생성되는 시점의 counter 값(0)을 복사해 고정한다. 이후 counter를 100으로 변경해도 closure 내부의 캡처된 값은 그대로 0이다. 이처럼 값 타입 변수를 캡처 리스트로 명시하면 '읽기 시점 스냅샷'이 만들어진다.",
    relatedTopicSlugs: ["02-memory-management/capture-list"],
  },
  {
    id: "objective-c02-intermediate-capture-list-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "`[weak self]`보다 `[unowned self]`를 거의 권장하지 않는 이유는?",
    choices: [
      {
        id: "a",
        text: "unowned는 retain count를 증가시켜 오히려 메모리 사용량이 늘어나기 때문이다.",
      },
      {
        id: "b",
        text: "성능 이득이 미미한 반면, self가 먼저 해제되는 상황에서 코드 변경 한 번에 크래시가 발생할 수 있기 때문이다.",
      },
      {
        id: "c",
        text: "unowned는 클래스 인스턴스에 적용할 수 없기 때문이다.",
      },
      {
        id: "d",
        text: "Swift 5 이후 unowned 키워드가 deprecate되었기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "unowned는 self가 closure보다 반드시 오래 산다는 보증이 깨지면 즉시 크래시가 발생한다. 비동기/Task/백그라운드 큐에서는 이 보증이 흔들리기 쉽다. weak는 자동 nil 처리로 안전 마진을 제공하며, 성능 차이는 실질적으로 미미하다.",
    relatedTopicSlugs: ["02-memory-management/capture-list"],
  },
  {
    id: "objective-c02-basic-capture-list-004",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "다음 중 캡처 리스트(`[weak self]`)가 불필요한 경우는?",
    choices: [
      {
        id: "a",
        text: "`viewModel.onUpdate = { self.label.text = $0 }` — self가 onUpdate를 보유",
      },
      {
        id: "b",
        text: "`UIView.animate(withDuration: 0.3) { self.alpha = 0 }` — 일회성 즉시 실행 closure",
      },
      {
        id: "c",
        text: "Combine `sink` 결과를 `self.cancellable`에 저장하는 경우",
      },
      {
        id: "d",
        text: "`Task { await self.load() }` — 비구조적 Task에서 self 참조",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "UIView.animate의 completion closure는 self에 저장되지 않고 일회성으로 실행된 후 사라진다. self가 closure를 strong 보유하지 않으므로 retain cycle이 생기지 않는다. 반면 나머지 예시들은 closure가 저장되거나 비동기로 생존해 cycle 또는 수명 문제가 생길 수 있다.",
    relatedTopicSlugs: ["02-memory-management/capture-list"],
  },

  // ── heap-vs-stack (5) ─────────────────────────────────────────────────────
  {
    id: "objective-c02-basic-heap-vs-stack-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "Swift에서 class 인스턴스가 heap에 할당되는 반면, struct 인스턴스가 기본적으로 stack에 할당되는 주된 이유는?",
    choices: [
      {
        id: "a",
        text: "class는 크기를 컴파일 타임에 알 수 없어 동적 할당이 필요하고, struct는 크기가 컴파일 타임에 확정되어 스택 프레임에 직접 배치된다.",
      },
      {
        id: "b",
        text: "iOS는 struct를 레지스터에, class를 항상 heap에 넣도록 ABI가 고정되어 있다.",
      },
      {
        id: "c",
        text: "class는 ARC 카운터를 힙에 저장해야 하고, struct는 카운터가 없어 스택에 산다.",
      },
      {
        id: "d",
        text: "Swift 컴파일러가 struct를 최적화해 항상 레지스터에만 올린다.",
      },
    ],
    correctChoiceId: "c",
    explanation:
      "class는 ARC reference count를 객체 헤더에 관리하며 동적 라이프타임이 필요해 heap에 할당된다. struct는 ARC 관리 대상이 아니고 스코프가 끝나면 즉시 사라지므로 stack/레지스터에 배치되는 것이 기본이다. 단, closure 캡처나 existential 박싱 시 heap으로 이동한다.",
    relatedTopicSlugs: ["02-memory-management/heap-vs-stack"],
  },
  {
    id: "objective-c02-intermediate-heap-vs-stack-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "다음 코드에서 `counter` 변수가 heap에 올라가는 이유는?\n\n```swift\nvar counter = 0\nlet inc = { counter += 1 }\n```",
    choices: [
      {
        id: "a",
        text: "Int 타입이 class 기반이라 항상 heap에 할당되기 때문이다.",
      },
      {
        id: "b",
        text: "closure가 counter를 변경 가능하게 캡처하므로, closure가 살아있는 동안 counter를 보존하기 위해 heap 박스에 담는다.",
      },
      {
        id: "c",
        text: "전역 변수 counter는 항상 data 영역에 저장되기 때문이다.",
      },
      {
        id: "d",
        text: "Swift는 var 키워드를 사용한 모든 지역 변수를 heap에 할당한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "escaping closure가 외부 var 변수를 수정 가능하게 캡처하면, 함수 종료 후에도 그 변수가 살아있어야 하므로 컴파일러가 heap allocated box를 만들어 담는다. 이 박스는 ARC로 관리된다. 읽기 전용이라면 캡처 리스트 `[counter]`로 값 복사해 박스를 피할 수 있다.",
    relatedTopicSlugs: ["02-memory-management/heap-vs-stack"],
  },
  {
    id: "objective-c02-intermediate-heap-vs-stack-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "existential container에서 값 타입이 heap에 할당되는 조건은?",
    choices: [
      { id: "a", text: "값 타입이 프로토콜을 하나라도 채택하면 항상 heap에 할당된다." },
      {
        id: "b",
        text: "값의 크기가 existential inline buffer(약 3~4 word)를 초과할 때 heap 박스에 저장된다.",
      },
      {
        id: "c",
        text: "프로토콜에 associated type이 있을 때만 heap 박싱이 발생한다.",
      },
      {
        id: "d",
        text: "값 타입은 existential로 사용될 때 항상 stack에만 머문다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift existential container는 약 3~4 word(문서에서는 24B 전후)의 inline buffer를 가진다. 저장될 값이 이 크기 이하면 인라인으로 저장하지만, 초과하면 heap에 박스를 만들고 포인터를 inline buffer에 저장한다. 이것이 'any Drawable'처럼 existential을 사용할 때 발생하는 숨겨진 할당 비용이다.",
    relatedTopicSlugs: ["02-memory-management/heap-vs-stack"],
  },
  {
    id: "objective-c02-basic-heap-vs-stack-004",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "`var arr = [1, 2, 3]`에서 arr 변수 자체와 실제 데이터 버퍼의 메모리 위치는?",
    choices: [
      {
        id: "a",
        text: "arr 변수는 stack(또는 레지스터), 내부 데이터 버퍼는 heap에 있다.",
      },
      { id: "b", text: "arr 변수와 버퍼 모두 stack에 있다." },
      { id: "c", text: "arr 변수와 버퍼 모두 heap에 있다." },
      {
        id: "d",
        text: "arr 변수는 heap, 내부 데이터 버퍼는 stack에 있다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift Array는 struct(값 타입)라 변수 자체는 stack에 위치한다. 그러나 실제 원소 데이터를 저장하는 내부 버퍼는 heap에 할당된 class 기반 객체다. Copy-on-Write 덕분에 복사 시 버퍼를 공유하다가 수정 시점에만 독립 복사가 일어난다.",
    relatedTopicSlugs: ["02-memory-management/heap-vs-stack"],
  },
  {
    id: "objective-c02-advanced-heap-vs-stack-005",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt:
      "핫패스에서 existential(`any Protocol`) 사용으로 인한 박싱 비용을 줄이는 가장 효과적인 방법은?",
    choices: [
      {
        id: "a",
        text: "existential을 제거하고 generic(`<T: Protocol>`) 파라미터로 교체해 컴파일러 특수화를 유도한다.",
      },
      {
        id: "b",
        text: "autoreleasepool을 감싸 박스가 빠르게 해제되도록 한다.",
      },
      {
        id: "c",
        text: "`@inlinable`을 모든 함수에 붙이면 existential 박싱이 자동으로 제거된다.",
      },
      {
        id: "d",
        text: "struct 대신 class를 사용해 existential 컨테이너 제한을 우회한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "existential(`any Protocol`)은 동적 디스패치와 박싱 비용이 있다. generic(`<T: Protocol>`) 파라미터로 바꾸면 컴파일러가 호출 사이트에서 구체 타입으로 특수화해 박싱 없이 정적 디스패치를 수행한다. 단, 이종 컬렉션이 진짜 필요한 경우에는 existential이 정답이며 비용을 감수해야 한다.",
    relatedTopicSlugs: ["02-memory-management/heap-vs-stack"],
  },

  // ── memory-tools (4) ──────────────────────────────────────────────────────
  {
    id: "objective-c02-basic-memory-tools-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "화면을 닫았는데 뷰컨트롤러의 deinit이 호출되지 않는다. 가장 먼저 사용해야 할 디버깅 도구는?",
    choices: [
      {
        id: "a",
        text: "Thread Sanitizer — 데이터 레이스가 deinit을 막는지 확인",
      },
      {
        id: "b",
        text: "Xcode Memory Graph Debugger — retain cycle과 살아있는 참조 체인을 시각화",
      },
      {
        id: "c",
        text: "Address Sanitizer — use-after-free 여부 확인",
      },
      {
        id: "d",
        text: "Instruments → Time Profiler — CPU 점유로 deinit이 지연되는지 확인",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "deinit이 호출되지 않는 전형적인 원인은 retain cycle 또는 의도치 않은 strong 참조다. Memory Graph Debugger는 현재 살아있는 객체 그래프와 어떤 참조가 객체를 살리고 있는지를 시각적으로 보여주어 retain chain을 빠르게 추적할 수 있다.",
    relatedTopicSlugs: ["02-memory-management/memory-tools"],
  },
  {
    id: "objective-c02-intermediate-memory-tools-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "Instruments → Leaks가 'retain cycle'을 검출하지 못하는 이유는?",
    choices: [
      {
        id: "a",
        text: "Leaks는 *도달 불가능한* 메모리를 스캔하지만, retain cycle 안의 객체들은 서로를 통해 여전히 도달 가능하기 때문이다.",
      },
      {
        id: "b",
        text: "Leaks는 Swift 객체만 분석하고 ObjC 객체를 무시하기 때문이다.",
      },
      {
        id: "c",
        text: "retain cycle은 메모리 누수가 아니라 CPU 과부하 문제이기 때문이다.",
      },
      {
        id: "d",
        text: "Leaks 도구가 iOS 16 이후 deprecated되었기 때문이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Instruments Leaks는 mark-and-sweep 방식으로 도달 불가능한 메모리를 탐지한다. retain cycle 안의 객체들은 서로를 참조하므로 루트에서 도달 가능한 것으로 간주되어 누수로 보고되지 않는다. retain cycle은 Memory Graph Debugger로 확인해야 한다.",
    relatedTopicSlugs: ["02-memory-management/memory-tools"],
  },
  {
    id: "objective-c02-intermediate-memory-tools-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "Address Sanitizer(ASan)가 주로 탐지하는 버그 유형은?",
    choices: [
      {
        id: "a",
        text: "retain cycle과 메모리 누수",
      },
      {
        id: "b",
        text: "use-after-free, 버퍼 오버플로우 등 메모리 안전성 위반",
      },
      {
        id: "c",
        text: "두 스레드가 동기화 없이 같은 메모리에 동시 접근하는 데이터 레이스",
      },
      {
        id: "d",
        text: "autoreleasepool이 비워지지 않아 발생하는 메모리 폭증",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Address Sanitizer(ASan)는 use-after-free, 버퍼 오버플로우, use-after-return 같은 메모리 안전성 위반을 탐지한다. 순수 Swift에서는 unsafe API 없이 만나기 어렵지만, ObjC/C 의존이 있는 코드에서는 유용하다. 데이터 레이스는 Thread Sanitizer(TSan)가 담당한다.",
    relatedTopicSlugs: ["02-memory-management/memory-tools"],
  },
  {
    id: "objective-c02-advanced-memory-tools-004",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt:
      "MetricKit(iOS 13+)으로 수집 가능한 실 사용자 메모리 관련 지표로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "개별 객체의 retain count와 할당 호출 스택",
      },
      {
        id: "b",
        text: "CPU/Memory 사용량, Hang, Disk writes, Crash 보고서 등 일일 집계 지표",
      },
      {
        id: "c",
        text: "Instruments와 동일한 타임라인 뷰 및 Generations 기능",
      },
      {
        id: "d",
        text: "Address Sanitizer 결과를 원격으로 전송하는 기능",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "MetricKit는 실 사용자 기기에서 OS가 수집한 CPU/Memory/Disk 사용량, Hang, Crash 보고서 등을 일일 페이로드로 앱에 전달한다. `MXMetricManager`로 구독해 실 사용자 환경의 성능 데이터를 가장 정확하게 측정할 수 있다. Instruments나 ASan은 개발 환경 도구다.",
    relatedTopicSlugs: ["02-memory-management/memory-tools"],
  },

  // ── retain-cycle (1) ──────────────────────────────────────────────────────
  {
    id: "objective-c02-intermediate-retain-cycle-001",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "struct 인스턴스끼리 직접적인 retain cycle이 발생할 수 없는 이유는?",
    choices: [
      {
        id: "a",
        text: "struct는 ARC 대상이 아니어서 retain count가 없으므로, 서로 참조해도 count 증가가 없어 cycle이 성립하지 않는다.",
      },
      {
        id: "b",
        text: "Swift 컴파일러가 struct 간 순환 참조를 컴파일 에러로 금지하기 때문이다.",
      },
      {
        id: "c",
        text: "struct는 항상 class 안에 포함되어야 하므로 독립적인 참조 그래프를 만들 수 없기 때문이다.",
      },
      {
        id: "d",
        text: "struct 인스턴스는 weak 참조만 허용하므로 cycle이 자동 차단된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "retain cycle은 ARC의 reference count 기반 메커니즘에서 발생한다. 값 타입인 struct는 ARC 대상이 아니며 복사 의미론을 가진다. struct가 struct를 포함하면 값이 복사될 뿐 순환 참조가 생기지 않는다. 단, struct 내부에 class 인스턴스를 참조하는 경우 그 class 쪽에서는 cycle이 발생할 수 있다.",
    relatedTopicSlugs: ["02-memory-management/retain-cycle"],
  },

  // ── value-type-memory (5) ─────────────────────────────────────────────────
  {
    id: "objective-c02-intermediate-value-type-memory-001",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "Swift에서 `indirect enum`을 사용해야 하는 상황과 그 이유는?",
    choices: [
      {
        id: "a",
        text: "enum 케이스 중 하나가 자기 자신을 포함하는 재귀 구조일 때, 크기를 확정할 수 없어 heap 박스를 통해 간접 참조한다.",
      },
      {
        id: "b",
        text: "enum을 class처럼 ARC로 관리하고 싶을 때 indirect 키워드를 사용한다.",
      },
      {
        id: "c",
        text: "associated value의 크기가 8바이트를 초과할 때 자동으로 heap으로 이동하도록 강제한다.",
      },
      {
        id: "d",
        text: "indirect enum은 existential container를 대체하기 위한 Swift 6 신기능이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "재귀적 enum(예: linked list 노드)은 자기 자신을 associated value로 가지므로 크기가 무한히 커진다. `indirect` 키워드를 붙이면 해당 케이스가 heap box를 통한 간접 참조로 처리되어 컴파일이 가능해진다. 케이스마다 box 할당이 발생하는 비용이 있다.",
    relatedTopicSlugs: ["02-memory-management/value-type-memory"],
  },
  {
    id: "objective-c02-basic-value-type-memory-002",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "Swift `borrowing` 파라미터(Swift 5.9+)가 메모리 최적화에 기여하는 방식은?",
    choices: [
      {
        id: "a",
        text: "호출자가 값을 '빌려주어' 함수 내에서 retain/release를 생략할 수 있어 박스 생성 가능성이 줄어든다.",
      },
      {
        id: "b",
        text: "함수가 값을 직접 소유권 이전받아 호출자의 메모리를 즉시 해제한다.",
      },
      {
        id: "c",
        text: "파라미터를 항상 힙에 복사해 스택 오버플로우를 방지한다.",
      },
      {
        id: "d",
        text: "borrowing은 class 타입에만 적용되어 ARC retain을 건너뛴다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift 5.9+의 `borrowing` 파라미터는 호출자가 소유권을 유지한 채 값을 빌려주는 의미론이다. 함수 내에서 retain/release 없이 값을 읽을 수 있어 박스화나 ARC 비용을 줄인다. ARC +0 컨벤션을 명시적으로 표현한 것으로, 큰 struct를 자주 전달하는 핫패스에 유용하다.",
    relatedTopicSlugs: ["02-memory-management/value-type-memory"],
  },
  {
    id: "objective-c02-intermediate-value-type-memory-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "다음 중 값 타입(struct)이 heap 박스에 올라가는 경우가 아닌 것은?",
    choices: [
      {
        id: "a",
        text: "struct 인스턴스를 escaping closure에서 var로 캡처하는 경우",
      },
      {
        id: "b",
        text: "struct 인스턴스를 `inout` 파라미터로 함수에 전달하는 경우",
      },
      {
        id: "c",
        text: "struct 인스턴스를 `any Protocol` 타입으로 선언하고 크기가 inline buffer를 초과하는 경우",
      },
      {
        id: "d",
        text: "Array에 struct를 append하는 경우",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "`inout`은 heap 박스를 만들지 않는다. inout은 copy-in/copy-out 의미론이며, 컴파일러가 가능하면 주소 직접 전달로 최적화한다. heap 박싱은 escaping closure 캡처, 크기 초과 existential, Array 내부 버퍼(heap) 보관, indirect enum 등의 상황에서 발생한다.",
    relatedTopicSlugs: ["02-memory-management/value-type-memory"],
  },
  {
    id: "objective-c02-advanced-value-type-memory-004",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt:
      "`swiftc -emit-sil` 출력에서 값 타입의 메모리 위치를 판별할 때 확인해야 할 SIL 인스트럭션이 올바르게 묶인 것은?",
    choices: [
      {
        id: "a",
        text: "`alloc_stack` → 스택, `alloc_box` → heap closure 캡처 박스, `alloc_ref` → heap class 인스턴스",
      },
      {
        id: "b",
        text: "`alloc_stack` → heap, `alloc_ref` → 스택, `alloc_box` → 레지스터",
      },
      {
        id: "c",
        text: "`alloc_heap` → 힙, `alloc_register` → 레지스터, `alloc_frame` → 스택",
      },
      {
        id: "d",
        text: "`retain` → 스택 할당, `release` → heap 해제, `dealloc_stack` → heap 반환",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "SIL(Swift Intermediate Language)에서 `alloc_stack`은 스택 할당, `alloc_box`는 closure 캡처 박스(heap), `alloc_ref`는 class 인스턴스(heap) 할당을 나타낸다. `-emit-sil` 플래그로 중간 표현을 출력해 박싱 여부를 확인하는 것이 시니어 레벨 디버깅 기법이다.",
    relatedTopicSlugs: ["02-memory-management/value-type-memory"],
  },
  {
    id: "objective-c02-intermediate-value-type-memory-005",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt:
      "큰 struct에서 closure 캡처 시 박싱 비용을 줄이는 방법으로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "struct 전체를 캡처하는 대신, 필요한 작은 필드 값만 캡처 리스트에 명시한다.",
      },
      {
        id: "b",
        text: "struct에 `final` 키워드를 붙여 컴파일러가 박싱을 건너뛰도록 한다.",
      },
      {
        id: "c",
        text: "struct를 class로 변경해 ARC가 박스를 대신 관리하게 한다.",
      },
      {
        id: "d",
        text: "closure를 `@escaping`으로 표시하지 않으면 박싱이 발생하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "큰 struct 전체를 closure에 캡처하면 그 크기만큼 heap box가 생성된다. `[id = obj.id]`처럼 캡처 리스트에 필요한 작은 값만 명시하면 box 크기가 줄고 불필요한 retain을 줄일 수 있다. struct를 class로 바꾸면 heap은 피할 수 없고 ARC 비용만 추가된다.",
    relatedTopicSlugs: ["02-memory-management/value-type-memory"],
  },

  // ── weak-vs-unowned (1) ───────────────────────────────────────────────────
  {
    id: "objective-c02-basic-weak-vs-unowned-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt:
      "`weak` 참조가 반드시 Optional이어야 하는 이유는?",
    choices: [
      {
        id: "a",
        text: "weak는 class에만 적용 가능하고 class 인스턴스는 기본값이 nil이기 때문이다.",
      },
      {
        id: "b",
        text: "대상 객체가 해제되면 런타임이 참조를 자동으로 nil로 바꾸어야 하는데, 이를 표현하려면 Optional 타입이 필요하기 때문이다.",
      },
      {
        id: "c",
        text: "Swift 컴파일러가 `weak` 키워드를 만나면 무조건 Optional<AnyObject>로 타입을 변환하기 때문이다.",
      },
      {
        id: "d",
        text: "weak는 side table을 사용하고 side table은 nil을 기본값으로 저장하기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "weak 참조는 대상 객체가 해제될 때 런타임이 자동으로 nil로 갱신(zeroing)한다. 이 nil 신호를 담으려면 Optional 타입이 반드시 필요하다. 비옵셔널이었다면 해제된 메모리를 가리키는 dangling pointer가 되어 안전하지 않다.",
    relatedTopicSlugs: ["02-memory-management/weak-vs-unowned"],
  },
];
