# Network Stack 심화 (TLS Pinning / Trust Evaluation / 차단 우회 방어)

> 한 줄 요약 — HTTPS는 *기본*은 OS의 trust store에 위임하지만, *MITM 방어*를 강화하려면 **certificate pinning** 또는 **public key pinning**을 직접 한다. `URLSession`의 `URLSessionDelegate`에서 *server trust challenge*를 받아 `SecTrust` 평가 후 결정한다.

## Trust 평가 흐름

```
client                                server
  │                                     │
  │── ClientHello ─────────────────────►│
  │◄── ServerHello + cert chain ────────│
  │                                     │
  │  OS가 chain 검증:                    │
  │   1) root CA 신뢰?                   │
  │   2) chain valid (서명, 만료, OCSP)?  │
  │   3) hostname == cert SAN?           │
  │                                     │
  │  통과 시 ATS 통과 → 앱 코드로 callback  │
  │  실패 시 즉시 차단                    │
```

ATS(App Transport Security) 정책으로 *HTTP 차단* + *TLS 버전 최소 1.2* 강제.

## 기본은 OS에 위임

```swift
let (data, _) = try await URLSession.shared.data(from: url)
```

→ OS의 trust store를 그대로 사용. CA가 발급한 *어떤 cert든* 통과.

문제: 공격자가 *신뢰받는 CA*를 통해 fake cert을 발급받으면 (또는 *device에 악성 root CA 설치*) MITM 가능.

## Certificate Pinning

`URLSessionDelegate`에서 server trust challenge를 받아 *내 앱이 알고 있는 cert/key와 비교*:

```swift
final class PinningDelegate: NSObject, URLSessionDelegate {
    let pinnedCertData: Data    // 앱 번들에 포함된 cert (DER 또는 PEM 파싱 결과)

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let trust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // 1) OS trust 평가
        var error: CFError?
        guard SecTrustEvaluateWithError(trust, &error) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // 2) chain의 leaf cert 데이터 추출
        let chain = SecTrustCopyCertificateChain(trust) as? [SecCertificate] ?? []
        guard let leaf = chain.first else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        let leafData = SecCertificateCopyData(leaf) as Data

        // 3) 내가 박아둔 cert와 비교
        if leafData == pinnedCertData {
            completionHandler(.useCredential, URLCredential(trust: trust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}
```

## Public Key Pinning (권장)

cert는 *만료* 시 교체 → 앱 강제 업데이트 필요. **public key pinning**은 키만 비교 → cert 교체에 강함 (같은 키페어로 재발급).

```swift
let publicKey = SecCertificateCopyKey(leaf)!
let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil)! as Data
let hash = SHA256.hash(data: publicKeyData)
// Base64 인코딩한 hash를 앱에 박아둠
```

## Pinning의 트레이드오프

| 측면 | 장점 | 단점 |
|---|---|---|
| Certificate pinning | 가장 강한 보장 | cert 교체 시 앱 강제 업데이트 |
| Public key pinning | cert 교체 유연 | 키 교체 시 앱 업데이트 필요 |
| 백업 핀 (primary + secondary) | 키 교체 안전 | 관리 복잡 |
| No pinning | 운영 단순 | MITM 위험 (악성 root CA, public WiFi) |

## Pinning 실패 처리

- 사용자에게 *재시도 외 선택지 X* — 보안 정책 위반
- 에러 로그를 *백엔드에 보고* (공격 패턴 탐지) — 단, 그 자체도 MITM 대상이라 별도 채널 고려
- 만료 임박 시점 *모니터링* — 앱 배포 사이클보다 cert TTL이 짧으면 위험

## Network 라이브러리

- **Alamofire** — pinning 플러그인 (`ServerTrustManager`)
- **TrustKit** — pinning 전용 라이브러리, 보고 기능 포함
- 직접 구현 vs 라이브러리: 핀 1~2개에 단일 호스트면 직접 작성으로 충분. 다중 호스트/리포팅 필요하면 TrustKit 고려

## ATS(App Transport Security) 정책

`Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSExceptionDomains</key>
  <dict>
    <key>legacy.example.com</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
    </dict>
  </dict>
</dict>
```

- 기본: HTTPS + TLS 1.2+ 강제
- 예외 추가는 *심사 시 정당화* 필요
- 신규 앱은 ATS 완전 준수 권장

## 차단 우회 방어 (jailbreak / SSL bypass)

탈옥 디바이스 + *SSL Kill Switch*로 pinning 우회 가능. 대응:
- 탈옥 감지(쉽게 우회됨, 군비 경쟁)
- *코드 난독화* (Swift 자체는 약한 편)
- 민감 거래는 *서버 측 추가 검증* (디바이스 attestation, server-side 토큰 회전)
- DRM·결제는 *App Attest / DeviceCheck* (Apple API)

## 흔한 함정 / Follow-up

- **Q. self-signed cert 개발 환경?**
  *별도 빌드 config*에서만 검증 우회. 프로덕션 빌드에 *절대* 동일 코드 가지 마라.

- **Q. URLSession.shared와 custom session의 차이?**
  shared는 default config + delegate 설정 불가. pinning은 *반드시 custom session*.

- **Q. WebSocket(URLSessionWebSocketTask)도 pinning 적용?**
  Yes. 같은 delegate.

- **Q. 도메인이 여러 개면?**
  protectionSpace.host로 분기. 호스트별 핀 사전 관리.

- **Q. 핀이 일치 안 할 때 폴백을 OS trust로?**
  *절대 X*. pinning의 의미 상실. 일치 안 하면 *연결 차단*.

- **Q. DOH(DNS over HTTPS) 의미?**
  iOS 14+ Network framework가 지원. DNS 자체의 평문 노출을 막음 → 단, MITM과는 다른 영역.

## 참고

- WWDC 2017: Your Apps and Evolving Network Security Standards
- Apple: Customizing Your App's Data Storage (ATS)
- OWASP: Certificate and Public Key Pinning
- TrustKit (https://github.com/datatheorem/TrustKit)
