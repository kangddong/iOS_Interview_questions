# RunLoop 심화 — UIKit 메인 스레드의 동작 단위

> 한 줄 요약 — RunLoop은 *이벤트 → 처리 → 렌더링 → 잠자기*를 반복하는 **메인 스레드의 라이프사이클 엔진**. UIKit의 모든 input, timer, animation, layout/draw가 RunLoop의 *특정 모드/단계*에 묶여 실행된다. 이걸 알아야 *왜 어떤 작업이 막히고, 어떤 작업이 다음 프레임으로 미뤄지는지* 설명할 수 있다.

## RunLoop 한 사이클의 단계

```
1) Source 0 (소켓, custom input source) 처리
2) Source 1 (포트, 시스템 이벤트) 처리
3) Timer 처리
4) Observer 콜백 (entry, beforeTimers, beforeSources, beforeWaiting, afterWaiting, exit)
5) 처리 후 idle → mach_msg로 잠자기
6) 이벤트 도착하면 깨어남 → 다음 사이클
```

각 *RunLoop mode*마다 어떤 source/timer/observer를 listen할지 다름. 모드를 바꾸면 다른 입력만 받음.

## 주요 RunLoop Mode

| Mode | 사용 |
|---|---|
| `.default` (`kCFRunLoopDefaultMode`) | 일반 모드 |
| `.common` (`kCFRunLoopCommonModes`) | default + tracking 모두 |
| `.tracking` (`UITrackingRunLoopMode`) | 스크롤/터치 중 (UIKit) |
| `.eventTracking` | 일반 이벤트 처리 |
| `.modalPanel` (macOS) | 모달 알림 |

## 스크롤 중 Timer가 안 도는 이유

```swift
let timer = Timer(timeInterval: 1, repeats: true) { _ in ... }
RunLoop.current.add(timer, forMode: .default)
```

기본 모드로만 등록 → 스크롤 시작하면 `tracking` 모드로 진입 → timer 중단.

해결:
```swift
RunLoop.current.add(timer, forMode: .common)   // 둘 다 listen
```

## CADisplayLink

```swift
let link = CADisplayLink(target: self, selector: #selector(tick))
link.add(to: .main, forMode: .common)
```

- 화면 갱신 *직전* 호출 (60Hz/120Hz/ProMotion)
- 게임/애니메이션 동기화 용도
- Timer보다 *프레임에 정확히 맞춰* 발화

## UIKit과 RunLoop의 결합

매 RunLoop 사이클 *마지막*에 *layout + display + commit*이 실행되는 시점이 있음:

```
RunLoop iteration
  ├─ Input/Timer 처리
  ├─ setNeedsLayout/Display 호출 누적
  ├─ beforeWaiting observer 시점
  │    ├─ setNeedsLayout → layoutSubviews
  │    └─ setNeedsDisplay → draw(_:)
  ├─ Core Animation commit (CATransaction)
  └─ Sleep
```

= **layout/display는 즉시가 아니라 *RunLoop 끝에 한 번* 일어남**. 그래서:
- 같은 프레임에 `setNeedsLayout`을 100번 호출해도 *1번만* `layoutSubviews` 실행
- `frame` 변경 직후 새 frame을 *즉시 읽으면 갱신 전 값*
- `layoutIfNeeded()`로 강제 동기화 가능

## 메인 스레드의 *예산*

60Hz 디스플레이 = 한 프레임 16.67ms. 이 안에 다음을 끝내야 hitch 없음:
- App: 이벤트 처리, 비즈니스 로직, layout, draw, Core Animation commit
- Render Server (별도 프로세스): GPU에 제출

120Hz면 8.33ms. ProMotion(가변)이면 더 짧을 수도.

UI에서 RunLoop이 막히면 → 다음 프레임 못 그림 → hitch.

자세히는 [rendering-pipeline.md](rendering-pipeline.md).

## RunLoop이 `mach_msg`로 잠자는 의미

idle 상태에선 *kernel call로 block*. CPU 0% → 배터리 효율. 이벤트 (터치, 타이머, 메시지)가 오면 `mach_msg`가 깨어나며 다음 cycle 시작.

→ "main thread가 busy waiting하지 않는다"의 메커니즘.

## 백그라운드 스레드의 RunLoop

```swift
Thread.detachNewThread {
    let timer = Timer(timeInterval: 1, ...) { ... }
    RunLoop.current.add(timer, forMode: .default)
    RunLoop.current.run()   // 명시 호출 필요
}
```

- 메인 외 스레드는 RunLoop이 *기본 실행되지 않음*
- `.run()` 호출해야 cycle 시작
- 보통 직접 만들 일은 드물고, GCD/Operation/Concurrency가 대체

## Combine `.run(on:)` / Swift Concurrency와의 관계

- Swift Concurrency는 *RunLoop 없음*. cooperative pool의 worker는 그냥 task 잡으면 실행
- `@MainActor`는 main thread에 hop하지만 *RunLoop cycle을 직접 제어하지 않음*
- 즉 `Task { @MainActor in ... }`도 결국 *RunLoop이 깨워서* 실행되는 모델

자세히는 [03-concurrency/concurrency-runtime.md](../03-concurrency/concurrency-runtime.md).

## 흔한 함정 / Follow-up

- **Q. 왜 `setNeedsLayout` 직후 frame을 읽으면 안 갱신됨?**
  layout이 다음 RunLoop 끝에 일어나기 때문. `layoutIfNeeded()`로 강제.

- **Q. `dispatch_async(main_queue)`의 작업이 *언제* 실행?**
  현재 RunLoop 사이클이 끝나고 *다음 cycle의 source 처리 단계*. 즉시 X.

- **Q. 비동기 UI 업데이트가 *왜 1프레임 늦어지는지*?**
  현재 cycle은 이미 layout/commit이 끝났거나 진행 중 → 새 변경은 다음 cycle 반영.

- **Q. Timer 정확도가 떨어지는 이유?**
  RunLoop이 *근사 시점에 깨어남*. 정확 동기화엔 CADisplayLink, DispatchSourceTimer가 우월.

- **Q. `RunLoop.main.run(until:)`을 사용해 동기 대기?**
  안티패턴. 메인 스레드 막기로 *데드락 위험* + UI 정지. unit test의 expectation 외엔 거의 안 씀.

- **Q. CFRunLoop과 RunLoop 차이?**
  Swift `RunLoop`은 Foundation 래퍼, 내부는 Core Foundation `CFRunLoop`. mode 비교 시 string identifier가 다를 수 있어 호환 주의.

## 참고

- Apple: Threading Programming Guide → RunLoop
- WWDC 2015: Advanced Touch Bar & RunLoop (간접)
- CoreAnimation 트랜잭션과 RunLoop의 결합 → CFRunLoopObserver 활용
