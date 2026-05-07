# Error Handling (`throws`, `Result`, `rethrows`)

> 한 줄 요약 — Swift 에러 처리는 *throwing 함수 + try/catch* 모델. 비동기/저장 컨텍스트에선 값으로 다루기 위해 `Result`, 고차함수에선 `rethrows`로 에러를 투명하게 전파한다.

## throws / try / catch

```swift
enum NetError: Error { case offline, status(Int) }

func fetch() throws -> Data { ... }

do {
    let data = try fetch()
} catch NetError.offline {
    // 특정 케이스
} catch let NetError.status(code) where code >= 500 {
    // pattern + where
} catch {
    // 그 외 (error: any Error)
}
```

`try` 변형:

| 표현 | 의미 |
|---|---|
| `try` | 실패 시 throw 전파 |
| `try?` | 실패 시 `nil` (`T?`) |
| `try!` | 실패 시 크래시 (절대 안 던진다고 *보장*할 때만) |

## Typed throws (Swift 6.0+)

```swift
func parse() throws(ParseError) -> AST { ... }
```

- 던질 수 있는 에러 타입을 명시. 호출자가 catch에서 정확한 타입을 받음
- 미사용 시 기본은 `throws(any Error)`와 동일

## `Result<Success, Failure>`

```swift
func load(_ id: Int, completion: (Result<User, NetError>) -> Void) { ... }

load(1) { res in
    switch res {
    case .success(let user): use(user)
    case .failure(let err):  log(err)
    }
}
```

언제 쓰나:
- *값으로 들고 다녀야 할 때* (저장, 큐잉, completion handler)
- 콜백 기반 비동기 API
- async/await가 가능하면 보통 `Result`보다 `throws`가 더 자연스러움

`Result`/`throws` 변환:

```swift
let r = Result { try fetch() }
let v = try r.get()
```

## `rethrows`

고차함수가 *클로저가 throw할 때만* throw함을 표현. 호출자가 비-throwing 클로저를 넘기면 try 없이 호출 가능.

```swift
func map<T, U>(_ xs: [T], _ f: (T) throws -> U) rethrows -> [U] {
    var r: [U] = []
    for x in xs { r.append(try f(x)) }
    return r
}

map([1,2]) { $0 * 2 }            // try 불필요
try map([1,2]) { try parse($0) } // try 필요
```

## 비교

| 도구 | 사용처 | 비용 | 타입 정보 |
|---|---|---|---|
| `throws` | 동기/async 본문 흐름 | 0 (예외 객체 X, ABI 통합) | Swift 6 typed throws로 가능 |
| `Result` | 값 보관, 콜백 비동기 | enum 박싱 | 제네릭 |
| `Optional` | *왜* 실패했는지 무관 | 0 | 없음 |
| `assert/precondition` | *버그* 표현 | release에서 제거(assert) | n/a |
| `fatalError` | 회복 불가 | 항상 abort | n/a |

## 흔한 함정 / Follow-up

- **Q. `try?`가 항상 깨끗한가?**
  실패 사유를 버린다. 진단/사용자 피드백이 필요하면 do/catch.

- **Q. async + throws?**
  `func f() async throws -> T` 자연스럽게 결합. 호출은 `try await f()`.

- **Q. `Error`는 어떻게 만들어지나?**
  `Error`는 단순 마커 프로토콜. 보통 `enum`이 케이스를 표현하기 좋음. 메시지/코드를 담으려면 `LocalizedError`도 채택.

- **Q. 에러를 재던지기 vs 변환?**
  layer boundary에선 *추상 레벨에 맞는* 에러로 변환 (`.networkFailure(underlying: err)`). 그대로 흘려보내면 호출자가 내부 구현에 결합됨.

- **Q. defer는 throw와 함께 어떻게 동작?**
  scope 종료 시(throw, return, fall-through 모두) 역순 실행. 자원 정리에 유용.

## 참고

- Swift Language Guide: Error Handling
- SE-0413 Typed throws
