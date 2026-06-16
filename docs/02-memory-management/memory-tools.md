# 메모리 디버깅 도구 (Memory Graph / Leaks / Sanitizers)

> 한 줄 요약 — 누수/순환참조는 **Memory Graph**로 *시각화*하고, 누가 *언제* 할당했는지는 **Allocations + Malloc Stack Logging**으로 추적한다. *해제된 메모리 접근*(use-after-free, race)은 **Address/Thread Sanitizer**로만 잡힌다. 도구마다 잡는 *버그 종류*가 다르다는 점이 핵심.

## 도구 매트릭스

| 도구 | 잡는 것 | 비용 | 사용 시점 |
|---|---|---|---|
| Memory Graph Debugger | retain cycle, 살아있는 객체 그래프 | 거의 0 | UI 닫았는데 deinit 안 불릴 때 |
| Instruments → Leaks | 도달 불가 메모리(전통적 누수) | 중간 (주기적 스캔) | 장시간 사용 후 메모리 증가 |
| Instruments → Allocations | 할당 횟수/크기/lifetime | 낮음 | 어디서 자주 할당하는지 |
| Malloc Stack Logging | *할당 호출 스택* | 큼 | 특정 객체 출처 추적 |
| Address Sanitizer (ASan) | use-after-free, buffer overflow | 2~3x slow, 2x memory | 비결정 크래시 |
| Thread Sanitizer (TSan) | data race, deadlock 패턴 | 5~15x slow | 비결정 동시성 버그 |

## Memory Graph Debugger

Xcode 디버거 실행 중 *Debug Memory Graph* 버튼.

- 화면 전환했는데 `deinit`이 안 호출됐다면 → 객체 선택 → *purple !* 표시 = leak
- 우측 패널이 *이 객체를 살리는 retain chain* 표시
- *어떤 변수/property가 strong 참조 중인지* 시각적 확인 가능

전형적인 발견:
- `viewController.someBlock`이 `self`를 캡처
- `Timer.scheduledTimer { ... self ... }`가 RunLoop에서 살아남음
- NotificationCenter 옵저버가 self를 retain

## Instruments → Leaks

- 주기적으로 *도달 불가 메모리*를 스캔 (mark-and-sweep)
- *retain cycle*은 도달 가능이라 Leaks가 잡지 못함 → Memory Graph 사용
- 한 번 누수 잡히면 *할당 호출 스택* 노출

→ Leaks는 *고전적 누수*(주소가 모두 사라졌는데 해제 안 됨)에만 강함. Swift에선 이런 케이스는 드뭄.

## Instruments → Allocations

질문: "메모리가 점점 늘어난다"
- **All Heap Allocations**에서 *살아있는 객체 수*가 시간에 따라 증가하는지
- **Generations**(Mark Generation) 기능: 두 시점 사이의 *순증가*만 표시 → 화면 진입/이탈 사이의 누적 확인
- 카테고리별 정렬: 어떤 클래스가 가장 많이 살아있는지

## Malloc Stack Logging

`Scheme → Diagnostics → Malloc Stack Logging`. 모든 할당의 *호출 스택*을 기록.

- 비용 큼 → 평소엔 끔
- Allocations에서 "어디서 만들어졌나" 모를 때 활성화 후 재현

## Address Sanitizer (ASan)

- *해제된 메모리 접근*, *버퍼 오버플로우*, *use-after-return*
- Swift에선 *unsafe* API (`UnsafeMutablePointer`, C 인터롭) 외엔 만나기 어려움
- 그러나 Objective-C/C 의존이 있으면 잠재적
- 실행 속도 2-3배 느림, 메모리 2배 — 보통 *재현 환경*에서만 사용

## Thread Sanitizer (TSan)

- *데이터 레이스* 검출: 두 스레드가 *동기화 없이* 같은 메모리에 접근
- Swift Concurrency의 `Sendable`/actor가 *컴파일 타임에* 이미 많이 막지만, GCD/직접 thread 사용 코드는 TSan으로 검증
- 비용 큼 — CI에서 별도 잡으로 실행

## Crash 분석

| 도구 | 용도 |
|---|---|
| Xcode → Organizer → Crashes | App Store 사용자 크래시 |
| `.dSYM` symbolication | 주소 → 함수명 변환 |
| `atos` / `symbolicatecrash` CLI | 수동 심볼화 |
| Firebase / Sentry / Bugsnag | 백트레이스 수집 SaaS |

dSYM은 *빌드 시점*에 생성되며 *반드시* 같은 빌드의 dSYM만 사용 가능. CI에서 archive 시 자동 업로드 권장.

## MetricKit (iOS 13+)

OS가 *실 사용자 디바이스*에서 수집한 지표를 받음:
- CPU/Memory/Disk
- Hangs, Disk writes
- Crash 보고서

`MXMetricManager`로 일일 페이로드 수신. 실 사용자 환경 측정의 가장 정확한 데이터.

## 자주 쓰는 디버깅 패턴

### `deinit` 로그

```swift
class Foo {
    deinit { print("Foo deinit") }
}
```

화면 닫을 때 안 찍히면 leak 의심. 가장 빠른 1차 확인.

### `os_signpost`

```swift
import os.signpost
let log = OSLog(subsystem: "app", category: .pointsOfInterest)
os_signpost(.begin, log: log, name: "image-decode")
// ... 작업
os_signpost(.end,   log: log, name: "image-decode")
```

Instruments의 *Points of Interest* 트랙에 표시. 메모리 piece에 markings.

### `weak` 옵저버 검증

```swift
Notification.Center.default.addObserver(forName: ..., object: nil, queue: .main) { [weak self] _ in
    self?.refresh()
}
```

`[weak self]`을 박지 않으면 NotificationCenter가 self를 *영구 retain*.

## 흔한 함정 / Follow-up

- **Q. Leaks가 0인데 메모리는 계속 늘어난다?**
  *누수가 아닌 누적*. retain cycle도 Leaks가 못 잡음 → Memory Graph 확인. 캐시가 무한 증가하는 경우, image cache LRU 없음 등.

- **Q. Memory Graph에서 retain chain이 SwiftUI 내부 객체로 끝나는 경우?**
  View가 `@StateObject`를 통해 객체를 *수명 동안 보관*. View가 사라지면 풀린다. 풀리지 않으면 view identity가 안정적인지 확인.

- **Q. autoreleasepool 누수와 ARC 누수 차이?**
  autoreleasepool 누수는 *해제는 되지만 풀이 비워지는 타이밍이 늦어* 일시적 메모리 폭증. 진짜 누수는 영구 보관.

- **Q. TSan으로 actor 위반을 잡을 수 있나?**
  못 잡음. actor는 *컴파일 타임에 isolation 강제*. TSan은 런타임 race 검출. Swift Concurrency는 strict mode에서 컴파일러가 막음.

- **Q. 실사용자 메모리 크래시(jetsam) 진단?**
  Organizer의 "Energy / Memory" 섹션 + MetricKit. *jetsam priority*가 높은 상태에서 OS가 강제 종료.

- **Q. `os_log` vs `print`?**
  `os_log`는 *Console.app에서 필터링 가능*, sensitive data 마킹, 시간 정확, 릴리스에서도 안전. `print`는 디버깅용.

## 참고

- WWDC 2018: iOS Memory Deep Dive
- WWDC 2019: Modernizing Grand Central Dispatch Usage (TSan 부분)
- Apple: Diagnosing Memory, Thread, and Crash Issues Early
