# Functional Programming (FP)

> 한 줄 요약 — 계산을 *순수 함수의 합성*으로 모델링하고 *불변성/1급 함수/고차 함수*를 강조하는 패러다임. 부작용을 격리해 *동시성 안전*과 *테스트 용이성*을 얻는다. Swift는 OOP에 FP 기능(map/filter/reduce, struct 불변성, Optional/Result Monad)을 결합한 *멀티 패러다임* 언어.

## 핵심 개념

### 순수 함수 (Pure Function)

다음 둘을 모두 만족:
1. **참조 투명성** — 같은 입력 → 같은 출력
2. **부작용 없음** — 외부 상태 변경/IO 없음

```swift
// 순수
func add(_ a: Int, _ b: Int) -> Int { a + b }

// 비순수 — counter라는 외부 상태 변경
var counter = 0
func nextId() -> Int { counter += 1; return counter }
```

장점: 테스트가 *입력→출력 매핑*만 검증하면 됨. 캐싱(memoization) 가능. 병렬화 안전.

### 불변성 (Immutability)

```swift
let xs = [1, 2, 3]
let doubled = xs.map { $0 * 2 }   // 새 배열 반환
// xs는 그대로
```

상태 변경 대신 *새 값 생성*. 데이터 흐름이 추적 가능.

Swift의 `let`, struct, CoW가 이를 지원. 반면 class의 mutable property는 *공유 가변 상태* → race 가능.

### 1급 함수 (First-class Functions)

함수가 *값*이라 변수에 담고 인자로 넘기고 반환 가능:

```swift
let ops: [(Int, Int) -> Int] = [(+), (-), (*)]
for op in ops { print(op(10, 3)) }
```

### 고차 함수 (Higher-Order Functions)

함수를 인자로 받거나 반환하는 함수.

```swift
[1, 2, 3].map { $0 * 2 }              // [2, 4, 6]
[1, 2, 3, 4].filter { $0 % 2 == 0 }   // [2, 4]
[1, 2, 3].reduce(0, +)                // 6
```

이 3개가 FP 진입 표준. Swift Sequence/Collection이 광범위 지원.

### 함수 합성 (Composition)

```swift
func pipe<A, B, C>(_ f: @escaping (A) -> B, _ g: @escaping (B) -> C) -> (A) -> C {
    { g(f($0)) }
}

let trimAndUppercase = pipe(
    { (s: String) in s.trimmingCharacters(in: .whitespaces) },
    { $0.uppercased() }
)
trimAndUppercase("  hi  ")    // "HI"
```

복잡한 변환을 *작은 함수의 조립*으로 표현.

## Monad 직관 (Swift로 보기)

Monad는 *값을 컨테이너에 감싸고, 그 컨테이너 안에서 연속 변환*하는 패턴. Swift의 **Optional**, **Result**, **Array**가 이미 Monad에 가깝다.

```swift
// Optional: nil-aware chaining
let length = "hello".count        // 5
let s: String? = "hi"
let len = s.map { $0.count }      // Int? (.some(2))

// flatMap — 중첩 풀기
let nested: Int?? = .some(.some(5))
let flat = nested.flatMap { $0 }  // Int? (.some(5))

// Result chain
let result: Result<Int, Error> = .success(2)
let doubled = result.map { $0 * 2 }                       // .success(4)
let chained = result.flatMap { x in Result.success(x+1) }  // .success(3)
```

규칙:
- `map`: 컨테이너 안 값을 변환 (Functor 연산)
- `flatMap`: 변환 + 평탄화 (Monad 핵심)

면접에서 *"Optional/Result가 Monad인가?"* → **그 패턴을 정확히 따른다**고 답하고 위 예시.

## Swift에서의 FP 도구

| 도구 | 용도 |
|---|---|
| `map` / `filter` / `reduce` | 컬렉션 변환 |
| `flatMap` / `compactMap` | 중첩 평탄화 / nil 제거 |
| `zip` | 시퀀스 결합 |
| `sorted(by:)` | 함수로 정렬 기준 주입 |
| `lazy` | 지연 평가 시퀀스 |
| `KeyPath` (`map(\.id)`) | 프로퍼티 접근을 1급 값처럼 |
| Closure capture list `[x]` | 변수 캡처를 *순수하게* 유지 |
| `@frozen enum` + 패턴 매칭 | ADT 표현 |

## FP의 강점

- **동시성 안전** — 불변 데이터엔 race 없음
- **테스트 용이성** — 순수 함수는 mock 거의 불필요
- **추론 용이성** — 함수 시그니처만 보면 입출력 명확
- **합성 가능성** — 작은 함수 → 큰 변환 파이프라인
- **부작용 격리** — IO/네트워크는 *경계*에서만

## FP의 함정

### 1) 성능

map/filter 체인이 *중간 배열을 매번 생성*하면 비용 큼. Swift는 `lazy` 시퀀스로 완화:

```swift
let result = xs.lazy.map { ... }.filter { ... }.first(where: ...)
```

### 2) 가독성

깊은 함수 합성/Monad chain은 *디버깅이 어려움*. 적당한 곳에 명명 + 분해 필요.

### 3) 도메인 모델링의 한계

엔티티의 *정체성*과 *수명 동안 상태 변화*가 본질인 도메인(UIView, Game Object)은 OOP가 더 자연스러움.

### 4) Side effect 격리의 부담

진짜 부작용(파일, 네트워크, UI)을 *함수 경계 밖*으로 미는 설계가 항상 가능하진 않음. 실용적 절충 필요.

## 면접 답변 흐름

*"Swift에서 FP의 영향이 어디에 보이는가"*:

1. **컬렉션 고차 함수**: map/filter/reduce가 표준
2. **값 타입 우선**: struct + 불변성 = side effect 최소화
3. **Optional/Result**: Monad 패턴으로 *nil-safe / error-safe 체인*
4. **SwiftUI**: 선언형 모델 + state의 명시적 흐름 = FP 친화적
5. **Swift Concurrency Sendable**: *불변 또는 동기화*만 격리 경계 통과 → FP 안전성 활용
6. *그러나* 실 앱은 OOP/FP 하이브리드. UIKit 객체 + 데이터 파이프라인 함수형 처리

## 흔한 함정 / Follow-up

- **Q. struct도 mutating이 가능한데 진짜 불변?**
  *변수* let으로 묶었을 때만 불변. mutating 메서드는 *새 값으로 self를 재할당*하는 의미.

- **Q. map과 forEach의 차이?**
  map은 *변환 → 새 컬렉션*, forEach는 *각 원소에 작업* (return 값 무시). FP에선 map 선호.

- **Q. reduce의 시간 복잡도?**
  O(n) — 모든 원소 1회 순회. 단, 클로저 안에서 *비효율 호출*하면 누적 비용 폭증.

- **Q. lazy를 쓰면 무조건 빠른가?**
  아니다. *원소 일부만 필요할 때* 이득. 전부 평가하면 lazy 오버헤드만 추가.

- **Q. Combine과 FP의 관계?**
  Combine은 *reactive functional*. Publisher 합성 + 시간 의존 연산. AsyncSequence가 후속 흐름.

- **Q. 클래스에 mutating state가 있으면 FP가 망하나?**
  아니다. *경계*에서 격리하면 됨. *순수 변환은 함수형*, *상태 보관은 actor/객체*로 분리하는 게 실용적.

- **Q. Haskell처럼 *순수 FP*가 iOS에 가능?**
  현실적으로 X. UIKit/Foundation이 OOP/명령형. 실용 iOS는 *FP-influenced multi-paradigm*.

## 참고

- WWDC 2015: Functional Swift
- *Functional Swift* (Eidhof, Kugler, Swierstra)
- *Composable Architecture* (Point-Free) — FP 원칙을 iOS 아키텍처에 직접 적용
- Combine / AsyncSequence 문서
