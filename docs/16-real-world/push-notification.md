# Push Notification (APNs)

> 한 줄 요약 — **APNs는 Apple이 운영하는 단방향 HTTP/2 게이트웨이**다. 서버가 사용자 기기를 *직접* 깨우는 거의 유일한 합법적 통로이기 때문에, 토큰 관리·payload 설계·실패 회복까지 모두 *Apple이 정한 규칙* 안에서만 가능하다.

도입 버전:
- **서버↔APNs 통신**: APNs provider API는 *HTTP/2 기반*이며 2021년부터 HTTP/2 provider API 사용이 필수화됐다(서버 측 사실, iOS 버전과 무관).
- **앱 측 (iOS 버전)**: UserNotifications 프레임워크 / Notification Service Extension / Notification Content Extension (iOS 10+), Communication Notifications (iOS 15+), Time-Sensitive / Focus (iOS 15+), Live Activities + push update (iOS 16.1+).

## 핵심 개념

- **APNs (Apple Push Notification service)**: Apple이 운영하는 HTTP/2 기반 푸시 게이트웨이. 모든 푸시는 Apple을 거치며, *서버가 디바이스를 직접 호출하지 않는다*.
- **deviceToken**: 앱 + 기기 + APNs 환경(sandbox/prod) 조합으로 발급되는 식별자. *앱을 지우거나 OS를 복원하면 바뀐다*. 따라서 서버 저장 후에도 갱신 경로가 반드시 있어야 한다.
- **Provider 인증**:
  - p8 (Token-based, JWT ES256) — *권장*. 키 하나로 다중 앱·환경 커버, 1시간 단위 JWT 회전.
  - p12 (Certificate-based) — legacy. 1년 만료, 교체 운영 부담.
- **payload 종류**:
  - **alert push**: `aps.alert` 또는 `aps.sound`/`aps.badge` — 사용자에게 표시.
  - **silent push**: `aps.content-available: 1` — 백그라운드 fetch 트리거. throttle 대상.
  - **mutable push**: `aps.mutable-content: 1` — NSE(Notification Service Extension)로 가공.
  - **VoIP / PushKit**: 별도 채널, CallKit 의무 + 잘못 쓰면 앱 종료.
  - **Live Activity push**: `apns-push-type: liveactivity`, ActivityKit 토큰 사용.
- **headers (HTTP/2)**: `apns-push-type` (`alert` / `background` / `voip` / `liveactivity` / `complication`), `apns-priority` (10=즉시, 5=절전), `apns-expiration`, `apns-collapse-id`, `apns-topic` (= bundle id + suffix).

## 동작 흐름 (단계별)

1. 앱 실행 시 `UNUserNotificationCenter.requestAuthorization` → 사용자 동의.
2. `UIApplication.shared.registerForRemoteNotifications()` 호출.
3. 시스템이 APNs와 핸드셰이크 후 `application(_:didRegisterForRemoteNotificationsWithDeviceToken:)` 콜백으로 토큰 반환.
4. 앱이 토큰을 자체 백엔드로 PUT (사용자 ID, 앱 빌드, 로케일, 환경 sandbox/prod 함께).
5. 백엔드가 발송 시 JWT(p8)를 만들어 `POST https://api.push.apple.com/3/device/{token}` (sandbox는 `api.sandbox.push.apple.com`).
6. 디바이스가 페이로드 수신 → `mutable-content`면 NSE가 30초 내 가공 → 시스템이 표시.
7. 사용자가 탭하면 `UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:withCompletionHandler:)`로 라우팅.

## 코드 / 설정 예시

```swift
// 1) 권한 + 등록
let center = UNUserNotificationCenter.current()
center.delegate = self
let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound, .providesAppNotificationSettings])
if granted { await MainActor.run { UIApplication.shared.registerForRemoteNotifications() } }

// 2) 토큰 콜백 (AppDelegate)
func application(_ app: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
    let hex = token.map { String(format: "%02x", $0) }.joined()
    Task { await PushTokenSync.upload(hex, environment: .current) }
}

// 3) Notification Service Extension — 30초 제한
class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttempt: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest,
                             withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttempt = (request.content.mutableCopy() as? UNMutableNotificationContent)
        // 본문 복호화 / 이미지 다운로드 등
        Task {
            do {
                let attachment = try await MediaFetcher.attachment(for: request)
                bestAttempt?.attachments = [attachment]
            } catch {
                bestAttempt?.body = "(미디어 로드 실패) " + (bestAttempt?.body ?? "")
            }
            contentHandler(bestAttempt ?? request.content)
        }
    }

    override func serviceExtensionTimeWillExpire() {
        // 30초 임박 — 가공 실패해도 원본은 표시해야 한다.
        if let bestAttempt { contentHandler?(bestAttempt) }
    }
}
```

```json
// 4) Rich payload + 그룹화 + 시간 민감
{
  "aps": {
    "alert": { "title": "새 메시지", "body": "민지가 사진을 보냈어요" },
    "sound": "default",
    "thread-id": "chat-1832",          // 그룹화 키
    "interruption-level": "time-sensitive",
    "relevance-score": 0.8,
    "mutable-content": 1,
    "category": "MESSAGE_CATEGORY"
  },
  "media-url": "https://cdn.example.com/p/12.jpg",
  "deeplink": "myapp://chat/1832"
}
```

## 보안 / 함정

- **토큰은 PII가 아니지만 추적 식별자**다. 서버에는 *사용자 ID와 분리된 테이블*에 저장하고, 로그아웃 시 즉시 무효화.
- **payload는 평문**으로 APNs를 통과한다. 민감 정보는 *알림 본문에 직접 넣지 말고* `mutable-content`로 NSE에서 끌어오라 (E2E 채팅 등).
- **silent push throttle**: Apple이 *시간당 2~3건* 수준으로 제한. 백그라운드 동기화에만 쓰고, *연속 발사하면 조용히 폐기*된다.
- **deviceToken 만료/회전**: `registerForRemoteNotifications`는 *매 앱 실행마다* 호출하라. Apple도 토큰이 바뀌면 *예고 없이* 새 콜백을 준다.
- **환경 분리**: TestFlight는 *production* APNs를 쓴다. *Debug 빌드만* sandbox. 토큰을 서버에 올릴 때 환경 태그를 같이 보내지 않으면 `BadDeviceToken`이 무한 발생.
- **`apns-priority: 10` 남용**: 배터리 영향으로 Apple이 throttle. 광고성은 5로.

## 흔한 함정 / Follow-up

- **Q. silent push로 백그라운드에서 큰 작업을 돌릴 수 있나?**
  - A. 못 한다. 30초 제한 + 시스템이 throttle. 큰 작업은 silent push로 *깨우고* `BGProcessingTask`를 예약하는 패턴.
- **Q. 알림을 받았는데 앱이 안 깨어난다.**
  - A. (1) `content-available: 1`이 정확히 숫자 1인가 (문자열 "1"이면 무시), (2) priority 5 권장, (3) 사용자가 저전력 모드/Focus, (4) 최근 너무 자주 보내서 throttle, (5) Background Modes의 *Remote notifications* 체크 누락.
- **Q. NSE에서 복호화가 30초를 초과하면?**
  - A. `serviceExtensionTimeWillExpire`에서 원본을 그대로 표시. 본문에 *재시도 안내* 또는 *암호화된 placeholder*를 두는 게 정석.
- **Q. 동일 채팅방 알림을 묶고 싶다.**
  - A. payload의 `thread-id`. 추가로 `summaryArgument`/`summaryArgumentCount`로 "외 3건" 표시.
- **Q. APNs 응답 코드 400 `BadDeviceToken`이 폭증한다.**
  - A. 거의 100% sandbox/prod 환경 혼동. p8은 환경 무관이지만 *토큰 자체*는 환경별로 다르다.
- **Q. Live Activity 푸시 업데이트는 일반 푸시와 뭐가 다른가?**
  - A. `apns-push-type: liveactivity`, ActivityKit이 발급한 push token (deviceToken 아님), payload는 `content-state` 등 ActivityKit 스키마.

## 참고

- WWDC 2020 — *Push Notifications: a primer to deep integration*
- WWDC 2021 — *Send communication and Time Sensitive notifications*
- WWDC 2023 — *Update Live Activities with push notifications*
- Apple Docs: *Setting Up a Remote Notification Server*, *UNNotificationServiceExtension*
- APNs HTTP/2 spec: developer.apple.com / "Sending notification requests to APNs"
