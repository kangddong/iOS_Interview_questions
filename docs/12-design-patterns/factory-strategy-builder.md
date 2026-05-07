# Factory / Strategy / Builder

> 한 줄 요약 — *객체 생성*과 *알고리즘 교체*를 깔끔하게 표현하는 GoF 패턴 셋. iOS에서는 **Factory(생성)**, **Strategy(런타임 알고리즘 교체)**, **Builder(복잡한 객체 단계적 구성)**이 자주 등장.

## Factory

객체 생성 책임을 별도로 분리. *어떤 구체 타입을 만들지* 호출자가 모름.

```swift
protocol Logger { func log(_ message: String) }
struct ConsoleLogger: Logger { ... }
struct FileLogger: Logger { ... }

enum LoggerFactory {
    static func make(env: Env) -> Logger {
        switch env {
        case .debug: return ConsoleLogger()
        case .release: return FileLogger(path: ...)
        }
    }
}

let logger = LoggerFactory.make(env: .debug)
```

- 호출자는 `Logger` 프로토콜만 알면 됨.
- 분기 변경이 한 곳에 모임.
- 테스트에서 `MockLoggerFactory`로 교체 가능.

### 화면 단위 Factory

VC/View 생성을 한 곳에 모아 의존성 주입을 깔끔히.

```swift
final class HomeFactory {
    let auth: AuthAPIType
    let user: UserRepoType

    func makeHomeVC() -> HomeVC {
        HomeVC(viewModel: HomeVM(auth: auth, user: user))
    }
}
```

Coordinator + Factory 조합이 흔함.

## Strategy

런타임에 *알고리즘*을 교체.

```swift
protocol SortStrategy {
    func sort<T: Comparable>(_ items: [T]) -> [T]
}

struct QuickSort: SortStrategy { ... }
struct MergeSort: SortStrategy { ... }

final class Pipeline {
    var sorter: SortStrategy = QuickSort()
    func process(_ items: [Int]) -> [Int] { sorter.sort(items) }
}

let p = Pipeline()
p.sorter = MergeSort()      // 런타임 교체
```

iOS에서:
- 결제 수단 (`PaymentStrategy`: Card, ApplePay, BankTransfer).
- 리스트 정렬 옵션 (사용자 설정).
- 캐시 정책 (`CacheStrategy`: LRU, FIFO).

Closure 하나로도 충분한 경우가 많음:

```swift
final class Pipeline {
    var sort: ([Int]) -> [Int] = { $0.sorted() }
}
```

protocol을 쓸지 closure를 쓸지는 *상태 보유 여부*와 *메서드 수*로 결정.

## Builder

매개변수가 많고 *조합이 복잡한* 객체 구성.

```swift
final class URLRequestBuilder {
    private var url: URL
    private var method: String = "GET"
    private var headers: [String: String] = [:]
    private var body: Data?

    init(url: URL) { self.url = url }

    @discardableResult
    func method(_ m: String) -> Self { self.method = m; return self }

    @discardableResult
    func header(_ k: String, _ v: String) -> Self {
        headers[k] = v; return self
    }

    @discardableResult
    func body(_ d: Data) -> Self { self.body = d; return self }

    func build() -> URLRequest {
        var req = URLRequest(url: url)
        req.httpMethod = method
        for (k, v) in headers { req.setValue(v, forHTTPHeaderField: k) }
        req.httpBody = body
        return req
    }
}

let req = URLRequestBuilder(url: url)
    .method("POST")
    .header("Content-Type", "application/json")
    .body(jsonData)
    .build()
```

Swift는 `inout` parameter / 키워드 init / Result Builder로 더 짧게 표현하는 경우도 많음.

### Result Builder 활용

SwiftUI의 `VStack { ... }`이 Builder의 result builder 버전. 도메인이 *DSL스러운* 표현이면 result builder 검토.

```swift
@resultBuilder
enum AttributedStringBuilder {
    static func buildBlock(_ parts: AttributedString...) -> AttributedString { ... }
}

@AttributedStringBuilder
var richText: AttributedString {
    "Hello "
    "world".bold()
    "!"
}
```

## 비교 — 언제 무엇

| 상황 | 적합 |
|---|---|
| 구체 타입 선택을 캡슐화 | Factory |
| 객체 *방대한 매개변수* | Builder |
| 런타임 알고리즘 교체 | Strategy (또는 Closure) |
| 작은 옵션 분기 | enum + switch |

## 흔한 함정 / Follow-up

- **Q. Factory에서 너무 많은 분기.**
  분기 기준이 늘면 *별도 객체*로 빼고 polymorphism을 활용. 또는 type registry (`registerType(_:for:)`).

- **Q. Builder vs default parameter init?**
  Swift는 default param + 명명 인자로 어지간한 객체 생성을 표현 가능. Builder는 *조건부 단계*가 있을 때.

- **Q. Strategy를 enum으로 표현?**
  분기 케이스가 적고 닫혀 있다면 enum + switch가 더 단순. protocol은 *외부 확장*이 필요할 때.

- **Q. Factory 패턴 = 싱글턴인가?**
  아니다. Factory는 객체 *생성 캡슐화*. 싱글턴은 *유일 인스턴스 보장*. 별개.

- **Q. SwiftUI에서 Factory?**
  보통 환경/Observable 객체 주입으로 흡수. 그래도 화면 진입 시 ViewModel 생성을 모으는 Factory 패턴은 유효.

## 참고

- Gang of Four: Design Patterns
- Apple Docs: Common patterns in Cocoa
- 12-design-patterns/[composition-over-inheritance.md](composition-over-inheritance.md)
