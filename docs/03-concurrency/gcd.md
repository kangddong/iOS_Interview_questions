# GCD (Grand Central Dispatch)

> 한 줄 요약 — 스레드를 직접 만들지 않고 **큐(Queue)에 작업을 던지면 시스템이 스레드 풀에서 실행**해 주는 저수준 동시성 API. 스레드 관리 비용을 OS에 위임하는 것이 핵심.

도입 버전: iOS 4+ (지금도 현역)

## 핵심 개념

- **DispatchQueue**: 작업이 줄 서는 큐. 시리얼(serial) 또는 컨커런트(concurrent).
- **Main queue**: 시리얼, 메인 스레드 전용. UI 업데이트는 무조건 여기.
- **Global queue**: 컨커런트, QoS별로 4개. (`userInteractive`, `userInitiated`, `default`, `utility`, `background`)
- **sync vs async**: 작업이 끝날 때까지 *호출자*가 기다리는가.

## sync vs async

```swift
DispatchQueue.global().async {        // 던지고 호출자는 즉시 반환
    let data = heavyWork()
    DispatchQueue.main.async {        // UI는 메인으로 다시
        self.label.text = data
    }
}
```

```swift
// sync — 끝날 때까지 호출 스레드 블록
let result = queue.sync { computeSomething() }
```

## 데드락: `DispatchQueue.main.sync`

**메인 스레드에서 `DispatchQueue.main.sync`를 호출하면 즉시 데드락**.

```swift
// 메인 스레드에서 실행 중일 때
DispatchQueue.main.sync { print("nope") }   // 영원히 멈춤
```

이유: 메인 큐는 시리얼이라 *현재 작업이 끝나야* 다음 작업을 시작할 수 있는데, 현재 작업(`sync`를 호출한 코드)은 그 다음 작업이 끝나길 기다리고 있음 → 서로 대기.

## QoS (Quality of Service)

```swift
DispatchQueue.global(qos: .userInitiated).async { ... }
```

| QoS | 사용처 |
|---|---|
| `.userInteractive` | 애니메이션, 메인 스레드 보조 |
| `.userInitiated` | 사용자가 결과를 즉시 기다림 (탭 결과 로드) |
| `.default` | 명시 안 했을 때 |
| `.utility` | 진행 표시 있는 긴 작업 (다운로드) |
| `.background` | 사용자가 보지 않는 작업 (인덱싱, 백업) |

QoS가 낮은 큐가 높은 큐의 작업을 *기다리게 되면* OS가 동적으로 우선순위를 끌어올린다(QoS inheritance).

## Barrier — 컨커런트 큐의 단독 실행 구간

```swift
let queue = DispatchQueue(label: "io", attributes: .concurrent)

queue.async { read() }                       // 동시 가능
queue.async { read() }
queue.async(flags: .barrier) { write() }     // 실행 동안 단독
queue.async { read() }                       // barrier 끝난 뒤 실행
```

reader-writer 락 패턴. 컨커런트 큐에서만 의미 있음.

## DispatchGroup / DispatchSemaphore

```swift
let group = DispatchGroup()
group.enter()
api.fetch { group.leave() }
group.enter()
api.fetch { group.leave() }
group.notify(queue: .main) { print("둘 다 끝") }
```

- `DispatchGroup`: 여러 작업의 *완료*를 기다림.
- `DispatchSemaphore`: 동시 실행 개수 제한 — 단, 메인에서 `wait`하면 데드락 가능.

## 비교 — GCD vs async/await

| 구분 | GCD | async/await |
|---|---|---|
| 호출 흐름 | 콜백 중첩 | 위에서 아래로 |
| 에러 전파 | 수동 | `throws`로 자동 |
| 취소 | 어려움 | `Task.cancel()` |
| 컴파일러 검증 | 없음 | Sendable, actor 격리 |
| 사용 시점 | 레거시/저수준 | 신규 코드 기본 |

## 흔한 함정 / Follow-up

- **Q. `DispatchQueue.global().sync { ... }`는 안전한가?**
  메인이 아닌 스레드에서 호출하면 OK. 단, sync 자체가 호출자를 블록하므로 메인에서는 절대 금지.

- **Q. 시리얼 큐와 메인 큐의 차이?**
  메인 큐도 시리얼이지만, *메인 스레드에 묶여 있다*는 추가 제약. 일반 시리얼 큐는 작업이 어떤 워커 스레드에서 실행될지 보장하지 않음.

- **Q. GCD에서 작업 취소가 어려운 이유?**
  `DispatchWorkItem.cancel()`은 *시작되지 않은* 작업만 취소. 이미 실행 중이면 내부에서 `isCancelled`를 폴링해야 함. async/await의 `Task.cancel()`은 협력적 취소가 더 자연스러움.

- **Q. `DispatchQueue(label:)` 기본 속성은?**
  시리얼. 컨커런트로 만들려면 `attributes: .concurrent` 명시.

## 참고

- Apple Docs: Dispatch
- WWDC 2015: Building Responsive and Efficient Apps with GCD
