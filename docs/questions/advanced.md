# 심화 질문 (시니어 / 시스템 디자인)

답변에 *트레이드오프*와 *측정 근거*를 포함해야 한다.

## Swift / 런타임

- [ ] Swift 메서드 디스패치 (static / vtable / witness table / objc_msgSend) 분류 기준
- [ ] 제네릭 특수화(specialization)와 바이너리 사이즈
- [ ] Existential container의 비용
- [ ] Macro의 컴파일 단계 동작

## Concurrency

- [ ] Swift Concurrency 런타임 (cooperative thread pool, hop)
- [ ] Actor의 reentrancy로 인한 race condition 패턴
- [ ] Strict concurrency (Swift 6) 마이그레이션 전략
- [ ] AsyncStream backpressure 처리

## Performance / System

- [ ] 앱 런치 타임 단계별 최적화 (pre-main, main, first frame)
- [ ] 60/120Hz 디스플레이 환경에서 hitch 정의와 측정
- [ ] 대량 이미지를 부드럽게 스크롤하기 위한 파이프라인 설계
- [ ] 바이너리 사이즈를 줄이는 방법
- [ ] 메모리 압박 상황에서 OS의 jetsam 동작과 대응

## Architecture / System Design

- [ ] 100명 이상 협업하는 iOS 앱의 모듈 구조 설계
- [ ] Feature flag / 원격 설정 시스템 설계
- [ ] 오프라인 지원 + 서버 동기화 (충돌 해결, 큐잉)
- [ ] 채팅/실시간 기능 (WebSocket vs polling, reconnect)
- [ ] 로그/모니터링/크래시 리포트 파이프라인
- [ ] A/B 테스트 인프라
- [ ] 결제 / IAP / 영수증 검증

## Build / Release

- [ ] 빌드 타임을 분 단위로 줄이기 — incremental, module separation, prebuilt
- [ ] CI에서 코드 사이닝 자동화 전략
- [ ] 점진적 모듈화 마이그레이션

## 보안

- [ ] HTTPS pinning, 우회 방어
- [ ] Jailbreak detection, 안티탬퍼
- [ ] Keychain 접근 정책과 데이터 보호 클래스
