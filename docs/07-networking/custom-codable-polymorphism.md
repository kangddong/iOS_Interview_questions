# Custom Codable — Polymorphism / AnyCodable / null 정책

> 한 줄 요약 — *같은 위치*에 여러 형태의 JSON이 올 때 (`type` 필드로 분기되는 다형성, 키가 동적, 값이 임의 타입), 컴파일러 합성으로는 불가능하므로 `init(from:)`을 직접 짠다.

도입: `Swift 4+`. enum associated value 자동 합성은 `Swift 5.5+`이지만 *type discriminator*가 다른 키일 경우 수동.

## 핵심 개념

- **Discriminated Union (Tagged Union)** — `{"type": "image", "url": "..."}` / `{"type": "text", "body": "..."}` 처럼 *한 필드(type)가 어떤 모델을 디코딩할지 결정*하는 구조. 서버 API에서 가장 흔한 다형성 표현.
- **Dynamic Keys** — 키 이름 자체가 데이터(`{"ko": "안녕", "en": "hello"}`). `CodingKey` 프로토콜을 *모든 문자열을 받아들이는 struct*로 구현.
- **AnyCodable / AnyDecodable** — 스키마를 모르는 영역(analytics, feature flag payload)을 임의 JSON value로 보관. 무분별 사용은 *타입 안전성을 잃는* 안티패턴이므로 경계가 명확한 곳에만.
- **Null 정책 3가지**
  1. *키 없음* — `decodeIfPresent`가 `nil`.
  2. *키 있음 + null* — `decodeIfPresent`도 `nil`. 구분하려면 `contains(_:)`.
  3. *키 있음 + 값* — 정상.
  PATCH API처럼 "삭제(null)" vs "변경 없음(키 없음)"을 구분해야 할 때 이 차이가 결정적.

## 코드 예시

### 1) Discriminated Union — `type` 필드 분기

```swift
enum FeedItem: Decodable {
    case image(ImageItem)
    case text(TextItem)
    case video(VideoItem)

    private enum Discriminator: String, Decodable {
        case image, text, video
    }
    private enum K: CodingKey { case type }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        let kind = try c.decode(Discriminator.self, forKey: .type)
        // 같은 decoder를 재진입해 *전체 페이로드*를 해당 타입으로 다시 디코딩
        let single = decoder
        switch kind {
        case .image: self = .image(try ImageItem(from: single))
        case .text:  self = .text(try TextItem(from: single))
        case .video: self = .video(try VideoItem(from: single))
        }
    }
}

struct ImageItem: Decodable { let type: String; let url: URL; let alt: String? }
struct TextItem:  Decodable { let type: String; let body: String }
struct VideoItem: Decodable { let type: String; let url: URL; let durationMs: Int }
```

핵심: discriminator를 *읽기만 하고 컨테이너를 소비하지 않는다*. 같은 `decoder`로 자식 타입을 다시 호출하면 전체 JSON이 그쪽 모델로 디코딩된다.

### 2) Unknown 케이스 안전 처리

```swift
enum FeedItem: Decodable {
    case image(ImageItem)
    case text(TextItem)
    case unknown(String)        // forward compatibility

    private enum K: CodingKey { case type }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        let raw = try c.decode(String.self, forKey: .type)
        switch raw {
        case "image": self = .image(try ImageItem(from: decoder))
        case "text":  self = .text(try TextItem(from: decoder))
        default:      self = .unknown(raw)       // 서버가 새 타입 추가해도 안 깨짐
        }
    }
}
```

새 타입(`audio`)을 서버가 먼저 배포해도 앱은 조용히 무시. *forward compatibility*는 모바일 강제 업데이트를 피하는 핵심 패턴.

### 3) Heterogeneous 배열 + 부분 실패

```swift
struct Feed: Decodable {
    let items: [FeedItem]
    enum K: CodingKey { case items }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        var arr = try c.nestedUnkeyedContainer(forKey: .items)
        var out: [FeedItem] = []
        var copy = arr   // count 미리 확보용
        out.reserveCapacity(copy.count ?? 0)
        while !arr.isAtEnd {
            // 깨진 element 1개가 전체를 막지 않게
            if let item = try? arr.decode(FeedItem.self) {
                out.append(item)
            } else {
                _ = try? arr.decode(AnyDecodable.self)  // 인덱스 진행
            }
        }
        self.items = out
    }
}
```

UnkeyedContainer는 *실패하면 인덱스가 진행되지 않는*다. `AnyDecodable`로 강제 소비해 다음 요소로 이동.

### 4) Dynamic Keys — 다국어 dict

```swift
struct AnyKey: CodingKey {
    var stringValue: String
    var intValue: Int? { nil }
    init?(stringValue: String) { self.stringValue = stringValue }
    init?(intValue: Int) { nil }
}

struct Localized: Decodable {
    let values: [String: String]
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: AnyKey.self)
        var dict: [String: String] = [:]
        for key in c.allKeys {
            dict[key.stringValue] = try c.decode(String.self, forKey: key)
        }
        self.values = dict
    }
}
```

### 5) AnyCodable (스키마 모르는 payload)

```swift
struct AnyDecodable: Decodable {
    let value: Any
    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { value = NSNull() }
        else if let v = try? c.decode(Bool.self)   { value = v }
        else if let v = try? c.decode(Int.self)    { value = v }
        else if let v = try? c.decode(Double.self) { value = v }
        else if let v = try? c.decode(String.self) { value = v }
        else if let v = try? c.decode([AnyDecodable].self) {
            value = v.map(\.value)
        } else if let v = try? c.decode([String: AnyDecodable].self) {
            value = v.mapValues(\.value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: c, debugDescription: "Unsupported JSON value")
        }
    }
}
```

`Int` → `Double` 순서가 중요 (`1`은 둘 다 가능하지만 우선순위는 Int).

### 6) null vs 누락 구분 — PATCH 요청 모델

```swift
enum Patch<T: Codable>: Codable {
    case absent          // 키 자체 없음
    case null            // 명시적 null (삭제)
    case set(T)          // 새 값

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { self = .null }
        else { self = .set(try c.decode(T.self)) }
        // .absent는 부모 container의 decodeIfPresent에서 만들어짐
    }
    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .absent: return                  // 키 생략은 부모가 처리
        case .null:   try c.encodeNil()
        case .set(let v): try c.encode(v)
        }
    }
}

struct UpdateUser: Codable {
    var name: Patch<String> = .absent
    var bio: Patch<String> = .absent
}
```

`.absent`는 *키를 아예 내보내지 않아야* 하므로 부모 인코딩에서 `encodeIfPresent`-스타일 분기가 필요(또는 사전 필터).

## 비교

| 다형성 방법 | 적합 상황 | 단점 |
|---|---|---|
| enum + discriminator | 케이스 고정, type 필드 있음 | 새 케이스마다 코드 |
| protocol + 타입 레지스트리 | 모듈/플러그인이 동적 등록 | 런타임 lookup 비용 |
| 클래스 상속 | 거의 안 씀 (Swift Codable과 궁합 나쁨) | super encoding 복잡 |
| AnyCodable | 스키마 미정 영역 | 타입 안전성 상실 |

| null 정책 | 의미 | 사용처 |
|---|---|---|
| 옵셔널 + `decodeIfPresent` | "없거나 null = 없음" | GET 응답 대부분 |
| `contains(_:)` + 직접 분기 | 누락 vs null 구분 | PATCH, partial update |
| custom enum (`Patch`) | 3-상태 표현 | JSON Merge Patch (RFC 7396) |

## 흔한 함정 / Follow-up

- **Q. discriminator를 읽은 뒤 `decoder.singleValueContainer().decode(ImageItem.self)`로도 되나?**
  - A. 안 된다. discriminator를 keyed container로 한 번 본 시점부터 단일값 container는 못 가져온다. 자식 타입 디코딩은 *원래 `decoder`*를 그대로 넘겨 `ImageItem(from: decoder)`로 한다.
- **Q. `unknown` 케이스 + 인코딩?**
  - A. 라운드트립이 필요하면 `unknown(String, raw: AnyDecodable)`로 페이로드 보존. 또는 `unknown`은 디코딩 전용으로 두고 인코딩은 throw.
- **Q. `AnyCodable`을 모델 전반에 쓰면?**
  - A. 타입 안전성/자동완성/리팩터링 모두 잃는다. *boundary*(analytics 이벤트 properties, feature flag config, 외부 webhook payload)에만 한정.
- **Q. JSON Merge Patch (RFC 7396) — `null`이 삭제다.**
  - A. 위 `Patch<T>` 패턴이 그 명세를 정확히 표현. `JSONEncoder`가 `nil`을 키 생략으로 직렬화하는 기본 동작과 *반대*임에 유의(merge patch는 `null` 명시 = 삭제, 키 생략 = 변경 없음).
- **Q. heterogeneous 배열에서 깨진 element 인덱스를 어떻게 진행하나?**
  - A. UnkeyedContainer는 *실패한 decode가 인덱스를 진행하지 않는다*. `AnyDecodable`로 강제 소비하거나, 미리 `[AnyDecodable]`로 받은 뒤 그 raw로 다시 분기.
- **Q. discriminator가 *문자열이 아니라 숫자*(`"kind": 1`)인 서버.**
  - A. `enum Kind: Int, Decodable { case image = 1, text = 2 }`. 새 값에 대해선 `init(rawValue:)`가 nil이므로 `decodeIfPresent` + fallback.
- **Q. 다형성 enum을 SwiftUI `ForEach`에 쓰려면?**
  - A. `Identifiable` 구현 — 각 케이스에서 안정 id 추출(`switch self`). 또는 wrapper struct로 `id: UUID`를 들고 enum을 payload로.
- **Q. `init(from:)`이 길어진다 — 분리 전략?**
  - A. 케이스별 디코딩을 *static factory*(`ImageItem.decode(from:)`)로 빼고, top-level `init(from:)`은 분기만. 테스트도 분리 가능.

## 참고

- SE-0166 Codable, SE-0295 Codable for enums with associated values
- RFC 7396 — JSON Merge Patch
- Apple Docs: `KeyedDecodingContainer.contains(_:)`, `decodeNil(forKey:)`
- Pointfree.co — "Tagged" 라이브러리 (도메인 ID 안전)
