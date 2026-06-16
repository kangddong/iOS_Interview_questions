# Closures (escaping, autoclosure, capture)

> 한 줄 요약 — 자기 컨텍스트의 변수를 *캡처*해서 들고 다니는 일급 함수 객체. 캡처는 기본 strong이며, 저장(escape)될 때 cycle 위험이 생긴다.

## 기본

```swift
let add: (Int, Int) -> Int = { a, b in a + b }

// trailing closure
[1,2,3].map { $0 * 2 }
```

## `@escaping`

기본 closure는 *함수가 반환되기 전에 호출 완료*가 보장되어야 한다(non-escaping). 이 closure를 프로퍼티에 저장하거나 비동기로 나중에 호출하려면 `@escaping`을 명시.

```swift
class Loader {
    var onDone: (() -> Void)?
    func start(_ cb: @escaping () -> Void) {     // 저장하므로 escaping
        onDone = cb
    }
}
```

- non-escaping은 컴파일러가 캡처 최적화 가능 (스택 할당 등)
- escaping closure 안에서 `self`를 쓰려면 `self.` 명시 필요 (강조용)

## `@autoclosure`

인자 표현식을 *암시적으로 closure로 감싸* 지연 평가시킨다.

```swift
func assertTrue(_ cond: @autoclosure () -> Bool, msg: String = "") {
    if !cond() { fatalError(msg) }
}

assertTrue(expensive() == 42)   // expensive()는 cond()가 호출될 때만 실행
```

- 표준 라이브러리의 `??`, `&&`, `||`가 모두 autoclosure 기반의 short-circuit
- 남용하면 호출자가 *함수 호출이 지연됨*을 모르고 부작용에 당황 → 자제

## 캡처 의미론

```swift
var counter = 0
let inc = { counter += 1 }   // counter를 참조 캡처 (값 타입이지만 closure가 박스화)
inc(); inc()
print(counter)               // 2
```

값 타입도 closure 안에선 *참조처럼* 캡처(보관 박스). 캡처 시점의 *값을 고정*하고 싶으면 capture list:

```swift
let snapshot = counter
let f = { [snapshot] in print(snapshot) }   // 고정
counter = 100
f()                                          // 캡처 당시 값 출력
```

## Capture list와 약한 캡처

```swift
class VM {
    var name = ""
    func bind() {
        api.fetch { [weak self] data in
            guard let self else { return }
            self.name = data
        }
    }
}
```

- `[weak self]` — self가 사라지면 nil
- `[unowned self]` — self가 사라진 뒤 접근하면 크래시
- 둘의 선택 기준은 [weak-vs-unowned.md](../02-memory-management/weak-vs-unowned.md)

## 흔한 함정 / Follow-up

- **Q. `[weak self]`을 항상 써야 하나?**
  closure가 *저장*되어 self보다 오래 살 가능성이 있을 때만. `UIView.animate {}`처럼 일회성 closure는 불필요.

- **Q. closure가 값 타입을 캡처할 때 어떻게 변경되나?**
  closure는 그 변수의 *참조*를 캡처(박스). 그래서 closure 밖에서 변경해도 closure 안에서 보임. capture list `[x]`로 복사 캡처 가능.

- **Q. trailing closure 여러 개?**
  Swift 5.3+에서 multiple trailing closure 지원. 첫 번째는 라벨 생략, 이후는 라벨 필요.

- **Q. `@Sendable` closure?**
  동시성 컨텍스트를 넘나드는 closure에 요구. 캡처된 값들이 모두 `Sendable`이어야 함.

## 참고

- Swift Language Guide: Closures
- SE-0049 (escaping/non-escaping)
