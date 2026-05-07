# struct vs class

> 한 줄 요약 — `struct`는 **값 타입 + 자동 카피 의미론**, `class`는 **참조 타입 + 정체성(identity)과 상속**. 기본 선택은 `struct`, *공유되는 정체성*이 필요할 때만 `class`.

## 핵심 차이

| 구분 | struct | class |
|---|---|---|
| 타입 카테고리 | 값 타입 | 참조 타입 |
| 할당/전달 시 | 복사 (CoW로 최적화) | 참조 카운트 증가 |
| 메모리 | 주로 스택, 사이즈 크면 힙 | 항상 힙 |
| 변경 | `mutating` 필요 | 자유 (let 인스턴스도 프로퍼티 변경 가능) |
| 상속 | 불가 (프로토콜로 대체) | 단일 상속 |
| 정체성 비교 | `==` (Equatable 합성) | `===` (참조 동등성) |
| `deinit` | 없음 | 있음 |
| 메모리 관리 | 스코프 종료 시 해제 | ARC |
| 기본 멤버와이즈 init | 자동 | 수동 |

## 언제 어떤 걸?

**`struct` 기본**:
- 데이터 모델, DTO, 값 의미론이 자연스러운 것 (좌표, 크기, 색상)
- 동시성 안전 — 복사되므로 race가 적다
- SwiftUI View, Codable 모델

**`class`**:
- 정체성이 의미를 가질 때 (예: `UIView`, `URLSession` — 같은 객체를 여러 곳에서 *공유*해야 함)
- 상속이 본질적으로 필요할 때 (UIKit/Foundation 상속)
- `deinit`이 필요한 리소스 정리 (파일 핸들, observer 해제)
- Objective-C 상호운용

## 코드

```swift
struct Point { var x: Int; var y: Int }
var a = Point(x: 1, y: 2)
var b = a          // 복사
b.x = 9
print(a.x)         // 1 (영향 없음)

class Node { var value = 0 }
let n1 = Node()
let n2 = n1        // 같은 인스턴스 참조
n2.value = 9
print(n1.value)    // 9
```

## 흔한 함정 / Follow-up

- **Q. 큰 struct도 항상 효율적인가?**
  복사 비용이 들 수 있지만 `Array`/`String`/`Dictionary`는 *Copy-on-Write*로 실제 변경 직전까지 복사하지 않는다. 직접 만든 큰 struct는 CoW가 자동 적용되지 않으므로 컬렉션을 내부에 두거나 의식적으로 설계해야 한다.

- **Q. `let` struct와 `let` class의 차이?**
  `let` struct는 프로퍼티까지 전부 불변. `let` class는 *참조*가 불변일 뿐, 인스턴스의 `var` 프로퍼티는 여전히 수정 가능.

- **Q. 왜 SwiftUI의 `View`는 struct인가?**
  값 타입이라 동등성 비교가 빠르고(diffing), 스레드 안전하며, 라이프타임을 프레임워크가 관리하기 좋다. View 자체는 *상태 기술서*에 가깝고 정체성이 필요 없다.

- **Q. `actor`와의 관계?**
  `actor`도 참조 타입이지만, 격리된 상태(isolated state)로 동시 접근을 컴파일 타임에 막는다. 정체성 + 동시성 안전이 필요할 때.

## 참고

- Swift Language Guide: Structures and Classes
- WWDC 2015: Building Better Apps with Value Types in Swift
