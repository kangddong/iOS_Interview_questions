# Categories & Class Extensions

> 한 줄 요약 — Category는 런타임에 기존 클래스에 메서드를 덧붙이는 메커니즘, Class Extension은 컴파일 타임에 클래스의 private 인터페이스를 추가하는 메커니즘.

## Category

```objc
// NSString+Trimming.h
@interface NSString (Trimming)
- (NSString *)trimmed;
@end

// NSString+Trimming.m
@implementation NSString (Trimming)
- (NSString *)trimmed {
    return [self stringByTrimmingCharactersInSet:
            NSCharacterSet.whitespaceAndNewlineCharacterSet];
}
@end

// 사용
NSString *s = @"  hello  ";
[s trimmed]; // "hello"
```

### 특징

- 클래스의 소스 코드 없이 메서드 추가 가능 (Apple 클래스에도).
- **런타임 로딩** 시점에 메서드 테이블에 합쳐짐 (`+load` 또는 `+initialize` 직전).
- **stored property(ivar) 추가 불가** — ivar layout이 컴파일 타임에 고정. 우회: associated object.
- 같은 메서드명을 덮어쓰면 어느 IMP가 이기는지 **정의되지 않음** (load order 의존).
- Apple은 SDK 내부적으로 Cocoa 클래스의 기능을 카테고리로 분리해 둠 (`NSString(NSStringExtensionMethods)` 등).

### Associated Object로 stored property 흉내

```objc
#import <objc/runtime.h>

@interface UIView (BizTag)
@property (nonatomic, copy) NSString *bizTag;
@end

@implementation UIView (BizTag)
static const void *kBizTagKey = &kBizTagKey;

- (void)setBizTag:(NSString *)tag {
    objc_setAssociatedObject(self, kBizTagKey, tag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}
- (NSString *)bizTag {
    return objc_getAssociatedObject(self, kBizTagKey);
}
@end
```

런타임이 객체별 key-value 테이블을 관리. 객체 dealloc 시 자동 정리.

## Class Extension

```objc
// MyVC.m
@interface MyVC ()
@property (nonatomic, strong) UILabel *titleLabel;  // private property
- (void)reload;                                       // private method
@end

@implementation MyVC
@end
```

### 특징

- `()` 안에 카테고리 이름이 없음 (익명 카테고리).
- 보통 `.m` 파일 안에 둠 → 외부에 노출되지 않는 private 인터페이스.
- **ivar 추가 가능** — 컴파일러가 main class와 함께 컴파일.
- private property를 선언해도 자동 합성 동작.
- 보통 readonly property를 외부에 노출하고 내부에서만 readwrite로 redeclare할 때 사용:
  ```objc
  // Header (public)
  @interface User : NSObject
  @property (nonatomic, copy, readonly) NSString *name;
  @end

  // Implementation (private)
  @interface User ()
  @property (nonatomic, copy, readwrite) NSString *name;
  @end
  ```

## 비교

| 항목 | Category | Class Extension |
|---|---|---|
| 위치 | 별도 `.h`/`.m` 파일 (혹은 동일 파일) | 보통 `.m` 안 |
| 이름 | 있음 `(Trimming)` | 없음 `()` |
| ivar/stored property 추가 | 불가 (associated object 우회) | 가능 |
| 시점 | 런타임 로딩 | 컴파일 타임 |
| 사용처 | 기존 클래스 확장, 모듈 분리 | private 인터페이스 |
| Swift 대응 | `extension` (비슷) | private `extension` (비슷) |

## Swift `extension`과의 차이

- Swift extension은 컴파일 타임에 동작. **stored property 추가 불가**는 동일.
- Swift extension은 **default protocol implementation**을 줄 수 있음 (ObjC category는 불가).
- Swift extension은 **method override 금지** (subclassing 외엔). ObjC category는 기술적으론 override 가능하지만 권장 안 됨.
- Swift extension은 모듈 외부에서도 안전 (vtable이 아니라 static dispatch).
- `@objc` 붙은 Swift extension은 ObjC category와 유사하게 노출됨.

## 흔한 함정 / Follow-up 질문

- **Q. Category에서 stored property가 안 되는 이유?**
  ObjC 객체의 메모리 layout은 클래스 컴파일 시점에 ivar offset이 고정된다. 런타임에 합쳐지는 카테고리는 layout을 바꿀 수 없다 → ivar 추가 불가. (Modern non-fragile ABI도 *서브클래스 ivar offset*만 유연하게 했을 뿐, 카테고리 ivar 추가는 여전히 불가.)

- **Q. Category로 메서드 override해도 되나?**
  안 된다. 동작은 하지만 같은 selector를 가진 카테고리가 여럿이면 *어느 IMP가 이기는지 불명*. + super 호출 불가. 안티 패턴.

- **Q. `+load` vs `+initialize` 차이?**
  - `+load`: 클래스가 런타임에 메모리로 적재되는 시점. 앱 시작 직후. 모든 클래스/카테고리의 `+load`가 호출됨.
  - `+initialize`: 클래스가 처음 *메시지를 받을* 때. lazy. 카테고리에서 정의하면 main class보다 먼저 호출되어 main class의 것이 무시됨 → 주의.

- **Q. Category 이름 충돌 회피?**
  메서드 이름에 prefix를 붙이는 게 관례 (`bizTag` 대신 `my_bizTag`). 특히 Apple 클래스에 카테고리 추가 시 필수.

- **Q. associated object의 lifetime?**
  연결된 객체가 dealloc될 때 런타임이 자동으로 release. ARC와 호환. `OBJC_ASSOCIATION_RETAIN_NONATOMIC` 등의 policy로 ownership 명시.

- **Q. Class Extension에서 super class 메서드 override?**
  Extension은 main class와 합쳐지므로 사실상 main class의 메서드 정의와 같다. 정상적인 override 가능.

## 참고

- [Runtime](runtime.md) (associated objects, method list)
- Apple Docs: Customizing Existing Classes
