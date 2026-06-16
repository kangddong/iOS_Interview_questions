import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── algorithm-complexity (5) ──────────────────────────────────────────────
  {
    id: "objective-c13-basic-algorithm-complexity-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "다음 Big-O 표기 중 가장 빠른(입력 크기에 덜 민감한) 순서로 올바르게 나열된 것은?",
    choices: [
      { id: "a", text: "O(1) < O(log n) < O(n) < O(n log n) < O(n²)" },
      { id: "b", text: "O(log n) < O(1) < O(n) < O(n²) < O(n log n)" },
      { id: "c", text: "O(1) < O(n) < O(log n) < O(n log n) < O(n²)" },
      { id: "d", text: "O(n) < O(log n) < O(1) < O(n log n) < O(n²)" },
    ],
    correctChoiceId: "a",
    explanation:
      "Big-O 성장 속도는 O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!) 순입니다. O(1)은 입력 크기와 무관하게 상수 시간, O(log n)은 입력이 2배 늘어도 연산이 1번만 늘어납니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/algorithm-complexity"],
  },
  {
    id: "objective-c13-basic-algorithm-complexity-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "Swift의 `sort()` 메서드가 내부적으로 사용하는 정렬 알고리즘은 무엇이며, 최악의 경우 시간복잡도는?",
    choices: [
      { id: "a", text: "Merge Sort — O(n log n)" },
      { id: "b", text: "Introsort (Quick + Heap + Insertion 하이브리드) — O(n log n)" },
      { id: "c", text: "Quick Sort — O(n²)" },
      { id: "d", text: "Heap Sort — O(n log n), 단 안정 정렬 보장" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift의 `sort()`는 Introsort 변형을 사용합니다. 작은 부분 배열에는 Insertion Sort, 재귀 깊이가 깊어지면 Heap Sort로 폴백하여 최악의 경우에도 O(n log n)을 보장합니다. 단, 안정 정렬은 아닙니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/algorithm-complexity"],
  },
  {
    id: "objective-c13-intermediate-algorithm-complexity-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "이미 정렬된 배열에 Quick Sort를 적용할 때 첫 번째 원소를 pivot으로 선택하면 발생하는 시간복잡도와 그 이유는?",
    choices: [
      { id: "a", text: "O(n log n) — 분할이 항상 균등하게 이루어지므로" },
      {
        id: "b",
        text: "O(n²) — pivot이 항상 최솟값/최댓값이 되어 분할이 1:n-1로 불균등하게 이루어지므로",
      },
      { id: "c", text: "O(n) — 이미 정렬되어 있어 스왑이 발생하지 않으므로" },
      { id: "d", text: "O(n log n) — Introsort가 자동으로 Heap Sort로 전환하므로" },
    ],
    correctChoiceId: "b",
    explanation:
      "첫 번째 원소를 pivot으로 선택하면 이미 정렬된 배열에서 pivot이 항상 최솟값이 되어 분할이 0:n-1 또는 1:n-1로 극도로 불균등해집니다. 이 경우 재귀 깊이가 n이 되어 O(n²)이 됩니다. 이를 피하려면 무작위 pivot 또는 median-of-three 방법을 사용합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/algorithm-complexity"],
  },
  {
    id: "objective-c13-intermediate-algorithm-complexity-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "모바일 앱에서 `UITableView` 셀에서 1,000개 원소를 매 프레임(60fps)마다 정렬하면 어떤 문제가 생기는가?",
    choices: [
      { id: "a", text: "메모리 누수가 발생한다" },
      { id: "b", text: "렌더링 hitch가 발생하여 프레임이 드랍된다" },
      { id: "c", text: "정렬 결과가 비결정적이 된다" },
      { id: "d", text: "앱이 즉시 크래시한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "60fps 기준 한 프레임에 허용되는 시간은 약 16ms입니다. 1,000개 원소를 O(n log n)으로 매 프레임 정렬하면 CPU 부하로 메인 스레드가 지연되어 렌더링 hitch(프레임 드랍)가 발생합니다. 정렬 결과를 캐싱하고 데이터 변경 시에만 재정렬해야 합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/algorithm-complexity"],
  },
  {
    id: "objective-c13-advanced-algorithm-complexity-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "Array의 `append(_:)`가 amortized O(1)인 이유와 어떤 특정 호출에서 O(n)이 될 수 있는지 올바르게 설명한 것은?",
    choices: [
      {
        id: "a",
        text: "항상 O(1)이다. amortized는 최악의 경우를 무시하는 표현일 뿐이다.",
      },
      {
        id: "b",
        text: "내부 버퍼가 꽉 찼을 때 2배 크기 버퍼를 새로 할당하고 모든 원소를 복사하므로 그 순간은 O(n), 하지만 연속 n번 append의 평균은 O(1)이다.",
      },
      {
        id: "c",
        text: "버퍼가 꽉 찰 때마다 O(n log n)이 걸리는 재정렬이 발생한다.",
      },
      {
        id: "d",
        text: "CoW(Copy-on-Write) 때문에 처음 append할 때만 O(n)이고 이후는 O(1)이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Array는 내부적으로 연속 메모리 버퍼를 가집니다. 버퍼가 꽉 찼을 때 2배 크기로 재할당하고 기존 원소를 모두 복사하는 작업이 O(n)입니다. 하지만 이 재할당은 n번 append 중 log₂n번만 일어나므로 연속 n번의 평균 비용은 O(1)이 됩니다. 이것이 amortized O(1)의 의미입니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/algorithm-complexity"],
  },

  // ── concurrency-primitives (5) ────────────────────────────────────────────
  {
    id: "objective-c13-basic-concurrency-primitives-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt: "데이터 레이스(Data Race)가 발생하는 조건으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "두 스레드가 같은 메모리에 동시에 접근하고, 그 중 최소 하나가 쓰기 작업을 수행하는 경우",
      },
      {
        id: "b",
        text: "두 스레드가 다른 메모리에 동시에 쓰기 작업을 수행하는 경우",
      },
      {
        id: "c",
        text: "두 스레드가 같은 메모리에 동시에 읽기만 하는 경우",
      },
      {
        id: "d",
        text: "메인 스레드에서 UI 업데이트를 수행하는 경우",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "데이터 레이스는 여러 스레드가 같은 메모리를 동시에 접근하고, 그 중 최소 하나가 쓰기 작업을 수행할 때 발생합니다. 읽기만 동시에 하는 것은 안전합니다. 데이터 레이스는 결과를 비결정적으로 만들어 가끔 잘못된 값이나 크래시를 유발합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/concurrency-primitives"],
  },
  {
    id: "objective-c13-basic-concurrency-primitives-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "GCD의 concurrent queue에 `.barrier` 플래그를 사용하여 쓰기 작업을 수행하는 패턴은 어떤 동기화 Primitive와 동일한가?",
    choices: [
      { id: "a", text: "Mutex" },
      { id: "b", text: "Semaphore" },
      { id: "c", text: "Read-Write Lock" },
      { id: "d", text: "Spinlock" },
    ],
    correctChoiceId: "c",
    explanation:
      "GCD의 `DispatchQueue(attributes: .concurrent)`에서 읽기는 `queue.sync { read() }`로 동시에 허용하고, 쓰기는 `queue.async(flags: .barrier) { write() }`로 단독 실행하는 패턴은 Read-Write Lock(RWLock)과 동일합니다. 읽기 多 / 쓰기 少 패턴에 효율적입니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/concurrency-primitives"],
  },
  {
    id: "objective-c13-intermediate-concurrency-primitives-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "데드락(Deadlock) 발생의 4가지 조건 중 락 획득 순서를 전역적으로 통일함으로써 깨뜨릴 수 있는 조건은?",
    choices: [
      { id: "a", text: "Mutual Exclusion (상호 배제)" },
      { id: "b", text: "Hold and Wait (점유 대기)" },
      { id: "c", text: "No Preemption (비선점)" },
      { id: "d", text: "Circular Wait (순환 대기)" },
    ],
    correctChoiceId: "d",
    explanation:
      "Circular Wait는 A가 B의 자원을, B가 A의 자원을 기다리는 순환 구조입니다. 모든 스레드가 락을 같은 순서로 획득하도록 강제하면 순환 대기가 불가능해져 데드락을 예방할 수 있습니다. iOS의 `DispatchQueue.main.sync`를 메인 스레드에서 호출하면 자기 자신을 기다리는 순환 대기로 데드락이 발생합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/concurrency-primitives"],
  },
  {
    id: "objective-c13-intermediate-concurrency-primitives-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "Semaphore와 Mutex의 가장 큰 차이점은 무엇인가?",
    choices: [
      {
        id: "a",
        text: "Mutex는 카운트 기반이고 Semaphore는 이진(binary) 방식만 지원한다",
      },
      {
        id: "b",
        text: "Semaphore는 카운트 N을 설정해 동시에 N개의 스레드까지 접근을 허용할 수 있으나, Mutex는 한 번에 한 스레드만 허용한다",
      },
      {
        id: "c",
        text: "Mutex는 async/await에서만 사용 가능하고 Semaphore는 모든 환경에서 사용 가능하다",
      },
      {
        id: "d",
        text: "Semaphore는 데드락이 발생하지 않는다",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Semaphore는 카운트(value) 기반으로 동시에 N개까지 접근을 허용합니다. N=1이면 Mutex와 유사하게 동작하지만, N>1이면 API 동시 호출 제한이나 리소스 풀처럼 여러 스레드의 동시 접근을 제한적으로 허용할 수 있습니다. `DispatchSemaphore(value: 3)`는 동시에 3개의 작업을 허용합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/concurrency-primitives"],
  },
  {
    id: "objective-c13-advanced-concurrency-primitives-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "Swift `actor`와 `NSLock`을 비교할 때 actor가 신규 코드의 기본 선택으로 권장되는 가장 중요한 이유는?",
    choices: [
      { id: "a", text: "actor는 항상 메인 스레드에서 실행되어 UI 업데이트가 안전하다" },
      {
        id: "b",
        text: "actor는 컴파일 타임에 데이터 레이스를 검증하여 런타임 버그가 원천 차단된다",
      },
      { id: "c", text: "actor는 NSLock보다 실행 속도가 항상 빠르다" },
      { id: "d", text: "actor는 Objective-C와의 호환성을 자동으로 제공한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "NSLock는 런타임에 잠금/해제를 잊으면 데이터 레이스나 데드락이 발생합니다. 반면 Swift actor는 컴파일 타임에 격리 위반을 검출하여 데이터 레이스 자체를 원천 차단합니다. actor hop 비용이 있어 항상 빠르지는 않지만, 안전성 관점에서 신규 코드의 기본 선택입니다. iOS 5.5+(Swift 5.5+) 이상 환경에서 사용 가능합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/concurrency-primitives"],
  },

  // ── data-structures (5) ───────────────────────────────────────────────────
  {
    id: "objective-c13-basic-data-structures-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "Swift `Dictionary<K, V>`의 내부 구현 방식과 key가 반드시 준수해야 하는 프로토콜은?",
    choices: [
      { id: "a", text: "Red-Black Tree — Comparable" },
      { id: "b", text: "해시 테이블(open addressing) — Hashable" },
      { id: "c", text: "연결 리스트 — Equatable" },
      { id: "d", text: "B-Tree — Codable" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift `Dictionary`는 open addressing 방식의 해시 테이블로 구현되어 있습니다. key는 `Hashable`을 준수해야 하며, 평균적으로 검색/삽입/삭제가 O(1)입니다. 단, 해시 충돌이 극단적으로 많으면 worst case O(n)까지 저하될 수 있습니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/data-structures"],
  },
  {
    id: "objective-c13-basic-data-structures-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "Swift `Array`에서 `removeFirst()`를 반복적으로 호출할 때 전체 n번 호출의 시간복잡도는?",
    choices: [
      { id: "a", text: "O(n) — 각 호출이 O(1)이므로" },
      { id: "b", text: "O(n²) — 각 호출이 O(n)이므로" },
      { id: "c", text: "O(n log n) — 내부적으로 재정렬이 발생하므로" },
      { id: "d", text: "O(1) — CoW로 최적화되므로" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift `Array.removeFirst()`는 O(n)입니다. 첫 번째 원소를 제거하면 나머지 모든 원소를 한 칸씩 앞으로 당겨야 하기 때문입니다. 이를 n번 반복하면 O(n²)이 됩니다. 큐(FIFO) 패턴에서는 인덱스 포인터를 별도로 두거나 `swift-collections`의 `Deque`를 사용해야 합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/data-structures"],
  },
  {
    id: "objective-c13-intermediate-data-structures-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "LRU(Least Recently Used) 캐시를 O(1) 접근과 O(1) 삭제로 구현하기 위해 필요한 자료구조 조합은?",
    choices: [
      { id: "a", text: "Array + Set" },
      { id: "b", text: "LinkedList + HashMap" },
      { id: "c", text: "Binary Heap + Array" },
      { id: "d", text: "Trie + Queue" },
    ],
    correctChoiceId: "b",
    explanation:
      "LRU 캐시는 LinkedList로 접근 순서를 추적(가장 최근 사용은 head, 가장 오래된 것은 tail)하고, HashMap으로 key→노드 O(1) 조회를 제공합니다. 접근 시 노드를 head로 이동하고, 용량 초과 시 tail을 O(1)에 제거합니다. 두 자료구조를 동기화하여 모든 연산을 O(1)로 유지합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/data-structures"],
  },
  {
    id: "objective-c13-intermediate-data-structures-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "Swift `String.count`가 O(n)인 이유는 무엇인가?",
    choices: [
      { id: "a", text: "문자열이 힙(heap)에 저장되어 길이 계산에 네트워크 조회가 필요하다" },
      {
        id: "b",
        text: "Swift String은 UTF-8 기반 Grapheme Cluster 단위로 문자를 세므로 전체 순회가 필요하다",
      },
      { id: "c", text: "CoW(Copy-on-Write) 복사가 count 호출 시 발생한다" },
      { id: "d", text: "Swift 런타임이 문자열 길이를 캐싱하지 않는 설계 버그다" },
    ],
    correctChoiceId: "b",
    explanation:
      "Swift `String`은 UTF-8로 저장되며 `count`는 사용자 인지 문자(Unicode Grapheme Cluster) 단위로 셉니다. 이모지 하나가 여러 UTF-8 바이트와 스칼라로 이루어질 수 있어 정확한 카운트를 위해 문자열 전체를 순회해야 합니다. 따라서 O(n)입니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/data-structures"],
  },
  {
    id: "objective-c13-advanced-data-structures-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "Binary Search Tree(BST)의 평균 탐색이 O(log n)이지만 최악이 O(n)이 되는 경우와 이를 해결하는 자료구조는?",
    choices: [
      {
        id: "a",
        text: "해시 충돌이 많을 때 — Trie로 해결",
      },
      {
        id: "b",
        text: "정렬된 데이터를 순서대로 삽입하면 트리가 연결 리스트처럼 되어 O(n) — Red-Black Tree(Balanced BST)로 해결",
      },
      {
        id: "c",
        text: "트리의 depth가 짝수일 때 — AVL 트리로만 해결 가능",
      },
      {
        id: "d",
        text: "노드 삭제 시 재구성이 느려서 — Binary Heap으로 해결",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "BST에 정렬된 데이터를 순서대로 삽입하면 모든 노드가 한쪽으로 치우쳐 연결 리스트와 동일한 형태가 됩니다. 이때 탐색은 O(n)으로 저하됩니다. Red-Black Tree나 AVL Tree 같은 자기 균형 이진 탐색 트리(Balanced BST)는 삽입/삭제 후 자동으로 균형을 맞춰 항상 O(log n)을 보장합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/data-structures"],
  },

  // ── memory-model (5) ──────────────────────────────────────────────────────
  {
    id: "objective-c13-basic-memory-model-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "iOS에서 가상 메모리를 사용하는 이유와 페이지 크기로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "각 프로세스에 독립된 주소 공간을 제공하기 위해; 페이지 크기는 항상 4KB로 고정",
      },
      {
        id: "b",
        text: "각 프로세스에 독립된 가상 주소 공간을 제공하고 물리 메모리를 효율적으로 관리하기 위해; 페이지 크기는 4KB 또는 16KB (디바이스에 따라)",
      },
      {
        id: "c",
        text: "앱의 실행 속도를 높이기 위해; 페이지 크기는 1MB",
      },
      {
        id: "d",
        text: "스레드 간 메모리 공유를 방지하기 위해; 페이지 크기는 8KB",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "가상 메모리를 사용하면 각 프로세스가 자신만의 독립된 주소 공간을 갖고, OS의 MMU가 페이지 테이블을 통해 물리 주소로 변환합니다. iOS의 페이지 크기는 디바이스에 따라 4KB 또는 16KB입니다. 이를 통해 프로세스 간 격리와 물리 메모리의 효율적 관리가 가능합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/memory-model"],
  },
  {
    id: "objective-c13-basic-memory-model-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "iOS에서 메모리가 부족할 때 발생하는 메커니즘(jetsam)에서 가장 먼저 종료되는 프로세스 유형은?",
    choices: [
      { id: "a", text: "포그라운드 앱" },
      { id: "b", text: "시스템 데몬" },
      { id: "c", text: "백그라운드 앱" },
      { id: "d", text: "커널 프로세스" },
    ],
    correctChoiceId: "c",
    explanation:
      "iOS는 swap이 사실상 없으므로 메모리 압박 시 jetsam을 통해 우선순위가 낮은 프로세스부터 종료합니다. 가장 먼저 백그라운드 앱이 종료되고, 다음으로 아이들 백그라운드 작업, 마지막으로 포그라운드 앱이 종료됩니다. 앱은 `applicationDidReceiveMemoryWarning(_:)`으로 압박 신호를 받습니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/memory-model"],
  },
  {
    id: "objective-c13-intermediate-memory-model-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "CPU 캐시에서 배열을 순서대로 순회할 때 링크드 리스트보다 빠른 이유와 관련된 개념은?",
    choices: [
      { id: "a", text: "시간 지역성(Temporal locality) — 같은 데이터를 반복 접근하므로" },
      {
        id: "b",
        text: "공간 지역성(Spatial locality) — 인접한 메모리를 함께 접근하므로 캐시 라인이 효율적으로 활용됨",
      },
      { id: "c", text: "TLB hit — 페이지 테이블 변환이 빠르게 이루어지므로" },
      { id: "d", text: "False sharing — 여러 스레드가 같은 캐시 라인을 공유하므로" },
    ],
    correctChoiceId: "b",
    explanation:
      "배열은 연속된 메모리에 저장되어 있어 순회 시 공간 지역성을 잘 활용합니다. CPU는 캐시 라인(보통 64바이트) 단위로 메모리를 읽기 때문에, 배열의 인접 원소들이 함께 캐시로 올라옵니다. 반면 링크드 리스트는 노드가 메모리에 흩어져 있어 캐시 미스가 빈번하게 발생합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/memory-model"],
  },
  {
    id: "objective-c13-intermediate-memory-model-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "TLB(Translation Lookaside Buffer)가 프로세스 컨텍스트 스위치 시 flush되는 이유는?",
    choices: [
      { id: "a", text: "TLB가 가득 차면 자동으로 flush되므로" },
      {
        id: "b",
        text: "다른 프로세스는 다른 가상→물리 매핑을 사용하므로, 이전 프로세스의 TLB 항목이 새 프로세스에서 유효하지 않기 때문에",
      },
      { id: "c", text: "TLB는 스레드 스위치 시에만 flush되며 프로세스는 무관하다" },
      { id: "d", text: "메모리 할당을 최적화하기 위해 정기적으로 초기화된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "TLB는 가상 주소→물리 주소 변환을 캐싱합니다. 각 프로세스는 독립된 가상 주소 공간을 갖고 있어 같은 가상 주소가 다른 물리 주소에 매핑됩니다. 따라서 프로세스 전환 시 이전 프로세스의 TLB 항목이 새 프로세스에서 잘못된 물리 주소를 가리킬 수 있으므로 flush가 필요합니다. 이것이 스레드 스위치보다 프로세스 스위치가 비싼 이유 중 하나입니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/memory-model"],
  },
  {
    id: "objective-c13-advanced-memory-model-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "iOS 메인 스레드의 스택(stack) 크기는 얼마이며, 워커 스레드와 다른 이유로 가장 적절한 것은?",
    choices: [
      {
        id: "a",
        text: "메인: 512KB, 워커: 1MB — 메인이 더 작아야 다른 작업에 메모리를 양보할 수 있으므로",
      },
      {
        id: "b",
        text: "메인: 1MB, 워커: 512KB — 메인 스레드는 UI 렌더링과 이벤트 처리 등 더 많은 호출 스택이 필요할 수 있으므로",
      },
      {
        id: "c",
        text: "메인: 2MB, 워커: 2MB — 동일하게 설정됨",
      },
      {
        id: "d",
        text: "메인: 4MB, 워커: 1MB — OS가 자동으로 조절함",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS에서 메인 스레드의 스택 크기는 보통 1MB, 워커 스레드는 512KB입니다. 메인 스레드는 앱의 진입점이자 UI 이벤트 처리의 중심으로 더 깊은 호출 스택이 필요할 수 있어 더 큰 스택이 할당됩니다. 재귀 깊이가 너무 깊거나 큰 지역 배열을 만들면 stack overflow 크래시가 발생합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/memory-model"],
  },

  // ── process-vs-thread (5) ─────────────────────────────────────────────────
  {
    id: "objective-c13-basic-process-vs-thread-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "프로세스(Process)와 스레드(Thread)의 메모리 구조에서 스레드마다 별도로 가지는 영역은?",
    choices: [
      { id: "a", text: "Heap" },
      { id: "b", text: "Data (전역/static 변수)" },
      { id: "c", text: "Stack" },
      { id: "d", text: "Text (코드 영역)" },
    ],
    correctChoiceId: "c",
    explanation:
      "프로세스의 메모리 구조에서 Stack(함수 호출 프레임, 지역 변수)은 스레드마다 별도로 존재합니다. 반면 Heap(동적 할당), Data(전역/static 변수), Text(실행 코드)는 같은 프로세스 내 모든 스레드가 공유합니다. 이 공유 메모리 때문에 데이터 레이스가 발생할 수 있습니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/process-vs-thread"],
  },
  {
    id: "objective-c13-basic-process-vs-thread-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "iOS 앱에서 한 스레드가 크래시(crash)하면 앱 전체가 종료되는 이유는?",
    choices: [
      { id: "a", text: "iOS 정책상 모든 스레드를 한 번에 종료하도록 강제하므로" },
      {
        id: "b",
        text: "같은 프로세스 메모리 공간 안에서 발생한 segfault/abort는 프로세스 시그널로 전파되어 OS가 프로세스 전체를 종료하므로",
      },
      { id: "c", text: "메인 스레드만 크래시해도 앱이 종료되며, 워커 스레드 크래시는 무시된다" },
      { id: "d", text: "Xcode의 디버깅 환경에서만 그렇게 동작하며 배포 앱에서는 해당 스레드만 종료된다" },
    ],
    correctChoiceId: "b",
    explanation:
      "모든 스레드는 같은 프로세스의 메모리 공간을 공유합니다. 한 스레드에서 segfault나 abort가 발생하면 OS는 해당 프로세스 전체에 시그널을 보내 종료시킵니다. 이것이 iOS 익스텐션을 별도 프로세스로 분리하는 이유이기도 합니다 — 익스텐션이 크래시해도 호스트 앱은 정상 동작합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/process-vs-thread"],
  },
  {
    id: "objective-c13-intermediate-process-vs-thread-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "프로세스 컨텍스트 스위치가 스레드 컨텍스트 스위치보다 비싼 이유로 올바른 것은?",
    choices: [
      { id: "a", text: "프로세스는 더 많은 CPU 코어를 사용하므로" },
      {
        id: "b",
        text: "프로세스 전환 시 page table 교체, TLB flush, 캐시 무효화가 추가로 발생하므로",
      },
      { id: "c", text: "프로세스는 스레드보다 더 많은 레지스터를 사용하므로" },
      { id: "d", text: "iOS에서 프로세스는 항상 더 높은 우선순위를 가지므로" },
    ],
    correctChoiceId: "b",
    explanation:
      "스레드 컨텍스트 스위치는 레지스터와 스레드 로컬 데이터만 저장/복원합니다. 반면 프로세스 컨텍스트 스위치는 추가로 page table 교체, TLB flush(다른 프로세스의 가상→물리 매핑 캐시 무효화), CPU 캐시 무효화까지 발생합니다. 이 추가 비용 때문에 프로세스 전환이 훨씬 비쌉니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/process-vs-thread"],
  },
  {
    id: "objective-c13-intermediate-process-vs-thread-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "iOS에서 GCD `DispatchQueue.global().async { }` 를 사용할 때 스레드를 직접 생성하지 않는 이유는?",
    choices: [
      { id: "a", text: "GCD는 매 요청마다 새 스레드를 생성하지만 이를 사용자에게 숨긴다" },
      {
        id: "b",
        text: "GCD가 내부적으로 스레드 풀을 관리하여 미리 만든 스레드를 재활용하므로 생성 비용이 없다",
      },
      { id: "c", text: "GCD는 항상 메인 스레드에서만 실행된다" },
      { id: "d", text: "iOS는 스레드 생성을 OS 레벨에서 금지하고 있다" },
    ],
    correctChoiceId: "b",
    explanation:
      "GCD는 내부적으로 스레드 풀을 유지합니다. 작업이 들어오면 미리 만들어 둔 스레드를 재활용하므로 매 요청마다 스레드를 생성/소멸하는 비용이 없습니다. 시스템이 CPU 코어 수와 작업 부하에 따라 적절히 스레드를 관리하므로 사용자가 스레드 개수를 직접 지정할 필요가 없습니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/process-vs-thread"],
  },
  {
    id: "objective-c13-advanced-process-vs-thread-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "iOS에서 앱 익스텐션(App Extension)이 별도 프로세스로 실행되는 주요 이유는?",
    choices: [
      { id: "a", text: "익스텐션이 더 많은 CPU 자원을 사용하기 위해" },
      {
        id: "b",
        text: "보안 격리와 안정성을 위해 — 익스텐션 크래시가 호스트 앱에 영향을 미치지 않도록",
      },
      { id: "c", text: "익스텐션이 다른 언어로 개발될 수 있기 때문에" },
      { id: "d", text: "iOS 메모리 모델이 단일 프로세스에서 익스텐션을 지원하지 않아서" },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS 익스텐션이 별도 프로세스로 실행되는 이유는 보안 격리와 안정성입니다. 프로세스는 독립된 메모리 공간을 가지므로 익스텐션이 크래시해도 호스트 앱은 정상 동작합니다. 또한 각 익스텐션은 별도의 샌드박스와 매우 제한된 메모리 한도가 적용됩니다. 앱과 익스텐션은 App Group + IPC를 통해 데이터를 공유합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/process-vs-thread"],
  },

  // ── system-design-intro (5) ───────────────────────────────────────────────
  {
    id: "objective-c13-basic-system-design-intro-001",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "모바일 클라이언트의 캐시 계층 구조에서 올바른 순서는? (가장 빠른 것 → 네트워크)",
    choices: [
      { id: "a", text: "디스크 캐시 → 메모리 캐시 → 네트워크" },
      { id: "b", text: "메모리 캐시 → 디스크 캐시 → 네트워크" },
      { id: "c", text: "네트워크 → 메모리 캐시 → 디스크 캐시" },
      { id: "d", text: "메모리 캐시 → 네트워크 → 디스크 캐시" },
    ],
    correctChoiceId: "b",
    explanation:
      "캐시 계층은 속도 순으로 메모리 캐시(NSCache, 앱 내 LRU) → 디스크 캐시(FileManager, 영구) → 네트워크 순으로 조회합니다. 메모리 캐시는 앱 종료 시 사라지지만 가장 빠르고, 디스크 캐시는 영구 저장되지만 I/O 비용이 있습니다. 이미지 로딩에서 이 2단 캐시 구조가 일반적입니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/system-design-intro"],
  },
  {
    id: "objective-c13-basic-system-design-intro-002",
    type: "objective",
    level: "basic",
    category: "CS Fundamentals",
    prompt:
      "실시간 채팅 앱에서 양방향 통신에 가장 적합한 프로토콜은?",
    choices: [
      { id: "a", text: "HTTP Long Polling" },
      { id: "b", text: "SSE(Server-Sent Events)" },
      { id: "c", text: "WebSocket" },
      { id: "d", text: "MQTT" },
    ],
    correctChoiceId: "c",
    explanation:
      "WebSocket은 클라이언트와 서버 간 양방향 전이중(full-duplex) 통신을 지원합니다. 채팅처럼 클라이언트가 메시지를 보내고 받아야 하는 경우에 가장 적합합니다. SSE는 서버→클라이언트 단방향 push에만 사용됩니다. Long Polling은 오래된 환경 호환용이며, MQTT는 IoT/저전력 환경에 적합합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/system-design-intro"],
  },
  {
    id: "objective-c13-intermediate-system-design-intro-003",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "Access Token이 만료된 상태에서 여러 API 요청이 동시에 들어올 때 올바른 토큰 갱신 전략은?",
    choices: [
      { id: "a", text: "각 요청이 독립적으로 Refresh Token을 사용해 새 Access Token을 발급받는다" },
      {
        id: "b",
        text: "Single-flight refresh — 첫 번째 요청만 갱신하고, 나머지 요청은 갱신 완료를 기다렸다가 새 토큰으로 재시도한다",
      },
      { id: "c", text: "모든 요청을 실패시키고 사용자에게 재로그인을 요청한다" },
      { id: "d", text: "Access Token 만료 전에 미리 갱신하여 동시 만료 상황 자체를 방지한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "여러 요청이 동시에 401을 받으면 모두 갱신을 시도할 경우 Refresh Token이 여러 번 사용되어 토큰이 무효화될 수 있습니다. Single-flight refresh 패턴은 첫 번째 갱신 요청만 실행하고 나머지는 대기 큐에 넣어두었다가, 갱신이 완료되면 새 Access Token으로 모든 대기 요청을 재시도합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/system-design-intro"],
  },
  {
    id: "objective-c13-intermediate-system-design-intro-004",
    type: "objective",
    level: "intermediate",
    category: "CS Fundamentals",
    prompt:
      "오프라인 우선(Offline-first) 앱에서 여러 디바이스가 같은 데이터를 수정했을 때 충돌 해결 전략 중 가장 단순한 접근법은?",
    choices: [
      { id: "a", text: "CRDT(Conflict-free Replicated Data Type) — 자동 병합" },
      { id: "b", text: "OT(Operational Transformation) — 구글 Docs 방식" },
      {
        id: "c",
        text: "Last-Write-Wins(LWW) — 마지막 수정 시간 기준으로 가장 최근 변경을 사용",
      },
      { id: "d", text: "Manual Merge — 항상 사용자에게 수동 병합을 요청" },
    ],
    correctChoiceId: "c",
    explanation:
      "Last-Write-Wins(LWW)는 타임스탬프 또는 서버 sequence number를 기준으로 가장 최근에 수정된 버전을 채택하는 가장 단순한 충돌 해결 전략입니다. 구현이 간단하지만 데이터 손실이 발생할 수 있습니다. 더 복잡한 시나리오에서는 CRDT나 사용자가 직접 merge하는 방식을 고려합니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/system-design-intro"],
  },
  {
    id: "objective-c13-advanced-system-design-intro-005",
    type: "objective",
    level: "advanced",
    category: "CS Fundamentals",
    prompt:
      "모바일 시스템 디자인 면접에서 '채팅 앱을 설계하라'는 질문에 답변할 때 메시지 순서 보장을 위해 클라이언트 로컬 타임스탬프 대신 서버 sequence number를 사용해야 하는 이유는?",
    choices: [
      { id: "a", text: "서버가 항상 클라이언트보다 성능이 뛰어나므로" },
      {
        id: "b",
        text: "디바이스 시계가 사용자마다 달라 로컬 타임스탬프는 신뢰할 수 없으므로(시계 불일치)",
      },
      { id: "c", text: "iOS는 클라이언트 타임스탬프 접근을 보안상 제한하므로" },
      { id: "d", text: "서버 sequence number가 타임스탬프보다 저장 공간을 덜 차지하므로" },
    ],
    correctChoiceId: "b",
    explanation:
      "각 디바이스의 시계는 서로 다를 수 있습니다(시계 불일치, clock skew). 특히 네트워크 지연이나 디바이스 시간 설정에 따라 로컬 타임스탬프만으로는 메시지 순서를 보장할 수 없습니다. 서버가 부여하는 monotonically increasing sequence number를 진실(truth)로 사용하면 모든 클라이언트에서 동일한 메시지 순서가 보장됩니다.",
    relatedTopicSlugs: ["13-cs-fundamentals/system-design-intro"],
  },
];
