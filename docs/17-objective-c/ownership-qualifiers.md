# Ownership Qualifiers

> 한 줄 요약 — ARC에 "이 변수가 객체를 어떤 방식으로 보유하는지" 알려주는 4가지 한정자. 이 한정자가 컴파일러가 삽입하는 retain/release 코드와 약참조 테이블 등록 여부를 결정한다.

## 4가지 한정자

| 한정자 | retain | 해제 시 동작 | 사용 예 | Swift 대응 |
|---|---|---|---|---|
| `__strong` (default) | O | scope 종료 시 release | 일반 변수, 프로퍼티 | `strong` (default) |
| `__weak` | X | 대상이 dealloc되면 자동 `nil` | delegate, observer | `weak` |
| `__unsafe_unretained` | X | dealloc되면 dangling pointer | 성능 크리티컬, iOS 4 호환 | `unowned(unsafe)` |
| `__autoreleasing` | autorelease | 현재 pool drain 시 release | `NSError **` out-parameter | (자동) |

## `__strong`

기본값. 변수에 대입할 때 retain, 사라질 때 release.

```objc
__strong NSObject *a = [[NSObject alloc] init];
// 위와 동일
NSObject *a = [[NSObject alloc] init];
```

## `__weak`

대상이 dealloc되면 ARC 런타임이 자동으로 `nil`로 갈아낀다(**zeroing weak reference**). 약참조 테이블(`weak table`)에 등록되어 dealloc 시 일괄 nil-out.

```objc
NSObject *strongObj = [[NSObject alloc] init];
__weak NSObject *weakObj = strongObj;

NSLog(@"%@", weakObj);   // 정상
strongObj = nil;          // strongObj가 마지막 strong이었다면 dealloc
NSLog(@"%@", weakObj);   // (null) — 자동 nil-out
```

- iOS 5+에서 도입 (이전엔 `__unsafe_unretained`만 가능).
- 구현: 런타임이 객체별로 weak 참조 목록을 관리하다 dealloc 시점에 전부 nil 대입. 약간의 비용이 있지만 안전성 ↑.
- `weak` property는 setter/getter 모두 atomic하게 동작 (read 중 dealloc 방지).

## `__unsafe_unretained`

약참조지만 zeroing 없음. 대상이 사라지면 dangling pointer 상태 — 접근 시 UB(crash 또는 잘못된 데이터).

```objc
NSObject *strongObj = [[NSObject alloc] init];
__unsafe_unretained NSObject *weakObj = strongObj;

strongObj = nil;
NSLog(@"%@", weakObj);   // 💥 UB
```

쓰는 이유:
- iOS 4 deployment target (현재는 무의미)
- 성능 크리티컬한 hot path (zeroing 비용 회피) — 실제로는 미미
- C 구조체 안에 ObjC object pointer를 두고 싶을 때 (C에선 `__weak` 불가)

## `__autoreleasing`

함수 out-parameter에 주로 등장. autorelease pool에 등록된 객체를 가리킨다.

```objc
- (BOOL)load:(NSError **)error {  // error는 __autoreleasing으로 추론
    *error = [NSError errorWithDomain:@"x" code:1 userInfo:nil]; // autoreleased
    return NO;
}

NSError *err = nil;
[obj load:&err]; // err로 autoreleased 객체 받음
```

직접 선언하는 경우는 드물고, ObjC 컴파일러가 `**` 포인터의 inner 타입을 자동으로 `__autoreleasing`으로 추론한다.

## Property 한정자와의 매핑

`@property` 선언의 한정자는 ivar의 ownership을 결정한다:

| property | ivar 한정자 |
|---|---|
| `strong` | `__strong` |
| `weak` | `__weak` |
| `assign` (객체) | `__unsafe_unretained` |
| `copy` | `__strong` (단, setter에서 `-copy` 호출) |

## 코드 예시 — Retain cycle 끊기

```objc
@interface Child : NSObject
@property (nonatomic, weak) Parent *parent;   // __weak로 cycle 방지
@end

@interface Parent : NSObject
@property (nonatomic, strong) Child *child;
@end
```

## 흔한 함정 / Follow-up 질문

- **Q. `__weak`이 자동으로 `nil`이 되는 메커니즘?**
  ARC 런타임이 객체별로 약참조 테이블을 관리. 객체가 dealloc되기 시작하면 그 테이블을 순회하며 모든 약참조 변수에 `nil`을 대입. 그래서 `__weak` 변수를 읽을 때는 항상 `nil` 체크가 자동으로 보장된다.

- **Q. `__weak` vs `__unsafe_unretained` 성능 차이?**
  매우 작다. `__weak`은 read마다 atomic load + nil 체크, 대입마다 weak table 등록/해제. 일반 코드에서는 무시 가능. 대량의 임시 변수 hot loop에서나 의미.

- **Q. C 구조체 안에 ObjC object를 두려면?**
  ARC가 C 구조체 ivar를 추적할 수 없어 `__strong`/`__weak`은 사용 불가. `__unsafe_unretained`를 쓰거나 ObjC class로 감싸야 한다.

- **Q. iOS 5 미만 호환 코드는?**
  `__weak`이 없으므로 `__unsafe_unretained`로 fallback. 이미 사실상 사라진 deployment target.

- **Q. block 안에서 `__weak`/`__strong` 패턴?**
  ```objc
  __weak typeof(self) weakSelf = self;
  self.completion = ^{
      __strong typeof(self) strongSelf = weakSelf;
      if (!strongSelf) return;
      [strongSelf doWork]; // block 실행 동안 살아있도록
  };
  ```
  Block 진입 시 strongSelf로 잡아두어 실행 도중 dealloc 방지.

## 참고

- [ARC](arc-and-mrc.md), [Properties](properties.md), [Blocks](blocks.md)
- Clang ARC 4.2 / 4.3 (Ownership Qualifiers)
