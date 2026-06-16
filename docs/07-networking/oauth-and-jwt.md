# OAuth 2.0 & JWT

> 한 줄 요약 — *비밀번호를 클라이언트에 넘기지 않고* 위임된 접근 권한을 안전하게 발급/갱신/검증하기 위해 존재한다.

관련 RFC: RFC 6749 (OAuth 2.0), RFC 7636 (PKCE), RFC 7519 (JWT), RFC 7515 (JWS), RFC 8252 (OAuth for Native Apps), RFC 6750 (Bearer)
iOS: `ASWebAuthenticationSession` (iOS 12+), Keychain `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`

## 핵심 개념

- **OAuth 2.0**: *Authorization Framework*. 리소스 소유자(사용자)가 클라이언트에게 *제한된 권한*을 위임하는 프로토콜. 인증(Authentication) 자체는 OIDC가 담당.
- **Authorization Code + PKCE**: 네이티브 앱 권장 플로우. **client secret을 앱에 박을 수 없으므로** code interception 방지 메커니즘인 PKCE가 필수 (RFC 8252).
- **Implicit Grant**: 더 이상 권장되지 않음 (token이 URL fragment로 흘러 로그/redirect에 누출).
- **Access Token**: 단명(분~시간). API 호출에 사용. `Authorization: Bearer <token>`.
- **Refresh Token**: 장명(일~월). access token 재발급용. **절대 API 호출에 쓰지 않음**, Keychain 보관.
- **JWT**: `header.payload.signature` (base64url). *자기서술적 토큰*. payload에 만료/사용자/scope 포함. 서명으로 위·변조 검증.
- **JWS vs JWE**: JWS는 *서명*(내용 평문, 누구나 읽음). JWE는 *암호화*. 일반적인 access token은 JWS.

## OAuth Authorization Code + PKCE 흐름

```
[App]                           [AuthZ Server]                [Resource API]
  │ 1. code_verifier 랜덤 생성
  │    code_challenge = SHA256(verifier) base64url
  │
  │ 2. ASWebAuthenticationSession 으로
  │    /authorize?response_type=code
  │    &client_id&redirect_uri
  │    &code_challenge&code_challenge_method=S256
  │    &state=<csrf>&scope=...
  │ ─────────────────────────────►
  │
  │    (사용자 로그인 + 동의)
  │ ◄───────────────────────────── 3. redirect_uri?code=...&state=...
  │
  │ 4. state 검증 (CSRF 방어)
  │
  │ 5. POST /token
  │    grant_type=authorization_code
  │    code, redirect_uri, client_id
  │    code_verifier   ← PKCE 증명
  │ ─────────────────────────────►
  │ ◄───────────────────────────── 6. { access_token, refresh_token,
  │                                      expires_in, token_type, id_token? }
  │
  │ 7. Keychain 저장
  │
  │ 8. API 호출
  │    Authorization: Bearer <access>
  │ ───────────────────────────────────────────────────────►
  │ ◄───────────────────────────────────────────────────────  200 / 401
  │
  │ 9. 401 + 토큰 만료 → /token (grant_type=refresh_token)
```

핵심 보안 포인트:
- **state**: CSRF. 응답에서 무조건 동일성 검사.
- **code_verifier**: 메모리에만, 토큰 교환 후 즉시 폐기.
- **redirect_uri**: 정확 매칭. universal link / custom scheme 둘 다 가능하지만 universal link가 안전(다른 앱이 가로챌 수 없음).
- **client_secret**: native에서는 *사용 안 함*. confidential client만 사용.

## JWT 구조

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.   ← Header  { alg, typ, kid }
eyJzdWIiOiIxMjMiLCJleHAiOjE3MTk4...      ← Payload { sub, iat, exp, scope, aud, iss }
abc123signature...                       ← Signature = sign(base64url(H) + "." + base64url(P), key)
```

- **alg**: `RS256` (서버 RSA 비대칭 권장), `HS256` (대칭, 키 공유 필요), `none` (절대 금지).
- **kid**: key rotation 시 어떤 공개키로 검증할지 식별자. JWKS endpoint에서 매칭.
- **검증 vs 신뢰**: 클라이언트가 JWT를 *디코딩해서 만료 추정*하는 건 OK. 하지만 *권한 판정*은 무조건 서버. 클라이언트의 서명 검증은 의미 없다(공격자가 자기 키로 다시 서명).

## 코드 예시

```swift
// 1. PKCE
import CryptoKit

struct PKCE {
    let verifier: String
    let challenge: String

    init() {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        verifier = Data(bytes).base64URLEncoded()
        let hash = SHA256.hash(data: Data(verifier.utf8))
        challenge = Data(hash).base64URLEncoded()
    }
}

// 2. Authorize via ASWebAuthenticationSession
@MainActor
func authorize(pkce: PKCE) async throws -> String {
    let state = UUID().uuidString
    var comp = URLComponents(string: "https://auth.example.com/authorize")!
    comp.queryItems = [
        .init(name: "response_type", value: "code"),
        .init(name: "client_id", value: ClientID),
        .init(name: "redirect_uri", value: "myapp://callback"),
        .init(name: "code_challenge", value: pkce.challenge),
        .init(name: "code_challenge_method", value: "S256"),
        .init(name: "state", value: state),
        .init(name: "scope", value: "openid profile"),
    ]
    let callback = try await ASWebAuthenticationSession.start(
        url: comp.url!, callbackScheme: "myapp"
    )
    let items = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.queryItems ?? []
    guard items.first(where: { $0.name == "state" })?.value == state else {
        throw AuthError.csrf
    }
    guard let code = items.first(where: { $0.name == "code" })?.value else {
        throw AuthError.noCode
    }
    return code
}

// 3. JWT payload peek — 만료 확인용. 신뢰 X.
struct JWTPayload: Decodable { let exp: TimeInterval; let sub: String }

func peekExpiry(_ jwt: String) -> Date? {
    let parts = jwt.split(separator: ".")
    guard parts.count == 3,
          let data = Data(base64URLEncoded: String(parts[1])),
          let p = try? JSONDecoder().decode(JWTPayload.self, from: data)
    else { return nil }
    return Date(timeIntervalSince1970: p.exp)
}

// 4. 토큰 저장 — Keychain, this device only
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: "com.app.refreshToken",
    kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    kSecValueData as String: token.data(using: .utf8)!,
]
SecItemAdd(query as CFDictionary, nil)
```

## 비교

| 구분 | Authorization Code + PKCE | Implicit | Client Credentials | Resource Owner Password |
|---|---|---|---|---|
| 대상 | 네이티브/SPA | (Deprecated) | server-to-server | 1st-party 한정, 비권장 |
| Refresh token | O | X | X (재발급) | O |
| 보안 | 강함 | 약함 (URL 누출) | 강함 | 비밀번호가 앱에 들어옴 |
| iOS 권장 | **✓** | ✗ | API 백엔드 간 | ✗ |

| 구분 | Opaque Token | JWT (자기서술적) |
|---|---|---|
| 형태 | 랜덤 문자열 | base64url 3-part |
| 검증 | 매번 AuthZ 서버 introspection | 서명만으로 stateless |
| 폐기 | 즉시 가능 | 만료까지 유효 (블랙리스트 필요) |
| 크기 | 작음 | 큼 (헤더에 부담) |
| 정보 노출 | 없음 | payload 평문 |

## 흔한 함정 / Follow-up

- **Q. JWT를 클라이언트에서 어떻게 검증?**
  하지 않는다. 클라이언트는 *만료 시각 peek*만. 서명 검증은 서버 책임. 클라가 검증해도 자기 키로 위조한 JWT를 본인이 통과시킬 뿐.
- **Q. Refresh token 회전(rotation)?**
  refresh 요청마다 새 refresh token을 발급하고 이전 것은 *즉시 폐기*. 탈취된 토큰이 두 번 사용되면 서버가 *세션 전체 폐기* → replay 탐지. (OAuth 2.1 권장)
- **Q. Access token이 탈취되면?**
  만료까지 막을 방법이 없음 → 짧은 수명(5~15분) + refresh rotation + 의심 시 *세션 폐기*. mTLS-bound token / DPoP (RFC 9449)로 sender-constrained 가능.
- **Q. Refresh token을 어디 저장?**
  Keychain `AfterFirstUnlockThisDeviceOnly` + `kSecAttrAccessControl`로 device passcode/biometric 게이트. iCloud Keychain 동기화 그룹 사용 금지 (다른 기기로 토큰 복제됨).
- **Q. Custom URL scheme 대신 Universal Link를 써야 하는 이유?**
  custom scheme은 *동일 scheme을 선언한 다른 앱이 가로챌 수 있음*. Universal Link는 도메인 소유 증명(`apple-app-site-association`)이 필요해 가로채기 불가.
- **Q. `none` alg 공격?**
  서버가 alg를 클라이언트 헤더 그대로 신뢰하면 공격자가 `alg: none`으로 위조 → 서명 없이 통과. 서버는 알고리즘 화이트리스트를 *고정*해야 함.
- **Q. 401 vs 403?**
  401 = 인증 자체 실패/만료 → refresh 시도. 403 = 인증은 됐는데 권한 없음 → refresh 무의미. 인터셉터에서 분기.
- **Q. ID Token (OIDC) vs Access Token?**
  ID token은 *사용자 식별 정보*(JWT), 클라이언트가 사용자를 알 때. Access token은 *리소스 접근*. ID token으로 API 호출하면 안 됨.

## 참고

- RFC 6749, RFC 6750, RFC 7636 (PKCE), RFC 7519 (JWT), RFC 8252 (Native Apps BCP), RFC 9449 (DPoP)
- OAuth 2.1 draft
- AppAuth-iOS (OIDC certified client)
- WWDC 2018 — Introducing ASWebAuthenticationSession
