# Accessibility

> 한 줄 요약 — **접근성은 "장애가 있는 사용자도 쓸 수 있게"가 아니라 "*다양한 입력/지각 모달*에서도 동작하게 만드는 것"**이다. VoiceOver·Switch Control·Dynamic Type·Reduce Motion은 *각각 다른 사용자 모델*을 가정하기 때문에 한꺼번에 만족시킬 수 있는 *유일한 길은 시스템 표준을 따르는 것*이다. 커스텀 컴포넌트를 만들수록 접근성은 빠르게 무너진다.

도입 버전: UIAccessibility (iOS 3+), Dynamic Type (iOS 7+), Switch Control (iOS 7+), Reduce Motion (iOS 8+), Differentiate Without Color (iOS 13+), SwiftUI Accessibility modifiers (iOS 14+), Accessibility Audit (Xcode 15+ / iOS 17+)

## 핵심 개념

- **VoiceOver** — 스크린 리더. 화면 요소를 *순회*하며 읽어준다. 모든 인터랙티브 뷰는 *label, value, hint, trait* 4가지 속성이 명확해야 함.
- **accessibilityLabel** — "이게 *무엇인지*". (예: "장바구니").
- **accessibilityValue** — *현재 값*. (슬라이더 "70%", 토글 "켜짐").
- **accessibilityHint** — *탭하면 무슨 일이 일어나는지*. 설정에서 비활성화 가능 → 필수 정보 넣지 말 것.
- **accessibilityTraits** — `.button`, `.header`, `.selected`, `.updatesFrequently` 등 의미.
- **Dynamic Type** — `xSmall ~ accessibility5`까지 12단계. `.font(.body)`처럼 *semantic font*를 쓰면 자동 추종.
- **Switch Control / Voice Control** — 외부 스위치, 음성으로 조작. *포커스 순서*와 *작은 터치 타깃*이 가장 큰 적. 최소 44×44pt.
- **Reduce Motion** — 패럴랙스/스프링 애니메이션을 *fade로 대체*. `UIAccessibility.isReduceMotionEnabled` / `@Environment(\.accessibilityReduceMotion)`.
- **Reduce Transparency / Increase Contrast / Differentiate Without Color** — *색만으로 정보 전달 금지* 원칙.
- **accessibilityIdentifier vs accessibilityLabel** — *완전히 다른 목적*:
  - `accessibilityIdentifier`: UI test 셀렉터. *번역되지 않는 안정 키*.
  - `accessibilityLabel`: VoiceOver가 읽는 *현지화된 사람의 말*.

## 동작 흐름 (단계별)

1. 사용자가 손가락으로 화면을 쓸면 VoiceOver가 *접근성 트리*를 순회.
2. 각 요소는 label → value → traits 순으로 발화.
3. double-tap 시 첫 번째 `.button` trait 또는 *기본 action*이 실행.
4. *grouping* (`accessibilityElement(children: .combine)`)으로 카드 단위 묶음 → 셀 안의 4개 라벨이 한 호흡으로 읽힘.
5. 커스텀 액션은 `accessibilityAction(named:)`로 등록되어 *rotor*에서 선택 가능.

## 코드 / 설정 예시

```swift
// SwiftUI — 의미 있는 단위로 묶고 라벨 통일
HStack {
    Image(systemName: "heart.fill")
    Text("좋아요 1,283")
}
.accessibilityElement(children: .combine)
.accessibilityLabel("좋아요 1,283개")
.accessibilityAddTraits(.isButton)
.accessibilityHint("두 번 탭하면 좋아요를 취소합니다")
.accessibilityAction(named: "사용자 보기") { showUsers() }

// 장식용 이미지는 트리에서 제외
Image("decor-bg").accessibilityHidden(true)

// 차트/그래프 — Audio Graphs 트레이트
chartView
    .accessibilityChartDescriptor(MyChartDescriptor())
```

```swift
// Dynamic Type — semantic font + AX 상한
Text(title)
    .font(.title2)
    .lineLimit(nil)
    .minimumScaleFactor(0.85)
    .dynamicTypeSize(...DynamicTypeSize.accessibility3)

// AX 사이즈에서는 layout을 통째로 바꾸는 게 정답
@Environment(\.dynamicTypeSize) var size
var body: some View {
    if size.isAccessibilitySize { VStack { … } } else { HStack { … } }
}
```

```swift
// Reduce Motion 존중
@Environment(\.accessibilityReduceMotion) var reduceMotion

withAnimation(reduceMotion ? .none : .spring()) { isOpen.toggle() }
```

```swift
// UIKit — 커스텀 컨트롤
class RatingView: UIControl {
    override var isAccessibilityElement: Bool { get { true } set { } }
    override var accessibilityLabel: String? {
        get { "별점" } set { }
    }
    override var accessibilityValue: String? {
        get { "5점 만점에 \(currentValue)점" } set { }
    }
    override var accessibilityTraits: UIAccessibilityTraits {
        get { [.adjustable] } set { }
    }
    override func accessibilityIncrement() { currentValue += 1 }
    override func accessibilityDecrement() { currentValue -= 1 }
}
```

## 비교

| 구분 | accessibilityLabel | accessibilityIdentifier |
|---|---|---|
| 목적 | VoiceOver 발화 | UI test 셀렉터 |
| 현지화 | 번역 O | 번역 X (영문 키) |
| 사용자 노출 | O | X |
| 안정성 | 카피 변경 시 흔들림 | 화면 구조 바뀌어도 유지 |
| 잘못 쓰면 | "Button" 같은 무의미 발화 | 테스트 깨짐 |

## 보안 / 함정

- **민감 정보 발화**: 비밀번호 입력은 *secure text*로 자동 처리되지만, *결제 카드 번호 라스트 4자리*를 라벨에 그대로 두면 옆 사람에게 들린다. 공공장소를 가정한 *발화 정책* 필요.
- **고정 폭 레이아웃** + Dynamic Type AX5 → 잘림. 디자인 시스템에 *AX 시뮬레이션 스크린샷*을 PR 체크리스트로.
- **색만으로 상태 표시**: 에러를 빨간색만으로 표시하면 색약 사용자에게 안 보임. *아이콘 + 라벨*을 함께.
- **모달 트랩**: VoiceOver 사용자가 modal 안에서 빠져나오지 못하는 버그. `accessibilityViewIsModal = true`로 외부 트리 차단해야 *오히려 안전한 트랩*.
- **숨김 처리**: `isHidden = false` 인데 `accessibilityElementsHidden = true`로만 두면 시각적으로는 보이지만 VO는 못 읽는 *모순 상태*. 토글을 같이.
- **테스트 자동화**: Xcode 15+ `XCUIApplication().performAccessibilityAudit()`로 contrast/touch size/dynamic type 검사. CI에 정기 실행.

## 흔한 함정 / Follow-up

- **Q. SwiftUI `Button("저장")` 같은 표준 컴포넌트도 라벨을 따로 지정해야 하나?**
  - A. 아니다. 텍스트가 곧 label, traits는 자동. *커스텀 ZStack 버튼*만 명시 필요.
- **Q. 라벨에 이모지/특수문자를 넣어도 되나?**
  - A. VoiceOver가 "체크 표시" 식으로 풀어 읽는다. 의도와 다르면 텍스트로 대체. 키스트로크가 잦은 화면은 *짧게*.
- **Q. 카드 안에 5개 라벨이 있어 한 번에 5번 스와이프해야 한다.**
  - A. `accessibilityElement(children: .combine)`로 한 단위로 묶고, 세부 액션은 `accessibilityAction(named:)`로 분리. 면접 단골 답.
- **Q. 동적으로 바뀌는 값 (예: 카운트다운)을 어떻게 알리나?**
  - A. *주기적*이면 `.updatesFrequently` trait. *중요 알림*은 `UIAccessibility.post(notification: .announcement, argument: "결제 완료")`. 단 남용 금지.
- **Q. Switch Control 사용자에게 가장 중요한 한 가지는?**
  - A. *논리적 포커스 순서*. SwiftUI는 시각 순서를 따르지만, ZStack/overlay가 많으면 깨진다. `accessibilitySortPriority`로 조정.
- **Q. UI test가 accessibilityLabel을 셀렉터로 쓰면 왜 위험한가?**
  - A. 카피·번역 변경 시 테스트가 깨지고, *지역화 버전*마다 별도 테스트가 필요. `accessibilityIdentifier`로 분리하는 게 정석.
- **Q. CI에서 접근성 회귀를 어떻게 막나?**
  - A. (1) `performAccessibilityAudit` 단위 테스트, (2) snapshot test의 *Dynamic Type × dark mode × RTL* 매트릭스, (3) PR 체크리스트 (VoiceOver 1회 통과, AX5 스크린샷).

## 참고

- WWDC 2023 — *Build accessible apps with SwiftUI and UIKit*, *Perform accessibility audits for your app*
- WWDC 2022 — *Writing for interfaces*
- WWDC 2020 — *App accessibility for Switch Control*
- Apple Docs: *Accessibility on iOS*, *UIAccessibility*, *Accessibility Inspector*
- Apple HIG — *Accessibility*
