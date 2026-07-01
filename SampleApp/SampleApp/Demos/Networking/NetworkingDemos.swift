import SwiftUI
import Foundation

private struct Todo: Codable { let userId: Int; let id: Int; let title: String; let completed: Bool }

struct URLSessionDemo: Demo {
    static let id = "net.urlsession"
    static let title = "URLSession"
    static let summary = "표준 HTTP 클라이언트. data/upload/download/websocket task 4종."
    static let docPath = "docs/07-networking/urlsession.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                guard let url = URL(string: "https://jsonplaceholder.typicode.com/todos/1") else { return }
                do {
                    let (data, response) = try await URLSession.shared.data(from: url)
                    if let http = response as? HTTPURLResponse { log.log("HTTP \(http.statusCode)") }
                    log.log(String(data: data, encoding: .utf8) ?? "")
                } catch { log.log("err: \(error.localizedDescription)") }
            }
        }
    }
}

struct CodableDemo: Demo {
    static let id = "net.codable"
    static let title = "Codable"
    static let summary = "JSON ↔ Swift 변환. Encoder/Decoder 1줄."
    static let docPath = "docs/07-networking/codable.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let raw = #"{"userId":1,"id":1,"title":"hi","completed":false}"#.data(using: .utf8)!
            let todo = try! JSONDecoder().decode(Todo.self, from: raw)
            log.log("decoded → \(todo)")
            let again = try! JSONEncoder().encode(todo)
            log.log("encoded → \(String(data: again, encoding: .utf8) ?? "")")
        }
    }
}

struct CodableDeepDemo: Demo {
    static let id = "net.codable-deep"
    static let title = "Codable Deep (전략)"
    static let summary = "keyDecodingStrategy, dateDecodingStrategy, container 직접 다루기."
    static let docPath = "docs/07-networking/codable-deep.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            struct Event: Codable { let eventName: String; let happenedAt: Date }
            let dec = JSONDecoder()
            dec.keyDecodingStrategy = .convertFromSnakeCase
            dec.dateDecodingStrategy = .iso8601
            let raw = #"{"event_name":"open","happened_at":"2025-01-01T00:00:00Z"}"#.data(using: .utf8)!
            let e = try! dec.decode(Event.self, from: raw)
            log.log("decoded → \(e)")
        }
    }
}

struct CustomCodablePolymorphismDemo: Demo {
    static let id = "net.codable-polymorphism"
    static let title = "Polymorphic Codable"
    static let summary = "type 필드로 분기 디코딩. enum + associated value 활용."
    static let docPath = "docs/07-networking/custom-codable-polymorphism.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            enum Notice: Decodable {
                case text(String)
                case image(URL)
                enum K: String, CodingKey { case type, payload }
                init(from d: Decoder) throws {
                    let c = try d.container(keyedBy: K.self)
                    switch try c.decode(String.self, forKey: .type) {
                    case "text":  self = .text(try c.decode(String.self, forKey: .payload))
                    case "image": self = .image(try c.decode(URL.self, forKey: .payload))
                    default: throw DecodingError.dataCorruptedError(forKey: .type, in: c, debugDescription: "unknown")
                    }
                }
            }
            let raw = #"[{"type":"text","payload":"hi"},{"type":"image","payload":"https://a/b.png"}]"#.data(using: .utf8)!
            for n in try! JSONDecoder().decode([Notice].self, from: raw) { log.log("\(n)") }
        }
    }
}

private struct DTOUser { let id: Int; let name: String }
private struct DTOUserDTO: Decodable {
    let id: Int; let user_name: String
    func toDomain() -> DTOUser { DTOUser(id: id, name: user_name) }
}

struct DTODemo: Demo {
    static let id = "net.dto"
    static let title = "DTO Pattern"
    static let summary = "전송용 DTO ↔ 도메인 모델 변환. 서버 스키마 변경의 충격을 흡수."
    static let docPath = "docs/07-networking/dto-pattern.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let raw = #"{"id":7,"user_name":"K"}"#.data(using: .utf8)!
            let dto = try! JSONDecoder().decode(DTOUserDTO.self, from: raw)
            log.log("DTO → id=\(dto.id), user_name=\(dto.user_name)")
            let domain = dto.toDomain()
            log.log("Domain → id=\(domain.id), name=\(domain.name)")
        }
    }
}

struct JSONStrategiesDemo: Demo {
    static let id = "net.json-strategies"
    static let title = "JSON Strategies"
    static let summary = "snake_case 자동, custom date, 유연한 null/optional 처리."
    static let docPath = "docs/07-networking/json-strategies.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "keyDecodingStrategy: .useDefaultKeys / .convertFromSnakeCase / .custom",
            "dataDecodingStrategy: .base64 / .deferredToData / .custom",
            "dateDecodingStrategy: .iso8601 / .formatted / .millisecondsSince1970",
            "optional 필드는 ? 선언만으로 미존재 허용",
        ])
    }
}

struct APIClientDemo: Demo {
    static let id = "net.api-client"
    static let title = "API Client"
    static let summary = "Endpoint enum + Request builder. URLSession은 transport에 가두기."
    static let docPath = "docs/07-networking/api-client-design.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            enum Endpoint {
                case todo(Int)
                var path: String { switch self { case .todo(let id): return "/todos/\(id)" } }
            }
            struct Client {
                let base = URL(string: "https://jsonplaceholder.typicode.com")!
                func request<T: Decodable>(_ ep: Endpoint, as: T.Type) async throws -> T {
                    let url = base.appendingPathComponent(ep.path)
                    let (data, _) = try await URLSession.shared.data(from: url)
                    return try JSONDecoder().decode(T.self, from: data)
                }
            }
            Task {
                do { let t: Todo = try await Client().request(.todo(1), as: Todo.self); log.log("\(t)") }
                catch { log.log("err: \(error)") }
            }
        }
    }
}

struct RequestInterceptorDemo: Demo {
    static let id = "net.interceptor"
    static let title = "Request Interceptor"
    static let summary = "Auth header 자동 부착, 응답 401 시 token refresh + retry."
    static let docPath = "docs/07-networking/request-interceptor.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Adapter: 요청 보내기 전에 header/쿼리/바디 수정",
            "Retrier: 응답을 보고 (이전 요청, 응답, 에러) 기반으로 재시도 결정",
            "토큰 만료 401 → refresh → 원 요청 재시도 패턴이 가장 흔함",
            "URLProtocol 또는 URLSession의 delegate, Alamofire의 Session adapter 활용",
        ])
    }
}

struct AuthTokenRefreshDemo: Demo {
    static let id = "net.auth-token-refresh"
    static let title = "Auth & Token Refresh"
    static let summary = "동시에 들어오는 401 다발을 1번의 refresh로 묶어내야 race 안 남."
    static let docPath = "docs/07-networking/auth-and-token-refresh.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "단일 refresh Task를 actor로 보관, 다른 호출은 같은 Task await",
            "refresh 실패 시 로그아웃까지 통합 처리",
            "access token 짧게, refresh token Keychain에 저장",
            "background URLSession에서도 동작하도록 thread-safe 설계",
        ])
    }
}

struct OAuthJWTDemo: Demo {
    static let id = "net.oauth-jwt"
    static let title = "OAuth & JWT"
    static let summary = "JWT는 header.payload.signature, payload는 base64url-encoded JSON."
    static let docPath = "docs/07-networking/oauth-and-jwt.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSyJ9.signature"
            let parts = jwt.split(separator: ".")
            func b64urlDecode(_ s: Substring) -> String? {
                var t = String(s).replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
                while t.count % 4 != 0 { t.append("=") }
                guard let d = Data(base64Encoded: t) else { return nil }
                return String(data: d, encoding: .utf8)
            }
            log.log("header  = \(b64urlDecode(parts[0]) ?? "")")
            log.log("payload = \(b64urlDecode(parts[1]) ?? "")")
        }
    }
}

struct RetryCircuitBreakerDemo: Demo {
    static let id = "net.retry-circuit-breaker"
    static let title = "Retry / Circuit Breaker"
    static let summary = "지수 백오프 + jitter + 회로 차단으로 서버 부하 보호."
    static let docPath = "docs/07-networking/retry-and-circuit-breaker.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                var attempt = 0
                func flakyCall() async throws {
                    attempt += 1
                    if attempt < 3 { throw URLError(.timedOut) }
                }
                let maxRetry = 4
                for i in 1...maxRetry {
                    do {
                        try await flakyCall()
                        log.log("attempt \(i) 성공"); break
                    } catch {
                        let delayMs = Int(pow(2.0, Double(i)) * 50) + Int.random(in: 0..<50)
                        log.log("attempt \(i) 실패 → \(delayMs)ms 대기")
                        try? await Task.sleep(nanoseconds: UInt64(delayMs) * 1_000_000)
                    }
                }
            }
        }
    }
}

struct BackgroundTasksDemo: Demo {
    static let id = "net.background-tasks"
    static let title = "Background URLSession"
    static let summary = "앱이 죽어도 OS가 다운로드/업로드 계속. configuration(.background)."
    static let docPath = "docs/07-networking/background-tasks-and-retry.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "URLSessionConfiguration.background(withIdentifier:) 사용",
            "delegate가 application(_:handleEventsForBackgroundURLSession:) 통해 완료 핸들러 호출",
            "discretionary=true면 OS가 Wi-Fi/충전 등 좋은 조건에서 실행",
            "큰 업로드는 multipart + uploadTask로 분할",
        ])
    }
}

struct NetworkStackPinningDemo: Demo {
    static let id = "net.stack-pinning"
    static let title = "Network Stack & Pinning"
    static let summary = "URLSession 위에 monitoring/logging/pinning을 레이어로 쌓는 설계."
    static let docPath = "docs/07-networking/network-stack-and-pinning.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "URLSessionDelegate에서 SecTrust 평가 → 공개키 핀 검증",
            "App Transport Security 정책으로 HTTP 차단(예외 등록은 plist)",
            "프록시/디버깅 빌드에서는 pinning 우회 토글 필요",
            "NWPathMonitor로 연결 타입(Wi-Fi/cellular/none) 추적",
        ])
    }
}
