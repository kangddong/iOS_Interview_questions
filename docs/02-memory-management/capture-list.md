# Capture List 선택 기준

> 한 줄 요약 — closure가 self/외부 변수를 *어떻게 캡처할지*를 명시하는 리스트. **strong 기본 + 사이클 위험이 있으면 `[weak self]`** 가 가장 안전한 첫 번째 선택.

## 기본 동작

```swift
class VM {
    var name = ""
    func bind() {
        api.fetch { data in self.name = data }   // self를 strong 캡처
    }
}
```

closure에 캡처 리스트가 없으면 self는 *strong*으로 잡힌다. closure가 어딘가 *저장*되어 self보다 오래 살면 → retain cycle.

## 결정 트리

```
closure가 self보다 오래 살 가능성?
├─ 아니다 (UIView.animate, sync map 등) → 캡처 리스트 불필요
└─ 그렇다 (self가 closure를 보유 + closure가 self를 사용)
   │
   ├─ self가 사라지면 작업이 *의미 없음* → [weak self] + guard
   ├─ self가 closure보다 *반드시 오래 산다* → [unowned self]
   └─ 모르겠다 → [weak self]   ← 안전한 기본값
```

## [weak self] 사용 패턴

```swift
api.fetch { [weak self] data in
    guard let self else { return }
    self.name = data
    self.label.text = data
}
```

- `guard let self else { return }`로 한 번 풀면 이후 `self.x` 폭주 안 일어남.
- 작업이 *완료되어야 의미 있는* 사이드 이펙트면 self 없으면 그냥 끝내는 게 자연스러움.

## [unowned self] — 거의 권장 안 됨

```swift
class Owner {
    var task: (() -> Void)!
    init() { task = { [unowned self] in self.work() } }   // ← 위험할 수 있음
}
```

unowned는 *self가 closure보다 먼저 사라지지 않는다*는 보증이 깨지는 순간 크래시. 코드 변경 한 번에 보장이 흔들리기 쉬움 → **거의 항상 weak이 더 안전**.

## 값 캡처 vs 참조 캡처

```swift
var counter = 0
let f = { print(counter) }     // 참조 캡처 (closure가 변수 박스 보유)
counter = 100
f()                            // 100

// capture list로 값 고정
let snapshot = counter
let g = { [counter = counter] in print(counter) }   // 캡처 시점 값 고정
counter = 200
g()                            // 200 (g 내부의 counter는 200으로 *재bind* 안 됨)
```

`[counter = counter]`처럼 *읽기 시점에서 복사* 가능. struct/Int 등 값 타입에 유용.

## 여러 객체 캡처

```swift
viewModel.bind { [weak self, weak vm = self?.viewModel] data in
    guard let self, let vm else { return }
    self.update(vm: vm, data: data)
}
```

여러 weak를 한 줄에. 각각 unwrap 필요.

## 캡처 리스트 권장 안 되는 경우 — 안 써도 안전

```swift
// 1) 일회성 closure로 즉시 실행, 저장되지 않음
UIView.animate(withDuration: 0.3) { self.alpha = 0 }

// 2) sync 변환
[1,2,3].map { $0 * 2 }
```

이런 경우 `[weak self]`를 강박적으로 붙이면 가독성만 해침.

## SwiftUI에서

`@Observable`/`@StateObject`/`@State` 등은 SwiftUI가 라이프타임을 관리. 일반적으로 closure에서 `[weak self]` 자주 등장하지 않음. UIKit wrapper(UIViewRepresentable)나 Combine `sink`는 여전히 주의.

## 흔한 함정 / Follow-up

- **Q. `[weak self]`만 있으면 `self?.foo`가 폭증해 보기 안 좋다.**
  진입부에서 `guard let self else { return }`로 한 번에 풀어 일반 self.* 사용.

- **Q. `[unowned self]`로 충분한 것 같은데 굳이 weak?**
  안전 마진. 비동기/Task/백그라운드 큐는 self 라이프타임 보장이 어렵다. 성능 차이는 미미.

- **Q. `Task { ... }`에서 self 캡처는?**
  비구조적 Task는 부모 스코프와 분리됨. 보통 `Task { [weak self] in ... }` 또는 self가 actor/class면 actor 격리만으로 안전한 케이스도. 일반적으로 weak 권장.

- **Q. `[weak self]`로 캡처했는데 deinit이 호출 안 됨.**
  다른 곳에서 strong 참조가 있을 가능성. NotificationCenter observer, delegate strong 보유, 클로저가 다른 곳에 또 저장됨 등.

- **Q. `[self]`처럼 쓰면?**
  Swift 5.4+에서 closure 안에서 self.* 생략 시 명시적 strong 캡처. retain cycle 위험은 동일. iOS Async UI 코드에선 `[weak self]`를 쓰는 게 보통.

## 참고

- Swift Language Guide: Strong Reference Cycles for Closures
- 02-memory-management/[weak-vs-unowned.md](weak-vs-unowned.md)
