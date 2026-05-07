# OperationQueue

> 한 줄 요약 — GCD 위에 얹힌 **객체 지향 동시성 API**. 작업을 *Operation*으로 추상화해서 의존성/취소/우선순위/관찰을 깔끔하게 표현할 수 있다.

도입 버전: iOS 4+ (지금은 신규 코드는 보통 async/await 권장)

## GCD와 차이

| 구분 | GCD | OperationQueue |
|---|---|---|
| 단위 | 클로저 | `Operation` 객체 |
| 의존성 | 직접 구현 | `addDependency(_:)` |
| 취소 | 어려움 | `cancel()` 기본 제공 |
| 동시 실행 수 제한 | semaphore | `maxConcurrentOperationCount` |
| KVO | 안 됨 | 상태 관찰 가능 |

## 기본 사용

```swift
let queue = OperationQueue()
queue.maxConcurrentOperationCount = 4

queue.addOperation {
    print("작업 1")
}

let op = BlockOperation { print("작업 2") }
queue.addOperation(op)
op.cancel()         // 시작 전이면 실행 안 됨
```

## 의존성

```swift
let download = BlockOperation { ... }
let parse    = BlockOperation { ... }
let display  = BlockOperation { ... }

parse.addDependency(download)
display.addDependency(parse)

queue.addOperations([download, parse, display], waitUntilFinished: false)
```

체인 형태의 작업을 명시적으로 표현 가능 — async/await의 직선 흐름이 등장하기 전엔 흔히 쓰던 패턴.

## 비동기 Operation

`Operation`을 서브클래싱해 *시작은 했지만 완료는 콜백에서* 일어나는 비동기 작업도 표현 가능. KVO 기반 상태 관리 필요해서 코드량이 많고, 신규 코드는 async/await을 권장.

## 언제 쓰나 (지금)

- 레거시 코드 유지 보수.
- 의존성 그래프 + 취소 + 동시 개수 제한이 *모두* 필요한 복잡한 흐름.
- iOS 12 이하 호환.

신규 코드면 async/await + TaskGroup이 거의 대체.

## 흔한 함정 / Follow-up

- **Q. `OperationQueue.main`과 `DispatchQueue.main`?**
  대부분 동일하게 메인 스레드에서 실행. 다만 OperationQueue.main은 `Operation` 객체로 작업을 다룬다는 차이.

- **Q. cancel()이 즉시 멈추지 않는 이유?**
  GCD와 동일하게 협력적. 실행 중인 코드가 `isCancelled`를 보고 빠져나와야 함.

- **Q. `maxConcurrentOperationCount = 1`이면 시리얼 큐?**
  맞다. GCD의 시리얼 큐와 비슷한 동작.

## 참고

- Apple Docs: OperationQueue
- WWDC 2015: Advanced NSOperations
