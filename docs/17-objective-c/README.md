# 17. Objective-C

> 한 줄 요약 — Objective-C는 **C + Smalltalk 스타일 메시지 디스패치**의 동적 언어. `objc_msgSend`로 모든 메서드 호출이 런타임 lookup → 그래서 KVO·Swizzling·associated object 같은 *런타임 메타프로그래밍*이 자연스럽다. Swift는 이 동적성을 줄여 안전성과 정적 디스패치를 얻었다.

Swift 이전 시대의 iOS/macOS를 떠받친 언어. 레거시 코드베이스 유지보수, Swift ↔ ObjC interop, 런타임 이해(KVO·Swizzling·associated object)까지 면접에서 의외로 자주 나온다. *주니어*는 메모리/프로퍼티 키워드부터, *시니어*는 런타임 메커니즘과 ABI/Swift interop까지.

## Objective-C vs Swift 한눈에

| 축 | Objective-C | Swift |
| --- | --- | --- |
| 디스패치 | **`objc_msgSend`** (동적, runtime lookup) | Static / vtable / witness / `@objc` 시 msgSend |
| 메모리 | MRC → ARC (수동에서 자동으로) | ARC + 값 타입 우선 |
| 타입 | 약한 정적 타입, `id` 흔함 | 강한 정적 타입, 옵셔널 |
| 메타프로그래밍 | runtime API (associated obj, swizzle, KVO) | macro (컴파일 시) + 일부 runtime |
| Nil 메시지 | **안전** (no-op + 기본값 반환) | `nil`은 옵셔널, 강제 언래핑 시 크래시 |
| 문법 | `[obj method:arg]` 대괄호 | `obj.method(arg)` 점 |

## 핵심 개념 5선

### 1. Property 키워드
| 키워드 | 의미 |
| --- | --- |
| **strong** | 강참조 (기본). 객체 살아 있게 함 |
| **weak** | 약참조, 해제 시 자동 nil |
| **copy** | 대입 시 복사 — `NSString`/`NSArray`처럼 *불변본을* 보장하려고 |
| **assign** | 카운트 영향 X, 주로 primitive (`int`, `BOOL`) |
| **atomic** | getter/setter 락 (기본). 비싸다 |
| **nonatomic** | 락 없음. UIKit에선 메인 스레드만 만지므로 거의 nonatomic |
| **readonly** | getter만 노출 |

→ "왜 `NSString *`을 `copy`로 받는가?" — 호출자가 `NSMutableString`을 넘긴 뒤 *수정*하면 내 상태가 망가짐. copy로 끊어둠.

### 2. `objc_msgSend` 디스패치
- 모든 ObjC 메서드 호출은 `objc_msgSend(receiver, selector, args...)` 으로 변환.
- **isa pointer** → class 객체 → method list 탐색 → 못 찾으면 superclass.
- **메서드 캐시** (per-class): 한번 찾으면 캐싱.
- 못 찾으면 **dynamic resolution** → forwarding chain → unrecognized selector 크래시.

### 3. 런타임 메타프로그래밍
- **Method Swizzling**: 메서드 IMP를 *런타임에 교체*. `method_exchangeImplementations`. AOP (로깅·아날리틱스) 가능하지만 **위험** — 디버깅 어렵고 충돌 가능.
- **Associated Object**: Category에서 *stored property를 못 만드는 한계*를 우회. `objc_setAssociatedObject` / `objc_getAssociatedObject`로 키-값 부착.
- **KVO**: `addObserver:forKeyPath:` 호출 시 isa를 *동적 서브클래스*로 swizzle해서 setter에 알림 hook을 삽입.

### 4. Block과 retain cycle
- ObjC의 클로저. 캡처 시 *strong 기본* — Swift와 동일.
- `self`를 캡처하고 self가 block을 보유 → 사이클.
- 해결: `__weak typeof(self) weakSelf = self;` 패턴 + block 안에서 `__strong typeof(weakSelf) strongSelf = weakSelf;` 로 일시 strong.

### 5. Swift ↔ ObjC Interop
- **`@objc`**: Swift 멤버를 ObjC에 노출. `objc_msgSend` 디스패치 적용.
- **`@objc dynamic`**: KVO·Swizzling 가능하도록 강제.
- **NS_SWIFT_NAME**: ObjC API를 Swift에서 다른 이름으로 노출.
- **Nullability annotation** (`_Nullable` / `_Nonnull`): Swift 옵셔널 변환에 직접 매핑. 미지정 = `T!` (implicitly unwrapped).
- Bridging Header: 앱 타깃에서 ObjC ↔ Swift 양방향 import.

## 면접 답변 골격

```
"왜 ObjC를 알아야 하나?"
  → 레거시 유지보수 + iOS SDK 자체가 ObjC 기반 + 동적 기능(KVO/Swizzling) 이해

"objc_msgSend가 느리지 않나?"
  → 메서드 캐시 + IMP 캐시로 평균 O(1). 단, 정적 디스패치보다는 비쌈.

"Swift가 동적성을 줄인 이유?"
  → 컴파일 시 최적화 (inline, specialization) + 안전성 (타입 강제) + ARC 최적화.

"swizzling은 써도 되나?"
  → 디버깅 가능한 범위에서, init 시점에 1회, 충돌 없는지 검증 후. 가능하면 합성으로.
```

## 항목

### 메모리 관리
- [ARC와 MRC](arc-and-mrc.md)
- [Ownership Qualifiers (`__strong` / `__weak` / `__unsafe_unretained` / `__autoreleasing`)](ownership-qualifiers.md)
- [`autoreleasepool`과 NSAutoreleasePool](autoreleasepool.md)

### 언어 핵심
- [Properties — `atomic/nonatomic`, `strong/weak/copy/assign`, `readonly`](properties.md)
- [Blocks — capture 의미, `__block`, copy semantics, retain cycle](blocks.md)
- [Categories & Class Extensions](categories-and-extensions.md)
- [Protocols & informal protocols (`@required` / `@optional`)](protocols.md)

### 디스패치 / 런타임
- [Method Dispatch & `objc_msgSend`](method-dispatch.md)
- [Runtime — isa, associated objects, method swizzling](runtime.md)
- [KVO / KVC](kvo-kvc.md)

### Swift Interop
- [Swift ↔ Objective-C Interop (`@objc`, `NS_SWIFT_NAME`, nullability, bridging header)](swift-interop.md)

## 자주 묻는 질문

**주니어**: `strong` vs `weak` vs `copy` vs `assign` / `nonatomic`을 쓰는 이유 / `nil`에 메시지 보내면? / Block에서 `self` 캡처 시 retain cycle 막는 법

**3년차 미들**: ARC가 컴파일러에서 삽입하는 코드 / `__weak`이 zeroing 되는 메커니즘 / `objc_msgSend` 호출 흐름 (selector → IMP 캐시) / Category에서 stored property 못 만드는 이유와 associated object 우회 / KVO가 동작하는 원리 (isa-swizzling)

**시니어**: Method swizzling의 위험성과 안전 패턴 / Swift class를 `@objc` 노출할 때 vtable vs message dispatch / NS_SWIFT_NAME으로 API 이름 재매핑 / nullability annotation이 Swift 옵셔널 변환에 미치는 영향 / Block의 stack/heap/global 종류와 `Block_copy`
