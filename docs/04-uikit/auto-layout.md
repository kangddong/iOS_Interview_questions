# Auto Layout

> 한 줄 요약 — **선형 제약식의 만족**으로 레이아웃을 결정하는 시스템. 코드/스토리보드 어디서 짜든 결과는 `NSLayoutConstraint` 풀에 들어가 *Cassowary 알고리즘*이 푼다.

## 핵심 개념

- **Constraint**: `item1.attr1 = m * item2.attr2 + c` 형태의 선형식.
- **Priority**: 1~1000. 같은 attribute에 충돌 시 우선순위 높은 쪽이 이김. 1000이 아니면 깨질 수 있음(soft).
- **Content Hugging Priority (CHP)**: "이 뷰가 *작아지는 것*에 저항".
- **Content Compression Resistance Priority (CCRP)**: "이 뷰가 *작아지는 것*에 저항"… 정확히는 *눌려서 잘리는 것*에 저항.

## CHP / CCRP — 헷갈림 정리

| | 의미 | 충돌 시 |
|---|---|---|
| **CHP (Hugging)** | 자기 intrinsic size보다 *커지지 않으려는* 성향 | 우선순위 낮은 뷰가 더 커짐 (남는 공간 가져감) |
| **CCRP (Compression)** | 자기 intrinsic size보다 *작아지지 않으려는* 성향 | 우선순위 낮은 뷰가 잘림/줄어듦 |

```
[Label A] [Label B]
A의 CHP가 더 낮으면 → A가 늘어나서 빈 공간 채움
A의 CCRP가 더 낮으면 → 공간 부족 시 A가 잘림
```

UILabel/UIButton 같은 뷰는 텍스트 기반의 `intrinsicContentSize`가 있어서 명시적 width/height 없이도 레이아웃이 결정된다.

## intrinsicContentSize

뷰가 "내 자연 크기는 이거야"라고 알려 주는 값. 커스텀 뷰면 override해 시스템이 자동 크기 계산하게 할 수 있다.

```swift
override var intrinsicContentSize: CGSize {
    CGSize(width: UIView.noIntrinsicMetric, height: 44)   // 높이만 알림
}
```

값이 바뀌면 `invalidateIntrinsicContentSize()`를 호출해야 layout 재계산. 즉, **컨텐츠 변경 → invalidate → 다음 update constraints 패스에서 새 intrinsic 반영 → layout 패스로 frame 재확정** 순서.

자주 놓치는 케이스:

- 커스텀 뷰의 텍스트/이미지가 바뀌었는데 `invalidateIntrinsicContentSize()`를 안 부르면 부모 stack/제약은 옛 크기 그대로 잡고 있다.
- `UILabel`/`UIImageView`는 시스템이 자동 호출해주지만, *커스텀 그리기*나 외부에서 상태를 주입하는 뷰는 직접 호출 책임.

## 동적 셀 높이 (Self-Sizing Cells)

테이블/컬렉션 뷰에서 셀 높이를 콘텐츠에 맞추는 표준 패턴은 *intrinsic 기반*이다.

```swift
tableView.rowHeight = UITableView.automaticDimension
tableView.estimatedRowHeight = 60   // 초기 스크롤 성능을 위한 추정치
```

전제: 셀의 contentView에 **위→아래로 끊김 없이 연결된 vertical 제약** + 모든 자식 뷰가 `intrinsicContentSize`를 가지거나 명시적 height 제약을 가짐. 한 곳이라도 끊기면 "ambiguous height"로 추정값 그대로 굳거나 로그가 폭주한다.

높이가 콘텐츠 변화로 바뀌어야 할 때(다국어 텍스트 갱신 등):

```swift
tableView.beginUpdates()
tableView.endUpdates()         // 같은 셀들에 대해 높이만 다시 측정 + 애니메이션
// 또는 iOS 11+
tableView.performBatchUpdates(nil)
```

`reloadData()`는 셀이 다 재생성되어 스크롤 위치/포커스가 흔들리므로 *높이만 갱신*할 땐 위 방식이 낫다.

## safeAreaInsetsDidChange

노치/홈 인디케이터/키보드 등으로 **safe area가 바뀔 때 호출**되는 콜백. 키보드 등장·회전·iPad multitasking 폭 변경 시 같이 불린다.

```swift
override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    // safeAreaInsets 의존해 그라디언트/그림자/배경 위치를 재계산
}
```

주의:

- `viewDidLoad`에서 `view.safeAreaInsets`를 읽으면 `.zero`인 경우가 많다. 의미 있는 값은 첫 레이아웃 패스 이후.
- 대부분의 제약 기반 레이아웃은 `safeAreaLayoutGuide`만 쓰면 *자동으로* 재배치된다. `safeAreaInsetsDidChange`는 *제약이 아닌 직접 그리는 콘텐츠*(layer frame, draw rect)나 inset 의존 계산을 갱신할 때만 필요.
- `additionalSafeAreaInsets`를 컨테이너에 주면 자식 VC들이 그만큼 안쪽으로 밀린다 — 커스텀 툴바를 띄울 때 유용.

## 코드로 제약 짜기 (NSLayoutAnchor)

```swift
view.translatesAutoresizingMaskIntoConstraints = false
NSLayoutConstraint.activate([
    view.leadingAnchor.constraint(equalTo: parent.leadingAnchor, constant: 16),
    view.trailingAnchor.constraint(equalTo: parent.trailingAnchor, constant: -16),
    view.topAnchor.constraint(equalTo: parent.safeAreaLayoutGuide.topAnchor),
    view.heightAnchor.constraint(equalToConstant: 44)
])
```

**`translatesAutoresizingMaskIntoConstraints = false`**를 까먹으면 frame 기반 자동 변환 제약이 추가되어 *Unable to simultaneously satisfy constraints* 로그가 폭주한다.

## leading/trailing vs left/right

- leading/trailing: **언어 방향**에 따라 바뀜 (RTL 언어에서 좌우 반전).
- left/right: 항상 물리적 좌우.

대부분 leading/trailing 사용. RTL 대응이 자동으로 됨.

## Layout 사이클 — 3단계 패스

Auto Layout 엔진은 뷰 라이프사이클 위에서 **3단계 패스**로 돈다. 이 구조를 머릿속에 넣으면 "왜 어디서는 frame이 먹고 어디서는 안 먹는지"가 전부 설명된다.

| 단계 | 패스 | 직접 호출 | 예약(트리거) | 즉시 실행 |
|---|---|---|---|---|
| 1 | **Update constraints** (제약 갱신) | `updateConstraints` / `updateViewConstraints` | `setNeedsUpdateConstraints()` | `updateConstraintsIfNeeded()` |
| 2 | **Layout** (frame 확정) | `layoutSubviews` / `viewDidLayoutSubviews` | `setNeedsLayout()` | `layoutIfNeeded()` |
| 3 | **Display** (그리기) | `draw(_:)` | `setNeedsDisplay()` | (다음 화면 갱신) |

각 패스는 직접 호출하지 않고 **트리거 메서드로 "예약"** 만 한다. 실제 실행은 다음 화면 갱신 주기. 즉시 돌리고 싶을 때만 `layoutIfNeeded()` 같은 *...IfNeeded* 호출.

### frame이 "먹는 곳"과 "안 먹는 곳"

`translatesAutoresizingMaskIntoConstraints = false`인 뷰에 `view.frame = ...`을 직접 세팅해도 **2단계 레이아웃 패스에서 제약 기반으로 다시 계산되며 덮어쓴다.** "frame이 안 먹는" 듯 보이는 이유.

반대로 frame을 만져도 되는(정확히는 만져야 하는) 곳은 **레이아웃 패스가 끝난 직후**:

- `viewDidLoad()` — 뷰는 존재하지만 `view.bounds`는 아직 storyboard/이전 화면 기준. 제약 설정은 OK, **frame 계산은 NG**.
- `viewDidLayoutSubviews()` / `layoutSubviews()` — 제약이 모두 풀려 frame이 확정된 직후. frame 의존 작업은 전부 여기.

자세한 콜백 시점은 [viewcontroller-lifecycle](viewcontroller-lifecycle.md) 참조.

### CALayer는 Auto Layout을 안 탄다

`CAGradientLayer`, `CAShapeLayer`처럼 직접 추가한 레이어는 **제약의 영향을 받지 않는다.** frame을 수동으로 갱신해야 하고, 그 자리가 `layoutSubviews()`. (자세한 패턴: [core-animation](core-animation.md#calayer는-auto-layout을-안-탄다))

```swift
override func layoutSubviews() {
    super.layoutSubviews()
    gradientLayer.frame = bounds                       // 레이어는 수동
    circleView.layer.cornerRadius = bounds.height / 2  // bounds 의존 → 여기서
}
```

`cornerRadius`를 `viewDidLoad`에서 `bounds.height/2`로 잡으면 원이 안 되는 이유도 같다. 그 시점의 bounds는 최종값이 아니다.

## transform × Auto Layout

**핵심 규칙**: Auto Layout은 뷰의 `center`와 `bounds`(정렬 사각형)로 위치를 잡고, `transform`은 그 위에 별도로 얹힌다.

- `transform`(scale/rotate)은 **레이아웃 패스가 돌아도 초기화되지 않는다**. `center`/`bounds`는 제약이 정하고, `transform`은 그 위에 합성.
- `transform`이 identity가 **아닐 때 `frame` 값은 "정의되지 않음"** (Apple 문서 명시). 이때 frame을 읽거나 쓰면 안 된다. 위치 계산은 `center`와 `bounds`로.

**실무 원칙 — 하나만 골라라**: 일시적 시각 효과(버튼 눌림, 흔들기, 팝 애니메이션)는 `transform`으로, **영구적 레이아웃 변화**(펼침/접힘, 크기 변경)는 *제약*으로.

## 애니메이션 — 두 갈래

Auto Layout을 쓰면 애니메이션 방식이 둘로 갈린다.

### (A) 제약(constraint) 애니메이션 — 레이아웃 자체를 바꿀 때

```swift
heightConstraint.constant = 200
UIView.animate(withDuration: 0.3) {
    self.view.layoutIfNeeded()    // 블록 안에서 레이아웃 패스를 "즉시" 실행
}
```

`layoutIfNeeded()`가 핵심. 상수만 바꾸면 변화는 *다음 주기에 한 번에 튀어* 버린다. 애니메이션 블록 안에서 `layoutIfNeeded()`를 호출해 프레임 변화 과정을 보간(interpolate)시켜야 부드럽게 움직인다. 보통 변경된 제약이 속한 **공통 부모 뷰**에 대고 호출.

### (B) transform 애니메이션 — 레이아웃을 안 건드릴 때

```swift
UIView.animate(withDuration: 0.3) {
    self.iconView.transform = CGAffineTransform(scaleX: 1.2, y: 1.2)
}
// 복귀
UIView.animate(withDuration: 0.3) { self.iconView.transform = .identity }
```

`layoutIfNeeded()` 불필요. `transform`은 *레이아웃 변화가 아니라 렌더링 변형*이라 GPU에서 싸게 처리되고 제약과 충돌하지 않는다.

### 피해야 할 패턴

Auto Layout이 켜진 뷰의 **`.frame`을 직접 애니메이션**하지 마라. 다음 레이아웃 패스에서 제약대로 되돌아가며 *snap back* 한다.

## 우선순위 충돌 디버깅

- 콘솔에 `_UIConstraintBasedLayoutDebugging` 메시지가 길게 출력될 때, **"Will attempt to recover by breaking..."** 다음 줄이 *깨진* 제약.
- Xcode View Hierarchy Debugger → Constraints 탭에서 시각적으로 확인.
- `view.constraints`를 출력하거나 `identifier`를 부여해 추적 용이하게.

## Stack View

`UIStackView`는 axis/distribution/alignment/spacing만 설정해도 내부 자식들에게 적절한 제약을 자동 추가. 단순 정렬은 거의 다 stack view로 해결 → 제약 코드 양 급감.

## 비교 — Auto Layout vs Manual frame

| 구분 | Auto Layout | frame |
|---|---|---|
| 다양한 화면 크기 대응 | 자동 | 수동 |
| 동적 크기 (텍스트 길이) | intrinsicContentSize로 자동 | 매번 계산 |
| 성능 | constraint 풀이 비용 | 가장 빠름 |
| 가독성 | 제약 표현은 직관적 | 복잡해지면 지옥 |
| 적합 | 일반 UI | 게임, 애니메이션 핵심 영역 |

## 흔한 함정 / Follow-up

- **Q. UILabel의 텍스트가 잘려요.**
  CCRP가 옆 뷰보다 낮음. priority를 올리거나 옆 뷰의 hugging을 낮춰라.

- **Q. `translatesAutoresizingMaskIntoConstraints`가 뭔가?**
  옛 autoresizing mask를 NSLayoutConstraint으로 자동 변환할지 여부. *코드로 추가한 뷰*는 false로 두고 본인이 제약 짜야 함. 스토리보드는 자동 false.

- **Q. constraint 활성/비활성 토글 vs 추가/제거?**
  활성/비활성이 빠름 — constraint 객체 재사용. 자주 토글되는 제약은 IBOutlet이나 프로퍼티로 보관.

- **Q. `sizeToFit()`과 `sizeThatFits(_:)`의 차이?**
  `sizeThatFits(_:)`는 *계산만 반환*, `sizeToFit()`은 그 결과로 자기 frame을 갱신. Auto Layout 환경에선 직접 호출 거의 안 함.

- **Q. `safeAreaLayoutGuide` vs `layoutMarginsGuide`?**
  safeArea는 노치/홈인디케이터 제외 영역. layoutMargins는 콘텐츠 여백 가이드(기본 16pt). 보통 safeArea + 적절한 inset 패턴.

- **Q. layout이 무한 루프?**
  `layoutSubviews`에서 제약 추가/변경하면 다시 layout 사이클 → 무한 루프 가능. 제약 변경은 `updateConstraints`나 적절한 액션 시점에.

- **Q. `viewDidLoad`에서 `cornerRadius = bounds.height / 2`로 잡으면 원이 안 되는 이유?**
  그 시점의 `bounds`는 storyboard/이전 화면 기준이라 최종값이 아니다. `viewDidLayoutSubviews`(또는 셀이면 `layoutSubviews`)에서 잡아야 한다. → [viewcontroller-lifecycle](viewcontroller-lifecycle.md#viewdidload에서-frame을-쓰면-안-되는-이유)

- **Q. `transform = scale(1.2)` 적용 후 `frame`을 읽으면?**
  값이 "정의되지 않음". `transform`이 identity가 아닐 때 `frame`은 읽지도 쓰지도 마라 — `center`와 `bounds`로 계산.

- **Q. 제약을 바꿨는데 애니메이션이 튐 / 즉시 점프?**
  애니메이션 블록 *안*에서 `layoutIfNeeded()`를 호출하지 않아서. 그러면 변경이 다음 주기에 한 번에 적용되어 보간이 안 일어난다. 공통 부모 뷰에 대고 블록 안에서 호출.

- **Q. self-sizing 셀이 첫 스크롤 시 살짝 튄다?**
  `estimatedRowHeight`가 실제 평균과 너무 동떨어졌을 때. 측정 후 실제값으로 교체되며 contentSize/contentOffset이 보정되어 흔들림이 보인다. 추정치를 실제 평균에 가깝게 주거나, 가능하면 고정 높이.

- **Q. 키보드가 올라왔는데 `safeAreaInsets`로 받지 못한다?**
  iPhone에서 키보드는 `safeAreaInsets`에 반영되지 않는다(iPad floating은 일부 반영). `UIResponder.keyboardWillShowNotification`로 직접 처리하거나 `keyboardLayoutGuide`(iOS 15+) 사용.

## 참고

- Apple Docs: Auto Layout Guide
- WWDC 2018: High Performance Auto Layout
