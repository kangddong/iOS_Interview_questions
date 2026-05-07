# Delegate 패턴

> 한 줄 요약 — *한 객체가 자기 일부 책임을 다른 객체에 위임*하는 패턴. UIKit/Foundation 전체에 깔린 핵심 패턴이며, **1:1 통신**과 **콜백 시점이 정해진 양식**이 핵심.

## 표준 형태

```swift
protocol UserListDelegate: AnyObject {
    func userList(_ list: UserListVC, didSelect user: User)
}

final class UserListVC {
    weak var delegate: UserListDelegate?
}
```

- **`AnyObject` 제약**: weak으로 잡기 위해 class-only 프로토콜.
- **`weak` 보유**: delegate가 *호출자보다 먼저 사라질 수 있음*. retain cycle 방지.
- **첫 인자로 sender 객체**: 하나의 delegate가 *여러 인스턴스*를 동시에 받을 수 있게.

## DataSource vs Delegate

| | Delegate | DataSource |
|---|---|---|
| 묻는 것 | "이 일이 일어났는데 어떻게?" | "데이터 어떻게 생겼는지?" |
| 예 | `tableView(_:didSelectRowAt:)` | `tableView(_:numberOfRowsInSection:)` |

UITableView가 둘을 분리해 가진 이유: *상호작용*과 *데이터 공급*은 다른 책임.

## Required vs Optional

```swift
@objc protocol Foo {
    func a()                // 필수
    @objc optional func b() // 옵션
}
```

ObjC 호환 protocol에서만 optional 가능. Swift-only protocol에서 optional이 필요하면 *기본 구현*을 extension에서 제공.

```swift
protocol Foo { func a(); func b() }
extension Foo { func b() {} }     // 기본 구현으로 사실상 optional 효과
```

## Closure / Combine과의 비교

| | Delegate | Closure | Combine/AsyncSequence |
|---|---|---|---|
| 통신 수 | 1:1 | 1:1 | 1:N 가능 |
| 메서드 수 | 여러 콜백 | 단일 |  스트림 |
| 정의 | protocol | 인라인 | publisher 객체 |
| retain cycle | weak으로 명확 | `[weak self]` 잘 잊음 | sink/store 주의 |
| 학습 곡선 | 낮음 | 낮음 | 중상 |

**선택 기준**:
- 콜백이 *여러 종류*고 한 객체가 다 처리 → delegate.
- 콜백 *한 가지*면 closure 충분.
- *여러 구독자*가 듣거나 *시간에 따른 스트림* → Combine/AsyncSequence.

## 흔한 함정

### 1) delegate를 strong으로 잡음

```swift
var delegate: Foo?         // ❌ retain cycle 가능
weak var delegate: Foo?    // ✅
```

### 2) protocol에 `AnyObject` 안 붙임

```swift
protocol Foo { ... }       // weak 불가
protocol Foo: AnyObject { ... }   // ✅ class-only
```

### 3) 여러 객체에 같은 delegate를 set

UIKit delegate는 거의 1:1. 여러 구독은 NotificationCenter/Combine 같은 다른 패턴.

### 4) delegate 메서드의 첫 인자가 sender가 아님

여러 인스턴스 사용 시 *어떤 객체에서 왔는지* 분간 못 함. UIKit 표준대로 sender를 첫 인자로.

## Apple SDK의 delegate 사례

- `URLSessionDelegate` — 진행률, 인증, 완료
- `UICollectionViewDelegateFlowLayout`
- `UITextFieldDelegate`
- `MKMapViewDelegate`
- `CLLocationManagerDelegate`

대부분 *세분화된 옵션 메서드 다수 + 1:1*. Delegate 패턴이 적합한 형태.

## 흔한 함정 / Follow-up

- **Q. delegate의 retain cycle 시나리오?**
  자식 VC가 부모를 delegate로 두는데 strong으로 잡으면, 부모도 자식을 보유 → cycle.

- **Q. delegate를 protocol composition으로 분리할 수 있나?**
  가능. 큰 delegate를 작게 나누고 한 객체가 여러 protocol 채택. 단일 책임.

- **Q. SwiftUI에선 delegate가 사라지나?**
  대부분 closure/binding/Observation으로 흡수. 단, UIKit wrapper(UIViewRepresentable)에서는 여전히 delegate가 필요한 경우 많음.

- **Q. delegate 호출 스레드 보장은?**
  API 문서 확인. 보통 호출자가 호출한 스레드. CoreLocation, AVFoundation 등은 메인이 아닐 수 있음.

- **Q. 같은 delegate를 두 개 객체가 share하면?**
  보통 안 함. 필요하면 *멀티 delegate 매니저* 패턴 또는 NotificationCenter.

## 참고

- Apple Docs: Delegation
- Cocoa Design Patterns
