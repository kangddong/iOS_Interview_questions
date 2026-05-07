# 모듈화 (Modularization)

> 한 줄 요약 — 한 앱을 **여러 SPM/Tuist 모듈로 쪼개** 의존 방향을 컴파일 타임에 강제하고, *변경 영향 범위와 빌드 시간*을 줄이는 작업. 3년차+ 면접에서 *모듈 분리 기준*과 *경계 설계*가 핵심.

## 왜 모듈화하나

1. **빌드 시간** — 변경된 모듈만 다시 빌드. 큰 코드베이스에서 incremental 빌드 효과 큼.
2. **의존 방향 강제** — Domain이 UIKit을 import 못 하게 컴파일 타임 차단.
3. **재사용** — 별도 앱/익스텐션에서 그대로 사용.
4. **소유권** — 팀 단위 책임 분리.
5. **테스트 격리** — 모듈 단위로 빠른 단위 테스트.

## 자주 쓰는 모듈 분리 기준

```
   App                  ← 진입점
   ├── Feature_Login
   ├── Feature_Home
   ├── Feature_Settings
   ├── DesignSystem     ← UI 토큰/컴포넌트
   ├── DomainKit        ← 엔터티, 비즈니스 규칙 (외부 의존 X)
   ├── DataKit          ← Repository 구현, API, DB
   └── CoreUtilities    ← Logging, Date, ext
```

규칙:
- DomainKit은 **Foundation 외 거의 안 import**.
- DataKit은 DomainKit만 import.
- Feature_*는 DomainKit + (필요 시) DataKit.
- DesignSystem은 SwiftUI/UIKit만.
- Feature 간 *직접 import 금지* — 공통 의존은 위로.

## 분리 타이밍 — 너무 일찍/너무 늦게

| 너무 일찍 | 너무 늦게 |
|---|---|
| 의존 그래프 잡기 어려움 | 거대한 앱 타깃 한 덩이 |
| 보일러플레이트 폭증 | 한 줄 변경 시 전체 빌드 |
| public API 설계 부담 | 팀이 같은 파일 만지며 충돌 |

화면 5개 미만이면 *폴더 분리*만으로 충분. 30+ 화면 / 다인 팀이면 모듈 분리 강하게 권장.

## SPM 다중 타깃

```swift
// Package.swift
let package = Package(
    name: "App",
    products: [.library(name: "Feature_Login", targets: ["Feature_Login"])],
    targets: [
        .target(name: "DomainKit"),
        .target(name: "DataKit", dependencies: ["DomainKit"]),
        .target(name: "DesignSystem"),
        .target(name: "Feature_Login", dependencies: ["DomainKit", "DesignSystem"]),
        .testTarget(name: "Feature_LoginTests", dependencies: ["Feature_Login"])
    ]
)
```

같은 패키지 안 다중 타깃 또는 *별도 패키지 + workspace*. 큰 회사는 보통 후자.

## Tuist

Xcode 프로젝트 자체를 *Swift 코드*로 생성. 대규모에 적합:

```swift
let project = Project(
    name: "App",
    targets: [
        .target(name: "Feature_Login", product: .framework, dependencies: [.target(name: "DomainKit")])
    ]
)
```

장점: Xcode 프로젝트 머지 충돌 제거, 의존 그래프 시각화, 코드 생성 + 캐시.

## Static vs Dynamic 모듈

| | Static | Dynamic |
|---|---|---|
| 런치 비용 | 작음 | dylib 로드 시간 |
| 바이너리 크기 | 같은 코드 중복 가능 | 공유 |
| 호환 | 가장 단순 | ObjC class duplication 위험 |
| 권장 | 기본 | 같은 라이브러리를 여러 앱/익스텐션이 공유할 때 |

런치 타임이 중요하면 *static 우선*.

## Public API 설계

모듈을 분리하면 외부에 노출할 API를 *명시*해야 한다 (`public`).

```swift
public struct LoginVM { ... }    // 외부 노출
struct LoginValidator { ... }     // internal — 내부만
```

원칙:
- 기본 internal, *진짜 필요한 것만* public.
- 노출 모델은 안정적이게 — 한 번 public이 되면 호환성 부담.
- public API는 *문서화*.

## 인터페이스 분리 — Reverse Dependency

Feature가 다른 Feature를 *직접* 의존하면 안 된다. 공통 *인터페이스*를 위에서 정의:

```
DomainKit
 └── protocol AuthService { ... }

DataKit
 └── final class AuthAPI: AuthService { ... }

Feature_Login
 └── uses AuthService (DomainKit)
```

DataKit/Feature 모두 DomainKit의 protocol을 보고, *Feature는 DataKit을 import하지 않을 수도 있다* (App 진입점에서 DI로 연결).

## 빌드 시간 효과

- 실험적으로 한 모듈 변경 → 의존하는 모듈만 재빌드.
- *과도하게 작은 모듈*은 link 시간이 늘 수 있음. 일반적으로 5~30개 정도가 좋은 타협.
- `SWIFT_COMPILATION_MODE = wholemodule`을 Release에서 사용.

## 비교 — 폴더 분리 vs 모듈 분리

| | 폴더 분리 | 모듈 분리 |
|---|---|---|
| 의존 방향 | 컴파일이 강제 못 함 | 강제 |
| 빌드 시간 | 한 덩이 | 분리 |
| public 설계 | 불필요 | 필요 |
| 학습 곡선 | 낮음 | 중상 |
| 적정 규모 | 소~중 | 중~대 |

## 흔한 함정 / Follow-up

- **Q. 너무 잘게 쪼개서 link 시간이 폭주.**
  유사 책임의 작은 모듈 두 개를 합치는 *모듈 통합* 검토. 또는 dynamic으로 변경.

- **Q. 같은 protocol을 두 모듈에서 정의하면?**
  *upstream*에 protocol을 두고 두 모듈이 모두 그것을 본다. 또는 별도 *Interfaces* 모듈로 분리.

- **Q. 모듈 간 SwiftUI Preview 깨진다.**
  Preview에서 의존 객체 mock 주입. DesignSystem 내 sample 데이터 제공.

- **Q. 모듈 단위 테스트 vs 통합 테스트?**
  각 모듈에 testTarget. 통합은 App 타깃 또는 별도 IntegrationTests 모듈.

- **Q. 회사가 큰 모놀리스 → 모듈화 마이그레이션?**
  말단 leaf부터 (Utilities, DesignSystem). 그 후 Domain → Data → Feature. 한 번에 다 바꾸려 하지 말 것.

- **Q. App 모듈 = 어떤 책임?**
  진입점, DI 컨테이너 구성, Coordinator/Router, Scene Configuration. *비즈니스 로직 거의 없음*.

## 참고

- WWDC 2019: Modularizing Your App for Performance
- Tuist 공식 문서, swift-package-manager
- Point-Free: Modular Architecture
