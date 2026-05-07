# 08. Persistence

저장소 *선택 기준*이 면접 포인트.

## 항목

- [UserDefaults](userdefaults.md) — 적합/부적합, @AppStorage, App Group
- [Keychain](keychain.md) — 보안 저장, accessibility 정책, biometric 보호
- [FileManager](file-manager.md) — Documents/Caches/tmp 디렉토리 차이
- [Core Data와 SwiftData](core-data-and-swiftdata.md) — Stack, Context, 마이그레이션, SwiftData (iOS 17+)
- [Core Data 마이그레이션 심화](core-data-migration.md) — *3년차+*. Lightweight / Heavyweight / Progressive

## 저장소 선택 가이드

| 데이터 | 저장소 |
|---|---|
| 사용자 설정 | UserDefaults / @AppStorage |
| **토큰, 비밀번호** | **Keychain** |
| 사용자 문서 (잃으면 안 됨) | FileManager `Documents` |
| 다시 받을 수 있는 캐시 | FileManager `Caches` |
| 임시 파일 | FileManager `tmp` |
| 큰 구조화 데이터, 검색/관계 | Core Data / SwiftData |

## 자주 묻는 질문

- 토큰을 UserDefaults에 저장하면 왜 안 되나 → [userdefaults.md](userdefaults.md)
- Documents vs Caches 차이 (백업/삭제 정책) → [file-manager.md](file-manager.md)
- Core Data 멀티스레드 → [core-data-and-swiftdata.md](core-data-and-swiftdata.md)
- SwiftData가 Core Data 대체인가 → [core-data-and-swiftdata.md](core-data-and-swiftdata.md)
- Keychain accessibility 정책 차이 → [keychain.md](keychain.md)
- 앱 삭제 후 Keychain 데이터는? → [keychain.md](keychain.md)
