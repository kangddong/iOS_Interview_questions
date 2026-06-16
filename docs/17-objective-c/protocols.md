# Protocols

> 한 줄 요약 — Swift protocol의 조상. ObjC protocol은 `@required`/`@optional` 메서드 선언만 가능하고, default implementation은 없다. delegate 패턴의 기반.

## 선언과 채택

```objc
@protocol DownloaderDelegate <NSObject>
@required
- (void)downloader:(id)d didFinish:(NSData *)data;
- (void)downloader:(id)d didFailWith:(NSError *)error;
@optional
- (void)downloader:(id)d didProgress:(float)progress;
@end

@interface Downloader : NSObject
@property (nonatomic, weak) id<DownloaderDelegate> delegate;
@end
```

- `@protocol Name <ParentProtocol>` 형태로 protocol composition.
- `<NSObject>`를 상속받는 게 관례 — `respondsToSelector:`, `isKindOfClass:` 같은 NSObject 메서드 사용 가능.
- `@required` (기본): 채택 클래스가 반드시 구현. 빠지면 경고.
- `@optional`: 호출 전 `respondsToSelector:` 확인 필수.

## Optional 메서드 호출

```objc
- (void)reportProgress:(float)p {
    if ([self.delegate respondsToSelector:@selector(downloader:didProgress:)]) {
        [self.delegate downloader:self didProgress:p];
    }
}
```

런타임 lookup이라 약간의 비용. 자주 호출되면 selector를 캐싱(`SEL`을 ivar에 저장).

## Protocol 채택

```objc
@interface MyVC : UIViewController <DownloaderDelegate, UITableViewDataSource>
@end

@implementation MyVC
- (void)downloader:(id)d didFinish:(NSData *)data { ... }
- (void)downloader:(id)d didFailWith:(NSError *)error { ... }
@end
```

여러 protocol 동시 채택 가능. Swift처럼 PAT/associated type 같은 고급 기능은 없다.

## Protocol을 타입으로

```objc
// 단일 protocol
id<DownloaderDelegate> delegate = ...;

// 여러 protocol (composition)
id<NSCoding, NSCopying> obj = ...;

// 특정 클래스 + protocol
UIView<DownloaderDelegate> *view = ...;
```

Swift의 existential `any P`에 해당.

## Informal Protocol (옛 패턴)

`@protocol` 정식 선언 없이 `NSObject(category)`로 메서드를 선언만 해두고 채택은 신뢰 기반. ObjC 1.0 시절 `@optional`이 없어서 사용. 현대 코드에선 거의 사라짐.

## 비교 — ObjC protocol vs Swift protocol

| 항목 | ObjC protocol | Swift protocol |
|---|---|---|
| `@optional` 메서드 | O (런타임 체크) | `@objc` protocol에서만 |
| default implementation | X | `extension`으로 가능 |
| Associated Type (PAT) | X | O (`associatedtype`) |
| 채택 가능 타입 | class만 (`id<P>`) | class, struct, enum |
| 타입으로 사용 | `id<MyDelegate>` | `any P`, `some P` |
| 상속 | `<NSObject>` 등 protocol 상속 | protocol 상속 가능 |
| Class-only 제약 | 자동 (struct/enum 없으므로) | `AnyObject` 또는 `: class` 명시 |

## Delegate 패턴과의 관계

ObjC delegate 패턴 = protocol + weak property.

```objc
@protocol XDelegate <NSObject>
@optional
- (void)xDidChange:(X *)x;
@end

@interface X : NSObject
@property (nonatomic, weak) id<XDelegate> delegate;
@end
```

- `<NSObject>` 상속으로 NSObject 메서드 사용 가능.
- `weak`로 보유해 retain cycle 방지.
- Swift의 `protocol XDelegate: AnyObject { }`에 정확히 대응.

## 흔한 함정 / Follow-up 질문

- **Q. Optional 메서드 호출 시 nil 체크만으로 부족한가?**
  ```objc
  // ❌ 잘못된 패턴
  [self.delegate downloader:self didProgress:p];  // 구현 안 했으면 unrecognized selector crash
  ```
  반드시 `respondsToSelector:` 확인. delegate가 nil이라도 `respondsToSelector:`는 nil에 대한 메시지로 NO를 반환하므로 안전.

- **Q. `<NSObject>` 상속을 안 하면?**
  `respondsToSelector:` 같은 NSObject 메서드를 호출할 수 없다. delegate처럼 optional 호출하는 protocol은 거의 항상 `<NSObject>` 상속.

- **Q. Protocol에 property 선언 가능?**
  가능. 단 채택 클래스가 직접 `@synthesize` 또는 수동 구현해야 함 (자동 합성 X).
  ```objc
  @protocol Named
  @property (nonatomic, copy, readonly) NSString *name;
  @end
  ```

- **Q. Swift protocol을 ObjC에서 쓰려면?**
  `@objc protocol`로 선언. PAT 사용 금지, struct/enum 채택 불가 등 제약.

- **Q. ObjC protocol에 default implementation을 주려면?**
  불가능. 대안: protocol 채택 클래스의 *base class*에 구현을 두거나, category로 NSObject에 default 메서드를 붙임 (informal 방식).

- **Q. Class-only 제약?**
  ObjC에는 struct/enum이 객체로 protocol을 채택하는 개념이 없어 자동으로 class-only. Swift는 `AnyObject` 제약을 명시해야 한다.

- **Q. `instancetype` vs `id`?**
  initializer/factory의 반환 타입에 `instancetype`을 쓰면 호출자 클래스 타입으로 좁혀진다 → 컴파일 타임 타입 안전성 ↑.

## 참고

- 01-swift-language / Protocol-Oriented Programming
- 12-design-patterns / Delegate
- Apple Docs: Working with Protocols
