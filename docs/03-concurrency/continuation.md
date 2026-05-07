# Continuation — 콜백 API를 async로 변환

> 한 줄 요약 — `withCheckedContinuation` / `withCheckedThrowingContinuation`은 **delegate/closure 기반의 옛 API를 async/await로 감싸는 표준 도구**. 핵심 규칙: **continuation은 정확히 한 번만 resume** 한다.

도입 버전: Swift 5.5+

## 기본 형태

```swift
func legacyLoad(completion: @escaping (Result<Data, Error>) -> Void) { ... }

func modernLoad() async throws -> Data {
    try await withCheckedThrowingContinuation { cont in
        legacyLoad { result in
            cont.resume(with: result)
        }
    }
}
```

- `withCheckedContinuation`: throws 안 하는 변형.
- `withCheckedThrowingContinuation`: throws 가능.
- `withUnsafeContinuation` 계열: 검증을 끄고 성능 최적화 (실수 즉시 UB) — 거의 안 씀.

## resume 규칙

| 상황 | 결과 |
|---|---|
| 한 번 호출 | 정상 |
| 두 번 호출 | **크래시** (checked는 fatalError) |
| 한 번도 안 호출 | **영원히 await 멈춤 + 메모리 누수** |

가장 흔한 버그: 콜백이 *여러 번 호출되는 형태*거나 *오류 경로에서 호출 누락*.

```swift
// ❌ 위험 — failure에서 호출 안 함
api.load { data in
    cont.resume(returning: data)
}
api.onError = { _ in /* resume 누락 */ }

// ✅ 안전
api.load { data in
    cont.resume(returning: data)
}
api.onError = { error in
    cont.resume(throwing: error)
}
```

## 멱등 호출이 필요한 콜백

옛 API가 *여러 번 호출*되는 경우 (예: progress + completion):

```swift
func download() async throws -> URL {
    try await withCheckedThrowingContinuation { cont in
        var resumed = false
        api.start(progress: { _ in /* 진행률 */ },
                  completion: { result in
                      guard !resumed else { return }
                      resumed = true
                      cont.resume(with: result)
                  })
    }
}
```

위치 좋은 *플래그*나 actor로 한 번만 보장.

## delegate 기반 변환

여러 콜백 메서드 중 *완료/실패*만 신호로 사용:

```swift
final class Adapter: NSObject, FooDelegate {
    let cont: CheckedContinuation<Result, Error>
    init(_ c: CheckedContinuation<Result, Error>) { self.cont = c }

    func didFinish(_ result: Result) { cont.resume(returning: result) }
    func didFail(_ error: Error)     { cont.resume(throwing: error) }
}

func wrap() async throws -> Result {
    try await withCheckedThrowingContinuation { cont in
        let adapter = Adapter(cont)
        legacy.delegate = adapter   // adapter가 cont를 들고 있음 — strong 참조 보장 필요
        legacy.start()
    }
}
```

adapter를 *closure 안에서만 참조*하면 closure 끝에서 ARC 해제 가능 → cont도 같이. delegate가 weak이면 사라지므로 *어딘가에 strong* 보유.

## 취소 전파

`Task.cancel()`은 자동으로 continuation을 *resume*하지 않는다. 옛 API의 `cancel`을 호출해 콜백을 끌어내야 함.

```swift
func load() async throws -> Data {
    try await withTaskCancellationHandler {
        try await withCheckedThrowingContinuation { cont in
            let task = legacy.start { cont.resume(with: $0) }
            // 보관할 수 있게...
        }
    } onCancel: {
        legacy.cancelLatest()
    }
}
```

`withTaskCancellationHandler`로 취소 시점에 호출할 핸들러를 등록.

## 비교 — Continuation vs Task vs AsyncStream

| | Continuation | Task | AsyncStream |
|---|---|---|---|
| 결과 수 | 1번 (단일 값/throw) | 단일 작업 | 0~다수 + finish |
| 사용처 | 콜백 1회 | 작업 시작 | 이벤트 스트림 |
| 변환 대상 | completion handler | - | delegate, NotificationCenter |

→ [async-sequence-and-stream.md](async-sequence-and-stream.md)

## 흔한 함정 / Follow-up

- **Q. resume을 두 번 호출했다.**
  `checked`는 즉시 fatalError로 죽음. 멈춰있는 await가 두 번 깨지는 *어처구니없는* 상태를 막기 위함. 디버깅 친화적.

- **Q. `withUnsafeContinuation`을 쓸 때?**
  매우 핫한 경로에서 검증 비용 제거. 안전성 모두 개발자 책임.

- **Q. throw하는 continuation에서 success를 어떻게 resume?**
  `cont.resume(returning: value)` (success), `cont.resume(throwing: error)` (failure). `with: Result`도 가능.

- **Q. 전혀 호출되지 않는 continuation을 디버깅하려면?**
  Instruments → Concurrency. 또는 *반드시 resume*되도록 콜백 수신 후 즉시 resume + adapter strong 보유.

- **Q. Combine publisher → async?**
  `publisher.values` (AsyncSequence) 사용. 단일 값이면 `try await publisher.singleValue()` 같은 wrapper.

## 참고

- SE-0300 (Continuations for interfacing async tasks with synchronous code)
- WWDC 2021: Use async/await with URLSession
