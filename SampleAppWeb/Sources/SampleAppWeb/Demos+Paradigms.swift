// 15 패러다임 — SampleApp/Demos/Paradigms/ParadigmsDemos.swift 이식.
// String(format:)(Foundation) 대신 수동 2자리 반올림으로 대체해 wasm 의존성 최소화.

infix operator >>>: AdditionPrecedence
func >>> <A, B, C>(_ f: @escaping (A) -> B, _ g: @escaping (B) -> C) -> (A) -> C { { g(f($0)) } }

private func round2(_ d: Double) -> String {
    let r = (d * 100).rounded() / 100
    return "\(r)"
}

enum ParadigmsCategory {
    static let category = WebCategory(
        id: "paradigms",
        title: "15 패러다임",
        demos: [
            WebDemo(
                id: "paradigm.oop",
                title: "OOP",
                summary: "상태 + 행위 = 객체. 캡슐화/상속/다형성/추상화 4원칙.",
                docPath: "docs/15-paradigms/oop.md",
                body: .console { log in
                    class Shape { func area() -> Double { 0 } }
                    class Circle: Shape { let r: Double; init(_ r: Double) { self.r = r }; override func area() -> Double { .pi * r * r } }
                    class Square: Shape { let s: Double; init(_ s: Double) { self.s = s }; override func area() -> Double { s * s } }
                    let shapes: [Shape] = [Circle(2), Square(3)]
                    for s in shapes { log.log("area = \(round2(s.area()))") }
                }
            ),
            WebDemo(
                id: "paradigm.fp",
                title: "FP",
                summary: "순수 함수 + 불변성 + 1급 함수 + 합성.",
                docPath: "docs/15-paradigms/fp.md",
                body: .console { log in
                    let xs = [1, 2, 3, 4, 5]
                    let sumOfSquaresOfEvens = xs.filter { $0.isMultiple(of: 2) }.map { $0 * $0 }.reduce(0, +)
                    log.log("filter→map→reduce = \(sumOfSquaresOfEvens)")
                    let compose: (Int) -> Int = { $0 + 1 } >>> { $0 * 2 }
                    log.log("compose(3) = \(compose(3))")
                }
            ),
            WebDemo(
                id: "paradigm.imperative-vs-declarative",
                title: "Imperative vs Declarative",
                summary: "Imperative: 어떻게. Declarative: 무엇을. SwiftUI/Combine은 declarative.",
                docPath: "docs/15-paradigms/imperative-vs-declarative.md",
                body: .console { log in
                    let xs = [3, 1, 4, 1, 5]
                    var doubled: [Int] = []
                    for x in xs { doubled.append(x * 2) }
                    log.log("imperative \(doubled)")
                    log.log("declarative \(xs.map { $0 * 2 })")
                }
            ),
            WebDemo(
                id: "paradigm.oop-vs-fp",
                title: "OOP vs FP",
                summary: "OOP는 동작을 데이터에 묶음, FP는 데이터를 변환. 둘은 보완 관계.",
                docPath: "docs/15-paradigms/oop-vs-fp.md",
                body: .theory([
                    "OOP: 상태 보호 + 메시지(메서드) 송수신",
                    "FP: 입력 → 출력 변환, 부수효과 격리",
                    "Swift는 두 패러다임 모두 일급으로 지원 → 도메인에 맞춰 섞어 쓰기",
                    "ViewModel은 OOP(상태)+FP(변환) 혼합 표현이 일반적",
                ])
            ),
        ]
    )
}
