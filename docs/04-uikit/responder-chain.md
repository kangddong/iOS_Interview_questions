# Responder Chain

> 한 줄 요약 — 터치/키보드/모션 같은 이벤트를 처리할 객체를 찾아 **first responder부터 부모로 거슬러 올라가며 시도**하는 메커니즘. UIView, UIViewController, UIApplication, AppDelegate 모두 `UIResponder` 서브클래스라 가능.

## 두 단계

이벤트 처리는 두 단계로 나뉜다:

1. **Hit-Testing** — 터치 좌표가 *어느 뷰*인지 결정. (`hitTest(_:with:)`, `point(inside:with:)`)
2. **Responder Chain** — 그 뷰에서 시작해, 처리 가능한 responder를 위로 검색.

## Hit-Testing

```
UIWindow.hitTest
 └ root view.hitTest
    └ subviews를 역순(맨 위부터) 으로 hitTest 재귀
       └ 가장 깊고 좌표를 포함하는 뷰 반환
```

- `isHidden`, `alpha < 0.01`, `isUserInteractionEnabled == false`인 뷰는 통과.
- 부모의 `clipsToBounds`가 false라면 부모 frame 밖 자식도 그릴 수는 있지만 hit-test에는 *기본적으로 안 잡힘* → `point(inside:)` 오버라이드 필요.

## Responder Chain 흐름

터치 이벤트 기준:

```
hit view → superview → ... → UIViewController → ... → UIWindow → UIApplication → AppDelegate
```

각 responder는 이벤트를 *처리*하거나 *다음으로 넘긴다*(`next`).

```swift
override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    // 처리하거나
    super.touchesBegan(touches, with: event)   // 처리 안 하면 부모로
}
```

## first responder

키보드 입력 같은 *비위치 기반 이벤트*의 시작점. 보통 텍스트 필드 등이 `becomeFirstResponder()`로 자기 자신을 first responder로 만든다.

```swift
textField.becomeFirstResponder()       // 키보드 올라옴
textField.resignFirstResponder()       // 내림

// 화면 어디든 터치하면 키보드 내리는 흔한 패턴
view.endEditing(true)
```

## target-action에서 활용

```swift
// nil target — 현재 first responder로 시작해 chain을 따라 selector 처리할 객체를 찾음
UIApplication.shared.sendAction(#selector(MyAction.doStuff), to: nil, from: self, for: nil)
```

`UIMenuController`/`UIEditMenuInteraction`이 이런 방식으로 `copy:` `paste:` 등을 라우팅한다.

## 자주 묻는 시나리오

### 부모 frame 밖 자식의 터치를 받게 하려면

```swift
override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    // 자식의 frame을 부모 좌표로 변환해서 직접 검사
    return super.point(inside: point, with: event)
        || childButton.frame.contains(point)
}
```

### 특정 뷰만 터치를 통과시키기

```swift
override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    let v = super.hitTest(point, with: event)
    return v == self ? nil : v   // 자기 자신은 통과
}
```

오버레이/딤뷰에서 자주 쓰임.

## 흔한 함정 / Follow-up

- **Q. `isUserInteractionEnabled`가 false면 자식도 터치 불가?**
  맞다. 부모의 hit-test 자체가 통과돼서 자식까지 도달 안 함.

- **Q. 버튼이 터치 안 먹는 이유는?**
  - `isUserInteractionEnabled` false (UIImageView는 기본 false)
  - 부모 view가 frame 밖에 있어서 `clipsToBounds = true`로 잘림 + 터치 영역 밖
  - 더 위에 투명 view가 가려서 hit이 그쪽으로 감
  - alpha가 거의 0
  - gesture recognizer가 가로채는 중

- **Q. `gestureRecognizer`와 responder chain의 관계?**
  제스처가 먼저 이벤트를 가로챔. 인식되지 않으면 responder chain으로 흘러감. `cancelsTouchesInView` 속성으로 제어.

- **Q. UIViewController는 responder chain의 어디?**
  자기 view와 그 view의 superview 사이. 즉, view에서 처리 안 된 이벤트가 VC로 올라가고, VC도 처리 안 하면 view의 superview로 다시 올라감.

- **Q. `nextResponder()`는?**
  현재 responder의 다음을 반환. UIView는 보통 superview, root view는 viewController. 디버깅 시 chain을 출력해 볼 수 있다.

## Objective-C 비교

- Responder Chain은 ObjC AppKit/UIKit이 만든 패턴 — `UIResponder`/`NSResponder` 클래스 자체가 ObjC 클래스.
- target-action의 `nil` target은 사실상 responder chain을 위한 selector 라우팅:
  ```objc
  [UIApplication.sharedApplication sendAction:@selector(copy:) to:nil from:self forEvent:nil];
  ```
  현재 first responder부터 chain을 따라가며 `respondsToSelector:@selector(copy:)`인 객체에 메시지를 보낸다. (`UIMenuController`/`UIEditMenuInteraction`의 copy/paste 메커니즘)
- `hitTest:withEvent:` / `pointInside:withEvent:`도 ObjC 시절 시그니처 그대로. Swift에선 `hitTest(_:with:)`로 이름만 변환.
- ObjC `UIResponder`의 인터페이스는 `<UIResponderStandardEditActions>` protocol에서 `cut:`/`copy:`/`paste:` 같은 표준 selector들을 정의.
- 더 깊게: [17-objective-c/method-dispatch](../../17-objective-c/method-dispatch.md) (responder chain은 결국 selector lookup의 응용)

## 참고

- Apple Docs: Using Responders and the Responder Chain to Handle Events
- WWDC 2014: Building Interruptible and Responsive Interactions
