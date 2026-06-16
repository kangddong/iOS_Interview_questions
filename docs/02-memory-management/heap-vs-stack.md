# Heap vs Stack (값 타입의 메모리)

> 한 줄 요약 — **stack은 함수 프레임에 묶인 빠른 공간, heap은 동적 할당이 필요한 영역**. Swift에서 stack/heap 결정은 *값 타입 여부*나 *사이즈*만으로 정해지지 않고 — 저장 컨텍스트(지역 변수인지, escape 되는지, 클래스 프로퍼티/CoW backing storage/existential에 들어가는지)에 따라 갈린다. struct/enum이 *지역 변수*일 때 주로 stack이고, *closure 캡처 / 박싱 / 클래스 프로퍼티 / indirect enum* 등에서는 heap이다.

## 기본 분류

| 종류 | 위치 | 비용 |
|---|---|---|
| 함수 지역 변수 (값 타입) | stack | 거의 0 (포인터 이동) |
| 클래스 인스턴스 | heap | malloc + ARC |
| 클로저 캡처 박스 | heap | malloc + ARC |
| Existential container의 큰 값 (>4 word) | heap | malloc + ARC |
| 글로벌/static let | data 영역 | 1회 |

## 값 타입이 heap으로 가는 흔한 조건

### 1) closure가 캡처

```swift
var counter = 0
let inc = { counter += 1 }   // counter가 박스로 heap에 올라감
```

closure가 외부 변수를 *수정 가능하게* 캡처하면 *박스(heap class)*에 담는다. closure가 사라지기 전엔 그 박스 살아있음.

### 2) 클래스 프로퍼티

```swift
class Holder { var p = Point(x: 1, y: 2) }
```

`Holder`는 heap에 있고, 그 안의 `Point` 또한 *Holder의 메모리(heap)*에 함께 산다. 별도 alloc은 아니지만 stack 아님.

### 3) Existential container

```swift
let a: any Drawable = LargeStruct()   // 4워드 초과 시 heap
```

작은 값(<= 4워드)은 인라인, 그 이상은 컨테이너 안 포인터로 heap에 분리.

### 4) Array/Dictionary/String 같은 표준 라이브러리 컬렉션

내부 버퍼가 *클래스(heap)*. 변수 자체는 struct(stack)이지만 *데이터*는 heap.

```swift
var arr = [1,2,3]    // arr 자체는 stack, 버퍼는 heap (CoW)
```

## 박스화(Boxing) 비용

값 타입을 *참조 의미론*이 필요한 곳에 넣을 때 wrapper class를 만들어 감싸는 것.

- closure capture box
- existential container (큰 값)
- `AnyHashable` 등 type-erasure wrapper

박스화는 *malloc + retain/release + 간접 접근*을 만든다. 자주 일어나면 메모리 단편화/캐시 미스로 hitch 유발.

## inline vs out-of-line

값 타입 크기가 매우 크면 (예: 16 word 짜리 struct):

- 함수 인자 전달이 *복사 비용* 폭증.
- existential 컨테이너에 안 들어가 heap 분리.
- 컬렉션에 담을 때 메모리 압박.

대형 데이터는 *클래스 wrapper*나 *Copy-on-Write*로 감싸 비용을 분산.

## Copy-on-Write 메커니즘

`Array`, `Dictionary`, `Set`, `String`은 변경 시점에만 복사:

```swift
var a = [1,2,3]
var b = a              // 버퍼 공유, 그저 retain
b.append(4)            // unique 검사 후 buffer 복사 → 자기 복사본 변경
```

`isKnownUniquelyReferenced(_:)`로 직접 CoW를 구현 가능 (커스텀 컨테이너 만들 때).

→ [01-swift-language/copy-on-write.md](../01-swift-language/copy-on-write.md)

## 측정

- Instruments → Allocations로 *malloc 호출 빈도*와 위치.
- 디버그용: `MemoryLayout<T>.size / .stride / .alignment`
- 의심 지점에 `os_signpost`로 박스 폭증 구간 마킹.

## 비교 — 값 타입과 참조 타입의 메모리 모델

| 구분 | struct/enum | class |
|---|---|---|
| 기본 위치 | stack | heap |
| 복사 의미 | 값 복사 (CoW) | 참조 복사 |
| ARC | 없음 (구성요소가 class면 그것만) | 항상 |
| 다형성 | protocol/some/any | 상속 + protocol |
| 캐시 친화 | 좋음 (연속 메모리) | 위치 분산 |

## 흔한 함정 / Follow-up

- **Q. 작은 struct도 closure에 캡처되면 박스?**
  변경 가능한 var 캡처는 박스. 읽기만 한다면 capture list `[x]`로 *복사 캡처*해 박스 회피.

- **Q. `String`이 값 타입인데 왜 빠른가?**
  내부에 *작은 inline 표현*(15바이트 미만 ASCII는 직접 저장)과 *클래스 버퍼*를 모두 가짐 — 작으면 stack-only, 크면 heap + CoW.

- **Q. struct에 대형 배열/이미지를 두면?**
  Array는 어차피 CoW로 heap 버퍼를 공유. 단, struct를 *복사*하면 버퍼 retain만. 그러나 *unique mutation* 시 전체 버퍼 복사가 일어나 고비용.

- **Q. `inout`은 박스를 만드나?**
  아니다. `inout`은 *주소 전달*에 가까움 (정확히는 copy-in/copy-out 의미론, 컴파일러가 가능하면 주소 전달로 최적화).

- **Q. `@inlinable`/`@usableFromInline`?**
  라이브러리 진영 최적화 마커. 클라가 함수 본문을 인라인할 수 있게 정보 노출. 일반 앱 코드보단 SDK에서 자주.

- **Q. 박스 비용을 줄이는 일반 원칙?**
  - closure 캡처 양 줄이기, 필요 없으면 capture list로 복사
  - any 대신 generic/some
  - 큰 값을 자주 복사하는 컨테이너에 넣지 말기
  - 연산 핫패스에서 existential 호출 자제

## 참고

- WWDC 2016: Understanding Swift Performance
- WWDC 2022: Embrace Swift generics
