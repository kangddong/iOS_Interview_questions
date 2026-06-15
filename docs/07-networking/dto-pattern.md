# DTO / Domain Model 분리

> 한 줄 요약 — *서버 스키마 변화*가 도메인/뷰 레이어로 전파되지 않도록, 와이어 포맷을 받는 `DTO`와 비즈니스 규칙을 가진 `Domain Model`을 *분리하고 매핑 레이어*로 잇는다.

언어 의존성 없음. iOS 13+에서 Combine, 17+에서 Observation과 자연스럽게 결합.

## 핵심 개념

- **DTO (Data Transfer Object)**
  - `Decodable`/`Encodable`만 구현. 모든 property는 *서버가 보내는 형태 그대로* — 옵셔널/원시 타입 위주.
  - 도메인 로직 0. `var isExpired: Bool`처럼 의미를 가진 computed property를 넣지 않는다.
- **Domain Model**
  - 옵셔널을 *불변 보장 형태*로 좁힌다. 예: 서버 `String?`이지만 도메인에선 `URL` non-optional.
  - 비즈니스 규칙(상태 머신, 검증)을 가진다. `Equatable`/`Hashable`로 뷰에서 diffing.
- **Mapper / Adapter**
  - `DTO -> Domain` 단방향이 일반적. 실패 가능하므로 `throws` 또는 `Result`로 반환.
  - 매핑 실패는 *해당 항목만 drop*할지 *전체 실패*로 할지 정책 결정 — 리스트 응답에서 흔한 분기점.
- **분리 이유**
  1. 서버가 키 이름을 바꿔도 뷰까지 안 깨진다.
  2. BFF/Gateway가 여러 개일 때, 각 BFF DTO가 같은 Domain으로 수렴.
  3. 테스트 — 도메인 로직은 DTO 없이 테스트 가능.
  4. 옵셔널 폭발 방지 — UI에서 `??`를 반복하지 않는다.

## 동작 원리 / 매핑 정책

매핑 단계는 4가지 결정을 내린다.

| 결정 | 선택지 |
|---|---|
| 옵셔널 좁힘 | 기본값 / 에러 throw / nil 유지 |
| 타입 강화 | `String → URL/UUID/Enum` (실패 시 throw) |
| 파생 필드 | DTO엔 없는 `displayName` 등을 mapper에서 계산 |
| 리스트 부분 실패 | `compactMap(try?)` (관대) vs `try [...].map` (엄격) |

## 코드 예시

### 1) DTO와 Domain 분리

```swift
// MARK: - DTO (서버 스키마 그대로)
struct UserDTO: Decodable {
    let id: String
    let name: String?
    let avatar_url: String?
    let created_at: String       // ISO8601
    let role: String             // "admin" | "member" | "guest" | ...
}

// MARK: - Domain (UI/비즈니스가 보는 형태)
struct User: Equatable, Identifiable {
    enum Role { case admin, member, guest }
    let id: ID
    let displayName: String      // name이 nil이면 "Unknown"
    let avatar: URL?             // 잘못된 문자열이면 nil
    let createdAt: Date          // 파싱 실패 시 throw
    let role: Role               // 알 수 없는 role은 .guest로 fallback

    struct ID: Hashable { let raw: String }
}
```

### 2) Mapper

```swift
enum UserMappingError: Error { case invalidDate(String) }

extension User {
    init(dto: UserDTO, iso: ISO8601DateFormatter = .api) throws {
        guard let date = iso.date(from: dto.created_at) else {
            throw UserMappingError.invalidDate(dto.created_at)
        }
        self.id = ID(raw: dto.id)
        self.displayName = dto.name?.trimmingCharacters(in: .whitespaces)
                              .nilIfEmpty ?? "Unknown"
        self.avatar = dto.avatar_url.flatMap(URL.init(string:))
        self.createdAt = date
        self.role = Role(serverString: dto.role)
    }
}

extension User.Role {
    init(serverString s: String) {
        switch s {
        case "admin":  self = .admin
        case "member": self = .member
        default:       self = .guest   // 알 수 없는 값 fallback
        }
    }
}
```

### 3) 리스트 부분 실패 정책

```swift
// 관대 — 깨진 항목 1개가 화면 전체를 막지 않게
let users: [User] = dtos.compactMap { try? User(dto: $0) }

// 엄격 — 결제/주문처럼 누락이 치명적
let users: [User] = try dtos.map { try User(dto: $0) }
```

UI 리스트 → 관대, 결제/송금 → 엄격. *정책을 mapper가 정하지 않고 호출자가 정한다*가 핵심.

### 4) 서비스 레이어 통합

```swift
protocol UserService {
    func loadUsers() async throws -> [User]
}

final class UserAPIService: UserService {
    let client: APIClient
    func loadUsers() async throws -> [User] {
        let dtos: [UserDTO] = try await client.get("/users")
        return dtos.compactMap { try? User(dto: $0) }
    }
}
```

호출부는 `UserDTO`를 모른다 — 서버 schema가 바뀌어도 `UserAPIService` 내부만 수정.

### 5) BFF 패턴 — 여러 백엔드를 한 도메인으로 수렴

```swift
// Legacy REST
struct LegacyUserDTO: Decodable { let userId: String; let userName: String? }

// New GraphQL BFF
struct GraphUserDTO: Decodable { let id: String; let displayName: String? }

extension User {
    init(legacy d: LegacyUserDTO) { /* ... */ }
    init(graph d: GraphUserDTO) { /* ... */ }
}
```

도메인은 *어디서 왔는지 모른다*. 마이그레이션 중 두 백엔드를 동시에 운용해도 뷰 코드는 동일.

## 비교

| 구분 | DTO 단일 사용 | DTO + Domain 분리 |
|---|---|---|
| 초기 비용 | 낮음 | 중간 (코드 2배) |
| 서버 변경 영향 범위 | 전 레이어 | API 레이어 한정 |
| 옵셔널 폭발 | 자주 | 거의 없음 |
| 비즈니스 로직 위치 | 흩어짐 | Domain에 집중 |
| 테스트 용이성 | 낮음 | 높음 |
| 적합 규모 | 프로토타입/소규모 | 프로덕션/장기 운영 |

| 매핑 위치 | 장점 | 단점 |
|---|---|---|
| Service 안 | 호출부 단순 | Service가 커짐 |
| 별도 Mapper 타입 | 테스트 격리 | 파일/타입 증가 |
| Domain init(dto:) | 의존성 한 방향 | 도메인이 DTO를 import |
| Reverse direction (Domain init + DTO.init(domain:)) | 타입 안전 | 보일러플레이트 |

## 흔한 함정 / Follow-up

- **Q. DTO에 computed property `var fullName: String { ... }`를 넣어도 되나?**
  - A. 비추. 그건 *도메인 의미*다. DTO가 뷰에서 직접 사용되기 시작하면 분리의 의미가 사라진다.
- **Q. 매번 mapper를 쓰는 건 보일러플레이트 아닌가?**
  - A. 초기엔 그렇지만 *서버가 한 번이라도 변경되면* 비용 회수. 작은 화면은 `typealias User = UserDTO`로 시작해 점진 도입 가능.
- **Q. SwiftUI에서 DTO를 그대로 `ForEach`에 쓰면?**
  - A. DTO `Equatable`이 서버 키 추가만으로 깨지고, 옵셔널 unwrap이 뷰에 흩어진다. Diffing/Identity가 망가지면 성능 hitch.
- **Q. 깊게 중첩된 응답에서 일부 필드만 쓴다.**
  - A. DTO를 *부분 디코딩*으로 만들고 mapper에서 쓰는 것만 추출. 또는 `KeyPath` 기반 `nestedContainer`로 한 단계만 파고들어 평탄화.
- **Q. 서버가 새 필드를 추가했다 — DTO를 매번 수정해야 하나?**
  - A. `Decodable`은 *모르는 키는 무시*하므로 추가 자체는 안전. 다만 *기존 키 삭제*는 깨진다 → 옵셔널로 받거나 fallback 정책 필요.
- **Q. 매핑 에러를 어떻게 로깅하나?**
  - A. mapper가 `Result<User, MappingError>`를 반환하게 하고, 호출부가 실패 건수를 메트릭으로 보낸다. 사용자에겐 무시되더라도 *데이터 품질 추적*에 필수.
- **Q. Domain → DTO 역매핑(서버 전송)은 분리 가치가 있나?**
  - A. 있다. 도메인 enum을 서버 문자열로 변환하는 책임이 한 곳에 모이면 API 버전 마이그레이션이 쉽다.

## 참고

- Martin Fowler — "Data Transfer Object", "Local DTO"
- Eric Evans — DDD (Anti-Corruption Layer 개념)
- Apple Sample Code: Fruta (Domain/Data 분리 예)
- Pointfree.co — "Modern SwiftUI: Domain"
