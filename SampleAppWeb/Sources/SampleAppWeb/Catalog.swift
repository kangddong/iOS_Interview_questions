// SampleApp의 DemoCategory + DemoRegistry에 대응하는 웹 카탈로그.
// 아직 웹으로 포팅하지 않은 카테고리는 빈 demos로 두고, 렌더러가 "포팅 예정" 안내를 표시한다.

enum Catalog {
    static let categories: [WebCategory] = [
        placeholder("swift", "01 Swift 언어"),
        MemoryCategory.category,
        placeholder("concurrency", "03 동시성"),
        placeholder("uikit", "04 UIKit"),
        placeholder("swiftui", "05 SwiftUI"),
        placeholder("architecture", "06 아키텍처"),
        placeholder("networking", "07 네트워킹"),
        placeholder("persistence", "08 영속성"),
        placeholder("testing", "09 테스트"),
        placeholder("performance", "10 성능"),
        placeholder("buildSystem", "11 빌드 시스템"),
        DesignPatternsCategory.category,
        CSFundamentalsCategory.category,
        placeholder("network", "14 네트워크"),
        ParadigmsCategory.category,
        placeholder("realWorld", "16 실무"),
        placeholder("objectiveC", "17 Objective-C"),
    ]

    private static func placeholder(_ id: String, _ title: String) -> WebCategory {
        WebCategory(id: id, title: title, demos: [])
    }
}
