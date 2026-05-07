# weak vs unowned

> 한 줄 요약 — 둘 다 retain count를 증가시키지 않는 약한 참조. **상대가 먼저 해제될 가능성이 있으면 `weak`, 동일/더 긴 라이프타임이 *논리적으로 보장*되면 `unowned`**.

## 비교

| 구분 | weak | unowned |
|---|---|---|
| 옵셔널 | 항상 `Optional` | 비옵셔널 (또는 `unowned(safe/unsafe)`) |
| 대상 해제 후 | 자동 `nil` | 접근 시 크래시 |
| 대상 타입 | class, class-bound protocol | 동일 |
| 런타임 비용 | 약간 더 큼 (side table 관리) | 더 가벼움 |
| ObjC 호환 | O | 일부 제약 |

## 선택 기준

```
상대가 self보다 먼저 사라질 수 있나?
├─ 그렇다 → weak
└─ 절대 아니다 (자식이 부모를 참조 등) → unowned
```

- 잘 모르겠으면 `weak` (안전 우선)
- `unowned`는 *명시적 보장*이 있을 때만 — 보장이 깨지면 즉시 크래시

## 대표 패턴

```swift
// 1) Delegate — 상대가 먼저 사라질 수 있음
class Cell { weak var delegate: CellDelegate? }

// 2) Closure에서 self 캡처 — self가 먼저 사라질 수 있음
viewModel.onChange = { [weak self] value in
    guard let self else { return }
    self.label.text = value
}

// 3) 부모-자식 — 자식이 부모보다 먼저 사라짐이 보장되면 unowned
class Customer { var card: Card? }
class Card {
    unowned let owner: Customer        // Card는 항상 Customer가 보유
    init(owner: Customer) { self.owner = owner }
}
```

## 흔한 함정

- **`[weak self]` + `self?.` 폭주**: `guard let self else { return }`로 한 번 풀고 시작하는 게 가독성 좋음.
- **`unowned`로 충분하다고 잘못 판단**: 비동기 작업, 백그라운드 Task에서는 self 라이프타임을 보장하기 어려움 → `weak` 권장.
- **`weak`를 non-class에 적용 불가**: struct/enum에는 사용할 수 없음. 프로토콜은 `AnyObject` 제약 필요.
- **Closure 캡처는 기본 strong**: 캡처 리스트 없이 self를 쓰면 자동으로 retain → cycle 위험.

## Follow-up

- **Q. `unowned(unsafe)`는?**
  C 포인터처럼 카운트 추적 없이 raw 참조. 해제된 메모리 접근 시 UB(undefined behavior). 거의 쓰지 말 것.

- **Q. `weak`은 왜 옵셔널이어야 하나?**
  대상 해제 시점을 *관찰자가* 알아야 하고, nil 표현이 그 신호이기 때문. 비옵셔널이면 dangling 참조가 됨.

- **Q. closure에서 `[weak self]` 없이도 안전한 경우?**
  closure가 self를 retain하지 않거나(짧은 수명), self가 closure를 보유하지 않을 때. 예: `UIView.animate { self.alpha = 0 }` — 애니메이션 클로저가 self에 저장되지 않으므로 cycle 없음.

- **Q. `[unowned self]` 권장하지 않는 이유?**
  성능 이득은 미미하고, 코드 변경으로 보장이 깨지면 크래시. 안전 마진이 거의 없음.

## 참고

- Swift Language Guide: Resolving Strong Reference Cycles Between Class Instances
- WWDC 2021: ARC in Swift
