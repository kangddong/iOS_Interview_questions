# DNS / 네트워크 캐싱

> 한 줄 요약 — DNS는 **도메인 이름을 IP로 바꿔주는 분산 데이터베이스**. 클라이언트/리졸버/권한 서버 사이에 *캐시*가 여러 단계로 있어, 같은 도메인 두 번째 조회는 거의 즉각.

## DNS 흐름

```
1. 앱 → OS resolver
2. OS 캐시 확인 (TTL 안 지났으면 hit)
3. 없으면 ISP/구성된 resolver (Recursive Resolver) 질의
4. 없으면 Root → TLD (.com) → Authoritative server 순으로 질의
5. 결과 받아 OS/앱 캐시
```

첫 조회는 수십~수백 ms, 캐시 hit는 거의 0ms.

## 레코드 종류

| 레코드 | 의미 |
|---|---|
| **A** | 도메인 → IPv4 |
| **AAAA** | 도메인 → IPv6 |
| **CNAME** | 다른 도메인 alias |
| **MX** | 메일 서버 |
| **TXT** | 임의 텍스트 (SPF, 검증) |
| **NS** | 권한 네임 서버 |
| **SRV** | 서비스 + 포트 |

## TTL (Time To Live)

각 레코드에 *얼마나 캐시할지* 명시 (초). 짧으면 변경 빠르게 반영, 길면 트래픽/지연 절감.

서비스 이전을 앞두고 TTL을 *미리 짧게* 낮춰 둔 뒤 변경하는 게 표준.

## DNS 보안

- 기본 DNS는 *평문 UDP 53*. ISP/공격자가 도청/조작 가능.
- **DoH (DNS over HTTPS)**: HTTPS 위. iOS 14+ 시스템 설정에서 지원.
- **DoT (DNS over TLS)**: 별도 포트 853.
- **DNSSEC**: 응답 *서명*으로 위변조 방지. 보급률 낮음.

## 모바일 컨텍스트

- 셀룰러 ↔ Wi-Fi 전환 시 DNS resolver 바뀜.
- 첫 화면 진입 비용에 DNS RTT 포함.
- HTTP/2/3는 같은 호스트 재사용으로 DNS 영향 줄임.

## DNS 캐시 — iOS

- iOS 자체 DNS 캐시 보유 (MDNSResponder).
- `URLSession`은 OS 캐시에 의존.
- 디버깅 어려움 — 변경이 즉시 반영 안 될 수 있음. 디바이스 재시작이나 비행기 모드 토글로 캐시 클리어.

## URLCache — HTTP 응답 캐시

```swift
let cache = URLCache(memoryCapacity: 20 * 1024 * 1024,
                    diskCapacity:   100 * 1024 * 1024,
                    directory: nil)
config.urlCache = cache
config.requestCachePolicy = .useProtocolCachePolicy
```

서버의 `Cache-Control` 헤더에 따라 자동 캐시. iOS의 강력한 기능이지만 *기본 캐시 사이즈가 작아* 별도 설정.

→ [http-basics.md](http-basics.md)의 캐시 섹션

## 이미지/리소스 캐시 패턴

| 단계 | 캐시 |
|---|---|
| 메모리 | `NSCache` — 빠르지만 메모리 워닝 시 제거 |
| 디스크 | FileManager `Caches/` — OS가 정리 가능 |
| 네트워크 | URLCache 또는 라이브러리 (Kingfisher, Nuke) |

이미지: 메모리 → 디스크 → 네트워크 순으로 hit 검사.

## CDN

서버 *지리적 분산* 캐시. 정적 리소스 (이미지, JS, 동영상)에 효과 큼. 모바일은 *가장 가까운 PoP*에서 받음 → 지연 절감.

## 흔한 함정 / Follow-up

- **Q. 도메인을 옮겼는데 일부 사용자만 옛 IP로 접속.**
  TTL이 길거나 ISP가 *TTL 무시*. 클라에서 강제 캐시 무효화는 거의 불가 — 시간 기다림 또는 *옛/새 서버 둘 다 운영*.

- **Q. HTTP 캐시가 의도와 다르게 동작.**
  `Cache-Control` 헤더 확인. 서버가 안 보내거나 `no-store`면 캐시 안 됨. URLSession 정책도 함께.

- **Q. 토큰처럼 자주 바뀌는 응답을 캐시?**
  `Cache-Control: no-store`. 클라도 디스크에 저장 금지.

- **Q. iPhone 13+의 Private Relay?**
  iCloud+ 서비스. 사용자 IP를 *Apple + 외부 relay*로 가려서 서버에 전달. DNS도 Apple resolver. 일부 IP 기반 분석 깨짐.

- **Q. `Bonjour`/mDNS?**
  로컬 네트워크에서 *.local* 도메인 자동 발견. AirPlay, AirPrint 등 사용. 일반 앱이 직접 다룰 일 적음.

- **Q. iOS DNS 캐시 클리어?**
  공식 API 없음. 비행기 모드 토글, 디바이스 재시작이 일반적. 일부 케이스 `URLSession` 새로 만들기.

## 참고

- RFC 1034/1035 (DNS), RFC 8484 (DoH)
- Apple Docs: URLCache
- WWDC 2020: Enable encrypted DNS
