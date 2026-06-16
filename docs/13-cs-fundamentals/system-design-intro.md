# System Design 입문 (모바일 클라이언트 관점)

> 한 줄 요약 — 시니어 면접의 시스템 디자인은 *백엔드 설계*가 아니라 *모바일 클라이언트가 어떤 트레이드오프를 어떻게 다루는가*에 가깝다. **오프라인/동기화**, **인증/토큰**, **캐시 계층**, **실시간**, **푸시**, **A/B와 feature flag**, **관측성** — 7가지 관심사로 정리하면 답변이 안정적.

## 답변 프레임워크

면접관이 *"채팅 앱 설계해보세요"* 같은 질문을 던지면:

1. **기능 요구사항 확인** (2분) — 1:1 / 그룹 / 미디어 / 그룹 크기 / 동시 사용자 수
2. **비기능 요구사항** (2분) — 오프라인 동작? 메시지 순서 보장? E2E 암호화?
3. **API 경계 정의** (3분) — REST / WebSocket / SSE 어디 쓰는지
4. **데이터 모델** (3분) — 클라이언트 캐시 + 서버 sync 정책
5. **상태 동기화** (3분) — 충돌 해결, last-write-wins vs CRDT
6. **보안** (2분) — 토큰, pinning, E2E
7. **관측성/실패 처리** (2분) — 로그, 메트릭, 재시도

## 7가지 관심사

### 1) 오프라인 / 동기화

- 로컬 *truth*를 어디에? (Core Data, SQLite)
- 서버 *truth*와 충돌 시 어느 쪽 우선?
- **Sync token** 또는 **Vector clock**로 *마지막 동기화 시점* 추적
- 큐잉된 변경: 네트워크 복귀 시 *순서대로 flush*

저장소 결정 트리: [08-persistence/storage-selection-guide.md](../08-persistence/storage-selection-guide.md)

### 2) 인증 / 토큰

- Access token (짧음, JWT) + Refresh token (긴, opaque)
- 401 응답 시 *single-flight refresh* → 자세히는 [07-networking/auth-and-token-refresh.md](../07-networking/auth-and-token-refresh.md)
- Keychain 저장 + biometric 게이트 (옵션)

### 3) 캐시 계층

```
View ── ViewModel ── Cache (메모리) ── Cache (디스크) ── Network
                          │             │
                       NSCache        FileManager
                       (LRU auto)     (영구)
```

- HTTP 캐시 (URLCache)는 *기본*. ETag/Last-Modified 활용
- 이미지: 메모리 LRU + 디스크 LRU 2단
- TTL/invalidation 명시 (사용자 액션 후 등)

### 4) 실시간

| 기술 | 사용 |
|---|---|
| WebSocket | 양방향, 채팅/실시간 게임 |
| SSE (Server-Sent Events) | 단방향 push, 알림 stream |
| Long polling | 옛 환경 호환 |
| MQTT | IoT, 저전력 |

- 재연결 + heartbeat (ping/pong) 직접 구현
- 메시지 큐잉: 연결 끊긴 동안 *서버 측 큐*

### 5) 푸시 알림

- APNs (Apple Push Notification service)
- 페이로드 4KB 제한
- *Silent push*로 백그라운드 동기화 트리거 가능
- *알림 그룹화*, *thread-id*, *attachment*
- Provisional authorization으로 *사용자 동의 전* 조용한 알림

### 6) Feature Flag / A/B 테스트

- 원격 설정 서비스 (Firebase Remote Config, LaunchDarkly, GrowthBook)
- 클라이언트 *부팅 시 fetch* → 캐시 → 다음 부팅에 반영
- 동기 fetch는 *런치 타임* 영향 — async + cached value 사용
- A/B 결과는 analytics에 *variant* 함께 기록

### 7) 관측성

| 종류 | 도구 |
|---|---|
| Crash | Crashlytics, Sentry, Apple Organizer |
| 사용자 메트릭 | MetricKit |
| 분석 이벤트 | Amplitude, Firebase, Mixpanel |
| 로그 | os_log + 백엔드 수집 (옵션) |
| 트레이스 | OpenTelemetry (실험적 iOS 지원) |

## 대표 시나리오

### 채팅 앱

- WebSocket 연결, 재연결, message ack
- 로컬 SQLite에 메시지 + sync token
- 사진/비디오: presigned URL로 직접 업로드 (백엔드 거치지 않음)
- E2E: 키 교환, secure enclave 활용

### 오프라인 우선 (메모/일기)

- *로컬이 truth*, 서버는 동기화 백업
- 충돌: *마지막 수정 시간 + device id*로 deterministic 선택
- Document-level CRDT 또는 OT 고려

### 비디오 스트리밍

- HLS / DASH 적응형 스트리밍
- *seek to live* 정책
- DRM (FairPlay)
- 배경 재생, AirPlay/Chromecast

### 결제

- StoreKit 2 (자동/수동 갱신)
- 영수증 검증 (서버 측)
- *복원 구매* 처리
- 정기구독 cancellation/refund 콜백

## 자주 묻는 함정

- **Q. 메시지 순서 보장?**
  로컬 timestamp 신뢰 X (시계 불일치). 서버 sequence number를 truth로.

- **Q. 토큰 만료 중 동시 요청?**
  Single-flight refresh + 대기 큐. 자세히는 token refresh 문서.

- **Q. 큰 이미지 업로드 중 백그라운드 진입?**
  Background URLSession + multipart streaming.

- **Q. 오프라인에서 큐잉된 변경이 *재시도*되는 동안 사용자가 또 변경?**
  Optimistic UI + version 충돌 시 사용자에게 *수동 merge UI*.

- **Q. 데이터 모델 *마이그레이션* 중 사용자?**
  점진적 마이그레이션, 마이그레이션 중에도 *기본 기능 유지*. 실패 시 *rollback* 경로.

- **Q. 사용자가 *여러 디바이스* 사용?**
  Sync token이 *디바이스별*. last-modified by device id 활용.

## 시니어 답변 체크리스트

면접 시스템 디자인 답변에 포함하면 좋은 키워드:

- [ ] 오프라인 동작 정책 (read/write 각각)
- [ ] 충돌 해결 전략 (LWW, CRDT, 사용자 결정)
- [ ] 캐시 계층과 TTL
- [ ] 토큰 갱신 single-flight
- [ ] 재시도 + idempotency
- [ ] 백그라운드 작업 (BGTask, BackgroundURLSession)
- [ ] feature flag로 *점진 출시*
- [ ] 관측성 (crash, MetricKit, 분석)
- [ ] 보안 (Keychain, pinning, encryption)
- [ ] *측정 가능한 성공 지표* (p99, crash-free, hitch ratio)

## 참고

- WWDC 2021: Use the latest in user notifications
- WWDC 2023: Discover String Catalogs (i18n 부분)
- Designing Data-Intensive Applications (Kleppmann) — 일반론
- Mobile System Design Interview Guide (Alex Xu)
