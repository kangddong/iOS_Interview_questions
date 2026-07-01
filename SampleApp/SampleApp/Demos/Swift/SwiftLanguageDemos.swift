import SwiftUI

// MARK: - 1. Value vs Reference

struct ValueVsReferenceDemo: Demo {
    static let id = "swift.value-vs-reference"
    static let title = "값 타입 vs 참조 타입"
    static let summary = "struct는 복사, class는 참조 공유. 정체성/스레드안전성/공유 의도가 선택 기준."
    static let docPath = "docs/01-swift-language/struct-vs-class.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct ValuePoint { var x = 0 }
            class RefPoint { var x = 0 }

            var v1 = ValuePoint(); v1.x = 10
            var v2 = v1; v2.x = 99
            log.log("ValuePoint v1.x = \(v1.x), v2.x = \(v2.x)  → 복사")

            let r1 = RefPoint(); r1.x = 10
            let r2 = r1; r2.x = 99
            log.log("RefPoint   r1.x = \(r1.x), r2.x = \(r2.x)  → 같은 인스턴스")
            log.log("ObjectIdentifier(r1) == ObjectIdentifier(r2) → \(ObjectIdentifier(r1) == ObjectIdentifier(r2))")
        }
    }
}

// MARK: - 2. Copy On Write

struct CopyOnWriteDemo: Demo {
    static let id = "swift.cow"
    static let title = "Copy On Write"
    static let summary = "Array/Dict/Set 같은 표준 컬렉션은 쓰기 시점에만 복사. isKnownUniquelyReferenced로 직접 구현 가능."
    static let docPath = "docs/01-swift-language/copy-on-write.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            var a = CowArray()
            log.log("a.append(10) — 첫 쓰기")
            log.log(a.append(10))
            let b = a
            log.log("var b = a (공유 시작), b.values = \(b.values)")
            var c = a
            log.log("var c = a; c.append(99)")
            log.log(c.append(99))
            log.log("a.values=\(a.values), c.values=\(c.values)")
        }
    }
}

private final class CowStorage { var values: [Int] = Array(0..<5) }
private struct CowArray {
    private var storage = CowStorage()
    mutating func append(_ v: Int) -> String {
        let msg: String
        if !isKnownUniquelyReferenced(&storage) {
            let copy = CowStorage(); copy.values = storage.values
            storage = copy
            msg = "→ 스토리지 복사 (공유 중)"
        } else {
            msg = "→ 인플레이스 변경 (유일 참조)"
        }
        storage.values.append(v)
        return msg
    }
    var values: [Int] { storage.values }
}

// MARK: - 3. Generics & PAT

struct GenericsAndPATDemo: Demo {
    static let id = "swift.generics-pat"
    static let title = "제네릭 & PAT"
    static let summary = "associatedtype를 가진 프로토콜은 존재 타입으로 쓰기 까다로움 → some/any 등장 배경."
    static let docPath = "docs/01-swift-language/generics-and-pat.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            func swapValues<T>(_ a: inout T, _ b: inout T) {
                let tmp = a; a = b; b = tmp
            }
            var x = 1, y = 2
            swapValues(&x, &y)
            log.log("swap<T>: x=\(x), y=\(y)")

            protocol Container { associatedtype Item; mutating func push(_ item: Item) }
            struct Stack<E>: Container {
                private var items: [E] = []
                mutating func push(_ item: E) { items.append(item) }
                var top: E? { items.last }
            }
            var s = Stack<Int>()
            s.push(10); s.push(20)
            log.log("Stack<Int>.top = \(s.top ?? -1)")
        }
    }
}

// MARK: - 4. some vs any

struct SomeVsAnyDemo: Demo {
    static let id = "swift.some-vs-any"
    static let title = "some vs any"
    static let summary = "some = 컴파일 타임에 고정된 구체 타입(불투명), any = 런타임 박싱 존재 타입."
    static let docPath = "docs/01-swift-language/some-vs-any.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            protocol Animal { func speak() -> String }
            struct Dog: Animal { func speak() -> String { "멍" } }
            struct Cat: Animal { func speak() -> String { "야옹" } }

            func opaque() -> some Animal { Dog() }       // 호출자가 구체 타입 모름, 컴파일러는 알고 최적화
            func existential() -> any Animal {            // 런타임에 박스, 동적 디스패치
                Bool.random() ? Dog() : Cat()
            }
            log.log("opaque -> \(opaque().speak())")
            log.log("existential -> \(existential().speak())")
        }
    }
}

// MARK: - 5. Property Wrappers

@propertyWrapper
struct Clamped<Value: Comparable> {
    private var value: Value
    let range: ClosedRange<Value>
    init(wrappedValue: Value, _ range: ClosedRange<Value>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
    var wrappedValue: Value {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }
}

struct PropertyWrappersDemo: Demo {
    static let id = "swift.property-wrappers"
    static let title = "Property Wrappers"
    static let summary = "프로퍼티에 공통 동작(get/set 가공, 저장 위임) 캡슐화."
    static let docPath = "docs/01-swift-language/properties.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Player { @Clamped(0...100) var hp: Int = 50 }
            var p = Player()
            log.log("초기 hp = \(p.hp)")
            p.hp = 200; log.log("200 대입 후 hp = \(p.hp) (clamp)")
            p.hp = -50; log.log("-50 대입 후 hp = \(p.hp) (clamp)")
        }
    }
}

// MARK: - 6. Result Builder

@resultBuilder
enum StringBuilder {
    static func buildBlock(_ parts: String...) -> String { parts.joined(separator: "\n") }
    static func buildOptional(_ p: String?) -> String { p ?? "" }
    static func buildEither(first: String) -> String { first }
    static func buildEither(second: String) -> String { second }
}

struct ResultBuilderDemo: Demo {
    static let id = "swift.result-builder"
    static let title = "Result Builder"
    static let summary = "DSL 작성 도구. SwiftUI의 ViewBuilder가 대표 예."
    static let docPath = "docs/01-swift-language/result-builder-and-macro.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            @StringBuilder func make(includeFooter: Bool) -> String {
                "헤더"
                "본문 1"
                "본문 2"
                if includeFooter { "푸터" }
            }
            log.log(make(includeFooter: true))
            log.log("---")
            log.log(make(includeFooter: false))
        }
    }
}

// MARK: - 7. Optional

struct OptionalDemo: Demo {
    static let id = "swift.optional"
    static let title = "Optional"
    static let summary = "값 부재(nil)를 타입으로 강제. if let / guard let / ?? / ?. 4가지 언랩 전략."
    static let docPath = "docs/01-swift-language/optional.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            let raw: String? = "42"
            if let v = raw, let n = Int(v) { log.log("if let → \(n)") }
            let fallback = (nil as Int?) ?? -1
            log.log("?? fallback → \(fallback)")
            let chained: Int? = (raw.map { Int($0) }) ?? nil
            log.log("optional chaining → \(String(describing: chained))")
        }
    }
}

// MARK: - 8. Enum

struct EnumDemo: Demo {
    static let id = "swift.enum"
    static let title = "Enum (raw / associated / indirect)"
    static let summary = "타입 안전한 상태/명령 표현. 연관값으로 페이로드, indirect로 재귀 타입."
    static let docPath = "docs/01-swift-language/enum.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            enum LoadState<Value> { case idle, loading, loaded(Value), failed(Error) }
            indirect enum List<T> { case empty; case node(T, List<T>) }

            let s: LoadState<Int> = .loaded(7)
            if case .loaded(let v) = s { log.log("loaded \(v)") }

            let xs: List<Int> = .node(1, .node(2, .node(3, .empty)))
            func sum(_ l: List<Int>) -> Int { if case .node(let v, let t) = l { return v + sum(t) } else { return 0 } }
            log.log("indirect list sum = \(sum(xs))")
        }
    }
}

// MARK: - 9. Error handling

struct ErrorHandlingDemo: Demo {
    static let id = "swift.error-handling"
    static let title = "Error Handling"
    static let summary = "throws/try/catch + Result. rethrows로 클로저의 throws를 전파."
    static let docPath = "docs/01-swift-language/error-handling.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            enum APIError: Error { case notFound, badInput(String) }
            func divide(_ a: Int, by b: Int) throws -> Int {
                guard b != 0 else { throw APIError.badInput("0 division") }
                return a / b
            }
            do { log.log("10/2 = \(try divide(10, by: 2))") } catch { log.log("err: \(error)") }
            do { _ = try divide(10, by: 0) } catch { log.log("err: \(error)") }

            let r = Result { try divide(20, by: 4) }
            log.log("Result = \(r)")
        }
    }
}

// MARK: - 10. KeyPath

struct KeyPathDemo: Demo {
    static let id = "swift.keypath"
    static let title = "KeyPath"
    static let summary = "프로퍼티에 대한 1급 참조. 함수형 매핑/SwiftUI 바인딩에 광범위 활용."
    static let docPath = "docs/01-swift-language/keypath.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct User { var name: String; var age: Int }
            let users = [User(name: "A", age: 30), User(name: "B", age: 25)]
            let names = users.map(\.name)
            let ages = users.map(\.age)
            log.log("names \(names)")
            log.log("ages  \(ages)")

            let kp: WritableKeyPath<User, Int> = \.age
            var u = users[0]
            u[keyPath: kp] = 99
            log.log("u.age via keypath = \(u.age)")
        }
    }
}

// MARK: - 11. Closures (escaping / capturing)

struct ClosuresDemo: Demo {
    static let id = "swift.closures"
    static let title = "Closures (escaping/capture)"
    static let summary = "참조 캡처가 기본. @escaping 표시는 호출 후에도 살아남는 클로저."
    static let docPath = "docs/01-swift-language/closures.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            func makeCounter() -> () -> Int {
                var count = 0
                return { count += 1; return count }
            }
            let c = makeCounter()
            log.log("counter \(c()), \(c()), \(c())")

            class Owner { var name = "K" }
            let o = Owner()
            let captureStrong: () -> String = { o.name }
            let captureValue: () -> String = { [name = o.name] in name }
            o.name = "Y"
            log.log("strong capture → \(captureStrong())")
            log.log("value  capture → \(captureValue())")
        }
    }
}

// MARK: - 12. Initialization

struct InitializationDemo: Demo {
    static let id = "swift.init"
    static let title = "Initialization"
    static let summary = "designated/convenience/required, 2단 초기화. 모든 stored property는 init 종료 시점에 값을 가져야 함."
    static let docPath = "docs/01-swift-language/initialization.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            InitLog.shared.bind(log)
            _ = InitDog(breed: "포메")
            InitLog.shared.unbind()
        }
    }
}

private final class InitLog {
    static let shared = InitLog()
    private var logger: DemoLogger?
    func bind(_ l: DemoLogger) { logger = l }
    func unbind() { logger = nil }
    func log(_ s: String) { logger?.log(s) }
}

private class InitAnimal {
    let name: String
    init(name: String) { self.name = name; InitLog.shared.log("Animal.init \(name)") }
}

private final class InitDog: InitAnimal {
    let breed: String
    init(name: String, breed: String) {
        self.breed = breed
        super.init(name: name)
        InitLog.shared.log("Dog.init \(name) \(breed)")
    }
    convenience init(breed: String) { self.init(name: "Unknown", breed: breed) }
}

// MARK: - 13. Ownership (consuming/borrowing) Swift 5.9+

struct OwnershipDemo: Demo {
    static let id = "swift.ownership"
    static let title = "Ownership: consuming / borrowing"
    static let summary = "값 타입을 ARC 없이 효율 전달. Swift 5.9+: consuming/borrowing/inout 명시 매개변수."
    static let docPath = "docs/01-swift-language/ownership.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Big { var data = Array(repeating: 0, count: 1024) }
            func sumBorrow(_ b: borrowing Big) -> Int { b.data.reduce(0, +) }
            func consume(_ b: consuming Big) -> Int {
                var t = b; t.data[0] = 1
                return t.data.reduce(0, +)
            }
            let big = Big()
            log.log("borrow sum = \(sumBorrow(big))")
            log.log("consume sum = \(consume(big))")
        }
    }
}

// MARK: - 14. mutating / inout

struct MutatingInoutDemo: Demo {
    static let id = "swift.mutating-inout"
    static let title = "mutating & inout"
    static let summary = "값 타입의 self 수정은 mutating, 외부 변수 갱신은 inout."
    static let docPath = "docs/01-swift-language/mutating-and-inout.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Counter { var n = 0; mutating func bump() { n += 1 } }
            var c = Counter(); c.bump(); c.bump()
            log.log("counter \(c.n)")

            func double(_ x: inout Int) { x *= 2 }
            var v = 5; double(&v)
            log.log("inout double → \(v)")
        }
    }
}

// MARK: - 15. Method Dispatch

struct MethodDispatchDemo: Demo {
    static let id = "swift.method-dispatch"
    static let title = "Method Dispatch"
    static let summary = "static(struct/enum/final) → vtable(class) → message(NSObject/dynamic) 순으로 비용↑."
    static let docPath = "docs/01-swift-language/method-dispatch.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            log.log("• struct/enum/final class 메서드 → static dispatch (인라이닝 가능)")
            log.log("• 비-final class 메서드      → V-table dynamic dispatch")
            log.log("• @objc dynamic           → objc_msgSend (KVO/스위즐 가능)")
            class Base { func name() -> String { "Base" } }
            class Sub: Base { override func name() -> String { "Sub" } }
            let b: Base = Sub()
            log.log("polymorphic call → \(b.name())  (V-table)")
        }
    }
}

// MARK: - 16. Access Control

struct AccessControlDemo: Demo {
    static let id = "swift.access-control"
    static let title = "Access Control"
    static let summary = "open > public > package > internal(기본) > fileprivate > private."
    static let docPath = "docs/01-swift-language/access-control.md"

    static func makeView() -> some View {
        TheoryCard(bullets: [
            "open: 모듈 밖에서 상속/오버라이드 가능",
            "public: 사용은 가능, 상속/오버라이드는 모듈 내부에서만",
            "package(Swift 5.9+): 같은 SPM 패키지 내",
            "internal(기본): 같은 모듈",
            "fileprivate: 같은 파일",
            "private: 같은 선언 + 그 extension",
        ])
    }
}

// MARK: - 17. Subscript

struct SubscriptDemo: Demo {
    static let id = "swift.subscript"
    static let title = "Subscript"
    static let summary = "타입에 [] 문법 부여. 다중 파라미터/제네릭/get-only 모두 가능."
    static let docPath = "docs/01-swift-language/subscript.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Matrix {
                let rows: Int, cols: Int
                var grid: [Double]
                init(_ r: Int, _ c: Int) { rows = r; cols = c; grid = .init(repeating: 0, count: r*c) }
                subscript(r: Int, c: Int) -> Double {
                    get { grid[r*cols + c] }
                    set { grid[r*cols + c] = newValue }
                }
            }
            var m = Matrix(2, 2)
            m[0,0] = 1; m[1,1] = 4
            log.log("m[0,0]=\(m[0,0]), m[1,1]=\(m[1,1])")
        }
    }
}

// MARK: - 18. Type Casting

struct TypeCastingDemo: Demo {
    static let id = "swift.type-casting"
    static let title = "Type Casting (is/as/as?/as!)"
    static let summary = "is = 검사, as = 업캐스트(또는 브릿지), as? = 안전 다운캐스트, as! = 강제."
    static let docPath = "docs/01-swift-language/type-casting.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            class A {}
            class B: A {}
            let arr: [A] = [A(), B(), A(), B()]
            for x in arr {
                if let b = x as? B { log.log("B: \(b)") }
                else { log.log("A: \(x)") }
            }
        }
    }
}

// MARK: - 19. Pattern Matching

struct PatternMatchingDemo: Demo {
    static let id = "swift.pattern-matching"
    static let title = "Pattern Matching"
    static let summary = "switch/if case/for case + where 절. 튜플·연관값·타입까지 매칭."
    static let docPath = "docs/01-swift-language/pattern-matching.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            let points = [(0,0), (1,2), (3,3), (-1,-1)]
            for case let (x, y) in points where x == y { log.log("대각선 점 (\(x),\(y))") }

            enum Token { case number(Int), text(String) }
            let tokens: [Token] = [.number(1), .text("hi"), .number(42)]
            for case .number(let n) in tokens { log.log("number \(n)") }
        }
    }
}

// MARK: - 20. Equatable/Hashable/Codable

struct EquatableHashableCodableDemo: Demo {
    static let id = "swift.eq-hash-codable"
    static let title = "Equatable / Hashable / Codable"
    static let summary = "value 비교(==), 해시(Set/Dict 키), JSON 직렬화의 컴파일러 자동 합성."
    static let docPath = "docs/01-swift-language/equatable-hashable-codable.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct User: Hashable, Codable { let id: Int; let name: String }
            let a = User(id: 1, name: "K")
            let b = User(id: 1, name: "K")
            log.log("a == b → \(a == b)")
            let set: Set<User> = [a, b]; log.log("Set size = \(set.count)")
            let data = try! JSONEncoder().encode(a)
            log.log("JSON: \(String(data: data, encoding: .utf8) ?? "")")
        }
    }
}

// MARK: - 21. Variadic Generics (Swift 5.9+)

struct VariadicGenericsDemo: Demo {
    static let id = "swift.variadic-generics"
    static let title = "Variadic Generics"
    static let summary = "Swift 5.9+: 가변 길이 타입 파라미터. 튜플 가변 처리, zip 일반화 등."
    static let docPath = "docs/01-swift-language/variadic-generics.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            func describe<each T>(_ value: repeat each T) -> String {
                var parts: [String] = []
                repeat parts.append(String(describing: each value))
                return parts.joined(separator: ", ")
            }
            log.log(describe(1, "two", 3.0, true))
        }
    }
}

// MARK: - 22. Protocol Oriented Programming

private protocol POPGreet { var name: String { get } }
extension POPGreet { func hi() -> String { "안녕 \(name)" } }
private struct POPCat: POPGreet { let name: String }
private struct POPDog: POPGreet { let name: String }

struct POPDemo: Demo {
    static let id = "swift.pop"
    static let title = "Protocol Oriented Programming"
    static let summary = "상속이 아닌 프로토콜 + extension 기본 구현으로 공통 동작 공유."
    static let docPath = "docs/01-swift-language/protocol-oriented-programming.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            log.log(POPCat(name: "야옹이").hi())
            log.log(POPDog(name: "멍멍이").hi())
        }
    }
}

// MARK: - 23. String / Unicode

struct StringUnicodeDemo: Demo {
    static let id = "swift.string-unicode"
    static let title = "String & Unicode"
    static let summary = "Swift String은 Grapheme Cluster 기반. count는 가시 문자 수, utf8/utf16/unicodeScalars 별도."
    static let docPath = "docs/01-swift-language/string-and-unicode.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            let s = "가\u{0301}🇰🇷👨‍👩‍👧"
            log.log("count = \(s.count)  ← grapheme clusters")
            log.log("utf8.count = \(s.utf8.count)")
            log.log("utf16.count = \(s.utf16.count)")
            log.log("unicodeScalars.count = \(s.unicodeScalars.count)")
        }
    }
}

// MARK: - 24. Runtime Internals (Mirror)

struct RuntimeInternalsDemo: Demo {
    static let id = "swift.runtime-internals"
    static let title = "Runtime Internals (Mirror)"
    static let summary = "Swift는 reflection 제한적. Mirror로 구조 순회 정도 가능."
    static let docPath = "docs/01-swift-language/runtime-internals.md"

    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Order { let id: Int; let item: String; let price: Double }
            let m = Mirror(reflecting: Order(id: 1, item: "Coffee", price: 4.5))
            for child in m.children { log.log("\(child.label ?? "_") = \(child.value)") }
        }
    }
}

// MARK: - 25. ABI & Resilience

struct AbiResilienceDemo: Demo {
    static let id = "swift.abi-resilience"
    static let title = "ABI & Resilience"
    static let summary = "Swift 5+는 stable ABI. 라이브러리 evolution으로 프로퍼티 추가 시 클라이언트 재빌드 불필요."
    static let docPath = "docs/01-swift-language/abi-and-resilience.md"

    static func makeView() -> some View {
        TheoryCard(bullets: [
            "ABI: 바이너리 간 호출 규약. 5.0부터 Apple OS에서 안정.",
            "Library Evolution: 프레임워크가 add property/case해도 클라이언트 재빌드 없이 동작.",
            "@frozen: 구조체/열거형 변경 금지 약속 (최적화 ↑)",
            "Resilience를 켜면 cross-module 호출은 thunk 거치므로 약간 느려질 수 있음",
        ])
    }
}
