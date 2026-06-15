# 10. Performance

*측정 도구*와 *원인 분류*를 함께 답해야 한다.

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
