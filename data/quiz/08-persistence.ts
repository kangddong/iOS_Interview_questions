import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ─── cache-strategy-and-invalidation (add: 4) ───────────────────────────

  {
    id: "objective-c08-basic-cache-strategy-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "캐시 신선도 정책 중 서버가 콘텐츠 해시를 발급하고 클라이언트가 304 응답을 받으면 본문을 재사용하는 방식은?",
    choices: [
      { id: "a", text: "ETag / If-None-Match" },
      { id: "b", text: "TTL (Time-To-Live)" },
      { id: "c", text: "LRU Eviction" },
      { id: "d", text: "stale-while-revalidate" },
    ],
    correctChoiceId: "a",
    explanation:
      "ETag/If-None-Match는 서버가 콘텐츠 해시(ETag)를 발급하면 클라이언트가 이후 요청에 If-None-Match 헤더로 그 값을 보내고, 내용이 바뀌지 않았다면 서버가 304를 반환해 본문 재전송 비용을 절약하는 방식입니다. TTL은 시간 기반, LRU는 공간 관리 정책, SWR은 stale 반환 + 백그라운드 갱신 패턴입니다.",
    relatedTopicSlugs: ["08-persistence/cache-strategy-and-invalidation"],
  },
  {
    id: "objective-c08-intermediate-cache-strategy-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "stale-while-revalidate(SWR) 패턴의 동작으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "캐시가 stale 상태이면 즉시 네트워크 fetch를 차단하고 새 데이터를 기다린 후 반환한다.",
      },
      {
        id: "b",
        text: "캐시가 stale이면 기존 캐시를 즉시 반환하고 백그라운드에서 revalidate를 수행한다.",
      },
      {
        id: "c",
        text: "캐시가 fresh이면 백그라운드 revalidate를 트리거하고 stale이면 아무것도 반환하지 않는다.",
      },
      {
        id: "d",
        text: "캐시가 없을 때도 과거 세션의 stale 데이터를 영구 저장소에서 복원해 반환한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "SWR에서 stale 상태의 캐시 데이터가 있으면 사용자에게 즉시 반환하고(인지 지연 0), 동시에 백그라운드에서 revalidate를 수행해 다음 읽기 때 최신 데이터를 사용하게 합니다. 단, 결제·잔고처럼 stale 허용이 불가한 데이터에는 부적합합니다.",
    relatedTopicSlugs: ["08-persistence/cache-strategy-and-invalidation"],
  },
  {
    id: "objective-c08-intermediate-cache-strategy-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "LRU(Least Recently Used) 캐시가 대량 스캔(무한 스크롤 등)에 약한 이유는?",
    choices: [
      {
        id: "a",
        text: "O(n) 시간 복잡도로 아이템을 순회하기 때문에 읽기 성능이 저하된다.",
      },
      {
        id: "b",
        text: "스캔으로 인해 모든 아이템이 한 번씩 참조되면 자주 쓰는 핫 아이템이 evict될 수 있다.",
      },
      {
        id: "c",
        text: "사용 빈도를 카운팅하는 데 추가 메모리가 필요해 용량이 줄어든다.",
      },
      {
        id: "d",
        text: "TTL 정책과 충돌하여 fresh 아이템이 우선 evict된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "LRU는 '가장 오래 사용하지 않은 항목'을 evict합니다. 무한 스크롤처럼 모든 아이템을 한 번씩 훑으면, 실제로 자주 열람하는 핫 아이템이 최근 사용에서 밀려나 evict됩니다(cache pollution). LFU, 2Q, TinyLFU가 이 시나리오에 강합니다.",
    relatedTopicSlugs: ["08-persistence/cache-strategy-and-invalidation"],
  },
  {
    id: "objective-c08-advanced-cache-strategy-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "ARC(Adaptive Replacement Cache)가 LRU나 LFU 대비 갖는 핵심 장점은?",
    choices: [
      { id: "a", text: "단일 자료구조(해시)만 사용해 메모리 오버헤드가 가장 낮다." },
      {
        id: "b",
        text: "T1/T2/B1/B2 네 개의 리스트로 시간 지역성과 빈도 지역성 모두를 적응적으로 관리한다.",
      },
      {
        id: "c",
        text: "운영체제가 직접 eviction 순서를 보장하므로 앱 레벨 구현이 불필요하다.",
      },
      {
        id: "d",
        text: "TTL을 기반으로 만료된 항목을 자동으로 제거해 신선도를 유지한다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "ARC는 T1(최근 1회 접근), T2(2회 이상 접근), B1/B2(evict된 항목의 ghost 리스트) 네 개를 동적으로 조정해 워크로드 변화에 강합니다. LRU는 시간 지역성, LFU는 빈도 지역성 하나씩만 고려하는 반면 ARC는 둘을 적응적으로 결합합니다. 구현이 복잡한 것이 단점입니다.",
    relatedTopicSlugs: ["08-persistence/cache-strategy-and-invalidation"],
  },

  // ─── core-data-and-swiftdata (add: 2) ───────────────────────────────────

  {
    id: "objective-c08-basic-core-data-swiftdata-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "Core Data의 `NSManagedObjectContext`에 대한 설명으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "실제 SQLite 파일과 직접 대응하는 영속 저장소 객체다.",
      },
      {
        id: "b",
        text: "메모리 안에서 객체를 다루는 작업 공간이며, `save()`를 호출해야 변경이 store에 반영된다.",
      },
      {
        id: "c",
        text: "엔터티·속성·관계를 정의하는 모델 스키마 파일이다.",
      },
      {
        id: "d",
        text: "UI 렌더링 사이클에 맞춰 자동으로 flush되는 캐시다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "`NSManagedObjectContext`는 메모리상의 작업 공간입니다. 객체를 생성·수정해도 `save()`를 호출하기 전까지는 `NSPersistentStore`(SQLite 파일)에 반영되지 않습니다. 실제 파일은 `NSPersistentStore`, 스키마는 `NSManagedObjectModel(.xcdatamodeld)`입니다.",
    relatedTopicSlugs: ["08-persistence/core-data-and-swiftdata"],
  },
  {
    id: "objective-c08-intermediate-core-data-swiftdata-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "SwiftData(iOS 17+)에서 Core Data와 비교했을 때의 특징으로 올바른 것은?",
    choices: [
      { id: "a", text: "`.xcdatamodeld` 파일이 필수이며 매크로는 보조 수단이다." },
      {
        id: "b",
        text: "내부적으로 Core Data를 사용하며, `@Model` 매크로로 Swift 코드 자체가 모델이 된다.",
      },
      {
        id: "c",
        text: "SQLite 대신 별도의 바이너리 포맷을 사용해 더 빠른 read를 제공한다.",
      },
      {
        id: "d",
        text: "CloudKit 동기화를 지원하지 않으며 로컬 전용 저장소다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "SwiftData는 내부적으로 Core Data 위에서 동작하는 매크로 기반 추상화입니다. `.xcdatamodeld` 없이 `@Model` 매크로만으로 모델을 정의하며, CloudKit 동기화도 동일하게 지원합니다. iOS 17 이상에서만 사용 가능합니다.",
    relatedTopicSlugs: ["08-persistence/core-data-and-swiftdata"],
  },

  // ─── core-data-migration (add: 4) ────────────────────────────────────────

  {
    id: "objective-c08-basic-core-data-migration-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "Core Data Lightweight Migration이 자동 처리할 수 있는 변경은?",
    choices: [
      { id: "a", text: "attribute 타입을 String에서 Int32로 변경" },
      { id: "b", text: "entity를 두 개로 분할하는 구조 변경" },
      { id: "c", text: "새 attribute 추가 (기본값 지정)" },
      { id: "d", text: "관계의 delete rule을 Cascade에서 Nullify로 변경" },
    ],
    correctChoiceId: "c",
    explanation:
      "Lightweight Migration은 '새 attribute 추가(기본값 있음)', 'attribute 이름 변경(Renaming Identifier 설정)', '관계 추가', '새 entity 추가'처럼 Core Data가 자동 추론 가능한 단순 변경만 처리합니다. 타입 변경이나 entity 분할은 매핑 모델이 필요한 Heavyweight Migration 영역입니다.",
    relatedTopicSlugs: ["08-persistence/core-data-migration"],
  },
  {
    id: "objective-c08-intermediate-core-data-migration-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "Core Data Heavyweight Migration에서 복잡한 데이터 변환 로직을 작성할 때 사용하는 클래스는?",
    choices: [
      { id: "a", text: "NSMigrationManager" },
      { id: "b", text: "NSEntityMigrationPolicy" },
      { id: "c", text: "NSPersistentStoreCoordinator" },
      { id: "d", text: "NSManagedObjectModel" },
    ],
    correctChoiceId: "b",
    explanation:
      "`NSEntityMigrationPolicy`를 서브클래싱하면 매핑 모델의 각 entity 매핑 단계에서 커스텀 Swift/Obj-C 변환 코드를 작성할 수 있습니다. `NSMigrationManager`는 마이그레이션 실행 엔진이고, `NSPersistentStoreCoordinator`는 store 관리자이며, `NSManagedObjectModel`은 스키마 정의입니다.",
    relatedTopicSlugs: ["08-persistence/core-data-migration"],
  },
  {
    id: "objective-c08-intermediate-core-data-migration-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "Progressive Migration(단계적 마이그레이션)을 사용하는 주된 이유는?",
    choices: [
      {
        id: "a",
        text: "Lightweight 추론이 각 버전 간에 자동으로 활성화되어 매핑 모델이 불필요하기 때문이다.",
      },
      {
        id: "b",
        text: "여러 버전을 건너뛸 때 인접 버전 쌍(v_n → v_{n+1})만 유지하면 모든 경로를 커버할 수 있기 때문이다.",
      },
      {
        id: "c",
        text: "백그라운드 스레드에서 자동으로 실행되어 메인 스레드 블로킹이 없기 때문이다.",
      },
      {
        id: "d",
        text: "CloudKit 스키마와 동기화를 위해 Apple이 강제하는 방식이기 때문이다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "v1에서 v5로 한 번에 마이그레이션하는 매핑 모델을 만들면 버전 조합이 폭발적으로 늘어납니다. Progressive Migration은 v1→v2, v2→v3처럼 인접 버전 쌍만 유지하고 순차 실행해 모든 설치 경로를 커버합니다.",
    relatedTopicSlugs: ["08-persistence/core-data-migration"],
  },
  {
    id: "objective-c08-advanced-core-data-migration-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "`NSPersistentCloudKitContainer` 사용 중 마이그레이션 시 CloudKit 스키마(Production zone)에 대한 제약으로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "Production 스키마는 필드 추가·삭제·타입 변경이 모두 자유롭게 허용된다.",
      },
      {
        id: "b",
        text: "Production 스키마는 레코드 타입 추가만 가능하며, 삭제나 타입 변경은 불가하다.",
      },
      {
        id: "c",
        text: "마이그레이션 완료 후 CloudKit 스키마도 자동으로 동기화되어 별도 작업이 필요 없다.",
      },
      {
        id: "d",
        text: "Development 스키마는 변경 불가하고 Production 스키마만 수정 가능하다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "CloudKit의 Production 스키마는 레코드 타입(entity)과 필드(attribute) 추가만 가능합니다. 기존 필드 삭제나 타입 변경은 Production 환경에서 허용되지 않아, Core Data 쪽 모델 변경과 CloudKit 스키마 변경 계획을 반드시 함께 고려해야 합니다.",
    relatedTopicSlugs: ["08-persistence/core-data-migration"],
  },

  // ─── file-manager (add: 4) ───────────────────────────────────────────────

  {
    id: "objective-c08-basic-file-manager-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "iOS 샌드박스 디렉토리 중 iCloud 백업 대상이 아니며, OS가 디스크 압박 시 자동으로 삭제할 수 있는 디렉토리는?",
    choices: [
      { id: "a", text: "Documents/" },
      { id: "b", text: "Library/Application Support/" },
      { id: "c", text: "Library/Caches/" },
      { id: "d", text: "Library/Preferences/" },
    ],
    correctChoiceId: "c",
    explanation:
      "`Library/Caches/`는 iCloud 백업 대상이 아니고, 디스크 압박 시 OS가 자동 삭제할 수 있습니다. 따라서 항상 다시 받을 수 있는 캐시 데이터를 두기에 적합합니다. `Documents/`와 `Library/Application Support/`는 iCloud 백업 대상이며 OS가 자동으로 삭제하지 않습니다.",
    relatedTopicSlugs: ["08-persistence/file-manager"],
  },
  {
    id: "objective-c08-basic-file-manager-002",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "`Data.write(to:options:)`에서 `.atomic` 옵션을 사용하는 이유는?",
    choices: [
      { id: "a", text: "쓰기 속도를 높이기 위해 메모리 버퍼를 직접 플러시한다." },
      {
        id: "b",
        text: "임시 파일에 먼저 쓰고 완료 후 rename하여 크래시 중 반쪽짜리 파일이 남지 않도록 한다.",
      },
      { id: "c", text: "파일을 iCloud 백업에서 제외하는 플래그를 설정한다." },
      { id: "d", text: "여러 스레드에서 동시에 쓸 때 락을 자동으로 획득한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "`.atomic`은 임시 파일에 데이터를 쓴 후 원자적으로 rename하는 방식을 사용합니다. 따라서 쓰기 도중 앱이 크래시 나더라도 원본 파일이 손상되지 않고 온전하게 유지됩니다. 단, 큰 파일에선 디스크 IO 비용이 2배가 됩니다.",
    relatedTopicSlugs: ["08-persistence/file-manager"],
  },
  {
    id: "objective-c08-intermediate-file-manager-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "앱 그룹(App Group)을 사용해 위젯과 파일을 공유할 때 올바른 경로 획득 방법은?",
    choices: [
      {
        id: "a",
        text: "`FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)`",
      },
      {
        id: "b",
        text: "`FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: \"group.io.app\")`",
      },
      {
        id: "c",
        text: "`URL(fileURLWithPath: NSTemporaryDirectory())`",
      },
      {
        id: "d",
        text: "`FileManager.default.urls(for: .cachesDirectory, in: .sharedUserDomainMask)`",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "앱 그룹 컨테이너에 접근하려면 `FileManager.default.containerURL(forSecurityApplicationGroupIdentifier:)`를 사용합니다. 이 경로는 메인 앱과 위젯·공유 익스텐션이 모두 접근 가능한 공용 컨테이너입니다.",
    relatedTopicSlugs: ["08-persistence/file-manager"],
  },
  {
    id: "objective-c08-intermediate-file-manager-004",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "큰 파일을 Documents에 두었을 때 발생하는 주요 문제는?",
    choices: [
      {
        id: "a",
        text: "OS가 메모리 압박 시 Documents 파일을 자동 삭제해 데이터 손실이 발생한다.",
      },
      {
        id: "b",
        text: "iCloud 백업 대상이 되어 사용자 백업 용량을 잡아먹고 동기화 시간이 증가한다.",
      },
      {
        id: "c",
        text: "Documents 디렉토리는 샌드박스 외부에 있어 다른 앱이 접근할 수 있다.",
      },
      {
        id: "d",
        text: "파일 크기가 1GB를 초과하면 iOS가 자동으로 압축해 원본 데이터가 변형된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Documents/는 iCloud 백업 대상이므로 큰 캐시 파일을 여기에 두면 사용자의 5GB 무료 iCloud 용량이 빠르게 소진되고 백업/복원 시간이 길어집니다. 재다운로드 가능한 캐시는 Library/Caches/에 두어야 합니다.",
    relatedTopicSlugs: ["08-persistence/file-manager"],
  },

  // ─── keychain (add: 3) ───────────────────────────────────────────────────

  {
    id: "objective-c08-basic-keychain-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "Keychain의 `kSecAttrAccessibleAfterFirstUnlock` 정책이 적합한 상황은?",
    choices: [
      {
        id: "a",
        text: "디바이스가 잠겨 있는 동안에도 백그라운드 작업에서 토큰을 읽어야 할 때",
      },
      {
        id: "b",
        text: "앱이 포그라운드에서 실행 중일 때만 민감 데이터에 접근해야 할 때",
      },
      {
        id: "c",
        text: "Face ID 인증을 통해서만 결제 시크릿에 접근할 때",
      },
      {
        id: "d",
        text: "아이클라우드 키체인으로 다른 기기에 동기화해야 할 때",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`kSecAttrAccessibleAfterFirstUnlock`은 재부팅 후 한 번 잠금 해제되면 이후 잠긴 상태에서도 백그라운드 접근이 가능합니다. 주기적 토큰 갱신 같은 백그라운드 작업에 적합합니다. 잠금 중 완전 차단이 필요하면 `kSecAttrAccessibleWhenUnlocked`를 사용합니다.",
    relatedTopicSlugs: ["08-persistence/keychain"],
  },
  {
    id: "objective-c08-intermediate-keychain-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "앱을 삭제 후 재설치했을 때 Keychain 아이템이 남아 있는 것을 감지해 초기화하는 일반적인 패턴은?",
    choices: [
      {
        id: "a",
        text: "앱 첫 실행 시 UserDefaults에 설치 플래그를 확인하고, 없으면 Keychain을 청소한다.",
      },
      {
        id: "b",
        text: "앱 삭제 시 시스템이 호출하는 `applicationWillTerminate`에서 Keychain을 삭제한다.",
      },
      {
        id: "c",
        text: "`kSecAttrSynchronizable = true`를 설정해 iCloud에서 자동으로 정리한다.",
      },
      {
        id: "d",
        text: "Keychain 항목에 TTL을 설정해 일정 시간 후 자동 만료되도록 한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "iOS는 앱 삭제 시 기본적으로 Keychain 항목을 지우지 않습니다. 일반적인 해결책은 첫 실행 시 UserDefaults에 '설치 완료' 플래그가 없으면 신규 설치로 판단하고 이전 Keychain 데이터를 청소하는 패턴입니다. 앱이 종료될 때 삭제하는 방법은 삭제 사이에 정상 종료를 보장할 수 없어 신뢰할 수 없습니다.",
    relatedTopicSlugs: ["08-persistence/keychain"],
  },
  {
    id: "objective-c08-advanced-keychain-003",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "Keychain에 `SecAccessControlCreateWithFlags`로 `.biometryCurrentSet` 플래그를 설정했을 때의 동작은?",
    choices: [
      {
        id: "a",
        text: "Face ID나 Touch ID가 등록된 경우에만 항목을 저장할 수 있고, 읽기 시마다 생체 인증 프롬프트가 나타난다.",
      },
      {
        id: "b",
        text: "등록된 지문이 변경(추가·제거)되어도 기존 항목에 계속 접근할 수 있다.",
      },
      {
        id: "c",
        text: "생체 인증 실패 시 자동으로 passcode 입력으로 폴백해 항목에 접근한다.",
      },
      {
        id: "d",
        text: "iCloud Keychain을 통해 다른 기기에서도 생체 인증으로 접근할 수 있다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`.biometryCurrentSet`은 항목 저장 시점의 생체 정보 집합을 고정합니다. 이후 지문이 추가되거나 Face ID 등록이 변경되면 해당 항목에 접근할 수 없게 됩니다(보안 강화). 읽기 때마다 생체 인증 프롬프트가 표시되며, 인증 실패 시 passcode 폴백은 별도 플래그(`.userPresence`)를 써야 합니다.",
    relatedTopicSlugs: ["08-persistence/keychain"],
  },

  // ─── memory-and-disk-cache (add: 4) ─────────────────────────────────────

  {
    id: "objective-c08-basic-memory-disk-cache-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "`NSCache`가 `Dictionary`보다 이미지 캐시에 적합한 주요 이유는?",
    choices: [
      { id: "a", text: "NSCache는 키로 값 타입(struct)을 직접 사용할 수 있어 편리하다." },
      {
        id: "b",
        text: "메모리 압박 시 OS가 자동으로 항목을 해제하고, 별도 락 없이 thread-safe하다.",
      },
      { id: "c", text: "NSCache는 LRU 순서를 문서화된 방식으로 보장해 예측 가능한 eviction을 제공한다." },
      { id: "d", text: "NSCache는 디스크에도 자동으로 백업해 앱 재시작 후에도 데이터가 유지된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "NSCache는 메모리 압박이 오면 OS가 자동으로 항목을 제거해주고(Dictionary는 수동 관리 필요), 내부적으로 thread-safe합니다. 단, eviction 순서는 문서화되어 있지 않아 LRU가 보장되지 않으며, 디스크에 백업되지 않아 앱 재시작 시 사라집니다.",
    relatedTopicSlugs: ["08-persistence/memory-and-disk-cache"],
  },
  {
    id: "objective-c08-intermediate-memory-disk-cache-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "2-tier 이미지 캐시(Memory + Disk)에서 디스크 캐시 히트 시 올바른 처리 순서는?",
    choices: [
      {
        id: "a",
        text: "디스크에서 Data 로드 → UIImage 생성 → NSCache에 저장 → 반환",
      },
      {
        id: "b",
        text: "디스크에서 UIImage 직접 로드 → 반환 (NSCache 갱신 불필요)",
      },
      {
        id: "c",
        text: "디스크 히트를 캐시 미스로 처리하고 네트워크에서 새로 다운로드",
      },
      {
        id: "d",
        text: "NSCache에 저장 → 디스크에서 Data 로드 → UIImage 생성 → 반환",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "2-tier 패턴에서 L2(디스크) 히트 시 디스크에서 Data를 읽고 UIImage로 디코딩한 후 L1(NSCache)에 저장해 이후 동일 키 요청은 L1에서 빠르게 반환되도록(promote) 합니다. NSCache에 먼저 저장하는 것은 순서가 맞지 않습니다.",
    relatedTopicSlugs: ["08-persistence/memory-and-disk-cache"],
  },
  {
    id: "objective-c08-intermediate-memory-disk-cache-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "URLCache를 직접 만든 이미지 캐시 대신 사용할 때의 한계는?",
    choices: [
      { id: "a", text: "POST 요청도 자동으로 캐시해 중복 쓰기가 발생할 수 있다." },
      {
        id: "b",
        text: "HTTP 응답 Data를 그대로 저장하므로, 디코딩된 UIImage 형태로 보관할 수 없어 매번 디코딩 비용이 든다.",
      },
      { id: "c", text: "메모리만 사용하고 디스크 캐시가 없어 앱 재시작 시 데이터가 사라진다." },
      { id: "d", text: "ETag 헤더를 지원하지 않아 조건부 요청(304)을 처리할 수 없다." },
    ],
    correctChoiceId: "b",
    explanation:
      "URLCache는 HTTP 응답을 Data 그대로 캐시합니다. UIImage를 꺼낼 때마다 `UIImage(data:)` 디코딩이 필요하고, GPU 업로드 비용도 매번 발생합니다. 스크롤 hitch를 없애려면 디코딩된 `UIImage`를 NSCache에 별도 보관해야 합니다.",
    relatedTopicSlugs: ["08-persistence/memory-and-disk-cache"],
  },
  {
    id: "objective-c08-advanced-memory-disk-cache-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "NSCache의 `totalCostLimit`에 이미지 비용을 정확히 설정하려면 어떻게 계산해야 하는가?",
    choices: [
      { id: "a", text: "PNG/JPEG 파일 크기(bytes)를 그대로 cost로 사용한다." },
      {
        id: "b",
        text: "디코딩된 픽셀 크기(`width × height × 4 bytes`)를 cost로 사용한다.",
      },
      { id: "c", text: "이미지 파일 이름 문자열 길이를 cost로 사용한다." },
      { id: "d", text: "cost는 eviction 순서에 영향을 주지 않으므로 1로 고정해도 된다." },
    ],
    correctChoiceId: "b",
    explanation:
      "NSCache의 cost는 실제 메모리 점유를 반영해야 합니다. JPEG/PNG 압축 파일 크기가 아니라, 디코딩 후 RAM에 올라가는 픽셀 버퍼(`width × height × 4 bytes` = ARGB 기준)를 cost로 설정해야 `totalCostLimit`이 실제 메모리 제한으로 작동합니다.",
    relatedTopicSlugs: ["08-persistence/memory-and-disk-cache"],
  },

  // ─── migration-strategy (add: 4) ─────────────────────────────────────────

  {
    id: "objective-c08-basic-migration-strategy-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "저장소 마이그레이션이 필요한 트리거로 올바르지 않은 것은?",
    choices: [
      { id: "a", text: "UserDefaults 키 이름 변경" },
      { id: "b", text: "Core Data 스키마 필드 추가" },
      { id: "c", text: "앱 아이콘 이미지 교체" },
      { id: "d", text: "토큰 저장소를 UserDefaults에서 Keychain으로 이동" },
    ],
    correctChoiceId: "c",
    explanation:
      "앱 아이콘 변경은 UI 에셋 변경이므로 저장소 마이그레이션과 무관합니다. 저장소 마이그레이션이 필요한 트리거는 스키마 변경(필드 추가/삭제/이름 변경), 키/포맷 변경, 저장 위치 이동, 저장소 교체 등입니다.",
    relatedTopicSlugs: ["08-persistence/migration-strategy"],
  },
  {
    id: "objective-c08-intermediate-migration-strategy-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "UserDefaults → Keychain으로 토큰을 마이그레이션할 때 안전한 순서는?",
    choices: [
      {
        id: "a",
        text: "UserDefaults에서 토큰을 삭제 → Keychain에 저장 → 성공 확인",
      },
      {
        id: "b",
        text: "Keychain에 저장 성공을 확인 → UserDefaults에서 토큰 삭제",
      },
      {
        id: "c",
        text: "Keychain에 저장과 UserDefaults 삭제를 동시에 실행 후 하나라도 실패하면 롤백",
      },
      {
        id: "d",
        text: "앱 재시작 시마다 양쪽 모두에 항상 최신 토큰을 동기화",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "Keychain 저장은 entitlement 누락이나 잠금 정책으로 실패할 수 있습니다. 먼저 Keychain 저장 성공을 확인한 뒤에만 UserDefaults에서 원본을 삭제해야 합니다. 실패 시 UserDefaults의 원본이 살아있어 다음 부팅에 재시도할 수 있습니다.",
    relatedTopicSlugs: ["08-persistence/migration-strategy"],
  },
  {
    id: "objective-c08-intermediate-migration-strategy-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "SwiftData에서 `VersionedSchema`와 `SchemaMigrationPlan`을 사용하는 목적은?",
    choices: [
      {
        id: "a",
        text: "Core Data `.xcdatamodeld` 파일을 자동 생성하기 위해",
      },
      {
        id: "b",
        text: "스키마 버전별로 마이그레이션 단계를 선언적으로 정의하고 자동/커스텀 변환을 지원하기 위해",
      },
      {
        id: "c",
        text: "CloudKit 동기화를 활성화하기 위한 필수 설정이기 때문에",
      },
      {
        id: "d",
        text: "SQLite WAL 모드를 켜기 위한 설정 진입점이기 때문에",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "`VersionedSchema`는 각 스키마 버전을 타입으로 표현하고, `SchemaMigrationPlan`은 버전 간 이동 단계(`MigrationStage.lightweight` 또는 `.custom`)를 선언합니다. iOS 17+에서 SwiftData 마이그레이션을 체계적으로 관리하는 방법입니다.",
    relatedTopicSlugs: ["08-persistence/migration-strategy"],
  },
  {
    id: "objective-c08-advanced-migration-strategy-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "원자적(atomic) 마이그레이션과 점진적(progressive) 마이그레이션의 트레이드오프로 올바른 것은?",
    choices: [
      {
        id: "a",
        text: "원자적은 앱 시작 지연이 크지만 롤백이 쉽고, 점진적은 매끄럽지만 양쪽 포맷 처리 코드를 동시에 유지해야 한다.",
      },
      {
        id: "b",
        text: "원자적은 대용량 Core Data에 권장되고, 점진적은 작은 UserDefaults에만 적합하다.",
      },
      {
        id: "c",
        text: "점진적 마이그레이션은 데이터 손실이 발생할 수 있어 원자적보다 안전하지 않다.",
      },
      {
        id: "d",
        text: "두 방식 모두 백그라운드에서 자동으로 실행되므로 UI 차단이 발생하지 않는다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "원자적 마이그레이션은 앱 시작 1회에 전체를 처리해 롤백 설계가 단순하지만 첫 실행 지연이 발생합니다. 점진적 마이그레이션은 데이터별 lazy 처리로 UX가 매끄럽지만 이전·새 포맷 양쪽을 읽을 수 있는 코드를 일정 기간 동시에 유지해야 하는 코드 복잡도가 있습니다.",
    relatedTopicSlugs: ["08-persistence/migration-strategy"],
  },

  // ─── persistence-performance (add: 4) ────────────────────────────────────

  {
    id: "objective-c08-basic-persistence-performance-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "Keychain 읽기(SecItemCopyMatching)를 메인 스레드에서 호출하면 안 되는 이유는?",
    choices: [
      { id: "a", text: "Keychain API가 Swift Concurrency(async/await)만 지원하기 때문이다." },
      {
        id: "b",
        text: "securityd 데몬과 XPC 왕복이 발생해 수 ms의 지연이 생겨 UI hitch 원인이 된다.",
      },
      { id: "c", text: "Keychain 항목 접근에는 특별한 런루프가 필요해 메인 큐에서 동작하지 않는다." },
      { id: "d", text: "메인 스레드에서 호출 시 entitlement 검증이 실패한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "Keychain 접근은 내부적으로 securityd 데몬과 XPC 통신을 하며 디스크 IO까지 포함해 1회에 수 ms가 소요됩니다(UserDefaults 대비 100~1000배). 메인 스레드에서 반복 호출하면 UI hitch/hang이 발생하므로 `Task.detached`나 백그라운드 큐에서 호출해야 합니다.",
    relatedTopicSlugs: ["08-persistence/persistence-performance"],
  },
  {
    id: "objective-c08-intermediate-persistence-performance-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "Core Data에서 수만 건 데이터를 빠르게 삽입할 때 권장되는 API는?",
    choices: [
      { id: "a", text: "반복문으로 `NSEntityDescription.insertNewObject` 호출" },
      { id: "b", text: "`NSBatchInsertRequest`로 SQLite에 직접 삽입" },
      { id: "c", text: "`viewContext.save()`를 1,000건마다 호출" },
      { id: "d", text: "Core Data 대신 UserDefaults에 배열로 저장" },
    ],
    correctChoiceId: "b",
    explanation:
      "`NSBatchInsertRequest`는 context를 거치지 않고 SQLite에 직접 쓰기 때문에 수만 건을 수백 ms 내에 처리할 수 있습니다. 일반 `insertNewObject` 반복은 context 메모리 사용량 폭증과 수십 초 소요 문제가 있습니다. 단, batch 연산 후에는 `NSManagedObjectContext.mergeChanges`로 수동 머지가 필요합니다.",
    relatedTopicSlugs: ["08-persistence/persistence-performance"],
  },
  {
    id: "objective-c08-intermediate-persistence-performance-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "SQLite WAL(Write-Ahead Logging) 모드를 사용하는 핵심 이점은?",
    choices: [
      { id: "a", text: "쓰기 작업이 완료될 때까지 읽기 작업이 차단되어 데이터 일관성이 보장된다." },
      {
        id: "b",
        text: "다중 reader와 단일 writer가 서로 차단 없이 동시에 동작할 수 있다.",
      },
      { id: "c", text: "트랜잭션 없이 row별 개별 커밋이 가능해 지연 시간이 줄어든다." },
      { id: "d", text: "메모리에만 저장하고 앱 종료 시 디스크에 일괄 flush해 속도를 높인다." },
    ],
    correctChoiceId: "b",
    explanation:
      "WAL 모드에서는 변경 사항을 별도의 WAL 파일에 먼저 기록해, 읽기와 쓰기가 서로 차단하지 않고 동시에 진행할 수 있습니다(다중 reader + 1 writer). Core Data는 iOS 7+에서 기본으로 WAL 모드를 사용합니다.",
    relatedTopicSlugs: ["08-persistence/persistence-performance"],
  },
  {
    id: "objective-c08-advanced-persistence-performance-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "저장소 성능을 측정할 때 시뮬레이터 대신 실기기를 사용해야 하는 이유는?",
    choices: [
      { id: "a", text: "시뮬레이터는 ARM 아키텍처를 지원하지 않아 SQLite 성능이 다르다." },
      {
        id: "b",
        text: "시뮬레이터는 Mac 디스크 IO를 사용해 실제 디바이스 NAND 플래시 대비 5~10배 빠를 수 있어 측정값이 무의미하다.",
      },
      { id: "c", text: "시뮬레이터에서는 Keychain API가 완전히 비활성화된다." },
      { id: "d", text: "시뮬레이터는 멀티스레드 Core Data 접근을 허용하지 않는다." },
    ],
    correctChoiceId: "b",
    explanation:
      "시뮬레이터는 Mac의 SSD를 사용하므로 실제 iOS 디바이스의 NAND 플래시 IO보다 훨씬 빠릅니다. 특히 구형 디바이스에서는 5~10배 이상 차이가 납니다. Release 빌드 + 실기기 + 현실적 데이터 규모로 측정해야 의미 있는 성능 수치를 얻을 수 있습니다.",
    relatedTopicSlugs: ["08-persistence/persistence-performance"],
  },

  // ─── storage-selection-guide (add: 4) ────────────────────────────────────

  {
    id: "objective-c08-basic-storage-selection-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "다음 중 Keychain에 저장해야 하는 데이터는?",
    choices: [
      { id: "a", text: "사용자가 선택한 앱 테마(다크/라이트)" },
      { id: "b", text: "OAuth 액세스 토큰" },
      { id: "c", text: "앱 내 튜토리얼 완료 여부 플래그" },
      { id: "d", text: "사용자가 마지막으로 본 뉴스 기사 ID" },
    ],
    correctChoiceId: "b",
    explanation:
      "OAuth 액세스 토큰은 민감 정보이므로 반드시 Keychain에 저장해야 합니다. UserDefaults는 plist 평문 저장이라 탈옥 환경이나 백업 검사로 노출될 수 있습니다. 테마, 튜토리얼 플래그, 최근 본 기사 ID 같은 비민감 설정값은 UserDefaults가 적합합니다.",
    relatedTopicSlugs: ["08-persistence/storage-selection-guide"],
  },
  {
    id: "objective-c08-intermediate-storage-selection-002",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "위젯과 메인 앱이 같은 UserDefaults 데이터를 공유할 때 올바른 방법은?",
    choices: [
      { id: "a", text: "`UserDefaults.standard`를 양쪽에서 직접 사용한다." },
      {
        id: "b",
        text: "Capabilities에 App Group을 추가하고 `UserDefaults(suiteName: \"group.io.app\")`을 사용한다.",
      },
      { id: "c", text: "위젯은 독립 프로세스라 UserDefaults 공유가 불가능하다." },
      { id: "d", text: "NSNotificationCenter로 변경 사항을 위젯에 브로드캐스트한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "위젯은 별도 프로세스에서 실행되므로 `UserDefaults.standard`를 공유할 수 없습니다. App Group Capability를 추가하고 동일한 그룹 식별자로 `UserDefaults(suiteName:)`을 생성해야 위젯과 메인 앱이 같은 데이터에 접근할 수 있습니다.",
    relatedTopicSlugs: ["08-persistence/storage-selection-guide"],
  },
  {
    id: "objective-c08-intermediate-storage-selection-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "신규 iOS 17+ 전용 앱에서 관계형 데이터(사용자-게시물-댓글 구조)를 저장할 때 권장 저장소는?",
    choices: [
      { id: "a", text: "UserDefaults (JSON 인코딩)" },
      { id: "b", text: "SwiftData (@Model 매크로 활용)" },
      { id: "c", text: "FileManager (Codable JSON 파일)" },
      { id: "d", text: "Keychain" },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS 17 이상만 지원하는 신규 앱에서 관계형 데이터를 다룰 때는 `@Model` 매크로 기반의 SwiftData가 권장됩니다. Core Data의 파워를 매크로 문법으로 간결하게 사용할 수 있고 Swift Observation과도 잘 통합됩니다.",
    relatedTopicSlugs: ["08-persistence/storage-selection-guide"],
  },
  {
    id: "objective-c08-advanced-storage-selection-004",
    type: "objective",
    level: "advanced",
    category: "Persistence",
    prompt:
      "Core Data에서 관계 객체에 접근할 때 발생하는 `NSFault`의 의미와 대량 접근 시 문제점은?",
    choices: [
      {
        id: "a",
        text: "NSFault는 관계 객체를 미리 전부 메모리에 올려두는 prefetch 플래그로, 성능을 향상시킨다.",
      },
      {
        id: "b",
        text: "NSFault는 지연 로딩 placeholder로, 관계 그래프를 반복 접근하면 N+1 쿼리가 발생해 성능이 저하된다.",
      },
      {
        id: "c",
        text: "NSFault는 Core Data 저장 실패 시 발생하는 에러 타입이다.",
      },
      {
        id: "d",
        text: "NSFault는 백그라운드 컨텍스트에서만 발생하며, viewContext에서는 자동으로 해제된다.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "NSFault는 관계 객체를 실제로 접근하기 전까지 로드를 지연시키는 placeholder입니다. 편리하지만 1000개 객체의 관계를 개별 접근하면 1000번의 DB 쿼리가 발생하는 N+1 문제가 생깁니다. `relationshipKeyPathsForPrefetching`으로 필요한 관계를 미리 일괄 로드해야 합니다.",
    relatedTopicSlugs: ["08-persistence/storage-selection-guide"],
  },

  // ─── userdefaults (add: 4) ────────────────────────────────────────────────

  {
    id: "objective-c08-basic-userdefaults-001",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "SwiftUI에서 UserDefaults 값을 자동으로 뷰에 반영하는 프로퍼티 래퍼는?",
    choices: [
      { id: "a", text: "@State" },
      { id: "b", text: "@AppStorage" },
      { id: "c", text: "@Binding" },
      { id: "d", text: "@Published" },
    ],
    correctChoiceId: "b",
    explanation:
      "`@AppStorage`는 `UserDefaults.standard`에 값을 자동 저장·읽기하며, 값이 변경될 때 뷰를 자동으로 갱신합니다. `@State`는 뷰 내부 상태, `@Binding`은 부모-자식 값 공유, `@Published`는 ObservableObject 프로퍼티용입니다.",
    relatedTopicSlugs: ["08-persistence/userdefaults"],
  },
  {
    id: "objective-c08-basic-userdefaults-002",
    type: "objective",
    level: "basic",
    category: "Persistence",
    prompt:
      "UserDefaults에 Codable 타입을 저장하는 올바른 방법은?",
    choices: [
      { id: "a", text: "`defaults.set(codableValue, forKey:)`로 직접 저장한다." },
      { id: "b", text: "`JSONEncoder`로 Data로 인코딩한 후 `defaults.set(data, forKey:)`로 저장한다." },
      { id: "c", text: "`@AppStorage`가 Codable을 자동으로 처리해 준다." },
      { id: "d", text: "UserDefaults는 Codable을 지원하지 않으므로 Core Data를 써야 한다." },
    ],
    correctChoiceId: "b",
    explanation:
      "UserDefaults는 Codable을 자동 지원하지 않습니다. `JSONEncoder().encode(value)`로 `Data`로 직렬화한 후 `defaults.set(data, forKey:)`로 저장하고, 읽을 때는 `defaults.data(forKey:)` → `JSONDecoder().decode()`로 복원하는 패턴을 사용합니다.",
    relatedTopicSlugs: ["08-persistence/userdefaults"],
  },
  {
    id: "objective-c08-intermediate-userdefaults-003",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "UserDefaults에 10MB 이상의 큰 데이터를 저장했을 때 발생하는 주요 문제는?",
    choices: [
      {
        id: "a",
        text: "앱 시작 시 전체 plist를 메모리에 로드하므로 시작 속도가 느려지고, write 1건마다 전체 직렬화가 발생한다.",
      },
      {
        id: "b",
        text: "데이터가 자동으로 Keychain으로 이동되어 보안 접근 정책이 적용된다.",
      },
      {
        id: "c",
        text: "iCloud 동기화 한도를 초과해 앱이 App Store에서 거부된다.",
      },
      {
        id: "d",
        text: "UserDefaults는 1MB 하드 상한선이 있어 저장 자체가 실패한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "UserDefaults는 plist 전체를 메모리에 캐시하고, 변경 시 전체 plist를 직렬화합니다. 큰 데이터를 넣으면 앱 시작 시 메모리 사용량이 증가하고, write 1건마다 O(N) 직렬화로 수십 ms 메인 스레드 점유가 발생합니다. 큰 데이터는 FileManager + JSON 파일이 적합합니다.",
    relatedTopicSlugs: ["08-persistence/userdefaults"],
  },
  {
    id: "objective-c08-intermediate-userdefaults-004",
    type: "objective",
    level: "intermediate",
    category: "Persistence",
    prompt:
      "`UserDefaults.register(defaults:)`의 용도는?",
    choices: [
      {
        id: "a",
        text: "앱 시작 시 기본값을 등록해, 사용자가 값을 설정하지 않은 키에서 해당 기본값을 반환하도록 한다.",
      },
      {
        id: "b",
        text: "여러 UserDefaults 인스턴스를 하나로 병합하는 동기화 메서드다.",
      },
      {
        id: "c",
        text: "특정 키를 iCloud 동기화 대상에서 제외하는 설정이다.",
      },
      {
        id: "d",
        text: "UserDefaults 저장소를 암호화해 Keychain 수준의 보안을 제공한다.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "`register(defaults:)`는 앱 첫 실행 전 기본값을 등록해 `value(forKey:)`가 nil 대신 기본값을 반환하도록 합니다. 사용자가 한 번도 설정하지 않은 키에서도 의미 있는 초기값을 제공하는 데 사용하며, 앱 시작 초기에 호출하는 것이 관례입니다.",
    relatedTopicSlugs: ["08-persistence/userdefaults"],
  },
];
