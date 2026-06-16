# 저장소 마이그레이션 전략 (UserDefaults · Keychain · Core Data · SwiftData)

> 한 줄 요약 — 마이그레이션은 *코드 변경*이 아니라 **사용자 데이터 보존**이 1차 목표. 점진적/원자적 선택, 실패 시 롤백 가능성, *읽기 호환성 윈도우*를 설계 단계에서 결정해야 한다.

## 핵심 개념

### 마이그레이션이 필요한 4가지 트리거
1. **스키마 변경**: 필드 추가/삭제/이름 변경 (Core Data, SwiftData)
2. **키/포맷 변경**: UserDefaults 키 리네이밍, JSON 구조 변경
3. **저장 위치 이동**: UserDefaults → Keychain (토큰을 뒤늦게 안전화)
4. **저장소 교체**: Core Data → SwiftData, 또는 SQLite → GRDB

### 점진적(progressive) vs 원자적(atomic)

| 항목 | 원자적 | 점진적 |
|---|---|---|
| 실행 시점 | 앱 시작 1회 | 데이터별 lazy |
| 사용자 경험 | 첫 실행 지연 ↑ | 매끄러움 |
| 실패 처리 | 전부 or 전무 → 롤백 쉬움 | 부분 실패 가능 → 양쪽 포맷 공존 |
| 코드 복잡도 | 낮음 | 높음 (양 포맷 read 핸들러 유지) |
| 적합 | 작은 데이터 (< 수 MB), 스키마 단순 | 큰 데이터, Core Data 다단계 |

### 호환성 윈도우
- "최소 N개 버전 *뒤로 읽기 가능*"을 명시. 예: v5 → v6 → v7일 때 v7도 v5 포맷 읽을 수 있게 한 버전 정도는.
- *왜*: 다운그레이드 / 백업 복원 / TestFlight 롤백 시나리오 대응.

## 비교 (저장소별 마이그레이션 메커니즘)

| 항목 | UserDefaults | Keychain | Core Data | SwiftData |
|---|---|---|---|---|
| 버전 메타데이터 | 직접 (`schemaVersion` 키) | 직접 | `NSPersistentStoreMetadata` | `VersionedSchema` |
| 자동 마이그레이션 | X | X | Lightweight (자동 추론) | `SchemaMigrationPlan` |
| 매핑 모델 | 직접 코드 | 직접 코드 | `.xcmappingmodel` + `NSEntityMigrationPolicy` | `MigrationStage.custom` |
| 점진적 가능 | 키 단위 lazy | 항목 단위 lazy | Progressive (다단계 v1→v2→v3) | Stage 분리 |
| 롤백 | 백업 키 보관 | 백업 키 보관 | Source store 백업 후 시도 | Stage 단위 |
| 실패 모드 | 키 누락 → 기본값 | item not found | crash 또는 store 못 엶 | crash |

## 코드 예시

### 1. UserDefaults 키 리네이밍 + 타입 변경

```swift
enum UserDefaultsMigration {
    static let currentVersion = 3
    static let versionKey = "_schemaVersion"

    static func run() {
        let d = UserDefaults.standard
        let from = d.integer(forKey: versionKey) // 미설정 = 0
        guard from < currentVersion else { return }

        if from < 1 { migrateV0toV1(d) }
        if from < 2 { migrateV1toV2(d) }
        if from < 3 { migrateV2toV3(d) }

        d.set(currentVersion, forKey: versionKey)
    }

    private static func migrateV0toV1(_ d: UserDefaults) {
        // "isDarkMode" Bool → "appearance" String
        if d.object(forKey: "isDarkMode") != nil {
            let dark = d.bool(forKey: "isDarkMode")
            d.set(dark ? "dark" : "light", forKey: "appearance")
            d.removeObject(forKey: "isDarkMode")
        }
    }
    private static func migrateV1toV2(_ d: UserDefaults) { /* ... */ }
    private static func migrateV2toV3(_ d: UserDefaults) { /* ... */ }
}
```
- *왜 다단계인가*: v0에서 v3으로 바로 가는 사용자, v2에서 v3으로 가는 사용자가 동시에 존재. **누적 적용**해야 모든 경로 커버.

### 2. UserDefaults → Keychain (토큰 이동)

```swift
enum TokenMigration {
    static func runIfNeeded() {
        let d = UserDefaults.standard
        guard let legacy = d.string(forKey: "accessToken") else { return }
        do {
            try Keychain.save(legacy, for: "accessToken")
            d.removeObject(forKey: "accessToken")  // 성공 후 제거
        } catch {
            // 실패 시 UserDefaults에 남겨두고 다음 부팅에 재시도
            Log.error("token migration failed: \(error)")
        }
    }
}
```
- *함정*: Keychain 저장 *실패 가능* (entitlement 누락, 디바이스 잠금 정책). 성공 확인 후에만 원본 삭제.

### 3. Core Data Lightweight Migration

```swift
let desc = NSPersistentStoreDescription(url: storeURL)
desc.shouldMigrateStoreAutomatically = true
desc.shouldInferMappingModelAutomatically = true   // Lightweight 핵심
container.persistentStoreDescriptions = [desc]
```
허용 변경: 속성 추가/삭제, 관계 추가/삭제, 엔티티 이름 변경(*Renaming ID* 지정), 속성 타입 변경(호환 시).

### 4. Core Data Heavyweight / Progressive

```swift
// v1 → v2 → v3 단계별 진행. 한 번에 v1 → v3 매핑 모델 만들지 말 것.
final class ProgressiveMigrator {
    func migrateStore(at url: URL, finalVersion: NSManagedObjectModel) throws {
        var current = try metadataModel(at: url)
        while !current.isConfiguration(withName: nil,
                                       compatibleWithStoreMetadata: try metadata(url)) {
            let next = try nextModel(after: current)
            let mapping = try NSMappingModel(from: nil,
                                             forSourceModel: current,
                                             destinationModel: next)
                ?? NSMappingModel.inferredMappingModel(forSourceModel: current,
                                                       destinationModel: next)
            let manager = NSMigrationManager(sourceModel: current, destinationModel: next)
            let tempURL = url.deletingLastPathComponent()
                             .appendingPathComponent("migration-\(UUID()).sqlite")
            try manager.migrateStore(from: url, sourceType: NSSQLiteStoreType,
                                     options: nil, with: mapping,
                                     toDestinationURL: tempURL,
                                     destinationType: NSSQLiteStoreType, destinationOptions: nil)
            try replaceStore(at: url, with: tempURL)
            current = next
        }
    }
}
```
- *왜 progressive*: v1 → v5 매핑 모델 N개 만들 필요 없이 v_n → v_{n+1}만 유지하면 됨.

### 5. SwiftData VersionedSchema (iOS 17+)

```swift
enum SchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)
    static var models: [any PersistentModel.Type] = [User.self]
    @Model final class User { var name: String = ""; init() {} }
}
enum SchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)
    static var models: [any PersistentModel.Type] = [User.self]
    @Model final class User { var firstName: String = ""; var lastName: String = ""; init() {} }
}
enum MigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] = [SchemaV1.self, SchemaV2.self]
    static var stages: [MigrationStage] = [migrateV1toV2]
    static let migrateV1toV2 = MigrationStage.custom(
        fromVersion: SchemaV1.self, toVersion: SchemaV2.self,
        willMigrate: nil,
        didMigrate: { context in
            let users = try context.fetch(FetchDescriptor<SchemaV2.User>())
            for u in users where u.firstName.isEmpty {
                let parts = u.lastName.split(separator: " ", maxSplits: 1)
                u.firstName = String(parts.first ?? "")
                u.lastName  = parts.count > 1 ? String(parts[1]) : ""
            }
        }
    )
}
let container = try ModelContainer(for: SchemaV2.User.self,
                                   migrationPlan: MigrationPlan.self)
```

## 측정 / 벤치마크

### 측정 항목
- **마이그레이션 소요 시간**: `signpost`로 시작/끝 구간 표시. 큰 Core Data는 100MB+에서 수십 초 가능.
- **실패율**: 분석 이벤트 `migration.attempt`, `migration.success`, `migration.failure` + 사유.
- **데이터 손실 검출**: 마이그레이션 직전 entity count → 직후 count 비교. 차이 > 임계치 → 알람.

### 런타임 패턴
- 큰 마이그레이션은 첫 화면 진입 전 **모달 진행률**로 보여줄 것. 백그라운드에서 silent 진행은 사용자 강제 종료 → 손상 위험.
- `Task.detached(priority: .userInitiated)`로 분리 + 진행률 publisher.

### 함정
- **시뮬레이터에서만 테스트**: 실제 디바이스의 디스크 IO는 5~10배 느림. 실기기 + 대용량 데이터로 측정 필수.
- **빈 DB 마이그레이션만 테스트**: 실 사용자 DB(수만 row, 관계 깊음)로 테스트해야 의미.

## 흔한 함정 / Follow-up

- **Q. Core Data Lightweight로 충분한지 판단 기준?**
  속성 추가/삭제, 관계 추가, 타입 호환 변경(Int16 → Int32)은 OK. **데이터 변환이 필요한 경우** (예: `fullName` → `firstName`+`lastName`) Lightweight 불가 → 매핑 모델 + `NSEntityMigrationPolicy`.

- **Q. v1 사용자가 v5 앱을 깐 경우 한 번에 가야 하나, 단계별로 가야 하나?**
  단계별 (Progressive). 매핑 모델은 *인접 버전쌍*만 유지. v1→v5 단일 매핑은 조합 폭발 + 디버깅 지옥.

- **Q. 마이그레이션 도중 앱이 죽으면?**
  Core Data는 source store를 *임시 파일에 복사 후* 마이그레이션 → 성공해야 교체. 죽으면 원본 살아 있음. SwiftData도 동일 의미론.

- **Q. Keychain 마이그레이션 시 `accessibility` 정책 변경은?**
  기존 항목을 read → 새 정책으로 add → old 삭제. *덮어쓰기로는 정책 변경 안 됨* (`SecItemUpdate`로 attribute 변경은 일부만 허용).

- **Q. App Group으로 UserDefaults를 옮긴다면?**
  `UserDefaults(suiteName:)`에 새로 쓰고, standard에서 read → suite로 write → standard에서 삭제. Watch/위젯과 공유한다면 양쪽 호환성 윈도우 필요.

- **Q. 롤백 시나리오는 어떻게 만드나?**
  1) 마이그레이션 전 store 백업 (`fileExtension = ".pre-v3.sqlite"`), 2) 성공 후 일정 부팅 횟수까지 보관, 3) 사용자가 다운그레이드/문제 신고 시 복원 경로 제공.

- **Q. 마이그레이션 실패를 user에게 어떻게 알리나?**
  무음 실패 금지. "데이터를 업데이트하지 못했습니다. 재시도 / 지원 문의" 다이얼로그. 강제로 fresh start 하면 사용자 데이터 손실 = 1성 리뷰 직행.

- **Q. JSON 파일을 직접 마이그레이션할 때 패턴?**
  파일 안에 `"_schema": N` 필드. read 시 분기, write는 항상 최신 버전. *읽기 호환 1버전 유지* 원칙.

## 참고
- WWDC 2023 **Migrate to SwiftData** (SchemaMigrationPlan, MigrationStage)
- Apple Docs: *Core Data Model Versioning and Data Migration Programming Guide*
- Marcus Zarra, *Core Data: Data Storage and Management* (Progressive migration 패턴)
- Apple Tech Note: `NSPersistentStoreCoordinator.migratePersistentStore`
