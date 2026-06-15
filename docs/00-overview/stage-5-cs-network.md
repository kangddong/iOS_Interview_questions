# 5단계 — CS / Network 기본기

> 한 줄 요약 — iOS 도메인 외에도 *거의 모든 면접*에서 묻는 영역. **iOS 컨텍스트와 연결해** 답할 수 있는 깊이가 목표. 단순 정의 암기는 위험.

## 학습 목표

- 프로세스 vs 스레드 + iOS의 *단일 프로세스* 모델
- 메모리 계층(가상 메모리 / 페이징 / CPU 캐시) + iOS jetsam
- 자료구조 시간복잡도와 Swift 컬렉션 매핑
- Big-O 입력 크기별 한도
- Mutex / Semaphore / RWLock / Atomic 차이 + 데드락 4조건
- TCP / UDP / QUIC 차이
- HTTP 메서드 + 상태 코드 + 멱등성 + 캐시
- TLS 1.2 vs 1.3 handshake + pinning
- DNS + URLCache + CDN

## 카테고리

### [13-cs-fundamentals](../13-cs-fundamentals/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [Process vs Thread](../13-cs-fundamentals/process-vs-thread.md) | 주니어 필수 |
| [메모리 모델 (가상메모리/페이징/캐시)](../13-cs-fundamentals/memory-model.md) | 미들 |
| [자료구조 (Swift 매핑)](../13-cs-fundamentals/data-structures.md) | 주니어~미들 |
| [알고리즘 / Big-O](../13-cs-fundamentals/algorithm-complexity.md) | 주니어~미들 |
| [동기화 Primitive](../13-cs-fundamentals/concurrency-primitives.md) | 미들 |
| [System Design 입문](../13-cs-fundamentals/system-design-intro.md) | 시니어 |

### [14-network](../14-network/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [OSI / TCP-IP 계층](../14-network/osi-and-tcp-ip.md) | 주니어 필수 |
| [TCP vs UDP](../14-network/tcp-vs-udp.md) | 주니어 필수 |
| [HTTP 기본](../14-network/http-basics.md) | 주니어 필수 |
| [HTTPS / TLS / Pinning](../14-network/https-and-tls.md) | 미들 |
| [HTTP/2 / HTTP/3 / QUIC](../14-network/http2-http3.md) | 미들 |
| [REST API 설계](../14-network/rest-api-design.md) | 미들 |
| [WebSocket](../14-network/websocket.md) | 미들 |
| [DNS / 네트워크 캐싱](../14-network/dns-and-caching.md) | 미들 |
| [TLS Handshake 심화 (1.2 vs 1.3, 0-RTT, OCSP)](../14-network/tls-handshake-deep.md) | 시니어 |

## 권장 학습 순서

1. **CS 기본** — Process/Thread → 메모리 모델 → 자료구조 → 동기화
2. **네트워크 기본** — OSI → TCP/UDP → HTTP → HTTPS/TLS
3. **시니어 영역** — System Design + TLS Handshake 심화

## 예상 소요 시간

- 주니어 깊이: **5~7일** (대학 CS 수업 기억 환기)
- 미들 깊이: **2주** (구체 예와 측정값까지)
- 시니어 깊이: **3~4주** (System Design + QUIC + 분산 시스템)

## 대표 질문

### 주니어
- 프로세스와 스레드 차이?
- 스택과 힙 차이?
- iOS는 swap이 없는데 메모리 부족 시?
- Array vs Dictionary 시간복잡도?
- Big-O가 뭔가요?
- TCP와 UDP 차이?
- TCP 3-way handshake?
- HTTP 200 / 301 / 401 / 404 / 500 의미?
- HTTPS는 HTTP와 어떻게 다른가?

### 미들
- 데드락이 일어나는 4조건?
- Mutex vs Semaphore?
- Lock vs Actor?
- URL 입력부터 화면 표시까지 흐름?
- WebSocket을 언제 쓰나? (APNs와 비교)
- 멱등성(idempotent)이란?
- 검색 페이지네이션 — offset vs cursor?
- DNS TTL이 *너무 짧으면/길면* 어떤 문제?

### 시니어
- iOS에서 *Sendable*과 동기화 primitive의 관계?
- 메모리 압박 시 OS의 jetsam 동작?
- TLS 1.3가 1-RTT인 메커니즘?
- 0-RTT의 replay attack 위험?
- HTTP/3 (QUIC)이 모바일에 좋은 이유?
- 채팅 앱 시스템 디자인 (offline + 동기화)?
- 100M 사용자 메시징 시스템 — broadcast 전략?

## 다음 단계 진입 조건

- [ ] *iOS 컨텍스트로 변환된* CS 답변 (예: "thread는 자료구조상…" 대신 "iOS는 cooperative pool이라…")
- [ ] TCP/HTTP/TLS의 *흐름을 다이어그램*으로 그릴 수 있음
- [ ] System Design 7관심사(오프라인/토큰/캐시/실시간/푸시/feature flag/관측성) 즉답

→ [stage-6-paradigms](stage-6-paradigms.md)로 진입.

## 모듈 확장 가이드

- 단순 정의는 *낮은 점수*. *iOS 컨텍스트로 변환*된 예시 필수
- 시니어 질문엔 *분산 시스템 / 모바일 특수성*이 들어가야 함
- 다이어그램(텍스트 ASCII) 적극 활용
