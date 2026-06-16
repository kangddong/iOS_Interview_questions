# Singleton 패턴

> 한 줄 요약 — **앱 전체에서 인스턴스가 하나만 존재**하도록 강제하는 패턴. Apple SDK에 흔히 등장(`UIApplication.shared`, `URLSession.shared`)하지만, *남용하면 테스트 불가능한 글로벌 상태*가 된다.

## Swift에서의 표준 구현

```swift
final class Analytics {
    static let shared = Analytics()
    private init() {}        // 외부 생성 차단

    func log(_ event: String) { ... }
}
```

- `static let`은 **lazy + thread-safe**가 자동 보장 (Swift 표준).
- `private init()`으로 외부에서 또 만들 수 없게.

## 정당한 사용처

다음과 같이 *진짜로 인스턴스가 하나여야 의미가 있는* 경우:

- 시스템 자원 wrapper: `URLSession.shared`, `FileManager.default`
- 앱 전역 설정 캐시: `UserDefaults.standard`
- 디바이스 단일 자원: `NotificationCenter.default`

## 안티패턴이 되는 경우

```swift
final class APIService {
    static let shared = APIService()
    private init() {}
    func fetchUser(_ id: String, completion: @escaping (User?) -> Void) { ... }
}

final class HomeVM {
    func load() { APIService.shared.fetchUser("u1") { ... } }   // ❌
}
```

문제:
- **테스트 불가능** — mock으로 못 바꿈.
- **숨은 의존성** — HomeVM이 APIService에 의존하는지 코드를 읽어야 알 수 있음.
- **상태 공유** — 다른 화면의 mutation이 영향.
- **순서 의존성** — 누가 언제 초기화하느냐로 버그.

## 해결 — DI를 통한 사용

singleton 자체는 두되, *직접 부르지 말고* protocol 통해 주입:

```swift
protocol APIType {
    func fetchUser(_ id: String) async throws -> User
}

final class APIService: APIType {
    static let shared = APIService()
    private init() {}
    func fetchUser(_ id: String) async throws -> User { ... }
}

final class HomeVM {
    private let api: APIType
    init(api: APIType = APIService.shared) { self.api = api }   // 기본값 share
}
```

- 운영 코드는 변경 없이 share 사용.
- 테스트에서 mock 주입 가능.
- 의존성이 init에 *드러남*.

## 멀티스레드 안전성

```swift
static let shared = Foo()
```

Swift가 알아서 `dispatch_once` 비슷하게 처리. 별도 lock 불필요.

내부 mutable state가 있다면 그건 별도 동기화 필요:

```swift
final class Cache {
    static let shared = Cache()
    private let queue = DispatchQueue(label: "io.cache", attributes: .concurrent)
    private var store: [String: Data] = [:]

    func set(_ d: Data, for k: String) { queue.async(flags: .barrier) { self.store[k] = d } }
    func get(_ k: String) -> Data? { queue.sync { store[k] } }
}
```

또는 actor로:

```swift
actor Cache {
    static let shared = Cache()
    private var store: [String: Data] = [:]
    func set(_ d: Data, for k: String) { store[k] = d }
    func get(_ k: String) -> Data? { store[k] }
}
```

## 비교 — Singleton vs Static class vs Global function

| | Singleton | static class (only static members) | Global func |
|---|---|---|---|
| 인스턴스 | 1개 | 0개 (타입 자체) | - |
| 다형성/protocol | 가능 | 어려움 | 어려움 |
| DI | 가능 (기본값으로) | 어려움 | 어려움 |
| state | 가능 | 가능 (static var) | 어려움 |

## 흔한 함정 / Follow-up

- **Q. `static let shared`가 thread-safe한 이유?**
  Swift 런타임이 *한 번만 초기화*되도록 보장. C++의 static local과 비슷.

- **Q. Singleton을 어떻게 테스트?**
  protocol 추상화 + 생성자 주입. 기본값으로 `.shared`. 테스트 시 mock 주입.

- **Q. 앱 시작 시 singleton init에 무거운 작업을 두면?**
  실제 *처음 접근될 때* lazy 초기화. 단, 첫 접근 시점이 메인 스레드일 가능성 큼 → 무거운 작업은 안에서 백그라운드.

- **Q. SwiftUI에서 singleton 대신?**
  `@Environment` 또는 `@Observable` 객체를 트리에 주입. UIApp 단일 데이터는 `@StateObject`/`@State`로 root에서 보유.

- **Q. SwiftUI Preview에서 singleton 때문에 시작 안 됨?**
  Preview 환경에서 singleton이 무거운 초기화를 하면 멈춤. preview용 mock으로 대체할 수 있게 protocol 추상화.

## 참고

- Apple Docs: Managing a Shared Resource Using a Singleton
- objc.io: Singletons
