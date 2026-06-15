# 렌더링 예산과 Hitch (60/120Hz, Hitchtime Ratio, 측정→대응 흐름)

> 한 줄 요약 — 한 프레임이 *예산 안*에 끝나지 않으면 **hitch**가 발생한다. 60Hz = 16.67ms, 120Hz = 8.33ms, ProMotion 가변. 사용자 인식 hitch는 *겹쳐서 측정*(hitchtime ratio = hitch 시간 ÷ 총 시간)으로 정량화한다. 원인은 ① 메인 스레드 점유 ② commit 단계 비용 ③ GPU/Render Server 정체 — 각각 도구가 다르다.

## 프레임 예산

| 디스플레이 | 프레임 길이 |
|---|---|
| 60Hz | 16.67ms |
| 120Hz | 8.33ms |
| ProMotion (가변 24~120Hz) | 8.33 ~ 41.67ms |

ProMotion은 *콘텐츠 변화 빈도*에 따라 조절. 정적 화면은 24Hz로 떨어져 배터리 절약.

## Hitch vs Hang

| 종류 | 정의 |
|---|---|
| **Hitch** | 1개 프레임이 *예산 초과* → 한두 프레임 누락 |
| **Stutter** | 연속된 hitch (스크롤 끊김 체감) |
| **Hang** | 250ms 이상 메인 점유 → "응답 없음" |
| **Watchdog crash** | 일정 시간 이상 응답 없음 → OS가 강제 종료 |

체감 임계:
- 0~50ms hitch: 인식 약함
- 50~250ms: 명확히 끊김 체감
- 250ms+: hang

## Hitchtime Ratio

```
hitch_time_ratio = sum(frame_overrun) / total_render_time
```

iOS 14+ `MetricKit` `MXAppHangDiagnostic`, `MXAnimationMetric.scrollHitchTimeRatio` 등으로 *실 사용자 디바이스에서* 측정. 사내 dashboard에 누적해 회귀 감시.

## Hitch의 3대 원인

### 1) 메인 스레드 점유

- 비즈니스 로직 동기 호출
- 동기 디코드/디스크 IO
- 큰 컬렉션 동기 정렬/필터
- 메인 actor의 무거운 작업

대응:
- `Task.detached`로 분리
- 결과만 main으로 hop
- prefetch + cache

### 2) Commit 단계 비용

`CATransaction.commit` 단계에서 *layer tree 전체 변경 사항*을 Render Server로 전송. 비용 원인:
- 많은 layer 수 (특히 cell 수 × layer 수)
- 복잡한 mask/shadow
- off-screen rendering (자세히는 [04-uikit/offscreen-rendering.md](../04-uikit/offscreen-rendering.md))

### 3) GPU / Render Server

- 큰 텍스처 합성
- 블러, 복잡 shader
- 메모리 압박으로 텍스처 swap

GPU 영역은 Instruments → *Metal System Trace*로 확인.

## 측정 도구 매핑

| 도구 | 잡는 것 |
|---|---|
| Instruments → Time Profiler | 메인 스레드 어디서 시간을 쓰는가 |
| Instruments → Animation Hitches | 어떤 프레임이 overrun, 얼마나 |
| Instruments → Core Animation | commit 단계 분해 |
| Instruments → Metal System Trace | GPU 명령 시간 |
| Xcode → Performance Bottlenecks | 자동 분석, 빠른 entry |
| MetricKit | 실 사용자 통계 |

## 흔한 패턴별 대응

### 스크롤 끊김

1. *셀 안 동기 작업* 의심 — 이미지 디코드, 큰 계산
2. *셀 layer 복잡도* — cornerRadius+shadow+mask
3. *prefetch 미설정* — `UICollectionViewDataSourcePrefetching`

`Instruments → Animation Hitches`로 *몇 ms overrun*인지 정확히.

### 큰 이미지 표시

- 원본을 그대로 띄우지 말고 **downsampling**:

```swift
func downsample(url: URL, to size: CGSize, scale: CGFloat) -> UIImage? {
    let opts: [CFString: Any] = [
        kCGImageSourceShouldCache: false,
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceThumbnailMaxPixelSize: max(size.width, size.height) * scale
    ]
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary)
    else { return nil }
    return UIImage(cgImage: cg)
}
```

자세히는 [image-and-scroll.md](image-and-scroll.md).

### Animation hitch

- *동시에 너무 많은* 애니메이션
- 큰 layer 전체 redraw
- 애니메이션 중 `frame` 변경 (transform 대신)

## ProMotion 대응

- 콘텐츠가 *부드러운 움직임*이면 120Hz 유지
- `CADisplayLink.preferredFrameRateRange` 명시
- 동영상 등은 자동으로 적절 빈도 선택

```swift
let link = CADisplayLink(target: self, selector: #selector(tick))
link.preferredFrameRateRange = CAFrameRateRange(minimum: 80, maximum: 120, preferred: 120)
```

## SwiftUI에서의 hitch

- 큰 View body 잦은 재호출 → 분할
- `@Observable` 정밀 추적으로 *불필요한 재호출* 감소
- LazyVStack 사용 (eager VStack 금지)
- `_printChanges()`로 *무엇이 바뀌어 호출*되는지 확인

자세히는 [05-swiftui/performance.md](../05-swiftui/performance.md).

## 흔한 함정 / Follow-up

- **Q. 시뮬레이터에서 hitch 측정?**
  *경향은 보이지만* 실 디바이스가 절대값으로 의미 있음. 시뮬레이터는 호스트 Mac 영향.

- **Q. Debug 빌드 측정?**
  Debug는 최적화 X → 잘못된 결론. 항상 *Release 빌드 + 디버거 detach*.

- **Q. main thread는 안 막혔는데 hitch?**
  Commit 단계, GPU, Render Server 정체. Metal trace로 확인.

- **Q. hitch가 *간헐적*?**
  사용자별 데이터/네트워크/디바이스 조합 차이. *MetricKit 백엔드 수집* + 비율 추적.

- **Q. ProMotion 디바이스만 hitch?**
  120Hz 예산이 *반*이라 60Hz에선 안 보이던 비용이 노출. 동일 작업 더 가벼워야.

- **Q. CPU usage 50%인데 왜 hitch?**
  *평균*이 아닌 *프레임 분포*가 중요. 5개 프레임은 5ms, 1개 프레임은 30ms일 수 있음. p99로 봐야.

## 참고

- WWDC 2020: Eliminate animation hitches with XCTest / XCTestable
- WWDC 2022: Explore UI animation hitches and the render loop
- WWDC 2021: What's new in MetricKit
- Apple: Hitches and How to Diagnose Them
