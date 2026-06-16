import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── runtime-internals (add 4) ──────────────────────────────────────────────
  {
    id: "objective-c01-intermediate-runtime-internals-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "Swift Existential Container('any P')의 inline buffer 한도는 64bit 시스템 기준 얼마인가?",
    choices: [
      { id: "a", text: "8바이트 (1 word)" },
      { id: "b", text: "16바이트 (2 words)" },
      { id: "c", text: "24바이트 (3 words)" },
      { id: "d", text: "32바이트 (4 words)" },
    ],
    correctChoiceId: "c",
    explanation:
      "Existential Container는 inline buffer(3 words = 24바이트), witness table 포인터, metadata 포인터로 구성된다. 저장할 값이 24바이트를 초과하면 heap 박스로 분리된다.",
    relatedTopicSlugs: ["01-swift-language/runtime-internals"],
  },
  {
    id: "objective-c01-advanced-runtime-internals-003",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "Swift의 WMO(Whole Module Optimization)가 class 메서드 호출을 정적 디스패치로 변환하는 조건은?",
    choices: [
      { id: "a", text: "모듈 내에 해당 메서드를 override한 서브클래스가 없음을 증명할 수 있을 때" },
      { id: "b", text: "해당 클래스가 NSObject를 상속할 때" },
      { id: "c", text: "@objc 어트리뷰트가 붙은 메서드일 때" },
      { id: "d", text: "메서드가 10줄 이하로 짧아 인라이닝이 가능할 때" },
    ],
    correctChoiceId: "a",
    explanation:
      "WMO는 모듈 전체 코드를 분석해 override하는 서브클래스가 없음을 증명하면 vtable 호출을 devirtualize(정적 디스패치)로 바꾼다. 같은 모듈에 override 서브클래스가 존재하면 devirtualize할 수 없다.",
    relatedTopicSlugs: ["01-swift-language/runtime-internals"],
  },
  {
    id: "objective-c01-intermediate-runtime-internals-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "Swift 5+에서 weak/unowned 참조 카운트를 객체 본체와 분리해서 관리하는 구조는?",
    choices: [
      { id: "a", text: "value witness table" },
      { id: "b", text: "side table" },
      { id: "c", text: "vtable" },
      { id: "d", text: "existential container" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift 5+에서 weak/unowned 카운트는 side table로 분리된다. 객체 본체의 isa 포인터 뒤에 strong 카운트가 있고, weak/unowned는 별도 side table에서 관리하여 객체 해제 후에도 weak 참조를 nil로 만들 수 있다.",
    relatedTopicSlugs: ["01-swift-language/runtime-internals"],
  },
  {
    id: "objective-c01-basic-runtime-internals-005",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "Swift에서 가장 비용이 비싼 디스패치 방식은?",
    choices: [
      { id: "a", text: "Static 디스패치" },
      { id: "b", text: "Vtable 디스패치" },
      { id: "c", text: "Witness table 디스패치" },
      { id: "d", text: "ObjC message 디스패치(@objc dynamic)" },
    ],
    correctChoiceId: "d",
    explanation:
      "ObjC message send(@objc dynamic)가 가장 비싸다. vtable과 witness table은 1번의 간접 호출이고, static은 0 비용(인라인 가능), ObjC 메시지는 objc_msgSend를 통한 런타임 룩업으로 가장 많은 비용이 든다.",
    relatedTopicSlugs: ["01-swift-language/runtime-internals"],
  },

  // ── some-vs-any (add 4) ────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-some-vs-any-002",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`some Animal` 배열이 `[any Animal]` 배열과 다른 가장 큰 제약은?",
    choices: [
      { id: "a", text: "배열 원소에 접근할 때 항상 다운캐스트가 필요하다" },
      { id: "b", text: "모든 원소가 같은 구체 타입이어야 한다" },
      { id: "c", text: "런타임에 타입 정보가 손실된다" },
      { id: "d", text: "배열 크기가 컴파일 타임에 고정된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`some Animal`은 '컴파일 타임에 결정된 단일 구체 타입'이므로 배열의 모든 원소가 같은 타입이어야 한다. 반면 `[any Animal]`은 런타임 박스를 통해 Cat, Dog 등 서로 다른 구체 타입을 섞어 담을 수 있다.",
    relatedTopicSlugs: ["01-swift-language/some-vs-any"],
  },
  {
    id: "objective-c01-intermediate-some-vs-any-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "SwiftUI에서 `var body: some View`를 `any View`로 바꿨을 때 발생하는 문제는?",
    choices: [
      { id: "a", text: "컴파일 에러가 발생하여 빌드할 수 없다" },
      { id: "b", text: "뷰의 identity 추적이 약화되어 권장되지 않는다" },
      { id: "c", text: "프리뷰가 동작하지 않는다" },
      { id: "d", text: "정적 디스패치가 동적 디스패치보다 느려진다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`any View`를 사용하면 런타임 박스를 통한 동적 디스패치와 함께 SwiftUI가 뷰 트리의 타입 안정성(type-stable identity)을 유지하기 어려워 diffing 및 애니메이션 추적이 약화된다. SwiftUI는 `some View`의 컴파일 타임 타입 정보로 효율적인 diff를 수행한다.",
    relatedTopicSlugs: ["01-swift-language/some-vs-any"],
  },
  {
    id: "objective-c01-advanced-some-vs-any-004",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "Swift 5.7+에서 `any Container`(Container에 associatedtype이 있는 경우)를 사용할 때 발생하는 상황은?",
    choices: [
      { id: "a", text: "컴파일 에러 — PAT 프로토콜은 existential로 사용 불가" },
      { id: "b", text: "associated type이 erase되어 결과 타입 정보를 정확히 사용할 수 없다" },
      { id: "c", text: "witness table이 생성되지 않아 메서드 호출이 불가하다" },
      { id: "d", text: "자동으로 제네릭 특수화되어 성능 저하가 없다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift 5.7+에서는 PAT(associated type이 있는) 프로토콜도 existential로 사용할 수 있게 됐지만, associated type이 type-erase되어 결과 타입을 정확히 쓸 수 없다. Swift 5.6 이전에는 아예 변수로도 만들 수 없었다.",
    relatedTopicSlugs: ["01-swift-language/some-vs-any"],
  },
  {
    id: "objective-c01-intermediate-some-vs-any-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "`any P`에서 값이 inline buffer 한도를 초과했을 때 일어나는 일은?",
    choices: [
      { id: "a", text: "컴파일 에러가 발생한다" },
      { id: "b", text: "값이 heap에 박스로 할당된다" },
      { id: "c", text: "값이 자동으로 잘려 inline buffer에 맞춰진다" },
      { id: "d", text: "ARC retain/release 없이 weak 참조로 저장된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`any P`의 내부 inline buffer(약 4 word/32바이트)를 값이 초과하면 heap 박스를 별도 할당하고 포인터만 inline buffer에 넣는다. 이때 추가 heap 할당 비용과 ARC retain/release 비용이 발생한다.",
    relatedTopicSlugs: ["01-swift-language/some-vs-any"],
  },

  // ── string-and-unicode (add 5) ─────────────────────────────────────────────
  {
    id: "objective-c01-basic-string-and-unicode-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "Swift `String`이 정수 인덱스(`s[1]`)를 지원하지 않는 근본적인 이유는?",
    choices: [
      { id: "a", text: "Swift 설계자의 의도적인 난이도 조정" },
      { id: "b", text: "grapheme cluster 경계가 가변적이어서 정수 인덱싱이 O(1)임을 보장할 수 없기 때문" },
      { id: "c", text: "String이 값 타입이라 인덱스 연산을 지원할 수 없기 때문" },
      { id: "d", text: "UTF-8은 멀티바이트 문자를 지원하지 않기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "UTF-8에서 한 문자는 1~4바이트이고, grapheme cluster(사용자 인식 문자)는 여러 Unicode scalar로 구성될 수 있다. 임의 위치 접근은 처음부터 grapheme 경계를 다시 세어야 하므로 O(1)이 불가능하다. Swift는 '거짓 O(1) 인덱싱'을 허용하지 않는 설계 결정을 했다.",
    relatedTopicSlugs: ["01-swift-language/string-and-unicode"],
  },
  {
    id: "objective-c01-intermediate-string-and-unicode-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "64bit 시스템에서 Swift `String`의 Small String Optimization(SSO)이 heap 할당 없이 inline으로 저장할 수 있는 최대 UTF-8 바이트 수는?",
    choices: [
      { id: "a", text: "7바이트" },
      { id: "b", text: "11바이트" },
      { id: "c", text: "15바이트" },
      { id: "d", text: "31바이트" },
    ],
    correctChoiceId: "c",
    explanation:
      "64bit 시스템에서 `String`은 16바이트 슬롯 두 개(32바이트 전체)를 사용하고, 그 중 15 UTF-8 바이트까지 inline으로 저장한다. 15바이트 초과 시 `_StringStorage` heap 버퍼를 사용한다.",
    relatedTopicSlugs: ["01-swift-language/string-and-unicode"],
  },
  {
    id: "objective-c01-basic-string-and-unicode-003",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`String`의 4가지 view 중 NSString/AttributedString 인터롭에 주로 사용되는 view는?",
    choices: [
      { id: "a", text: "UnicodeScalarView" },
      { id: "b", text: "UTF16View" },
      { id: "c", text: "UTF8View" },
      { id: "d", text: "Character view (기본 String)" },
    ],
    correctChoiceId: "b",
    explanation:
      "NSString과 AttributedString은 내부적으로 UTF-16 code unit을 사용한다. 따라서 ObjC/Foundation 인터롭이나 NSRange를 다룰 때 `UTF16View`가 사용된다.",
    relatedTopicSlugs: ["01-swift-language/string-and-unicode"],
  },
  {
    id: "objective-c01-intermediate-string-and-unicode-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "다음 중 Swift String 성능에 대한 설명으로 **틀린** 것은?",
    choices: [
      { id: "a", text: "`s.count`는 grapheme cluster를 다시 세야 하므로 O(n)이다" },
      { id: "b", text: "문자열 결합 시 `joined()`보다 `+=` 반복이 항상 더 빠르다" },
      { id: "c", text: "ASCII 전용 문자열은 비교/iteration에서 fast path가 적용된다" },
      { id: "d", text: "CoW 덕분에 복사 후 수정 전까지는 실제 버퍼가 공유된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`+=` 반복은 큰 문자열 누적 시 매번 새 버퍼를 할당할 수 있어 O(n²)에 가까워진다. 반면 `chunks.joined()`는 전체 길이를 미리 계산해 한 번에 버퍼를 잡으므로 O(n)으로 더 빠르다.",
    relatedTopicSlugs: ["01-swift-language/string-and-unicode"],
  },
  {
    id: "objective-c01-advanced-string-and-unicode-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "ZWJ sequence(예: 👨‍👩‍👧)를 담은 `String`의 `.count`가 반환하는 값은?",
    choices: [
      { id: "a", text: "ZWJ를 포함한 Unicode scalar 개수(예: 5)" },
      { id: "b", text: "UTF-16 code unit 수" },
      { id: "c", text: "1 (하나의 grapheme cluster로 인식)" },
      { id: "d", text: "emoji별 바이트 수의 합" },
    ],
    correctChoiceId: "c",
    explanation:
      "Swift `String.count`는 grapheme cluster 단위로 센다. ZWJ(Zero Width Joiner) sequence는 여러 Unicode scalar가 결합해 사용자가 한 글자로 인식하는 1개의 grapheme cluster로 묶이므로 `.count`는 1이다.",
    relatedTopicSlugs: ["01-swift-language/string-and-unicode"],
  },

  // ── struct-vs-class (add 2) ────────────────────────────────────────────────
  {
    id: "objective-c01-basic-struct-vs-class-004",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`let` 키워드로 선언된 struct 인스턴스와 class 인스턴스의 동작 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "두 경우 모두 모든 프로퍼티가 불변이다" },
      { id: "b", text: "`let` struct는 프로퍼티까지 불변, `let` class는 참조가 불변이지만 var 프로퍼티는 변경 가능하다" },
      { id: "c", text: "`let` class는 모든 프로퍼티가 불변, `let` struct는 참조만 불변이다" },
      { id: "d", text: "두 경우 모두 재할당만 불가하고 내부 프로퍼티는 변경 가능하다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`let` struct는 값 타입이라 인스턴스 자체가 불변이므로 모든 저장 프로퍼티도 불변이다. 반면 `let` class는 참조(포인터)가 불변일 뿐이고, 참조하는 인스턴스의 `var` 프로퍼티는 여전히 변경할 수 있다.",
    relatedTopicSlugs: ["01-swift-language/struct-vs-class"],
  },
  {
    id: "objective-c01-intermediate-struct-vs-class-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "SwiftUI의 `View`가 struct로 설계된 가장 핵심적인 이유는?",
    choices: [
      { id: "a", text: "ObjC 런타임과의 호환성을 위해" },
      { id: "b", text: "상속을 통한 뷰 커스터마이징이 필요하기 때문" },
      { id: "c", text: "값 타입이라 동등성 비교(diffing)가 빠르고 스레드 안전하며 라이프타임 관리가 용이하기 때문" },
      { id: "d", text: "deinit을 통한 리소스 정리가 필요하기 때문" },
    ],
    correctChoiceId: "c",
    explanation:
      "SwiftUI View는 '상태 기술서'에 가깝고 정체성이 필요 없다. struct(값 타입)이라 동등성 비교가 빠르고(diffing), 복사 의미론으로 스레드 안전하며, 라이프타임을 프레임워크가 관리하기 쉽다. 상속이나 deinit이 필요하지 않다.",
    relatedTopicSlugs: ["01-swift-language/struct-vs-class"],
  },

  // ── subscript (add 5) ─────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-subscript-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`Dictionary` subscript가 값을 `Value`가 아닌 `Value?`로 반환하는 이유는?",
    choices: [
      { id: "a", text: "Dictionary는 항상 옵셔널 타입을 강제하는 규칙이 있기 때문" },
      { id: "b", text: "키가 없을 때 '키 부재'를 값으로 표현해야 하므로" },
      { id: "c", text: "subscript는 항상 옵셔널을 반환하도록 Swift 스펙에 정해졌기 때문" },
      { id: "d", text: "Dictionary가 참조 타입이기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "Dictionary에서 존재하지 않는 키를 조회할 때 에러가 아닌 '값이 없음'을 표현해야 한다. 이를 위해 `Value?`를 반환하고, 기본값이 필요하면 `dict[key, default: 0]` 문법을 사용한다.",
    relatedTopicSlugs: ["01-swift-language/subscript"],
  },
  {
    id: "objective-c01-intermediate-subscript-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "`static subscript`를 사용할 수 있게 된 Swift 버전은?",
    choices: [
      { id: "a", text: "Swift 4.0+" },
      { id: "b", text: "Swift 4.2+" },
      { id: "c", text: "Swift 5.1+" },
      { id: "d", text: "Swift 5.5+" },
    ],
    correctChoiceId: "c",
    explanation:
      "Swift 5.1+에서 `static subscript` 문법이 추가됐다. enum이나 struct에서 타입 자체에 subscript를 정의해 `Config[\"key\"]` 같은 패턴으로 글로벌 설정 저장소 등에 활용할 수 있다.",
    relatedTopicSlugs: ["01-swift-language/subscript"],
  },
  {
    id: "objective-c01-intermediate-subscript-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "`@dynamicMemberLookup`과 subscript를 결합할 때 subscript 파라미터로 요구되는 레이블은?",
    choices: [
      { id: "a", text: "`subscript(key:)`" },
      { id: "b", text: "`subscript(member:)`" },
      { id: "c", text: "`subscript(dynamicMember:)`" },
      { id: "d", text: "`subscript(lookup:)`" },
    ],
    correctChoiceId: "c",
    explanation:
      "`@dynamicMemberLookup` 어트리뷰트를 적용하면 반드시 `subscript(dynamicMember:)` 레이블을 사용해야 한다. 컴파일러가 `.name` 같은 접근을 이 subscript 호출로 변환한다.",
    relatedTopicSlugs: ["01-swift-language/subscript"],
  },
  {
    id: "objective-c01-basic-subscript-004",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`Array`에서 범위를 벗어난 인덱스로 subscript 접근 시 발생하는 결과는?",
    choices: [
      { id: "a", text: "nil을 반환한다" },
      { id: "b", text: "컴파일 에러가 발생한다" },
      { id: "c", text: "Fatal error(trap)가 발생하며 앱이 크래시한다" },
      { id: "d", text: "빈 원소를 반환한다" },
    ],
    correctChoiceId: "c",
    explanation:
      "`Array`의 subscript는 범위를 벗어나면 `Fatal error: Index out of range`로 trap을 발생시켜 앱이 크래시한다. 안전한 접근을 위해 `arr.indices.contains(i)` 확인 후 접근하거나 `first`/`last` 프로퍼티를 사용한다.",
    relatedTopicSlugs: ["01-swift-language/subscript"],
  },
  {
    id: "objective-c01-advanced-subscript-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "struct로 정의된 타입의 subscript는 어떤 디스패치 방식을 사용하는가?",
    choices: [
      { id: "a", text: "항상 vtable 디스패치" },
      { id: "b", text: "정적 디스패치" },
      { id: "c", text: "witness table 디스패치" },
      { id: "d", text: "ObjC 메시지 디스패치" },
    ],
    correctChoiceId: "b",
    explanation:
      "struct의 subscript는 다른 멤버와 동일한 디스패치 규칙을 따른다. struct나 final class는 정적 디스패치, 일반 class는 vtable, protocol requirement면 witness table을 사용한다. struct는 상속이 불가하므로 항상 정적 디스패치된다.",
    relatedTopicSlugs: ["01-swift-language/subscript"],
  },

  // ── type-casting (add 3) ───────────────────────────────────────────────────
  {
    id: "objective-c01-basic-type-casting-003",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "`Any`와 `AnyObject`의 차이로 올바른 것은?",
    choices: [
      { id: "a", text: "`Any`는 class 인스턴스만 담을 수 있고 `AnyObject`는 모든 타입을 담을 수 있다" },
      { id: "b", text: "`Any`는 모든 타입(값/참조/함수 포함)을 담을 수 있고, `AnyObject`는 class 인스턴스만 담을 수 있다" },
      { id: "c", text: "`Any`와 `AnyObject`는 완전히 동일하다" },
      { id: "d", text: "`AnyObject`는 struct도 담을 수 있지만 `Any`는 함수를 담을 수 없다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`Any`는 값 타입, 참조 타입, 함수, 옵셔널 등 Swift의 모든 타입을 담을 수 있다. `AnyObject`는 class 인스턴스(또는 @objc 호환 타입)만 담을 수 있다. struct를 `AnyObject`로 캐스트하면 Swift 4+에서 `__SwiftValue` 박스로 감싸진다.",
    relatedTopicSlugs: ["01-swift-language/type-casting"],
  },
  {
    id: "objective-c01-intermediate-type-casting-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "Swift에서 `as`(업캐스트) 연산의 비용은 어떤가?",
    choices: [
      { id: "a", text: "런타임 metadata 조회가 발생하여 비용이 있다" },
      { id: "b", text: "항상 heap 복사가 일어나 비용이 크다" },
      { id: "c", text: "컴파일 타임에 결정되므로 런타임 비용이 0이다(단, existential 박싱은 발생 가능)" },
      { id: "d", text: "witness table 조회가 필요하여 1 간접 호출 비용이 있다" },
    ],
    correctChoiceId: "c",
    explanation:
      "`as` 업캐스트는 서브타입→슈퍼타입, 브리지 등 컴파일 타임에 관계가 검증되므로 런타임 검증 비용이 없다. 다만 existential 타입으로 변환 시 박싱(inline buffer에 저장)은 발생한다.",
    relatedTopicSlugs: ["01-swift-language/type-casting"],
  },
  {
    id: "objective-c01-advanced-type-casting-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "`Any` 변수에 `nil`을 담을 때 발생하는 주의할 점은?",
    choices: [
      { id: "a", text: "컴파일 에러가 발생해서 담을 수 없다" },
      { id: "b", text: "Any에 nil을 담으면 옵셔널 박싱이 두 번 일어나는 함정이 있다" },
      { id: "c", text: "Any는 nil을 일반 값과 동일하게 처리해 함정이 없다" },
      { id: "d", text: "nil을 Any에 담으면 자동으로 0으로 변환된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`Any`에 nil을 담으면 `Optional<Any>.some(nil)` 같은 이중 박싱이 발생할 수 있다. `if case Optional<Any>.none = x` 또는 `x as? Optional<Any> == .some(nil)` 패턴으로 검사해야 하는 함정이 존재한다.",
    relatedTopicSlugs: ["01-swift-language/type-casting"],
  },

  // ── variadic-generics (add 5) ──────────────────────────────────────────────
  {
    id: "objective-c01-basic-variadic-generics-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt:
      "Swift 5.9+ parameter pack에서 type pack을 선언할 때 사용하는 키워드는?",
    choices: [
      { id: "a", text: "`variadic T`" },
      { id: "b", text: "`pack T`" },
      { id: "c", text: "`each T`" },
      { id: "d", text: "`repeat<T>`" },
    ],
    correctChoiceId: "c",
    explanation:
      "Parameter pack은 `<each T>` 문법으로 선언한다. `repeat each T`로 pack을 확장하고, `repeat each value`로 값을 확장한다. SE-0393(Swift 5.9)에서 도입됐다.",
    relatedTopicSlugs: ["01-swift-language/variadic-generics"],
  },
  {
    id: "objective-c01-intermediate-variadic-generics-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "Parameter pack(`each T`)과 기존 variadic 파라미터(`T...`)의 핵심 차이는?",
    choices: [
      { id: "a", text: "variadic은 런타임 비용이 없고, pack은 heap 할당이 필요하다" },
      { id: "b", text: "variadic은 모두 같은 타입이어야 하지만, pack은 각각 다른 타입이 가능하다" },
      { id: "c", text: "pack은 최대 10개 인자까지만 지원한다" },
      { id: "d", text: "variadic은 제네릭 제약을 쓸 수 없지만, pack은 가능하다" },
    ],
    correctChoiceId: "b",
    explanation:
      "기존 variadic(`T...`)은 모든 인자가 같은 타입이어야 한다. Parameter pack(`each T`)은 각 pack 원소가 서로 다른 타입일 수 있어 `tuple(1, \"a\", true)` → `(Int, String, Bool)` 같은 표현이 가능하다.",
    relatedTopicSlugs: ["01-swift-language/variadic-generics"],
  },
  {
    id: "objective-c01-intermediate-variadic-generics-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt:
      "Parameter pack이 해결한 SwiftUI의 기존 제한은?",
    choices: [
      { id: "a", text: "View가 Equatable을 채택하지 못하는 문제" },
      { id: "b", text: "ViewBuilder에서 10개 초과 자식 뷰를 담지 못하는 문제" },
      { id: "c", text: "@State가 class 타입을 지원하지 못하는 문제" },
      { id: "d", text: "환경 객체가 2개 이상 주입될 수 없는 문제" },
    ],
    correctChoiceId: "b",
    explanation:
      "기존 SwiftUI ViewBuilder는 `TupleView<T0, T1, ..., T9>`로 *10개까지만* 자식 뷰를 컴파일러가 합성할 수 있었다. Swift 5.9 parameter pack 도입 후 `TupleView`가 임의 arity를 받도록 재정의되어 iOS 17/Xcode 15에서 이 제약이 완화됐다.",
    relatedTopicSlugs: ["01-swift-language/variadic-generics"],
  },
  {
    id: "objective-c01-advanced-variadic-generics-004",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "Parameter pack의 런타임 비용에 대한 올바른 설명은?",
    choices: [
      { id: "a", text: "인자 개수만큼 heap 할당이 발생한다" },
      { id: "b", text: "컴파일 타임에 특수화되므로 일반 제네릭과 동일한 비용이다" },
      { id: "c", text: "witness table을 통한 동적 디스패치가 필요하다" },
      { id: "d", text: "인자 개수에 비례해 런타임 비용이 증가한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Parameter pack은 컴파일 타임에 각 타입으로 특수화(specialization)되어 일반 제네릭 특수화와 동일한 비용을 가진다. 런타임에 추가 동적 디스패치나 heap 할당이 발생하지 않는다.",
    relatedTopicSlugs: ["01-swift-language/variadic-generics"],
  },
  {
    id: "objective-c01-advanced-variadic-generics-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt:
      "다음 중 parameter pack을 사용한 `process<each T: Identifiable>(_ items: repeat each T)`가 의미하는 것은?",
    choices: [
      { id: "a", text: "단일 Identifiable 타입만 받는 제네릭 함수다" },
      { id: "b", text: "각 pack 멤버가 모두 Identifiable을 채택해야 한다는 공통 제약이 적용된다" },
      { id: "c", text: "Identifiable 타입만 최대 1개 인자로 받을 수 있다" },
      { id: "d", text: "제약 없이 어떤 타입이든 받을 수 있다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`<each T: Identifiable>`은 pack의 각 원소 타입이 모두 Identifiable을 만족해야 한다는 공통 제약이다. 함수 내부에서 `repeat each items`로 확장하면 각 원소에서 `.id`를 안전하게 접근할 수 있다.",
    relatedTopicSlugs: ["01-swift-language/variadic-generics"],
  },
];
