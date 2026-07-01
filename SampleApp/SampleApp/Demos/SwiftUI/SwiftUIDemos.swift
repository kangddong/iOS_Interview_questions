import SwiftUI
import Observation

struct DeclarativeViewDemo: Demo {
    static let id = "swiftui.declarative-view"
    static let title = "Declarative View Struct"
    static let summary = "View는 값타입. body는 state에 대한 함수 — 상태가 바뀌면 다시 호출."
    static let docPath = "docs/05-swiftui/declarative-and-view-struct.md"
    static func makeView() -> some View {
        struct Counter: View {
            @State var n = 0
            var body: some View {
                VStack(spacing: 16) {
                    Text("count = \(n)").font(.title)
                    Button("증가") { n += 1 }.buttonStyle(.borderedProminent)
                }
            }
        }
        return Counter()
    }
}

struct StateManagementDemo: Demo {
    static let id = "swiftui.state"
    static let title = "@State / @Binding / @Observable"
    static let summary = "@State: 뷰 소유. @Binding: 양방향. @Observable(iOS 17+): 모델."
    static let docPath = "docs/05-swiftui/state-management.md"
    static func makeView() -> some View {
        struct Toggleable: View {
            @State var on = false
            var body: some View {
                VStack {
                    Toggle("on", isOn: $on).padding(.horizontal)
                    Child(on: $on)
                }
            }
        }
        struct Child: View {
            @Binding var on: Bool
            var body: some View { Text(on ? "ON" : "OFF").font(.largeTitle) }
        }
        return Toggleable()
    }
}

struct ViewIdentityDemo: Demo {
    static let id = "swiftui.view-identity"
    static let title = "View Identity & Lifetime"
    static let summary = "id가 같으면 같은 뷰로 간주, transition/state 보존. .id() 강제 갱신 트릭."
    static let docPath = "docs/05-swiftui/view-identity-and-lifetime.md"
    static func makeView() -> some View {
        struct Demo: View {
            @State var key = 0
            @State var count = 0
            var body: some View {
                VStack(spacing: 16) {
                    Text("count = \(count)")
                    Button("count++") { count += 1 }
                    Button("새 id 부여 (state 리셋)") { key += 1 }
                        .id(key)
                }
                .id(key)
            }
        }
        return Demo()
    }
}

struct ViewGraphDiffingDemo: Demo {
    static let id = "swiftui.view-graph"
    static let title = "View Graph & Diffing"
    static let summary = "body는 새 값 트리, SwiftUI가 이전과 비교해 최소 변경만 적용."
    static let docPath = "docs/05-swiftui/view-graph-and-diffing.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "body 호출은 값 트리(View 구조체) 생성 — 화면 갱신 아님",
            "SwiftUI 런타임이 prev tree와 비교하여 actual render tree 업데이트",
            "Equatable view + .equatable() 모디파이어로 비교 비용 절감 가능",
            "조건 분기(if/else)는 트리 구조 변경 → state 보존 깨질 수 있음",
        ])
    }
}

struct LayoutSystemDemo: Demo {
    static let id = "swiftui.layout-system"
    static let title = "Layout System"
    static let summary = "부모가 자식에게 제안한 size, 자식이 자신의 size를 반환하는 협상 모델."
    static let docPath = "docs/05-swiftui/layout-system.md"
    static func makeView() -> some View {
        VStack(spacing: 8) {
            Text("부모가 너비 100 제안")
            HStack { Color.red.frame(width: 100, height: 30) }
            Text("Text가 받은 너비만큼 wrap")
            Text("아주 긴 문장이 들어가서 강제 wrap 되는 동작을 확인합니다 — 안녕")
                .frame(width: 100).border(.gray)
        }.padding()
    }
}

struct CustomLayoutDemo: Demo {
    static let id = "swiftui.custom-layout"
    static let title = "Custom Layout / Animatable"
    static let summary = "Layout 프로토콜로 직접 위치/사이즈 계산. Animatable Modifier로 부드러운 보간."
    static let docPath = "docs/05-swiftui/custom-layout-and-animatable.md"
    static func makeView() -> some View {
        struct CircleLayout: Layout {
            func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
                let s = min(proposal.width ?? 200, proposal.height ?? 200)
                return CGSize(width: s, height: s)
            }
            func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
                let r = min(bounds.width, bounds.height) / 2 - 20
                let center = CGPoint(x: bounds.midX, y: bounds.midY)
                for (i, sub) in subviews.enumerated() {
                    let theta = 2 * .pi * Double(i) / Double(subviews.count)
                    let x = center.x + cos(theta) * r
                    let y = center.y + sin(theta) * r
                    sub.place(at: CGPoint(x: x, y: y), anchor: .center, proposal: .unspecified)
                }
            }
        }
        return CircleLayout {
            ForEach(0..<8) { i in
                Text("\(i)").padding(8).background(Circle().fill(.tint))
                    .foregroundStyle(.white)
            }
        }
        .frame(width: 280, height: 280)
    }
}

struct SwiftUIPerformanceDemo: Demo {
    static let id = "swiftui.performance"
    static let title = "SwiftUI Performance"
    static let summary = "Equatable view, LazyVStack/LazyHGrid, drawingGroup, view identity 관리."
    static let docPath = "docs/05-swiftui/performance.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "LazyVStack/LazyHStack: 화면 밖 셀은 인스턴스화 안 함",
            "Instruments: SwiftUI 인스트루먼트로 body 호출 횟수 확인",
            "@Observable + 부분 의존성 추적으로 불필요한 redraw 제거",
            "GeometryReader 남용은 layout 재계산 비용 ↑",
        ])
    }
}

@Observable
private final class CounterModel { var n = 0 }

struct ObservationMacroDemo: Demo {
    static let id = "swiftui.observation-macro"
    static let title = "@Observable Macro"
    static let summary = "iOS 17+. ObservableObject + @Published 보일러플레이트 제거, 의존성 자동 추적."
    static let docPath = "docs/05-swiftui/observation-macro.md"
    static func makeView() -> some View {
        struct View1: View {
            @State var model = CounterModel()
            var body: some View {
                VStack {
                    Text("n = \(model.n)")
                    Button("증가") { model.n += 1 }.buttonStyle(.borderedProminent)
                }
            }
        }
        return View1()
    }
}
