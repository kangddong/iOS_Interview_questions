# 13. CS Fundamentals

> 한 줄 요약 — CS 기본기는 *iOS 환경의 제약*과 묶어 답해야 시니어 답변이 된다. **단일 프로세스 + 메모리 압박 시 jetsam + swap 없음** 같은 iOS 특성이 일반 CS와 다른 답을 만든다.

iOS 면접에서 자주 묻는 컴퓨터 과학 기본기. *iOS 컨텍스트와 연결*해 답할 수 있는 깊이가 목표.

## iOS와 일반 CS의 다른 점

| 일반 OS | iOS |
| --- | --- |
| 프로세스 다수 (멀티태스킹) | 사용자 앱은 **1개 프로세스**, 백그라운드 제약 강함 |
| 가상 메모리 + **swap** | swap 없음 — 부족 시 **jetsam**으로 앱 강제 종료 |
| GUI 스레드 자유 | UI는 반드시 **메인 스레드** |
| 자유로운 background 작업 | 종류 제한 (audio, BG fetch, push, location 등) |
| 파일 시스템 자유 접근 | 앱 sandbox 안에서만 |

## 핵심 개념 5선

### 1. Process vs Thread
- **Process**: 독립 메모리 공간, 통신은 IPC 필요. iOS 앱 = 1개 프로세스.
- **Thread**: 같은 프로세스 안에서 메모리 공유, 빠른 context switch.
- iOS의 동시성은 *스레드* 위에 GCD/Swift Concurrency를 얹은 것. 코어 수만큼의 cooperative pool.

### 2. iOS 메모리 모델
- 가상 메모리 4-tier: stack / heap / data (전역) / text (코드).
- **swap이 없다** → 메모리 압박 시 OS가 *덜 중요한 프로세스를 죽임* (jetsam).
- 앱은 `applicationDidReceiveMemoryWarning` / `NSCache` 자동 정리로 대응.
- **CPU 캐시 친화성**: 연속 메모리 접근(Array)이 Dictionary보다 cache hit ↑.

### 3. 자료구조 — Swift 매핑
| 개념 | Swift | 시간복잡도 |
| --- | --- | --- |
| Dynamic array | `Array` | append amortized O(1), random O(1) |
| Hash map | `Dictionary` | 평균 O(1), 최악 O(n) |
| Hash set | `Set` | 평균 O(1) |
| LRU cache | 직접 구현 (Dictionary + doubly linked list) | O(1) get/put |
| Heap | 표준 라이브러리 없음, swift-collections `Heap` | push/pop O(log n) |
| Ordered map | swift-collections `OrderedDictionary` | 삽입 순서 보존 |

### 4. 시간복잡도 — 입력 크기별 한도
```
N      허용 알고리즘
─────────────────────
≤ 10^2  O(N^3)
≤ 10^3  O(N^2 log N)
≤ 10^5  O(N log N)
≤ 10^6  O(N)
≤ 10^8  O(log N) or O(1)
```
면접 단골: "이 알고리즘으로 10^5 입력이 들어오면 OK인가?" — 위 표 기준.

### 5. 동기화 Primitive와 데드락
- **Mutex / NSLock**: 1개 권한.
- **Semaphore**: N개 권한 (자원 풀, throttling).
- **RWLock**: 다수 reader + 단일 writer.
- **Atomic**: 단일 변수 lock-free.
- iOS 최신은 **Actor**가 권장 (lock 명시적 관리 불필요).
- **데드락 4조건**: mutual exclusion / hold and wait / no preemption / circular wait. 하나만 깨면 해결.

## "URL 입력 → 화면" 같은 통합 질문

```
1. URL parse → host 결정
2. DNS resolve (캐시 / TTL)
3. TCP/QUIC 연결 (handshake)
4. TLS handshake (인증서 검증)
5. HTTP request (cache 헤더 확인)
6. 서버 응답 (status / body)
7. JSON decode (Codable)
8. 도메인 매핑
9. View 갱신 (메인 스레드)
10. layout / draw / commit (16.67ms 안)
```

→ 한 질문에 04(UIKit) / 07(Networking) / 10(Performance) / 14(Network) 가 모두 엮인다. CS는 그 *접착제*.

## 항목

- [Process vs Thread](process-vs-thread.md) — 메모리 공유, context switch, iOS 앱 = 단일 프로세스
- [메모리 모델](memory-model.md) — 가상 메모리, 페이징, CPU 캐시, jetsam
- [자료구조 (Swift 매핑)](data-structures.md) — Big-O, Array/Dictionary 내부, LRU 같은 빈출 패턴
- [알고리즘 / 시간복잡도](algorithm-complexity.md) — 정렬/탐색/그래프/DP 패턴
- [동기화 Primitive](concurrency-primitives.md) — Mutex/Semaphore/RWLock/Atomic, 데드락 4조건

## 시니어

- [System Design 입문 (모바일 클라이언트 7가지 관심사)](system-design-intro.md) — 오프라인/동기화, 토큰, 캐시, 실시간, 푸시, feature flag, 관측성

## 자주 묻는 질문

- 프로세스와 스레드 차이 → [process-vs-thread.md](process-vs-thread.md)
- iOS는 swap이 없는데 메모리 부족 시? → [memory-model.md](memory-model.md)
- Array vs Dictionary 시간복잡도 → [data-structures.md](data-structures.md)
- Big-O 입력 크기별 한도 → [algorithm-complexity.md](algorithm-complexity.md)
- 데드락 4가지 조건 → [concurrency-primitives.md](concurrency-primitives.md)
- Lock vs Actor → [concurrency-primitives.md](concurrency-primitives.md) + [03-concurrency/actor-and-mainactor.md](../03-concurrency/actor-and-mainactor.md)
- 캐시 친화적 코드 → [memory-model.md](memory-model.md)
- LRU Cache 구현 → [data-structures.md](data-structures.md)
