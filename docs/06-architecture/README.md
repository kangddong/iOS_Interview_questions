# 06. Architecture

패턴 그 자체보다 *왜 이 패턴을 골랐는가*가 면접 답변의 본체.

## 항목

- [MVC vs MVVM](mvc-vs-mvvm.md) — Massive View Controller, ViewModel 책임 분담
- [Coordinator](coordinator.md) — 화면 전환 책임 분리, SwiftUI Router
- [Dependency Injection](dependency-injection.md) — 생성자/프로퍼티/메서드 주입, DI 컨테이너
- [Clean Architecture](clean-architecture.md) — 레이어, 의존성 역전, Repository
- [TCA](tca.md) — 단방향 데이터 흐름, Reducer, Effect, TestStore
- [모듈화 (Modularization)](modularization.md) — *3년차+*. SPM/Tuist, 의존 방향 강제, public API 설계

## 자주 묻는 질문

- MVVM에서 ViewModel이 View를 모르게 하는 방법 → [mvc-vs-mvvm.md](mvc-vs-mvvm.md)
- Coordinator가 해결하는 문제 → [coordinator.md](coordinator.md)
- Clean Architecture의 Layer 의존 규칙 → [clean-architecture.md](clean-architecture.md)
- 단방향 데이터 흐름의 장점 → [tca.md](tca.md)
- 모듈 분리 기준 → [clean-architecture.md](clean-architecture.md)
- Singleton을 줄이는 방법 → [dependency-injection.md](dependency-injection.md)
