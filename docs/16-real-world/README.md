# 16. Real-World iOS

> 한 줄 요약 — Real-World 토픽 (푸시·딥링크·feature flag·i18n·접근성) 의 공통 골격은 **외부 시스템 의존 + 사용자 시점의 실패 + 점진 출시·롤백**. 행복 경로보다 *실패 경로와 회복 전략*을 답해야 시니어 답변.

실무 구현에서 자주 등장하는 토픽. 면접 *깊이 변별점*은 *왜 이 설정* / *어떤 보안 모델* / *어떤 측정* 세 가지다. 단순히 "구현해 봤다"가 아니라 **실패 경로와 회복 전략**을 설명할 수 있어야 시니어 답변이 된다.

## 공통 골격

| 축 | 질문 |
| --- | --- |
| **외부 시스템 의존** | APNs / Universal Link (AASA) / Remote Config 백엔드 / 로케일 카탈로그 / 시스템 접근성 API |
| **실패 시점** | 토큰 등록 실패 / AASA 미배포 / config 첫 fetch 비어있음 / 번역 누락 / VoiceOver 미지원 |
| **회복 전략** | 재등록 / fallback URL / 캐시 기본값 / 키 그대로 표시 / 텍스트 라벨 보강 |
| **측정** | 알림 도달률 / 링크 전환율 / flag 분포 / 누락 키 로그 / accessibility audit |
| **점진 출시·롤백** | flag로 단계 노출, 충돌·메트릭 폭증 시 즉시 off |

## 핵심 개념 5선

### 1. Push Notification (APNs)
- **deviceToken**: 앱 launch 시 등록, 서버에 저장. 변할 수 있으므로 *매 launch 갱신* 권장.
- **silent push** (`content-available:1`): 화면 알림 없이 앱 깨움. BG fetch와 함께 데이터 동기화.
- **Notification Service Extension** (NSE): 도착 직전 30초 안에 *복호화·미디어 첨부* 가능.
- 실패 경로: deviceToken 변경 + 서버 갱신 누락, NSE 30초 초과, payload 4KB 초과.

### 2. Deep Linking & Universal Links
- **Custom URL scheme**: `myapp://...` — 가로채기 가능, 보안 약함.
- **Universal Links**: `https://...` + **AASA** 파일(`.well-known/apple-app-site-association`) 검증. 사파리에서 *바로 앱*. iOS가 도메인 소유권 확인.
- 함정: AASA의 *CDN 캐시*가 오래되어 안 열림, 사용자가 *사파리에서 길게 눌러 새 탭*으로 열기, 앱 미설치 시 fallback 페이지.

### 3. Feature Flag / Remote Config
- 코드 배포 없이 *기능 on/off*. 점진 출시 (1% → 10% → 100%), A/B 테스트.
- **fetch + activate** 분리: 다음 launch에 활성화하는 패턴이 안전.
- **kill switch**: 메트릭 폭증 시 즉시 off. 단, 첫 fetch 전 상태도 UI가 정상 동작해야.
- 함정: first launch에서 flag 비어있음, 캐시 만료 정책, 캐시 무효화로 인한 깜빡임.

### 4. Localization & i18n
- iOS 17+ **String Catalogs** (`.xcstrings`) — `Localizable.strings`/`.stringsdict` 통합 + 자동 추출.
- **Pluralization**: 언어별 복수형 규칙 (영어 2개 vs 아랍어 6개). `.stringsdict` 또는 catalog 사용.
- **RTL** (아랍어·히브리어): leading/trailing 사용 (left/right 금지), `semanticContentAttribute`.
- **Dynamic Type**: 사용자 텍스트 크기 — 폰트는 반드시 system 스타일(`UIFont.preferredFont`) 기반.

### 5. Accessibility
- **VoiceOver**: 화면 읽기. 라벨/힌트/role을 명시. 그룹화로 탐색 최소화.
- **Switch Control**, **Voice Control**: 입력 보조. focusable 영역, 의미 있는 이름.
- **Reduce Motion**: 애니메이션 줄이기. `UIAccessibility.isReduceMotionEnabled` 체크.
- **Dynamic Type** 무시한 디자인 시스템 = 큰 글씨에서 깨짐.
- 테스트 자동화: Accessibility Inspector audit, XCUITest의 accessibility identifiers.

## 행복 경로 vs 실패 경로

```
행복 경로                          실패 경로 (면접 변별점)
─────────────────────────────────────────────────────────────
APNs 등록 → 알림 도착             token 변경 / silent push 미수신
Universal Link 탭 → 앱 열림        AASA 캐시 / 미설치 fallback
Remote config fetch → flag 적용   첫 fetch 전 UI / kill switch
번역 표시                         번역 누락 / pluralization 깨짐
VoiceOver 동작                    라벨 누락 / 그룹화 X
```

→ 답변 시 *행복 경로는 1줄로 압축*, *실패 + 회복 + 측정* 을 본체로.

## 항목

- [Push Notification (APNs)](push-notification.md) — APNs 구조, deviceToken 등록, silent push, NSE, rich notification, 그룹화
- [Deep Linking & Universal Links](deep-linking-and-universal-links.md) — URL scheme vs Universal Links, AASA, 라우팅 설계, 보안
- [Feature Flag / Remote Config](feature-flag-and-remote-config.md) — flag 패턴, A/B 테스트, 원격 설정 캐시 전략, 점진 출시
- [Localization & i18n](localization-and-i18n.md) — String Catalogs (iOS 17+), pluralization, RTL, Dynamic Type, 포맷터
- [Accessibility](accessibility.md) — VoiceOver, Dynamic Type, Switch Control, Reduce Motion, 테스트 자동화

## 관련 (다른 디렉토리)

- 백그라운드 처리, BGTaskScheduler → silent push와 함께 묶임
- 보안 토큰 저장 → [08-persistence/keychain.md](../08-persistence/keychain.md)
- A/B 테스트의 측정 지표 → [10-performance](../10-performance/README.md)

## 자주 묻는 질문

### 주니어

- APNs deviceToken은 언제, 어디서 받아서 어디에 저장하나? → [push-notification.md](push-notification.md)
- Custom URL scheme과 Universal Links의 차이는? → [deep-linking-and-universal-links.md](deep-linking-and-universal-links.md)
- `Localizable.strings`와 String Catalogs의 차이는? → [localization-and-i18n.md](localization-and-i18n.md)
- VoiceOver를 켰을 때 가장 먼저 점검할 점은? → [accessibility.md](accessibility.md)

### 미들

- silent push를 받았는데 앱이 깨어나지 않을 때 의심할 곳은? → [push-notification.md](push-notification.md)
- Universal Links가 사파리에서 열리는 문제, 원인 5가지는? → [deep-linking-and-universal-links.md](deep-linking-and-universal-links.md)
- Remote Config의 첫 fetch가 비어 있는 동안 UI를 어떻게 다루나? → [feature-flag-and-remote-config.md](feature-flag-and-remote-config.md)
- pluralization을 `stringsdict` 없이 처리하면 왜 깨지나? → [localization-and-i18n.md](localization-and-i18n.md)
- Dynamic Type을 무시한 디자인 시스템의 문제는? → [accessibility.md](accessibility.md)

### 시니어

- Notification Service Extension의 30초 제약 안에서 미디어/복호화를 어떻게 설계하나? → [push-notification.md](push-notification.md)
- AASA 캐시 무효화와 점진 출시 전략 → [deep-linking-and-universal-links.md](deep-linking-and-universal-links.md)
- 점진 출시(canary) 중인 flag가 충돌 폭증을 일으킬 때 즉시 롤백을 어떻게 보장하나? → [feature-flag-and-remote-config.md](feature-flag-and-remote-config.md)
- RTL/Dynamic Type/Pluralization 자동 회귀 테스트 전략 → [localization-and-i18n.md](localization-and-i18n.md) + [accessibility.md](accessibility.md)
- 접근성을 CI에서 어떻게 측정하고 회귀를 막나? → [accessibility.md](accessibility.md)
