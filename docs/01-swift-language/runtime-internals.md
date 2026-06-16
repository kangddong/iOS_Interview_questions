# Swift Runtime Internals

> 한 줄 요약 — Swift는 *컴파일 타임 특수화*와 *런타임 메타데이터*를 결합한 하이브리드 런타임을 가진다. 클래스는 **vtable**, 프로토콜은 **witness table**, existential은 **container**(3 words inline + table 포인터)로 디스패치한다. 핫패스 성능을 진단하려면 이 표가 어디서 작동하는지 알아야 한다.

## 4가지 디스패치 모델 (요약)

| 종류 | 비용 | 사용 위치 |
|---|---|---|
| Static | 0, 인라인 가능 | struct/enum, `final`/`private` class, 프로토콜 익스텐션 비요구 메서드 |
| Vtable | 1 간접 호출 | 일반 class의 override 가능 메서드 |
| Witness table | 1 간접 호출 | 프로토콜 요구사항 메서드 |
| Objc message | 가장 비쌈 | `@objc dynamic`, NSObject 자식의 `dynamic` |

자세히는 [method-dispatch.md](method-dispatch.md). 여기선 *런타임 구조*를 더 깊게 본다.

## Class 메모리 레이아웃

```
+----------------------+
| isa pointer          | 클래스 메타데이터(=ObjC class object) 참조
| reference counts     | strong, unowned, weak 카운트들 (Side table로 옮겨질 수도)
| stored property 1    |
| stored property 2    |
| ...                  |
+----------------------+
```

- `isa`는 ObjC 호환. *클래스 메타데이터* 포인터
- 메타데이터는 vtable, 슈퍼클래스 포인터, 타입 디스크립터 보관
- weak/unowned 참조는 *side table*로 분리되어 객체 본체와 떨어진 위치에서 카운팅 (Swift 5+)

## Vtable

```
ClassMetadata
+-----------------------+
| ... (header)          |
| vtable[0]: methodPtr  |
| vtable[1]: methodPtr  |
| ...                   |
+-----------------------+
```

- 슈퍼클래스의 vtable 슬롯을 *상속*하고, override 시 자기 슬롯 갱신
- `final`/`private` 메서드는 vtable에 들어가지 않고 직접 호출 (정적 디스패치)
- WMO(Whole Module Optimization)는 *override가 없음을 증명*하면 자동으로 정적 호출 변환 (devirtualization)

## Witness Table

프로토콜 채택 시 *(타입, 프로토콜) 쌍마다* witness table이 생성된다.

```
WitnessTable for (Dog, Animal)
+--------------------------+
| sound -> Dog.sound impl  |
| eat   -> Dog.eat   impl  |
| ...                      |
+--------------------------+
```

```swift
protocol Animal { func sound() }
struct Dog: Animal { func sound() { print("woof") } }

let a: any Animal = Dog()
a.sound()    // 1) Dog의 witness table에서 sound 슬롯 lookup, 2) 호출
```

특수화 시(`some Animal` 인자 또는 `<T: Animal>` 제네릭):
- 컴파일러가 호출 사이트에서 *Dog 전용 코드*를 생성 → witness table 거치지 않음
- 0 비용 디스패치

## Existential Container

`any P`, `Any`, `Error` 같은 *existential* 타입의 내부 표현:

```
24~40 bytes
+--------------------------+
| Inline buffer (3 words)  |  작은 값 inline 저장
| Witness table pointer    |  프로토콜 메서드 호출
| Metadata pointer         |  타입 정보 (size, align, value witness)
+--------------------------+
```

- **Inline buffer**: 24 bytes (64bit) 초과 시 heap 박스 할당
- **Value witness table**: copy/destroy/move 등 *타입의 기본 연산* 디스패치
- **Witness table**: 채택된 프로토콜의 메서드 디스패치

비용 영향:
- `any P` 변수 생성 = 박싱 (작으면 inline, 크면 heap)
- 메서드 호출 = witness table 통한 간접 호출 (1 인디렉션)
- 다운캐스트 (`as? T`) = metadata 비교 + 값 추출

핫 루프에 `[any P]`를 다루면 누적 비용이 측정 가능. 대안:
- 제네릭(`<T: P>` / `some P`)으로 특수화
- 가능하면 concrete 타입으로 직접 처리

## Generic Specialization

```swift
func add<T: Numeric>(_ a: T, _ b: T) -> T { a + b }

add(1, 2)        // → addInt: 컴파일러가 Int 전용 코드 생성
add(1.0, 2.0)    // → addDouble: Double 전용
```

- WMO + `@inlinable`이면 모듈 경계 넘어서도 특수화 가능
- *바이너리 사이즈 vs 속도* 트레이드오프 (특수화 인스턴스가 누적)
- specialization이 안 되면 witness table fallback

## Reference Counting 비용

`retain`/`release`는 *atomic 연산*:
- 멀티스레드에서 모든 카운트 증감이 안전해야 함 → CAS 또는 atomic instruction
- 비용은 캐시 미스 + memory barrier 합쳐 수십 사이클
- 핫패스에서 누적되면 측정 가능

컴파일러 최적화:
- `+0 calling convention`: 호출자가 retain 안 하고 빌려주기 (인자 빌림)
- ARC 최적화 패스가 retain/release 쌍을 *공동 제거*
- `final`/특수화로 인라이닝 → retain/release 자체가 사라짐

## Metadata

런타임에 타입 정보가 필요한 곳마다 *metadata 포인터*가 등장:
- 다운캐스트(`as?`)
- `String(describing:)`
- `Mirror`
- Existential container의 type identity
- Codable 합성 (간접적)

메타데이터는 *지연 생성 가능* (`@_specialize` 등의 어트리뷰트로 제어). 대부분 정적이지만 generic specialization 결과는 lazy.

## ABI Stability (Swift 5.0+)

ABI 안정 = OS에 *공유 Swift 표준 라이브러리* 적용 가능:
- 앱이 자체 Swift runtime을 번들하지 않아도 됨
- 바이너리 크기 감소
- 신/구 Swift로 컴파일된 라이브러리 상호운용 가능

관련 키워드: `@frozen`, library evolution, resilient — 자세히는 [abi-and-resilience.md](abi-and-resilience.md).

## 흔한 함정 / Follow-up

- **Q. `Mirror`는 어떤 디스패치를 쓰나?**
  메타데이터의 *value witness*를 사용해 *모든 stored property*를 일반적으로 순회. 런타임 비용 큼. 디버깅/로깅 외엔 회피.

- **Q. Class에서 `private` 메서드는 정말 정적인가?**
  Same-file에서 보이지 않으니 override 불가 → vtable 슬롯 없음 → 정적. 단 `private(set)` 같은 비-메서드와 혼동 X.

- **Q. existential의 inline buffer를 초과하는 흔한 타입?**
  큰 struct, generic enum의 큰 페이로드. `Optional<HeavyStruct>` 등. 3 word(24B)이 기준.

- **Q. WMO가 켜져도 devirtualize 안 되는 경우?**
  같은 모듈에 *override한 서브클래스가 존재*. `final`로 차단하거나 `@inlinable` API에서 *명시적으로 final 보장* 필요.

- **Q. ARC 비용을 줄이는 가장 큰 도구?**
  1) `final` / 특수화, 2) borrowing 파라미터 (Swift 5.9+), 3) 핫패스에서 reference 타입을 *짧게 빌려* 사용.

- **Q. Swift Concurrency의 디스패치는?**
  `Task`는 자체 스케줄러(cooperative pool). actor 메서드 호출은 *hop*이라는 동적 디스패치 단계 추가. `@MainActor`도 동일.

## 참고

- WWDC 2016: Understanding Swift Performance
- WWDC 2021: ARC in Swift: Basics and beyond
- swift.org: ABI Stability and More
- swift/docs/ABI.rst (공식 ABI 문서)
