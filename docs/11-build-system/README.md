# 11. Build System

> 한 줄 요약 — Xcode 빌드는 *Build Phases 파이프라인 + 컴파일·링크 + Code Sign* 으로 `.app` 번들을 만드는 과정. 면접 핵심은 **Target/Scheme/Configuration 구조, SPM, Code Sign 에러 진단, Static/Dynamic Library 트레이드오프**.

## 빌드 파이프라인 한눈에

```
.swift / .m  ─→ swiftc/clang ─→ .o (object)
                                  ↓
                              ld (linker)
                                  ↓
                              실행 바이너리 + dylib 참조
                                  ↓
                          Resources + Info.plist + 바이너리
                                  ↓
                              Code Sign (codesign)
                                  ↓
                              .app 번들 → Sign 확인 → 설치
```

## 핵심 개념 6선

### 1. Target / Scheme / Configuration
- **Target**: 빌드 산출물 1개 (앱 / 프레임워크 / 테스트 / 익스텐션).
- **Scheme**: *어떤 Target들을* *어떤 Configuration으로* 빌드/테스트/실행할지 묶음.
- **Configuration**: Debug / Release / 커스텀. xcconfig로 *플랫 텍스트*로 관리하면 git diff 친화적.

### 2. xcconfig
- Build Settings를 *코드*로 관리. `.xcconfig` 파일 상속·include 가능.
- 환경별 분기 (`STAGING`, `PROD`), feature flag 전달, Info.plist 변수화.

### 3. SPM vs CocoaPods vs Carthage
- **SPM**: Apple 공식, Xcode 통합, `Package.swift`로 *코드로* 의존성 선언, Resources 지원. 권장.
- **CocoaPods**: 루비 기반, post_install 훅, 빌드 설정 깊이 침투. 레거시.
- **Carthage**: 미리 빌드된 framework. 빌드 빠름, 통합 수동.

### 4. Code Signing
- **Certificate** (개발자 ID) + **Provisioning Profile** (앱 ID + 디바이스 + entitlements) + **Entitlements** (capability).
- 흔한 에러: certificate 만료 / device UUID 누락 / entitlements 불일치 / Team 변경.
- `fastlane match` / Xcode Cloud automatic signing으로 팀 공유 관리.

### 5. Static vs Dynamic Library
- **Static (`.a`)**: 빌드 시 *바이너리에 통째로 복사*. launch 빠름, 앱 바이너리 커짐.
- **Dynamic (`.dylib`/`.framework`)**: 런타임 *dyld가 로딩*. launch 느림 (dyld pre-main), 메모리 공유.
- iOS 17+ **mergeable libraries**: Debug는 dynamic, Release는 자동 static 병합 → 둘의 장점.
- 권장: 일반 SPM 의존성은 *static*, 시스템 dylib만 dynamic.

### 6. dyld와 Pre-Main
- 앱 launch는 `main()` 호출 전 **dyld** 가 dylib들을 로드/리베이스/바인드.
- 개수 많을수록 pre-main 비용 ↑ → launch time 회귀.
- **dyld 4**: chained fixups로 rebase/bind 통합, prelaunch 빠름.
- Mach-O 구조 (Header / Load Commands / Segments) 는 시니어 디테일.

## 빌드 타임 최적화

```
원인               ─ 대응
─────────────────────────────────────
타입 추론 폭증     ─ 명시적 타입, 함수 분리
모듈 의존 폭증     ─ public API 최소화, 모듈 그래프 다듬기
무거운 매크로 사용 ─ 매크로 전개 캐시, 필요한 곳만
큰 단일 모듈       ─ 기능별 SPM/Tuist 분리, binary cache
재컴파일 폭증      ─ ABI 깨지는 변경 격리, internal로 노출 줄이기
```

→ 측정 도구: Xcode "Build Timing Summary", `-Xfrontend -warn-long-expression-type-checking=200`, BuildTimeAnalyzer.

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
