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

값이 바뀌면 `invalidateIntrinsicContentSize()` 호출해야 layout 재계산.

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

## Layout 사이클

```
setNeedsLayout       → 다음 사이클에 layout 다시
layoutIfNeeded       → 즉시 layout
                      ↓
updateConstraints    → 제약 갱신
layoutSubviews       → frame 결정
draw(_:)             → (필요 시) 그리기
```

애니메이션에서 제약을 *애니메이팅* 하려면:

```swift
heightConstraint.constant = 200
UIView.animate(withDuration: 0.3) {
    self.view.layoutIfNeeded()    // 이 호출이 있어야 변경이 보간됨
}
```

`frame`을 직접 바꾸지 말고 *제약*을 바꾼 뒤 `layoutIfNeeded`를 애니메이션 블록 안에서 호출하는 패턴이 핵심.

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

## 참고

- Apple Docs: Auto Layout Guide
- WWDC 2018: High Performance Auto Layout
