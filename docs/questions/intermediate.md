# 3년차 미들 면접 질문

주니어 단계 사실 확인을 *전제로* 깊이/원리/트레이드오프를 묻는 질문 중심.
**기초 질문은 [basic.md](basic.md)** 참고.

> 답변 패턴: *한 줄 요약 → 핵심 메커니즘 → 코드/예시 → 트레이드오프 또는 함정* 4단을 유지.

## Swift 심화

- **`some`과 `any`의 메모리/성능 차이는?** → [some-vs-any](../01-swift-language/some-vs-any.md)
  - existential container, witness table, 박스 비용까지 답할 수 있어야.
- **PAT(associated type) protocol을 변수로 쓸 수 없는 이유와, Swift 5.7+에서 어떻게 풀렸나?** → [some-vs-any](../01-swift-language/some-vs-any.md)
- **`func f<T: P>` 와 `func f(_:some P)`의 차이?** → [some-vs-any](../01-swift-language/some-vs-any.md)
- **Property Wrapper가 컴파일 시 어떻게 변환되나?** → [properties](../01-swift-language/properties.md)
- **Result Builder가 SwiftUI body를 가능하게 한 이유** → [result-builder-and-macro](../01-swift-language/result-builder-and-macro.md)
- **Macro의 종류와 사용 시점** → [result-builder-and-macro](../01-swift-language/result-builder-and-macro.md)
- **Copy-on-Write를 Array가 어떻게 구현?** → [copy-on-write](../01-swift-language/copy-on-write.md)
- **`lazy var`가 정말 thread-safe한가?** → [properties](../01-swift-language/properties.md)
- **KeyPath의 종류 (`KeyPath`, `WritableKeyPath`, `ReferenceWritableKeyPath`)와 활용** → [keypath](../01-swift-language/keypath.md)

## Memory / 성능 모델

- **`weak`/`unowned` 선택 기준과 unowned가 권장되지 않는 이유** → [weak-vs-unowned](../02-memory-management/weak-vs-unowned.md)
- **closure에서 값 타입이 어떻게 캡처되나? 박스화되는 조건은?** → [capture-list](../02-memory-management/capture-list.md) + [heap-vs-stack](../02-memory-management/heap-vs-stack.md)
- **`autoreleasepool`이 명시적으로 필요한 케이스** → [autoreleasepool](../02-memory-management/autoreleasepool.md)
- **struct가 heap으로 가는 조건** → [heap-vs-stack](../02-memory-management/heap-vs-stack.md)
- **existential container의 inline 한도와 비용** → [heap-vs-stack](../02-memory-management/heap-vs-stack.md) + [some-vs-any](../01-swift-language/some-vs-any.md)
- **이미지 메모리가 폭증하는 이유와 downsampling** → [image-and-scroll](../10-performance/image-and-scroll.md)

## Concurrency 심화

- **콜백 기반 API를 async로 변환할 때 `withCheckedContinuation` 규칙** → [continuation](../03-concurrency/continuation.md)
  - resume 1회 보장, 누락 시 영원히 멈춤, 이중 호출 시 fatalError까지.
- **`Task` vs `Task.detached` — 격리/우선순위/task-local 상속 차이** → [async-await](../03-concurrency/async-await.md)
- **Actor reentrancy 문제와 해결 (중복 fetch 가드)** → [actor-and-mainactor](../03-concurrency/actor-and-mainactor.md)
- **`@MainActor` 클래스 안에서 무거운 작업을 하면? 어떻게 분리?** → [actor-and-mainactor](../03-concurrency/actor-and-mainactor.md)
- **`Sendable`이 필요한 이유와 `@unchecked Sendable`이 정당한 케이스** → [sendable](../03-concurrency/sendable.md)
- **Task 협력적 취소 — 표준 API와 직접 구현 차이** → [async-await](../03-concurrency/async-await.md)
- **AsyncStream의 buffering policy와 무한 누수 방지** → [async-sequence-and-stream](../03-concurrency/async-sequence-and-stream.md)
- **delegate/Notification → AsyncStream 변환 패턴** → [async-sequence-and-stream](../03-concurrency/async-sequence-and-stream.md)
- **Swift 6 strict concurrency 마이그레이션 절차와 흔한 에러** → [swift6-strict](../03-concurrency/swift6-strict.md)
- **region-based isolation이 해결하는 것** → [swift6-strict](../03-concurrency/swift6-strict.md)
- **`await` 전후로 스레드가 바뀌는가? 같다고 가정하면 어떤 버그?** → [async-await](../03-concurrency/async-await.md)

## UIKit 심화

- **렌더링 파이프라인 단계와 메인 스레드 책임 범위** → [rendering-pipeline](../04-uikit/rendering-pipeline.md)
- **off-screen rendering 트리거와 대응 전략** → [rendering-pipeline](../04-uikit/rendering-pipeline.md) + [core-animation](../04-uikit/core-animation.md)
- **셀 안에서 `cornerRadius` + 그림자가 스크롤을 끊는 원리** → [core-animation](../04-uikit/core-animation.md) + [image-and-scroll](../10-performance/image-and-scroll.md)
- **transform 적용 시 frame을 직접 set하면?** → [frame-vs-bounds](../04-uikit/frame-vs-bounds.md)
- **CompositionalLayout과 Diffable Data Source의 강점** → [tableview-collectionview](../04-uikit/tableview-collectionview.md)
- **`shouldRasterize`는 언제 좋고 언제 역효과인가** → [core-animation](../04-uikit/core-animation.md)
- **iOS 17 `viewIsAppearing`이 추가된 이유** → [viewcontroller-lifecycle](../04-uikit/viewcontroller-lifecycle.md)

## SwiftUI 심화

- **View Graph와 Diffing — body 호출 ≠ 실제 렌더의 의미** → [view-graph-and-diffing](../05-swiftui/view-graph-and-diffing.md)
- **`@ViewBuilder`가 `_ConditionalContent`를 만드는 이유** → [view-graph-and-diffing](../05-swiftui/view-graph-and-diffing.md)
- **`AnyView`가 비싼 이유** → [view-graph-and-diffing](../05-swiftui/view-graph-and-diffing.md)
- **`.id()`로 SwiftUI 상태 초기화 메커니즘** → [view-identity-and-lifetime](../05-swiftui/view-identity-and-lifetime.md)
- **structural identity vs explicit identity** → [view-identity-and-lifetime](../05-swiftui/view-identity-and-lifetime.md)
- **`Layout` 프로토콜로 flow 레이아웃 직접 구현** → [custom-layout-and-animatable](../05-swiftui/custom-layout-and-animatable.md)
- **`Animatable`/`animatableData`가 필요한 케이스** → [custom-layout-and-animatable](../05-swiftui/custom-layout-and-animatable.md)
- **`Transaction`과 `withAnimation`의 관계** → [custom-layout-and-animatable](../05-swiftui/custom-layout-and-animatable.md)
- **`@Observable`이 ObservableObject 대비 갱신을 줄이는 원리 (정밀 추적)** → [observation-macro](../05-swiftui/observation-macro.md)
- **modifier 순서가 결과를 바꾸는 이유** → [layout-system](../05-swiftui/layout-system.md)

## Architecture

- **MVVM에서 ViewModel이 UIKit을 import하면 안 되는 이유** → [mvc-vs-mvvm](../06-architecture/mvc-vs-mvvm.md)
- **Coordinator 패턴이 해결하는 것 + SwiftUI에서의 변형 (Router state)** → [coordinator](../06-architecture/coordinator.md)
- **DI 방식별 트레이드오프 (init/property/method/container)** → [dependency-injection](../06-architecture/dependency-injection.md)
- **Clean Architecture에서 Repository 패턴이 의존성 역전을 어떻게?** → [clean-architecture](../06-architecture/clean-architecture.md)
- **TCA의 단방향 흐름과 TestStore가 검증하는 것** → [tca](../06-architecture/tca.md)
- **모듈 분리 기준과 너무 일찍 / 너무 늦게의 폐해** → [modularization](../06-architecture/modularization.md)
- **모듈 간 protocol 위치 결정 (interface 모듈 vs domain 모듈)** → [modularization](../06-architecture/modularization.md)
- **Static vs Dynamic 링크가 런치 타임에 미치는 영향** → [modularization](../06-architecture/modularization.md) + [launch-time](../10-performance/launch-time.md)
- **본인 팀의 Service / Store / Manager 구분 기준은? (결정 트리로 답변)** → [naming-conventions](../06-architecture/naming-conventions.md)
  - 도메인 명사 1개 + 얕은 상태 + 비즈니스 의도 표현 → Service. 영속 소유 → Store. 인프라 연결 → Manager.
- **`NetworkManager`는 왜 `NetworkService`가 아닌가** → [naming-conventions](../06-architecture/naming-conventions.md)
  - 도메인 명사가 아니라 "연결 그 자체"가 책임이라 Manager.
- **`LocationService`를 `LocationStore`로 부르는 게 더 정확한 경우** → [naming-conventions](../06-architecture/naming-conventions.md)
  - 권한 흐름/유즈케이스가 있으면 Service, 단순 좌표 캐시면 Store.
- **Clean Architecture의 Repository가 본인 프로젝트에 없는 이유와 그 트레이드오프** → [naming-conventions](../06-architecture/naming-conventions.md) + [clean-architecture](../06-architecture/clean-architecture.md)
  - Service가 유즈케이스를 흡수하면 Repository는 중복. 대신 데이터 소스 추상화는 어디서 책임지는가가 질문.
- **`ShareIntentService`와 `ShareSheetPresenter`를 분리하는 이유 (부수효과 분리 원칙)** → [naming-conventions](../06-architecture/naming-conventions.md)
  - 도메인 로직과 UI/외부앱 호출의 책임 직교 분리.

## Networking / Persistence

- **여러 요청이 동시에 401을 만났을 때 refresh 한 번만 실행 보장** → [auth-and-token-refresh](../07-networking/auth-and-token-refresh.md)
- **HTTPS pinning 구현과 검증 포인트** → [urlsession](../07-networking/urlsession.md)
- **백그라운드 URLSession 동작 (앱 종료 후에도 진행)** → [urlsession](../07-networking/urlsession.md)
- **Codable 다형성 (Discriminated Union) 디코딩** → [codable](../07-networking/codable.md)
- **Core Data 멀티 컨텍스트 / 백그라운드 import** → [core-data-and-swiftdata](../08-persistence/core-data-and-swiftdata.md)
- **Lightweight vs Heavyweight vs Progressive 마이그레이션** → [core-data-migration](../08-persistence/core-data-migration.md)
- **CloudKit 동기화 시 마이그레이션 제약** → [core-data-migration](../08-persistence/core-data-migration.md)
- **Keychain accessibility 정책별 차이와 토큰 저장 권장값** → [keychain](../08-persistence/keychain.md)
- **앱 삭제 후 Keychain 데이터 동작** → [keychain](../08-persistence/keychain.md)

## Testing 심화

- **"이 코드 테스트하기 어렵다"는 어떤 설계 신호인가 (결합·은닉·비결정성)** → [testable-code-design](../09-testing/testable-code-design.md)
- **Functional Core / Imperative Shell로 부수효과와 로직 분리하기** → [testable-code-design](../09-testing/testable-code-design.md)
- **`Date()`/`UUID()`/`random`을 의존성으로 끌어내는 이유** → [testable-code-design](../09-testing/testable-code-design.md)
- **Humble Object — ViewController/View를 얇게 두고 로직을 VM으로** → [testable-code-design](../09-testing/testable-code-design.md)
- **Singleton 코드를 테스트 가능하게 만드는 protocol + 기본값 패턴** → [mocking](../09-testing/mocking.md)
- **`URLSession`을 mock하는 두 방법 (protocol 추상화 / `URLProtocol`)** → [mocking](../09-testing/mocking.md)
- **시간 의존 코드 테스트 (Date provider, swift-dependencies)** → [mocking](../09-testing/mocking.md)
- **flaky 테스트의 원인과 해결** → [xctest](../09-testing/xctest.md)
- **Swift Testing의 parameterized / trait가 XCTest 대비 좋은 점** → [swift-testing](../09-testing/swift-testing.md)
- **Snapshot 테스트가 잡는 회귀 / 잡지 못하는 회귀** → [snapshot-and-ui-testing](../09-testing/snapshot-and-ui-testing.md)
- **XCUITest에서 accessibilityIdentifier가 중요한 이유** → [snapshot-and-ui-testing](../09-testing/snapshot-and-ui-testing.md)
- **테스트 피라미드와 실무 비율** → [snapshot-and-ui-testing](../09-testing/snapshot-and-ui-testing.md)

## Performance 심화

- **스크롤이 끊기는 원인 분류와 측정 도구 매핑** → [main-thread-and-hitch](../10-performance/main-thread-and-hitch.md) + [instruments](../10-performance/instruments.md)
- **앱 콜드 런치 단계별 (pre-main / main / first frame) 측정과 개선** → [launch-time](../10-performance/launch-time.md)
- **메모리 누수가 0인데 메모리가 계속 늘어나는 경우 (unbounded growth)** → [instruments](../10-performance/instruments.md)
- **UIImage 지연 디코드와 백그라운드 디코딩** → [image-and-scroll](../10-performance/image-and-scroll.md)
- **MetricKit으로 사용자 디바이스 hang/crash 수집** → [metrickit-and-crash](../10-performance/metrickit-and-crash.md)
- **dSYM과 symbolication, watchdog (`0xbaaaaaad`) 크래시** → [metrickit-and-crash](../10-performance/metrickit-and-crash.md)
- **`os_signpost`로 직접 측정 마커 추가** → [instruments](../10-performance/instruments.md)
- **Hang vs Hitch 차이와 각각 측정 도구** → [main-thread-and-hitch](../10-performance/main-thread-and-hitch.md)

## Build / DevOps 심화

- **xcconfig로 환경별 분리 + Info.plist 변수 치환** → [xcode-build](../11-build-system/xcode-build.md)
- **SPM 다중 타깃 + 모듈 의존 그래프 설계** → [spm](../11-build-system/spm.md) + [modularization](../06-architecture/modularization.md)
- **fastlane match가 해결하는 코드 사이닝 문제** → [ci-cd](../11-build-system/ci-cd.md) + [code-signing](../11-build-system/code-signing.md)
- **CI에서 시뮬레이터 빌드 캐시 / SPM 캐시 키 전략** → [ci-cd](../11-build-system/ci-cd.md)
- **TestFlight 자동 업로드 워크플로 설계** → [ci-cd](../11-build-system/ci-cd.md)
- **빌드 시간 측정과 개선 (`-warn-long-function-bodies`)** → [xcode-build](../11-build-system/xcode-build.md)
- **App Group + Keychain 공유로 위젯/익스텐션 통신** → [code-signing](../11-build-system/code-signing.md) + [keychain](../08-persistence/keychain.md)

## Patterns 심화

- **Delegate vs Closure vs Combine vs AsyncSequence 선택** → [delegate](../12-design-patterns/delegate.md) + [observer](../12-design-patterns/observer.md)
- **NotificationCenter 남용의 위험과 대안** → [observer](../12-design-patterns/observer.md)
- **KVO와 Combine 차이 (런타임 vs 컴파일러 + 합성)** → [observer](../12-design-patterns/observer.md)
- **Composition over Inheritance를 Swift POP로 표현** → [composition-over-inheritance](../12-design-patterns/composition-over-inheritance.md)
- **Factory / Strategy / Builder 각 패턴이 해결하는 문제** → [factory-strategy-builder](../12-design-patterns/factory-strategy-builder.md)
- **Closure로 Strategy를 대체할 수 있는 조건** → [factory-strategy-builder](../12-design-patterns/factory-strategy-builder.md)

## CS Fundamentals 심화

- **프로세스와 스레드 컨텍스트 스위치 비용 차이** → [process-vs-thread](../13-cs-fundamentals/process-vs-thread.md)
- **iOS 앱의 메모리가 100MB라는 게 실제로 뭘 의미** (resident vs virtual) → [memory-model](../13-cs-fundamentals/memory-model.md)
- **CPU 캐시 / 공간 지역성으로 코드를 빠르게 만드는 법** → [memory-model](../13-cs-fundamentals/memory-model.md)
- **Swift `Array.removeFirst()`가 O(n)인 이유와 큐 구현 대안** → [data-structures](../13-cs-fundamentals/data-structures.md)
- **String.count가 O(n)인 이유** → [data-structures](../13-cs-fundamentals/data-structures.md)
- **LRU Cache 구현 — 자료구조 조합** → [data-structures](../13-cs-fundamentals/data-structures.md)
- **Quick Sort가 O(n²)이 되는 케이스와 회피** → [algorithm-complexity](../13-cs-fundamentals/algorithm-complexity.md)
- **DP / Greedy / Backtracking 차이와 선택** → [algorithm-complexity](../13-cs-fundamentals/algorithm-complexity.md)
- **데드락 4조건 + 회피 전략** → [concurrency-primitives](../13-cs-fundamentals/concurrency-primitives.md)
- **`os_unfair_lock` vs `NSLock` vs `actor`** → [concurrency-primitives](../13-cs-fundamentals/concurrency-primitives.md) + [03-concurrency/actor-and-mainactor](../03-concurrency/actor-and-mainactor.md)
- **Read-Write Lock 패턴 (concurrent queue + barrier)** → [concurrency-primitives](../13-cs-fundamentals/concurrency-primitives.md)

## Network 심화

- **TLS 1.2 / 1.3 handshake 단계와 차이** → [https-and-tls](../14-network/https-and-tls.md)
- **HTTPS Public Key Pinning 구현과 인증서 갱신 전략 (rolling pin)** → [https-and-tls](../14-network/https-and-tls.md)
- **App Transport Security 정책과 예외 등록** → [https-and-tls](../14-network/https-and-tls.md)
- **HTTP/1.1 → 2 → 3 발전과 모바일 효과** → [http2-http3](../14-network/http2-http3.md)
- **HTTP/2 multiplexing이 1.1 대비 좋은 점, 한계 (TCP HoL)** → [http2-http3](../14-network/http2-http3.md)
- **QUIC가 모바일에 좋은 이유 (connection migration)** → [http2-http3](../14-network/http2-http3.md)
- **POST 재시도 시 중복 생성 방지 (Idempotency-Key)** → [rest-api-design](../14-network/rest-api-design.md) + [http-basics](../14-network/http-basics.md)
- **REST 6 제약 — stateless가 의미하는 것** → [rest-api-design](../14-network/rest-api-design.md)
- **Offset vs Cursor 페이지네이션 트레이드오프** → [rest-api-design](../14-network/rest-api-design.md)
- **WebSocket 끊김 감지 (ping/pong)와 재연결 전략** → [websocket](../14-network/websocket.md)
- **채팅 앱 — WebSocket + APNs 함께 사용 + 메시지 dedup** → [websocket](../14-network/websocket.md)
- **DNS TTL과 도메인 이전 시 일부 사용자만 옛 IP** → [dns-and-caching](../14-network/dns-and-caching.md)
- **iOS URLCache 동작과 `Cache-Control` 헤더 매핑** → [dns-and-caching](../14-network/dns-and-caching.md) + [http-basics](../14-network/http-basics.md)
- **TCP 4-way close에서 TIME_WAIT가 길어 보이는 이유** → [tcp-vs-udp](../14-network/tcp-vs-udp.md)

## 통합 시나리오 (실무 케이스)

- **로그인 화면을 MVVM + Coordinator로 설계 — 의존성, 화면 전환, 에러 처리, 토큰 저장까지**
  - 관련: [mvc-vs-mvvm](../06-architecture/mvc-vs-mvvm.md) + [coordinator](../06-architecture/coordinator.md) + [auth-and-token-refresh](../07-networking/auth-and-token-refresh.md) + [keychain](../08-persistence/keychain.md)
- **거대한 리스트 화면을 60fps로 유지하기 위한 결정들**
  - 관련: [tableview-collectionview](../04-uikit/tableview-collectionview.md) + [image-and-scroll](../10-performance/image-and-scroll.md) + [main-thread-and-hitch](../10-performance/main-thread-and-hitch.md)
- **앱이 가끔 데드락 / hang. 어디부터 디버깅?**
  - 관련: [actor-and-mainactor](../03-concurrency/actor-and-mainactor.md) + [main-thread-and-hitch](../10-performance/main-thread-and-hitch.md) + [metrickit-and-crash](../10-performance/metrickit-and-crash.md)
- **iOS 13 호환 코드베이스를 async/await로 점진 마이그레이션**
  - 관련: [continuation](../03-concurrency/continuation.md) + [async-await](../03-concurrency/async-await.md) + [swift6-strict](../03-concurrency/swift6-strict.md)
- **레거시 거대 앱을 모듈화 — 어디서 어떻게 시작?**
  - 관련: [modularization](../06-architecture/modularization.md) + [spm](../11-build-system/spm.md)
