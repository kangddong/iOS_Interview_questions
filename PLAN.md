# iOS Interview 웹사이트 구축 계획

## Summary

- 기존 `docs/` Markdown 자료를 기반으로 iOS 면접 학습 웹사이트를 구축한다.
- 주요 기능은 지식 베이스 탐색, 주제별 학습, 검색, 레벨별 질문 뱅크, 실전 모의고사다.
- 기술 스택은 `Next.js App Router + TypeScript`를 사용한다.
- v1은 로컬 정적 콘텐츠 기반이며 로그인, 서버 DB, AI 채점은 제외한다.

## Key Changes

- `docs/` Markdown 파일을 빌드 시 파싱해 웹 페이지와 문제 데이터로 변환한다.
- `/topics`에서 전체 문서를 검색하고 카테고리별로 필터링한다.
- `/topics/[...slug]`에서 Markdown 본문, 코드 블록, 표, 관련 질문을 렌더링한다.
- `/questions`에서 `docs/questions/basic.md`, `intermediate.md`, `advanced.md` 기반 질문을 레벨/카테고리/검색어로 탐색한다.
- `/exam`에서 레벨, 문제 유형, 문제 수, 제한 시간을 설정하고 `/exam/session`에서 모의고사를 진행한다.
- 객관식은 자동 채점하고, 주관식은 답변 작성 후 `/exam/result`에서 체크리스트와 관련 문서 링크로 자기 점검한다.
- 모의고사 설정과 결과는 브라우저 `localStorage`에 저장한다.

## Public Interfaces / Types

- `Topic`: Markdown 문서의 slug, 제목, 카테고리, 요약, 본문, 헤딩, 읽기 시간을 표현한다.
- `Question`: 기존 질문 Markdown에서 추출한 주관식 질문을 표현한다.
- `ExamQuestion`: 객관식/주관식 모의고사 문항을 표현한다.
- `ExamSettings`: 레벨, 문제 유형, 문제 수, 제한 시간을 표현한다.
- `ExamResult`: 제출 시간, 점수, 응답, 해설, 관련 문서 링크를 표현한다.

## Test Plan

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- 브라우저에서 홈, 지식 베이스 검색, 모의고사 설정, 세션 진입, 결과 화면 이동을 확인한다.

## Assumptions

- 콘텐츠 소스는 현재 저장소의 `docs/`와 `docs/questions/` Markdown이다.
- 객관식 문제는 품질 관리를 위해 별도 데이터로 작성한다.
- 주관식 AI 자동 평가는 v1 범위에서 제외한다.
- 디자인은 학습 도구에 맞게 정보 밀도 높고 차분한 인터페이스로 구성한다.
