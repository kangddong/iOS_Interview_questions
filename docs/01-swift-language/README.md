# 01. Swift Language

Swift 언어 자체에 대한 정리. 면접 시작점. *주니어*에서 *시니어 런타임 심화*까지.

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
