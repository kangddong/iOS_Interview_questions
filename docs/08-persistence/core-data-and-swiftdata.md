# Core Data와 SwiftData

> 한 줄 요약 — Core Data는 **객체 그래프 + 영속화** 프레임워크(SQLite/in-memory store 위), SwiftData(iOS 17+)는 **Core Data를 Swift 매크로 문법으로 감싼 모던 wrapper**. 큰 그림은 같다.

## Core Data Stack

```
NSPersistentContainer
 ├── NSManagedObjectModel (.xcdatamodeld)
 ├── NSPersistentStoreCoordinator
 │     └── NSPersistentStore (SQLite 파일)
 └── NSManagedObjectContext (메모리 안의 객체 작업 공간)
```

- **Model**: 엔터티/속성/관계 정의.
- **PersistentStore**: 실제 디스크 저장소.
- **Context**: 메모리에서 가져온 객체를 다루는 *작업장*. 변경은 `save()`로 store에 반영.

## 가장 단순한 사용

```swift
let container = NSPersistentContainer(name: "Model")
container.loadPersistentStores { _, error in /* error 처리 */ }

let ctx = container.viewContext

// 추가
let user = User(context: ctx)
user.name = "kdy"

// 조회
let req: NSFetchRequest<User> = User.fetchRequest()
req.predicate = NSPredicate(format: "name CONTAINS[cd] %@", "kdy")
let results = try ctx.fetch(req)

try ctx.save()
```

## 메인 / 백그라운드 컨텍스트

```swift
let bg = container.newBackgroundContext()

bg.perform {
    let u = User(context: bg)
    u.name = "..."
    try? bg.save()
    // 이 변경이 viewContext에 자동 머지되도록 mergePolicy / 자동 머지 설정 필요
}
```

- **`viewContext`**: 메인 큐. UI 바인딩에 사용.
- **백그라운드 컨텍스트**: 무거운 import/sync.
- **변경 전파**: `NSManagedObjectContext.didSaveObjectsNotification` 또는 `automaticallyMergesChangesFromParent = true`.

## NSFetchedResultsController

테이블/컬렉션 뷰에 *자동 갱신되는 결과 집합* 제공. iOS 13+ DiffableDataSource와 결합 가능.

```swift
let frc = NSFetchedResultsController(
    fetchRequest: req,
    managedObjectContext: ctx,
    sectionNameKeyPath: nil,
    cacheName: nil
)
frc.delegate = self
try frc.performFetch()
```

## 마이그레이션

엔터티/속성을 바꾸면 store 스키마 ≠ 모델 → 크래시.

| 방식 | 설명 |
|---|---|
| **Lightweight** | 단순 추가/이름 변경. Apple이 자동. `shouldMigrateStoreAutomatically = true` |
| **Heavyweight** | 매핑 모델 직접 작성, 데이터 변환 로직 필요 |

배포 전 *모델 버전*을 남기는 습관(model versioning) 필수.

## SwiftData (iOS 17+)

```swift
@Model
final class User {
    var name: String
    var posts: [Post] = []
    init(name: String) { self.name = name }
}

@main
struct App: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .modelContainer(for: User.self)
    }
}

struct ContentView: View {
    @Environment(\.modelContext) private var ctx
    @Query var users: [User]
    var body: some View {
        List(users) { Text($0.name) }
        Button("add") { ctx.insert(User(name: "new")) }
    }
}
```

- 매크로 기반. `.xcdatamodeld` 없음. Swift 코드가 곧 모델.
- 내부적으로 Core Data 사용. CloudKit 동기화 옵션 동일.
- iOS 17 이상만.

## 비교 — Core Data vs SwiftData vs Realm vs SQLite/GRDB

| 구분 | Core Data | SwiftData | Realm | SQLite/GRDB |
|---|---|---|---|---|
| 학습 곡선 | 중상 | 낮음 (iOS 17+) | 중 | 중 |
| 관계/마이그레이션 | 강력 | 강력 (Core Data 그대로) | 강력 | 직접 SQL |
| iCloud 동기화 | NSPersistentCloudKitContainer | 옵션 | RealmSync | 직접 |
| Swift 통합 | 자동 generation | 매크로/Observation | 객체 모델 | wrapper |
| iOS 호환 | 매우 넓음 | iOS 17+ | 넓음 | 넓음 |
| 추천 | 호환성 필요 | 신규 17+ 앱 | 단순한 동기화 | 풀 컨트롤 |

## 흔한 함정 / Follow-up

- **Q. Core Data 객체를 다른 스레드에서 만지면?**
  크래시. 각 컨텍스트는 자기 큐 안에서만. `perform`/`performAndWait` 안에서 작업.

- **Q. `viewContext.save()`가 메인을 블록한다.**
  큰 변경은 백그라운드 컨텍스트에서 import 후 save → 머지. UI 작업과 분리.

- **Q. `NSFault`가 뭔가?**
  관계 객체를 *지연 로딩*하는 placeholder. 접근 시 실제 데이터 fetch. 반복 접근하면 N+1 쿼리 → `relationshipKeyPathsForPrefetching` 사용.

- **Q. SwiftData가 Core Data를 완전히 대체하나?**
  아직 일부 기능(고급 마이그레이션, `NSFetchedResultsController` 등)은 Core Data가 더 풍부. iOS 17 미만 호환이 필요하면 Core Data.

- **Q. 단순한 키-값 캐시면?**
  Core Data 과함. UserDefaults, 파일, 또는 작은 SQLite 충분.

- **Q. CloudKit 동기화의 한계?**
  계정 하나당 50GB 한도, 충돌 해결은 *마지막 쓰기 우선* 기본. 복잡한 도메인은 별도 동기화 설계 필요.

## 참고

- Apple Docs: Core Data, SwiftData
- WWDC 2023: Meet SwiftData / Build an app with SwiftData
- WWDC 2019: Core Data Best Practices
