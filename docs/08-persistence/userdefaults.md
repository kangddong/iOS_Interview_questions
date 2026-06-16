# UserDefaults

> 한 줄 요약 — **앱의 설정 같은 작은 키-값 데이터**를 plist에 저장하는 시스템. 빠르고 간단하지만 *민감 정보, 큰 데이터에는 부적합*.

## 기본 사용

```swift
let defaults = UserDefaults.standard
defaults.set("dark", forKey: "theme")
defaults.set(true,   forKey: "didOnboard")
defaults.set(42,     forKey: "lastReadID")

let theme = defaults.string(forKey: "theme")          // "dark"
let did   = defaults.bool(forKey: "didOnboard")        // true
```

지원 타입: `String`, `Bool`, `Int/Double`, `Date`, `URL`, `Data`, `[Any]`, `[String: Any]`. **Codable은 자동 지원 X** — `Data`로 인코드 후 저장.

## Codable 저장 패턴

```swift
struct AppPrefs: Codable { var theme: String; var lang: String }

func save(_ prefs: AppPrefs) {
    let data = try! JSONEncoder().encode(prefs)
    defaults.set(data, forKey: "prefs")
}

func load() -> AppPrefs? {
    guard let data = defaults.data(forKey: "prefs") else { return nil }
    return try? JSONDecoder().decode(AppPrefs.self, from: data)
}
```

## @AppStorage (SwiftUI)

```swift
struct Settings: View {
    @AppStorage("theme") var theme = "light"
    var body: some View { Picker("Theme", selection: $theme) { ... } }
}
```

`UserDefaults.standard`에 자동 저장 + View 자동 갱신. SwiftUI에선 거의 표준.

## 적합 / 부적합

### 적합
- 사용자 설정 (테마, 언어, 알림 토글)
- 마지막으로 본 화면, 튜토리얼 완료 여부
- 작은 캐시된 메타데이터 (수십 KB 이하)

### 부적합
- **인증 토큰 / 비밀번호** → Keychain
- 큰 이미지/파일 → FileManager
- 구조화된 큰 데이터 → Core Data / SwiftData / SQLite
- 중요한 도메인 데이터 (잃으면 안 되는) → 별도 저장소

## 보안 측면

UserDefaults는 plist 파일로 저장되며, **iOS 백업에 포함되어 다른 디바이스로 복원될 수 있음**. 일부 환경에서는 jailbreak 디바이스에서 평문으로 읽힘.

토큰을 여기 두면 안 되는 이유:
- 평문
- 백업 포함 (다른 디바이스에서 복원 가능)
- 같은 앱 그룹의 다른 프로세스에서 접근

## App Group으로 공유

위젯/앱 익스텐션과 데이터 공유:

```swift
let shared = UserDefaults(suiteName: "group.io.example.app")
shared?.set(value, forKey: key)
```

Capabilities에 App Groups 추가, 같은 group identifier 사용.

## 관찰

```swift
// KVO
defaults.observe(\.theme, options: .new) { _, change in ... }

// SwiftUI는 @AppStorage가 자동
```

NotificationCenter `UserDefaults.didChangeNotification`도 있지만 *어떤 키가 바뀌었는지*는 안 알려줌.

## 흔한 함정 / Follow-up

- **Q. 토큰을 UserDefaults에 저장하면 왜 안 되나?**
  평문으로 plist에 적힘. 백업 포함되어 다른 디바이스 복원 시 따라감. jailbreak 환경에서 직접 읽기 가능. → Keychain.

- **Q. UserDefaults에 100MB 짜리 이미지를 저장하면?**
  앱 시작 때 plist를 로드하므로 *전체 메모리*에 올라감 → 시작 느려짐. 이미지/파일은 FileManager.

- **Q. `@AppStorage`로 Codable 타입을 저장하려면?**
  내장 지원은 String/Int/Bool/Double/URL/Data만. Codable은 RawRepresentable 어댑터 또는 String 래핑.

- **Q. 동시에 여러 곳에서 set하면 thread-safe?**
  thread-safe로 문서화. 다만 자주 set하면 디스크 I/O가 자주 발생 → 짧은 시간 다발 set은 *디바운스*.

- **Q. `removeObject(forKey:)` vs `nil` set?**
  Optional 타입이 아닌 Bool/Int 등은 `nil` set 불가. `removeObject` 사용. 이후 `bool(forKey:)`은 false 반환 (기본값).

- **Q. `register(defaults:)`?**
  앱 시작 시 *기본값*을 등록. 사용자가 set하지 않은 키에 대해 `value(forKey:)`가 이 기본값을 반환. 앱 첫 실행 직후 동작에 유용.

## 참고

- Apple Docs: UserDefaults
- WWDC 2019: Modernizing Your UI for iOS 13 (App Group/Settings 디자인)
