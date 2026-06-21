# Observer 패턴 (NotificationCenter / KVO / Combine)

> 한 줄 요약 — *상태 변화*나 *이벤트*를 **여러 구독자에게 broadcast**하는 패턴. iOS는 NotificationCenter, KVO, Combine, AsyncSequence 4가지 구현을 가진다.

## 4가지 구현 비교

| | NotificationCenter | KVO | Combine | AsyncSequence |
|---|---|---|---|---|
| 도입 | 매우 오래됨 | ObjC 시절 | iOS 13+ | iOS 13+ |
| 발신자 | 누구나 post | dynamic property 가진 객체 | Publisher | AsyncIterator |
| 수신자 | 다대다 | 1:N | 다대다 | 보통 1:1 |
| 타입 안전 | 약함 (userInfo dict) | 약함 (KeyPath은 강해짐) | 강함 | 강함 |
| 취소 | observer 보관/제거 | observation 객체 | AnyCancellable | for-await break |
| iOS 15+ 추세 | 레거시 | 레거시 | 점차 후순위 | 권장 |

## 1) NotificationCenter

```swift
// 발신
NotificationCenter.default.post(name: .didLogin, object: nil, userInfo: ["userID": "u1"])

// 수신
let token = NotificationCenter.default.addObserver(
    forName: .didLogin, object: nil, queue: .main
) { note in
    let id = note.userInfo?["userID"] as? String
}

// 해제 (deinit 등)
NotificationCenter.default.removeObserver(token)
```

- *느슨한 결합*. 발신자/수신자가 서로 모름.
- userInfo가 `[AnyHashable: Any]`라 타입 안전성 약함.
- iOS 9+ 자동 dealloc 시 observer 해제되지만, *block 형태*는 토큰 직접 관리.

**남용 위험**: 어디서 누가 send/receive하는지 추적이 어려워짐. *특정 시스템 이벤트*나 *진짜 1:N broadcast*에만.

## 2) KVO (Key-Value Observing)

```swift
final class Player: NSObject {
    @objc dynamic var status: String = "idle"
}

let player = Player()
let token = player.observe(\.status, options: [.new]) { _, change in
    print(change.newValue ?? "")
}
```

- `NSObject` 상속 + `@objc dynamic` 필요.
- 시스템 객체(`AVPlayer.status`, `URLSessionTask.progress`)를 관찰할 때 자주 사용.
- 옛날엔 string keypath라 위험했지만 Swift KeyPath로 타입 안전 향상.

순수 Swift 객체에는 부적합. 차라리 Combine.

## 3) Combine (iOS 13+)

```swift
import Combine

final class VM {
    @Published var query: String = ""
    private var cancellables = Set<AnyCancellable>()

    func bind() {
        $query
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .removeDuplicates()
            .sink { print($0) }
            .store(in: &cancellables)
    }
}
```

- Publisher → 연산자(operator) → Subscriber.
- 타입 안전, 합성 강력 (debounce, combineLatest, switchToLatest).
- AnyCancellable이 풀리면 자동 구독 해제.

**Apple의 점진적 후순위**: WWDC23 이후 새 API는 AsyncSequence 쪽으로 무게 중심이 이동 중. 그래도 SwiftUI/`@Published`는 여전히 활용도 높음.

## 4) AsyncSequence / AsyncStream

```swift
for try await user in api.usersStream() {
    print(user)
}
```

```swift
// AsyncStream으로 만들기
let (stream, continuation) = AsyncStream<Int>.makeStream()
continuation.yield(1)
continuation.yield(2)
continuation.finish()
```

- async/await에 자연 통합.
- 취소가 Task 취소로 자동.
- 다중 구독 모델은 직접 설계 필요 (한 stream을 N에게 fan-out하려면 wrapper).

## 선택 기준

```
시스템 이벤트(앱 라이프사이클, 키보드)? → NotificationCenter
시스템 객체의 KVO (AVPlayer 등)? → KVO
파이프라인 합성(debounce, combineLatest)? → Combine
async/await 흐름 자연스럽게? → AsyncSequence/AsyncStream
SwiftUI에서 데이터 모델 변경 알림? → @Observable / @Published
```

## 흔한 함정 / Follow-up

- **Q. NotificationCenter 남용의 위험?**
  추적성 저하. *어떤 화면에서 어떤 이벤트가 나가서 어디서 받는지* 코드 검색해야만 보임. 특정 도메인 안에서는 delegate/closure로.

- **Q. KVO와 Combine 차이?**
  KVO는 ObjC 런타임 기반. Combine은 Swift 네이티브 + 합성/취소. 새 코드면 Combine.

- **Q. Combine vs RxSwift?**
  컨셉 거의 동일. Apple 공식 = Combine, OS 의존 (iOS 13+). RxSwift는 OS 호환 더 넓고 생태계 풍부.

- **Q. `@Published` 변경이 main에서 안 일어남.**
  변경한 스레드에서 sink. UI 갱신은 `.receive(on: DispatchQueue.main)` 또는 `@MainActor`.

- **Q. 같은 Notification을 두 번 받는다.**
  observer를 한 객체에서 *두 번 등록*. addObserver 호출 위치 확인. selector 기반은 매번 새 등록 가능.

## Objective-C 비교

ObjC 시절 Observer는 사실상 **NotificationCenter + KVO** 두 가지뿐이었다.

### NotificationCenter

```objc
// 발신
[[NSNotificationCenter defaultCenter] postNotificationName:@"DidLogin"
                                                    object:nil
                                                  userInfo:@{@"userID": @"u1"}];

// 수신 (selector 기반)
[[NSNotificationCenter defaultCenter] addObserver:self
                                         selector:@selector(didLogin:)
                                             name:@"DidLogin"
                                           object:nil];

- (void)didLogin:(NSNotification *)note {
    NSString *uid = note.userInfo[@"userID"];
}

// 해제 (필수)
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}
```

Swift block-based API(`addObserver(forName:object:queue:using:)`)는 ObjC에도 동일하게 존재했고, 옛 코드일수록 selector 기반이 많다.

### KVO

```objc
static void *kStatusCtx = &kStatusCtx;

[player addObserver:self forKeyPath:@"status"
            options:NSKeyValueObservingOptionNew context:kStatusCtx];

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object
                        change:(NSDictionary *)change context:(void *)context {
    if (context == kStatusCtx) { ... }
    else { [super observeValueForKeyPath:keyPath ofObject:object change:change context:context]; }
}
```

- ObjC 시절 KVO는 string keypath라 오타에 약했다. Swift `\.status` KeyPath로 타입 안전 ↑.
- Swift에서 KVO를 쓰려면 `NSObject` 상속 + `@objc dynamic` 필수 — ObjC 런타임 의존성이 그대로 노출된다.
- ObjC 시절엔 Combine/AsyncSequence가 없어서 *값 흐름*을 표현하려면 KVO + NotificationCenter + manual callback property 조합으로 직접 짜야 했음.
- 더 깊게: [17-objective-c/kvo-kvc](../17-objective-c/kvo-kvc.md) (isa-swizzling 메커니즘)

## 참고

- Apple Docs: Notifications, KVO, Combine
- WWDC 2019: Introducing Combine
- WWDC 2021: Meet AsyncSequence
