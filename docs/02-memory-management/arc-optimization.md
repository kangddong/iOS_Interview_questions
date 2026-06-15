# ARC 최적화 (컴파일러가 retain/release를 어떻게 줄이는가)

> 한 줄 요약 — ARC 비용은 *atomic retain/release* 호출 횟수에 비례한다. Swift 컴파일러는 **ownership convention**(+0/+1), **ARC 최적화 패스**(중복 제거, 이동), **인라이닝**으로 핫패스의 retain/release를 *대부분 제거*한다. 무엇이 남는지 이해해야 진짜 핫스팟이 보인다.

## 비용의 본질

`retain`/`release`는 *atomic counter 증감*:
- CAS 또는 fence가 필요한 메모리 ordering 연산
- 캐시 미스 + 코어 간 동기화 → 한 호출당 수십~수백 cycle
- 핫 루프에서 객체당 retain/release가 누적되면 측정 가능한 비용

ARC의 효율은 *횟수를 줄이는 능력*에 달림.

## Calling Convention: +0 vs +1

함수가 객체 인자를 받을 때 *retain 책임이 누구에게 있는가*:

| Convention | 의미 | 사용 |
|---|---|---|
| `+1` (owned) | 호출자가 retain된 객체를 *건네줌*. 함수가 release 책임 | 기본 |
| `+0` (guaranteed) | 호출자가 *빌려줌*. 함수는 retain/release 추가 안 함 | Swift가 적극 사용 |

Swift는 *기본을 +0(guaranteed)*로 두고, 필요할 때만 +1로 전환. 이게 ObjC ARC와 큰 차이.

```swift
func work(_ x: Foo) {       // Foo가 +0으로 전달
    x.method()              // retain 없이 직접 호출
}                           // release 없음 — 호출자가 소유
```

`borrowing` 파라미터(Swift 5.9+)는 이 +0 의미를 *명시적*으로 표현.

## ARC Optimization Pass

LLVM의 SIL 단계에서 *ARC-aware* 최적화 패스가 실행:

1. **Retain/release matching**: 짧은 스코프 내에서 retain-release 쌍을 *공동 제거*
   ```swift
   let x = obj         // retain
   x.read()
   /* no escape */      // release — 쌍 제거 가능
   ```
2. **Movement**: retain을 *나중으로*, release를 *앞으로* 이동해 hot path 밖으로 빼냄
3. **Block reordering**: 분기 안에서만 필요한 retain을 분기 안으로 이동
4. **Code motion**: 루프 불변 retain/release를 루프 밖으로

이 패스가 통과하면 ARC 호출 횟수가 *수배* 줄어듦.

## Inlining의 효과

`@inlinable`/`@inline(__always)`/whole-module-opt이 켜져 인라이닝되면:
- 호출자/피호출자 경계의 retain/release가 *통합 분석* 대상
- 더 많은 짝지움 가능
- `final` class + 특수화 시 retain/release가 *완전히 사라지는* 경우 많음

## Reference Count 저장 위치

Swift class는 두 가지 카운트 저장 모델:

### Inline counts (기본)

객체 헤더에 strong/unowned 카운트를 *비트필드*로 직접 저장. 가장 빠름.

```
+----------------------+
| isa pointer          |
| strongCount(31bits)  |
| unownedCount(...)    |
+----------------------+
| properties           |
```

### Side Table (필요 시)

다음 중 하나라도 발생하면 *side table*로 분리:
- 약한 참조(weak) 추가
- carrier 비트 부족 (수십억 개 retain 등 비현실적)

```
Object         SideTable
+--------+     +-------------------+
| isa    |---->| weakCount         |
| flags  |     | unownedCount      |
+--------+     | pointer back      |
               +-------------------+
```

side table 분리는 *최초 weak 생성 시* 한 번 발생 (비용 발생). 이후 weak/unowned 접근 비용은 약간 증가.

## Weak 참조의 동작

```swift
weak var v: Foo?
```

- 대상 객체의 side table에 *weak count*가 추가됨
- 객체 strong count = 0 시 deinit → side table의 weak slot들 nil로 표기
- weak read 시 *현재 살아있는지 확인*하고 옵셔널 반환

→ atomicity 보장으로 멀티스레드 안전. 비용은 strong 대비 살짝 더 비쌈.

## Unowned 참조

```swift
unowned var v: Foo        // (safe by default)
unowned(unsafe) var u: Foo
```

- Unowned (safe): unowned count 유지 → 객체 deinit 후에도 *메모리는 살아있고* 접근 시 *trap*
- Unowned (unsafe): C 포인터처럼 *raw 참조*. 해제된 메모리 접근 시 UB

대부분 unowned safe가 기본. unsafe는 ObjC `assign` 호환.

## `isKnownUniquelyReferenced(_:)`

Copy-on-Write 구현의 핵심. 컴파일러가 *inlined intrinsic*으로 만들어 reference count가 정확히 1인지 검사:

```swift
mutating func append(_ x: T) {
    if !isKnownUniquelyReferenced(&storage) {
        storage = storage.copy()
    }
    storage.appendInPlace(x)
}
```

비용: atomic load 1회. 매우 저렴.

## ARC가 *못* 줄이는 패턴

- **Closure에 캡처된 self** — closure가 살아있는 동안 retain 유지
- **Collection에 보관** — 컨테이너의 strong 참조
- **Task / Continuation** — 비동기 컨텍스트가 보관
- **NSNotification 옵저버** — Notification Center가 보관 (블록 옵저버)
- **외부 ABI를 거치는 호출** — 컴파일러가 인라이닝 불가, 보수적으로 retain 유지

이런 패턴이 핫패스에 있으면 retain/release가 *명시적으로 보임*.

## 측정 도구

| 도구 | 측정 대상 |
|---|---|
| Instruments → Allocations | 객체 할당/해제 수 |
| Instruments → Time Profiler | retain/release 호출이 차지하는 CPU 시간 |
| Instruments → Swift Metrics | ARC-specific 지표 |
| Memory Graph | 살아있는 객체 그래프, retain cycle 시각화 |

## 흔한 함정 / Follow-up

- **Q. ARC가 자동인데 왜 비용을 신경 쓰나?**
  대부분 무관. 단, 1초에 수만~수십만 객체를 만지는 핫패스(렌더링, 디코딩, 대량 데이터 처리)에선 누적이 큼.

- **Q. retain/release 호출 횟수를 직접 보려면?**
  Time Profiler의 *Heaviest Stack Trace*에서 `swift_retain`/`swift_release` 비율 확인.

- **Q. `unowned`이 정말 더 빠른가?**
  소폭. weak처럼 사이드 테이블 lookup이 없는 케이스에서 약간 이득. 안전성을 잃을 만큼 큰 이득은 아니다.

- **Q. `final`이 ARC 비용을 줄이는 메커니즘?**
  메서드가 정적 디스패치 → 인라이닝 가능 → 호출 경계의 retain/release 보수성이 사라짐 → ARC 최적화 패스가 더 공격적 제거.

- **Q. ObjC와 mixed ARC의 비용?**
  ObjC ARC는 *autorelease pool*과 +1 convention이 기본 → Swift보다 retain/release가 더 많음. 인터롭 경계가 핫스팟이면 측정 필요.

- **Q. Swift Concurrency에서 ARC 비용?**
  Task continuation/await 지점에서 *살아있어야 하는 캡처들*이 retain됨. await 양쪽에서 보수적으로 유지되므로 atomic 호출이 늘 수 있음.

## 참고

- WWDC 2021: ARC in Swift: Basics and beyond
- swift/docs/ARCOptimization.rst
- SE-0377 (borrowing/consuming) — +0/+1을 표면화
