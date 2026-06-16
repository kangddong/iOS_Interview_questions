# Off-Screen Rendering 트리거와 대응

> 한 줄 요약 — UIKit/Core Animation은 *한 번에 합성 가능한 레이어*를 즉시 그리고, 그러지 못하는 경우 **off-screen pass**(별도 텍스처 + composite)를 한다. 이 추가 패스가 매 프레임 발생하면 GPU 부하 → hitch. 가장 흔한 트리거는 *cornerRadius + masksToBounds*, *그림자*, *blur*, *mask layer* 결합.

## Off-Screen Rendering이란

정상 path:
```
Layer tree → 단일 합성 패스 → 화면
```

Off-screen path:
```
Layer tree → off-screen buffer에 먼저 렌더 → 그 결과를 다시 화면에 composite
```

= GPU 메모리 + 추가 fragment shader 패스. 매 프레임이면 비용 누적.

## 흔한 트리거

| 트리거 | 이유 |
|---|---|
| `cornerRadius` + `masksToBounds = true` (UIImageView/UIVisualEffectView 등 *컨텐츠가 있는* 레이어) | 마스크 적용을 위해 off-screen 합성 |
| `shadowPath` 없이 `shadowOpacity > 0` | 컨텐츠 알파 추적 위해 off-screen |
| `mask` 레이어 | 마스크 합성 |
| `allowsGroupOpacity` + 자식의 알파 차이 | 그룹 합성 |
| `shouldRasterize = true` (잘못 사용 시) | 매 변경마다 rasterize 비용 |

## 측정

Simulator → *Debug → Color Off-screen Rendered* 또는 Instruments → Core Animation → *Off-Screen-Rendered: Yellow Overlay*. 노란색으로 보이는 영역이 off-screen.

스크롤 리스트에 노란색 셀이 줄줄이면 hitch 100% 발생.

## 대응 전략

### 1) cornerRadius — `shadowPath` 또는 마스크 이미지

```swift
view.layer.cornerRadius = 12
view.clipsToBounds = true              // ← 컨텐츠 있으면 off-screen
```

대안:
- **CALayer.cornerCurve = .continuous** (iOS 13+)는 보통 GPU 가속됨 (UIImageView 같은 *컨텐츠 레이어* 제외)
- 모서리만 둥근 이미지를 *Image asset*에서 직접 만들기
- iOS 14+ `view.layer.maskedCorners`로 일부 corner만

### 2) Shadow — `shadowPath` 명시

```swift
// ❌ 매 프레임 알파 추적
view.layer.shadowOpacity = 0.2
view.layer.shadowRadius = 8

// ✅ 명시적 path → off-screen 회피
view.layer.shadowPath = UIBezierPath(roundedRect: view.bounds, cornerRadius: 12).cgPath
```

bounds가 바뀌면 path도 갱신 필요. `layoutSubviews`에서 재계산.

### 3) `shouldRasterize` — 양날의 검

```swift
view.layer.shouldRasterize = true
view.layer.rasterizationScale = UIScreen.main.scale
```

장점: *변하지 않는 복잡한 레이어*를 캐시 → 합성 비용 감소

단점: *변경되면* 매번 rasterize → 오히려 비싸짐. 애니메이션/스크롤 중 frame이 바뀌는 레이어엔 *역효과*.

판단:
- 정적 콘텐츠(아이콘, 로고)에만 적용
- transform 애니메이션 동안엔 OFF로 변경
- 잘 모르겠으면 *측정*

### 4) Blur — `UIVisualEffectView`

블러는 *반드시 off-screen pass*. 피하려면:
- 한 번 블러 처리된 이미지를 캐시
- 블러 영역을 작게 (전체 화면 블러 → CPU/GPU 큰 부담)

### 5) `allowsGroupOpacity`

부모/자식 알파가 *서로 다른 경우* 정확한 합성을 위해 그룹 합성 → off-screen. iOS 7부터 기본 ON.

```swift
view.layer.allowsGroupOpacity = false
```

부정확한 알파 합성을 *받아들일 수 있는* 경우만 OFF. 보통 문제 없음.

## 스크롤 + 둥근 모서리 + 그림자 셀 — 종합 가이드

iOS의 가장 흔한 hitch 원인:

```swift
class Cell: UICollectionViewCell {
    override init(frame: CGRect) {
        super.init(frame: frame)
        layer.cornerRadius = 12
        clipsToBounds = true            // ❌ off-screen
        layer.shadowOpacity = 0.15      // ❌ off-screen (shadowPath 없음)
        layer.shadowRadius = 6
    }
}
```

수정:

```swift
override init(frame: CGRect) {
    super.init(frame: frame)
    // 1) 그림자 컨테이너 + 컨텐츠 뷰 분리
    contentContainer.layer.cornerRadius = 12
    contentContainer.layer.cornerCurve  = .continuous
    contentContainer.clipsToBounds = true
    addSubview(contentContainer)

    // 2) 그림자는 contentContainer 밖에서, 명시적 path로
    layer.shadowOpacity = 0.15
    layer.shadowRadius  = 6
    // shadowPath는 layoutSubviews에서
}

override func layoutSubviews() {
    super.layoutSubviews()
    contentContainer.frame = bounds
    layer.shadowPath = UIBezierPath(roundedRect: bounds, cornerRadius: 12).cgPath
}
```

## SwiftUI는?

SwiftUI도 내부적으로 Core Animation. `.cornerRadius`, `.shadow`는 같은 비용 함정을 가짐.

```swift
.shadow(color: .black.opacity(0.2), radius: 8)
```

내부에서 *shadowPath 없이* 알파 추적 off-screen 가능. iOS 17+ `Renderer`/`drawingGroup`이 일부 케이스 최적화.

## 흔한 함정 / Follow-up

- **Q. cornerRadius 자체가 항상 off-screen인가?**
  아니다. *컨텐츠가 있는* 레이어(UIImageView, UIVisualEffectView)에만 강제. UIView의 *배경색만 있는 모서리*는 보통 GPU 가속.

- **Q. `clipsToBounds`와 `masksToBounds` 차이?**
  같은 것. UIView의 wrapper 속성과 CALayer 속성. 둘 다 마스크 활성화 → off-screen 트리거.

- **Q. UIImageView의 둥근 모서리를 어떻게?**
  *최선*: 둥글게 사전 처리된 이미지(서버/캐시). *대안*: `UIGraphicsImageRenderer`로 미리 베이크. UIBezierPath mask는 비싸다.

- **Q. SwiftUI에서 *모범 패턴*?**
  `.background { RoundedRectangle(cornerRadius:) }` + `.clipShape(RoundedRectangle(...))` 조합이 일반적. shadow는 별도 layer로 분리.

- **Q. Off-screen이 *항상* 나쁜가?**
  아니다. *정적 콘텐츠 한 번 만 cache*하면 이후 합성이 매우 빠름. *매 프레임 발생*이 문제.

- **Q. tableView 셀에서 흔한 또 다른 hitch?**
  큰 이미지 디코딩(메인 스레드), Auto Layout 깊은 hierarchy, async 이미지 로드 후 *프레임 변경*으로 layout 재계산.

## 참고

- WWDC 2014: Advanced Graphics and Animations for iOS Apps
- WWDC 2019: Optimizing Collections (UICollectionView prefetch)
- Apple: Render Loop and Off-Screen Rendering
