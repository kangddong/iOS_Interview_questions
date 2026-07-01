import SwiftUI

private let repoBase = "https://github.com/kangddong/iOS-interivew/blob/main/"

struct DemoHostView: View {
    let demo: AnyDemo

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(demo.summary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let url = URL(string: repoBase + demo.docPath) {
                    Link(destination: url) {
                        Label(demo.docPath, systemImage: "doc.text")
                            .font(.footnote)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            .padding(.top, 8)

            Divider()

            demo.view()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .navigationTitle(demo.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
