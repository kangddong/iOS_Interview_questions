# Swift ↔ Objective-C Interop

> 한 줄 요약 — Swift는 ObjC 런타임 위에서 출발했고 양방향 호출이 가능하지만, 각 언어의 타입 시스템 차이를 메우는 annotation/wrapper가 필요하다.

## 양방향 흐름

### ObjC → Swift

1. ObjC 헤더(`.h`)를 **Bridging Header**에 import.
2. 또는 ObjC `.framework`를 import.
3. Swift에서 자동으로 API 노출.

### Swift → ObjC

1. Swift 클래스를 `NSObject` 상속 + `@objc` (또는 `@objcMembers`).
2. 컴파일러가 `ProductName-Swift.h`를 생성.
3. ObjC에서 `#import "ProductName-Swift.h"` → 사용.

## 이름 매핑

ObjC selector → Swift 이름은 자동 변환:

| ObjC | Swift |
|---|---|
| `initWithName:age:` | `init(name:age:)` |
| `setEnabled:` | `enabled` 프로퍼티 setter |
| `application:didFinishLaunchingWithOptions:` | `application(_:didFinishLaunchingWithOptions:)` |
| `URLWithString:` | `URL(string:)` (factory → init) |
| `NSURLSession` | `URLSession` (NS prefix 제거) |
| `tableView:didSelectRowAtIndexPath:` | `tableView(_:didSelectRowAt:)` |

수동 제어:

```objc
- (void)doStuff NS_SWIFT_NAME(perform());
+ (instancetype)userWithName:(NSString *)name NS_SWIFT_NAME(init(name:));
```

```swift
@objc(MYCounter)         // ObjC에서 보일 이름
class Counter: NSObject { ... }

@objc(incrementBy:)      // ObjC selector 지정
func increment(by n: Int) { ... }
```

## Nullability

ObjC 헤더의 annotation이 Swift 옵셔널로 매핑된다.

```objc
NS_ASSUME_NONNULL_BEGIN

@interface User : NSObject
@property (nonatomic, copy) NSString *name;             // → String
@property (nonatomic, copy, nullable) NSString *email;  // → String?
- (nullable User *)friend;                              // → User?
- (instancetype)initWithName:(NSString *)name;          // → init(name:)
@end

NS_ASSUME_NONNULL_END
```

- annotation 없는 헤더 → Swift에선 implicitly unwrapped optional (`String!`). nil 접근 시 crash.
- 헤더 전체를 `NS_ASSUME_NONNULL_BEGIN/END`로 감싸고 예외만 `nullable`로 표기하는 것이 관례.

## 타입 매핑

| ObjC | Swift |
|---|---|
| `NSString *` | `String` (bridge) |
| `NSArray<Type *> *` | `[Type]` (제네릭 명시 필요) |
| `NSDictionary<K, V> *` | `[K: V]` |
| `NSNumber *` | `NSNumber` (또는 자동 bridge to `Int`/`Double`/`Bool`) |
| `NS_ENUM(NSInteger, Type)` | Swift enum |
| `NS_OPTIONS(NSInteger, Type)` | Swift OptionSet |
| `BOOL` | `Bool` |
| `id` | `Any` |
| `id<P>` | `any P` (Swift 5.7+) |
| `Class` | `AnyClass` |
| `SEL` | `Selector` |
| Block `void (^)(NSError *)` | `(Error?) -> Void` |

### Lightweight Generics

ObjC 컨테이너에 제네릭 명시:

```objc
@property (nonatomic, copy) NSArray<User *> *users;       // Swift: [User]
@property (nonatomic, copy) NSDictionary<NSString *, User *> *cache;  // Swift: [String: User]
```

명시하지 않으면 Swift에서 `[Any]`로 노출되어 사용성 ↓.

## 무엇이 Swift → ObjC로 노출되나

| Swift 기능 | ObjC 노출 |
|---|---|
| `class : NSObject` | O |
| `struct` / `enum` (raw value 없는) | X |
| `@objc enum : Int` | O |
| Generic class | X (consume된 형태로 노출 불가) |
| `async` 메서드 | completion handler API로 자동 노출 |
| `throws` 메서드 | `NSError**` out-parameter로 변환 |
| `Result<T, E>` | X (직접 사용 불가) |
| Tuple | X |
| 기본값 매개변수 | X (오버로드로 풀리지 않음) |

## Designated Initializer

```objc
@interface User : NSObject
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age NS_DESIGNATED_INITIALIZER;
- (instancetype)init NS_UNAVAILABLE;
@end
```

Swift subclass는 designated initializer를 모두 override해야 한다 (rule 강제).

## 주요 매크로/Annotation

| 매크로 | 효과 |
|---|---|
| `NS_SWIFT_NAME(name)` | Swift에서 다른 이름으로 |
| `NS_SWIFT_UNAVAILABLE("msg")` | Swift에서 숨김 |
| `NS_REFINED_FOR_SWIFT` | Swift에서 `__name`으로 노출 (refine wrapper 만들 때) |
| `NS_DESIGNATED_INITIALIZER` | designated init 표시 |
| `NS_UNAVAILABLE` | 사용 불가 표시 |
| `__attribute__((swift_async(...)))` | completion handler API를 Swift async로 자동 매핑 |
| `_Nullable_result` | completion 결과의 nullability |

## 코드 예시 — Swift class를 ObjC에 노출

```swift
@objc(MYCounter)
public class Counter: NSObject {
    @objc public dynamic var count: Int = 0   // dynamic → KVO 가능

    @objc public func increment() { count += 1 }

    @objc public func increment(by n: Int) { count += n }

    @nonobjc public func swiftOnly() { /* ObjC에 노출 안 됨 */ }
}
```

```objc
#import "MyApp-Swift.h"

MYCounter *c = [[MYCounter alloc] init];
[c increment];
[c incrementBy:5];
NSLog(@"%ld", (long)c.count);
```

## 코드 예시 — async ↔ completion

```objc
// ObjC API
- (void)fetchUserWithID:(NSString *)uid
              completion:(void (^)(User * _Nullable, NSError * _Nullable))completion;
```

```swift
// Swift에서 자동 async로도 호출 가능
let user = try await api.fetchUser(withID: "u1")

// 또는 completion 형태
api.fetchUser(withID: "u1") { user, error in ... }
```

컴파일러가 마지막 인자가 `(T?, NSError?) -> Void` 형태이면 자동으로 `async throws` API를 생성. 명시적으로 매핑하려면 `NS_SWIFT_ASYNC_NAME`/`__attribute__((swift_async(not_swift_private, 2)))`.

## 흔한 함정 / Follow-up 질문

- **Q. Swift class 메서드가 ObjC에서 안 보인다.**
  (1) `@objc` 또는 `@objcMembers`가 없음. (2) `NSObject` 상속이 아님. (3) Swift-only 타입(struct, generic)을 매개변수/반환에 사용. (4) 접근 수준이 너무 낮음 (internal 이상 + `@objc` 필요).

- **Q. `dynamic`은 왜 필요한가?**
  Swift는 기본 static/vtable dispatch. KVO·swizzling은 message dispatch가 필요 → `@objc dynamic`이 그 역할.

- **Q. Nullability annotation을 안 붙이면?**
  Swift 쪽에서 implicitly unwrapped optional(`!`)이 되어 nil 접근 시 crash. 모듈 헤더에서 `NS_ASSUME_NONNULL_BEGIN/END`로 일괄 nonnull 처리하는 것이 관례.

- **Q. ObjC `BOOL`과 Swift `Bool` 차이?**
  ObjC `BOOL`은 플랫폼에 따라 `signed char` 또는 `bool`. Swift `Bool`로 자동 bridge. `YES`/`NO`와 `true`/`false`도 자동 변환.

- **Q. ObjC method `init`이 Swift에서 failable이 안 되는 이유?**
  ObjC `init`이 nil 반환 가능하면 Swift는 `init?`로 표시해야 함. nullability annotation으로 표기.

- **Q. Swift Generic class를 ObjC에서 쓰려면?**
  불가. concrete subclass를 만들어 `@objc` 노출하거나, type-erased wrapper class로 감싼다.

- **Q. ObjC API의 enum 이름이 Swift에서 길게 보임.**
  `NS_ENUM` + 적절한 prefix를 쓰면 Swift가 prefix를 자동 제거. `NS_TYPED_ENUM`/`NS_STRING_ENUM`으로 string 기반 enum도 가능.

- **Q. Swift `Error`를 ObjC에서 catch하려면?**
  `@objc` 메서드가 `throws`면 ObjC에선 `NSError **` out-parameter로 노출. Swift `Error`는 `NSError` bridge로 매핑.

- **Q. Bridging Header vs Module map?**
  앱 타겟: Bridging Header가 간편. 프레임워크 타겟: module map + umbrella header로 ObjC 헤더 공개. Swift Package에선 `module.modulemap`.

- **Q. `@objcMembers`?**
  클래스 전체 멤버를 일괄 `@objc` 노출. 편하지만 의도치 않은 노출 위험 → 개별 `@objc`가 더 명시적.

## 참고

- Apple Docs: Importing Objective-C into Swift / Importing Swift into Objective-C
- WWDC 2016: Using Swift with Cocoa and Objective-C
- WWDC 2021: Refine your Async API in Swift
- [Properties](properties.md) (nullability), [Method Dispatch](method-dispatch.md) (`@objc dynamic`)
