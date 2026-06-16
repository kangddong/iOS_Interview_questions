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

## ARC vs GC vs Swift ARC

- **ObjC ARC**: 컴파일 타임에 retain/release 삽입. dealloc 결정적. retain cycle 수동 해결.
- **Java/.NET GC**: 런타임 도달 가능성 분석. 해제 시점 비결정적. cycle 자동 해결 (대신 STW 비용).
- **Swift ARC**: ObjC ARC와 본질 동일. struct/enum은 ARC 대상 아님 (값 의미). `weak`/`unowned`로 cycle 제어.

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

## 참고

- Clang ARC 문서: https://clang.llvm.org/docs/AutomaticReferenceCounting.html
- WWDC 2011: Introducing Automatic Reference Counting
- WWDC 2021: ARC in Swift: Basics and beyond
- [Ownership Qualifiers](ownership-qualifiers.md), [autoreleasepool](autoreleasepool.md)
