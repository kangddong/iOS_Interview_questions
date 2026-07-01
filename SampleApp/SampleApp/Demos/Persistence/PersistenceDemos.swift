import SwiftUI
import Foundation
import Security

struct UserDefaultsDemo: Demo {
    static let id = "persist.userdefaults"
    static let title = "UserDefaults"
    static let summary = "key-value 작은 설정용. plist 직렬화 가능한 타입만, 동기/암호화 없음."
    static let docPath = "docs/08-persistence/userdefaults.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let key = "demo.userdefaults.counter"
            let cur = UserDefaults.standard.integer(forKey: key)
            UserDefaults.standard.set(cur + 1, forKey: key)
            log.log("counter = \(UserDefaults.standard.integer(forKey: key))")
        }
    }
}

struct KeychainDemo: Demo {
    static let id = "persist.keychain"
    static let title = "Keychain"
    static let summary = "토큰/비밀번호 같은 민감 정보. 앱 삭제 후에도 유지(설정 따라)."
    static let docPath = "docs/08-persistence/keychain.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let service = "dev.kangddong.SampleApp"
            let account = "demoToken"
            let value = "secret-\(Int.random(in: 0..<10000))"
            // delete existing
            SecItemDelete([kSecClass: kSecClassGenericPassword, kSecAttrService: service, kSecAttrAccount: account] as CFDictionary)
            let attrs: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: service,
                kSecAttrAccount: account,
                kSecValueData: value.data(using: .utf8)!,
            ]
            let addStatus = SecItemAdd(attrs as CFDictionary, nil)
            log.log("Add status = \(addStatus)")
            var ref: CFTypeRef?
            SecItemCopyMatching([
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: service,
                kSecAttrAccount: account,
                kSecReturnData: true,
            ] as CFDictionary, &ref)
            if let d = ref as? Data { log.log("read = \(String(data: d, encoding: .utf8) ?? "")") }
        }
    }
}

struct FileManagerDemo: Demo {
    static let id = "persist.file-manager"
    static let title = "FileManager"
    static let summary = "Documents/Caches/tmp 디렉토리 + Atomic write. 대용량/직렬화 산출물 저장."
    static let docPath = "docs/08-persistence/file-manager.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let file = docs.appendingPathComponent("demo.txt")
            try? "hello \(Date())".write(to: file, atomically: true, encoding: .utf8)
            log.log("wrote → \(file.lastPathComponent)")
            if let read = try? String(contentsOf: file) { log.log("read → \(read)") }
        }
    }
}

struct CoreDataDemo: Demo {
    static let id = "persist.core-data"
    static let title = "Core Data"
    static let summary = "객체 그래프 + SQLite. NSManagedObject/Context/Coordinator/Container."
    static let docPath = "docs/08-persistence/core-data-and-swiftdata.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "NSPersistentContainer로 viewContext/background context 관리",
            "NSManagedObject는 main context에서만 안전, background context로 무거운 작업",
            "Fetch는 NSFetchRequest + NSPredicate + NSSortDescriptor",
            "Lightweight migration은 모델 버전 추가 + automatic 옵션",
        ])
    }
}

struct SwiftDataDemo: Demo {
    static let id = "persist.swiftdata"
    static let title = "SwiftData"
    static let summary = "iOS 17+. @Model 매크로로 Core Data를 Swift다운 문법으로."
    static let docPath = "docs/08-persistence/core-data-and-swiftdata.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "@Model class Foo { var name: String } 형태",
            "@Query 프로퍼티 래퍼로 SwiftUI에서 fetch + 실시간 갱신",
            "ModelContainer/ModelContext가 Core Data의 Container/Context 대체",
            "내부 저장소는 여전히 Core Data 스택",
        ])
    }
}

struct CoreDataMigrationDemo: Demo {
    static let id = "persist.core-data-migration"
    static let title = "Core Data Migration"
    static let summary = "Lightweight(자동) vs Heavyweight(mapping model 작성)."
    static let docPath = "docs/08-persistence/core-data-migration.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Lightweight: 단순 추가/이름 변경 — automatic 옵션으로 OK",
            "Heavyweight: 엔티티 합치기/쪼개기 — Mapping Model + NSEntityMigrationPolicy",
            "Migration은 첫 컨테이너 load 시 실행, 큰 DB는 백그라운드에서 lazy 처리",
            "테스트는 이전 모델 + 더미 데이터 → 새 모델로 로드 검증",
        ])
    }
}

struct MemoryDiskCacheDemo: Demo {
    static let id = "persist.memory-disk-cache"
    static let title = "Memory & Disk Cache"
    static let summary = "NSCache(메모리) + 파일 기반(디스크) 2단 캐시. 메모리 압박 시 자동 비움."
    static let docPath = "docs/08-persistence/memory-and-disk-cache.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let cache = NSCache<NSString, NSString>()
            cache.setObject("v1", forKey: "k1")
            log.log("cached = \(cache.object(forKey: "k1") ?? "nil")")
            cache.removeObject(forKey: "k1")
            log.log("removed → \(cache.object(forKey: "k1") ?? "nil")")
        }
    }
}

struct CacheStrategyDemo: Demo {
    static let id = "persist.cache-strategy"
    static let title = "Cache Strategy"
    static let summary = "Cache-First / Network-First / Stale-While-Revalidate + 무효화 정책."
    static let docPath = "docs/08-persistence/cache-strategy-and-invalidation.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Cache-First: 빠르지만 stale 가능 — 동시에 background refresh",
            "Network-First: 최신성 보장 — 오프라인/실패 fallback 필요",
            "Stale-While-Revalidate: 일단 캐시 보여주고 백그라운드 갱신",
            "무효화: TTL, etag/last-modified, 명시적 invalidate(key) API",
        ])
    }
}

struct PersistencePerformanceDemo: Demo {
    static let id = "persist.perf"
    static let title = "Persistence Performance"
    static let summary = "디스크 IO는 메인 스레드 금지. 배치 쓰기, 인덱스, 인입 트랜잭션."
    static let docPath = "docs/08-persistence/persistence-performance.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Core Data: background context로 일괄 import (perform/performAndWait)",
            "큰 객체는 external storage 옵션으로 따로 저장",
            "Realm/SQLite도 동일 — 메인 스레드는 read 우선",
            "Instruments → Core Data 인스트루먼트로 쿼리 plan 확인",
        ])
    }
}

struct StorageSelectionDemo: Demo {
    static let id = "persist.storage-selection"
    static let title = "Storage Selection Guide"
    static let summary = "UserDefaults < Keychain < Files < SQLite/CoreData/SwiftData 순으로 데이터 양과 복잡도."
    static let docPath = "docs/08-persistence/storage-selection-guide.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "단순 플래그/설정 → UserDefaults",
            "민감 정보(token, password) → Keychain",
            "파일/이미지/문서 → FileManager + Caches dir",
            "관계형 객체 그래프 → CoreData/SwiftData / 가벼우면 SQLite 직접",
        ])
    }
}
