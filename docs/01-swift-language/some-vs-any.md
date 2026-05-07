# `some` vs `any` (Opaque vs Existential)

> 한 줄 요약 — `some P`는 **컴파일 타임에 결정된 단일 구체 타입**(opaque), `any P`는 **런타임에 어떤 P 채택 타입이든 담는 박스**(existential). 성능과 PAT 사용 가능성이 갈린다.

도입 버전: `some` (Swift 5.1+, 함수 반환), `any` (Swift 5.6+, 명시적), Swift 5.7부터 일반 위치 `some`/PAT 제약 완화.

## 한 문장 차이

```swift
func a() -> some Animal { Cat() }      // 컴파일러: 항상 Cat 반환 (호출자에겐 숨김)
func b() -> any Animal  { Cat() }      // 런타임 박스 — Cat이든 Dog이든 OK
```

- `some`: *하나의 구체 타입을 숨기되 그 타입이 매번 같음을 보장*.
- `any`: *호출마다 다른 구체 타입을 담을 수 있는 컨테이너*.

## Existential Container — `any`의 비용

`any P`는 내부적으로 *값/witness table 포인터*를 담는 박스 (보통 5워드, 큰 값은 힙으로 분리).

```swift
let animals: [any Animal] = [Cat(), Dog()]   // 박스 배열
animals[0].speak()                           // dynamic dispatch
```

비용:
- 호출마다 witness table 조회 → 가상 호출 비용.
- 값이 inline 한도(4워드)보다 크면 힙 할당.
- ARC retain/release.

`some Animal` 배열은 *모든 원소가 같은 타입*이어야 하므로 박스 비용 없음.

## PAT (associated type) 제약

```swift
protocol Container { associatedtype Item; var first: Item? { get } }

func head<C: Container>(_ c: C) -> C.Item? { c.first }   // generic — OK
func head(_ c: some Container) -> ... ?                  // 5.7+ 동등 표현
func head(_ c: any Container) -> ... ?                   // 5.7+ 가능, 단 Item이 사라짐
```

- Swift 5.6 이전: `any Container`는 PAT라 *변수로도 못 만들었다*.
- Swift 5.7+: 가능. 다만 *associated type이 erase되어 모르는 상태*가 되어 결과 타입을 정확히 못 씀.

## 언제 무엇을 쓰나

```
타입이 매번 동일?
├─ 그렇다 → 제네릭 또는 some (정적 디스패치)
└─ 아니다 (런타임에 다름) → any (동적)

PAT 프로토콜?
├─ 호출자 컨텍스트가 안다 → 제네릭/some
└─ 정말 모름 → any (Swift 5.7+) — 단 결과의 타입 정보 손실
```

## SwiftUI에서

```swift
var body: some View { ... }     // 컴파일 타임 결정 — 빠름, 트리 type-stable
```

`any View` 배열은 가능하지만 *identity 추적이 약화*되어 권장 안 됨.

## 비교

| | generic / some | any |
|---|---|---|
| 디스패치 | static | dynamic via witness table |
| 비용 | 거의 0 | 박스 + 호출 |
| 타입 정보 | 보존 | 일부 손실 (PAT erase) |
| 컬렉션 이종 담기 | 불가 (단일 타입) | 가능 |
| 사용 시점 | 대부분 | 진짜 런타임 다형성 필요할 때 |

## 흔한 함정 / Follow-up

- **Q. `func f<T: P>` vs `func f(_:some P)`?**
  본질 동일. `some`이 시그니처가 짧고 가독성 좋음. 두 인자가 *같은 타입이어야 함*을 강제하려면 generic으로 명명한 T를 두 번 쓰거나 `where T == U`.

- **Q. `[any Animal]`을 만들었는데 성능이 나쁘다.**
  박스 비용 + dynamic dispatch + 큰 값이면 힙. 가능하면 `[Cat]` 또는 `[some Animal]`-동등(generic)으로.

- **Q. `existential opening` (Swift 5.7+)?**
  컴파일러가 `any`를 잠깐 `some`처럼 다뤄 PAT 제약을 우회. 함수 호출 시점에 자동.

- **Q. `Self` 사용 protocol을 변수에 담을 수 있나?**
  Swift 5.7+에서 가능. 그러나 Self가 erase된 상태라 일부 메서드는 호출 불가.

- **Q. Type erasure (`AnyHashable`, `AnyView`)와 `any`?**
  옛날 type erasure 패턴은 `any`로 상당 부분 대체 가능. 단 lib API 호환을 위해 별도 wrapper로 유지되는 케이스 많음.

## 참고

- SE-0335 (Existential `any` 명시), SE-0309 (Unlock existentials), SE-0346 (Lightweight same-type)
- WWDC 2022: Embrace Swift generics
