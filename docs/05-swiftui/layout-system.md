# SwiftUI Layout 시스템

> 한 줄 요약 — **Parent proposes a size, child decides its own size**. 부모가 *제안*하고, 자식이 *원하는 크기*를 답하면 부모가 그 결과로 위치를 정한다. Auto Layout의 제약식 풀이와 다른 *재귀적 협상*.

## 단계

```
1. Parent → Child : "이 크기 어때?" (proposed size)
2. Child       : 자기 크기 결정 (Text는 줄바꿈 후 크기, Image는 원본/리사이즈, 등)
3. Parent      : 받은 크기로 자식 위치 결정
```

핵심: **자식이 자기 크기를 결정한다**. 부모의 제안은 *제안*일 뿐 강제 아님.

## Modifier 순서가 결과를 바꾼다

```swift
Text("hi")
    .padding(20)
    .background(Color.red)
// padding이 먼저 → padding 영역까지 빨강

Text("hi")
    .background(Color.red)
    .padding(20)
// background 먼저 → padding은 외부 → 빨강은 텍스트만
```

각 modifier는 *새 View를 감싸는* 형태라서 순서가 바뀌면 *부모-자식 관계*가 바뀐다.

## frame은 제안값을 변경할 뿐

```swift
Text("hi").frame(width: 200, height: 100)
```

- 실제로는 "Text에게 200x100을 제안하는 새 View"가 생성됨.
- Text는 그 제안 안에서 자기 크기를 답함 (Text는 보통 텍스트 크기 그대로). 결과적으로 Text는 작고 그 주변에 빈 영역.
- 영역을 명시적으로 채우려면 `.frame(maxWidth: .infinity, maxHeight: .infinity)`.

## Stack의 의도

| Stack | 정렬 | 자식에게 제안 |
|---|---|---|
| `VStack` | 수직 | (전체 폭, 균등 분할 높이) |
| `HStack` | 수평 | (균등 분할 폭, 전체 높이) |
| `ZStack` | 겹침 | (전체 폭/높이) |

Stack은 **유연한 자식부터 공간 분배**한다 (Spacer, frame(minWidth:) 등). 고정 크기 자식 먼저 처리한 뒤 남은 공간을 유연한 자식에게.

## Spacer / Layout Priority

```swift
HStack {
    Text("긴 텍스트가 있는데 짤릴 수도 있어요")
    Spacer()
    Image(systemName: "star")
}
```

자식이 모두 유연하면 layoutPriority로 어떤 게 우선 공간을 가져갈지 정함:

```swift
.layoutPriority(1)
```

## GeometryReader

부모의 *제안 크기*를 직접 받아 자식 레이아웃에 사용.

```swift
GeometryReader { proxy in
    HStack {
        Color.red.frame(width: proxy.size.width * 0.3)
        Color.blue
    }
}
```

- 항상 *부모가 준 만큼*을 채움 (greedy).
- 자식 크기를 부모로 *전달*하려면 PreferenceKey 사용.

## PreferenceKey — 자식 → 부모 정보 전파

```swift
struct HeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

Text("hi")
    .background(GeometryReader { proxy in
        Color.clear.preference(key: HeightKey.self, value: proxy.size.height)
    })

VStack { ... }
    .onPreferenceChange(HeightKey.self) { h in maxHeight = h }
```

자식의 측정값을 *부모로 거슬러* 올리는 표준 패턴. 단, 무한 루프(자식 크기에 따라 부모가 바뀌고 → 자식 크기 다시 변경)에 주의.

## Custom Layout (iOS 16+)

```swift
struct FlowLayout: Layout {
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize { ... }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) { ... }
}

FlowLayout { ForEach(tags) { Tag($0) } }
```

자식의 크기를 받아 직접 배치. flow/wrap, 워터폴 등 표준 stack으로 안 되는 레이아웃에.

## 비교 — Auto Layout vs SwiftUI Layout

| 구분 | Auto Layout | SwiftUI |
|---|---|---|
| 모델 | 제약식 풀이 | 재귀 협상 |
| 우선순위 | priority/CHP/CCRP | layoutPriority + greedy/non-greedy |
| 내용 의존 | intrinsicContentSize | 자식이 답한 크기 |
| 디버깅 | 콘솔 + view debugger | overlay/border + Self-Sizing Preview |

## 흔한 함정 / Follow-up

- **Q. `Color`나 `Spacer`가 화면을 다 채우는 이유?**
  flexible (제안된 만큼 채움). 이런 자식이 있으면 부모의 frame이 큰 만큼 다 차지.

- **Q. `.frame(width:)`만 쓰는데 자식이 작아요.**
  frame이 *부모의 제안*만 바꿀 뿐, Text는 자기 텍스트 크기에서 멈춤. `frame(maxWidth: .infinity)`로 채워라.

- **Q. GeometryReader가 의도치 않게 너무 큼.**
  GeometryReader는 항상 부모 크기를 다 채움. 작게 쓰려면 부모가 명확히 크기를 잡아 준 컨텍스트 안에서.

- **Q. 사용자 폰트 크기(Dynamic Type) 대응은?**
  SwiftUI의 텍스트 modifier는 자동 적응. `.dynamicTypeSize`/Environment로 제한 가능.

- **Q. 키보드가 올라올 때 레이아웃이 깨져요.**
  `.ignoresSafeArea(.keyboard)` 또는 `.scrollDismissesKeyboard(.interactively)` 같은 modifier로 제어.

## 참고

- WWDC 2019: Building Custom Views with SwiftUI
- WWDC 2022: Compose custom layouts with SwiftUI
- objc.io / SwiftUI Lab: Layout 시리즈
