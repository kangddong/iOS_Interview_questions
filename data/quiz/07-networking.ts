import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── 07-networking/api-client-design (add: 4) ─────────────────────────
  {
    id: "objective-c07-intermediate-api-client-design-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "Endpoint protocol에서 `associatedtype Response: Decodable`을 사용하는 핵심 이유는 무엇인가?",
    choices: [
      { id: "a", text: "응답 타입을 제네릭 파라미터로 묶어 호출부에서 별도 캐스팅 없이 컴파일 타임에 타입을 추론할 수 있다." },
      { id: "b", text: "JSONDecoder가 Decodable을 요구하기 때문에 프로토콜 채택이 강제된다." },
      { id: "c", text: "비동기 네트워크 호출을 직렬화하기 위한 Actor 격리 요구 사항이다." },
      { id: "d", text: "서버 에러 모델과 성공 모델을 같은 타입으로 통합하기 위한 타입 소거 패턴이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`associatedtype Response: Decodable`을 두면 `client.send(GetUser(id: 1))` 호출 시 반환값이 자동으로 `UserDTO`로 추론된다. 호출부에서 `as? UserDTO` 같은 캐스팅이 필요 없어 타입 안전성이 높아진다.",
    relatedTopicSlugs: ["07-networking/api-client-design"],
  },
  {
    id: "objective-c07-intermediate-api-client-design-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "API Client의 에러 매핑 계층에서 `NetError.unauthorized`를 별도 케이스로 두는 이유로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "401은 다른 HTTP 에러와 달리 토큰 갱신 인터셉터가 별도 처리해야 하는 특수 케이스이므로, 호출부와 인터셉터가 패턴 매칭으로 빠르게 분기할 수 있다." },
      { id: "b", text: "Apple이 URLError에 401 코드를 포함시키지 않아서 별도 정의가 강제된다." },
      { id: "c", text: "401은 재시도가 불가능한 영구 오류이기 때문에 Circuit Breaker에 기록해야 한다." },
      { id: "d", text: "서버가 401을 내려도 JSON body가 없으므로 디코딩 에러로 분류해야 한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "401은 토큰 만료/인증 실패를 의미하며, 인터셉터에서 refresh → 재시도 흐름을 트리거해야 한다. `NetError.unauthorized`를 독립 케이스로 두면 호출부와 미들웨어 모두 `switch` 한 줄로 분기할 수 있다.",
    relatedTopicSlugs: ["07-networking/api-client-design"],
  },
  {
    id: "objective-c07-advanced-api-client-design-003",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "Moya 스타일 enum Target과 Endpoint protocol struct 방식의 차이로 올바른 것은?",
    choices: [
      { id: "a", text: "enum은 모든 API를 한 파일에서 볼 수 있어 가시성이 좋지만, 새 케이스 추가 시 switch문을 전체 수정해야 하고 케이스별 응답 타입을 associated type으로 연결하기 어렵다." },
      { id: "b", text: "struct 방식은 Response 타입을 컴파일 타임에 추론할 수 없어서 항상 Any로 반환해야 한다." },
      { id: "c", text: "enum 방식은 컴파일 타임 type-safety가 struct보다 뛰어나며 시니어 코드베이스에서 더 선호된다." },
      { id: "d", text: "struct Endpoint는 URLSession 없이도 URLRequest를 직접 보낼 수 있어 테스트가 불필요하다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Moya 식 enum은 한 눈에 전체 API를 볼 수 있지만, 케이스 추가 시 여러 switch를 건드려야 하고 associatedtype을 한 개만 가질 수 있어 케이스별 응답 타입 추론이 어렵다. struct/Endpoint protocol은 타입 안전하고 모듈별 격리가 쉬워 대규모 코드베이스에 적합하다.",
    relatedTopicSlugs: ["07-networking/api-client-design"],
  },
  {
    id: "objective-c07-basic-api-client-design-004",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "APIClient의 응답 디코딩 파이프라인에서 status 검증을 Decoder 단계 앞에 두는 이유는?",
    choices: [
      { id: "a", text: "4xx/5xx 응답은 성공 모델과 다른 에러 JSON을 가질 수 있으므로, 상태 코드를 먼저 확인하고 에러 body를 별도 디코딩해야 한다." },
      { id: "b", text: "JSONDecoder가 상태 코드를 인식하지 못해서 반드시 먼저 변환해야 한다." },
      { id: "c", text: "iOS에서 HTTPURLResponse가 Data보다 항상 먼저 도착하기 때문이다." },
      { id: "d", text: "Decoder는 UTF-8 외의 인코딩을 지원하지 않아 상태 코드 확인 후 인코딩을 변환해야 한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "서버가 4xx/5xx에서 내려보내는 body는 성공 DTO가 아닌 에러 모델(`ServerErrorBody`)이다. status를 먼저 확인해 실패 케이스에서는 에러 body를 디코딩하고 throw 해야 성공 디코딩과 충돌하지 않는다.",
    relatedTopicSlugs: ["07-networking/api-client-design"],
  },

  // ── 07-networking/auth-and-token-refresh (add: 2) ─────────────────────
  {
    id: "objective-c07-intermediate-auth-and-token-refresh-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "여러 요청이 동시에 401을 받았을 때 refresh 호출이 한 번만 이루어지도록 보장하는 Swift 구현 패턴은?",
    choices: [
      { id: "a", text: "`actor` 안에서 `Task<String, Error>` 인스턴스를 저장해 이미 진행 중인 refresh Task가 있으면 그 값을 `await task.value`로 공유한다." },
      { id: "b", text: "`DispatchQueue.main.async`로 직렬화하고 `NSLock`을 함께 사용한다." },
      { id: "c", text: "NotificationCenter를 통해 refresh 완료 이벤트를 브로드캐스트하고 대기 중인 요청들이 구독한다." },
      { id: "d", text: "`@Published` var를 observe해서 토큰이 갱신되면 UI 레이어에서 재요청을 트리거한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`actor` 타입의 `TokenStore`에 `refreshTask: Task<String, Error>?`를 두면, 첫 번째 401 요청이 Task를 생성하고 나머지는 `await task.value`로 같은 Task를 기다린다. actor 격리로 race condition 없이 refresh가 정확히 한 번만 실행된다.",
    relatedTopicSlugs: ["07-networking/auth-and-token-refresh"],
  },
  {
    id: "objective-c07-basic-auth-and-token-refresh-002",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "access token과 refresh token을 iOS에서 가장 안전하게 저장하는 방법은?",
    choices: [
      { id: "a", text: "Keychain — 암호화된 저장소로 다른 앱이 접근할 수 없고 백업 옵션도 제어 가능하다." },
      { id: "b", text: "UserDefaults — 앱 간 공유가 쉬워 멀티 타겟 앱에 유리하다." },
      { id: "c", text: "메모리 전역 변수 — 디스크에 기록되지 않아 가장 안전하다." },
      { id: "d", text: "Core Data — 트랜잭션 보장으로 토큰 쓰기 충돌을 방지한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Keychain은 시스템 수준에서 암호화된 저장소이며 다른 앱이 접근할 수 없다. UserDefaults는 평문으로 저장되어 백업 파일이나 디바이스 공유에서 노출될 수 있고, 메모리 저장은 앱 재시작 시 토큰을 잃는다.",
    relatedTopicSlugs: ["07-networking/auth-and-token-refresh"],
  },

  // ── 07-networking/background-tasks-and-retry (add: 3) ─────────────────
  {
    id: "objective-c07-basic-background-tasks-and-retry-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "Background URLSession에서 `isDiscretionary = true`로 설정하면 어떤 동작이 달라지는가?",
    choices: [
      { id: "a", text: "시스템이 WiFi 연결 및 충전 중 같은 최적 조건에서 작업을 수행하므로 배터리와 데이터를 절약할 수 있다." },
      { id: "b", text: "백그라운드에서도 앱 프로세스를 항상 살아있게 유지한다." },
      { id: "c", text: "다운로드가 실패하면 즉시 사용자에게 푸시 알림을 보낸다." },
      { id: "d", text: "세션을 foreground로 자동 전환해 즉각적인 다운로드를 보장한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`isDiscretionary = true`는 시스템이 WiFi 연결, 충전 상태 같은 조건을 고려해 가장 효율적인 시점에 작업을 수행하게 한다. 사진 백업처럼 시급하지 않은 작업에 적합하며, 즉시 실행이 필요하면 `false`로 둬야 한다.",
    relatedTopicSlugs: ["07-networking/background-tasks-and-retry"],
  },
  {
    id: "objective-c07-intermediate-background-tasks-and-retry-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "HTTP 캐시에서 `ETag`와 `If-None-Match` 헤더 조합의 역할은?",
    choices: [
      { id: "a", text: "서버가 응답에 ETag를 내려주면 클라이언트는 다음 요청에 If-None-Match로 그 값을 보내고, 리소스가 변경되지 않았으면 서버가 304 Not Modified를 반환해 본문 전송을 생략한다." },
      { id: "b", text: "ETag는 서버 인증을 위한 HMAC 서명이며 If-None-Match는 클라이언트 서명과 비교하는 헤더다." },
      { id: "c", text: "ETag는 캐시 만료 시간을 초 단위로 나타내며 If-None-Match는 만료 여부를 묻는 헤더다." },
      { id: "d", text: "이 두 헤더는 URLSession이 아닌 WebKit만 사용하며 URLCache에는 영향이 없다." },
    ],
    correctChoiceId: "a",
    explanation:
      "서버는 응답에 `ETag: \"v2\"`를 포함하고, 클라이언트는 재요청 시 `If-None-Match: \"v2\"`를 보낸다. 리소스가 바뀌지 않았다면 서버는 304 Not Modified와 빈 body를 반환해 대역폭을 절약한다. URLSession은 `useProtocolCachePolicy`로 이 동작을 자동 처리한다.",
    relatedTopicSlugs: ["07-networking/background-tasks-and-retry"],
  },
  {
    id: "objective-c07-intermediate-background-tasks-and-retry-003",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "멀티파트 업로드에서 큰 파일을 `Data`로 메모리에 모두 올리는 대신 권장되는 방법은?",
    choices: [
      { id: "a", text: "`uploadTask(with:fromFile:)`를 사용해 파일 URL을 스트리밍으로 전송한다." },
      { id: "b", text: "`downloadTask`로 먼저 서버에 파일을 다운로드한 뒤 업로드한다." },
      { id: "c", text: "파일을 512KB 청크로 나눠 `dataTask`를 순차적으로 호출한다." },
      { id: "d", text: "background session에서 `isDiscretionary = false`로 설정하면 메모리 사용이 자동으로 줄어든다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`uploadTask(with:fromFile:)`는 파일을 메모리에 모두 올리지 않고 디스크에서 직접 스트리밍하므로 메모리 압박이 없다. Data 기반 업로드는 파일 전체를 메모리에 올려 대용량 파일에서 OOM을 유발할 수 있다.",
    relatedTopicSlugs: ["07-networking/background-tasks-and-retry"],
  },

  // ── 07-networking/codable-deep (add: 4) ──────────────────────────────
  {
    id: "objective-c07-intermediate-codable-deep-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "`UnkeyedDecodingContainer`에서 decode가 실패했을 때 인덱스가 진행되지 않는다. 이를 해결하기 위한 올바른 방법은?",
    choices: [
      { id: "a", text: "`AnyDecodable`로 강제 소비하거나, 미리 `[AnyDecodable]`로 배열 전체를 받은 뒤 개별 원소를 분기 디코딩한다." },
      { id: "b", text: "`continue` 키워드로 while 루프를 건너뛰면 인덱스가 자동 증가한다." },
      { id: "c", text: "`currentIndex += 1`을 직접 호출해 인덱스를 강제로 올린다." },
      { id: "d", text: "`decodeIfPresent`를 사용하면 실패 시 인덱스가 자동으로 진행된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "UnkeyedDecodingContainer는 실패한 decode 호출이 인덱스를 전진시키지 않는다. `try? arr.decode(AnyDecodable.self)`로 강제 소비해 인덱스를 한 칸 올리거나, 전체 배열을 `[AnyDecodable]`로 먼저 받아 raw값으로 재분기하는 방법을 사용한다.",
    relatedTopicSlugs: ["07-networking/codable-deep"],
  },
  {
    id: "objective-c07-intermediate-codable-deep-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "`SingleValueDecodingContainer`를 활용한 Wrapper 타입의 주된 장점은?",
    choices: [
      { id: "a", text: "JSON에 추가 키 없이 원시값 형태로 평탄화되면서 `UserID`와 `PostID` 같은 도메인 타입 안전성을 직렬화 비용 없이 얻는다." },
      { id: "b", text: "JSON 배열을 key-value 딕셔너리로 변환하는 비용을 제거한다." },
      { id: "c", text: "Decodable 합성을 완전히 우회해 리플렉션 오버헤드를 없앤다." },
      { id: "d", text: "여러 타입을 동시에 디코딩할 수 있는 병렬 처리 컨테이너를 제공한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`SingleValueDecodingContainer`를 쓰면 `UserID`가 `\"u_123\"` 형태의 단순 문자열로 JSON에 저장되지만, Swift 코드에서는 `UserID` 타입이 강제돼 `PostID`와 혼용하는 실수를 컴파일 타임에 잡는다.",
    relatedTopicSlugs: ["07-networking/codable-deep"],
  },
  {
    id: "objective-c07-advanced-codable-deep-003",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "클래스 상속에서 자식이 `superEncoder(forKey:)`를 사용하는 이유는?",
    choices: [
      { id: "a", text: "부모 키와 자식 키가 같은 레벨에서 충돌하지 않도록 부모 프로퍼티를 별도 중첩 컨테이너로 분리하기 위해서다." },
      { id: "b", text: "부모 클래스가 final이 아닌 경우에만 Codable 합성이 동작하기 때문이다." },
      { id: "c", text: "JSON에서 상속 계층을 나타내기 위한 표준 포맷인 `$type` 키를 자동 생성한다." },
      { id: "d", text: "`super.encode(to:)`는 비동기로 동작해 순서 보장을 위해 별도 키를 사용한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "자식 클래스가 `super.encode(to: c.superEncoder(forKey: .sup))`로 부모 encode를 호출하면, 부모 프로퍼티는 `\"sup\"` 키 아래 중첩된 객체로 들어가 자식 키와 충돌하지 않는다. `superEncoder()` 기본값은 `\"super\"` 키를 사용하는데, 자식 키와 이름이 겹칠 수 있어 명시 키 권장.",
    relatedTopicSlugs: ["07-networking/codable-deep"],
  },
  {
    id: "objective-c07-basic-codable-deep-004",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "`decodeIfPresent`가 `nil`을 반환하는 두 가지 경우는?",
    choices: [
      { id: "a", text: "키가 JSON에 존재하지 않을 때, 또는 키는 있지만 값이 `null`일 때 — 두 경우 모두 nil을 반환한다." },
      { id: "b", text: "타입이 일치하지 않을 때와 키가 없을 때 — 타입 불일치는 throw 대신 nil을 반환한다." },
      { id: "c", text: "값이 빈 문자열(`\"\"`)일 때와 값이 0일 때 — 기본 falsy 값은 nil로 변환된다." },
      { id: "d", text: "키가 CodingKeys에 정의되지 않을 때와 네트워크 에러가 발생했을 때이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`decodeIfPresent`는 키 자체가 없는 경우와 키가 있지만 값이 `null`인 두 경우 모두 `nil`을 반환한다. 두 경우를 구분하려면 `container.contains(.key)`로 키 존재 여부를 먼저 확인한 뒤 분기해야 한다.",
    relatedTopicSlugs: ["07-networking/codable-deep"],
  },

  // ── 07-networking/codable (add: 2) ────────────────────────────────────
  {
    id: "objective-c07-basic-codable-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "`JSONDecoder`에서 `keyDecodingStrategy = .convertFromSnakeCase`를 설정할 때 주의해야 할 사항은?",
    choices: [
      { id: "a", text: "`CodingKeys`에서 이미 camelCase 원시값을 지정한 키와 함께 사용하면 lookup이 실패한다. 전략이 먼저 모든 키를 camelCase로 변환하기 때문이다." },
      { id: "b", text: "이 전략은 iOS 16 이상에서만 지원되어 하위 호환성에 주의해야 한다." },
      { id: "c", text: "`dateDecodingStrategy`와 동시에 사용하면 날짜 파싱이 비활성화된다." },
      { id: "d", text: "배열 타입의 프로퍼티에는 적용되지 않아 별도 CodingKeys가 필요하다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`.convertFromSnakeCase`는 컨테이너 진입 시 모든 키를 camelCase로 변환한다. 따라서 `CodingKeys`에 `case userId = \"user_id\"`를 함께 사용하면 전략이 이미 `\"user_id\"`를 `\"userId\"`로 바꾼 상태에서 `\"user_id\"` raw value를 찾으려 하므로 키를 찾지 못한다.",
    relatedTopicSlugs: ["07-networking/codable"],
  },
  {
    id: "objective-c07-basic-codable-002",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "서버 응답에서 `Int` 타입으로 선언한 프로퍼티가 JSON에 `null`로 내려올 때 `Decodable` 자동 합성의 기본 동작은?",
    choices: [
      { id: "a", text: "디코딩이 실패해 에러가 throw된다. `null`을 `Int`로 받으려면 `Int?`로 바꾸거나 `init(from:)`을 직접 구현해야 한다." },
      { id: "b", text: "`null`은 자동으로 0으로 변환된다." },
      { id: "c", text: "컴파일러가 자동으로 Optional을 삽입해 nil로 처리한다." },
      { id: "d", text: "`JSONDecoder`가 `null`을 무시하고 프로퍼티를 기본값으로 초기화한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`Decodable`의 자동 합성은 non-optional 프로퍼티에 `null`이 오면 `valueNotFound` 에러를 throw한다. 해결책은 프로퍼티를 `Int?`로 선언하거나 `init(from:)`에서 `decodeIfPresent`와 기본값을 조합하는 것이다.",
    relatedTopicSlugs: ["07-networking/codable"],
  },

  // ── 07-networking/custom-codable-polymorphism (add: 4) ────────────────
  {
    id: "objective-c07-intermediate-custom-codable-polymorphism-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "Discriminated Union 패턴에서 discriminator 키를 읽은 후 자식 타입을 디코딩할 때 `ImageItem(from: decoder)`를 사용하는 이유는?",
    choices: [
      { id: "a", text: "discriminator를 읽은 keyed container는 소비되지 않았고, 원래 `decoder`를 그대로 전달하면 자식 타입이 전체 JSON payload를 자신의 CodingKeys로 디코딩할 수 있다." },
      { id: "b", text: "Swift 컴파일러가 associated enum value에 대해 자동 합성을 적용하기 위해 원래 decoder를 요구한다." },
      { id: "c", text: "keyed container를 재진입할 수 없어서 별도 JSONDecoder 인스턴스를 생성해 넘겨야 한다." },
      { id: "d", text: "`singleValueContainer`로 전환한 뒤 자식 타입을 decode하는 것이 정석 패턴이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "keyed container로 discriminator를 '읽기만 하면' 원본 `decoder`는 소비되지 않는다. 같은 `decoder`를 `ImageItem(from: decoder)`에 전달하면 ImageItem은 전체 JSON 객체를 자신의 프로퍼티로 디코딩할 수 있다. `singleValueContainer()`로 전환하면 keyed container를 이미 열었기 때문에 충돌이 발생한다.",
    relatedTopicSlugs: ["07-networking/custom-codable-polymorphism"],
  },
  {
    id: "objective-c07-intermediate-custom-codable-polymorphism-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "서버가 새 타입(`audio`)을 추가해도 앱이 크래시하지 않도록 하는 forward compatibility 패턴은?",
    choices: [
      { id: "a", text: "enum에 `case unknown(String)` 케이스를 두고 switch default에서 `self = .unknown(raw)`로 처리한다." },
      { id: "b", text: "`guard case let .known(v) = item else { return }`으로 모든 호출부에서 무시한다." },
      { id: "c", text: "서버와 계약을 맺어 새 타입 추가 시 반드시 앱을 먼저 배포하도록 강제한다." },
      { id: "d", text: "`@unknown default`를 사용해 컴파일 경고를 무시 처리한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`case unknown(String)` 케이스를 두면 서버가 새 타입을 추가해도 앱이 크래시하지 않는다. switch default에서 `self = .unknown(raw)`로 처리해 알 수 없는 타입을 조용히 무시함으로써 강제 업데이트 없이 앱이 계속 동작한다.",
    relatedTopicSlugs: ["07-networking/custom-codable-polymorphism"],
  },
  {
    id: "objective-c07-advanced-custom-codable-polymorphism-003",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "JSON Merge Patch(RFC 7396)를 모델링할 때 `Patch<T>` enum이 필요한 이유는?",
    choices: [
      { id: "a", text: "PATCH API에서 '값 변경(set)', '삭제(null)', '변경 없음(키 부재)' 세 가지 상태를 `Optional<T>`만으로는 표현할 수 없기 때문이다." },
      { id: "b", text: "서버가 PATCH 요청에서 JSON 배열을 지원하지 않기 때문에 특수 타입이 필요하다." },
      { id: "c", text: "Swift의 `Optional`이 PATCH 요청 인코딩 시 키를 항상 생략하기 때문이다." },
      { id: "d", text: "Codable이 두 개 이상의 Optional 중첩을 지원하지 않아 대안이 필요하다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`Optional<T>`는 `nil`과 `값`만 표현한다. PATCH에서 'null 명시(삭제)'와 '키 자체 부재(변경 없음)'를 구분하려면 `Patch<T>` enum의 `.null`, `.absent`, `.set(T)` 세 케이스가 필요하다. 기본 `JSONEncoder`는 `nil`을 키 생략으로 직렬화해 null과 absent를 구분하지 못한다.",
    relatedTopicSlugs: ["07-networking/custom-codable-polymorphism"],
  },
  {
    id: "objective-c07-basic-custom-codable-polymorphism-004",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "`AnyCodable` / `AnyDecodable`을 사용하기에 적합한 상황은?",
    choices: [
      { id: "a", text: "analytics 이벤트 properties, feature flag payload처럼 스키마가 런타임까지 정해지지 않는 *경계가 명확한 영역*에 한정한다." },
      { id: "b", text: "코드 작성 시간을 단축하기 위해 서비스 레이어의 모든 응답 모델에 적용한다." },
      { id: "c", text: "JSONDecoder의 성능을 높이기 위해 자주 디코딩되는 타입에 사용한다." },
      { id: "d", text: "Codable 자동 합성을 지원하지 않는 구조체에서만 사용한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`AnyDecodable`은 타입 안전성을 포기하므로 자동완성, 리팩터링, 컴파일 타임 오류 감지가 불가능해진다. analytics 속성이나 webhook payload처럼 스키마가 정해지지 않은 경계 영역에만 한정해야 하며, 비즈니스 로직 레이어 전반에 사용하는 것은 안티패턴이다.",
    relatedTopicSlugs: ["07-networking/custom-codable-polymorphism"],
  },

  // ── 07-networking/dto-pattern (add: 4) ───────────────────────────────
  {
    id: "objective-c07-basic-dto-pattern-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "DTO에 `var isExpired: Bool` 같은 computed property를 넣지 않아야 하는 이유는?",
    choices: [
      { id: "a", text: "computed property는 도메인 의미를 가지므로 DTO가 도메인 레이어의 역할을 침범하고 서버 스키마 변경이 뷰까지 전파되는 원인이 된다." },
      { id: "b", text: "Decodable 자동 합성이 computed property를 인식하지 못해 컴파일 에러가 발생한다." },
      { id: "c", text: "computed property는 Equatable 자동 합성에서 제외되어 SwiftUI diffing이 동작하지 않는다." },
      { id: "d", text: "Swift에서 Decodable 타입은 var 대신 let만 사용해야 한다는 컨벤션 때문이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "DTO의 역할은 서버가 보내는 형태 그대로 수신하는 것이다. `isExpired` 같은 비즈니스 의미를 가진 프로퍼티는 Domain Model에 두어야 한다. DTO에 넣으면 분리의 의미가 사라지고 서버 변경이 뷰까지 직접 전파된다.",
    relatedTopicSlugs: ["07-networking/dto-pattern"],
  },
  {
    id: "objective-c07-intermediate-dto-pattern-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "리스트 응답을 Domain으로 매핑할 때 관대한 정책(`compactMap`)과 엄격한 정책(`try map`)의 적절한 사용 기준은?",
    choices: [
      { id: "a", text: "화면 목록처럼 누락이 치명적이지 않으면 compactMap으로 실패 항목을 조용히 드롭하고, 결제·송금처럼 데이터 손실이 위험하면 try map으로 전체 실패를 선택한다." },
      { id: "b", text: "서버가 검증된 스키마를 보장하면 compactMap, 그렇지 않으면 try map을 사용한다." },
      { id: "c", text: "데이터 건수가 100개 미만이면 compactMap, 이상이면 try map이 성능상 유리하다." },
      { id: "d", text: "두 방식은 기능이 동일하며 팀 컨벤션에 따라 아무거나 선택해도 된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "정책 선택 기준은 누락의 위험도다. UI 리스트는 한 항목이 깨져도 나머지를 보여주는 것이 낫고(compactMap), 결제 항목 목록 같이 하나라도 빠지면 비즈니스 오류인 경우는 전체 실패가 안전하다(try map). 정책은 mapper가 아닌 호출자가 결정한다.",
    relatedTopicSlugs: ["07-networking/dto-pattern"],
  },
  {
    id: "objective-c07-intermediate-dto-pattern-003",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "DTO와 Domain Model을 분리했을 때 테스트 측면에서의 핵심 이점은?",
    choices: [
      { id: "a", text: "Domain 로직을 네트워크 레이어 없이 DTO 없이 단위 테스트할 수 있어 테스트 속도와 격리성이 높아진다." },
      { id: "b", text: "XCTest가 Decodable 타입만 직접 인스턴스화할 수 있기 때문에 DTO를 분리해야 한다." },
      { id: "c", text: "UITest에서 서버 없이 DTO를 주입해 E2E 테스트를 완전히 대체할 수 있다." },
      { id: "d", text: "Codable이 붙은 타입은 mock 처리가 불가능해 Domain 별도 타입이 필수다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Domain Model은 `Decodable`을 채택하지 않아 DTO나 네트워크 없이 순수하게 인스턴스를 만들 수 있다. 비즈니스 로직(상태 머신, 검증 등)을 완전히 격리해 빠른 단위 테스트가 가능하다.",
    relatedTopicSlugs: ["07-networking/dto-pattern"],
  },
  {
    id: "objective-c07-advanced-dto-pattern-004",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "여러 BFF(Backend for Frontend)에서 동일한 Domain Model로 수렴하는 패턴의 장점은?",
    choices: [
      { id: "a", text: "Legacy REST와 GraphQL BFF가 공존하는 마이그레이션 기간에도 뷰 코드를 변경하지 않고 각 BFF별 mapper만 유지·교체할 수 있다." },
      { id: "b", text: "두 BFF를 병렬로 호출하면 응답 속도가 2배 빨라지는 이점이 있다." },
      { id: "c", text: "Domain Model이 Codable을 채택하지 않아도 자동으로 JSON 직렬화가 가능해진다." },
      { id: "d", text: "GraphQL 응답은 REST와 다른 JSONDecoder가 필요하므로 Domain을 분리해야 한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Legacy REST `LegacyUserDTO`와 GraphQL `GraphUserDTO`가 각각 다른 initializer(`init(legacy:)`, `init(graph:)`)로 같은 `User` Domain으로 수렴하면, 뷰는 `User`만 알고 백엔드 구현을 모른다. 마이그레이션 중 두 백엔드를 동시에 운용해도 뷰 코드는 건드리지 않아도 된다.",
    relatedTopicSlugs: ["07-networking/dto-pattern"],
  },

  // ── 07-networking/json-strategies (add: 4) ────────────────────────────
  {
    id: "objective-c07-basic-json-strategies-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "`dateDecodingStrategy = .deferredToDate`가 서버 API에서 사용하기에 부적합한 이유는?",
    choices: [
      { id: "a", text: "Apple의 참조 날짜(2001-01-01)를 기준으로 한 Double 초 값을 사용해 일반 Unix epoch나 ISO 8601 포맷과 호환되지 않는다." },
      { id: "b", text: "이 전략은 deprecated되어 iOS 17 이상에서 컴파일 오류가 발생한다." },
      { id: "c", text: "UTC 타임존을 지원하지 않아 사용자 locale에 따라 날짜 값이 달라진다." },
      { id: "d", text: "`DateFormatter`보다 느려서 대용량 응답에서 성능 문제가 발생한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`.deferredToDate`는 Apple의 참조 날짜(2001-01-01 00:00:00 UTC) 기준의 초 단위 Double을 사용한다. 일반 서버는 Unix epoch(1970-01-01) 또는 ISO 8601 문자열을 보내므로 파싱이 잘못된다. Apple 전용 내부 직렬화 외에는 사용하지 말아야 한다.",
    relatedTopicSlugs: ["07-networking/json-strategies"],
  },
  {
    id: "objective-c07-intermediate-json-strategies-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "`DateFormatter`를 서버 통신에 사용할 때 `locale`을 반드시 `en_US_POSIX`로 설정해야 하는 이유는?",
    choices: [
      { id: "a", text: "사용자의 locale 설정에 따라 연도/달력 시스템이 달라져(예: 아랍 달력, 일본 황기) 날짜 파싱이 깨질 수 있기 때문이다." },
      { id: "b", text: "iOS가 `en_US_POSIX`만 ISO 8601을 지원하기 때문이다." },
      { id: "c", text: "서버가 항상 영어 날짜 이름(Mon, Jan 등)을 사용하기 때문에 영어 locale이 필요하다." },
      { id: "d", text: "`en_US_POSIX` 설정이 없으면 DateFormatter가 멀티스레드 환경에서 crash를 일으킨다." },
    ],
    correctChoiceId: "a",
    explanation:
      "사용자의 locale에 따라 달력 시스템이 그레고리력이 아닌 아랍이나 일본 황기로 바뀔 수 있어 `\"2026-01-01\"`이 전혀 다른 날짜로 파싱된다. `en_US_POSIX` locale은 항상 그레고리력의 고정된 파싱 규칙을 보장한다.",
    relatedTopicSlugs: ["07-networking/json-strategies"],
  },
  {
    id: "objective-c07-intermediate-json-strategies-003",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "스냅샷 테스트나 캐시 키에서 `JSONEncoder`의 `outputFormatting = .sortedKeys`가 필요한 이유는?",
    choices: [
      { id: "a", text: "Swift `Dictionary`의 키 순서가 런타임마다 다를 수 있어, 같은 모델이 다른 JSON 바이트로 인코딩되면 해시 비교나 스냅샷 비교가 비결정적으로 실패하기 때문이다." },
      { id: "b", text: "JSON 표준이 키를 사전 순으로 정렬하도록 요구하기 때문이다." },
      { id: "c", text: "서버가 정렬된 키를 요구하는 API 스펙이 있을 때만 사용한다." },
      { id: "d", text: "`sortedKeys`가 없으면 JSONEncoder가 nested 객체를 순환 참조로 오해해 에러를 발생시킨다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Swift Dictionary는 순서가 비결정적이므로 동일 모델을 두 번 인코딩해도 키 순서가 다를 수 있다. `.sortedKeys`를 사용하면 키 순서가 항상 알파벳 순으로 고정되어 스냅샷 테스트, 해시 서명, 캐시 키 비교에서 결정적인 결과를 얻는다.",
    relatedTopicSlugs: ["07-networking/json-strategies"],
  },
  {
    id: "objective-c07-advanced-json-strategies-004",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "서버 응답에 ISO 8601 날짜 중 일부는 밀리초가 있고(`\"2026-06-01T10:00:00.123Z\"`), 일부는 없는(`\"2026-06-01T10:00:00Z\"`) 경우 권장 처리 방법은?",
    choices: [
      { id: "a", text: "`.custom` 전략에서 `ISO8601DateFormatter` 두 인스턴스(withFractionalSeconds / plain)를 순서대로 시도하고 모두 실패하면 에러를 throw한다." },
      { id: "b", text: "`.iso8601` 전략은 밀리초 포함 포맷을 자동으로 처리하므로 추가 설정 없이 사용한다." },
      { id: "c", text: "`.millisecondsSince1970`와 `.iso8601`을 동시에 설정하면 자동 fallback이 적용된다." },
      { id: "d", text: "서버에 항상 밀리초를 포함한 포맷으로 통일하도록 요청하는 것이 유일한 해결책이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`.iso8601` 전략은 기본적으로 fractional seconds를 지원하지 않는다. `.custom` 전략에서 `ISO8601DateFormatter`에 `.withFractionalSeconds` 옵션을 추가한 것과 일반 formatter를 순서대로 시도하는 방식이 필요하다. 두 인스턴스를 모두 시도해 성공한 것을 사용하면 혼재 응답을 처리할 수 있다.",
    relatedTopicSlugs: ["07-networking/json-strategies"],
  },

  // ── 07-networking/network-stack-and-pinning (add: 4) ─────────────────
  {
    id: "objective-c07-intermediate-network-stack-and-pinning-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "Certificate Pinning보다 Public Key Pinning이 권장되는 이유는?",
    choices: [
      { id: "a", text: "인증서가 만료되어 같은 키페어로 새 인증서를 발급받을 경우, Public Key Pinning은 앱 업데이트 없이 계속 동작하지만 Certificate Pinning은 앱을 강제 업데이트해야 한다." },
      { id: "b", text: "Public Key Pinning은 TLS 1.3에서만 지원되므로 최신 보안 표준을 충족한다." },
      { id: "c", text: "인증서 데이터보다 공개키 해시가 작아서 네트워크 패킷 크기를 줄일 수 있다." },
      { id: "d", text: "Public Key Pinning은 인증서 전체를 검증하지 않아 서버 CPU 부하가 줄어든다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Certificate Pinning은 인증서 자체를 비교하므로 만료·갱신 시 새 인증서로 핀을 교체한 앱을 다시 배포해야 한다. Public Key Pinning은 키페어가 동일하면 인증서가 교체되어도 핀이 일치하므로 인증서 갱신 사이클에 유연하게 대응할 수 있다.",
    relatedTopicSlugs: ["07-networking/network-stack-and-pinning"],
  },
  {
    id: "objective-c07-basic-network-stack-and-pinning-002",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "Certificate Pinning을 구현하기 위해 반드시 필요한 것은?",
    choices: [
      { id: "a", text: "custom URLSession과 URLSessionDelegate — `URLSession.shared`는 delegate 설정이 불가능하므로 pinning을 적용할 수 없다." },
      { id: "b", text: "Info.plist에 NSPinnedDomains 키 설정만으로 충분하다." },
      { id: "c", text: "Alamofire 라이브러리가 필요하며 직접 구현은 불가능하다." },
      { id: "d", text: "앱 그룹 Entitlement를 통해 시스템 Keychain에 인증서를 등록해야 한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`URLSession.shared`는 delegate를 설정할 수 없다. Pinning은 `URLSessionDelegate`의 `urlSession(_:didReceive:completionHandler:)`에서 서버 인증서를 검증하므로 반드시 커스텀 `URLSession`과 delegate를 사용해야 한다.",
    relatedTopicSlugs: ["07-networking/network-stack-and-pinning"],
  },
  {
    id: "objective-c07-intermediate-network-stack-and-pinning-003",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "ATS(App Transport Security)의 기본 정책으로 올바른 것은?",
    choices: [
      { id: "a", text: "HTTP 평문 연결을 차단하고 TLS 1.2 이상을 강제한다. 예외 도메인은 Info.plist에 NSExceptionDomains로 선언해야 하며 심사 시 정당화가 필요하다." },
      { id: "b", text: "HTTPS만 허용하지만 TLS 버전 제한은 없다. 앱이 직접 TLS 버전을 선택할 수 있다." },
      { id: "c", text: "모든 도메인에서 Certificate Pinning을 강제한다." },
      { id: "d", text: "기본값은 모든 트래픽을 허용하며, `NSAllowsArbitraryLoads = false`를 명시해야 보안이 적용된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "ATS 기본 정책은 HTTP 차단 + TLS 1.2 이상 강제다. 레거시 도메인에 HTTP가 필요하면 `NSExceptionDomains`에 도메인을 명시하고 앱 심사에서 이유를 설명해야 한다. Certificate Pinning은 ATS와 별개의 추가 보안 계층이다.",
    relatedTopicSlugs: ["07-networking/network-stack-and-pinning"],
  },
  {
    id: "objective-c07-advanced-network-stack-and-pinning-004",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "Pinning이 실패했을 때 OS의 trust store로 폴백하면 안 되는 이유는?",
    choices: [
      { id: "a", text: "폴백을 허용하면 공격자가 신뢰받는 CA를 통해 fake 인증서를 발급받아 pinning의 보안 보장이 완전히 무력화된다." },
      { id: "b", text: "iOS 정책상 폴백을 구현하면 App Store 심사가 거부된다." },
      { id: "c", text: "OS trust store는 HTTP에만 사용되므로 HTTPS 연결에서는 접근할 수 없다." },
      { id: "d", text: "폴백 구현은 기술적으로 불가능하며, completionHandler에서 `.performDefaultHandling`을 반환하면 crash가 발생한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Certificate Pinning의 목적은 '신뢰받는 CA가 발급한 어떤 인증서도 통과'하는 OS trust store의 한계를 보완하는 것이다. 핀 불일치 시 OS trust store로 폴백하면 바로 이 취약점이 노출되어 MITM 공격이 가능해진다. 핀이 맞지 않으면 반드시 연결을 차단해야 한다.",
    relatedTopicSlugs: ["07-networking/network-stack-and-pinning"],
  },

  // ── 07-networking/oauth-and-jwt (add: 3) ─────────────────────────────
  {
    id: "objective-c07-intermediate-oauth-and-jwt-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "OAuth Authorization Code + PKCE 플로우에서 `state` 파라미터의 역할은?",
    choices: [
      { id: "a", text: "CSRF(Cross-Site Request Forgery) 방어를 위해 요청 시 생성하고 redirect 응답의 state 값과 동일한지 검증한다." },
      { id: "b", text: "사용자의 인증 상태를 서버가 저장하기 위한 세션 식별자다." },
      { id: "c", text: "PKCE의 code_verifier를 서버로 전달하는 파라미터다." },
      { id: "d", text: "access token의 만료 시간을 초 단위로 지정하는 파라미터다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`state`는 앱이 생성한 임의 문자열로, 인가 요청에 포함시킨다. redirect 응답에서 state 값이 원래 보낸 것과 일치하지 않으면 CSRF 공격으로 간주해 인가 코드를 폐기해야 한다.",
    relatedTopicSlugs: ["07-networking/oauth-and-jwt"],
  },
  {
    id: "objective-c07-intermediate-oauth-and-jwt-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "JWT에서 `alg: none` 공격이 가능한 조건과 방어 방법은?",
    choices: [
      { id: "a", text: "서버가 클라이언트 헤더의 `alg` 필드를 그대로 신뢰하면, 공격자가 alg를 none으로 변조해 서명 없이 임의 payload를 통과시킬 수 있다. 서버는 반드시 허용 알고리즘 화이트리스트를 고정해야 한다." },
      { id: "b", text: "JWT signature를 클라이언트가 검증하지 않으면 발생하며, 클라이언트 측 검증 로직 추가로 방어한다." },
      { id: "c", text: "HTTPS를 사용하지 않을 때만 가능하며 TLS로 완전히 방어된다." },
      { id: "d", text: "`alg: none`은 RFC 표준에서 제거되었으므로 최신 라이브러리를 사용하면 자동으로 방어된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "서버가 JWT 헤더의 `alg` 필드를 클라이언트가 제출한 대로 신뢰하면, 공격자는 `alg: none`으로 서명 없는 토큰을 만들어 보낸다. 서버는 `RS256`, `ES256` 등 허용 알고리즘을 코드에 하드코딩해 화이트리스트로 고정해야 한다.",
    relatedTopicSlugs: ["07-networking/oauth-and-jwt"],
  },
  {
    id: "objective-c07-advanced-oauth-and-jwt-003",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "Refresh Token Rotation(OAuth 2.1 권장)이 토큰 탈취 탐지에 도움이 되는 이유는?",
    choices: [
      { id: "a", text: "refresh 요청마다 새 refresh token을 발급하고 이전 것을 폐기하므로, 탈취된 refresh token이 두 번 사용되면 서버가 탐지해 세션 전체를 폐기할 수 있다." },
      { id: "b", text: "refresh token 자체를 JWT로 만들어 클라이언트가 직접 서명을 검증할 수 있기 때문이다." },
      { id: "c", text: "rotation이 적용되면 refresh token이 매우 짧은 수명(5분)을 갖게 돼 탈취해도 즉시 만료된다." },
      { id: "d", text: "access token과 refresh token을 동일한 값으로 동기화해 상태 불일치를 방지한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Refresh Token Rotation에서 서버는 refresh token이 사용될 때마다 새 것을 발급하고 이전 것을 무효화한다. 만약 탈취된 이전 token이 재사용되면 서버는 이미 사용된 token이 다시 들어온 것을 감지하고 해당 세션 전체를 폐기해 공격자와 정상 사용자 모두 재로그인을 요구한다.",
    relatedTopicSlugs: ["07-networking/oauth-and-jwt"],
  },

  // ── 07-networking/request-interceptor (add: 4) ───────────────────────
  {
    id: "objective-c07-basic-request-interceptor-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "Middleware Pipeline에서 로깅 미들웨어를 가장 바깥쪽에 두어야 하는 이유는?",
    choices: [
      { id: "a", text: "인증 실패로 인한 재시도까지 포함해 전체 흐름을 한 번에 로깅하고, 요청 ID와 응답 시간을 정확히 기록하기 위해서다." },
      { id: "b", text: "로깅이 모든 미들웨어 중 가장 빠르기 때문에 먼저 실행해야 성능이 향상된다." },
      { id: "c", text: "인증 헤더가 붙기 전 요청을 로깅해 토큰이 로그에 노출되지 않도록 하기 위해서다." },
      { id: "d", text: "URLSession에 가장 가까운 위치에서만 실제 HTTP 메서드와 URL을 알 수 있기 때문이다." },
    ],
    correctChoiceId: "a",
    explanation:
      "로깅을 가장 바깥에 두면 인증 헤더 첨부, 재시도 등 모든 과정을 포함한 요청/응답 쌍을 로깅할 수 있다. 다만 이 경우 인증 토큰이 로그에 포함될 수 있으므로 `Authorization` 헤더를 마스킹하는 처리가 별도로 필요하다.",
    relatedTopicSlugs: ["07-networking/request-interceptor"],
  },
  {
    id: "objective-c07-intermediate-request-interceptor-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "`URLProtocol`을 프로덕션 코드에서 인터셉터로 사용하지 않고 테스트 전용으로 제한하는 이유는?",
    choices: [
      { id: "a", text: "`URLSessionConfiguration.background`와 호환되지 않고, `protocolClasses`를 전역으로 수정하면 Firebase SDK 같은 다른 라이브러리의 네트워크 트레이싱이 깨질 수 있다." },
      { id: "b", text: "`URLProtocol`은 Swift async/await를 지원하지 않아 최신 코드베이스에서 빌드가 실패한다." },
      { id: "c", text: "App Store 심사에서 URLProtocol을 사용한 앱은 거절된다는 Apple 가이드라인이 있다." },
      { id: "d", text: "`URLProtocol`은 HTTPS 트래픽만 가로챌 수 있어 HTTP가 혼재하면 동작하지 않는다." },
    ],
    correctChoiceId: "a",
    explanation:
      "`URLProtocol`은 전역 Foundation 레벨에서 동작해 `background` 세션과 호환 문제가 있고, `protocolClasses` 배열을 수정하면 다른 SDK의 네트워크 훅을 덮어쓸 수 있다. 테스트에서 mock network stub용으로는 유용하지만, 프로덕션에서는 Pipeline 미들웨어 패턴이 더 안전하고 예측 가능하다.",
    relatedTopicSlugs: ["07-networking/request-interceptor"],
  },
  {
    id: "objective-c07-intermediate-request-interceptor-003",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "인증 미들웨어에서 401 재시도의 무한 루프를 방지하는 방법은?",
    choices: [
      { id: "a", text: "요청 wrapper에 클라이언트 측 `retryCount` 프로퍼티를 두고 재시도 직전 증가시켜 임계값 초과 시 즉시 에러를 throw한다." },
      { id: "b", text: "재시도 횟수를 서버에 쿼리 파라미터로 전달해 서버가 4회 이상 반환을 거부하도록 한다." },
      { id: "c", text: "`while true` 루프 대신 `Task.sleep`을 3회 반복한 뒤 자동 종료되도록 구현한다." },
      { id: "d", text: "URLSession의 `maximumConnectionsPerHost`를 1로 제한하면 동시 401이 발생하지 않는다." },
    ],
    correctChoiceId: "a",
    explanation:
      "재시도 메타데이터는 *클라이언트 측 요청 wrapper*에 보관하는 것이 정석이다. 헤더로 서버에 노출하면 불필요한 정보가 새고, 멱등성 키와 혼동되며, 중간 프록시·로그에 마커가 박힌다. Alamofire의 `Request.retryCount`도 클라이언트 내부 상태로만 관리한다.",
    relatedTopicSlugs: ["07-networking/request-interceptor"],
  },
  {
    id: "objective-c07-advanced-request-interceptor-004",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "인증 토큰이 외부 도메인으로 redirect될 때 노출되는 것을 막으려면 어떻게 해야 하는가?",
    choices: [
      { id: "a", text: "`URLSessionTaskDelegate`의 `willPerformHTTPRedirection`에서 redirect 대상 호스트를 화이트리스트로 확인하고, 다른 도메인이면 Authorization 헤더를 제거한 후 진행한다." },
      { id: "b", text: "모든 요청에 `URLRequest.cachePolicy = .reloadIgnoringLocalCacheData`를 설정한다." },
      { id: "c", text: "Certificate Pinning을 적용하면 redirect 자체가 차단된다." },
      { id: "d", text: "`URLSession`에 `allowsExpensiveNetworkAccess = false`를 설정하면 외부 도메인 접근이 차단된다." },
    ],
    correctChoiceId: "a",
    explanation:
      "HTTP redirect 시 브라우저와 달리 URLSession은 헤더를 그대로 유지한다. `willPerformHTTPRedirection`에서 redirect 목적지의 호스트를 원래 호스트와 비교하고, 다른 도메인이면 Authorization 헤더를 제거한 새 요청으로 교체해 토큰 노출을 방지한다.",
    relatedTopicSlugs: ["07-networking/request-interceptor"],
  },

  // ── 07-networking/retry-and-circuit-breaker (add: 3) ─────────────────
  {
    id: "objective-c07-intermediate-retry-and-circuit-breaker-001",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "Circuit Breaker의 HALF-OPEN 상태에서 허용하는 시험 호출이 실패하면 어떻게 되는가?",
    choices: [
      { id: "a", text: "즉시 OPEN으로 복귀하고 쿨다운 타이머를 재설정해 서버가 회복할 추가 시간을 준다." },
      { id: "b", text: "CLOSED 상태로 전환해 정상 요청을 재개하고 다음 실패 카운트를 새로 측정한다." },
      { id: "c", text: "HALF-OPEN 상태를 유지하면서 추가로 3회 더 시험 호출을 허용한다." },
      { id: "d", text: "사용자에게 서비스 불가 알림을 보내고 앱을 강제 종료한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "HALF-OPEN에서 시험 호출이 실패하면 서버가 아직 회복되지 않았음을 의미하므로 즉시 OPEN으로 복귀하고 쿨다운을 재설정한다. 이후 쿨다운이 다시 만료되면 HALF-OPEN을 재시도한다.",
    relatedTopicSlugs: ["07-networking/retry-and-circuit-breaker"],
  },
  {
    id: "objective-c07-intermediate-retry-and-circuit-breaker-002",
    type: "objective",
    level: "intermediate",
    category: "Networking",
    prompt:
      "HTTP 429 응답을 받았을 때 재시도 지연을 결정하는 올바른 방법은?",
    choices: [
      { id: "a", text: "`Retry-After` 헤더 값을 최우선으로 따르고, 헤더가 없으면 exponential backoff + jitter를 사용한다." },
      { id: "b", text: "429는 항상 즉시 재시도해야 하며 지연을 두면 사용자 경험이 나빠진다." },
      { id: "c", text: "429는 클라이언트 오류(4xx)이므로 재시도하지 않고 사용자에게 에러를 보여준다." },
      { id: "d", text: "Circuit Breaker가 OPEN 상태가 될 때까지 backoff 없이 계속 재시도한다." },
    ],
    correctChoiceId: "a",
    explanation:
      "429 Too Many Requests 응답에는 `Retry-After` 헤더로 서버가 다음 요청을 허용할 시간을 알려준다. 이를 무시하고 backoff하면 서버가 더 오래 rate limit을 유지할 수 있다. `Retry-After`가 없으면 점진적 backoff + jitter를 사용한다.",
    relatedTopicSlugs: ["07-networking/retry-and-circuit-breaker"],
  },
  {
    id: "objective-c07-advanced-retry-and-circuit-breaker-003",
    type: "objective",
    level: "advanced",
    category: "Networking",
    prompt:
      "Jitter 없이 exponential backoff만 사용했을 때 발생하는 Thundering Herd 문제란?",
    choices: [
      { id: "a", text: "동시에 장애를 겪은 N개의 클라이언트가 동일한 2^k 간격 후 모두 동시에 재시도해, 서버가 회복하는 순간 다시 과부하가 걸리는 현상이다." },
      { id: "b", text: "재시도 간격이 기하급수적으로 길어져 사용자가 몇 분씩 기다려야 하는 UX 문제다." },
      { id: "c", text: "모든 재시도가 단일 스레드에서 직렬 실행되어 앱이 blocking 상태가 되는 문제다." },
      { id: "d", text: "Circuit Breaker가 재시도를 감지하지 못해 OPEN 상태로 전환되지 않는 동기화 문제다." },
    ],
    correctChoiceId: "a",
    explanation:
      "Jitter 없는 exponential backoff에서 N개의 클라이언트가 동시에 실패하면 `base * 2^1`, `base * 2^2`, ... 시점에 모두 동시에 재시도한다. 서버가 막 회복한 시점에 폭발적인 요청이 몰려 다시 다운되는 것이 Thundering Herd다. Full Jitter(`rand(0, base*2^k)`)로 재시도 시점을 분산시켜 방지한다.",
    relatedTopicSlugs: ["07-networking/retry-and-circuit-breaker"],
  },

  // ── 07-networking/urlsession (add: 1) ────────────────────────────────
  {
    id: "objective-c07-basic-urlsession-001",
    type: "objective",
    level: "basic",
    category: "Networking",
    prompt:
      "`URLSessionConfiguration.ephemeral`을 사용해야 하는 상황은?",
    choices: [
      { id: "a", text: "쿠키, 캐시, credential을 디스크에 남기지 않아야 하는 시크릿/게스트 세션 — 앱 종료 또는 세션 무효화 시 모든 데이터가 메모리에서 사라진다." },
      { id: "b", text: "앱이 백그라운드로 전환되어도 다운로드를 계속해야 하는 경우." },
      { id: "c", text: "여러 URLSession 인스턴스가 쿠키와 캐시를 공유해야 하는 경우." },
      { id: "d", text: "디스크 캐시 크기를 무제한으로 설정해 성능을 최대화해야 하는 경우." },
    ],
    correctChoiceId: "a",
    explanation:
      "`.ephemeral`은 쿠키, 캐시, credential을 모두 메모리에만 보관한다. 세션이 무효화되거나 앱이 종료되면 모든 데이터가 삭제된다. 시크릿 모드, 게스트 로그인, 민감한 금융 세션처럼 흔적을 디스크에 남기지 않아야 할 때 적합하다.",
    relatedTopicSlugs: ["07-networking/urlsession"],
  },
];
