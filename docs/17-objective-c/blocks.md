# Blocks

> 한 줄 요약 — ObjC의 클로저. C 함수 포인터 + 캡처 환경. Swift closure와 ABI-호환되며, 캡처 의미가 다르다는 점이 핵심 차이.

## 핵심 개념

- Block 리터럴: `^returnType(params) { ... }`. 타입: `returnType (^)(params)`.
- **기본 캡처는 const copy** — 캡처 시점의 값을 복사해서 immutable로 보관.
- **`__block` 키워드**: 캡처 변수를 mutable + 공유. 컴파일러가 heap에 박스를 만들어 block이 그 박스를 참조.
- Block은 처음엔 **stack**에 생성. 대입(`strong`/`copy`) 또는 `Block_copy`로 **heap**에 복사되어 수명 연장.
- 캡처된 객체는 strong/weak에 따라 ARC 동작.

## Block의 세 종류

| 종류 | 위치 | 생성 시점 | 수명 |
|---|---|---|---|
| `_NSConcreteStackBlock` | stack | 변수 없는 캡처 + 즉시 사용 | scope 끝 |
| `_NSConcreteMallocBlock` | heap | stack → copy 된 것 | retain count 따름 |
| `_NSConcreteGlobalBlock` | 전역 (text section) | 캡처 없음 | 영구 |

## 코드 예시

### 기본 캡처

```objc
int x = 10;
void (^block)(void) = ^{ NSLog(@"%d", x); }; // x를 const copy
x = 20;
block();  // 10  ← 캡처 시점 값

// 객체는 기본 strong 캡처
NSMutableArray *arr = [NSMutableArray array];
void (^addOne)(void) = ^{ [arr addObject:@1]; }; // arr 자체는 const, 가리키는 객체는 mutable
addOne();
// arr → [1]
```

### `__block`로 변수 변경

```objc
__block int counter = 0;
void (^inc)(void) = ^{ counter++; };
inc(); inc(); inc();
NSLog(@"%d", counter);  // 3
```

`__block` 변수는 컴파일러가 heap 박스로 옮긴다 (block이 stack에 있으면 stack, copy되면 heap). block과 원본 코드 모두 같은 박스를 본다.

### Block 프로퍼티 호출

```objc
@property (nonatomic, copy) void (^completion)(NSError *);

// 호출
if (self.completion) {
    self.completion(nil);
}
```

## Retain Cycle

```objc
self.completion = ^{
    [self doWork]; // self를 strong 캡처 → self는 completion을 보유 → cycle
};
```

### 해결: `__weak self`

```objc
__weak typeof(self) weakSelf = self;
self.completion = ^{
    [weakSelf doWork];
};
```

### `__weak` + `__strong` 더블 패턴

```objc
__weak typeof(self) weakSelf = self;
self.completion = ^{
    __strong typeof(self) strongSelf = weakSelf;
    if (!strongSelf) return;
    [strongSelf doWork];          // block 실행 중 strong으로 잡아둠
    [strongSelf moreWork];        // 두 호출 사이 dealloc 방지
};
```

### `@weakify` / `@strongify` (libextobjc 매크로)

```objc
@weakify(self);
self.completion = ^{
    @strongify(self);
    [self doWork];
};
```

가독성 ↑. 외부 라이브러리 의존.

## 비교 — Block vs Swift Closure

| 항목 | Block (ObjC) | Closure (Swift) |
|---|---|---|
| 캡처 기본값 | const copy | reference (let 캡처 시 immutable) |
| mutable 캡처 | `__block` | `var` + capture list |
| 약참조 캡처 | `__weak self` | `[weak self]` |
| 메모리 위치 | stack/heap/global | heap (escaping 시) |
| 타입 표기 | `void (^)(NSError *)` | `(Error?) -> Void` |
| Trailing syntax | ❌ | ✅ |
| `@escaping` 표기 | ❌ (escaping이 기본) | ✅ |

## Block과 GCD

```objc
dispatch_async(dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0), ^{
    NSData *data = [self heavyWork];
    dispatch_async(dispatch_get_main_queue(), ^{
        self.label.text = [self stringify:data];
    });
});
```

GCD API는 사실상 block을 받는 함수의 집합. Swift에서 `DispatchQueue.global().async { }`로 보이는 클로저가 ObjC에선 이런 block이다.

## 흔한 함정 / Follow-up 질문

- **Q. Block 프로퍼티에 왜 `copy`?**
  Stack block을 heap으로 옮겨 owner lifetime 동안 유효하게 만들기 위해. ARC에서는 strong 대입도 동일하게 copy를 수행하지만, `copy` 명시가 *의도를 드러내는* 관례.

- **Q. `__block` 변수가 객체일 때 ownership은?**
  ARC에선 `__block id obj`는 기본 `__strong`. block이 heap으로 copy될 때 객체도 retain.

- **Q. block 안에서 `self.x`가 cycle을 만드는 정확한 조건?**
  (1) block이 어딘가 *저장*되고, (2) 그 저장 경로가 self에 의해 *retain*되며, (3) block이 self를 strong 캡처. 일회성으로 즉시 실행하는 block(`[UIView animateWithDuration:animations:^{ self.alpha = 0; }]`)은 self에 저장되지 않아 cycle 아님.

- **Q. `__weak self` → `__strong strongSelf` 패턴이 왜 필요한가?**
  Block 실행 도중 self가 dealloc되면 두 번째 `self` 접근이 nil 메시지가 되어 동작 누락. 진입 시점에 strong으로 잡아두면 block 실행 동안 살아있음.

- **Q. block이 stack에 있을 때 비동기 큐에 넘기면?**
  자동으로 copy되어 heap으로 옮겨진다. ARC가 처리. 명시적 `Block_copy`는 거의 안 쓴다.

- **Q. block의 ABI?**
  Apple이 정의한 Block ABI. Swift closure와 호환되어 `@convention(block)`으로 ObjC API에 전달 가능.

- **Q. Swift closure를 ObjC API에 넘기려면?**
  `@convention(block)` 명시 또는 자동 bridge. 함수 타입을 ObjC block 타입으로 변환.

## 참고

- Apple Docs: Working with Blocks
- Block ABI: https://clang.llvm.org/docs/Block-ABI-Apple.html
- [Properties](properties.md) (`copy` 한정자), [Ownership Qualifiers](ownership-qualifiers.md)
