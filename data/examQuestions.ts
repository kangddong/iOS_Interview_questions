import type { ExamQuestion } from "@/lib/types";
import { questions as quiz01Swift1 } from "@/data/quiz/01-swift-language-part1";
import { questions as quiz01Swift2 } from "@/data/quiz/01-swift-language-part2";
import { questions as quiz01Swift3 } from "@/data/quiz/01-swift-language-part3";
import { questions as quiz02Memory } from "@/data/quiz/02-memory-management";
import { questions as quiz03Concurrency } from "@/data/quiz/03-concurrency";
import { questions as quiz04UIKit } from "@/data/quiz/04-uikit";
import { questions as quiz05SwiftUI } from "@/data/quiz/05-swiftui";
import { questions as quiz06Architecture } from "@/data/quiz/06-architecture";
import { questions as quiz07Networking } from "@/data/quiz/07-networking";
import { questions as quiz08Persistence } from "@/data/quiz/08-persistence";
import { questions as quiz09Testing } from "@/data/quiz/09-testing";
import { questions as quiz10Performance } from "@/data/quiz/10-performance";
import { questions as quiz11Build } from "@/data/quiz/11-build-system";
import { questions as quiz12Patterns } from "@/data/quiz/12-design-patterns";
import { questions as quiz13CS } from "@/data/quiz/13-cs-fundamentals";
import { questions as quiz14Network } from "@/data/quiz/14-network";
import { questions as quiz15Paradigms } from "@/data/quiz/15-paradigms";
import { questions as quiz16RealWorld } from "@/data/quiz/16-real-world";
import { questions as quiz17ObjC } from "@/data/quiz/17-objective-c";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

const baseObjectiveExamQuestions: RawExamQuestion[] = [
  {
    id: "objective-basic-optional-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "Swift에서 Optional의 핵심 의미로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "값이 없을 수 있음을 타입 시스템에 표현한다." },
      { id: "b", text: "런타임에 nil을 자동으로 빈 문자열로 바꾼다." },
      { id: "c", text: "참조 타입만 안전하게 저장하기 위한 포인터 래퍼다." },
      { id: "d", text: "throw를 대체하는 전역 에러 처리 장치다." }
    ],
    correctChoiceId: "a",
    explanation: "Optional은 값이 없을 수 있다는 사실을 타입으로 드러내고, 언래핑을 통해 nil 안전성을 강제한다.",
    relatedTopicSlugs: ["01-swift-language/optional"]
  },
  {
    id: "objective-basic-arc-001",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt: "ARC에서 retain cycle을 끊기 위해 보통 사용하는 참조 조합은?",
    choices: [
      { id: "a", text: "서로 strong으로만 참조한다." },
      { id: "b", text: "소유하지 않는 방향을 weak 또는 unowned로 둔다." },
      { id: "c", text: "모든 참조를 static으로 바꾼다." },
      { id: "d", text: "deinit 안에서 자기 자신을 nil로 만든다." }
    ],
    correctChoiceId: "b",
    explanation: "순환 소유가 생기는 방향 중 하나를 비소유 참조로 바꾸면 참조 카운트가 0이 될 수 있다.",
    relatedTopicSlugs: ["02-memory-management/retain-cycle", "02-memory-management/weak-vs-unowned"]
  },
  {
    id: "objective-basic-main-thread-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt: "UIKit UI 업데이트를 메인 스레드에서 해야 하는 주된 이유는?",
    choices: [
      { id: "a", text: "UIKit의 대부분 UI API가 메인 스레드 기반으로 설계되어 있기 때문이다." },
      { id: "b", text: "백그라운드 스레드는 네트워크 요청을 실행할 수 없기 때문이다." },
      { id: "c", text: "메인 스레드가 항상 가장 빠른 CPU 코어를 사용하기 때문이다." },
      { id: "d", text: "Swift 컴파일러가 UI 코드를 전부 메인 스레드로 옮기기 때문이다." }
    ],
    correctChoiceId: "a",
    explanation: "UI 상태와 렌더링 흐름은 메인 런루프와 강하게 연결되어 있어 백그라운드 변경은 경쟁 상태와 크래시를 만들 수 있다.",
    relatedTopicSlugs: ["03-concurrency/runloop-and-main-thread"]
  },
  {
    id: "objective-basic-mvvm-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "MVVM에서 ViewModel의 가장 중요한 역할은?",
    choices: [
      { id: "a", text: "View가 표시할 상태와 사용자 액션 처리 로직을 UI와 분리한다." },
      { id: "b", text: "모든 화면 전환 애니메이션을 직접 수행한다." },
      { id: "c", text: "데이터베이스 테이블을 직접 생성한다." },
      { id: "d", text: "Storyboard 파일을 대체한다." }
    ],
    correctChoiceId: "a",
    explanation: "ViewModel은 화면 표시 상태와 비즈니스 흐름을 View에서 분리해 테스트성과 변경 용이성을 높인다.",
    relatedTopicSlugs: ["06-architecture/mvc-vs-mvvm"]
  },
  {
    id: "objective-intermediate-some-any-001",
    type: "objective",
    level: "intermediate",
    category: "Swift 심화",
    prompt: "Swift에서 `some P`와 `any P`의 차이 설명으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "`some P`는 불투명 타입으로 구체 타입을 보존하고, `any P`는 existential로 동적 디스패치 비용이 생길 수 있다." },
      { id: "b", text: "`some P`는 클래스 전용이고, `any P`는 구조체 전용이다." },
      { id: "c", text: "`some P`는 런타임 타입 캐스팅이고, `any P`는 컴파일 타임 매크로다." },
      { id: "d", text: "두 표현은 Swift 5.7 이후 완전히 같은 의미다." }
    ],
    correctChoiceId: "a",
    explanation: "opaque type은 호출자에게 추상화하면서도 컴파일러가 구체 타입을 유지할 수 있고, existential은 값과 witness table을 담는 컨테이너 비용이 생길 수 있다.",
    relatedTopicSlugs: ["01-swift-language/some-vs-any"]
  },
  {
    id: "objective-intermediate-continuation-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency 심화",
    prompt: "`withCheckedContinuation` 사용 시 가장 중요한 규칙은?",
    choices: [
      { id: "a", text: "continuation은 모든 실행 경로에서 정확히 한 번 resume 해야 한다." },
      { id: "b", text: "completion handler가 여러 번 호출될수록 안전하다." },
      { id: "c", text: "resume은 반드시 메인 스레드에서만 호출해야 한다." },
      { id: "d", text: "에러 처리는 `try?`로만 변환해야 한다." }
    ],
    correctChoiceId: "a",
    explanation: "resume 누락은 영원히 대기하는 task를 만들고, 이중 resume은 checked continuation에서 오류로 드러난다.",
    relatedTopicSlugs: ["03-concurrency/continuation"]
  },
  {
    id: "objective-intermediate-image-scroll-001",
    type: "objective",
    level: "intermediate",
    category: "Performance 심화",
    prompt: "대형 이미지를 리스트에서 부드럽게 표시하기 위한 핵심 전략은?",
    choices: [
      { id: "a", text: "원본 이미지를 그대로 메인 스레드에서 디코딩한다." },
      { id: "b", text: "표시 크기에 맞춰 downsampling하고 디코딩 비용을 제어한다." },
      { id: "c", text: "모든 이미지를 PNG로 변환한 뒤 메모리에 영구 보관한다." },
      { id: "d", text: "셀 재사용을 끄고 새 셀을 계속 만든다." }
    ],
    correctChoiceId: "b",
    explanation: "표시 크기보다 큰 이미지를 그대로 디코딩하면 메모리와 메인 스레드 비용이 커져 스크롤 hitch가 발생하기 쉽다.",
    relatedTopicSlugs: ["10-performance/image-and-scroll"]
  },
  {
    id: "objective-intermediate-refresh-token-001",
    type: "objective",
    level: "intermediate",
    category: "Networking / Persistence",
    prompt: "여러 요청이 동시에 401을 받았을 때 토큰 갱신을 안정적으로 처리하는 방향은?",
    choices: [
      { id: "a", text: "각 요청이 독립적으로 refresh API를 호출하게 둔다." },
      { id: "b", text: "refresh 작업을 하나로 합치고 나머지 요청은 결과를 기다리게 한다." },
      { id: "c", text: "모든 요청을 즉시 실패 처리하고 앱을 종료한다." },
      { id: "d", text: "access token을 UserDefaults에 평문 저장한다." }
    ],
    correctChoiceId: "b",
    explanation: "동시 refresh를 방치하면 토큰 경합과 요청 폭주가 생기므로 single-flight 형태로 갱신을 직렬화하는 것이 안전하다.",
    relatedTopicSlugs: ["07-networking/auth-and-token-refresh"]
  },
  {
    id: "objective-advanced-module-001",
    type: "objective",
    level: "advanced",
    category: "Architecture / System Design",
    prompt: "대규모 iOS 앱 모듈화를 시작할 때 가장 먼저 고정해야 할 기준은?",
    choices: [
      { id: "a", text: "팀 경계, 변경 빈도, 의존성 방향을 기준으로 모듈 경계를 정한다." },
      { id: "b", text: "파일 수가 10개를 넘는 폴더는 모두 별도 모듈로 만든다." },
      { id: "c", text: "모든 모듈이 서로 직접 import할 수 있게 허용한다." },
      { id: "d", text: "UI 파일만 분리하고 도메인 코드는 한 모듈에 유지한다." }
    ],
    correctChoiceId: "a",
    explanation: "모듈화는 빌드 시간, 소유권, 의존성 관리를 함께 다루는 작업이므로 단순 파일 수보다 경계와 방향성이 중요하다.",
    relatedTopicSlugs: ["06-architecture/modularization"]
  },
  {
    id: "objective-advanced-hitch-001",
    type: "objective",
    level: "advanced",
    category: "Performance / System",
    prompt: "Hang과 Hitch를 구분하는 설명으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "Hang은 장시간 응답 불능, Hitch는 프레임 예산 초과로 인한 순간적인 끊김에 가깝다." },
      { id: "b", text: "Hang은 네트워크 전용 용어이고 Hitch는 메모리 전용 용어다." },
      { id: "c", text: "두 용어는 항상 같은 현상을 뜻한다." },
      { id: "d", text: "Hitch는 백그라운드 스레드에서만 발생한다." }
    ],
    correctChoiceId: "a",
    explanation: "사용자 체감 성능을 분석할 때 긴 응답 불능과 프레임 드롭은 측정 지표와 대응 전략이 다르다.",
    relatedTopicSlugs: ["10-performance/main-thread-and-hitch"]
  },
  {
    id: "objective-advanced-offline-sync-001",
    type: "objective",
    level: "advanced",
    category: "Architecture / System Design",
    prompt: "오프라인 지원과 서버 동기화를 설계할 때 반드시 다뤄야 하는 문제는?",
    choices: [
      { id: "a", text: "로컬 변경 큐, 충돌 해결 정책, 재시도/중복 방지 전략" },
      { id: "b", text: "모든 로컬 데이터를 앱 실행 시마다 삭제하는 정책" },
      { id: "c", text: "서버 응답이 늦으면 UI 업데이트를 전부 중단하는 정책" },
      { id: "d", text: "네트워크 실패를 사용자에게 숨기기만 하는 정책" }
    ],
    correctChoiceId: "a",
    explanation: "오프라인 기능은 단순 캐시가 아니라 로컬 변경과 서버 상태를 합치는 규칙을 명시해야 안정적으로 동작한다.",
    relatedTopicSlugs: ["08-persistence/core-data-and-swiftdata", "07-networking/urlsession"]
  },
  {
    id: "objective-advanced-tls-001",
    type: "objective",
    level: "advanced",
    category: "보안",
    prompt: "HTTPS pinning을 운영 환경에 적용할 때 중요한 고려사항은?",
    choices: [
      { id: "a", text: "인증서/키 교체를 고려한 rolling pin 전략과 장애 복구 경로" },
      { id: "b", text: "인증서 만료일을 무시하고 앱에 영구 고정하는 방식" },
      { id: "c", text: "HTTP로 fallback하면 보안성이 높아진다는 점" },
      { id: "d", text: "모든 TLS 검증을 비활성화하는 방식" }
    ],
    correctChoiceId: "a",
    explanation: "pinning은 보안을 높일 수 있지만 인증서 교체 실패 시 전체 통신 장애를 만들 수 있어 운영 전략이 필요하다.",
    relatedTopicSlugs: ["14-network/https-and-tls", "07-networking/urlsession"]
  },

  // ===== Swift Language =====
  {
    id: "objective-basic-struct-vs-class-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "struct와 class의 가장 본질적인 차이는?",
    choices: [
      { id: "a", text: "값 타입 vs 참조 타입 — 할당/전달 시 복사인가 참조인가" },
      { id: "b", text: "성능 — class가 항상 더 빠르다" },
      { id: "c", text: "상속 — struct도 자유롭게 상속 가능하다" },
      { id: "d", text: "메모리 — struct는 무조건 스택에 저장된다" }
    ],
    correctChoiceId: "a",
    explanation: "값 의미론과 정체성의 차이가 본질. 상속은 class만, struct는 protocol로 대체.",
    relatedTopicSlugs: ["01-swift-language/struct-vs-class"]
  },
  {
    id: "objective-basic-struct-vs-class-002",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "다음 중 class에만 있는 것은?",
    choices: [
      { id: "a", text: "deinit과 단일 상속" },
      { id: "b", text: "computed property" },
      { id: "c", text: "protocol 채택" },
      { id: "d", text: "extension" }
    ],
    correctChoiceId: "a",
    explanation: "deinit은 참조 카운트가 0일 때 호출되며 class에만 존재. 상속도 class만 가능.",
    relatedTopicSlugs: ["01-swift-language/struct-vs-class", "02-memory-management/arc"]
  },
  {
    id: "objective-intermediate-struct-vs-class-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "SwiftUI View가 struct로 설계된 가장 큰 이유는?",
    choices: [
      { id: "a", text: "값 의미론으로 동등성 비교/diffing이 빠르고 스레드 안전" },
      { id: "b", text: "struct가 class보다 메서드 호출이 빠르기 때문" },
      { id: "c", text: "View가 상속을 절대 쓰지 않기 때문" },
      { id: "d", text: "ObjC 호환을 위해" }
    ],
    correctChoiceId: "a",
    explanation: "값 타입이라 비교/식별이 빠르고 race가 없으며 framework가 lifetime을 관리하기 좋다.",
    relatedTopicSlugs: ["01-swift-language/struct-vs-class", "05-swiftui/declarative-and-view-struct"]
  },

  {
    id: "objective-basic-closure-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "@escaping이 붙은 closure가 의미하는 것은?",
    choices: [
      { id: "a", text: "함수가 반환된 이후에도 closure가 호출/저장될 수 있음" },
      { id: "b", text: "closure가 항상 비동기로 실행됨" },
      { id: "c", text: "closure 안에서 self를 사용할 수 없음" },
      { id: "d", text: "closure가 throw할 수 있음" }
    ],
    correctChoiceId: "a",
    explanation: "@escaping은 closure가 함수 스코프를 *벗어나* 살아남을 수 있음을 표현. 캡처가 escape되어 retain cycle 가능성 발생.",
    relatedTopicSlugs: ["01-swift-language/closures"]
  },
  {
    id: "objective-intermediate-closure-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "다음 closure가 잠재적 retain cycle을 만들 수 있는 경우는?",
    choices: [
      { id: "a", text: "self가 closure를 *저장*하고 closure가 self를 캡처할 때" },
      { id: "b", text: "closure가 inout 파라미터를 받을 때" },
      { id: "c", text: "closure가 @autoclosure로 표시될 때" },
      { id: "d", text: "closure 안에서 throws를 사용할 때" }
    ],
    correctChoiceId: "a",
    explanation: "self ↔ closure 상호 strong 참조가 사이클 형성의 핵심 조건. [weak self]로 끊는다.",
    relatedTopicSlugs: ["01-swift-language/closures", "02-memory-management/retain-cycle"]
  },
  {
    id: "objective-intermediate-closure-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "@autoclosure의 핵심 기능은?",
    choices: [
      { id: "a", text: "표현식을 closure로 자동 래핑해 *지연 평가*가 가능" },
      { id: "b", text: "closure를 비동기로 호출함" },
      { id: "c", text: "self 캡처를 자동으로 weak로 만듦" },
      { id: "d", text: "closure를 inline으로 강제함" }
    ],
    correctChoiceId: "a",
    explanation: "??나 &&의 short-circuit 평가가 @autoclosure로 구현됨. 호출 시점까지 평가 지연.",
    relatedTopicSlugs: ["01-swift-language/closures"]
  },

  {
    id: "objective-basic-property-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "lazy var의 특징으로 옳은 것은?",
    choices: [
      { id: "a", text: "첫 접근 시점에 초기화되며 thread-safe가 아니다" },
      { id: "b", text: "let과 함께 사용 가능하다" },
      { id: "c", text: "computed property의 한 형태이다" },
      { id: "d", text: "다중 스레드에서도 정확히 한 번 초기화가 보장된다" }
    ],
    correctChoiceId: "a",
    explanation: "lazy는 첫 접근 시 평가되지만 동시 접근 시 두 번 초기화될 수 있다. var여야 함.",
    relatedTopicSlugs: ["01-swift-language/properties"]
  },
  {
    id: "objective-intermediate-property-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "property wrapper의 wrappedValue와 projectedValue의 차이는?",
    choices: [
      { id: "a", text: "wrappedValue는 기본 노출 값, projectedValue($)는 부가 정보(Binding 등)" },
      { id: "b", text: "wrappedValue는 set 불가, projectedValue는 set 가능" },
      { id: "c", text: "둘 다 같은 값이며 별칭일 뿐" },
      { id: "d", text: "projectedValue는 컴파일 타임에만 존재" }
    ],
    correctChoiceId: "a",
    explanation: "$prop은 projectedValue 노출. @State의 $state가 Binding을 반환하는 게 대표 사례.",
    relatedTopicSlugs: ["01-swift-language/properties", "05-swiftui/state-management"]
  },
  {
    id: "objective-intermediate-property-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "didSet observer 안에서 같은 프로퍼티에 새 값을 할당하면?",
    choices: [
      { id: "a", text: "didSet이 재귀 호출되지 않고 한 번만 실행된다" },
      { id: "b", text: "무한 재귀로 스택 오버플로우" },
      { id: "c", text: "할당이 무시된다" },
      { id: "d", text: "컴파일 에러" }
    ],
    correctChoiceId: "a",
    explanation: "컴파일러가 observer 안 재귀 호출을 막아 무한 루프를 방지한다.",
    relatedTopicSlugs: ["01-swift-language/properties"]
  },

  {
    id: "objective-basic-error-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "try?와 try!의 차이는?",
    choices: [
      { id: "a", text: "try?는 실패 시 nil, try!는 실패 시 런타임 크래시" },
      { id: "b", text: "try?는 비동기, try!는 동기" },
      { id: "c", text: "try?는 Result 반환, try!는 Optional 반환" },
      { id: "d", text: "둘은 의미상 동일하다" }
    ],
    correctChoiceId: "a",
    explanation: "try?는 에러를 *값으로 변환(nil)*, try!는 *절대 throw 안 한다고 단정*하는 위험한 표현.",
    relatedTopicSlugs: ["01-swift-language/error-handling"]
  },
  {
    id: "objective-intermediate-error-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "rethrows의 의미로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "인자 closure가 throw할 때만 함수도 throw로 동작" },
      { id: "b", text: "모든 에러를 자동으로 catch 후 다시 throw" },
      { id: "c", text: "throws를 무시하고 비공개로 전파" },
      { id: "d", text: "에러 타입을 자동 변환" }
    ],
    correctChoiceId: "a",
    explanation: "고차함수가 *closure의 throw 가능성*에만 종속됨을 표현. 비-throw closure 전달 시 호출자는 try 없이 호출.",
    relatedTopicSlugs: ["01-swift-language/error-handling"]
  },
  {
    id: "objective-intermediate-error-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "Result<Success, Failure>를 쓰는 가장 적합한 시점은?",
    choices: [
      { id: "a", text: "콜백 기반 비동기 API에서 결과를 *값으로* 들고 다닐 때" },
      { id: "b", text: "동기 함수의 일반적 throws 대체로" },
      { id: "c", text: "옵셔널 결합 표현으로" },
      { id: "d", text: "throws를 모두 제거하기 위해" }
    ],
    correctChoiceId: "a",
    explanation: "Result는 *값 보관*과 *큐잉*이 필요한 콜백 비동기에 적합. async/await 환경에선 throws가 더 자연스럽다.",
    relatedTopicSlugs: ["01-swift-language/error-handling"]
  },

  {
    id: "objective-basic-codable-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "JSON의 키와 Swift 프로퍼티 이름이 다를 때 가장 표준적인 해결책은?",
    choices: [
      { id: "a", text: "CodingKeys enum을 정의해 raw value로 매핑" },
      { id: "b", text: "JSONDecoder를 매번 새로 만든다" },
      { id: "c", text: "Codable을 포기하고 NSJSONSerialization을 쓴다" },
      { id: "d", text: "JSON을 먼저 변형한 뒤 디코드" }
    ],
    correctChoiceId: "a",
    explanation: "CodingKeys로 프로퍼티별 raw key를 매핑하거나 keyDecodingStrategy(.convertFromSnakeCase) 사용.",
    relatedTopicSlugs: ["01-swift-language/equatable-hashable-codable", "07-networking/codable"]
  },
  {
    id: "objective-intermediate-codable-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "Hashable 자동 합성이 성립하는 조건은?",
    choices: [
      { id: "a", text: "struct/enum의 모든 stored가 Hashable일 때" },
      { id: "b", text: "class 인스턴스가 NSObject를 상속할 때" },
      { id: "c", text: "Equatable을 채택하지 않을 때" },
      { id: "d", text: "@frozen이 붙었을 때만" }
    ],
    correctChoiceId: "a",
    explanation: "모든 멤버가 Hashable이어야 컴파일러가 hash(into:)와 ==를 자동 합성.",
    relatedTopicSlugs: ["01-swift-language/equatable-hashable-codable"]
  },
  {
    id: "objective-intermediate-codable-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "Hashable 규약 위반에 해당하는 것은?",
    choices: [
      { id: "a", text: "a == b인데 a.hashValue != b.hashValue" },
      { id: "b", text: "a.hashValue == b.hashValue인데 a != b" },
      { id: "c", text: "hashValue가 매번 다르다" },
      { id: "d", text: "Equatable을 채택하지 않음" }
    ],
    correctChoiceId: "a",
    explanation: "==가 같으면 hashValue도 같아야 한다(역은 X). 위반하면 Set/Dictionary가 오작동.",
    relatedTopicSlugs: ["01-swift-language/equatable-hashable-codable"]
  },

  {
    id: "objective-basic-enum-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "enum에서 indirect 키워드가 필요한 경우는?",
    choices: [
      { id: "a", text: "케이스가 자기 자신을 포함하는 재귀 enum일 때" },
      { id: "b", text: "raw value를 사용할 때" },
      { id: "c", text: "associated value를 추가할 때" },
      { id: "d", text: "CaseIterable을 채택할 때" }
    ],
    correctChoiceId: "a",
    explanation: "enum은 값 타입이라 자기 자신 사이즈를 직접 포함 불가. indirect로 heap 박스 처리.",
    relatedTopicSlugs: ["01-swift-language/enum"]
  },
  {
    id: "objective-intermediate-enum-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "non-frozen enum의 switch에 @unknown default를 권장하는 이유는?",
    choices: [
      { id: "a", text: "라이브러리에 새 케이스가 추가돼도 컴파일 경고로 감지 가능" },
      { id: "b", text: "switch 성능이 좋아진다" },
      { id: "c", text: "default 없이도 컴파일 가능하게 함" },
      { id: "d", text: "메모리 사용량이 줄어든다" }
    ],
    correctChoiceId: "a",
    explanation: "@unknown default는 *현재 알지 못하는* 케이스에 대응. 새 케이스 추가 시 경고로 알림.",
    relatedTopicSlugs: ["01-swift-language/enum", "01-swift-language/pattern-matching"]
  },
  {
    id: "objective-intermediate-enum-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "raw value와 associated value를 한 enum에 동시 사용할 수 있는가?",
    choices: [
      { id: "a", text: "불가 — 둘 중 하나만 선택 가능" },
      { id: "b", text: "가능 — 케이스별로 자유롭게 혼합" },
      { id: "c", text: "@frozen이 붙으면 가능" },
      { id: "d", text: "indirect로 감싸면 가능" }
    ],
    correctChoiceId: "a",
    explanation: "Swift enum은 raw value와 associated value를 동시 허용하지 않는다. RawRepresentable과 충돌.",
    relatedTopicSlugs: ["01-swift-language/enum"]
  },

  {
    id: "objective-basic-pattern-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "if case let .success(v) = result 패턴의 의미는?",
    choices: [
      { id: "a", text: "result가 .success일 때만 v로 값을 추출해 if 본문 진입" },
      { id: "b", text: "result를 무조건 success로 변환" },
      { id: "c", text: "Result 타입을 던지면 실패 시 throw" },
      { id: "d", text: "result를 무시하고 v를 새로 만든다" }
    ],
    correctChoiceId: "a",
    explanation: "if case는 패턴 매칭 + binding의 syntactic sugar. switch 한 케이스만 다룰 때 간결.",
    relatedTopicSlugs: ["01-swift-language/pattern-matching", "01-swift-language/error-handling"]
  },
  {
    id: "objective-intermediate-pattern-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "case 0..<10:가 작동하는 메커니즘은?",
    choices: [
      { id: "a", text: "Range의 ~= 연산자가 호출되어 매칭" },
      { id: "b", text: "switch가 자동으로 Range를 Int로 변환" },
      { id: "c", text: "Swift 컴파일러가 특수 케이스로 처리" },
      { id: "d", text: "Range가 Comparable이므로 자동 매칭" }
    ],
    correctChoiceId: "a",
    explanation: "case 표현식 ~= 값 호출이 switch 동작의 본질. ~= 직접 정의로 사용자 패턴 가능.",
    relatedTopicSlugs: ["01-swift-language/pattern-matching"]
  },
  {
    id: "objective-intermediate-pattern-003",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "for case let v? in optionals의 의미는?",
    choices: [
      { id: "a", text: "옵셔널이 .some일 때만 풀어서 순회, nil은 스킵" },
      { id: "b", text: "옵셔널을 무조건 풀어 nil은 크래시" },
      { id: "c", text: "옵셔널을 모두 nil로 변환" },
      { id: "d", text: "옵셔널 배열을 평탄화한다" }
    ],
    correctChoiceId: "a",
    explanation: "v? 패턴은 .some(v)의 sugar. nil은 매칭 실패로 자동 스킵된다.",
    relatedTopicSlugs: ["01-swift-language/pattern-matching", "01-swift-language/optional"]
  },

  {
    id: "objective-basic-cast-001",
    type: "objective",
    level: "basic",
    category: "Swift Language",
    prompt: "as?와 as!의 차이는?",
    choices: [
      { id: "a", text: "as?는 실패 시 nil, as!는 실패 시 런타임 크래시" },
      { id: "b", text: "as?는 값 타입에만, as!는 참조 타입에만 사용 가능" },
      { id: "c", text: "둘 다 같은 동작이며 가독성 차이만 있다" },
      { id: "d", text: "as!는 컴파일 타임에 검증된다" }
    ],
    correctChoiceId: "a",
    explanation: "as?는 안전한 옵셔널 캐스트, as!는 강제 캐스트로 실패 시 fatalError.",
    relatedTopicSlugs: ["01-swift-language/type-casting"]
  },
  {
    id: "objective-intermediate-cast-002",
    type: "objective",
    level: "intermediate",
    category: "Swift Language",
    prompt: "Any와 AnyObject의 차이는?",
    choices: [
      { id: "a", text: "Any는 모든 타입, AnyObject는 class 인스턴스만" },
      { id: "b", text: "Any는 컴파일 타임, AnyObject는 런타임 타입" },
      { id: "c", text: "둘 다 동일한 보호 수준" },
      { id: "d", text: "AnyObject는 옵셔널만 담을 수 있다" }
    ],
    correctChoiceId: "a",
    explanation: "AnyObject는 참조 타입 한정, ObjC 인터롭에 사용. Any는 값/참조 모두 + Existential 박싱.",
    relatedTopicSlugs: ["01-swift-language/type-casting", "01-swift-language/generics-and-pat"]
  },
  {
    id: "objective-advanced-cast-003",
    type: "objective",
    level: "advanced",
    category: "Swift Language",
    prompt: "any P 변수에 작은 값을 담으면 메모리에 어떻게 저장되는가?",
    choices: [
      { id: "a", text: "Existential container의 inline buffer (3 words)에 담김, 초과하면 heap 박스" },
      { id: "b", text: "항상 heap에 박싱" },
      { id: "c", text: "항상 스택에 인라인 저장" },
      { id: "d", text: "ObjC 객체로 자동 변환" }
    ],
    correctChoiceId: "a",
    explanation: "Existential container는 3-word inline buffer + 메타데이터 + witness table. 초과 시 heap 박스화.",
    relatedTopicSlugs: ["01-swift-language/runtime-internals", "01-swift-language/generics-and-pat"]
  },

  // ===== Memory =====
  {
    id: "objective-basic-arc-002",
    type: "objective",
    level: "basic",
    category: "Memory",
    prompt: "ARC의 동작 시점에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "컴파일러가 retain/release 호출을 코드에 *자동 삽입*해 런타임에 카운팅" },
      { id: "b", text: "런타임 GC가 주기적으로 도달 불가 객체를 청소" },
      { id: "c", text: "프로세스 종료 시 일괄 해제" },
      { id: "d", text: "객체 생성 시점에 미리 lifetime을 예약" }
    ],
    correctChoiceId: "a",
    explanation: "ARC는 *컴파일 타임 삽입 + 런타임 카운팅* 하이브리드. GC와 다르며 즉시 해제.",
    relatedTopicSlugs: ["02-memory-management/arc"]
  },
  {
    id: "objective-intermediate-arc-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt: "Swift에서 weak 참조가 가능한 타입은?",
    choices: [
      { id: "a", text: "class 또는 AnyObject 제약 프로토콜의 옵셔널 변수" },
      { id: "b", text: "모든 타입에 사용 가능" },
      { id: "c", text: "struct에도 가능" },
      { id: "d", text: "enum에만 사용 가능" }
    ],
    correctChoiceId: "a",
    explanation: "weak는 *참조 타입*만 + 옵셔널. struct/enum 값 타입은 ARC 대상이 아니므로 불가.",
    relatedTopicSlugs: ["02-memory-management/weak-vs-unowned"]
  },
  {
    id: "objective-intermediate-weak-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt: "[weak self]을 *반드시* 써야 하는 가장 전형적인 상황은?",
    choices: [
      { id: "a", text: "self가 closure를 *저장*하고 closure가 self를 참조해 *비동기로 살아남는* 경우" },
      { id: "b", text: "UIView.animate { }의 짧은 동기 closure" },
      { id: "c", text: "동기 함수 안에서 한 번만 호출되는 closure" },
      { id: "d", text: "guard let self else { } 패턴이 없는 closure" }
    ],
    correctChoiceId: "a",
    explanation: "*저장되는* closure만이 retain cycle을 만든다. 일회성 closure는 보통 weak 불필요.",
    relatedTopicSlugs: ["02-memory-management/weak-vs-unowned", "02-memory-management/capture-list"]
  },
  {
    id: "objective-advanced-weak-003",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt: "Swift weak 참조의 내부 구현으로 옳은 것은?",
    choices: [
      { id: "a", text: "객체 side table에 weak count를 두어 객체 해제 시 자동으로 nil 처리" },
      { id: "b", text: "단순 raw pointer로 저장되어 해제 후엔 dangling" },
      { id: "c", text: "강한 참조와 동일한 카운팅" },
      { id: "d", text: "GC가 추적해 nil 처리" }
    ],
    correctChoiceId: "a",
    explanation: "Swift 5+ 객체 헤더 외 side table을 사용해 weak/unowned count를 별도 관리. 해제 시 자동 nil.",
    relatedTopicSlugs: ["02-memory-management/weak-vs-unowned", "02-memory-management/arc-optimization"]
  },
  {
    id: "objective-intermediate-retain-002",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt: "delegate protocol에 보통 AnyObject 제약을 두는 이유는?",
    choices: [
      { id: "a", text: "delegate 프로퍼티를 weak로 선언할 수 있도록 보장" },
      { id: "b", text: "delegate 호출이 빨라지기 때문" },
      { id: "c", text: "Swift 컴파일러가 강제하기 때문" },
      { id: "d", text: "Objective-C 코드에서 보이게 하기 위해" }
    ],
    correctChoiceId: "a",
    explanation: "weak는 class 타입만 가능. AnyObject 제약이 있어야 weak delegate가 가능하고 retain cycle 방지.",
    relatedTopicSlugs: ["02-memory-management/retain-cycle", "12-design-patterns/delegate"]
  },
  {
    id: "objective-intermediate-retain-003",
    type: "objective",
    level: "intermediate",
    category: "Memory",
    prompt: "deinit이 호출되지 않을 때 가장 먼저 의심해야 할 것은?",
    choices: [
      { id: "a", text: "strong reference cycle (closure 캡처, parent-child 양방향 등)" },
      { id: "b", text: "프로세스가 종료되지 않음" },
      { id: "c", text: "swift compiler 버그" },
      { id: "d", text: "ARC가 비활성화됨" }
    ],
    correctChoiceId: "a",
    explanation: "deinit 누락의 대부분은 cycle 또는 NotificationCenter/Timer 보유. Memory Graph로 추적.",
    relatedTopicSlugs: ["02-memory-management/retain-cycle", "02-memory-management/memory-tools"]
  },
  {
    id: "objective-advanced-arc-opt-001",
    type: "objective",
    level: "advanced",
    category: "Memory",
    prompt: "final 키워드가 ARC 비용에 미치는 영향은?",
    choices: [
      { id: "a", text: "정적 디스패치/인라이닝이 가능해져 ARC 호출 자체가 제거될 가능성↑" },
      { id: "b", text: "ARC가 비활성화된다" },
      { id: "c", text: "retain/release atomic 연산이 non-atomic으로 바뀐다" },
      { id: "d", text: "weak 참조가 자동으로 strong으로 변환된다" }
    ],
    correctChoiceId: "a",
    explanation: "final → 정적 디스패치 + 인라이닝 → ARC optimization pass가 더 공격적으로 retain/release 제거.",
    relatedTopicSlugs: ["02-memory-management/arc-optimization", "01-swift-language/method-dispatch"]
  },

  // ===== Concurrency =====
  {
    id: "objective-basic-gcd-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt: "DispatchQueue.main.sync를 메인 스레드에서 호출하면?",
    choices: [
      { id: "a", text: "데드락 — 메인이 자신을 기다리므로 영원히 멈춤" },
      { id: "b", text: "즉시 실행" },
      { id: "c", text: "백그라운드로 자동 전환" },
      { id: "d", text: "런타임이 비동기로 변환" }
    ],
    correctChoiceId: "a",
    explanation: "sync는 *완료까지 대기*. 메인에서 메인을 sync 호출하면 자기 자신을 기다리는 데드락.",
    relatedTopicSlugs: ["03-concurrency/gcd"]
  },
  {
    id: "objective-intermediate-gcd-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "DispatchQueue의 QoS가 동기/비동기 작업에 미치는 영향은?",
    choices: [
      { id: "a", text: "OS 스케줄러에 *우선순위*를 알려 CPU/IO 자원 할당에 영향" },
      { id: "b", text: "큐의 처리량을 결정한다 (큐 크기)" },
      { id: "c", text: "작업의 결과 형식을 정한다" },
      { id: "d", text: "엄격한 실시간성을 보장한다" }
    ],
    correctChoiceId: "a",
    explanation: "QoS = quality of service. 호출 chain을 따라 전파되며 우선순위 inversion 방지에도 활용.",
    relatedTopicSlugs: ["03-concurrency/gcd"]
  },
  {
    id: "objective-basic-async-001",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt: "다음 중 async/await의 도입 목적으로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "콜백 중첩과 race condition을 줄이고 구조적 동시성을 제공" },
      { id: "b", text: "GCD를 완전히 대체하기 위함" },
      { id: "c", text: "메인 스레드 호출을 자동으로 허용" },
      { id: "d", text: "오버헤드 없는 동기 코드로 변환" }
    ],
    correctChoiceId: "a",
    explanation: "structured concurrency + 컴파일러가 추적 가능한 비동기 흐름이 핵심.",
    relatedTopicSlugs: ["03-concurrency/async-await"]
  },
  {
    id: "objective-intermediate-async-002",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "Task와 Task.detached의 차이는?",
    choices: [
      { id: "a", text: "Task은 부모의 우선순위/actor 격리/TaskLocal을 상속, detached는 끊김" },
      { id: "b", text: "Task은 동기, detached는 비동기" },
      { id: "c", text: "Task은 메인 actor 강제, detached는 백그라운드 강제" },
      { id: "d", text: "Task은 cancel 불가, detached는 가능" }
    ],
    correctChoiceId: "a",
    explanation: "detached는 *부모 context 단절*. UI 호출 시 명시적 @MainActor 필요.",
    relatedTopicSlugs: ["03-concurrency/async-await", "03-concurrency/actor-and-mainactor"]
  },
  {
    id: "objective-advanced-async-003",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt: "await 전후의 스레드에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "같은 스레드 보장 X — 같은 executor면 인라이닝되지만 일반적으로 hop 가능" },
      { id: "b", text: "항상 같은 스레드에서 재개" },
      { id: "c", text: "항상 다른 스레드로 hop" },
      { id: "d", text: "Swift 런타임이 임의로 결정하므로 예측 불가" }
    ],
    correctChoiceId: "a",
    explanation: "Swift Concurrency는 cooperative pool 위에서 hop. thread-local 의존 코드는 위험.",
    relatedTopicSlugs: ["03-concurrency/concurrency-runtime", "03-concurrency/async-await"]
  },
  {
    id: "objective-intermediate-actor-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "actor의 가장 본질적인 보장은?",
    choices: [
      { id: "a", text: "내부 mutable state에 *한 번에 하나의 task만* 접근 (격리)" },
      { id: "b", text: "모든 호출이 비동기 + 동시 실행" },
      { id: "c", text: "메서드 호출이 자동으로 main thread에서 실행" },
      { id: "d", text: "GCD 큐를 자동으로 생성" }
    ],
    correctChoiceId: "a",
    explanation: "actor = isolated state. data race를 컴파일/런타임에 차단.",
    relatedTopicSlugs: ["03-concurrency/actor-and-mainactor"]
  },
  {
    id: "objective-advanced-actor-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt: "actor reentrancy 문제의 핵심은?",
    choices: [
      { id: "a", text: "await 지점에서 다른 task가 끼어들어 *중간 상태*가 외부에 노출될 수 있음" },
      { id: "b", text: "actor 메서드가 자기 자신을 재귀 호출 시 데드락" },
      { id: "c", text: "actor가 두 번 초기화될 수 있음" },
      { id: "d", text: "actor 호출이 메인 스레드를 두 번 점유" }
    ],
    correctChoiceId: "a",
    explanation: "await에서 yield가 있으므로 *연속성*을 가정한 코드가 깨질 수 있다. 캐시 일관성 확인 필요.",
    relatedTopicSlugs: ["03-concurrency/actor-and-mainactor", "03-concurrency/concurrency-pitfalls"]
  },
  {
    id: "objective-intermediate-mainactor-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "@MainActor가 표시된 함수의 호출 규약으로 옳은 것은?",
    choices: [
      { id: "a", text: "메인 actor 외부에서 호출 시 await 통한 hop 필요" },
      { id: "b", text: "어디서든 동기 호출 가능" },
      { id: "c", text: "Sendable 위반 시 자동으로 throws" },
      { id: "d", text: "MainActor.run을 항상 명시해야 함" }
    ],
    correctChoiceId: "a",
    explanation: "@MainActor 격리. 다른 컨텍스트에서 호출하면 await로 main에 hop.",
    relatedTopicSlugs: ["03-concurrency/actor-and-mainactor"]
  },
  {
    id: "objective-intermediate-sendable-001",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "Sendable 프로토콜의 목적은?",
    choices: [
      { id: "a", text: "동시성 경계(actor, task)를 안전하게 넘을 수 있는 타입임을 컴파일 타임에 표현" },
      { id: "b", text: "타입을 자동으로 thread-safe로 변환" },
      { id: "c", text: "Codable과 자동 호환" },
      { id: "d", text: "비동기 함수에만 사용" }
    ],
    correctChoiceId: "a",
    explanation: "Sendable = 값/참조의 격리 경계 안전. race를 컴파일 타임에 막는 신호.",
    relatedTopicSlugs: ["03-concurrency/sendable"]
  },
  {
    id: "objective-advanced-sendable-002",
    type: "objective",
    level: "advanced",
    category: "Concurrency",
    prompt: "@unchecked Sendable이 정당한 경우는?",
    choices: [
      { id: "a", text: "내부적으로 lock/atomic으로 직접 동기화를 *수동 보장*했을 때" },
      { id: "b", text: "Sendable 위반 경고를 단순히 끄고 싶을 때" },
      { id: "c", text: "성능 측정 결과가 느릴 때" },
      { id: "d", text: "프로토콜 채택이 귀찮을 때" }
    ],
    correctChoiceId: "a",
    explanation: "@unchecked는 *책임을 개발자가 지는* 옵션. 수동 동기화 또는 불변성 보장이 전제.",
    relatedTopicSlugs: ["03-concurrency/sendable", "03-concurrency/swift6-strict"]
  },
  {
    id: "objective-basic-runloop-002",
    type: "objective",
    level: "basic",
    category: "Concurrency",
    prompt: "scrollView 스크롤 중에 Timer가 안 도는 이유는?",
    choices: [
      { id: "a", text: "Timer가 .default 모드에만 등록되어 .tracking 모드로 전환되면 멈춤" },
      { id: "b", text: "Timer 자체가 항상 일시중지된다" },
      { id: "c", text: "스크롤 중엔 모든 메인 작업이 차단" },
      { id: "d", text: "Timer가 백그라운드 큐로 자동 이동" }
    ],
    correctChoiceId: "a",
    explanation: ".common 모드로 등록하면 default/tracking 둘 다 동작.",
    relatedTopicSlugs: ["03-concurrency/runloop-and-main-thread", "04-uikit/runloop-deep"]
  },
  {
    id: "objective-intermediate-runloop-003",
    type: "objective",
    level: "intermediate",
    category: "Concurrency",
    prompt: "setNeedsLayout 직후 frame이 갱신되지 않는 이유는?",
    choices: [
      { id: "a", text: "layout/draw는 RunLoop *끝 단계*에 한 번만 실행되기 때문" },
      { id: "b", text: "frame이 read-only이기 때문" },
      { id: "c", text: "Auto Layout이 비활성화되어 있어서" },
      { id: "d", text: "view가 hidden 상태이기 때문" }
    ],
    correctChoiceId: "a",
    explanation: "layoutIfNeeded()로 강제 동기화 가능. 그렇지 않으면 다음 RunLoop 끝에서 적용.",
    relatedTopicSlugs: ["04-uikit/runloop-deep", "03-concurrency/runloop-and-main-thread"]
  },

  // ===== UIKit =====
  {
    id: "objective-basic-vc-lifecycle-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt: "viewDidLoad와 viewWillAppear의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "viewDidLoad는 *최초 1회*, viewWillAppear는 *매번 표시 직전*" },
      { id: "b", text: "둘 다 매번 호출된다" },
      { id: "c", text: "viewWillAppear가 viewDidLoad보다 먼저 호출된다" },
      { id: "d", text: "viewDidLoad는 메인 외 스레드에서 호출될 수 있다" }
    ],
    correctChoiceId: "a",
    explanation: "viewDidLoad는 메모리에 view 로드 직후 1회. viewWillAppear는 매번. 무거운 작업 위치 선정 기준.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle"]
  },
  {
    id: "objective-intermediate-vc-lifecycle-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "viewDidLoad에서 view.bounds를 신뢰하면 안 되는 이유는?",
    choices: [
      { id: "a", text: "아직 *유효한 size로 layout 되기 전*이라 부정확할 수 있음" },
      { id: "b", text: "메인 스레드가 아니라서" },
      { id: "c", text: "AutoLayout이 비활성화되어서" },
      { id: "d", text: "frame과 다르기 때문" }
    ],
    correctChoiceId: "a",
    explanation: "viewDidLoad 시점엔 superview/window에 아직 attach되지 않을 수 있다. viewDidLayoutSubviews 사용.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle", "04-uikit/auto-layout"]
  },
  {
    id: "objective-intermediate-vc-lifecycle-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "iOS 17의 viewIsAppearing이 추가된 이유는?",
    choices: [
      { id: "a", text: "viewWillAppear는 *유효한 size 전*, viewDidAppear는 *전환 끝*이라 그 사이 단계가 필요" },
      { id: "b", text: "viewWillAppear가 비동기로 변경되어서" },
      { id: "c", text: "iOS 16까지의 시그니처가 deprecated 되었기 때문" },
      { id: "d", text: "scene 기반 라이프사이클을 새로 추가하기 위해" }
    ],
    correctChoiceId: "a",
    explanation: "viewIsAppearing은 *trait/size 확정 + 전환 도중* 단계. UI 데이터 바인딩 최적 시점.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle"]
  },

  {
    id: "objective-basic-frame-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt: "frame과 bounds의 차이는?",
    choices: [
      { id: "a", text: "frame은 *superview 좌표계*, bounds는 *자기 좌표계*" },
      { id: "b", text: "frame은 transform 후, bounds는 transform 전" },
      { id: "c", text: "frame은 read-only, bounds는 변경 가능" },
      { id: "d", text: "둘은 같은 값이며 별칭일 뿐" }
    ],
    correctChoiceId: "a",
    explanation: "scrollView 콘텐츠 스크롤 = bounds.origin 변경. frame = 부모 안 위치.",
    relatedTopicSlugs: ["04-uikit/frame-vs-bounds"]
  },
  {
    id: "objective-intermediate-frame-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "transform이 적용된 view의 frame을 직접 set하면?",
    choices: [
      { id: "a", text: "결과가 예측 불가 — Apple은 transform 시 frame 직접 set을 금지함" },
      { id: "b", text: "정상적으로 적용된다" },
      { id: "c", text: "transform이 자동으로 해제된다" },
      { id: "d", text: "auto layout이 일시적으로 비활성화된다" }
    ],
    correctChoiceId: "a",
    explanation: "transform이 있으면 center + bounds로 제어하라는 게 공식 가이드.",
    relatedTopicSlugs: ["04-uikit/frame-vs-bounds", "04-uikit/core-animation"]
  },

  {
    id: "objective-intermediate-autolayout-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "Content Hugging Priority가 높은 view의 동작은?",
    choices: [
      { id: "a", text: "intrinsicContentSize보다 *커지는 것을 저항*" },
      { id: "b", text: "intrinsicContentSize보다 *작아지는 것을 저항*" },
      { id: "c", text: "auto layout을 무시" },
      { id: "d", text: "항상 가장 먼저 그려진다" }
    ],
    correctChoiceId: "a",
    explanation: "Hugging = 늘어남 저항. Compression Resistance = 줄어듦 저항. label 잘림/늘어남 제어.",
    relatedTopicSlugs: ["04-uikit/auto-layout"]
  },

  {
    id: "objective-intermediate-responder-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "버튼 탭이 안 먹힐 때 가장 먼저 의심해야 할 것은?",
    choices: [
      { id: "a", text: "hit-testing 영역(frame, isUserInteractionEnabled, alpha, hidden, clipsToBounds)" },
      { id: "b", text: "스레드 안전성" },
      { id: "c", text: "메모리 누수" },
      { id: "d", text: "auto layout 제약 우선순위" }
    ],
    correctChoiceId: "a",
    explanation: "hitTest(_:with:)가 일치하는 view를 못 찾는 경우. 상위 view의 frame 밖이거나 interaction 비활성.",
    relatedTopicSlugs: ["04-uikit/responder-chain"]
  },
  {
    id: "objective-intermediate-tableview-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "셀 재사용 시 이미지가 일시적으로 깜빡이는 이유는?",
    choices: [
      { id: "a", text: "이전 셀의 이미지가 남아 있고 새 이미지가 비동기로 도착하기 때문" },
      { id: "b", text: "Auto Layout이 비활성화되어서" },
      { id: "c", text: "scrollView가 메인 스레드를 점유해서" },
      { id: "d", text: "Image cache가 비활성화되어서" }
    ],
    correctChoiceId: "a",
    explanation: "prepareForReuse에서 image = nil + 비동기 로드 시 셀 id 검증이 표준 해결책.",
    relatedTopicSlugs: ["04-uikit/tableview-collectionview", "10-performance/image-and-scroll"]
  },

  // ===== SwiftUI =====
  {
    id: "objective-basic-state-001",
    type: "objective",
    level: "basic",
    category: "SwiftUI",
    prompt: "@State와 @Binding의 관계는?",
    choices: [
      { id: "a", text: "@State는 *소유자*가 상태를 보관, @Binding은 *그 상태에 대한 양방향 참조*" },
      { id: "b", text: "@Binding은 항상 readonly" },
      { id: "c", text: "둘은 같은 의미" },
      { id: "d", text: "@State는 class용, @Binding은 struct용" }
    ],
    correctChoiceId: "a",
    explanation: "$state로 Binding 노출. 자식이 부모 state를 변경할 수 있게 함.",
    relatedTopicSlugs: ["05-swiftui/state-management"]
  },
  {
    id: "objective-intermediate-state-002",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt: "@StateObject와 @ObservedObject의 차이는?",
    choices: [
      { id: "a", text: "@StateObject는 *생성/소유*, @ObservedObject는 *외부에서 받아 관찰*만" },
      { id: "b", text: "둘은 별칭일 뿐이다" },
      { id: "c", text: "@ObservedObject는 메모리 누수가 없다" },
      { id: "d", text: "@StateObject는 reset되지 않는다" }
    ],
    correctChoiceId: "a",
    explanation: "@StateObject는 View 재생성에도 *한 인스턴스 유지*. @ObservedObject는 부모가 만든 객체를 받음.",
    relatedTopicSlugs: ["05-swiftui/state-management"]
  },
  {
    id: "objective-intermediate-state-003",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt: "iOS 17 @Observable이 ObservableObject 대비 갱신을 줄이는 메커니즘은?",
    choices: [
      { id: "a", text: "View가 *접근한 KeyPath만* 추적해 그 KeyPath 변경 시에만 body 호출" },
      { id: "b", text: "더 가벼운 thread를 사용한다" },
      { id: "c", text: "@Published 없이 전체 reset을 발행한다" },
      { id: "d", text: "View identity를 자동 안정화한다" }
    ],
    correctChoiceId: "a",
    explanation: "precise tracking. 큰 모델에 의존한 View 다수일 때 효과 큼.",
    relatedTopicSlugs: ["05-swiftui/observation-macro", "05-swiftui/state-management"]
  },

  {
    id: "objective-intermediate-view-identity-001",
    type: "objective",
    level: "intermediate",
    category: "SwiftUI",
    prompt: "ForEach에서 id: \\.self가 위험한 경우는?",
    choices: [
      { id: "a", text: "같은 값이 여러 개 있을 수 있어 diffing이 오작동" },
      { id: "b", text: "Hashable 채택이 안 되어서" },
      { id: "c", text: "성능이 너무 빠르기 때문" },
      { id: "d", text: "항상 안전하며 권장 패턴" }
    ],
    correctChoiceId: "a",
    explanation: "도메인 id를 사용하라. 같은 값 두 개면 식별 불가, 잘못된 state 보존/리셋.",
    relatedTopicSlugs: ["05-swiftui/view-identity-and-lifetime"]
  },
  {
    id: "objective-advanced-view-identity-002",
    type: "objective",
    level: "advanced",
    category: "SwiftUI",
    prompt: ".id(value) modifier의 동작은?",
    choices: [
      { id: "a", text: "value가 바뀌면 *완전히 새 view*로 취급해 state 초기화" },
      { id: "b", text: "view 이름표만 부여하고 동작은 동일" },
      { id: "c", text: "view를 메모리에 영구 고정" },
      { id: "d", text: "성능 향상만 제공" }
    ],
    correctChoiceId: "a",
    explanation: "explicit identity 교체. transition도 트리거되며 의도적으로 reset할 때 유용.",
    relatedTopicSlugs: ["05-swiftui/view-identity-and-lifetime"]
  },
  {
    id: "objective-basic-view-struct-001",
    type: "objective",
    level: "basic",
    category: "SwiftUI",
    prompt: "SwiftUI View가 struct로 설계된 결과로 옳은 것은?",
    choices: [
      { id: "a", text: "body 호출 자체는 가볍고 자주 발생해도 괜찮음" },
      { id: "b", text: "View 인스턴스가 영구 보관됨" },
      { id: "c", text: "상속을 통한 customization이 핵심" },
      { id: "d", text: "ObjC 호환이 자동 지원" }
    ],
    correctChoiceId: "a",
    explanation: "값 타입 View는 *상태 기술*에 가깝다. framework가 lifetime 관리.",
    relatedTopicSlugs: ["05-swiftui/declarative-and-view-struct"]
  },

  // ===== Architecture =====
  {
    id: "objective-intermediate-mvvm-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "MVVM에서 ViewModel이 UIKit을 import하면 안 되는 핵심 이유는?",
    choices: [
      { id: "a", text: "ViewModel을 View 프레임워크에 결합시켜 *플랫폼 독립성*과 *단위 테스트*를 잃음" },
      { id: "b", text: "성능이 떨어지기 때문" },
      { id: "c", text: "MVVM이 그것을 컴파일러 차원에서 금지하기 때문" },
      { id: "d", text: "UIKit은 thread-safe하지 않아서" }
    ],
    correctChoiceId: "a",
    explanation: "ViewModel은 *순수 도메인 로직*. UIKit/UIImage 등을 직접 다루면 SwiftUI 마이그레이션·테스트가 어려워짐.",
    relatedTopicSlugs: ["06-architecture/mvc-vs-mvvm"]
  },
  {
    id: "objective-intermediate-mvvm-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Massive View Controller를 해소하는 가장 일반적인 패턴은?",
    choices: [
      { id: "a", text: "ViewModel/Coordinator 등으로 책임 분리 + 의존성 주입" },
      { id: "b", text: "한 파일의 줄 수 제한 강제" },
      { id: "c", text: "Storyboard를 코드 UI로 전환" },
      { id: "d", text: "ARC를 끄고 수동 관리" }
    ],
    correctChoiceId: "a",
    explanation: "책임 분리 + 작은 컴포넌트 + 주입으로 view controller를 *조립자*로 슬림화.",
    relatedTopicSlugs: ["06-architecture/mvc-vs-mvvm", "06-architecture/dependency-injection"]
  },
  {
    id: "objective-intermediate-di-001",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "init 주입이 property 주입보다 선호되는 이유는?",
    choices: [
      { id: "a", text: "*불완전 초기화 상태*를 컴파일 타임에 차단 + 의존이 시그니처에 명시" },
      { id: "b", text: "초기화 시간이 빠르기 때문" },
      { id: "c", text: "ObjC 호환이 더 쉬워서" },
      { id: "d", text: "메모리 사용량이 적어서" }
    ],
    correctChoiceId: "a",
    explanation: "init 주입은 *필수 의존*을 강제. property 주입은 선택적 의존에 한정 권장.",
    relatedTopicSlugs: ["06-architecture/dependency-injection"]
  },

  // ===== Networking =====
  {
    id: "objective-basic-urlsession-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt: "URLSession.shared의 한계로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "configuration/delegate 커스터마이즈 불가 — pinning, 백그라운드 등 불가" },
      { id: "b", text: "HTTP/2를 지원하지 않는다" },
      { id: "c", text: "비동기 호출 불가" },
      { id: "d", text: "쿠키를 저장하지 않는다" }
    ],
    correctChoiceId: "a",
    explanation: "공유 인스턴스는 빠른 사용엔 좋지만 보안/백그라운드/세션별 정책엔 부적합.",
    relatedTopicSlugs: ["07-networking/urlsession"]
  },
  {
    id: "objective-intermediate-urlsession-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "background URLSession의 핵심 특징은?",
    choices: [
      { id: "a", text: "앱이 종료/백그라운드여도 OS가 작업을 이어가고 완료 시 앱을 깨움" },
      { id: "b", text: "메인 스레드를 자동으로 차단" },
      { id: "c", text: "HTTP 캐시를 비활성화" },
      { id: "d", text: "TLS 검증을 건너뜀" }
    ],
    correctChoiceId: "a",
    explanation: "discretionary 옵션으로 전력/네트워크 효율 우선 가능. 완료 핸들러 등록 후 delegate에서 호출.",
    relatedTopicSlugs: ["07-networking/urlsession", "07-networking/background-tasks-and-retry"]
  },
  {
    id: "objective-intermediate-codable-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "JSON 키가 snake_case이고 Swift는 camelCase일 때 가장 깔끔한 해결은?",
    choices: [
      { id: "a", text: "JSONDecoder.keyDecodingStrategy = .convertFromSnakeCase" },
      { id: "b", text: "CodingKeys로 모든 필드를 수동 매핑" },
      { id: "c", text: "JSON을 사전에 camelCase로 변환" },
      { id: "d", text: "Codable을 포기하고 dictionary 사용" }
    ],
    correctChoiceId: "a",
    explanation: "전체 변환 정책으로 한 줄 처리. 일부 예외만 CodingKeys로 보완.",
    relatedTopicSlugs: ["07-networking/codable"]
  },
  {
    id: "objective-advanced-auth-001",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "여러 요청이 동시에 401을 받았을 때 토큰 갱신을 한 번만 하려면?",
    choices: [
      { id: "a", text: "actor에 single-flight refresh Task를 보관하고 모든 호출이 그 Task.value를 await" },
      { id: "b", text: "각 요청이 자기 retry 후 자동 합쳐진다" },
      { id: "c", text: "DispatchSemaphore로 main thread를 차단" },
      { id: "d", text: "토큰 만료 시점을 client-side에서 추정해 사전 갱신만으로 해결" }
    ],
    correctChoiceId: "a",
    explanation: "race 방지 = single-flight 패턴. actor의 격리 + 공유 Task가 가장 자연스러움.",
    relatedTopicSlugs: ["07-networking/auth-and-token-refresh"]
  },

  // ===== Persistence =====
  {
    id: "objective-basic-keychain-001",
    type: "objective",
    level: "basic",
    category: "Networking / Persistence",
    prompt: "토큰을 UserDefaults에 저장하면 안 되는 이유는?",
    choices: [
      { id: "a", text: "평문 plist에 저장되어 탈옥/백업 검사로 노출 가능" },
      { id: "b", text: "UserDefaults는 비동기여서 동기화가 어려움" },
      { id: "c", text: "용량 제한이 있어서" },
      { id: "d", text: "기본 비활성화 상태여서" }
    ],
    correctChoiceId: "a",
    explanation: "민감 정보는 Keychain. UserDefaults는 *비밀이 아닌* 사용자 설정에만.",
    relatedTopicSlugs: ["08-persistence/userdefaults", "08-persistence/keychain"]
  },
  {
    id: "objective-intermediate-keychain-002",
    type: "objective",
    level: "intermediate",
    category: "Networking / Persistence",
    prompt: "Keychain의 kSecAttrAccessibleAfterFirstUnlock의 의미는?",
    choices: [
      { id: "a", text: "부팅 후 첫 unlock 이후엔 *잠금 상태에서도* 접근 가능 — 백그라운드 작업에 적합" },
      { id: "b", text: "항상 잠금 해제 상태에서만 접근" },
      { id: "c", text: "iCloud Keychain과 동기화" },
      { id: "d", text: "앱 삭제 시 자동 제거" }
    ],
    correctChoiceId: "a",
    explanation: "백그라운드 토큰 갱신 등에 적합. ThisDeviceOnly와 조합해 백업 미동기화 권장.",
    relatedTopicSlugs: ["08-persistence/keychain"]
  },
  {
    id: "objective-intermediate-file-001",
    type: "objective",
    level: "intermediate",
    category: "Networking / Persistence",
    prompt: "재다운로드 가능한 캐시 파일을 두기에 적합한 디렉터리는?",
    choices: [
      { id: "a", text: "Library/Caches — iCloud 미백업 + 디스크 압박 시 OS가 정리 가능" },
      { id: "b", text: "Documents — 사용자 데이터로 인식되어 백업됨" },
      { id: "c", text: "tmp — 너무 짧은 수명, 세션 단위" },
      { id: "d", text: "Application Support — 앱 내부 데이터 전용" }
    ],
    correctChoiceId: "a",
    explanation: "캐시는 Caches가 정답. Documents에 두면 iCloud 백업 시간/용량을 잡아먹음.",
    relatedTopicSlugs: ["08-persistence/file-manager", "08-persistence/storage-selection-guide"]
  },
  {
    id: "objective-advanced-coredata-001",
    type: "objective",
    level: "advanced",
    category: "Networking / Persistence",
    prompt: "Core Data에서 백그라운드 import 시 안전한 패턴은?",
    choices: [
      { id: "a", text: "performBackgroundTask로 별도 context 생성, 메인 context엔 NSManagedObjectID로 전달" },
      { id: "b", text: "viewContext를 detached Task에서 직접 사용" },
      { id: "c", text: "모든 작업을 main에서 sync로 수행" },
      { id: "d", text: "NSManagedObject를 다른 thread로 전달" }
    ],
    correctChoiceId: "a",
    explanation: "Core Data context는 thread-bound. 객체 자체 전달 대신 ID를 통한 페치.",
    relatedTopicSlugs: ["08-persistence/core-data-and-swiftdata"]
  },

  // ===== Testing =====
  {
    id: "objective-intermediate-mock-001",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt: "Singleton 의존 코드를 테스트 가능하게 만드는 가장 단순한 방법은?",
    choices: [
      { id: "a", text: "Protocol 추상화 + 생성자 주입으로 *진짜/가짜* 구현 교체" },
      { id: "b", text: "Singleton 자체를 mock 라이브러리로 swizzle" },
      { id: "c", text: "테스트마다 앱을 재시작" },
      { id: "d", text: "private 메서드를 public으로 노출" }
    ],
    correctChoiceId: "a",
    explanation: "의존성 역전 → 테스트에 Stub/Mock 주입. 가장 표준적이고 가독성 높은 방식.",
    relatedTopicSlugs: ["09-testing/mocking", "06-architecture/dependency-injection"]
  },
  {
    id: "objective-intermediate-mock-002",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt: "URLSession을 mock하는 가장 안전한 방법은?",
    choices: [
      { id: "a", text: "URLProtocol을 상속한 가짜 protocol을 session config에 등록" },
      { id: "b", text: "URLSession.shared를 swizzle" },
      { id: "c", text: "실제 서버를 띄워 테스트" },
      { id: "d", text: "Mock NSURLConnection을 만든다" }
    ],
    correctChoiceId: "a",
    explanation: "URLProtocol 가로채기로 URLSession 자체 동작은 그대로 두고 응답만 주입.",
    relatedTopicSlugs: ["09-testing/mocking"]
  },
  {
    id: "objective-advanced-test-strategy-001",
    type: "objective",
    level: "advanced",
    category: "Testing",
    prompt: "flaky 테스트의 가장 빈번한 원인 두 가지는?",
    choices: [
      { id: "a", text: "시간 의존성과 외부 자원/순서 의존성" },
      { id: "b", text: "Swift 컴파일러 버그" },
      { id: "c", text: "테스트 코드 줄 수가 길어서" },
      { id: "d", text: "XCTest 자체 버그" }
    ],
    correctChoiceId: "a",
    explanation: "Date 주입, 외부 호출 mock, 테스트 간 상태 격리가 flaky 제거의 핵심.",
    relatedTopicSlugs: ["09-testing/test-strategy", "09-testing/mocking"]
  },

  // ===== Performance =====
  {
    id: "objective-intermediate-hitch-001",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt: "60Hz 디스플레이에서 hitch가 발생하는 프레임의 기준은?",
    choices: [
      { id: "a", text: "한 프레임에 16.67ms 예산을 초과해 다음 frame을 그리지 못함" },
      { id: "b", text: "1초에 60회 이상 setNeedsLayout 호출" },
      { id: "c", text: "메모리 사용량 100MB 초과" },
      { id: "d", text: "CPU 사용률 50% 초과" }
    ],
    correctChoiceId: "a",
    explanation: "프레임 예산 = 1초/Hz. 120Hz는 8.33ms. Hitchtime ratio로 정량화.",
    relatedTopicSlugs: ["10-performance/main-thread-and-hitch", "10-performance/rendering-budget-and-hitch"]
  },
  {
    id: "objective-intermediate-image-001",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt: "큰 이미지를 표시할 때 메모리 폭증을 막는 핵심 기법은?",
    choices: [
      { id: "a", text: "표시 크기에 맞춰 downsample (kCGImageSourceThumbnailMaxPixelSize)" },
      { id: "b", text: "UIImage(named:)로 강제 캐시" },
      { id: "c", text: "모든 이미지를 PNG로 변환" },
      { id: "d", text: "shouldRasterize를 true로 설정" }
    ],
    correctChoiceId: "a",
    explanation: "원본 사이즈가 아니라 *표시 픽셀*만큼만 디코드. 메모리 비용은 디코드된 비트맵에 비례.",
    relatedTopicSlugs: ["10-performance/image-and-scroll"]
  },
  {
    id: "objective-advanced-launch-001",
    type: "objective",
    level: "advanced",
    category: "Performance",
    prompt: "cold launch에서 pre-main 단계 비용을 줄이는 가장 효과적인 방법은?",
    choices: [
      { id: "a", text: "embedded dynamic framework 수를 줄이거나 static 링크로 전환" },
      { id: "b", text: "Info.plist 항목 제거" },
      { id: "c", text: "Swift Concurrency 사용 중단" },
      { id: "d", text: "Storyboard를 코드로 전환" }
    ],
    correctChoiceId: "a",
    explanation: "dyld 단계의 bind/rebase 시간은 dylib 수에 비례. static 통합이 큰 단축 요인.",
    relatedTopicSlugs: ["10-performance/launch-time", "11-build-system/build-time-optimization"]
  },

  // ===== Network =====
  {
    id: "objective-basic-tcp-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "TCP와 UDP의 가장 본질적 차이는?",
    choices: [
      { id: "a", text: "TCP는 연결 지향/신뢰성 보장, UDP는 비연결/경량" },
      { id: "b", text: "TCP는 무선용, UDP는 유선용" },
      { id: "c", text: "TCP는 IPv6만, UDP는 IPv4만 사용" },
      { id: "d", text: "TCP가 항상 더 빠르다" }
    ],
    correctChoiceId: "a",
    explanation: "TCP는 handshake + 순서/재전송 보장. UDP는 datagram 단위 best-effort.",
    relatedTopicSlugs: ["14-network/tcp-vs-udp"]
  },
  {
    id: "objective-intermediate-tcp-002",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "TCP 3-way handshake의 메시지 순서는?",
    choices: [
      { id: "a", text: "SYN → SYN+ACK → ACK" },
      { id: "b", text: "FIN → ACK → FIN" },
      { id: "c", text: "ACK → SYN → FIN" },
      { id: "d", text: "PSH → ACK → RST" }
    ],
    correctChoiceId: "a",
    explanation: "양방향 시퀀스 번호 확립이 목표. close는 4-way (각 방향 FIN+ACK).",
    relatedTopicSlugs: ["14-network/tcp-vs-udp"]
  },
  {
    id: "objective-basic-http-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "PUT과 POST의 가장 큰 차이는?",
    choices: [
      { id: "a", text: "PUT은 멱등(idempotent), POST는 일반적으로 비멱등" },
      { id: "b", text: "PUT은 GET처럼 캐시된다" },
      { id: "c", text: "POST는 body가 없다" },
      { id: "d", text: "PUT은 HTTPS만 지원" }
    ],
    correctChoiceId: "a",
    explanation: "PUT은 같은 요청을 여러 번 보내도 결과 동일. POST는 새 자원을 생성하므로 보통 멱등 X.",
    relatedTopicSlugs: ["14-network/http-basics"]
  },
  {
    id: "objective-intermediate-http-002",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "HTTP 401과 403의 차이는?",
    choices: [
      { id: "a", text: "401 = 인증 필요/실패, 403 = 인증은 했지만 권한 없음" },
      { id: "b", text: "둘은 의미가 같고 별칭일 뿐" },
      { id: "c", text: "401은 client error, 403은 server error" },
      { id: "d", text: "403은 자동 재시도해야 한다" }
    ],
    correctChoiceId: "a",
    explanation: "401 → 로그인/토큰 갱신. 403 → 자원 접근 권한 없음. 클라이언트 분기 처리.",
    relatedTopicSlugs: ["14-network/http-basics", "07-networking/auth-and-token-refresh"]
  },
  {
    id: "objective-intermediate-https-001",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "TLS 1.3가 TLS 1.2 대비 갖는 가장 큰 이점은?",
    choices: [
      { id: "a", text: "1-RTT handshake + 강력한 cipher suite 강제" },
      { id: "b", text: "암호화 없이도 전송 가능" },
      { id: "c", text: "인증서 없이 동작" },
      { id: "d", text: "HTTP/3 전용 프로토콜" }
    ],
    correctChoiceId: "a",
    explanation: "TLS 1.3는 1 RTT(0-RTT 옵션) + AEAD cipher만 허용. 모바일 환경에 큰 이점.",
    relatedTopicSlugs: ["14-network/https-and-tls", "14-network/tls-handshake-deep"]
  },
  {
    id: "objective-advanced-tls-002",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "public key pinning이 certificate pinning보다 선호되는 이유는?",
    choices: [
      { id: "a", text: "인증서 교체 시에도 키페어 유지 시 앱 업데이트 없이 호환" },
      { id: "b", text: "키 자체가 만료되지 않기 때문" },
      { id: "c", text: "ATS 정책상 인증서 pinning은 금지" },
      { id: "d", text: "키 해시는 작아 네트워크 비용이 감소" }
    ],
    correctChoiceId: "a",
    explanation: "cert는 만료/교체가 잦지만 key는 그대로 둘 수 있어 운영 부담 감소.",
    relatedTopicSlugs: ["14-network/tls-handshake-deep", "07-networking/network-stack-and-pinning"]
  },

  // ===== Paradigms (OOP / FP / 명령형 / 선언형) =====
  {
    id: "objective-basic-oop-001",
    type: "objective",
    level: "basic",
    category: "Paradigms",
    prompt: "OOP 4원칙으로 옳게 묶인 것은?",
    choices: [
      { id: "a", text: "캡슐화 / 상속 / 다형성 / 추상화" },
      { id: "b", text: "분기 / 반복 / 호출 / 종료" },
      { id: "c", text: "값 / 참조 / 함수 / Monad" },
      { id: "d", text: "Layer / Module / Service / View" }
    ],
    correctChoiceId: "a",
    explanation: "캡슐화/상속/다형성/추상화가 정통 4원칙. Swift도 표현하지만 일부는 protocol로 대체.",
    relatedTopicSlugs: ["15-paradigms/oop"]
  },
  {
    id: "objective-intermediate-oop-002",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "SOLID의 D(IP)가 의미하는 것은?",
    choices: [
      { id: "a", text: "고수준 모듈이 저수준 구현이 아닌 *추상*에 의존" },
      { id: "b", text: "데이터를 항상 immutable로 유지" },
      { id: "c", text: "모든 클래스에 deinit을 둠" },
      { id: "d", text: "인터페이스를 가능한 크게 만든다" }
    ],
    correctChoiceId: "a",
    explanation: "DIP — Dependency Inversion. Repository protocol 의존 + Live/Mock 주입이 대표 적용.",
    relatedTopicSlugs: ["15-paradigms/oop", "06-architecture/dependency-injection"]
  },
  {
    id: "objective-advanced-oop-003",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt: "Liskov Substitution 위반의 대표 예는?",
    choices: [
      { id: "a", text: "Rectangle 슈퍼에 Square 서브 — setWidth가 height도 바꿔 슈퍼 계약 위반" },
      { id: "b", text: "private 메서드를 override한 경우" },
      { id: "c", text: "프로토콜에 default 구현을 제공한 경우" },
      { id: "d", text: "abstract class를 사용하지 않은 경우" }
    ],
    correctChoiceId: "a",
    explanation: "서브가 슈퍼와 *바꿔도 같은 동작 보장* 못 하면 LSP 위반. 모델링이 잘못된 신호.",
    relatedTopicSlugs: ["15-paradigms/oop"]
  },
  {
    id: "objective-basic-fp-001",
    type: "objective",
    level: "basic",
    category: "Paradigms",
    prompt: "순수 함수(pure function)의 두 조건은?",
    choices: [
      { id: "a", text: "참조 투명성 + 부작용 없음" },
      { id: "b", text: "비동기 + 옵셔널 반환" },
      { id: "c", text: "재귀 + 꼬리 호출 최적화" },
      { id: "d", text: "1줄 표현 + closure" }
    ],
    correctChoiceId: "a",
    explanation: "같은 입력 → 같은 출력 + 외부 상태 변경 없음. 테스트와 병렬화에 강점.",
    relatedTopicSlugs: ["15-paradigms/fp"]
  },
  {
    id: "objective-intermediate-fp-002",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "Optional의 flatMap이 map과 다른 점은?",
    choices: [
      { id: "a", text: "변환 결과가 *옵셔널을 반환*해도 중첩(Optional<Optional<T>>)을 자동 평탄화" },
      { id: "b", text: "비동기 변환을 지원" },
      { id: "c", text: "nil이면 fatalError" },
      { id: "d", text: "에러를 throws로 전파" }
    ],
    correctChoiceId: "a",
    explanation: "Monad의 flatMap = map + 평탄화. Optional/Result/Array가 같은 패턴.",
    relatedTopicSlugs: ["15-paradigms/fp", "01-swift-language/optional"]
  },
  {
    id: "objective-advanced-fp-003",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt: "Functional Core, Imperative Shell 패턴의 의미는?",
    choices: [
      { id: "a", text: "비즈니스 로직은 *순수 함수*, IO/UI/외부 효과는 *얇은 객체 셸*에 격리" },
      { id: "b", text: "UI만 함수형, 모델은 OOP로 작성" },
      { id: "c", text: "모든 메서드를 static으로 작성" },
      { id: "d", text: "Class는 final, struct는 mutating 금지" }
    ],
    correctChoiceId: "a",
    explanation: "TCA Reducer/Effect 분리가 대표 구현. 코어는 unit test로 대규모 커버 가능.",
    relatedTopicSlugs: ["15-paradigms/fp", "15-paradigms/oop-vs-fp", "06-architecture/tca"]
  },
  {
    id: "objective-intermediate-vs-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "Swift에서 *값/참조 + OOP/FP*를 직교 분리한 가이드라인은?",
    choices: [
      { id: "a", text: "정체성/공유 상태 → class/actor, 값 변환/스냅샷 → struct/enum/함수" },
      { id: "b", text: "성능이 중요한 코드는 class, 그 외는 struct" },
      { id: "c", text: "ObjC 인터롭만 class, 나머지는 모두 struct" },
      { id: "d", text: "@Observable이 있으면 무조건 struct" }
    ],
    correctChoiceId: "a",
    explanation: "객체로 *정체성*을, 값/함수로 *변환과 흐름*을 모델링하는 게 표준 Swift 가이드.",
    relatedTopicSlugs: ["15-paradigms/oop-vs-fp"]
  },
  {
    id: "objective-advanced-vs-002",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt: "동시성 안전성 측면에서 FP가 OOP 대비 유리한 이유는?",
    choices: [
      { id: "a", text: "불변 데이터엔 race 자체가 발생하지 않음" },
      { id: "b", text: "함수가 자동으로 thread-safe하게 컴파일됨" },
      { id: "c", text: "GIL 기반으로 한 번에 한 thread만 동작" },
      { id: "d", text: "Closure가 자동으로 weak 캡처됨" }
    ],
    correctChoiceId: "a",
    explanation: "불변성이 race condition의 *전제*를 무너뜨림. Sendable과 자연스럽게 결합.",
    relatedTopicSlugs: ["15-paradigms/oop-vs-fp", "03-concurrency/sendable"]
  },
  {
    id: "objective-basic-decl-001",
    type: "objective",
    level: "basic",
    category: "Paradigms",
    prompt: "명령형(imperative)과 선언형(declarative) UI 코드의 본질적 차이는?",
    choices: [
      { id: "a", text: "명령형은 *어떻게* 단계 지시, 선언형은 *무엇* 결과 기술" },
      { id: "b", text: "명령형은 UIKit, 선언형은 ObjC 기반" },
      { id: "c", text: "명령형은 동기, 선언형은 비동기" },
      { id: "d", text: "선언형은 단위 테스트가 불가능" }
    ],
    correctChoiceId: "a",
    explanation: "선언형은 *최종 상태*를 기술하고 framework가 경로를 결정. SwiftUI의 본질.",
    relatedTopicSlugs: ["15-paradigms/imperative-vs-declarative"]
  },
  {
    id: "objective-intermediate-decl-002",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "SwiftUI에서 선언형 사고가 적용된 결과로 옳은 것은?",
    choices: [
      { id: "a", text: "view = state의 함수, state 변경 시 framework가 diff로 재렌더" },
      { id: "b", text: "tableView.reloadData를 매번 호출해야 함" },
      { id: "c", text: "AutoLayout constraint를 명시적으로 다룸" },
      { id: "d", text: "delegate를 모든 컴포넌트에 직접 연결" }
    ],
    correctChoiceId: "a",
    explanation: "f(state) = UI. 상태와 UI의 일관성을 framework가 보장.",
    relatedTopicSlugs: ["15-paradigms/imperative-vs-declarative", "05-swiftui/declarative-and-view-struct"]
  },
  {
    id: "objective-advanced-decl-003",
    type: "objective",
    level: "advanced",
    category: "Paradigms",
    prompt: "선언형 모델의 *숨은 비용*으로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "identity/lifetime 책임이 framework에 위임돼 *왜 안 그려지나*를 추적해야 함" },
      { id: "b", text: "메모리 사용량이 항상 더 큼" },
      { id: "c", text: "thread 안전성이 깨짐" },
      { id: "d", text: "Swift Concurrency와 호환되지 않음" }
    ],
    correctChoiceId: "a",
    explanation: ".id, ForEach id, View 구조 안정성을 잘못 다루면 state 초기화/transition 깨짐.",
    relatedTopicSlugs: ["15-paradigms/imperative-vs-declarative", "05-swiftui/view-identity-and-lifetime"]
  },
  {
    id: "objective-intermediate-pop-001",
    type: "objective",
    level: "intermediate",
    category: "Paradigms",
    prompt: "Protocol-Oriented Programming이 OOP 상속 모델과 다른 점은?",
    choices: [
      { id: "a", text: "*수평적* 작은 protocol 다중 채택 + extension default → 결합도↓" },
      { id: "b", text: "protocol이 자동으로 thread-safe" },
      { id: "c", text: "POP은 class에만 적용 가능" },
      { id: "d", text: "상속을 컴파일러 차원에서 금지" }
    ],
    correctChoiceId: "a",
    explanation: "POP은 *능력을 조립*. 깊은 상속 트리의 fragile base class 문제를 회피.",
    relatedTopicSlugs: ["15-paradigms/oop", "01-swift-language/protocol-oriented-programming"]
  },

  // ===== Build System 시니어 =====
  {
    id: "objective-advanced-macho-001",
    type: "objective",
    level: "advanced",
    category: "Build / Release",
    prompt: "Mach-O 바이너리의 __TEXT 세그먼트의 일반적인 특성은?",
    choices: [
      { id: "a", text: "읽기 전용 + 실행 가능, 코드와 상수가 위치" },
      { id: "b", text: "읽기/쓰기 가능, 전역 변수 저장" },
      { id: "c", text: "동적 링크 정보만 저장" },
      { id: "d", text: "디버그 심볼 전용 영역" }
    ],
    correctChoiceId: "a",
    explanation: "__TEXT는 r-x. 코드(__text)와 상수 문자열(__cstring) 등. __DATA가 r/w, __LINKEDIT가 dyld 메타.",
    relatedTopicSlugs: ["11-build-system/mach-o-and-binary"]
  },
  {
    id: "objective-advanced-macho-002",
    type: "objective",
    level: "advanced",
    category: "Build / Release",
    prompt: "static library와 dynamic library의 런치 타임 차이는?",
    choices: [
      { id: "a", text: "static은 단일 바이너리로 통합되어 dyld 단계 비용 감소, dynamic은 dylib 수에 비례한 bind/rebase" },
      { id: "b", text: "둘은 동일한 비용" },
      { id: "c", text: "dynamic이 항상 더 빠르다" },
      { id: "d", text: "static은 런타임에 reload가 필요" }
    ],
    correctChoiceId: "a",
    explanation: "embedded dylib 수가 많을수록 dyld 단계 시간 증가. Release에서 static 링크가 런치 시간 단축의 큰 지렛대.",
    relatedTopicSlugs: ["11-build-system/static-vs-dynamic-libraries", "11-build-system/linker-and-dyld", "10-performance/launch-time"]
  },
  {
    id: "objective-advanced-dyld-003",
    type: "objective",
    level: "advanced",
    category: "Build / Release",
    prompt: "dyld의 rebase 단계가 하는 일은?",
    choices: [
      { id: "a", text: "ASLR로 인한 임의 주소 변환을 위해 *내부 포인터를 실제 로드 주소에 맞게 재계산*" },
      { id: "b", text: "동적 심볼을 외부 라이브러리에서 찾음" },
      { id: "c", text: "디버그 심볼을 dSYM에 작성" },
      { id: "d", text: "C++ vtable을 초기화" }
    ],
    correctChoiceId: "a",
    explanation: "rebase = 내부 절대 주소 보정. bind = 외부 심볼 해결. dyld 3+ 캐시와 chained fixups가 이 비용을 크게 줄임.",
    relatedTopicSlugs: ["11-build-system/linker-and-dyld", "11-build-system/mach-o-and-binary"]
  },
  {
    id: "objective-intermediate-framework-001",
    type: "objective",
    level: "intermediate",
    category: "Build / Release",
    prompt: "XCFramework가 fat binary 대비 갖는 강점은?",
    choices: [
      { id: "a", text: "여러 *platform/아키텍처*를 한 번들에 담아 시뮬레이터/디바이스/macOS 등을 동시에 배포" },
      { id: "b", text: "바이너리 크기가 항상 더 작다" },
      { id: "c", text: "런타임 dyld 비용이 0이 된다" },
      { id: "d", text: "Swift Package Manager 전용 포맷" }
    ],
    correctChoiceId: "a",
    explanation: "fat binary는 같은 platform의 다중 arch만. XCFramework는 platform+variant 별 slice를 갖는 정식 배포 포맷.",
    relatedTopicSlugs: ["11-build-system/framework-vs-library"]
  },

  // ===== Networking 구현 시니어 =====
  {
    id: "objective-intermediate-interceptor-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "Request Interceptor (middleware) 패턴의 핵심 이점은?",
    choices: [
      { id: "a", text: "인증/로깅/재시도 같은 *공통 관심사*를 호출부에 흩뿌리지 않고 파이프라인으로 합성" },
      { id: "b", text: "URLSession을 자동으로 비동기로 만든다" },
      { id: "c", text: "응답 캐시를 강제 활성화한다" },
      { id: "d", text: "Codable 디코딩 비용을 0으로 만든다" }
    ],
    correctChoiceId: "a",
    explanation: "Adapter/Interceptor가 요청에 토큰/헤더 첨부, 응답 후 로깅/refresh를 일관되게 적용. Alamofire의 RequestAdapter/Retrier가 대표 사례.",
    relatedTopicSlugs: ["07-networking/request-interceptor"]
  },
  {
    id: "objective-advanced-oauth-001",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "OAuth 2.0 Authorization Code flow에서 PKCE를 사용하는 이유는?",
    choices: [
      { id: "a", text: "client secret을 둘 수 없는 모바일 환경에서 *authorization code 가로채기 공격*을 방어" },
      { id: "b", text: "토큰 만료를 자동 갱신" },
      { id: "c", text: "ID token 서명을 추가" },
      { id: "d", text: "refresh token 회전을 강제" }
    ],
    correctChoiceId: "a",
    explanation: "code_verifier/code_challenge로 *code 발급-교환 사이* 가로채기를 차단. 모바일/SPA에 사실상 필수.",
    relatedTopicSlugs: ["07-networking/oauth-and-jwt"]
  },
  {
    id: "objective-advanced-jwt-002",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "JWT의 alg: none 공격에 대한 올바른 대응은?",
    choices: [
      { id: "a", text: "서버가 *알고리즘 화이트리스트*로 허용 alg를 강제하고 none을 거부" },
      { id: "b", text: "header.alg를 신뢰하고 그대로 검증" },
      { id: "c", text: "클라이언트가 JWT를 매번 재발급" },
      { id: "d", text: "payload만 사용하고 signature는 무시" }
    ],
    correctChoiceId: "a",
    explanation: "header.alg를 *그대로 신뢰*하면 공격자가 none으로 위조 가능. 서버에서 alg 화이트리스트 강제가 표준.",
    relatedTopicSlugs: ["07-networking/oauth-and-jwt"]
  },
  {
    id: "objective-intermediate-retry-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "지수 백오프에 jitter를 더하는 이유는?",
    choices: [
      { id: "a", text: "여러 클라이언트의 동시 재시도가 *thundering herd*로 몰리는 것을 방지" },
      { id: "b", text: "백오프 시간을 평균적으로 줄이기 위해" },
      { id: "c", text: "서버의 응답 캐시 hit률을 높이기 위해" },
      { id: "d", text: "TLS handshake를 생략하기 위해" }
    ],
    correctChoiceId: "a",
    explanation: "동일 timing 재시도는 서버에 폭주. full jitter (0~max) 또는 equal jitter로 분산.",
    relatedTopicSlugs: ["07-networking/retry-and-circuit-breaker", "07-networking/background-tasks-and-retry"]
  },
  {
    id: "objective-advanced-circuit-002",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "Circuit Breaker 패턴의 *half-open* 상태가 하는 역할은?",
    choices: [
      { id: "a", text: "open 후 일정 시간 뒤 *소수 요청*만 허용해 서비스 회복 여부 탐지" },
      { id: "b", text: "모든 요청을 즉시 차단" },
      { id: "c", text: "응답 캐시만 반환" },
      { id: "d", text: "재시도 횟수를 0으로 리셋" }
    ],
    correctChoiceId: "a",
    explanation: "half-open은 *probe 단계*. 성공 시 closed로, 실패 시 다시 open으로. 서버 회복과 동기화.",
    relatedTopicSlugs: ["07-networking/retry-and-circuit-breaker"]
  },
  {
    id: "objective-intermediate-apiclient-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "Generic Endpoint protocol + associatedtype Response의 강점은?",
    choices: [
      { id: "a", text: "*컴파일 타임*에 endpoint별 응답 타입을 강제해 호출부 디코딩 실수 차단" },
      { id: "b", text: "URLSession보다 빠른 실행" },
      { id: "c", text: "응답이 자동으로 캐시됨" },
      { id: "d", text: "ObjC와의 자동 호환" }
    ],
    correctChoiceId: "a",
    explanation: "type-safe API 클라이언트의 핵심. send(endpoint) → 자동으로 Endpoint.Response 반환.",
    relatedTopicSlugs: ["07-networking/api-client-design"]
  },

  // ===== Codable / JSON 시니어 =====
  {
    id: "objective-intermediate-codable-deep-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "JSONDecoder의 .convertFromSnakeCase와 CodingKeys를 함께 쓸 때 충돌하는 동작은?",
    choices: [
      { id: "a", text: "CodingKeys의 raw value가 우선 적용되어 자동 변환이 무시됨" },
      { id: "b", text: "둘 다 적용되어 키가 이중 변환됨" },
      { id: "c", text: "디코딩 시 fatalError" },
      { id: "d", text: "두 정책이 무작위로 선택" }
    ],
    correctChoiceId: "a",
    explanation: "CodingKeys 명시값이 우선. 일부 필드만 예외 처리하려면 CodingKeys를 그 필드에만 정의.",
    relatedTopicSlugs: ["07-networking/json-strategies", "07-networking/codable"]
  },
  {
    id: "objective-advanced-codable-deep-002",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "다음 중 Codable에서 *3종 Container* 분류로 옳은 것은?",
    choices: [
      { id: "a", text: "Keyed / Unkeyed / SingleValue" },
      { id: "b", text: "JSON / Plist / Binary" },
      { id: "c", text: "Encode / Decode / Validate" },
      { id: "d", text: "Synchronous / Async / Throwing" }
    ],
    correctChoiceId: "a",
    explanation: "KeyedContainer(객체), UnkeyedContainer(배열), SingleValueContainer(scalar). nested 컨테이너로 깊은 구조 탐색.",
    relatedTopicSlugs: ["07-networking/codable-deep"]
  },
  {
    id: "objective-intermediate-dto-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt: "DTO와 Domain Model을 분리하는 핵심 이유는?",
    choices: [
      { id: "a", text: "서버 schema 변경이 *도메인 코드 전체*로 전파되지 않도록 경계를 둠" },
      { id: "b", text: "DTO가 더 빠른 디코딩을 보장" },
      { id: "c", text: "Codable이 강제하는 규약" },
      { id: "d", text: "메모리 사용량 감소" }
    ],
    correctChoiceId: "a",
    explanation: "DTO는 *wire format*, Domain은 *비즈니스 규칙*. Mapper로 변환해 도메인을 외부 변경에서 격리.",
    relatedTopicSlugs: ["07-networking/dto-pattern"]
  },
  {
    id: "objective-advanced-poly-001",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt: "Discriminated Union(type 필드 기반) 디코딩에서 *향후 호환성*을 확보하는 방법은?",
    choices: [
      { id: "a", text: "알 수 없는 type 값을 .unknown 케이스로 디코딩해 forward-compatible하게 처리" },
      { id: "b", text: "type이 없으면 fatalError" },
      { id: "c", text: "type 값을 무시하고 첫 번째 변형으로 강제 디코딩" },
      { id: "d", text: "디코딩을 동기로 전환" }
    ],
    correctChoiceId: "a",
    explanation: "서버가 새 type을 추가해도 클라이언트가 깨지지 않게 *unknown 케이스 + 안전한 폴백*. 부분 실패 정책 명시.",
    relatedTopicSlugs: ["07-networking/custom-codable-polymorphism"]
  },

  // ===== Persistence 시니어 =====
  {
    id: "objective-intermediate-cache-001",
    type: "objective",
    level: "intermediate",
    category: "Networking / Persistence",
    prompt: "NSCache가 일반 Dictionary와 다른 핵심 특성은?",
    choices: [
      { id: "a", text: "메모리 압박 시 *자동으로 항목 제거*, thread-safe, total cost limit 지원" },
      { id: "b", text: "디스크에 자동 저장" },
      { id: "c", text: "key가 항상 String이어야 함" },
      { id: "d", text: "iCloud와 자동 동기화" }
    ],
    correctChoiceId: "a",
    explanation: "NSCache는 OS의 메모리 압박과 협력. Dictionary는 무한 누적. 이미지 캐시 메모리 계층에 자주 사용.",
    relatedTopicSlugs: ["08-persistence/memory-and-disk-cache"]
  },
  {
    id: "objective-advanced-cache-002",
    type: "objective",
    level: "advanced",
    category: "Networking / Persistence",
    prompt: "stale-while-revalidate (SWR) 전략의 의미는?",
    choices: [
      { id: "a", text: "캐시된 *오래된 값*을 즉시 반환하면서 *백그라운드에서 갱신*해 다음 요청에 신선한 값을 제공" },
      { id: "b", text: "캐시를 절대 무효화하지 않음" },
      { id: "c", text: "캐시가 만료될 때만 응답을 반환" },
      { id: "d", text: "모든 요청을 서버로 보내고 캐시는 보조" }
    ],
    correctChoiceId: "a",
    explanation: "체감 응답 속도 ↑ + 데이터 신선도 유지. RFC 5861. URLCache + 직접 구현 결합으로 모바일에 자주 쓰임.",
    relatedTopicSlugs: ["08-persistence/cache-strategy-and-invalidation"]
  },
  {
    id: "objective-advanced-migration-001",
    type: "objective",
    level: "advanced",
    category: "Networking / Persistence",
    prompt: "Core Data의 Progressive Migration이 *단일* Heavyweight Migration보다 유리한 경우는?",
    choices: [
      { id: "a", text: "여러 버전을 한 번에 건너뛰는 대량 데이터에서 *단계별 적용*으로 메모리/시간 부담 분산" },
      { id: "b", text: "사용자 데이터가 거의 없을 때" },
      { id: "c", text: "schema 변경이 단순 컬럼 추가일 때" },
      { id: "d", text: "iCloud 동기화를 끌 때" }
    ],
    correctChoiceId: "a",
    explanation: "v1→v2→v3→v4를 한 번에 처리 시 OOM 위험. progressive로 *각 단계 적용 + 검증* 반복.",
    relatedTopicSlugs: ["08-persistence/migration-strategy", "08-persistence/core-data-migration"]
  },
  {
    id: "objective-advanced-persistperf-001",
    type: "objective",
    level: "advanced",
    category: "Networking / Persistence",
    prompt: "Core Data 대량 insert 성능을 가장 크게 좌우하는 요소는?",
    choices: [
      { id: "a", text: "*배치 크기*와 *save 빈도*, 백그라운드 context 사용 여부" },
      { id: "b", text: "viewContext에서 동기로 실행" },
      { id: "c", text: "main thread에서 처리" },
      { id: "d", text: "fault를 미리 모두 해소" }
    ],
    correctChoiceId: "a",
    explanation: "batch insert + 백그라운드 context + 적절한 save 간격(1k~10k)이 표준. Instruments로 측정.",
    relatedTopicSlugs: ["08-persistence/persistence-performance", "08-persistence/core-data-and-swiftdata"]
  },

  // ===== Real-World iOS =====
  {
    id: "objective-basic-push-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt: "APNs에서 silent push의 목적은?",
    choices: [
      { id: "a", text: "사용자에게 *알림을 표시하지 않고* 백그라운드 fetch/sync 같은 작업을 트리거" },
      { id: "b", text: "긴급 알림을 음소거로 표시" },
      { id: "c", text: "알림 음을 무음으로 설정" },
      { id: "d", text: "iCloud 동기화 전용 채널" }
    ],
    correctChoiceId: "a",
    explanation: "content-available: 1 payload. UI 변경 없이 데이터 갱신 가능. 단 OS의 throttling 정책 인지.",
    relatedTopicSlugs: ["16-real-world/push-notification"]
  },
  {
    id: "objective-intermediate-push-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt: "Notification Service Extension의 주요 용도는?",
    choices: [
      { id: "a", text: "암호화된 payload 복호화, 동적 이미지/미디어 첨부 등 *수신 시점 변형*" },
      { id: "b", text: "푸시 토큰 발급" },
      { id: "c", text: "알림을 자동으로 닫음" },
      { id: "d", text: "알림 음을 변경" }
    ],
    correctChoiceId: "a",
    explanation: "Service Extension은 *알림 표시 직전* 동작. 30초 제한. 미디어 첨부, 번역, E2E 복호화 등.",
    relatedTopicSlugs: ["16-real-world/push-notification"]
  },
  {
    id: "objective-intermediate-deeplink-001",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt: "Universal Links가 Custom URL Scheme 대비 갖는 강점은?",
    choices: [
      { id: "a", text: "*HTTPS URL*이라 가로채기 방지 + 앱 미설치 시 자동으로 웹으로 폴백" },
      { id: "b", text: "더 짧은 URL을 사용 가능" },
      { id: "c", text: "JavaScript 없이 동작" },
      { id: "d", text: "App Store 검색에서 우선 노출" }
    ],
    correctChoiceId: "a",
    explanation: "apple-app-site-association 파일로 도메인 소유 증명. Custom scheme은 다른 앱이 가로챌 수 있고 미설치 폴백 없음.",
    relatedTopicSlugs: ["16-real-world/deep-linking-and-universal-links"]
  },
  {
    id: "objective-intermediate-flag-001",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt: "원격 feature flag fetch를 *동기로* 처리하면 안 되는 이유는?",
    choices: [
      { id: "a", text: "런치 타임 차단 + 네트워크 실패 시 앱 시작 불가 → 캐시된 값으로 시작하고 async 갱신" },
      { id: "b", text: "보안 정책상 동기 호출이 금지" },
      { id: "c", text: "flag 값이 항상 false로 초기화" },
      { id: "d", text: "OS가 자동으로 throw" }
    ],
    correctChoiceId: "a",
    explanation: "캐시된 마지막 값으로 시작 + 다음 부팅에 반영하는 *eventually consistent* 패턴이 표준.",
    relatedTopicSlugs: ["16-real-world/feature-flag-and-remote-config", "10-performance/launch-time"]
  },
  {
    id: "objective-intermediate-i18n-001",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt: "iOS 17+의 String Catalog (.xcstrings)가 기존 Localizable.strings 대비 갖는 강점은?",
    choices: [
      { id: "a", text: "*복수형/변형/주석*을 한 파일에서 시각 편집 + 자동 추출 + 미번역 추적" },
      { id: "b", text: "런타임 로딩이 더 빠름" },
      { id: "c", text: "Xcode 없이도 편집 가능" },
      { id: "d", text: "기존 strings 파일과 호환되지 않음" }
    ],
    correctChoiceId: "a",
    explanation: "WWDC 2023. plural rule(zero/one/two/few/many/other), device variant, 자동 키 추출 등. .strings도 함께 동작.",
    relatedTopicSlugs: ["16-real-world/localization-and-i18n"]
  },
  {
    id: "objective-intermediate-a11y-001",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt: "accessibilityIdentifier와 accessibilityLabel의 차이는?",
    choices: [
      { id: "a", text: "Identifier는 *UI 테스트용 안정 키*, Label은 *VoiceOver가 읽는 사용자 텍스트*" },
      { id: "b", text: "둘은 동일한 기능" },
      { id: "c", text: "Identifier는 시각 사용자용 라벨" },
      { id: "d", text: "Label은 ObjC 전용" }
    ],
    correctChoiceId: "a",
    explanation: "Identifier는 i18n에 깨지지 않는 selector용. Label은 i18n 대상. XCUITest는 Identifier로 요소를 찾는 게 안정적.",
    relatedTopicSlugs: ["16-real-world/accessibility", "09-testing/snapshot-and-ui-testing"]
  }
];

export const objectiveExamQuestions: RawExamQuestion[] = [
  ...baseObjectiveExamQuestions,
  ...quiz01Swift1,
  ...quiz01Swift2,
  ...quiz01Swift3,
  ...quiz02Memory,
  ...quiz03Concurrency,
  ...quiz04UIKit,
  ...quiz05SwiftUI,
  ...quiz06Architecture,
  ...quiz07Networking,
  ...quiz08Persistence,
  ...quiz09Testing,
  ...quiz10Performance,
  ...quiz11Build,
  ...quiz12Patterns,
  ...quiz13CS,
  ...quiz14Network,
  ...quiz15Paradigms,
  ...quiz16RealWorld,
  ...quiz17ObjC,
];
