# 저장소 선택 가이드 (시니어 시각)

> 한 줄 요약 — 저장소는 **데이터 형태(스칼라/그래프/blob)**, **민감도(보안/개인정보)**, **수명(임시/영구/백업)**, **쿼리 복잡도**, **동기화 요구**의 5축으로 결정한다. 같은 종류(`UserDefaults`/`Keychain`/`Core Data`/`SwiftData`/`FileManager`/`SQLite`/`CloudKit`)를 *언제 어떻게* 조합하는가가 시니어 답변의 차이.

## 결정 트리

```
민감 정보? (토큰, 비밀번호, 카드, 헬스)
└─ YES → Keychain
   - accessibility 정책 (afterFirstUnlock 등) 명시
   - 앱 삭제 후 잔존 정책 인지

작은 설정/플래그? (사용자 선호, 비-민감)
└─ YES → UserDefaults  (또는 App Group이면 suite 명시)

큰 관계형 데이터? (검색, 정렬, 관계, 마이그레이션)
└─ YES → Core Data / SwiftData(iOS 17+)
   - SwiftData = Core Data 위 매크로 추상화
   - 백그라운드 import, NSFetchedResultsController

단일 row, 단순 KV, 빠른 read?
└─ YES → SQLite 직접 / GRDB (성능/제어 우선 시)

큰 binary blob (이미지, 비디오)?
└─ YES → FileManager (Documents / Caches / tmp 구분)

iCloud 동기화 필요?
└─ YES → CloudKit (Core Data + CloudKit 통합 가능)
```

## 디렉터리 선택 (FileManager)

| 디렉터리 | iCloud 백업 | iTunes 백업 | OS 자동 삭제 |
|---|---|---|---|
| Documents | O | O | X |
| Library/Application Support | O | O | X |
| Library/Caches | X | X | 디스크 압박 시 가능 |
| tmp | X | X | OS가 자유롭게 |
| Library/Preferences | UserDefaults가 사용 | O | X |

규칙:
- *사용자가 만든 데이터*: Documents
- *재다운로드 가능한 캐시*: Caches
- *세션 임시*: tmp
- *앱이 만든 내부 데이터*: Application Support

## Keychain 깊이

### accessibility 정책

| 정책 | 의미 |
|---|---|
| `WhenUnlocked` | 잠금 해제 상태에서만 접근 |
| `AfterFirstUnlock` | 부팅 후 첫 unlock 후로 항상 접근 (백그라운드 작업 가능) |
| `WhenPasscodeSet` (ThisDeviceOnly) | 디바이스 백업 이전 불가 |

토큰 권장: `AfterFirstUnlock` + `ThisDeviceOnly`. 백그라운드 갱신 가능 + 다른 기기 복원 안 됨.

### 앱 삭제 후

- 기본 Keychain 항목은 *디바이스에 남음* (재설치 시 복구) — iOS 정책 변화 주의
- iCloud Keychain 동기화는 별도

### Access Group

App Group + Keychain Access Group으로 *앱 확장(Widget, Extensions)과 공유* 가능.

## Core Data vs SwiftData

| 항목 | Core Data | SwiftData |
|---|---|---|
| API | NSManagedObjectContext, NSFetchRequest | `@Model`, ModelContext |
| 코드량 | 많음 | 매크로로 절반 |
| 마이그레이션 | versioned model + mapping | 일부 자동 |
| 멀티스레드 | viewContext + background context | 명시적 actor |
| 성숙도 | 매우 안정 | iOS 17+, 진화 중 |
| 호환 | obj-c, 모든 OS | iOS 17+ |

신규 프로젝트 + iOS 17+ → SwiftData. 기존 큰 Core Data 스택은 그대로 두는 게 안전.

## 멀티스레드

### Core Data

```swift
container.performBackgroundTask { context in
    // background context
}

await viewContext.perform {
    // main context
}
```

- main view에 묶인 viewContext + 백그라운드 import용 별도 context
- `parent`/`child` context로 staged save 가능
- 컨텍스트 간 *오브젝트 ID로 전달*, 객체 직접 전달 X

### SwiftData

```swift
@Model class User { ... }

actor BackgroundImporter {
    let context: ModelContext
    func ingest() async throws { ... }
}
```

`ModelContext`는 Sendable이 아님 → actor 격리.

## 마이그레이션

### Core Data

- **Lightweight**: 컬럼 추가/제거, 옵셔널 변경 → 자동
- **Heavyweight**: 데이터 변환 필요 → mapping model
- **Progressive**: 여러 모델 버전 거쳐 점진적 마이그레이션 (대용량 데이터)

### SwiftData

`VersionedSchema` + `MigrationPlan`. 자동/수동 stage 정의.

## 캐시 정책

이미지/네트워크 응답은 *별도 캐시 레이어*:
- `URLCache`로 HTTP 응답 캐시 (자동)
- 이미지 라이브러리: SDWebImage, Nuke, Kingfisher — 메모리/디스크 LRU
- 직접 구현 시 *NSCache* (메모리 압박 시 자동 해제)

## App Group / 확장 공유

위젯/공유 확장과 데이터 공유:
1. Capability에 App Group 추가
2. UserDefaults: `UserDefaults(suiteName: "group.com.app")`
3. FileManager: `containerURL(forSecurityApplicationGroupIdentifier:)`
4. Keychain: access group 명시

## 흔한 함정 / Follow-up

- **Q. 토큰을 UserDefaults에 저장하면 *얼마나* 위험?**
  탈옥 + 백업 검사로 평문 노출 가능. *민감도가 낮은* 환경(데모/내부 도구)에선 허용, 일반 앱은 Keychain.

- **Q. Documents에 큰 캐시 두면?**
  iCloud 백업 대상이 됨 → 사용자 동기화 시간 증가, 5GB 제한 도달. 캐시는 Caches.

- **Q. Core Data fault란?**
  *지연 로딩*. 관계 객체에 접근하기 전엔 placeholder. 무심코 큰 그래프 fault 발동 = 메모리 폭증.

- **Q. SwiftData에서 background fetch?**
  `ModelActor` 패턴. main과 background ModelContext 각자 가지고 actor로 격리.

- **Q. 데이터 마이그레이션 테스트?**
  *이전 버전 모델로 작성된 DB 파일*을 fixture로 두고 자동 테스트. 마이그레이션 실패는 *치명적* (사용자 데이터 손실).

- **Q. iCloud 동기화 시 충돌?**
  CloudKit의 `recordChanged` 콜백 → 정책 결정 (last-write-wins, manual merge, CRDT 등). 충돌 정책은 *도메인 결정*.

## 참고

- WWDC 2023: Discover SwiftData
- WWDC 2022: Plan your Core Data migrations
- Apple: File System Programming Guide
- Apple: Keychain Services
