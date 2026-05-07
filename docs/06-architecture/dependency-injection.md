# 의존성 주입 (Dependency Injection)

> 한 줄 요약 — 객체가 *자기에게 필요한 의존성을 직접 만들지 않고 외부에서 받는* 설계 원칙. **테스트 가능성**과 **교체 가능성**의 핵심.

## 안티 패턴 — 직접 생성

```swift
final class LoginVM {
    private let api = AuthAPI()              // ❌ 직접 생성
    private let storage = Keychain.shared    // ❌ 싱글턴 의존
    func login() { ... }
}
```

문제:
- 테스트에서 `AuthAPI`를 가짜로 바꿀 수 없음 → 네트워크가 필요해짐.
- `AuthAPI`의 초기화 비용/스레드/실패가 LoginVM에 직접 영향.
- 의존성을 *코드를 읽어야* 알 수 있음 (숨은 의존성).

## 생성자 주입 (가장 권장)

```swift
protocol AuthAPIType {
    func login(_ email: String, _ pw: String) async throws
}

final class LoginVM {
    private let auth: AuthAPIType
    init(auth: AuthAPIType) { self.auth = auth }
    func login() async { try? await auth.login(email, pw) }
}

// 실행 시
let vm = LoginVM(auth: AuthAPI())

// 테스트
let vm = LoginVM(auth: MockAuth())
```

장점:
- 의존성이 `init` 시그니처에 *드러남*.
- 객체가 *완전히 초기화된 상태*로 만들어짐 (immutable).

## 프로퍼티 주입

```swift
final class HomeVC: UIViewController {
    var analytics: AnalyticsType!     // 외부에서 set
}
```

스토리보드/Nib에서 VC를 만드는 경우 init 주입이 어려워서 자주 사용. 단점: 설정 잊으면 런타임 크래시.

## 메서드 주입

```swift
func upload(_ data: Data, using api: UploadAPIType) async throws { ... }
```

함수 단위 의존이면 단순 매개변수로 주입.

## DI 컨테이너 (선택)

규모 커지면 *어디서 어떤 인스턴스를 만들지* 한 곳에 모은다.

```swift
final class AppDI {
    let auth: AuthAPIType = AuthAPI()
    let user: UserRepoType = UserRepo()

    func makeLoginVM() -> LoginVM { LoginVM(auth: auth) }
    func makeHomeVM() -> HomeVM { HomeVM(user: user) }
}
```

라이브러리(Swinject, Factory, Resolver)도 있지만, 작은 앱은 *수동 컨테이너*로도 충분.

## 환경/Locale을 주입하기 — swift-dependencies

TCA에서 표준화된 dependency 주입 매크로. 의존성을 환경 키처럼 다룸:

```swift
@Dependency(\.uuid) var uuid
@Dependency(\.date) var date
```

테스트에서 `withDependencies { $0.uuid = .incrementing }`처럼 한 줄로 교체.

## Singleton과의 관계

싱글턴(`Foo.shared`)을 직접 부르면 사실상 *글로벌 의존*. 다음 두 가지가 무너짐:
- 테스트 격리 (인스턴스 1개 공유)
- 교체 가능성

→ 정 필요하면 *protocol을 통해 주입*하고, 기본값으로 `Foo.shared`를 넘겨라.

```swift
init(auth: AuthAPIType = AuthAPI.shared) { self.auth = auth }
```

## 비교 — 주입 방식

| 방식 | 장점 | 단점 |
|---|---|---|
| 생성자 | 의존성 명시, immutable | 매개변수 폭증 가능 |
| 프로퍼티 | 스토리보드 친화 | 누락 가능, optional 필요 |
| 메서드 | 단순 | 매번 전달 |
| 컨테이너 | 한 곳에 모음 | 복잡도 추가, 잘못 쓰면 service locator 안티패턴 |

## 흔한 함정 / Follow-up

- **Q. Service Locator vs DI?**
  Service Locator는 *내부에서 컨테이너를 조회*. 호출자에게 의존성이 안 드러남. DI는 *외부에서 명시적으로 받음*. DI가 더 권장.

- **Q. 의존성이 너무 많아져 init 매개변수가 10개가 됐다.**
  대개 클래스 책임이 너무 큼. 책임 분리(SRP) 신호. 또는 *관련 의존성을 묶은 Environment 구조체*로 묶어 전달.

- **Q. SwiftUI에서 DI?**
  `@Environment(\.foo)`, `@EnvironmentObject`, `@Observable + .environment(value)` 등을 통해 트리에 주입.

- **Q. 컴파일 타임 vs 런타임 DI?**
  Swift는 매크로/제네릭으로 컴파일 타임 검증이 가능. Swinject 같은 라이브러리는 런타임 — 누락 시 런타임 크래시. 보통 단순 수동 DI가 가장 안전.

- **Q. 의존성을 mock으로 바꾸는 표준 패턴?**
  protocol 추상화 + 생성자 주입. 또는 `swift-dependencies`처럼 환경 키 패턴.

## 참고

- objc.io: Dependency Injection
- Point-Free: swift-dependencies
- Martin Fowler: Inversion of Control Containers and the Dependency Injection pattern
