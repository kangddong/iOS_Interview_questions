import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── accessibility (add 4) ────────────────────────────────────────────────
  {
    id: "objective-c16-basic-accessibility-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt:
      "VoiceOver가 화면 요소를 발화할 때 사용하는 속성 4가지를 순서대로 올바르게 나열한 것은?",
    choices: [
      { id: "a", text: "label → value → traits → hint" },
      { id: "b", text: "identifier → label → hint → traits" },
      { id: "c", text: "hint → value → label → traits" },
      { id: "d", text: "traits → label → value → identifier" },
    ],
    correctChoiceId: "a",
    explanation:
      "VoiceOver는 요소를 읽을 때 accessibilityLabel(무엇인지) → accessibilityValue(현재 값) → accessibilityTraits(의미) 순으로 발화합니다. accessibilityHint는 사용자가 설정에서 끌 수 있기 때문에 필수 정보를 넣어서는 안 됩니다.",
    relatedTopicSlugs: ["16-real-world/accessibility"],
  },
  {
    id: "objective-c16-intermediate-accessibility-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "카드 UI 안에 이미지·제목·부제목·가격 등 4개의 뷰가 있을 때, VoiceOver 사용자가 카드를 한 번의 스와이프로 모두 들을 수 있게 만드는 가장 적절한 방법은?",
    choices: [
      {
        id: "a",
        text: "accessibilityElement(children: .combine)으로 부모 컨테이너를 그룹화한다",
      },
      {
        id: "b",
        text: "각 자식 뷰에 .accessibilityHidden(true)를 설정해 개수를 줄인다",
      },
      {
        id: "c",
        text: "accessibilitySortPriority를 0으로 통일해 순서를 없앤다",
      },
      { id: "d", text: "accessibilityIdentifier를 동일 키로 지정한다" },
    ],
    correctChoiceId: "a",
    explanation:
      "accessibilityElement(children: .combine)을 컨테이너에 적용하면 자식 요소들이 하나의 접근성 요소로 합쳐져 VoiceOver가 한 호흡으로 읽습니다. 추가 인터랙션이 필요하면 accessibilityAction(named:)으로 rotor 항목을 등록합니다.",
    relatedTopicSlugs: ["16-real-world/accessibility"],
  },
  {
    id: "objective-c16-intermediate-accessibility-003",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "accessibilityLabel과 accessibilityIdentifier의 차이를 가장 정확하게 설명한 것은?",
    choices: [
      {
        id: "a",
        text: "accessibilityLabel은 VoiceOver가 읽는 현지화 문자열이고, accessibilityIdentifier는 UI 테스트용 안정 키로 번역되지 않는다",
      },
      {
        id: "b",
        text: "둘 다 VoiceOver 발화에 사용되지만 accessibilityIdentifier가 우선 순위가 높다",
      },
      {
        id: "c",
        text: "accessibilityIdentifier는 사용자에게 노출되고 accessibilityLabel은 UI 테스트 셀렉터로만 쓰인다",
      },
      {
        id: "d",
        text: "accessibilityLabel은 앱 재배포 없이 바꿀 수 없으나 accessibilityIdentifier는 동적으로 변경 가능하다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "accessibilityLabel은 VoiceOver가 사용자에게 읽어주는 현지화된 텍스트이고, accessibilityIdentifier는 XCUITest에서 요소를 찾기 위한 번역되지 않는 안정 키입니다. 테스트에서 accessibilityLabel을 셀렉터로 쓰면 카피 변경마다 테스트가 깨집니다.",
    relatedTopicSlugs: ["16-real-world/accessibility"],
  },
  {
    id: "objective-c16-advanced-accessibility-004",
    type: "objective",
    level: "advanced",
    category: "Real-World iOS",
    prompt:
      "Xcode 15+에서 CI 파이프라인에 접근성 회귀를 자동 검출하는 가장 직접적인 방법은?",
    choices: [
      {
        id: "a",
        text: "XCUIApplication().performAccessibilityAudit()를 단위 테스트에 추가해 contrast·터치 크기·Dynamic Type를 검사한다",
      },
      {
        id: "b",
        text: "Accessibility Inspector를 CI 서버에 설치하고 수동으로 실행한다",
      },
      {
        id: "c",
        text: "SwiftLint의 accessibility 규칙을 활성화한다",
      },
      {
        id: "d",
        text: "Info.plist에 UIAccessibilityEnabled 키를 true로 설정한다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Xcode 15+에서 추가된 XCUIApplication().performAccessibilityAudit()를 사용하면 contrast ratio, 최소 터치 크기(44×44pt), Dynamic Type 대응 여부 등을 자동으로 감사해 CI에서 회귀를 감지할 수 있습니다.",
    relatedTopicSlugs: ["16-real-world/accessibility"],
  },

  // ── deep-linking-and-universal-links (add 4) ─────────────────────────────
  {
    id: "objective-c16-basic-deep-linking-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt:
      "Universal Links가 Custom URL scheme보다 보안상 우수한 핵심 이유는?",
    choices: [
      {
        id: "a",
        text: "서버가 apple-app-site-association 파일로 도메인 소유권을 증명해야 하므로 타 앱이 가로챌 수 없다",
      },
      {
        id: "b",
        text: "iOS가 마지막으로 설치된 앱에만 scheme 사용 권한을 부여하기 때문이다",
      },
      {
        id: "c",
        text: "Universal Links는 Info.plist 등록 없이 동작해서 조작이 불가능하다",
      },
      {
        id: "d",
        text: "Universal Links payload는 TLS로 암호화되어 내용 노출이 없기 때문이다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Custom URL scheme은 누구나 동일 scheme을 등록해 가로챌 수 있지만, Universal Links는 https 도메인의 /.well-known/apple-app-site-association 파일을 통해 서버가 소유권을 증명해야 합니다. 따라서 악성 앱이 동일 URL을 가로채는 것이 불가능합니다.",
    relatedTopicSlugs: ["16-real-world/deep-linking-and-universal-links"],
  },
  {
    id: "objective-c16-intermediate-deep-linking-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "Universal Links가 작동하기 위해 반드시 충족해야 하는 세 가지 조건 중 하나가 아닌 것은?",
    choices: [
      {
        id: "a",
        text: "Info.plist의 NSAppTransportSecurity를 모두 허용으로 설정",
      },
      {
        id: "b",
        text: "/.well-known/apple-app-site-association 파일이 서버에 Content-Type application/json으로 호스팅",
      },
      {
        id: "c",
        text: "Xcode Associated Domains capability에 applinks:example.com 항목 추가",
      },
      {
        id: "d",
        text: "사용자가 앱 내부가 아닌 외부(Safari, 메시지 등)에서 링크를 탭",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Universal Links 작동의 세 조건은 (1) AASA 파일 서버 호스팅, (2) Associated Domains entitlement 설정, (3) 외부에서 링크 탭입니다. NSAppTransportSecurity 전면 허용은 Universal Links와 무관하며 오히려 보안상 하지 말아야 합니다.",
    relatedTopicSlugs: ["16-real-world/deep-linking-and-universal-links"],
  },
  {
    id: "objective-c16-intermediate-deep-linking-003",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "apple-app-site-association(AASA) 파일을 업데이트했는데 기기에 즉시 반영되지 않는 이유와 개발 시 우회 방법으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "Apple CDN이 AASA를 최대 며칠간 캐시하며, 개발 중에는 Associated Domains에 ?mode=developer를 추가해 우회한다",
      },
      {
        id: "b",
        text: "iOS가 앱 업데이트 시에만 AASA를 재다운로드하므로 TestFlight 재배포가 유일한 방법이다",
      },
      {
        id: "c",
        text: "AASA는 24시간 로컬 디스크 캐시로 저장되며, 기기를 재부팅하면 즉시 갱신된다",
      },
      {
        id: "d",
        text: "CDN 캐시 문제는 없으며, 반영 지연은 항상 서버 설정 오류다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "iOS 14+부터 AASA는 Apple CDN(app-site-association.cdn-apple.com)이 24시간~며칠 캐시합니다. 개발 중에는 Associated Domains 값에 applinks:example.com?mode=developer를 추가하거나 앱을 재설치하면 강제 갱신됩니다.",
    relatedTopicSlugs: ["16-real-world/deep-linking-and-universal-links"],
  },
  {
    id: "objective-c16-advanced-deep-linking-004",
    type: "objective",
    level: "advanced",
    category: "Real-World iOS",
    prompt:
      "OAuth 결제 콜백을 Custom URL scheme으로 처리할 때 발생할 수 있는 보안 위협과 올바른 대응책은?",
    choices: [
      {
        id: "a",
        text: "악성 앱이 동일 scheme을 등록해 콜백을 가로챌 수 있으므로, Universal Links + state nonce 검증으로 대체해야 한다",
      },
      {
        id: "b",
        text: "iOS가 마지막 설치 앱 우선으로 scheme을 라우팅하므로 특별한 추가 검증 없이 안전하다",
      },
      {
        id: "c",
        text: "scheme 이름을 난독화하면 가로채기가 불가능하다",
      },
      {
        id: "d",
        text: "URLSession이 HTTPS를 강제하므로 Custom URL scheme 콜백도 암호화된다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Custom URL scheme은 같은 scheme을 등록한 악성 앱이 가로챌 수 있습니다. 결제·OAuth 콜백은 반드시 Universal Links로 교체하고, 세션에 저장된 state nonce와 매칭해 임의 라우팅을 방지해야 합니다.",
    relatedTopicSlugs: ["16-real-world/deep-linking-and-universal-links"],
  },

  // ── feature-flag-and-remote-config (add 4) ───────────────────────────────
  {
    id: "objective-c16-basic-feature-flag-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt:
      "Pete Hodgson의 분류에 따르면 '서버 부하 급증 시 특정 기능을 즉시 끄는 스위치'에 해당하는 feature flag 종류는?",
    choices: [
      { id: "a", text: "Ops flag (운영 스위치)" },
      { id: "b", text: "Release flag (출시 플래그)" },
      { id: "c", text: "Permission flag (권한 플래그)" },
      { id: "d", text: "Experiment flag (실험 플래그)" },
    ],
    correctChoiceId: "a",
    explanation:
      "Ops flag(운영 스위치)는 서버 부하, 외부 서비스 장애 등 운영 상황에서 기능을 즉각 차단하는 킬 스위치 용도입니다. Release flag는 미완성 기능 숨김, Experiment flag는 A/B 테스트, Permission flag는 특정 사용자 그룹 접근 제어에 사용합니다.",
    relatedTopicSlugs: ["16-real-world/feature-flag-and-remote-config"],
  },
  {
    id: "objective-c16-intermediate-feature-flag-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "앱 부팅 시 feature flag를 안전하게 초기화하는 올바른 전략은?",
    choices: [
      {
        id: "a",
        text: "캐시된 마지막 값을 즉시 활성화하고, 백그라운드에서 fetch 후 activate한다. 타임아웃은 2~3초로 제한한다",
      },
      {
        id: "b",
        text: "항상 서버에서 최신 값을 동기적으로 받은 뒤에 앱 UI를 표시한다",
      },
      {
        id: "c",
        text: "첫 실행에서는 SDK의 remote default 값을 신뢰하고 별도 처리하지 않는다",
      },
      {
        id: "d",
        text: "flag는 런타임에 실시간으로 평가하므로 부팅 전략이 필요 없다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "부팅 시 캐시된 값을 즉시 노출해 UI 깜빡임을 방지하고, 백그라운드 fetch 후 activate하는 방식이 권장 패턴입니다. 킬 스위치처럼 보안이 중요한 flag만 타임아웃(2~3초) 안에 동기 fetch를 기다립니다. 첫 실행 시 캐시가 없으면 코드에 박힌 compile-time default가 방어선이 됩니다.",
    relatedTopicSlugs: ["16-real-world/feature-flag-and-remote-config"],
  },
  {
    id: "objective-c16-intermediate-feature-flag-003",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "A/B 테스트에서 노출(exposure) 로그를 올바르게 기록하는 시점은?",
    choices: [
      {
        id: "a",
        text: "variant 값을 읽은 시점이 아니라, 해당 화면이 실제로 사용자에게 그려질 때 한 번만 기록한다",
      },
      { id: "b", text: "앱이 백그라운드로 진입할 때마다 기록한다" },
      {
        id: "c",
        text: "variant 값을 fetch할 때마다 기록해 정확성을 높인다",
      },
      {
        id: "d",
        text: "사용자가 해당 기능을 완료(convert)한 시점에 노출 로그도 함께 기록한다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "variant를 얻는 시점과 사용자가 실제로 보는 시점이 다르면 통계가 오염됩니다. 화면이 실제로 렌더링될 때 한 번만 노출 로그를 기록해야 하며, 중복 전송을 막기 위해 dedup key를 사용하는 것이 좋습니다.",
    relatedTopicSlugs: ["16-real-world/feature-flag-and-remote-config"],
  },
  {
    id: "objective-c16-advanced-feature-flag-004",
    type: "objective",
    level: "advanced",
    category: "Real-World iOS",
    prompt:
      "킬 스위치(kill switch) flag를 설계할 때 fail-safe 방향으로 올바르게 설정해야 하는 이유와 방법은?",
    choices: [
      {
        id: "a",
        text: "fetch 실패 시 기능을 차단하는 방향이 안전하므로, 결제 차단 킬 스위치의 compile-time default는 true(차단)로 설정한다",
      },
      {
        id: "b",
        text: "fetch 실패 시 항상 기능을 허용(fail-open)해야 사용자 경험이 좋다",
      },
      {
        id: "c",
        text: "킬 스위치는 서버에서만 평가하므로 클라이언트 default는 관계없다",
      },
      {
        id: "d",
        text: "exponential backoff로 무한 재시도하면 최종적으로 올바른 값을 받을 수 있다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "결제 차단 같은 보안 킬 스위치는 fetch가 실패했을 때 기능을 허용(fail-open)하면 안 됩니다. compile-time default를 '차단(true)'으로 설정해 fetch 실패 시에도 안전한 방향을 유지해야 합니다. 또한 무한 재시도 대신 exponential backoff로 부하를 줄이고, 번들 내 fallback JSON을 동봉하는 것이 완전한 방어 전략입니다.",
    relatedTopicSlugs: ["16-real-world/feature-flag-and-remote-config"],
  },

  // ── localization-and-i18n (add 4) ────────────────────────────────────────
  {
    id: "objective-c16-basic-localization-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt:
      "SwiftUI에서 Text(\"Hello\")와 Text(someStringVar)의 현지화 동작이 다른 이유는?",
    choices: [
      {
        id: "a",
        text: "문자열 리터럴은 LocalizedStringKey로 자동 추론되어 번역되지만, 변수는 String 타입으로 추론되어 번역되지 않는다",
      },
      {
        id: "b",
        text: "Text는 모든 String 값을 자동으로 번역하지만 변수를 사용하면 컴파일 오류가 난다",
      },
      {
        id: "c",
        text: "Text(someStringVar)는 런타임에 Localizable.strings를 조회하지만 캐시 미스가 발생한다",
      },
      {
        id: "d",
        text: "두 방식은 동일하게 동작하며 번역 결과도 같다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "SwiftUI의 Text 이니셜라이저는 문자열 리터럴을 LocalizedStringKey로 자동 추론해 번역을 수행하지만, 변수(String 타입)는 그냥 표시됩니다. 변수를 번역하려면 Text(LocalizedStringKey(someVar)) 또는 String(localized: someVar)를 사용해야 합니다.",
    relatedTopicSlugs: ["16-real-world/localization-and-i18n"],
  },
  {
    id: "objective-c16-intermediate-localization-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "복수형 처리를 if/else로 구현하면 안 되는 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "러시아어·아랍어처럼 zero/one/few/many/other 등 다중 카테고리를 가진 언어에서 정확한 복수형을 처리할 수 없다",
      },
      {
        id: "b",
        text: "if/else는 Swift 컴파일러가 경고를 발생시켜 앱 심사에서 거절된다",
      },
      {
        id: "c",
        text: "복수형은 항상 서버에서 처리해야 하므로 클라이언트 로직이 불필요하다",
      },
      {
        id: "d",
        text: "Xcode가 if/else 분기를 String Catalog에서 감지하지 못해 빌드가 실패한다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "영어는 one/other 두 가지지만 러시아어는 one/few/many, 아랍어는 zero/one/two/few/many/other까지 최대 6가지 복수형을 사용합니다. CLDR 표준을 따르는 stringsdict 또는 String Catalog의 plural variation을 써야 모든 언어를 정확히 처리할 수 있습니다.",
    relatedTopicSlugs: ["16-real-world/localization-and-i18n"],
  },
  {
    id: "objective-c16-intermediate-localization-003",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "iOS에서 숫자·통화를 String(format: \"%.2f\", price)로 포매팅하면 안 되는 이유는?",
    choices: [
      {
        id: "a",
        text: "소수점과 자릿수 구분자가 로케일마다 다르기 때문에(예: 독일 1.234,56 vs 미국 1,234.56) 로케일 인식 FormatStyle을 써야 한다",
      },
      {
        id: "b",
        text: "String(format:)은 Swift에서 deprecated되어 더 이상 동작하지 않는다",
      },
      {
        id: "c",
        text: "%.2f는 정수만 처리할 수 있어 소수점 이하 값이 잘린다",
      },
      {
        id: "d",
        text: "포매팅 결과가 항상 영문으로 반환되어 App Store 심사에서 거절된다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "String(format: \"%.2f\")는 C 표준을 따르므로 소수점은 항상 '.'을 사용합니다. 독일어 로케일에서는 1.234,56처럼 구분자가 반대이기 때문에, Decimal.FormatStyle이나 .currency(code:) 같은 로케일 인식 API를 사용해야 합니다.",
    relatedTopicSlugs: ["16-real-world/localization-and-i18n"],
  },
  {
    id: "objective-c16-advanced-localization-004",
    type: "objective",
    level: "advanced",
    category: "Real-World iOS",
    prompt:
      "String Catalogs(.xcstrings)가 기존 Localizable.strings + stringsdict 조합에 비해 갖는 가장 큰 실무 이점은?",
    choices: [
      {
        id: "a",
        text: "빌드 시 코드에서 사용하는 키를 자동 추출하고 Xcode UI에서 누락된 번역을 추적해 번역 누락을 사전에 방지한다",
      },
      {
        id: "b",
        text: "런타임 성능이 크게 향상되어 번역 문자열 조회 속도가 10배 빠르다",
      },
      {
        id: "c",
        text: "서버에서 OTA(over-the-air)로 번역을 즉시 업데이트할 수 있다",
      },
      {
        id: "d",
        text: "RTL 언어 레이아웃 미러링을 자동으로 처리해 별도 코드가 필요 없다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "String Catalog(.xcstrings, iOS 17+ / Xcode 15+)의 핵심 장점은 빌드 시 소스 코드에서 키를 자동 추출하고, 번역이 누락된 항목을 Xcode GUI에서 실시간으로 추적할 수 있다는 점입니다. 기존 방식에서는 genstrings를 수동으로 실행해야 했고 누락 감지가 어려웠습니다.",
    relatedTopicSlugs: ["16-real-world/localization-and-i18n"],
  },

  // ── push-notification (add 3) ────────────────────────────────────────────
  {
    id: "objective-c16-basic-push-notification-001",
    type: "objective",
    level: "basic",
    category: "Real-World iOS",
    prompt:
      "APNs Provider 인증 방식 중 p8(Token-based, JWT ES256)이 p12(Certificate-based)보다 권장되는 이유는?",
    choices: [
      {
        id: "a",
        text: "키 하나로 여러 앱과 환경(sandbox/production)을 커버하며 1년마다 교체할 필요가 없고 1시간 단위로 JWT가 자동 회전된다",
      },
      {
        id: "b",
        text: "p8은 payload 암호화를 지원하지만 p12는 평문 전송만 가능하기 때문이다",
      },
      {
        id: "c",
        text: "p8은 iOS 기기에 직접 설치되어 네트워크 없이도 동작하기 때문이다",
      },
      {
        id: "d",
        text: "Apple이 p12를 iOS 16부터 공식적으로 제거했기 때문이다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "p8(Token-based) 인증은 하나의 키로 팀 내 모든 앱과 sandbox/production 환경을 커버하며, JWT가 1시간 단위로 자동 갱신되어 별도 인증서 교체 작업이 필요 없습니다. p12는 앱별·환경별로 인증서를 발급받아야 하고 1년마다 교체해야 하는 운영 부담이 있습니다.",
    relatedTopicSlugs: ["16-real-world/push-notification"],
  },
  {
    id: "objective-c16-intermediate-push-notification-002",
    type: "objective",
    level: "intermediate",
    category: "Real-World iOS",
    prompt:
      "Notification Service Extension(NSE)에서 가공 작업이 30초 안에 완료되지 않을 때 올바른 처리 방법은?",
    choices: [
      {
        id: "a",
        text: "serviceExtensionTimeWillExpire()에서 bestAttempt 또는 원본 content를 contentHandler에 전달해 최소한 원본 알림이 표시되도록 한다",
      },
      {
        id: "b",
        text: "작업을 취소하고 아무 알림도 표시하지 않는다",
      },
      {
        id: "c",
        text: "Background Task를 요청해 작업을 추가 30초 연장한다",
      },
      {
        id: "d",
        text: "contentHandler를 호출하지 않으면 시스템이 자동으로 재시도한다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "NSE에 주어진 처리 시간은 최대 30초입니다. 시간 초과가 임박하면 serviceExtensionTimeWillExpire()가 호출되며, 이때 contentHandler에 bestAttempt(현재까지 가공된 내용) 또는 원본 request.content를 전달해 사용자가 최소한 알림을 받을 수 있게 해야 합니다.",
    relatedTopicSlugs: ["16-real-world/push-notification"],
  },
  {
    id: "objective-c16-advanced-push-notification-003",
    type: "objective",
    level: "advanced",
    category: "Real-World iOS",
    prompt:
      "서버에서 APNs 응답으로 400 BadDeviceToken 오류가 폭증할 때 가장 가능성이 높은 원인과 해결 방법은?",
    choices: [
      {
        id: "a",
        text: "sandbox와 production 환경 토큰을 혼용하고 있을 가능성이 높다. 토큰 저장 시 환경 태그를 함께 기록하고 환경에 맞는 APNs 엔드포인트로 발송해야 한다",
      },
      {
        id: "b",
        text: "p8 키가 만료됐기 때문이며 Apple Developer 콘솔에서 새 키를 발급해야 한다",
      },
      {
        id: "c",
        text: "payload 크기가 4KB를 초과해 Apple이 토큰을 무효화했기 때문이다",
      },
      {
        id: "d",
        text: "apns-priority를 10으로 설정해 throttle이 걸렸기 때문이며 5로 낮추면 해결된다",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "BadDeviceToken 폭증의 가장 흔한 원인은 sandbox/production 토큰 혼용입니다. Debug 빌드는 sandbox APNs(api.sandbox.push.apple.com)를 사용하고, TestFlight와 App Store 빌드는 production APNs를 사용합니다. 토큰을 서버에 저장할 때 반드시 환경(sandbox/prod)을 함께 기록하고, 발송 시 해당 환경의 엔드포인트를 사용해야 합니다.",
    relatedTopicSlugs: ["16-real-world/push-notification"],
  },
];
