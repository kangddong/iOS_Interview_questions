# 16. Real-World iOS

실무 구현에서 자주 등장하는 토픽. 면접 *깊이 변별점*은 *왜 이 설정* / *어떤 보안 모델* / *어떤 측정* 세 가지다. 단순히 "구현해 봤다"가 아니라 **실패 경로와 회복 전략**을 설명할 수 있어야 시니어 답변이 된다.

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
