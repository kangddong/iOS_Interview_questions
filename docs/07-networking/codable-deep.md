# Codable Deep — Encodable / Decodable / Container

> 한 줄 요약 — `Codable`은 *타입과 직렬화 포맷을 분리*하기 위한 추상화이며, Container API는 *임의 구조의 JSON*을 안전하게 매핑하기 위한 저수준 빌딩 블록이다.

도입: `Swift 4.0+` (SE-0166), 키 패스 디코딩은 `Swift 5+`, `CodingKeyRepresentable`은 `Swift 5.6+`.

## 핵심 개념

- `typealias Codable = Encodable & Decodable` — *읽기/쓰기 권한을 분리*하기 위해 protocol을 둘로 쪼갠 것이 핵심. DTO 중 일부는 받기만 하므로 `Decodable`만 채택해 표면을 줄이는 게 좋다.
- 컨테이너 3종:
  - `KeyedDecodingContainer<Key>` — `{ "a": 1 }` 같은 *키 기반 객체*. `CodingKey` enum이 키 이름을 정의.
  - `UnkeyedDecodingContainer` — `[1, 2, 3]` 같은 *배열*. 내부에 `currentIndex`/`isAtEnd`가 있고 *순서대로 한 번씩만* 꺼낼 수 있다.
  - `SingleValueDecodingContainer` — `42`, `"x"` 같은 *원시값 1개*. enum의 raw payload, wrapper 타입에 사용.
- 컴파일러 자동 합성은 ① 모든 stored property가 Codable이고 ② `CodingKeys`가 property 이름과 일치하거나 정의돼 있을 때 동작. 그 외엔 `init(from:)`/`encode(to:)`를 직접 작성.
- *상속*: `super.encode(to: container.superEncoder())` 패턴으로 부모를 별도 컨테이너에 위임. 그렇지 않으면 부모 키와 자식 키가 같은 레벨에서 충돌한다.

## 동작 원리

`JSONDecoder.decode(T.self, from:)`은 내부적으로 `__JSONDecoder`를 만들어 *루트 컨테이너 요청을 받기 전까지는 파싱만 한 트리*를 들고 있다. 우리가 `container(keyedBy:)`를 호출하는 순간 해당 노드를 `[String: Any]`로 캐스팅하고, 그 안에서 `decode(_:forKey:)`마다 *타입 강제 변환*을 수행한다. 즉 디코딩 비용 = JSON 파싱(1회) + 키 lookup(O(1)) + 타입 캐스팅 + 재귀.

## 코드 예시

### 1) 키 매핑과 옵셔널/기본값

```swift
struct User: Decodable {
    let id: Int
    let name: String
    let bio: String          // 서버가 null이면 ""
    let isPro: Bool          // 키 자체가 없을 수 있음

    enum CodingKeys: String, CodingKey {
        case id, name, bio, isPro = "is_pro"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id    = try c.decode(Int.self, forKey: .id)
        name  = try c.decode(String.self, forKey: .name)
        bio   = try c.decodeIfPresent(String.self, forKey: .bio) ?? ""
        isPro = try c.decodeIfPresent(Bool.self, forKey: .isPro) ?? false
    }
}
```

`decodeIfPresent`는 *키가 없거나 값이 null*인 두 경우 모두 `nil`을 반환한다. "키는 있지만 null"과 "키 자체가 없음"을 구분하고 싶다면 `c.contains(.bio)`로 분기.

### 2) Unkeyed — 이종 배열 / 가변 길이

```swift
struct Path: Decodable {
    let points: [CGPoint]
    init(from decoder: Decoder) throws {
        var c = try decoder.unkeyedContainer()
        var out: [CGPoint] = []
        out.reserveCapacity(c.count ?? 0)
        while !c.isAtEnd {
            let x = try c.decode(Double.self)
            let y = try c.decode(Double.self)   // 평탄화된 [x,y,x,y,...]
            out.append(CGPoint(x: x, y: y))
        }
        self.points = out
    }
}
```

### 3) SingleValue — Wrapper / Tagged 타입

```swift
struct UserID: Codable, Hashable {
    let raw: String
    init(from decoder: Decoder) throws {
        raw = try decoder.singleValueContainer().decode(String.self)
    }
    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        try c.encode(raw)
    }
}
```

JSON에 추가 키 없이 `"u_123"` 형태로 평탄화된다. 도메인 타입 안전성을 *직렬화 비용 0*에 얻는 핵심 패턴.

### 4) 상속 — superEncoder / superDecoder

```swift
class Animal: Codable {
    var name: String
    enum K: CodingKey { case name }
    init(name: String) { self.name = name }
    required init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        name = try c.decode(String.self, forKey: .name)
    }
    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encode(name, forKey: .name)
    }
}

final class Dog: Animal {
    var breed: String
    enum K: CodingKey { case breed, sup }   // sup는 부모 sub-container 키

    init(name: String, breed: String) {
        self.breed = breed
        super.init(name: name)
    }
    required init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        breed = try c.decode(String.self, forKey: .breed)
        let parent = try c.superDecoder(forKey: .sup)
        try super.init(from: parent)
    }
    override func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encode(breed, forKey: .breed)
        try super.encode(to: c.superEncoder(forKey: .sup))
    }
}
```

`superDecoder()`만 호출하면 *"super"* 라는 기본 키가 쓰이는데, 자식 키와 충돌할 수 있으니 명시 키를 권장.

## 비교 / 결정 트리

| 상황 | 사용할 컨테이너 |
|---|---|
| 평범한 `{...}` 객체 | `keyedBy:` |
| `[...]` 배열, 길이 가변 | `unkeyedContainer()` |
| 원시값 1개 wrapper / enum raw | `singleValueContainer()` |
| 객체인데 키 이름이 동적 | `keyedBy: DynamicKey` (CodingKey를 String init으로 구현) |
| 한 필드가 여러 타입일 수 있음 | `singleValueContainer` + 순차 `try?` |

| 결정 | Codable 자동 합성 | 수동 init(from:) |
|---|---|---|
| 키 이름이 property와 동일 | O | 불필요 |
| snake_case ↔ camelCase | `keyDecodingStrategy`로 충분 | 키마다 다른 규칙이면 수동 |
| 기본값/누락 허용 | 모든 옵셔널이면 O | 비-옵셔널 기본값 필요 시 수동 |
| 다형성/타입 분기 | 불가 | 수동 필수 |

## 흔한 함정 / Follow-up

- **Q. `decodeIfPresent`와 옵셔널 property + 자동 합성의 차이?**
  - A. 자동 합성된 옵셔널 디코딩도 내부적으로 `decodeIfPresent`를 호출한다. 다만 *비-옵셔널 + 기본값* 조합(`let isPro: Bool = false`)은 자동 합성이 지원하지 않아 직접 작성해야 한다. (SE-0295 enum payload 기본값과 별개.)
- **Q. `keyNotFound` vs `valueNotFound` vs `typeMismatch`?**
  - A. 각각 *키 부재* / *키는 있지만 null* / *타입 불일치*. UI 에러 메시지를 갈라 쓰려면 `DecodingError`를 switch로 받아 `codingPath`를 로깅해 어느 필드가 깨졌는지 추적.
- **Q. 천만 건 디코딩이 느리다.**
  - A. ① `JSONSerialization` → 수동 매핑이 `JSONDecoder`보다 2~5배 빠른 경우가 많다(reflection 오버헤드 없음). ② `keyDecodingStrategy = .convertFromSnakeCase`는 키마다 문자열 변환을 일으키므로 hot path에선 수동 `CodingKeys`로 끄는 게 빠르다. ③ Date/Data strategy도 매 인스턴스 클로저 호출이라 비싸다.
- **Q. `CodingUserInfoKey`는 언제 쓰나?**
  - A. 컨텍스트 의존 디코딩(예: 같은 JSON을 admin/user 권한에 따라 다른 모델로). `decoder.userInfo[.role] as? Role` 식으로 분기.
- **Q. `nestedContainer(keyedBy:forKey:)`는?**
  - A. `{"meta":{"page":1}}`처럼 *한 단계 더 들어가야 할 때*. 별도 struct를 만들지 않고 평탄한 모델에 매핑하고 싶을 때 유용.
- **Q. enum의 associated value 디코딩 자동 합성?**
  - A. Swift 5.5+에서 `case`별 키와 payload가 자동 합성된다 (SE-0295). 하지만 *type discriminator*를 쓰는 실무 JSON은 거의 안 맞아 수동 작성이 일반적 → `custom-codable-polymorphism.md` 참고.

## 참고

- SE-0166 Swift Archival & Serialization
- SE-0295 Codable synthesis for enums with associated values
- Apple Docs: `Decoder`, `KeyedDecodingContainer`, `UnkeyedDecodingContainer`
- WWDC 2017 — "Whats New in Foundation"
