import SwiftUI

struct AccessibilityDemo: Demo {
    static let id = "real.accessibility"
    static let title = "Accessibility"
    static let summary = "VoiceOver, Dynamic Type, Reduce Motion, Color contrast 등 OS 보조 기능."
    static let docPath = "docs/16-real-world/accessibility.md"
    static func makeView() -> some View {
        VStack(spacing: 16) {
            Image(systemName: "star.fill")
                .resizable().frame(width: 80, height: 80)
                .foregroundStyle(.tint)
                .accessibilityLabel("즐겨찾기")
                .accessibilityHint("이 화면을 즐겨찾기에 추가합니다")
            Text("VoiceOver를 켜고 별을 탭해보세요").foregroundStyle(.secondary)
            Button("동적 폰트 라벨") { }
                .font(.body)               // dynamic type 자동 반영
                .buttonStyle(.borderedProminent)
        }
    }
}

struct DeepLinkingDemo: Demo {
    static let id = "real.deep-linking"
    static let title = "Deep Linking / Universal Links"
    static let summary = "Custom scheme(앱 전용) vs Universal Link(https + apple-app-site-association)."
    static let docPath = "docs/16-real-world/deep-linking-and-universal-links.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Info.plist의 CFBundleURLTypes로 myapp:// 등록 (Custom Scheme)",
            "Universal Link: https URL을 직접 앱이 처리 — apple-app-site-association 서버에 호스팅",
            "SceneDelegate scene(_:openURLContexts:) 또는 onOpenURL에서 처리",
            "Continue activity는 NSUserActivity로 들어옴 (universal link 경로)",
        ])
    }
}

struct FCMDemo: Demo {
    static let id = "real.fcm"
    static let title = "Firebase Cloud Messaging (FCM)"
    static let summary = "FCM SDK → APNs 위에 토픽/조건 기반 발송 추상. 토픽 sub/unsub."
    static let docPath = "docs/16-real-world/fcm.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "iOS는 결국 APNs를 통하지만, 발송 측은 FCM API 한 곳에서 다중 플랫폼 송신",
            "토픽: Messaging.messaging().subscribe(toTopic:) — 1:N 브로드캐스트",
            "조건식: 'news' in topics && 'kr' in topics 같이 결합",
            "Server: HTTP v1 API (OAuth2 service account) 또는 admin SDK",
        ])
    }
}

struct FeatureFlagDemo: Demo {
    static let id = "real.feature-flag"
    static let title = "Feature Flag / Remote Config"
    static let summary = "코드와 배포를 분리. 사용자 그룹별 점진 노출, 즉시 롤백."
    static let docPath = "docs/16-real-world/feature-flag-and-remote-config.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Firebase Remote Config, Unleash, LaunchDarkly 등",
            "Default in app + 원격 override + fetch & activate 흐름",
            "사용자 속성 기반 분할 노출, A/B 테스트",
            "Kill switch: 문제 발생 시 즉시 off",
        ])
    }
}

struct LocalizationDemo: Demo {
    static let id = "real.localization"
    static let title = "Localization & i18n"
    static let summary = "Localizable.strings/.stringsdict, String Catalog, formatter (date/number/measure)."
    static let docPath = "docs/16-real-world/localization-and-i18n.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let n = 12345.678
            let nf = NumberFormatter(); nf.numberStyle = .decimal
            nf.locale = Locale(identifier: "ko_KR")
            log.log("ko_KR → \(nf.string(from: NSNumber(value: n))!)")
            nf.locale = Locale(identifier: "en_US")
            log.log("en_US → \(nf.string(from: NSNumber(value: n))!)")
            let date = Date()
            let df = DateFormatter(); df.dateStyle = .long; df.timeStyle = .short
            df.locale = Locale(identifier: "ja_JP")
            log.log("ja_JP → \(df.string(from: date))")
        }
    }
}

struct PushNotificationDemo: Demo {
    static let id = "real.push-notification"
    static let title = "Push Notification"
    static let summary = "APNs. registerForRemoteNotifications + UNUserNotificationCenter delegate."
    static let docPath = "docs/16-real-world/push-notification.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "권한 요청 + APNs device token 등록 → 서버 저장",
            "Foreground는 willPresent, 탭은 didReceive response 콜백",
            "Rich notification: Notification Service Extension에서 페이로드 변형",
            "Silent push(content-available)는 백그라운드 fetch trigger",
        ])
    }
}
