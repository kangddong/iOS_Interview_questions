# Equatable / Hashable / Comparable / Codable

> 한 줄 요약 — 값 비교(`Equatable`), 해시 기반 컬렉션 키(`Hashable`), 정렬(`Comparable`), 직렬화(`Codable`)를 표준화하는 프로토콜들. struct/enum의 멤버가 모두 해당 프로토콜을 만족하면 *컴파일러 자동 합성* 가능.

## Equatable

```swift
struct Point: Equatable { var x, y: Double }   // 자동 합성

// 커스텀
struct User: Equatable {
    let id: String; let name: String
    static func == (lhs: User, rhs: User) -> Bool { lhs.id == rhs.id }
}
```

- 모든 stored property가 Equatable이면 자동 합성
- enum도 자동 합성 (associated value가 모두 Equatable인 경우)

## Hashable

```swift
struct Tag: Hashable { let id: String; let name: String }   // 자동 합성

// 커스텀
struct User: Hashable {
    let id: String; let name: String
    func hash(into hasher: inout Hasher) { hasher.combine(id) }   // ==과 일관성 유지
    static func == (l: User, r: User) -> Bool { l.id == r.id }
}
```

규칙: **`a == b` ⇒ `a.hashValue == b.hashValue`** 반드시 일관 (역은 X)

용도:
- `Set<T>`, `Dictionary<T, V>`의 키
- SwiftUI `ForEach(_, id: \.self)`

## Comparable

```swift
struct Version: Comparable {
    let major: Int; let minor: Int
    static func < (l: Self, r: Self) -> Bool {
        (l.major, l.minor) < (r.major, r.minor)
    }
}
```

- `<`만 정의하면 `>`, `<=`, `>=` 자동 유도
- enum은 case 선언 순서대로 자동 합성 (`Comparable` 채택 + 모든 associated value도 Comparable)

## Codable

`Codable = Encodable & Decodable`. JSON, plist 등 외부 표현과의 변환.

```swift
struct User: Codable {
    let id: String
    let displayName: String

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
    }
}

let data = try JSONEncoder().encode(user)
let back = try JSONDecoder().decode(User.self, from: data)
```

전략:

```swift
let dec = JSONDecoder()
dec.keyDecodingStrategy = .convertFromSnakeCase
dec.dateDecodingStrategy = .iso8601
```

커스텀 디코딩:

```swift
init(from decoder: Decoder) throws {
    let c = try decoder.container(keyedBy: CodingKeys.self)
    id = try c.decode(String.self, forKey: .id)
    displayName = try c.decodeIfPresent(String.self, forKey: .displayName) ?? "Anon"
}
```

## 자동 합성 조건 요약

| 프로토콜 | struct | enum | class |
|---|---|---|---|
| Equatable | 모든 stored가 Equatable | 모든 associated가 Equatable | X (직접 구현) |
| Hashable | 모든 stored가 Hashable | 모든 associated가 Hashable | X |
| Comparable | X (직접) | raw value 없는 enum, 모든 associated가 Comparable | X |
| Codable | 모든 stored가 Codable | associated가 Codable (Swift 5.5+ 합성) | 가능 |

## 흔한 함정 / Follow-up

- **Q. `id`만 비교하는데 `Hashable` 합성 그대로 쓰면?**
  자동 합성은 *모든 프로퍼티*를 본다. 동일 id, 다른 name이면 != 로 판단되어 Set/Dictionary에서 의도치 않은 결과. 수동으로 `==`/`hash`를 id 기반으로 작성.

- **Q. Codable 디코딩 시 키가 없거나 null?**
  `decodeIfPresent`로 옵셔널 처리. JSON `null`은 `decodeNil()`/옵셔널 디코드.

- **Q. enum + raw value의 Codable?**
  raw value가 Codable이면 자동 합성. 외부 입력에 없는 케이스가 들어오면 throw → 디폴트 케이스로 폴백하려면 custom init.

- **Q. `Hashable`을 채택했는데 `==`만 정의?**
  Swift는 자동 합성을 못 하면 에러. `hash(into:)`도 정의해야 함.

- **Q. SwiftUI에서 `id: \.self` 위험?**
  내용이 같은 두 항목이 같은 id로 취급되어 diffing 오류. 도메인 id를 별도로 두는 게 안전.

## 참고

- Swift Language Guide: Protocols, Codable, Hashable
- SE-0166 Codable, SE-0185 Synthesizing Equatable/Hashable
