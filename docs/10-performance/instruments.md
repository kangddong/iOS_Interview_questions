# Instruments — 성능 측정 도구

> 한 줄 요약 — Apple이 제공하는 **프로파일링 IDE**. 어떤 도구를 *언제* 쓰는지 답할 수 있어야 면접 점수.

## 자주 쓰는 Instruments

| 도구 | 측정 대상 | 사용 시점 |
|---|---|---|
| **Time Profiler** | CPU 사용량/스택 | "어디가 느리지?" |
| **Allocations** | 메모리 할당 추이 | 메모리 사용량이 자꾸 늘어날 때 |
| **Leaks** | 회수되지 않는 객체 | retain cycle 의심 |
| **Hangs** | 메인 스레드가 멈춘 구간 | 앱이 잠깐 얼어요 |
| **Animation Hitches** | 프레임 드롭 | 스크롤이 끊겨요 |
| **Network** | 요청/응답 timing | 느린 화면 진입 |
| **Energy** | 배터리 영향 | 백그라운드 작업/위치 |
| **App Launch** | 앱 시작 단계별 시간 | 시작이 느려요 |
| **Core Animation** | 렌더링 단계, off-screen pass | 렌더 비용 |

## 일반적 프로파일링 절차

1. **재현 가능한 시나리오 정의** — "특정 화면에서 스크롤할 때 끊김" 같은 명시적 케이스.
2. **Release(또는 Profile) 빌드로 측정** — Debug 빌드는 `-Onone`이라 신뢰도 낮음.
3. **실제 디바이스로** — 시뮬레이터는 Mac CPU/GPU를 씀. 의미 없음.
4. **베이스라인** — 변경 전 수치 기록. 개선 후 비교.
5. **하나씩 변경** — 동시에 여러 가설을 바꾸면 원인을 모름.

## Time Profiler 읽는 법

- *Heaviest Stack Trace*: 누적 시간이 가장 큰 호출 경로.
- 메인 스레드만 필터링해서 *UI 메인 스레드 점유*를 확인.
- 직접 만든 코드와 시스템 코드 구분 (`Hide System Libraries` 토글).

## Leaks vs Allocations

- **Leaks**: *완전히 unreachable한* 객체만 잡힘. retain cycle처럼 *서로 참조해 살아있지만 의도 외 보존*된 객체는 못 잡을 수 있음.
- **Allocations**: 객체 생성 추적. *생존 객체 수가 늘어나기만 하는*지 추세 확인.
- 보통 둘을 함께 사용 + Memory Graph Debugger로 cycle 시각화.

## Memory Graph Debugger

Xcode 디버깅 중 ⊠(가운데 박스 같은 아이콘) 버튼. 살아있는 객체 그래프 시각화. retain cycle을 그래프 모양(ring)으로 발견.

## Hang Detection

`MetricKit`(`MXHangDiagnostic`, iOS 14+) + Instruments Hangs로 *유저가 본* hang을 잡음. 임계값은 단순히 "100ms"로 단정할 수 없고 — *체감 hitch/응답성 기준*으로 100ms를 흔히 쓰지만, MetricKit이 분류하는 hang severity(micro / short / long)는 별도 정의가 있어 100ms 한 줄로 환원되지 않는다.

## Os Signpost — 직접 마킹

```swift
import OSLog
let log = OSLog(subsystem: "io.app", category: .pointsOfInterest)
let id = OSSignpostID(log: log)

os_signpost(.begin, log: log, name: "load posts", signpostID: id)
loadPosts()
os_signpost(.end, log: log, name: "load posts", signpostID: id)
```

Instruments에서 *내가 명명한 구간*을 시각적으로 봄. "왜 이 흐름이 오래 걸리지?" 추적에 강력.

## 흔한 함정 / Follow-up

- **Q. Debug 빌드로 프로파일링하면 안 되는 이유?**
  최적화 미적용, 디버그 심볼 포함 등으로 *실제 사용자 경험과 다름*. Release/Profile 빌드 사용.

- **Q. 시뮬레이터로 측정해도 되나?**
  CPU/GPU/메모리 환경이 Mac 기준이라 *상대 비교 불가*. 실기기 필수.

- **Q. Time Profiler에서 메인 스레드의 함수 시간이 느려요. 다음 액션?**
  스택을 따라 *내 코드*를 찾고, 무거운 작업이면 백그라운드로 옮길 수 있는지 검토. CPU 바운드면 캐싱/알고리즘 변경.

- **Q. 메모리 leak이 0인데 사용량이 계속 늘어요.**
  leak이 아니라 *unbounded growth*. 캐시 무한 증가, 클로저 캡처, NotificationCenter observer 누적. Allocations로 *어떤 타입*이 늘어나는지 확인.

- **Q. `os_signpost` vs `print`?**
  print는 콘솔만, IO 비용. signpost는 시스템 로깅에 통합되고 Instruments에서 시각화 가능.

## 참고

- WWDC 2018: Measuring Performance Using Logging
- WWDC 2021: Eliminate Animation Hitches
- WWDC 2022: Track down hangs with MetricKit
