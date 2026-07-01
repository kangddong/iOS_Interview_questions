import SwiftUI
import Observation

// MARK: - 1. MVC

struct MVCDemo: Demo {
    static let id = "arch.mvc"
    static let title = "MVC"
    static let summary = "Model–View–Controller. Apple MVC는 사실상 Massive View Controller로 변질되기 쉬움."
    static let docPath = "docs/06-architecture/mvc-vs-mvvm.md"
    static func makeView() -> some View {
        struct V: View {
            @State var model = 0
            var body: some View {
                VStack(spacing: 12) {
                    Text("Model: \(model)")
                    Button("+1 (Controller)") { model += 1 }
                }
            }
        }
        return V()
    }
}

// MARK: - 2. MVVM

@Observable
private final class CounterVM {
    private(set) var display: String = "0"
    private var n = 0
    func tap() { n += 1; display = "현재 카운트 = \(n)" }
}

struct MVVMDemo: Demo {
    static let id = "arch.mvvm"
    static let title = "MVVM"
    static let summary = "ViewModel이 표현 로직과 모델 변환을 가지고, View는 binding만."
    static let docPath = "docs/06-architecture/mvc-vs-mvvm.md"
    static func makeView() -> some View {
        struct V: View {
            @State var vm = CounterVM()
            var body: some View {
                VStack(spacing: 12) {
                    Text(vm.display).font(.title3)
                    Button("탭 (VM에 위임)") { vm.tap() }
                }
            }
        }
        return V()
    }
}

// MARK: - 3. Coordinator

struct CoordinatorDemo: Demo {
    static let id = "arch.coordinator"
    static let title = "Coordinator"
    static let summary = "화면 전환 로직을 별도 객체가 소유. View/VC는 다음 화면을 모름."
    static let docPath = "docs/06-architecture/coordinator.md"
    static func makeView() -> some View {
        struct V: View {
            @State var path = [String]()
            var body: some View {
                NavigationStack(path: $path) {
                    VStack(spacing: 12) {
                        Button("Detail로 (Coordinator가 push)") { path.append("detail") }
                    }
                    .navigationDestination(for: String.self) { val in
                        Text("화면: \(val)")
                            .navigationTitle("Detail")
                    }
                }
            }
        }
        return V()
    }
}

// MARK: - 4. DI

protocol GreetingService { func greet() -> String }
struct EnglishGreeter: GreetingService { func greet() -> String { "Hello" } }
struct KoreanGreeter: GreetingService { func greet() -> String { "안녕" } }

struct DIDemo: Demo {
    static let id = "arch.di"
    static let title = "Dependency Injection"
    static let summary = "외부에서 의존성 주입. 테스트/대체 용이. 생성자 주입 > 프로퍼티 주입."
    static let docPath = "docs/06-architecture/dependency-injection.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Component { let svc: GreetingService; func run() -> String { svc.greet() } }
            log.log(Component(svc: EnglishGreeter()).run())
            log.log(Component(svc: KoreanGreeter()).run())
        }
    }
}

// MARK: - 5. Clean

struct CleanArchitectureDemo: Demo {
    static let id = "arch.clean"
    static let title = "Clean Architecture (slice)"
    static let summary = "UseCase → Repository → DataSource. UI는 UseCase 호출만, 비즈니스는 도메인 계층."
    static let docPath = "docs/06-architecture/clean-architecture.md"
    static func makeView() -> some View {
        protocol UserRepository { func current() -> String }
        struct LocalUserRepo: UserRepository { func current() -> String { "K(local)" } }
        struct GetCurrentUser { let repo: UserRepository; func callAsFunction() -> String { repo.current() } }
        struct V: View {
            let usecase: GetCurrentUser
            @State var text = ""
            var body: some View {
                VStack(spacing: 12) {
                    Text(text.isEmpty ? "<empty>" : text)
                    Button("UseCase 실행") { text = usecase() }
                }
            }
        }
        return V(usecase: GetCurrentUser(repo: LocalUserRepo()))
    }
}

// MARK: - 6. TCA Lite

@Observable
private final class TCALiteStore<S, A> {
    private(set) var state: S
    private let reduce: (inout S, A) -> Void
    init(initial: S, reduce: @escaping (inout S, A) -> Void) { state = initial; self.reduce = reduce }
    func send(_ action: A) { reduce(&state, action) }
}

struct TCALiteDemo: Demo {
    static let id = "arch.tca-lite"
    static let title = "TCA-lite Counter"
    static let summary = "State + Action + Reducer 트리오. 외부 SPM 없이 자체 구현한 축약 버전."
    static let docPath = "docs/06-architecture/tca.md"
    static func makeView() -> some View {
        struct CState: Equatable { var n = 0 }
        enum CAction { case inc, dec, reset }
        struct V: View {
            @State var store = TCALiteStore<CState, CAction>(initial: CState()) { state, action in
                switch action {
                case .inc: state.n += 1
                case .dec: state.n -= 1
                case .reset: state.n = 0
                }
            }
            var body: some View {
                VStack(spacing: 12) {
                    Text("n = \(store.state.n)").font(.title)
                    HStack(spacing: 12) {
                        Button("-") { store.send(.dec) }
                        Button("reset") { store.send(.reset) }
                        Button("+") { store.send(.inc) }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        return V()
    }
}

// MARK: - 7. Modularization

struct ModularizationDemo: Demo {
    static let id = "arch.modularization"
    static let title = "Modularization"
    static let summary = "SPM 패키지/Tuist 모듈로 feature 분리. 빌드 캐시·치환·테스트 용이."
    static let docPath = "docs/06-architecture/modularization.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "App → Feature → Domain → Network/Persistence 같은 레이어 모듈로 의존 방향 강제",
            "interface/implementation 분리(Protocol 패키지 + Concrete 패키지)로 빌드 그래프 좁힘",
            "SPM의 dynamic = 빌드 시간↑·런타임 비용↑이므로 static 권장",
            "Tuist/SPM에서 feature flag 단위 모듈로 dead code 분리",
        ])
    }
}

// MARK: - 8. Naming

struct NamingConventionsDemo: Demo {
    static let id = "arch.naming"
    static let title = "Naming Conventions"
    static let summary = "Swift API Design Guidelines. clarity at the point of use가 1원칙."
    static let docPath = "docs/06-architecture/naming-conventions.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "주체+동작: list.append(x), array.removeAll()",
            "변형 vs 비변형: sort()/sorted(), reverse()/reversed()",
            "역할 표현: makeIterator()는 'a' factory, 그냥 iterator()는 NO",
            "전치사로 명확: at:/with:/by:/from:/to:",
        ])
    }
}
