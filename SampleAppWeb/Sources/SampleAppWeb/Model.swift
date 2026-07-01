// 플랫폼 중립 데모 모델.
// SampleApp(iOS)의 `Demo` 프로토콜은 `makeView() -> some View`로 SwiftUI에 묶여 있어
// wasm으로 컴파일할 수 없다. 그래서 순수 Swift로 표현 가능한 부분만 데이터로 재정의한다:
//   - .console: 실행 가능한 로직 (SampleApp의 ConsoleDemoView { log in ... } 클로저에 대응)
//   - .theory : bullet 텍스트 (SampleApp의 TheoryCard(bullets:)에 대응)
//   - .iosOnly: UIKit/커스텀 SwiftUI 종속 데모 — 웹에선 개념 설명만 노출
//
// UI 렌더링은 Renderer.swift가 JavaScriptKit(DOM)으로 담당한다. Goodnotes 패턴과 동일하게
// "공유 로직(wasm) + 플랫폼별 UI(DOM)" 구조.

/// 콘솔 데모가 결과를 누적하는 로거. SampleApp의 DemoLogger와 동일 역할.
final class DemoLogger {
    private(set) var lines: [String] = []
    func log(_ value: Any) { lines.append("\(value)") }
    func clear() { lines.removeAll() }
}

enum DemoBody {
    /// 실행 버튼을 누르면 클로저가 로거에 기록하고 화면에 출력.
    case console((DemoLogger) -> Void)
    /// 순수 이론 카드.
    case theory([String])
    /// UIKit/커스텀 SwiftUI 종속 — 웹 미지원. 개념 설명 문자열.
    case iosOnly(String)
}

struct WebDemo {
    let id: String
    let title: String
    let summary: String
    /// 레포 루트 기준 문서 경로 (예: docs/02-memory-management/arc.md)
    let docPath: String
    let body: DemoBody
}

struct WebCategory {
    let id: String
    /// 메뉴에 표시되는 제목 (SampleApp의 DemoCategory rawValue와 동일 포맷)
    let title: String
    let demos: [WebDemo]
}
