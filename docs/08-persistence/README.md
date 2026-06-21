# 08. Persistence

> 한 줄 요약 — iOS 저장소는 **6가지 옵션**이 있고 면접의 본체는 *데이터 성격*(설정/비밀/문서/캐시/구조화 데이터) → *저장소* 매핑의 근거다. 잘못된 선택은 보안 사고(토큰을 UserDefaults에) 또는 백업 누락으로 직결.

저장소 *선택 기준*이 면접 포인트.

## 저장소 6선과 보안/지속성 매트릭스

| 저장소 | 데이터 | 보안 | 백업 | 앱 삭제 후 |
| --- | --- | --- | --- | --- |
| **UserDefaults** | 설정·플래그 (KB 단위) | 평문 plist | iCloud 백업 O | 삭제됨 |
| **Keychain** | 토큰·비밀번호 (KB 단위) | **암호화**, Secure Enclave 보호 가능 | 정책 따라 | **남음** (기본) |
| **FileManager `Documents`** | 사용자 문서 | 평문 | iCloud 백업 O | 삭제됨 |
| **FileManager `Caches`** | 재다운로드 가능 | 평문 | 백업 X | 삭제됨 (디스크 부족 시 OS도 정리) |
| **FileManager `tmp`** | 임시 파일 | 평문 | 백업 X | 삭제됨 (OS가 언제든 정리) |
| **Core Data / SwiftData** | 큰 구조화 데이터 (관계·쿼리) | 평문 (or `NSFileProtectionComplete`) | iCloud 백업 O | 삭제됨 |

## 핵심 개념 5선

### 1. UserDefaults
- `KVC` 기반 plist 저장소. *동기 I/O* — 실수로 큰 데이터(이미지 등) 넣으면 launch time 증가.
- `@AppStorage`로 SwiftUI 연동. **App Group**으로 extension(위젯·NSE)과 공유 가능.
- 안티 패턴: **토큰/비밀번호 저장 금지** (평문, 백업·jailbreak로 노출).

### 2. Keychain
- 보안 저장소. 시스템이 *암호화*, Secure Enclave가 키를 관리.
- **Accessibility**: `WhenUnlocked` / `AfterFirstUnlock` / `WhenPasscodeSet` — 기기 잠금 상태와 접근 가능 여부 정책.
- **Biometric 보호**: `SecAccessControl`로 Face ID/Touch ID 요구.
- 면접 단골: "앱 삭제 후 Keychain 데이터는?" → 기본은 *남음*. `kSecAttrAccessible` + iOS 정책 조합으로 동작 다름.

### 3. FileManager 디렉토리 3종
- **Documents** — 사용자 데이터, *반드시 살아남아야* 하는 것. iCloud 백업.
- **Caches** — *다시 다운로드 가능*한 데이터. OS가 디스크 부족 시 정리할 수 있음.
- **tmp** — 작업 임시 파일. 앱 실행 사이 사라질 수 있음.
- 잘못된 선택의 비용: Caches에 유저 메모를 저장했더니 OS가 지움 → 데이터 손실 컴플레인.

### 4. Core Data / SwiftData
- *객체-관계 매핑*. NSManagedObjectContext가 *변경 추적 + lazy faulting + undo*.
- **멀티스레드**: context는 *스레드 격리*. background에서 fetch/save → main에서 표시 위해 child context 또는 `perform`/`performAndWait`.
- **마이그레이션**: Lightweight (속성/엔티티 추가만) / Heavyweight (매핑 모델 필요) / Progressive (버전 점프).
- SwiftData (iOS 17+): Core Data 위의 *선언형 wrapper*. 매크로 기반 모델 정의, `@Query`로 SwiftUI 연동.

### 5. 캐시 전략
- **메모리 캐시**: `NSCache` — 메모리 압박 시 자동 정리, 스레드 안전.
- **디스크 캐시**: `URLCache` (HTTP), 자체 LRU 디스크.
- 무효화 정책: **TTL** (시간) / **ETag** (서버 검증) / **LRU/LFU/ARC** (용량) / **SWR** (stale 허용 + 갱신).

## 저장소 선택 결정 트리

```
보안 필요? ─ Yes ─→ Keychain
   │
   No
   ↓
크기·구조? ─ KB·flat ─→ UserDefaults
            │
            큼·관계·쿼리 ─→ Core Data / SwiftData
            │
            파일 ─→ FileManager
                       └─ 백업 필요? ─ Yes ─→ Documents
                                      └─ No (재다운 가능) ─→ Caches
                                      └─ 임시 ─→ tmp
```

→ 면접 답변 구조: *데이터 성격(설정/비밀/문서/캐시/관계) → 보안·백업 정책 → 저장소* 순서로 설명.

## 항목

- [UserDefaults](userdefaults.md) — 적합/부적합, @AppStorage, App Group
- [Keychain](keychain.md) — 보안 저장, accessibility 정책, biometric 보호
- [FileManager](file-manager.md) — Documents/Caches/tmp 디렉토리 차이
- [Core Data와 SwiftData](core-data-and-swiftdata.md) — Stack, Context, 마이그레이션, SwiftData (iOS 17+)
- [Core Data 마이그레이션 심화](core-data-migration.md) — *3년차+*. Lightweight / Heavyweight / Progressive

## 시니어

- [저장소 선택 가이드 (결정 트리 + Keychain 정책 + App Group + 마이그레이션)](storage-selection-guide.md)
- [메모리 / 디스크 캐시 (NSCache · URLCache · LRU disk)](memory-and-disk-cache.md)
- [캐시 전략 · 무효화 (TTL · ETag · LRU/LFU/ARC · SWR)](cache-strategy-and-invalidation.md)
- [저장소 마이그레이션 전략 (UserDefaults · Keychain · Core Data · SwiftData)](migration-strategy.md)
- [저장소 성능 비교 · 측정 (Instruments + signpost + batch I/O)](persistence-performance.md)

## 자주 묻는 질문

- 토큰을 UserDefaults에 저장하면 왜 안 되나 → [userdefaults.md](userdefaults.md)
- Documents vs Caches 차이 (백업/삭제 정책) → [file-manager.md](file-manager.md)
- Core Data 멀티스레드 → [core-data-and-swiftdata.md](core-data-and-swiftdata.md)
- SwiftData가 Core Data 대체인가 → [core-data-and-swiftdata.md](core-data-and-swiftdata.md)
- Keychain accessibility 정책 차이 → [keychain.md](keychain.md)
- 앱 삭제 후 Keychain 데이터는? → [keychain.md](keychain.md)
