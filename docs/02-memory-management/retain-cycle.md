# Retain Cycle

> 한 줄 요약 — 두 객체가 서로를 strong으로 참조해 양쪽 모두 count가 0으로 떨어지지 않는 상태. ARC가 자동으로 해결하지 못하므로 한쪽 고리를 `weak`/`unowned`로 끊어야 한다.

## 발생 패턴 3가지

### 1) 객체 ↔ 객체

```swift
class Apartment { var tenant: Person? }
class Person    { var home: Apartment? }

let a = Apartment()
let p = Person()
p.home = a; a.tenant = p   // cycle
```
→ 한쪽을 `weak`. 보통 자식이 부모를 약하게 (`weak var tenant`).

### 2) Closure가 self를 캡처

```swift
class ViewModel {
    var onUpdate: (() -> Void)?
    func bind() {
        onUpdate = { self.refresh() }   // closure → self → onUpdate → closure
    }
}
```
→ `[weak self]` 또는 `[unowned self]`로 끊는다.

### 3) Delegate

```swift
protocol XDelegate: AnyObject {}
class Child { var delegate: XDelegate? }   // ❌ strong delegate
```
→ `weak var delegate: XDelegate?`. 그래서 delegate 프로토콜은 보통 `AnyObject` 제약을 둔다.

## 식별 방법

- **Memory Graph Debugger** (Xcode) — 보라색 ! 마크가 leak. cycle도 시각화
- **Instruments → Leaks**
- `deinit`에 로그 — 화면을 닫았는데 호출이 안 되면 의심

## 예방 체크리스트

- [ ] Delegate 프로토콜은 `AnyObject` 제약 + 프로퍼티 `weak`
- [ ] 저장되는 closure(`var onXxx`, Combine sink, Timer, NotificationCenter)는 `[weak self]`
- [ ] 부모-자식 구조에서 child → parent 참조는 `weak`/`unowned`
- [ ] `Task { ... }`도 self 캡처 시 cycle 가능 — 비동기 작업이 길게 살면 위험

## 흔한 함정 / Follow-up

- **Q. `UIView.animate { self.alpha = 0 }`도 cycle인가?**
  아니다. 애니메이션 closure는 self에 저장되지 않고 일회성으로 사용되므로 retain은 일시적.

- **Q. `Timer.scheduledTimer { ... }`는?**
  Timer가 closure를 retain하고 closure가 self를 retain. self가 Timer를 retain하면 cycle. self가 사라져도 Timer가 안 죽으면 *leak*과 별개로 self의 생명이 길어지는 문제.

- **Q. struct끼리는 cycle이 가능한가?**
  값 타입은 복사되므로 *직접* cycle은 불가. 단, struct가 class 인스턴스를 참조하면 그 class 쪽에서 가능.

- **Q. cycle과 leak의 차이?**
  cycle은 leak의 한 종류. leak은 *도달 가능하지 않은데 해제되지 않은 메모리* 일반.

## 참고

- Swift Language Guide: Strong Reference Cycles Between Class Instances
- WWDC: Visualize and optimize Swift concurrency (closure 캡처와 Task)
