# 선언형 모델과 View가 struct인 이유

> 한 줄 요약 — SwiftUI는 **상태로부터 UI를 함수처럼 도출**한다. View가 struct인 이유는 *값 비교를 통해 변경된 부분만 다시 계산*하는 diffing 모델이 가능하게 하려고.

도입 버전: SwiftUI iOS 13+

## 명령형 vs 선언형

```swift
// 명령형 (UIKit)
if isLoading { spinner.isHidden = false; label.isHidden = true }
else         { spinner.isHidden = true;  label.isHidden = false; label.text = data }

// 선언형 (SwiftUI)
var body: some View {
    if isLoading { ProgressView() } else { Text(data) }
}
```

명령형은 *상태 → UI 변경*을 일일이 적어야 하고, 코드가 늘면 *언제 무엇이 어떻게 갱신되는지* 추적이 어렵다. 선언형은 "이 상태일 때 UI는 이 모양"을 선언하면, 프레임워크가 변경 부분만 적용한다.

## View는 struct (값 타입)

```swift
struct ContentView: View {
    @State var count = 0
    var body: some View { Text("\(count)") }
}
```

- 매번 body가 호출되어도 struct 생성은 거의 무료.
- SwiftUI는 *이전 struct 값*과 *새 struct 값*을 비교(`Equatable` 또는 reflection)해 변경 영역만 다시 그림.
- 클래스라면 참조 동일성 때문에 변경 추적이 복잡해지고 식별이 모호해짐.

**중요한 점**: View struct는 *블루프린트*. 실제 화면을 들고 있는 백킹 스토어는 따로 있고, 우리가 만드는 struct는 *기술서*에 가깝다.

## body가 자주 호출돼도 괜찮은 이유

- body 자체는 가볍게 다시 호출됨 (수십~수백 번도 정상).
- 그러나 **body 호출 ≠ 실제 렌더링**. 같은 결과면 SwiftUI가 더 이상 일하지 않음.
- 따라서 body 안에서 *비싼 계산*은 절대 금지. 계산은 model/store/computed property 캐시.

```swift
// ❌ body 안에서 무거운 계산
var body: some View {
    Text(items.map { expensiveTransform($0) }.joined())
}

// ✅ 계산을 외부로 분리
@State private var displayText: String = ""
var body: some View { Text(displayText) }
```

## some View — opaque type

```swift
var body: some View { ... }
```

- 컴파일러는 *어떤 View*인지 알지만, 호출자에게는 숨김(opaque).
- 덕분에 `VStack { ... }` 같은 복잡한 제네릭 트리 타입을 직접 적지 않아도 됨.

## 비교 — UIKit vs SwiftUI

| 구분 | UIKit | SwiftUI |
|---|---|---|
| 모델 | 명령형 | 선언형 |
| View 타입 | class (UIView) | struct |
| 상태 ↔ UI | 직접 갱신 | diff 후 자동 |
| 제스처/애니메이션 | API 양 많음 | 모디파이어 |
| 학습 곡선 | 깊음 | 빠르지만 내부 모델 이해 필요 |
| 호환 | iOS 2+ | iOS 13+ (실용은 16+) |

## 흔한 함정 / Follow-up

- **Q. View가 매번 새로 만들어지면 비싸지 않나?**
  struct 자체는 거의 비용 없음. SwiftUI는 *child View identity*를 유지해 실제 렌더 트리 노드는 재사용.

- **Q. View struct 안에 클래스 reference를 두면?**
  가능하지만 변경 추적이 어려워짐. `@StateObject`/`@ObservedObject`/`@Observable`로 감싸야 SwiftUI가 변경을 알 수 있음.

- **Q. body 안에서 부작용을 일으키면?**
  금지. body는 *순수 함수*처럼 동작해야 함. 변경은 `onAppear`, `onChange`, action(`Button`)에서.

- **Q. SwiftUI가 더 이상 일하지 않는다는 걸 어떻게 보장하나?**
  자식 View가 `Equatable`이거나 reflection으로 동일하다고 판단되면 그 서브트리를 skip. `EquatableView`로 명시도 가능.

## 참고

- WWDC 2019: SwiftUI Essentials
- WWDC 2021: Demystify SwiftUI
- WWDC 2023: Demystify SwiftUI performance
