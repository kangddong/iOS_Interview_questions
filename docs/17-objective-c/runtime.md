# Objective-C Runtime

> 한 줄 요약 — 클래스/메서드/ivar를 런타임 데이터로 다룰 수 있게 해주는 C API (`<objc/runtime.h>`). isa 포인터·associated object·method swizzling·dynamic class creation의 토대.

## 객체 메모리 레이아웃

```
+---------+----------+----------+-----+
|  isa    | ivar[0]  | ivar[1]  | ... |
+---------+----------+----------+-----+
   8B        N bytes
```

- 모든 ObjC 객체의 **첫 워드는 `isa` 포인터**. 자신의 *클래스 객체*를 가리킨다.
- 그 뒤에 ivar들이 컴파일 타임에 결정된 offset으로 배치.

## isa, Class, Metaclass

```
instance         class object (Class)        metaclass (Class)
+------+         +-------------------+        +-------------------+
| isa  | ------> |  isa              | -----> |  isa              |
+------+         |  super            |        |  super            |
| ivar |         |  instance methods |        |  class methods    |
+------+         |  ivar layout      |        +-------------------+
                 +-------------------+
```

- **Class object**: 메서드 리스트, ivar 레이아웃, protocol 리스트, superclass 포인터를 담는다. 클래스 자체도 객체.
- **Metaclass**: 클래스 객체의 클래스. 클래스 메서드(`+`)를 담는다. 모든 metaclass의 isa는 NSObject의 metaclass.
- 인스턴스 메서드 lookup: `instance->isa` (= class) → method list → superclass
- 클래스 메서드 lookup: `class->isa` (= metaclass) → method list → super metaclass

### Tagged Pointer & Non-pointer isa

Modern runtime (64-bit)은 isa 포인터를 단순 포인터로 두지 않고, 64비트 중 일부를 **non-pointer isa**로 인코딩:

- 진짜 class pointer (33비트)
- inline retain count (19비트)
- has_assoc, has_cxx_dtor, weakly_referenced, has_sidetable_rc 등 플래그

작은 `NSNumber`/`NSString`은 객체를 heap에 만들지 않고 **tagged pointer**로 인코딩 (포인터 비트 안에 값 직접 저장). retain/release no-op, 메모리 효율 ↑.

## Associated Objects

Category에서 ivar를 추가하지 못하는 한계를 우회. 런타임이 객체별 key-value 테이블을 관리.

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

**Association policy**:
- `OBJC_ASSOCIATION_ASSIGN`
- `OBJC_ASSOCIATION_RETAIN_NONATOMIC` / `OBJC_ASSOCIATION_RETAIN`
- `OBJC_ASSOCIATION_COPY_NONATOMIC` / `OBJC_ASSOCIATION_COPY`

대상 객체가 dealloc될 때 런타임이 자동 정리.

## Method Swizzling

런타임에 두 selector의 IMP를 맞바꿔 기존 메서드 동작을 가로채는 기법. 디버깅/AOP/analytics 자동화에 사용되지만 위험.

```objc
#import <objc/runtime.h>

@implementation UIViewController (LifecycleLog)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class cls = [self class];
        Method original  = class_getInstanceMethod(cls, @selector(viewDidAppear:));
        Method swizzled  = class_getInstanceMethod(cls, @selector(my_viewDidAppear:));
        method_exchangeImplementations(original, swizzled);
    });
}

- (void)my_viewDidAppear:(BOOL)animated {
    [self my_viewDidAppear:animated];  // 이름이 swap되어 실제로는 원본 호출
    NSLog(@"appeared: %@", self);
}

@end
```

### 안전 패턴

1. `+load`에서 `dispatch_once`로 보호.
2. `class_addMethod`로 *원본이 없으면 추가*하고 실패 시에만 exchange — superclass 메서드를 잘못 바꾸지 않도록.
3. prefix를 붙여 메서드명 충돌 회피 (`my_`, `kk_`).
4. 가능하면 **자기 클래스 메서드만**. 시스템 클래스를 swizzle하면 다른 라이브러리와 충돌.

## Dynamic Class Creation

```objc
Class kls = objc_allocateClassPair([NSObject class], "DynamicClass", 0);
class_addMethod(kls, @selector(hello), (IMP)helloIMP, "v@:");
objc_registerClassPair(kls);

id obj = [[kls alloc] init];
[obj performSelector:@selector(hello)];
```

KVO가 이걸로 `NSKVONotifying_*` subclass를 만든다.

## 자주 쓰는 API

| API | 용도 |
|---|---|
| `object_getClass(obj)` | obj의 실제 클래스 (KVO swizzled subclass 포함) |
| `[obj class]` | 표면상 클래스 (KVO subclass라도 원래 클래스 반환) |
| `class_getInstanceMethod(cls, sel)` | Method 구조체 획득 |
| `method_getImplementation(m)` / `method_setImplementation` | IMP 직접 조작 |
| `class_addMethod` / `class_replaceMethod` | 메서드 추가/교체 |
| `objc_getClassList` / `objc_copyClassList` | 모든 등록 클래스 열거 |
| `object_setIvar` / `object_getIvar` | ivar 직접 접근 (위험) |
| `class_getInstanceSize(cls)` | 인스턴스 크기 |

## 흔한 함정 / Follow-up 질문

- **Q. Method swizzling이 위험한 이유?**
  (1) `+load` 시점 순서 보장 안 됨 — 다른 클래스/라이브러리와 경쟁. (2) subclass도 영향. (3) 다른 라이브러리도 같은 메서드를 swizzle하면 서로 깨뜨림. (4) 디버깅 난이도 폭증 — 원본/swizzled 함수가 헷갈림. (5) App Store 리뷰가 시스템 클래스 swizzling을 문제 삼는 경우도 있음.

- **Q. Associated object는 객체가 dealloc될 때 같이 해제되는가?**
  된다. 런타임이 dealloc 직전에 정리. ARC와 정상 동작.

- **Q. Tagged pointer 객체에 associated object를 붙이면?**
  지원되지만 별도 sidetable로 관리. 일반 객체보다 느림.

- **Q. `[obj class]`와 `object_getClass(obj)`의 차이?**
  KVO가 객체의 isa를 `NSKVONotifying_X` subclass로 바꿔치면, `[obj class]`는 *원래* 클래스(X)를 반환하도록 override되어 있다. `object_getClass`는 실제 isa를 반환. KVO 디버깅 시 유용.

- **Q. 클래스의 메서드를 런타임에 다 알아낼 수 있나?**
  `class_copyMethodList(cls, &count)`로 가능. swizzling 디버깅, 자동 mock 생성, IOC container 등에 활용.

- **Q. ivar layout을 알면 객체 메모리를 직접 읽을 수 있나?**
  `class_getInstanceVariable` + `object_getIvar`로 가능. private API 접근에 악용 가능 → 보안 민감 코드에선 주의.

- **Q. Swift class에 ObjC runtime API를 쓸 수 있나?**
  `@objc` 노출된 메서드/프로퍼티만. pure Swift method는 runtime에 없으므로 swizzle 불가.

## 참고

- `<objc/runtime.h>` 헤더
- Apple Docs: Objective-C Runtime Programming Guide (legacy)
- [KVO/KVC](kvo-kvc.md) (isa-swizzling 실사용 사례)
- [Categories & Extensions](categories-and-extensions.md)
