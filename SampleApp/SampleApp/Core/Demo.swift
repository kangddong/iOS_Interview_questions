import SwiftUI

/// 모든 데모가 채택하는 메타데이터 + 뷰 프로토콜.
/// `makeView`로 SwiftUI 뷰를 반환하며, UIKit 데모는 `UIViewControllerRepresentable`로 래핑한다.
protocol Demo {
    static var id: String { get }
    static var title: String { get }
    static var summary: String { get }
    /// 레포 루트 기준 상대 경로. 예: "docs/01-swift-language/struct-vs-class.md"
    static var docPath: String { get }
    associatedtype Body: View
    @ViewBuilder static func makeView() -> Body
}

/// 카테고리 식별자 — docs 디렉토리와 1:1.
enum DemoCategory: String, CaseIterable, Identifiable {
    case swiftLanguage    = "01 Swift 언어"
    case memory           = "02 메모리 관리"
    case concurrency      = "03 동시성"
    case uikit            = "04 UIKit"
    case swiftui          = "05 SwiftUI"
    case architecture     = "06 아키텍처"
    case networking       = "07 네트워킹"
    case persistence      = "08 영속성"
    case testing          = "09 테스트"
    case performance      = "10 성능"
    case buildSystem      = "11 빌드 시스템"
    case designPatterns   = "12 디자인 패턴"
    case csFundamentals   = "13 CS 기초"
    case network          = "14 네트워크"
    case paradigms        = "15 패러다임"
    case realWorld        = "16 실무"
    case objectiveC       = "17 Objective-C"

    var id: String { rawValue }
}

/// 타입 소거된 데모 박스 — 리스트/등록부에서 사용.
struct AnyDemo: Identifiable {
    let id: String
    let title: String
    let summary: String
    let docPath: String
    let view: () -> AnyView

    init<D: Demo>(_ type: D.Type) {
        self.id = D.id
        self.title = D.title
        self.summary = D.summary
        self.docPath = D.docPath
        self.view = { AnyView(D.makeView()) }
    }
}
