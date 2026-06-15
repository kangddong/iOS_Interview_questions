# 학습 로드맵

면접까지 남은 시간에 따라 추천 진행 순서.

## 1단계 — 언어/메모리 기반 (필수)

면접 90% 이상이 이 영역에서 시작한다.

1. [01-swift-language](01-swift-language/README.md) — 값 타입 vs 참조 타입, 옵셔널, 제네릭, 프로토콜
2. [02-memory-management](02-memory-management/README.md) — ARC, retain cycle, capture list
3. [03-concurrency](03-concurrency/README.md) — GCD → async/await → Actor 흐름

## 2단계 — UI 프레임워크

지원 포지션에 따라 UIKit/SwiftUI 비중 조절.

4. [04-uikit](04-uikit/README.md) — 뷰 라이프사이클, Responder Chain, RunLoop
5. [05-swiftui](05-swiftui/README.md) — 선언형 모델, 상태 관리, identity/lifetime

## 3단계 — 아키텍처/실무

6. [06-architecture](06-architecture/README.md) — 패턴 비교, DI, 모듈화
7. [07-networking](07-networking/README.md) — URLSession, Codable
8. [08-persistence](08-persistence/README.md) — 저장소 선택 기준
9. [12-design-patterns](12-design-patterns/README.md) — Delegate, Coordinator 등

## 4단계 — 시니어 영역

10. [09-testing](09-testing/README.md)
11. [10-performance](10-performance/README.md)
12. [11-build-system](11-build-system/README.md)

## 5단계 — CS / Network 기본기

iOS 도메인 외에도 거의 모든 면접에서 묻는 영역.

13. [13-cs-fundamentals](13-cs-fundamentals/README.md) — process/thread, 메모리 모델, 자료구조, 알고리즘, 동기화 primitive
14. [14-network](14-network/README.md) — TCP/UDP, HTTP/HTTPS, TLS handshake, HTTP/2/3, REST, WebSocket, DNS

## 6단계 — 프로그래밍 패러다임

언어 위에서 *어떻게 모델링하는가*. *왜 SwiftUI는 선언형인가*, *왜 Swift는 POP을 권장*인가의 근거.

15. [15-paradigms](15-paradigms/README.md) — OOP 4원칙/SOLID, FP(순수 함수/불변성/Monad), 명령형 vs 선언형

## 레벨별 질문 뱅크

- [주니어](questions/basic.md) — 신입~1년차. 사실 확인 + 한 줄 *왜*
- [3년차 미들](questions/intermediate.md) — 깊이/원리/트레이드오프, 통합 시나리오
- [심화](questions/advanced.md) — 시니어/시스템 디자인

## 학습 우선순위 (3년차 미들 면접 대비)

각 디렉토리의 README에서 *3년차+* 표기된 항목을 우선 학습:

- [01-swift-language/some-vs-any](01-swift-language/some-vs-any.md)
- [02-memory-management/heap-vs-stack](02-memory-management/heap-vs-stack.md)
- [03-concurrency/continuation](03-concurrency/continuation.md), [async-sequence-and-stream](03-concurrency/async-sequence-and-stream.md), [swift6-strict](03-concurrency/swift6-strict.md)
- [04-uikit/rendering-pipeline](04-uikit/rendering-pipeline.md)
- [05-swiftui/custom-layout-and-animatable](05-swiftui/custom-layout-and-animatable.md), [view-graph-and-diffing](05-swiftui/view-graph-and-diffing.md)
- [06-architecture/modularization](06-architecture/modularization.md)
- [08-persistence/core-data-migration](08-persistence/core-data-migration.md)
- [09-testing/snapshot-and-ui-testing](09-testing/snapshot-and-ui-testing.md)
- [10-performance/metrickit-and-crash](10-performance/metrickit-and-crash.md)
- [11-build-system/ci-cd](11-build-system/ci-cd.md)
- [12-design-patterns/factory-strategy-builder](12-design-patterns/factory-strategy-builder.md)
