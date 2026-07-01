import SwiftUI
import Foundation

struct GCDDemo: Demo {
    static let id = "concurrency.gcd"
    static let title = "GCD"
    static let summary = "DispatchQueue.main/global, sync/async, QoS, work item."
    static let docPath = "docs/03-concurrency/gcd.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let q = DispatchQueue.global(qos: .userInitiated)
            log.log("[main] before async")
            q.async {
                Thread.sleep(forTimeInterval: 0.3)
                DispatchQueue.main.async { log.log("[main] back from global") }
            }
            log.log("[main] after  async  ← global이 끝나기 전에 출력됨")
        }
    }
}

struct OperationQueueDemo: Demo {
    static let id = "concurrency.operation-queue"
    static let title = "OperationQueue"
    static let summary = "Operation 의존성, cancel, maxConcurrentOperationCount. GCD보다 객체화된 추상."
    static let docPath = "docs/03-concurrency/operation-queue.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let q = OperationQueue()
            q.maxConcurrentOperationCount = 2
            let a = BlockOperation { log.log("A 시작"); Thread.sleep(forTimeInterval: 0.2); log.log("A 끝") }
            let b = BlockOperation { log.log("B 시작") }
            b.addDependency(a)
            q.addOperations([a, b], waitUntilFinished: false)
            q.waitUntilAllOperationsAreFinished()
            log.log("queue 비었음")
        }
    }
}

struct RunLoopDemo: Demo {
    static let id = "concurrency.runloop"
    static let title = "RunLoop"
    static let summary = "스레드당 1개 이벤트 루프. 입력 소스/타이머/observer 큐 처리."
    static let docPath = "docs/03-concurrency/runloop-and-main-thread.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "RunLoop는 스레드에 종속, 메인 스레드는 앱 시작 시 자동으로 RunLoop 가동",
            "UI 이벤트, CFRunLoopTimer, port 입력 등이 동작 모드 별로 처리",
            "스크롤 중에는 tracking 모드라서 default 모드 타이머가 멈추는 식의 모드 분리",
            "Timer.scheduledTimer는 .common 모드로 등록해야 스크롤 중에도 발화",
        ])
    }
}

struct AsyncAwaitDemo: Demo {
    static let id = "concurrency.async-await"
    static let title = "async / await"
    static let summary = "구조적 동시성. async 함수는 suspension point에서 실행 양보."
    static let docPath = "docs/03-concurrency/async-await.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                func fetch(_ id: Int) async -> String {
                    try? await Task.sleep(nanoseconds: 200_000_000)
                    return "data\(id)"
                }
                log.log("start parallel")
                async let a = fetch(1)
                async let b = fetch(2)
                let result = await [a, b]
                log.log("done \(result)")
            }
        }
    }
}

struct ActorDemo: Demo {
    static let id = "concurrency.actor"
    static let title = "Actor"
    static let summary = "데이터에 직렬화된 접근을 보장하는 reference 타입. cross-actor 접근은 await 필요."
    static let docPath = "docs/03-concurrency/actor-and-mainactor.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            actor Counter { private var n = 0; func bump() { n += 1 }; func read() -> Int { n } }
            Task {
                let c = Counter()
                await withTaskGroup(of: Void.self) { g in
                    for _ in 0..<1000 { g.addTask { await c.bump() } }
                }
                let v = await c.read()
                log.log("동시 1000회 bump → \(v) (데이터 레이스 없음)")
            }
        }
    }
}

struct MainActorDemo: Demo {
    static let id = "concurrency.main-actor"
    static let title = "@MainActor"
    static let summary = "메인 스레드에서만 실행되도록 컴파일러가 강제. UIKit/SwiftUI 갱신용."
    static let docPath = "docs/03-concurrency/actor-and-mainactor.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                @MainActor func mustOnMain() { log.log("on main = \(Thread.isMainThread)") }
                await mustOnMain()
            }
        }
    }
}

struct SendableDemo: Demo {
    static let id = "concurrency.sendable"
    static let title = "Sendable"
    static let summary = "동시 컨텍스트 사이에서 안전하게 전달 가능함을 컴파일러에게 표시."
    static let docPath = "docs/03-concurrency/sendable.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "값 타입이면서 모든 프로퍼티가 Sendable이면 자동 Sendable",
            "actor와 final class + 불변 프로퍼티도 Sendable 가능",
            "@unchecked Sendable: 직접 동기화 책임지고 컴파일러 우회 (lock 등)",
            "@Sendable 클로저: 어떤 actor 컨텍스트로든 안전히 캡처/전달",
        ])
    }
}

struct AsyncSequenceDemo: Demo {
    static let id = "concurrency.async-sequence"
    static let title = "AsyncSequence / AsyncStream"
    static let summary = "비동기로 값 시퀀스를 소비. for await으로 순회."
    static let docPath = "docs/03-concurrency/async-sequence-and-stream.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                let stream = AsyncStream<Int> { cont in
                    Task {
                        for i in 0..<5 {
                            try? await Task.sleep(nanoseconds: 80_000_000)
                            cont.yield(i)
                        }
                        cont.finish()
                    }
                }
                for await v in stream { log.log("got \(v)") }
                log.log("stream done")
            }
        }
    }
}

struct ContinuationDemo: Demo {
    static let id = "concurrency.continuation"
    static let title = "Continuation"
    static let summary = "콜백 기반 API → async/await로 브릿지."
    static let docPath = "docs/03-concurrency/continuation.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            func legacy(_ done: @escaping (String) -> Void) {
                DispatchQueue.global().asyncAfter(deadline: .now() + 0.2) { done("legacy result") }
            }
            Task {
                let result = await withCheckedContinuation { (c: CheckedContinuation<String, Never>) in
                    legacy { c.resume(returning: $0) }
                }
                log.log(result)
            }
        }
    }
}

struct ConcurrencyPitfallsDemo: Demo {
    static let id = "concurrency.pitfalls"
    static let title = "Concurrency Pitfalls"
    static let summary = "데드락, priority inversion, 잘못된 actor reentrancy, 캡처 누수."
    static let docPath = "docs/03-concurrency/concurrency-pitfalls.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "main에서 sync(main)호출 → 즉시 데드락",
            "actor 메서드에서 await 시 reentrancy로 중간 상태 노출 가능",
            "Task가 self를 강하게 캡처 → 화면 dismiss해도 작업 지속",
            "Thread.sleep으로 코너 케이스 재현은 가능하지만 production 코드에선 금지",
        ])
    }
}

struct Swift6StrictDemo: Demo {
    static let id = "concurrency.swift6"
    static let title = "Swift 6 Strict Concurrency"
    static let summary = "data-race-safety를 컴파일러 오류로 격상. Sendable, @MainActor 정확히 사용 필요."
    static let docPath = "docs/03-concurrency/swift6-strict.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "SWIFT_STRICT_CONCURRENCY: minimal → targeted → complete 단계적 적용",
            "Sendable 위반, actor isolation 위반은 warning → error로 승격",
            "기존 콜백 API는 @preconcurrency import로 점진 마이그레이션",
            "테스트도 @MainActor 명시 필요한 경우 다수",
        ])
    }
}
