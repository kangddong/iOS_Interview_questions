# JSONEncoder / JSONDecoder Strategies

> 한 줄 요약 — Strategy는 *모델 코드를 바꾸지 않고* 서버 컨벤션(snake_case, ISO8601, base64 등)에 모델을 맞추기 위한 횡단 변환 훅이다.

도입: `Swift 4+`. `keyDecodingStrategy.convertFromSnakeCase`는 `Swift 4.1+`, `dataDecodingStrategy.base64`는 기본값.

## 핵심 개념

전략은 *디코더 인스턴스*에 붙는 설정이므로, 같은 모델이라도 디코더만 바꾸면 다른 포맷을 받아낼 수 있다. *모델은 도메인을, 디코더는 와이어 포맷을* 책임지는 것이 분리의 핵심.

- `keyDecodingStrategy` / `keyEncodingStrategy`
  - `.useDefaultKeys` (기본) — `CodingKeys` 그대로.
  - `.convertFromSnakeCase` / `.convertToSnakeCase` — `user_id ↔ userId`.
  - `.custom((path) -> CodingKey)` — 임의 변환 (대문자, prefix 제거 등).
- `dateEncodingStrategy` / `dateDecodingStrategy`
  - `.deferredToDate` (기본, *비추천* — Apple's reference date 기준 Double 초).
  - `.secondsSince1970`, `.millisecondsSince1970`.
  - `.iso8601` — RFC 3339 subset. *밀리초/타임존 offset 없는* 변형은 못 읽음 → `.formatted(DateFormatter)` 또는 `.custom`.
  - `.formatted(DateFormatter)` — `locale = en_US_POSIX`, `timeZone = UTC` 필수.
  - `.custom((decoder) -> Date)`.
- `dataEncodingStrategy` / `dataDecodingStrategy`
  - `.base64` (기본), `.deferredToData` (Int 배열), `.custom`.
- `nonConformingFloatEncodingStrategy` / `Decoding`
  - JSON 표준은 `NaN`/`Infinity`를 허용하지 않음 → `.convertToString("nan","+inf","-inf")` 또는 `.throw`.
- `outputFormatting` (Encoder만)
  - `.prettyPrinted`, `.sortedKeys` (테스트 결정성), `.withoutEscapingSlashes`.
- `userInfo` — 컨텍스트 주입(권한, API 버전).
- `allowsJSON5` (iOS 15+) — 트레일링 콤마, 주석, single quote 허용. 설정 파일 파싱에.

## 동작 원리 — keyDecodingStrategy 의 함정

`.convertFromSnakeCase`는 *값을 디코딩하기 전*에 컨테이너의 모든 키를 한 번 변환해 `[변환된키: 원본키]` 맵을 만든다. 따라서:

1. `CodingKeys`에 `case userId = "user_id"`를 *동시에 적용하면 충돌* — 전략이 이미 `userId`로 바꿔놓은 상태라 `"user_id"` 키 lookup이 실패.
2. 변환 규칙은 `_` 기준 split → 첫 토큰 제외 capitalize. 즉 `_internal` 같은 leading underscore는 보존된다.
3. 키 변환은 *대소문자만 다른 키*가 있으면 충돌하므로 서버 스키마 검토 필요.

## 코드 예시

### 1) 표준 디코더 팩토리

```swift
extension JSONDecoder {
    static let api: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        d.dataDecodingStrategy = .base64
        d.nonConformingFloatDecodingStrategy =
            .convertFromString(positiveInfinity: "+inf",
                               negativeInfinity: "-inf",
                               nan: "nan")
        return d
    }()
}
```

### 2) 다중 날짜 포맷 (서버가 일관성이 없을 때)

```swift
let multiDate: JSONDecoder.DateDecodingStrategy = .custom { decoder in
    let s = try decoder.singleValueContainer().decode(String.self)
    if let d = ISO8601DateFormatter.withFractional.date(from: s) { return d }
    if let d = ISO8601DateFormatter.plain.date(from: s) { return d }
    if let ms = Double(s) { return Date(timeIntervalSince1970: ms / 1000) }
    throw DecodingError.dataCorruptedError(
        in: try decoder.singleValueContainer(),
        debugDescription: "Unknown date: \(s)")
}
```

ISO8601에 *프랙셔널 초*가 있는 응답과 없는 응답이 섞인 경우 `.iso8601`만으론 불가능 → custom 분기가 정답.

### 3) custom key strategy — 서버가 `PascalCase`인 .NET API

```swift
decoder.keyDecodingStrategy = .custom { path in
    let last = path.last!.stringValue
    // "UserId" -> "userId"
    let lowered = last.prefix(1).lowercased() + last.dropFirst()
    return AnyKey(stringValue: lowered)!
}

struct AnyKey: CodingKey {
    var stringValue: String
    var intValue: Int? { nil }
    init?(stringValue: String) { self.stringValue = stringValue }
    init?(intValue: Int) { nil }
}
```

### 4) userInfo로 API 버전 분기

```swift
extension CodingUserInfoKey {
    static let apiVersion = CodingUserInfoKey(rawValue: "apiVersion")!
}

struct Article: Decodable {
    let title: String
    let body: String
    init(from decoder: Decoder) throws {
        let v = decoder.userInfo[.apiVersion] as? Int ?? 1
        let c = try decoder.container(keyedBy: AnyKey.self)
        title = try c.decode(String.self, forKey: AnyKey(stringValue: "title")!)
        body = try c.decode(String.self,
            forKey: AnyKey(stringValue: v >= 2 ? "bodyMarkdown" : "body")!)
    }
}

decoder.userInfo[.apiVersion] = 2
```

### 5) 결정적 인코딩 (스냅샷 테스트)

```swift
let e = JSONEncoder()
e.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
e.dateEncodingStrategy = .iso8601
let data = try e.encode(model)
// 키 순서가 deterministic — 해시 비교 가능
```

## 비교

| Date 전략 | 와이어 포맷 | 적합한 상황 |
|---|---|---|
| `.iso8601` | `"2026-06-15T10:00:00Z"` | RFC 3339 표준 API |
| `.formatted` | 임의 (예: `"yyyy-MM-dd"`) | legacy / 날짜만 |
| `.millisecondsSince1970` | `1718445600000` | Java 백엔드 흔함 |
| `.secondsSince1970` | `1718445600` | Unix 표준 |
| `.custom` | 혼합 | 서버 응답이 일관성 없음 |
| `.deferredToDate` | `761234123.4` (Apple ref) | *쓰지 말 것*. Apple 전용 |

| Key 전략 | 비용 | 주의 |
|---|---|---|
| `.useDefaultKeys` | 0 | CodingKeys 수동 관리 |
| `.convertFromSnakeCase` | 컨테이너당 키 변환 1회 | CodingKeys 매핑과 *공존 금지* |
| `.custom` | 호출당 클로저 | hot path는 직접 CodingKeys가 빠름 |

## 흔한 함정 / Follow-up

- **Q. `.convertFromSnakeCase`와 `CodingKeys` raw value를 같이 쓰면?**
  - A. 키가 미리 camelCase로 변환된 뒤 lookup하므로 `case userId = "user_id"`는 실패. 둘 중 하나만 쓰거나, snake 키 일부만 다르면 `CodingKeys`로 전부 명시.
- **Q. ISO8601에 밀리초가 포함되면 `.iso8601`이 실패한다.**
  - A. `ISO8601DateFormatter`가 기본적으로 fractional seconds를 미지원. `formatOptions`에 `.withFractionalSeconds`를 추가한 custom formatter를 `.custom`으로 감싸야 한다.
- **Q. `DateFormatter`는 왜 `en_US_POSIX`를 강제하나?**
  - A. 사용자 locale에 따라 *연도/달력 시스템*이 바뀌어(아랍/일본 황기 등) 파싱이 깨진다. 서버 통신용 formatter는 *고정 locale*이 필수.
- **Q. `outputFormatting.sortedKeys`는 왜 필요한가?**
  - A. Swift dictionary 순서는 비결정적 → 스냅샷 테스트/해시 서명/캐시 키에서 같은 모델이 다른 바이트로 인코딩된다.
- **Q. base64 외 hex 인코딩이 필요한 Data 필드.**
  - A. `dataDecodingStrategy = .custom { ... }`로 hex 문자열 → `Data` 변환. 또는 wrapper struct로 `SingleValueContainer`에서 직접 처리.
- **Q. 10만 건 응답 디코딩이 느리다 — strategy 영향은?**
  - A. ① `.convertFromSnakeCase`는 컨테이너 진입마다 *키 전체 변환*이라 깊은 nested에서 누적된다. ② `.iso8601` 클로저는 element마다 호출. ③ 해결: 핫 경로 DTO는 수동 `CodingKeys` + Unix epoch Int로 받기. ④ 더 빠르게는 `JSONSerialization` 후 수동 매핑(reflection 회피).
- **Q. `allowsJSON5`는 언제 켜나?**
  - A. iOS 15+. 서버 응답엔 *절대 켜지 말 것*(공격면 확대). 로컬 `.json5` 설정/픽스처 로딩 한정.

## 참고

- Apple Docs: `JSONEncoder`, `JSONDecoder`, `KeyEncodingStrategy`
- WWDC 2017-212 — JSON Encoding/Decoding
- SE-0166 Codable
- RFC 3339 (ISO 8601 subset)
