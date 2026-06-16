# 캐시 전략 · 무효화 (TTL · ETag · LRU/LFU/ARC · SWR)

> 한 줄 요약 — 캐시의 어려움은 *저장*이 아니라 **언제 버리는가**. TTL/ETag로 *신선도*를 정의하고, LRU/LFU/ARC로 *공간*을 관리하며, stale-while-revalidate로 *지연*과 *정확성*을 분리한다.

## 핵심 개념

### 신선도(freshness) 정책

| 정책 | 동작 | 적합 |
|---|---|---|
| **TTL (Time-To-Live)** | 저장 시점 + N초 후 stale | 변동 빈도 예측 가능한 데이터 (피드 30s, 프로필 5m) |
| **ETag / If-None-Match** | 서버가 콘텐츠 해시 발급 → 클라가 검증 요청 → 304면 본문 재사용 | 큰 응답인데 변경 빈도 낮은 경우 |
| **Last-Modified / If-Modified-Since** | ETag와 유사, 시간 기반 | 서버가 mtime을 정확히 갖는 경우 |
| **버전 토큰** | 서버가 `version` 필드 발급, 클라가 비교 | 푸시로 invalidate 가능할 때 |

*왜 TTL만으로 부족한가*: TTL 만료 == 데이터 변경 아님. ETag는 "안 바뀌면 본문 안 받음" → 대역폭 절약. TTL은 *언제 검증할지*, ETag는 *검증 비용 줄이기*. 둘은 보완 관계.

### eviction (공간 정책)

| 정책 | 기준 | 장점 | 단점 |
|---|---|---|---|
| **LRU** (Least Recently Used) | 가장 오래 안 쓴 항목 evict | 단순, 시간 지역성 좋음 | 스캔 1번에 캐시 오염 (cache pollution) |
| **LFU** (Least Frequently Used) | 사용 횟수 적은 항목 | 인기 항목 보존 | "한 번 인기, 영원히 보존" 문제, 카운터 메모리 |
| **ARC** (Adaptive Replacement Cache) | LRU + LFU 적응형 | 워크로드 변화에 강함 | 구현 복잡, 특허 (IBM, 만료) |
| **FIFO** | 입력 순서 | 단순 | 접근 패턴 무시 |
| **2Q / TinyLFU** | LFU 변종 | 스캔 저항 | 구현 복잡 |

*iOS 실무에서 거의 LRU*. LFU는 "인기 콘텐츠 상위 20%가 트래픽 80%"인 미디어 앱에서 의미 있음. ARC는 라이브러리 수준 고민.

### 무효화 시점 (invalidation trigger)

1. **TTL 만료** — 시간 기반. 가장 단순.
2. **User action** — 좋아요/저장 직후 해당 리소스 무효화. *낙관적 업데이트*와 결합.
3. **Push notification** — silent push로 `cache.invalidate(key:)` 호출. 실시간 데이터.
4. **Polling / long-poll** — TTL 작은 변종. 배터리 비용 고려.
5. **App lifecycle** — `didBecomeActive`에 stale 표시 → 다음 read 때 갱신.
6. **버전 비교** — 앱 부팅 시 `/version` 호출, 서버 버전 < 캐시 버전 아니면 invalidate.

### stale-while-revalidate (SWR)
```
read(key):
  1. cached 있고 fresh         → return cached
  2. cached 있고 stale         → return cached + background revalidate (다음 read에 최신)
  3. cached 없음               → fetch (block)
```
- *왜*: 사용자에게 *즉시 응답* + 백그라운드로 최신화. **인지 지연 0**, 정확성은 *최대 1틱 늦음*.
- 위험: stale 허용 시간(= "최대 얼마나 낡은 걸 보여줄까")을 별도 정책으로. 결제/잔고 같은 데이터엔 부적합.

### 부정 캐시 (negative cache)
- 404, 빈 결과도 짧게 캐시 (예: 30초). 동일 키 폭주 방지.
- TTL은 양성 캐시보다 짧게.

## 비교 (eviction)

| 항목 | LRU | LFU | ARC |
|---|---|---|---|
| 자료구조 | 더블링크드리스트 + 해시 | 힙 또는 freq별 리스트 | T1/T2/B1/B2 4개 리스트 |
| O(1) 가능 | O (양방향 링크) | O (freq 리스트) | O |
| 스캔 1회 캐시 오염 | 발생 | 저항 | 저항 |
| 메모리 오버헤드 | 낮음 | 카운터 + 힙 | 큼 (4개 리스트) |
| 적합 워크로드 | 시간 지역성 | 인기 편중 | 혼합 / 변동 |

## 코드 예시

### TTL + ETag 캐시 엔트리

```swift
struct CacheEntry<Value: Codable>: Codable {
    let value: Value
    let etag: String?
    let storedAt: Date
    let ttl: TimeInterval

    var isFresh: Bool { Date().timeIntervalSince(storedAt) < ttl }
    var isStale: Bool { !isFresh }
}

actor APICache<Value: Codable> {
    private var store: [String: CacheEntry<Value>] = [:]
    private let fetcher: (String, String?) async throws -> (Value, String?) // (value, newEtag)

    init(fetcher: @escaping (String, String?) async throws -> (Value, String?)) {
        self.fetcher = fetcher
    }

    /// SWR: fresh면 즉시, stale이면 캐시 반환 + 백그라운드 revalidate
    func value(for key: String, maxStale: TimeInterval = 60) async throws -> Value {
        if let e = store[key], e.isFresh { return e.value }
        if let e = store[key], Date().timeIntervalSince(e.storedAt) < e.ttl + maxStale {
            Task { try? await revalidate(key) }   // background
            return e.value
        }
        return try await revalidate(key)
    }

    @discardableResult
    private func revalidate(_ key: String) async throws -> Value {
        let etag = store[key]?.etag
        let (value, newEtag) = try await fetcher(key, etag)
        store[key] = CacheEntry(value: value, etag: newEtag, storedAt: Date(), ttl: 300)
        return value
    }

    func invalidate(_ key: String) { store.removeValue(forKey: key) }
    func invalidateAll() { store.removeAll() }
}
```

### LRU (O(1))

```swift
final class LRUCache<Key: Hashable, Value> {
    private final class Node {
        let key: Key; var value: Value
        var prev: Node?; var next: Node?
        init(_ k: Key, _ v: Value) { key = k; value = v }
    }
    private var map: [Key: Node] = [:]
    private var head: Node?  // most recent
    private var tail: Node?  // least recent
    private let capacity: Int
    private let lock = NSLock()

    init(capacity: Int) { self.capacity = capacity }

    func get(_ key: Key) -> Value? {
        lock.lock(); defer { lock.unlock() }
        guard let node = map[key] else { return nil }
        moveToHead(node)
        return node.value
    }

    func put(_ key: Key, _ value: Value) {
        lock.lock(); defer { lock.unlock() }
        if let n = map[key] { n.value = value; moveToHead(n); return }
        let n = Node(key, value); map[key] = n; addHead(n)
        if map.count > capacity, let t = tail {
            map.removeValue(forKey: t.key); remove(t)
        }
    }
    // moveToHead / addHead / remove 생략 (전형적 doubly-linked list 조작)
    private func moveToHead(_ n: Node) { /* ... */ }
    private func addHead(_ n: Node) { /* ... */ }
    private func remove(_ n: Node) { /* ... */ }
}
```

### Push로 무효화

```swift
extension AppDelegate {
    func application(_ app: UIApplication,
                     didReceiveRemoteNotification userInfo: [AnyHashable: Any]) async
                     -> UIBackgroundFetchResult {
        if let invalidate = userInfo["invalidate"] as? [String] {
            await invalidate.asyncForEach { await APICacheRegistry.shared.invalidate($0) }
            return .newData
        }
        return .noData
    }
}
```

## 측정 / 벤치마크

### hit rate, staleness, revalidation cost
- `os_signpost`로 `cache.hit.fresh`, `cache.hit.stale`, `cache.miss`, `cache.revalidate.304`, `cache.revalidate.200`을 별도 이벤트로.
- **304 비율** = `revalidate.304 / (revalidate.304 + revalidate.200)`. 70%+면 ETag 가치 입증.
- staleness 분포: hit 시 `Date().timeIntervalSince(entry.storedAt)`을 히스토그램으로.

### 함정
- **hit rate만 보면 함정**: stale hit를 fresh hit와 분리해서 봐야 한다. stale 비율이 높으면 TTL이 너무 짧거나 무효화가 과함.
- **무효화 누락 확인 어려움**: "오래된 데이터가 보인다" 버그는 hit rate가 아니라 *staleness 상한*을 모니터링해야 잡힌다.

## 흔한 함정 / Follow-up

- **Q. TTL을 길게 잡으면 신선도 손상, 짧게 잡으면 네트워크 비용 — 어떻게 정하나?**
  데이터별 *변경 빈도*와 *오래된 데이터 허용 비용*으로 분리. 잔고 0초, 프로필 5분, 정적 콘텐츠 1일. 동일 앱 내 단일 TTL은 안티패턴.

- **Q. ETag만으로 무효화하면 안 되는가?**
  매 요청마다 검증 RTT가 든다. TTL로 *검증 자체를 스킵*, ETag로 *검증할 때 본문 절약*. 둘 다 필요.

- **Q. SWR이 항상 답인가?**
  잔고/결제/예약 가능 좌석처럼 **stale = 사용자 손해**인 데이터엔 부적합. *읽기 전용 + 변동 작음*에서 빛난다.

- **Q. LRU가 스캔에 약하다는 게 무슨 뜻?**
  사용자가 무한 스크롤로 모든 아이템을 한 번씩 본 순간, 정작 자주 보는 핫 아이템이 다 evict됨. LFU/2Q/TinyLFU가 이 시나리오에 강함.

- **Q. invalidate를 너무 자주 부르면?**
  네트워크 폭주 + 디스크 IO 증가. 1) debounce, 2) 키 prefix 단위 invalidate, 3) "다음 read 때 revalidate" 표시만(lazy invalidation).

- **Q. 토큰 갱신 캐시는?**
  access token = TTL 기반 (서버가 `expires_in` 명시). refresh token = Keychain. 만료 1~2분 전 *proactive refresh*로 401 폭주 회피.

- **Q. 오프라인 큐 (write-behind)는 캐시인가?**
  엄밀히는 쓰기 버퍼. 캐시 무효화와 결합: 큐 flush 성공 시 관련 read 캐시 invalidate.

## 참고
- RFC 7234 (HTTP Caching), RFC 7232 (Conditional Requests, ETag)
- Megiddo & Modha, *ARC: A Self-Tuning, Low Overhead Replacement Cache* (FAST '03)
- Vercel SWR 문서 (stale-while-revalidate 패턴 일반화)
- WWDC 2017 **Advanced Networking** — URLSession 캐시 의미론
