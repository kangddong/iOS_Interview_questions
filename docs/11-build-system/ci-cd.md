# CI/CD (Xcode Cloud / Fastlane / GitHub Actions)

> 한 줄 요약 — 코드 푸시 → **자동으로 빌드/테스트/사이닝/배포**까지 이어지는 파이프라인. iOS 진영은 **Xcode Cloud / Fastlane / GitHub Actions** 셋이 가장 흔하다.

## 단계 별 책임

```
[ Push ]
   ▼
[ Lint / Format ]
   ▼
[ Build ]
   ▼
[ Test (Unit + UI) ]
   ▼
[ Sign + Archive ]
   ▼
[ Distribute (TestFlight / Ad Hoc / App Store) ]
```

각 단계가 실패하면 즉시 중단, 알림.

## Xcode Cloud (Apple 공식)

- App Store Connect와 통합 — TestFlight 즉시 가능.
- Xcode 안에서 워크플로 정의.
- macOS 머신/iOS 시뮬레이터 자동 제공.
- 코드 사이닝 자동 (Apple Developer 연동).

장점: 설정이 가장 간단. App Store 워크플로 일관성.
단점: 다른 시스템 (Slack, 분석)과의 통합은 직접 작성. 가격.

## Fastlane

Ruby로 작성된 iOS 자동화 도구 모음. 표준이라고 봐도 무방.

```ruby
# Fastfile
default_platform(:ios)

platform :ios do
  desc "TestFlight 업로드"
  lane :beta do
    setup_ci
    match(type: "appstore", readonly: true)         # 사이닝
    increment_build_number
    build_app(scheme: "App", configuration: "Release")
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end

  desc "PR 빌드 + 테스트"
  lane :test do
    run_tests(scheme: "App", devices: ["iPhone 15"])
  end
end
```

- `match`: 인증서/profile을 git 암호화 보관 + 자동 설치.
- `gym`/`build_app`: archive.
- `pilot`/`upload_to_testflight`: TestFlight 업로드.
- `deliver`: 메타데이터 + 스크린샷 자동.

## GitHub Actions

YAML 기반 워크플로. macOS runner 사용.

```yaml
name: iOS CI
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '15.4'
      - name: Test
        run: xcodebuild test \
              -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' \
              | xcbeautify
```

장점: GitHub와 강한 통합, 무료 시간 제공. 단점: macOS minute 비쌈.

## 사이닝 자동화 — fastlane match

CI 머신에 *수동으로 인증서 설치*는 불안정. match가 표준 해결:

1. *match repo* (private git) 만든다.
2. 한 번 `fastlane match` 실행해 인증서/profile을 암호화 후 push.
3. CI에서 `match` 호출 → keychain 자동 설치.

`MATCH_PASSWORD` 환경변수를 CI secrets로 보관.

## 배포 채널

| 채널 | 용도 |
|---|---|
| **TestFlight** | 내부/외부 베타 (최대 10,000명) |
| **Ad Hoc** | 등록 디바이스에 직접 (UDID) |
| **App Store** | 일반 배포 |
| **Enterprise** | 사내 (별도 계정) |

CI에서 가장 자주: PR → unit test, main merge → TestFlight 자동 업로드.

## 주의 / 실수

- **타임존/날짜**: 빌드 번호 자동증가 시 충돌 → ASC 빌드 번호 기반 또는 commit count.
- **시뮬레이터 캐시**: 가끔 깨짐 → `xcrun simctl erase all`.
- **flaky 테스트**: CI에서 reproducibility 향상을 위해 `-test-iterations 2 -retry-tests-on-failure` (Xcode 13+).
- **DerivedData**: 캐시 키에 Swift 버전, Xcode 버전 포함.
- **secrets**: 절대 repo에 commit하지 말 것. CI secrets 또는 Keychain 외부 주입.

## 비교

| | Xcode Cloud | Fastlane | GitHub Actions |
|---|---|---|---|
| 설정 | GUI/간단 | Ruby Fastfile | YAML |
| 사이닝 | 자동 | match | match 또는 수동 |
| 외부 통합 | 약함 | 강함 (200+ action) | 강함 (Marketplace) |
| 가격 | Apple 가격 | 무료 (자체 호스트 필요) | 분당 비용 |
| 추천 | App Store-only 단순 앱 | 유연한 자동화 | GitHub 중심 팀 |

큰 회사/팀에 따라 Bitrise, CircleCI, Jenkins 등도 사용. 도구 차이일 뿐 *원칙*은 동일.

## Build Number / Version

```
CFBundleShortVersionString  → 사용자에게 보이는 버전 (1.2.0)
CFBundleVersion             → 빌드 번호 (123, 124, ...)
```

App Store 정책: *같은 버전 내에서 빌드 번호는 단조 증가*. CI에서 `increment_build_number`로 자동.

## 흔한 함정 / Follow-up

- **Q. CI에서 첫 빌드는 잘 됐는데 두 번째부터 사이닝 실패?**
  Keychain unlock 누락. `setup_ci` (fastlane) 또는 `security unlock-keychain`.

- **Q. PR 빌드만 하고 main merge 시 TestFlight 자동?**
  분기 트리거: GitHub Actions의 `on: push.branches: [main]`. Fastlane lane을 분리.

- **Q. 매번 의존성 다시 받음.**
  SPM 캐시 키 = `Package.resolved` 해시. CocoaPods는 Pods 폴더 캐시.

- **Q. App Store 심사 거절 자동화?**
  `deliver` 명령으로 *메타데이터 자동 제출*. 단 심사는 사람.

- **Q. 시뮬레이터/디바이스 모두 테스트?**
  feature flag로 분리. Unit/UI는 시뮬레이터, *디바이스 인증서 점검* 단계만 실기기 또는 Xcode Cloud.

- **Q. 보안: 환경변수 노출?**
  PR 워크플로에서 secrets 접근 제한 (예: `pull_request_target` vs `pull_request`). fork PR엔 secrets 미전달.

## 참고

- Apple Docs: Xcode Cloud
- fastlane.tools 공식 문서
- GitHub Actions for iOS — Awesome lists
