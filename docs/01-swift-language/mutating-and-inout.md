# Mutating Methods & `inout` & Exclusive Access

> 한 줄 요약 — Swift는 값 타입의 *변경 의도*를 `mutating`으로 명시하고, 함수 경계에서의 *write access*는 `inout`으로 표현한다. 이 위에 **Law of Exclusivity**(독점 접근 법칙)가 컴파일/런타임에 강제되어 *겹친 write*를 차단한다.

## `mutating` 메서드

```swift
struct Counter {
    var n = 0
    mutating func increment() { n += 1 }   // self를 변경
}

var c = Counter()
c.increment()                              // OK
let d = Counter()
d.increment()                              // ❌ let에 mutating 호출 불가
```

- 값 타입(struct/enum)에서 stored 변경 시 필수 키워드
- 컴파일러가 호출자에게 *write access*를 요구하게 만듦
- enum의 `mutating`은 `self = .other` 같이 *케이스 자체* 변경도 가능

## `inout` 파라미터

```swift
func swap<T>(_ a: inout T, _ b: inout T) {
    let t = a; a = b; b = t
}

var x = 1, y = 2
swap(&x, &y)
```

- 함수가 *변수의 저장 위치에 write access*를 요구
- `&` 전치 필요
- inout은 **call-by-reference가 아니라 copy-in / copy-out** 의미론
  - 함수 진입 시 변수 값 복사 → 함수 종료 시 변경값을 다시 쓰기
  - 컴파일러가 단순화 가능하면 in-place로 최적화 (CoW와 결합)

## Law of Exclusivity (독점 접근)

Swift 4+에 도입. **한 변수에 대한 write access는 다른 어떤 access와도 겹칠 수 없다.**

```swift
var xs = [1, 2, 3]
func bump(_ a: inout Int, by other: Int) { a += other }

bump(&xs[0], by: xs[1])     // ✅ — 서로 다른 위치
bump(&xs[0], by: xs[0])     // ❌ runtime trap on Swift 5+ — 같은 위치 overlap
```

```swift
class Box { var value = 0 }
let b = Box()
func work(_ a: inout Int, _ b: inout Int) { ... }
work(&b.value, &b.value)    // ❌ exclusivity 위반
```

검증 시점:
- **정적**: 컴파일러가 가능한 경우 컴파일 에러
- **동적**: 컴파일 타임에 결정 불가하면 런타임 검사 → 위반 시 trap (디버그/릴리스 모두)

릴리스에서 해제 가능하지만 *안전성을 잃음*. 끄지 말 것.

## `inout` 함정

### Closure로 캡처 불가

```swift
func runAsync(_ x: inout Int, _ cb: @escaping () -> Void) {
    cb { x += 1 }            // ❌ inout은 escaping closure에 캡처 불가
}
```

이유: inout은 함수 호출 *동안*만 유효한 storage 접근. closure가 함수 반환 후에도 살아남으면 *dangling*.

해결: `Box<Int>`(class) 또는 actor에 감싸기.

### Operator overloading

```swift
static func += (lhs: inout Self, rhs: Self) {
    lhs = lhs + rhs
}
```

`+=`, `++` 같은 변경 연산자는 첫 인자를 `inout`으로 받음.

## `consuming` / `borrowing` (Swift 5.9+, full in 6.0)

기존 `mutating` 외에 *소유권 이전/대여*를 명시하는 모디파이어:

| 모디파이어 | 의미 |
|---|---|
| `borrowing` | self를 *읽기 전용 빌림*. 함수 종료 시 호출자 소유권 유지 |
| `consuming` | self를 *소비*. 함수 안에서 마음대로 변경/이동 가능, 호출자 변수는 더 이상 사용 불가 |
| `mutating` | self를 *변경*. 종료 시 호출자 변수에 갱신값 기록 |

```swift
struct Token: ~Copyable {
    let value: String
    consuming func send() { /* token을 소비. 호출 후 다시 사용 불가 */ }
}

var t = Token(value: "abc")
t.send()
// t.send() ← 이미 consumed
```

`~Copyable`과 결합해 move-only 타입을 표현. RAII, 자원 핸들에 유용. 자세히는 [ownership.md](ownership.md).

## `_modify` 일반화된 accessor

내부 API지만 표준 라이브러리가 사용:

```swift
extension Array {
    subscript(index: Int) -> Element {
        _read { yield rows[index] }      // 빌림
        _modify { yield &rows[index] }   // in-place 수정
    }
}
```

`_modify`는 get/set의 *복사 라운드트립*을 피해 in-place mutation을 가능케 함. CoW 컬렉션의 성능 핵심.

## 흔한 함정 / Follow-up

- **Q. `inout`이 reference인가 value인가?**
  의미는 *값* (copy-in/copy-out). 컴파일러가 in-place로 최적화하면 실제로는 reference처럼 동작. 의미와 구현을 구분하라.

- **Q. `mutating`을 쓰지 않고 stored를 바꾸려 하면?**
  컴파일 에러: "Cannot assign to property: 'self' is immutable". 함수가 변경 의도를 갖는다고 명시해야 함.

- **Q. let class 인스턴스의 var property 변경은 왜 가능?**
  let은 *참조* 자체의 불변. 인스턴스 내부는 별개. 값 타입의 let과 의미가 다름.

- **Q. exclusivity 위반의 대표 예?**
  자기 자신을 inout 두 번, struct property를 mutating 메서드 안에서 다시 self를 인자로 넘기기 등. Swift 5에서 trap.

- **Q. `inout`과 `UnsafeMutablePointer`의 차이?**
  inout은 *안전 추상화*. 컴파일러가 exclusivity 보장. UnsafeMutablePointer는 *C 인터롭용*, 안전성 책임이 개발자.

- **Q. `mutating get`이 가능?**
  Yes. `mutating get`을 명시한 computed property는 stored 변경을 수반하는 *읽기*를 표현. 정렬 시 캐시 빌드 같은 패턴.

- **Q. `consuming`이 ARC와 어떻게 다른가?**
  ARC는 *마지막 strong ref가 사라질 때* 해제. `consuming`은 *함수 종료 시 호출자에서 소유권을 영구 박탈*. ~Copyable과 결합해 자원 일회성 사용 강제.

## 참고

- Swift Language Guide: Methods, Functions
- SE-0176 (Law of Exclusivity)
- SE-0377 (borrowing / consuming)
- SE-0390 (~Copyable / Noncopyable types)
