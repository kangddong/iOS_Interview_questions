# 06. Architecture

> 한 줄 요약 — 아키텍처는 *책임 분리 + 의존 방향 통제*. 어떤 패턴이든 핵심은 **테스트 가능성·재사용성·변경 영향 범위 제한** 세 가지를 어떻게 푸는가다.

패턴 그 자체보다 *왜 이 패턴을 골랐는가*가 면접 답변의 본체.

## 패턴 한눈에 비교

| 패턴 | 책임 분리 | View가 아는 것 | Test 난이도 | 적합한 규모 |
| --- | --- | --- | --- | --- |
| **MVC** (Apple식) | View / Controller / Model | View ↔ Controller 강결합 | 어려움 (Massive VC) | 소규모, 프로토타입 |
| **MVVM** | + ViewModel | ViewModel만 (Model 모름) | 쉬움 (VM 단위 테스트) | 중대규모, 일반 추천 |
| **VIPER** | View/Interactor/Presenter/Entity/Router | 매우 분리 | 매우 쉬움 | 대규모 팀, 보일러플레이트 ↑ |
| **Coordinator** | + 화면 전환 책임 | Coordinator가 navigation 소유 | View 재사용 ↑ | 중대규모 |
| **Clean Architecture** | Domain / Data / Presentation 레이어 | 안쪽 레이어는 바깥 모름 | 매우 쉬움 | 대규모, 장수명 앱 |
| **TCA** | State / Action / Reducer / Effect | 단방향 데이터 흐름 | 매우 쉬움 (TestStore) | SwiftUI 시대, 복잡 상태 |

## 핵심 개념 5선

### 1. 책임 분리의 *왜*
- **단일 책임 원칙(SRP)**: 한 타입은 한 가지 *변경 이유*만 가져야.
- "Massive View Controller" — Apple MVC의 Controller가 *모든* 책임을 떠안음 → ViewModel/Coordinator/UseCase로 쪼개는 동기.
- 면접 단골: "MVVM에서 ViewModel은 View를 모르는데 어떻게 갱신하나?" → 바인딩(KVO/Combine/Closure/`@Observable`)으로 *변경을 흘려보냄*.

### 2. 의존성 방향 (Dependency Inversion)
- 안정적인 코드(추상)는 바깥, 변하기 쉬운 코드(구체)는 안쪽 → **불안정 → 안정** 방향만 허용.
- Clean Architecture: Domain ← Data, Domain ← Presentation. Domain은 누구도 모름.
- 위반 시: Repository가 UIKit을 import하면? 도메인이 UI 변경에 영향받음.

### 3. Dependency Injection
- 의존성을 *외부에서 주입* → 테스트 시 fake/stub 교체 가능.
- 방식: **생성자 주입** (가장 명시적) / **프로퍼티 주입** / **메서드 주입** / **환경(EnvironmentValues)** (SwiftUI).
- DI 컨테이너 도입은 보통 *과한 추상화*. Swift는 생성자 주입으로 충분히 깔끔.

### 4. 단방향 데이터 흐름 (Unidirectional Data Flow)
- TCA / Redux 계열: `State → View → Action → Reducer → State'`. 양방향 바인딩의 *디버깅 지옥*을 막음.
- 장점: 상태 변경 *추적 가능*, time-travel debugging, 테스트 결정론적.
- 비용: 보일러플레이트, 작은 화면엔 과함.

### 5. 모듈화 (Modularization)
- 기능별 SPM/Tuist 모듈 분리 → 빌드 캐시, 경계 명확화, 팀 분담.
- **Interface vs Implementation 분리**: Feature 모듈은 Service의 *인터페이스만* 의존, 구체는 App 레이어에서 조립.
- 의존 방향을 *모듈 그래프*로 강제. 순환 의존은 빌드 단계에서 차단.

## 어떤 패턴을 고를 것인가

```
프로토타입 / 1주 안 끝나는 화면      → MVC로 충분
일반 앱, 1~수십 화면                → MVVM + (필요 시) Coordinator
복잡 상태, SwiftUI 기반              → TCA 또는 @Observable + Reducer 패턴
대규모, 장수명, 멀티 팀              → Clean + Modularization
```

→ 면접 답변 구조: 화면 규모 / 팀 크기 / 상태 복잡도 / 테스트 요구 4가지 축으로 트레이드오프 설명.

## 항목

- [MVC vs MVVM](mvc-vs-mvvm.md) — Massive View Controller, ViewModel 책임 분담
- [Coordinator](coordinator.md) — 화면 전환 책임 분리, SwiftUI Router
- [Dependency Injection](dependency-injection.md) — 생성자/프로퍼티/메서드 주입, DI 컨테이너
- [Clean Architecture](clean-architecture.md) — 레이어, 의존성 역전, Repository
- [TCA](tca.md) — 단방향 데이터 흐름, Reducer, Effect, TestStore
- [모듈화 (Modularization)](modularization.md) — *3년차+*. SPM/Tuist, 의존 방향 강제, public API 설계
- [레이어 명명 컨벤션](naming-conventions.md) — Service / Store / Manager / Provider / Presenter / Launcher / Logger 직교 분리

## 시니어

- [모듈 경계 설계 (Interface vs Impl / 의존 방향 / Static vs Dynamic)](module-boundary-design.md)

## 자주 묻는 질문

- MVVM에서 ViewModel이 View를 모르게 하는 방법 → [mvc-vs-mvvm.md](mvc-vs-mvvm.md)
- Coordinator가 해결하는 문제 → [coordinator.md](coordinator.md)
- Clean Architecture의 Layer 의존 규칙 → [clean-architecture.md](clean-architecture.md)
- 단방향 데이터 흐름의 장점 → [tca.md](tca.md)
- 모듈 분리 기준 → [clean-architecture.md](clean-architecture.md)
- Singleton을 줄이는 방법 → [dependency-injection.md](dependency-injection.md)
- 본인 팀의 Service / Manager / Store 구분 기준 → [naming-conventions.md](naming-conventions.md)
- `NetworkManager`는 왜 `NetworkService`가 아닌가 → [naming-conventions.md](naming-conventions.md)
- `LocationService`를 `LocationStore`로 부르는 게 더 정확한 경우 → [naming-conventions.md](naming-conventions.md)
