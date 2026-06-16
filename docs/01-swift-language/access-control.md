# Access Control

> 한 줄 요약 — Swift는 5단계의 접근 수준으로 *모듈 단위 캡슐화*를 강제한다. 라이브러리 공개 API와 내부 구현을 분리하는 1차 도구.

## 5단계

| 수준 | 가시 범위 |
|---|---|
| `open` | 모듈 외부 + override/subclass 허용 |
| `public` | 모듈 외부에서 *사용*만, override/subclass 불가 |
| `internal` | 같은 모듈 내 (기본값) |
| `fileprivate` | 같은 파일 내 |
| `private` | 같은 선언 + 같은 파일의 익스텐션 |

`open` vs `public`:
- 라이브러리를 *상속/오버라이드해도 되는* API에만 `open`. 그 외엔 `public`로 닫아 둠 (semver 안정성)

## 규칙

- 타입의 접근 수준은 *멤버 기본값의 상한*: `internal` 타입의 멤버 기본은 `internal`, `public`로 명시해도 노출 안 됨
- 함수 시그니처에 등장하는 타입은 함수 접근 수준 *이상*이어야 함 — 외부에 노출되는데 내부 타입을 쓰면 컴파일 에러
- `private(set)` — 읽기 공개, 쓰기 비공개

```swift
public struct User {
    public private(set) var name: String   // 외부 read O, 외부 write X
    public init(name: String) { self.name = name }
}
```

## 대표 패턴

### 인터널 헬퍼 숨기기

```swift
public struct API {
    private let session: URLSession   // 외부엔 보이지 않음
    public func fetch() async throws -> Data { ... }
}
```

### 테스트에서 internal 접근

같은 모듈 안 → 자연스럽게 접근. 별도 모듈에서 테스트할 땐:

```swift
@testable import MyLib   // internal까지 노출
```

`private`/`fileprivate`은 `@testable`로도 못 본다.

## 흔한 함정 / Follow-up

- **Q. `private`과 `fileprivate` 차이?**
  `private`은 *그 선언 + 같은 파일의 같은 타입 익스텐션*까지. `fileprivate`은 *파일 전체*. 같은 파일에서 다른 타입이 접근해야 하면 `fileprivate`.

- **Q. `open` 안 쓰고 다 `public`이면?**
  서브클래스/오버라이드 차단 → 라이브러리 사용자가 상속으로 확장 못 함. 의도된 디자인이면 OK.

- **Q. 모듈 외부에서 init을 막고 싶다면?**
  `public` 타입에 `internal init` (또는 `private init`). 사용자는 팩토리 메서드만 사용 가능.

- **Q. Swift Package에서 public을 어떻게 노출?**
  `Package.swift`의 target이 모듈 단위. target에서 `public` 선언이 외부 import 시 보이는 API.

- **Q. SPI(System Programming Interface)?**
  `@_spi(GroupName)` — 특정 그룹 명시 import에만 노출되는 *준-public* API. 라이브러리 내부 모듈 간 공유에 사용.

## 참고

- Swift Language Guide: Access Control
