import SwiftUI

struct AlgorithmComplexityDemo: Demo {
    static let id = "cs.algo-complexity"
    static let title = "Algorithm Complexity"
    static let summary = "Big-O. 입력 n에 따른 점근적 증가율로 알고리즘 비교."
    static let docPath = "docs/13-cs-fundamentals/algorithm-complexity.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            func linear(_ n: Int) -> Int { var s = 0; for i in 0..<n { s &+= i }; return s }
            func quadratic(_ n: Int) -> Int { var s = 0; for i in 0..<n { for j in 0..<n { s &+= i+j } }; return s }
            for n in [1_000, 5_000] {
                let t1 = Date(); _ = linear(n); let l = Date().timeIntervalSince(t1) * 1000
                let t2 = Date(); _ = quadratic(n); let q = Date().timeIntervalSince(t2) * 1000
                log.log("n=\(n) linear=\(String(format: "%.2f", l))ms, quadratic=\(String(format: "%.2f", q))ms")
            }
        }
    }
}

struct DataStructuresDemo: Demo {
    static let id = "cs.data-structures"
    static let title = "Data Structures"
    static let summary = "Array/Dict/Set + Stack/Queue/Heap을 Swift로 직접 구현."
    static let docPath = "docs/13-cs-fundamentals/data-structures.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Stack<T> { private var s: [T] = []; mutating func push(_ v: T) { s.append(v) }; mutating func pop() -> T? { s.popLast() } }
            var st = Stack<Int>(); st.push(1); st.push(2); st.push(3)
            log.log("stack pop \(String(describing: st.pop()))")
            log.log("stack pop \(String(describing: st.pop()))")

            struct Queue<T> { private var s: [T] = []; mutating func enq(_ v: T) { s.append(v) }; mutating func deq() -> T? { s.isEmpty ? nil : s.removeFirst() } }
            var q = Queue<String>(); q.enq("a"); q.enq("b")
            log.log("queue deq \(String(describing: q.deq()))")
        }
    }
}

struct ConcurrencyPrimitivesDemo: Demo {
    static let id = "cs.concurrency-primitives"
    static let title = "Concurrency Primitives"
    static let summary = "Mutex/Semaphore/Atomic/Condition. iOS에서는 보통 actor/queue 상위 추상으로 대체."
    static let docPath = "docs/13-cs-fundamentals/concurrency-primitives.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let sem = DispatchSemaphore(value: 0)
            DispatchQueue.global().async {
                Thread.sleep(forTimeInterval: 0.2)
                log.log("worker 완료 신호")
                sem.signal()
            }
            DispatchQueue.global().async {
                log.log("main이 wait")
                sem.wait()
                log.log("main 진행")
            }
        }
    }
}

struct MemoryModelDemo: Demo {
    static let id = "cs.memory-model"
    static let title = "Memory Model"
    static let summary = "Reordering, visibility, happens-before. Swift는 sequential consistency를 일반적으로 제공."
    static let docPath = "docs/13-cs-fundamentals/memory-model.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "CPU/컴파일러는 single-thread 의미를 보존하는 한 명령 재배치 가능",
            "다른 스레드가 그 결과를 보면 어색한 순서 관찰 (visibility)",
            "Atomic, lock, actor isolation이 happens-before 관계 보장",
            "Swift Concurrency 모델은 데이터 레이스 자체를 컴파일 타임에 차단(strict)",
        ])
    }
}

struct ProcessVsThreadDemo: Demo {
    static let id = "cs.process-vs-thread"
    static let title = "Process vs Thread"
    static let summary = "Process = 독립 주소공간, Thread = 공유 주소공간 + 별도 스택."
    static let docPath = "docs/13-cs-fundamentals/process-vs-thread.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "iOS 앱 = 1개 프로세스(extension은 별도 프로세스)",
            "Thread는 공유 메모리 → race condition 위험",
            "GCD/Operation/Task는 OS thread 풀 위에서 작업을 스케줄",
            "App Extension은 별도 프로세스라 메인 앱과 메모리 공유 안 됨 (App Group으로 일부 데이터)",
        ])
    }
}

struct SystemDesignIntroDemo: Demo {
    static let id = "cs.system-design"
    static let title = "System Design Intro"
    static let summary = "iOS 시스템 디자인: 캐시 계층, 동기화, 오프라인, 백그라운드, 모듈화."
    static let docPath = "docs/13-cs-fundamentals/system-design-intro.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "데이터 흐름: 네트워크 → DTO → 도메인 → UI 모델",
            "오프라인 우선: 로컬 DB가 source of truth, 백그라운드 sync",
            "이미지 캐시: 메모리 + 디스크 2단, prefetch + downsample",
            "모듈 경계: Feature/Domain/Infra 분리로 빌드/테스트 단축",
        ])
    }
}
