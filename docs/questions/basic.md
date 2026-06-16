# 주니어 면접 질문 (신입 ~ 1년차)

기초 사실 확인 + 한 줄로 답할 수 있는 *왜* 위주.
**3년차 미들 깊이의 질문은 [intermediate.md](intermediate.md)** 참고.

## Swift Language

- `struct`와 `class`의 차이 → [struct-vs-class](../01-swift-language/struct-vs-class.md)
- 옵셔널이란? `?`와 `!`의 차이 → [optional](../01-swift-language/optional.md)
- `let`과 `var` 차이 (컬렉션에서) → [optional](../01-swift-language/optional.md)
- `guard`와 `if let` 차이 → [optional](../01-swift-language/optional.md)
- 클로저의 capture 의미 → [closures](../01-swift-language/closures.md)
- `@escaping`이 뭔가요 → [closures](../01-swift-language/closures.md)
- 프로토콜과 클래스 상속 차이 → [protocol-oriented-programming](../01-swift-language/protocol-oriented-programming.md)
- enum 연관 값 / 원시 값 → [enum](../01-swift-language/enum.md)
- `Equatable`/`Hashable`/`Codable` 자동 합성 조건 → [equatable-hashable-codable](../01-swift-language/equatable-hashable-codable.md)
- `lazy var` / computed property 차이 → [properties](../01-swift-language/properties.md)
- `try` / `try?` / `try!` 차이 → [error-handling](../01-swift-language/error-handling.md)
- 정적/동적 디스패치 차이 → [method-dispatch](../01-swift-language/method-dispatch.md)
- 접근 제어 (public/internal/fileprivate/private) → [access-control](../01-swift-language/access-control.md)

## Memory

- ARC가 무엇인가 → [arc](../02-memory-management/arc.md)
- strong / weak / unowned 차이 → [weak-vs-unowned](../02-memory-management/weak-vs-unowned.md)
- retain cycle 발생 패턴 → [retain-cycle](../02-memory-management/retain-cycle.md)
- `[weak self]`을 언제 쓰는가 → [capture-list](../02-memory-management/capture-list.md)
- `deinit`이 호출 안 되는 원인 → [retain-cycle](../02-memory-management/retain-cycle.md)

## Concurrency

- 메인 스레드와 백그라운드 스레드 → [runloop-and-main-thread](../03-concurrency/runloop-and-main-thread.md)
- UI 업데이트는 왜 메인 스레드여야 하나 → [runloop-and-main-thread](../03-concurrency/runloop-and-main-thread.md)
- `DispatchQueue.main.async` 사용 시점 → [gcd](../03-concurrency/gcd.md)
- `DispatchQueue.main.sync`가 데드락 → [gcd](../03-concurrency/gcd.md)
- GCD QoS 종류 → [gcd](../03-concurrency/gcd.md)
- async/await 기본 흐름 → [async-await](../03-concurrency/async-await.md)
- `@MainActor`는 어떤 역할? → [actor-and-mainactor](../03-concurrency/actor-and-mainactor.md)

## UIKit

- `viewDidLoad` vs `viewWillAppear` → [viewcontroller-lifecycle](../04-uikit/viewcontroller-lifecycle.md)
- `viewDidLoad`에서 `view.bounds`를 쓰면 안 되는 이유 → [viewcontroller-lifecycle](../04-uikit/viewcontroller-lifecycle.md)
- App Life Cycle 단계 → [app-lifecycle](../04-uikit/app-lifecycle.md)
- Auto Layout이란 → [auto-layout](../04-uikit/auto-layout.md)
- Content Hugging vs Compression Resistance → [auto-layout](../04-uikit/auto-layout.md)
- `frame` vs `bounds` → [frame-vs-bounds](../04-uikit/frame-vs-bounds.md)
- UITableView 셀 재사용 원리 → [tableview-collectionview](../04-uikit/tableview-collectionview.md)
- 셀 재사용 시 이미지 깜빡이는 이유 → [tableview-collectionview](../04-uikit/tableview-collectionview.md)
- Responder Chain → [responder-chain](../04-uikit/responder-chain.md)
- 버튼이 터치 안 먹을 때 의심할 것 → [responder-chain](../04-uikit/responder-chain.md)

## SwiftUI

- `@State` vs `@Binding` → [state-management](../05-swiftui/state-management.md)
- `@StateObject` vs `@ObservedObject` → [state-management](../05-swiftui/state-management.md)
- View가 struct인 이유 → [declarative-and-view-struct](../05-swiftui/declarative-and-view-struct.md)
- body가 자주 호출돼도 괜찮은가 → [declarative-and-view-struct](../05-swiftui/declarative-and-view-struct.md)
- iOS 17+ `@Observable`이 좋은 이유 → [observation-macro](../05-swiftui/observation-macro.md)

## Networking / Persistence

- URLSession.shared를 그대로 쓰면 한계? → [urlsession](../07-networking/urlsession.md)
- Codable에서 키와 프로퍼티 이름이 다를 때 → [codable](../07-networking/codable.md)
- 토큰을 UserDefaults에 저장하면 왜 안 되나 → [userdefaults](../08-persistence/userdefaults.md)
- Documents / Caches / tmp 차이 → [file-manager](../08-persistence/file-manager.md)

## Architecture / Patterns

- MVC와 MVVM 차이 → [mvc-vs-mvvm](../06-architecture/mvc-vs-mvvm.md)
- Massive View Controller가 뭐고 어떻게 푸나 → [mvc-vs-mvvm](../06-architecture/mvc-vs-mvvm.md)
- Singleton의 문제와 대안 → [singleton](../12-design-patterns/singleton.md) / [dependency-injection](../06-architecture/dependency-injection.md)
- Delegate vs Closure 선택 기준 → [delegate](../12-design-patterns/delegate.md)

## 기타

- Bundle / `Bundle.main` vs `Bundle.module` → [spm](../11-build-system/spm.md)
- `Info.plist` 역할과 entitlements와의 차이 → [code-signing](../11-build-system/code-signing.md)
- Debug와 Release 차이 → [xcode-build](../11-build-system/xcode-build.md)

## CS Fundamentals

- 프로세스와 스레드 차이 → [process-vs-thread](../13-cs-fundamentals/process-vs-thread.md)
- 스택과 힙 차이 → [memory-model](../13-cs-fundamentals/memory-model.md) + [02-memory-management/heap-vs-stack](../02-memory-management/heap-vs-stack.md)
- iOS는 swap이 없는데 메모리 부족 시 어떻게? → [memory-model](../13-cs-fundamentals/memory-model.md)
- Array vs Dictionary 시간복잡도 → [data-structures](../13-cs-fundamentals/data-structures.md)
- Big-O가 뭔가요 → [algorithm-complexity](../13-cs-fundamentals/algorithm-complexity.md)
- 데드락이 일어나는 조건 → [concurrency-primitives](../13-cs-fundamentals/concurrency-primitives.md)
- Mutex vs Semaphore → [concurrency-primitives](../13-cs-fundamentals/concurrency-primitives.md)

## Network

- TCP와 UDP 차이 → [tcp-vs-udp](../14-network/tcp-vs-udp.md)
- TCP 3-way handshake → [tcp-vs-udp](../14-network/tcp-vs-udp.md)
- OSI 7계층 / TCP-IP 4계층 → [osi-and-tcp-ip](../14-network/osi-and-tcp-ip.md)
- HTTP 메서드 종류와 의미 → [http-basics](../14-network/http-basics.md)
- 멱등성 (idempotent)이란 → [http-basics](../14-network/http-basics.md)
- 200 / 301 / 401 / 404 / 500 의미 → [http-basics](../14-network/http-basics.md)
- HTTPS는 HTTP와 어떻게 다른가 → [https-and-tls](../14-network/https-and-tls.md)
- DNS는 무엇 → [dns-and-caching](../14-network/dns-and-caching.md)
- URL 입력부터 화면 표시까지 흐름 → [osi-and-tcp-ip](../14-network/osi-and-tcp-ip.md)
- WebSocket을 언제 쓰나 → [websocket](../14-network/websocket.md)
