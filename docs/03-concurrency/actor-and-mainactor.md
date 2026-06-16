# Actor와 @MainActor

> 한 줄 요약 — Actor는 **자신의 가변 상태에 한 번에 하나의 작업만 접근하도록** 컴파일러가 강제하는 참조 타입. 락을 직접 안 짜도 데이터 레이스를 막을 수 있다.

도입 버전: Swift 5.5+

## 왜 등장했나

기존 동시성에서는 `NSLock`, `DispatchQueue` 직렬화 등으로 *개발자가* 데이터 레이스를 막아야 했다. 빠뜨리면 런타임 버그. Actor는 **타입 자체가 격리 단위**이므로 잘못된 접근을 *컴파일 에러*로 잡는다.

## 기본

```swift
actor Counter {
    private var value = 0

    func increment() { value += 1 }
    func current() -> Int { value }
}

let c = Counter()
await c.increment()           // 외부에서 호출 시 await 필수
let v = await c.current()
```

- 외부에서 actor의 메서드/프로퍼티 접근은 모두 *비동기 경계* → `await`.
- 내부에서 자기 자신을 부를 땐 `await` 없이 동기 호출.
- 이 격리 덕분에 `value += 1`은 자동으로 직렬화.

## Reentrancy (재진입성)

actor의 메서드 안에서 `await`을 만나 suspend되면, 그 사이 **다른 작업이 같은 actor에 끼어들 수 있다**.

```swift
actor Cache {
    var data: [String: Data] = [:]

    func fetch(_ key: String) async -> Data {
        if let d = data[key] { return d }
        let d = await network.load(key)   // ← 여기서 다른 호출이 끼어들 수 있음
        data[key] = d                     // 그래서 중복 fetch가 발생할 수 있음
        return d
    }
}
```

해결: 진행 중 작업을 추적해 중복을 막거나, `await` 이후 다시 검사.

## @MainActor

UI 코드를 메인 스레드로 강제하는 글로벌 actor. 클래스/메서드/프로퍼티에 붙일 수 있다.

```swift
@MainActor
final class HomeViewModel {
    @Published var title = ""

    func load() async {
        let data = await api.fetch()       // 어느 executor에서 실행될지는 callee(api)의 격리에 따라 결정 — 자동으로 백그라운드라는 보장은 없다
        title = data                       // MainActor로 다시 hop
    }
}
```

- UIKit/SwiftUI 앱의 **모든 ViewController/View 관련 코드는 사실상 메인 액터**라고 봐야 안전.
- non-MainActor → MainActor 호출은 `await` 필요. 반대도 마찬가지.

## 메서드만 메인 액터로

```swift
class API {
    @MainActor
    func showError(_ msg: String) { /* UI 갱신 */ }
}
```

전체 클래스가 메인일 필요는 없을 때 메서드 단위로 격리.

## nonisolated

actor 안에서 *상태에 접근하지 않는* 메서드는 격리에서 빼도 안전. await 없이 호출 가능.

```swift
actor User {
    let id: UUID = .init()       // let은 자동 nonisolated 가능
    var name: String

    nonisolated func describe() -> String {
        "User(\(id))"            // var name 접근 불가
    }
}
```

`Equatable`/`Hashable` 같은 프로토콜 준수에서 자주 사용.

## Global Actor

```swift
@globalActor
actor DatabaseActor { static let shared = DatabaseActor() }

@DatabaseActor
final class UserRepository { ... }
```

여러 타입을 *같은 격리 영역*으로 묶을 때. `@MainActor`도 글로벌 액터의 한 예.

## 비교 — class + lock vs actor

| 구분 | class + lock | actor |
|---|---|---|
| 데이터 레이스 방지 | 개발자 책임 | 컴파일러 강제 |
| 데드락 | 발생 가능 | 자체 락 미사용으로 거의 없음 |
| 외부 호출 | 동기 가능 | `await` 필수 |
| 재진입 | 락 종류에 따라 | 기본 reentrant |
| 성능 | 락 비용 | actor hop 비용 |

## 흔한 함정 / Follow-up

- **Q. actor의 `let` 프로퍼티는 외부에서 await 없이 접근 가능?**
  Sendable 타입의 `let`은 가능 (Swift 5.5+ 룰). 가변(`var`)은 불가.

- **Q. actor가 데드락 걱정이 없는 이유?**
  내부에 락을 쓰지 않고, 작업을 큐잉하는 모델이기 때문. 단, *서로 다른 actor가 await로 호출 사슬을 만들면* 데드락은 아니어도 *상호 차단* 같은 라이브락은 가능.

- **Q. `@MainActor` 메서드 안에서 무거운 계산을 해도 되나?**
  안 됨. UI가 멈춤. CPU 바운드는 `Task.detached`나 별도 actor로 분리하고 결과만 메인으로 가져와라.

- **Q. ObjC/UIKit delegate 콜백이 메인이 아닐 수 있다는 건?**
  대부분 메인이지만 보장은 문서로 확인. `MainActor.assumeIsolated { ... }`는 *확실히 MainActor 위에 있을 때만* 써야 한다 — 아니면 런타임 trap이 난다. 메인 보장이 불확실하면 `Task { @MainActor in ... }` 또는 `await MainActor.run { ... }`로 명시적 hop을 강제하는 쪽이 안전하다.

- **Q. actor의 메서드를 `Task` 없이 호출할 수 없는 이유?**
  await을 쓰려면 비동기 컨텍스트가 필요한데, sync 컨텍스트엔 그게 없음. 그래서 `Task { await ... }`로 진입.

## 참고

- SE-0306 (Actors), SE-0316 (Global Actors), SE-0337 (Region-based Isolation)
- WWDC 2021: Protect mutable state with Swift actors
