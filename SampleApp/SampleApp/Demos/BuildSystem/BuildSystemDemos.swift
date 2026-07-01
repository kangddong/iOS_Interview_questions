import SwiftUI

struct XcodeBuildDemo: Demo {
    static let id = "build.xcode"
    static let title = "Xcode Build Phases"
    static let summary = "Preprocess → Compile Swift/ObjC → Link → Copy Bundle Resources → Code Sign."
    static let docPath = "docs/11-build-system/xcode-build.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Compile Sources: .swift/.m → .o (모듈 단위 incremental)",
            "Link Binary With Libraries: 다른 framework/library와 결합",
            "Copy Bundle Resources: 이미지/plist/스토리보드 → .app 안",
            "Run Script Phase: SwiftLint/SwiftGen/SwiftFormat 같은 도구 hook",
        ])
    }
}

struct BuildTimeOptDemo: Demo {
    static let id = "build.time-opt"
    static let title = "Build Time Optimization"
    static let summary = "모듈화, type inference 줄이기, header parsing 축소."
    static let docPath = "docs/11-build-system/build-time-optimization.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Whole Module Optimization on(릴리즈), 디버그는 incremental",
            "-Xfrontend -warn-long-function-bodies=200 로 느린 함수 검출",
            "Type inference 복잡 식은 명시 타입 캐스트로 절감",
            "Modules / SPM 분리로 변경 영향 축소",
        ])
    }
}

struct CICDDemo: Demo {
    static let id = "build.ci-cd"
    static let title = "CI/CD"
    static let summary = "fastlane + GitHub Actions / Xcode Cloud / Bitrise. TestFlight 자동 배포."
    static let docPath = "docs/11-build-system/ci-cd.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "fastlane match: 인증서/프로비저닝 Git에 암호화 저장",
            "fastlane gym/scan/pilot: 빌드/테스트/TestFlight 업로드",
            "PR마다 테스트 실행 + 베타 채널은 nightly upload",
            "Xcode Cloud: Apple 통합형, 매트릭스 분기 실행 약함",
        ])
    }
}

struct CodeSigningDemo: Demo {
    static let id = "build.code-signing"
    static let title = "Code Signing"
    static let summary = "Certificate + Provisioning Profile + Entitlements. App Store 트리오."
    static let docPath = "docs/11-build-system/code-signing.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Certificate: 개발자 신원 키쌍",
            "Provisioning Profile: AppID + 디바이스 + Cert를 묶은 권한 문서",
            "Entitlements: push, keychain access group 등 capability",
            "App Store Connect → review → distribution profile 필요",
        ])
    }
}

struct SPMDemo: Demo {
    static let id = "build.spm"
    static let title = "Swift Package Manager"
    static let summary = "Package.swift = 매니페스트. Target/Product/Dependency 3축."
    static let docPath = "docs/11-build-system/spm.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Target: 소스/리소스/테스트 단위",
            "Product: library(static/dynamic) | executable",
            "Dependency: .package(url:from:) — semantic version",
            "Resource: .copy/.process로 번들 포함",
        ])
    }
}

struct StaticVsDynamicDemo: Demo {
    static let id = "build.static-vs-dynamic"
    static let title = "Static vs Dynamic Libraries"
    static let summary = "Static: 최종 바이너리에 합쳐짐(런타임 가벼움). Dynamic: 별도 dylib, 로드 시간 비용."
    static let docPath = "docs/11-build-system/static-vs-dynamic-libraries.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Static: 앱 launch 시 dyld가 안 건드림 → pre-main 시간 ↓",
            "Static: 동일 코드 여러 dynamic framework가 갖고 있으면 중복",
            "Dynamic: 시스템 프레임워크와 같은 방식, 핫스왑/플러그인 가능",
            "iOS 앱에서는 보통 static linking 권장 (실행파일 1개로 묶임)",
        ])
    }
}

struct FrameworkVsLibraryDemo: Demo {
    static let id = "build.framework-vs-library"
    static let title = "Framework vs Library"
    static let summary = "Framework = library + 헤더 + 리소스 번들. iOS는 framework 단위가 표준."
    static let docPath = "docs/11-build-system/framework-vs-library.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Static library(.a): 코드만",
            "Framework: .framework 디렉토리에 .dylib/.a + Headers + Resources",
            "XCFramework: 여러 슬라이스(iOS device/sim, mac) 묶음",
            "SPM도 내부적으로 framework target을 만들 수 있음",
        ])
    }
}

struct LinkerDyldDemo: Demo {
    static let id = "build.linker-dyld"
    static let title = "Linker & dyld"
    static let summary = "ld가 정적 결합, dyld는 런타임 동적 로드. App launch는 dyld 시간 직접 영향."
    static let docPath = "docs/11-build-system/linker-and-dyld.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "ld: 컴파일 산출물 + 라이브러리 → 실행 파일/lib",
            "dyld: 앱 실행 시 dynamic framework들 로드 + 바인딩",
            "Dynamic framework 수 ↑ → 런치 ↑ (특히 cold start)",
            "DYLD_PRINT_STATISTICS=1로 단계별 시간 출력",
        ])
    }
}

struct MachODemo: Demo {
    static let id = "build.macho"
    static let title = "Mach-O & Binary"
    static let summary = "Apple 플랫폼 실행 포맷. header + load commands + segments(__TEXT,__DATA,...)."
    static let docPath = "docs/11-build-system/mach-o-and-binary.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "fat/universal binary는 여러 아키텍처 슬라이스 묶음",
            "otool/nm/dwarfdump 같은 도구로 검사",
            "__TEXT: 코드 read-only, __DATA: 변하는 데이터, __LINKEDIT: 메타",
            "lipo로 슬라이스 추출/병합",
        ])
    }
}
