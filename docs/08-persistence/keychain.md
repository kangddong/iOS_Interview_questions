# Keychain

> 한 줄 요약 — **iOS가 제공하는 보안 저장소**. 비밀번호/토큰/인증서 같은 민감 데이터를 OS 레벨로 암호화해 저장하고, 앱이 삭제되어도 *기본적으로는 남아있다*.

## 왜 Keychain인가

- 데이터가 자동 암호화 (디바이스 잠금 해제 키와 결합).
- 앱이 죽거나 백업이 와도 안전.
- 접근 정책(잠금 해제 후만, 이 디바이스만 등) 세밀 제어.
- App Group으로 다른 앱과 공유 가능.

UserDefaults는 평문 plist → 토큰/비번은 무조건 Keychain.

## 기본 API (Security 프레임워크)

저수준 C API라 보일러플레이트가 길다.

```swift
// 저장
let query: [String: Any] = [
    kSecClass as String:       kSecClassGenericPassword,
    kSecAttrService as String: "com.app.token",
    kSecAttrAccount as String: "access",
    kSecValueData as String:   data,
    kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
]
SecItemAdd(query as CFDictionary, nil)

// 조회
var result: AnyObject?
let q: [String: Any] = [
    kSecClass as String:       kSecClassGenericPassword,
    kSecAttrService as String: "com.app.token",
    kSecAttrAccount as String: "access",
    kSecReturnData as String:  true,
    kSecMatchLimit as String:  kSecMatchLimitOne
]
SecItemCopyMatching(q as CFDictionary, &result)
let data = result as? Data

// 삭제
SecItemDelete(q as CFDictionary)
```

실무에선 보통 `KeychainAccess` 같은 wrapper나 자체 wrapper 사용.

## Wrapper 예시

```swift
enum Keychain {
    static func save(_ data: Data, account: String, service: String = "io.app") {
        let q: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(q as CFDictionary)        // 기존 값 제거 후 add
        var add = q
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        SecItemAdd(add as CFDictionary, nil)
    }

    static func read(account: String, service: String = "io.app") -> Data? {
        let q: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: AnyObject?
        SecItemCopyMatching(q as CFDictionary, &item)
        return item as? Data
    }
}
```

## 접근성(Accessibility) 정책

| 정책 | 의미 |
|---|---|
| `kSecAttrAccessibleWhenUnlocked` | 잠금 해제 상태에서만 |
| `kSecAttrAccessibleAfterFirstUnlock` | 첫 잠금 해제 후 (재부팅 후 한 번 풀리면 OK). 백그라운드 작업에 적합 |
| `...ThisDeviceOnly` 접미사 | 백업/iCloud로 다른 디바이스에 동기화 안 됨 |

토큰은 보통 `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`. 디바이스 이전 시 다시 로그인 시키는 정책이 안전.

## 앱 삭제 후 데이터

iOS는 *기본적으로 keychain item을 앱 삭제 시 지우지 않는다*. 의도적으로 청소하려면:
- 앱 첫 실행 시 *플래그를 UserDefaults*에 저장하고, 없으면 기존 keychain 청소.
- iOS 10.3+에서 `Reinstalled`가 첫 실행에서 보이는 패턴 활용.

## Biometric 보호 (Face ID / Touch ID)

```swift
let access = SecAccessControlCreateWithFlags(
    nil, kSecAttrAccessibleWhenUnlocked, .biometryCurrentSet, nil
)
let q: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: "io.app.payment",
    kSecAttrAccessControl as String: access!,
    kSecValueData as String: secret
]
SecItemAdd(q as CFDictionary, nil)
```

읽을 때마다 Face ID/Touch ID 프롬프트. 결제, 비밀 노트 등에.

## App Group으로 공유

```swift
kSecAttrAccessGroup as String: "group.io.example.app"
```

위젯/공유 익스텐션과 같은 토큰 사용.

## 비교 — 저장소 선택

| 데이터 | 저장소 |
|---|---|
| 사용자 설정, on-boarding 플래그 | UserDefaults |
| **토큰, 비밀번호, 인증서** | **Keychain** |
| 캐시, 다운로드 파일 | FileManager (`Caches`) |
| 사용자 문서 (잃으면 안 됨) | FileManager (`Documents`) |
| 큰 구조화 데이터, 검색/관계 | Core Data / SwiftData / SQLite |

## 흔한 함정 / Follow-up

- **Q. Keychain에 무거운 데이터를 저장해도 되나?**
  안 됨. 작은 (수 KB 이하) 시크릿용. 큰 데이터는 파일로 저장하고 *암호화 키만* Keychain에.

- **Q. 시뮬레이터에서 Keychain이 동작하나?**
  동작하지만 entitlement 일부 제한. 디바이스 빌드와 결과가 다를 수 있어 실기기 테스트 필요.

- **Q. iCloud Keychain 동기화는?**
  `kSecAttrSynchronizable = true` 추가. 단, 비밀번호류만 동기화 정책에 적합. 액세스 토큰은 보통 동기화하지 않음.

- **Q. `errSecDuplicateItem` (-25299)?**
  같은 query 조건으로 이미 존재. `SecItemUpdate`로 업데이트하거나 delete 후 add.

- **Q. async/await로 사용하려면?**
  Security API는 동기지만 빠름. 무거운 사용 패턴이 아니면 main에서 호출해도 OK. 의심스러우면 `Task.detached`.

- **Q. 자체 암호화 vs Keychain?**
  자체 암호화는 *키를 어디 저장할 것이냐*가 다시 문제. Keychain이 *그 키 저장 장소*. 직접 만들지 말 것.

## 참고

- Apple Docs: Keychain Services
- WWDC 2014/2019: Securing iOS apps
