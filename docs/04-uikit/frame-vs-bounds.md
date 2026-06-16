# frame vs bounds

> 한 줄 요약 — **frame은 부모 좌표계에서의 위치/크기, bounds는 자기 좌표계에서의 위치/크기**. 회전/스케일 같은 transform이 끼면 둘이 결정적으로 갈린다.

## 정의

| 속성 | 좌표계 | 값 |
|---|---|---|
| `frame` | superview | 자기 view의 위치(origin) + 크기(size) |
| `bounds` | self | 자기 내부 좌표 (보통 origin = .zero) |
| `center` | superview | frame의 중심점 |

## 예시

```swift
let v = UIView(frame: CGRect(x: 50, y: 100, width: 200, height: 300))

v.frame   // (50, 100, 200, 300)
v.bounds  // (0, 0, 200, 300)
v.center  // (150, 250)  ← (50+100, 100+150)
```

## transform이 끼면

```swift
v.transform = CGAffineTransform(rotationAngle: .pi / 4)

v.frame   // 회전 후 *바운딩 박스* — 크기/위치 모두 바뀜
v.bounds  // 그대로 (0, 0, 200, 300)
```

- `frame`은 *변환된 후*의 직사각형(바운딩 박스). transform 적용된 view의 frame을 직접 set 하면 transform이 깨질 수 있음 → 권장 X.
- `bounds`와 `center`는 transform과 독립.

**원칙: transform을 쓸 때는 frame 대신 bounds + center로 위치/크기를 다뤄라.**

## bounds.origin의 활용 — 스크롤

`UIScrollView`가 콘텐츠를 스크롤하는 원리는 **자기 bounds.origin을 움직이는 것**. 자식 뷰 frame은 그대로지만, 부모 bounds origin이 움직이면 *상대적으로* 자식이 위로 올라가 보임.

```swift
scrollView.contentOffset == scrollView.bounds.origin    // 동일 의미
```

## superview에서의 위치 변환

```swift
let p = innerView.convert(CGPoint.zero, to: rootView)
let r = innerView.convert(innerView.bounds, to: rootView)
```

여러 부모 거친 좌표 변환은 `convert(_:to:)` / `convert(_:from:)` 사용. 직접 frame 더하지 말 것.

## 흔한 함정 / Follow-up

- **Q. `viewDidLoad`에서 `view.bounds`로 그라디언트를 만들면 왜 잘못되나?**
  그 시점엔 view가 아직 부모에 추가되지 않았거나 storyboard 기준 크기. 실제 크기는 `viewDidLayoutSubviews` 또는 `viewIsAppearing`에서.

- **Q. 회전 후 frame을 set 했는데 화면이 깨진다.**
  transform이 있는 상태에서 frame을 직접 쓰면 시스템이 transform을 분해하다 깨짐. bounds.size + center 조합 사용.

- **Q. `bounds.origin`이 `.zero`가 아닐 수 있나?**
  스크롤뷰처럼 의도적으로 옮길 수 있음. 직접 `view.bounds = ...`로 옮길 일은 거의 없음.

- **Q. SwiftUI에서 같은 개념?**
  `GeometryReader`의 `frame(in: .local)` vs `frame(in: .global)`이 비슷한 구분. local = 부모 기준, global = 화면 기준.

## 참고

- Apple Docs: View Geometry
- Big Nerd Ranch / Hacking with Swift: frame vs bounds 비교 자료 다수
