import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── abi-and-resilience (5) ────────────────────────────────────────────────
  {
    id: "objective-c01-basic-abi-and-resilience-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift 5.0에서 ABI 안정성이 달성된 이후 가장 직접적인 이점은 무엇인가?",
    choices: [
      { id: "a", text: "앱이 Swift 런타임을 번들에 포함하지 않아도 되어 앱 크기가 줄어든다." },
      { id: "b", text: "모든 Swift 코드가 자동으로 멀티스레드로 실행된다." },
      { id: "c", text: "ARC 오버헤드가 완전히 제거된다." },
      { id: "d", text: "앱을 매 OS 버전마다 재컴파일할 필요가 없어진다." },
    ],
    correctChoiceId: "a",
    explanation:
      "ABI 안정화(Swift 5.0+) 이전에는 앱마다 Swift 런타임을 번들해야 했기 때문에 약 5MB가 추가됐다. 이후 OS에 공유 Swift 런타임(/usr/lib/swift/)이 탑재되어 앱 번들 크기가 줄어들었다.",
    relatedTopicSlugs: ["01-swift-language/abi-and-resilience"],
  },
  {
    id: "objective-c01-intermediate-abi-and-resilience-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`@frozen` 어트리뷰트를 struct에 붙이면 어떤 의미를 라이브러리가 약속하는가?",
    choices: [
      { id: "a", text: "해당 struct를 서브클래싱할 수 없음을 보장한다." },
      { id: "b", text: "앞으로 stored property를 추가하거나 순서를 바꾸지 않겠다고 보장한다." },
      { id: "c", text: "컴파일 시 해당 struct의 모든 메서드가 인라이닝된다." },
      { id: "d", text: "해당 struct는 스레드 안전하다고 보장한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`@frozen`은 '이 타입의 stored property 목록/순서가 앞으로 변하지 않는다'는 ABI 약속이다. 클라이언트가 메모리 레이아웃을 직접 알고 인라이닝할 수 있어 성능이 회복되지만, 한 번 frozen하면 property 추가는 ABI 깨는 변경(semver major)이 된다.",
    relatedTopicSlugs: ["01-swift-language/abi-and-resilience"],
  },
  {
    id: "objective-c01-intermediate-abi-and-resilience-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "Library Evolution 모드(`-enable-library-evolution`)를 켰을 때 성능 페널티가 발생하는 근본 이유는?",
    choices: [
      { id: "a", text: "모든 함수 호출이 네트워크를 통해 검증된다." },
      { id: "b", text: "타입의 크기와 프로퍼티 오프셋이 컴파일 시 상수가 아니라 런타임 lookup이 된다." },
      { id: "c", text: "Swift 컴파일러가 최적화 패스를 전혀 실행하지 않는다." },
      { id: "d", text: "ARC 참조 카운팅 빈도가 두 배로 늘어난다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Resilience 모드에서는 클라이언트가 라이브러리 내부 구조를 직접 알 수 없으므로 타입 size/offset이 런타임에 조회된다. struct property 접근도 1 인디렉션이 추가되며, 인라이닝·specialization·dead-code 제거가 제한된다.",
    relatedTopicSlugs: ["01-swift-language/abi-and-resilience"],
  },
  {
    id: "objective-c01-advanced-abi-and-resilience-004",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "`@inlinable` 함수의 본문을 라이브러리 업데이트에서 변경했을 때 예상되는 문제는?",
    choices: [
      { id: "a", text: "클라이언트 앱이 다음 빌드 시 반드시 재컴파일 에러를 낸다." },
      { id: "b", text: "클라이언트 바이너리에 이미 복사된 옛 본문이 남아 있어 버그 패치가 효과 없을 수 있다." },
      { id: "c", text: "라이브러리 자체의 심볼이 사라져 링크 에러가 발생한다." },
      { id: "d", text: "앱 스토어 심사에서 자동으로 거절된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`@inlinable` 함수 본문은 클라이언트 모듈에 *복사(인라이닝)*된다. 라이브러리만 업데이트하면 클라이언트 바이너리에는 여전히 이전 본문이 남아 있어 버그 수정이 이미 빌드된 앱에 전달되지 않는다.",
    relatedTopicSlugs: ["01-swift-language/abi-and-resilience"],
  },
  {
    id: "objective-c01-advanced-abi-and-resilience-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "ABI stability와 Module stability의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "ABI stability는 소스 호환, Module stability는 바이너리 호환이다." },
      { id: "b", text: "ABI stability는 컴파일된 바이너리 호환, Module stability는 다른 Swift 버전이 모듈을 import할 수 있는 인터페이스 호환이다." },
      { id: "c", text: "둘은 동일 개념이며 Swift 5.0에서 동시에 도입됐다." },
      { id: "d", text: "Module stability는 Swift 5.0, ABI stability는 Swift 5.1에서 도입됐다." },
    ],
    correctChoiceId: "b",
    explanation:
      "ABI stability(Swift 5.0+)는 컴파일된 바이너리 간 기계 수준 호환을 보장하고, Module stability(Swift 5.1+)는 다른 Swift 버전이 컴파일된 모듈 인터페이스(.swiftinterface)를 import할 수 있게 한다. SwiftUI/Combine이 OS 번들로 제공될 수 있었던 배경이다.",
    relatedTopicSlugs: ["01-swift-language/abi-and-resilience"],
  },

  // ── access-control (5) ────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-access-control-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift에서 `open`과 `public`의 핵심 차이는 무엇인가?",
    choices: [
      { id: "a", text: "`open`은 모듈 외부 접근 불가, `public`은 모듈 외부 접근 가능하다." },
      { id: "b", text: "`open`은 모듈 외부에서 서브클래싱/오버라이딩이 가능하지만, `public`은 사용만 가능하고 서브클래싱/오버라이딩은 불가하다." },
      { id: "c", text: "`open`은 파일 내부에서만, `public`은 모듈 전체에서 사용된다." },
      { id: "d", text: "둘은 완전히 동일하며 혼용할 수 있다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`public`은 모듈 외부에서 *사용*은 가능하지만 서브클래싱/오버라이딩이 막혀 있다. `open`은 모듈 외부에서도 서브클래싱·오버라이딩이 허용된다. 라이브러리 API 안정성을 위해 오버라이딩이 필요 없는 타입은 `public`으로 닫아 두는 것이 권장된다.",
    relatedTopicSlugs: ["01-swift-language/access-control"],
  },
  {
    id: "objective-c01-basic-access-control-002",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "`private(set)`을 사용하면 어떤 효과가 있는가?",
    choices: [
      { id: "a", text: "해당 프로퍼티를 완전히 private로 만들어 외부에서 읽지도 못하게 한다." },
      { id: "b", text: "읽기는 외부에 공개하되, 쓰기(set)는 선언 범위 안에서만 가능하게 한다." },
      { id: "c", text: "컴파일 타임에 값을 고정시켜 런타임 변경을 막는다." },
      { id: "d", text: "`fileprivate(set)`과 완전히 동일하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`private(set)`은 *getter*는 기본 접근 수준으로 공개하고, *setter*만 `private` 범위로 제한하는 패턴이다. 읽기 공개·쓰기 비공개 API를 표현할 때 사용한다.",
    relatedTopicSlugs: ["01-swift-language/access-control"],
  },
  {
    id: "objective-c01-intermediate-access-control-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`private`과 `fileprivate`의 차이를 가장 잘 설명한 것은?",
    choices: [
      { id: "a", text: "`private`은 파일 전체, `fileprivate`은 선언 블록 안에서만 접근 가능하다." },
      { id: "b", text: "`private`은 해당 선언 + 같은 파일의 동일 타입 extension까지, `fileprivate`은 파일 전체에서 접근 가능하다." },
      { id: "c", text: "둘은 클래스에서는 차이가 없고 struct에서만 다르다." },
      { id: "d", text: "`private`은 모듈 내부, `fileprivate`은 파일 내부에서만 사용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`private`은 그 선언 자체와 *같은 파일 내 동일 타입의 extension*까지 허용한다. `fileprivate`은 그 파일 전체에서 접근 가능하므로, 같은 파일의 *다른 타입*이 접근해야 할 때는 `fileprivate`을 써야 한다.",
    relatedTopicSlugs: ["01-swift-language/access-control"],
  },
  {
    id: "objective-c01-intermediate-access-control-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`@testable import MyLib`를 사용해도 접근할 수 없는 수준은?",
    choices: [
      { id: "a", text: "`internal`" },
      { id: "b", text: "`public`" },
      { id: "c", text: "`fileprivate`과 `private`" },
      { id: "d", text: "`open`" },
    ],
    correctChoiceId: "c",
    explanation:
      "`@testable import`는 해당 모듈의 `internal` 선언까지 테스트 타겟에서 접근 가능하게 해준다. 하지만 `private`와 `fileprivate`는 `@testable`로도 노출되지 않는다.",
    relatedTopicSlugs: ["01-swift-language/access-control"],
  },
  {
    id: "objective-c01-advanced-access-control-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "함수 시그니처에 등장하는 타입의 접근 수준에 대한 Swift 규칙으로 옳은 것은?",
    choices: [
      { id: "a", text: "함수 접근 수준보다 낮은 타입을 시그니처에 사용해도 경고만 발생한다." },
      { id: "b", text: "함수 시그니처에 등장하는 타입은 함수의 접근 수준 이상이어야 하며, 그렇지 않으면 컴파일 에러가 발생한다." },
      { id: "c", text: "반환 타입은 예외적으로 더 낮은 접근 수준을 가져도 된다." },
      { id: "d", text: "매개변수 타입만 제약을 받고, 반환 타입은 제약이 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift는 외부에 노출되는 함수의 시그니처에 내부 타입이 포함되는 것을 컴파일 에러로 막는다. `public` 함수가 `internal` 타입을 매개변수/반환 타입으로 사용하면 에러가 발생한다.",
    relatedTopicSlugs: ["01-swift-language/access-control"],
  },

  // ── closures (2) ─────────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-closures-004",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "`@autoclosure`를 사용하는 주된 이유는?",
    choices: [
      { id: "a", text: "클로저가 메모리를 자동으로 해제하도록 하기 위해서" },
      { id: "b", text: "인자 표현식을 암시적으로 클로저로 감싸 지연 평가(lazy evaluation)시키기 위해서" },
      { id: "c", text: "클로저를 escaping으로 만들기 위해서" },
      { id: "d", text: "클로저가 여러 번 호출될 수 있음을 컴파일러에 알리기 위해서" },
    ],
    correctChoiceId: "b",
    explanation:
      "`@autoclosure`는 호출자가 일반 표현식처럼 인자를 넘기면 컴파일러가 자동으로 클로저로 감싸 *필요할 때까지 평가를 미루는* 역할을 한다. `&&`, `||`, `??` 등의 short-circuit 연산이 이를 활용한다.",
    relatedTopicSlugs: ["01-swift-language/closures"],
  },
  {
    id: "objective-c01-intermediate-closures-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "값 타입(Int 등)을 클로저가 캡처할 때 동작으로 옳은 것은?",
    choices: [
      { id: "a", text: "클로저가 생성되는 순간 값이 복사되어 외부 변경이 클로저 안에 반영되지 않는다." },
      { id: "b", text: "클로저는 변수의 참조를 캡처하므로, 외부에서 변수를 바꾸면 클로저 안에서도 바뀐 값이 보인다." },
      { id: "c", text: "값 타입은 클로저가 절대 캡처할 수 없으며 컴파일 에러가 발생한다." },
      { id: "d", text: "캡처 시점에 deep copy가 발생하며 클로저 내부와 외부가 완전히 독립된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift 클로저는 값 타입 변수도 *참조(박스화)*로 캡처한다. 따라서 클로저 외부에서 변수를 변경하면 클로저 내부에서도 변경된 값이 보인다. 값을 고정하려면 capture list(`[x]`)를 사용해 복사 캡처해야 한다.",
    relatedTopicSlugs: ["01-swift-language/closures"],
  },

  // ── copy-on-write (5) ────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-copy-on-write-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift의 Copy-on-Write(CoW)에서 실제 깊은 복사가 일어나는 시점은?",
    choices: [
      { id: "a", text: "변수에 컬렉션을 대입하는 순간" },
      { id: "b", text: "컬렉션을 함수 인자로 전달하는 순간" },
      { id: "c", text: "복사된 컬렉션을 변경(mutating)하기 직전, 버퍼가 공유되어 있을 때" },
      { id: "d", text: "앱이 백그라운드로 전환되는 순간" },
    ],
    correctChoiceId: "c",
    explanation:
      "CoW는 대입/전달 시에는 내부 버퍼의 참조만 공유한다(O(1)). 실제 깊은 복사는 shared 상태에서 *mutating 연산*이 발생하기 직전, `isKnownUniquelyReferenced`로 공유 여부를 확인한 뒤에만 이루어진다.",
    relatedTopicSlugs: ["01-swift-language/copy-on-write"],
  },
  {
    id: "objective-c01-basic-copy-on-write-002",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "직접 정의한 struct에 CoW가 자동으로 적용되는가?",
    choices: [
      { id: "a", text: "예, 모든 struct에는 Swift 컴파일러가 자동으로 CoW를 적용한다." },
      { id: "b", text: "아니오, CoW는 표준 라이브러리의 Array/String/Dictionary 등이 내부적으로 구현한 것이며 직접 만든 struct에는 자동 적용되지 않는다." },
      { id: "c", text: "예, 단 stored property가 모두 값 타입일 때만 자동 적용된다." },
      { id: "d", text: "아니오, 오직 class에만 CoW가 적용된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "CoW는 `Array`, `String`, `Dictionary`, `Set` 같은 표준 라이브러리 타입이 *내부적으로* 구현한 최적화다. 직접 만든 struct에는 자동 적용되지 않으며, 필요하다면 `isKnownUniquelyReferenced`를 이용해 직접 구현해야 한다.",
    relatedTopicSlugs: ["01-swift-language/copy-on-write"],
  },
  {
    id: "objective-c01-intermediate-copy-on-write-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "CoW를 직접 구현할 때 핵심 역할을 하는 Swift 표준 라이브러리 함수는?",
    choices: [
      { id: "a", text: "`withUnsafeMutablePointer(to:_:)`" },
      { id: "b", text: "`isKnownUniquelyReferenced(_:)`" },
      { id: "c", text: "`unsafeBitCast(_:to:)`" },
      { id: "d", text: "`withContiguousStorageIfAvailable(_:)`" },
    ],
    correctChoiceId: "b",
    explanation:
      "`isKnownUniquelyReferenced(_:)`는 클래스 인스턴스가 단 하나의 참조만 가지는지(unique) 확인한다. CoW 구현에서는 mutating 직전 이 함수를 호출해 공유 상태이면 깊은 복사를 하고, unique이면 바로 수정하여 불필요한 복사를 방지한다.",
    relatedTopicSlugs: ["01-swift-language/copy-on-write"],
  },
  {
    id: "objective-c01-intermediate-copy-on-write-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "CoW 컬렉션을 멀티스레드 환경에서 사용할 때 안전한 패턴은?",
    choices: [
      { id: "a", text: "읽기·쓰기 모두 항상 안전하므로 별도 동기화가 필요 없다." },
      { id: "b", text: "읽기(let 캡처 후 읽기)만 하면 안전하지만, 한쪽이 mutating하면 race가 발생하므로 actor로 격리하거나 let으로 캡처해야 한다." },
      { id: "c", text: "CoW 컬렉션은 멀티스레드에서 절대 사용할 수 없다." },
      { id: "d", text: "DispatchBarrier 없이 concurrent queue에서 자유롭게 사용 가능하다." },
    ],
    correctChoiceId: "b",
    explanation:
      "CoW 컬렉션은 *읽기(공유 버퍼)*는 안전하지만, 한쪽이 mutating하면 버퍼 교체 중 race condition이 발생한다. 동시성 컨텍스트에서는 `let`으로 캡처하거나 actor로 격리하는 것이 안전하다.",
    relatedTopicSlugs: ["01-swift-language/copy-on-write"],
  },
  {
    id: "objective-c01-advanced-copy-on-write-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "CoW 컬렉션에서 루프마다 `append`를 반복할 때 성능 문제가 생기는 이유와 해결책은?",
    choices: [
      { id: "a", text: "루프마다 GC가 실행되므로 `autoreleasepool`로 감싸야 한다." },
      { id: "b", text: "루프마다 unique 체크와 잠재적 deep copy가 발생할 수 있으므로, `reserveCapacity`로 선제 용량 확보 후 일괄 append한다." },
      { id: "c", text: "append는 항상 O(n²)이므로 대신 `+=` 연산자를 사용해야 한다." },
      { id: "d", text: "특별한 문제가 없으며 Swift 컴파일러가 자동으로 최적화한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "루프 안에서 반복 `append` 시 매번 unique 체크가 발생하고, 버퍼가 공유된 경우 불필요한 deep copy가 생길 수 있다. `reserveCapacity`로 미리 충분한 용량을 확보하면 재할당도 줄이고 unique 상태를 유지하여 성능을 개선할 수 있다.",
    relatedTopicSlugs: ["01-swift-language/copy-on-write"],
  },

  // ── enum (2) ──────────────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-enum-004",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift enum에서 raw value와 associated value에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "하나의 enum에서 raw value와 associated value를 동시에 사용할 수 있다." },
      { id: "b", text: "raw value와 associated value는 동시에 사용할 수 없다." },
      { id: "c", text: "associated value는 `String` 타입만 가능하다." },
      { id: "d", text: "raw value enum은 `CaseIterable`을 채택할 수 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift enum은 raw value(모든 케이스가 동일 타입의 원시값)와 associated value(케이스마다 다른 타입의 페이로드) 중 하나만 선택할 수 있다. 둘을 동시에 사용하면 컴파일 에러가 발생한다.",
    relatedTopicSlugs: ["01-swift-language/enum"],
  },
  {
    id: "objective-c01-intermediate-enum-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`indirect enum`이 필요한 이유는?",
    choices: [
      { id: "a", text: "enum에 stored property를 추가하기 위해" },
      { id: "b", text: "enum 케이스가 자기 자신을 페이로드로 포함하는 재귀 구조를 만들기 위해; enum이 값 타입이라 직접 포함 시 크기가 무한해지는 것을 힙 박스로 해결" },
      { id: "c", text: "enum을 멀티스레드에서 안전하게 사용하기 위해" },
      { id: "d", text: "raw value와 associated value를 함께 쓰기 위해" },
    ],
    correctChoiceId: "b",
    explanation:
      "enum은 값 타입이기 때문에 케이스가 자기 자신 타입의 값을 직접 포함하면 크기가 무한히 커진다. `indirect`는 해당 케이스를 힙에 박스화(indirection)하여 재귀 구조(예: 트리, 링크드 리스트)를 가능하게 한다.",
    relatedTopicSlugs: ["01-swift-language/enum"],
  },

  // ── equatable-hashable-codable (2) ────────────────────────────────────────
  {
    id: "objective-c01-intermediate-equatable-hashable-codable-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`Hashable`의 필수 규칙으로 옳은 것은?",
    choices: [
      { id: "a", text: "`a.hashValue == b.hashValue`이면 반드시 `a == b`이어야 한다." },
      { id: "b", text: "`a == b`이면 반드시 `a.hashValue == b.hashValue`이어야 한다(역은 성립하지 않아도 됨)." },
      { id: "c", text: "`hashValue`는 항상 양수여야 한다." },
      { id: "d", text: "`Hashable`을 채택하면 `Equatable`을 별도로 채택할 필요가 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`Hashable`의 핵심 규칙은 `a == b ⇒ a.hashValue == b.hashValue`다. 반대(같은 해시값이면 같은 객체)는 성립하지 않아도 된다(해시 충돌 허용). 이 규칙을 어기면 `Set`/`Dictionary`에서 예측 불가능한 동작이 발생한다.",
    relatedTopicSlugs: ["01-swift-language/equatable-hashable-codable"],
  },
  {
    id: "objective-c01-intermediate-equatable-hashable-codable-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`Codable` 디코딩 시 JSON 키가 없거나 `null`인 경우를 처리하는 올바른 방법은?",
    choices: [
      { id: "a", text: "`decode(_:forKey:)`를 사용하되 do-catch로 감싼다." },
      { id: "b", text: "`decodeIfPresent(_:forKey:)`를 사용하여 키가 없거나 null이면 nil을 반환받는다." },
      { id: "c", text: "JSON 키 부재는 Codable이 자동으로 기본값을 채운다." },
      { id: "d", text: "`try!`로 강제 디코딩하면 null도 안전하게 처리된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`decodeIfPresent(_:forKey:)`는 해당 키가 JSON에 없거나 값이 `null`일 때 `nil`을 반환한다. `decode(_:forKey:)`는 키가 없으면 throw되므로, 선택적 필드에는 `decodeIfPresent`를 사용해야 한다.",
    relatedTopicSlugs: ["01-swift-language/equatable-hashable-codable"],
  },

  // ── error-handling (1) ────────────────────────────────────────────────────
  {
    id: "objective-c01-intermediate-error-handling-005",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`rethrows`로 선언된 고차함수에서 non-throwing 클로저를 넘길 때의 동작은?",
    choices: [
      { id: "a", text: "컴파일 에러가 발생한다." },
      { id: "b", text: "함수 호출 시 `try`가 필요 없다." },
      { id: "c", text: "항상 `try`가 필요하다." },
      { id: "d", text: "런타임에 클로저 타입을 확인하여 자동으로 try를 추가한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`rethrows`는 클로저가 throw할 때만 함수가 throw함을 의미한다. non-throwing 클로저를 넘기면 함수 자체도 throw하지 않으므로 호출자가 `try` 없이 사용할 수 있다. throwing 클로저를 넘길 때는 `try`가 필요하다.",
    relatedTopicSlugs: ["01-swift-language/error-handling"],
  },

  // ── generics-and-pat (3) ──────────────────────────────────────────────────
  {
    id: "objective-c01-basic-generics-and-pat-003",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "`some P`와 `any P`의 차이를 가장 잘 설명한 것은?",
    choices: [
      { id: "a", text: "`some P`는 런타임에 타입이 결정되고, `any P`는 컴파일 타임에 결정된다." },
      { id: "b", text: "`some P`는 컴파일 타임에 특정 한 타입으로 결정되며 정적 디스패치, `any P`는 런타임에 어떤 타입이든 담을 수 있는 existential 컨테이너로 동적 디스패치한다." },
      { id: "c", text: "둘은 동일하며 Swift 5.7부터 interchangeable하다." },
      { id: "d", text: "`some P`는 클래스 전용, `any P`는 struct 전용이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`some P`는 컴파일 타임에 *특정 한 구체 타입*으로 결정되어 제네릭과 동일하게 정적 디스패치된다. `any P`는 existential 컨테이너에 어떤 P 준수 타입이든 담을 수 있지만 박싱·동적 디스패치 비용이 있다.",
    relatedTopicSlugs: ["01-swift-language/generics-and-pat"],
  },
  {
    id: "objective-c01-intermediate-generics-and-pat-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "PAT(Protocol with Associated Type)를 직접 변수 타입(`var c: Container`)으로 사용했을 때 Swift 5.6 이전에 발생하는 문제는?",
    choices: [
      { id: "a", text: "런타임 크래시가 발생한다." },
      { id: "b", text: "컴파일 에러 — 'P can only be used as a generic constraint'가 발생한다." },
      { id: "c", text: "컴파일은 되지만 모든 메서드 호출이 무시된다." },
      { id: "d", text: "associated type이 자동으로 Any로 치환된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "PAT는 associated type이 확정되지 않아 타입으로 직접 사용할 수 없었다. Swift 5.6 이전에는 'can only be used as a generic constraint' 에러가 발생했으며, 5.6+에서 `any P`로 명시하거나 5.7+에서 primary associated type을 사용하면 해결된다.",
    relatedTopicSlugs: ["01-swift-language/generics-and-pat"],
  },
  {
    id: "objective-c01-advanced-generics-and-pat-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "제네릭 함수에서 컴파일러가 수행하는 '타입 특수화(specialization)'의 효과는?",
    choices: [
      { id: "a", text: "런타임에 타입을 동적으로 선택하여 메모리를 절약한다." },
      { id: "b", text: "각 사용 타입별로 별도 코드를 생성하여 동적 디스패치 없이 정적 최적화된 코드를 실행할 수 있다." },
      { id: "c", text: "제네릭 함수를 클로저로 자동 변환하여 인라이닝이 불가능하게 된다." },
      { id: "d", text: "바이너리 크기를 줄이기 위해 하나의 코드 경로로 합쳐진다." },
    ],
    correctChoiceId: "b",
    explanation:
      "컴파일러는 제네릭 함수를 각 구체 타입에 대해 별도로 특수화(specialization)하여 동적 디스패치 없이 인라이닝·최적화된 코드를 생성한다. 이것이 `any P` existential 대비 `some P`/제네릭이 성능상 유리한 핵심 이유다.",
    relatedTopicSlugs: ["01-swift-language/generics-and-pat"],
  },

  // ── initialization (5) ────────────────────────────────────────────────────
  {
    id: "objective-c01-basic-initialization-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift class에서 designated init과 convenience init의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "designated init은 다른 init에 위임하고, convenience init은 직접 프로퍼티를 초기화한다." },
      { id: "b", text: "designated init은 클래스의 모든 stored property를 직접 초기화하는 주 초기화자이고, convenience init은 반드시 같은 클래스의 designated init을 호출해야 하는 편의 초기화자다." },
      { id: "c", text: "convenience init만 상속된다." },
      { id: "d", text: "둘은 완전히 동일하며 키워드만 다르다." },
    ],
    correctChoiceId: "b",
    explanation:
      "designated init은 클래스의 모든 stored property를 초기화하고 super.init()을 호출하는 핵심 초기화자다. convenience init은 designated init에 위임해야 하는 편의 초기화자로, 반드시 같은 클래스의 designated init이 호출되어야 한다.",
    relatedTopicSlugs: ["01-swift-language/initialization"],
  },
  {
    id: "objective-c01-basic-initialization-002",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "struct에 직접 init을 정의했을 때 멤버와이즈 init(memberwise init)은?",
    choices: [
      { id: "a", text: "항상 유지된다." },
      { id: "b", text: "struct 본문에 init을 직접 정의하면 사라진다. extension에 두면 유지된다." },
      { id: "c", text: "extension에 init을 추가해야 사라진다." },
      { id: "d", text: "class와 달리 항상 자동 합성된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "struct의 본문(body)에 직접 init을 정의하면 컴파일러가 멤버와이즈 init 자동 합성을 중단한다. 멤버와이즈 init을 유지하면서 추가 init을 제공하고 싶다면 extension에 편의 init을 작성하면 된다.",
    relatedTopicSlugs: ["01-swift-language/initialization"],
  },
  {
    id: "objective-c01-intermediate-initialization-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "2단계 초기화(2-phase init)에서 Phase 1과 Phase 2의 핵심 차이는?",
    choices: [
      { id: "a", text: "Phase 1에서 super.init 호출, Phase 2에서 자기 stored property 초기화" },
      { id: "b", text: "Phase 1에서 모든 stored property를 초기화(self 메서드 호출 불가), Phase 2에서 self를 사용한 추가 커스터마이즈가 가능해진다." },
      { id: "c", text: "Phase 1은 서브클래스, Phase 2는 슈퍼클래스가 담당한다." },
      { id: "d", text: "Phase 1과 2는 순서가 없으며 컴파일러가 최적화한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Phase 1은 designated init이 자기 stored property를 채우고 super.init을 통해 루트까지 초기화하는 단계로, 이 단계에서는 self.메서드 호출이 불가하다. Phase 2는 루트부터 다시 내려오며 self를 활용한 추가 커스터마이즈가 허용된다.",
    relatedTopicSlugs: ["01-swift-language/initialization"],
  },
  {
    id: "objective-c01-intermediate-initialization-004",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "`failable init(init?)`과 `throwing init(init throws)`의 선택 기준은?",
    choices: [
      { id: "a", text: "`init?`은 클래스, `init throws`는 struct에서만 사용 가능하다." },
      { id: "b", text: "왜 실패했는지 호출자가 알아야 하면 `throws`, 단순히 '값 없음' 한 가지 의미면 `init?`을 사용한다." },
      { id: "c", text: "`init?`은 성능이 더 좋고 `init throws`는 더 안전하다." },
      { id: "d", text: "둘 다 nil을 반환하므로 호출자 입장에서 차이가 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`init?`은 단순히 실패 여부만 표현하고 nil을 반환한다. 실패 원인을 호출자가 알아야 하거나 여러 가지 실패 케이스가 있다면 `init throws`를 사용해 구체적인 에러를 전달하는 것이 좋다.",
    relatedTopicSlugs: ["01-swift-language/initialization"],
  },
  {
    id: "objective-c01-advanced-initialization-005",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "Swift에서 2단계 초기화를 도입한 근본적인 이유는?",
    choices: [
      { id: "a", text: "Objective-C와의 상호운용성을 위해 alloc/init 패턴을 그대로 유지하기 위해서" },
      { id: "b", text: "모든 stored property가 초기화 완료된 상태만 self로 노출하여, 초기화 중인 부분적으로 완성된 객체가 메서드에 전달되는 버그 상태를 컴파일 타임에 차단하기 위해서" },
      { id: "c", text: "컴파일 속도를 높이기 위해 초기화 코드를 두 번에 나누어 병렬 실행하기 위해서" },
      { id: "d", text: "가비지 컬렉터가 초기화 순서를 추적하기 위해서" },
    ],
    correctChoiceId: "b",
    explanation:
      "Objective-C에서는 init 중에 부분적으로 초기화된 self를 메서드에 전달할 수 있어 불완전한 상태의 객체가 노출됐다. Swift의 2단계 초기화는 Phase 1이 완료될 때까지 self 사용을 컴파일 타임에 막아 buggy state를 원천 차단한다.",
    relatedTopicSlugs: ["01-swift-language/initialization"],
  },
];
