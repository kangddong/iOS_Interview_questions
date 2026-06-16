# 렌더링 파이프라인 (UIKit / Core Animation)

> 한 줄 요약 — UIKit이 화면에 그리는 흐름은 **이벤트 → 레이아웃 → 디스플레이 → 커밋 → 렌더 서버 → GPU**의 여러 단계. 메인 스레드는 *커밋까지*만 책임지고, 실제 렌더는 별도 프로세스(`backboardd`/`render-server`)가 수행한다.

## 한 프레임에 일어나는 일

```
[ Main Thread ]                                  [ Render Server ]            [ GPU ]
 1. 이벤트 처리 (touch/timer/runloop input)
 2. 레이아웃     (setNeedsLayout → layoutSubviews)
 3. 디스플레이   (setNeedsDisplay → draw(_:))
 4. 준비/커밋    (CATransaction commit)
                                       ───→ 5. 디코드/합성 (off-screen pass)
                                                                       ───→ 6. 그리기
                                                                                ───→ 7. Display 신호
```

- 60Hz: 한 프레임 16.67ms. 메인 스레드는 *4번 커밋까지* 그 시간 안에 끝내야.
- ProMotion 120Hz: 8.33ms.

## 단계별 설명

### 1) 이벤트
RunLoop이 입력을 처리. 터치 이벤트, 타이머, perform(_:on:), URLSession 콜백 등.

### 2) 레이아웃
`setNeedsLayout` → 다음 사이클의 *layout pass*에서 `layoutSubviews()` 호출. AutoLayout이라면 제약식을 풀이.

### 3) 디스플레이
`setNeedsDisplay` → `draw(_:)` 호출 → CPU에서 비트맵 생성 후 layer.contents에 업로드. UILabel/UIImageView는 보통 이 경로를 안 탄다 (이미지/텍스트 직접 처리).

### 4) Commit
`CATransaction.commit()`이 *모든 layer 변경*을 하나의 트랜잭션으로 RenderServer에 전송. UIView.animate 같은 API는 내부적으로 CATransaction을 묶음.

### 5) Render Server
별도 프로세스가 layer 트리를 받아 *GPU 명령*으로 변환. 그림자/마스크/블러 같은 비트맵 필터를 *off-screen pass*로 처리.

### 6) GPU
실제 픽셀 합성. 이 시간이 길어지면 GPU bound — 보통 over-rendering 또는 큰 텍스처가 원인.

### 7) Display
디스플레이 컨트롤러가 새 frame buffer를 화면에 송출.

## 메인 스레드를 막는 단계

| 단계 | 흔한 원인 |
|---|---|
| 이벤트 | 핸들러가 너무 많은 일을 함, sync I/O |
| 레이아웃 | 큰 view 트리, 복잡한 AutoLayout 충돌, self-sizing 폭주 |
| 디스플레이 | `draw(_:)` 안에서 큰 path/text 그리기 |
| 커밋 | 변경 layer가 많고 implicit anim이 다수 |

## Off-Screen Rendering — 왜 비싼가

GPU가 *최종 화면이 아닌 중간 텍스처*에 그렸다가 다시 합성. 다음 트리거:

- `cornerRadius` + `masksToBounds` + 비단순 콘텐츠
- `mask` 사용
- `shadowPath` 미지정 그림자
- `shouldRasterize`
- group opacity

스크롤 셀에서 다발로 발생하면 frame drop 직격. *Instruments → Core Animation → Color Off-screen Rendered Yellow*로 시각적 확인.

## 해결 패턴

```swift
// 그림자 + cornerRadius — 컨테이너 분리
let shadowView = UIView()
shadowView.layer.shadowPath = UIBezierPath(roundedRect: bounds, cornerRadius: 12).cgPath
shadowView.layer.shadowOpacity = 0.2

let contentView = UIView()
contentView.layer.cornerRadius = 12
contentView.layer.masksToBounds = true
shadowView.addSubview(contentView)
```

또는 *미리 렌더링된 비트맵*을 imageView에 넣음.

## Tile-based Deferred Rendering (TBDR)

iOS GPU는 화면을 타일로 나눠 렌더. 의미:
- 알파 블렌딩이 많은 영역은 *각 타일*이 더 많은 fragment 처리.
- 큰 단순 배경 + 작은 복잡 콘텐츠 패턴이 유리.
- 너무 많은 layer 겹침은 over-draw.

## Display Link

```swift
let link = CADisplayLink(target: self, selector: #selector(tick))
link.add(to: .main, forMode: .common)
```

화면 갱신 주기에 맞춰 호출. 게임/그리기 앱에서 사용. 60Hz 고정 가정 금지 — `link.targetTimestamp - link.timestamp`로 실제 dt.

## 측정

- **Animation Hitches** Instruments — 사용자 시각 끊김 직접 측정.
- **Core Animation** 도구 — 어느 layer가 off-screen pass인지.
- **Time Profiler** — 메인 스레드의 어느 함수가 길었는지.

→ [10-performance/main-thread-and-hitch.md](../10-performance/main-thread-and-hitch.md)

## 흔한 함정 / Follow-up

- **Q. `view.layer.draw(in:)` 직접 구현은 언제?**
  PDF/그래프/커스텀 도형. 일반 UI 요소는 표준 view + layer 속성 조합으로 거의 해결.

- **Q. 한 프레임에 commit 못 하면?**
  hitch. 더 길면 hang. 사용자는 "끊김" 또는 "멈춤"으로 체감.

- **Q. SwiftUI는 어떻게 그리나?**
  내부적으로 같은 Core Animation/RenderServer. SwiftUI의 body가 자주 호출돼도 *layer 변경*이 없으면 commit 부담 없음.

- **Q. `shouldRasterize`가 항상 좋은가?**
  *변하지 않는* 복잡한 layer에만. 자주 변하는 layer는 캐시 무효화로 더 느려짐. `rasterizationScale = UIScreen.main.scale` 함께.

- **Q. 화면 회전 시 레이아웃 폭주.**
  trait collection 변경 + layoutSubviews가 모든 view에 호출. SwiftUI는 GeometryReader 변경으로 트리 일부 재계산. 비싼 계산은 캐시.

## 참고

- WWDC 2014: Advanced Graphics and Animations for iOS Apps
- WWDC 2018: iOS Memory Deep Dive
- WWDC 2021: Eliminate Animation Hitches
