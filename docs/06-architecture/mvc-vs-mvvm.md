# MVC vs MVVM

> 한 줄 요약 — Apple MVC는 *VC가 너무 많은 책임*을 지는 구조라 코드가 비대해진다(Massive View Controller). MVVM은 **View와 비즈니스 로직 사이에 ViewModel을 둬서** 그 책임을 옮기는 패턴.

## Apple MVC

```
View ── 사용자 입력 ─→ Controller ── 모델 갱신 ─→ Model
                       ↑                              │
                       └── 모델 변경 통지 ────────────┘
```

이론적으로는 깔끔하지만, 실제 iOS에서 *View == storyboard에 박힌 객체*이고 *Controller == UIViewController*가 되면서:

- VC가 view 설정, 데이터 로딩, 비즈니스 규칙, 라우팅까지 다 떠안음.
- 테스트가 어려움 (UIViewController는 UIKit 의존이 많아 단위 테스트 환경 구성이 무거움).
- 한 화면 = VC 한 파일이 1000줄 넘어가는 패턴 → "Massive View Controller".

## MVVM의 책임 분담

```
 View (UI/입출력)
   ↑↓ binding
 ViewModel (UI용 상태 + 액션)
   ↑↓
 Model (도메인/네트워크/저장소)
```

- **View**: 보여 주기, 입력 받기. 비즈니스 로직 없음.
- **ViewModel**: View에 보여줄 *형태*로 데이터 가공, 액션 처리, 비동기 트리거. **UIKit 타입 import 금지**가 원칙(테스트 용이성, 플랫폼 분리).
- **Model**: 도메인 객체, repository, API.

## 바인딩 방식

데이터를 View ↔ VM 사이에 어떻게 연결할지가 MVVM의 변수.

| 방식 | 코드 |
|---|---|
| 클로저/델리게이트 | `vm.onChange = { [weak self] state in ... }` |
| Combine | `vm.$state.sink { ... }` |
| RxSwift | `vm.state.bind(to: ...)` |
| async/await + Observation | `for await state in vm.stream { ... }` 또는 `@Observable` |
| SwiftUI 자체 | `@StateObject`/`@Observable`로 자연스러움 |

SwiftUI + `@Observable`이 가장 보일러플레이트가 적다.

## 코드 — 같은 화면 두 방식

### MVC

```swift
final class LoginVC: UIViewController {
    @IBOutlet var emailField: UITextField!
    @IBOutlet var pwField: UITextField!
    @IBOutlet var loginButton: UIButton!

    @IBAction func tapLogin() {
        guard let email = emailField.text, isValid(email) else { showError("이메일"); return }
        loginButton.isEnabled = false
        AuthAPI.login(email, pwField.text ?? "") { [weak self] result in
            self?.loginButton.isEnabled = true
            switch result { ... }
        }
    }

    private func isValid(_ email: String) -> Bool { ... }
}
```

VC 안에 검증, API 호출, UI 상태 변경이 다 섞임.

### MVVM

```swift
final class LoginViewModel {
    var email: String = ""
    var password: String = ""
    private(set) var isLoading = false { didSet { onChange?() } }
    var onChange: (() -> Void)?
    var onError: ((String) -> Void)?

    private let auth: AuthAPIType

    init(auth: AuthAPIType) { self.auth = auth }

    func tapLogin() async {
        guard isValidEmail(email) else { onError?("이메일"); return }
        isLoading = true
        defer { isLoading = false }
        do { try await auth.login(email, password) }
        catch { onError?(error.localizedDescription) }
    }
}
```

VC는 입력을 VM에 전달하고, VM의 변경에 반응해 UI 갱신만 한다. `AuthAPIType`이 protocol이라 mock 주입해 테스트 가능.

## 비교 — MVC vs MVVM

| 구분 | Apple MVC | MVVM |
|---|---|---|
| VC 비대 | 자주 발생 | 완화 (UI/binding만) |
| 테스트 | UI 의존 강함 | VM은 순수 객체 — 쉬움 |
| 학습 곡선 | 즉시 | 바인딩 방식 학습 필요 |
| 보일러플레이트 | 적음 | 약간 증가 |
| 화면 전환 책임 | VC | 별도 Coordinator로 빼는 게 권장 |

## 흔한 함정 / Follow-up

- **Q. ViewModel이 UIKit을 import하면 안 되는 이유?**
  플랫폼 의존이 들어오면 *순수 단위 테스트*가 어려워지고, SwiftUI/iPadOS/macOS로의 이식 비용이 커짐. UI 타입을 *전달용 데이터*로 변환해서 View에서 매핑.

- **Q. ViewModel이 화면 전환을 직접 하면?**
  안티패턴. VM이 navigation을 알면 다시 의존성이 늘어남. `Coordinator` 패턴으로 분리하거나, VM은 *이벤트만* 발행 (예: `onLoginSuccess`).

- **Q. MVVM에서 양방향 바인딩은?**
  Combine `@Published` + `assign(to:)`, RxSwift `BehaviorRelay`, SwiftUI `@Binding` 등으로 표현. SwiftUI가 가장 자연스러움.

- **Q. ViewModel이 여러 View에서 공유되어야 한다면?**
  *동일한 인스턴스*를 주입. SwiftUI에서는 `@StateObject` 한 곳에서 만들고 `@ObservedObject`/`@Environment`로 자식에 전달.

- **Q. Massive ViewModel 안 되게 하려면?**
  화면이 거대하면 화면을 *서브 컴포넌트*로 쪼개고 각자 ViewModel을 갖게. 또는 도메인 로직은 UseCase/Service로 빼고 VM은 *상태와 이벤트*만 다루게.

## 참고

- Apple Docs: Cocoa MVC
- Microsoft Patterns: MVVM (origin)
- objc.io: Architecture issue
