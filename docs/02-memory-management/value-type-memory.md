# 값 타입의 메모리 (스택 vs 힙, Boxing 조건)

> 한 줄 요약 — Swift struct/enum의 인스턴스는 *기본적으로 스택/레지스터*에 산다. 그러나 **escape**(closure 캡처, 컬렉션 보관, existential 박싱), **크기 초과**(existential inline buffer 24B, generic 특수화 실패) 시 *힙으로 박싱*된다. 박싱 여부를 알면 핫패스의 할당 비용을 통제할 수 있다.

## 기본 규칙

| 위치 | 조건 |
|---|---|
| 레지스터 | 작은 값(≤16바이트), 함수 인자/반환 |
| 스택 | 지역 변수, 스코프 끝나면 해제 |
| 힙 (박스) | escape, 큰 existential, 큰 generic, indirect enum 케이스 |

## 박싱(boxing)이 일어나는 경우

### 1) Existential container 초과

```swift
let xs: [any Drawable] = [Circle(), Polygon(sides: 100, ...)]
```

각 원소는 24B existential container에 들어가야 함. *원소 크기 > 24B면 heap 박스*에 넣고 포인터를 inline buffer에 둠.

### 2) Closure capture

```swift
func make() -> () -> Int {
    var counter = 0          // 원래 스택
    return { counter += 1; return counter }   // counter가 heap box로 이동
}
```

closure가 함수 종료 후에도 살아야 하므로, capture된 변수는 *heap allocated box*로 이동. 박스는 ARC로 관리.

### 3) 컬렉션 보관

```swift
var array: [LargeStruct] = []
array.append(...)            // Array 내부 버퍼는 힙
```

Array/Dictionary/Set의 *백킹 버퍼*는 힙. 원소가 값 타입이어도 컨테이너 자체가 힙.

### 4) Indirect enum

```swift
indirect enum List<T> {
    case empty
    case node(T, List<T>)    // 재귀 → heap box
}
```

자기 자신을 포함하는 enum 케이스는 *지원되는 유일한 방법이 heap 박싱*. 케이스마다 box 할당.

### 5) Generic specialization 실패

```swift
public func process<T>(_ x: T) { ... }
```

라이브러리 경계에서 *호출 사이트 특수화 불가*하면 T를 *value witness*로 다룸 → 큰 T는 heap 박스 통해 다룸. `@inlinable` 또는 WMO로 특수화 유도.

### 6) `Any` 사용

```swift
let any: Any = LargeStruct(...)    // box 가능성
```

`Any`는 existential container와 동일 규칙.

## 박싱 비용

- 힙 할당: 수십~수백 cycle
- ARC retain/release 추가
- 캐시 미스 (인접 메모리 X)
- 작은 값을 매번 box/unbox하는 핫 루프는 측정 가능

## 박싱 피하기

### Existential 대신 generic

```swift
// ❌ existential box 발생 가능
func draw(_ items: [any Drawable]) { for d in items { d.draw() } }

// ✅ 특수화 — 0 비용 디스패치
func draw<D: Drawable>(_ items: [D]) { for d in items { d.draw() } }
```

단, *이종 컬렉션*이 진짜 필요하면 existential은 정답이 아니라 비용. 비용을 *받아들이는* 결정.

### `borrowing` 파라미터 (Swift 5.9+)

```swift
func process(_ x: borrowing LargeStruct) { ... }
```

호출자가 *빌려줌* → retain/release 생략, 박스 회피 가능성 증가.

### Closure 캡처 최소화

큰 값을 closure에 캡처하면 box. 정말 필요한 *한두 필드만* 캡처:

```swift
let id = obj.id                   // 작은 값
closure = { print(id) }           // 큰 obj 대신 id만
```

## 스택 vs 힙 식별

런타임에 *어디 있는지* 확실히 알려면:
- 디스어셈블 (`Hopper`, `lldb`로 분석) — 시니어 디버깅
- Instruments → Allocations에서 *heap*에 잡히지 않으면 스택 가능성
- 작은 함수에 `@inline(__always)` 붙이면 거의 확실히 스택/레지스터

## Tagged Pointer (ObjC 인터롭)

`NSString`, `NSNumber`의 작은 값은 *포인터 자체에 값을 인코딩* (heap 미할당). Swift `String`은 small string optimization으로 비슷한 효과.

```swift
let n = 42 as NSNumber   // tagged pointer 가능 — heap 할당 없음
```

## 흔한 함정 / Follow-up

- **Q. `struct`니까 무조건 빠른가?**
  큰 struct는 *복사 비용*이 큼. CoW 없는 직접 정의 struct는 인자로 넘길 때마다 풀 복사. 16~24B 넘으면 borrowing/inout 고려.

- **Q. 빈 enum이나 `Void`도 heap을 쓰나?**
  `Void` (튜플 `()`) 크기 0. 컴파일 결과에 *공간을 차지 안 함*.

- **Q. `Optional<T>`도 박싱?**
  대부분 enum 표현이라 추가 박싱 없음. *non-zero pointer optimization* 으로 참조 타입은 추가 비트 없이 nil 표현.

- **Q. `let large = LargeStruct(); useAsync(large)`은?**
  Closure가 large를 캡처. *escape*면 box로 이동.

- **Q. SIL/SwiftIR로 박싱 확인 가능?**
  Yes. `swiftc -emit-sil` 출력에서 `alloc_box`, `alloc_stack`, `alloc_ref` 인스트럭션 식별.

- **Q. ARC가 박스에도 적용?**
  적용. 박스는 사실상 *익명 class 인스턴스*. retain/release로 관리.

## 참고

- WWDC 2016: Understanding Swift Performance (existential 박싱)
- swift/docs/SIL.rst — alloc_box/alloc_stack 등
- [01-swift-language/runtime-internals](../01-swift-language/runtime-internals.md)
