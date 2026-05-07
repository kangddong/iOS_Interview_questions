# HTTPS / TLS Handshake / 인증서 / Pinning

> 한 줄 요약 — HTTPS는 **HTTP를 TLS 위에서 돌리는 것**. TLS는 *대칭 키 암호화 + 인증서 기반 신원 확인 + 무결성 검증*을 결합. iOS는 `URLSession`이 자동 처리하지만, 면접에선 *handshake 단계*와 *pinning*을 답해야 한다.

## 왜 HTTPS인가

- **기밀성**: 도청 방지 (Wi-Fi snooping, ISP 감시).
- **무결성**: 중간자 변조 방지 (광고 삽입, 코드 인젝션).
- **신원**: 서버가 *그 도메인의 진짜 서버*임을 확인.

## TLS 1.2 Handshake (간단 버전)

```
Client                              Server
  │  ── Client Hello ───────────────→  │   (지원 cipher, 랜덤)
  │  ←─── Server Hello ─────────────  │   (선택 cipher, 랜덤)
  │  ←─── Certificate ──────────────  │   (서버 인증서 체인)
  │  ←─── Server Key Exchange ──────  │
  │  ←─── Hello Done ────────────────  │
  │  ── Client Key Exchange ────────→  │   (pre-master 암호화)
  │  ── Finished ───────────────────→  │
  │  ←─── Finished ─────────────────  │
       (이후 대칭 키로 암호 통신)
```

TLS 1.3은 *2 RTT → 1 RTT*로 줄임 + 암호 알고리즘 단순화.

## 핵심 단계 설명

1. **Client Hello / Server Hello**: 양쪽 지원하는 암호 알고리즘과 랜덤 값 교환.
2. **Certificate**: 서버가 *자기 인증서 체인*을 보냄. 클라가 신뢰 root까지 검증.
3. **Key Exchange**: 양쪽이 *pre-master secret*을 공유 (RSA / DH / ECDH). 이로부터 대칭 키 생성.
4. **Finished**: 핸드셰이크 무결성 확인.
5. 이후 *대칭 키*로 빠른 암호화 통신.

## 인증서 검증 — 어떻게 신뢰?

```
End-Entity Cert (서버, api.example.com)
   ↑ signed by
Intermediate CA
   ↑ signed by
Root CA  ← 디바이스에 미리 설치된 신뢰 루트
```

OS/브라우저가 *Root CA* 목록을 가지고 있고, 체인 따라 서명 검증. 어느 단계라도 만료/취소/이름 불일치 → 실패.

## App Transport Security (ATS)

iOS 9+부터 *기본 HTTPS 강제*. HTTP 호출은 Info.plist 예외 등록 필요:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>            <!-- 절대 권장 X -->
</dict>
```

특정 도메인 예외만:

```xml
<key>NSExceptionDomains</key>
<dict>
  <key>internal.dev</key>
  <dict>
    <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
    <true/>
  </dict>
</dict>
```

App Store 심사에서 정당한 사유 없는 ATS 비활성은 거절 가능.

## SSL Pinning

기본 HTTPS는 *OS의 신뢰 루트*에 의존. 공격자가 *루트 CA를 침해*하거나 *기업 MDM 인증서를 디바이스에 설치*하면 중간자 가능 → MITM.

Pinning은 *우리 서버의 인증서/공개키*를 앱에 박아 두고 *그것만* 신뢰.

```swift
final class API: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession,
                    didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let trust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil); return
        }

        // 1) 시스템 검증 먼저
        var error: CFError?
        guard SecTrustEvaluateWithError(trust, &error) else {
            completionHandler(.cancelAuthenticationChallenge, nil); return
        }

        // 2) 서버 leaf 인증서의 public key 비교
        guard let serverCert = SecTrustGetCertificateAtIndex(trust, 0),
              let serverKey  = SecCertificateCopyKey(serverCert),
              let serverKeyData = SecKeyCopyExternalRepresentation(serverKey, nil) as Data?,
              serverKeyData == pinnedPublicKeyData else {
            completionHandler(.cancelAuthenticationChallenge, nil); return
        }

        completionHandler(.useCredential, URLCredential(trust: trust))
    }
}
```

### Pinning 종류

| 종류 | 장 | 단 |
|---|---|---|
| **Certificate pin** | 단순 | 인증서 갱신 시 앱 업데이트 필요 |
| **Public key pin** | 인증서 갱신해도 키만 같으면 OK | 키 교체 시 업데이트 필요 |
| **Backup pin** | 새 키도 함께 박아 둠 | 사용자 로그인 안 끊김 |

만료/교체 *전*에 새 키를 클라에 미리 배포하는 *롤링 전략*이 표준.

## TLS 1.3 — 무엇이 좋아졌나

- 1 RTT (또는 0-RTT 재연결).
- 안전하지 않은 cipher 제거.
- handshake 메시지 *암호화*까지.

iOS 12.2+가 TLS 1.3 지원. URLSession은 가능 시 자동 사용.

## 흔한 함정 / Follow-up

- **Q. HTTPS만 쓰면 토큰을 그대로 박아도 되나?**
  통신은 안전하지만, *디바이스에 평문 저장*은 별개. 토큰은 Keychain.

- **Q. Pinning 했는데 인증서 갱신 → 모든 사용자 접속 불가.**
  롤링 전략 누락. 앱에 *현재 키 + 차기 키*를 함께 박아 두고, 서버 갱신 후 다음 앱 업데이트에서 옛 키 제거.

- **Q. self-signed 인증서를 dev에서 쓰려면?**
  delegate에서 *해당 도메인 한정*으로 trust 강제. 또는 ATS 예외 도메인. 절대 production에 코드 남기지 말 것.

- **Q. 인증서 만료 사고를 막으려면?**
  자동 모니터링 (만료 30일 전 알림). Let's Encrypt는 *자동 갱신*이 표준.

- **Q. MITM 공격을 어떻게 시뮬?**
  Charles/Proxyman/Burp + 디바이스에 root cert 설치. Pinning 켜져 있으면 실패해야 정상.

- **Q. HTTP/2/3에서도 TLS는 똑같이?**
  HTTP/3 = QUIC, TLS 1.3을 *내장* (별도 단계 아니라 통합). RTT 더 짧음.

## 참고

- RFC 8446 (TLS 1.3)
- WWDC 2017: Your Apps and Evolving Network Security Standards
- OWASP Mobile Top 10: M3 Insecure Communication
