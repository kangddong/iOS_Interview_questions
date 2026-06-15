# API Client Design — Endpoint / Request 추상화

> 한 줄 요약 — *HTTP 디테일*과 *비즈니스 호출부* 사이에 type-safe한 경계를 두어, 호출부는 도메인 언어로 말하고 인프라(헤더/디코딩/에러)는 한 곳에서 진화하기 위해 존재한다.

도입 버전: `Swift 5.7+` (generic some/any), `Swift 5.9+` (Macro), `iOS 15+` (`URLSession` async)
관련: Moya, Alamofire, swift-openapi-generator, Retrofit(Android)

## 핵심 개념

- **Endpoint**: 경로/메서드/쿼리/바디를 **선언적으로** 묶은 값 타입. URL을 문자열로 짜는 호출부를 없앤다.
- **Request<Response>**: 응답 타입을 *제네릭 파라미터*로 묶어 디코딩까지 한 번에 추론 가능. `client.send(GetUser(id: 1))` → `User`.
- **Type-safe path**: 컴파일 타임에 path 파라미터 누락을 잡는다. 문자열 `"/users/\(id)"`보다 `Path.users(id)` enum을 사용.
- **Error mapping**: URLError → `NetError.transport`, HTTPStatus → `NetError.http(status, body)`, decoding → `NetError.decode`. 호출부는 `NetError` 한 타입만 알면 됨.
- **응답 디코딩 파이프라인**: raw `Data` → status 검증 → content-type 분기 → `Decodable` → DTO → Domain mapping. 각 단계가 분리되어야 테스트 가능.

## 동작 흐름

```
[Call Site]
   │  Endpoint 인스턴스 (값 타입)
   ▼
[APIClient.send]
   │  1. Endpoint → URLRequest 빌드 (baseURL + path + query + body)
   ▼
[Pipeline (Middleware chain)]      ← interceptor에서 다룸
   │  2. 헤더 첨부, 토큰, 로깅, retry, breaker
   ▼
[URLSession.data]
   │  3. (Data, HTTPURLResponse)
   ▼
[Response Validator]
   │  4. status 2xx? else → 4xx/5xx mapping (서버 에러 모델 디코딩 시도)
   ▼
[Decoder]
   │  5. JSONDecoder(strategy) → Endpoint.Response
   ▼
[Domain Mapper] (옵션)
   │  6. DTO → Domain model
   ▼
[Return]
```

## 코드 예시

```swift
// 1. HTTP 원시 타입
enum HTTPMethod: String { case get = "GET", post = "POST", put = "PUT", delete = "DELETE", patch = "PATCH" }

// 2. Endpoint — Response를 associated type으로
protocol Endpoint {
    associatedtype Response: Decodable
    associatedtype Body: Encodable = EmptyBody

    var method: HTTPMethod { get }
    var path: String { get }                     // 컴파일러가 따라가는 enum로 대체 가능
    var query: [URLQueryItem] { get }
    var body: Body? { get }
    var headers: [String: String] { get }
}

struct EmptyBody: Encodable {}

extension Endpoint {
    var query: [URLQueryItem] { [] }
    var body: Body? { nil }
    var headers: [String: String] { [:] }
}

// 3. 구체 Endpoint — 도메인이 그대로 드러남
struct GetUser: Endpoint {
    typealias Response = UserDTO
    let id: Int
    var method: HTTPMethod { .get }
    var path: String { "/users/\(id)" }
}

struct CreatePost: Endpoint {
    typealias Response = PostDTO
    struct Body: Encodable { let title: String; let body: String }
    let body: Body?
    var method: HTTPMethod { .post }
    var path: String { "/posts" }
    var headers: [String: String] {
        ["Idempotency-Key": UUID().uuidString]    // POST 재시도 안전
    }
}

// 4. 에러 — 호출부가 알아야 할 단 하나의 타입
enum NetError: Error {
    case transport(URLError)
    case http(status: Int, body: ServerErrorBody?)
    case decode(DecodingError)
    case circuitOpen
    case unauthorized                              // 401 매핑
}

struct ServerErrorBody: Decodable { let code: String; let message: String }

// 5. Client
struct APIClient {
    let baseURL: URL
    let pipeline: Pipeline
    let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    func send<E: Endpoint>(_ endpoint: E) async throws -> E.Response {
        let request = try buildRequest(endpoint)
        let (data, resp) = try await pipeline.send(request)
        try validate(resp, data: data)
        do {
            return try decoder.decode(E.Response.self, from: data)
        } catch let err as DecodingError {
            throw NetError.decode(err)
        }
    }

    private func buildRequest<E: Endpoint>(_ e: E) throws -> URLRequest {
        var comp = URLComponents(url: baseURL.appendingPathComponent(e.path),
                                  resolvingAgainstBaseURL: false)!
        if !e.query.isEmpty { comp.queryItems = e.query }
        var req = URLRequest(url: comp.url!)
        req.httpMethod = e.method.rawValue
        for (k, v) in e.headers { req.setValue(v, forHTTPHeaderField: k) }
        if let body = e.body {
            req.httpBody = try JSONEncoder().encode(body)
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        return req
    }

    private func validate(_ resp: HTTPURLResponse, data: Data) throws {
        switch resp.statusCode {
        case 200..<300: return
        case 401: throw NetError.unauthorized
        default:
            let body = try? decoder.decode(ServerErrorBody.self, from: data)
            throw NetError.http(status: resp.statusCode, body: body)
        }
    }
}

// 6. 호출부 — HTTP는 보이지 않음
let user = try await client.send(GetUser(id: 42))                  // 타입: UserDTO
let post = try await client.send(CreatePost(body: .init(title: "hi", body: "hi")))
```

### Type-safe path 강화 (Phantom Type)

```swift
struct UserID: Hashable { let raw: Int }    // 다른 Int ID와 섞이지 않음
struct PostID: Hashable { let raw: Int }

struct GetUser: Endpoint {
    let id: UserID
    var path: String { "/users/\(id.raw)" }
}
// GetUser(id: PostID(raw: 1))  ← 컴파일 에러
```

### DTO ↔ Domain 분리

```swift
struct UserDTO: Decodable { let id: Int; let displayName: String; let createdAt: Date }

struct User { let id: UserID; let name: String; let joined: Date }

extension UserDTO {
    func toDomain() -> User {
        User(id: .init(raw: id), name: displayName, joined: createdAt)
    }
}
// 서비스 레이어에서 매핑
let user = try await client.send(GetUser(id: .init(raw: 42))).toDomain()
```

## 비교

| 구분 | 문자열 URL 직접 호출 | Moya 식 enum Target | Endpoint protocol (제네릭) | OpenAPI 코드젠 |
|---|---|---|---|---|
| 컴파일 안전성 | ✗ | △ (path는 String) | ✓ | ✓✓ |
| 응답 타입 추론 | ✗ | △ | ✓ | ✓ |
| 보일러플레이트 | 낮음 | 중간 (case 하나당 switch 5개) | 중간 (struct 하나) | 자동 |
| 테스트 | mock URLProtocol | sampleData 지원 | endpoint를 그대로 비교 | spec 기반 |
| 유연성 | 최대 | 중간 | 높음 | 낮음 (spec 의존) |

| Layer | 입력 | 출력 | 책임 |
|---|---|---|---|
| Endpoint | 도메인 파라미터 | URLRequest 설명 | *무엇을 호출할지* |
| Pipeline | URLRequest | (Data, Response) | *어떻게 보낼지* (헤더/재시도/로그) |
| Validator | HTTPURLResponse | throw or pass | status 매핑 |
| Decoder | Data | DTO | 직렬화 |
| Mapper | DTO | Domain | 표현 변환 |

## 흔한 함정 / Follow-up

- **Q. Endpoint를 enum으로 모은 Moya 스타일 vs struct 개별 스타일?**
  enum은 한곳에서 *모든 API*를 보기 좋음 — 하지만 case 추가 시 switch 다 건드리고, 응답 타입을 case별로 묶기 어렵다(associated type 한 개만). struct는 *횡적 분산*되지만 type-safe하고 모듈별 격리에 유리. 시니어 코드베이스에서는 struct/Endpoint protocol이 일반적.
- **Q. baseURL을 어떻게 주입?**
  `Environment` (dev/staging/prod) 객체로 주입. `Endpoint`가 baseURL을 모르는 게 핵심 — 같은 endpoint를 다른 환경에서 그대로 재사용 가능.
- **Q. 응답 디코딩에서 한 필드 실패하면 전체 실패?**
  기본 `Decodable`은 fail-fast. 부분 실패를 허용하려면 `init(from:)`에서 `try?`로 개별 처리하거나 `LossyArray<T>` 같은 PropertyWrapper로 컬렉션 단위 lossy. 결제 같은 critical은 fail-fast 유지.
- **Q. DTO와 Domain을 합치면?**
  소규모 앱에선 OK. 단점은 ① 서버 스키마 변경이 Domain까지 전파 ② Domain이 `Decodable`을 떠안아 invariant 보장이 약해짐(임의의 JSON이 Domain 인스턴스를 만들어버림). 시니어 코드베이스는 분리 권장.
- **Q. 에러 매핑 전략 — Result vs throw?**
  throw가 Swift async/await와 자연스럽고 합성하기 쉽다. Result는 *복수 비동기 결과 묶을 때*만 유용. 도메인 별 specific error는 `NetError`를 wrap 하거나 typed throws(`Swift 6.0+`)로.
- **Q. Multipart, streaming은 어떻게 추상화?**
  Endpoint protocol에 `Body`를 enum으로(`.json(Encodable)`, `.multipart([Part])`, `.stream(InputStream)`) 두고 빌더가 분기. 모든 endpoint가 JSON인 가정이 깨질 때 미리 설계.
- **Q. Generic client에서 컴파일 시간이 폭발하는데?**
  Endpoint가 너무 많은 generic constraint를 갖거나 `any Endpoint` 박싱이 많을 때. `some Endpoint` 유지, 모듈 경계에서 type-erase, `@inlinable` 자제.
- **Q. 보안 — 로그에 body가 통째로 찍힌다.**
  Endpoint에 `var redactedFields: [String] { ... }`을 두거나, Logging 미들웨어가 `Authorization`, `Cookie`, 비밀번호 필드를 자동 마스킹. body는 size만 찍는 옵션도.

## 참고

- swift-openapi-generator (Apple 공식)
- Moya — `TargetType`
- Alamofire — `URLRequestConvertible`
- "Designing Fluent Interfaces" — John Sundell
- WWDC 2023 — Meet Swift OpenAPI Generator
