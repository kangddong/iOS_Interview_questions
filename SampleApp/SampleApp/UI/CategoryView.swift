import SwiftUI

struct CategoryView: View {
    let category: DemoCategory

    var body: some View {
        let demos = DemoRegistry.demos(in: category)
        List(demos) { demo in
            NavigationLink(value: demo) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(demo.title).font(.body).bold()
                    Text(demo.summary)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                .padding(.vertical, 2)
            }
        }
        .navigationTitle(category.rawValue)
        .navigationDestination(for: AnyDemo.self) { demo in
            DemoHostView(demo: demo)
        }
    }
}
