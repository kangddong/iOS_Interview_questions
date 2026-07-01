import SwiftUI

struct RootMenuView: View {
    var body: some View {
        NavigationStack {
            List(DemoCategory.allCases) { category in
                NavigationLink(value: category) {
                    HStack {
                        Text(category.rawValue)
                            .font(.headline)
                        Spacer()
                        Text("\(DemoRegistry.demos(in: category).count)")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("iOS Interview Demos")
            .navigationDestination(for: DemoCategory.self) { category in
                CategoryView(category: category)
            }
            .navigationDestination(for: AnyDemo.ID.self) { id in
                if let demo = DemoCategory.allCases
                    .flatMap({ DemoRegistry.demos(in: $0) })
                    .first(where: { $0.id == id }) {
                    DemoHostView(demo: demo)
                }
            }
        }
    }
}

extension AnyDemo: Hashable {
    static func == (lhs: AnyDemo, rhs: AnyDemo) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
