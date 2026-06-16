# Sendable

> 한 줄 요약 — **동시성 경계를 안전하게 넘을 수 있는 값**임을 컴파일러에게 보장하는 마커 프로토콜. actor/Task 사이 데이터 공유의 *컴파일 타임 검증*.

도입 버전: Swift 5.5+ (Swift 6에서 기본 strict).

## 왜 필요한가

actor가 `await`로 외부에 *값을 넘기거나 받을 때*, 그 값이 다른 스레드에서 동시에 변경되면 데이터 레이스가 난다. `Sendable`은 "이 값은 그래도 안전하다"는 약속.

```swift
actor Box {
    var name = ""
    func set(_ s: String) { name = s }   // String은 Sendable → 안전
    func set(_ obj: NSObject) { ... }    // 클래스는 기본 non-Sendable → 경고
}
```

## 자동으로 Sendable인 것

- 모든 *값 타입* — 단, 모든 저장 프로퍼티가 Sendable일 때 한정.
- `Int`, `String`, `Array<T: Sendable>`, `Optional<T: Sendable>` 등.
- `actor` 자체.
- `@Sendable`로 표시된 closure.
- `actor` 자체 / `@Sendable` closure는 위 두 줄이 커버.

> 클래스는 *암시적 Sendable 대상이 아니다*. `let`만 가진 final class라도 `final class Foo: Sendable { ... }`처럼 *명시적으로 conform*해야 컴파일러가 Sendable로 인정한다. 암시적 Sendable 합성이 적용되는 건 주로 *조건을 만족하는 struct/enum*과 *actor*다.

## 자동으로 Sendable이 *아닌* 것

- 가변 클래스 (다른 스레드에서 동시 변경 가능).
- 클로저(기본). `@Sendable` 명시 필요.
- 기존 ObjC 타입 대부분.

## 클래스를 Sendable로 만드는 방법

세 가지 길:

```swift
// 1) final + 모두 immutable
final class Config: Sendable {
    let host: String
    let port: Int
    init(host: String, port: Int) { ... }
}

// 2) actor
actor Counter { var value = 0 }

// 3) 수동 보증 — 컴파일러는 검증 못 함, 개발자 책임
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var data: [String: Data] = [:]
    // 락으로 동시성 직접 관리
}
```

`@unchecked Sendable`은 *진짜로 안전할 때만* 써라. 락/큐로 동시성을 직접 관리한다는 뜻.

## @Sendable closure

```swift
func run(_ work: @Sendable () -> Void) { ... }

let name = "hi"
run { print(name) }              // String은 Sendable → OK

class Box { var v = 0 }
let b = Box()
run { b.v += 1 }                 // ❌ Box가 non-Sendable
```

캡처하는 모든 값이 Sendable이어야 한다. `Task { ... }`의 클로저, `TaskGroup.addTask {}` 등이 모두 `@Sendable`.

## Strict Concurrency Checking

빌드 설정에서 단계별로 켤 수 있다:

| 레벨 | 의미 |
|---|---|
| Minimal | 명시적 `Sendable`만 검사 |
| Targeted | 동시성 사용한 곳만 |
| Complete | 전체 검사 (Swift 6 동작) |

기존 코드를 점진적으로 Swift 6에 맞춰갈 때 사용.

## 흔한 함정 / Follow-up

- **Q. `Array<UIView>`를 actor 사이로 넘길 수 있나?**
  `UIView`는 non-Sendable이라 경고. UI 객체는 메인 액터에서만 다루도록 격리하라.

- **Q. struct에 클래스 프로퍼티가 있으면?**
  그 클래스가 Sendable이 아니면 struct도 자동 Sendable이 안 된다. 한 멤버라도 non-Sendable이면 끝.

- **Q. `@unchecked Sendable`은 어떨 때?**
  - 내부 락/큐로 직렬화가 보장된 캐시
  - 불변 데이터지만 컴파일러가 final class 추론 못 하는 경우
  - 외부 라이브러리 타입을 wrap할 때
  안전성은 *개발자 보증*이므로 신중히.

- **Q. `Sendable`과 `@Sendable`의 차이?**
  `Sendable`은 *타입* 제약(struct/class/actor가 채택), `@Sendable`은 *함수 타입* 속성(closure/함수에 부여).

- **Q. Swift 6에서 뭐가 바뀌나?**
  Strict checking이 기본. 지금 경고로만 뜨는 것들이 에러가 됨. 프로젝트는 미리 Targeted/Complete로 점진적 마이그레이션 권장.

## 참고

- SE-0302 (Sendable), SE-0337 (Region-based Isolation)
- WWDC 2022: Eliminate data races using Swift Concurrency
