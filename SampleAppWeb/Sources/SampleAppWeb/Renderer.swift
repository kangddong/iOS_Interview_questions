import JavaScriptKit

// SampleApp의 SwiftUI 네비게이션(RootMenu → Category → DemoHost)과 LogView/TheoryCard를
// JavaScriptKit(DOM)으로 재현하는 플랫폼 UI 계층.

private let document = JSObject.global.document.object!

// JSClosure는 참조가 사라지면 콜백이 무효화되므로 전역에 붙잡아 둔다(SPA 수명 동안 유지).
private var retained: [JSClosure] = []

// MARK: - DOM 헬퍼

private func make(_ tag: String, className: String? = nil, text: String? = nil) -> JSObject {
    let node = document.createElement!(tag).object!
    if let className { node.className = .string(className) }
    if let text { node.textContent = .string(text) }
    return node
}

private func append(_ parent: JSObject, _ children: JSObject...) {
    for child in children { _ = parent.appendChild!(child) }
}

private func onClick(_ node: JSObject, _ handler: @escaping () -> Void) {
    let closure = JSClosure { _ in handler(); return .undefined }
    retained.append(closure)
    _ = node.addEventListener!("click", closure)
}

private var app: JSObject { document.getElementById!("app").object! }

private func clearApp() {
    app.innerHTML = .string("")
}

// MARK: - 라우팅

enum Route {
    case menu
    case category(WebCategory)
    case demo(WebCategory, WebDemo)
}

func render(_ route: Route) {
    clearApp()
    switch route {
    case .menu: renderMenu()
    case .category(let c): renderCategory(c)
    case .demo(let c, let d): renderDemo(c, d)
    }
    _ = JSObject.global.scrollTo!(0, 0)
}

// MARK: - 화면들

private func renderMenu() {
    let root = app

    let header = make("div", className: "nav")
    append(header, make("span", className: "nav-title", text: "iOS Interview — SampleApp"))
    append(root, header)

    append(root, make("p", className: "subtitle",
                      text: "docs/ 17개 카테고리 데모를 Swift → WebAssembly로 컴파일해 브라우저에서 실행합니다."))

    let list = make("div", className: "list")
    for category in Catalog.categories {
        let row = make("button", className: "row")
        let count = category.demos.count
        append(row, make("span", className: "row-title", text: category.title))
        let badgeText = count > 0 ? "\(count)개" : "포팅 예정"
        append(row, make("span", className: count > 0 ? "badge" : "badge badge-muted", text: badgeText))
        if count > 0 {
            onClick(row) { render(.category(category)) }
        } else {
            row.disabled = .boolean(true)
        }
        append(list, row)
    }
    append(root, list)

    append(root, footer())
}

private func renderCategory(_ category: WebCategory) {
    let root = app

    let header = make("div", className: "nav")
    let back = make("button", className: "back", text: "‹ 메뉴")
    onClick(back) { render(.menu) }
    append(header, back)
    append(header, make("span", className: "nav-title", text: category.title))
    append(root, header)

    let list = make("div", className: "list")
    for demo in category.demos {
        let row = make("button", className: "row row-demo")
        let col = make("span", className: "col")
        append(col, make("span", className: "row-title", text: demo.title))
        append(col, make("span", className: "row-summary", text: demo.summary))
        append(row, col)
        append(row, make("span", className: "chevron", text: "›"))
        onClick(row) { render(.demo(category, demo)) }
        append(list, row)
    }
    append(root, list)
    append(root, footer())
}

private func renderDemo(_ category: WebCategory, _ demo: WebDemo) {
    let root = app

    let header = make("div", className: "nav")
    let back = make("button", className: "back", text: "‹ \(category.title)")
    onClick(back) { render(.category(category)) }
    append(header, back)
    append(root, header)

    append(root, make("h2", className: "demo-title", text: demo.title))
    append(root, make("p", className: "demo-summary", text: demo.summary))
    append(root, make("code", className: "docpath", text: demo.docPath))

    switch demo.body {
    case .console(let run):
        renderConsole(root, run)
    case .theory(let bullets):
        renderTheory(root, bullets)
    case .iosOnly(let note):
        let card = make("div", className: "ios-only")
        append(card, make("div", className: "ios-only-tag", text: "iOS 전용 (웹 미지원)"))
        append(card, make("div", text: note))
        append(root, card)
    }
    append(root, footer())
}

// MARK: - LogView (콘솔 실행)

private func renderConsole(_ root: JSObject, _ run: @escaping (DemoLogger) -> Void) {
    let bar = make("div", className: "toolbar")
    let runBtn = make("button", className: "btn btn-primary", text: "▶ 실행")
    let clearBtn = make("button", className: "btn", text: "지우기")
    append(bar, runBtn, clearBtn)
    append(root, bar)

    let console = make("pre", className: "console")
    console.textContent = .string("실행 버튼을 눌러 결과를 확인하세요.")
    append(root, console)

    onClick(runBtn) {
        let logger = DemoLogger()
        run(logger)
        console.textContent = .string(logger.lines.isEmpty ? "(출력 없음)" : logger.lines.joined(separator: "\n"))
    }
    onClick(clearBtn) {
        console.textContent = .string("실행 버튼을 눌러 결과를 확인하세요.")
    }
}

// MARK: - TheoryCard

private func renderTheory(_ root: JSObject, _ bullets: [String]) {
    let card = make("div", className: "theory")
    for line in bullets {
        let row = make("div", className: "bullet")
        append(row, make("span", className: "dot", text: "•"))
        append(row, make("span", text: line))
        append(card, row)
    }
    append(root, card)
}

private func footer() -> JSObject {
    make("div", className: "footer",
         text: "Swift 6.2 · WebAssembly · JavaScriptKit — SampleApp 데모 로직을 wasm에서 실행")
}
