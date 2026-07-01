import SwiftUI

struct XCTestDemo: Demo {
    static let id = "test.xctest"
    static let title = "XCTest"
    static let summary = "Apple의 기본 테스트 프레임워크. test_ 접두 + XCTAssert*."
    static let docPath = "docs/09-testing/xctest.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "XCTestCase 상속, func test...() 자동 발견",
            "setUp/tearDown, setUpWithError로 사전 준비",
            "XCTAssertEqual/True/Nil/Throws... 어설션",
            "비동기는 XCTestExpectation 또는 async test 함수",
        ])
    }
}

struct SwiftTestingDemo: Demo {
    static let id = "test.swift-testing"
    static let title = "Swift Testing"
    static let summary = "Swift 5.10+. @Test/#expect/#require 매크로 기반 신형 프레임워크."
    static let docPath = "docs/09-testing/swift-testing.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "import Testing — @Test func 이름() async throws { #expect(...) }",
            "Tags/Suites로 그룹핑, Parameterized arguments 지원",
            "병렬 실행 기본, XCTest와 공존 가능",
            "Apple 공식 후속, Xcode 16+ Test Navigator에 통합",
        ])
    }
}

struct MockingDemo: Demo {
    static let id = "test.mocking"
    static let title = "Mocking"
    static let summary = "프로토콜 추상화 + 테스트 더블 주입. Spy/Stub/Mock 구분."
    static let docPath = "docs/09-testing/mocking.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            protocol Network { func get(_ url: String) -> String }
            struct LiveNet: Network { func get(_ url: String) -> String { "live" } }
            final class SpyNet: Network {
                var calls: [String] = []
                func get(_ url: String) -> String { calls.append(url); return "mock" }
            }
            func feature(net: Network) -> String { net.get("/me") }
            let spy = SpyNet()
            _ = feature(net: spy)
            log.log("spy calls = \(spy.calls)")
        }
    }
}

struct SnapshotUITestDemo: Demo {
    static let id = "test.snapshot-ui"
    static let title = "Snapshot & UI Test"
    static let summary = "SnapshotTesting 라이브러리 / XCUITest. 시각/플로우 회귀 감지."
    static let docPath = "docs/09-testing/snapshot-and-ui-testing.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Point-free의 SnapshotTesting이 사실상 표준",
            "기준 이미지를 PR 리뷰 — diff로 디자인 회귀 잡기",
            "XCUITest는 UI 자동화, 느리고 flaky하지만 통합 회귀에 유용",
            "Identifier(accessibilityIdentifier) 부여로 안정성 ↑",
        ])
    }
}

struct TestStrategyDemo: Demo {
    static let id = "test.strategy"
    static let title = "Test Strategy"
    static let summary = "유닛(빠름·많음) > 통합 > UI(느림·적음). 피라미드 유지."
    static let docPath = "docs/09-testing/test-strategy.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "도메인/유스케이스는 100% 가까이 유닛 테스트",
            "ViewModel은 입력→출력 변환 위주, dependency는 mock 주입",
            "통합 테스트는 실제 DB/API 1~2개 슬라이스만 — 환경 격리 필수",
            "UI 테스트는 핵심 happy path만, 실패시 즉시 알람",
        ])
    }
}
