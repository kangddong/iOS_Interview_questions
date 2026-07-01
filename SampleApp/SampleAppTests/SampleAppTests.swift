import XCTest
@testable import SampleApp

// 09-testing 카테고리 데모와 짝을 이루는 실제 동작 테스트 샘플.

final class SampleAppTests: XCTestCase {

    func testRegistryHasDemosForEveryCategory() {
        for c in DemoCategory.allCases {
            let demos = DemoRegistry.demos(in: c)
            XCTAssertFalse(demos.isEmpty, "\(c.rawValue) has no demos")
        }
    }

    func testDemoIdsAreUnique() {
        let ids = DemoCategory.allCases.flatMap { DemoRegistry.demos(in: $0) }.map(\.id)
        XCTAssertEqual(ids.count, Set(ids).count, "Duplicate demo id detected")
    }

    func testDocPathsArePrefixed() {
        for c in DemoCategory.allCases {
            for demo in DemoRegistry.demos(in: c) {
                XCTAssertTrue(demo.docPath.hasPrefix("docs/"), "\(demo.id) docPath should start with docs/")
            }
        }
    }
}

// Swift Testing 신문법 — Xcode 16+ / Swift 5.10+에서 활성.
// 별도 파일/타깃에서도 동작하지만 여기 같이 둬도 OK.
#if canImport(Testing)
import Testing

@Suite("Swift Testing 샘플")
struct SwiftTestingSamples {
    @Test("값/참조 차이 검증")
    func valueVsReference() {
        struct V { var n: Int }
        var a = V(n: 1); var b = a; b.n = 2
        #expect(a.n == 1 && b.n == 2)
    }

    @Test("문자열 grapheme count는 utf8 길이와 다를 수 있다")
    func graphemeVsUtf8() {
        let s = "🇰🇷"
        #expect(s.count == 1)
        #expect(s.utf8.count > 1)
    }
}
#endif
