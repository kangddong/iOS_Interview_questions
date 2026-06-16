# ARC (Automatic Reference Counting)

> 한 줄 요약 — *컴파일러가* 코드에 retain/release를 자동 삽입해 참조 카운트가 0이 되는 순간 인스턴스를 해제한다. 가비지 컬렉터가 아니라 **컴파일 타임 결정 + 런타임 카운팅**.

## 핵심 동작

1. 컴파일러가 객체의 lifetime을 분석해 `retain`/`release` 호출을 삽입
2. 런타임은 객체 헤더의 reference count를 증감
3. count가 0이 되면 즉시 `deinit` 호출 후 메모리 해제

```swift
class Person { let name: String; init(_ n: String) { name = n }; deinit { print("\(name) gone") } }

do {
    let a = Person("A")     // retain count 1
    let b = a               // retain count 2
}                           // 스코프 종료: b release → a release → count 0 → deinit
```

## 적용 대상

- **참조 타입(class, actor, closure)** 만 ARC 대상
- struct/enum 같은 값 타입은 ARC 없이 스코프 기반 해제
- 단, 값 타입 내부에 참조 타입이 있으면 그 참조에 ARC 적용

## 참조 종류

| 종류 | 카운트 증가 | 대상 해제 시 |
|---|---|---|
| `strong` (기본) | O | 자기도 살아있게 만듦 |
| `weak` | X | 자동으로 `nil` (옵셔널만 가능) |
| `unowned` | X | 접근 시 크래시 (옵셔널 아님) |

## GC와의 차이

- **결정적 해제** — 마지막 참조가 사라지는 *바로 그 시점*에 `deinit`. GC처럼 늦게 정리되지 않음
- **순환 참조를 자동 해결하지 못함** — retain cycle은 개발자가 weak/unowned로 끊어야 함
- **STW(stop-the-world) 멈춤 없음** — 다만 release 비용은 분산되어 발생

## 비용

- retain/release는 atomic 연산 → 멀티스레드에서 비싸다
- 인라이닝/특수화로 컴파일러가 많이 줄여줌
- 핫패스에서 불필요한 참조 복사를 피하면 성능 이득

## 흔한 함정 / Follow-up

- **Q. ARC는 런타임인가 컴파일 타임인가?**
  *둘 다*. retain/release 삽입은 컴파일 타임, 카운트 증감과 해제는 런타임.

- **Q. `deinit` 호출 시점을 어떻게 보장하나?**
  마지막 strong 참조가 사라질 때. 단, 클로저/Task에 의해 의도치 않게 살아있는 경우 흔함.

- **Q. ARC가 retain cycle을 못 잡는 이유?**
  cycle 안에서는 서로가 서로를 살리므로 count가 0이 되지 않음. *도달 가능성*을 추적하는 GC만 잡아낼 수 있음.

## Objective-C 비교

- **출발점이 같다** — Swift ARC는 ObjC ARC를 그대로 가져왔다. retain/release 호출 삽입 + 결정적 해제.
- **MRC 시절**: `[obj retain]` / `[obj release]` / `[obj autorelease]`를 직접 호출. NARC 규칙(`new`/`alloc`/`retain`/`copy`로 받으면 본인이 release 책임).
- **dealloc**: ObjC ARC도 `[super dealloc]` 호출 금지. Swift `deinit`과 의미 동일.
- **`__strong`/`__weak`/`__unsafe_unretained`** = `strong`/`weak`/`unowned(unsafe)`.
- **혼합 코드**: ObjC `__weak` 객체를 Swift `weak`로 받거나 그 반대 모두 가능 (런타임이 동일한 weak table 공유).
- 더 깊게: [17-objective-c/arc-and-mrc](../17-objective-c/arc-and-mrc.md)

## 참고

- Swift Language Guide: Automatic Reference Counting
- WWDC 2021: ARC in Swift: Basics and beyond
