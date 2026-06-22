# 02. Memory Management

> 한 줄 요약 — Swift는 **ARC** 기반. 컴파일러가 retain/release를 *컴파일 시점*에 삽입해 GC 없이 결정론적으로 해제하고, 값 타입은 스택/인라인에 두고 큰 데이터는 COW로 비용을 회피한다.

메모리는 면접 단골. ARC 동작과 retain cycle 식별이 *기본*, ARC 최적화/박싱/디버깅 도구는 *시니어*.

## ARC vs GC

| 구분 | ARC (Swift/ObjC) | GC (Java/JS/Go) |
| --- | --- | --- |
| 해제 시점 | **결정론적** — 카운트 0 즉시 | 비결정적 — runtime이 수거 |
| 오버헤드 | retain/release 명령 (컴파일 시 삽입) | GC pause, write barrier |
| 사이클 | **개발자가 끊어야 함** (`weak`/`unowned`) | 자동 수집 |
| 메모리 정점 | 낮음 | 높음 (수거 전까지 누적) |

→ 모바일 환경의 *예측 가능한 응답성*과 *낮은 메모리 정점*이 GC pause보다 중요해 ARC를 선택.

## 핵심 개념 5선

### 1. 강참조 / 약참조 / 미소유참조
- **strong** (기본): 카운트 +1, 객체 살아 있게 함.
- **weak**: 카운트 영향 X, 대상 해제 시 **자동 nil** (zeroing). 반드시 `var` + Optional.
- **unowned**: 카운트 영향 X, 대상이 살아 있다고 *프로그래머가 보증*. 해제 후 접근 시 크래시. 생명주기 명확할 때만.

### 2. Retain Cycle
- 두 객체가 서로 strong → 카운트가 0이 되지 않음 → 누수.
- 대표 패턴: **delegate** (그래서 weak), **closure가 self 캡처** (그래서 `[weak self]`), **parent-child 양방향 참조**.
- 진단: Xcode Memory Graph Debugger의 보라색 느낌표.

### 3. Capture List
- 클로저 캡처는 *기본 strong*. `escaping` 클로저 + `self` 캡처 + `self`가 클로저를 보유 → 사이클.
- `[weak self]` — self가 사라질 수 있을 때 (대부분의 비동기 콜백).
- `[unowned self]` — self의 수명이 클로저보다 길다고 보증 가능할 때.
- guard 패턴: `guard let self else { return }`.

### 4. Value 타입의 메모리
- struct/enum은 *상황별로* 스택, 힙(class 멤버일 때), 인라인(struct 멤버일 때).
- **박싱이 일어나는 경우**: `Any` / `AnyObject` / existential container (`any Protocol`) / `indirect enum` / 자기 자신을 멤버로 가진 재귀 struct.
- COW: `Array`/`Dictionary`/`String`은 내부 클래스 버퍼 + `isKnownUniquelyReferenced`로 공유 검사 후 복사.

### 5. autoreleasepool
- Objective-C 호환 API가 반환한 객체는 *autorelease pool*에 등록되었다가 풀이 끝날 때 해제.
- Swift에서는 자동이지만 **루프 안 임시 객체 폭증** 시 명시적으로 `autoreleasepool { ... }` 로 감싸 정점 메모리 억제.

## 참조 카운트가 변하는 지점

```
let a = MyClass()          ─ +1 (생성)
let b = a                  ─ +1 (대입)
a.delegate = b             ─ delegate가 weak이면 변화 없음
스코프 끝                  ─ -2 (a, b 둘 다)
deinit { ... }             ─ 카운트 0 도달 시 호출
```

함정: ARC 최적화로 인해 `deinit` 시점이 사람의 직관과 다를 수 있음. `withExtendedLifetime`로 명시 가능.

## 항목

### 기본
- [ARC 동작 원리](arc.md)
- [strong / weak / unowned 차이](weak-vs-unowned.md)
- [retain cycle — 발생 패턴과 해결](retain-cycle.md)
- [capture list `[weak self]` / `[unowned self]` 선택 기준](capture-list.md)
- [autoreleasepool — 언제 필요한가](autoreleasepool.md)

### 시니어
- [Heap vs Stack (값 타입의 메모리)](heap-vs-stack.md)
- [값 타입 박싱 조건 (스택 vs 힙, existential, indirect enum)](value-type-memory.md)
- [ARC 최적화 — 컴파일러가 retain/release를 어떻게 줄이나](arc-optimization.md)
- [메모리 디버깅 도구 (Memory Graph / Leaks / Sanitizers)](memory-tools.md)

## 관련

- 값 타입 메모리 → [01-swift-language/struct-vs-class.md](../01-swift-language/struct-vs-class.md)
- Copy-on-Write → [01-swift-language/copy-on-write.md](../01-swift-language/copy-on-write.md)
- Swift Runtime → [01-swift-language/runtime-internals.md](../01-swift-language/runtime-internals.md)
- Ownership → [01-swift-language/ownership.md](../01-swift-language/ownership.md)

## 자주 묻는 질문

**주니어**: weak vs unowned / `[weak self]` 언제 / closure capture가 왜 strong / `deinit` 호출 안 되는 원인 / autoreleasepool은 언제

**미들**: struct가 heap으로 가는 조건 / existential 박싱 비용 / `isKnownUniquelyReferenced`의 작동 원리 / Memory Graph로 retain chain 찾기

**시니어**: +0/+1 calling convention / ARC optimization pass 단계 / 객체 헤더 vs side table 카운트 분리 / `final` + WMO가 ARC 비용을 줄이는 메커니즘
