# 01. Swift Language

> 한 줄 요약 — Swift는 *프로토콜 + 값 타입 + 강력한 타입 시스템*으로 안전성과 표현력을 잡은 **멀티 패러다임** 언어. ARC·옵셔널·제네릭으로 런타임 오류를 컴파일 타임으로 끌어올린다.

Swift 언어 자체에 대한 정리. 면접 시작점. *주니어*에서 *시니어 런타임 심화*까지.

## 언어 정체성 한눈에

| 축 | Swift의 선택 | 의미 |
| --- | --- | --- |
| 메모리 | **ARC + 값 타입 우선** | GC 없는 결정론적 해제, 복사 시 COW로 비용 회피 |
| 안전성 | **옵셔널 + 강한 타입** | `null` 없음, 런타임 크래시 → 컴파일 에러 |
| 다형성 | **프로토콜 + 제네릭 (PAT)** | 상속 대신 합성, `some`/`any`로 런타임/컴파일 비용 분리 |
| ABI | **ABI Stable (Swift 5.0+)** | OS dylib와 앱이 다른 컴파일러로도 호환 |
| 패러다임 | **멀티 (OOP / FP / POP)** | 클래스·구조체·프로토콜·클로저를 상황별로 |

## 핵심 개념 6선

### 1. 값 타입 vs 참조 타입
- **struct/enum = 값 타입 (스택 또는 인라인)**, **class/actor = 참조 타입 (힙 + ARC)**.
- 값 타입은 *복사 시맨틱*으로 공유 상태가 없어 동시성 친화. 큰 데이터는 **Copy-on-Write**로 복사를 지연 — `Array`/`Dictionary`/`String` 대표.
- 면접 단골: "왜 Swift는 값 타입을 기본으로 미는가?" → 동시성 안전 + 추론 용이 + ARC 비용 회피.

### 2. 옵셔널과 안전성
- `T?`는 `enum Optional<T> { case some(T), none }`. 컴파일러가 **존재 여부를 강제**해 null pointer dereference 차단.
- 언래핑: `if let`, `guard let`, `??`, optional chaining(`?.`), 위험한 `!` (force unwrap).
- *왜*: 런타임 오류를 타입 시스템으로 끌어올림.

### 3. 프로토콜과 제네릭 (POP)
- **Protocol-Oriented Programming**: 상속 대신 *프로토콜 합성*으로 다형성 표현.
- **PAT (associatedtype)** 가진 프로토콜은 변수 타입으로 못 쓰임 → `some P` (opaque) / `any P` (existential).
- `some`: 컴파일 타임 단일 타입, **specialization 가능**해 함수 호출 인라인.
- `any`: 런타임 existential container, 동적 타입 저장 가능하지만 **간접 호출 비용**.

### 4. 클로저와 캡처
- 일급 함수. `(Int) -> Int` 타입이 변수에 들어감.
- 캡처는 *기본 strong*. `escaping` 클로저에서 `self` 캡처 시 **retain cycle** 위험 → `[weak self]` / `[unowned self]` capture list.
- `@autoclosure`: 인자를 *식 그대로* 받아 호출자 의도와 무관한 지연 평가.

### 5. ARC와 메모리
- Automatic Reference Counting — 컴파일러가 retain/release를 *컴파일 시점*에 삽입. GC와 달리 결정론적·예측 가능.
- 함정: **strong reference cycle**. `weak` (zeroing optional) / `unowned` (non-optional, 생명주기 보장 시) 로 끊기.
- 자세히 → [02-memory-management](../02-memory-management/README.md).

### 6. Method Dispatch
- 네 가지: **Static** (struct 메서드, `final`, `static`) / **Witness Table** (프로토콜 default impl) / **vtable** (class 비-final) / **objc_msgSend** (`@objc`, dynamic).
- 정적 디스패치가 가장 빠르고 인라인 가능. `final` + WMO는 ARC + dispatch 둘 다 최적화.

## Swift 진화 한눈에

```
Swift 1 (2014) ─ Objective-C 대체, ARC, 옵셔널, 제네릭
   ↓
Swift 3 (2016) ─ API 디자인 가이드라인, 오픈소스화
   ↓
Swift 5 (2019) ─ ABI 안정화 (OS dylib 동봉)
   ↓
Swift 5.5 (2021) ─ async/await, Actor, 구조적 동시성 → [03-concurrency](../03-concurrency/README.md)
   ↓
Swift 5.7 (2022) ─ `any`/`some` 명확화, PAT 변수화 해결
   ↓
Swift 5.9 (2023) ─ Macro, Ownership (~Copyable, consuming/borrowing), Parameter Pack
   ↓
Swift 6 (2024) ─ Strict Concurrency 기본, 데이터 경합 컴파일 차단
```

## 항목

### 타입 시스템 / 기본
- [값 타입 vs 참조 타입 — struct vs class](struct-vs-class.md)
- [Enum (raw / associated / indirect)](enum.md)
- [옵셔널](optional.md)
- [접근 제어 (Access Control)](access-control.md)
- [Initialization (designated / convenience / required / failable / 2-phase)](initialization.md)
- [Type Casting (is/as/as?/as!, Any/AnyObject)](type-casting.md)
- [Pattern Matching](pattern-matching.md)

### 프로토콜과 제네릭
- [제네릭, some, any, PAT](generics-and-pat.md)
- [Protocol-Oriented Programming](protocol-oriented-programming.md)
- [some vs any 심화](some-vs-any.md)
- [Variadic Generics & Parameter Packs](variadic-generics.md) — *Swift 5.9+*

### 함수와 클로저
- [클로저, escaping, autoclosure, capture](closures.md)

### 프로퍼티
- [Stored / Computed / Lazy / Observer / Property Wrapper](properties.md)
- [KeyPath](keypath.md)
- [Subscript](subscript.md)

### 메타프로그래밍
- [Result Builder & Macro](result-builder-and-macro.md)

### 에러 / 표준 프로토콜
- [에러 처리 (throws / Result / rethrows)](error-handling.md)
- [Equatable / Hashable / Comparable / Codable](equatable-hashable-codable.md)

### 문자열
- [String, Character, Unicode](string-and-unicode.md)

### 변경 가능성 / 소유권
- [Mutating Methods & inout & Exclusive Access](mutating-and-inout.md)
- [Ownership (~Copyable / consuming / borrowing)](ownership.md) — *Swift 5.9+*

### 성능 / 런타임 심화
- [Copy-on-Write](copy-on-write.md)
- [Method Dispatch](method-dispatch.md)
- [Swift Runtime Internals (vtable / witness / existential)](runtime-internals.md) — *시니어*
- [ABI Stability & Library Evolution](abi-and-resilience.md) — *시니어*

## 자주 묻는 질문

**주니어**: struct vs class / 옵셔널 / `?` vs `!` / 프로토콜과 상속 차이 / `lazy var`이 thread-safe인가

**3년차 미들**: `some` vs `any` 메모리 비용 / PAT가 변수 타입으로 못 쓰이는 이유와 5.7+ 해결 / property wrapper의 컴파일 시 변환 / Copy-on-Write 구현 메커니즘 / String이 정수 subscript 불가한 이유 / Law of Exclusivity가 잡는 버그

**시니어**: vtable vs witness table vs existential container의 메모리 레이아웃 / generic specialization 조건 / `~Copyable` + consuming의 활용 / `@frozen`/`@inlinable`의 ABI 영향 / Swift 6 ownership 모델이 ARC와 어떻게 공존하는가
