# ARC와 MRC

> 한 줄 요약 — ObjC의 메모리 관리 모델 변천사: MRC(`retain`/`release` 수동) → ARC(컴파일러가 코드에 retain/release 호출을 자동 삽입). 런타임 GC가 아니다.

도입 버전: ARC — Xcode 4.2 / iOS 5+, Mac OS X 10.7+

## 핵심 개념

- **MRC (Manual Retain Count)**
  - 객체 생성 시 retain count = 1.
  - `retain` / `release` / `autorelease`를 개발자가 직접 호출.
  - **"NARC" 규칙**: `new`, `alloc`, `retain`, `copy/mutableCopy`로 받은 객체는 본인이 소유 → 직접 `release` 책임.
  - 그 외(convenience initializer 등)는 autoreleased 객체이므로 release하지 않음.
- **ARC (Automatic Reference Counting)**
  - 컴파일러가 빌드 타임에 `retain`/`release`/`autorelease` 호출을 자동 삽입.
  - Ownership qualifier(`__strong`/`__weak`/`__unsafe_unretained`/`__autoreleasing`)로 동작 제어.
  - 런타임 GC와 다르다 — GC 스레드/STW 없음, 결정적 해제.
  - 파일 단위 `-fno-objc-arc` 플래그로 MRC 파일과 혼용 가능 (옛 라이브러리 통합 시).

## 동작 원리

ARC 컴파일러가 객체의 lifetime을 분석해 다음 호출들을 삽입한다:

- 변수에 대입: `objc_retain(newValue); objc_release(oldValue);` (또는 `objc_storeStrong`)
- 변수 scope 탈출: `objc_release`
- 메서드 반환값: 호출자가 `objc_retainAutoreleasedReturnValue`로 fast path 가능 (autorelease + retain을 쌍으로 짧게 줄임)
- `__weak` 대입: `objc_storeWeak` (약참조 테이블 등록)

런타임은 객체 헤더의 retain count(modern은 isa 비트 + sidetable)를 atomic 증감, 0이 되면 즉시 `-dealloc` 호출 후 메모리 반환.

## 코드 예시

### MRC

```objc
NSString *s = [[NSString alloc] initWithFormat:@"%d", 1]; // 소유: count = 1
[s retain];   // count = 2
[s release];  // count = 1
[s release];  // count = 0 → dealloc

// convenience initializer → autoreleased
NSString *t = [NSString stringWithFormat:@"%d", 2]; // 소유 X, release 금지
```

### ARC

```objc
NSString *s = [[NSString alloc] initWithFormat:@"%d", 1];
// scope 끝 → 컴파일러가 objc_release 자동 삽입

// retain/release 직접 호출하면 컴파일 에러
```

### MRC에서의 dealloc

```objc
// MRC
- (void)dealloc {
    [_name release];
    [super dealloc];  // 필수
}

// ARC
- (void)dealloc {
    // ivar release 불필요, [super dealloc] 호출 금지 (컴파일러가 처리)
    // 정리할 C 리소스나 observer 해제만 직접
}
```

## 비교

| 구분 | MRC | ARC |
|---|---|---|
| retain/release 작성 | 수동 | 컴파일러 자동 |
| `[super dealloc]` | 필수 | 호출 금지 (컴파일 에러) |
| 옛 코드 호환 | 자체 | `-fno-objc-arc`로 파일 단위 혼용 |
| 성능 | 동일 | 동일 (컴파일러 최적화로 ARC가 더 빠른 경우도 있음) |
| 학습 곡선 | 높음 (소유 규칙 암기) | 낮음 |
| Retain cycle 자동 해결 | X | X (양쪽 다 개발자가 끊어야 함) |

## ARC vs 추적형 GC — 본질적 차이

| 축 | ARC | 추적형 GC (Java/.NET/JS) |
|---|---|---|
| 동작 시점 | **컴파일 타임**에 retain/release를 코드에 삽입 | **런타임**에 루트로부터 도달 가능성(reachability) 주기적 추적 |
| 해제 판단 | 참조 카운트 == 0 | 루트에서 도달 불가 |
| 순환 처리 | 카운트가 0이 안 돼 못 끊음 → `weak`/`unowned`로 수동 해결 | 루트에서 끊기면 순환이 있어도 자연 수거 |
| 일시 정지 | 없음 (release 호출 시점에 인라인 해제) | STW 구간 존재 (현대 GC도 최소 STW 남음) |
| 메모리 풋프린트 | refcount 저장 공간만 — 작고 예측 가능 | 효율 위해 살아있는 객체의 1.5~수 배 헤드룸 필요 |
| 비용 분포 | 참조 변경 시점마다 작게 분산 (atomic inc/dec) | 수거 사이클에 몰림 (대신 bulk 처리로 throughput 유리) |
| 해제 결정성 | 결정적 — 마지막 참조가 사라지는 즉시 `deinit`/`dealloc` | 비결정적 — finalizer 시점 불명, 리소스 정리에 못 씀 |

**핵심**: "ARC는 GC의 한 종류가 아니다." GC는 런타임에 힙을 스캔하는 별도 시스템이 있고, ARC는 그저 컴파일러가 끼워 넣은 retain/release 호출의 합이다. 같은 "자동 메모리 관리"라는 표현 아래 묶이지만 작동 원리는 다르다.

- **ObjC ARC**: 컴파일 타임 삽입. retain cycle 수동.
- **Java/.NET GC**: 런타임 reachability. cycle 자동.
- **Swift ARC**: ObjC ARC와 본질 동일. struct/enum은 ARC 대상 아님(값 의미). `weak`/`unowned`로 cycle 제어.

## STW (Stop-The-World)

추적형 GC가 힙을 스캔해 어떤 객체가 살아있는지 판단하려면 *그 순간 객체 그래프가 고정*되어 있어야 한다. 스캔 도중 앱 코드가 참조를 바꿔버리면 "방금 살아있다고 본 객체"가 다음 순간 죽어 일관성이 깨진다. 그래서 GC는 수거의 특정 구간 동안 모든 뮤테이터 스레드를 일시 정지시킨다 — 이게 **stop-the-world**다.

문제는 이 멈춤이 **사용자가 체감하는 hitch/jank**가 된다는 점이다. 60fps면 프레임당 16.6ms 예산인데 STW가 그 안에 안 끝나면 프레임 드랍이 생긴다. 게다가 언제·얼마나 멈출지 비결정적이라 UI·오디오처럼 실시간성이 중요한 영역에서 치명적이다.

현대 GC(ZGC, Shenandoah, Android ART concurrent GC)는 대부분의 작업을 앱과 동시(concurrent)에 돌려 STW를 수 밀리초 이하로 줄였다. 그러나 멈춤을 0으로 만들진 못하고(루트 스캔 등 최소 STW는 남음), 그 대가로 구현 복잡도·메모리 헤드룸·CPU를 더 쓴다. **ARC는 이 STW라는 개념 자체가 없다** — 해제가 그냥 release 호출 시점에 인라인으로 일어난다.

## Apple이 GC 대신 ARC를 고른 이유

세 축으로 정리.

1. **메모리 풋프린트** — GC는 효율 위해 살아있는 객체 크기의 1.5~수 배 헤드룸이 필요하다. 모바일에선 비싼 비용이고, 같은 동작 앱이 GC 환경에서 더 많은 RAM을 먹게 된다. ARC는 refcount만큼만 추가되어 풋프린트가 작고 예측 가능. (같은 사양에서 iOS가 더 적은 RAM으로 버틴다는 평가의 근거 중 하나로 자주 언급된다.)
2. **결정적 해제** — 마지막 참조가 사라지는 *즉시* `dealloc`/`deinit`이 불린다. 파일 핸들·소켓·락 같은 리소스를 RAII식으로 안전하게 정리할 수 있다. GC는 finalizer 시점이 비결정적이라 `using` / `try-with-resources` 같은 별도 패턴이 강제된다.
3. **STW 회피** — UI 프레임 예산이나 오디오 콜백처럼 지연에 민감한 작업에서 "예측 못 할 멈춤"이 없다. ARC 비용은 release 시점에 작게 분산되어 큰 덩어리로 몰리지 않는다.

**트레이드오프**: ARC도 공짜는 아니다. 순환 참조를 개발자가 `weak`/`unowned`로 끊어야 하는 부담과, 참조가 바뀔 때마다 발생하는 atomic 카운팅 비용을 떠안는 대신 위 세 가지를 얻은 설계다. *"GC = 개발자 편의(순환 자동) ↔ 런타임 비용·비결정성", "ARC = 결정성·풋프린트 ↔ 개발자 책임 증가"* 가 핵심 대비.

## 성능 비용과 핫패스 최적화

ARC의 실제 비용 실체:

- `retain`/`release`는 멀티스레드 안전을 위한 **atomic increment/decrement**다. 참조가 바뀔 때마다 발생하고 캐시 라인 경합도 생길 수 있다.
- 한 번은 나노초 단위라 콜드패스에선 무시해도 되지만, **핫패스(hot path)** — 스크롤 중 `cellForRowAt`, 오디오 렌더 콜백, 픽셀/이미지 타이트 루프, CADisplayLink 같은 자주 도는 구간 — 에서 프레임당 수천 번 곱해지면 16.6ms 예산을 까먹는다.
- 컴파일러가 **인라이닝 + {{term:specialization|제네릭 특수화}}** 로 상당 부분을 이미 걷어내준다. 특수화되면 `T`가 값 타입일 땐 ARC 자체가 통째로 사라지고, 클래스 타입일 땐 컴파일러가 정확한 타입을 알아 불필요한 retain/release를 더 공격적으로 제거한다. (모듈 경계를 넘으면 호출처에서 본문을 볼 수 없으므로 `@inlinable` 노출이 필요.)

### 불필요한 참조 복사 줄이기

클래스 인스턴스를 변수·인자로 옮기면 포인터만 복사되는 것처럼 보여도 ARC는 카운트를 맞추려고 retain(+1)/release(-1) 쌍을 끼워 넣는다. 이 복사가 의미 없이 반복되면 atomic 연산만 늘어난다.

```swift
// ❌ 매 반복마다 self.manager getter가 retain/release
for i in 0..<n {
    process(self.manager, i)
}

// ✅ 한 번만 retain, 루프 동안 재사용 (hoisting)
let manager = self.manager   // retain 1회
for i in 0..<n {
    process(manager, i)
}
```

배열도 동일 — `array[i]`가 클래스면 인덱싱마다 retain된 참조가 나온다. 루프 밖으로 끌어올리면 그만큼 줄어든다.

피하는 방법:

- 반복 접근을 지역 `let`에 한 번 바인딩 (위 예시)
- 애초에 **값 타입**(struct/enum)으로 설계 → ARC 0
- `withExtendedLifetime`으로 수명 보장하며 불필요한 retain 억제
- 최신 Swift의 ownership 한정자 (`borrowing` / `consuming` / `~Copyable`) 로 복사 자체를 컴파일러 차원에서 차단

**원칙**: 미세 최적화보다 먼저 Instruments(Time Profiler / Allocations)로 진짜 핫패스를 찾는다. 대부분의 ARC 비용은 컴파일러가 이미 처리하고, 남는 건 프로파일링으로 짚는다.

## 흔한 함정 / Follow-up 질문

- **Q. ARC는 런타임 GC인가?**
  아니다. 컴파일 타임에 retain/release 호출을 코드에 끼워 넣을 뿐. 별도 GC 스레드 없음, STW 없음.

- **Q. ARC에서도 retain cycle은 발생하는가?**
  발생한다. `__weak`/`__unsafe_unretained`로 한 쪽을 끊어야 함.

- **Q. MRC에서 가장 흔한 버그?**
  (1) `alloc`/`new`/`copy`로 받은 객체 release 누락 → leak. (2) autoreleased 객체에 release를 또 호출 → over-release crash. (3) `dealloc`에서 ivar release 누락.

- **Q. ARC가 자동 삽입한 호출을 어떻게 보나?**
  `clang -rewrite-objc` 또는 Xcode Build → "Assembly" 출력. 또는 `xcrun` ARC migration 로그.

- **Q. ObjC ARC 객체와 C 구조체/`malloc` 메모리는?**
  서로 영향 없다. C 메모리는 직접 `free`. 다만 C 구조체 안에 ObjC object pointer를 두려면 `__unsafe_unretained` 또는 ARC-friendly wrapper 필요.

- **Q. `__bridge` 캐스팅이란?**
  ARC가 관리하는 ObjC object와 ARC 외부 Core Foundation 타입(`CFString` 등) 간 변환. `__bridge` (소유권 이전 없음), `__bridge_retained` (CF로 소유 이전), `__bridge_transfer` (CF에서 ARC로 소유 이전).

- **Q. 왜 Apple은 GC 대신 ARC를 골랐나?**
  메모리 풋프린트, 결정적 해제, STW 회피 — 세 가지를 위해 순환 참조 책임과 atomic 카운팅 비용을 개발자에게 넘긴 설계.

- **Q. STW가 뭔가?**
  Stop-The-World. 추적형 GC가 힙 스캔 일관성을 위해 모든 뮤테이터 스레드를 일시 정지시키는 구간. 60fps 16.6ms 예산 안에 안 끝나면 프레임 드랍 → hitch. ARC는 이 개념 자체가 없다.

- **Q. `weak` vs `unowned` 차이?**
  `weak`은 deinit 시 nil로 자동 클리어 — 안전하지만 side table 조회/atomic 비용. `unowned`는 추가 비용 0에 가깝지만 객체가 먼저 사라지면 dangling — 접근 시 crash. 수명이 확실히 상위인 관계엔 `unowned`, 불확실하면 `weak`.

- **Q. ARC 호출이 핫패스에서 누적되면?**
  atomic inc/dec가 캐시 라인 경합과 함께 누적되어 프레임 예산 잠식. 해결: 지역 `let`에 한 번 바인딩(hoisting), 값 타입 전환, `withExtendedLifetime`, ownership 한정자(`borrowing`/`consuming`/`~Copyable`). 단, Instruments로 핫패스부터 식별한 후 적용.

## 참고

- Clang ARC 문서: https://clang.llvm.org/docs/AutomaticReferenceCounting.html
- WWDC 2011: Introducing Automatic Reference Counting
- WWDC 2021: ARC in Swift: Basics and beyond
- Swift Optimization Tips — Generics: https://github.com/apple/swift/blob/main/docs/OptimizationTips.rst#generics
- ZGC / Shenandoah (concurrent GC 비교): https://wiki.openjdk.org/display/zgc / https://wiki.openjdk.org/display/shenandoah
- [Ownership Qualifiers](ownership-qualifiers.md), [autoreleasepool](autoreleasepool.md)
