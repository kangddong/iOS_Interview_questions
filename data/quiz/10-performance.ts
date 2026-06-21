import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ──────────────────────────────────────────────
  // image-and-scroll (add: 2)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-image-and-scroll-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "`UIImage(named:)`를 사용할 때 디코드 비용이 발생하는 시점은 언제인가요?",
    choices: [
      { id: "a", text: "이미지 파일 메타데이터를 읽는 순간" },
      { id: "b", text: "UIImage 객체가 메모리에 생성되는 순간" },
      { id: "c", text: "실제로 화면에 그려지기 직전 commit 단계" },
      { id: "d", text: "앱 실행 시 모든 리소스를 한꺼번에 로드하는 launch 단계" },
    ],
    correctChoiceId: "c",
    explanation:
      "`UIImage(named:)`는 파일 메타데이터만 가지고 있다가 화면에 그릴 때(메인 스레드 commit 직전) 비트맵으로 디코드합니다. 이 때문에 디코드 비용이 메인 스레드에 발생해 hitch로 이어집니다. 백그라운드에서 미리 디코드해 비트맵으로 캐시하는 것이 해결책입니다.",
    relatedTopicSlugs: ["10-performance/image-and-scroll"],
  },
  {
    id: "objective-c10-intermediate-image-and-scroll-002",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "셀 재사용 시 비동기로 로드한 이미지가 엉뚱한 셀에 표시되는 문제를 방지하는 올바른 방법은?",
    choices: [
      { id: "a", text: "이미지 로드를 항상 동기적으로 수행한다" },
      {
        id: "b",
        text: "셀에 token(식별자)을 저장하고, 콜백에서 현재 셀의 token과 일치하는지 확인한다",
      },
      { id: "c", text: "테이블 뷰의 스크롤을 막아 재사용이 일어나지 않도록 한다" },
      {
        id: "d",
        text: "`cellForRow` 내에서 `DispatchQueue.main.sync`로 이미지를 설정한다",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "비동기 로드 결과가 다른 row를 위해 재사용된 셀에 도달할 수 있습니다. 셀에 token(예: 아이템 ID)을 저장하고, 콜백이 도착했을 때 `cell?.token == token`을 확인해 불일치 시 무시하는 방식으로 이 문제를 방지합니다. 또는 `prepareForReuse`에서 진행 중인 요청을 cancel하는 방법도 사용합니다.",
    relatedTopicSlugs: ["10-performance/image-and-scroll"],
  },

  // ──────────────────────────────────────────────
  // instruments (add: 5)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-instruments-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "Instruments에서 '앱이 잠깐 얼어요' 증상을 조사할 때 가장 먼저 사용해야 할 도구는?",
    choices: [
      { id: "a", text: "Allocations" },
      { id: "b", text: "Leaks" },
      { id: "c", text: "Hangs" },
      { id: "d", text: "Energy" },
    ],
    correctChoiceId: "c",
    explanation:
      "Instruments의 **Hangs** 도구는 메인 스레드가 멈춘 구간을 측정합니다. '앱이 잠깐 얼어요' 같은 hang 증상은 이 도구로 메인 스레드 점유 구간과 호출 스택을 파악하는 것이 첫 번째 접근입니다.",
    relatedTopicSlugs: ["10-performance/instruments"],
  },
  {
    id: "objective-c10-basic-instruments-002",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "Instruments로 프로파일링할 때 Debug 빌드 대신 Release(Profile) 빌드를 사용해야 하는 이유는?",
    choices: [
      { id: "a", text: "Debug 빌드는 Instruments와 호환되지 않기 때문" },
      {
        id: "b",
        text: "Debug 빌드는 `-Onone`이라 최적화가 미적용되어 실제 사용자 경험과 다르기 때문",
      },
      { id: "c", text: "Debug 빌드는 dSYM 파일이 생성되지 않기 때문" },
      { id: "d", text: "Debug 빌드는 시뮬레이터에서만 실행 가능하기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "Debug 빌드는 `-Onone` 컴파일러 최적화 플래그를 사용하므로 실제 Release 빌드보다 훨씬 느립니다. 따라서 프로파일링 결과가 실제 사용자 경험과 크게 달라 잘못된 결론을 낼 수 있습니다. 항상 Release 또는 Profile 빌드로 실기기에서 측정해야 합니다.",
    relatedTopicSlugs: ["10-performance/instruments"],
  },
  {
    id: "objective-c10-intermediate-instruments-003",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "Instruments에서 **Leaks** 도구로 잡히지 않는 메모리 문제 유형은 무엇인가요?",
    choices: [
      { id: "a", text: "완전히 unreachable한 객체" },
      { id: "b", text: "retain cycle로 서로 참조하며 살아있지만 의도치 않게 보존된 객체" },
      { id: "c", text: "nil로 해제된 포인터" },
      { id: "d", text: "autorelease pool에서 해제된 임시 객체" },
    ],
    correctChoiceId: "b",
    explanation:
      "Leaks 도구는 완전히 unreachable한 객체만 감지합니다. retain cycle처럼 서로 참조해 살아있지만 의도치 않게 보존된 객체는 leak으로 분류되지 않아 Leaks에서 잡히지 않습니다. 이런 경우 Allocations로 생존 객체 수 추세를 확인하고, Memory Graph Debugger로 사이클을 시각화해야 합니다.",
    relatedTopicSlugs: ["10-performance/instruments"],
  },
  {
    id: "objective-c10-intermediate-instruments-004",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "`os_signpost`를 사용하는 가장 큰 이점은 `print`와 비교했을 때 무엇인가요?",
    choices: [
      { id: "a", text: "코드 한 줄로 더 많은 정보를 출력할 수 있다" },
      {
        id: "b",
        text: "시스템 로깅과 통합되어 Instruments에서 구간을 시각화할 수 있다",
      },
      { id: "c", text: "백그라운드 스레드에서도 안전하게 사용할 수 있다" },
      { id: "d", text: "앱 배포 빌드에서 자동으로 제거된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "`os_signpost`는 시스템 로깅 인프라(OSLog)에 통합되어, Instruments에서 내가 명명한 구간을 시각적인 타임라인으로 확인할 수 있습니다. `print`는 콘솔에만 출력하고 IO 비용이 있지만, signpost는 Instruments 트랙에 구간 길이와 위치를 정확하게 표시해 성능 병목을 쉽게 찾을 수 있습니다.",
    relatedTopicSlugs: ["10-performance/instruments"],
  },
  {
    id: "objective-c10-advanced-instruments-005",
    type: "objective",
    level: "advanced",
    category: "Performance",
    prompt:
      "Instruments Time Profiler에서 메모리 사용량이 지속적으로 증가하는데 Leaks 결과는 0입니다. 가장 가능성 높은 원인은?",
    choices: [
      { id: "a", text: "ARC가 비활성화된 레거시 코드가 포함되어 있다" },
      {
        id: "b",
        text: "캐시 무한 증가, 클로저 캡처 누적, NotificationCenter observer 해제 누락 등 unbounded growth",
      },
      { id: "c", text: "시뮬레이터에서 측정했기 때문에 수치가 부정확하다" },
      { id: "d", text: "dSYM 파일 없이 프로파일링했기 때문이다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Leaks가 0이어도 메모리가 지속 증가하는 것은 'leak'이 아닌 'unbounded growth'입니다. NSCache 한도 초과, 클로저가 외부 객체를 강하게 캡처해 해제되지 않는 경우, NotificationCenter observer가 누적되는 경우 등이 대표적입니다. Allocations 도구로 어떤 타입의 인스턴스 수가 늘어나는지 추적해야 합니다.",
    relatedTopicSlugs: ["10-performance/instruments"],
  },

  // ──────────────────────────────────────────────
  // launch-time (add: 2)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-launch-time-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt: "앱 런치 타임에서 Cold Launch가 가장 중요한 이유는 무엇인가요?",
    choices: [
      { id: "a", text: "dyld 단계가 없어서 가장 빠른 경로이기 때문" },
      { id: "b", text: "사용자가 앱을 가장 자주 체감하는 런치 유형이기 때문" },
      { id: "c", text: "MetricKit으로만 측정 가능한 유일한 런치 유형이기 때문" },
      { id: "d", text: "Warm/Hot Launch보다 언제나 더 짧기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "Cold Launch는 부팅 후 첫 실행 또는 종료 후 재실행으로 dyld, ObjC runtime, static initializer 전체를 거칩니다. Warm/Hot에 비해 가장 오래 걸리며 사용자가 자주 체감하기 때문에 면접에서도 Cold Launch 최적화가 핵심 주제입니다. iPhone 12 기준 ~400ms 이하가 권장됩니다.",
    relatedTopicSlugs: ["10-performance/launch-time"],
  },
  {
    id: "objective-c10-intermediate-launch-time-002",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "Pre-main 단계 최적화에서 ObjC `+load` 메서드 사용을 피해야 하는 이유는?",
    choices: [
      { id: "a", text: "+load는 Swift 프로젝트에서 컴파일 오류를 유발하기 때문" },
      {
        id: "b",
        text: "+load는 앱 시작 전 모든 클래스에 대해 호출되어 dyld 단계 비용을 증가시키기 때문",
      },
      { id: "c", text: "+load는 메인 스레드 이후에 실행되어 초기화 순서가 보장되지 않기 때문" },
      { id: "d", text: "+load는 iOS 15 이후 deprecated되었기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "ObjC `+load`는 앱 진입 전 dyld 단계에서 모든 클래스에 대해 호출됩니다. 클래스가 많을수록 pre-main 시간이 비례해 증가합니다. 대신 `+initialize`나 lazy initialization 패턴을 사용하면 실제로 해당 클래스가 사용될 때만 초기화 비용이 발생합니다. Swift `static let`은 lazy라 main 이후 필요 시 실행됩니다.",
    relatedTopicSlugs: ["10-performance/launch-time"],
  },

  // ──────────────────────────────────────────────
  // main-thread-and-hitch (add: 3)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-main-thread-and-hitch-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "60Hz 디스플레이에서 hitch 없이 부드러운 애니메이션을 유지하려면 메인 스레드가 한 프레임 내에 작업을 완료해야 하는 시간은?",
    choices: [
      { id: "a", text: "8.33ms" },
      { id: "b", text: "16.67ms" },
      { id: "c", text: "33.33ms" },
      { id: "d", text: "100ms" },
    ],
    correctChoiceId: "b",
    explanation:
      "60Hz 디스플레이는 초당 60프레임을 표시하므로 한 프레임 예산은 1000ms ÷ 60 ≈ 16.67ms입니다. 메인 스레드가 이 시간 안에 이벤트 처리, 레이아웃 계산, CALayer commit을 완료해야 합니다. ProMotion(120Hz) 기기에서는 예산이 절반인 8.33ms로 줄어듭니다.",
    relatedTopicSlugs: ["10-performance/main-thread-and-hitch"],
  },
  {
    id: "objective-c10-intermediate-main-thread-and-hitch-002",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "hitch와 hang의 차이를 가장 정확하게 설명한 것은?",
    choices: [
      {
        id: "a",
        text: "hitch는 GPU 문제, hang은 CPU 문제로 발생 원인이 다르다",
      },
      {
        id: "b",
        text: "hitch는 한 프레임을 놓쳐 잠깐 끊기는 것이고, hang은 메인 스레드가 수백 ms 이상 멈춰 앱이 얼어버린 느낌을 주는 것이다",
      },
      {
        id: "c",
        text: "hitch는 백그라운드 스레드에서, hang은 메인 스레드에서만 발생한다",
      },
      {
        id: "d",
        text: "hitch는 측정 불가능하고, hang만 Instruments로 감지할 수 있다",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "hitch는 한두 프레임을 놓쳐 화면이 한 번 '툭' 끊기는 현상이고, hang은 메인 스레드가 수백 ms(250ms+) 이상 멈춰 앱이 완전히 얼어버린 느낌을 주는 더 심각한 상태입니다. hang이 1초를 넘으면 OS가 watchdog 크래시를 유발할 수도 있습니다.",
    relatedTopicSlugs: ["10-performance/main-thread-and-hitch"],
  },
  {
    id: "objective-c10-advanced-main-thread-and-hitch-003",
    type: "objective",
    level: "advanced",
    category: "Performance",
    prompt:
      "SwiftUI에서 `List(items.sorted(by: { $0.date > $1.date }))` 패턴의 성능 문제와 올바른 대안은?",
    choices: [
      {
        id: "a",
        text: "sorted가 비동기 함수가 아니라 문제 없다. List 내부에서 자동 최적화된다",
      },
      {
        id: "b",
        text: "body가 호출될 때마다 정렬 연산이 반복 실행되므로, 정렬된 결과를 ViewModel/`@Observable`(iOS 17+, Swift 5.9+) store에 캐시하고 body에서는 읽기만 해야 한다",
      },
      {
        id: "c",
        text: "sorted 대신 forEach를 사용하면 body 재호출이 방지된다",
      },
      {
        id: "d",
        text: "List 대신 LazyVStack을 쓰면 sorted 비용이 자동으로 분산된다",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "SwiftUI body는 상태 변경 시마다 재호출됩니다. body 안에서 `sorted`를 직접 호출하면 매 재호출마다 정렬 연산이 수행되어 메인 스레드에 지속적인 비용이 생깁니다. 올바른 패턴은 `@Observable` store 등에서 정렬된 배열을 미리 계산해 보관하고, body에서는 단순 읽기만 수행하는 것입니다.",
    relatedTopicSlugs: ["10-performance/main-thread-and-hitch"],
  },

  // ──────────────────────────────────────────────
  // metrickit-and-crash (add: 5)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-metrickit-and-crash-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "MetricKit이 metric/진단 payload를 앱에 전달하는 주기는?",
    choices: [
      { id: "a", text: "실시간 (이벤트 발생 즉시)" },
      { id: "b", text: "1시간마다" },
      { id: "c", text: "24시간마다" },
      { id: "d", text: "앱이 포그라운드로 진입할 때마다" },
    ],
    correctChoiceId: "c",
    explanation:
      "MetricKit은 시스템이 수집한 metric과 진단 payload를 **24시간마다** 앱에 전달합니다. 실시간이 아니므로 즉각적인 crash 알림이 필요하다면 Crashlytics, Sentry 같은 서드파티 SDK를 병행 사용합니다. 단, 이러한 SDK들도 상당 부분 MetricKit 기반으로 동작합니다.",
    relatedTopicSlugs: ["10-performance/metrickit-and-crash"],
  },
  {
    id: "objective-c10-basic-metrickit-and-crash-002",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "크래시 로그를 사람이 읽을 수 있는 함수 이름/줄 번호로 변환하는 과정을 무엇이라 하나요?",
    choices: [
      { id: "a", text: "Bitcode compilation" },
      { id: "b", text: "Symbolication" },
      { id: "c", text: "App Thinning" },
      { id: "d", text: "Dead Code Stripping" },
    ],
    correctChoiceId: "b",
    explanation:
      "크래시 로그는 원래 메모리 주소와 라이브러리 이름만 포함합니다. **Symbolication**은 dSYM 파일을 사용해 이 주소를 함수 이름, 파일명, 줄 번호로 변환하는 과정입니다. `symbolicatecrash`, Xcode Organizer, 또는 `atos` 명령어로 수행할 수 있습니다.",
    relatedTopicSlugs: ["10-performance/metrickit-and-crash"],
  },
  {
    id: "objective-c10-intermediate-metrickit-and-crash-003",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "크래시 신호 코드 `0x8badf00d`가 의미하는 것은?",
    choices: [
      { id: "a", text: "dangling 포인터 접근으로 인한 메모리 오류" },
      { id: "b", text: "사용자가 직접 Force Quit한 종료" },
      { id: "c", text: "앱이 시작 시간 제한 내에 응답하지 못해 OS에 의해 종료됨" },
      { id: "d", text: "`fatalError` 또는 `assert` 실패로 인한 명시적 abort" },
    ],
    correctChoiceId: "c",
    explanation:
      "`0x8badf00d`는 'ate bad food'를 숫자로 표현한 것으로, 앱이 시작·포그라운드·백그라운드 전환 등에서 메인 스레드가 시간 제한 내에 응답하지 못해 watchdog에 의해 강제 종료된 경우입니다. **`0xbaaaaaad`는 크래시 코드가 아니라 시스템 stackshot 마커**(시스템 전체 스냅샷용)이므로 크래시 분류 시 혼동하면 안 됩니다. `0xdeadfa11`은 사용자 Force Quit, `SIGABRT`는 `fatalError`/`assert` 실패입니다.",
    relatedTopicSlugs: ["10-performance/metrickit-and-crash"],
  },
  {
    id: "objective-c10-intermediate-metrickit-and-crash-004",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "dSYM 파일을 분실했을 때 해당 빌드의 크래시 로그를 symbolicate하는 방법은?",
    choices: [
      { id: "a", text: "Instruments의 Leaks 도구로 주소를 역추적한다" },
      { id: "b", text: "App Store Connect에서 기존 빌드의 dSYM을 다운로드한다" },
      {
        id: "c",
        text: "소스 코드를 동일 설정으로 재컴파일하면 같은 dSYM이 생성된다",
      },
      { id: "d", text: "Crashlytics가 자동으로 dSYM 없이도 symbolicate한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "App Store Connect에서 해당 빌드의 dSYM 파일을 다운로드할 수 있습니다. 만약 앱 스토어에 업로드 시 dSYM을 첨부하지 않았다면 복구가 불가능하며, 그 빌드의 크래시는 영원히 unsymbolicated 상태로 남습니다. 따라서 Archive에 dSYM이 자동 포함되도록 빌드 설정을 확인하는 것이 중요합니다.",
    relatedTopicSlugs: ["10-performance/metrickit-and-crash"],
  },
  {
    id: "objective-c10-advanced-metrickit-and-crash-005",
    type: "objective",
    level: "advanced",
    category: "Performance",
    prompt:
      "Binary Size 최적화에서 `DEAD_CODE_STRIPPING = YES`와 `STRIP_INSTALLED_PRODUCT = YES`의 차이는?",
    choices: [
      {
        id: "a",
        text: "두 설정은 동일하며 중복 적용해도 효과가 없다",
      },
      {
        id: "b",
        text: "DEAD_CODE_STRIPPING은 사용되지 않는 심볼을 링크 단계에서 제거하고, STRIP_INSTALLED_PRODUCT는 바이너리에서 디버그 심볼을 분리(dSYM으로)해 제거한다",
      },
      {
        id: "c",
        text: "DEAD_CODE_STRIPPING은 Swift 코드에만, STRIP_INSTALLED_PRODUCT는 ObjC 코드에만 적용된다",
      },
      {
        id: "d",
        text: "STRIP_INSTALLED_PRODUCT는 Debug 빌드에서만 동작한다",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "`DEAD_CODE_STRIPPING = YES`는 링크 단계에서 실제로 참조되지 않는 함수/데이터 심볼을 바이너리에서 제거합니다. `STRIP_INSTALLED_PRODUCT = YES`는 디버그 심볼을 바이너리에서 분리해 dSYM 파일로 이동시켜 배포 바이너리 크기를 줄입니다. 두 설정은 서로 다른 방식으로 바이너리 크기를 줄이며 Release 빌드에서 함께 적용하는 것이 일반적입니다.",
    relatedTopicSlugs: ["10-performance/metrickit-and-crash"],
  },

  // ──────────────────────────────────────────────
  // rendering-budget-and-hitch (add: 4)
  // ──────────────────────────────────────────────
  {
    id: "objective-c10-basic-rendering-budget-and-hitch-001",
    type: "objective",
    level: "basic",
    category: "Performance",
    prompt:
      "ProMotion(120Hz) 디스플레이의 한 프레임 예산은 얼마인가요?",
    choices: [
      { id: "a", text: "16.67ms" },
      { id: "b", text: "33.33ms" },
      { id: "c", text: "8.33ms" },
      { id: "d", text: "4.17ms" },
    ],
    correctChoiceId: "c",
    explanation:
      "120Hz 디스플레이는 초당 120프레임을 표시하므로 한 프레임 예산은 1000ms ÷ 120 ≈ 8.33ms입니다. 60Hz(16.67ms)의 절반으로, 60Hz에서는 문제없던 코드가 ProMotion 기기에서 hitch로 나타날 수 있어 더 엄격한 최적화가 필요합니다.",
    relatedTopicSlugs: ["10-performance/rendering-budget-and-hitch"],
  },
  {
    id: "objective-c10-intermediate-rendering-budget-and-hitch-002",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "Hitch의 3대 원인 중 'Commit 단계 비용'이 높아지는 직접적인 원인으로 옳지 않은 것은?",
    choices: [
      { id: "a", text: "많은 CALayer 수 (셀 수 × 레이어 수)" },
      { id: "b", text: "복잡한 mask/shadow 처리" },
      { id: "c", text: "백그라운드에서 실행되는 JSON 디코딩 작업" },
      { id: "d", text: "off-screen rendering 발생" },
    ],
    correctChoiceId: "c",
    explanation:
      "Commit 단계는 `CATransaction.commit`에서 layer tree 변경 사항을 Render Server로 전송하는 과정입니다. 많은 layer 수, 복잡한 mask/shadow, off-screen rendering이 이 단계의 비용을 높입니다. 백그라운드의 JSON 디코딩은 메인 스레드 점유 원인이지 commit 단계 비용과는 직접적인 관련이 없습니다.",
    relatedTopicSlugs: ["10-performance/rendering-budget-and-hitch"],
  },
  {
    id: "objective-c10-intermediate-rendering-budget-and-hitch-003",
    type: "objective",
    level: "intermediate",
    category: "Performance",
    prompt:
      "Hitchtime Ratio를 계산하는 공식은?",
    choices: [
      { id: "a", text: "hitch 발생 횟수 ÷ 전체 프레임 수" },
      { id: "b", text: "프레임 초과 시간의 합 ÷ 총 렌더링 시간" },
      { id: "c", text: "(예산 - 실제 프레임 시간) ÷ 예산" },
      { id: "d", text: "총 렌더링 시간 ÷ 표시된 프레임 수" },
    ],
    correctChoiceId: "b",
    explanation:
      "Hitchtime Ratio = `sum(frame_overrun) / total_render_time`입니다. 각 프레임이 예산을 초과한 시간의 합을 전체 렌더링 시간으로 나눈 값으로, 사용자 체감 hitch를 정량화합니다. iOS 14+ MetricKit의 `MXAnimationMetric.scrollHitchTimeRatio` 등으로 실 사용자 디바이스에서 수집해 회귀를 감시합니다.",
    relatedTopicSlugs: ["10-performance/rendering-budget-and-hitch"],
  },
  {
    id: "objective-c10-advanced-rendering-budget-and-hitch-004",
    type: "objective",
    level: "advanced",
    category: "Performance",
    prompt:
      "메인 스레드가 막히지 않았는데도 hitch가 발생한다면 다음 중 가장 적절한 조사 도구와 원인은?",
    choices: [
      {
        id: "a",
        text: "Instruments → Leaks; retain cycle로 메모리가 해제되지 않아 발생",
      },
      {
        id: "b",
        text: "Instruments → Metal System Trace; GPU/Render Server 정체(큰 텍스처 합성, 복잡 shader 등)",
      },
      {
        id: "c",
        text: "Xcode Memory Graph Debugger; 강한 참조 사이클이 렌더링을 지연시킴",
      },
      {
        id: "d",
        text: "Instruments → Network; 느린 API 응답이 render loop를 블록함",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "메인 스레드가 정상이어도 hitch가 발생하는 경우는 Commit 단계 비용이나 GPU/Render Server 정체가 원인입니다. 특히 큰 텍스처 합성, 복잡한 shader, 메모리 압박으로 인한 텍스처 swap은 GPU 영역 문제로 **Instruments → Metal System Trace**로 확인해야 합니다. Time Profiler나 Animation Hitches만으로는 이 원인을 발견하기 어렵습니다.",
    relatedTopicSlugs: ["10-performance/rendering-budget-and-hitch"],
  },
];
