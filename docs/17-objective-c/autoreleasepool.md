# autoreleasepool

> 한 줄 요약 — `autorelease`로 등록된 객체를 일괄 release하는 풀. 메인 스레드는 RunLoop이 매 사이클마다 자동으로 drain해 주지만, 대량 임시 객체를 만드는 루프나 백그라운드 스레드에서는 명시적 `@autoreleasepool {}`이 필요하다.

## 핵심 개념

- `[obj autorelease]` 호출은 "지금 release하지 말고, 현재 스레드의 가장 가까운 autoreleasepool이 drain될 때 release하라"는 표시.
- 풀은 **스레드 로컬** 스택. 중첩 가능. push한 풀이 pop될 때 그 사이 등록된 모든 autoreleased 객체가 release.
- iOS 앱의 메인 스레드는 `NSRunLoop`이 매 사이클(이벤트 처리 사이) 자동으로 풀을 push/pop → 평소엔 신경 쓸 일 없음.

## 명시적 사용이 필요한 경우

1. **반복문 안에서 대량 임시 객체 생성**
   메인 RunLoop이 drain하기까지 시간이 길어 메모리 피크가 폭증.

2. **`NSThread` / `pthread`로 만든 백그라운드 스레드**
   자동 pool이 없다. autoreleased 객체가 release되지 않고 누적.

3. **장시간 도는 백그라운드 작업** (`NSOperation`, `DispatchQueue` 위에서 NS 계열 객체 다량 사용)
   GCD는 큐가 자체적으로 pool을 가지지만, 루프 단위로 비우려면 명시적 사용.

## 코드 예시

### 이미지 일괄 처리

```objc
for (NSURL *url in urls) {
    @autoreleasepool {
        NSData *data = [NSData dataWithContentsOfURL:url];
        UIImage *img = [UIImage imageWithData:data];
        UIImage *thumb = [self resize:img to:thumbSize];
        [UIImagePNGRepresentation(thumb) writeToURL:[self dstFor:url] atomically:YES];
    }
    // 풀 종료 → 이번 iteration에서 만든 autoreleased 객체 모두 release
}
```

### Swift에서도 동일

```swift
for url in urls {
    autoreleasepool {
        let data = try Data(contentsOf: url)
        let img = UIImage(data: data)?.resized(to: thumbSize)
        try img?.pngData()?.write(to: dst(url))
    }
}
```

### NSThread

```objc
- (void)workerThreadMain {
    @autoreleasepool {  // 스레드 진입점에 반드시
        while (!self.cancelled) {
            @autoreleasepool {  // 루프 단위 풀
                [self doWork];
            }
        }
    }
}
```

## NSAutoreleasePool vs @autoreleasepool

- **NSAutoreleasePool** (OLD, MRC 시절):
  ```objc
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  // ...
  [pool drain]; // 또는 [pool release]
  ```
  Exception 발생 시 drain 보장 안 됨. 사용 금지 (ARC에선 컴파일도 안 됨).

- **`@autoreleasepool { }`** (NEW, ARC/MRC 둘 다):
  - 컴파일러가 push/pop을 자동 삽입.
  - Exception/early return에도 안전.
  - **무조건 이것만 사용**.

## Swift에서

순수 Swift 객체(class)는 ARC가 *각 시점에* release를 호출하므로 일반적으로 autoreleasepool 영향 없음. 하지만:

- `Foundation`/`UIKit`/`CG*` 같은 ObjC bridge를 거치는 API는 여전히 autorelease 객체를 만들 수 있다.
- `Data(contentsOf:)`, `UIImage(data:)`, `String(contentsOf:)` 등 NS 계열에 내려가는 API는 autoreleased.
- 대량 처리 시 `autoreleasepool { }`로 감싸면 메모리 피크 ↓.

## DispatchQueue와의 관계

- GCD 워커 스레드는 작업 단위마다 자체 autoreleasepool을 push/pop한다.
- 그러나 *한 클로저 안에서 1만 개의 임시 객체*를 만들면 그 클로저가 끝나기 전엔 pool drain이 일어나지 않는다 → 내부에 명시적 `autoreleasepool` 권장.

## 측정으로 결정

- Instruments → Allocations로 *Persistent / Transient* 그래프 확인.
- 루프 도중 사용량 급증 + 끝나면 떨어지는 패턴이면 명시적 pool 도입 후 비교.
- 차이 없으면 굳이 추가하지 말 것 (가독성 비용).

## 흔한 함정 / Follow-up 질문

- **Q. ARC에서도 `@autoreleasepool`이 필요한가?**
  필요하다. ARC는 retain/release 자동 삽입일 뿐, autorelease 자체는 여전히 일어난다. convenience initializer(`[NSString stringWithFormat:]`)는 autoreleased 객체를 반환한다.

- **Q. 메인 스레드에서 autoreleasepool 안 써도 되는 이유?**
  RunLoop이 매 사이클마다 자동 push/pop. 단, *한 메서드 안에서 대량 객체*를 만드는 경우 그 사이클이 끝나기 전엔 안 비워짐 → 명시적 pool 의미 있음.

- **Q. autorelease된 객체를 풀 밖으로 반환하면?**
  반환 시점에 호출자의 풀로 옮겨진다(`objc_autoreleaseReturnValue` + `objc_retainAutoreleasedReturnValue` 최적화로 retain/autorelease 쌍이 제거되기도 함).

- **Q. NSThread vs DispatchQueue의 autoreleasepool 차이?**
  NSThread는 사용자가 진입점에 직접 풀을 깔아야 함. DispatchQueue는 워커가 자동으로 깔아준다.

- **Q. autoreleasepool 안의 객체가 풀 종료 후에도 살아있을 수 있나?**
  외부에서 strong 참조가 있으면 그 참조의 lifetime을 따라간다. autorelease는 "이 풀이 비워질 때 release 한 번을 수행"하는 것일 뿐, 무조건 0이 된다는 의미가 아니다.

- **Q. Swift async/await 환경에서는?**
  Task가 백그라운드로 점프하면 컨텍스트에 따라 자동 풀이 있을 수도 없을 수도. NS API 대량 사용 시 명시적 `autoreleasepool { }`로 명확히.

## 참고

- Apple Docs: Using Autorelease Pool Blocks
- WWDC 2011: Objective-C Advancements in Depth (ARC)
- [ARC](arc-and-mrc.md)
