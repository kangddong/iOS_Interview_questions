# 4단계 — 시니어 영역

> 한 줄 요약 — Testing / Performance / Build System. **시니어 면접 *변별점*은 측정과 도구 활용**. 단순 "써본 적 있다"가 아니라 *어떤 도구로 어디서 무엇을 잡았는가*가 답변의 본체.

## 학습 목표

- 테스트 피라미드를 *어떤 비율*로 적용, 그 근거
- flaky 테스트의 원인을 *4분류*해서 답변
- Instruments 트랙별 (Time Profiler / Allocations / Animation Hitches / Metal System Trace) 용도 식별
- 60/120Hz 환경에서 hitch *측정 → 원인 분류 → 대응*
- 런치 타임 단계(pre-main / main / first frame)별 최적화
- 빌드 타임을 분 단위로 줄이는 모듈 분리 전략
- 코드 사이닝 / Provisioning Profile 흔한 에러 해결

## 카테고리

### [09-testing](../09-testing/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [XCTest 기본](../09-testing/xctest.md) | 주니어~미들 |
| [Swift Testing (Xcode 16+)](../09-testing/swift-testing.md) | 미들 |
| [Mocking 전략](../09-testing/mocking.md) | 미들 필수 |
| [Snapshot / UI Testing](../09-testing/snapshot-and-ui-testing.md) | 미들 |
| [Test Strategy (피라미드 + flaky 분류)](../09-testing/test-strategy.md) | 시니어 |

### [10-performance](../10-performance/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [Instruments](../10-performance/instruments.md) | 미들 필수 |
| [메인 스레드와 hitch](../10-performance/main-thread-and-hitch.md) | 미들 |
| [이미지 / 스크롤 최적화](../10-performance/image-and-scroll.md) | 미들 |
| [앱 런치 타임](../10-performance/launch-time.md) | 시니어 |
| [MetricKit / Crash / Binary Size](../10-performance/metrickit-and-crash.md) | 시니어 |
| [렌더링 예산과 Hitch](../10-performance/rendering-budget-and-hitch.md) | 시니어 |

### [11-build-system](../11-build-system/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [Xcode 빌드 시스템](../11-build-system/xcode-build.md) | 미들 |
| [Swift Package Manager](../11-build-system/spm.md) | 미들 |
| [Code Signing](../11-build-system/code-signing.md) | 미들 필수 |
| [CI/CD](../11-build-system/ci-cd.md) | 미들~시니어 |
| [Build Time 최적화](../11-build-system/build-time-optimization.md) | 시니어 |

## 권장 학습 순서

1. **Testing 기본 → 미들** — Mocking 전략 + URLProtocol + 시간 의존
2. **Performance 진입** — Instruments 종류 → main thread → 이미지/스크롤
3. **Build System** — Xcode 빌드 흐름 + SPM 구조 + 사이닝 에러 해결
4. **시니어 통합** — hitch 측정 + 런치 최적화 + 빌드 타임 + Test Strategy

## 예상 소요 시간

- 미들 깊이: **2주** (도구 익히는 게 시간 큼)
- 시니어 깊이: **1~1.5개월** (실측 + 사례 수집)

## 대표 질문

### 미들
- XCTest와 Swift Testing 차이?
- Mock과 Stub 차이?
- URLSession을 mock하는 두 방법?
- 스크롤이 끊긴다 — 어디부터 의심?
- Singleton 코드를 어떻게 테스트?
- Debug/Release 빌드 차이?
- SPM과 CocoaPods 선택 기준?
- 코드 사이닝 에러 흔한 원인?

### 시니어
- 테스트 피라미드 비율은? 그 근거?
- flaky 테스트 원인 분류 + 대응?
- Snapshot 테스트가 *잡지 못하는* 회귀?
- 60Hz / 120Hz / ProMotion 환경에서 hitch 측정?
- 앱 런치 타임 단계별 최적화 (pre-main / main / first frame)?
- 런치 시간을 *측정하지 않고* 줄이려는 시도가 위험한 이유?
- 빌드 타임을 분 단위로 줄이는 핵심 지렛대?
- Static vs Dynamic 링크가 런치 타임에 미치는 영향?
- Instruments에서 *commit 단계 비용*은 어떤 트랙으로 봄?

## 다음 단계 진입 조건

- [ ] *본인이 측정한* hitch / 런치 / 메모리 사례를 1개 이상 즉답
- [ ] 빌드 시간 측정 도구 (`-debug-time-function-bodies`) 직접 사용 경험
- [ ] 테스트 ROI 비교(Unit/Integration/Snapshot/UI) 명확히 답변
- [ ] Mocking으로 *외부 의존* 격리한 테스트 코드 시연 가능

→ [stage-5-cs-network](stage-5-cs-network.md)로 진입.

## 모듈 확장 가이드

- 측정 *도구 이름*이 반드시 답변에 들어가야 함 (Time Profiler, Animation Hitches, MetricKit 등)
- *실측 사례*가 시니어 변별점 — "I saw X ms reduced to Y ms by Z" 형식
- 빌드 / 런치 / 렌더 *세 가지 다른 측정 단위*임을 강조
