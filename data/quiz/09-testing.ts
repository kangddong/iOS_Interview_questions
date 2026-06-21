import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ─── mocking (add: 2) ───────────────────────────────────────────────────────
  {
    id: "objective-c09-intermediate-mocking-001",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "Mock, Stub, Spy, Fake의 역할 중 '호출 기록(call count 등)을 검증하는 것'이 핵심 목적인 테스트 대역은?",
    choices: [
      { id: "a", text: "Mock" },
      { id: "b", text: "Stub" },
      { id: "c", text: "Fake" },
      { id: "d", text: "Dummy" },
    ],
    correctChoiceId: "a",
    explanation:
      "Mock은 '이 메서드가 몇 번, 어떤 인자로 호출됐는가'를 검증하는 것이 핵심입니다. Stub은 미리 정해진 응답을 반환하는 역할이고, Fake는 실제처럼 동작하지만 단순한 구현(예: 인메모리 DB)이며, Dummy는 인자 채우기용으로 사용됩니다.",
    relatedTopicSlugs: ["09-testing/mocking"],
  },
  {
    id: "objective-c09-intermediate-mocking-002",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "URLSession을 protocol로 감싸지 않고 네트워크 응답을 가로채서 가짜 응답을 주입할 때 사용하는 iOS 표준 메커니즘은?",
    choices: [
      { id: "a", text: "URLSessionDelegate를 직접 구현" },
      { id: "b", text: "URLProtocol 서브클래스를 protocolClasses에 등록" },
      { id: "c", text: "URLCache를 교체해서 캐시 응답으로 대체" },
      { id: "d", text: "NSURLConnection을 대신 사용" },
    ],
    correctChoiceId: "b",
    explanation:
      "URLProtocol 서브클래스를 만들고 URLSessionConfiguration.protocolClasses에 등록하면, 실제 네트워크 연결 없이 startLoading()에서 원하는 응답(HTTPURLResponse + Data)을 client에 전달할 수 있습니다. 이렇게 하면 실제 URLSession 코드 경로를 그대로 검증할 수 있습니다.",
    relatedTopicSlugs: ["09-testing/mocking"],
  },

  // ─── snapshot-and-ui-testing (add: 4) ────────────────────────────────────
  {
    id: "objective-c09-basic-snapshot-and-ui-testing-001",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "swift-snapshot-testing에서 첫 번째 테스트 실행 시 어떤 일이 일어나는가?",
    choices: [
      { id: "a", text: "Xcode가 자동으로 기준 이미지를 네트워크에서 다운로드한다" },
      {
        id: "b",
        text: "현재 결과 이미지를 디스크(__Snapshots__/)에 저장하고 \"No reference was found... Automatically recorded snapshot\" 메시지와 함께 테스트를 실패로 표시한다",
      },
      { id: "c", text: "이미지를 메모리에만 유지하고 다음 실행 시 비교한다" },
      { id: "d", text: "테스트가 통과하지만 CI에서는 자동으로 실패한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "swift-snapshot-testing은 기준 이미지가 없을 때 첫 실행에서 현재 렌더링 결과를 __Snapshots__/ 디렉토리에 저장하면서 동시에 *테스트를 실패*로 표시합니다. 이는 의도적 동작으로, 개발자가 기록된 스냅샷을 시각적으로 확인한 뒤 git에 commit하도록 유도합니다. 이후 실행부터는 저장된 이미지와 바이트 비교를 수행합니다. `isRecording = true`로 명시적 재기록 모드도 지원합니다.",
    relatedTopicSlugs: ["09-testing/snapshot-and-ui-testing"],
  },
  {
    id: "objective-c09-intermediate-snapshot-and-ui-testing-002",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "XCUITest에서 UI 요소를 찾을 때 텍스트 라벨 대신 accessibilityIdentifier를 권장하는 주된 이유는?",
    choices: [
      { id: "a", text: "접근성 감사(Audit) API가 Identifier만 인식하기 때문" },
      {
        id: "b",
        text: "텍스트가 변경되거나 다국어 지원 시에도 테스트가 깨지지 않기 때문",
      },
      { id: "c", text: "성능이 더 빠르기 때문" },
      { id: "d", text: "Xcode 시뮬레이터에서만 텍스트 selector가 동작하지 않기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "accessibilityIdentifier는 화면에 표시되는 텍스트와 독립적입니다. 텍스트 라벨로 요소를 찾으면, UI 카피가 바뀌거나 앱이 다국어를 지원할 때 테스트가 깨집니다. Identifier를 사용하면 콘텐츠 변경에 관계없이 안정적으로 요소를 찾을 수 있습니다.",
    relatedTopicSlugs: ["09-testing/snapshot-and-ui-testing"],
  },
  {
    id: "objective-c09-intermediate-snapshot-and-ui-testing-003",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "XCUITest에서 비동기 UI(서버 응답 후 표시되는 요소)를 안정적으로 검증하기 위한 올바른 접근 방식은?",
    choices: [
      { id: "a", text: "Thread.sleep(forTimeInterval:)으로 고정 시간 대기" },
      { id: "b", text: "XCUIElement.waitForExistence(timeout:)으로 요소가 나타날 때까지 대기" },
      { id: "c", text: "XCTestExpectation 없이 즉시 assert" },
      { id: "d", text: "RunLoop.main.run(until:)으로 직접 루프를 돌림" },
    ],
    correctChoiceId: "b",
    explanation:
      "waitForExistence(timeout:)은 지정된 시간 동안 요소가 존재할 때까지 폴링하고, 나타나면 즉시 true를 반환합니다. 고정 sleep은 불필요하게 느리거나 여전히 flaky할 수 있습니다. 비동기 UI에는 반드시 명시적 동기화 메서드를 사용해야 합니다.",
    relatedTopicSlugs: ["09-testing/snapshot-and-ui-testing"],
  },
  {
    id: "objective-c09-advanced-snapshot-and-ui-testing-004",
    type: "objective",
    level: "advanced",
    category: "Testing",
    prompt:
      "Snapshot 테스트가 잡을 수 없는 회귀(regression)에 해당하는 것은?",
    choices: [
      { id: "a", text: "레이아웃 변경으로 인한 텍스트 잘림" },
      { id: "b", text: "다크 모드에서 색상이 의도치 않게 변경된 경우" },
      { id: "c", text: "버튼 탭 시 비즈니스 로직이 잘못 실행되는 경우" },
      { id: "d", text: "Dynamic Type 적용 시 폰트 크기 회귀" },
    ],
    correctChoiceId: "c",
    explanation:
      "Snapshot 테스트는 특정 시점의 UI 이미지를 비교하므로 레이아웃, 색상, 폰트 등 시각적 회귀는 잡을 수 있습니다. 그러나 '탭 후 로직 실행'처럼 인터랙션에 따른 동작이나 비즈니스 로직의 정확성은 한 시점의 이미지로는 검증할 수 없습니다. 이런 회귀는 단위 테스트나 통합 테스트로 잡아야 합니다.",
    relatedTopicSlugs: ["09-testing/snapshot-and-ui-testing"],
  },

  // ─── swift-testing (add: 5) ──────────────────────────────────────────────
  {
    id: "objective-c09-basic-swift-testing-001",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "Swift Testing에서 테스트 함수를 선언할 때 사용하는 매크로는?",
    choices: [
      { id: "a", text: "@TestCase" },
      { id: "b", text: "@Test" },
      { id: "c", text: "#test" },
      { id: "d", text: "@Suite" },
    ],
    correctChoiceId: "b",
    explanation:
      "@Test 매크로를 함수에 붙이면 Swift Testing이 해당 함수를 테스트로 인식합니다. XCTest처럼 클래스 상속이나 'test' 접두사가 필요 없습니다. @Suite는 테스트 그룹(컨테이너)을 선언할 때 사용합니다.",
    relatedTopicSlugs: ["09-testing/swift-testing"],
  },
  {
    id: "objective-c09-basic-swift-testing-002",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "Swift Testing에서 #expect와 #require의 차이점으로 올바른 설명은?",
    choices: [
      { id: "a", text: "#expect는 실패 시 테스트를 중단하고, #require는 계속 실행한다" },
      {
        id: "b",
        text: "#expect는 실패해도 계속 실행하고, #require는 실패 시 throw하여 테스트를 중단한다",
      },
      { id: "c", text: "두 매크로는 기능이 동일하며 스타일 선택이다" },
      { id: "d", text: "#require는 비동기 테스트에서만 사용 가능하다" },
    ],
    correctChoiceId: "b",
    explanation:
      "#expect는 단언이 실패해도 이후 코드가 계속 실행됩니다. #require는 실패 시 throw하여 이후 코드 실행을 중단합니다. nil 옵셔널을 언래핑해야 하는 경우처럼 이후 단계가 의미 없을 때 #require를 사용해 불필요한 크래시나 잘못된 결과를 방지합니다.",
    relatedTopicSlugs: ["09-testing/swift-testing"],
  },
  {
    id: "objective-c09-intermediate-swift-testing-003",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "Swift Testing에서 setUp/tearDown을 대체하는 권장 패턴은?",
    choices: [
      { id: "a", text: "전역 변수에 SUT를 저장하고 @beforeEach로 초기화" },
      {
        id: "b",
        text: "struct에 테스트를 묶고 init()에서 SUT를 초기화 (각 테스트마다 새 인스턴스)",
      },
      { id: "c", text: "class XCTestCase를 상속하고 setUp()을 override" },
      { id: "d", text: "@Suite에 setup 클로저를 전달" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift Testing에서는 struct로 테스트를 묶고 init()에서 SUT를 초기화합니다. 각 @Test 함수 실행 시 struct의 새 인스턴스가 생성되므로 자연스럽게 테스트 격리가 보장됩니다. **struct에는 deinit이 없으므로** tearDown이 꼭 필요하다면 suite를 `final class`로 바꿔 `deinit`을 활용하거나, RAII helper(예: `defer` 또는 disposable wrapper)를 두면 됩니다. XCTestCase 상속은 Swift Testing이 아닌 XCTest 방식입니다.",
    relatedTopicSlugs: ["09-testing/swift-testing"],
  },
  {
    id: "objective-c09-intermediate-swift-testing-004",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "Swift Testing의 parameterized test에서 @Test(arguments:)를 사용하면 각 케이스는 어떻게 실행되는가?",
    choices: [
      { id: "a", text: "모든 케이스가 하나의 테스트로 순차 실행되어 첫 실패 시 중단" },
      {
        id: "b",
        text: "각 케이스가 독립된 별도 테스트로 실행되어 어느 케이스가 실패했는지 정확히 표시",
      },
      { id: "c", text: "케이스들이 병렬 실행되지 않고 반드시 직렬로만 처리" },
      { id: "d", text: "arguments가 2개 이상이면 컴파일 오류 발생" },
    ],
    correctChoiceId: "b",
    explanation:
      "@Test(arguments:)의 각 케이스는 별도의 독립 테스트로 실행됩니다. 따라서 특정 케이스만 실패해도 다른 케이스는 계속 실행되고, Test 결과에서 어느 인자 조합에서 실패했는지 정확히 확인할 수 있습니다. XCTest의 forEach 반복과 달리 일급 시민으로 지원됩니다.",
    relatedTopicSlugs: ["09-testing/swift-testing"],
  },
  {
    id: "objective-c09-advanced-swift-testing-005",
    type: "objective",
    level: "advanced",
    category: "Testing",
    prompt:
      "Swift Testing이 기본적으로 병렬 실행을 사용할 때, 테스트 간 공유 상태가 있으면 어떻게 처리해야 하는가?",
    choices: [
      { id: "a", text: "공유 상태를 @MainActor로 보호하면 자동으로 직렬화된다" },
      { id: "b", text: ".serialized trait을 적용하여 직렬 실행을 명시한다" },
      { id: "c", text: "Swift Testing은 공유 상태를 자동으로 감지하고 직렬화한다" },
      { id: "d", text: "테스트를 XCTest로 마이그레이션하여 병렬 실행을 피한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift Testing은 기본으로 병렬 실행을 합니다. 테스트 간 공유 상태가 있으면 race condition으로 flaky 테스트가 됩니다. 이때 @Suite나 @Test에 .serialized trait을 적용하면 해당 suite/test가 직렬로 실행됩니다. 근본적으로는 각 테스트를 독립적으로 만드는 것이 권장됩니다.",
    relatedTopicSlugs: ["09-testing/swift-testing"],
  },

  // ─── test-strategy (add: 4) ──────────────────────────────────────────────
  {
    id: "objective-c09-basic-test-strategy-001",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "테스트 피라미드(Test Pyramid)에서 실무 권장 비율로 올바른 것은?",
    choices: [
      { id: "a", text: "Unit 10% / Integration 30% / E2E 60%" },
      { id: "b", text: "Unit 70~80% / Integration 15~25% / E2E 5~10%" },
      { id: "c", text: "Unit 50% / Integration 50% / E2E 0%" },
      { id: "d", text: "모든 테스트를 E2E로만 작성" },
    ],
    correctChoiceId: "b",
    explanation:
      "테스트 피라미드 기준 실무 권장 비율은 Unit 70~80%, Integration 15~25%, E2E 5~10%입니다. 단위 테스트가 가장 빠르고 안정적이므로 다수를 차지하고, E2E는 느리고 flaky 위험이 크므로 핵심 happy path 몇 개에만 한정합니다. 비율은 도메인 특성에 따라 조정 가능합니다.",
    relatedTopicSlugs: ["09-testing/test-strategy"],
  },
  {
    id: "objective-c09-intermediate-test-strategy-002",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "Flaky 테스트의 원인으로 가장 거리가 먼 것은?",
    choices: [
      { id: "a", text: "Date()나 sleep에 직접 의존하는 시간 의존 코드" },
      { id: "b", text: "다른 테스트가 남긴 전역 상태를 참조" },
      { id: "c", text: "메서드 이름을 test로 시작하지 않은 경우" },
      { id: "d", text: "실제 네트워크 호출을 하는 테스트" },
    ],
    correctChoiceId: "c",
    explanation:
      "Flaky 테스트의 주요 원인은 시간 의존성, 공유 상태, 실제 네트워크/외부 리소스 의존, 비결정적 정렬 등입니다. 메서드 이름이 'test'로 시작하지 않으면 XCTest에서 실행 자체가 안 되므로 flaky와는 무관합니다.",
    relatedTopicSlugs: ["09-testing/test-strategy"],
  },
  {
    id: "objective-c09-intermediate-test-strategy-003",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "코드 커버리지 100%를 목표로 삼는 것에 대한 올바른 시각은?",
    choices: [
      { id: "a", text: "100% 커버리지는 모든 버그가 없음을 보장하므로 반드시 달성해야 한다" },
      {
        id: "b",
        text: "100%를 목표로 하면 잘못된 인센티브가 생기고, 위험 영역에 집중하는 것이 현실적이다",
      },
      { id: "c", text: "커버리지는 테스트 품질과 관련이 없으므로 측정하지 않는다" },
      { id: "d", text: "커버리지 도구는 성능 저하가 크므로 CI에서 항상 비활성화해야 한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "100% 커버리지는 달성 가능하지만, 의미 없는 테스트를 양산해 잘못된 인센티브를 만들 수 있습니다. 실무에서는 결제, 인증, 데이터 변환처럼 위험하고 변경이 잦은 핫스팟 영역을 집중 커버(70~80%)하고, 안정적인 유틸 코드는 50% 수준도 현실적입니다.",
    relatedTopicSlugs: ["09-testing/test-strategy"],
  },
  {
    id: "objective-c09-advanced-test-strategy-004",
    type: "objective",
    level: "advanced",
    category: "Testing",
    prompt:
      "Integration Test에서 Core Data를 사용할 때 실제 디스크 I/O를 피하면서 동일 인터페이스를 유지하는 권장 방법은?",
    choices: [
      { id: "a", text: "NSPersistentContainer 대신 NSManagedObject를 직접 인스턴스화" },
      {
        id: "b",
        text: "NSInMemoryStoreType을 사용해 인메모리 Core Data 스택을 구성",
      },
      { id: "c", text: "SQLite 파일 경로를 /tmp로 변경해 테스트 후 삭제" },
      { id: "d", text: "XCTest는 Core Data를 지원하지 않으므로 별도 플랫폼이 필요" },
    ],
    correctChoiceId: "b",
    explanation:
      "NSPersistentStoreDescription의 타입을 NSInMemoryStoreType으로 설정하면 디스크를 전혀 건드리지 않는 인메모리 Core Data 스택을 만들 수 있습니다. 앱 코드는 NSManagedObjectContext를 그대로 사용하므로 인터페이스 변경 없이 실제 Core Data 로직을 빠르게 테스트할 수 있습니다.",
    relatedTopicSlugs: ["09-testing/test-strategy"],
  },

  // ─── xctest (add: 5) ─────────────────────────────────────────────────────
  {
    id: "objective-c09-basic-xctest-001",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "XCTest에서 setUp()과 tearDown()이 호출되는 시점으로 올바른 것은?",
    choices: [
      { id: "a", text: "setUp은 클래스 로드 시 한 번, tearDown은 클래스 해제 시 한 번" },
      {
        id: "b",
        text: "setUp과 tearDown은 각 테스트 메서드 실행 전후마다 각각 한 번씩 호출",
      },
      { id: "c", text: "setUp은 첫 번째 테스트 전에만, tearDown은 마지막 테스트 후에만" },
      { id: "d", text: "setUp과 tearDown은 테스트가 실패할 때만 호출" },
    ],
    correctChoiceId: "b",
    explanation:
      "XCTest의 setUp()과 tearDown()은 각 테스트 메서드마다 실행 전/후에 각각 호출됩니다. 이를 통해 테스트 간 격리를 보장합니다. 한 테스트에서 SUT 상태가 오염되더라도 다음 테스트는 tearDown으로 정리되고 setUp으로 새로 초기화된 상태에서 시작합니다.",
    relatedTopicSlugs: ["09-testing/xctest"],
  },
  {
    id: "objective-c09-basic-xctest-002",
    type: "objective",
    level: "basic",
    category: "Testing",
    prompt:
      "@testable import를 사용하는 목적은 무엇인가?",
    choices: [
      { id: "a", text: "private 멤버까지 테스트 타깃에서 접근 가능하게 한다" },
      { id: "b", text: "internal 멤버까지 테스트 타깃에서 접근 가능하게 한다" },
      { id: "c", text: "테스트 실행 속도를 높이기 위한 컴파일러 힌트다" },
      { id: "d", text: "외부 모듈의 extension을 자동으로 포함시킨다" },
    ],
    correctChoiceId: "b",
    explanation:
      "@testable import는 해당 모듈의 internal 접근 수준 멤버를 테스트 타깃에서 접근할 수 있게 해줍니다. private 멤버는 여전히 접근 불가합니다. 이를 통해 public API를 통해서만이 아니라 internal 로직도 직접 테스트할 수 있습니다.",
    relatedTopicSlugs: ["09-testing/xctest"],
  },
  {
    id: "objective-c09-intermediate-xctest-003",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "XCTest에서 콜백 기반 비동기 코드를 테스트하기 위해 XCTestExpectation을 사용할 때, fulfill()을 호출하지 않으면 어떻게 되는가?",
    choices: [
      { id: "a", text: "테스트가 즉시 통과한다" },
      { id: "b", text: "wait(for:timeout:)의 timeout 후 테스트가 실패한다" },
      { id: "c", text: "컴파일 오류가 발생한다" },
      { id: "d", text: "다음 테스트가 시작될 때 자동으로 fulfill된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "XCTestExpectation은 wait(for:timeout:)에서 지정한 시간 내에 fulfill()이 호출되지 않으면 timeout으로 테스트를 실패 처리합니다. 반대로 fulfill()이 두 번 호출되면 expectedFulfillmentCount 설정에 따라 오류가 발생할 수 있습니다.",
    relatedTopicSlugs: ["09-testing/xctest"],
  },
  {
    id: "objective-c09-intermediate-xctest-004",
    type: "objective",
    level: "intermediate",
    category: "Testing",
    prompt:
      "given-when-then 패턴을 XCTest에서 사용하는 주된 목적은?",
    choices: [
      { id: "a", text: "테스트 실행 순서를 보장하기 위한 XCTest 내장 기능" },
      {
        id: "b",
        text: "테스트 코드를 '사전 조건 / 동작 / 검증'으로 명확히 구분해 읽기 쉬운 명세를 만들기 위한 컨벤션",
      },
      { id: "c", text: "XCTest가 given/when/then 키워드를 자동 파싱해 리포트를 생성하기 때문" },
      { id: "d", text: "Swift Testing으로 마이그레이션할 때 필수 전제조건" },
    ],
    correctChoiceId: "b",
    explanation:
      "given-when-then은 XCTest의 기술적 기능이 아닌 코드 구성 컨벤션입니다. given은 사전 조건 설정, when은 테스트 대상 동작 실행, then은 결과 검증을 담당합니다. 이렇게 구분하면 테스트가 '읽기 쉬운 행동 명세'가 되어 유지보수성이 높아집니다.",
    relatedTopicSlugs: ["09-testing/xctest"],
  },
  {
    id: "objective-c09-advanced-xctest-005",
    type: "objective",
    level: "advanced",
    category: "Testing",
    prompt:
      "XCTest의 measure { } 블록을 사용한 성능 테스트를 CI 환경에서 실행할 때 주의해야 할 점은?",
    choices: [
      { id: "a", text: "measure 블록은 CI에서 자동으로 비활성화되므로 별도 설정이 필요 없다" },
      {
        id: "b",
        text: "CI 서버 환경은 노이즈가 커서 일관된 기준값 측정이 어려우므로 별도 환경에서 베이스라인을 관리하는 것이 권장된다",
      },
      { id: "c", text: "measure 블록은 시뮬레이터에서만 동작하므로 CI에서는 사용 불가" },
      { id: "d", text: "measure 블록은 단 한 번만 실행하고 결과를 저장하므로 항상 신뢰할 수 있다" },
    ],
    correctChoiceId: "b",
    explanation:
      "measure { } 블록은 내부적으로 여러 번 실행해 평균과 표준편차를 측정합니다. CI 서버는 동시에 다른 빌드가 실행되거나 하드웨어 부하가 일정하지 않아 노이즈가 크므로, 베이스라인(기준값)이 환경마다 달라 거짓 실패가 자주 발생합니다. 성능 테스트는 전용 환경(맥 미니, 일정 사양 머신)에서 별도 스킴으로 관리하는 것이 권장됩니다.",
    relatedTopicSlugs: ["09-testing/xctest"],
  },
];
