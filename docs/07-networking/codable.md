# Codable (JSONEncoder / JSONDecoder)

> 한 줄 요약 — Swift 4+에서 도입된 **타입과 외부 표현(JSON, plist 등) 사이의 자동 직렬화**. `Codable = Encodable & Decodable`.

도입 버전: Swift 4+

## 가장 단순한 케이스

```swift
struct User: Codable {
    let id: Int
    let name: String
    let email: String
}

let data = try JSONEncoder().encode(user)
let decoded = try JSONDecoder().decode(User.self, from: data)
```

프로퍼티 이름이 JSON 키와 같으면 끝. 그러나 실무는 거의 항상 *변형*이 필요.

## CodingKeys로 키 매핑

```swift
struct User: Codable {
    let id: Int
    let userName: String

    enum CodingKeys: String, CodingKey {
        case id
        case userName = "user_name"
    }
}
```

## Key Decoding Strategy

대부분의 서버가 snake_case라면 매번 적기 귀찮으니:

```swift
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
```

특수한 키만 `CodingKeys`로 override.

## Date 처리

```swift
decoder.dateDecodingStrategy = .iso8601
// 또는 커스텀 포맷
let f = DateFormatter()
f.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
decoder.dateDecodingStrategy = .formatted(f)
// 또는 unix timestamp
decoder.dateDecodingStrategy = .secondsSince1970
```

## Optional vs 누락 vs null

| 표현 | 의미 |
|---|---|
| 키 자체 없음 | Optional 프로퍼티만 OK |
| 키는 있고 `null` | Optional이라야 OK (값은 nil로 디코드) |
| 키 있고 값 다른 타입 | 디코드 실패 |

`Int`로 선언한 프로퍼티가 JSON에서 `null`이면 throw. 안전하려면 `Int?`.

## 커스텀 디코딩 — `init(from:)`

```swift
struct Price: Decodable {
    let amount: Decimal
    let currency: String

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        // 서버가 "₩12,000" 같은 문자열로 줄 때
        let raw = try c.decode(String.self, forKey: .amount)
        self.amount = Self.parseAmount(raw)
        self.currency = try c.decode(String.self, forKey: .currency)
    }
    enum CodingKeys: String, CodingKey { case amount, currency }
}
```

API가 일관성 없는 타입을 줄 때 (Int 또는 String 등) 여기서 분기 처리.

## 다형성 — Discriminated Union

```swift
enum Event: Decodable {
    case message(text: String)
    case image(url: URL)

    enum CodingKeys: String, CodingKey { case type, text, url }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        switch try c.decode(String.self, forKey: .type) {
        case "message": self = .message(text: try c.decode(String.self, forKey: .text))
        case "image":   self = .image(url: try c.decode(URL.self, forKey: .url))
        default: throw DecodingError.dataCorruptedError(forKey: .type, in: c, debugDescription: "unknown type")
        }
    }
}
```

타입 필드(`"type": "message"`)로 분기되는 패턴. iOS 17+ `@CodingKeys` 매크로/SE-0407로 enum Codable이 더 간단.

## 중첩 컨테이너

```swift
// {"data": {"user": {"name": "..."}}}
struct Response: Decodable {
    let name: String
    init(from decoder: Decoder) throws {
        let outer = try decoder.container(keyedBy: OuterKeys.self)
        let inner = try outer.nestedContainer(keyedBy: InnerKeys.self, forKey: .data)
        let user  = try inner.nestedContainer(keyedBy: UserKeys.self,  forKey: .user)
        self.name = try user.decode(String.self, forKey: .name)
    }
}
```

깊이가 깊으면 *별도 wrapper struct*로 분해하는 편이 가독성 좋음.

## 성능 팁

- 큰 응답은 `JSONSerialization`이 더 빠를 수 있음. 다만 타입 안전성 손해.
- `JSONDecoder` 재사용 (매번 만들 필요 X — 단, `dateDecodingStrategy` 등이 다르면 별도).
- `Decodable` 구조가 깊으면 매크로 기반 라이브러리(`MetaCodable` 등) 검토.

## 비교 — Codable vs JSONSerialization

| 구분 | Codable | JSONSerialization |
|---|---|---|
| 타입 안전 | 강함 | 없음 (Any) |
| 보일러플레이트 | 자동 생성 | 수동 |
| 성능 | 충분히 빠름 | 더 빠름 (대용량) |
| 추천 | 거의 모든 경우 | 일회성/유연성 우선 |

## 흔한 함정 / Follow-up

- **Q. 서버가 가끔 `null`을 보내는데 `Int`로 받음 → 디코드 실패.**
  Optional로 바꾸거나 custom init.

- **Q. snake_case 키가 한두 개만 있음.**
  `keyDecodingStrategy`를 통째 켜는 대신 `CodingKeys`로 그것만 매핑.

- **Q. `JSONDecoder`가 `URL`을 어떻게 디코드?**
  문자열을 받아 `URL(string:)`. 잘못된 URL이면 throw.

- **Q. `@propertyWrapper`로 커스텀 디코딩?**
  `@DefaultEmpty` 등 패턴이 있음 (라이브러리 또는 직접 구현). 빈 배열/기본값 자동 적용에 유용.

- **Q. 응답이 `[user, user, ...]` 또는 `{ "data": [...] }`로 둘 다 올 수 있음.**
  `init(from:)`에서 try / catch로 두 컨테이너 모두 시도. 또는 enum으로 감싸서 분기.

## 참고

- Swift Evolution: SE-0166 (Codable)
- Apple Docs: Encoding and Decoding Custom Types
