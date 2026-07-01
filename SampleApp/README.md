# SampleApp — iOS Interview 데모

`docs/` 아래 17개 카테고리 정리 내용을 시뮬레이터에서 직접 만져볼 수 있게 만든 iOS 앱.

## 빌드 / 실행

```bash
brew install xcodegen
cd SampleApp
xcodegen
open SampleApp.xcodeproj
```

Xcode에서 SampleApp scheme 선택 → 시뮬레이터(iOS 17+) 실행.

## 구조

- `SampleApp/Core/` — Demo 프로토콜, Registry, LogView, TheoryCard
- `SampleApp/UI/` — RootMenu → Category → DemoHost 네비게이션
- `SampleApp/Demos/<카테고리>/` — 카테고리별 데모 묶음 파일 (한 파일에 여러 데모 struct)
- 각 데모는 `id`, `title`, `summary`, `docPath`(레포 내 마크다운 경로)와 `makeView()`(SwiftUI 뷰)로 구성

새 데모 추가는 다음 순서:
1. 해당 카테고리 파일에 `struct XxxDemo: Demo { ... }` 추가
2. `Core/DemoRegistry.swift`의 카테고리 배열에 `AnyDemo(XxxDemo.self)` 등록

## 의존성

- 표준 라이브러리 only (TCA 데모는 자체 구현한 lite 버전 — 외부 SPM 의존성 없음)
