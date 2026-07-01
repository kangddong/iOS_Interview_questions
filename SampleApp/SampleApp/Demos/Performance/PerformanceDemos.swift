import SwiftUI

struct InstrumentsDemo: Demo {
    static let id = "perf.instruments"
    static let title = "Instruments"
    static let summary = "Time Profiler/Allocations/Leaks/Hangs/SwiftUI/MetricKit 등 트레이서 모음."
    static let docPath = "docs/10-performance/instruments.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Time Profiler: CPU 시간 분포, 메인스레드 hot path 식별",
            "Allocations: 객체 생성/해제 그래프 + 콜스택",
            "Hangs: 메인 스레드 정체 구간 자동 표시",
            "SwiftUI: body 호출 횟수와 diff 비용 추적",
        ])
    }
}

struct ImageScrollDemo: Demo {
    static let id = "perf.image-scroll"
    static let title = "Image & Scroll"
    static let summary = "디코딩 비용은 한 번에. prefetch + downsample + 캐싱."
    static let docPath = "docs/10-performance/image-and-scroll.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "UIImage(contentsOfFile:)는 lazy 디코드 → 첫 렌더 직전 hitch",
            "ImageIO + CGImageSourceCreateThumbnailAtIndex로 사전 디코드+다운샘플",
            "Cell이 viewport 진입 직전 prefetchRows로 디코딩 작업 시작",
            "메모리 압박 시 NSCache는 자동 evict",
        ])
    }
}

struct LaunchTimeDemo: Demo {
    static let id = "perf.launch-time"
    static let title = "Launch Time"
    static let summary = "Pre-main (dyld/static init) + main (RootVC 초기화) 두 단계."
    static let docPath = "docs/10-performance/launch-time.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Dynamic frameworks 수가 많으면 dyld 단계 비용 ↑ → static 권장",
            "+load, __attribute__((constructor))는 pre-main 직격탄",
            "Instruments → App Launch 템플릿으로 단계별 측정",
            "main 단계: RootVC viewDidLoad에서 무거운 동기 작업 금지",
        ])
    }
}

struct MainThreadHitchDemo: Demo {
    static let id = "perf.main-thread-hitch"
    static let title = "Main Thread Hitch"
    static let summary = "프레임 16ms(60Hz)/8ms(120Hz) 초과 시 dropped frame."
    static let docPath = "docs/10-performance/main-thread-and-hitch.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let start = Date()
            // 의도적 hitch (테스트용 — 실제 코드엔 절대 금지)
            var sum = 0
            for i in 0..<2_000_000 { sum &+= i }
            let elapsed = Date().timeIntervalSince(start) * 1000
            log.log("\(Int(elapsed))ms 동안 메인 스레드 점유 (sum=\(sum))")
            log.log("→ 프레임 \(Int(elapsed/16.6)) 개 드랍")
        }
    }
}

struct MetricKitDemo: Demo {
    static let id = "perf.metric-kit"
    static let title = "MetricKit & Crash"
    static let summary = "iOS 13+. CPU/메모리/배터리/hang/crash 메트릭을 OS가 일별 리포트."
    static let docPath = "docs/10-performance/metrickit-and-crash.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "MXMetricManager에 subscriber 등록 → didReceive 메트릭 콜백",
            "MXCrashDiagnostic, MXHangDiagnostic 등 진단 페이로드 수집",
            "Symbolicate 후 백엔드로 전송하여 in-the-wild 이슈 추적",
            "Firebase Crashlytics와 보완 관계",
        ])
    }
}

struct RenderingBudgetDemo: Demo {
    static let id = "perf.rendering-budget"
    static let title = "Rendering Budget"
    static let summary = "60Hz=16.6ms, ProMotion 120Hz=8.3ms. 모든 프레임 작업이 그 안에 끝나야."
    static let docPath = "docs/10-performance/rendering-budget-and-hitch.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "App phase(레이아웃/이벤트) + Render phase(GPU commit) 둘 다 포함",
            "메인 스레드에서 동기 IO/디스크/네트워크 → 즉시 hitch",
            "RunLoop perform 후 next frame까지 자동 batch — 너무 자주 invalidate 금지",
            "SwiftUI는 body 호출이 곧 비용, 깊은 트리에 무거운 modifier 주의",
        ])
    }
}
