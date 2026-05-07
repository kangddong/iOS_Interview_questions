# Composition over Inheritance (in Swift)

> 한 줄 요약 — 동작/상태를 *부모 클래스에서 물려받기*보다 **여러 작은 조각을 조립**해서 표현하라는 원칙. Swift에서는 *protocol + extension*과 *struct 합성*이 그 도구.

## 왜 inheritance가 위험한가

- 부모 변경이 모든 자식에게 전파 (fragile base class).
- 단일 상속 제약 (Swift class).
- *is-a* 관계가 아닐 때 억지로 맞추면 어색해짐.
- 테스트와 mock이 어려움 (override 지옥).

## Protocol-Oriented 대안

```swift
// 동작을 protocol로 표현
protocol Loggable {
    func log(_ message: String)
}

extension Loggable {
    func log(_ message: String) { print("[LOG] \(message)") }
}

// 필요한 곳에 채택 — 다중 채택 OK
struct Networking: Loggable { ... }
struct Database: Loggable { ... }
```

- 다중 채택 가능 (protocol).
- 기본 구현은 extension으로 제공.
- 필요할 때 override.

→ 이미 [01-swift-language/protocol-oriented-programming.md](../01-swift-language/protocol-oriented-programming.md)에 깊게 정리.

## Struct 합성 예

```swift
struct Profile { let name: String; let age: Int }
struct Auth    { let token: String; let expiresAt: Date }

struct UserSession {
    let profile: Profile
    let auth: Auth
}
```

상속 없이 *역할별 작은 타입*을 합성. 각자 단위 테스트 쉬움.

## 클래스 합성 — has-a

```swift
final class ImageLoader {
    private let cache: ImageCache
    private let downloader: Downloader

    init(cache: ImageCache, downloader: Downloader) {
        self.cache = cache; self.downloader = downloader
    }

    func load(_ url: URL) async -> UIImage? {
        if let img = cache.image(for: url) { return img }
        let img = await downloader.download(url)
        if let img { cache.set(img, for: url) }
        return img
    }
}
```

`ImageLoader is-a Cache`나 `is-a Downloader`가 아니라, *둘을 갖고 있다*. 각 의존성을 mock으로 바꿔 테스트 가능.

## 언제 inheritance가 적절한가

- *명확한 is-a 관계* + 동작 거의 변경 없음.
- 프레임워크 설계상 강제 (`UIViewController`, `UIView` 등).
- 디자인 패턴이 상속 기반 (Template Method).

UIKit 자체는 상속 트리. 우리가 새 추상 클래스를 만들 일은 점점 줄어듦.

## 비교 — Inheritance vs Composition

| | Inheritance | Composition |
|---|---|---|
| 결합도 | 높음 (parent 변경 영향) | 낮음 |
| 다중 행동 | 단일 상속 한계 | protocol 다중 채택 |
| 재사용 | 부모 코드 자동 상속 | 명시적 위임 필요 |
| 테스트 | 어려움 (override) | 쉬움 (의존 주입) |
| 학습 곡선 | 익숙 | Swift POP 이해 필요 |

## 흔한 함정 / Follow-up

- **Q. 상속을 아예 쓰지 말아야 하나?**
  아니다. UIKit, UIView 같이 프레임워크 강제. 또 데이터 모델의 다형성 표현(예: `Animal` → `Dog`, `Cat`)이 자연스러우면 사용. 단, *코드 재사용*만을 위한 상속은 자제.

- **Q. protocol + extension의 한계?**
  protocol은 *저장 프로퍼티*를 못 선언. 기본 구현이 동적 디스패치되지 않을 수 있음 (witness table). 필요 시 named type으로.

- **Q. SwiftUI에서 컴포지션?**
  뷰 자체가 *작은 struct를 조합하는* 모델. View 트리가 곧 composition.

- **Q. NSObject 상속을 줄이려면?**
  ObjC 런타임 의존 없는 영역에서는 순수 Swift `final class` 또는 struct/protocol. KVO/notification selector 기반은 NSObject 필요.

## 참고

- Crusty's Talk (WWDC 2015): Protocol-Oriented Programming
- Effective Java (Item 18: Favor composition over inheritance) — 언어는 다르지만 원칙 동일
