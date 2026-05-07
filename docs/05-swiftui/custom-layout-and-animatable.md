# Custom Layout / Animatable / Transaction (SwiftUI 심화)

> 한 줄 요약 — 표준 stack으로 안 되는 레이아웃은 **`Layout` 프로토콜**(iOS 16+)로 직접 구현. 애니메이션은 **`Animatable` + `Transaction`**이 *값 보간*과 *제어 컨텍스트*를 담당.

도입 버전: `Layout` iOS 16+, `Animatable`/`Transaction` iOS 13+

## Custom Layout — `Layout` 프로토콜

```swift
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, lineHeight: CGFloat = 0
        for s in subviews {
            let size = s.sizeThatFits(.unspecified)
            if x + size.width > maxWidth {
                x = 0; y += lineHeight + spacing; lineHeight = 0
            }
            x += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
        return CGSize(width: maxWidth, height: y + lineHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, lineHeight: CGFloat = 0
        for s in subviews {
            let size = s.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX { x = bounds.minX; y += lineHeight + spacing; lineHeight = 0 }
            s.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
    }
}

FlowLayout { ForEach(tags) { Tag($0) } }
```

- `sizeThatFits`: 부모 제안에 대해 *내가 원하는 크기*.
- `placeSubviews`: 결정된 영역 안에 자식 배치.
- `cache`: 계산 비용 큰 값을 보관 (기본 ()).

## Layout Protocol vs GeometryReader

| | `Layout` | GeometryReader |
|---|---|---|
| 용도 | 진짜 새 레이아웃 정의 | 부모 크기 읽기 |
| greedy | 아니다 (자식 배치 명시) | 항상 부모 크기 채움 |
| 성능 | 고정 비용 | 갈등 시 무한 루프 위험 |
| 추천 | iOS 16+ flow/wrap 등 | 작은 영역 측정 |

## `AnyLayout` — 레이아웃 전환 애니메이션

```swift
let layout = isVertical ? AnyLayout(VStackLayout()) : AnyLayout(HStackLayout())

layout {
    Item("A"); Item("B"); Item("C")
}
.animation(.spring, value: isVertical)
```

`AnyLayout`은 *같은 자식*들에 *다른 레이아웃*을 적용. SwiftUI가 자식 identity를 유지해 자연스러운 재배치 애니메이션.

## Animatable

값 변화에 따라 *연속 보간*되는 뷰는 `Animatable` 채택.

```swift
struct ProgressArc: Shape {
    var progress: Double

    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func path(in rect: CGRect) -> Path {
        Path { p in
            p.addArc(center: rect.center, radius: rect.width/2,
                     startAngle: .zero, endAngle: .degrees(360 * progress),
                     clockwise: false)
        }
    }
}
```

`animatableData`가 변할 때마다 SwiftUI가 *path를 재계산*. 보간 단계마다 path 다시 그림.

`AnimatablePair`/`AnimatableData`로 여러 값을 묶어 보간 가능.

## Transaction

애니메이션 컨텍스트를 *흐름과 함께 전달*하는 객체.

```swift
withAnimation(.spring(duration: 0.4)) {
    isExpanded.toggle()
}

// 특정 변경만 애니메이션 끄기
var t = Transaction()
t.disablesAnimations = true
withTransaction(t) {
    isExpanded = true
}
```

- `withAnimation`: 일시적으로 transaction 만들어 변경 적용.
- `withTransaction`: 더 세밀한 제어 (animation 외에 disable, isContinuous 등).
- View 내부에서 `Transaction.current` 검사로 분기 가능.

## 애니메이션 vs Transition

- **Animation**: *값의 보간* — 위치/크기/색상.
- **Transition**: *추가/제거* 효과 — 페이드 인/아웃, slide.

```swift
if show {
    Card().transition(.move(edge: .bottom).combined(with: .opacity))
}
```

## 비교 — iOS 17+ 변화

| 기능 | iOS 16 | iOS 17+ |
|---|---|---|
| 키프레임 | 어려움 | `KeyframeAnimator` |
| 단계별 트리거 | 수동 | `.animation(...) { content in ... }` |
| 관찰 | ObservableObject | `@Observable` |

## 흔한 함정 / Follow-up

- **Q. Custom Layout이 무한 루프?**
  자식 크기를 measuring해 부모 크기를 결정하는데, 부모 크기 변경이 자식 크기에 또 영향 → 진동. proposal을 명확히 한정 (특히 width/height).

- **Q. `animatableData`를 안 써도 애니메이션이 되는데?**
  position/size 변경처럼 *SwiftUI가 자동 보간*하는 표준 modifier. Shape 같이 *내부 path 계산*이 필요한 경우엔 `animatableData`로 등록 필수.

- **Q. `withAnimation` 안에서 비동기?**
  비동기 결과가 도착한 시점에 다시 `withAnimation` 으로 감싸야 함. await 후 변경은 분리된 transaction.

- **Q. SwiftUI가 매 frame body를 호출해 그림이 끊긴다.**
  body에 무거운 계산이 있는지 확인. 또는 `Self._printChanges()`로 어떤 dependency가 트리거됐는지 디버깅.

- **Q. AnyLayout이 identity를 보존하는 원리?**
  자식 view들의 identity가 유지되도록 *layout 컨테이너만* 교체. 그래서 transition이 자연스럽고 `@State`도 보존.

## 참고

- WWDC 2022: Compose custom layouts with SwiftUI
- WWDC 2023: Beyond scroll views / Wind your way through advanced animations
