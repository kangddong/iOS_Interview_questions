# 자료구조 (Swift 매핑)

> 한 줄 요약 — 면접에서 *시간복잡도*는 거의 항상 묻는다. 핵심 자료구조의 평균/최악 비용과 *Swift 컬렉션이 무엇으로 구현되어 있는지*를 묶어 답할 수 있어야.

## 빠른 표

| 자료구조 | 접근 | 검색 | 삽입 | 삭제 | 비고 |
|---|---|---|---|---|---|
| **Array** | O(1) | O(n) | 끝 O(1) amortized / 중간 O(n) | 끝 O(1) / 중간 O(n) | 메모리 연속, 캐시 친화 |
| **Linked List** | O(n) | O(n) | O(1) (포인터 알면) | O(1) | 메모리 흩어짐 |
| **Hash Table** | - | O(1) avg / O(n) worst | O(1) avg | O(1) avg | 해시 충돌 시 worst |
| **Stack** | O(1) (top) | O(n) | O(1) | O(1) | LIFO |
| **Queue** | O(1) | O(n) | O(1) | O(1) | FIFO |
| **Binary Heap** | O(1) (top) | O(n) | O(log n) | O(log n) | 우선순위 큐 |
| **Binary Search Tree** | O(log n) avg | O(log n) | O(log n) | O(log n) | 균형 안 맞으면 O(n) |
| **Balanced BST (Red-Black)** | O(log n) | O(log n) | O(log n) | O(log n) | 항상 보장 |
| **Trie** | - | O(L) (L=문자열 길이) | O(L) | O(L) | 사전, 자동완성 |
| **Graph (인접 리스트)** | - | DFS/BFS O(V+E) | - | - | - |

## Swift 표준 컬렉션의 실제

| Swift 타입 | 내부 구현 |
|---|---|
| `Array<T>` | 연속 메모리 + Copy-on-Write. C 배열에 가까움 |
| `String` | UTF-8 inline (작은 경우) + heap buffer + CoW |
| `Dictionary<K, V>` | 해시 테이블 (open addressing). K는 `Hashable` |
| `Set<T>` | 해시 테이블. T는 `Hashable` |
| `Range<T>` | start/end만 저장, 실체 없음 |

iOS 면접에서 자주 묻는 포인트:
- Dictionary 평균 O(1), Hashable이 잘못 구현되면 O(n) 가까워짐.
- Array는 끝 append가 amortized O(1). 중간 insert는 O(n) (밀어내기).
- String의 `count`는 O(n) (UTF-8 cluster 카운트).

## Big-O 직관

| 식 | n=1000일 때 |
|---|---|
| O(1) | 1 |
| O(log n) | ~10 |
| O(n) | 1,000 |
| O(n log n) | ~10,000 |
| O(n²) | 1,000,000 |
| O(2ⁿ) | 우주 죽기 전엔 못 끝남 |

n²과 n log n 차이가 *체감*되는 임계점이 보통 n=10,000 부근. 모바일 데이터에선 이 정도부터 위험.

## 면접 단골 — 알고리즘별 핵심 자료구조

| 문제 | 적합 |
|---|---|
| 최근 N개 추적 (LRU) | LinkedList + HashMap (O(1)) |
| 가장 큰/작은 K개 | Heap (O(n log K)) |
| 사전 검색 / 접두어 | Trie |
| 그래프 최단 경로 | BFS (가중 동일) / Dijkstra (양수 가중) |
| 중복 검출 | Set |
| 두 합 (two sum) | Dictionary로 O(n) |
| 슬라이딩 윈도우 | 양 끝 인덱스 |

## Swift 코드 예 — 자주 등장

### LRU Cache

```swift
final class LRUCache<K: Hashable, V> {
    private struct Node { var key: K; var value: V; var prev: K?; var next: K? }
    private var nodes: [K: Node] = [:]
    private var head: K?
    private var tail: K?
    let capacity: Int

    init(_ capacity: Int) { self.capacity = capacity }

    func get(_ k: K) -> V? {
        guard let n = nodes[k] else { return nil }
        moveToHead(k)
        return n.value
    }

    func set(_ k: K, _ v: V) {
        if nodes[k] != nil {
            nodes[k]?.value = v
            moveToHead(k)
            return
        }
        if nodes.count >= capacity, let old = tail { remove(old) }
        addToHead(Node(key: k, value: v))
    }

    // ... 양방향 링크 + dict 동기화 ...
}
```

### BFS

```swift
func bfs(_ graph: [Int: [Int]], start: Int) -> [Int] {
    var visited: Set<Int> = [start]
    var queue: [Int] = [start]      // 실제론 Deque/배열 인덱스로 양 끝 O(1)
    var order: [Int] = []
    while let cur = queue.first {
        queue.removeFirst()         // O(n) — 작은 입력에선 OK
        order.append(cur)
        for next in graph[cur] ?? [] where !visited.contains(next) {
            visited.insert(next)
            queue.append(next)
        }
    }
    return order
}
```

`queue.removeFirst()`는 O(n). 큰 입력에선 *index 기반 + 양쪽 포인터* 사용.

## 흔한 함정 / Follow-up

- **Q. Swift `Array`의 `removeFirst()`는?**
  O(n) — 모든 원소를 한 칸씩 당김. 큐 패턴엔 쓰지 마라. *index pointer*를 따로 두거나 `Deque` (Swift Collections 패키지) 사용.

- **Q. `String.count`가 O(n)인 이유?**
  Swift String은 UTF-8 + Grapheme Cluster (사용자 인지 문자) 단위로 셈. 이모지 한 글자가 여러 byte/scalar. 정확한 카운트엔 순회 필요.

- **Q. Dictionary 평균이 O(1)이지만 worst가 O(n)?**
  해시 충돌이 극단적이면. Hashable이 잘못 만들어졌거나 (모두 같은 hash 반환) 악의적 입력. Swift는 매 실행마다 *해시 시드 랜덤화*로 해시 DoS 완화.

- **Q. Hashable 직접 구현 시?**
  `hash(into:)`에 *동등성 비교에 쓰는 모든 프로퍼티*를 넣어야 함. 그래야 `a == b`이면 `a.hashValue == b.hashValue`.

- **Q. 정렬은 어떤 알고리즘?**
  Swift는 *Introsort* 변형 (Quicksort + Heapsort + Insertion sort 하이브리드). 평균 O(n log n), worst도 O(n log n) 보장.

## 참고

- Apple Docs: Collections
- swift-collections (Deque, OrderedSet, OrderedDictionary 등)
- CLRS (Introduction to Algorithms)
