// 13 CS 기초 — SampleApp/Demos/CSFundamentals/CSDemos.swift 이식.
// AlgorithmComplexity 타이밍은 Date(Foundation) 대신 순수 stdlib ContinuousClock 사용.
// ConcurrencyPrimitives는 DispatchSemaphore/Thread(libdispatch, wasm 미지원) → 이론 카드.

private func ms(_ d: Duration) -> String {
    let c = d.components
    let millis = Double(c.seconds) * 1000 + Double(c.attoseconds) / 1_000_000_000_000_000
    return "\((millis * 100).rounded() / 100)"
}

enum CSFundamentalsCategory {
    static let category = WebCategory(
        id: "csFundamentals",
        title: "13 CS 기초",
        demos: [
            WebDemo(
                id: "cs.algo-complexity",
                title: "Algorithm Complexity",
                summary: "Big-O. 입력 n에 따른 점근적 증가율로 알고리즘 비교.",
                docPath: "docs/13-cs-fundamentals/algorithm-complexity.md",
                body: .console { log in
                    func linear(_ n: Int) -> Int { var s = 0; for i in 0..<n { s &+= i }; return s }
                    func quadratic(_ n: Int) -> Int { var s = 0; for i in 0..<n { for j in 0..<n { s &+= i+j } }; return s }
                    let clock = ContinuousClock()
                    for n in [1_000, 3_000] {
                        let l = clock.measure { _ = linear(n) }
                        let q = clock.measure { _ = quadratic(n) }
                        log.log("n=\(n) linear=\(ms(l))ms, quadratic=\(ms(q))ms")
                    }
                    log.log("→ n이 커질수록 quadratic이 폭발적으로 증가 (O(n²))")
                }
            ),
            WebDemo(
                id: "cs.data-structures",
                title: "Data Structures",
                summary: "Array/Dict/Set + Stack/Queue/Heap을 Swift로 직접 구현.",
                docPath: "docs/13-cs-fundamentals/data-structures.md",
                body: .console { log in
                    struct Stack<T> { private var s: [T] = []; mutating func push(_ v: T) { s.append(v) }; mutating func pop() -> T? { s.popLast() } }
                    var st = Stack<Int>(); st.push(1); st.push(2); st.push(3)
                    log.log("stack pop \(String(describing: st.pop()))")
                    log.log("stack pop \(String(describing: st.pop()))")

                    struct Queue<T> { private var s: [T] = []; mutating func enq(_ v: T) { s.append(v) }; mutating func deq() -> T? { s.isEmpty ? nil : s.removeFirst() } }
                    var q = Queue<String>(); q.enq("a"); q.enq("b")
                    log.log("queue deq \(String(describing: q.deq()))")
                }
            ),
            WebDemo(
                id: "cs.concurrency-primitives",
                title: "Concurrency Primitives",
                summary: "Mutex/Semaphore/Atomic/Condition. iOS에서는 보통 actor/queue 상위 추상으로 대체.",
                docPath: "docs/13-cs-fundamentals/concurrency-primitives.md",
                // DispatchSemaphore/Thread는 libdispatch 종속 → wasm(단일 스레드)에서는 이론으로 설명.
                body: .theory([
                    "Mutex/Lock: 임계 구역 상호 배제 (한 번에 한 스레드)",
                    "Semaphore: 카운트 기반 접근 제어 (자원 N개 제한, 신호/대기)",
                    "Atomic: lock 없이 단일 연산의 원자성 보장 (CAS 등)",
                    "iOS에서는 보통 actor/DispatchQueue 같은 상위 추상으로 대체 — 저수준 primitive 직접 사용은 지양",
                    "※ WebAssembly(단일 스레드)에는 libdispatch가 없어 이 데모는 개념으로만 제공",
                ])
            ),
            WebDemo(
                id: "cs.memory-model",
                title: "Memory Model",
                summary: "Reordering, visibility, happens-before. Swift는 sequential consistency를 일반적으로 제공.",
                docPath: "docs/13-cs-fundamentals/memory-model.md",
                body: .theory([
                    "CPU/컴파일러는 single-thread 의미를 보존하는 한 명령 재배치 가능",
                    "다른 스레드가 그 결과를 보면 어색한 순서 관찰 (visibility)",
                    "Atomic, lock, actor isolation이 happens-before 관계 보장",
                    "Swift Concurrency 모델은 데이터 레이스 자체를 컴파일 타임에 차단(strict)",
                ])
            ),
            WebDemo(
                id: "cs.process-vs-thread",
                title: "Process vs Thread",
                summary: "Process = 독립 주소공간, Thread = 공유 주소공간 + 별도 스택.",
                docPath: "docs/13-cs-fundamentals/process-vs-thread.md",
                body: .theory([
                    "iOS 앱 = 1개 프로세스(extension은 별도 프로세스)",
                    "Thread는 공유 메모리 → race condition 위험",
                    "GCD/Operation/Task는 OS thread 풀 위에서 작업을 스케줄",
                    "App Extension은 별도 프로세스라 메인 앱과 메모리 공유 안 됨 (App Group으로 일부 데이터)",
                ])
            ),
            WebDemo(
                id: "cs.system-design",
                title: "System Design Intro",
                summary: "iOS 시스템 디자인: 캐시 계층, 동기화, 오프라인, 백그라운드, 모듈화.",
                docPath: "docs/13-cs-fundamentals/system-design-intro.md",
                body: .theory([
                    "데이터 흐름: 네트워크 → DTO → 도메인 → UI 모델",
                    "오프라인 우선: 로컬 DB가 source of truth, 백그라운드 sync",
                    "이미지 캐시: 메모리 + 디스크 2단, prefetch + downsample",
                    "모듈 경계: Feature/Domain/Infra 분리로 빌드/테스트 단축",
                ])
            ),
        ]
    )
}
