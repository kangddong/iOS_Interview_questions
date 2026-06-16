# 레이어 명명 컨벤션 (Service / Store / Manager / Provider / …)

> 한 줄 요약 — 접미사는 *역할의 종류*를 드러내는 1차 신호. **Service**(도메인 유즈케이스), **Store**(영속), **Manager**(인프라 연결), **Provider**(어댑터), **Presenter/Launcher**(부수효과)로 직교 분리하면 ViewModel이 "비즈니스 의도"를 그대로 표현할 수 있다.

## 왜 접미사 컨벤션이 중요한가

- 의존성 이름만 봐도 *역할/책임/테스트 전략*이 짐작 가능해야 한다
- 일관된 명명은 "이 객체에 이걸 시키는 게 맞는가?" 판단을 빠르게 한다
- 면접에서 *"본인 팀의 명명 기준"*은 코드를 안 보여줘도 설계 감각을 드러내는 답변

## 접미사별 정의

### XxxService — 도메인 유즈케이스 모음

다음 셋이 동시에 성립할 때:

1. **도메인 명사 1개에 묶인 동작 집합** — `User`, `Spot`, `Bookmark`, `Auth`처럼 명확한 주어
2. **상태가 없거나 얕다** — `Store`(영속)나 `Manager`(연결)와 달리 stateless에 가깝게 동작. 메서드 호출 = 1 유즈케이스
3. **호출자(ViewModel)가 비즈니스 의도를 그대로 표현** — `userService.updateProfile(...)`, `bookmarkService.toggle(...)`

```swift
protocol BookmarkService {
    func toggle(spotId: String) async throws
    func list() async throws -> [Bookmark]
}
```

### XxxStore — 영속 상태의 소유자

- 주역할이 **저장/로딩** (Keychain, UserDefaults, CoreData, 파일, 메모리 캐시)
- 상태를 *소유*한다는 의미 강조 (Flux/Redux의 store와도 결이 같음)

```swift
protocol DraftSpotStore {
    func save(_ draft: DraftSpot)
    func load() -> DraftSpot?
    func clear()
}
```

### XxxManager — 저수준 연결/세션 1개를 책임

- 도메인 명사가 아니라 **연결 자체**가 본질일 때
- Apple 프레임워크 명명을 따름 (`FileManager`, `CLLocationManager`, `URLSession`)
- 신규 인프라 클래스에만. 도메인 동작을 `Manager`로 부르지 않는다

```swift
final class NetworkManager { /* URLSession 래퍼, 1 인스턴스가 연결을 보유 */ }
```

### XxxProvider — 외부 SDK/외부 시스템을 우리 Protocol로 감싼 어댑터

- DI 경계에서 *내부 인터페이스 ↔ 외부 구현*을 분리하는 역할
- OAuth Provider, ContentProvider, React Context Provider와 같은 결

```swift
protocol AuthProvider { func login() async throws -> AccessToken }
final class GoogleAuthProvider: AuthProvider { /* Google SDK 래핑 */ }
final class AppleAuthProvider:  AuthProvider { /* AuthenticationServices 래핑 */ }
```

### XxxPresenter / XxxLauncher — 부수효과 (UI/외부앱) 분리

- UI 띄우거나(`UIActivityViewController`), 외부 앱 열거나(`openURL`) 같은 부수효과
- `Service`가 *무엇을 할지*를 정하면, `Presenter`/`Launcher`는 *어떻게 띄울지*를 담당
- iOS 관용어는 아니지만 의도 명확화에 유리. 팀 컨벤션 색채 있음을 인지

```swift
protocol ShareSheetPresenter { func present(_ payload: SharePayload) }
protocol ExternalAppLauncher { func open(_ url: URL) }
```

### XxxLogger — 단방향 이벤트 발신

- 호출하면 *어딘가에 기록*만 한다. 반환값/상태 없음
- Analytics, Crash 리포트, 로그 모두 동일 접미사로

```swift
protocol EventLogger { func log(_ event: AnalyticsEvent) }
```

## 결정 트리

```
원격 API 호출이나 도메인 유즈케이스인가?
 └─ YES → XxxService            (예: ReviewService, FollowService)

영속 저장(Keychain/UserDefaults/CoreData)이 주역할인가?
 └─ YES → XxxStore              (예: DraftSpotStore)

외부 SDK를 우리 Protocol로 감싸는 어댑터인가?
 └─ YES → XxxProvider           (예: GoogleAuthProvider)

시스템 UI / 외부앱 호출이 본질인가?
 └─ YES → XxxLauncher / XxxPresenter

저수준 연결/세션 1개를 책임지나? (네트워크 클라이언트 등)
 └─ YES → XxxManager            (NetworkManager)

단방향 이벤트 발신만 하는가?
 └─ YES → XxxLogger
```

## 접미사별 업계 통용도

| 접미사 | 통용도 | 출처 / 배경 |
|---|---|---|
| Service | ⭐⭐⭐ 매우 보편 | Service Layer Pattern (Fowler PoEAA). Spring/.NET/Android/iOS 표준 |
| Repository | ⭐⭐⭐ 매우 보편 | DDD, Android Jetpack 공식. iOS Clean Architecture에서도 표준 |
| Manager | ⭐⭐⭐ 매우 보편 (iOS 특히) | Apple 프레임워크가 `FileManager`, `CLLocationManager` 식으로 사용. "God Manager" 안티패턴 비판도 흔함 |
| Store | ⭐⭐ 보편 | Flux/Redux/SwiftUI 컨텍스트. Keychain/UserDefaults 래퍼 명명으로 iOS에서 자주 |
| Provider | ⭐⭐⭐ 매우 보편 | OAuth Provider, Android ContentProvider, React Context Provider. iOS DI 라이브러리(Factory 등) 표준 |
| Logger | ⭐⭐⭐ 매우 보편 | 모든 언어/플랫폼 공통 |
| UseCase / Interactor | ⭐⭐⭐ Clean Arch 표준 | Service가 유즈케이스를 흡수한 팀에선 미사용 |
| Presenter | ⭐⭐ MVP 표준 | MVVM에선 변칙. "UI 띄우는 객체"로 좁게 쓰면 팀 컨벤션 색채 |
| Launcher | ⭐ 팀 컨벤션 가까움 | Android `ActivityResultLauncher`에선 표준. iOS에선 흔치 않음 |

## 경계 사례

### `LocationService` vs `LocationStore`

- 시스템 API(`CLLocationManager`) 래퍼지만 **권한 흐름 + 좌표 조회**라는 유즈케이스를 노출하므로 `Service`
- 만약 *단순히 현재 좌표만 캐시해 반환*한다면 `LocationStore`가 더 정확

### `ShareIntentService` + `ShareSheetPresenter`

- 공유 payload를 만드는 *도메인 로직*: `ShareIntentService`
- `UIActivityViewController` 띄우는 *부수효과*: `ShareSheetPresenter`로 분리
- **부수효과(UI/외부앱)는 Service에서 분리하는 게 컨벤션**

### `NetworkManager` vs `NetworkService`

- 도메인 명사가 아니라 **연결 그 자체**가 책임 → `Manager`
- 신규 인프라 클래스를 `Service`로 명명하지 않는다 (도메인 명사 1개 규칙 위반)

### `TokenService` vs `TokenStore`

- 토큰을 Keychain에 read/write만 하면 `TokenStore`
- 발급/갱신/만료 검증까지 묶이면 `AuthService`의 일부로 두거나, 별도 `TokenService`로 두되 도메인 동작이 메서드의 주가 되도록

## 흔한 함정 / 안티패턴

- **God Service** — `AppService`, `CommonService`, `UtilService`처럼 도메인 명사 없는 이름은 금지. 1개 도메인에 묶이지 않으면 잘못 추상화한 것
- **Service ↔ Manager 혼용** — 도메인 동작이면 무조건 `Service`. `Manager`는 진짜 인프라성일 때만
- **Store인데 Service로 명명** — Keychain 단순 read/write를 `TokenService`라고 부르면 의도 흐려짐 → `TokenStore`가 정확
- **Service 안에 UI 호출** — `present(...)`/`openURL(...)`이 들어오면 `Presenter`/`Launcher`로 분리. ViewModel/Service는 부수효과를 호출만 하고 *직접 띄우지 않는다*
- **Repository와 Service 둘 다 같은 책임으로 공존** — 팀이 둘 중 하나만 골라 일관되게. Pickflow처럼 `Service`가 유즈케이스를 흡수했다면 `Repository`는 도입하지 않는 게 깔끔

## 면접에서 묻기 좋은 형태

- *본인 팀의 Service / Manager / Store 구분 기준은 무엇이고, 왜 그렇게 정했나?*
- *`NetworkManager`는 왜 `NetworkService`가 아닌가?*
- *`LocationService`를 `LocationStore`로 부르는 게 더 정확한 경우는?*
- *Clean Architecture의 `Repository`가 본인 프로젝트에 없는 이유와 그 트레이드오프?*

→ 모두 *명명 = 책임 직교 분리*라는 본질로 수렴하는 답변.

## 참고

- Martin Fowler — Patterns of Enterprise Application Architecture (Service Layer)
- Apple Framework 명명 (FileManager, CLLocationManager, URLSession)
- DDD: Repository, Factory, Domain Service
