# Optional

> 한 줄 요약 — *값이 없을 수 있음*을 타입 시스템에 명시해 컴파일 타임에 nil 안전을 강제하는 도구. 내부적으로 `enum Optional<Wrapped> { case none, some(Wrapped) }`.

## 핵심

- `T?`는 `Optional<T>`의 syntactic sugar
- nil은 *없음의 표현*이지 0/빈 값이 아니다
- 언래핑 방법별 안전도: 옵셔널 바인딩(`if let`/`guard let`) ≈ `??` ≈ `map`/`flatMap` > 옵셔널 체이닝(`?.`) >>> 강제 언래핑(`!`)

## 언래핑 방법

```swift
let s: String? = readUserInput()

// 1) if let — 분기 내부에서만 사용
if let s { use(s) }

// 2) guard let — 이른 종료, 함수 본문에서 계속 사용
guard let s else { return }
use(s)

// 3) nil-coalescing — 기본값 제공
let trimmed = s ?? ""

// 4) optional chaining — 체인 중 하나라도 nil이면 전체 nil
let len = s?.count          // Int?

// 5) map / flatMap — 값이 있을 때만 변환
let upper = s.map { $0.uppercased() }

// 6) force unwrap — 절대 nil이 아님을 *증명*할 수 있을 때만
let n = Int("42")!
```

## `?` vs `!`

| 표현 | 의미 |
|---|---|
| `T?` | 옵셔널 타입 선언 |
| `value?.foo` | 옵셔널 체이닝 — nil이면 통째로 nil |
| `value!` | 강제 언래핑 — nil이면 런타임 크래시 |
| `T!` | 암시적 언래핑 옵셔널 (IUO) — 사용 시 자동 언래핑, nil이면 크래시 |

**IUO**(`T!`)는 실질적으로 옵셔널이지만, 컴파일러가 일반 타입처럼 다루도록 허용한다. Objective-C 인터롭과 `@IBOutlet`처럼 *초기엔 nil이지만 사용 시점엔 반드시 값이 있다*고 보장되는 곳에 한정.

## 흔한 함정

- **`!` 남용**은 사실상 `try!`처럼 *컴파일러를 끄는 행위*다. 크래시의 가장 흔한 원인.
- **빈 문자열/배열을 nil처럼 다루기**: `s ?? ""` 후 `isEmpty` 체크가 더 명확.
- **옵셔널의 옵셔널 (`T??`)**: 딕셔너리에서 옵셔널 값을 꺼낼 때 발생. `dict["key"] ?? nil` 패턴 주의.
- **`if let x = x`** Swift 5.7+에선 `if let x`로 축약 가능.

## Follow-up

- **Q. `Optional`은 어떻게 nil을 표현하나?**
  enum 케이스 `none`. 추가 비트가 아니라 enum의 case 자체. 다만 *non-zero pointer optimization* 등 컴파일러가 메모리를 절약하는 경우가 많음.

- **Q. `try?` / `as?`도 옵셔널인가?**
  맞다. 실패 시 `nil`을 반환하는 옵셔널 변환.

- **Q. 함수의 반환 타입을 옵셔널로 할지 throws로 할지 기준?**
  *왜* 실패했는지 호출자가 알아야 하면 `throws`, 단순히 *값 없음* 한 가지 의미면 옵셔널.

## 참고

- Swift Language Guide: Optionals
- Swift Evolution SE-0061 (옵셔널 평탄화)
