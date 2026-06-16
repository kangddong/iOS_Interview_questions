# Variadic Generics & Parameter Packs

> 한 줄 요약 — Swift 5.9+의 **parameter pack** 문법은 *가변 개수의 타입 매개변수*를 표현해 `(T1, T2, ...)` 같은 튜플/함수 시그니처를 *제네릭으로* 다룰 수 있게 한다. 가장 큰 수혜는 SwiftUI `ViewBuilder` 10개 제한 해소, `zip` 다중 인자, 가변 인자 함수의 타입 안전 표현.

도입: SE-0393 (Swift 5.9), 추가 확장은 Swift 5.10, 6.0.

## 왜 필요했나

기존엔 *가변 개수 타입 매개변수* 표현 불가:

```swift
// 이전: zip은 2개 인자만
zip(a, b)              // ✅
zip(a, b, c)           // ❌ — zip3, zip4 같이 별도 함수가 필요했음
```

SwiftUI `TupleView`는 *10개 자식 제한*이 있었던 이유도 동일. 컴파일러 합성으로 우회했지만 한계.

## Pack 선언 (`each`)

```swift
func tuple<each T>(_ value: repeat each T) -> (repeat each T) {
    (repeat each value)
}

let t = tuple(1, "a", true)    // (Int, String, Bool)
```

핵심 키워드:
- `<each T>` — *type pack* 선언
- `repeat each T` — *pack 확장*. 컴파일 타임에 각 타입으로 확장됨
- `repeat each value` — *값 확장*

읽는 법: `(repeat each T)`는 *"각 T를 풀어쓴 튜플"*. 인자 셋이면 `(T1, T2, T3)`.

## Zip 일반화 예

```swift
func zip<each S: Sequence>(_ s: repeat each S)
  -> some Sequence<(repeat (each S).Element)> {
    ...
}

let zipped = zip([1,2,3], ["a","b","c"], [true,false,true])
for (n, s, b) in zipped { ... }
```

3개 이상 인자 zip이 자연스럽게 표현됨. Swift Standard Library에 점진 도입.

## 함수 타입에 적용

```swift
func apply<each Arg, R>(
    _ fn: (repeat each Arg) -> R,
    _ args: repeat each Arg
) -> R {
    fn(repeat each args)
}

let result = apply({ (a: Int, b: String) in "\(a) \(b)" }, 3, "hi")
```

`apply`가 어떤 arity의 함수든 호출 가능 → 함수 합성/decorator 패턴이 타입 안전하게 가능.

## SwiftUI ViewBuilder 10개 제한 해소

기존엔 `ViewBuilder`가 `_ConditionalContent` + `TupleView<T0, T1, ..., T9>`로 *10개까지만* 정의. 11번째 자식부터 컴파일 에러.

Swift 5.9+ parameter pack 도입 후 `TupleView`가 *임의 arity*를 받도록 재정의 가능 → iOS 17/Xcode 15에서 제약 완화.

## Constraint와 결합

```swift
func process<each T: Identifiable>(_ items: repeat each T) {
    for item in repeat each items {
        print(item.id)
    }
}
```

각 pack 멤버가 `Identifiable`을 만족해야 한다는 제약을 *공통 제약*으로 표현.

## Same-type 제약

```swift
func sameType<each T>(_: repeat each T) where repeat each T == Int { ... }
```

모든 pack 멤버가 같은 타입이어야 한다는 제약. 거의 안 쓰지만 표현 가능.

## 흔한 함정 / Follow-up

- **Q. parameter pack과 `_ args: Int...`(variadic)의 차이?**
  variadic은 *모두 같은 타입*. pack은 *각각 다른 타입* 가능.

- **Q. pack 안의 원소를 *조건부*로 확장 가능?**
  매우 제한적. `repeat` 컨텍스트에서 단순 확장만. 복잡한 패턴은 컴파일 에러.

- **Q. 런타임 비용은?**
  컴파일 타임에 *특수화*되어 일반 제네릭과 동일. 런타임 cost 없음.

- **Q. 표준 라이브러리에서 어디 쓰나?**
  Swift 5.9+ `zip`, `Result` 다중 결합, SwiftUI 내부, swift-collections 일부.

- **Q. 디버깅이 어려운 경우?**
  타입 에러 메시지가 길고 헷갈림. 컴파일 타임 확장 단계가 많아 에러 위치 추적이 힘들 때가 있음.

- **Q. macro와 결합?**
  Swift 5.9의 macros도 parameter pack을 활용해 *임의 arity 함수* 합성을 자연스럽게 표현.

## 참고

- SE-0393 Value and Type Parameter Packs
- WWDC 2023: Generalize APIs with parameter packs
