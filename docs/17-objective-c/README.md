# 17. Objective-C

Swift 이전 시대의 iOS/macOS를 떠받친 언어. 레거시 코드베이스 유지보수, Swift ↔ ObjC interop, 런타임 이해(KVO·Swizzling·associated object)까지 면접에서 의외로 자주 나온다. *주니어*는 메모리/프로퍼티 키워드부터, *시니어*는 런타임 메커니즘과 ABI/Swift interop까지.

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
