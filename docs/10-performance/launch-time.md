# 앱 런치 타임 (Cold / Warm / Hot, pre-main / main / first frame)

> 한 줄 요약 — 런치는 **pre-main**(dyld → libSystem → ObjC runtime → static init), **main**(앱 객체/scene 생성, didFinishLaunching), **first frame**(첫 useful frame 렌더) 3단계로 나뉜다. cold launch는 *수백 ms ~ 수 초* 예산. Instruments → App Launch + MetricKit으로 단계별 측정 → 어디서 시간을 쓰는지 가시화.

## 3단계 모델

```
[0] dyld   — 동적 라이브러리 로드, rebase, bind
[1] libObjC — ObjC class realize, +load 호출, framework init
[2] static initializers — C++ global ctor, Swift @_cdecl init
─── main() 진입 ───
[3] UIApplicationMain / @main
[4] didFinishLaunching
[5] Scene / Window 생성, root VC viewDidLoad
[6] first frame commit
```

iOS 15+에서 *App Launch Instruments*가 단계별 분해 제공.

## Cold / Warm / Hot

| 종류 | 정의 | 예산 |
|---|---|---|
| **Cold** | 부팅 후 첫 실행 또는 종료 후 재실행 | iPhone 12: ~400ms 권장, 1초 넘으면 hitch 인식 |
| **Warm** | 메모리에서 종료됐지만 dyld 캐시 살아있음 | ~수십 ms |
| **Hot** | 백그라운드 → 포그라운드 복귀 | 즉시 |

면접 답변 시 *cold launch가 가장 중요* — 사용자가 가장 자주 체감.

## Pre-main 최적화

### 동적 라이브러리 줄이기

- *embedded framework 수*가 많을수록 dyld 단계 시간 증가
- 대안: SPM의 **static framework** (Mach-O 통합)
- iOS 13+ `dyld 3` cache가 시스템 라이브러리는 캐시 — 앱 자체 framework는 별개

### `+load` / static initializer 피하기

```objc
+ (void)load { /* iOS 앱 시작 전 호출됨, dyld 단계에 비용 추가 */ }
```

- ObjC `+load`는 *모든 클래스에 대해 호출* → 비용 큼
- Swift static initializer: `static let` 사용 시 *lazy*라 main 후 실행
- 그러나 `@_cdecl`/`__attribute__((constructor))` C global ctor는 pre-main 실행

### Linker 최적화

- `LINK_TIME_OPTIMIZATION = YES` (LTO) → dead code 제거
- `STRIP_INSTALLED_PRODUCT = YES` → 디버그 심볼 제거
- `STRIP_SWIFT_SYMBOLS = YES`

## Main 단계 최적화

### didFinishLaunching에서 *최소만*

```swift
// ❌
func application(_:_:) -> Bool {
    AnalyticsSDK.init()
    LocationManager.start()
    Network.warmup()
    CrashReporter.install()
    /* ... 100ms+ ... */
    return true
}

// ✅ 지연 + 우선순위 분리
func application(_:_:) -> Bool {
    CrashReporter.install()        // 가장 먼저 (다음 단계 보호)
    Task(priority: .userInitiated) {
        AnalyticsSDK.init()
        Network.warmup()
    }
    Task(priority: .utility) {
        LocationManager.start()
    }
    return true
}
```

원칙:
- *첫 화면 그릴 때 꼭 필요한 것*만 동기
- 나머지는 *Task로 분리*해 background 우선순위

### 의존성 주입 컨테이너

큰 DI graph 일괄 생성은 비용. *Lazy 등록* + *필요 시 생성*. 자세히는 [06-architecture/dependency-injection.md](../06-architecture/dependency-injection.md).

## First Frame 최적화

### Root View 단순화

- splash → 첫 콘텐츠 화면이 *바로 사용 가능 상태*가 아니면 깜빡임/로딩 화면 노출
- *placeholder UI* + 비동기 데이터 로드 (skeleton)
- 큰 이미지/리소스 동기 로드 X

### Auto Layout 깊이

깊은 view hierarchy + 복잡한 constraint = layout pass 비용 증가. 가능한 *flat*하게.

### SwiftUI 첫 view tree

- View body 비용 + identity 안정성
- `@StateObject`/`@Observable` 초기화 시점 주의 (init이 무거우면 첫 frame 지연)

## 측정 도구

### Instruments → App Launch

- Pre-main / main / first frame 단계별 시간 분해
- *Mode of slowdown* 식별 (CPU bound vs IO bound)

### MetricKit (`MXAppLaunchMetric`)

- 실 사용자 디바이스의 *실제 launch time* 통계
- p50/p90/p99 분포

### Console.app → `os_log` signpost

```swift
let log = OSLog(subsystem: "app.launch", category: .pointsOfInterest)
os_signpost(.begin, log: log, name: "init-network")
// ...
os_signpost(.end,   log: log, name: "init-network")
```

내가 직접 라벨링한 구간이 Instruments App Launch 트랙에 표시.

## 흔한 함정 / Follow-up

- **Q. 디버거 attach 시 측정?**
  *디버거가 시간 추가*. 측정은 release + 디바이스 + 디버거 detach. TestFlight 빌드 권장.

- **Q. 시뮬레이터에서 실측 가능?**
  *경향*은 보이지만 절대값은 디바이스와 다름. 결정은 디바이스 측정으로.

- **Q. `@main`이 너무 빠르게 실행?**
  `@main`은 main()의 wrapper. UIKit이면 SceneDelegate scene이 더 의미 있는 진입점.

- **Q. 첫 화면 로딩 도중 사용자 입력?**
  *사용자 입력을 막지 않는 placeholder*가 best. blocking spinner는 마지막 수단.

- **Q. 시스템 SDK warmup도 필요?**
  iOS 15+ 일부 framework은 *시스템 dyld cache*로 사실상 0 비용. 그러나 무거운 시스템 framework(Photos, AVKit) 첫 호출은 lazy 비용.

- **Q. 백그라운드 fetch가 launch에 영향?**
  Background fetch는 *full launch와 다른 path* — minimal context. 그러나 init code가 공유되면 영향 받음. Background context에서 *최소 분기*.

## 참고

- WWDC 2019: Optimizing App Launch
- WWDC 2022: Improve app size and runtime performance
- Apple: Reducing Your App's Launch Time
- MetricKit Documentation
