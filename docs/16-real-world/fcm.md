# Firebase Cloud Messaging (FCM)

> 한 줄 요약 — **FCM은 APNs를 감싸는 *서버 사이 어댑터***. iOS에서는 결국 *Apple의 APNs를 통과해야* 사용자 기기까지 도달하므로 FCM이 마법처럼 APNs를 대체하는 것이 아니라, **토큰 추상화 + 멀티플랫폼 SDK + Topic·Segment 발송 + 분석**을 얹어주는 레이어다.

도입 버전:
- **iOS**: APNs와 동일 (iOS 10+ UserNotifications 프레임워크 기반).
- **Firebase iOS SDK**: 현재 v10+ (Swift Package Manager 권장).
- **FCM HTTP v1 API**: 2024년부터 *legacy HTTP / XMPP 종료* — `https://fcm.googleapis.com/v1/projects/{project}/messages:send` 만 사용 가능, OAuth 2.0 서비스 계정 토큰 필수.

## APNs vs FCM 한눈에

| 축 | APNs | FCM |
| --- | --- | --- |
| 운영 주체 | Apple | Google (Firebase) |
| iOS 최종 채널 | **APNs 자체** | **APNs 경유** (FCM이 우회 못 함) |
| Android 도달 | X (Apple 전용) | O (FCM의 본 영역) |
| 토큰 | `deviceToken` (앱+기기+환경) | **FCM registration token** (앱 인스턴스 기준) |
| 인증 | p8 JWT / p12 인증서 | **OAuth 2.0 서비스 계정** + APNs 키(p8) 업로드 |
| 발송 모델 | 토큰별 1건씩 | 토큰 / **Topic** / **Condition** / **Multicast** (최대 500토큰/요청) |
| 페이로드 한도 | 4KB (alert) / 5KB (VoIP) | 4KB (iOS 경유 시 APNs 한도에 종속) |
| 분석 | 자체 없음 | **delivery / open rate** 자동 수집 |
| 비용 | 무료 | 무료 (Spark 플랜에서도) |

→ "FCM이 APNs를 대체하나?" → **아니다**. iOS는 *반드시 APNs를 통과*. FCM은 그 위에 멀티플랫폼 추상화·발송 옵션·분석을 얹는 *발송 측 편의 레이어*.

## 동작 흐름 (단계별)

```
[앱]                         [FCM SDK]            [FCM 서버]      [APNs]        [디바이스]
  │                              │                   │              │              │
  │ requestAuthorization         │                   │              │              │
  ├─────────────────────────────►│                   │              │              │
  │ registerForRemoteNotifications                   │              │              │
  ├──────────────────────────────────────────────────────────────────►              │
  │◄──── APNs deviceToken 콜백 ──────────────────────────────────────              │
  │                              │                   │              │              │
  │ Messaging.apnsToken = data   │                   │              │              │
  ├─────────────────────────────►│                   │              │              │
  │                              │ token 교환        │              │              │
  │                              ├──────────────────►│              │              │
  │◄──── messaging:didReceiveRegistrationToken: ─────│              │              │
  │                              │                   │              │              │
  │ FCM token을 자체 서버에 PUT  │                   │              │              │
  │                              │                   │              │              │
  │                              │       서버가 발송 요청          │              │
  │                              │                   │◄── send(token, payload) ── 서버
  │                              │                   │              │              │
  │                              │                   ├─APNs 전달──►│              │
  │                              │                   │              ├──── 푸시 ──►│
  │                              │                   │              │              │ 표시
```

핵심: **FCM token ≠ APNs deviceToken**. FCM은 *자기 토큰*을 발급해서 서버에 저장하게 하고, 내부적으로 APNs deviceToken과 매핑한다.

## 핵심 개념 6선

### 1. FCM Registration Token
- 앱 *설치 인스턴스 단위*로 발급. 같은 사용자가 기기 2대면 토큰 2개.
- 회전 시점: 앱 재설치, 데이터 삭제, OS 복원, **장기간 미사용**(180일), 보안 사유.
- **`Messaging.messaging().delegate`**의 `messaging(_:didReceiveRegistrationToken:)`에서 받음. **매 launch마다** 최신값 서버에 동기화.
- 면접 단골: "FCM token과 APNs deviceToken을 같이 저장하나?" → 서버는 *FCM token 하나만 알면 됨*. APNs token은 FCM이 알아서 관리.

### 2. Notification Message vs Data Message
| 종류 | 페이로드 키 | 동작 (iOS) |
| --- | --- | --- |
| **Notification** | `"notification": { "title", "body" }` | FCM이 APNs `aps.alert` 자동 매핑, 백그라운드면 시스템이 표시 |
| **Data-only** | `"data": { ... }` (커스텀 키) | iOS는 *background fetch* 처럼 동작 — `content-available: 1` 필요 |
| **Hybrid** | 둘 다 | 시스템 표시 + 앱이 data 추출 |

→ iOS 함정: **data-only**는 silent push 규칙(throttle, `apns-priority: 5`)을 따른다. 광고성 알림을 data-only로 보내면 *조용히 폐기*된다.

### 3. Topic / Condition / Multicast 발송
- **Topic**: 토큰 대신 토픽 이름(`/topics/news_kr`)으로 발송. 클라이언트가 `Messaging.messaging().subscribe(toTopic:)`로 구독.
- **Condition**: 불리언 조합 (`'kr' in topics && 'sports' in topics`).
- **Multicast / Batch**: 한 요청에 최대 **500 토큰**. 응답에 토큰별 성공/실패.
- 함정: Topic은 *최대 약 5초* 지연 가능. 즉시성이 중요하면 token 발송.

### 4. iOS 통합 단계
```
1. Firebase 콘솔에서 iOS 앱 등록 → GoogleService-Info.plist 다운로드
2. Apple Developer에 APNs 인증 키 (p8) 만들기 → Firebase 콘솔 > Project Settings > Cloud Messaging에 업로드
3. SPM으로 firebase-ios-sdk 추가 → FirebaseMessaging product
4. AppDelegate에서:
   FirebaseApp.configure()
   Messaging.messaging().delegate = self
   UNUserNotificationCenter.current().delegate = self
5. 권한 요청 + registerForRemoteNotifications()
6. didRegisterForRemoteNotificationsWithDeviceToken에서:
   Messaging.messaging().apnsToken = deviceToken (수동 모드일 때)
7. MessagingDelegate.messaging(_:didReceiveRegistrationToken:)에서 FCM token 수신
```

함정:
- **APNs 키(p8) 업로드 누락** → FCM token은 발급되지만 실제 발송이 안 됨. 콘솔 발송 테스트로 확인.
- **Method Swizzling**: 기본 켜짐 — Firebase가 `application(_:didReceiveRemoteNotification:)` 등을 swizzle한다. `Info.plist`의 `FirebaseAppDelegateProxyEnabled = NO`로 끄고 수동 연결 가능 (다른 SDK와 충돌하면).

### 5. APNs 환경 (Sandbox / Production) 처리
- FCM은 **자동 감지**(`Messaging.messaging().apnsToken(_:type:)`로 명시 가능: `.sandbox` / `.prod` / `.unknown`).
- Debug 빌드 = sandbox, TestFlight/App Store = production. 환경이 안 맞으면 *invalid token* 폭증.
- 면접 단골: "TestFlight 빌드에서 알림이 안 와요" → 환경 불일치, p8 키 환경 매핑, *Sandbox APNs 인증서*를 Firebase에 잘못 등록.

### 6. 분석 / Delivery Tracking
- FCM SDK가 자동 수집: **delivery**, **open** (notification message 한정), **conversion**.
- Firebase Analytics와 연동되면 사용자 세그먼트 + 푸시 효과 측정.
- **Data-only**는 자동 추적 X — 직접 이벤트 로깅해야.
- 한계: Apple privacy 정책으로 *display ≠ delivery* — 사용자가 실제 봤는지는 불확실.

## 발송 API (HTTP v1)

```http
POST /v1/projects/MY_PROJECT/messages:send HTTP/2
Host: fcm.googleapis.com
Authorization: Bearer ya29.OAuth2_access_token
Content-Type: application/json

{
  "message": {
    "token": "FCM_REGISTRATION_TOKEN",
    "notification": { "title": "새 메시지", "body": "민지가 사진을 보냈어요" },
    "data": { "chatId": "1832", "deeplink": "myapp://chat/1832" },
    "apns": {
      "headers": {
        "apns-priority": "10",
        "apns-push-type": "alert",
        "apns-collapse-id": "chat-1832"
      },
      "payload": {
        "aps": {
          "alert": { "title": "새 메시지", "body": "민지가 사진을 보냈어요" },
          "sound": "default",
          "thread-id": "chat-1832",
          "interruption-level": "time-sensitive",
          "mutable-content": 1,
          "category": "MESSAGE_CATEGORY"
        }
      }
    }
  }
}
```

핵심:
- `apns.headers` 와 `apns.payload`로 **APNs 원본 옵션을 그대로 노출**. FCM은 iOS 도달 시 이걸 통째로 APNs에 전달.
- `notification` + `apns.payload.aps.alert`이 둘 다 있으면 **`apns`가 우선**.

## 코드 예시

```swift
// AppDelegate
import FirebaseCore
import FirebaseMessaging
import UserNotifications

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication,
                     didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self
        Task {
            let granted = try? await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            if granted == true {
                await MainActor.run { UIApplication.shared.registerForRemoteNotifications() }
            }
        }
        return true
    }

    // APNs token → FCM (swizzling을 끈 경우에만 필요)
    func application(_ app: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        Messaging.messaging().apnsToken = token
    }
}

extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken else { return }
        Task { await PushTokenSync.upload(fcm: fcmToken) }
    }
}
```

## 보안 / 함정

- **FCM token도 *준 식별자***. 서버에는 사용자 ID와 분리된 테이블에 저장, 로그아웃 시 즉시 *서버에서 삭제* + 가능하면 `Messaging.messaging().deleteToken()` 호출.
- **payload는 평문**. APNs와 동일 — 민감 정보는 `mutable-content: 1` + NSE에서 끌어와라.
- **레거시 server key (AAA...) 사용 금지**. 2024년 이후 HTTP v1 + OAuth만 작동. 노출되면 즉시 회전.
- **`GoogleService-Info.plist`** 는 *공개돼도 치명적이지 않다*(클라이언트 식별자). 단, 발송용 서버 키는 절대 클라이언트에 두지 말 것.
- **swizzling 끄기**: Branch / OneSignal / Adjust 등 다른 SDK와 동시 사용 시 충돌. `FirebaseAppDelegateProxyEnabled = NO` + 수동 hook으로 명확화.
- **multi-tenant** 발송: 같은 사용자가 *환경별로 다른 토큰*. 환경 태그(`sandbox`/`prod`)를 함께 저장.

## 흔한 함정 / Follow-up

- **Q. FCM token이 왜 갑자기 바뀌나?**
  - A. (1) 앱 재설치 / 데이터 삭제, (2) 180일 미사용으로 서버가 만료, (3) `deleteToken()` 호출, (4) GoogleService-Info.plist 변경 (project ID 바뀜), (5) 보안 정책상 강제 회전.
- **Q. FCM 콘솔 발송은 되는데 서버 발송이 안 된다.**
  - A. 거의 OAuth 토큰 만료(1시간). 서비스 계정 JSON으로 *매 요청 직전* access token 발급해라. 캐시는 50분 정도까지.
- **Q. iOS는 FCM 안 쓰고 APNs 직접 쓰면 안 되나?**
  - A. 된다. iOS only면 APNs 직접이 *간결+빠르다* (FCM 대기열 우회). FCM 선택 이유는 *Android와 SDK 통합*, *Topic 발송*, *분석*.
- **Q. Topic 발송이 즉시 도착하지 않는다.**
  - A. Topic은 *fan-out 큐*. 수십만 구독 시 분 단위 지연 가능. 즉시성 필요하면 token 발송 + batch.
- **Q. data-only 메시지가 백그라운드에서 안 깨운다.**
  - A. `apns.payload.aps.content-available: 1` + `apns-push-type: background` + `apns-priority: 5` 필요. silent throttle도 적용.
- **Q. SwiftUI App lifecycle인데 AppDelegate 없이 가능?**
  - A. `@UIApplicationDelegateAdaptor`로 AppDelegate를 SwiftUI App에 붙이거나, Scene phase에서 핸들링. Firebase는 AppDelegate 패턴이 가장 검증됨.

## APNs vs FCM 선택 기준

```
iOS only, 트래픽 작음, 단순 token 발송       → APNs 직접 (p8 + HTTP/2)
iOS + Android, 통합 SDK / 코드 재사용         → FCM
Topic / Segment / Condition 발송 필요         → FCM
delivery / open rate 분석 자동화 필요         → FCM
이미 Firebase Analytics 사용 중                → FCM
인증서 운영 부담 줄이기 (APNs p8 한 번 업로드) → FCM
지연 민감한 실시간 (채팅 ping)                → APNs 직접 권장
```

## 관련

- APNs 자체의 구조·payload·NSE → [push-notification.md](push-notification.md)
- 토큰을 어디에 저장? → [../08-persistence/keychain.md](../08-persistence/keychain.md) (FCM token은 Keychain이 아닌 평범 서버 DB; 단 *사용자 ID 매핑*은 보안 정책에 따라)
- HTTP/2 / TLS → [../14-network/http2-http3.md](../14-network/http2-http3.md)
- Method swizzling 충돌 → [../17-objective-c/runtime.md](../17-objective-c/runtime.md)
- Background Mode + BGTaskScheduler → silent push와 함께 묶임

## 참고

- Firebase Docs — *Set up a Firebase Cloud Messaging client app on Apple platforms*
- Firebase Docs — *Send messages to multiple devices* (Topic / Condition / Multicast)
- Google Cloud — *FCM HTTP v1 API* (OAuth 2.0 서비스 계정)
- Apple Docs — *Setting Up a Remote Notification Server* (APNs HTTP/2)
- 2023년 변경: legacy HTTP / XMPP API 종료 공지 (Google)
