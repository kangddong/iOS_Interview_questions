# 학습 로드맵

> 한 줄 요약 — 면접까지 남은 시간에 따라 추천 진행 순서. 6단계로 나뉘며 각 단계는 *독립 파일*로 관리되어 병렬 확장 가능.

## 6단계 한눈에

| 단계 | 파일 | 주요 카테고리 |
|---|---|---|
| 1단계 — 언어/메모리 기반 (필수) | [stage-1-foundation](stage-1-foundation.md) | Swift Language · Memory · Concurrency |
| 2단계 — UI 프레임워크 | [stage-2-ui](stage-2-ui.md) | UIKit · SwiftUI |
| 3단계 — 아키텍처/실무 | [stage-3-architecture](stage-3-architecture.md) | Architecture · Networking · Persistence · Design Patterns |
| 4단계 — 시니어 영역 | [stage-4-senior](stage-4-senior.md) | Testing · Performance · Build System |
| 5단계 — CS / Network 기본기 | [stage-5-cs-network](stage-5-cs-network.md) | CS Fundamentals · Network |
| 6단계 — 프로그래밍 패러다임 | [stage-6-paradigms](stage-6-paradigms.md) | OOP · FP · 명령형 vs 선언형 |

## 모듈화 의도

각 stage 파일은 *완전 독립*이라 다음이 가능:

- **병렬 확장**: 서로 다른 stage 파일을 동시에 편집해도 머지 충돌 없음
- **서브 에이전트 분담**: "agent A는 stage-2, agent B는 stage-4 채워" 식으로 직교 분리
- **선택적 학습**: 필요한 stage만 깊게 파는 사용자별 경로

각 stage 파일 내부 구조 (고정 템플릿):

```
1. 학습 목표 (어떤 면접 질문에 답할 수 있게 되는가)
2. 카테고리 링크 (이 stage의 카테고리들 + 핵심 토픽)
3. 권장 학습 순서
4. 예상 소요 시간
5. 대표 질문 (주니어 / 미들 / 시니어)
6. 다음 단계 진입 조건
```

## 레벨별 질문 뱅크

- [주니어](../questions/basic.md) — 신입~1년차. 사실 확인 + 한 줄 *왜*
- [3년차 미들](../questions/intermediate.md) — 깊이/원리/트레이드오프, 통합 시나리오
- [심화](../questions/advanced.md) — 시니어/시스템 디자인

## 시간별 추천 경로

| 남은 시간 | 권장 |
|---|---|
| 1주 | stage-1 + stage-2 *주니어* 레벨만 |
| 2주 | stage-1, 2, 3 *주니어/미들* |
| 1개월 | stage-1~4 *미들* 깊이까지 |
| 2개월+ | 전체 stage *시니어* 깊이 + 모의고사 반복 |

## 학습 → 검증 파이프라인

각 카테고리에서:
1. 토픽 본문 학습
2. *체크 퀴즈* (객관식 4-5문항, 80% 통과) — `/quiz/<slug>`
3. mastery 1 → 2 → 3 (3 → 7 → 21일 spaced repetition)
4. 카테고리 모든 토픽 퀴즈 통과 → *총정리 모의고사* 활성

자세히는 [/learn](/) (대시보드), [/review](/) (복습 큐).
