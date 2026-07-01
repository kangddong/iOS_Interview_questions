import SwiftUI

// 메모리 관리: ARC, retain cycle, weak/unowned, capture list, autoreleasepool, heap/stack, value memory, ARC opt, tools

private final class Tracer {
    let label: String
    static var alive = 0
    init(_ label: String) { self.label = label; Tracer.alive += 1 }
    deinit { Tracer.alive -= 1 }
}

struct ARCDemo: Demo {
    static let id = "memory.arc"
    static let title = "ARC 동작 추적"
    static let summary = "강한 참조가 생기면 +1, 사라지면 -1. 0이 되면 deinit."
    static let docPath = "docs/02-memory-management/arc.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Tracer.alive = 0
            do {
                let a = Tracer("A")
                let b = a   // +1
                log.log("after let b=a, alive=\(Tracer.alive) (참조 카운트는 +1되지만 인스턴스 수는 그대로)")
                _ = b
            }
            log.log("스코프 종료, alive=\(Tracer.alive)")
        }
    }
}

struct RetainCycleDemo: Demo {
    static let id = "memory.retain-cycle"
    static let title = "Retain Cycle"
    static let summary = "두 객체가 서로를 강참조 → 둘 다 RC>0 → 영구 leak."
    static let docPath = "docs/02-memory-management/retain-cycle.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            CycleTracker.shared.bind(log)
            do {
                let p = CycleParent(); let c = CycleStrongChild()
                p.child = c; c.parent = p
                log.log("cycle 생성 — deinit 호출 안 됨")
            }
            log.log("--- weak로 끊은 케이스 ---")
            do {
                let p = CycleParent(); let c = CycleWeakChild()
                c.parent = p
                log.log("p가 c를 참조하지 않으니 자연 해제됨")
                _ = c
            }
            CycleTracker.shared.unbind()
        }
    }
}

private final class CycleTracker {
    static let shared = CycleTracker()
    private var logger: DemoLogger?
    func bind(_ l: DemoLogger) { logger = l }
    func unbind() { logger = nil }
    func log(_ s: String) { logger?.log(s) }
}
private final class CycleParent {
    var child: CycleStrongChild?
    deinit { CycleTracker.shared.log("Parent deinit") }
}
private final class CycleStrongChild {
    var parent: CycleParent?
    deinit { CycleTracker.shared.log("Child deinit") }
}
private final class CycleWeakChild {
    weak var parent: CycleParent?
    deinit { CycleTracker.shared.log("WeakChild deinit") }
}

struct WeakVsUnownedDemo: Demo {
    static let id = "memory.weak-vs-unowned"
    static let title = "weak vs unowned"
    static let summary = "weak: Optional, 해제되면 nil로 안전. unowned: non-Optional, 해제된 객체 접근 시 크래시."
    static let docPath = "docs/02-memory-management/weak-vs-unowned.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "수명이 더 짧을 수 있는 참조 → weak (Optional)",
            "수명이 반드시 더 길다고 보장되는 참조 → unowned (성능 ↑, 안전성 ↓)",
            "delegate, parent ← child 같은 보조 참조는 weak가 기본 선택",
            "self를 캡처하는 클로저에서 closure가 self보다 오래 살 수 있으면 weak self",
        ])
    }
}

struct CaptureListDemo: Demo {
    static let id = "memory.capture-list"
    static let title = "Capture List"
    static let summary = "클로저 캡처 강도 명시. [weak self], [unowned self], [name = self.name] 값 캡처."
    static let docPath = "docs/02-memory-management/capture-list.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            final class VM {
                var title = "init"
                func bind() -> () -> String {
                    return { [weak self] in self?.title ?? "<nil>" }
                }
            }
            var vm: VM? = VM()
            let closure = vm!.bind()
            vm!.title = "updated"
            log.log("alive: \(closure())")
            vm = nil
            log.log("after nil-out: \(closure())")
        }
    }
}

struct AutoreleasepoolDemo: Demo {
    static let id = "memory.autoreleasepool"
    static let title = "Autoreleasepool"
    static let summary = "Obj-C 브릿지/대량 임시 객체 생성 루프에서 메모리 피크 줄이는 용도."
    static let docPath = "docs/02-memory-management/autoreleasepool.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            log.log("이미지/Obj-C 객체를 만드는 큰 루프에서 autoreleasepool로 청크 단위 해제")
            for i in 0..<3 {
                autoreleasepool {
                    let data = Data(count: 1024 * 1024)
                    log.log("chunk \(i) data=\(data.count) bytes — 풀 종료시 즉시 release 대상")
                }
            }
        }
    }
}

struct HeapVsStackDemo: Demo {
    static let id = "memory.heap-vs-stack"
    static let title = "Heap vs Stack"
    static let summary = "값 타입은 보통 stack, class/escaping closure 캡처는 heap. heap은 RC + 동기화 비용."
    static let docPath = "docs/02-memory-management/heap-vs-stack.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Stack: 함수 프레임에 빠르게 push/pop, 별도 동기화 불필요",
            "Heap: 동적 할당, ARC 카운팅·atomic 연산 비용 발생",
            "struct 안에 reference 타입이 있으면 referenced 인스턴스는 결국 heap에 존재",
            "탈출 closure나 큰 값은 컴파일러가 box-up 해서 heap에 둘 수 있음",
        ])
    }
}

struct ValueTypeMemoryDemo: Demo {
    static let id = "memory.value-type"
    static let title = "Value Type Memory"
    static let summary = "구조체는 복사지만 내부에 reference 타입이 있으면 그 참조는 공유."
    static let docPath = "docs/02-memory-management/value-type-memory.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            final class Box { var v = 1 }
            struct Wrapper { var box = Box(); var n = 0 }
            var a = Wrapper(); var b = a
            b.n = 99; b.box.v = 99
            log.log("a.n=\(a.n), b.n=\(b.n)  ← 값")
            log.log("a.box.v=\(a.box.v), b.box.v=\(b.box.v)  ← reference 공유")
        }
    }
}

struct ARCOptimizationDemo: Demo {
    static let id = "memory.arc-opt"
    static let title = "ARC 최적화"
    static let summary = "옵티마이저가 redundant retain/release 제거. inout/borrowing으로 카운팅 자체 회피."
    static let docPath = "docs/02-memory-management/arc-optimization.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "함수에 값을 넘기면 컴파일러가 ownership transfer/borrow 여부 결정",
            "@inline(__always), final, struct로 동적 dispatch 줄이면 ARC 호출도 줄어듦",
            "borrowing/consuming 키워드(Swift 5.9+)로 ARC 트래픽 명시 제거 가능",
            "Instruments → Allocations / Time Profiler에서 retain release 비중 확인",
        ])
    }
}

struct MemoryToolsDemo: Demo {
    static let id = "memory.tools"
    static let title = "Memory Tools"
    static let summary = "Xcode Debug Memory Graph + Instruments(Allocations/Leaks/Zombies)."
    static let docPath = "docs/02-memory-management/memory-tools.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Debug Memory Graph: 현재 살아있는 객체와 참조 관계 시각화 (cycle 잡기 좋음)",
            "Leaks: 도달 불가능하지만 RC>0인 메모리 추적",
            "Allocations: 시간에 따른 메모리 그래프 + 콜스택",
            "Zombies: 해제 후 메시지 보낸 객체 잡기 (UIKit/Obj-C 디버깅)",
        ])
    }
}
