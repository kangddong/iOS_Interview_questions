# Deep Linking & Universal Links

> 한 줄 요약 — **딥링크는 "특정 화면으로 직접 이동시키는 URL"이고, Universal Links는 그것을 *웹 URL과 동일한 형태로* 안전하게 만든 Apple의 표준**이다. URL scheme은 *누구나 등록 가능*해서 가로채기 공격이 가능하지만, Universal Links는 *서버가 소유권을 증명*해야 작동한다.

도입 버전: Custom URL scheme (iOS 2+), Universal Links (iOS 9+), Alternate App Mode (iOS 11+), AASA on default file path (iOS 13+), App Clips invocation (iOS 14+)

## 핵심 개념

- **Custom URL scheme** (`myapp://`)
  - Info.plist `CFBundleURLTypes`에 등록.
  - *어떤 앱이든 같은 scheme을 등록*할 수 있어 가로채기 위험. iOS는 마지막 설치 앱 우선이 *아니라 불확정*.
  - 보내는 쪽도 `LSApplicationQueriesSchemes` 등록 필요.
- **Universal Links** (`https://example.com/...`)
  - 동일 URL이 *앱 미설치면 웹*, *설치되어 있으면 앱*으로 라우팅.
  - 작동 조건 세 가지가 모두 충족돼야 함:
    1. `apple-app-site-association` (AASA) 파일이 `https://example.com/.well-known/apple-app-site-association`에 호스팅 (Content-Type `application/json`, *서명 불필요* iOS 13+).
    2. Xcode `Associated Domains` capability에 `applinks:example.com` (선택 `?mode=developer`로 sandbox).
    3. 사용자가 *앱 내에서가 아닌* 외부에서 링크를 탭 (Safari 주소창에 직접 입력 시 fallback).
- **AASA 구조**:
  ```json
  {
    "applinks": {
      "details": [{
        "appIDs": ["TEAMID.com.example.app"],
        "components": [
          { "/": "/product/*", "comment": "상세 화면" },
          { "/": "/admin/*", "exclude": true }
        ]
      }]
    }
  }
  ```
- **Apple CDN 캐시**: iOS 14+ AASA는 Apple CDN(`app-site-association.cdn-apple.com`)이 *24시간~며칠* 캐시. 즉시 반영 불가.

## 동작 흐름 (단계별)

### Universal Link 콜드 스타트
1. 사용자가 외부에서 `https://example.com/product/42` 탭.
2. iOS가 *설치된 앱의 entitlement*와 *Apple CDN에 캐시된 AASA*를 비교.
3. 매치되면 앱을 launch 하고 `application(_:continue:restorationHandler:)` 호출 (`NSUserActivityTypeBrowsingWeb`).
4. 라우터가 path를 파싱해 화면 스택을 구성.
5. 매치 안 되면 Safari가 URL을 그대로 연다 → 웹 fallback이 필요.

### 백그라운드(앱 실행 중)
- 같은 콜백을 받지만 *기존 네비게이션 상태*와 충돌. 라우터는 *현재 스택을 어디까지 유지할지* 정책이 있어야 함.

### SwiftUI
- `.onOpenURL { url in ... }` 또는 `.onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { ... }`.

## 코드 / 설정 예시

```swift
// AppDelegate / Scene
func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else { return }
    Router.shared.handle(url: url, source: .universalLink)
}

// SwiftUI
ContentView()
    .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
        if let url = activity.webpageURL { Router.shared.handle(url: url, source: .universalLink) }
    }
    .onOpenURL { url in Router.shared.handle(url: url, source: .customScheme) }
```

```swift
// 라우터 — 화이트리스트 기반 매칭
enum Route { case product(id: String), profile(handle: String), unknown }

struct Router {
    static let shared = Router()

    func handle(url: URL, source: Source) {
        guard let route = parse(url), case .unknown = route else {
            return fallback(url, source: source)
        }
        // 백그라운드면 push, 콜드면 root 교체
        Navigator.shared.go(route, replacingRoot: !UIApplication.shared.isAppActive)
    }

    private func parse(_ url: URL) -> Route? {
        let segments = url.pathComponents.filter { $0 != "/" }
        switch segments.first {
        case "product": return segments.count > 1 ? .product(id: segments[1]) : nil
        case "u":       return segments.count > 1 ? .profile(handle: segments[1]) : nil
        default:        return .unknown
        }
    }
}
```

```json
// /.well-known/apple-app-site-association — 점진 출시
{
  "applinks": {
    "details": [{
      "appIDs": ["TEAMID.com.example.app"],
      "components": [
        { "/": "/product/*" },
        { "/": "/checkout/*", "?": { "ab": "v2" } },
        { "/": "/admin/*", "exclude": true },
        { "/": "/legacy/*", "exclude": true }
      ]
    }]
  }
}
```

## 보안 / 함정

- **scheme 가로채기**: 결제 콜백을 `myapp://pay/result`로 받으면 동일 scheme을 등록한 악성 앱이 가로챌 수 있음. 콜백은 *Universal Links + state nonce + 서명*으로.
- **AASA 캐시 무효화**: Apple CDN 캐시가 길어서 *오프라인 변경은 즉시 반영되지 않는다*. 개발자 모드(`?mode=developer`)로 우회 가능, 점진 출시는 *path 단위 components*로.
- **state/nonce 검증**: OAuth/결제 콜백은 *URL만 신뢰하지 말고* 세션에 저장된 nonce와 매칭. 그렇지 않으면 phishing 링크로 임의 라우팅 가능.
- **백그라운드 라우팅**: 사용자가 결제 진행 중인데 푸시 딥링크로 다른 화면이 끼면 결제 컨텍스트 손실. *현재 modal이 dismiss 가능한지* 라우터가 정책으로 결정.
- **딥링크 attribution**: 광고 SDK가 `myapp://?campaign=...` 식으로 *clipboard*를 읽던 시기는 끝났다 (iOS 14+ 알림). UTM은 Universal Link query로.
- **App Store 링크 fallback**: 미설치 사용자에게 *웹 동등 페이지*가 보장돼야 한다. 그래서 동일 URL이 *웹에서도 의미가 있어야* 한다는 게 Universal Links의 본질.

## 흔한 함정 / Follow-up

- **Q. Universal Link가 Safari에서만 열리고 앱으로 안 간다.**
  - A. (1) 사용자가 *앱 내에서 long-press → "Open in App"으로 켜야 정상*인 상태일 수 있음 (한 번 거부하면 토글 OFF), (2) AASA 미스, (3) 같은 도메인의 다른 링크에서 이미 Safari를 선택했음, (4) Associated Domains entitlement 누락, (5) AASA Content-Type이 `text/html`.
- **Q. AASA를 바꿨는데 반영이 안 된다.**
  - A. Apple CDN 캐시. 개발자 모드(`?mode=developer` 추가 + Settings → Developer → Universal Links) 또는 앱 재설치로 강제 갱신.
- **Q. Custom URL scheme이 여전히 필요한 경우는?**
  - A. (1) 다른 앱과의 IPC(예: 결제 SDK 콜백), (2) Universal Link를 차단하는 환경(특정 in-app 브라우저), (3) 사내 도구. 단 보안 민감 작업은 *반드시 추가 검증* 필요.
- **Q. 한 URL이 여러 경로로 해석될 수 있다 (정규화).**
  - A. 라우터에서 *trailing slash / 대소문자 / query 정렬*을 정규화. 서버와 동일 규칙을 공유해야 attribution이 깨지지 않음.
- **Q. 콜드 스타트에서 딥링크 처리가 한 박자 늦다.**
  - A. SwiftUI `App` 초기화는 끝났지만 *데이터 store가 준비되기 전*. Router에 *pending route 큐*를 두고 store ready 시 flush.
- **Q. App Clip과 본앱이 같은 URL을 두고 다툰다.**
  - A. AASA의 `appclips` 키로 invocation URL을 별도 화이트리스트.

## 참고

- WWDC 2020 — *What's new in Universal Links*
- WWDC 2019 — *Supporting Associated Domains*
- Apple Docs: *Supporting Universal Links in Your App*, *Defining a Custom URL Scheme*
- Apple Docs: *Apple App Site Association File*
