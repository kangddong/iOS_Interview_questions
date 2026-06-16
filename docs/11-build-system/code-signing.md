# Code Signing (코드 사이닝)

> 한 줄 요약 — iOS 앱은 **개발자 ID로 서명되어야 디바이스에서 실행**된다. *Certificate(누가)*, *Provisioning Profile(어디서/뭘)*, *Entitlements(무슨 권한)* 세 요소의 조합이 핵심.

## 3요소

| 요소 | 의미 |
|---|---|
| **Certificate** | 개발자 신원 (Development / Distribution) |
| **Provisioning Profile** | "이 인증서로 서명된 앱을 / 이 App ID로 / 이 디바이스에서 / 이 entitlement 가지고 실행 가능" 명세 |
| **Entitlements** | 앱이 사용하는 권한 (Push, iCloud, Keychain access group, App Group 등) |

빌드 시 Xcode가 셋을 조합해 .app에 서명한다.

## Profile 종류

| 종류 | 용도 |
|---|---|
| **Development** | 개발 디바이스에서 실행 (UDID 등록) |
| **Ad Hoc** | 등록된 디바이스에 외부 배포 (TestFlight 이전 단계) |
| **App Store** | App Store 배포 |
| **Enterprise** | 사내 앱 (UDID 등록 없이, 회사 내부) |

## Bundle ID와 매칭

profile은 *App ID* (= Bundle Identifier)와 매칭. wildcard도 가능 (`io.app.*`). 하지만 push, iCloud, App Group 같은 *명시적 capability*는 **explicit App ID** 필요.

## Capabilities

Xcode → Signing & Capabilities → +. 추가하면:
- **Apple Developer 포털의 App ID에 capability 등록**
- **`*.entitlements` 파일에 키 추가**
- **profile 재생성 필요**

자주 쓰는 capability:
- Push Notifications
- App Groups
- Keychain Sharing
- iCloud (CloudKit / Documents)
- Background Modes
- Sign in with Apple
- Associated Domains (Universal Link)

## Automatic vs Manual Signing

| | Automatic | Manual |
|---|---|---|
| 기본 | Xcode가 인증서/profile 자동 관리 | 직접 다운로드/지정 |
| 장점 | 편함 (개발 단계) | CI에서 재현 가능 |
| 단점 | CI에서 충돌 가능 | 관리 비용 |

CI에서는 *manual + fastlane match* 같은 도구로 인증서/profile을 git에 암호화 보관 + 자동 설치 패턴이 표준.

## fastlane match (개념)

```
match repo (git, encrypted) ─┐
                             ├─ CI 머신: match가 keychain/profile 자동 설치
Apple Developer Portal      ─┘
```

팀 전체가 *같은 인증서*를 사용 → "유효한 인증서 없음" 사고를 줄임.

## 흔한 에러와 원인

| 에러 | 보통 원인 |
|---|---|
| `No matching provisioning profiles found` | Bundle ID/팀/capability 불일치, profile 만료 |
| `The executable was signed with invalid entitlements` | entitlements 파일에 있는 권한이 profile에 없음 |
| `Code signing is required for product type 'Application'` | Sign Identity 미설정 |
| `Provisioning profile doesn't include the device` | Development profile에 디바이스 UDID 미등록 |
| `Could not locate device support files` | iOS 버전 SDK 누락 — Xcode 업데이트 |

## 인증서 만료

- **Development cert**: 1년.
- **Distribution cert**: 1년.
- 만료되면 새로 발급 + profile 갱신. *기존 배포된 앱은 영향 없음* (서명 시점의 타임스탬프 사용).

## TestFlight / App Store 배포 흐름

1. Archive (Release config) → .xcarchive 생성
2. Organizer → Validate App
3. Distribute App → App Store Connect
4. ASC에서 빌드 처리 완료 후 TestFlight/심사 제출

## 흔한 함정 / Follow-up

- **Q. 인증서 만료되면 사용자 영향?**
  배포된 앱은 서명 시점의 인증서로 검증. 인증서 만료 후에도 *기 설치된 앱은 계속 동작*. 다만 새 빌드 업로드는 불가.

- **Q. `entitlements`와 `Info.plist`는 다른가?**
  다름. Info.plist는 *메타데이터* (이름, 버전, 사용 권한 설명 등). entitlements는 *시스템 권한 명세*. NSCameraUsageDescription는 plist, App Group identifier는 entitlements.

- **Q. App Group이 안 먹는다.**
  3종 세트 모두 일치해야: Apple Developer 포털 등록, entitlements 키, profile 갱신. 한 군데라도 빠지면 실행 시 권한 거부.

- **Q. Keychain access group 서명 오류?**
  여러 앱(메인 + 익스텐션)이 같은 Keychain을 공유하려면 entitlement에 같은 group identifier. team prefix 자동 부여됨.

- **Q. Push가 dev/prod에서 다르다.**
  APNs 환경이 분리. development profile은 sandbox APNs, distribution은 production APNs. 서버에서 토큰을 환경별로 구분 저장.

- **Q. Universal Link 검증 안 됨.**
  Associated Domains 추가 + 서버에 `apple-app-site-association` 파일. profile/entitlement/서버 셋 다 일치.

## 참고

- Apple Docs: Code Signing, Provisioning
- Apple Developer Portal
- fastlane match 가이드
