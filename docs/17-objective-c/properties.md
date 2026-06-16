# Properties

> 한 줄 요약 — `@property` 선언에 붙는 한정자들이 자동 생성되는 getter/setter의 메모리 관리·스레드·가시성 동작을 결정한다.

## 한정자 카탈로그

| 한정자 | 의미 |
|---|---|
| `strong` | 강참조. 객체 타입 기본값. (ARC) |
| `weak` | 약참조. 해제 시 자동 `nil` (zeroing). 객체 타입에만. iOS 5+. |
| `copy` | setter에서 `-copy` 호출. immutable copy 보관. |
| `assign` | retain 없는 raw 대입. primitive(`int`, `BOOL`, struct)에 사용. 객체에 쓰면 `__unsafe_unretained`. |
| `retain` | (MRC) strong과 의미 동일. ARC 코드에선 `strong` 사용 권장. |
| `readonly` | getter만 생성. |
| `readwrite` | getter/setter 둘 다 (default). |
| `atomic` | setter/getter 호출이 atomic. 단일 접근만 보장 — 객체 그래프 단위 동기화는 아님. |
| `nonatomic` | lock 없음. 거의 모든 iOS 코드의 기본 선택. |
| `getter=name` / `setter=name:` | 접근자 이름 커스터마이즈 (예: `BOOL`은 `is-` prefix) |
| `nullable` / `nonnull` | nullability annotation. Swift 옵셔널 변환에 영향. |
| `class` | 클래스 프로퍼티 선언 (iOS 7+). |

## 코드 예시

```objc
@interface User : NSObject
@property (nonatomic, copy, nonnull) NSString *name;          // mutable 전달 방지
@property (nonatomic, copy, nullable) NSString *nickname;
@property (nonatomic, weak) id<UserDelegate> delegate;        // retain cycle 방지
@property (nonatomic, assign) NSInteger age;                  // primitive
@property (nonatomic, assign, getter=isActive) BOOL active;  // -isActive, -setActive:
@property (atomic, strong, readonly) NSDate *createdAt;
@property (nonatomic, copy) void (^completion)(NSError *);   // block은 관례상 copy
@end
```

## 자동 합성된 코드 (ARC)

```objc
@property (nonatomic, copy) NSString *name;
// 컴파일러가 자동 합성:
//   ivar: NSString *_name;  (__strong)
//   - (NSString *)name {
//       return _name;
//   }
//   - (void)setName:(NSString *)name {
//       _name = [name copy];  // copy semantic
//   }
```

`@synthesize name = _name;`은 modern ObjC에서 자동. 직접 쓰는 경우는 ivar 이름을 다르게 하거나 protocol 채택 시 명시할 때.

## 비교

### `strong` vs `copy` (NSString/NSArray 등)

```objc
@property (nonatomic, strong) NSString *name1;
@property (nonatomic, copy)   NSString *name2;

NSMutableString *m = [NSMutableString stringWithString:@"hello"];
self.name1 = m;
self.name2 = m;
[m appendString:@" world"];
NSLog(@"%@ / %@", self.name1, self.name2);
// "hello world" / "hello"   ← copy는 setter 시점 immutable copy 보관
```

**규칙**: mutable 하위 클래스가 있는 immutable 타입(`NSString`, `NSArray`, `NSDictionary`, `NSSet`, `NSData`)은 거의 항상 `copy`.

### `atomic` vs `nonatomic`

- **`atomic`**: setter/getter 호출이 thread-safe. 한 번의 read/write가 찢어지지 않음.
- **하지만 객체 그래프 단위 동기화는 아님**:
  ```objc
  self.array = [self.array arrayByAddingObject:x]; // ❌ read-modify-write race
  ```
  read와 write 사이에 다른 스레드가 끼어들 수 있음. 진짜 동기화는 별도 lock/serial queue 필요.
- **`nonatomic`이 기본 선택인 이유**:
  - atomic의 lock 비용이 작아 보이지만 hot path에선 무시 못 함.
  - 어차피 객체 단위 동기화가 필요하면 더 큰 범위로 lock해야 함.
  - UIKit 프로퍼티는 메인 스레드 전용이라 동기화 의미 없음.

### `assign` vs `weak` (객체)

- `assign`을 객체에 쓰면 `__unsafe_unretained` → dangling pointer 위험.
- `weak`은 zeroing이 되어 안전 → delegate는 무조건 `weak`.

## Block 프로퍼티

```objc
@property (nonatomic, copy) void (^handler)(id result);
```

- 관례상 `copy`. 이유: stack에 생성된 block을 heap으로 옮겨 owner의 lifetime 동안 살리기 위함.
- ARC에서는 block에 `strong` 대입해도 자동으로 `copy`가 수행됨. 그래도 명시적 `copy`가 *의도를 드러내는 관례*.

## Nullability와 Swift Interop

```objc
NS_ASSUME_NONNULL_BEGIN
@interface User : NSObject
@property (nonatomic, copy) NSString *name;             // nonnull (assume 안에 있어서)
@property (nonatomic, copy, nullable) NSString *email;  // 명시적 nullable
@end
NS_ASSUME_NONNULL_END
```

```swift
// Swift에서
user.name    // String
user.email   // String?
```

annotation이 없으면 implicitly unwrapped optional(`String!`)로 노출 — nil 접근 시 크래시. 헤더 전체를 `NS_ASSUME_NONNULL_BEGIN/END`로 감싸고 예외만 `nullable`로 표기하는 것이 관례.

## 흔한 함정 / Follow-up 질문

- **Q. `delegate`가 `weak`인 이유?**
  Retain cycle 방지. `parent` → `child` (strong), `child.delegate` → `parent` (strong) 형태가 cycle을 만들기 때문. delegate는 보통 owner가 자기를 가리키므로 child → parent 방향이고, 이 방향은 weak이어야 한다.

- **Q. Block 프로퍼티는 왜 `copy`?**
  Stack-allocated block을 heap으로 옮기기 위해. (ARC에서는 `strong`도 동일하게 동작하지만 관례상 `copy`로 의도 표시.)

- **Q. `atomic` 프로퍼티는 thread-safe인가?**
  단일 access는 안전. 하지만 read-modify-write 시퀀스는 race. 실무에서 atomic으로 "동시성 문제 해결됐다" 착각하면 위험.

- **Q. `@property`를 protocol에 선언하면?**
  protocol에선 자동 합성이 안 됨. 채택 클래스가 직접 `@synthesize` 또는 수동 구현.

- **Q. Swift `let`/`var`와 ObjC `readonly`/`readwrite`?**
  `let` ≈ `readonly`이지만 의미 차이 있음. Swift `let`은 *재할당 금지*, ObjC `readonly`는 *외부에서 setter 호출 불가* (클래스 내부에선 ivar 직접 변경 가능).

- **Q. `IBOutlet`은 strong인가 weak인가?**
  과거: top-level outlet은 strong, subview outlet은 weak 권장. 현대 iOS는 view 계층이 view controller에 의해 strong하게 보유되므로 weak로 두어도 안전. Apple 템플릿은 weak 기본.

## 참고

- [Ownership Qualifiers](ownership-qualifiers.md), [Blocks](blocks.md), [Swift Interop](swift-interop.md)
- Apple Docs: Encapsulating Data
