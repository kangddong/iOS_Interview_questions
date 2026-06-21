import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── clean-architecture (5) ────────────────────────────────────────────────
  {
    id: "objective-c06-basic-clean-architecture-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Clean Architecture에서 '안쪽 레이어는 바깥쪽을 모른다'는 규칙에 따를 때, Domain 레이어가 의존해도 되는 것은?",
    choices: [
      { id: "a", text: "URLSession" },
      { id: "b", text: "CoreData" },
      { id: "c", text: "Foundation" },
      { id: "d", text: "UIKit" },
    ],
    correctChoiceId: "c",
    explanation:
      "Clean Architecture에서 Domain 레이어는 외부 프레임워크에 의존하면 안 됩니다. Foundation은 Swift 표준 기반 라이브러리에 가까워 Domain에서도 사용할 수 있습니다. URLSession·CoreData는 Data 레이어, UIKit은 Presentation 레이어 도구입니다.",
    relatedTopicSlugs: ["06-architecture/clean-architecture"],
  },
  {
    id: "objective-c06-intermediate-clean-architecture-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Repository 패턴에서 의존성 역전(DIP)을 올바르게 적용한 구조는?",
    choices: [
      { id: "a", text: "Domain이 URLSession을 직접 import하여 데이터를 받는다" },
      { id: "b", text: "Domain이 UserRepository protocol을 정의하고, Data 레이어가 이를 구현한다" },
      { id: "c", text: "Presentation이 UserRepositoryImpl을 직접 생성하여 사용한다" },
      { id: "d", text: "UseCase가 CoreData NSManagedObject를 직접 반환한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "DIP(의존성 역전 원칙)에 따라 Domain은 추상(protocol)만 정의하고, 구체 구현은 Data 레이어가 담당합니다. 이렇게 하면 URLSession·CoreData를 교체해도 Domain 코드는 변경되지 않습니다.",
    relatedTopicSlugs: ["06-architecture/clean-architecture"],
  },
  {
    id: "objective-c06-intermediate-clean-architecture-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "UseCase가 가장 가치를 발휘하는 상황은?",
    choices: [
      { id: "a", text: "단순 CRUD 하나만 수행하는 화면" },
      { id: "b", text: "여러 Repository를 조합해 흐름을 조율해야 하는 경우" },
      { id: "c", text: "UI 애니메이션을 처리해야 하는 경우" },
      { id: "d", text: "하나의 데이터 소스에서 단순 조회만 하는 경우" },
    ],
    correctChoiceId: "b",
    explanation:
      "UseCase는 도메인 규칙의 실행 흐름을 표현합니다. 단순 CRUD는 ViewModel에서 Repository를 직접 호출해도 되지만, 여러 Repository를 조합하거나 복잡한 비즈니스 분기가 필요할 때 UseCase에 캡슐화하면 VM이 얇아지고 테스트가 쉬워집니다.",
    relatedTopicSlugs: ["06-architecture/clean-architecture"],
  },
  {
    id: "objective-c06-basic-clean-architecture-004",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Clean Architecture에서 의존 방향이 올바른 것은?",
    choices: [
      { id: "a", text: "Domain → Presentation → Data" },
      { id: "b", text: "Presentation → UseCase → Domain ← Data" },
      { id: "c", text: "Data → Domain → UseCase → Presentation" },
      { id: "d", text: "UseCase → Domain → Data → Presentation" },
    ],
    correctChoiceId: "b",
    explanation:
      "Clean Architecture에서 의존은 바깥(Presentation/Data) → 안(Domain)으로만 흐릅니다. Presentation과 Data는 모두 Domain을 알지만, Domain은 어느 쪽도 알지 못합니다. Data가 Domain protocol을 구현(implements)하는 화살표가 역방향처럼 보이지만 이것이 의존성 역전입니다.",
    relatedTopicSlugs: ["06-architecture/clean-architecture"],
  },
  {
    id: "objective-c06-advanced-clean-architecture-005",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "SwiftUI에서 Domain 엔티티를 @Observable로 만드는 것의 문제점은?",
    choices: [
      { id: "a", text: "Codable 채택이 불가능해진다" },
      { id: "b", text: "Domain이 SwiftUI 프레임워크에 종속되어 순수성을 잃는다" },
      { id: "c", text: "@Observable은 class에만 적용되므로 struct 엔티티가 ref 타입이 된다" },
      { id: "d", text: "b와 c 모두" },
    ],
    correctChoiceId: "d",
    explanation:
      "@Observable은 SwiftUI(Observation 프레임워크)에 종속되므로 Domain이 Presentation 계층 기술에 의존하게 됩니다. 또한 @Observable은 class 전용이라 struct 엔티티를 class로 바꿔야 하는 부작용도 있습니다. Domain은 순수 Swift 타입으로 두고 ViewModel에서 @Observable 래핑하는 것이 권장됩니다.",
    relatedTopicSlugs: ["06-architecture/clean-architecture"],
  },

  // ── coordinator (5) ──────────────────────────────────────────────────────
  {
    id: "objective-c06-basic-coordinator-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Coordinator 패턴을 사용하는 주된 이유는?",
    choices: [
      { id: "a", text: "View Controller의 화면 전환 책임을 별도 객체로 분리하기 위해" },
      { id: "b", text: "네트워크 요청을 병렬 처리하기 위해" },
      { id: "c", text: "데이터 모델을 뷰에 바인딩하기 위해" },
      { id: "d", text: "Core Data 스택을 초기화하기 위해" },
    ],
    correctChoiceId: "a",
    explanation:
      "Coordinator 패턴은 ViewController가 직접 present/push를 호출하면 생기는 재사용성 저하, 흐름 분기 분산, 딥링크 처리 어려움 등을 해결하기 위해 화면 전환 책임을 별도 객체(Coordinator)에 위임합니다.",
    relatedTopicSlugs: ["06-architecture/coordinator"],
  },
  {
    id: "objective-c06-intermediate-coordinator-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Coordinator가 자식 Coordinator를 children 배열로 보유하는 이유는?",
    choices: [
      { id: "a", text: "딥링크 URL을 파싱하기 위해" },
      { id: "b", text: "ARC에 의해 자식 coordinator가 해제되지 않도록 강한 참조를 유지하기 위해" },
      { id: "c", text: "UINavigationController의 스택과 동기화하기 위해" },
      { id: "d", text: "SwiftUI의 NavigationPath와 연동하기 위해" },
    ],
    correctChoiceId: "b",
    explanation:
      "Coordinator 객체는 누군가 강하게 참조하지 않으면 ARC에 의해 즉시 해제됩니다. 부모가 children 배열에 자식을 보관함으로써 라이프타임을 관리하고, 완료 콜백에서 배열에서 제거해 메모리 누수를 방지합니다.",
    relatedTopicSlugs: ["06-architecture/coordinator"],
  },
  {
    id: "objective-c06-intermediate-coordinator-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "SwiftUI에서 Coordinator 대신 주로 사용하는 라우팅 방법은?",
    choices: [
      { id: "a", text: "UINavigationController를 SwiftUI 뷰에 embed" },
      { id: "b", text: "Router 객체 + NavigationPath / sheet state" },
      { id: "c", text: "NotificationCenter를 통한 화면 전환" },
      { id: "d", text: "Storyboard segue" },
    ],
    correctChoiceId: "b",
    explanation:
      "SwiftUI는 iOS 16+에서 NavigationStack과 path 기반 라우팅을 지원합니다. @Observable Router가 NavigationPath와 sheet 상태를 소유하고, 뷰가 이를 바인딩해 화면을 전환하는 방식이 SwiftUI 관용적 패턴입니다.",
    relatedTopicSlugs: ["06-architecture/coordinator"],
  },
  {
    id: "objective-c06-basic-coordinator-004",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Coordinator 패턴에서 ViewController가 다음 화면을 결정하지 않도록 하는 방법으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "VC 내부에서 AppCoordinator.shared를 직접 호출" },
      { id: "b", text: "VC에서 closure/delegate로 이벤트만 외부에 알리고, Coordinator가 결정" },
      { id: "c", text: "VC에서 pushViewController를 호출하되 타겟 VC를 주입받음" },
      { id: "d", text: "NotificationCenter로 다음 화면 이름을 broadcast" },
    ],
    correctChoiceId: "b",
    explanation:
      "VC는 '로그인 버튼이 눌렸다'는 이벤트만 closure 또는 delegate를 통해 외부에 알립니다. 어떤 화면으로 이동할지는 Coordinator가 결정합니다. 이렇게 하면 VC가 컨텍스트를 몰라도 되어 재사용성이 높아집니다.",
    relatedTopicSlugs: ["06-architecture/coordinator"],
  },
  {
    id: "objective-c06-advanced-coordinator-005",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "딥링크 처리 시 Coordinator 패턴의 이점으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "URL 파싱을 URLSession이 자동으로 수행해준다" },
      { id: "b", text: "모든 화면 전환 진입점이 Coordinator에 집중되어 있어 딥링크를 한 곳에서 처리할 수 있다" },
      { id: "c", text: "딥링크 시 애니메이션이 자동으로 비활성화된다" },
      { id: "d", text: "UIScene이 자동으로 Coordinator를 생성해준다" },
    ],
    correctChoiceId: "b",
    explanation:
      "화면 전환 책임이 Coordinator에 집중되어 있으므로, AppDelegate/SceneDelegate에서 받은 딥링크 URL을 AppCoordinator 한 곳으로 전달하기만 하면 됩니다. VC 내부에 흩어진 구조에서는 같은 화면 진입을 어디서 진입하든 동일하게 보장하기가 어렵습니다.",
    relatedTopicSlugs: ["06-architecture/coordinator"],
  },

  // ── dependency-injection (1) ──────────────────────────────────────────────
  {
    id: "objective-c06-intermediate-dependency-injection-001",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Service Locator 패턴과 Dependency Injection(DI)의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "Service Locator는 외부에서 명시적으로 의존성을 주입하고, DI는 내부에서 컨테이너를 조회한다" },
      { id: "b", text: "DI는 외부에서 의존성을 명시적으로 받고, Service Locator는 내부에서 컨테이너를 조회한다" },
      { id: "c", text: "둘 다 싱글턴을 사용하므로 테스트 격리가 동일하게 어렵다" },
      { id: "d", text: "Service Locator는 생성자 주입만 가능하다" },
    ],
    correctChoiceId: "b",
    explanation:
      "DI는 호출자가 필요한 의존성을 외부에서 명시적으로 받아(생성자·프로퍼티·메서드 주입) 의존성이 드러납니다. Service Locator는 객체 내부에서 컨테이너를 조회하므로 숨은 의존성이 생기고 테스트 격리가 어렵습니다.",
    relatedTopicSlugs: ["06-architecture/dependency-injection"],
  },

  // ── modularization (4) ────────────────────────────────────────────────────
  {
    id: "objective-c06-basic-modularization-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "iOS 앱 모듈화의 주된 이점이 아닌 것은?",
    choices: [
      { id: "a", text: "변경된 모듈만 재빌드하여 빌드 시간 단축" },
      { id: "b", text: "의존 방향을 컴파일 타임에 강제" },
      { id: "c", text: "런타임에서 모듈 간 동적 교체가 자동으로 이루어짐" },
      { id: "d", text: "팀 단위 소유권 및 책임 분리" },
    ],
    correctChoiceId: "c",
    explanation:
      "모듈화는 빌드 시간 단축, 의존 방향 컴파일 타임 강제, 소유권 분리, 테스트 격리 등의 이점을 줍니다. 런타임에서 모듈을 자동으로 동적 교체하는 기능은 모듈화 자체의 이점이 아닙니다.",
    relatedTopicSlugs: ["06-architecture/modularization"],
  },
  {
    id: "objective-c06-intermediate-modularization-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "아래 모듈 구조에서 Feature_Login이 직접 import해서는 안 되는 모듈은?\n\nApp → Feature_Login, Feature_Home, DomainKit, DataKit, DesignSystem",
    choices: [
      { id: "a", text: "DomainKit" },
      { id: "b", text: "DesignSystem" },
      { id: "c", text: "Feature_Home" },
      { id: "d", text: "CoreUtilities" },
    ],
    correctChoiceId: "c",
    explanation:
      "Feature 모듈 간 직접 import는 금지됩니다. Feature_Login이 Feature_Home을 직접 의존하면 모듈 간 결합이 생겨 한쪽 변경이 다른 쪽 재빌드를 유발합니다. 공통 의존은 DomainKit 같은 상위 모듈로 끌어올려야 합니다.",
    relatedTopicSlugs: ["06-architecture/modularization"],
  },
  {
    id: "objective-c06-intermediate-modularization-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Static 모듈과 Dynamic 모듈 중 앱 런치 타임을 줄이려면 어느 것을 기본으로 선택해야 하는가?",
    choices: [
      { id: "a", text: "Dynamic — dylib가 공유 메모리를 사용하기 때문에" },
      { id: "b", text: "Static — dyld 단계에서 로드해야 할 dylib가 없으므로 런치 비용이 낮음" },
      { id: "c", text: "CocoaPods — 성숙한 도구라 자동 최적화됨" },
      { id: "d", text: "차이 없음 — Xcode가 자동으로 최적화함" },
    ],
    correctChoiceId: "b",
    explanation:
      "Static 모듈은 바이너리에 링크 타임에 포함되어 런치 시 dyld가 동적 라이브러리를 로드하는 단계가 없습니다. Dynamic 모듈은 런치 시 dyld 로드 비용이 추가됩니다. 런치 타임 최적화가 중요하면 Release 빌드에서 Static을 기본으로 사용합니다.",
    relatedTopicSlugs: ["06-architecture/modularization"],
  },
  {
    id: "objective-c06-advanced-modularization-004",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "모놀리식 앱을 모듈화로 마이그레이션할 때 올바른 순서는?",
    choices: [
      { id: "a", text: "Feature 모듈 먼저 분리 → Domain → Utilities" },
      { id: "b", text: "말단 leaf(Utilities, DesignSystem) → Domain → Data → Feature 순서로 분리" },
      { id: "c", text: "App 진입점부터 분리 후 하위 모듈로 내려감" },
      { id: "d", text: "한 번에 모든 모듈을 동시에 생성" },
    ],
    correctChoiceId: "b",
    explanation:
      "모놀리스 마이그레이션은 의존성이 없는 말단(leaf) 모듈부터 분리하는 것이 안전합니다. Utilities → DesignSystem → Domain → Data → Feature 순서로 진행하면 각 단계에서 컴파일 오류가 최소화되고, 한 번에 전체를 바꾸려는 시도보다 위험이 줄어듭니다.",
    relatedTopicSlugs: ["06-architecture/modularization"],
  },

  // ── module-boundary-design (5) ────────────────────────────────────────────
  {
    id: "objective-c06-basic-module-boundary-design-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Interface 모듈과 Impl 모듈을 분리하는 가장 큰 이점은?",
    choices: [
      { id: "a", text: "앱 바이너리 크기가 줄어든다" },
      { id: "b", text: "Feature 모듈이 Impl 변경 시 재컴파일되지 않아 빌드 시간이 줄어든다" },
      { id: "c", text: "Xcode 자동완성이 더 빨라진다" },
      { id: "d", text: "TestFlight 배포가 자동화된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Feature는 Interface(protocol, value type)에만 의존하므로 Impl(네트워크·DB 구현)이 변경되어도 Feature를 재컴파일할 필요가 없습니다. 또한 테스트 시 Mock을 Interface에 맞게 주입하면 됩니다.",
    relatedTopicSlugs: ["06-architecture/module-boundary-design"],
  },
  {
    id: "objective-c06-intermediate-module-boundary-design-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "모듈 경계 설계에서 public surface를 최소화해야 하는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "public 타입은 Swift 컴파일러가 최적화하지 않기 때문" },
      { id: "b", text: "한 번 public이 되면 변경 시 하위 호환성 부담이 생기므로" },
      { id: "c", text: "public 함수는 Instruments에서 측정할 수 없기 때문" },
      { id: "d", text: "SwiftUI Preview가 public 타입을 지원하지 않기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "모듈에서 노출된 public API는 클라이언트 모듈이 사용하기 시작하면 변경 비용이 커집니다. 필요한 것만 최소로 공개하면 내부 구현을 자유롭게 변경할 수 있는 여지가 생깁니다.",
    relatedTopicSlugs: ["06-architecture/module-boundary-design"],
  },
  {
    id: "objective-c06-intermediate-module-boundary-design-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Feature-first 구조와 Layer-first 구조를 비교할 때 Feature-first의 주요 장점은?",
    choices: [
      { id: "a", text: "동일 종류 파일(ViewModel, View 등)이 한 폴더에 모여 있어 찾기 쉽다" },
      { id: "b", text: "도메인 응집도가 높고 기능별 동시 작업 시 충돌이 적다" },
      { id: "c", text: "공통 코드 위치가 명확해진다" },
      { id: "d", text: "모든 규모의 앱에서 Layer-first보다 우월하다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Feature-first는 한 기능(예: Login, Home)의 모든 파일이 함께 있어 도메인 응집도가 높고, 팀원이 각 Feature를 독립적으로 작업할 때 충돌이 줄어듭니다. 단점은 공통 코드 위치가 애매해질 수 있다는 점입니다.",
    relatedTopicSlugs: ["06-architecture/module-boundary-design"],
  },
  {
    id: "objective-c06-advanced-module-boundary-design-004",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "모듈 경계를 너무 이르게 자를 때 발생하는 주된 문제는?",
    choices: [
      { id: "a", text: "빌드 시간이 무조건 줄어들어 효율이 높아진다" },
      { id: "b", text: "Interface가 안정화되지 않은 상태에서 분리하면 변경 때마다 Interface와 Impl 둘 다 수정해야 한다" },
      { id: "c", text: "Xcode에서 모듈 수가 늘어나면 자동완성이 비활성화된다" },
      { id: "d", text: "CocoaPods와 충돌이 발생한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "API가 아직 안정화되지 않은 초기에 모듈을 분리하면, 기능 변경 때마다 Interface 모듈과 Impl 모듈을 모두 수정해야 해서 오히려 생산성이 저하됩니다. 일정 수준 안정화된 후 분리하는 것이 권장됩니다.",
    relatedTopicSlugs: ["06-architecture/module-boundary-design"],
  },
  {
    id: "objective-c06-advanced-module-boundary-design-005",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "Swift 6에서 모듈 경계를 넘는 데이터 타입 설계 시 반드시 고려해야 하는 것은?",
    choices: [
      { id: "a", text: "Hashable 채택" },
      { id: "b", text: "Codable 채택" },
      { id: "c", text: "Sendable 보장" },
      { id: "d", text: "Identifiable 채택" },
    ],
    correctChoiceId: "c",
    explanation:
      "Swift 6의 strict concurrency 모드에서는 모듈 경계를 넘어 전달되는 타입이 Sendable을 보장해야 합니다. Interface 모듈에 정의된 value type 모델을 Sendable로 설계하면 컴파일 타임에 데이터 레이스를 방지할 수 있습니다.",
    relatedTopicSlugs: ["06-architecture/module-boundary-design"],
  },

  // ── mvc-vs-mvvm (2) ───────────────────────────────────────────────────────
  {
    id: "objective-c06-basic-mvc-vs-mvvm-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Apple MVC에서 'Massive View Controller' 문제가 생기는 근본 원인은?",
    choices: [
      { id: "a", text: "UIViewController가 너무 많은 메모리를 사용하기 때문" },
      { id: "b", text: "이론적 MVC와 달리 iOS에서 View와 Controller가 강하게 결합되어 VC가 뷰 설정·데이터 로딩·비즈니스 규칙·라우팅까지 떠안기 때문" },
      { id: "c", text: "Storyboard 파일이 너무 커지기 때문" },
      { id: "d", text: "Model이 View를 직접 참조하기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS에서 View는 Storyboard에 박히고 Controller는 UIViewController가 담당하는데, 이 둘이 강하게 결합되어 있어 뷰 설정, 데이터 로딩, 비즈니스 규칙, 라우팅이 VC 한 곳에 모입니다. 이것이 Massive View Controller의 원인입니다.",
    relatedTopicSlugs: ["06-architecture/mvc-vs-mvvm"],
  },
  {
    id: "objective-c06-intermediate-mvc-vs-mvvm-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "MVVM에서 ViewModel이 UIKit을 import하지 않아야 하는 이유는?",
    choices: [
      { id: "a", text: "UIKit은 deprecated될 예정이기 때문" },
      { id: "b", text: "UIKit 타입이 들어오면 순수 단위 테스트가 어려워지고 SwiftUI·macOS 이식 비용이 커지기 때문" },
      { id: "c", text: "UIKit은 Main Thread에서만 import 가능하기 때문" },
      { id: "d", text: "ViewModel은 struct여야 하는데 UIKit이 class를 요구하기 때문" },
    ],
    correctChoiceId: "b",
    explanation:
      "ViewModel에 UIKit 타입이 들어오면 테스트 환경에서 UIKit 의존성을 구성해야 해 단위 테스트가 무거워집니다. 또한 SwiftUI나 macOS로 이식할 때 ViewModel을 재작성해야 하는 비용이 생깁니다. UI 타입은 View에서 매핑합니다.",
    relatedTopicSlugs: ["06-architecture/mvc-vs-mvvm"],
  },

  // ── naming-conventions (5) ────────────────────────────────────────────────
  {
    id: "objective-c06-basic-naming-conventions-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "URLSession을 감싸는 저수준 네트워크 클라이언트 클래스에 가장 적절한 접미사는?",
    choices: [
      { id: "a", text: "NetworkService" },
      { id: "b", text: "NetworkStore" },
      { id: "c", text: "NetworkManager" },
      { id: "d", text: "NetworkProvider" },
    ],
    correctChoiceId: "c",
    explanation:
      "Manager는 저수준 연결/세션 하나를 책임지는 인프라성 클래스에 사용합니다. Apple이 FileManager, CLLocationManager처럼 명명하는 패턴을 따릅니다. 도메인 동작이 아닌 연결 자체가 본질이므로 Service보다 Manager가 적합합니다.",
    relatedTopicSlugs: ["06-architecture/naming-conventions"],
  },
  {
    id: "objective-c06-basic-naming-conventions-002",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "Keychain에 토큰을 읽고 쓰는 역할만 하는 클래스의 가장 적절한 명명은?",
    choices: [
      { id: "a", text: "TokenService" },
      { id: "b", text: "TokenStore" },
      { id: "c", text: "TokenManager" },
      { id: "d", text: "TokenProvider" },
    ],
    correctChoiceId: "b",
    explanation:
      "Store는 영속 저장(Keychain, UserDefaults, CoreData)이 주역할인 클래스에 사용합니다. 토큰 발급·갱신·만료 검증 같은 도메인 동작 없이 단순 read/write만 한다면 TokenStore가 의도를 가장 정확하게 드러냅니다.",
    relatedTopicSlugs: ["06-architecture/naming-conventions"],
  },
  {
    id: "objective-c06-intermediate-naming-conventions-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Google SDK를 프로젝트 내부 AuthProvider protocol로 감싸는 어댑터 클래스의 적절한 명명은?",
    choices: [
      { id: "a", text: "GoogleAuthService" },
      { id: "b", text: "GoogleAuthManager" },
      { id: "c", text: "GoogleAuthProvider" },
      { id: "d", text: "GoogleAuthStore" },
    ],
    correctChoiceId: "c",
    explanation:
      "Provider는 외부 SDK나 외부 시스템을 내부 protocol로 감싸는 어댑터 역할에 사용합니다. GoogleAuthProvider, AppleAuthProvider처럼 동일 protocol의 다양한 구현을 교체 가능하게 만드는 DI 경계 클래스가 전형적인 사용처입니다.",
    relatedTopicSlugs: ["06-architecture/naming-conventions"],
  },
  {
    id: "objective-c06-intermediate-naming-conventions-004",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "Service 접미사를 사용하기에 적합한 조건으로 옳지 않은 것은?",
    choices: [
      { id: "a", text: "도메인 명사 1개에 묶인 동작 집합" },
      { id: "b", text: "호출자(ViewModel)가 비즈니스 의도를 그대로 표현 가능" },
      { id: "c", text: "주역할이 Keychain read/write인 영속 저장 객체" },
      { id: "d", text: "상태가 없거나 얕은 객체" },
    ],
    correctChoiceId: "c",
    explanation:
      "영속 저장이 주역할이면 Store를 사용해야 합니다. Service는 도메인 유즈케이스 모음으로, stateless에 가깝게 동작하고 ViewModel이 비즈니스 의도를 그대로 표현할 수 있을 때 적합합니다.",
    relatedTopicSlugs: ["06-architecture/naming-conventions"],
  },
  {
    id: "objective-c06-advanced-naming-conventions-005",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "다음 중 명명 안티패턴(God Service/Manager 혼용/Store-Service 혼용)에 해당하는 사례는?",
    choices: [
      { id: "a", text: "BookmarkService — 북마크 토글·목록 조회 유즈케이스를 모은 객체" },
      { id: "b", text: "AppService — 여러 도메인에 걸친 다양한 동작을 모두 담은 객체" },
      { id: "c", text: "NetworkManager — URLSession 래퍼로 연결 관리" },
      { id: "d", text: "EventLogger — Analytics 이벤트를 단방향으로 기록하는 객체" },
    ],
    correctChoiceId: "b",
    explanation:
      "AppService, CommonService, UtilService처럼 도메인 명사가 없는 이름은 '1 도메인 명사에 묶인 동작 집합'이라는 Service 조건을 위반한 God Service 안티패턴입니다. 책임이 너무 넓고 불명확해져 유지보수가 어려워집니다.",
    relatedTopicSlugs: ["06-architecture/naming-conventions"],
  },

  // ── tca (4) ───────────────────────────────────────────────────────────────
  {
    id: "objective-c06-basic-tca-001",
    type: "objective",
    level: "basic",
    category: "Architecture",
    prompt: "TCA(The Composable Architecture)에서 Reducer의 역할로 옳은 것은?",
    choices: [
      { id: "a", text: "네트워크 요청을 직접 수행하고 결과를 State에 저장" },
      { id: "b", text: "(State, Action) → Effect 형태의 순수 함수로 State를 변환하고 부수효과를 Effect로 반환" },
      { id: "c", text: "View의 레이아웃을 계산하는 함수" },
      { id: "d", text: "모든 Action을 비동기로 처리하는 Queue" },
    ],
    correctChoiceId: "b",
    explanation:
      "TCA의 Reducer는 (State, Action) → Effect 형태의 순수 함수입니다. 같은 입력이면 항상 같은 State 변경을 만들고, 비동기 작업 같은 부수효과는 Effect로 표현해 Reducer 밖에서 실행됩니다.",
    relatedTopicSlugs: ["06-architecture/tca"],
  },
  {
    id: "objective-c06-intermediate-tca-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "TCA에서 비동기 네트워크 요청 결과를 State에 반영하는 올바른 흐름은?",
    choices: [
      { id: "a", text: "Reducer가 직접 async/await로 네트워크를 호출하고 State를 수정" },
      { id: "b", text: "View가 결과를 받아 store.state를 직접 수정" },
      { id: "c", text: "Reducer가 Effect(.run)을 반환 → Effect가 완료되면 새 Action을 send → Reducer가 State 변경" },
      { id: "d", text: "Effect가 State를 직접 변경하고 새 Action을 send하지 않음" },
    ],
    correctChoiceId: "c",
    explanation:
      "TCA의 단방향 흐름에서 부수효과(네트워크 등)는 Effect로 표현됩니다. Effect가 완료되면 결과를 새 Action으로 변환해 send하고, Reducer가 그 Action을 받아 State를 변경합니다. State 변경은 Reducer 안에서만 일어납니다.",
    relatedTopicSlugs: ["06-architecture/tca"],
  },
  {
    id: "objective-c06-intermediate-tca-003",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "TCA에서 여러 Feature를 조합(Composition)할 때 사용하는 방법은?",
    choices: [
      { id: "a", text: "각 Feature의 Reducer를 하나의 switch-case에 합침" },
      { id: "b", text: "Scope(state:action:)를 사용해 부모 State/Action의 일부를 자식 Reducer에 위임" },
      { id: "c", text: "NotificationCenter로 Feature 간 통신" },
      { id: "d", text: "싱글턴 Store를 공유해 모든 Feature가 같은 State를 참조" },
    ],
    correctChoiceId: "b",
    explanation:
      "TCA 컴포지션은 Scope(state: \\.counter, action: \\.counter) { CounterFeature() } 형태로 부모 Reducer의 body에서 자식 Reducer를 scope로 감싸 조립합니다. 각 Feature는 자신만의 State·Action을 갖고 독립적으로 테스트할 수 있습니다.",
    relatedTopicSlugs: ["06-architecture/tca"],
  },
  {
    id: "objective-c06-advanced-tca-004",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "TCA의 TestStore를 이용한 테스트에서 '예상하지 못한 Effect가 남아 있으면 테스트가 실패'하는 이유는?",
    choices: [
      { id: "a", text: "TestStore가 메모리 한도를 초과하기 때문" },
      { id: "b", text: "Effect는 비동기이므로 TestStore가 timeout을 설정하기 때문" },
      { id: "c", text: "TCA가 모든 Effect를 추적하며, 처리되지 않은 Effect가 있으면 누락된 부수효과가 있다는 신호이기 때문" },
      { id: "d", text: "TestStore는 Effect를 지원하지 않기 때문" },
    ],
    correctChoiceId: "c",
    explanation:
      "TCA TestStore는 Reducer에서 반환된 모든 Effect를 추적합니다. 테스트가 끝날 때 처리되지 않은 Effect가 남아 있으면 '이 부수효과를 테스트에서 검증하지 않았다'는 의미로 실패합니다. 이를 통해 개발자가 부수효과를 못 본 척 넘기지 못하게 강제합니다.",
    relatedTopicSlugs: ["06-architecture/tca"],
  },

  // ─── viper (add: 3) ──────────────────────────────────────────────────────
  {
    id: "objective-c06-intermediate-viper-001",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "VIPER에서 비즈니스 로직(API 호출, 데이터 변환)을 담당하는 컴포넌트는?",
    choices: [
      { id: "a", text: "View — 사용자 입력을 받아 직접 네트워크 호출" },
      { id: "b", text: "Interactor — Presenter의 요청을 받아 use case 단위 비즈니스 로직 수행" },
      { id: "c", text: "Presenter — View와 Router 사이의 모든 데이터 변환" },
      { id: "d", text: "Router — 화면 전환 외에 도메인 규칙 검증도 담당" },
    ],
    correctChoiceId: "b",
    explanation:
      "VIPER의 다섯 역할 중 **Interactor**가 비즈니스 로직(API 호출, repository 접근, 도메인 규칙)을 담당한다. Presenter는 View와 Interactor를 잇는 표현 로직과 포매팅, Router는 화면 전환과 모듈 조립, Entity는 순수 데이터 모델이다. View는 가능한 한 dumb하게 유지하고 Presenter가 전달한 ViewModel만 표시한다.",
    relatedTopicSlugs: ["06-architecture/viper"],
  },
  {
    id: "objective-c06-intermediate-viper-002",
    type: "objective",
    level: "intermediate",
    category: "Architecture",
    prompt: "VIPER가 MVVM 대비 갖는 핵심 장단점으로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "장점: 모듈 경계가 명확해 단위 테스트가 쉽다 / 단점: 작은 화면에도 5개 클래스가 필요해 보일러플레이트가 많다" },
      { id: "b", text: "장점: View ↔ ViewModel 양방향 바인딩이 자동화된다 / 단점: 컴파일 시간이 항상 더 길다" },
      { id: "c", text: "장점: SwiftUI와 자연스럽게 결합된다 / 단점: UIKit에서는 사용 불가" },
      { id: "d", text: "장점: 의존성 주입이 불필요하다 / 단점: 비동기 코드 작성이 어렵다" },
    ],
    correctChoiceId: "a",
    explanation:
      "VIPER는 각 역할의 경계가 프로토콜로 분리되어 mock 주입과 단위 테스트가 용이하지만, 작은 화면에도 5개 클래스(+ Builder/Configurator)가 필요해 보일러플레이트 부담이 크다. MVVM과 SwiftUI 결합이 더 자연스러우므로 신규 SwiftUI 프로젝트에선 MVVM/TCA 쪽이 일반적이고, 큰 UIKit 화면 단위 모듈을 명확히 분리해야 할 때 VIPER가 선택된다.",
    relatedTopicSlugs: ["06-architecture/viper"],
  },
  {
    id: "objective-c06-advanced-viper-003",
    type: "objective",
    level: "advanced",
    category: "Architecture",
    prompt: "VIPER 모듈에서 Router(또는 Wireframe)가 갖는 책임 경계로 옳은 것은?",
    choices: [
      { id: "a", text: "Router는 다른 모듈로의 화면 전환 트리거와 의존성 조립을 담당하고, 비즈니스 로직 자체는 갖지 않는다" },
      { id: "b", text: "Router는 모든 화면 전환을 직접 결정하므로 Presenter는 navigation에 관여하지 않는다" },
      { id: "c", text: "Router는 Interactor와 동일한 책임을 가지며 보통 같은 클래스로 합쳐 구현한다" },
      { id: "d", text: "Router는 항상 UINavigationController의 서브클래스여야 한다" },
    ],
    correctChoiceId: "a",
    explanation:
      "Router(Wireframe)는 화면 전환의 *어디로*를 알고 트리거를 받아 실행하며, 새로운 모듈을 조립(View/Interactor/Presenter/Router 인스턴스 생성 + 와이어링)하는 역할을 한다. *언제* 전환할지는 Presenter가 사용자/도메인 이벤트를 보고 결정해 Router에 위임한다. Interactor의 비즈니스 로직과는 분리되어야 하며, UIKit 컨테이너 종류에 묶이지 않는다.",
    relatedTopicSlugs: ["06-architecture/viper"],
  },
];
