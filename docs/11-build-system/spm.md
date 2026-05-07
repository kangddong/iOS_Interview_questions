# Swift Package Manager (SPM)

> 한 줄 요약 — Apple 공식 패키지 매니저. **`Package.swift` 매니페스트로 의존성/타깃을 선언적으로 정의**하고 Xcode/CLI 모두 같은 자료를 사용한다.

도입 버전: Swift 3.0+ (iOS 앱 지원은 Xcode 11+).

## 기본 구조

```swift
// swift-tools-version:5.10
import PackageDescription

let package = Package(
    name: "Networking",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "Networking", targets: ["Networking"]),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),
    ],
    targets: [
        .target(name: "Networking", dependencies: [
            .product(name: "Logging", package: "swift-log"),
        ]),
        .testTarget(name: "NetworkingTests", dependencies: ["Networking"]),
    ]
)
```

- **products**: 외부에 노출할 결과물 (library/executable).
- **targets**: 컴파일 단위. 폴더 구조와 매핑 (`Sources/Networking/...`).
- **dependencies**: 외부 패키지.

## 버전 규칙

```swift
.package(url: "...", from: "1.5.0")           // 1.5.0 이상, 2.0.0 미만
.package(url: "...", "1.5.0"..<"2.0.0")
.package(url: "...", branch: "main")
.package(url: "...", revision: "abc1234")
.package(url: "...", exact: "1.5.0")
```

`from`이 가장 흔함 — semver의 *호환 가능한* 업데이트.

## 리소스 / Bundle

```swift
.target(
    name: "Networking",
    resources: [
        .process("Resources/"),
        .copy("legacy.json")
    ]
)
```

- `.process`: SPM이 처리(예: asset catalog 컴파일).
- `.copy`: 그대로 복사.

런타임:

```swift
let url = Bundle.module.url(forResource: "config", withExtension: "json")
```

`Bundle.module`은 SPM이 자동 합성. CocoaPods과 가장 큰 차이.

## 모듈화 — 다중 타깃 활용

```swift
targets: [
    .target(name: "Domain"),
    .target(name: "Data", dependencies: ["Domain"]),
    .target(name: "Feature_Login", dependencies: ["Domain", "Data"]),
    .target(name: "Feature_Home", dependencies: ["Domain", "Data"]),
    .target(name: "App", dependencies: ["Feature_Login", "Feature_Home"])
]
```

같은 패키지 안에서 여러 모듈로 나눠 의존 방향을 명시. 큰 앱은 *별도 패키지로 분리* + Xcode workspace.

## Local Package

`File → Add Packages → Add Local…`. 또는 dependencies에 path:

```swift
.package(path: "../DesignSystem")
```

회사 내부 모듈을 git 없이 참조.

## Plugin (Build Tool / Command)

Swift 5.6+. 빌드 시점에 *코드 생성/포맷터* 실행.

```swift
.plugin(name: "SwiftLintPlugin", capability: .buildTool(), dependencies: [...])
```

Xcode 14+에서 GUI로 plugin 신뢰/실행 가능.

## 비교 — SPM vs CocoaPods vs Carthage

| 구분 | SPM | CocoaPods | Carthage |
|---|---|---|---|
| 매니저 | Apple 공식 | 커뮤니티 | 커뮤니티 |
| Xcode 통합 | 깊음 | Workspace 추가 | 직접 빌드 후 임베드 |
| 매니페스트 | Swift 코드 | Ruby DSL | 단순 텍스트 |
| 리소스 | `Bundle.module` | `s.resources` | 직접 |
| Objective-C 호환 | 가능 (Swift 5.5+) | 강력 | 강력 |
| 학습 곡선 | 낮음 | 중간 | 중간 |
| Xcode 의존성 | Apple 보장 | 별도 도구 | 별도 도구 |

추세: **신규 프로젝트는 SPM 기본**, 기존 ObjC 다수/특수 케이스는 CocoaPods.

## Package.resolved

해결된 *정확한 버전*을 잠금 (lock file). 팀원/CI가 같은 버전을 받게 함. *반드시 commit*.

## Static vs Dynamic

```swift
.library(name: "Foo", type: .static, targets: ["Foo"])  // 또는 .dynamic
```

명시 안 하면 SPM이 자동 결정. 일반적으로 *static이 런치 타임에 유리*하지만, 같은 라이브러리가 여러 모듈에서 쓰이면 dynamic 검토.

## 흔한 함정 / Follow-up

- **Q. CocoaPods에서 SPM 마이그레이션은?**
  대부분의 메이저 라이브러리가 SPM 지원. 단계별: 1) SPM 가능 라이브러리부터 옮기고 2) Podfile에서 제거 3) Pods 정리. 일부 ObjC 매크로/리소스 패턴은 SPM에서 제약.

- **Q. SPM 빌드가 느려요.**
  네트워크 의존성 해결 + 첫 클린 빌드는 시간 걸림. 의존성 캐시(SPM 캐시), CI에서 캐시 키로 가속.

- **Q. private 패키지를 SPM으로?**
  GitHub/GitLab private repo + SSH/Token. CI에서는 deploy key 또는 PAT 설정.

- **Q. 같은 패키지의 여러 버전 의존?**
  SPM은 단일 그래프 — 호환되는 단일 버전을 해결. 호환 안 되면 빌드 실패.

- **Q. resources 사용 시 Bundle을 어떻게 찾나?**
  SPM 타깃 안에서 `Bundle.module`. App 타깃의 `Bundle.main`과 다름.

- **Q. Package에 시스템 라이브러리 의존?**
  `.systemLibrary(...)` 또는 `linkerSettings`/`cSettings`로 명시. iOS 앱에선 흔치 않음.

## 참고

- Apple Docs: Swift Package Manager
- WWDC 2019: Adopting Swift Packages in Xcode
- WWDC 2022: Meet Swift Package plugins
