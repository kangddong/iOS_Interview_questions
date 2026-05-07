# RunLoop과 Main Thread

> 한 줄 요약 — RunLoop은 **스레드를 살아있게 유지하며 이벤트(터치/타이머/포트)를 처리하는 루프**. UI 업데이트가 메인 스레드여야 하는 이유는 UIKit이 메인 RunLoop와 강결합되어 있기 때문.

## 메인 스레드의 책임

- 터치/제스처 이벤트 디스패치
- 레이아웃/그리기/애니메이션 커밋
- `setNeedsLayout` / `setNeedsDisplay` 결과 반영
- 타이머, `URLSession` 델리게이트(기본), Combine 메인 스케줄러

UI를 백그라운드 스레드에서 만지면 *대부분 즉시 크래시는 안 나지만*, 렌더링/이벤트 시스템과 경쟁 조건이 발생해 **랜덤 깜빡임/누락/크래시**로 이어진다. Xcode의 Main Thread Checker가 잡아 줌.

## RunLoop이란

스레드 위에서 도는 무한 루프:

```
while shouldKeepRunning {
    // 1) 입력 소스(터치, 타이머) 대기
    // 2) 이벤트 처리
    // 3) 다시 sleep
}
```

- 메인 스레드는 **앱 시작 시 자동으로 RunLoop 실행**.
- 워커 스레드는 기본으로 RunLoop이 안 도므로, `Timer`/델리게이트 콜백이 동작하지 않을 수 있음.

## RunLoop Mode

같은 RunLoop이라도 *현재 모드*에 따라 처리할 소스가 달라진다.

| Mode | 시점 |
|---|---|
| `default` | 일반 |
| `tracking` | UIScrollView 추적 중 |
| `common` | 위 두 모드를 포함하는 의사 모드 |

```swift
// 스크롤 중에도 동작하게 하려면 .common
RunLoop.main.add(timer, forMode: .common)
```

스크롤 중 `Timer`가 멈춘 것처럼 보이는 흔한 버그 원인 = 기본 모드로만 등록되어 tracking 모드에서 무시되는 것.

## 렌더링 파이프라인 한 사이클

```
Event → Commit (CALayer tree) → Render Server (백그라운드) → GPU → Display
                ↑
        메인 스레드 책임
```

- 60Hz 기준 **한 프레임 16.67ms** 안에 메인 스레드가 커밋을 끝내야 함.
- 초과하면 hitch(프레임 드롭) → 끊김 체감.
- 120Hz ProMotion은 8.33ms.

## 흔한 실수와 해결

```swift
// ❌ 백그라운드에서 UI 갱신
DispatchQueue.global().async {
    self.label.text = result   // 위험
}

// ✅ 메인으로 전환
DispatchQueue.global().async {
    let result = compute()
    DispatchQueue.main.async { self.label.text = result }
}

// ✅ async/await
func load() async {
    let result = await compute()
    label.text = result          // @MainActor 컨텍스트
}
```

## 흔한 함정 / Follow-up

- **Q. UI 업데이트는 왜 메인 스레드여야 하나?**
  UIKit/AppKit의 거의 모든 객체가 thread-unsafe. 메인 RunLoop이 레이아웃 사이클을 단일 스레드에서 처리하도록 설계됨. 다른 스레드에서 만지면 일관성을 보장할 수 없음.

- **Q. 메인 스레드 == 메인 큐?**
  엄밀히는 다르다. 메인 *큐*는 메인 *스레드*에서만 실행되도록 묶인 시리얼 큐. 코드 작성 관점에선 동일하게 다뤄도 무방.

- **Q. `Thread.isMainThread`로 분기하는 게 안전한가?**
  코드 흐름이 복잡해지고 호출자에 따라 동작이 달라짐. *호출자가 메인을 보장*하도록 계약을 명확히 하는 편이 낫다. async/await은 `@MainActor`로 컴파일 타임에 강제 가능.

- **Q. 백그라운드 스레드에서 RunLoop을 직접 돌려야 하는 경우?**
  거의 없음. 옛날 `NSURLConnection` 델리게이트 같은 케이스 외엔 GCD/async-await로 충분.

- **Q. hitch와 hang의 차이?**
  hitch는 *한 프레임* 놓침(끊김 체감), hang은 *수백ms 이상* 메인이 멈춘 상태(앱이 얼어보임). Instruments에서 별도 도구로 측정.

## 참고

- Apple Docs: Threading Programming Guide / Run Loops
- WWDC 2018: Measuring Performance Using Logging
- WWDC 2021: Eliminate Animation Hitches with XCTest
