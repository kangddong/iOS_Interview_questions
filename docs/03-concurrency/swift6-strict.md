# Swift 6 Strict Concurrency

> 한 줄 요약 — Swift 6는 **데이터 레이스를 컴파일 에러로 강제**한다. 5.x에서 경고였던 `Sendable`/actor 격리 위반이 *빌드 실패*로 격상. 마이그레이션은 *Targeted → Complete* 단계로.

도입 버전: Swift 5.10에서 점진적 옵트인, Swift 6.0부터 기본.

## 무엇이 바뀌나

| | Swift 5 | Swift 6 |
|---|---|---|
| 데이터 레이스 | 런타임 버그 | **컴파일 에러** |
| Sendable 검사 | 옵션 | 기본 |
| actor 격리 위반 | 경고 | 에러 |
| `@unchecked Sendable` | 사용 가능 | 그대로 (개발자 책임) |
| Region-based isolation | 도입 (5.9) | 더 정밀 |

## Strict checking 단계

빌드 설정 `SWIFT_STRICT_CONCURRENCY`:

| 레벨 | 의미 |
|---|---|
| `minimal` | 명시적 Sendable만 검사 |
| `targeted` | 동시성을 사용하는 곳만 |
| `complete` | 전체 검사 (Swift 6 동작) |

마이그레이션 권장: minimal → targeted → complete.

## 자주 만나는 에러와 해결

### 1) "Capture of 'self' with non-sendable type ..."

```swift
final class VM {              // class는 기본 non-Sendable
    var value = 0
    func bind() {
        Task { self.value = 1 }  // ❌ Task 클로저는 @Sendable, self가 non-Sendable
    }
}
```

해결:
- `final class VM: Sendable` (모든 프로퍼티 immutable + final이어야 가능)
- `actor VM`으로 전환
- `@MainActor final class VM` (메인 격리 — UI라면 자연스러움)

### 2) "Non-sendable type ... cannot cross actor boundary"

```swift
actor Cache { var data: [String: NSData] = [:] }
func read(c: Cache) async {
    let nsdata = await c.data.first?.value   // ❌ NSData는 non-Sendable
}
```

`NSData` → `Data`(struct, Sendable)로. 또는 *actor 안에서 변환 후 반환*.

### 3) "Sending 'foo' risks causing data races"

Region-based isolation: 컴파일러가 *region* 분석을 통해 객체가 *현재 격리에 갇혀 있는지* 추적. 외부로 보내려면 region을 *비워야* 함.

해결: 객체를 그 액터에서 만든 직후 전달, 이후 더 사용하지 않기.

### 4) "Reference to var '...' is not concurrency-safe"

```swift
class Foo {
    nonisolated(unsafe) static var counter = 0  // 명시적 unsafe
}
```

전역 mutable는 Swift 6에서 위험. 락이 있는 wrapper 또는 actor로.

## @MainActor 추론 규칙 강화

UIKit/SwiftUI 타입은 자동으로 `@MainActor`. 그 아래 메서드도 자동 메인 격리. 백그라운드에서 호출하려면 `nonisolated`.

```swift
@MainActor
class HomeVC: UIViewController {
    func parse() async -> [Item] { ... }   // 자동 @MainActor — UI 안 바꿔도 메인에서 실행
}
```

원하면 `nonisolated func parse() async` 명시.

## isolation 추론 (`#isolation`, isolated parameter)

```swift
func log(message: String, isolation: isolated (any Actor)? = #isolation) {
    // 호출자 격리에서 실행됨
}
```

호출자의 격리 컨텍스트를 *전파* 가능. 라이브러리/유틸 함수가 호출자 컨텍스트를 그대로 쓰게 만들어 hop 비용 절감.

## 마이그레이션 절차

1. 빌드 설정을 `targeted`로.
2. 경고 → 에러를 하나씩 처리.
3. ObservableObject/VM 같은 핵심 타입에 `@MainActor` 또는 `Sendable`.
4. 외부 라이브러리 의존 — 업데이트 또는 wrapper에 `@unchecked`.
5. `complete`로 격상.

## 흔한 함정 / Follow-up

- **Q. `@unchecked Sendable`을 남발해도 되나?**
  *진짜 thread-safe할 때만*. 락/큐로 보장하지 않으면 런타임 데이터 레이스. Swift 6의 보호를 우회하는 셈.

- **Q. UIKit 타입이 Sendable이 아니라 비동기에서 못 보낸다.**
  메인 격리에서만 다루도록 설계. async 함수가 UI 객체를 인자로 받아서 백그라운드에서 만지지 않게.

- **Q. existing 콜백 API의 클로저가 Sendable 요구하면?**
  캡처된 모든 값이 Sendable이어야. `[weak self]`만으로 해결 안 됨 — self의 타입 자체를 Sendable화 또는 actor.

- **Q. SwiftUI에서 영향?**
  View struct + `@Observable`은 자연스럽게 호환. ObservableObject도 메인 격리하면 OK. ViewModifier에서 백그라운드 작업 시 격리 명시.

- **Q. Combine 사용 시?**
  publisher의 출력이 Sendable이어야 자유롭게 actor를 넘나듦. `receive(on:)`에서 메인 액터로 hop.

- **Q. 5에서 6 한 번에 가도 되나?**
  보통 무리. 큰 코드베이스는 모듈 단위로 점진 진행. SDK도 6 호환을 점차 개선 중.

## 참고

- SE-0337 (Region-based Isolation), SE-0414 (Region-based Isolation), SE-0420 (Inheritance of actor isolation)
- WWDC 2024: Migrate your app to Swift 6
- Apple: Swift Concurrency Migration Guide
