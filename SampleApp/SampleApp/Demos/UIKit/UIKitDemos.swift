import SwiftUI
import UIKit

// UIKit 데모는 UIViewControllerRepresentable로 SwiftUI에 호스팅.

private struct VCRep<VC: UIViewController>: UIViewControllerRepresentable {
    let make: () -> VC
    func makeUIViewController(context: Context) -> VC { make() }
    func updateUIViewController(_ uiViewController: VC, context: Context) {}
}

struct AppLifecycleDemo: Demo {
    static let id = "uikit.app-lifecycle"
    static let title = "App Lifecycle"
    static let summary = "iOS 13+ Scene 기반. UIApplication ↔ UISceneSession ↔ UIWindowScene."
    static let docPath = "docs/04-uikit/app-lifecycle.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "AppDelegate: process 수명 이벤트 (launch/terminate, 백그라운드 push)",
            "SceneDelegate: 멀티 윈도우/멀티 인스턴스 단위 활성/비활성",
            "상태: not running → inactive → active → background → suspended",
            "iPad 멀티 윈도우, CarPlay, ExternalDisplay 등은 추가 Scene로 노출",
        ])
    }
}

struct VCLifecycleDemo: Demo {
    static let id = "uikit.vc-lifecycle"
    static let title = "ViewController Lifecycle"
    static let summary = "viewDidLoad/willAppear/didAppear/willDisappear/didDisappear + viewWillLayout/Subviews."
    static let docPath = "docs/04-uikit/viewcontroller-lifecycle.md"
    static func makeView() -> some View {
        VCRep { LifecycleVC() }
    }
}

private final class LifecycleVC: UIViewController {
    let label = UILabel()
    var lines: [String] = []
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        label.numberOfLines = 0
        label.font = .monospacedSystemFont(ofSize: 12, weight: .regular)
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
        ])
        record("viewDidLoad")
    }
    override func viewWillAppear(_ a: Bool) { super.viewWillAppear(a); record("viewWillAppear") }
    override func viewDidAppear(_ a: Bool) { super.viewDidAppear(a); record("viewDidAppear") }
    override func viewWillLayoutSubviews() { super.viewWillLayoutSubviews(); record("viewWillLayoutSubviews") }
    override func viewDidLayoutSubviews() { super.viewDidLayoutSubviews(); record("viewDidLayoutSubviews") }
    override func viewWillDisappear(_ a: Bool) { super.viewWillDisappear(a); record("viewWillDisappear") }
    func record(_ s: String) { lines.append(s); label.text = lines.joined(separator: "\n") }
}

struct AutoLayoutDemo: Demo {
    static let id = "uikit.auto-layout"
    static let title = "AutoLayout"
    static let summary = "NSLayoutConstraint / 앵커 / 우선순위 / Intrinsic content size."
    static let docPath = "docs/04-uikit/auto-layout.md"
    static func makeView() -> some View {
        VCRep { AutoLayoutVC() }
    }
}

private final class AutoLayoutVC: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let red = UIView(); red.backgroundColor = .systemRed
        let blue = UIView(); blue.backgroundColor = .systemBlue
        [red, blue].forEach { $0.translatesAutoresizingMaskIntoConstraints = false; view.addSubview($0) }
        NSLayoutConstraint.activate([
            red.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            red.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -60),
            red.widthAnchor.constraint(equalToConstant: 80),
            red.heightAnchor.constraint(equalTo: red.widthAnchor),

            blue.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            blue.topAnchor.constraint(equalTo: red.bottomAnchor, constant: 16),
            blue.widthAnchor.constraint(equalTo: red.widthAnchor, multiplier: 1.5),
            blue.heightAnchor.constraint(equalTo: blue.widthAnchor, multiplier: 0.5),
        ])
    }
}

struct FrameVsBoundsDemo: Demo {
    static let id = "uikit.frame-vs-bounds"
    static let title = "Frame vs Bounds"
    static let summary = "frame=상위 좌표계 기준 위치/크기, bounds=자기 좌표계. transform은 frame만 영향."
    static let docPath = "docs/04-uikit/frame-vs-bounds.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "frame.origin = superview 좌표에서의 위치",
            "bounds.origin = 자기 자신 좌표계의 시작점 (스크롤뷰는 이걸 움직여서 콘텐츠 이동)",
            "회전/스케일 transform 적용 시 frame은 변하지만 bounds는 그대로",
            "layout 코드는 bounds 기준으로 작성하면 transform에 안전",
        ])
    }
}

struct ResponderChainDemo: Demo {
    static let id = "uikit.responder-chain"
    static let title = "Responder Chain"
    static let summary = "이벤트는 hit-test 후 first responder부터 위로 전달. UIControl도 같은 체인."
    static let docPath = "docs/04-uikit/responder-chain.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "hitTest(_:with:)로 터치 도달 뷰 결정 → 그 뷰가 first responder 후보",
            "처리 못한 이벤트는 nextResponder로 위로 (view → VC → window → app)",
            "@objc func customAction(_ sender:) 형태로 체인 어느 곳에서나 처리 가능",
            "키 입력/메뉴/단축키도 같은 체인 사용",
        ])
    }
}

struct RenderingPipelineDemo: Demo {
    static let id = "uikit.rendering-pipeline"
    static let title = "Rendering Pipeline"
    static let summary = "App → Commit → Render Server(BackBoard) → GPU. 60/120Hz vsync 기준 16/8ms 예산."
    static let docPath = "docs/04-uikit/rendering-pipeline.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Layout → Display → Prepare → Commit 단계가 매 프레임 실행",
            "Render Server(backboardd)에서 CALayer tree를 GPU 명령으로 컴파일",
            "Hitch: 프레임이 예산을 넘으면 dropped frame (스크롤 끊김)",
            "Off-screen pass(코너 라운딩, shadow, mask)는 별도 패스라서 비용 ↑",
        ])
    }
}

struct OffscreenRenderingDemo: Demo {
    static let id = "uikit.offscreen-rendering"
    static let title = "Off-screen Rendering"
    static let summary = "masksToBounds + 코너, shadowPath 없는 그림자, group opacity 등이 트리거."
    static let docPath = "docs/04-uikit/offscreen-rendering.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Color Off-screen-Rendered Yellow 토글로 시뮬레이터에서 시각 확인",
            "shadowPath를 지정하면 GPU가 alpha 계산을 안 해서 off-screen 회피",
            "둥근 모서리는 cornerCurve=.continuous + pre-baked 이미지로 회피 가능",
            "shouldRasterize=true는 자주 변하지 않을 때만",
        ])
    }
}

struct CoreAnimationDemo: Demo {
    static let id = "uikit.core-animation"
    static let title = "Core Animation"
    static let summary = "CALayer가 실제 렌더링 단위. UIView는 layer를 wrap. 암시적 애니메이션은 Layer 속성만."
    static let docPath = "docs/04-uikit/core-animation.md"
    static func makeView() -> some View {
        VCRep { CADemoVC() }
    }
}

private final class CADemoVC: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let layer = CALayer()
        layer.frame = CGRect(x: 100, y: 200, width: 100, height: 100)
        layer.backgroundColor = UIColor.systemTeal.cgColor
        layer.cornerRadius = 20
        view.layer.addSublayer(layer)

        let anim = CABasicAnimation(keyPath: "transform.rotation.z")
        anim.fromValue = 0; anim.toValue = Double.pi * 2
        anim.duration = 1.5; anim.repeatCount = .infinity
        layer.add(anim, forKey: "spin")
    }
}

struct TableCollectionDemo: Demo {
    static let id = "uikit.table-collection"
    static let title = "TableView / CollectionView"
    static let summary = "셀 재사용 큐. iOS 13+ DiffableDataSource로 스냅샷 기반 갱신."
    static let docPath = "docs/04-uikit/tableview-collectionview.md"
    static func makeView() -> some View {
        VCRep { TableVC() }
    }
}

private final class TableVC: UITableViewController {
    let items = (1...50).map { "Row \($0)" }
    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "c")
    }
    override func tableView(_ tv: UITableView, numberOfRowsInSection s: Int) -> Int { items.count }
    override func tableView(_ tv: UITableView, cellForRowAt i: IndexPath) -> UITableViewCell {
        let cell = tv.dequeueReusableCell(withIdentifier: "c", for: i)
        var config = cell.defaultContentConfiguration()
        config.text = items[i.row]
        cell.contentConfiguration = config
        return cell
    }
}

struct RunLoopDeepDemo: Demo {
    static let id = "uikit.runloop-deep"
    static let title = "RunLoop Deep"
    static let summary = "스크롤 중 mode = .tracking, 평소 .default. CADisplayLink는 .common."
    static let docPath = "docs/04-uikit/runloop-deep.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "RunLoop Mode가 다르면 같은 timer라도 호출 여부가 달라짐",
            "스크롤 중에는 tracking 모드, 일반 시점에는 default 모드로 메인 RunLoop 동작",
            ".common 모드 = default + tracking 같이 듣기",
            "URLSession delegate 큐의 RunLoop 설정 잘못하면 콜백 누락",
        ])
    }
}
