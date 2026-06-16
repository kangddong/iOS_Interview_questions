# Generics, `some`, `any`, PAT

> 한 줄 요약 — 제네릭은 *타입을 매개변수화*해 코드 재사용과 타입 안전을 동시에 얻는 도구. `some`/`any`는 프로토콜을 타입처럼 쓸 때의 두 가지 의미(*특정 한 가지 타입* vs *어떤 타입이든*)를 명확히 구분하기 위해 도입됐다.

도입 버전: `some` Swift 5.1+, `any` Swift 5.6+, primary associated type Swift 5.7+

## 제네릭 기본

```swift
func swap<T>(_ a: inout T, _ b: inout T) {
    let t = a; a = b; b = t
}

struct Stack<Element> {
    private var items: [Element] = []
    mutating func push(_ x: Element) { items.append(x) }
    mutating func pop() -> Element? { items.popLast() }
}
```

- 컴파일러가 *타입 특수화(specialization)*로 각 사용처 코드를 별도 생성 → 동적 디스패치 비용 없음
- `where` 절로 추가 제약 (`where Element: Equatable`)

## PAT (Protocol with Associated Type)

```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

PAT는 *타입이 아니라 제네릭 제약*에 가깝다. 그래서 `var c: Container` 같은 일반 변수 선언이 오랫동안 불가능했다 → `some`/`any` 등장 배경.

## `some` vs `any`

| 구분 | `some P` | `any P` |
|---|---|---|
| 의미 | "어떤 *특정한* P 준수 타입" (컴파일 타임 결정) | "어떤 P 준수 타입이든" (런타임 결정) |
| 동작 방식 | 제네릭과 동일, 정적 디스패치 | Existential container, 동적 디스패치 |
| 타입 정체성 | 호출마다 다를 수 있지만 *한 호출 안에선 한 타입* | 매번 다른 타입 가능 |
| 비용 | 0 (특수화) | 박싱/언박싱, vtable lookup |
| PAT 사용 | 가능 | 제한적 (Swift 5.7+ primary AT 필요) |

```swift
// some — 반환값이 어떤 한 타입인지 컴파일러가 추론, 호출자는 그 구체 타입을 모름
func makeSequence() -> some Sequence<Int> { [1, 2, 3] }

// any — 런타임에 다른 타입을 담을 수 있는 박스
let shapes: [any Shape] = [Circle(), Square()]
```

규칙:
- 매개변수에 `some P`는 제네릭의 syntactic sugar (`<T: P>`)와 동일
- *동일성*이 컴파일 타임에 결정돼야 하면 `some`
- 이종(heterogeneous) 컬렉션이나 런타임 타입 다양성이 필요하면 `any`

## Primary Associated Type (Swift 5.7+)

```swift
protocol Container<Item> { associatedtype Item; ... }

func sum(_ c: some Container<Int>) -> Int { ... }
let any: any Container<String> = ...
```

`Collection<Int>` 같이 친숙한 표기를 PAT 프로토콜에서도 가능하게 함.

## 흔한 함정 / Follow-up

- **Q. `[any P]` vs `[some P]`?**
  `[any P]`는 서로 다른 구체 타입을 한 배열에 — 박싱 비용 있음. `[some P]`는 모두 같은 타입이어야 함(제네릭과 동일).

- **Q. `some` 반환은 왜 옵퍼크(opaque)라 부르는가?**
  호출자는 구체 타입을 모르고 *프로토콜 인터페이스*만 본다. SwiftUI `body: some View`가 대표 예 — body 구조가 바뀌어도 호출자에 영향 없음.

- **Q. PAT 프로토콜을 변수 타입으로 쓰려 할 때 에러?**
  과거: `'P' can only be used as a generic constraint`. Swift 5.6+에선 `any P`로 명시하면 가능. 5.7+ primary AT로 더 자연스러워짐.

- **Q. `any P` 메서드 호출 비용?**
  Existential은 *witness table*을 통한 간접 호출. 작은 값은 inline 박스, 큰 값은 힙 할당. 핫 루프에서 누적되면 무시 못함.

## 참고

- Swift Evolution: SE-0244 (some), SE-0335 (any), SE-0346 (primary AT)
- WWDC 2022: Embrace Swift generics
