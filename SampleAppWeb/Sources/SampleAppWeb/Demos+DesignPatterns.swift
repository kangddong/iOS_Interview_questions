// 12 디자인 패턴 — SampleApp/Demos/DesignPatterns/DesignPatternsDemos.swift 이식.
// Observer는 NotificationCenter(Foundation) 대신 동일 개념의 수동 pub/sub로,
// Builder는 URL(Foundation) 대신 String 조립으로 대체(개념 동일, wasm 의존성 제거).

private protocol DelegateGreeter: AnyObject { func greeter(didGreet name: String) }
private final class DelegateApp: DelegateGreeter {
    var onGreet: ((String) -> Void)?
    func greeter(didGreet name: String) { onGreet?(name) }
}
private final class DelegateWorker {
    weak var delegate: DelegateGreeter?
    func work() { delegate?.greeter(didGreet: "World") }
}

private final class SingletonAudio {
    static let shared = SingletonAudio()
    private init() {}
    func play() -> String { "재생" }
}

/// NotificationCenter를 대신하는 최소 1:N pub/sub.
private final class TinyBus {
    private var handlers: [() -> Void] = []
    func subscribe(_ h: @escaping () -> Void) -> Int { handlers.append(h); return handlers.count - 1 }
    func post() { handlers.forEach { $0() } }
}

enum DesignPatternsCategory {
    static let category = WebCategory(
        id: "designPatterns",
        title: "12 디자인 패턴",
        demos: [
            WebDemo(
                id: "pattern.delegate",
                title: "Delegate",
                summary: "1:1 콜백. 보통 weak 참조 + protocol로 표현.",
                docPath: "docs/12-design-patterns/delegate.md",
                body: .console { log in
                    let app = DelegateApp(); app.onGreet = { log.log("Hi \($0)!") }
                    let w = DelegateWorker(); w.delegate = app; w.work()
                }
            ),
            WebDemo(
                id: "pattern.observer",
                title: "Observer",
                summary: "1:N pub/sub. NotificationCenter, Combine, KVO 등 다양한 형태.",
                docPath: "docs/12-design-patterns/observer.md",
                body: .console { log in
                    let bus = TinyBus()
                    _ = bus.subscribe { log.log("tick 받음") }
                    bus.post()
                    bus.post()
                }
            ),
            WebDemo(
                id: "pattern.singleton",
                title: "Singleton",
                summary: "전역 1개 인스턴스. 남용 시 테스트 어려움 — DI 가능한 형태 권장.",
                docPath: "docs/12-design-patterns/singleton.md",
                body: .console { log in
                    log.log(SingletonAudio.shared.play())
                    log.log("두 번째 접근도 같은 인스턴스 = \(SingletonAudio.shared === SingletonAudio.shared)")
                }
            ),
            WebDemo(
                id: "pattern.factory-strategy-builder",
                title: "Factory / Strategy / Builder",
                summary: "생성 분리(Factory), 알고리즘 교체(Strategy), 복잡한 객체 단계 조립(Builder).",
                docPath: "docs/12-design-patterns/factory-strategy-builder.md",
                body: .console { log in
                    // Factory
                    protocol Writer { func write(_ s: String) }
                    struct ConsoleWriter: Writer { func write(_ s: String) {} }
                    struct FileWriter: Writer { func write(_ s: String) {} }
                    enum WriterFactory { static func make(_ k: String) -> Writer { k == "file" ? FileWriter() : ConsoleWriter() } }
                    log.log("factory → \(type(of: WriterFactory.make("console")))")

                    // Strategy
                    protocol Sort { func sort(_ xs: [Int]) -> [Int] }
                    struct AscSort: Sort { func sort(_ xs: [Int]) -> [Int] { xs.sorted() } }
                    struct DescSort: Sort { func sort(_ xs: [Int]) -> [Int] { xs.sorted(by: >) } }
                    _ = AscSort()
                    log.log("strategy desc → \(DescSort().sort([3,1,2]))")

                    // Builder (URL 대신 String 조립)
                    struct URLBuilder {
                        var scheme = "https", host = "", path = ""
                        func with(host: String) -> Self { var c = self; c.host = host; return c }
                        func with(path: String) -> Self { var c = self; c.path = path; return c }
                        func build() -> String { "\(scheme)://\(host)\(path)" }
                    }
                    log.log("builder → \(URLBuilder().with(host: "a.com").with(path: "/x").build())")
                }
            ),
            WebDemo(
                id: "pattern.composition-over-inheritance",
                title: "Composition over Inheritance",
                summary: "상속은 단단함. 프로토콜 + 작은 컴포넌트 조합이 유연성 ↑.",
                docPath: "docs/12-design-patterns/composition-over-inheritance.md",
                body: .theory([
                    "상속은 계층이 깊어지면 영향 분석이 어려워짐",
                    "Swift에서는 protocol + extension + 작은 타입을 조합",
                    "test mock도 protocol composition이 훨씬 깔끔",
                    "단, 진짜 'is-a' 관계는 여전히 상속이 자연스러움",
                ])
            ),
            WebDemo(
                id: "pattern.swift-idiomatic",
                title: "Swift Idiomatic Patterns",
                summary: "Result, Decodable, KeyPath, Property Wrapper, Result Builder 등을 활용한 관용 표현.",
                docPath: "docs/12-design-patterns/swift-idiomatic-patterns.md",
                body: .theory([
                    "성공/실패 두 갈래 → Result<Success, Failure>",
                    "객체 가시성 변환 → KeyPath 기반 매핑",
                    "공통 get/set 가공 → @propertyWrapper",
                    "선언적 컴포지션 → @resultBuilder",
                ])
            ),
        ]
    )
}
