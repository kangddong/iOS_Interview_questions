# Core Animation / CALayer

> 한 줄 요약 — UIView는 사실 **CALayer를 감싼 얇은 wrapper**다. 그리기/애니메이션의 실질적 주체는 layer이고, 이 layer 트리를 별도 *Render Server*가 GPU로 그린다.

## UIView ↔ CALayer

```swift
let view = UIView()
view.layer            // CALayer 인스턴스
view.layer.cornerRadius = 12
view.layer.shadowOpacity = 0.2
```

- 모든 UIView는 자기 layer를 1:1로 가짐 (`layerClass`로 교체 가능 — 예: `CAShapeLayer`).
- 시각 표현(코너, 그림자, 마스크, transform)은 거의 layer 속성.
- UIView는 layer 위에 *터치 처리* 같은 기능을 추가한 컨테이너.

## CALayer는 Auto Layout을 안 탄다

`CAGradientLayer`, `CAShapeLayer`처럼 **UIView에 직접 추가한 sublayer는 Auto Layout 제약의 영향을 받지 않는다.** 그래서 부모 뷰 크기가 바뀌면 레이어 frame은 그대로 남고 어긋난다. 갱신은 `layoutSubviews()` (커스텀 뷰) 또는 `viewDidLayoutSubviews()` (VC)에서 직접:

```swift
override func layoutSubviews() {
    super.layoutSubviews()
    gradientLayer.frame = bounds                       // 매 레이아웃 패스마다 동기화
    circleView.layer.cornerRadius = bounds.height / 2  // bounds 의존 → 여기서
}
```

같은 이유로 `cornerRadius = bounds.height / 2`를 `viewDidLoad`에서 잡으면 그 시점 `bounds`가 최종값이 아니라 원이 안 된다. → 자세히는 [Auto Layout 3단계 패스](auto-layout.md#layout-사이클--3단계-패스)

## Implicit vs Explicit Animation

```swift
// implicit — layer 속성 변경이 자동 0.25s 애니메이션
layer.opacity = 0.5

// 단, view.layer를 직접 만지면 UIView가 implicit 끔. 명시 필요.
UIView.animate(withDuration: 0.3) { view.alpha = 0.5 }

// explicit
let anim = CABasicAnimation(keyPath: "opacity")
anim.fromValue = 1
anim.toValue = 0
anim.duration = 0.3
layer.add(anim, forKey: "fade")
layer.opacity = 0   // 모델 값도 직접 갱신 (안 그러면 끝나고 원위치)
```

## presentationLayer vs modelLayer

- **modelLayer**: 우리가 set 하는 값. 즉시 반영.
- **presentationLayer**: 화면에 *지금 보이는* 값. 애니메이션 중에는 둘이 다름.

히트테스트, 좌표 계산 시 애니메이션 중인 위치를 알고 싶으면 `layer.presentation()` 사용.

## drawRect는 비싸다

`UIView.draw(_:)`나 `CALayer.draw(in:)`을 override 하면 CPU에서 그려서 비트맵으로 GPU 업로드. 자주 변하면 비용 큼.

권장:
- 도형은 `CAShapeLayer` + `UIBezierPath`
- 텍스트는 `UILabel`
- 그림자/코너는 layer 속성 + `shadowPath` 명시

`shadowPath`를 안 주면 알파 채널에서 그림자 모양을 매번 계산 → 스크롤 시 hitch 원인.

## Off-Screen Rendering 트리거

다음 속성들은 GPU에서 별도 패스로 렌더 → 비용 ↑

- `layer.shouldRasterize = true` (캐시 목적이지만 잘못 쓰면 역효과)
- `cornerRadius` + `masksToBounds = true` + 비단순 컨텐츠
- `mask` 사용
- 그림자 (`shadowPath` 없을 때)

스크롤 셀에서 위 조합을 남발하면 60fps가 깨진다.

## Implicit 트랜잭션

`CATransaction.begin/commit`으로 묶으면 그룹 단위 애니메이션. UIView.animate가 내부적으로 사용.

```swift
CATransaction.begin()
CATransaction.setAnimationDuration(0.5)
CATransaction.setCompletionBlock { print("done") }
layer.opacity = 0
layer.position.y += 50
CATransaction.commit()
```

## UIView.animate 옵션

```swift
UIView.animate(
    withDuration: 0.3,
    delay: 0,
    usingSpringWithDamping: 0.7, initialSpringVelocity: 0,
    options: [.curveEaseInOut, .allowUserInteraction]
) {
    view.transform = .init(translationX: 0, y: -100)
}
```

- `.allowUserInteraction`: 애니메이션 중 터치 허용.
- `.beginFromCurrentState`: 진행 중 애니메이션을 가로채 자연스럽게 이어감.

## 흔한 함정 / Follow-up

- **Q. `cornerRadius`만으로 동그란 마스크가 안 된다?**
  자식 뷰 클립이 필요하면 `layer.masksToBounds = true` (또는 `view.clipsToBounds`).

- **Q. 그림자가 cornerRadius와 함께 쓰면 잘리는 이유?**
  shadow는 layer 밖으로 그려지는데 `masksToBounds = true`면 그 영역까지 잘림. 컨테이너 뷰를 두 개로 분리(바깥 = shadow, 안 = clip)하거나 `shadowPath` 사용.

- **Q. 애니메이션이 끝나면 원위치되는 이유?**
  `CABasicAnimation`은 model 값을 안 바꿈. 끝난 뒤 원위치. *완료 후 도착 상태를 유지*하려면 model 값을 직접 set 하거나 `fillMode + isRemovedOnCompletion = false`.

- **Q. UIView.animate에서 `transform`을 두 번 바꾸려면?**
  `keyframe` API 사용 또는 nested animate. spring 진행 중에 새 spring을 시작하려면 iOS 10+ `UIViewPropertyAnimator`.

- **Q. `shouldRasterize`는 언제 켜나?**
  이미지처럼 *변하지 않는 복잡한 layer*. 자주 변하는 layer에 켜면 캐시 무효화로 더 느려짐. `rasterizationScale = UIScreen.main.scale` 함께.

## 참고

- Apple Docs: Core Animation Programming Guide
- objc.io: Animations Explained
