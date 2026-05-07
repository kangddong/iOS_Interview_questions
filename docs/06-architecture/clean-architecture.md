# Clean Architecture (개념 요약)

> 한 줄 요약 — 코드의 의존 방향을 **외부(UI/DB) → 내부(도메인)**로만 흐르게 강제해서, 도메인 로직이 UI/저장소/네트워크 같은 *바깥세상의 변경*에 영향받지 않게 만드는 원칙.

## 레이어

```
   Presentation (UIKit/SwiftUI/VM)
        │ depends on ↓
   UseCase (애플리케이션 비즈니스 규칙)
        │ depends on ↓
   Domain Model (엔터프라이즈 비즈니스 규칙) — Entity, value type, 순수 Swift
        ↑
        │ implements
   Data (Repository 구현, 네트워크, DB)
```

핵심 규칙: **안쪽 레이어는 바깥쪽을 모른다.** Presentation/Data 레이어는 도메인을 import 하지만, 도메인은 누구도 import하지 않음.

## 의존성 역전 — Repository 패턴

도메인은 "뭘 가져온다"는 *추상*만 알고, 구체 구현은 Data 레이어에서.

```swift
// Domain
protocol UserRepository {
    func find(id: UUID) async throws -> User
}

// Data
final class UserRepositoryImpl: UserRepository {
    private let api: APIClient
    private let cache: Cache
    func find(id: UUID) async throws -> User {
        if let u = cache.user(id) { return u }
        let dto = try await api.get(id)
        return dto.toDomain()
    }
}
```

Domain은 `URLSession`/`Core Data`를 모름. 갈아 끼워도 Domain 코드는 그대로.

## UseCase

도메인 규칙의 *실행 흐름*을 표현하는 객체. 함수 하나로 충분한 경우도 많음.

```swift
final class LoginUseCase {
    let auth: AuthService
    let user: UserRepository

    func execute(email: String, pw: String) async throws -> User {
        let token = try await auth.login(email: email, password: pw)
        try Token.store(token)
        return try await user.findMe()
    }
}
```

VM은 UseCase를 호출만 하고, 도메인 분기는 UseCase 안에 캡슐화.

## 모듈화로 강제하기

같은 프로젝트라도 SPM/Tuist 등으로 모듈을 분리하면 *컴파일 타임에* 의존 방향을 강제할 수 있음.

```
App
 ├── Feature_Login
 ├── Feature_Home
 ├── DomainKit          ← 핵심 비즈니스 (외부 의존 X)
 ├── DataKit            ← URLSession, CoreData
 └── DesignSystem
```

DomainKit은 Foundation 외엔 거의 import 안 함. Feature_*은 Domain만 의존.

## 비교 — Clean vs MVVM only

| 구분 | MVVM만 | + Clean |
|---|---|---|
| 적정 규모 | 소~중 | 중~대 |
| 도메인 로직 위치 | VM에 섞이기 쉬움 | UseCase/Entity로 명확 |
| 학습 곡선 | 낮음 | 중간 |
| 테스트 | VM 단위 | UseCase가 더 단위테스트 친화 |
| 모듈화 | 선택 | 거의 필수 |

작은 앱에 Clean을 욱여넣으면 보일러플레이트가 비효율 → *팀 규모/도메인 복잡도*에 맞춰서.

## 흔한 함정 / Follow-up

- **Q. UseCase가 너무 얇아서 VM에서 직접 Repository 부르는 게 낫지 않나?**
  단순 CRUD면 그래도 됨. UseCase는 *여러 repository를 조합하는 흐름*이 있을 때 가치가 큼.

- **Q. Domain 레이어에 Codable을 둬도 되나?**
  보통 분리. 네트워크 DTO와 도메인 모델은 다른 변경 주기를 가짐. DTO → Domain mapper를 두는 게 깔끔.

- **Q. SwiftUI에서 도메인 모델을 `@Observable`로 만들면?**
  Observation은 SwiftUI에 종속됨. 도메인은 가능하면 *순수*하게 두고, ViewModel에서 `@Observable` 래핑.

- **Q. iOS에서 Clean이 과한 경우?**
  화면 5~6개의 단순 앱, 1~2인 팀. 그냥 MVVM + 폴더 분리로도 충분.

- **Q. VIPER와의 차이?**
  VIPER는 Clean의 한 구체적 구현(Router/Presenter/Interactor 강제 분리). 보일러플레이트가 많아 요즘은 *MVVM + Coordinator + Clean*조합이 더 인기.

## 참고

- Robert C. Martin: Clean Architecture
- Point-Free: Modular Architecture
- WWDC: Modularize your apps with Swift Packages
