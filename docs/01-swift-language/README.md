# 01. Swift Language

Swift 언어 자체에 대한 정리. 면접 시작점.

## 항목

### 타입 시스템 / 기본
- [x] [값 타입 vs 참조 타입 — struct vs class](struct-vs-class.md)
- [x] [Enum (raw / associated / indirect)](enum.md)
- [x] [옵셔널](optional.md)
- [x] [접근 제어 (Access Control)](access-control.md)

### 프로토콜과 제네릭
- [x] [제네릭, some, any, PAT](generics-and-pat.md)
- [x] [Protocol-Oriented Programming](protocol-oriented-programming.md)
- [x] [some vs any 심화 (Existential 비용)](some-vs-any.md) — *3년차+*

### 함수와 클로저
- [x] [클로저, escaping, autoclosure, capture](closures.md)

### 프로퍼티
- [x] [Stored / Computed / Lazy / Observer / Property Wrapper](properties.md)
- [x] [KeyPath](keypath.md)

### 메타프로그래밍
- [x] [Result Builder & Macro](result-builder-and-macro.md)

### 에러 / 표준 프로토콜
- [x] [에러 처리 (throws / Result / rethrows)](error-handling.md)
- [x] [Equatable / Hashable / Comparable / Codable](equatable-hashable-codable.md)

### 성능 모델
- [x] [Copy-on-Write](copy-on-write.md)
- [x] [Method Dispatch](method-dispatch.md)

## 자주 묻는 질문

`struct`와 `class`의 차이 / `some` vs `any` / 옵셔널 체이닝 / 클로저 캡처 시점 / `lazy var`가 thread-safe한가 / property wrapper 동작 / PAT가 까다로운 이유 / 메서드 디스패치 종류와 `final` 영향
