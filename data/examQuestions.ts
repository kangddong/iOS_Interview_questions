import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const objectiveExamQuestions: RawExamQuestion[] = [
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
  }
];
