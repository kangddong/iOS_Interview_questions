import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ────────────────────────────────────────────────
  // build-time-optimization (add: 4)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-build-time-optimization-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "Xcode Debug 빌드에서 빌드 속도를 가장 효과적으로 높이는 Swift 최적화 설정은?",
    choices: [
      { id: "a", text: "Whole Module Optimization을 끄고 `-Onone`을 사용한다." },
      { id: "b", text: "Whole Module Optimization을 켜고 `-O`를 사용한다." },
      { id: "c", text: "Dead Code Stripping을 끈다." },
      { id: "d", text: "Build Active Architecture Only를 NO로 설정한다." }
    ],
    correctChoiceId: "a",
    explanation: "Debug 빌드는 WMO를 끄고 `-Onone`을 사용해야 incremental 컴파일이 활성화되고 빌드 속도가 최대화된다. WMO와 `-O`는 Release 배포에 적합하다.",
    relatedTopicSlugs: ["11-build-system/build-time-optimization"]
  },
  {
    id: "objective-c11-intermediate-build-time-optimization-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "Swift 타입 추론 비용을 측정하기 위해 Other Swift Flags에 추가하는 플래그는?",
    choices: [
      { id: "a", text: "-Xfrontend -warn-long-expression-type-checking=100" },
      { id: "b", text: "-enable-testing" },
      { id: "c", text: "-whole-module-optimization" },
      { id: "d", text: "-Xfrontend -enable-experimental-concurrency" }
    ],
    correctChoiceId: "a",
    explanation: "`-Xfrontend -warn-long-expression-type-checking=100`은 100ms 이상 걸리는 표현식 타입 추론을 경고로 출력하며, CI에서 임계값 회귀를 감지할 수 있다.",
    relatedTopicSlugs: ["11-build-system/build-time-optimization"]
  },
  {
    id: "objective-c11-intermediate-build-time-optimization-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "모듈을 너무 잘게 분리했을 때 발생할 수 있는 역설적인 빌드 시간 문제는?",
    choices: [
      { id: "a", text: "incremental 빌드는 빨라지지만 clean build 총 시간이 늘어날 수 있다." },
      { id: "b", text: "런타임 crash가 증가한다." },
      { id: "c", text: "DerivedData 캐시가 자동으로 삭제된다." },
      { id: "d", text: "Swift 컴파일러가 모듈 간 참조를 허용하지 않는다." }
    ],
    correctChoiceId: "a",
    explanation: "모듈을 과도하게 분리하면 모듈 간 인터페이스 비용이 증가해 clean build 시 오히려 전체 컴파일 시간이 증가할 수 있다. incremental 재빌드 효과는 변경이 범위가 좁을 때만 유효하다.",
    relatedTopicSlugs: ["11-build-system/build-time-optimization"]
  },
  {
    id: "objective-c11-advanced-build-time-optimization-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "CI 환경에서 mtime 기반 incremental 빌드 캐시가 무효화되는 원인과 해결책으로 옳은 것은?",
    choices: [
      { id: "a", text: "git checkout이 파일의 mtime을 현재 시각으로 리셋하므로 `git restore-mtime` 같은 도구로 mtime을 보존해야 한다." },
      { id: "b", text: "Xcode가 DerivedData를 자동으로 삭제하므로 매 빌드 전에 clean을 실행해야 한다." },
      { id: "c", text: "SPM 캐시 경로가 고정되어 있지 않으므로 `--cache-path`를 항상 `/tmp`로 지정해야 한다." },
      { id: "d", text: "macOS runner는 mtime을 지원하지 않으므로 Bazel만이 유일한 해결책이다." }
    ],
    correctChoiceId: "a",
    explanation: "git checkout은 파일 수정 시각(mtime)을 현재 시각으로 설정하므로 Xcode의 incremental 빌드가 모든 파일을 변경된 것으로 인식한다. `git restore-mtime` 등으로 커밋 시각을 복원하면 캐시를 재사용할 수 있다.",
    relatedTopicSlugs: ["11-build-system/build-time-optimization"]
  },

  // ────────────────────────────────────────────────
  // ci-cd (add: 5)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-ci-cd-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "iOS CI/CD 파이프라인에서 일반적인 단계 순서로 옳은 것은?",
    choices: [
      { id: "a", text: "Push → Lint → Build → Test → Sign+Archive → Distribute" },
      { id: "b", text: "Push → Test → Build → Sign+Archive → Lint → Distribute" },
      { id: "c", text: "Push → Sign+Archive → Build → Test → Lint → Distribute" },
      { id: "d", text: "Push → Distribute → Build → Test → Sign+Archive → Lint" }
    ],
    correctChoiceId: "a",
    explanation: "표준 파이프라인은 코드 품질 검사(Lint)부터 시작해 Build, Test, Sign+Archive 순으로 진행하고 마지막으로 TestFlight나 App Store에 배포한다. 각 단계가 실패하면 즉시 중단된다.",
    relatedTopicSlugs: ["11-build-system/ci-cd"]
  },
  {
    id: "objective-c11-basic-ci-cd-002",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "`CFBundleShortVersionString`과 `CFBundleVersion`의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "CFBundleShortVersionString은 사용자에게 표시되는 버전이고, CFBundleVersion은 단조 증가하는 빌드 번호다." },
      { id: "b", text: "CFBundleShortVersionString은 내부 빌드 번호이고, CFBundleVersion은 마케팅 버전이다." },
      { id: "c", text: "둘 다 사용자에게 표시되며 항상 동일한 값이어야 한다." },
      { id: "d", text: "CFBundleVersion은 TestFlight 전용이며 App Store에서는 무시된다." }
    ],
    correctChoiceId: "a",
    explanation: "CFBundleShortVersionString(예: 1.2.0)은 사용자에게 보이는 마케팅 버전이며, CFBundleVersion(예: 123)은 App Store 정책상 같은 버전 내에서 단조 증가해야 하는 빌드 번호다.",
    relatedTopicSlugs: ["11-build-system/ci-cd"]
  },
  {
    id: "objective-c11-intermediate-ci-cd-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "fastlane match가 해결하는 핵심 문제는?",
    choices: [
      { id: "a", text: "팀 전원과 CI 머신이 같은 인증서/provisioning profile을 암호화된 저장소에서 자동 설치하도록 한다." },
      { id: "b", text: "TestFlight 업로드를 자동으로 예약한다." },
      { id: "c", text: "SwiftLint 규칙을 자동으로 생성한다." },
      { id: "d", text: "SPM 의존성을 private git에 미러링한다." }
    ],
    correctChoiceId: "a",
    explanation: "match는 인증서와 provisioning profile을 암호화해 private git에 보관하고 CI 머신에서 keychain에 자동 설치한다. 팀 전원이 동일한 인증서를 공유해 '유효한 인증서 없음' 문제를 방지한다.",
    relatedTopicSlugs: ["11-build-system/ci-cd"]
  },
  {
    id: "objective-c11-intermediate-ci-cd-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "GitHub Actions에서 PR 빌드와 main 브랜치 병합 시 TestFlight 배포를 분리 트리거하는 방법은?",
    choices: [
      { id: "a", text: "on: push: branches: [main] 조건으로 별도 job 정의, PR은 on: pull_request로 테스트만 실행" },
      { id: "b", text: "같은 job에서 환경 변수로 main 여부를 런타임에 감지해 분기한다." },
      { id: "c", text: "Xcode Cloud에서만 브랜치 분기가 가능하다." },
      { id: "d", text: "App Store Connect API를 직접 호출해 빌드 번호를 비교한다." }
    ],
    correctChoiceId: "a",
    explanation: "GitHub Actions는 `on: pull_request` 트리거로 PR 빌드/테스트를 실행하고, 별도 워크플로에 `on: push: branches: [main]`을 지정해 main 병합 시에만 TestFlight 업로드를 수행하는 것이 표준 패턴이다.",
    relatedTopicSlugs: ["11-build-system/ci-cd"]
  },
  {
    id: "objective-c11-advanced-ci-cd-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "CI에서 flaky(불안정) 테스트를 줄이기 위해 Xcode 13+에서 사용할 수 있는 xcodebuild 옵션은?",
    choices: [
      { id: "a", text: "-test-iterations 2 -retry-tests-on-failure" },
      { id: "b", text: "-skip-testing:AppUITests" },
      { id: "c", text: "-parallel-testing-enabled YES" },
      { id: "d", text: "-maximum-concurrent-test-simulator-destinations 1" }
    ],
    correctChoiceId: "a",
    explanation: "Xcode 13+에서는 `-test-iterations`와 `-retry-tests-on-failure`를 조합해 실패한 테스트를 자동으로 재시도할 수 있다. 이를 통해 타이밍이나 순서 의존 flaky 테스트의 false failure를 줄인다.",
    relatedTopicSlugs: ["11-build-system/ci-cd"]
  },

  // ────────────────────────────────────────────────
  // code-signing (add: 5)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-code-signing-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "iOS 코드 사이닝의 3요소를 모두 올바르게 나열한 것은?",
    choices: [
      { id: "a", text: "Certificate, Provisioning Profile, Entitlements" },
      { id: "b", text: "Bundle ID, Xcode 버전, Apple ID" },
      { id: "c", text: "App Store Connect, dSYM, Keychain" },
      { id: "d", text: "Info.plist, Scheme, Configuration" }
    ],
    correctChoiceId: "a",
    explanation: "코드 사이닝은 개발자 신원(Certificate), 실행 허가 범위(Provisioning Profile), 앱이 요구하는 시스템 권한(Entitlements) 세 요소의 조합으로 이루어진다.",
    relatedTopicSlugs: ["11-build-system/code-signing"]
  },
  {
    id: "objective-c11-basic-code-signing-002",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "인증서(Certificate)가 만료되었을 때 이미 배포된 앱에 미치는 영향은?",
    choices: [
      { id: "a", text: "기 설치된 앱은 계속 동작하지만 새 빌드 업로드가 불가하다." },
      { id: "b", text: "기 설치된 앱도 즉시 실행 불가 상태가 된다." },
      { id: "c", text: "App Store에서 앱이 자동 삭제된다." },
      { id: "d", text: "TestFlight 링크만 무효화되고 App Store 버전은 영향 없다." }
    ],
    correctChoiceId: "a",
    explanation: "서명은 배포 시점에 타임스탬프와 함께 검증되므로, 인증서가 만료된 후에도 기 설치된 앱은 계속 실행된다. 단, 새 빌드를 업로드하거나 재서명하려면 유효한 인증서가 필요하다.",
    relatedTopicSlugs: ["11-build-system/code-signing"]
  },
  {
    id: "objective-c11-intermediate-code-signing-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "`The executable was signed with invalid entitlements` 에러의 주된 원인은?",
    choices: [
      { id: "a", text: "entitlements 파일에 선언된 권한이 provisioning profile에 포함되지 않았다." },
      { id: "b", text: "Bundle ID가 Apple Developer 포털과 다르다." },
      { id: "c", text: "Certificate가 만료되었다." },
      { id: "d", text: "Debug configuration에서 Archive를 실행했다." }
    ],
    correctChoiceId: "a",
    explanation: "entitlements 파일에 선언된 권한(예: App Group, Push)이 해당 provisioning profile에 등록되지 않은 경우 이 에러가 발생한다. Developer 포털에서 App ID에 capability를 추가하고 profile을 재생성해야 한다.",
    relatedTopicSlugs: ["11-build-system/code-signing"]
  },
  {
    id: "objective-c11-intermediate-code-signing-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "Push Notification을 Dev 환경과 Prod 환경에서 다르게 동작시키는 근본 원인은?",
    choices: [
      { id: "a", text: "APNs 환경이 분리되어 있어 development profile은 sandbox APNs, distribution profile은 production APNs를 사용한다." },
      { id: "b", text: "Development 인증서와 Distribution 인증서의 키 길이가 다르다." },
      { id: "c", text: "TestFlight 앱은 Push를 기본 비활성화한다." },
      { id: "d", text: "Xcode가 자동으로 Push 엔드포인트를 교체하기 때문이다." }
    ],
    correctChoiceId: "a",
    explanation: "Apple의 APNs는 sandbox(개발)와 production(배포) 두 환경으로 분리된다. development provisioning profile로 서명된 앱은 sandbox APNs에, distribution profile로 서명된 앱은 production APNs에 연결된다. 서버도 토큰을 환경별로 구분 저장해야 한다.",
    relatedTopicSlugs: ["11-build-system/code-signing"]
  },
  {
    id: "objective-c11-advanced-code-signing-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "App Group을 여러 앱 또는 Extension에서 공유할 때 올바르게 동작하려면 일치해야 하는 3가지는?",
    choices: [
      { id: "a", text: "Apple Developer 포털 App Group 등록, entitlements 키, provisioning profile 재생성" },
      { id: "b", text: "Bundle ID, Certificate 타입, Xcode 버전" },
      { id: "c", text: "scheme 이름, Info.plist 키, target 설정" },
      { id: "d", text: "xcconfig 파일, build number, deployment target" }
    ],
    correctChoiceId: "a",
    explanation: "App Group이 동작하려면 ① Developer 포털에서 App Group identifier 등록, ② 각 앱/Extension의 entitlements 파일에 동일한 identifier 추가, ③ 해당 capability를 포함한 provisioning profile 재생성이 모두 일치해야 한다. 하나라도 빠지면 권한이 거부된다.",
    relatedTopicSlugs: ["11-build-system/code-signing"]
  },

  // ────────────────────────────────────────────────
  // framework-vs-library (add: 4)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-framework-vs-library-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "iOS에서 Framework가 단순 Library보다 갖는 가장 큰 구조적 차이는?",
    choices: [
      { id: "a", text: "바이너리뿐 아니라 헤더, 리소스, 모듈 맵을 한 디렉터리 번들로 묶어 배포한다." },
      { id: "b", text: "Framework는 항상 동적 링크되고 Library는 정적 링크만 된다." },
      { id: "c", text: "Framework는 Swift 전용이며 Objective-C와는 함께 쓸 수 없다." },
      { id: "d", text: "Framework는 App Store 심사를 우회할 수 있다." }
    ],
    correctChoiceId: "a",
    explanation: "Framework는 바이너리, 공개 헤더, Info.plist, 리소스, module.modulemap, 코드 서명을 하나의 디렉터리 번들로 묶은 단위다. Library는 바이너리 파일만 가리키며 헤더는 별도 제공해야 한다.",
    relatedTopicSlugs: ["11-build-system/framework-vs-library"]
  },
  {
    id: "objective-c11-intermediate-framework-vs-library-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "XCFramework가 기존 fat binary(lipo)로 해결할 수 없었던 문제는?",
    choices: [
      { id: "a", text: "Apple Silicon Mac에서 iOS Simulator도 arm64 아키텍처를 사용해 device arm64와 충돌하는 문제" },
      { id: "b", text: "Swift 모듈이 Objective-C 헤더를 자동 생성하지 못하는 문제" },
      { id: "c", text: "TestFlight 배포 시 바이너리 크기가 너무 커지는 문제" },
      { id: "d", text: "시뮬레이터에서 Push Notification을 테스트하지 못하는 문제" }
    ],
    correctChoiceId: "a",
    explanation: "Apple Silicon Mac이 등장하면서 iOS Simulator도 arm64를 사용하게 되었다. 기존 fat binary는 같은 아키텍처(arm64)를 device와 simulator 두 슬롯에 함께 담지 못한다. XCFramework는 플랫폼·SDK별 디렉터리로 분리해 이 문제를 해결한다.",
    relatedTopicSlugs: ["11-build-system/framework-vs-library"]
  },
  {
    id: "objective-c11-intermediate-framework-vs-library-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "Swift Framework를 외부 배포할 때 `BUILD_LIBRARY_FOR_DISTRIBUTION=YES`가 반드시 필요한 이유는?",
    choices: [
      { id: "a", text: ".swiftinterface를 생성해 컴파일러 버전 간 호환(Library Evolution)을 보장하기 때문" },
      { id: "b", text: "Bitcode를 생성하기 위해 반드시 필요하기 때문" },
      { id: "c", text: "release 모드 최적화를 적용하기 위한 트리거이기 때문" },
      { id: "d", text: "XCFramework 생성 스크립트의 필수 입력값이기 때문" }
    ],
    correctChoiceId: "a",
    explanation: "`BUILD_LIBRARY_FOR_DISTRIBUTION=YES`는 `.swiftinterface` 파일을 생성하고 Library Evolution 모드를 활성화해, 소비자가 다른 Swift 버전을 사용하더라도 링크할 수 있게 한다. 미설정 시 Swift 버전 불일치로 import 실패가 발생한다.",
    relatedTopicSlugs: ["11-build-system/framework-vs-library"]
  },
  {
    id: "objective-c11-advanced-framework-vs-library-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "Mergeable Libraries(Xcode 15+)가 기존 dynamic framework 사용 대비 release 빌드에서 달성하는 효과는?",
    choices: [
      { id: "a", text: "ld가 dylib 코드를 호스트 바이너리에 static하게 병합해 런치 시 dylib 로딩 비용이 없어진다." },
      { id: "b", text: "모든 빌드에서 자동으로 dead code를 stripping해 바이너리 크기를 50% 줄인다." },
      { id: "c", text: "Debug 빌드에서 dynamic 로딩을 제거해 빌드 시간을 단축한다." },
      { id: "d", text: "Simulator와 Device를 단일 바이너리로 통합해 배포 절차를 단순화한다." }
    ],
    correctChoiceId: "a",
    explanation: "Mergeable Libraries는 Debug에서는 dynamic framework로 빠른 incremental 빌드를 유지하고, Release에서는 ld가 mergeable framework의 코드를 호스트에 흡수해 pre-main dylib 로딩 비용을 제거한다. 모듈화와 성능 최적화를 동시에 달성한다.",
    relatedTopicSlugs: ["11-build-system/framework-vs-library"]
  },

  // ────────────────────────────────────────────────
  // linker-and-dyld (add: 3)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-linker-and-dyld-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "ld(정적 링커)와 dyld(동적 링커)의 실행 시점 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "ld는 빌드 타임에 .o 파일들을 Mach-O로 묶고, dyld는 프로세스 시작 시 의존 dylib을 메모리에 매핑한다." },
      { id: "b", text: "ld는 런치 타임에 동작하고, dyld는 빌드 타임에 동작한다." },
      { id: "c", text: "ld와 dyld는 동일한 시점에 동작하며 역할만 다르다." },
      { id: "d", text: "dyld는 Xcode 14 이후 deprecated되어 ld가 모두 처리한다." }
    ],
    correctChoiceId: "a",
    explanation: "ld는 빌드 타임에 .o, .a, .dylib을 입력받아 단일 Mach-O를 생성한다. dyld는 exec() 후 커널이 가장 먼저 실행하는 사용자 프로그램으로 의존 dylib을 로드하고 main()을 호출하기 전까지의 pre-main 작업을 담당한다.",
    relatedTopicSlugs: ["11-build-system/linker-and-dyld"]
  },
  {
    id: "objective-c11-intermediate-linker-and-dyld-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "dyld 3(iOS 13+)가 dyld 2 대비 cold launch를 빠르게 하는 핵심 메커니즘은?",
    choices: [
      { id: "a", text: "launch closure를 디스크에 캐싱해 이후 실행 시 의존성 그래프를 재계산하지 않는다." },
      { id: "b", text: "모든 dylib을 앱 바이너리에 static하게 병합한다." },
      { id: "c", text: "Objective-C 런타임 초기화를 백그라운드 스레드로 이동한다." },
      { id: "d", text: "chained fixups 대신 lazy bind를 기본으로 사용해 로딩 순서를 최적화한다." }
    ],
    correctChoiceId: "a",
    explanation: "dyld 3는 의존성 그래프, 주소 계산 결과를 launch closure로 직렬화해 디스크에 저장한다. 이후 실행 시 인자와 환경이 같으면 closure를 재사용해 cold launch 시간을 단축한다.",
    relatedTopicSlugs: ["11-build-system/linker-and-dyld"]
  },
  {
    id: "objective-c11-advanced-linker-and-dyld-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "chained fixups가 기존 rebase/bind 방식보다 효율적인 이유는?",
    choices: [
      { id: "a", text: "__DATA 포인터 자체에 다음 fixup 오프셋을 인코딩해 단일 패스로 처리하고 __LINKEDIT 크기와 dirty 페이지를 줄인다." },
      { id: "b", text: "모든 심볼을 빌드 타임에 완전히 해결해 런타임 바인딩을 제거한다." },
      { id: "c", text: "rebase와 bind를 별도 스레드에서 병렬로 처리해 속도를 높인다." },
      { id: "d", text: "ASLR을 비활성화해 주소 재계산 단계를 생략한다." }
    ],
    correctChoiceId: "a",
    explanation: "Chained fixups는 __DATA 세그먼트의 포인터 값 안에 '다음 fixup 위치'를 인코딩한다. dyld가 페이지를 따라가며 한 패스에 모든 fixup을 처리할 수 있으므로 __LINKEDIT의 rebase/bind 리스트가 불필요해지고 dirty 페이지 수가 감소해 성능이 향상된다.",
    relatedTopicSlugs: ["11-build-system/linker-and-dyld"]
  },

  // ────────────────────────────────────────────────
  // mach-o-and-binary (add: 3)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-mach-o-and-binary-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "Mach-O 파일의 3계층 구조를 올바르게 나열한 것은?",
    choices: [
      { id: "a", text: "Header → Load Commands → Segments(Sections)" },
      { id: "b", text: "Segments → Header → Load Commands" },
      { id: "c", text: "Load Commands → Sections → Header" },
      { id: "d", text: "Header → Sections → Load Commands → Segments" }
    ],
    correctChoiceId: "a",
    explanation: "Mach-O 파일은 파일 타입/아키텍처 정보를 담은 Header, dyld에게 로딩 방법을 지시하는 Load Commands, 실제 코드와 데이터를 담는 Segments(Sections) 순의 3계층 구조를 가진다.",
    relatedTopicSlugs: ["11-build-system/mach-o-and-binary"]
  },
  {
    id: "objective-c11-intermediate-mach-o-and-binary-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "`__TEXT` 세그먼트와 `__DATA_CONST` 세그먼트의 접근 권한 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "__TEXT는 빌드 타임부터 read-only(r-x), __DATA_CONST는 dyld 바인딩 완료 후 mprotect로 read-only(r--)가 된다." },
      { id: "b", text: "__TEXT는 rw-이고 __DATA_CONST는 r-x이다." },
      { id: "c", text: "둘 다 빌드 타임에 rw-이며 실행 시 동일하게 r--로 전환된다." },
      { id: "d", text: "__TEXT는 런타임에 쓰기 가능해지고, __DATA_CONST는 항상 쓰기 불가다." }
    ],
    correctChoiceId: "a",
    explanation: "__TEXT는 실행 코드를 담으며 빌드 타임부터 read-execute(r-x)다. 모든 프로세스가 페이지를 공유한다. __DATA_CONST는 GOT 등 dyld 바인딩 대상을 담으며, dyld가 rebase/bind를 완료한 후 mprotect로 read-only(r--)로 전환되어 ROP 공격을 방지한다.",
    relatedTopicSlugs: ["11-build-system/mach-o-and-binary"]
  },
  {
    id: "objective-c11-advanced-mach-o-and-binary-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "Swift 바이너리가 Objective-C보다 큰 경향이 있는 Mach-O 구조상의 이유는?",
    choices: [
      { id: "a", text: "제네릭 특수화(specialization)와 reflection metadata(__swift5_types)가 __TEXT와 __DATA에 추가되기 때문이다." },
      { id: "b", text: "Swift stdlib이 항상 정적 링크되어 포함되기 때문이다." },
      { id: "c", text: "Swift는 fat binary를 필수로 생성하고 Objective-C는 단일 슬라이스만 허용하기 때문이다." },
      { id: "d", text: "Swift 컴파일러가 모든 함수를 inline으로 전개하기 때문이다." }
    ],
    correctChoiceId: "a",
    explanation: "Swift의 제네릭 특수화는 타입마다 별도 코드 사본을 __TEXT에 생성하고, reflection metadata(__swift5_types 등)가 __DATA에 추가된다. 이로 인해 동일 기능 대비 Objective-C 바이너리보다 큰 경우가 많다. Swift 5.0+ ABI 안정화 이후 stdlib은 동적 링크되어 별도 포함되지 않는다.",
    relatedTopicSlugs: ["11-build-system/mach-o-and-binary"]
  },

  // ────────────────────────────────────────────────
  // spm (add: 5)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-spm-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "SPM Package.swift에서 `products`와 `targets`의 역할 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "products는 외부에 노출할 결과물을 선언하고, targets는 컴파일 단위(소스 폴더 매핑)를 정의한다." },
      { id: "b", text: "products는 테스트 타깃을 정의하고, targets는 배포 결과물을 정의한다." },
      { id: "c", text: "products는 의존 외부 패키지를, targets는 내부 소스 파일을 나열한다." },
      { id: "d", text: "둘은 동의어로 Xcode에서만 의미가 있다." }
    ],
    correctChoiceId: "a",
    explanation: "products는 다른 패키지나 앱이 가져올 수 있는 library/executable을 선언하며 targets를 가리킨다. targets는 실제 컴파일 단위로 Sources/ 하위 폴더와 매핑되고 의존성을 지정한다.",
    relatedTopicSlugs: ["11-build-system/spm"]
  },
  {
    id: "objective-c11-basic-spm-002",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "SPM에서 `Package.resolved` 파일의 역할로 옳은 것은?",
    choices: [
      { id: "a", text: "해결된 정확한 의존성 버전을 잠금(lock)해 팀원과 CI가 동일한 버전을 사용하게 한다." },
      { id: "b", text: "패키지 빌드 결과를 캐싱하는 바이너리 파일이다." },
      { id: "c", text: "Xcode 프로젝트 파일(.xcodeproj)과 동기화를 유지하는 내부 파일이다." },
      { id: "d", text: "개발자가 직접 편집해 원하는 버전을 고정하는 설정 파일이다." }
    ],
    correctChoiceId: "a",
    explanation: "Package.resolved는 SPM이 의존성을 해결한 후 실제 사용 버전을 기록하는 lock 파일이다. 반드시 git에 commit해야 팀원과 CI 환경에서 동일한 버전이 사용된다.",
    relatedTopicSlugs: ["11-build-system/spm"]
  },
  {
    id: "objective-c11-intermediate-spm-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "SPM 타깃 안에서 리소스(이미지, JSON 등)를 런타임에 접근할 때 올바른 방법은?",
    choices: [
      { id: "a", text: "Bundle.module을 사용한다." },
      { id: "b", text: "Bundle.main을 사용한다." },
      { id: "c", text: "Bundle(for: Self.self)를 사용한다." },
      { id: "d", text: "FileManager.default.currentDirectoryPath를 기준으로 상대 경로를 사용한다." }
    ],
    correctChoiceId: "a",
    explanation: "SPM 타깃에서 resources를 선언하면 SPM이 Bundle.module 접근자를 자동 합성한다. Bundle.main은 앱 메인 번들을 가리키므로 SPM 타깃의 리소스를 찾지 못한다.",
    relatedTopicSlugs: ["11-build-system/spm"]
  },
  {
    id: "objective-c11-intermediate-spm-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "SPM과 CocoaPods의 가장 큰 구조적 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "SPM은 Apple 공식 지원으로 Xcode에 깊이 통합되고, CocoaPods은 Ruby Podfile 기반으로 별도 Workspace를 생성한다." },
      { id: "b", text: "SPM은 동적 라이브러리만 지원하고 CocoaPods은 정적만 지원한다." },
      { id: "c", text: "CocoaPods은 Xcode 없이도 동작하지만 SPM은 반드시 Xcode가 필요하다." },
      { id: "d", text: "SPM은 Objective-C 패키지를 지원하지 않는다." }
    ],
    correctChoiceId: "a",
    explanation: "SPM은 Apple 공식 패키지 매니저로 Xcode에 깊이 통합되며 Swift 코드로 매니페스트를 작성한다. CocoaPods은 Ruby DSL 기반이며 빌드 시 별도 Workspace와 Pods 프로젝트를 생성한다. SPM도 Swift 5.5+ 이후 Objective-C 타깃을 지원한다.",
    relatedTopicSlugs: ["11-build-system/spm"]
  },
  {
    id: "objective-c11-advanced-spm-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "SPM에서 같은 외부 패키지의 두 가지 서로 다른 호환되지 않는 버전이 필요한 경우 어떻게 처리되는가?",
    choices: [
      { id: "a", text: "SPM은 단일 의존성 그래프를 유지하므로 호환 가능한 단일 버전을 해결할 수 없으면 빌드가 실패한다." },
      { id: "b", text: "두 버전을 모두 다른 모듈 이름으로 자동 설치한다." },
      { id: "c", text: "더 높은 버전을 우선 선택하고 낮은 버전을 자동 제거한다." },
      { id: "d", text: "로컬 package override를 사용해 두 버전을 동시에 사용할 수 있다." }
    ],
    correctChoiceId: "a",
    explanation: "SPM은 단일 의존성 그래프를 유지한다. 두 패키지가 동일한 외부 패키지의 상호 호환되지 않는 버전(예: 1.x vs 2.x)을 요구하면 단일 버전으로 해결할 수 없어 빌드가 실패한다. 이 경우 중간 버전 제약을 조정하거나 fork로 해결해야 한다.",
    relatedTopicSlugs: ["11-build-system/spm"]
  },

  // ────────────────────────────────────────────────
  // static-vs-dynamic-libraries (add: 4)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-static-vs-dynamic-libraries-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "Static Library와 Dynamic Library의 결합 시점 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "Static Library는 링크 타임에 실행 파일에 코드가 복사되고, Dynamic Library는 런치 또는 런타임에 dyld가 로드한다." },
      { id: "b", text: "Static Library는 런타임에, Dynamic Library는 빌드 타임에 결합된다." },
      { id: "c", text: "둘 다 링크 타임에 결합되지만 Static은 패키지 단위, Dynamic은 심볼 단위로 처리된다." },
      { id: "d", text: "Static Library는 Xcode에서만 사용 가능하고 Dynamic은 CLI에서만 사용한다." }
    ],
    correctChoiceId: "a",
    explanation: "Static Library(.a)는 ld가 링크 타임에 필요한 심볼의 .o를 실행 파일에 복사한다. Dynamic Library(.dylib)는 링크 시 참조만 기록하고 dyld가 앱 시작 시 파일을 mmap해 로드한다.",
    relatedTopicSlugs: ["11-build-system/static-vs-dynamic-libraries"]
  },
  {
    id: "objective-c11-intermediate-static-vs-dynamic-libraries-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "iOS에서 third-party dynamic library가 여러 프로세스 간 코드 페이지를 공유할 수 없는 이유는?",
    choices: [
      { id: "a", text: "앱 번들 내 Frameworks/에 들어간 dylib은 앱 프로세스 단위로만 로드되며 시스템 dylib만 공유 캐시를 사용하기 때문이다." },
      { id: "b", text: "iOS의 ASLR이 dylib 공유를 완전히 금지하기 때문이다." },
      { id: "c", text: "dynamic library는 fat binary 형식을 지원하지 않기 때문이다." },
      { id: "d", text: "App Store가 dylib 업로드를 제한하기 때문이다." }
    ],
    correctChoiceId: "a",
    explanation: "시스템 dylib(/usr/lib, /System/Library/Frameworks)만 dyld shared cache를 통해 프로세스 간 페이지 공유가 된다. 앱 번들 Frameworks/ 내 third-party dylib은 해당 앱 프로세스만 로드하므로 코드 공유 이점이 없다.",
    relatedTopicSlugs: ["11-build-system/static-vs-dynamic-libraries"]
  },
  {
    id: "objective-c11-intermediate-static-vs-dynamic-libraries-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "같은 라이브러리가 Static으로 여러 모듈에 중복 링크될 때 발생할 수 있는 심각한 문제는?",
    choices: [
      { id: "a", text: "동일 심볼이 두 곳에 정의되어 싱글톤이 두 개 존재하거나 +load가 두 번 호출될 수 있다." },
      { id: "b", text: "링크 속도가 느려질 뿐 런타임 동작에는 영향이 없다." },
      { id: "c", text: "Xcode가 자동으로 중복을 감지해 빌드를 중단한다." },
      { id: "d", text: "바이너리 크기가 줄어들지만 런치 시간이 증가한다." }
    ],
    correctChoiceId: "a",
    explanation: "같은 심볼이 두 모듈에 정적으로 링크되면 duplicate symbol 에러 또는 두 버전이 모두 로드되는 상황이 발생한다. 후자의 경우 dispatch_once 기반 싱글톤이 두 개 생기거나 +load가 두 번 불려 예측 불가한 동작을 유발한다. CocoaPods 환경에서 흔히 발생한다.",
    relatedTopicSlugs: ["11-build-system/static-vs-dynamic-libraries"]
  },
  {
    id: "objective-c11-advanced-static-vs-dynamic-libraries-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "@rpath, @executable_path, @loader_path의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "@rpath는 호스트의 LC_RPATH가 지정한 경로 집합, @executable_path는 메인 실행 파일 기준, @loader_path는 해당 dylib을 로드한 모듈 기준 경로다." },
      { id: "b", text: "@rpath는 절대 경로, @executable_path는 홈 디렉터리 기준, @loader_path는 현재 작업 디렉터리 기준이다." },
      { id: "c", text: "셋 모두 dyld가 런타임에 /usr/lib를 가리키는 별칭이다." },
      { id: "d", text: "@rpath는 SPM 전용, @executable_path는 CocoaPods 전용, @loader_path는 Carthage 전용이다." }
    ],
    correctChoiceId: "a",
    explanation: "@rpath는 LC_RPATH load command로 호스트가 지정한 탐색 경로 집합을 순서대로 검색한다. @executable_path는 메인 실행 파일(앱 바이너리)이 있는 디렉터리, @loader_path는 해당 dylib을 dlopen/로드한 모듈의 디렉터리다. embedded framework는 보통 @rpath/Foo.framework/Foo + LC_RPATH @executable_path/Frameworks 조합을 사용한다.",
    relatedTopicSlugs: ["11-build-system/static-vs-dynamic-libraries"]
  },

  // ────────────────────────────────────────────────
  // xcode-build (add: 5)
  // ────────────────────────────────────────────────
  {
    id: "objective-c11-basic-xcode-build-001",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "Xcode의 Target, Scheme, Configuration 개념을 올바르게 설명한 것은?",
    choices: [
      { id: "a", text: "Target은 빌드 결과물 단위, Configuration은 빌드 모드(Debug/Release), Scheme은 어떤 Target+Configuration 조합으로 실행/테스트/배포할지 정의한다." },
      { id: "b", text: "Scheme은 빌드 결과물 단위, Target은 빌드 모드, Configuration은 실행 조합을 정의한다." },
      { id: "c", text: "Configuration은 빌드 결과물 단위, Scheme은 빌드 모드, Target은 실행 조합이다." },
      { id: "d", text: "셋은 모두 동의어로 Xcode에서 상호 교체 가능하다." }
    ],
    correctChoiceId: "a",
    explanation: "Target은 App, Test, Framework 같은 빌드 산출물 하나를 가리킨다. Configuration은 Debug/Release 같은 빌드 모드다. Scheme은 Run/Test/Archive 액션별로 어느 Target을 어느 Configuration으로 실행할지를 정의하는 실행 계획이다.",
    relatedTopicSlugs: ["11-build-system/xcode-build"]
  },
  {
    id: "objective-c11-basic-xcode-build-002",
    type: "objective",
    level: "basic",
    category: "Build",
    prompt: "Xcode Build Phase 중 'Run Script'의 Input/Output Files를 명시해야 하는 이유는?",
    choices: [
      { id: "a", text: "변경된 경우에만 스크립트를 실행하도록 incremental 빌드가 작동하게 하기 위해서다." },
      { id: "b", text: "스크립트 실행 순서를 보장하기 위해서다." },
      { id: "c", text: "Xcode가 스크립트 내용을 미리 파싱해 에러를 감지하기 위해서다." },
      { id: "d", text: "CI 환경에서만 필요하며 로컬 빌드에는 영향이 없다." }
    ],
    correctChoiceId: "a",
    explanation: "Run Script Phase에 Input/Output Files를 명시하면 Xcode가 해당 파일이 변경되었을 때만 스크립트를 재실행한다. 명시하지 않으면 매 빌드마다 무조건 실행되어 incremental 빌드 효과를 잃는다.",
    relatedTopicSlugs: ["11-build-system/xcode-build"]
  },
  {
    id: "objective-c11-intermediate-xcode-build-001",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "xcconfig 파일을 사용해 빌드 설정을 외부화하는 주된 이유는?",
    choices: [
      { id: "a", text: "설정이 텍스트 파일로 분리되어 PR merge 시 .xcodeproj 충돌을 줄이고 diff를 읽기 쉽게 한다." },
      { id: "b", text: "Xcode UI에서는 설정할 수 없는 고급 옵션을 활성화하기 위해서다." },
      { id: "c", text: "빌드 시간을 단축하는 컴파일러 최적화를 자동 적용하기 위해서다." },
      { id: "d", text: "App Store 심사 통과를 위한 필수 요구 사항이기 때문이다." }
    ],
    correctChoiceId: "a",
    explanation: "xcconfig는 빌드 설정을 .xcodeproj 내부가 아닌 별도 텍스트 파일로 관리한다. 여러 개발자가 동시에 빌드 설정을 변경해도 텍스트 diff/merge가 직관적이며 PR 리뷰도 용이해진다.",
    relatedTopicSlugs: ["11-build-system/xcode-build"]
  },
  {
    id: "objective-c11-intermediate-xcode-build-002",
    type: "objective",
    level: "intermediate",
    category: "Build",
    prompt: "Xcode에서 Archive와 Release Configuration의 차이로 옳은 것은?",
    choices: [
      { id: "a", text: "Archive는 배포용 .xcarchive를 만드는 액션으로 보통 Release configuration을 사용하며 dSYM을 보존한다." },
      { id: "b", text: "Archive와 Release는 동일한 의미로 같은 산출물을 만든다." },
      { id: "c", text: "Archive는 Debug configuration을 사용하고 Release는 최적화만 적용한다." },
      { id: "d", text: "Archive는 시뮬레이터 전용 빌드이고 Release는 디바이스 전용이다." }
    ],
    correctChoiceId: "a",
    explanation: "Archive는 Xcode의 액션으로 배포용 산출물인 .xcarchive를 생성한다. 보통 Release configuration을 사용하며 dSYM(디버그 심볼)을 보존해 이후 crash log symbolication이 가능하다. Release configuration은 단순 빌드 모드 설정이다.",
    relatedTopicSlugs: ["11-build-system/xcode-build"]
  },
  {
    id: "objective-c11-advanced-xcode-build-001",
    type: "objective",
    level: "advanced",
    category: "Build",
    prompt: "환경별(dev/staging/prod) 분리를 위해 Xcode에서 사용할 수 있는 방법 중 동일 Target에서 여러 Bundle ID를 사용하는 패턴은?",
    choices: [
      { id: "a", text: "Configuration을 추가(Dev/Staging/Release)하고 xcconfig에서 PRODUCT_BUNDLE_IDENTIFIER를 각각 정의한다." },
      { id: "b", text: "Scheme마다 별도 Target을 생성해 각기 다른 Bundle ID를 설정한다." },
      { id: "c", text: "Info.plist에서 런타임에 Bundle ID를 동적으로 변경한다." },
      { id: "d", text: "환경 변수를 앱 코드에서 직접 읽어 Bundle ID를 런타임에 분기한다." }
    ],
    correctChoiceId: "a",
    explanation: "동일 Target 안에서 Configuration을 Dev/Staging/Release로 추가하고 각 xcconfig에서 PRODUCT_BUNDLE_IDENTIFIER를 다르게 설정하면 같은 Target으로 환경별 Bundle ID를 사용할 수 있다. 완전히 독립된 앱이 필요하면 Target 분리 방식을 택한다.",
    relatedTopicSlugs: ["11-build-system/xcode-build"]
  }
];
