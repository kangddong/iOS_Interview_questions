# Result Builder & Macro

> 한 줄 요약 — *DSL을 만드는 두 도구*. Result builder는 함수 본문의 표현식들을 누적/합성해 한 값으로 만들고, Macro는 컴파일 타임에 코드를 생성/변환한다.

## Result Builder

도입: Swift 5.4+. SwiftUI `ViewBuilder`, Regex builder, `StringBuilder` 등의 기반.

```swift
@resultBuilder
struct ArrayBuilder<T> {
    static func buildBlock(_ parts: T...) -> [T] { parts }
    static func buildOptional(_ part: [T]?) -> [T] { part ?? [] }
    static func buildEither(first: [T]) -> [T] { first }
    static func buildEither(second: [T]) -> [T] { second }
    static func buildArray(_ parts: [[T]]) -> [T] { parts.flatMap { $0 } }
}

func make<T>(@ArrayBuilder<T> _ build: () -> [T]) -> [T] { build() }

let xs = make {
    1; 2
    if Bool.random() { 3 }
    for i in 4...6 { i }
}
```

핵심 메서드:

| 메서드 | 역할 |
|---|---|
| `buildBlock` | 표현식들을 한 결과로 합성 |
| `buildOptional` | `if` (else 없음) |
| `buildEither(first/second)` | `if/else`, `switch` |
| `buildArray` | `for ... in` |
| `buildExpression` | 개별 표현식 변환 |
| `buildFinalResult` | 최종 마무리 |

DSL이 표현 가능한 제어 흐름은 우리가 구현한 `build*` 메서드 집합에 의해 결정된다.

## Macro (Swift 5.9+, Xcode 15+)

Macro는 *컴파일 타임에 AST를 변환*해 코드를 생성. 종류:

| 종류 | 사용 | 예 |
|---|---|---|
| Freestanding expression | `#name(...)` | `#stringify(x + y)` |
| Freestanding declaration | `#name`로 선언 추가 | `#warning("...")` |
| Attached peer | `@Attached`로 옆 선언 추가 | |
| Attached member | 멤버 추가 | `@Observable`이 `_$observationRegistrar` 추가 |
| Attached accessor | get/set 코드 합성 | SwiftData `@Model`의 프로퍼티 |
| Attached extension | 익스텐션/conformance 추가 | `@Observable`이 `Observation.Observable` 채택 |

```swift
// 사용
let (value, code) = #stringify(2 + 3)   // (5, "2 + 3")

@Observable                             // 컴파일 타임에 Observation 보일러플레이트 생성
class Model { var name = "" }
```

구현은 별도 SwiftSyntax 기반 패키지로 작성하며, Xcode가 매크로 확장 결과를 미리보기로 보여준다.

## 흔한 함정 / Follow-up

- **Q. result builder에서 if만 쓰면 옵셔널?**
  `buildOptional` 미구현이면 컴파일 에러. 구현해야 if가 동작.

- **Q. `@ViewBuilder`가 자식 뷰 10개 제한?**
  과거엔 `_ConditionalContent` + `TupleView`로 인한 generic 한계가 있었다. Swift 5.9+ variadic generics로 완화.

- **Q. 매크로는 어디서 평가되나?**
  컴파일 타임. 외부 SwiftSyntax 프로세스가 호출됨. 첫 빌드 시 매크로 패키지 빌드로 시간이 늘어날 수 있음.

- **Q. 매크로가 런타임 reflection과 다른 점?**
  reflection은 *런타임*에 메타정보를 읽음 (`Mirror`). 매크로는 *컴파일 타임*에 코드를 생성 → 비용 0, 디버그/타입체크 가능.

- **Q. 매크로 안전성?**
  명시적으로 import 시 빌드 시 신뢰 동의를 요구. Trust 기반 모델.

## 참고

- SE-0289 Result Builders
- SE-0382 Expression Macros, SE-0389 Attached Macros
- WWDC 2023: Expand on Swift macros
