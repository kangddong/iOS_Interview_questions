import SwiftUI

struct DelegateDemo: Demo {
    static let id = "pattern.delegate"
    static let title = "Delegate"
    static let summary = "1:1 콜백. 보통 weak 참조 + protocol로 표현."
    static let docPath = "docs/12-design-patterns/delegate.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let app = DelegateApp(); app.onGreet = { log.log("Hi \($0)!") }
            let w = DelegateWorker(); w.delegate = app; w.work()
        }
    }
}

private protocol DelegateGreeter: AnyObject { func greeter(didGreet name: String) }
private final class DelegateApp: DelegateGreeter {
    var onGreet: ((String) -> Void)?
    func greeter(didGreet name: String) { onGreet?(name) }
}
private final class DelegateWorker {
    weak var delegate: DelegateGreeter?
    func work() { delegate?.greeter(didGreet: "World") }
}

struct ObserverDemo: Demo {
    static let id = "pattern.observer"
    static let title = "Observer"
    static let summary = "1:N pub/sub. NotificationCenter, Combine, KVO 등 다양한 형태."
    static let docPath = "docs/12-design-patterns/observer.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let name = Notification.Name("demo.tick")
            let obs = NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main) { _ in
                log.log("tick 받음")
            }
            NotificationCenter.default.post(name: name, object: nil)
            NotificationCenter.default.post(name: name, object: nil)
            NotificationCenter.default.removeObserver(obs)
        }
    }
}

struct SingletonDemo: Demo {
    static let id = "pattern.singleton"
    static let title = "Singleton"
    static let summary = "전역 1개 인스턴스. 남용 시 테스트 어려움 — DI 가능한 형태 권장."
    static let docPath = "docs/12-design-patterns/singleton.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            log.log(SingletonAudio.shared.play())
            log.log("두 번째 접근도 같은 인스턴스 = \(SingletonAudio.shared === SingletonAudio.shared)")
        }
    }
}

private final class SingletonAudio {
    static let shared = SingletonAudio()
    private init() {}
    func play() -> String { "재생" }
}

struct FactoryStrategyBuilderDemo: Demo {
    static let id = "pattern.factory-strategy-builder"
    static let title = "Factory / Strategy / Builder"
    static let summary = "생성 분리(Factory), 알고리즘 교체(Strategy), 복잡한 객체 단계 조립(Builder)."
    static let docPath = "docs/12-design-patterns/factory-strategy-builder.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            // Factory
            protocol Logger { func log(_ s: String) }
            struct ConsoleLogger: Logger { func log(_ s: String) { print(s) } }
            struct FileLogger: Logger { func log(_ s: String) {} }
            enum LoggerFactory { static func make(_ k: String) -> Logger { k == "file" ? FileLogger() : ConsoleLogger() } }
            log.log("factory → \(type(of: LoggerFactory.make("console")))")

            // Strategy
            protocol Sort { func sort(_ xs: [Int]) -> [Int] }
            struct AscSort: Sort { func sort(_ xs: [Int]) -> [Int] { xs.sorted() } }
            struct DescSort: Sort { func sort(_ xs: [Int]) -> [Int] { xs.sorted(by: >) } }
            log.log("strategy desc → \(DescSort().sort([3,1,2]))")

            // Builder
            struct URLBuilder {
                var scheme = "https", host = "", path = ""
                func with(host: String) -> Self { var c = self; c.host = host; return c }
                func with(path: String) -> Self { var c = self; c.path = path; return c }
                func build() -> URL? { URL(string: "\(scheme)://\(host)\(path)") }
            }
            log.log("builder → \(URLBuilder().with(host: "a.com").with(path: "/x").build()!)")
        }
    }
}

struct CompositionOverInheritanceDemo: Demo {
    static let id = "pattern.composition-over-inheritance"
    static let title = "Composition over Inheritance"
    static let summary = "상속은 단단함. 프로토콜 + 작은 컴포넌트 조합이 유연성 ↑."
    static let docPath = "docs/12-design-patterns/composition-over-inheritance.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "상속은 계층이 깊어지면 영향 분석이 어려워짐",
            "Swift에서는 protocol + extension + 작은 타입을 조합",
            "test mock도 protocol composition이 훨씬 깔끔",
            "단, 진짜 'is-a' 관계는 여전히 상속이 자연스러움",
        ])
    }
}

struct SwiftIdiomaticDemo: Demo {
    static let id = "pattern.swift-idiomatic"
    static let title = "Swift Idiomatic Patterns"
    static let summary = "Result, Decodable, KeyPath, Property Wrapper, Result Builder 등을 활용한 관용 표현."
    static let docPath = "docs/12-design-patterns/swift-idiomatic-patterns.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "성공/실패 두 갈래 → Result<Success, Failure>",
            "객체 가시성 변환 → KeyPath 기반 매핑",
            "공통 get/set 가공 → @propertyWrapper",
            "선언적 컴포지션 → @resultBuilder",
        ])
    }
}
