# FileManager / Sandbox 디렉토리

> 한 줄 요약 — 앱은 자기만의 *샌드박스* 안에서만 파일을 읽고 쓴다. **`Documents`/`Library/Caches`/`tmp`** 가 가장 자주 쓰이는 영역이고, 각각 백업/삭제 정책이 다르다.

## 디렉토리 별 의도

| 디렉토리 | iCloud 백업 | OS가 자동 삭제 | 용도 |
|---|---|---|---|
| **Documents/** | O | X | 사용자 생성 콘텐츠 (잃으면 안 되는 것) |
| **Library/Application Support/** | O | X | 앱이 만든 영속 데이터 (사용자가 직접 보지 않음) |
| **Library/Caches/** | X | **메모리 부족 시 삭제 가능** | 다시 받을 수 있는 캐시 |
| **tmp/** | X | **언제든 삭제됨** | 임시 파일 |

## 경로 얻기

```swift
let fm = FileManager.default

let docs   = fm.urls(for: .documentDirectory,    in: .userDomainMask).first!
let caches = fm.urls(for: .cachesDirectory,      in: .userDomainMask).first!
let tmp    = URL(fileURLWithPath: NSTemporaryDirectory())
let appSup = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
```

`URL`로 다루는 게 표준. `String` 경로 API는 가급적 피한다.

## 읽기/쓰기

```swift
let url = docs.appendingPathComponent("notes.json")

try data.write(to: url, options: .atomic)        // atomic: 임시 파일 → rename
let read = try Data(contentsOf: url)

try fm.removeItem(at: url)
try fm.createDirectory(at: url, withIntermediateDirectories: true)

let exists = fm.fileExists(atPath: url.path)
```

`.atomic`은 쓰기 도중 크래시가 나도 *반쪽짜리 파일*이 안 남게 한다. 큰 파일에선 비용↑.

## Application Support 사용 시 폴더 보장

```swift
let dir = appSup.appendingPathComponent("MyApp")
try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
```

`Application Support` 자체는 OS가 만들어 주지 않는 경우가 있어 직접 생성.

## 백업 제외 — `isExcludedFromBackup`

큰 캐시를 `Documents`에 둘 수밖에 없을 때, iCloud 백업 용량을 잡아먹지 않도록:

```swift
var resourceValues = URLResourceValues()
resourceValues.isExcludedFromBackup = true
try url.setResourceValues(resourceValues)
```

## tmp 삭제 정책

OS가 *언제든* 비워도 됨. 다운로드 중인 파일은 tmp가 적합 — 완료되면 Documents로 이동.

## 외부 공유

- `UIDocumentPickerViewController`: 시스템 파일 앱 진입.
- `Files.app`에 노출: Info.plist `UIFileSharingEnabled = YES`, `LSSupportsOpeningDocumentsInPlace = YES`.

## 비교 — `Documents` vs `Caches`

| 시나리오 | 적합 |
|---|---|
| 사용자가 작성한 노트 | Documents |
| 썸네일 이미지 | Caches |
| 이미 서버에서 다시 받을 수 있는 다운로드 | Caches |
| 사용자가 *나의 파일*에서 보고 싶은 것 | Documents (file sharing 활성) |

캐시인데 Documents에 두면 → 백업 용량 폭증, OS가 정리 못함.

## 흔한 함정 / Follow-up

- **Q. 토큰을 Documents에 파일로 저장해도 되나?**
  안 됨. 백업 따라감, 평문. Keychain.

- **Q. 메모리 워닝 시 OS가 Caches를 정말 지우나?**
  *언제든 지울 수 있다*는 약속. 항상 다시 받을 수 있는지 확인하고 두라. 지워졌다고 크래시하면 안 됨.

- **Q. 큰 다운로드를 안전하게 저장하려면?**
  tmp에서 받고 → 완료 후 atomic move로 최종 위치 이동. 중단되면 tmp는 정리됨.

- **Q. `URL.path` vs `path(percentEncoded:)`?**
  iOS 16+ `path(percentEncoded:)`가 권장. 이전 `path`는 일부 인코딩 이슈.

- **Q. App Group 디렉토리에서 같은 데이터를 공유하려면?**
  `fm.containerURL(forSecurityApplicationGroupIdentifier: "group.io.app")`.

- **Q. iCloud Drive와 다른가?**
  다른 개념. `NSUbiquityContainer`/CloudKit. `Documents`만 둔다고 클라우드 자동 동기화 안 됨.

## 참고

- Apple Docs: File System Basics, File System Programming Guide
- Apple TN: iOS Standard Directories
