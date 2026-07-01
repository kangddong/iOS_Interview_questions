// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "SampleAppWeb",
    dependencies: [
        .package(url: "https://github.com/swiftwasm/JavaScriptKit", from: "0.56.0"),
    ],
    targets: [
        .executableTarget(
            name: "SampleAppWeb",
            dependencies: [
                .product(name: "JavaScriptKit", package: "JavaScriptKit"),
            ],
            // wasm 런타임은 단일 스레드이므로 Swift 6 strict concurrency 대신 v5 모드 사용.
            swiftSettings: [
                .swiftLanguageMode(.v5),
            ]
        ),
    ]
)
