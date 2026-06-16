# Copy-on-Write (CoW)

> 한 줄 요약 — 값 타입의 *복사 시점*을 실제 변경 직전까지 미루는 최적화. `Array`, `String`, `Dictionary`, `Set` 등 표준 컬렉션이 내부에서 사용. 직접 만든 struct에는 *자동 적용되지 않는다*.

## 동작 원리

1. 컬렉션 struct는 내부에 *클래스* 버퍼를 하나 가진다 (참조)
2. 단순 대입/전달 시엔 그 버퍼 참조만 복사 → O(1)
3. 변경(mutating) 직전 `isKnownUniquelyReferenced(&buffer)`로 unique 여부 확인
4. 공유되어 있으면 그제야 깊은 복사 → 변경

```swift
var a = [1, 2, 3]   // 버퍼 X
var b = a           // 같은 버퍼, count = 2
b.append(4)         // 여기서 b만 복사본을 만들고 변경
// a == [1,2,3], b == [1,2,3,4]
```

## 직접 CoW 구현

```swift
final class Box<T> { var value: T; init(_ v: T) { value = v } }

struct BigData {
    private var box: Box<[Int]>
    init(_ xs: [Int]) { box = Box(xs) }

    var values: [Int] { box.value }

    mutating func append(_ x: Int) {
        if !isKnownUniquelyReferenced(&box) {
            box = Box(box.value)   // 공유됐을 때만 깊은 복사
        }
        box.value.append(x)
    }
}
```

## 비용 측면

- **이득**: 큰 컬렉션의 인자 전달, 다중 할당이 사실상 무료
- **함정**: `mutating` 시점에 *예상치 못한 deep copy* 발생 가능 → 한 번 unique를 만든 뒤 일괄 처리하면 비용 분산

```swift
// 비효율 — 매 루프마다 unique 체크
for x in xs { array.append(x) }

// 더 안전 — reserveCapacity 후 append (재할당도 줄임)
array.reserveCapacity(array.count + xs.count)
for x in xs { array.append(x) }
```

## CoW vs 단순 값 복사 vs 참조 공유

| 방식 | 대입 비용 | 변경 시 | 동시성 |
|---|---|---|---|
| 즉시 복사 | O(n) | O(n) | 안전 |
| CoW | O(1) | unique이면 O(1), 아니면 O(n) | 같은 버퍼 공유 시 주의 |
| 참조 (class) | O(1) | O(1) | 동기화 필요 |

## 흔한 함정 / Follow-up

- **Q. 내가 만든 struct도 CoW가 자동인가?**
  아니다. 표준 라이브러리의 컬렉션이 *내부적으로* 구현한 것. 직접 큰 데이터를 들고 다닐 거면 위 패턴으로 구현하거나 컬렉션을 멤버로 두자.

- **Q. CoW 컬렉션을 멀티스레드에서 공유?**
  *읽기*만 하면 안전(같은 버퍼 공유). *한쪽이 mutating*하면 race. 동시성 컨텍스트에선 `let`으로 한 번 캡처하거나 actor로 격리.

- **Q. `inout` 매개변수와 CoW?**
  컴파일러가 unique를 유지해 주므로 함수 안의 mutating은 일반적으로 추가 복사 없이 동작.

- **Q. `String`은 어떻게 CoW?**
  Swift `String`은 small string optimization + heap buffer 조합. 작은 문자열은 inline 저장, 큰 것은 CoW 버퍼.

- **Q. `Array`의 `subscript` set은 깊은 복사인가?**
  unique이면 O(1) in-place, 공유이면 mutating 직전 깊은 복사 → 그 후 in-place.

## 참고

- Swift Standard Library: `isKnownUniquelyReferenced(_:)`
- WWDC 2015: Building Better Apps with Value Types in Swift
