# 02. Memory Management

메모리는 면접 단골. ARC 동작과 retain cycle 식별이 *기본*, ARC 최적화/박싱/디버깅 도구는 *시니어*.

## 항목

### 기본
- [ARC 동작 원리](arc.md)
- [strong / weak / unowned 차이](weak-vs-unowned.md)
- [retain cycle — 발생 패턴과 해결](retain-cycle.md)
- [capture list `[weak self]` / `[unowned self]` 선택 기준](capture-list.md)
- [autoreleasepool — 언제 필요한가](autoreleasepool.md)

### 시니어
- [Heap vs Stack (값 타입의 메모리)](heap-vs-stack.md)
- [값 타입 박싱 조건 (스택 vs 힙, existential, indirect enum)](value-type-memory.md)
- [ARC 최적화 — 컴파일러가 retain/release를 어떻게 줄이나](arc-optimization.md)
- [메모리 디버깅 도구 (Memory Graph / Leaks / Sanitizers)](memory-tools.md)

## 관련

- 값 타입 메모리 → [01-swift-language/struct-vs-class.md](../01-swift-language/struct-vs-class.md)
- Copy-on-Write → [01-swift-language/copy-on-write.md](../01-swift-language/copy-on-write.md)
- Swift Runtime → [01-swift-language/runtime-internals.md](../01-swift-language/runtime-internals.md)
- Ownership → [01-swift-language/ownership.md](../01-swift-language/ownership.md)

## 자주 묻는 질문

**주니어**: weak vs unowned / `[weak self]` 언제 / closure capture가 왜 strong / `deinit` 호출 안 되는 원인 / autoreleasepool은 언제

**미들**: struct가 heap으로 가는 조건 / existential 박싱 비용 / `isKnownUniquelyReferenced`의 작동 원리 / Memory Graph로 retain chain 찾기

**시니어**: +0/+1 calling convention / ARC optimization pass 단계 / 객체 헤더 vs side table 카운트 분리 / `final` + WMO가 ARC 비용을 줄이는 메커니즘
