# KVO / KVC

> 한 줄 요약 — KVC는 *문자열 키*로 프로퍼티에 접근하는 메커니즘, KVO는 그 위에 *값 변화 관찰*을 얹은 메커니즘. ObjC 런타임의 isa-swizzling으로 구현된다.

## KVC (Key-Value Coding)

문자열로 프로퍼티/ivar에 접근.

```objc
[user setValue:@"Alice" forKey:@"name"];
NSString *name = [user valueForKey:@"name"];

// KeyPath로 체이닝
NSString *city = [user valueForKeyPath:@"address.city"];

// 컬렉션 연산자
NSNumber *avg = [orders valueForKeyPath:@"@avg.amount"];
NSArray *names = [users valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

### lookup 순서 (`valueForKey:@"name"`)

1. `-name` 메서드 호출
2. 없으면 `-getName`, `-isName` (BOOL용)
3. 없으면 `+accessInstanceVariablesDirectly` 체크 → ivar `_name` → `_isName` → `name` → `isName`
4. 다 없으면 `valueForUndefinedKey:` 호출 (기본은 NSUndefinedKeyException)

setter도 유사 (`-setName:` → ivar 등).

### Foundation API의 광범위한 활용

- NSPredicate (`@"name = %@"`)
- NSExpression
- NSSortDescriptor (`sortDescriptorWithKey:`)
- Core Data fetched property/relationship
- NSManagedObject 자체가 KVC 기반

## KVO (Key-Value Observing)

특정 KeyPath의 값이 변할 때 콜백을 받는다.

```objc
static void *kNameCtx = &kNameCtx;

[user addObserver:self
       forKeyPath:@"name"
          options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld
          context:kNameCtx];

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    if (context == kNameCtx) {
        NSLog(@"%@ -> %@",
              change[NSKeyValueChangeOldKey],
              change[NSKeyValueChangeNewKey]);
    } else {
        [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    }
}

// 반드시 해제 (남기면 dealloc 시 crash)
[user removeObserver:self forKeyPath:@"name" context:kNameCtx];
```

### 동작 원리 — isa-swizzling

1. 객체 `X` 인스턴스에 처음 KVO observer가 붙으면, 런타임이 동적으로 `NSKVONotifying_X` subclass를 만든다.
2. 이 subclass의 setter들은 willChange/didChange 알림을 자동으로 호출하도록 override되어 있다.
3. 대상 객체의 `isa`를 `NSKVONotifying_X`로 바꿔치기 (**isa-swizzling**).
4. `[obj class]`는 여전히 `X`를 반환하도록 override → 호출자가 swizzling을 알아채지 못함.
5. observer가 모두 제거되면 isa를 다시 원래대로 복원.

### Manual KVO Notification

직접 ivar를 바꿀 때는 자동 알림이 안 일어남:

```objc
- (void)setNameWithoutSetter:(NSString *)newName {
    [self willChangeValueForKey:@"name"];
    _name = [newName copy];
    [self didChangeValueForKey:@"name"];
}
```

자동 알림을 끄려면 `+automaticallyNotifiesObserversForKey:`에서 NO 반환.

### Dependent Keys

```objc
+ (NSSet *)keyPathsForValuesAffectingFullName {
    return [NSSet setWithObjects:@"firstName", @"lastName", nil];
}
```

`firstName` 또는 `lastName`이 바뀌면 `fullName`도 변경된 것으로 알림.

## Swift에서 KVO

```swift
final class Player: NSObject {
    @objc dynamic var status: String = "idle"
}

let p = Player()
let token = p.observe(\.status, options: [.new, .old]) { _, change in
    print(change.oldValue ?? "", "->", change.newValue ?? "")
}
// token (NSKeyValueObservation)이 살아있는 동안만 관찰
```

- **`NSObject` 상속 + `@objc dynamic`** 필수.
- KeyPath literal(`\.status`)로 타입 안전.
- `NSKeyValueObservation` 토큰의 lifetime이 곧 관찰 lifetime — strong 보관 필수.

순수 Swift class에는 KVO가 불가. Combine `@Published` / `@Observable`로 대체.

## 비교 — Observer 메커니즘

| 메커니즘 | 발신 측 조건 | 타입 안전 | 취소 | iOS |
|---|---|---|---|---|
| KVO | NSObject + `@objc dynamic` | 약함 (Swift KeyPath은 강함) | observation 토큰 | 1.0+ |
| NotificationCenter | 누구나 | 약함 (userInfo dict) | observer 보관/제거 | 1.0+ |
| Combine `@Published` | `ObservableObject` | 강함 | AnyCancellable | 13+ |
| `@Observable` 매크로 | 일반 class | 강함 | View lifetime | 17+ |
| AsyncSequence | AsyncIterator 가진 타입 | 강함 | Task 취소 | 13+ |

## 흔한 함정 / Follow-up 질문

- **Q. KVO observer 해제를 빠뜨리면?**
  대상 객체 dealloc 시 observer가 nil이 되어 crash. observer는 strong-aware가 아니므로 dangling reference. 반드시 deinit/dealloc에서 `removeObserver:forKeyPath:context:` 호출.

- **Q. `context` 매개변수는 왜 필요한가?**
  superclass도 같은 keyPath를 관찰할 수 있어 콜백이 충돌. 고유한 context 포인터로 자기 것만 처리하고 나머지는 super에 전달.

- **Q. Swift에서 KVO를 쓰려면 어떤 제약?**
  (1) `NSObject` 상속, (2) `@objc dynamic var`, (3) struct/enum 불가. → 그래서 modern Swift에선 `Combine`/`@Observable`로 대체하는 추세.

- **Q. KVO와 NotificationCenter의 선택?**
  - 특정 객체의 특정 프로퍼티 변화 → KVO (1:N, 강결합).
  - 시스템 이벤트 / 전역 broadcast → NotificationCenter (N:N, 느슨한 결합).

- **Q. `automaticallyNotifiesObservers` 끄는 경우?**
  여러 ivar를 한 번에 바꾸고 한 번만 알리고 싶을 때. 직접 `willChange`/`didChange`로 묶어 호출.

- **Q. KVO 콜백이 어느 스레드에서 호출되나?**
  값을 변경한 스레드. UI 업데이트 시 main 스레드로 dispatch 필요.

- **Q. `NSKVONotifying_X` 클래스를 직접 보고 싶다면?**
  `object_getClass(obj)`로 실제 isa 확인. `[obj class]`는 원래 X를 반환 (override되어 있어서).

## 참고

- [Runtime](runtime.md) (isa-swizzling)
- Apple Docs: Key-Value Observing Programming Guide
- 05-swiftui / Observation 매크로
