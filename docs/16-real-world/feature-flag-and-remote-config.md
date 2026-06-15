# Feature Flag & Remote Config

> 한 줄 요약 — **새 코드와 새 동작을 분리해 *배포와 출시의 시점을 다르게* 가져가기 위한 도구**다. 모바일은 *심사 + 강제 업데이트 한계* 때문에 서버보다 훨씬 더 절실하다. 단, 매 부팅마다 동기 fetch를 하면 *첫 화면이 깜빡거리는* 대가를 치른다 — flag 시스템 설계의 핵심은 *캐시 정책*과 *기본값*이다.

도입 버전: 라이브러리 의존 (Firebase Remote Config / LaunchDarkly / GrowthBook / Unleash). iOS 자체 API 없음.

## 핵심 개념

- **Feature Flag vs Remote Config**
  - **Feature Flag**: 코드 경로의 on/off. *변형(variant)*은 boolean 또는 enum. 주된 목적은 *위험 격리*.
  - **Remote Config**: 임의 키-값 페어. 색·문구·임계값·차단 리스트까지. 주된 목적은 *재배포 없이 조정*.
  - 실무에서는 한 시스템이 둘을 겸하는 경우가 많다 (Firebase RC, LaunchDarkly).
- **flag의 5가지 종류** (Pete Hodgson 분류)
  1. **Release flag** — 미완성 기능 숨김. 단기.
  2. **Experiment flag** — A/B 테스트.
  3. **Ops flag** — 서버 부하 등 운영 스위치. *킬 스위치*.
  4. **Permission flag** — 유저 그룹별 (베타, 프리미엄).
  5. **Long-lived flag** — 거의 영구. 위험.
- **평가 (evaluation)**
  - **서버 평가**: 백엔드가 user context 기반으로 결정. 일관성 ↑, 네트워크 의존 ↑.
  - **클라이언트 평가**: SDK가 rule set을 받아 로컬에서 계산. 오프라인 OK, *rule 노출 위험*.
- **A/B 테스트 통합**
  - flag variant ↔ analytics 이벤트의 `experiment_id` 매핑이 *동일 user/install 단위*여야 함. 그렇지 않으면 결과 분석 불가.

## 동작 흐름 (단계별)

1. 앱 부팅 → SDK가 *캐시된 last-known flag*를 즉시 노출 (동기).
2. 백그라운드에서 fetch & activate 호출.
3. 새 값이 도착하면 `Notification` 또는 `AsyncStream`으로 *살아있는 화면에 통보*.
4. 핵심 화면은 *부팅 캐시*만 보고 결정 — fetch 늦어도 깜빡임 없음.
5. 강제 업데이트가 필요한 flag (예: 결제 보안)는 *fetch 완료까지 스플래시*에서 대기.

## 코드 / 설정 예시

```swift
// 추상화 — 어떤 SDK를 쓰든 인터페이스는 고정
protocol FeatureFlagStore {
    func bool(_ key: FlagKey, default: Bool) -> Bool
    func string(_ key: FlagKey, default: String) -> String
    func variant<T: Decodable>(_ key: FlagKey, default: T) -> T
    var didUpdate: AsyncStream<Void> { get }
}

enum FlagKey: String {
    case newCheckoutFlow = "new_checkout_flow"
    case maxUploadMB    = "max_upload_mb"
    case killSwitchSync = "kill_switch_sync"
}

// 호출부 — 절대 SDK를 직접 부르지 말 것
if flags.bool(.newCheckoutFlow, default: false) {
    CheckoutV2View()
} else {
    CheckoutV1View()
}
```

```swift
// 안전한 fetch 전략
final class FlagBootstrap {
    func boot() async {
        // 1) 캐시 즉시 사용 — fetch 실패해도 앱은 동작
        store.activateCached()

        // 2) 동기 fetch는 *킬 스위치 같은 안전 차단*만 기다림
        do {
            try await withTimeout(.seconds(2)) {
                try await store.fetch()
            }
            store.activate()
        } catch {
            metrics.log("flag_fetch_timeout")
            // 캐시 그대로 진행
        }
    }
}
```

```swift
// A/B 노출 로깅 — variant를 *읽는 순간* 한 번만
func variantOnce<T: Decodable>(_ key: FlagKey, default value: T) -> T {
    let v = flags.variant(key, default: value)
    Analytics.logOnce("experiment_exposure",
                      params: ["key": key.rawValue, "variant": String(describing: v)],
                      dedupKey: key.rawValue)
    return v
}
```

```json
// Remote Config 예시 (Firebase)
{
  "new_checkout_flow": { "defaultValue": false, "conditionalValues": {
    "ios_18_plus_kr_50pct": true
  }},
  "kill_switch_sync": { "defaultValue": false },
  "max_upload_mb": { "defaultValue": 25 }
}
```

## 비교

| 구분 | Firebase Remote Config | LaunchDarkly | GrowthBook (OSS) |
|---|---|---|---|
| 평가 위치 | 서버 (rule), 클라가 결과 받음 | 서버/클라이언트 양쪽 | 클라이언트 SDK 평가 |
| 실시간 푸시 | 폴링/fetch | streaming SSE | polling/SSE |
| A/B 통합 | Firebase A/B / GA4 | 자체 + segment | 자체 |
| 가격 | 무료 + 한도 | 유료 (엔터프라이즈) | OSS 가능 |
| iOS SDK 부담 | 크다 (Firebase 전체) | 중간 | 가볍다 |

## 보안 / 함정

- **민감 정보 금지**: flag 값은 *암호화되지 않은 평문*으로 메모리에 머문다. API 키, 가격, 차단 리스트 *전부 노출 가능*. 단순 on/off만 안전하다고 가정하라.
- **flag 폭증**: 6개월 이상된 flag는 *기술 부채*. 분기마다 cleanup PR을 의무화.
- **동기 fetch 비용**: 부팅 시 *블로킹*하면 cold start ↑, 사용자가 *까만 화면*을 본다. 2~3초 타임아웃 + 캐시 폴백 필수.
- **A/B 노출 시점**: variant를 *얻은 시점*과 *사용자가 본 시점*이 다르면 통계가 깨진다. 화면이 실제로 그려질 때 한 번 로깅.
- **점진 출시 롤백**: 0→10→50→100% rollout 중 5xx/크래시 폭증이 보이면 *즉시 0%*로. SDK에 *force fetch* 경로가 있어야 함 (Firebase의 `setMinimumFetchInterval` 0초 + activate).
- **flag 의존성**: 두 flag가 동시에 켜져야 동작하는 코드는 *조합 테스트가 N×M*. 단일 flag로 합치거나 의존 그래프를 문서화.

## 흔한 함정 / Follow-up

- **Q. 첫 실행에서 캐시가 없을 때 어떻게 하나?**
  - A. *컴파일 타임 default*를 코드에 박는다. `flags.bool(.x, default: false)`처럼 호출부에서 기본값 강제. SDK의 "remote default"만 믿으면 위험.
- **Q. 같은 사용자에게 variant가 깜빡 바뀌는 현상.**
  - A. (1) anonymous id가 부팅마다 바뀌는 경우, (2) fetch 후 *재활성화*가 화면 도중에 일어나는 경우. *세션 동안 동일 값을 보장*하는 wrapper가 필요.
- **Q. 킬 스위치는 어떻게 보장하나?**
  - A. (1) 부팅 시 *동기 fetch + 타임아웃*, (2) 모듈 진입 *직전* 다시 평가, (3) 네트워크 실패 시 *fail-safe 방향* (예: 결제 차단이면 default = 차단). 절대 fail-open 금지.
- **Q. A/B 결과를 어떻게 신뢰하나?**
  - A. *exposure 로그가 한 번씩만* 찍히는지 검증, *bucketing 함수*가 결정적인지 (같은 user id → 같은 bucket), *SRM(Sample Ratio Mismatch)* 검사.
- **Q. Remote Config가 다운되면?**
  - A. SDK는 마지막 활성화 값을 메모리/디스크에 유지. 단 *최초 실행에서 다운되면 compile-time default*가 유일한 방어선.
- **Q. flag 시스템 자체에 장애가 나면 어떻게 대응하나?**
  - A. (1) 클라가 *반복 fetch로 무한 재시도하지 않도록* exponential backoff, (2) Bundle에 *임베디드 fallback JSON* 동봉, (3) 핵심 경로는 *기본값에서도 동작 가능*하도록.

## 참고

- Pete Hodgson, *Feature Toggles (aka Feature Flags)*, martinfowler.com
- Firebase Remote Config — *Loading Strategies*
- LaunchDarkly Docs — *Sending experimentation events*
- WWDC 2022 — *Adopt declarative App Intents* (App Intents flagging 예시)
