# 10. Performance

> 한 줄 요약 — iOS 성능은 *측정 → 분류 → 수정 → 회귀 방지* 사이클. **메인 스레드 예산(16.67ms@60Hz / 8.33ms@120Hz)** 이 모든 hitch 논의의 기준이고, **Instruments + MetricKit + os_signpost** 가 측정의 3종 세트.

*측정 도구*와 *원인 분류*를 함께 답해야 한다.

## 성능 4분면

| 증상 | 사용자 인식 | 측정 도구 | 일반적 원인 |
| --- | --- | --- | --- |
| **Hitch** | 스크롤이 끊김 | Hitches Instrument, `os_signpost` | 메인 메인 블로킹 (decode, layout, sync I/O) |
| **Hang** | "앱이 멈췄다" (250ms+) | Hangs Instrument | sync 대기, 큰 작업 메인 실행 |
| **Slow Launch** | 진입이 느림 | Time Profiler, `MetricKit` launch | pre-main(dyld) 비용, 큰 dynamic framework |
| **Memory growth** | 강제 종료 | Allocations, Leaks | retain cycle, 큰 이미지 미디코드, 캐시 무한증식 |

## 핵심 개념 5선

### 1. 프레임 예산
- 60Hz = **16.67ms**, 120Hz ProMotion = **8.33ms** per frame.
- 한 프레임에 layout/draw/commit이 모두 끝나야. 초과 = hitch.
- **hitchtime ratio**: hitch 시간 / 총 시간. iOS 14+ Hitches Instrument.

### 2. 메인 스레드 = 단일 차선
- UIKit/SwiftUI 렌더링, 터치 이벤트, RunLoop 타이머 모두 메인.
- 무거운 작업(image decode, JSON parse, file I/O, regex) → background로.
- 결과만 main에 hop. SwiftUI는 `@MainActor` 자동 보장.

### 3. 이미지·스크롤
- `UIImage(data:)`는 *지연 디코드* — 첫 표시 시점에 메인에서 디코드 → hitch.
- 해결: background에서 `prepareForDisplay` (iOS 15+) 또는 `CGImageSourceCreateThumbnail` 로 **downsampling**.
- 스크롤 prefetch: `UICollectionViewDataSourcePrefetching`, `URLSessionDataTask` warm-up.

### 4. 앱 런치 타임
- 3단계: **pre-main** (dyld, ObjC class load, +load) → **main** → **first frame**.
- 측정: Xcode "App Launch" Instrument, `os_signpost` 직접 측정, `MetricKit` 실사용자 분포.
- 개선: dynamic framework 수 줄이기, `+load` → `+initialize`, `mergeable libraries`(iOS 17+), 첫 화면 lazy하게.

### 5. MetricKit
- 사용자 기기에서 *집계된* 성능 데이터를 일일 보고서로 받음.
- 항목: launch time, hang, hitch, energy, disk, network, crash diagnostics.
- 실험실 측정과 달리 *현장의 분포*를 본다. P50/P90/P99로 회귀 감시.

## 측정·진단 흐름

```
1. 증상 식별 (사용자 보고 / MetricKit)
       ↓
2. 분류 (hitch / hang / launch / memory)
       ↓
3. 도구 선택
   - Time Profiler: CPU 핫스팟
   - Allocations: 메모리
   - Leaks / Memory Graph: 누수
   - Hitches: 프레임 미스
   - Network: 네트워크
       ↓
4. 가설 → 수정
       ↓
5. 회귀 방지 (os_signpost + CI)
```

→ 면접 답변 구조: *증상 → 측정 → 원인 → 수정 → 회귀 방지* 5단계. 절대 "최적화부터 한다" 아님.

## 항목

- [Instruments](instruments.md) — Time Profiler, Allocations, Leaks, Hangs, Hitches, os_signpost
- [메인 스레드와 hitch](main-thread-and-hitch.md) — 16.67ms 예산, hitch vs hang, 막는 원인과 해결
- [이미지 / 스크롤 최적화](image-and-scroll.md) — UIImage 지연 디코드, downsampling, 캐시, prefetching
- [앱 런치 타임](launch-time.md) — pre-main / main / first frame, 측정과 개선
- [MetricKit / Crash Symbolication / Binary Size](metrickit-and-crash.md) — *3년차+*. 사용자 메트릭, dSYM, watchdog 크래시

## 시니어

- [렌더링 예산과 Hitch (60/120Hz, hitchtime ratio, 측정→대응)](rendering-budget-and-hitch.md)

## 자주 묻는 질문

- 스크롤이 끊긴다 — 어디부터 보나 → [main-thread-and-hitch.md](main-thread-and-hitch.md) + [image-and-scroll.md](image-and-scroll.md)
- 앱 시작이 느리다 → [launch-time.md](launch-time.md)
- 메모리 사용량이 점점 늘어난다 → [instruments.md](instruments.md) (Allocations, Leaks)
- 큰 이미지를 표시할 때 메모리 폭발 막는 법 → [image-and-scroll.md](image-and-scroll.md)
- hitch와 hang 차이 → [main-thread-and-hitch.md](main-thread-and-hitch.md)
- Debug 빌드로 프로파일링하면 안 되는 이유 → [instruments.md](instruments.md)
