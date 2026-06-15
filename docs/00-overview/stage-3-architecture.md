# 3단계 — 아키텍처 / 실무

> 한 줄 요약 — 패턴 그 자체보다 *왜 이 패턴을 골랐는가*. 네트워크/저장소/디자인 패턴 선택의 트레이드오프를 명확히 답하는 단계. **3년차 미들 면접의 *변별*은 여기서 결정**된다.

## 학습 목표

- MVC/MVVM/Clean Architecture/TCA를 *언제 어떻게* 고르나
- DI를 *생성자/속성/메서드/컨테이너* 중 어떻게 적용
- Coordinator 패턴이 *해결하는 문제*와 *SwiftUI 변형*
- URLSession 설정 — pinning / 백그라운드 / 인증 갱신
- 저장소 7종(UserDefaults, Keychain, FileManager, CoreData, SwiftData, SQLite, CloudKit) 선택 기준
- 토큰 갱신 시 *동시성 충돌*을 어떻게 방지(single-flight)
- 모듈 경계 설계 (Interface vs Impl, 의존 방향)

## 카테고리

### [06-architecture](../06-architecture/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [MVC vs MVVM](../06-architecture/mvc-vs-mvvm.md) | 주니어 필수 |
| [Coordinator](../06-architecture/coordinator.md) | 미들 |
| [Dependency Injection](../06-architecture/dependency-injection.md) | 미들 |
| [Clean Architecture](../06-architecture/clean-architecture.md) | 미들 |
| [TCA](../06-architecture/tca.md) | 미들 |
| [Modularization](../06-architecture/modularization.md) | 미들~시니어 |
| [Layer 명명 컨벤션](../06-architecture/naming-conventions.md) | 미들 |
| [모듈 경계 설계](../06-architecture/module-boundary-design.md) | 시니어 |

### [07-networking](../07-networking/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [URLSession](../07-networking/urlsession.md) | 주니어 필수 |
| [Codable](../07-networking/codable.md) | 주니어 필수 |
| [인증과 토큰 갱신](../07-networking/auth-and-token-refresh.md) | 미들 |
| [TLS Pinning / Trust Evaluation](../07-networking/network-stack-and-pinning.md) | 시니어 |
| [Background / Retry / Multipart](../07-networking/background-tasks-and-retry.md) | 시니어 |

### [08-persistence](../08-persistence/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [UserDefaults](../08-persistence/userdefaults.md) | 주니어 필수 |
| [Keychain](../08-persistence/keychain.md) | 주니어 필수 |
| [FileManager](../08-persistence/file-manager.md) | 주니어 |
| [Core Data와 SwiftData](../08-persistence/core-data-and-swiftdata.md) | 미들 |
| [Core Data Migration](../08-persistence/core-data-migration.md) | 시니어 |
| [저장소 선택 가이드](../08-persistence/storage-selection-guide.md) | 시니어 |

### [12-design-patterns](../12-design-patterns/README.md)

| 핵심 토픽 | 깊이 |
|---|---|
| [Delegate](../12-design-patterns/delegate.md) | 주니어 필수 |
| [Singleton](../12-design-patterns/singleton.md) | 주니어 |
| [Observer (Notification/KVO/Combine)](../12-design-patterns/observer.md) | 미들 |
| [Composition over Inheritance](../12-design-patterns/composition-over-inheritance.md) | 미들 |
| [Factory / Strategy / Builder](../12-design-patterns/factory-strategy-builder.md) | 미들 |
| [Swift Idiomatic Patterns (Closure/Delegate/Combine/Async 선택)](../12-design-patterns/swift-idiomatic-patterns.md) | 시니어 |

## 권장 학습 순서

1. **패턴 비교 먼저** — MVC → MVVM → 본인 팀의 선택 근거 정리
2. **네트워크 실무** — URLSession + Codable + 인증
3. **저장소 매트릭스** — 7종 비교표 머리에 박기
4. **DI / Coordinator** — 테스트 가능성 + 화면 전환
5. **시니어 영역** — 모듈화 + Repository + 단방향 흐름(TCA)

## 예상 소요 시간

- 주니어 깊이: **1주**
- 미들 깊이: **2~3주** ← 3년차 면접 *최소 도달*
- 시니어 깊이: **4~6주** (모듈화 + Clean 깊이 + 인프라까지)

## 대표 질문

### 주니어
- MVC와 MVVM 차이?
- Massive View Controller가 뭐고 어떻게 푸나?
- 토큰을 UserDefaults에 저장하면 왜 안 되나?
- Documents vs Caches 디렉터리 차이?
- Delegate vs Closure 선택 기준?

### 미들
- MVVM에서 ViewModel이 UIKit을 import하면 안 되는 이유?
- Coordinator 패턴이 *해결하는 문제* + SwiftUI 변형?
- DI 4종(init/property/method/container) 트레이드오프?
- TCA의 단방향 흐름 + TestStore가 검증하는 것?
- 토큰 갱신 동시성 충돌 어떻게 방지?
- Codable 다형성(Discriminated Union) 디코딩?

### 시니어
- 모듈 경계 설계 (Interface 모듈 vs Impl 모듈)?
- TLS pinning을 어떻게 안전하게 구현?
- Static vs Dynamic 링크가 런치 타임에 미치는 영향?
- Core Data Lightweight vs Heavyweight vs Progressive 마이그레이션?
- 본인 팀의 Service / Manager / Store 구분 기준?

## 다음 단계 진입 조건

- [ ] *본인이 작성한 코드*의 아키텍처 선택 근거를 1분 안에 설명
- [ ] 401 토큰 갱신 single-flight 코드를 *처음부터* 작성
- [ ] 저장소 7종 비교표를 *외워서* 답변
- [ ] Coordinator/Router 패턴으로 화면 전환 코드 작성

→ [stage-4-senior](stage-4-senior.md)로 진입.

## 모듈 확장 가이드

- *왜*가 빠진 패턴 설명은 의미 없음 — 각 패턴 *해결 문제*부터
- 비교표는 *언제 무엇*을 명시
- 시니어 질문엔 *측정 가능한 트레이드오프*
