# 13. CS Fundamentals

iOS 면접에서 자주 묻는 컴퓨터 과학 기본기. *iOS 컨텍스트와 연결*해 답할 수 있는 깊이가 목표.

## 항목

- [Process vs Thread](process-vs-thread.md) — 메모리 공유, context switch, iOS 앱 = 단일 프로세스
- [메모리 모델](memory-model.md) — 가상 메모리, 페이징, CPU 캐시, jetsam
- [자료구조 (Swift 매핑)](data-structures.md) — Big-O, Array/Dictionary 내부, LRU 같은 빈출 패턴
- [알고리즘 / 시간복잡도](algorithm-complexity.md) — 정렬/탐색/그래프/DP 패턴
- [동기화 Primitive](concurrency-primitives.md) — Mutex/Semaphore/RWLock/Atomic, 데드락 4조건

## 자주 묻는 질문

- 프로세스와 스레드 차이 → [process-vs-thread.md](process-vs-thread.md)
- iOS는 swap이 없는데 메모리 부족 시? → [memory-model.md](memory-model.md)
- Array vs Dictionary 시간복잡도 → [data-structures.md](data-structures.md)
- Big-O 입력 크기별 한도 → [algorithm-complexity.md](algorithm-complexity.md)
- 데드락 4가지 조건 → [concurrency-primitives.md](concurrency-primitives.md)
- Lock vs Actor → [concurrency-primitives.md](concurrency-primitives.md) + [03-concurrency/actor-and-mainactor.md](../03-concurrency/actor-and-mainactor.md)
- 캐시 친화적 코드 → [memory-model.md](memory-model.md)
- LRU Cache 구현 → [data-structures.md](data-structures.md)
