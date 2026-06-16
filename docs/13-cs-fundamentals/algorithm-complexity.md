# 알고리즘 / Big-O / 핵심 패턴

> 한 줄 요약 — 면접에서 자주 등장하는 *알고리즘 패턴*과 그 시간복잡도. 코드 구현보다 *언제 무엇을 쓰는가*를 답할 수 있는 게 중요.

## Big-O 표기

- **시간복잡도**: 입력 크기에 따라 *연산 횟수*가 어떻게 자라는가.
- **공간복잡도**: 추가 메모리.
- 평균 / 최악 / amortized 구분.

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

## 정렬

| 알고리즘 | 평균 | 최악 | 공간 | 안정 | 비고 |
|---|---|---|---|---|---|
| **Quick Sort** | O(n log n) | O(n²) | O(log n) | X | 평균 빠름 |
| **Merge Sort** | O(n log n) | O(n log n) | O(n) | O | 안정성 보장 |
| **Heap Sort** | O(n log n) | O(n log n) | O(1) | X | in-place |
| **Insertion Sort** | O(n²) | O(n²) | O(1) | O | 작은 데이터에서 빠름 |
| **Counting Sort** | O(n+k) | O(n+k) | O(k) | O | 정수 범위가 작을 때 |

Swift의 `sort()`는 **stable** 정렬을 보장하며 평균/최악 모두 **O(n log n)**으로 동작한다(SE-0372). 내부 알고리즘은 구현 디테일이라 명시되어 있지 않으므로 "Introsort/Timsort" 같은 단정에는 의존하지 말 것. 안정성과 점근 복잡도만 계약된 면(API contract)으로 외울 것.

## 탐색

| 알고리즘 | 시간 | 조건 |
|---|---|---|
| Linear Search | O(n) | 정렬 무관 |
| Binary Search | O(log n) | 정렬된 배열 |
| Hash 조회 | O(1) avg | 해시 가능 |
| BST | O(log n) avg | 균형 |

## 그래프

| 알고리즘 | 시간 | 용도 |
|---|---|---|
| BFS | O(V + E) | 가중치 같은 그래프 최단 경로 |
| DFS | O(V + E) | 탐색, 사이클 검출, 위상 정렬 |
| Dijkstra | O((V+E) log V) | 양수 가중 최단 경로 |
| Bellman-Ford | O(VE) | 음수 가중 허용 |
| Floyd-Warshall | O(V³) | 모든 쌍 최단 경로 |
| Kruskal/Prim | O(E log E) | 최소 신장 트리 |

## 핵심 패턴

### Two Pointers
정렬된 배열에서 양 끝에서 좁히기 — *합/짝짓기/회문* 문제. O(n).

### Sliding Window
연속 부분 수열의 합/평균/최대를 효율적으로. O(n).

### Hash + 보조 자료구조
Two Sum 같은 문제: dictionary로 *지금까지 본 값 + 인덱스*. O(n).

### Recursion + Memoization (DP)
부분 문제 결과 캐시. 피보나치, 배낭 문제 등.

### Greedy
*매 순간 최적*을 선택. 동전 거스름돈(특정 단위)/구간 스케줄링.

### Backtracking
모든 경우를 *가지치기와 함께* 탐색. 순열, N-Queens, 미로.

### Divide and Conquer
분할 → 정복 → 결합. Merge sort, 이분 탐색.

## DP — 면접 단골 예시

### 피보나치

```swift
// O(2ⁿ) — 메모이즈 없이
func fib(_ n: Int) -> Int { n < 2 ? n : fib(n-1) + fib(n-2) }

// O(n)
func fibFast(_ n: Int) -> Int {
    var (a, b) = (0, 1)
    for _ in 0..<n { (a, b) = (b, a + b) }
    return a
}
```

### 가장 긴 증가 수열 (LIS)

```swift
// O(n²) DP
func lis(_ a: [Int]) -> Int {
    var dp = Array(repeating: 1, count: a.count)
    for i in 1..<a.count {
        for j in 0..<i where a[j] < a[i] { dp[i] = max(dp[i], dp[j] + 1) }
    }
    return dp.max() ?? 0
}
// O(n log n) 가능 (이분 탐색 활용)
```

## 시간복잡도 직관 — 입력 크기 별 한도

| 입력 크기 | 허용되는 시간복잡도 |
|---|---|
| 10⁶ ~ 10⁷ | O(n), O(n log n) |
| 10⁵ | O(n²) 가능 |
| ~5,000 | O(n²) 안전 |
| ~500 | O(n³) |
| ~25 | O(2ⁿ) |
| ~10 | O(n!) |

코딩테스트 입력 크기 보고 *알고리즘 선택*. 모바일 실무에서도 동일 — 데이터가 커지기 전에 자료구조 점검.

## 모바일 컨텍스트의 알고리즘 이슈

- 셀에서 1000+ 원소를 매 frame 정렬하면 hitch.
- `count` O(n) String 연산을 매 키스트로크에 호출하면 입력 지연.
- 큰 배열에서 `removeFirst()` 반복 → O(n²).
- 검색은 *서버에 위임*하는 게 일반적.

## 흔한 함정 / Follow-up

- **Q. `O(n) + O(n)`은?**
  여전히 O(n). 상수배는 무시.

- **Q. `O(n + m)`과 `O(n)` 차이?**
  m이 n과 비례하지 않으면 별도 변수로 표기. 그래프에서 O(V+E)가 같은 이유.

- **Q. amortized vs worst-case?**
  amortized = *연속 연산의 평균*. Array append는 amortized O(1)이지만 *어떤 한 번*은 버퍼 재할당으로 O(n). 통산은 O(1).

- **Q. Quick Sort가 O(n²)이 되는 경우?**
  pivot 선택이 최악 (이미 정렬된 배열에 첫 요소 pivot). 무작위 pivot 또는 median-of-three로 회피.

- **Q. 공간복잡도도 같이 답해야?**
  대부분의 면접은 시간 위주지만, "메모리 한정 환경에서 어떻게?" 질문 들어오면 in-place 알고리즘 (heap sort, two-pointer) 답.

## 참고

- CLRS (Introduction to Algorithms)
- LeetCode / 백준 — 패턴별 문제 풀이
- swift-algorithms / swift-collections
