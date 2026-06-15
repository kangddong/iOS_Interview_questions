# ABI Stability & Library Evolution (Resilience)

> 한 줄 요약 — Swift 5.0+ **ABI 안정** = OS의 *공유 Swift 런타임*에 앱이 동적 연결 가능. 그 위에 **library evolution** 모드를 켜면 라이브러리가 *자기 ABI를 깨지 않고* 진화할 수 있다(resilient). `@frozen`/`@inlinable`이 이 진화 *범위*를 컨트롤하는 도구.

## ABI Stability란

ABI = Application Binary Interface. 컴파일된 코드 간 *기계 수준 호환성* 규약.

Swift 5.0 이전:
- Swift 표준 라이브러리 ABI가 매 버전마다 변경 → 모든 Swift 앱이 *자기 런타임을 번들*해야 함
- iOS 앱 크기 +5MB 정도 증가
- OS 단위 공유 불가

Swift 5.0+:
- OS에 *공유 Swift runtime* (`/usr/lib/swift/*`) 탑재 (iOS 12.2+, macOS 10.14.4+)
- 앱은 더 이상 번들 안 함 → 크기 감소
- 신·구 Swift로 빌드된 바이너리 상호운용 가능

ABI 안정성이 보장하는 것:
- 함수 호출 규약 (인자 전달 방식, 레지스터 사용)
- 타입의 메모리 레이아웃 *식별*
- 메타데이터 포맷
- mangling (Swift symbol name → linker symbol)

## Module Stability와 다른 점

- **ABI stability**: 컴파일된 *바이너리* 호환
- **Module stability**: 컴파일된 *모듈 인터페이스* 호환 (다른 Swift 버전이 라이브러리 import 가능). Swift 5.1+.

iOS 13/Swift 5.1부터 둘 다 안정 → 시스템 프레임워크가 Swift API를 노출 가능 (`SwiftUI`, `Combine`이 OS 일부로 탑재된 배경).

## Library Evolution Mode (Resilience)

`-enable-library-evolution` 플래그로 활성화. 라이브러리가 *ABI 변경 없이* 다음을 추가 가능:

- public 타입에 stored property 추가
- struct에 새 case 추가 (non-frozen enum)
- public 함수에 새 default-arg 매개변수 추가
- 등

비용:
- 클라이언트가 라이브러리 내부 구조를 *직접 알 수 없음*
- 모든 접근이 *간접 호출*로 컴파일됨 → 약간의 성능 페널티
- 인라이닝, specialization, dead-code 제거 제한

→ 그래서 라이브러리 작성자는 *진화 자유*와 *성능* 사이에서 어트리뷰트로 명시적 선택.

## `@frozen`

```swift
@frozen
public struct Point {
    public var x: Double
    public var y: Double
}
```

선언:
- "이 타입은 *앞으로 stored property 추가/순서 변경 없음*"을 라이브러리가 약속
- 클라이언트가 *직접 메모리 레이아웃을 알고* 인라이닝 가능 → 성능 회복
- 한 번 frozen하면 미래에 깨면 ABI 호환성 깨짐 (semver major)

`@frozen enum`도 같은 의미 — 새 케이스 추가 안 함을 약속. 클라이언트가 `@unknown default` 없이 exhaustive switch 가능.

## `@inlinable`

```swift
@inlinable
public func saturated(_ x: Int, max: Int) -> Int {
    x > max ? max : x
}
```

- 함수 본문을 *모듈 외부에 노출*해 클라이언트가 인라이닝 가능
- 작은 핫 함수에 사용
- 단점: 본문 변경 = ABI 변경 (이미 인라이닝된 클라이언트가 옛 본문 사용)
- `@usableFromInline`: 내부 헬퍼를 `@inlinable` 함수가 호출할 수 있도록 노출

## `@usableFromInline`

```swift
@usableFromInline
internal struct InternalHelper { ... }

@inlinable
public func work() {
    InternalHelper().run()    // public이 아닌 internal을 inlinable이 참조하려면 필요
}
```

ABI 안정 표면을 *internal 타입에도 표현* 가능하게 함. 변경 시 ABI 영향.

## 어트리뷰트 결정 트리

```
Public 타입/함수인가?
└── YES → 라이브러리 외부에서 사용 가능
    ├── 진화 자유가 필요 → 기본 (resilient)
    └── 핵심 성능이 필요 → @frozen / @inlinable
```

## ABI를 깨는 변경 vs 안 깨는 변경

| 변경 | resilient | @frozen |
|---|---|---|
| stored property 추가 | OK | ❌ |
| public 함수 인자 추가 (default) | OK | OK |
| public 함수 시그니처 변경 | ❌ | ❌ |
| enum case 추가 (non-frozen) | OK | ❌ |
| enum case 추가 (frozen) | ❌ | n/a |
| protocol 요구사항 추가 (default 없음) | ❌ | n/a |
| protocol 요구사항 추가 (default 있음) | OK | n/a |

## 흔한 함정 / Follow-up

- **Q. 앱 개발자는 library evolution 켜야 하나?**
  대부분 *불필요*. 앱 자체는 매번 새로 컴파일되므로 ABI 안정성 의미 없음. 라이브러리/프레임워크에서만 켠다.

- **Q. SwiftUI/Combine은 왜 매 OS 버전 의존?**
  공유 라이브러리이지만, *새 API 추가*는 ABI 호환을 유지하면서도 *심볼 자체는 새 OS에만 존재*. iOS 14에서 추가된 API는 iOS 14+에서만 호출 가능.

- **Q. `@frozen` 잘못 붙이면?**
  미래에 stored property 추가가 막힘. 라이브러리 사용자에게 *깨는 변경*을 강요하게 됨. semver major bump 필요.

- **Q. `@inlinable` 본문 변경의 위험?**
  옛 본문이 클라이언트 바이너리에 *복사돼 남아 있음*. 라이브러리만 업데이트해도 행동이 안 바뀜. 버그 패치도 영향 없는 경우 있음.

- **Q. resilient 모드의 성능 페널티는 얼마?**
  타입 size/offset이 *상수가 아니라 런타임 lookup*이 됨. struct property 접근 = 1 인디렉션. 핫 루프에선 측정 가능. 그래서 stdlib도 핵심은 `@frozen`.

- **Q. private/internal에 영향?**
  ABI에 노출되지 않음. 자유롭게 변경 가능. 단 `@usableFromInline`이 붙은 internal은 ABI 일부.

## 참고

- swift.org: ABI Stability and More (2019)
- swift-evolution: SE-0260 (Library Evolution)
- swift/docs/LibraryEvolution.rst
- WWDC 2019: Binary Frameworks in Swift
