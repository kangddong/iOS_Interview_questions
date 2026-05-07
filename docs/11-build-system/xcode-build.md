# Xcode 빌드 시스템

> 한 줄 요약 — Xcode는 *Target* 단위로 코드를 **Compile → Link → Copy Resources → Sign** 단계를 거쳐 .app/.ipa로 만든다. *Target / Scheme / Configuration* 세 개념을 분리해서 이해해야 면접에서 헷갈리지 않는다.

## Target / Scheme / Configuration

| 개념 | 의미 |
|---|---|
| **Target** | 빌드 결과물 1개 단위 (App, Test, Framework, Extension) |
| **Configuration** | 빌드 모드 (Debug, Release, 또는 커스텀) |
| **Scheme** | 사용자가 *Run/Test/Profile/Archive*에서 어떤 Target+Configuration 조합을 쓸지 정의 |

```
Scheme ──→ (Run: Target=App, Config=Debug)
       └→ (Test: Target=AppTests, Config=Debug)
       └→ (Archive: Target=App, Config=Release)
```

## Build Phases

각 Target에는 다음 단계가 있다.

| Phase | 역할 |
|---|---|
| **Target Dependencies** | 먼저 빌드되어야 하는 다른 Target |
| **Compile Sources** | 컴파일할 소스 파일 |
| **Link Binary With Libraries** | 링크할 dylib/static lib |
| **Copy Bundle Resources** | xib, asset, plist 등 리소스 복사 |
| **Run Script** | 임의 셸 스크립트 (포맷팅, 코드 생성, Crashlytics 업로드 등) |
| **Embed Frameworks** | dynamic 프레임워크를 .app/Frameworks에 넣음 |

순서가 중요. *Run Script 위치*에 따라 결과 달라짐 (예: Compile 전 SwiftLint 자동 수정).

## Debug vs Release

| | Debug | Release |
|---|---|---|
| 최적화 | `-Onone` | `-O` |
| Assertion | 활성 | 비활성 |
| `DEBUG` 매크로 | 정의됨 | 안 됨 |
| 디버깅 심볼 | 풀세트 | 분리(.dSYM) |
| 빠른 빌드 | O | X |
| 사용처 | 개발 | 배포, 프로파일링 |

**프로파일링은 반드시 Release** (Debug는 비현실적으로 느림).

## xcconfig — 빌드 설정 외부화

Xcode UI에서 설정한 값은 *프로젝트 파일*에 들어가 PR 충돌이 잦음. `.xcconfig` 파일로 분리하면 텍스트로 관리.

```
// Debug.xcconfig
SWIFT_OPTIMIZATION_LEVEL = -Onone
GCC_PREPROCESSOR_DEFINITIONS = $(inherited) DEBUG=1
PRODUCT_BUNDLE_IDENTIFIER = io.app.dev

// Release.xcconfig
SWIFT_OPTIMIZATION_LEVEL = -O
PRODUCT_BUNDLE_IDENTIFIER = io.app
```

Project → Configuration → Based on Configuration File로 연결.

## 환경별 분리 (dev/staging/prod)

선택지:
1. **Configuration 추가** (Dev/Staging/Release) — Build Settings에서 `BASE_URL`을 분기.
2. **Scheme 분리** — 여러 Scheme이 같은 Target + 다른 Configuration.
3. **Target 분리** — 별도 앱 ID, 아이콘, 번들. 동시 설치 가능.

대규모 앱은 (3) Target 분리 + xcconfig 조합 흔함.

## Info.plist 변수 치환

`xcconfig`/User-Defined Setting을 `$(VAR_NAME)` 형태로 plist에 사용:

```xml
<key>API_BASE_URL</key>
<string>$(API_BASE_URL)</string>
```

런타임에 `Bundle.main.infoDictionary?["API_BASE_URL"]`로 읽음. 키/시크릿을 *코드에 하드코드하지 않게* 하는 패턴.

## Build Settings에서 자주 묻는 키

- `SWIFT_VERSION`
- `IPHONEOS_DEPLOYMENT_TARGET` — 최소 지원 OS
- `ENABLE_BITCODE` (현재는 deprecated)
- `OTHER_LDFLAGS`, `OTHER_SWIFT_FLAGS`
- `DEAD_CODE_STRIPPING` — 사용 안 한 코드/심볼 제거
- `SWIFT_COMPILATION_MODE` — incremental / wholemodule
- `ENABLE_USER_SCRIPT_SANDBOXING` — 스크립트의 외부 접근 제한 (Xcode 14+)

## Build Time 줄이기

- `SWIFT_COMPILATION_MODE = wholemodule` (Release), `incremental` (Debug).
- 모듈 분리 (SPM/Tuist) — 변경 영향 줄이기.
- `Build Active Architecture Only = Yes` (Debug) — 디바이스 아키텍처만.
- 빌드 헬퍼: `xcbeautify`, `xcpretty`로 로그 단순화 (시간엔 영향 X, 가독성).
- `-Xfrontend -warn-long-function-bodies=200`로 느린 함수 발견.

## Run Script 흔한 활용

- SwiftLint / SwiftFormat
- 코드 생성 (Sourcery, SwiftGen)
- Firebase Crashlytics dSYM 업로드
- 환경별 GoogleService-Info.plist 복사

스크립트는 *입력 파일/출력 파일*을 명시해 incremental 빌드에 친화적이게 작성.

## 흔한 함정 / Follow-up

- **Q. Debug/Release에서 다른 동작이 나는 이유?**
  최적화로 인한 race condition, `assert` 활성/비활성, 컴파일 분기(#if DEBUG). 디버깅 시 Release로도 한 번 돌려 봐야 함.

- **Q. xcconfig 변경이 반영 안 된다.**
  Xcode를 한 번 닫았다 열거나, Clean Build. Configuration 파일 *상속*도 확인 (`#include "Base.xcconfig"`).

- **Q. 같은 .app인데 Mac과 디바이스 동작이 다르다.**
  iOS Simulator는 x86/arm64 macOS의 시뮬레이션. ARM 명령어 등 디바이스 종속 코드는 실기기에서만 검증 가능.

- **Q. Build Phase의 Run Script가 매번 실행됨.**
  Input/Output Files를 명시하면 변경된 경우만 실행. 명시 안 하면 매 빌드마다.

- **Q. Archive와 Release의 차이?**
  Archive는 *배포용 산출물(.xcarchive)* 만드는 액션. 보통 Release configuration을 사용. Symbol/dSYM이 보존되어 추후 crash symbolication 가능.

## 참고

- Apple Docs: Xcode Build System
- WWDC 2018: Behind the Scenes of the Xcode Build Process
