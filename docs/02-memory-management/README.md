# 02. Memory Management

메모리는 면접 단골. ARC 동작과 retain cycle 식별이 핵심.

## 항목

- [ARC 동작 원리](arc.md)
- [strong / weak / unowned 차이](weak-vs-unowned.md)
- [retain cycle — 발생 패턴과 해결](retain-cycle.md)
- [capture list `[weak self]` / `[unowned self]` 선택 기준](capture-list.md)
- [autoreleasepool — 언제 필요한가](autoreleasepool.md)
- [Heap vs Stack (값 타입의 메모리)](heap-vs-stack.md) — *3년차+*

## 관련

- 디버깅 도구 (Memory Graph, Leaks, Allocations) → [10-performance/instruments.md](../10-performance/instruments.md)
- 값 타입 메모리 (스택 vs 힙) → [01-swift-language/struct-vs-class.md](../01-swift-language/struct-vs-class.md)
- Copy-on-Write → [01-swift-language/copy-on-write.md](../01-swift-language/copy-on-write.md)

## 자주 묻는 질문

- `weak`과 `unowned` 어떤 걸 언제 쓰나 → [weak-vs-unowned.md](weak-vs-unowned.md)
- `[weak self]` 없이도 안전한 경우 → [capture-list.md](capture-list.md)
- closure capture가 strong인 이유 → [01-swift-language/closures.md](../01-swift-language/closures.md)
- `deinit`이 호출 안 되는 흔한 원인 → [retain-cycle.md](retain-cycle.md)
- autoreleasepool은 언제 명시적으로? → [autoreleasepool.md](autoreleasepool.md)
