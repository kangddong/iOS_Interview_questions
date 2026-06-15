# 저장소 성능 비교 · 측정 (UserDefaults · Keychain · CoreData · SQLite · FileManager)

> 한 줄 요약 — 저장소 선택은 *기능*이 아니라 **read/write 비용 + 동시성 모델**로 갈린다. 메인 스레드에서 100ms+ 잡으면 hitch. Instruments + `os_signpost`로 *실제 디바이스*에서 측정하지 않으면 최적화는 추측에 불과하다.

## 핵심 개념

### 각 저장소의 비용 프로파일

- **UserDefaults**
  - 메모리에 캐시된 plist. read는 in-memory dictionary 조회 (~µs).
  - write는 메모리 즉시 반영 + **백그라운드 디스크 flush** (debounced). 단, 앱 종료/배터리 컷 직전엔 손실 가능.
  - 크기 커지면 **모든 write가 전체 plist 직렬화** → O(N) write. 큰 데이터 부적합.

- **Keychain**
  - C API (`SecItem*`) 호출 → securityd 데몬과 **XPC 왕복** → 디스크 IO.
  - read 1건 수 ms (UserDefaults보다 100~1000x 느림). **메인 스레드 호출 금지** 원칙.
  - 동시성: thread-safe하지만 직렬화됨. 대량 호출 시 큐 적체.

- **Core Data**
  - 위에 SQLite. row fetch는 lazy (faulting).
  - context 분리 시 멀티스레드 가능. `performBackgroundTask` 또는 `NSPersistentContainer.newBackgroundContext`.
  - batch 연산 (`NSBatchInsertRequest`, `NSBatchUpdateRequest`, `NSBatchDeleteRequest`) — context 거치지 않고 SQLite 직접. 수만 row insert가 1초 미만으로 떨어짐.

- **SQLite (직접/GRDB)**
  - 가장 빠름. WAL 모드 + prepared statement + transaction batching이 핵심.
  - tx 없이 1만 row insert = 수 초, 단일 tx 안에 묶으면 < 200ms (디바이스 기준).
  - 동시성: WAL이면 다중 reader + 단일 writer.

- **FileManager**
  - 파일 IO 직접. read 비용은 *파일 크기 + 시스템 호출 오버헤드*.
  - `Data(contentsOf:)` → 전체 메모리 로드. 큰 파일은 `FileHandle` 스트리밍 또는 `mmap` (`Data(contentsOf:options:.mappedIfSafe)`).
  - **atomic write** (`.atomic`) = temp 파일 작성 후 rename → 안전하지만 디스크 IO 2배.

### 측정 도구

| 도구 | 용도 |
|---|---|
| **os_signpost** | 구간 측정. Instruments Points of Interest 트랙으로 시각화 |
| **MetricKit** | 실사용자 hitch/hang/디스크 IO 집계 (`MXMetricPayload`) |
| **Instruments — Time Profiler** | 메인 스레드 stall 원인 추적 |
| **Instruments — File Activity** | 디스크 read/write 호출 추적 |
| **Instruments — Core Data** | fetch 횟수, fault 횟수, context save 시간 |
| **XCTest measure** | 회귀 테스트로 자동화 |

## 비교

| 항목 | UserDefaults | Keychain | Core Data | SQLite 직접 | FileManager |
|---|---|---|---|---|---|
| 단건 read | ~1 µs | ~1–5 ms | ~50–200 µs (fault) | ~10–50 µs | 파일 크기 의존 |
| 단건 write | ~10 µs (메모리) | ~5–20 ms | ~100–500 µs (uncommitted) | ~50 µs (tx 안) | ~ms |
| 1만건 insert | 부적합 (전체 직렬화) | 부적합 | batchInsert ~100 ms | tx batch ~200 ms | N/A |
| 메인 스레드 안전 | O (작은 데이터) | **X** | save는 X | tx는 X | 큰 파일 X |
| 트랜잭션 | X | X | O (context.save) | O | X |
| 쿼리 | X | 제한적 (attr 매칭) | O (Predicate) | O (SQL) | X |
| 동시성 | thread-safe (write 내부 직렬) | thread-safe (직렬화 큐) | context 분리 | WAL = 다중 reader | 직접 락 |
| 크래시 안전성 | 마지막 flush 손실 가능 | 강함 | tx 보호 | tx 보호 | atomic write 필요 |

*숫자는 신형 디바이스 + 작은 payload 기준 추정*. 절대값 대신 **자릿수 차이**로 기억.

## 코드 예시

### os_signpost로 구간 측정

```swift
import os.signpost
let log = OSLog(subsystem: "app.persistence", category: "io")

func loadUsers() throws -> [User] {
    let id = OSSignpostID(log: log)
    os_signpost(.begin, log: log, name: "load.users", signpostID: id)
    defer { os_signpost(.end, log: log, name: "load.users", signpostID: id) }
    return try CoreDataStack.shared.fetch(User.self)
}
```
Instruments → **os_signpost** template → "load.users" 구간 분포(중앙값, p95) 확인.

### Core Data batch insert (수만 row)

```swift
func importContacts(_ raw: [ContactDTO]) async throws {
    try await container.performBackgroundTask { ctx in
        let req = NSBatchInsertRequest(entity: Contact.entity(), managedObjectHandler: { obj in
            guard let i = obj as? Contact, let dto = raw.popLast() else { return true }
            i.id = dto.id; i.name = dto.name; i.phone = dto.phone
            return raw.isEmpty
        })
        req.resultType = .objectIDs
        let res = try ctx.execute(req) as? NSBatchInsertResult
        // context들에 변경 전파 (batch는 context를 우회하므로 수동 머지 필요)
        if let ids = res?.result as? [NSManagedObjectID] {
            NSManagedObjectContext.mergeChanges(
                fromRemoteContextSave: [NSInsertedObjectIDsKey: ids],
                into: [self.container.viewContext])
        }
    }
}
```
- *왜 일반 insert 대신*: 일반 `NSEntityDescription.insertNewObject` 1만 번 = 수십 초, 메모리 폭주. batch insert는 SQLite에 직접 → 수백 ms.

### SQLite transaction batching (GRDB 의사 코드)

```swift
try dbQueue.write { db in
    for row in rows {
        try db.execute(sql: "INSERT INTO log VALUES (?, ?)", arguments: [row.id, row.body])
    }
} // 블록 전체가 단일 transaction
```

### 비동기 파일 IO (큰 파일)

```swift
func readLarge(_ url: URL) async throws -> Data {
    try await Task.detached(priority: .utility) {
        // 큰 파일은 mmap으로 메모리 매핑 — 한 번에 다 로드 X
        try Data(contentsOf: url, options: [.mappedIfSafe])
    }.value
}
```

### Keychain은 백그라운드에서

```swift
func token() async throws -> String {
    try await Task.detached(priority: .userInitiated) {
        try Keychain.read("accessToken")  // securityd XPC, 메인 X
    }.value
}
```

## 측정 / 벤치마크

### 절차
1. **실기기** (구형 포함, 예: iPhone SE 2). 시뮬레이터 무의미.
2. **Release 빌드**. Debug는 ARC/검증 오버헤드로 2~3배 느림.
3. **현실적 데이터**: 빈 DB가 아니라 *실 사용자 규모* (수만 row + 관계).
4. **반복**: 첫 호출 = 콜드 캐시, 두 번째 이후 = 웜. p50/p95 둘 다.
5. `MetricKit`으로 *실 사용자 분포* 수집 — 디바이스 다양성 반영.

### Instruments 워크플로
- **Time Profiler**: 메인 스레드 backtrace에 `SecItem*`, `NSUserDefaults synchronize`, `MOC save`가 보이면 즉시 백그라운드로.
- **Core Data instrument**: `fetch count`, `fault count`, `fetch duration`. fault 폭주 = `relationshipKeyPathsForPrefetching` 추가.
- **File Activity**: 예상 못한 read/write 위치 (이미지 캐시가 Documents에? 등).

### 함정
- **`UserDefaults.standard.synchronize()` 측정**: deprecated, 의미 없음. 측정해도 노이즈만.
- **첫 호출만 측정**: Core Data 첫 fetch는 store open 비용 포함. 분리해서 측정.
- **메인 스레드에서 dispatchSemaphore로 동기 대기**: 백그라운드로 옮긴 의미가 사라짐. async/await 또는 콜백.
- **로그 폭주가 측정값 망치기**: print() 자체가 수 ms. signpost는 release에서 0 비용에 가까움.

## 흔한 함정 / Follow-up

- **Q. UserDefaults에 10MB JSON 넣어도 되나?**
  기술적 가능, 사실상 금지. write 1건마다 전체 직렬화 → 수십 ms 메인 스레드 점유. 큰 데이터는 FileManager + JSON 파일.

- **Q. Core Data save를 메인 context에서 호출해도 되는 경우?**
  변경량이 작고 사용자 입력 직후라면 OK. 대량 import는 반드시 background context + `performBackgroundTask`.

- **Q. batch insert는 왜 viewContext에 자동 반영 안 되나?**
  context를 우회해서 SQLite에 직접 쓰기 때문. `NSManagedObjectContext.mergeChanges`로 수동 머지하거나, `NSPersistentStoreRemoteChangeNotification` 구독.

- **Q. SQLite WAL 모드가 뭐고 왜 켜나?**
  Write-Ahead Logging. read와 write가 서로 안 막힘 (다중 reader + 1 writer). Core Data는 iOS 7+ 기본 WAL.

- **Q. FileManager로 큰 파일 read 시 메모리 폭주는?**
  `.mappedIfSafe`로 mmap. OS가 페이지 단위 lazy load. 단, 파일이 동시에 변경되면 데이터 무결성 깨질 수 있음 → 읽기 전용 보장 시에만.

- **Q. Keychain을 1초에 100번 호출하면?**
  securityd 큐 적체 + 디스크 IO. 결과를 메모리 캐시 (단, 보안 정책 검토 — 락 화면 후 무효화 등).

- **Q. async I/O는 swift concurrency에서 어떻게?**
  공식 async file API는 제한적. `Task.detached`로 utility 큐로 옮기는 게 현재 표준. iOS 17+ `FileHandle.bytes` async sequence로 스트리밍 가능.

- **Q. hitch와 hang 차이?**
  hitch = 프레임 드랍 (frame deadline 미스, 보통 ms 단위). hang = 메인 스레드 ≥ 250ms 멈춤 (사용자 인지 가능). MetricKit이 둘 다 보고.

## 참고
- WWDC 2019 **Modernizing Grand Central Dispatch Usage**
- WWDC 2021 **Detect and diagnose hangs in the field** (MetricKit)
- WWDC 2019 **Making Apps with Core Data** — batch APIs
- Apple Docs: `os_signpost`, `MXMetricPayload`, `NSBatchInsertRequest`
- SQLite docs: WAL, transaction performance
