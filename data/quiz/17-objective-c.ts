import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── arc-and-mrc (5) ──────────────────────────────────────────
  {
    id: "objective-c17-basic-arc-and-mrc-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "ARC(Automatic Reference Counting)에 대한 설명으로 올바른 것은?",
    choices: [
      { id: "a", text: "런타임에 GC 스레드가 도달 가능한 객체를 주기적으로 스캔하여 해제한다." },
      { id: "b", text: "컴파일러가 빌드 타임에 retain/release 호출을 자동으로 삽입한다." },
      { id: "c", text: "ARC가 활성화되면 retain cycle이 자동으로 해결된다." },
      { id: "d", text: "ARC는 iOS 8 이상에서만 지원되며, 그 이전에는 MRC를 사용해야 한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ARC는 컴파일 타임에 Clang이 retain/release/autorelease 호출을 소스 코드에 자동 삽입하는 방식입니다. 별도의 GC 스레드나 Stop-The-World가 없으므로 Java/.NET의 GC와 다릅니다. retain cycle은 ARC에서도 자동 해결되지 않으며, __weak/__unsafe_unretained로 수동으로 끊어야 합니다. ARC는 Xcode 4.2 / iOS 5+에서 도입되었습니다.",
    relatedTopicSlugs: ["17-objective-c/arc-and-mrc"],
  },
  {
    id: "objective-c17-basic-arc-and-mrc-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "MRC(Manual Retain Count)의 'NARC 규칙'에서 개발자가 직접 release를 책임져야 하는 경우로 올바르게 묶인 것은?",
    choices: [
      { id: "a", text: "new, alloc, retain, copy/mutableCopy로 생성한 객체" },
      { id: "b", text: "convenience initializer로 반환된 autoreleased 객체" },
      { id: "c", text: "alloc으로 생성한 객체와 stringWithFormat:으로 반환된 객체 모두" },
      { id: "d", text: "stringWithFormat: 같은 편의 생성자가 반환한 객체만" },
    ],
    correctChoiceId: "a",
    explanation:
      "NARC 규칙: new, alloc, retain, copy/mutableCopy로 획득한 객체는 호출자가 소유권을 갖고 직접 release해야 합니다. 반면 stringWithFormat: 같은 convenience initializer는 autoreleased 객체를 반환하므로 호출자가 release할 필요가 없고 해서도 안 됩니다(over-release crash 발생).",
    relatedTopicSlugs: ["17-objective-c/arc-and-mrc"],
  },
  {
    id: "objective-c17-intermediate-arc-and-mrc-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "ARC 환경에서 dealloc 메서드를 구현할 때 올바른 작성 방법은?",
    choices: [
      { id: "a", text: "[super dealloc]을 맨 마지막에 반드시 호출해야 한다." },
      { id: "b", text: "ivar에 할당된 객체를 직접 release하는 코드를 작성해야 한다." },
      { id: "c", text: "[super dealloc] 호출은 컴파일 에러이며, C 리소스 정리나 observer 해제만 직접 작성한다." },
      { id: "d", text: "ARC에서는 dealloc을 선언하는 것 자체가 불가능하다." },
    ],
    correctChoiceId: "c",
    explanation:
      "ARC에서 [super dealloc] 호출은 컴파일 에러입니다. 컴파일러가 ivar release와 super dealloc을 자동 처리합니다. dealloc에서 개발자가 직접 작성할 것은 C malloc 메모리 free, Core Foundation 객체 CFRelease, KVO observer 해제처럼 ARC 범위 밖의 정리 코드뿐입니다.",
    relatedTopicSlugs: ["17-objective-c/arc-and-mrc"],
  },
  {
    id: "objective-c17-intermediate-arc-and-mrc-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "파일 단위로 MRC 코드를 ARC 프로젝트에 혼용할 때 사용하는 컴파일러 플래그는?",
    choices: [
      { id: "a", text: "-fobjc-gc" },
      { id: "b", text: "-fno-objc-arc" },
      { id: "c", text: "-disable-arc" },
      { id: "d", text: "-objc-legacy-dispatch" },
    ],
    correctChoiceId: "b",
    explanation:
      "-fno-objc-arc 플래그를 파일 단위로 지정하면 해당 파일에서만 MRC를 사용할 수 있습니다. 이는 오래된 서드파티 라이브러리를 ARC 프로젝트에 통합할 때 주로 활용됩니다. Xcode의 Build Phases > Compile Sources에서 각 파일에 개별 컴파일러 플래그를 설정할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/arc-and-mrc"],
  },
  {
    id: "objective-c17-advanced-arc-and-mrc-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "ARC 환경에서 Core Foundation 타입(CFStringRef)을 ObjC 객체(NSString *)로 변환할 때 CF쪽에서 ARC가 관리하는 쪽으로 소유권을 이전하는 bridge 캐스팅은?",
    choices: [
      { id: "a", text: "__bridge" },
      { id: "b", text: "__bridge_retained" },
      { id: "c", text: "__bridge_transfer" },
      { id: "d", text: "__unsafe_bridge" },
    ],
    correctChoiceId: "c",
    explanation:
      "__bridge_transfer는 CF 타입에서 ARC 관리 타입으로 소유권을 이전합니다. ARC가 이후 release를 책임지므로 CFRelease를 호출하지 않아도 됩니다. 반대로 ARC에서 CF로 소유권을 넘길 때는 __bridge_retained를 사용하며, 소유권 이전 없이 단순 타입 변환만 할 때는 __bridge를 사용합니다.",
    relatedTopicSlugs: ["17-objective-c/arc-and-mrc"],
  },

  // ── autoreleasepool (5) ──────────────────────────────────────
  {
    id: "objective-c17-basic-autoreleasepool-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "autoreleasepool에 대한 설명으로 옳지 않은 것은?",
    choices: [
      { id: "a", text: "autorelease 등록된 객체는 풀이 drain될 때 일괄 release된다." },
      { id: "b", text: "풀은 스레드 로컬 스택 구조로, 중첩 사용이 가능하다." },
      { id: "c", text: "ARC 환경에서는 autorelease가 완전히 제거되어 @autoreleasepool이 무의미하다." },
      { id: "d", text: "iOS 메인 스레드는 RunLoop이 매 사이클마다 풀을 자동으로 push/pop한다." },
    ],
    correctChoiceId: "c",
    explanation:
      "ARC 환경에서도 autorelease는 여전히 존재합니다. convenience initializer(예: [NSString stringWithFormat:])는 autoreleased 객체를 반환하며, 대량 임시 객체 생성 시 @autoreleasepool을 사용하지 않으면 RunLoop 사이클이 끝날 때까지 메모리가 해제되지 않아 피크가 급증할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/autoreleasepool"],
  },
  {
    id: "objective-c17-basic-autoreleasepool-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "명시적 @autoreleasepool 사용이 특히 필요한 상황으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "메인 스레드에서 단일 UIButton 탭 이벤트를 처리할 때" },
      { id: "b", text: "NSThread로 직접 만든 백그라운드 스레드에서 ObjC 객체를 생성할 때" },
      { id: "c", text: "GCD dispatch_async 블록 하나에서 단 한 개의 NSString을 생성할 때" },
      { id: "d", text: "Swift로만 작성된 코드에서 순수 Swift class를 인스턴스화할 때" },
    ],
    correctChoiceId: "b",
    explanation:
      "NSThread로 직접 생성한 백그라운드 스레드에는 자동 autoreleasepool이 없습니다. 해당 스레드에서 autorelease 객체가 release되지 않고 누적되므로, 스레드 진입점에 @autoreleasepool을 반드시 설치해야 합니다. GCD 워커 스레드는 작업 단위마다 pool을 자동으로 push/pop하므로 상황이 다릅니다.",
    relatedTopicSlugs: ["17-objective-c/autoreleasepool"],
  },
  {
    id: "objective-c17-intermediate-autoreleasepool-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "반복문 안에서 @autoreleasepool을 사용했을 때의 효과로 가장 올바른 것은?",
    choices: [
      { id: "a", text: "루프 전체가 끝난 후 모든 임시 객체가 한꺼번에 해제된다." },
      { id: "b", text: "각 iteration이 끝날 때마다 그 안에서 만든 autoreleased 객체가 release되어 메모리 피크를 줄인다." },
      { id: "c", text: "성능 향상을 위해 반드시 루프 외부에 풀을 하나만 두는 것이 권장 방식이다." },
      { id: "d", text: "@autoreleasepool은 ARC에서 컴파일 에러를 일으키므로 NSAutoreleasePool을 대신 써야 한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "루프 안에 @autoreleasepool을 두면 각 iteration 종료 시 풀이 drain되어 그 사이에 만들어진 autoreleased 임시 객체들이 release됩니다. 이를 통해 루프 전체 실행 동안 누적되는 메모리 피크를 iteration 단위로 억제할 수 있습니다. NSAutoreleasePool은 ARC에서 컴파일조차 되지 않으며 사용이 금지됩니다.",
    relatedTopicSlugs: ["17-objective-c/autoreleasepool"],
  },
  {
    id: "objective-c17-intermediate-autoreleasepool-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "autoreleasepool 안에서 만들어진 객체가 풀 종료 후에도 해제되지 않을 수 있는 조건은?",
    choices: [
      { id: "a", text: "그 객체에 대한 strong 참조가 풀 외부에서 유지되고 있을 때" },
      { id: "b", text: "풀이 중첩된 경우 내부 풀이 먼저 drain되기 때문에 항상 유지된다." },
      { id: "c", text: "__weak 참조만 있는 경우에는 풀 종료 후에도 객체가 살아있다." },
      { id: "d", text: "ARC 환경에서는 autorelease 객체가 항상 풀 종료 즉시 dealloc된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "autorelease는 '이 풀이 비워질 때 release를 한 번 수행'하는 것일 뿐입니다. 풀 외부에서 해당 객체를 strong 참조하고 있다면 release 후에도 retain count가 0이 아니므로 객체는 살아있습니다. __weak 참조는 강한 소유가 아니므로, strong 참조가 없어지면 객체는 해제됩니다.",
    relatedTopicSlugs: ["17-objective-c/autoreleasepool"],
  },
  {
    id: "objective-c17-advanced-autoreleasepool-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "GCD DispatchQueue와 NSThread의 autoreleasepool 처리 방식의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "GCD 워커 스레드는 pool이 없으므로 항상 명시적 @autoreleasepool이 필요하다." },
      { id: "b", text: "NSThread는 RunLoop이 자동으로 pool을 관리해주므로 따로 신경 쓸 필요 없다." },
      { id: "c", text: "GCD 워커는 작업 단위마다 자동으로 pool을 push/pop하지만, NSThread 진입점에는 개발자가 직접 pool을 설치해야 한다." },
      { id: "d", text: "GCD와 NSThread 모두 Swift async/await로 이전하면 autoreleasepool 문제가 완전히 사라진다." },
    ],
    correctChoiceId: "c",
    explanation:
      "GCD 워커 스레드는 각 작업(클로저) 단위로 autoreleasepool을 자동으로 push/pop합니다. 반면 NSThread는 RunLoop이 없거나 직접 설치하지 않으면 자동 pool이 없으므로, 스레드 진입점(threadMain)에 @autoreleasepool을 직접 설치해야 합니다. Swift async/await로 전환해도 Foundation/UIKit 브릿지 API가 autorelease 객체를 생성할 수 있으므로 완전히 사라지지 않습니다.",
    relatedTopicSlugs: ["17-objective-c/autoreleasepool"],
  },

  // ── blocks (5) ──────────────────────────────────────────────
  {
    id: "objective-c17-basic-blocks-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Objective-C Block의 기본 캡처 방식으로 올바른 것은?",
    choices: [
      { id: "a", text: "외부 변수를 참조(reference)로 캡처하여 블록 실행 시점의 값을 사용한다." },
      { id: "b", text: "외부 변수를 캡처 시점의 const 복사본으로 보관하여 이후 변경에 영향받지 않는다." },
      { id: "c", text: "외부 변수는 캡처하지 않으며, 블록 내부에서 접근 시 컴파일 에러가 발생한다." },
      { id: "d", text: "__block 키워드 없이도 외부 변수 값을 블록 내에서 변경할 수 있다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Block은 기본적으로 외부 변수를 캡처 시점의 const copy로 보관합니다. 따라서 캡처 후에 원본 변수를 변경해도 블록 내부 값은 바뀌지 않습니다. 블록 내에서 변수를 변경하거나 변경 내용을 공유하려면 __block 키워드를 사용해야 합니다. 객체 포인터는 strong으로 캡처됩니다(포인터 자체는 const).",
    relatedTopicSlugs: ["17-objective-c/blocks"],
  },
  {
    id: "objective-c17-basic-blocks-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Block 프로퍼티 선언 시 strong 대신 copy를 사용하는 이유는?",
    choices: [
      { id: "a", text: "copy를 사용해야만 retain cycle이 자동으로 방지된다." },
      { id: "b", text: "stack에 생성된 block을 heap으로 복사하여 owner의 lifetime 동안 유효하게 유지하기 위함이다." },
      { id: "c", text: "ARC에서 strong으로 선언하면 블록이 실행 후 자동으로 nil이 되어 메모리 누수가 발생한다." },
      { id: "d", text: "copy를 사용하면 블록이 캡처한 변수들이 불변(immutable)이 된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Block은 처음엔 stack에 생성됩니다. 프로퍼티에 저장할 때 copy를 사용하면 heap으로 복사되어 owner의 lifetime 동안 안전하게 유지됩니다. ARC 환경에서는 strong 대입도 자동으로 copy를 수행하지만, copy를 명시하는 것이 의도를 드러내는 관례입니다. copy는 retain cycle 방지와는 무관합니다.",
    relatedTopicSlugs: ["17-objective-c/blocks"],
  },
  {
    id: "objective-c17-intermediate-blocks-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "다음 중 Block에서 retain cycle이 발생하는 정확한 조건으로 옳은 것은?",
    choices: [
      { id: "a", text: "블록이 self를 strong 캡처하기만 하면 항상 retain cycle이 발생한다." },
      { id: "b", text: "블록이 self를 strong 캡처하고, 그 블록이 self가 retain하는 경로에 저장될 때 cycle이 발생한다." },
      { id: "c", text: "[UIView animateWithDuration:animations:^{ self.alpha = 0; }]는 retain cycle을 만든다." },
      { id: "d", text: "__block self를 사용하면 retain cycle이 자동으로 해결된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "retain cycle은 (1) 블록이 self를 strong 캡처하고, (2) 그 블록이 self에 의해 retain되는 경로에 저장될 때 발생합니다. 일회성 애니메이션 블록처럼 self에 저장되지 않는 경우는 cycle이 아닙니다. __block self는 변경 가능성을 부여할 뿐 소유권을 weak으로 바꾸지는 않습니다. __weak self를 사용해야 cycle을 끊을 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/blocks"],
  },
  {
    id: "objective-c17-intermediate-blocks-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "Block의 세 가지 저장 종류 중 _NSConcreteGlobalBlock이 생성되는 조건은?",
    choices: [
      { id: "a", text: "외부 변수를 캡처하지 않는 블록" },
      { id: "b", text: "__block 변수를 캡처한 블록" },
      { id: "c", text: "strong 프로퍼티에 대입된 블록" },
      { id: "d", text: "dispatch_async에 인자로 전달된 블록" },
    ],
    correctChoiceId: "a",
    explanation:
      "_NSConcreteGlobalBlock은 외부 변수를 전혀 캡처하지 않는 블록으로, text section(전역 영역)에 배치되어 영구적으로 존재합니다. 외부 변수를 캡처하는 블록은 처음엔 stack(_NSConcreteStackBlock)에 생성되고, copy/strong 대입 또는 비동기 큐 전달 시 heap(_NSConcreteMallocBlock)으로 복사됩니다.",
    relatedTopicSlugs: ["17-objective-c/blocks"],
  },
  {
    id: "objective-c17-advanced-blocks-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "retain cycle 방지를 위해 __weak self를 캡처한 뒤 블록 내부에서 __strong strongSelf = weakSelf로 다시 잡는 패턴이 필요한 이유는?",
    choices: [
      { id: "a", text: "weakSelf를 직접 사용하면 컴파일 에러가 발생하기 때문이다." },
      { id: "b", text: "블록 실행 도중 self가 dealloc되면 weakSelf가 nil이 되어 이후 접근이 누락되므로, 진입 시점에 strong으로 잡아 블록 실행 동안 살아있음을 보장하기 위함이다." },
      { id: "c", text: "__strong strongSelf로 잡아야만 retain cycle이 완전히 사라진다." },
      { id: "d", text: "weakSelf는 블록 내에서 반드시 nil 체크 없이 사용할 수 있어야 하기 때문이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "weakSelf를 블록 내에서 여러 번 참조할 때, 첫 번째 참조와 두 번째 참조 사이에 self가 dealloc될 수 있습니다. 블록 진입 시점에 __strong strongSelf = weakSelf로 strong 참조를 획득하면 블록 실행이 완료될 때까지 self가 해제되지 않으며, strongSelf가 nil인 경우에는 return으로 조기 종료할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/blocks"],
  },

  // ── categories-and-extensions (5) ──────────────────────────
  {
    id: "objective-c17-basic-categories-and-extensions-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Objective-C Category에 대한 설명으로 올바른 것은?",
    choices: [
      { id: "a", text: "Category를 통해 기존 클래스에 stored property(ivar)를 추가할 수 있다." },
      { id: "b", text: "Category는 소스 코드 없이도 기존 클래스에 메서드를 추가할 수 있으며, 런타임 로딩 시 메서드 테이블에 합쳐진다." },
      { id: "c", text: "Category에서 정의한 메서드는 컴파일 타임에만 존재하며 런타임 메서드 테이블에 반영되지 않는다." },
      { id: "d", text: "Category는 반드시 원본 클래스와 동일한 파일에 작성해야 한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Category는 클래스의 소스 코드 없이 메서드를 추가할 수 있는 메커니즘으로, 런타임 로딩 시점에 해당 클래스의 메서드 테이블에 합쳐집니다. stored property(ivar) 추가는 불가능하며(associated object로 우회), 별도 파일에 자유롭게 작성할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/categories-and-extensions"],
  },
  {
    id: "objective-c17-basic-categories-and-extensions-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Class Extension(익명 카테고리)과 Category의 차이로 올바른 것은?",
    choices: [
      { id: "a", text: "Class Extension은 이름이 있고 Category는 이름이 없다." },
      { id: "b", text: "Class Extension은 ivar를 추가할 수 있고 런타임이 아닌 컴파일 타임에 처리되지만, Category는 ivar 추가가 불가하고 런타임에 합쳐진다." },
      { id: "c", text: "Category는 .m 파일 안에 두는 반면 Class Extension은 반드시 별도 .h 파일에 선언한다." },
      { id: "d", text: "Class Extension에서 선언한 property는 외부에 자동으로 공개된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Class Extension(익명 카테고리, 이름 없음)은 main class와 함께 컴파일되어 ivar를 추가할 수 있고, private 인터페이스로 활용됩니다. 반면 Category는 이름이 있고 런타임에 메서드 테이블에 합쳐지며 ivar 추가가 불가합니다. Class Extension은 보통 .m 파일 안에 위치하여 외부에 노출되지 않습니다.",
    relatedTopicSlugs: ["17-objective-c/categories-and-extensions"],
  },
  {
    id: "objective-c17-intermediate-categories-and-extensions-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "Category에서 stored property가 불가능한 근본적인 이유는?",
    choices: [
      { id: "a", text: "Category는 메서드만 포함할 수 있다는 문법적 제한 때문이다." },
      { id: "b", text: "ObjC 객체의 ivar layout이 컴파일 타임에 고정되므로, 런타임에 합쳐지는 Category가 ivar offset을 바꿀 수 없기 때문이다." },
      { id: "c", text: "ivar를 추가하면 런타임에 retain cycle이 발생할 수 있어 금지된다." },
      { id: "d", text: "Category의 ivar는 ARC가 관리할 수 없어서 컴파일러가 금지한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ObjC 객체의 메모리 layout(ivar offset)은 클래스가 컴파일될 때 결정됩니다. Category는 런타임 로딩 시 메서드 테이블에만 합쳐지므로 이미 고정된 layout을 변경할 수 없어 ivar 추가가 불가합니다. associated object를 사용하면 런타임의 별도 key-value 테이블을 이용해 유사한 기능을 구현할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/categories-and-extensions"],
  },
  {
    id: "objective-c17-intermediate-categories-and-extensions-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "+load와 +initialize의 차이로 가장 올바른 것은?",
    choices: [
      { id: "a", text: "+load는 클래스가 처음 메시지를 받을 때 호출되고, +initialize는 앱 시작 직후 모든 클래스에 호출된다." },
      { id: "b", text: "+load는 런타임에 클래스가 메모리에 적재될 때 호출되고, +initialize는 클래스가 처음 사용될 때 lazy하게 호출된다." },
      { id: "c", text: "Category의 +load는 호출되지 않으며, +initialize만 Category에서 정의 가능하다." },
      { id: "d", text: "+load와 +initialize 모두 매번 인스턴스 생성 시마다 호출된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "+load는 클래스가 동적 링커에 의해 런타임에 메모리로 적재될 때(앱 시작 직후) 자동 호출됩니다. 모든 클래스와 카테고리의 +load가 호출됩니다. +initialize는 해당 클래스가 처음 메시지를 받는 시점에 lazy하게 한 번만 호출됩니다. Category에서 +initialize를 정의하면 main class의 +initialize를 가리킬 수 있어 주의가 필요합니다.",
    relatedTopicSlugs: ["17-objective-c/categories-and-extensions"],
  },
  {
    id: "objective-c17-advanced-categories-and-extensions-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "Category의 associated object에서 objc_setAssociatedObject 호출 시 OBJC_ASSOCIATION_COPY_NONATOMIC policy를 사용하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "associated object는 ARC 관리를 받지 못하므로 copy를 명시해야 dealloc 시 자동 해제된다." },
      { id: "b", text: "NSString처럼 mutable 하위 클래스가 있는 타입의 경우 setter 시점에 immutable copy를 보관하기 위함이며, atomic 잠금이 불필요한 경우 NONATOMIC을 선택한다." },
      { id: "c", text: "NONATOMIC을 사용해야만 대상 객체 dealloc 시 associated object가 자동으로 release된다." },
      { id: "d", text: "associated object는 항상 value type이므로 copy policy만 사용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "OBJC_ASSOCIATION_COPY_NONATOMIC은 NSString 같이 mutable 하위 클래스가 존재하는 타입에서 setter 시점의 immutable copy를 보관해 외부에서 변경되어도 안전하게 유지하기 위해 사용합니다. NONATOMIC은 단일 스레드 접근 시 lock 오버헤드 없이 성능을 높이기 위한 선택입니다. associated object는 policy와 무관하게 대상 객체 dealloc 시 런타임이 자동으로 정리합니다.",
    relatedTopicSlugs: ["17-objective-c/categories-and-extensions"],
  },

  // ── kvo-kvc (5) ──────────────────────────────────────────────
  {
    id: "objective-c17-basic-kvo-kvc-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "KVO(Key-Value Observing)에서 observer를 해제하지 않으면 어떤 문제가 발생하는가?",
    choices: [
      { id: "a", text: "메모리 누수는 발생하지 않지만 중복 알림이 전달된다." },
      { id: "b", text: "대상 객체 dealloc 시 observer가 nil 상태가 되어 dangling reference로 crash가 발생할 수 있다." },
      { id: "c", text: "observer 자체에 strong 참조가 생겨 retain cycle이 발생한다." },
      { id: "d", text: "KVO는 ARC에서 관리되므로 별도 해제 없이도 안전하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "KVO observer는 strong-aware가 아닙니다. 대상 객체가 dealloc될 때 등록된 observer가 이미 해제된 상태이면 dangling reference로 crash가 발생합니다. 반드시 deinit/dealloc에서 removeObserver:forKeyPath:context:를 호출해야 합니다. Swift의 NSKeyValueObservation 토큰 방식은 토큰 해제 시 자동으로 제거됩니다.",
    relatedTopicSlugs: ["17-objective-c/kvo-kvc"],
  },
  {
    id: "objective-c17-basic-kvo-kvc-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "KVO의 내부 구현 메커니즘으로 올바른 것은?",
    choices: [
      { id: "a", text: "런타임이 관찰 대상 프로퍼티의 setter를 직접 swizzle하여 알림 코드를 삽입한다." },
      { id: "b", text: "런타임이 동적으로 NSKVONotifying_X 서브클래스를 생성하고 대상 객체의 isa를 해당 클래스로 바꾼다(isa-swizzling)." },
      { id: "c", text: "컴파일 타임에 setter에 willChange/didChange 호출을 자동 삽입한다." },
      { id: "d", text: "NotificationCenter를 내부적으로 사용하여 값 변화를 전파한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "KVO는 isa-swizzling을 통해 구현됩니다. 객체에 처음 observer가 추가되면 런타임이 NSKVONotifying_X 서브클래스를 동적으로 생성하고, 대상 객체의 isa 포인터를 이 클래스로 교체합니다. 이 서브클래스의 setter는 willChangeValueForKey:/didChangeValueForKey:를 자동 호출합니다. [obj class]는 원래 클래스를 반환하도록 override되어 있어 외부에서는 swizzling을 알 수 없습니다.",
    relatedTopicSlugs: ["17-objective-c/kvo-kvc"],
  },
  {
    id: "objective-c17-intermediate-kvo-kvc-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "KVO의 context 매개변수를 사용하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "context를 nil로 하면 KVO 관찰이 비활성화된다." },
      { id: "b", text: "superclass도 동일한 keyPath를 관찰할 수 있어 콜백이 충돌할 수 있으므로, 고유한 context 포인터로 자기 콜백과 상위 클래스 콜백을 구분한다." },
      { id: "c", text: "context에 딕셔너리를 전달하여 추가 데이터를 observer에게 넘길 때 사용한다." },
      { id: "d", text: "동일 객체에 대해 여러 스레드에서 동시에 관찰할 때 스레드 ID를 전달하기 위함이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "superclass와 subclass 모두 같은 keyPath를 관찰할 경우 observeValueForKeyPath:ofObject:change:context: 콜백이 양쪽에 전달됩니다. context에 고유한 static 포인터를 사용하면 콜백 내에서 자신의 것인지 확인하고, 아닌 경우 [super observeValueForKeyPath:...]로 전달하여 계층 충돌을 방지할 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/kvo-kvc"],
  },
  {
    id: "objective-c17-intermediate-kvo-kvc-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "KVC의 valueForKey: lookup 순서로 올바른 것은?",
    choices: [
      { id: "a", text: "ivar를 먼저 직접 읽고, 없으면 getter 메서드를 찾는다." },
      { id: "b", text: "-name 메서드 → -getName/-isName → (accessInstanceVariablesDirectly가 YES이면) ivar _name/_isName/name/isName → 없으면 valueForUndefinedKey: 호출" },
      { id: "c", text: "-name 메서드만 찾고, 없으면 즉시 NSUndefinedKeyException을 던진다." },
      { id: "d", text: "ivar _name → -name 메서드 → 없으면 NSUndefinedKeyException 순서다." },
    ],
    correctChoiceId: "b",
    explanation:
      "KVC의 valueForKey: lookup은 (1) -name, (2) -getName/-isName, (3) +accessInstanceVariablesDirectly가 YES일 때 ivar _name → _isName → name → isName 순서로 찾습니다. 모두 없으면 valueForUndefinedKey:가 호출되고 기본 구현은 NSUndefinedKeyException을 발생시킵니다.",
    relatedTopicSlugs: ["17-objective-c/kvo-kvc"],
  },
  {
    id: "objective-c17-advanced-kvo-kvc-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "Swift에서 KVO를 사용하기 위한 필수 조건 조합으로 올바른 것은?",
    choices: [
      { id: "a", text: "Swift class이면 충분하며 추가 annotation이 필요 없다." },
      { id: "b", text: "NSObject 상속 + @objc dynamic var 선언" },
      { id: "c", text: "struct + @Published 조합으로 KVO를 대체할 수 있다." },
      { id: "d", text: "@Observable 매크로를 사용하면 NSObject 상속 없이도 KVO가 동작한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift에서 KVO를 사용하려면 NSObject를 상속해야 ObjC 런타임의 isa-swizzling 메커니즘을 활용할 수 있고, @objc dynamic var로 선언해야 message dispatch가 강제되어 setter 호출 시 KVO 알림이 트리거됩니다. struct와 @Published는 Combine 기반이고, @Observable은 Swift 5.9+ 매크로로 KVO와는 별개의 메커니즘입니다.",
    relatedTopicSlugs: ["17-objective-c/kvo-kvc"],
  },

  // ── method-dispatch (5) ──────────────────────────────────────
  {
    id: "objective-c17-basic-method-dispatch-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Objective-C에서 [obj foo:arg] 호출이 런타임에 변환되는 형태는?",
    choices: [
      { id: "a", text: "obj.foo(arg) 형태의 직접 함수 호출로 변환된다." },
      { id: "b", text: "objc_msgSend(obj, @selector(foo:), arg)로 변환되어 동적 lookup을 수행한다." },
      { id: "c", text: "vtable을 통해 정적으로 결정된 함수 포인터를 호출한다." },
      { id: "d", text: "컴파일 타임에 IMP가 결정되어 직접 함수 호출로 최적화된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "컴파일러는 [obj foo:arg]를 objc_msgSend(obj, @selector(foo:), arg)로 변환합니다. 런타임은 receiver의 isa를 통해 클래스 객체를 찾고, method cache → method list → superclass 순으로 IMP(함수 포인터)를 동적으로 탐색합니다. 이것이 ObjC의 dynamic message dispatch입니다.",
    relatedTopicSlugs: ["17-objective-c/method-dispatch"],
  },
  {
    id: "objective-c17-basic-method-dispatch-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "ObjC에서 nil에 메시지를 전송하면 어떤 일이 일어나는가?",
    choices: [
      { id: "a", text: "NSException이 발생하여 앱이 crash한다." },
      { id: "b", text: "컴파일 에러가 발생한다." },
      { id: "c", text: "objc_msgSend가 receiver가 nil임을 확인하고 0/nil/zeroed struct를 반환하며 NOP 처리된다." },
      { id: "d", text: "런타임이 자동으로 superclass에 메시지를 전달한다." },
    ],
    correctChoiceId: "c",
    explanation:
      "objc_msgSend는 receiver가 nil인지 가장 먼저 확인합니다. nil이면 즉시 0(정수), nil(포인터), 또는 zeroed struct를 반환하며 아무것도 실행하지 않습니다(NOP). 이는 Swift의 옵셔널 체이닝과 메커니즘이 다르며, ObjC의 런타임이 처리하는 특성입니다.",
    relatedTopicSlugs: ["17-objective-c/method-dispatch"],
  },
  {
    id: "objective-c17-intermediate-method-dispatch-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "ObjC 메서드 lookup에서 selector를 찾지 못했을 때 crash 이전에 시도하는 단계를 순서대로 나열한 것은?",
    choices: [
      { id: "a", text: "-forwardInvocation: → -forwardingTargetForSelector: → +resolveInstanceMethod:" },
      { id: "b", text: "+resolveInstanceMethod: → -forwardingTargetForSelector: → -forwardInvocation:" },
      { id: "c", text: "-forwardingTargetForSelector: → +resolveInstanceMethod: → -forwardInvocation:" },
      { id: "d", text: "-doesNotRecognizeSelector: → +resolveInstanceMethod: → -forwardInvocation:" },
    ],
    correctChoiceId: "b",
    explanation:
      "selector를 찾지 못하면 (1) +resolveInstanceMethod: (런타임에 메서드 추가 기회), (2) -forwardingTargetForSelector: (다른 객체에 fast forward), (3) -forwardInvocation: (NSInvocation으로 전체 포워딩) 순서로 시도됩니다. 세 단계 모두 실패하면 -doesNotRecognizeSelector:가 호출되어 unrecognized selector crash가 발생합니다.",
    relatedTopicSlugs: ["17-objective-c/method-dispatch"],
  },
  {
    id: "objective-c17-intermediate-method-dispatch-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "SEL과 IMP의 관계에 대한 설명으로 올바른 것은?",
    choices: [
      { id: "a", text: "SEL은 함수 포인터이고 IMP는 selector 이름을 저장하는 문자열이다." },
      { id: "b", text: "SEL은 메서드 이름만을 나타내는 식별자이고, IMP는 실제 실행할 함수 포인터(id (*)(id, SEL, ...))이다." },
      { id: "c", text: "SEL과 IMP는 동일한 개념으로 런타임에서 구분 없이 사용된다." },
      { id: "d", text: "IMP를 직접 호출하면 런타임 캐시에 반드시 등록된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "SEL(@selector(foo:))은 메서드 이름을 나타내는 식별자로 인터닝된 문자열과 유사합니다. IMP는 실제 구현 함수 포인터(id (*)(id, SEL, ...)) 입니다. methodForSelector:로 IMP를 직접 획득하여 호출하면 objc_msgSend의 캐시/lookup 단계를 우회하여 호출 비용을 줄일 수 있습니다.",
    relatedTopicSlugs: ["17-objective-c/method-dispatch"],
  },
  {
    id: "objective-c17-advanced-method-dispatch-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "Swift에서 @objc dynamic을 메서드에 붙이면 디스패치 방식이 어떻게 바뀌는가?",
    choices: [
      { id: "a", text: "vtable dispatch에서 static dispatch로 변경된다." },
      { id: "b", text: "Swift 컴파일러가 해당 메서드를 인라인(inline) 처리한다." },
      { id: "c", text: "ObjC 런타임에 노출되고 message dispatch(objc_msgSend)가 강제되어 Swift 내부 호출에서도 동적 dispatch가 사용된다." },
      { id: "d", text: "@objc만으로 충분하며 dynamic은 Swift 6에서 제거된 기능이다." },
    ],
    correctChoiceId: "c",
    explanation:
      "Swift class 메서드는 기본적으로 vtable dispatch를 사용합니다. @objc는 ObjC에 노출만 하고, Swift 내부에서는 여전히 vtable을 쓸 수 있습니다. dynamic을 추가하면 ObjC 런타임의 message dispatch(objc_msgSend)가 강제되어 KVO, method swizzling 등 런타임 동적 조작이 가능해집니다.",
    relatedTopicSlugs: ["17-objective-c/method-dispatch"],
  },

  // ── ownership-qualifiers (5) ─────────────────────────────────
  {
    id: "objective-c17-basic-ownership-qualifiers-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "ARC의 4가지 ownership qualifier 중 대상이 dealloc되면 자동으로 nil이 되는 것은?",
    choices: [
      { id: "a", text: "__strong" },
      { id: "b", text: "__unsafe_unretained" },
      { id: "c", text: "__weak" },
      { id: "d", text: "__autoreleasing" },
    ],
    correctChoiceId: "c",
    explanation:
      "__weak는 zeroing weak reference로, 참조하는 객체가 dealloc되면 ARC 런타임이 약참조 테이블을 순회하여 자동으로 nil을 대입합니다. __unsafe_unretained는 zeroing이 없어 dangling pointer가 되며, __strong은 객체를 retain하므로 strong 참조가 있는 한 dealloc되지 않습니다.",
    relatedTopicSlugs: ["17-objective-c/ownership-qualifiers"],
  },
  {
    id: "objective-c17-basic-ownership-qualifiers-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "__unsafe_unretained를 사용하는 상황으로 가장 적합한 것은?",
    choices: [
      { id: "a", text: "delegate 프로퍼티를 선언할 때 retain cycle 방지를 위해 기본으로 사용한다." },
      { id: "b", text: "iOS 5 이상에서는 __weak를 대신하는 권장 방식이다." },
      { id: "c", text: "C 구조체 필드에 ObjC 객체 포인터를 두어야 하는 경우처럼 __weak가 불가능한 상황에서 사용한다." },
      { id: "d", text: "ARC 환경에서 retain count를 수동으로 조작해야 할 때 사용한다." },
    ],
    correctChoiceId: "c",
    explanation:
      "ARC는 C 구조체의 필드를 추적할 수 없어 C 구조체 안에 __strong이나 __weak ObjC object pointer를 둘 수 없습니다. 이런 경우 __unsafe_unretained를 사용하거나 ObjC class로 감싸야 합니다. 일반적인 delegate나 observer에는 안전한 __weak가 권장됩니다.",
    relatedTopicSlugs: ["17-objective-c/ownership-qualifiers"],
  },
  {
    id: "objective-c17-intermediate-ownership-qualifiers-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "@property의 assign을 객체 타입에 사용했을 때 매핑되는 ivar 한정자는?",
    choices: [
      { id: "a", text: "__strong" },
      { id: "b", text: "__weak" },
      { id: "c", text: "__autoreleasing" },
      { id: "d", text: "__unsafe_unretained" },
    ],
    correctChoiceId: "d",
    explanation:
      "@property의 assign은 ivar에 __unsafe_unretained를 매핑합니다. 객체가 dealloc되어도 zeroing이 되지 않아 dangling pointer 위험이 있습니다. 객체 타입의 약참조에는 반드시 weak 한정자를 사용해야 합니다. assign은 NSInteger, CGFloat 같은 primitive 타입에 적합합니다.",
    relatedTopicSlugs: ["17-objective-c/ownership-qualifiers"],
  },
  {
    id: "objective-c17-intermediate-ownership-qualifiers-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "__autoreleasing 한정자가 주로 등장하는 패턴은?",
    choices: [
      { id: "a", text: "delegate 패턴에서 약참조를 나타내기 위해 사용한다." },
      { id: "b", text: "NSError **처럼 out-parameter로 autoreleased 객체를 반환하는 경우에 컴파일러가 자동 추론하거나 명시한다." },
      { id: "c", text: "대량 임시 객체 생성 시 메모리 피크를 줄이기 위해 루프 내에서 직접 선언한다." },
      { id: "d", text: "retain cycle을 방지하기 위해 ivar에 적용한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "__autoreleasing은 주로 NSError **처럼 out-parameter(이중 포인터)의 내부 타입에 사용됩니다. ARC 컴파일러가 ** 포인터의 inner 타입을 자동으로 __autoreleasing으로 추론하므로 직접 명시하는 경우는 드뭅니다. 이 한정자는 autorelease pool에 등록된 객체를 가리키며, 해당 풀이 drain될 때 release됩니다.",
    relatedTopicSlugs: ["17-objective-c/ownership-qualifiers"],
  },
  {
    id: "objective-c17-advanced-ownership-qualifiers-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "__weak 한정자의 zeroing(자동 nil) 메커니즘에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "dealloc이 완료된 직후 백그라운드 GC 스레드가 weak 참조를 nil로 만든다." },
      { id: "b", text: "ARC 런타임이 객체별로 약참조 테이블을 관리하고, 객체의 dealloc 시작 시점에 해당 테이블을 순회하며 모든 __weak 변수를 nil로 대입한다." },
      { id: "c", text: "__weak 변수를 읽을 때마다 가리키는 객체가 살아있는지 retain count를 확인하여 nil을 반환한다." },
      { id: "d", text: "zeroing은 iOS 8 이상에서만 지원되며, iOS 5~7에서는 crash가 발생한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ARC 런타임은 객체별로 약참조 테이블(side table)을 관리합니다. 객체의 dealloc이 시작될 때 런타임이 해당 테이블을 순회하여 그 객체를 가리키는 모든 __weak 변수에 nil을 원자적으로 대입합니다. 이 덕분에 __weak 변수를 읽을 때 항상 nil이거나 유효한 객체임이 보장됩니다. zeroing weak reference는 iOS 5에서 도입되었습니다.",
    relatedTopicSlugs: ["17-objective-c/ownership-qualifiers"],
  },

  // ── properties (5) ──────────────────────────────────────────
  {
    id: "objective-c17-basic-properties-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "NSString 프로퍼티 선언 시 strong 대신 copy를 사용해야 하는 이유는?",
    choices: [
      { id: "a", text: "copy를 사용해야만 ARC가 해당 프로퍼티를 관리할 수 있다." },
      { id: "b", text: "NSMutableString처럼 mutable 하위 클래스가 전달될 수 있어, setter 시점에 immutable copy를 보관하여 외부에서 변경되어도 영향받지 않기 위해서다." },
      { id: "c", text: "copy는 retain count를 증가시키지 않아 retain cycle을 방지한다." },
      { id: "d", text: "strong으로 선언하면 NSString이 자동으로 NSMutableString으로 변환되는 버그가 있다." },
    ],
    correctChoiceId: "b",
    explanation:
      "NSString에 strong을 쓰면 NSMutableString이 전달될 때 동일 객체를 가리키므로 외부에서 변경하면 프로퍼티 값도 바뀝니다. copy를 쓰면 setter가 -copy를 호출해 immutable 복사본을 보관하므로 외부 변경에 영향받지 않습니다. NSString, NSArray, NSDictionary, NSSet처럼 mutable 하위 클래스가 있는 타입은 거의 항상 copy를 권장합니다.",
    relatedTopicSlugs: ["17-objective-c/properties"],
  },
  {
    id: "objective-c17-basic-properties-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "atomic 프로퍼티에 대한 설명으로 옳지 않은 것은?",
    choices: [
      { id: "a", text: "getter/setter 단일 호출이 thread-safe하게 수행된다." },
      { id: "b", text: "read-modify-write 시퀀스 전체를 보호하므로 객체 그래프 단위의 동기화가 보장된다." },
      { id: "c", text: "lock 비용이 있어 성능에 영향을 줄 수 있다." },
      { id: "d", text: "UIKit 프로퍼티는 메인 스레드 전용이므로 atomic의 의미가 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "atomic은 getter/setter 단일 호출의 원자성만 보장합니다. self.array = [self.array arrayByAddingObject:x]처럼 read-modify-write 시퀀스는 read와 write 사이에 다른 스레드가 끼어들 수 있어 race condition이 발생합니다. 객체 그래프 단위의 동기화는 별도 lock이나 serial queue가 필요합니다.",
    relatedTopicSlugs: ["17-objective-c/properties"],
  },
  {
    id: "objective-c17-intermediate-properties-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "헤더에서 readonly로 선언한 프로퍼티를 구현 파일(.m) 내부에서만 readwrite로 사용하는 관용적인 방법은?",
    choices: [
      { id: "a", text: "@synthesize를 .m 파일에 직접 사용하여 getter와 setter를 별도로 구현한다." },
      { id: "b", text: ".m 파일의 Class Extension에서 같은 프로퍼티를 readwrite로 재선언한다." },
      { id: "c", text: "@property를 두 번 선언하면 자동으로 readwrite로 전환된다." },
      { id: "d", text: "ivar를 직접 __readwrite 키워드로 선언한다." },
    ],
    correctChoiceId: "b",
    explanation:
      ".m 파일의 Class Extension(@interface ClassName ())에서 같은 프로퍼티를 readwrite로 재선언하면, 외부에서는 readonly만 보이고 클래스 내부에서는 setter를 사용할 수 있습니다. 이는 ObjC의 일반적인 readonly/readwrite 패턴으로, 정보 은닉을 유지하면서 내부에서 값을 변경할 수 있게 합니다.",
    relatedTopicSlugs: ["17-objective-c/properties"],
  },
  {
    id: "objective-c17-intermediate-properties-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "IBOutlet 프로퍼티를 strong과 weak 중 어떻게 선언해야 하는지에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "항상 strong으로 선언해야 메모리가 보장된다." },
      { id: "b", text: "top-level outlet과 subview outlet 모두 반드시 weak이어야 한다." },
      { id: "c", text: "현대 iOS에서는 view 계층이 view controller에 의해 strong 보유되므로 weak으로 두어도 안전하며, Apple 템플릿도 weak을 기본으로 사용한다." },
      { id: "d", text: "strong을 사용하면 IBOutlet 연결이 런타임에 자동으로 해제된다." },
    ],
    correctChoiceId: "c",
    explanation:
      "현대 iOS에서는 view hierarchy가 UIViewController의 view에 의해 강하게 보유됩니다. IBOutlet을 weak으로 선언해도 view가 살아있는 동안 outlet도 살아있습니다. Apple Xcode 템플릿은 weak을 기본으로 사용합니다. 과거에는 top-level outlet(직접 소유하는 경우)에 strong을 쓰기도 했으나 현재는 weak가 일반적입니다.",
    relatedTopicSlugs: ["17-objective-c/properties"],
  },
  {
    id: "objective-c17-advanced-properties-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "ObjC에서 NS_ASSUME_NONNULL_BEGIN/END 매크로를 사용하는 주요 목적은?",
    choices: [
      { id: "a", text: "블록 안에서 모든 포인터가 nil 체크를 통과해야 한다는 런타임 assertion을 삽입한다." },
      { id: "b", text: "블록 안에서 nullability annotation이 없는 포인터를 모두 nonnull로 간주하여, Swift에서 optional이 아닌 타입으로 노출되게 한다." },
      { id: "c", text: "컴파일러가 모든 포인터에 자동으로 nil 초기화를 수행하게 한다." },
      { id: "d", text: "ObjC 코드에서 nullable 포인터 사용 시 컴파일 에러를 발생시킨다." },
    ],
    correctChoiceId: "b",
    explanation:
      "NS_ASSUME_NONNULL_BEGIN/END 블록 안에서 nullability annotation이 없는 포인터는 모두 nonnull로 간주됩니다. 이를 통해 Swift에서 implicitly unwrapped optional(String!) 대신 non-optional(String)으로 노출됩니다. 예외적으로 nil이 가능한 항목만 nullable로 명시하면 됩니다. annotation 없는 헤더는 Swift에서 모두 !로 노출되어 nil 접근 시 crash 위험이 있습니다.",
    relatedTopicSlugs: ["17-objective-c/properties"],
  },

  // ── protocols (5) ────────────────────────────────────────────
  {
    id: "objective-c17-basic-protocols-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "ObjC 프로토콜에서 @optional 메서드를 호출하기 전에 반드시 확인해야 하는 이유는?",
    choices: [
      { id: "a", text: "@optional 메서드는 컴파일 타임에 존재 여부를 알 수 없어 빌드 에러가 발생한다." },
      { id: "b", text: "채택 클래스가 구현하지 않은 @optional 메서드를 호출하면 unrecognized selector crash가 발생하기 때문이다." },
      { id: "c", text: "@optional 메서드는 nil을 반환하도록 기본 구현이 있어 확인이 필요 없다." },
      { id: "d", text: "@optional 메서드 호출 시 ARC가 자동으로 nil 체크를 수행한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "채택 클래스가 @optional 메서드를 구현하지 않았는데 호출하면 unrecognized selector sent to instance crash가 발생합니다. 반드시 [self.delegate respondsToSelector:@selector(method:)]로 먼저 확인해야 합니다. delegate가 nil이더라도 respondsToSelector:에 nil을 전달하면 NO를 반환하므로 nil 체크와 함께 안전하게 처리됩니다.",
    relatedTopicSlugs: ["17-objective-c/protocols"],
  },
  {
    id: "objective-c17-basic-protocols-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "Delegate 패턴에서 delegate 프로퍼티를 weak으로 선언하는 이유는?",
    choices: [
      { id: "a", text: "weak으로 선언해야 delegate 메서드의 @optional 기능이 동작한다." },
      { id: "b", text: "대개 parent가 child를 strong으로 보유하는 상황에서 child.delegate가 parent를 strong으로 보유하면 retain cycle이 발생하므로, weak으로 cycle을 끊기 위해서다." },
      { id: "c", text: "strong으로 선언하면 delegate 메서드 호출 시 복사본이 전달되어 올바르게 동작하지 않는다." },
      { id: "d", text: "weak은 ARC 이전의 MRC 관례가 그대로 유지되는 것으로 기능상 차이는 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "일반적인 패턴에서 parent는 child를 strong으로 소유하고, child의 delegate는 parent를 가리킵니다. 이때 delegate를 strong으로 선언하면 parent → child(strong) → parent(strong) 형태의 retain cycle이 발생합니다. weak으로 선언하면 child → parent 방향이 약참조가 되어 cycle이 끊깁니다.",
    relatedTopicSlugs: ["17-objective-c/protocols"],
  },
  {
    id: "objective-c17-intermediate-protocols-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "ObjC 프로토콜이 <NSObject>를 상속하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "<NSObject> 상속 없이는 프로토콜 선언 자체가 컴파일 에러가 된다." },
      { id: "b", text: "delegate 타입(id<P>)에서 respondsToSelector: 등 NSObject의 메서드를 호출할 수 있게 하기 위해서다." },
      { id: "c", text: "<NSObject>를 상속해야 해당 프로토콜이 class-only 제약을 갖게 된다." },
      { id: "d", text: "<NSObject> 상속으로 프로토콜의 @optional 메서드에 default implementation이 제공된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "id<DownloaderDelegate>처럼 프로토콜 타입을 통해 delegate를 참조할 때, respondsToSelector:나 isKindOfClass: 같은 NSObject 메서드를 호출하려면 컴파일러가 해당 메서드의 존재를 알아야 합니다. <NSObject>를 상속하면 이 메서드들의 선언이 포함되어 @optional 메서드 확인 등이 가능해집니다.",
    relatedTopicSlugs: ["17-objective-c/protocols"],
  },
  {
    id: "objective-c17-intermediate-protocols-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "ObjC 프로토콜과 Swift 프로토콜의 차이 중 옳은 것은?",
    choices: [
      { id: "a", text: "ObjC 프로토콜도 associated type(PAT)을 지원한다." },
      { id: "b", text: "ObjC 프로토콜은 class만 채택할 수 있지만, Swift 프로토콜은 class/struct/enum 모두 채택할 수 있다." },
      { id: "c", text: "ObjC 프로토콜은 extension을 통해 default implementation을 제공할 수 있다." },
      { id: "d", text: "Swift 프로토콜은 @optional 메서드를 지원하지 않는다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ObjC에는 struct/enum이 없으므로 프로토콜은 class(ObjC 객체)만 채택할 수 있습니다. Swift 프로토콜은 class, struct, enum 모두 채택 가능합니다. ObjC 프로토콜은 default implementation이 없고 associated type(PAT)도 없습니다. Swift에서 @optional 메서드는 @objc protocol에서만 지원됩니다.",
    relatedTopicSlugs: ["17-objective-c/protocols"],
  },
  {
    id: "objective-c17-advanced-protocols-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "ObjC 프로토콜에 property를 선언했을 때 채택 클래스에서 처리 방식으로 올바른 것은?",
    choices: [
      { id: "a", text: "@property를 프로토콜에 선언하면 채택 클래스에서 자동 합성이 이루어진다." },
      { id: "b", text: "프로토콜의 property 선언은 getter/setter 메서드 선언의 축약이며, 채택 클래스가 @synthesize 또는 직접 구현해야 한다." },
      { id: "c", text: "프로토콜에 property를 선언하는 것은 문법 오류이다." },
      { id: "d", text: "@required property는 자동 합성되고 @optional property는 수동 구현이 필요하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ObjC 프로토콜에서 @property 선언은 getter와 setter 메서드 선언의 축약입니다. 채택 클래스에서 자동 합성은 이루어지지 않으므로, @synthesize로 명시하거나 getter/setter를 직접 구현해야 합니다. 이는 main class와 달리 프로토콜은 구현의 일부가 아닌 인터페이스만 정의하기 때문입니다.",
    relatedTopicSlugs: ["17-objective-c/protocols"],
  },

  // ── runtime (5) ──────────────────────────────────────────────
  {
    id: "objective-c17-basic-runtime-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "ObjC 런타임에서 모든 객체의 첫 번째 워드(word)에는 무엇이 저장되는가?",
    choices: [
      { id: "a", text: "객체의 retain count" },
      { id: "b", text: "isa 포인터 (자신의 클래스 객체를 가리킴)" },
      { id: "c", text: "첫 번째 ivar의 값" },
      { id: "d", text: "superclass 포인터" },
    ],
    correctChoiceId: "b",
    explanation:
      "모든 ObjC 객체의 첫 워드는 isa 포인터로, 해당 인스턴스의 클래스 객체를 가리킵니다. 런타임은 isa를 통해 클래스 정보(메서드 목록, ivar 레이아웃 등)를 찾습니다. 64-bit modern runtime에서는 isa가 단순 포인터가 아닌 비트 인코딩(non-pointer isa)으로 class pointer, inline retain count, 각종 플래그를 함께 담습니다.",
    relatedTopicSlugs: ["17-objective-c/runtime"],
  },
  {
    id: "objective-c17-basic-runtime-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt: "Method Swizzling에서 method_exchangeImplementations를 +load에서 dispatch_once로 보호하는 이유는?",
    choices: [
      { id: "a", text: "+load는 여러 번 호출될 수 있으므로 중복 swizzle을 방지하기 위해서다." },
      { id: "b", text: "dispatch_once 없이는 +load가 컴파일 에러를 발생시키기 때문이다." },
      { id: "c", text: "dispatch_once가 없으면 swizzling이 메인 스레드에서만 실행되기 때문이다." },
      { id: "d", text: "+load에서 swizzling을 하면 항상 앱이 crash하므로 dispatch_once로 감싸야 한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "+load는 보통 한 번만 호출되지만, 카테고리 로딩 순서나 동적 링크 상황에 따라 예기치 못한 이유로 중복 호출될 위험이 있습니다. dispatch_once를 사용하면 실제 swizzle 코드가 딱 한 번만 실행되도록 보장하여 두 번 exchange되는(원래대로 돌아오는) 버그를 방지합니다.",
    relatedTopicSlugs: ["17-objective-c/runtime"],
  },
  {
    id: "objective-c17-intermediate-runtime-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "[obj class]와 object_getClass(obj)의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "두 함수는 완전히 동일한 값을 반환한다." },
      { id: "b", text: "KVO가 활성화된 객체의 경우, [obj class]는 원래 클래스를 반환하고 object_getClass(obj)는 NSKVONotifying_X와 같은 실제 isa 클래스를 반환한다." },
      { id: "c", text: "object_getClass는 deprecated API로 Swift에서 사용할 수 없다." },
      { id: "d", text: "[obj class]는 metaclass를 반환하고 object_getClass는 instance class를 반환한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "KVO가 객체의 isa를 NSKVONotifying_X 서브클래스로 바꾸면, 해당 서브클래스는 [class] 메서드를 override하여 원래 클래스 X를 반환합니다. 반면 object_getClass(obj)는 override를 우회하여 실제 isa 포인터의 클래스(NSKVONotifying_X)를 반환합니다. KVO 활성화 여부 디버깅 시 유용합니다.",
    relatedTopicSlugs: ["17-objective-c/runtime"],
  },
  {
    id: "objective-c17-intermediate-runtime-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt: "ObjC 런타임에서 Tagged Pointer가 일반 힙 객체와 다른 점은?",
    choices: [
      { id: "a", text: "Tagged Pointer는 retain/release가 호출될 수 없어 ARC 관리가 불가능하다." },
      { id: "b", text: "작은 NSNumber/NSString 값을 포인터 비트 안에 직접 인코딩하여 힙 할당 없이 표현하며, retain/release가 no-op이 된다." },
      { id: "c", text: "Tagged Pointer는 Objective-C에서는 사용되지 않고 Swift에서만 사용되는 최적화이다." },
      { id: "d", text: "모든 ObjC 객체가 Tagged Pointer로 자동 전환되어 메모리 사용이 최소화된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Tagged Pointer는 작은 값(예: 작은 정수 NSNumber, 짧은 NSString)을 포인터 비트 안에 직접 인코딩하여 힙 할당을 피하는 최적화입니다. retain/release는 no-op이 되어 참조 카운팅 오버헤드가 없고 dealloc도 호출되지 않습니다. 64-bit 플랫폼에서 포인터의 특정 비트로 Tagged Pointer임을 식별합니다.",
    relatedTopicSlugs: ["17-objective-c/runtime"],
  },
  {
    id: "objective-c17-advanced-runtime-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "ObjC 런타임 API로 동적으로 새 클래스를 생성하는 올바른 순서는?",
    choices: [
      { id: "a", text: "objc_registerClassPair → class_addMethod → objc_allocateClassPair 순서" },
      { id: "b", text: "objc_allocateClassPair → class_addMethod(등 설정) → objc_registerClassPair 순서" },
      { id: "c", text: "class_addMethod → objc_allocateClassPair → objc_registerClassPair 순서" },
      { id: "d", text: "objc_allocateClassPair만 호출하면 자동으로 등록된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "동적 클래스 생성은 (1) objc_allocateClassPair로 클래스-메타클래스 쌍 메모리 할당, (2) class_addMethod/class_addIvar 등으로 메서드·ivar 추가, (3) objc_registerClassPair로 런타임에 등록하는 순서로 진행합니다. register 전까지는 외부에서 사용할 수 없으며, register 후에는 메서드·ivar 구조 변경이 불가합니다. KVO가 내부적으로 이 API로 NSKVONotifying_X 클래스를 만듭니다.",
    relatedTopicSlugs: ["17-objective-c/runtime"],
  },

  // ── swift-interop (5) ────────────────────────────────────────
  {
    id: "objective-c17-basic-swift-interop-001",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "Swift 클래스를 Objective-C에서 사용하기 위한 최소 조건은?",
    choices: [
      { id: "a", text: "Swift 파일을 Bridging Header에 import하면 자동으로 노출된다." },
      { id: "b", text: "NSObject를 상속하고 @objc를 붙이면 컴파일러가 ProductName-Swift.h를 생성하여 ObjC에서 사용할 수 있다." },
      { id: "c", text: "Swift struct에 @objc를 붙이면 ObjC에서 사용 가능하다." },
      { id: "d", text: "Swift 6부터는 별도 annotation 없이 자동으로 ObjC에 노출된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift 클래스를 ObjC에서 사용하려면 NSObject를 상속하고 @objc(또는 @objcMembers)를 붙여야 합니다. 컴파일러는 ProductName-Swift.h를 자동 생성하며, ObjC 파일에서 이를 import하면 사용할 수 있습니다. struct/enum(raw value 없는 것), generic class, tuple 등은 ObjC에 노출될 수 없습니다.",
    relatedTopicSlugs: ["17-objective-c/swift-interop"],
  },
  {
    id: "objective-c17-basic-swift-interop-002",
    type: "objective",
    level: "basic",
    category: "Objective-C",
    prompt:
      "ObjC 헤더에 nullability annotation이 없을 때 Swift에서 어떻게 노출되는가?",
    choices: [
      { id: "a", text: "non-optional(String)으로 노출된다." },
      { id: "b", text: "optional(String?)으로 노출된다." },
      { id: "c", text: "implicitly unwrapped optional(String!)로 노출되어 nil 접근 시 crash 위험이 있다." },
      { id: "d", text: "컴파일 에러가 발생하여 Swift에서 사용할 수 없다." },
    ],
    correctChoiceId: "c",
    explanation:
      "nullability annotation이 없는 ObjC 포인터는 Swift에서 implicitly unwrapped optional(String!)로 노출됩니다. 컴파일러는 non-nil을 가정하지만 런타임에 nil이 오면 crash가 발생합니다. NS_ASSUME_NONNULL_BEGIN/END로 헤더를 감싸고 예외만 nullable로 표기하는 것이 안전한 관례입니다.",
    relatedTopicSlugs: ["17-objective-c/swift-interop"],
  },
  {
    id: "objective-c17-intermediate-swift-interop-003",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "ObjC의 NS_ENUM을 Swift에서 사용할 때 자동으로 적용되는 변환으로 옳은 것은?",
    choices: [
      { id: "a", text: "NS_ENUM은 Swift에서 사용할 수 없으므로 별도 Swift enum을 정의해야 한다." },
      { id: "b", text: "NS_ENUM(NSInteger, MyColor)으로 선언된 열거형은 Swift에서 enum MyColor: Int으로 자동 매핑된다." },
      { id: "c", text: "NS_ENUM은 Swift에서 OptionSet으로 변환된다." },
      { id: "d", text: "NS_ENUM 케이스의 prefix가 자동으로 추가되어 더 길어진다." },
    ],
    correctChoiceId: "b",
    explanation:
      "NS_ENUM(NSInteger, MyColor)으로 선언된 ObjC enum은 Swift에서 enum MyColor: Int 형태로 자동 매핑됩니다. 케이스 이름에서는 enum 타입 prefix가 자동으로 제거됩니다(예: MyColorRed → .red). 비트 마스크 패턴은 NS_OPTIONS를 사용하며 Swift에서 OptionSet으로 변환됩니다.",
    relatedTopicSlugs: ["17-objective-c/swift-interop"],
  },
  {
    id: "objective-c17-intermediate-swift-interop-004",
    type: "objective",
    level: "intermediate",
    category: "Objective-C",
    prompt:
      "Swift의 async 메서드를 ObjC에서 호출할 때 자동으로 생성되는 API 형태는?",
    choices: [
      { id: "a", text: "ObjC에서는 Swift async 메서드를 호출할 수 없다." },
      { id: "b", text: "Swift async throws 메서드는 ObjC에서 (T?, NSError?) -> Void 형태의 completion handler API로 자동 노출된다." },
      { id: "c", text: "Swift async 메서드는 ObjC에서 동기(synchronous) 메서드로 노출된다." },
      { id: "d", text: "Swift async 메서드는 ObjC에서 NSOperation 서브클래스로 변환된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift async throws 메서드는 ObjC에서 completion handler 기반 API로 자동 노출됩니다. throws는 NSError ** out-parameter로 변환됩니다. 반대로 ObjC의 completion handler(마지막 인자가 (T?, NSError?) -> Void 형태)는 Swift에서 자동으로 async throws API로도 호출 가능합니다.",
    relatedTopicSlugs: ["17-objective-c/swift-interop"],
  },
  {
    id: "objective-c17-advanced-swift-interop-005",
    type: "objective",
    level: "advanced",
    category: "Objective-C",
    prompt:
      "Swift Generic class를 Objective-C에서 사용하려 할 때의 제약과 일반적인 해결 방법은?",
    choices: [
      { id: "a", text: "Swift Generic class는 자동으로 Any 타입으로 변환되어 ObjC에 노출된다." },
      { id: "b", text: "Swift Generic class는 ObjC에 직접 노출이 불가능하며, concrete subclass를 만들거나 type-erased wrapper class를 @objc로 노출하는 방식으로 해결한다." },
      { id: "c", text: "@objcMembers를 붙이면 Generic class도 ObjC에서 사용 가능하다." },
      { id: "d", text: "Generic type parameter를 id 타입으로 선언하면 ObjC에서 사용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift의 generic class는 ObjC 런타임이 이해하는 형태로 노출할 수 없어 직접 @objc 노출이 불가합니다. 해결 방법으로는 (1) 특정 타입으로 concrete subclass를 만들어 @objc 노출하거나, (2) 내부에 generic을 쓰고 외부에 type-erased wrapper class를 @objc로 제공하는 방법을 사용합니다.",
    relatedTopicSlugs: ["17-objective-c/swift-interop"],
  },
];
