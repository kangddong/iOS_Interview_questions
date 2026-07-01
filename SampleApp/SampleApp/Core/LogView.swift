import SwiftUI
import Observation

/// 콘솔 출력용 SwiftUI 뷰. 데모에서 `logger.log(...)` 호출만 하면 화면에 누적된다.
@Observable
final class DemoLogger {
    private(set) var lines: [String] = []

    func log(_ value: Any) {
        lines.append("\(value)")
    }

    func clear() {
        lines.removeAll()
    }
}

struct LogView: View {
    @Bindable var logger: DemoLogger
    var run: (DemoLogger) -> Void

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Button {
                    logger.clear()
                    run(logger)
                } label: {
                    Label("실행", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)

                Button(role: .destructive) {
                    logger.clear()
                } label: {
                    Label("지우기", systemImage: "trash")
                }
                .buttonStyle(.bordered)

                Spacer()
            }
            .padding(.horizontal)

            ScrollView {
                VStack(alignment: .leading, spacing: 2) {
                    if logger.lines.isEmpty {
                        Text("실행 버튼을 눌러 결과를 확인하세요.")
                            .foregroundStyle(.secondary)
                            .padding()
                    } else {
                        ForEach(Array(logger.lines.enumerated()), id: \.offset) { _, line in
                            Text(line)
                                .font(.system(.footnote, design: .monospaced))
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .textSelection(.enabled)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .padding(.horizontal)
        }
    }
}

/// 데모에서 손쉽게 LogView를 띄우려는 래퍼.
struct ConsoleDemoView: View {
    let run: (DemoLogger) -> Void
    @State private var logger = DemoLogger()

    var body: some View {
        LogView(logger: logger, run: run)
    }
}

/// 순수 이론 카드. 실행 가능한 데모가 어울리지 않는 항목용.
struct TheoryCard: View {
    let bullets: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(Array(bullets.enumerated()), id: \.offset) { _, line in
                HStack(alignment: .top, spacing: 8) {
                    Text("•").font(.headline)
                    Text(line)
                        .font(.callout)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .padding(.horizontal)
    }
}
