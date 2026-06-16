# autoreleasepool

> 한 줄 요약 — ObjC 시절 `autorelease`된 객체들이 *모이는 풀*. 주기마다 비워서 메모리 회수. **반복문에서 다량의 임시 객체가 쌓이는 경우** 명시적 `autoreleasepool {}`로 즉시 비워 준다.

## 등장 배경

ObjC는 `release` 호출 시점을 *지연*시키기 위해 `autorelease`를 사용. 객체는 즉시 죽지 않고, *현재 스레드의 autoreleasepool*에 등록되어 *풀이 비워질 때* 일괄 release.

iOS 앱의 메인 스레드는 RunLoop이 매 사이클마다 자동으로 autoreleasepool을 돌려 비운다 → 평소엔 신경 쓸 일 없음.

## 명시적 사용이 필요한 경우

1. **반복문 안에서 많은 임시 객체 생성** — pool 자동 비움 시점까지 메모리 폭증.
2. **백그라운드 스레드 (Thread/pthread)** — 자동 풀이 없음.
3. **다량의 NS 계열 객체를 다루는 import 작업**.

## 예시 — 이미지 일괄 처리

```swift
for url in urls {
    autoreleasepool {
        let data = try Data(contentsOf: url)
        let img = UIImage(data: data)?.resized(to: thumbSize)
        try img?.pngData()?.write(to: dst(url))
    }
}
```

`UIImage`가 내부적으로 `CGImage`/`autoreleased` 객체를 만들 수 있음. pool 없이 돌리면 루프가 끝날 때까지 메모리 누적 → 메모리 워닝.

## Swift 객체에는 영향 없음?

순수 Swift는 ARC가 *각 시점*에 release를 호출하기 때문에 일반적으로 autoreleasepool 영향 없음. 하지만:

- ObjC bridge를 거치는 API (`Foundation`, `UIKit`, `CG*`)는 여전히 autorelease 객체를 만들 수 있음.
- *대량 ObjC 객체를 다룬다면* autoreleasepool이 의미.

## 측정으로 결정하라

- Instruments → Allocations로 *Persistent / Transient* 살피기.
- 반복문 도중 사용량이 급증하면 `autoreleasepool` 도입 후 비교.
- 차이가 없으면 굳이 넣지 말 것 (가독성 비용).

## DispatchQueue.global과의 관계

GCD 큐는 자체적으로 autoreleasepool을 가짐 (필요 시). 그래도 *루프 단위*로 비우려면 명시적 사용.

## 흔한 함정 / Follow-up

- **Q. 메인 스레드에서 autoreleasepool을 직접 안 써도 되는 이유?**
  RunLoop이 매 사이클 자동 비움. 단, *한 메서드 안에서 1000개 임시 객체*를 만든다면 해당 사이클이 끝나기 전엔 안 비워짐 → 명시적 pool 의미 있음.

- **Q. Swift `Data(contentsOf:)`도 autorelease 객체인가?**
  내부 구현이 NS/CF로 교차되는 부분이 있어 autoreleased 객체가 생길 수 있음. 큰 파일을 반복 처리할 때 pool 효과 있음.

- **Q. async/await 환경에선?**
  Task가 백그라운드로 점프하면 그 컨텍스트에 자동 풀이 있을 수도/없을 수도. 의심되면 명시적 pool.

- **Q. autoreleasepool을 잘못 쓰면 부작용은?**
  pool 안에서 *외부로 빠져나가는 객체*를 의도하지 않게 release할 수 있다. 다만 보통은 안에서 만들어 안에서 끝나는 임시 객체에 사용하므로 문제 적음.

## Objective-C 비교

- `@autoreleasepool { }`는 ObjC 출신. Swift `autoreleasepool { ... }`은 그 wrapper.
- 옛 ObjC는 `NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init]; ...; [pool drain];` 형태. 예외 안전성 문제로 `@autoreleasepool` 블록으로 일원화됨.
- 순수 Swift 객체는 autorelease를 거의 안 거치지만, `Foundation`/`UIKit`/`CG*`처럼 NS 계열로 내려가는 API는 ObjC와 동일하게 autoreleased 객체를 만들 수 있다 → 대량 처리 루프에서 효과 동일.
- `NSThread`로 만든 스레드는 자동 풀이 없으므로 진입점에 반드시 `@autoreleasepool { }` 필요 — Swift `Thread`도 동일.
- 더 깊게: [17-objective-c/autoreleasepool](../17-objective-c/autoreleasepool.md)

## 참고

- Apple Docs: Using Autorelease Pool Blocks
- WWDC 2011: Objective-C Advancements in Depth (ARC)
