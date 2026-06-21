import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ─── app-lifecycle (5) ───────────────────────────────────────────────────
  {
    id: "objective-c04-basic-app-lifecycle-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "iOS 13+에서 AppDelegate와 SceneDelegate의 책임 분리가 올바르게 설명된 것은?",
    choices: [
      {
        id: "a",
        text: "AppDelegate는 앱 자체의 생애(런치, 푸시 등록)를 담당하고, SceneDelegate는 UI 화면(Scene)의 생애(foreground/background 전환)를 담당한다.",
      },
      {
        id: "b",
        text: "SceneDelegate는 앱 자체의 생애를 담당하고, AppDelegate는 UI 화면의 생애를 담당한다.",
      },
      {
        id: "c",
        text: "iOS 13+에서는 AppDelegate가 완전히 제거되고 SceneDelegate로 일원화된다.",
      },
      {
        id: "d",
        text: "Scene 설정(UISceneSession 구성)은 SceneDelegate의 책임이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "iOS 13부터 앱 자체의 생애(런치, 종료, 백그라운드 페치 등)는 AppDelegate가, UI 화면(Scene)의 생애(foreground/background 전환, 딥링크 URL 오픈)는 SceneDelegate가 담당한다. Scene 설정(UISceneSession 구성)은 AppDelegate의 configurationForConnecting에서 처리한다.",
    relatedTopicSlugs: ["04-uikit/app-lifecycle"],
  },
  {
    id: "objective-c04-basic-app-lifecycle-002",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "앱이 포그라운드에서 전화 수신으로 일시 중단될 때 호출되는 SceneDelegate 콜백은?",
    choices: [
      { id: "a", text: "sceneDidEnterBackground(_:)" },
      { id: "b", text: "sceneWillResignActive(_:)" },
      { id: "c", text: "sceneWillEnterForeground(_:)" },
      { id: "d", text: "scene(_:willConnectTo:options:)" },
    ],
    correctChoiceId: "b",
    explanation:
      "sceneWillResignActive(_:)는 전화 수신·제어 센터 열기·앱 전환 화면 진입 등 짧은 인터럽트 상황에서 호출된다. sceneDidEnterBackground(_:)는 실제로 앱이 백그라운드로 진입했을 때 호출된다. 데이터 저장은 보통 didEnterBackground에서 수행한다.",
    relatedTopicSlugs: ["04-uikit/app-lifecycle"],
  },
  {
    id: "objective-c04-intermediate-app-lifecycle-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "사용자가 앱 스위처에서 앱을 강제 종료(force kill)할 때 동작에 대한 설명으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "applicationWillTerminate(_:)가 반드시 호출되므로 그 시점에 데이터를 저장할 수 있다.",
      },
      {
        id: "b",
        text: "강제 종료 시 applicationWillTerminate는 호출되지 않으므로, 백그라운드 진입 시점에 데이터를 저장해야 한다.",
      },
      { id: "c", text: "강제 종료 시 앱은 항상 Suspended 상태로 전환된 뒤 종료된다." },
      {
        id: "d",
        text: "BGTaskScheduler를 사용하면 강제 종료 직전에 저장 작업을 보장할 수 있다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "사용자가 앱 스위처에서 앱을 강제 종료하면 applicationWillTerminate(_:)가 호출되지 않는다. 따라서 그 시점에 저장하려 하면 늦으며, 백그라운드로 진입하는 시점(sceneDidEnterBackground 또는 applicationDidEnterBackground)에 미리 저장해야 한다.",
    relatedTopicSlugs: ["04-uikit/app-lifecycle"],
  },
  {
    id: "objective-c04-intermediate-app-lifecycle-004",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "iOS 13+에서 URL 스킴(딥링크)을 처리하는 올바른 위치는?",
    choices: [
      { id: "a", text: "AppDelegate의 application(_:open:options:)" },
      { id: "b", text: "SceneDelegate의 scene(_:openURLContexts:)" },
      { id: "c", text: "AppDelegate의 configurationForConnecting(_:options:)" },
      { id: "d", text: "SceneDelegate의 sceneWillEnterForeground(_:)" },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS 13+ Scene을 사용하는 앱에서는 URL 스킴(딥링크) 처리를 SceneDelegate의 scene(_:openURLContexts:)에서 한다. AppDelegate-only 환경(iOS 12 이하 또는 Scene Manifest 비활성화)에서는 application(_:open:options:)를 사용한다.",
    relatedTopicSlugs: ["04-uikit/app-lifecycle"],
  },
  {
    id: "objective-c04-advanced-app-lifecycle-005",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "SwiftUI App 라이프사이클에서 Scene 상태 변화를 감지하는 올바른 방법과, UIKit AppDelegate를 함께 쓰는 방법이 모두 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "@Environment(\\.scenePhase)로 상태를 감지하고, UIKit AppDelegate는 @UIApplicationDelegateAdaptor로 연결한다.",
      },
      {
        id: "b",
        text: "@State var scenePhase로 상태를 감지하고, UIKit AppDelegate는 @UIApplicationDelegateAdaptor로 연결한다.",
      },
      {
        id: "c",
        text: "@Environment(\\.scenePhase)로 상태를 감지하고, UIKit AppDelegate는 @ObservableObject로 연결한다.",
      },
      {
        id: "d",
        text: "SwiftUI App 라이프사이클에서는 UIKit AppDelegate를 사용할 수 없다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "SwiftUI App 라이프사이클에서는 @Environment(\\.scenePhase)로 active/inactive/background 상태를 감지하고 .onChange(of:) 수식어로 반응한다. UIKit AppDelegate 기능이 필요한 경우 @UIApplicationDelegateAdaptor 프로퍼티 래퍼로 AppDelegate 클래스를 연결할 수 있다.",
    relatedTopicSlugs: ["04-uikit/app-lifecycle"],
  },

  // ─── auto-layout (3) ─────────────────────────────────────────────────────
  {
    id: "objective-c04-basic-auto-layout-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "두 UILabel이 나란히 배치되었을 때, 공간이 부족하면 A가 B보다 더 많이 잘리게 하려면?",
    choices: [
      { id: "a", text: "A의 Content Compression Resistance Priority를 B보다 높게 설정한다." },
      { id: "b", text: "A의 Content Compression Resistance Priority를 B보다 낮게 설정한다." },
      { id: "c", text: "A의 Content Hugging Priority를 B보다 낮게 설정한다." },
      { id: "d", text: "A의 Content Hugging Priority를 B보다 높게 설정한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Content Compression Resistance Priority(CCRP)는 '자기 intrinsic size보다 작아지지 않으려는 성향'이다. CCRP가 낮을수록 공간 부족 시 더 많이 잘린다. 따라서 A를 B보다 더 잘리게 하려면 A의 CCRP를 B보다 낮게 설정한다.",
    relatedTopicSlugs: ["04-uikit/auto-layout"],
  },
  {
    id: "objective-c04-intermediate-auto-layout-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "Auto Layout 제약 애니메이션을 올바르게 구현한 코드는?",
    choices: [
      {
        id: "a",
        text: "heightConstraint.constant = 200을 설정한 뒤, UIView.animate 블록 안에서 view.layoutIfNeeded()를 호출한다.",
      },
      {
        id: "b",
        text: "UIView.animate 블록 안에서 heightConstraint.constant = 200을 설정하고 끝낸다.",
      },
      {
        id: "c",
        text: "UIView.animate 블록 안에서 view.frame.size.height = 200을 직접 변경한다.",
      },
      {
        id: "d",
        text: "setNeedsLayout() 호출 후 UIView.animate 블록 안에서 view.setNeedsDisplay()를 호출한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "Auto Layout은 update constraints → layout → display의 3단계 패스로 돌며, 각 패스는 트리거 메서드로 \"예약\"만 한다. 제약 상수만 바꾸면 변경이 다음 주기에 한 번에 튀므로, UIView.animate 블록 *안*에서 layoutIfNeeded()를 호출해 layout 패스를 즉시 실행시켜야 frame 변화가 보간된다. frame을 직접 수정하면 다음 layout 패스에서 제약대로 되돌아가며 snap back된다.",
    relatedTopicSlugs: ["04-uikit/auto-layout"],
  },
  {
    id: "objective-c04-intermediate-auto-layout-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "코드로 UIView의 제약을 추가할 때 'Unable to simultaneously satisfy constraints' 로그가 폭주하는 가장 흔한 원인은?",
    choices: [
      { id: "a", text: "NSLayoutConstraint.activate 대신 addConstraint를 사용했다." },
      { id: "b", text: "translatesAutoresizingMaskIntoConstraints를 false로 설정하지 않았다." },
      { id: "c", text: "Content Hugging Priority를 기본값 그대로 두었다." },
      { id: "d", text: "leading/trailing 대신 left/right anchor를 사용했다." },
    ],
    correctChoiceId: "b",
    explanation:
      "translatesAutoresizingMaskIntoConstraints를 false로 설정하지 않으면 시스템이 옛 autoresizing mask를 NSLayoutConstraint로 자동 변환해 추가한다. 이 자동 생성 제약이 개발자가 추가한 제약과 충돌하여 'Unable to simultaneously satisfy constraints' 경고가 폭주한다. 코드로 뷰를 생성해 추가할 때는 반드시 false로 설정해야 한다.",
    relatedTopicSlugs: ["04-uikit/auto-layout"],
  },

  // ─── core-animation (4) ──────────────────────────────────────────────────
  {
    id: "objective-c04-basic-core-animation-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "UIView와 CALayer의 관계에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "CALayer가 UIView를 감싸는 wrapper이며, 터치 이벤트 처리를 담당한다." },
      {
        id: "b",
        text: "UIView는 CALayer를 감싸는 wrapper이며, 실제 시각 표현의 주체는 CALayer이다.",
      },
      { id: "c", text: "UIView와 CALayer는 독립적이며 선택적으로 연결할 수 있다." },
      { id: "d", text: "CALayer는 UIView의 서브클래스이다." },
    ],
    correctChoiceId: "b",
    explanation:
      "UIView는 사실 CALayer를 감싼 얇은 wrapper다. 코너 반경, 그림자, 마스크, transform 같은 시각 표현의 실질적 주체는 CALayer이고, UIView는 그 위에 터치 처리 같은 기능을 추가한 컨테이너다. 모든 UIView는 자기 layer를 1:1로 소유한다.",
    relatedTopicSlugs: ["04-uikit/core-animation"],
  },
  {
    id: "objective-c04-intermediate-core-animation-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "CABasicAnimation을 사용한 후 애니메이션이 끝나면 뷰가 원위치로 돌아오는 이유와 해결책으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "CABasicAnimation은 model 값을 변경하지 않기 때문이다. 해결책: 완료 후 모델 값을 직접 set하거나 fillMode + isRemovedOnCompletion = false를 사용한다.",
      },
      {
        id: "b",
        text: "UIView.animate를 사용해야 model 값이 변경된다. CABasicAnimation은 model을 항상 원위치로 복구한다.",
      },
      {
        id: "c",
        text: "CATransaction.commit()을 호출하지 않아서 model 값이 유지되지 않기 때문이다.",
      },
      {
        id: "d",
        text: "presentationLayer에 값을 set해야 유지되기 때문이다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "CABasicAnimation은 presentationLayer의 시각적 값만 변경하고 modelLayer(실제 값)는 바꾸지 않는다. 애니메이션이 제거되면 presentationLayer가 modelLayer 값으로 돌아온다. 해결책은 애니메이션 종료 전에 layer의 model 값을 목표값으로 직접 set하거나, fillMode = .forwards와 isRemovedOnCompletion = false를 조합하는 것이다.",
    relatedTopicSlugs: ["04-uikit/core-animation"],
  },
  {
    id: "objective-c04-intermediate-core-animation-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "애니메이션 중에 뷰의 현재 화면 위치(실제 보이는 위치)를 알고 싶을 때 사용해야 하는 것은?",
    choices: [
      { id: "a", text: "layer.frame" },
      { id: "b", text: "layer.presentation()?.frame 또는 layer.presentation()?.position" },
      { id: "c", text: "view.frame" },
      { id: "d", text: "layer.bounds" },
    ],
    correctChoiceId: "b",
    explanation:
      "modelLayer(layer.frame, view.frame)는 애니메이션 중에도 최종 목표값을 가리킨다. 실제로 화면에 보이는 현재 위치는 presentationLayer가 갖고 있으므로 layer.presentation()?.frame 또는 layer.presentation()?.position으로 접근해야 한다. 히트테스트나 좌표 계산 시 특히 중요하다.",
    relatedTopicSlugs: ["04-uikit/core-animation"],
  },
  {
    id: "objective-c04-advanced-core-animation-004",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "shadowPath를 명시하지 않고 shadowOpacity를 설정했을 때 발생하는 문제와 그 이유는?",
    choices: [
      {
        id: "a",
        text: "그림자가 전혀 표시되지 않는다. shadowPath가 없으면 Core Animation이 그림자를 그리지 않도록 최적화하기 때문이다.",
      },
      {
        id: "b",
        text: "매 프레임마다 컨텐츠의 알파 채널을 추적해 그림자 모양을 계산하므로 off-screen rendering이 발생하고 스크롤 hitch의 원인이 된다.",
      },
      {
        id: "c",
        text: "cornerRadius와 함께 쓸 때만 문제가 되며, 단독 사용은 성능에 영향을 주지 않는다.",
      },
      {
        id: "d",
        text: "CPU에서 소프트웨어 렌더링으로 그림자를 그리므로 GPU 사용량은 줄어들지만 CPU가 과부하된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "shadowPath를 지정하지 않으면 Core Animation이 매 프레임 레이어 컨텐츠의 알파 채널을 분석하여 그림자 모양을 계산한다. 이 과정에서 off-screen buffer가 필요하고, 스크롤 중인 셀에 이 조합이 있으면 GPU가 매 프레임 off-screen pass를 반복해 hitch가 발생한다. 해결책은 shadowPath를 UIBezierPath로 명시하는 것이다.",
    relatedTopicSlugs: ["04-uikit/core-animation"],
  },

  // ─── frame-vs-bounds (3) ─────────────────────────────────────────────────
  {
    id: "objective-c04-basic-frame-vs-bounds-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "frame과 bounds의 차이를 올바르게 설명한 것은?",
    choices: [
      {
        id: "a",
        text: "frame은 자기 좌표계에서의 위치/크기이고, bounds는 부모 좌표계에서의 위치/크기이다.",
      },
      {
        id: "b",
        text: "frame은 부모(superview) 좌표계에서의 위치/크기이고, bounds는 자기 좌표계에서의 위치/크기이다.",
      },
      {
        id: "c",
        text: "frame과 bounds는 항상 동일한 값을 가지며, transform이 적용되어야만 차이가 생긴다.",
      },
      {
        id: "d",
        text: "bounds는 항상 origin이 (0, 0)이므로 크기 정보만 갖는다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "frame은 superview(부모) 좌표계에서 자기 뷰의 위치와 크기를 나타내고, bounds는 자기 좌표계에서의 위치와 크기를 나타낸다. 일반적으로 bounds.origin은 (0, 0)이지만, UIScrollView처럼 의도적으로 bounds.origin을 변경하는 경우도 있다.",
    relatedTopicSlugs: ["04-uikit/frame-vs-bounds"],
  },
  {
    id: "objective-c04-intermediate-frame-vs-bounds-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "UIScrollView가 스크롤되는 내부 원리로 가장 정확한 설명은?",
    choices: [
      { id: "a", text: "자식 뷰들의 frame을 계속 이동시켜 스크롤을 구현한다." },
      {
        id: "b",
        text: "자기 자신의 bounds.origin을 움직임으로써, 자식 뷰 frame은 그대로 두고 상대적으로 스크롤 효과를 낸다.",
      },
      { id: "c", text: "contentOffset 프로퍼티가 CALayer의 transform을 변경하여 스크롤한다." },
      { id: "d", text: "GPU에서 픽셀을 직접 이동시켜 스크롤 효과를 낸다." },
    ],
    correctChoiceId: "b",
    explanation:
      "UIScrollView는 자기 bounds.origin을 움직여 스크롤을 구현한다. 즉, contentOffset == bounds.origin이다. 자식 뷰의 frame은 고정되어 있지만, 부모의 bounds origin이 이동하면 자식이 상대적으로 위로 올라가 보이는 효과가 생긴다.",
    relatedTopicSlugs: ["04-uikit/frame-vs-bounds"],
  },
  {
    id: "objective-c04-advanced-frame-vs-bounds-003",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "뷰에 CGAffineTransform 회전을 적용한 후 frame과 bounds의 동작에 대한 설명으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "transform 적용 후 frame은 회전된 뷰를 감싸는 바운딩 박스(직사각형)로 변하고, bounds는 변하지 않는다.",
      },
      {
        id: "b",
        text: "transform 적용 후 frame과 bounds가 모두 회전 각도를 반영해 바뀐다.",
      },
      {
        id: "c",
        text: "transform 적용 후 frame은 변하지 않고, bounds만 회전 각도를 반영해 바뀐다.",
      },
      {
        id: "d",
        text: "transform을 적용하면 frame과 bounds 모두 무효화되어 사용할 수 없게 된다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "transform이 적용되면 frame은 변환된 뷰를 감싸는 직사각형(바운딩 박스)으로 변경되어 크기/위치가 달라진다. 반면 bounds와 center는 transform과 독립적으로 유지된다. **transform이 identity가 아닐 때 frame 값은 \"정의되지 않음(undefined)\"** 으로 Apple 문서에 명시되어 있으므로 읽거나 쓰지 말고, bounds + center 조합으로 위치와 크기를 다뤄야 한다.",
    relatedTopicSlugs: ["04-uikit/frame-vs-bounds"],
  },

  // ─── offscreen-rendering (5) ─────────────────────────────────────────────
  {
    id: "objective-c04-basic-offscreen-rendering-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "Off-Screen Rendering이 발생하는 대표적인 원인이 아닌 것은?",
    choices: [
      { id: "a", text: "cornerRadius + masksToBounds = true + 컨텐츠가 있는 레이어" },
      { id: "b", text: "shadowPath 없이 shadowOpacity > 0 설정" },
      { id: "c", text: "UIView의 backgroundColor만 설정한 경우" },
      { id: "d", text: "mask 레이어 사용" },
    ],
    correctChoiceId: "c",
    explanation:
      "UIView에 backgroundColor만 설정한 경우는 off-screen rendering을 유발하지 않는다. off-screen rendering의 주요 트리거는 cornerRadius + masksToBounds + 비단순 컨텐츠, shadowPath 미지정 그림자, mask 레이어, allowsGroupOpacity, shouldRasterize 등이다. 배경색만 있는 단순한 레이어는 GPU가 직접 처리할 수 있다.",
    relatedTopicSlugs: ["04-uikit/offscreen-rendering"],
  },
  {
    id: "objective-c04-basic-offscreen-rendering-002",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "Xcode 시뮬레이터에서 Off-Screen Rendering이 발생하는 영역을 시각적으로 확인하는 방법은?",
    choices: [
      { id: "a", text: "Instruments → Time Profiler → Call Tree" },
      { id: "b", text: "Simulator → Debug → Color Off-screen Rendered" },
      { id: "c", text: "Xcode → Product → Analyze" },
      { id: "d", text: "Instruments → Leaks → Live Bytes" },
    ],
    correctChoiceId: "b",
    explanation:
      "Xcode 시뮬레이터의 Debug 메뉴에서 'Color Off-screen Rendered'를 활성화하면 off-screen rendering이 발생하는 영역이 노란색으로 오버레이된다. Instruments의 Core Animation 도구에서도 'Off-Screen-Rendered: Yellow Overlay'로 확인할 수 있다.",
    relatedTopicSlugs: ["04-uikit/offscreen-rendering"],
  },
  {
    id: "objective-c04-intermediate-offscreen-rendering-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "UICollectionView 셀에 그림자와 둥근 모서리를 함께 적용할 때 off-screen rendering을 피하는 올바른 패턴은?",
    choices: [
      {
        id: "a",
        text: "셀 자체에 cornerRadius + clipsToBounds = true + shadowOpacity를 모두 설정한다.",
      },
      {
        id: "b",
        text: "그림자를 담당하는 외부 컨테이너와 컨텐츠 클리핑을 담당하는 내부 뷰를 분리하고, 외부에는 명시적 shadowPath를 사용한다.",
      },
      {
        id: "c",
        text: "shouldRasterize = true로 설정하면 off-screen rendering을 완전히 제거할 수 있다.",
      },
      {
        id: "d",
        text: "cornerRadius 대신 투명한 PNG 이미지로 마스크를 씌우면 off-screen rendering이 발생하지 않는다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "그림자와 클리핑을 하나의 레이어에 동시에 적용하면 off-screen rendering이 불가피하다. 올바른 패턴은 그림자를 외부 컨테이너 레이어에, clipsToBounds + cornerRadius를 내부 뷰에 분리하고, 외부 그림자는 명시적 shadowPath(UIBezierPath)로 지정하는 것이다. shadowPath를 명시하면 알파 채널 추적 없이 GPU가 직접 그림자를 그릴 수 있다.",
    relatedTopicSlugs: ["04-uikit/offscreen-rendering"],
  },
  {
    id: "objective-c04-intermediate-offscreen-rendering-004",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "shouldRasterize = true를 사용할 때 주의해야 할 사항으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "모든 레이어에 적용할수록 성능이 향상되므로 가능한 많이 사용해야 한다.",
      },
      {
        id: "b",
        text: "변하지 않는 정적 컨텐츠에만 적용하고, 자주 변하는 레이어에 적용하면 캐시 무효화로 오히려 성능이 저하된다.",
      },
      {
        id: "c",
        text: "shouldRasterize는 off-screen rendering을 완전히 제거하는 솔루션이다.",
      },
      {
        id: "d",
        text: "rasterizationScale 설정 없이도 Retina 디스플레이에서 항상 선명하게 렌더링된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "shouldRasterize = true는 복잡한 레이어를 비트맵으로 캐시하여 이후 합성 비용을 줄이는 기법이다. 그러나 레이어 내용이 변경될 때마다 다시 rasterize하므로, 자주 변하는 레이어(애니메이션 중인 뷰, 스크롤 셀 등)에 적용하면 오히려 성능이 나빠진다. 또한 Retina 디스플레이에서 선명하게 표시하려면 rasterizationScale = UIScreen.main.scale을 함께 설정해야 한다.",
    relatedTopicSlugs: ["04-uikit/offscreen-rendering"],
  },
  {
    id: "objective-c04-advanced-offscreen-rendering-005",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "allowsGroupOpacity에 대한 설명으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "iOS 7부터 기본값이 false이며, true로 설정해야만 자식 레이어의 알파가 그룹으로 합성된다.",
      },
      {
        id: "b",
        text: "iOS 7부터 기본값이 true이며, 부모와 자식의 알파가 다를 때 정확한 그룹 합성을 위해 off-screen rendering을 유발한다.",
      },
      {
        id: "c",
        text: "allowsGroupOpacity는 shadowOpacity와 동일한 효과를 낸다.",
      },
      {
        id: "d",
        text: "allowsGroupOpacity = false로 설정하면 항상 off-screen rendering을 유발한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "allowsGroupOpacity는 iOS 7부터 기본값이 true이다. 부모와 자식 레이어의 알파가 서로 다를 때, 정확한 그룹 합성을 위해 off-screen buffer가 필요하다. false로 설정하면 off-screen pass를 피할 수 있지만 알파 합성이 부정확해질 수 있으므로, 시각적 결과물을 확인한 후 사용해야 한다.",
    relatedTopicSlugs: ["04-uikit/offscreen-rendering"],
  },

  // ─── rendering-pipeline (5) ──────────────────────────────────────────────
  {
    id: "objective-c04-basic-rendering-pipeline-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "60Hz 디스플레이에서 iOS 렌더링 파이프라인이 메인 스레드에서 처리해야 하는 단계는 어느 단계까지인가?",
    choices: [
      { id: "a", text: "GPU에서 픽셀 합성까지 모든 단계를 메인 스레드가 처리한다." },
      {
        id: "b",
        text: "이벤트 처리 → 레이아웃 → 디스플레이 → CATransaction 커밋까지를 16.67ms 안에 처리해야 한다.",
      },
      { id: "c", text: "레이아웃 단계까지만 메인 스레드가 처리하고 나머지는 백그라운드 스레드에서 처리한다." },
      { id: "d", text: "메인 스레드는 이벤트 처리만 담당하고 레이아웃 이후는 모두 Render Server가 처리한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "60Hz 디스플레이에서 한 프레임은 16.67ms이다. 메인 스레드는 이벤트 처리 → 레이아웃(layoutSubviews) → 디스플레이(draw(_:)) → CATransaction 커밋까지 이 시간 안에 완료해야 한다. 커밋 이후 실제 렌더링(디코드/합성)과 GPU 그리기는 별도 프로세스(Render Server)가 담당한다.",
    relatedTopicSlugs: ["04-uikit/rendering-pipeline"],
  },
  {
    id: "objective-c04-basic-rendering-pipeline-002",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "setNeedsDisplay를 호출했을 때 draw(_:)가 실제로 호출되는 시점은?",
    choices: [
      { id: "a", text: "setNeedsDisplay 호출 즉시 draw(_:)가 동기적으로 실행된다." },
      {
        id: "b",
        text: "다음 RunLoop 사이클의 display 단계에서 draw(_:)가 호출된다.",
      },
      { id: "c", text: "layoutIfNeeded 호출 후에 draw(_:)가 실행된다." },
      { id: "d", text: "CATransaction.commit() 이후 Render Server에서 draw(_:)를 호출한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "setNeedsDisplay는 '다음 사이클에 다시 그려야 함'을 표시하는 것으로, 즉시 draw(_:)를 호출하지 않는다. 실제 draw(_:)는 다음 RunLoop의 display pass(beforeWaiting observer 시점)에서 호출된다. 즉시 그리기가 필요하면 setNeedsDisplay + displayIfNeeded 조합을 사용한다.",
    relatedTopicSlugs: ["04-uikit/rendering-pipeline"],
  },
  {
    id: "objective-c04-intermediate-rendering-pipeline-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "iOS 렌더링 파이프라인에서 Render Server(앱 프로세스와 분리된 시스템 데몬)의 역할은?",
    choices: [
      {
        id: "a",
        text: "메인 스레드에서 실행되며 레이아웃 제약 풀이를 담당한다.",
      },
      {
        id: "b",
        text: "별도 프로세스로 동작하며, 메인 스레드가 커밋한 layer 트리를 받아 GPU 명령으로 변환하고 off-screen 합성을 처리한다.",
      },
      {
        id: "c",
        text: "Swift Concurrency의 cooperative pool에서 실행되며 비동기 렌더링을 담당한다.",
      },
      {
        id: "d",
        text: "Core Data의 백그라운드 컨텍스트처럼 별도 큐에서 레이어 데이터를 저장한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Render Server는 앱 프로세스와 분리된 별도 시스템 프로세스이다(역사적으로 `backboardd`와 혼용되기도 하지만 같은 프로세스가 아니다). 메인 스레드가 CATransaction.commit()으로 layer 트리의 변경을 전송하면, Render Server가 이를 받아 GPU 명령으로 변환하고, 그림자/마스크/블러 같은 off-screen pass를 처리한 뒤 최종적으로 GPU에 제출한다.",
    relatedTopicSlugs: ["04-uikit/rendering-pipeline"],
  },
  {
    id: "objective-c04-intermediate-rendering-pipeline-004",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "CADisplayLink를 사용하는 목적과 일반 Timer와의 차이로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "CADisplayLink는 백그라운드 스레드에서 실행되며, Timer보다 메인 스레드 부하를 줄인다.",
      },
      {
        id: "b",
        text: "CADisplayLink는 화면 갱신 주기에 정확히 맞춰 호출되며, 게임/애니메이션 동기화에 적합하다. Timer는 RunLoop 부하에 따라 정확도가 떨어진다.",
      },
      {
        id: "c",
        text: "CADisplayLink는 정확히 60fps로 고정 호출되므로 ProMotion 디스플레이에서도 60fps로 동작한다.",
      },
      {
        id: "d",
        text: "CADisplayLink는 Timer의 서브클래스이므로 동일한 방식으로 사용한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "CADisplayLink는 화면 갱신 직전에 정확히 호출되어 프레임 단위 애니메이션 동기화에 적합하다. Timer는 RunLoop의 부하에 따라 발화 시점이 불정확하다. CADisplayLink는 ProMotion(가변 주사율) 디스플레이에서도 실제 주사율에 맞춰 동작하므로, targetTimestamp - timestamp로 실제 dt를 계산해야 한다.",
    relatedTopicSlugs: ["04-uikit/rendering-pipeline"],
  },
  {
    id: "objective-c04-advanced-rendering-pipeline-005",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "iOS GPU의 Tile-based Deferred Rendering(TBDR) 방식이 성능에 미치는 영향으로 옳은 설명은?",
    choices: [
      {
        id: "a",
        text: "TBDR은 화면 전체를 한 번에 렌더링하므로 레이어 겹침(over-draw)의 영향이 없다.",
      },
      {
        id: "b",
        text: "화면을 타일로 나눠 처리하므로, 알파 블렌딩이 많거나 레이어가 많이 겹치면 각 타일의 fragment 처리 비용이 증가한다.",
      },
      {
        id: "c",
        text: "TBDR은 CPU에서 처리되며 GPU는 최종 픽셀 출력만 담당한다.",
      },
      {
        id: "d",
        text: "TBDR은 over-draw에 영향을 받지 않으므로 알파 블렌딩 비용이 항상 0이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS GPU는 TBDR 방식으로 화면을 작은 타일로 나눠 처리한다. 알파 블렌딩이 많은 영역이나 레이어가 많이 겹치는 over-draw가 심한 경우, 각 타일이 처리해야 하는 fragment 수가 늘어나 GPU 부하가 증가한다. 큰 단순 배경 + 작은 복잡 콘텐츠 패턴이 TBDR에서 유리하다.",
    relatedTopicSlugs: ["04-uikit/rendering-pipeline"],
  },

  // ─── responder-chain (4) ─────────────────────────────────────────────────
  {
    id: "objective-c04-basic-responder-chain-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "Responder Chain에서 터치 이벤트 처리의 두 단계가 올바르게 나열된 것은?",
    choices: [
      {
        id: "a",
        text: "1) Responder Chain 탐색 → 2) Hit-Testing",
      },
      {
        id: "b",
        text: "1) Hit-Testing (어느 뷰인지 결정) → 2) Responder Chain (처리할 responder 탐색)",
      },
      {
        id: "c",
        text: "1) first responder 지정 → 2) Hit-Testing",
      },
      {
        id: "d",
        text: "1) UIApplication 수신 → 2) UIWindow로 전달 → 3) 첫 번째 서브뷰 처리",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "터치 이벤트 처리는 두 단계로 나뉜다. 먼저 Hit-Testing 단계에서 hitTest(_:with:)를 재귀적으로 호출해 터치 좌표가 어느 뷰인지 결정한다. 그 뷰를 first responder로 삼아 Responder Chain을 따라 이벤트를 처리할 수 있는 responder를 찾아 올라간다. 체인은 view → 상위 view → ViewController → window → UIApplication → AppDelegate(UIResponder 서브클래스) 순으로 거슬러 올라가며, 어디서도 처리하지 않으면 이벤트는 폐기된다.",
    relatedTopicSlugs: ["04-uikit/responder-chain"],
  },
  {
    id: "objective-c04-intermediate-responder-chain-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "UIButton이 터치에 반응하지 않는 원인이 아닌 것은?",
    choices: [
      { id: "a", text: "버튼의 alpha가 0.005로 거의 투명하다." },
      { id: "b", text: "부모 UIImageView의 isUserInteractionEnabled가 기본값 false이다." },
      { id: "c", text: "버튼의 backgroundColor가 nil로 설정되어 있다." },
      { id: "d", text: "버튼 위에 투명한 UIView가 겹쳐 있어 hit-test가 그 뷰로 간다." },
    ],
    correctChoiceId: "c",
    explanation:
      "backgroundColor가 nil인 것은 터치 인식에 영향을 주지 않는다. 터치가 안 먹는 흔한 원인은 isUserInteractionEnabled = false(UIImageView는 기본값이 false), alpha < 0.01, isHidden = true, 더 위에 있는 투명 뷰가 hit-test를 가로채는 경우, gestureRecognizer가 cancelsTouchesInView = true로 가로채는 경우 등이다.",
    relatedTopicSlugs: ["04-uikit/responder-chain"],
  },
  {
    id: "objective-c04-intermediate-responder-chain-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "부모 뷰의 frame 밖에 배치된 자식 버튼의 터치를 감지하려면?",
    choices: [
      { id: "a", text: "자식 버튼의 clipsToBounds를 false로 설정한다." },
      {
        id: "b",
        text: "부모 뷰에서 point(inside:with:)를 오버라이드하여 자식 버튼의 frame을 포함하도록 확장한다.",
      },
      { id: "c", text: "자식 버튼에 UITapGestureRecognizer를 추가한다." },
      { id: "d", text: "자식 버튼의 isUserInteractionEnabled를 true로 설정한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "clipsToBounds = false는 화면 그리기에만 영향을 주고 hit-test에는 영향이 없다. 부모의 frame 밖에 있는 자식 뷰의 터치를 받으려면 부모 뷰에서 point(inside:with:)를 오버라이드하여 자식 버튼의 frame(부모 좌표로 변환)도 포함하도록 확장해야 한다.",
    relatedTopicSlugs: ["04-uikit/responder-chain"],
  },
  {
    id: "objective-c04-advanced-responder-chain-004",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "UIApplication.shared.sendAction(_:to:from:for:)에서 to 파라미터를 nil로 전달하면 어떻게 동작하는가?",
    choices: [
      { id: "a", text: "아무 동작도 하지 않고 false를 반환한다." },
      {
        id: "b",
        text: "현재 first responder부터 Responder Chain을 따라 올라가며 해당 selector를 처리할 수 있는 객체에게 메시지를 보낸다.",
      },
      {
        id: "c",
        text: "AppDelegate로 직접 메시지를 보낸다.",
      },
      {
        id: "d",
        text: "UIApplication 자신이 selector를 처리한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "to: nil로 sendAction을 호출하면 현재 first responder부터 시작해 Responder Chain을 따라 올라가며 해당 selector에 응답할 수 있는 객체를 찾는다. UIMenuController가 copy:, paste: 같은 액션을 현재 first responder로 라우팅하는 방식이 이를 활용한다. 처리 가능한 객체가 없으면 이벤트는 소비되지 않는다.",
    relatedTopicSlugs: ["04-uikit/responder-chain"],
  },

  // ─── runloop-deep (3) ────────────────────────────────────────────────────
  {
    id: "objective-c04-intermediate-runloop-deep-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "Timer를 .default 모드로 등록했을 때 스크롤 중 타이머가 멈추는 이유와 해결책은?",
    choices: [
      {
        id: "a",
        text: "스크롤 중에는 메인 스레드가 차단되기 때문이다. 해결책: 타이머를 백그라운드 스레드에서 실행한다.",
      },
      {
        id: "b",
        text: "UIKit의 스크롤 중에는 RunLoop이 .tracking 모드로 진입하여 .default 모드의 타이머가 실행되지 않는다. 해결책: .common 모드로 등록한다.",
      },
      {
        id: "c",
        text: "Timer는 Main Actor와 호환되지 않아 스크롤 중 자동으로 일시 중지된다.",
      },
      {
        id: "d",
        text: "스크롤 중에는 RunLoop이 종료되기 때문이다. 해결책: sceneWillEnterForeground에서 다시 시작한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "UIKit은 스크롤·터치 추적 중에 RunLoop 모드를 .default에서 .tracking(UITrackingRunLoopMode)으로 전환한다. .default 모드로만 등록된 타이머는 이 모드에서 실행되지 않는다. 해결책은 RunLoop.current.add(timer, forMode: .common)으로 등록하는 것이다. 엄밀히 `.common`은 모드가 아니라 *common modes 집합에 등록된 모든 모드*(기본적으로 default와 tracking을 포함)에서 소스가 발화되도록 만드는 키이다.",
    relatedTopicSlugs: ["04-uikit/runloop-deep"],
  },
  {
    id: "objective-c04-intermediate-runloop-deep-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "같은 프레임에서 setNeedsLayout을 100번 호출하면 layoutSubviews는 몇 번 호출되는가?",
    choices: [
      { id: "a", text: "100번 호출된다." },
      { id: "b", text: "1번만 호출된다. setNeedsLayout은 다음 RunLoop 끝에 한 번만 처리된다." },
      { id: "c", text: "2번 호출된다. 첫 번째와 마지막 호출만 처리된다." },
      { id: "d", text: "RunLoop 모드에 따라 달라진다." },
    ],
    correctChoiceId: "b",
    explanation:
      "setNeedsLayout은 '레이아웃이 필요함' 플래그를 설정하는 것으로, 실제 layoutSubviews는 RunLoop의 beforeWaiting observer 시점에 한 번만 실행된다. 100번 호출해도 레이아웃 패스는 1번만 발생한다. 즉시 적용이 필요하면 layoutIfNeeded()를 호출한다.",
    relatedTopicSlugs: ["04-uikit/runloop-deep"],
  },
  {
    id: "objective-c04-advanced-runloop-deep-003",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "DispatchQueue.main.async로 UI 업데이트를 예약했을 때 실제 화면에 반영되는 시점은?",
    choices: [
      {
        id: "a",
        text: "async 호출 즉시 메인 큐에 삽입되고 즉시 화면에 반영된다.",
      },
      {
        id: "b",
        text: "현재 RunLoop 사이클의 source 처리 단계에서 바로 실행된다.",
      },
      {
        id: "c",
        text: "현재 RunLoop 사이클이 끝난 후 다음 사이클의 source 처리 단계에서 실행되며, 그 사이클의 layout/commit이 완료된 후 다음 프레임에 화면에 반영된다.",
      },
      {
        id: "d",
        text: "Render Server가 받는 즉시 화면에 반영된다.",
      },
    ],
    correctChoiceId: "c",
    explanation:
      "DispatchQueue.main.async 작업은 현재 RunLoop 사이클이 끝난 뒤 다음 사이클의 source 처리 단계에서 실행된다. 이후 그 사이클의 layout/display/commit 단계를 거쳐야 비로소 화면에 반영된다. 따라서 비동기 UI 업데이트는 최소 1프레임 지연이 있으며, 현재 프레임에 이미 커밋이 완료된 경우 다음 프레임에 반영된다.",
    relatedTopicSlugs: ["04-uikit/runloop-deep"],
  },

  // ─── tableview-collectionview (4) ────────────────────────────────────────
  {
    id: "objective-c04-basic-tableview-collectionview-001",
    type: "objective",
    level: "basic",
    category: "UIKit",
    prompt:
      "UITableView에서 셀 재사용 시 prepareForReuse()를 반드시 구현해야 하는 이유는?",
    choices: [
      { id: "a", text: "재사용된 셀은 메모리가 초기화되지 않아 이전 row의 데이터가 남아있을 수 있기 때문이다." },
      { id: "b", text: "prepareForReuse를 구현하지 않으면 셀이 재사용 큐에 반환되지 않기 때문이다." },
      { id: "c", text: "prepareForReuse를 구현하지 않으면 Auto Layout 제약이 중복 생성되기 때문이다." },
      { id: "d", text: "dequeueReusableCell이 prepareForReuse 호출을 필요로 하기 때문이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "재사용 큐에서 꺼낸 셀에는 이전에 표시했던 데이터(이미지, 텍스트, 체크 상태 등)가 남아있을 수 있다. prepareForReuse()에서 이런 상태를 초기화하지 않으면 잘못된 데이터가 보이거나, 비동기 이미지 로드 결과가 엉뚱한 row에 표시되는 버그가 발생한다.",
    relatedTopicSlugs: ["04-uikit/tableview-collectionview"],
  },
  {
    id: "objective-c04-intermediate-tableview-collectionview-002",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "UITableViewDiffableDataSource 사용 시 Item 타입이 Hashable이어야 하는 이유는?",
    choices: [
      {
        id: "a",
        text: "Hashable이어야 NSCache에 셀을 캐시할 수 있기 때문이다.",
      },
      {
        id: "b",
        text: "DiffableDataSource가 스냅샷 간 차이(insert/delete/move)를 계산하기 위해 항목의 동일성을 해시로 비교하기 때문이다.",
      },
      {
        id: "c",
        text: "UICollectionView의 CellRegistration이 Hashable 타입만 지원하기 때문이다.",
      },
      {
        id: "d",
        text: "Hashable을 구현해야 IndexPath 기반 데이터 소스보다 빠른 조회가 가능하기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "UITableViewDiffableDataSource는 두 스냅샷 사이의 차이(어떤 항목이 삽입/삭제/이동되었는지)를 자동으로 계산하여 애니메이션을 적용한다. 이 차이 계산에 항목의 동일성 비교가 필요하며, Hashable을 통해 효율적으로 비교한다. hash 구현이 잘못되면 변경되지 않은 항목도 reload되거나 애니메이션이 엉뚱하게 동작한다.",
    relatedTopicSlugs: ["04-uikit/tableview-collectionview"],
  },
  {
    id: "objective-c04-intermediate-tableview-collectionview-003",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "UITableView의 self-sizing 셀(automaticDimension)이 작동하지 않을 때 가장 흔한 원인은?",
    choices: [
      { id: "a", text: "estimatedRowHeight를 설정하지 않았다." },
      {
        id: "b",
        text: "셀의 contentView 내부 제약이 수직 방향으로 '닫혀 있지 않아' 높이를 계산할 수 없는 상태이다.",
      },
      { id: "c", text: "dequeueReusableCell 대신 init(style:reuseIdentifier:)를 직접 사용했다." },
      { id: "d", text: "rowHeight를 0으로 설정해야 automaticDimension이 작동한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "self-sizing이 동작하려면 셀 contentView 내의 제약이 상단에서 하단까지 연결(closed)되어 있어야 한다. 즉, top → 뷰들 → bottom 제약이 모두 연결되어 Auto Layout이 높이를 계산할 수 있어야 한다. 한 곳이라도 제약이 끊기거나, UILabel의 numberOfLines = 1로 고정된 경우 높이 계산이 실패한다. estimatedRowHeight 미설정은 스크롤바 위치가 부정확해지는 문제를 유발한다.",
    relatedTopicSlugs: ["04-uikit/tableview-collectionview"],
  },
  {
    id: "objective-c04-advanced-tableview-collectionview-004",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "UITableViewDataSourcePrefetching의 prefetchRowsAt이 호출되는 시점과 목적은?",
    choices: [
      {
        id: "a",
        text: "현재 화면에 보이는 모든 셀의 데이터를 일괄 갱신하기 위해 호출된다.",
      },
      {
        id: "b",
        text: "스크롤 방향으로 곧 나타날 셀들의 indexPath를 미리 전달하여, 이미지 다운로드 등 무거운 작업을 미리 시작할 수 있도록 한다.",
      },
      {
        id: "c",
        text: "cellForRowAt보다 먼저 호출되어 셀 UI를 미리 구성하기 위해 사용한다.",
      },
      {
        id: "d",
        text: "reloadData() 호출 시 모든 행의 데이터를 캐시하기 위해 호출된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "UITableViewDataSourcePrefetching의 prefetchRowsAt(_:)은 스크롤 방향으로 곧 화면에 나타날 셀들의 indexPath를 미리 전달한다. 개발자는 이 시점에 이미지 다운로드, 네트워크 요청 등 시간이 걸리는 작업을 미리 시작하여 셀이 실제로 표시될 때 데이터를 즉시 보여줄 수 있다. cancelPrefetchingForRowsAt은 반대 방향으로 스크롤하거나 더 이상 필요 없어진 prefetch를 취소할 때 호출된다.",
    relatedTopicSlugs: ["04-uikit/tableview-collectionview"],
  },

  // ─── viewcontroller-lifecycle (2) ────────────────────────────────────────
  {
    id: "objective-c04-intermediate-viewcontroller-lifecycle-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt:
      "viewDidLoad에서 view.bounds를 기반으로 CAGradientLayer의 frame을 설정하면 안 되는 이유와 올바른 시점은?",
    choices: [
      {
        id: "a",
        text: "viewDidLoad는 메인 스레드에서 호출되지 않아 frame 계산이 정확하지 않기 때문이다. viewDidAppear에서 설정한다.",
      },
      {
        id: "b",
        text: "viewDidLoad 시점에는 뷰가 부모에 추가되지 않아 실제 디바이스 크기가 아닌 storyboard 기준값이거나 .zero일 수 있다. viewDidLayoutSubviews 또는 viewIsAppearing(iOS 17 SDK, iOS 13까지 back-deploy)에서 설정해야 한다.",
      },
      {
        id: "c",
        text: "CAGradientLayer는 init 이후 frame을 변경할 수 없기 때문이다.",
      },
      {
        id: "d",
        text: "viewDidLoad는 view가 완전히 렌더링된 후 호출되므로 frame 변경이 반영되지 않는다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "viewDidLoad 시점에는 뷰가 메모리에 적재됐을 뿐 아직 부모 뷰에 추가되지 않았다. 따라서 view.bounds는 storyboard 기준값이거나 잘못된 크기일 수 있다. 실제 디바이스 화면 크기를 반영한 정확한 frame이 필요하다면 viewDidLayoutSubviews 또는 viewIsAppearing(iOS 17 SDK로 도입됐고 iOS 13까지 back-deploy되므로 배포 타깃이 iOS 13 이상이면 Xcode 15+에서 사용 가능)에서 설정해야 한다.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle"],
  },
  {
    id: "objective-c04-advanced-viewcontroller-lifecycle-002",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt:
      "A → B를 .overFullScreen 방식으로 present할 때 A의 라이프사이클에 대한 설명으로 옳은 것은?",
    choices: [
      {
        id: "a",
        text: "A의 viewWillDisappear와 viewDidDisappear가 정상적으로 호출된다.",
      },
      {
        id: "b",
        text: "A의 viewWillDisappear와 viewDidDisappear가 호출되지 않는다. 밑의 화면(A)을 보존하는 모달 방식이기 때문이다.",
      },
      {
        id: "c",
        text: "A가 백그라운드로 이동하여 appDidEnterBackground가 호출된다.",
      },
      {
        id: "d",
        text: ".overFullScreen은 A를 dismiss하고 B를 완전히 새로 present하므로 A의 deinit이 호출된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      ".overFullScreen이나 .overCurrentContext 같은 모달 방식은 하단의 뷰 컨트롤러(A)를 시각적으로 보존하기 때문에 A의 viewWillDisappear/viewDidDisappear가 호출되지 않는다. 반면 full screen 모달이나 push는 A가 화면에서 완전히 사라지므로 disappear 콜백이 호출된다. 이 차이를 인지하지 못하면 disappear 시점에 의존하는 로직(타이머 중지, 리소스 해제 등)이 예상대로 동작하지 않을 수 있다.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle"],
  },

  // ─── auto-layout-deepdive (add: 3) ───────────────────────────────────────
  {
    id: "objective-c04-advanced-transform-and-autolayout-001",
    type: "objective",
    level: "advanced",
    category: "UIKit",
    prompt: "Auto Layout이 켜진 뷰에 `transform = CGAffineTransform(scaleX: 1.2, y: 1.2)`을 적용한 뒤 레이아웃 패스가 한 번 더 돌면 어떤 일이 일어나는가?",
    choices: [
      { id: "a", text: "다음 레이아웃 패스에서 transform이 identity로 초기화된다" },
      { id: "b", text: "center와 bounds는 제약대로 다시 결정되고, transform은 그대로 유지되어 그 위에 합성된다" },
      { id: "c", text: "transform이 frame을 덮어써 제약이 무시된다" },
      { id: "d", text: "Auto Layout 시스템이 자동으로 transform을 분해해 별도 제약으로 등록한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Auto Layout은 뷰의 *center와 bounds(정렬 사각형)* 만 제어한다. `transform`은 그 결과 위에 별도로 합성되는 시각 변환이라 레이아웃 패스가 다시 돌아도 초기화되지 않는다. 그래서 일시적 효과(버튼 눌림, 흔들기)는 transform으로 처리해도 안전하다. 단, transform이 identity가 아닐 때 `frame` 값은 Apple 문서상 \"정의되지 않음\"이므로 위치 계산은 center/bounds 기반으로 해야 한다.",
    relatedTopicSlugs: ["04-uikit/auto-layout"],
  },
  {
    id: "objective-c04-intermediate-calayer-autolayout-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "직접 추가한 `CAGradientLayer`가 부모 뷰 크기 변경 시 따라가지 않는다. 가장 정석적인 해결책은?",
    choices: [
      { id: "a", text: "CAGradientLayer에 NSLayoutConstraint를 추가한다" },
      { id: "b", text: "부모 UIView의 `layoutSubviews()`에서 `gradientLayer.frame = bounds`로 동기화한다" },
      { id: "c", text: "CAGradientLayer를 UIView로 감싸면 자동으로 Auto Layout이 적용된다" },
      { id: "d", text: "CATransaction에 등록하면 시스템이 자동으로 frame을 맞춰준다" },
    ],
    correctChoiceId: "b",
    explanation:
      "직접 추가한 CALayer(서브레이어)는 NSLayoutConstraint의 대상이 아니다. 제약은 UIView에만 걸리고, 그 안의 sublayer는 수동 frame 갱신이 필요하다. 부모 뷰의 `layoutSubviews()`(또는 VC의 `viewDidLayoutSubviews()`)에서 `layer.frame = bounds`로 매 레이아웃 패스마다 동기화해야 한다. 이 함정 때문에 `viewDidLoad`에서 frame을 잡으면 그 시점의 bounds가 최종값이 아니라 어긋난다.",
    relatedTopicSlugs: ["04-uikit/auto-layout", "04-uikit/core-animation"],
  },
  {
    id: "objective-c04-intermediate-didmovetowindow-001",
    type: "objective",
    level: "intermediate",
    category: "UIKit",
    prompt: "반복 펄스 애니메이션을 시작/정지하기에 가장 적절한 콜백은?",
    choices: [
      { id: "a", text: "`init` — 객체가 만들어지는 시점이라 가장 안전하다" },
      { id: "b", text: "`viewDidLoad` — 뷰가 로드되었으므로 곧바로 시작한다" },
      { id: "c", text: "`didMoveToWindow()` — `window != nil`이면 시작, `nil`이면 정지" },
      { id: "d", text: "`layoutSubviews()` — 매 레이아웃마다 시작·정지를 반복한다" },
    ],
    correctChoiceId: "c",
    explanation:
      "뷰가 superview에 추가됐다고 해서 화면에 보이는 건 아니다. 윈도우에 붙어야 진짜 화면에 등장한다. `didMoveToWindow()`에서 `window != nil`로 가드해 시작하고, `window == nil`이면 정지하면 화면에서 내려갔을 때 자동으로 리소스(애니메이션·타이머·DisplayLink)를 회수할 수 있다. `viewDidLoad`/`init`은 아직 윈도우에 없는 시점이라 부적절하고, `layoutSubviews`는 자주 호출되므로 부적절하다.",
    relatedTopicSlugs: ["04-uikit/viewcontroller-lifecycle"],
  },
];
