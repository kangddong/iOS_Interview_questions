# Method Dispatch & objc_msgSend

> 한 줄 요약 — ObjC의 모든 메서드 호출은 `objc_msgSend(receiver, selector, args...)`로 변환되어 런타임에 IMP를 찾아 실행된다 (dynamic message dispatch). 캐시 덕에 평균적으로 매우 빠르고, 동적 forwarding을 가능하게 한다.

## 핵심 개념

- 컴파일러가 `[obj foo:arg]`를 `objc_msgSend(obj, @selector(foo:), arg)`로 변환.
- 런타임은 receiver의 `isa` → class object → method cache → method list → superclass 순으로 selector에 대응되는 **IMP**(함수 포인터, `id (*)(id, SEL, ...)`)를 찾는다.
- 캐시 히트가 일반적 → dynamic이지만 평균 성능 우수.
- `nil`에 메시지를 보내면 NOP. 반환값은 0 / `nil` / zeroed struct.

## 메서드 lookup 순서

```
[obj foo:arg]
 │
 ├─ obj == nil ? → 0/nil 반환, 끝
 │
 ├─ obj->isa 획득 (객체 첫 워드, modern은 비트 인코딩됨)
 │
 ├─ 클래스의 method cache(SEL → IMP hash table) 검색
 │   └─ 히트 → IMP 호출, 끝
 │
 ├─ miss → 클래스의 method list 선형 검색
 │   └─ 발견 → 캐시에 등록 → IMP 호출
 │
 ├─ 못 찾음 → superclass로 isa 따라 올라가며 반복
 │
 └─ root까지 못 찾음 → forwarding 진입
```

## Forwarding (메서드 못 찾았을 때)

`-doesNotRecognizeSelector:`로 crash하기 전 세 단계의 기회가 있다:

### 1. `+resolveInstanceMethod:` / `+resolveClassMethod:`

런타임에 메서드를 추가할 수 있는 마지막 기회.

```objc
+ (BOOL)resolveInstanceMethod:(SEL)sel {
    if (sel == @selector(dynamicMethod)) {
        class_addMethod(self, sel, (IMP)dynamicIMP, "v@:");
        return YES;
    }
    return [super resolveInstanceMethod:sel];
}
```

### 2. `-forwardingTargetForSelector:`

이 메시지를 처리할 *다른 객체*를 반환. fast path forwarding.

```objc
- (id)forwardingTargetForSelector:(SEL)sel {
    if ([self.helper respondsToSelector:sel]) {
        return self.helper;
    }
    return nil;
}
```

### 3. `-forwardInvocation:`

NSInvocation 객체를 만들어 자유롭게 처리. 가장 느린 full forwarding.

```objc
- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel { ... }
- (void)forwardInvocation:(NSInvocation *)invocation {
    [invocation invokeWithTarget:self.helper];
}
```

세 단계 모두 실패 → `-doesNotRecognizeSelector:` → crash.

## SEL과 IMP

```objc
SEL sel = @selector(foo:);           // 이름만 가진 식별자 (문자열 인터닝)
IMP imp = [obj methodForSelector:sel]; // 실제 함수 포인터
((void (*)(id, SEL, int))imp)(obj, sel, 42); // 직접 호출 — 캐시 우회, 빠름
```

hot loop에서 같은 selector를 반복 호출하면 IMP 캐싱이 의미 있을 수 있다.

## 비교 — 디스패치 방식

| 방식 | 메커니즘 | 비용 | 대표 |
|---|---|---|---|
| Static (direct) | 호출 주소 컴파일 타임 결정, inline 가능 | 거의 0 | C 함수, Swift `final`/value type, `@inline` |
| Virtual (vtable) | 클래스 vtable 인덱스 lookup | 1 indirection | Swift class method, C++ virtual |
| Witness table | protocol witness table lookup | 1 indirection | Swift protocol method |
| Message (`objc_msgSend`) | selector → IMP 동적 lookup + 캐시 | 캐시 히트 시 매우 빠름 | ObjC, Swift `@objc`/`dynamic` |

## ObjC와 Swift 디스패치 차이

- **Swift class**: 기본 vtable. `final`/`private`로 static화 가능. `dynamic`을 붙이면 message dispatch.
- **`@objc dynamic`**: Swift 메서드를 ObjC 런타임에 노출 + message dispatch 강제 → KVO/swizzling 가능.
- **Swift value type method**: static dispatch.
- **Swift protocol method**: witness table dispatch (PAT/existential).

## 흔한 함정 / Follow-up 질문

- **Q. Swift class 메서드를 ObjC에서 호출하면 디스패치가 어떻게 되나?**
  `@objc` 노출 시 message dispatch. `@objc dynamic`을 붙이면 Swift에서 호출하는 경우도 message dispatch가 강제됨.

- **Q. `-doesNotRecognizeSelector:`가 호출되기 전 단계는?**
  `+resolveInstanceMethod:` → `-forwardingTargetForSelector:` → `-forwardInvocation:` 순. 세 단계 모두 실패해야 crash.

- **Q. `nil`에 메시지를 보내면 왜 안전한가?**
  `objc_msgSend`가 receiver `nil`을 가장 먼저 체크해 즉시 zeroed 값을 반환. Swift의 옵셔널 chaining(`x?.foo()`)과는 메커니즘이 다르다 — 옵셔널 chaining은 컴파일 타임에 분기 코드가 들어가고, ObjC nil messaging은 런타임이 처리.

- **Q. `objc_msgSend`의 변종?**
  - `objc_msgSendSuper`: super 호출용
  - `objc_msgSend_stret`: struct 반환 (큰 struct는 별도 ABI)
  - `objc_msgSend_fpret`: x86_64에서 float 반환
  Modern ARM64에선 통합되는 추세.

- **Q. Method cache miss 시 비용?**
  클래스 method list를 선형 검색 + superclass 체인. depth가 깊으면 비싸지만 캐시에 등록되어 다음부터는 빠름.

- **Q. `-respondsToSelector:`의 비용?**
  내부적으로 method lookup을 수행. 핫패스에서 빈번하면 결과를 캐싱.

- **Q. Swift `final class`의 ObjC 노출 디스패치?**
  `@objc`라면 여전히 message dispatch. `final`은 Swift 컴파일러에 대한 힌트일 뿐, ObjC 런타임은 모름.

- **Q. `objc_msgSend`를 직접 호출하면 안 되는 이유?**
  C 캐스팅이 까다롭다. 함수 포인터 시그니처가 *정확히* 메서드 시그니처와 일치해야 함. ARM64에선 호출 규약이 달라서 잘못된 캐스팅이 silent corruption을 만들 수 있다.

## 참고

- [Runtime](runtime.md)
- 01-swift-language / Method Dispatch
- Mike Ash: Friday Q&A — objc_msgSend
