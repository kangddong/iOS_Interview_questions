# Core Data 마이그레이션

> 한 줄 요약 — 모델(스키마) 변경 시 *기존 store(SQLite)*를 새 모델로 옮기는 작업. **Lightweight → 매핑 모델 → 단계별(Progressive)**의 3가지 전략을 상황에 맞게 사용.

## 모델 버전과 식별자

`.xcdatamodeld`는 *컨테이너*. 그 안에 여러 `.xcdatamodel` 버전이 있고, 하나가 *Current*. 변경 전 다음 버전을 만들고 *current*로 표시한 뒤 수정.

`Show File Inspector` → Versioned Model: 이전 버전과의 매핑 정보가 들어감.

## 1) Lightweight Migration

다음 조건이면 Core Data가 자동 처리:

- 새 attribute 추가 (default value 지정)
- attribute 이름 변경 — `Renaming Identifier` 설정
- attribute 옵셔널 ↔ non-optional (default 있으면)
- 새 entity 추가 / relationship 추가

```swift
let desc = NSPersistentStoreDescription(url: url)
desc.shouldMigrateStoreAutomatically = true
desc.shouldInferMappingModelAutomatically = true
container.persistentStoreDescriptions = [desc]
```

대부분의 변경은 lightweight로 충분.

## 2) Heavyweight Migration — 매핑 모델

attribute 타입 변경, entity 분할/병합, 관계 구조 변경 같은 *추론 불가* 케이스. `Mapping Model (.xcmappingmodel)` 파일 생성:

- Source / Destination 모델 지정.
- 각 entity 매핑 (Copy, Custom, Add, Remove).
- 복잡한 변환은 `NSEntityMigrationPolicy` 서브클래스로 코드 작성.

```swift
let mappingModel = NSMappingModel(from: nil, forSourceModel: src, destinationModel: dst)!
let manager = NSMigrationManager(sourceModel: src, destinationModel: dst)
try manager.migrateStore(from: srcURL, sourceType: NSSQLiteStoreType, options: nil,
                         with: mappingModel, toDestinationURL: dstURL,
                         destinationType: NSSQLiteStoreType, destinationOptions: nil)
```

자동 추론 끄고 직접 실행하는 흐름.

## 3) Progressive Migration

여러 버전을 건너뛸 때 *한 번에 v1 → v5*가 안 되면, *v1 → v2 → v3 → ... → v5*를 순차 실행.

```swift
func migrate(storeAt url: URL, finalVersion: NSManagedObjectModel) throws {
    var currentURL = url
    while !currentURL.isCurrent(model: finalVersion) {
        let (next, mapping) = try findNextStep(from: currentURL)
        let dst = url.appending(path: ".tmp")
        let manager = NSMigrationManager(...)
        try manager.migrateStore(...)
        try replaceStore(at: currentURL, with: dst)
        currentURL = next
    }
}
```

각 단계에서 *모델 + 매핑*을 한 쌍으로 보관.

## 큰 데이터 / 백그라운드 처리

마이그레이션은 메인 스레드를 막을 수 있다.

- 앱 시작 시 마이그레이션이 길면 *스플래시*에 진행률 표시.
- `loadPersistentStores`의 completion에서 에러/시간 측정.
- 너무 큰 데이터는 *데이터 일부를 다른 store(SQLite/파일)*로 빼두는 설계 고려.

## CloudKit 동기화 시 마이그레이션

`NSPersistentCloudKitContainer` 사용 중이면:
- CloudKit 스키마(zone)도 변경 가능 — 단, Production 스키마는 *추가만* 가능 (삭제/타입 변경 불가).
- iCloud 동기화 중인 동안 마이그레이션 충돌 주의.

## 실무 절차

1. 새 모델 버전 생성 + Current 지정.
2. 변경 — 가능한 한 lightweight 가능 형태로.
3. 시뮬레이터/디바이스에 *이전 버전 데이터*로 시작해 마이그레이션 동작 확인.
4. *Production 데이터 샘플*로 한 번 더 — 시간/메모리 측정.
5. 출시 — 점진 롤아웃, 크래시 모니터링.

## 비교 — 마이그레이션 전략

| 전략 | 시점 | 케이스 |
|---|---|---|
| Lightweight | 자동 | 단순 추가/이름 |
| Heavyweight | 매핑 모델 작성 | 타입 변경, 분할/병합 |
| Progressive | 다단계 | 여러 버전 건너뜀 |
| Custom Code | 정책 클래스 | 복잡한 변환 |

## 흔한 함정 / Follow-up

- **Q. 앱이 시작 시 *Failed to load model*?**
  *current 모델*이 *store 모델*과 호환 안 됨. 매핑 모델 누락 또는 lightweight 추론 불가.

- **Q. 사용자 디바이스에서만 재현되는 마이그레이션 실패?**
  케이스: 일부 사용자 데이터가 *예전 버전*에서 오작동(orphan 관계, 비정상 NULL 등). 마이그레이션 정책에 *복구 로직* 또는 의심 데이터 정리.

- **Q. 마이그레이션 vs 새 store + import?**
  변경이 너무 크면 *새 store*를 만들고 데이터를 직접 이관. 사용자가 데이터를 전부 잃지 않도록 주의.

- **Q. SwiftData 마이그레이션?**
  내부적으로 Core Data 동일. `Schema`/`SchemaMigrationPlan`으로 표현. 단순 케이스는 자동.

- **Q. Realm/SQLite 마이그레이션과 다른 점?**
  Realm은 schemaVersion + migration block. SQLite/GRDB는 SQL ALTER. Core Data는 *모델 비교*가 입력이라 자동 추론이 가능한 영역이 더 큼.

## 참고

- Apple Docs: Core Data Model Versioning and Data Migration
- WWDC 2019: Making Apps with Core Data
- Marcus Zarra: Core Data 시리즈 (서적)
