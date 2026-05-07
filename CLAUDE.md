# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 레포 목적

iOS 기술 면접 대비를 위한 학습/정리 레포. 실행 가능한 코드보다 **개념 정리 + 질문/모범답변 + 심화 비교**가 1차 산출물이다. 따라서 빌드/테스트 파이프라인은 없으며, 모든 작업은 `docs/` 마크다운 편집이 중심이 된다.

## 디렉토리 구조와 의도

```
docs/
  00-overview.md           # 전체 학습 로드맵 (기초→심화 순서)
  01-swift-language/       # Swift 언어 자체 (값/참조, 제네릭, PAT, 프로퍼티 래퍼, 매크로 등)
  02-memory-management/    # ARC, retain cycle, weak/unowned, autoreleasepool, capture list
  03-concurrency/          # GCD, Operation, RunLoop, async/await, Actor, Sendable, Task
  04-uikit/                # 뷰 라이프사이클, Responder Chain, AutoLayout, Runloop, 렌더링
  05-swiftui/              # 선언형 모델, @State/@Binding/@Observable, identity/lifetime, diffing
  06-architecture/         # MVC/MVVM/VIPER/TCA/Clean, 의존성 주입, 모듈화
  07-networking/           # URLSession, Codable, 인증, 캐시, 재시도, 멀티파트
  08-persistence/          # UserDefaults, Keychain, FileManager, CoreData, SwiftData
  09-testing/              # XCTest, Swift Testing, mocking, snapshot, UI test
  10-performance/          # Instruments, 이미지/스크롤 최적화, 메인 스레드 hitch
  11-build-system/         # Xcode build phases, SPM, xcconfig, scheme, signing
  12-design-patterns/      # Delegate, Coordinator, Factory, Observer, Composition 등
  questions/
    basic.md               # 신입~주니어 빈출 질문
    intermediate.md        # 3~5년차 수준
    advanced.md            # 시니어/시스템 디자인 수준
  _templates/
    topic.md               # 새 토픽 문서 작성 시 골격
    qna.md                 # 새 Q&A 작성 시 골격
```

각 토픽 디렉토리는 `README.md`(개요/링크 인덱스)와 주제별 `*.md`로 구성한다. 새 문서를 만들 때는 `docs/_templates/`의 골격을 복사해서 시작하라.

## 문서 작성 규칙

- **답변 구조 고정**: 모든 Q&A는 `한 줄 요약 → 핵심 개념 → 코드 예시(필요 시) → 흔한 함정/Follow-up`의 4단 구조를 유지한다. 면접 현장에서 이 흐름 그대로 말할 수 있게 쓰는 것이 목적.
- **"왜"를 빠뜨리지 말 것**: 단순 사실 나열은 면접 준비용으로 가치가 낮다. 각 개념은 *어떤 문제를 해결하기 위해 존재하는지*를 한 줄이라도 적는다.
- **비교 포인트 강조**: `weak vs unowned`, `class vs struct`, `GCD vs async/await`, `@State vs @StateObject vs @Observable` 같은 비교 표는 별도 섹션 `## 비교`로 명시한다. 면접에서 가장 많이 묻는 형태.
- **버전 명시**: Swift 동시성, SwiftData, Observation 매크로처럼 버전 의존적인 내용은 `Swift 5.9+` / `iOS 17+`처럼 도입 버전을 반드시 표기.
- **코드 예시는 최소 단위**: 실행보다 *읽고 이해*가 목적. import 문/보일러플레이트 생략, 핵심 표현만.
- **상호 참조**: 같은 개념이 여러 토픽에 걸칠 때(예: `@MainActor`는 03-concurrency와 04-uikit 양쪽) 한쪽에 본문, 나머지에 링크.

## 새 문서 추가 워크플로

1. 해당 토픽 디렉토리의 `README.md` 인덱스에 항목 추가
2. `docs/_templates/topic.md` 또는 `qna.md` 복사해서 본문 작성
3. 관련 질문이 생기면 `docs/questions/{레벨}.md`에 한 줄 질문 + 답변 문서 링크 추가

## 작업 시 주의

- 한국어로 작성. 기술 용어(예: ARC, Sendable, retain cycle)는 원문 유지.
- 빌드/실행 가능한 Xcode 프로젝트가 필요한 경우에만 별도 디렉토리(`samples/`)를 만든다. 기본은 마크다운 only.
- 답변을 *암기용 카드*처럼 압축해서 쓰되, 심화 섹션은 풀어 써도 된다 — 두 모드를 한 문서에 공존시키는 것이 이 레포의 핵심 포맷.
