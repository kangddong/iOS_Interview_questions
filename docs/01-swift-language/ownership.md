# Ownership (`~Copyable`, `consuming`, `borrowing`, `inout`)

> 한 줄 요약 — Swift 5.9+에서 도입된 **소유권(ownership) 모델**. ARC가 *마지막 참조* 시점에 자동 해제하는 모델 위에, 값 타입의 *복사 가능성*을 끄고(`~Copyable`) *소유권 이전/대여*를 명시(`consuming`/`borrowing`)해 RAII와 move-only 자원을 표현한다. Swift 6에서 표준화 진행 중.

도입: SE-0377 (borrowing/consuming) Swift 5.9, SE-0390 (`~Copyable`) Swift 5.9, 확장 SE-0432 등 Swift 6.

## 왜 도입됐나

기존 모델의 한계:
- 값 타입은 항상 *복사 가능* → 파일 핸들/락/토큰 같은 *일회성 자원*을 값 타입으로 안전하게 표현 못함
- 큰 struct를 함수에 넘길 때 항상 *값 복사* (비록 CoW로 완화되지만 일반 struct엔 적용 안 됨)
- ARC의 retain/release atomic 비용을 *컴파일러가 더 줄이고 싶음*

소유권 모델은 이걸 해결하기 위해:
- `~Copyable`: 복사 불가 → 자원의 *유일 소유자*를 컴파일 타임에 강제
- `consuming` / `borrowing`: 함수가 소유권을 *가져가는지 빌리는지* 명시 → retain/release 제거

## `~Copyable` (move-only 타입)

```swift
struct FileHandle: ~Copyable {
    private let fd: Int32
    init(_ path: String) throws { /* open */ fd = ... }
    consuming func close() { /* close(fd) */ }
    deinit { /* 안전을 위한 fallback close */ }
}

let h = try FileHandle("/tmp/x")
h.close()           // consuming → h는 더 이상 사용 불가
// h.close()        // ❌ "h has been consumed"
```

규칙:
- 복사가 불가 → `let other = h`도 *복사가 아닌 이동*
- 함수에 넘기면 *소유권 이전* (consuming) 또는 *대여* (borrowing)
- 컴파일러가 "use after consume", "use after move"를 *컴파일 타임에 잡음*

## `consuming` / `borrowing` / `mutating`

`mutating`이 기존 키워드. 새로 추가된 두 모디파이어와 함께:

```swift
struct Buffer: ~Copyable {
    var bytes: UnsafeMutablePointer<UInt8>
    var count: Int

    borrowing func read(at: Int) -> UInt8 { bytes[at] }     // 읽기만, 소유권 유지
    mutating func write(_ b: UInt8, at: Int) { bytes[at] = b }
    consuming func release() {                              // 소유권 가져감
        bytes.deallocate()
    }
}
```

| 모디파이어 | self 소유권 | 종료 후 호출자 |
|---|---|---|
| `borrowing` | 빌림 (읽기) | 그대로 사용 가능 |
| `mutating` | 변경 가능 | 변경된 값을 갖고 그대로 사용 가능 |
| `consuming` | 가져감 | 더 이상 사용 불가 |

호출자 입장:
```swift
let b = Buffer(...)
b.read(at: 0)            // borrowing, b는 살아 있음
b.write(1, at: 0)        // mutating, b는 살아 있음
b.release()              // consuming, b는 죽음
// b.read(at: 0)         // ❌
```

## 함수 파라미터 ownership

```swift
func sink(_ x: consuming Token) { /* x를 보관/이동 */ }
func peek(_ x: borrowing Token) { /* x를 읽기만 */ }
func bump(_ x: inout Token)     { /* x를 변경 */ }
```

- 기본 파라미터(`_ x: Token`)는 `borrowing`(Swift 6 기본)
- `consuming` 파라미터에 변수를 넘기면 *그 변수의 소유권이 함수로 이동*
- `borrowing`은 함수 안에서 변경 불가 (mutating 메서드 호출도 불가)

## Copyable 타입에서도 사용

`~Copyable`이 아닌 일반 struct에도 적용 가능. 컴파일러에게 *retain/release 생략 힌트*를 줌:

```swift
func process(_ data: borrowing Data) {
    // Data를 retain하지 않음, atomic 비용 절약
}
```

핫패스에서 큰 값 타입을 자주 주고받을 때 의미 있는 최적화.

## ARC와의 관계

기존 ARC 모델:
- 값 타입 → 스코프 종료 시 소멸
- 참조 타입 → retain count 0 시 deinit

소유권 모델은 이 위에 *명시적 소유권 전달*을 추가:
- *복사 가능 값*은 호환을 위해 기본 동작 유지 (`borrowing` 기본화는 점진적)
- *non-copyable*은 추가 규칙으로 컴파일 타임에 안전성 강제
- 참조 타입에는 직접 적용 안 됨 (ARC가 이미 명시적 모델)

## 사용 사례

| 사례 | 적합 도구 |
|---|---|
| 파일 핸들, 소켓, mutex 가드 (RAII) | `~Copyable` + `consuming` close |
| 큰 struct 핫패스 전달 | `borrowing` 파라미터 |
| 일회성 토큰/약속 | `~Copyable` |
| 동시성 안전 자원 이동 | `~Copyable` + Sendable (Swift 6) |

## 흔한 함정 / Follow-up

- **Q. `~Copyable` 타입을 컬렉션에 담을 수 있나?**
  Swift 5.9에선 매우 제한적. Swift 6+에서 `[T]` 같은 표준 컬렉션의 noncopyable 지원이 추가. 자체 컬렉션은 직접 구현 가능.

- **Q. `consuming`을 마음대로 붙여도 되나?**
  의미 변경. 호출자가 *그 인자를 더 이상 못 씀*. 라이브러리 API에선 신중히 — 깨지는 변경.

- **Q. ARC가 사라지나?**
  아니다. 소유권 모델은 *값 타입의 이동 의미론을 명시*하는 추가 도구. 참조 타입은 여전히 ARC.

- **Q. Rust와 어떻게 다른가?**
  Rust는 *모든 타입*에 ownership 강제. Swift는 *opt-in* (`~Copyable`로 끌 때만). Borrow checker도 Swift는 가벼움.

- **Q. `consuming`과 `mutating`을 동시에?**
  논리적으로 모순. 한 함수가 *변경 후 소비*까지 한다면 두 단계로 분리.

- **Q. `~Copyable`의 deinit은 호출 보장?**
  drop이 *발생할 때* 호출. consume된 경우는 *호출자에서 호출되지 않고 함수 안에서* 호출됨.

## 참고

- SE-0377 borrowing/consuming parameters
- SE-0390 Noncopyable struct/enum (~Copyable)
- SE-0432 Borrowing/consuming methods
- WWDC 2023: Consume noncopyable types in Swift
