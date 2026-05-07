# 인증과 토큰 갱신 (Auth / Refresh Token)

> 한 줄 요약 — 짧은 수명의 *access token*으로 API를 호출하다가 만료되면 *refresh token*으로 새 access token을 발급받는 흐름. **동시에 여러 요청이 401을 만나도 refresh는 한 번만** 일어나야 한다.

## 기본 흐름

```
로그인 → access token (단기) + refresh token (장기) 수신
↓
요청 시 Authorization: Bearer {access}
↓
401 Unauthorized → /refresh 호출 (refresh 토큰 사용) → 새 access 발급
↓
원래 요청을 새 access로 재시도
↓
refresh도 만료 → 강제 로그아웃
```

## 토큰 저장

| 저장소 | 적합 |
|---|---|
| **Keychain** | refresh token, access token (보안) |
| UserDefaults | ❌ 평문, 백업/공유 위험 |
| 메모리 only | 앱 재시작 시 다시 로그인해야 함 |

→ [08-persistence/keychain.md](../08-persistence/keychain.md)

## 단순 구현 (async/await)

```swift
actor TokenStore {
    private(set) var access: String?
    private(set) var refresh: String?
    private var refreshTask: Task<String, Error>?

    func update(access: String, refresh: String) {
        self.access = access; self.refresh = refresh
        Keychain.save(access: access, refresh: refresh)
    }

    func validAccess() async throws -> String {
        if let a = access { return a }
        return try await refreshIfNeeded()
    }

    func refreshIfNeeded() async throws -> String {
        if let task = refreshTask { return try await task.value }    // 이미 진행 중이면 그걸 기다림
        let task = Task<String, Error> {
            defer { refreshTask = nil }
            guard let r = refresh else { throw AuthError.notLoggedIn }
            let new = try await api.refresh(r)
            update(access: new.access, refresh: new.refresh)
            return new.access
        }
        refreshTask = task
        return try await task.value
    }
}
```

`actor`로 *동시 호출 직렬화* + `refreshTask`로 *진행 중 작업 공유* → 여러 요청이 동시에 401을 만나도 refresh API는 **한 번만** 호출.

## 인터셉터 패턴

`URLProtocol`/Alamofire `RequestAdapter` 같은 위치에서 자동 처리.

```swift
final class API {
    let store: TokenStore

    func send<T: Decodable>(_ req: URLRequest) async throws -> T {
        var req = req
        req.setValue("Bearer \(try await store.validAccess())", forHTTPHeaderField: "Authorization")

        let (data, resp) = try await URLSession.shared.data(for: req)

        if (resp as? HTTPURLResponse)?.statusCode == 401 {
            // 토큰 갱신 후 한 번만 재시도
            let newAccess = try await store.refreshIfNeeded()
            req.setValue("Bearer \(newAccess)", forHTTPHeaderField: "Authorization")
            let (d2, _) = try await URLSession.shared.data(for: req)
            return try JSONDecoder().decode(T.self, from: d2)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

*무한 401 루프* 방지를 위해 재시도는 **딱 1회**만.

## OAuth / 외부 IdP

- **OAuth 2.0**: refresh 토큰 기반의 표준.
- **OIDC**: OAuth 위에 ID 정보(JWT id_token) 추가.
- **ASWebAuthenticationSession**: 시스템 브라우저로 OAuth 로그인 안전하게.
- **Sign in with Apple**: `AuthenticationServices` 프레임워크. App Store 정책상 외부 SNS 로그인 있으면 같이 제공 권장.

## JWT를 클라가 해석해도 되나?

가능하지만:
- *클라가 token을 신뢰해서 권한 분기*는 위험. 서버가 항상 검증해야 함.
- *만료 시간을 미리 알아서 사전 refresh*는 OK (토큰 페이로드의 `exp` 사용).

## 보안 수준

- HTTPS 필수. ATS 기본값 유지.
- 인증서 pinning (모바일 뱅킹/금융 권장).
- 로그아웃 시 *서버에 revoke API* 호출 + 로컬 토큰 삭제.
- 토큰을 로그/크래시 리포트에 찍지 말 것 (Sanitizer).

## 비교 — 세션 ID vs JWT vs OAuth

| 구분 | Session ID | JWT | OAuth + Refresh |
|---|---|---|---|
| 서버 상태 | 필요 | 불필요 (stateless) | 필요 (refresh 추적) |
| 만료 처리 | 서버에서 즉시 | 토큰 만료 시간까지 유효 | refresh로 갱신 |
| 모바일 | OK | OK | 가장 흔함 |

## 흔한 함정 / Follow-up

- **Q. 동시에 여러 요청이 만료된 access를 사용하면?**
  각각 401 → 각자 refresh 호출 → 서버에 동시 요청 폭주, 새 refresh가 이전 것을 무효화하는 구현이면 일부 실패. 위처럼 **단일 refresh task 공유**로 해결.

- **Q. refresh 토큰까지 만료되면?**
  강제 로그아웃 → 로그인 화면. 진행 중 작업/저장되지 않은 입력은 보존하고 알림.

- **Q. 토큰을 메모리에 가지고 다니면 어떤 위험?**
  jailbreak된 디바이스에서 dump 가능. 그래도 *디스크보다는* 안전. 디스크 저장은 Keychain.

- **Q. refresh 호출 자체가 실패하면 (네트워크/서버 다운)?**
  재시도 큐에 넣거나 즉시 에러를 사용자에게. 무한 retry는 금지.

- **Q. 401 vs 403 차이?**
  401 = 인증 안 됐거나 만료. 403 = 인증은 됐지만 권한 없음. 403에 refresh를 시도하면 안 됨.

## 참고

- IETF: OAuth 2.0 (RFC 6749), Refresh Token (RFC 6749 §1.5)
- Apple Docs: Authenticating Users with Apple ID
- WWDC 2018: Authentication and Identity in iOS
