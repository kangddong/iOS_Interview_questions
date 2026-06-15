# 11. Build System

## 항목

- [Xcode 빌드 시스템](xcode-build.md) — Target/Scheme/Configuration, Build Phases, xcconfig, Build Time
- [Swift Package Manager](spm.md) — Package.swift, Resources, 모듈화, vs CocoaPods/Carthage
- [Code Signing](code-signing.md) — Certificate / Provisioning Profile / Entitlements, 흔한 에러
- [CI/CD](ci-cd.md) — *3년차+*. Xcode Cloud / Fastlane / GitHub Actions, match 사이닝, TestFlight 자동화

## 시니어

- [Build Time 최적화 (모듈 분리, 타입 추론, 측정)](build-time-optimization.md) — incremental rebuild, BuildTime Analyzer, Tuist binary cache
- [Mach-O와 바이너리 구조](mach-o-and-binary.md) — Header / Load Commands / Segments, `__TEXT`·`__DATA_CONST`·`__LINKEDIT`, dyld가 읽는 정보
- [Static vs Dynamic Library](static-vs-dynamic-libraries.md) — `.a` vs `.dylib` vs framework, ABI 영향, 런치 타임 비용, mergeable libraries
- [Linker(ld)와 dyld](linker-and-dyld.md) — ld의 심볼 해결, dyld 3/4, rebase·bind·chained fixups, pre-main 흐름
- [Framework vs Library](framework-vs-library.md) — framework 번들 레이아웃, umbrella 헤더, XCFramework, mergeable libraries

## 자주 묻는 질문

- Debug/Release 차이 → [xcode-build.md](xcode-build.md)
- SPM과 CocoaPods 선택 → [spm.md](spm.md)
- 코드 사이닝 에러 흔한 원인 → [code-signing.md](code-signing.md)
- static vs dynamic 트레이드오프 → [spm.md](spm.md) / [10-performance/launch-time.md](../10-performance/launch-time.md)
- 빌드 타임 줄이는 법 → [xcode-build.md](xcode-build.md)
- TestFlight / App Store 배포 흐름 → [code-signing.md](code-signing.md)
