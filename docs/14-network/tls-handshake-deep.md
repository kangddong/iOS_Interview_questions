# TLS Handshake 심화 (1.2 vs 1.3, 0-RTT, OCSP, Pinning)

> 한 줄 요약 — TLS handshake는 *키 교환 + 인증 + 암호 스위트 협상*을 통해 안전 채널을 만든다. **TLS 1.2**는 2 round-trip, **TLS 1.3**는 1 round-trip(+ 0-RTT 옵션). iOS는 ATS로 TLS 1.2+ 강제하고, *trust store 평가 → 앱 코드 challenge* 순으로 검증한다.

## TLS 1.2 흐름 (단순화)

```
Client                                Server
  │── ClientHello (랜덤, 지원 cipher) ──►│
  │◄── ServerHello (cipher 선택) ────────│
  │◄── Certificate (체인) ───────────────│
  │◄── ServerKeyExchange (DH 파라미터) ──│
  │◄── ServerHelloDone ──────────────────│
  │── ClientKeyExchange (DH 응답) ──────►│
  │── ChangeCipherSpec ─────────────────►│
  │── Finished (PRF 검증) ──────────────►│
  │◄── ChangeCipherSpec ──────────────────│
  │◄── Finished ──────────────────────────│
  │                                     │
  │── Application Data (암호화) ────────►│
```

= **2 RTT**. 모바일에선 큰 비용.

## TLS 1.3 흐름

```
Client                                Server
  │── ClientHello (랜덤, key share) ───►│
  │◄── ServerHello, Cert, Finished ──────│   ◄ encrypted from here
  │── Finished, Application Data ──────►│
```

= **1 RTT**. 단순화 + 강력한 cipher suite만 허용.

추가 옵션 **0-RTT (Early Data)**: *재방문* 시 ClientHello에 application data 첨부 → 0 RTT로 시작. 단점: *replay attack* 위험 → idempotent 요청에만 안전.

## Cipher Suite 협상

TLS 1.2:
```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
└── 키 교환 + 인증 + 대칭 암호 + MAC
```

TLS 1.3는 단순화:
```
TLS_AES_128_GCM_SHA256
└── 대칭 암호 + MAC (키 교환/인증은 별도 negotiate)
```

iOS는 *강력한 suite만 기본 허용*. ATS가 약한 cipher 차단.

## 인증서 체인 검증

```
Leaf Cert (서버) ── signed by ──► Intermediate ── signed by ──► Root CA
```

OS trust store가 root를 신뢰 + 체인의 각 단계 서명 유효 + 만료 안 됨 + hostname matches SAN → 통과.

체인 검증 실패 흔한 원인:
- intermediate 누락 (서버 설정 미스)
- hostname mismatch (CN vs SAN)
- 만료 (자동 갱신 실패)
- root가 *디바이스에 없음* (사설 CA)

## OCSP / CRL (Revocation 검증)

- **OCSP**: 인증서가 *해지됐는지* 실시간 조회
- **OCSP Stapling**: 서버가 OCSP 응답을 *직접 첨부* (RTT 절약)
- **CRL**: 해지된 cert 목록 (덜 쓰임)
- iOS는 *기본적으로 stapling 사용*, 응답 없으면 *soft-fail* (의심스럽지만 연결)

## App Transport Security (ATS)

iOS 9+ 강제. 기본 정책:
- *HTTP 차단* (HTTPS만)
- TLS 1.2+
- Forward Secrecy 지원 cipher만
- SHA-2 인증서

`Info.plist` 예외 등록은 App Store 심사 시 *정당화 필요*.

## URLSession에서 TLS 동작

```swift
let url = URL(string: "https://api.example.com")!
let (data, _) = try await URLSession.shared.data(from: url)
```

흐름:
1. URLSession이 OS network layer로 위임 → TLS handshake 자동
2. 시스템 trust store로 체인 검증
3. 성공 시 application data 흐름
4. 실패 시 `URLError`

커스텀 검증(*pinning*)은 `URLSessionDelegate`의 challenge에서. 자세히는 [07-networking/network-stack-and-pinning.md](../07-networking/network-stack-and-pinning.md).

## HTTP/2, HTTP/3 (QUIC) 위의 TLS

- HTTP/2: TLS 1.2/1.3 위에서 다중화
- HTTP/3: **QUIC** 위에서 동작 → TLS 1.3 *통합*. UDP 기반이지만 TCP-like 신뢰성

QUIC 장점:
- 연결 시작 시 *0-RTT* 가능 (재방문 시)
- *connection migration* (네트워크 전환 시 끊김 없음)
- *head-of-line blocking* 제거

iOS 15+ 지원 (서버가 alt-svc 헤더로 광고 시 자동).

## 세션 재개 (Session Resumption)

같은 서버 *재방문* 시 handshake 단축:

- **Session ID**: 서버 측 상태 보관 (legacy)
- **Session Ticket**: 클라이언트에 *암호화된 상태*를 저장 (stateless)
- **PSK (TLS 1.3)**: pre-shared key로 0-RTT 가능

URLSession은 자동 활용. 직접 제어 거의 안 됨.

## 보안 강도 측정

면접에서 *"TLS 안전한가요?"* 질문 시 답변 차원:
1. **버전**: TLS 1.2 minimum, 1.3 권장
2. **Cipher**: AEAD (GCM, ChaCha20-Poly1305) 권장
3. **인증**: ECDSA 또는 RSA-2048+
4. **PFS**: Perfect Forward Secrecy (ECDHE)
5. **추가**: HSTS, Certificate Transparency

## 흔한 함정 / Follow-up

- **Q. self-signed cert 개발용?**
  *개발 빌드*에서만 검증 우회. 코드에 `#if DEBUG` 가드 + production 빌드 검증.

- **Q. *공용 WiFi*에서 MITM 위험?**
  pinning 없으면 *악성 root CA 설치된 디바이스*가 MITM 가능. 민감 앱은 pinning.

- **Q. cert 만료 *임박*?**
  배포 사이클보다 TTL 짧으면 위험 → public key pinning + 백업 pin.

- **Q. iOS가 *시스템 root CA*를 어떻게 관리?**
  Apple의 *trust store*에서 신뢰 CA 목록 유지. OS 업데이트로 갱신.

- **Q. *기업 MDM* 환경?**
  관리되는 디바이스에 root CA 강제 설치 가능 → 회사 내 traffic inspection. 사용자 인지 + 정책 동의 필요.

- **Q. iOS 14+에서 *전 사용자에게 새 cert chain 거부* 등 변경 영향?**
  Apple이 *발급 정책 변경*을 종종 한다. cert 갱신 시 OS별 호환 확인.

## 참고

- RFC 8446 (TLS 1.3)
- RFC 7301 (ALPN)
- Apple: Customizing Your App's Data Storage (ATS)
- WWDC 2017: Your Apps and Evolving Network Security Standards
- WWDC 2021: Accelerate networking with HTTP/3 and QUIC
