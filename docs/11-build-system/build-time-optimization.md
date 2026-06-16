# Build Time 최적화 (Incremental / Module Separation / 측정)

> 한 줄 요약 — 빌드 타임은 *모듈 경계*와 *컴파일 단위 크기*가 좌우한다. 모듈을 *적절히* 잘라 incremental rebuild가 작동하게 하고, 추론 부담이 큰 표현식을 분해하며, 표준 측정 도구(`-Xfrontend -debug-time-function-bodies`, BuildTime Analyzer)로 핫스팟을 찾는 게 시니어 워크플로.

## 빌드 타임 단축의 *진짜 지렛대*

1. **모듈 분리** — 변경 없는 모듈은 *재컴파일 안 됨* (최대 효과)
2. **타입 추론 단순화** — Swift 컴파일러 추론기는 NP-hard 영역으로 빠질 수 있음
3. **clean build 줄이기** — Derived Data 캐시 활용
4. **빌드 옵션 — Debug 모드 최적화 끔**

순서대로 검토.

## 모듈 분리

### 효과

- *변경된 모듈 + 그 의존자*만 재컴파일
- 모듈 = SPM target, framework, Tuist target
- 변경이 *코어 모듈*에 자주 발생하면 효과 적음 → 변경 빈도 낮은 모듈을 *재사용 단위*로 추출

### 적정 단위

너무 잘게 자르면 *모듈 간 인터페이스 비용*이 증가하고 컴파일 *전체 시간*은 늘 수도. 가이드:

- 한 모듈 ≤ 5만 줄 (대략)
- *concrete 변경*이 *재사용 가능한 추상* 모듈을 *건드리지 않게* 의존 방향 설계
- Interface 모듈과 Implementation 모듈 분리 (`*Interface` + `*Impl`)

자세히는 [06-architecture/modularization.md](../06-architecture/modularization.md).

### Static vs Dynamic 링크

- **Static**: 바이너리 큰데 *런타임 dyld 비용 감소* → launch time 단축
- **Dynamic**: 빌드 시간 *짧고* hot reload 빠르지만 launch 비용

Tuist/SPM에서 빌드 config 별로 분기 가능 (Debug: dynamic / Release: static).

## 타입 추론 함정

### 큰 표현식 분해

```swift
// ❌ 추론 시간 폭증 가능
let r = items.compactMap { ... }
              .filter { ... }
              .reduce(0) { ... } * factor + offset
```

→ 변수에 단계별로 *명시적 타입*과 함께 분리:

```swift
let mapped: [Int] = items.compactMap { ... }
let filtered = mapped.filter { ... }
let sum = filtered.reduce(0, +)
let r = sum * factor + offset
```

### Result builder 깊이

SwiftUI `body` 내부에 *80~100개 자식*이면 빌드 시간 급증. *추출*해 별도 View로 분리.

```swift
// ❌
var body: some View {
    VStack {
        Header(...)
        // 100+ rows of UI
        Footer(...)
    }
}

// ✅
var body: some View {
    VStack { Header(...); Content(...); Footer(...) }
}
```

### nil-coalescing/optional chaining 체인

긴 `??` 체인이나 `as?` 다단은 추론 시간 큼. 중간 변수 도입.

## 측정 도구

### `-Xfrontend -debug-time-function-bodies`

Build settings → Other Swift Flags에 추가:

```
-Xfrontend -warn-long-function-bodies=200
-Xfrontend -warn-long-expression-type-checking=100
```

200ms 넘는 함수, 100ms 넘는 표현식을 경고로 출력. CI에서 *임계값 회귀* 감지.

### BuildTime Analyzer (RobertGummesson)

Swift compiler가 함수별 시간을 dump한 로그를 시각화. 가장 느린 함수 Top N 추출.

### Xcode Build Activity Log

- 우측 상단 *Build Reports* → 단계별 시간
- *Recent Builds*에서 incremental vs clean 시간 비교

### `xcodebuild -showBuildTimingSummary`

CLI 빌드의 단계별 시간 요약.

## 빌드 옵션

### Debug 모드

| 옵션 | Debug 권장 | Release 권장 |
|---|---|---|
| Optimization | `-Onone` | `-O` 또는 `-Osize` |
| Whole module opt | 끔 | 켬 |
| Debug info | dwarf | dwarf-with-dsym |
| Strip | NO | YES |

Debug 빌드를 빠르게 유지하려면 *Whole module opt 끔* + `-Onone`.

### `Build Active Architecture Only`

- Debug에서 `YES` → 현재 아키텍처만 빌드 → 빠름
- Release에서 `NO` → 모든 아키텍처

### Header Map / `EXCLUDED_ARCHS`

복잡한 ObjC interop 프로젝트에서 헤더 경로/아키텍처 제외로 시간 절약.

## CI 빌드 캐시

- **xcodebuild + DerivedData 보존**: 같은 머신/같은 캐시면 incremental
- **Bazel rules_apple, Buck2**: action-level 캐시 (대규모)
- **mtime 보존**: git checkout이 mtime을 *현재 시각*으로 두면 캐시 무효 → `git restore-mtime` 같은 도구

## Tuist / SPM 모듈 캐시

- Tuist binary cache: 빌드 결과를 캐시해 *다른 개발자/머신과 공유*
- SPM `--cache-path`: 패키지 캐시 공유
- 대규모 팀에서 hours → minutes 단축 가능

## 흔한 함정 / Follow-up

- **Q. 모듈을 *너무 많이* 잘랐을 때 증상?**
  Clean build 시간이 *역설적으로 증가*. 모듈 간 인터페이스 오버헤드. 캐시 안 닿은 변경엔 효과 미미.

- **Q. SwiftUI 빌드 시간이 *유난히* 길다?**
  Result builder + 추론 결합. body를 *작게 자르고* `@ViewBuilder`로 helper 분리.

- **Q. ObjC를 도입하면 빌드 빨라지나?**
  *경우에 따라*. Swift type checker가 가장 큰 비용일 때 ObjC가 빠르지만, 인터롭 비용 + 안전성 손실.

- **Q. `@inlinable`을 라이브러리에 박으면?**
  클라이언트 빌드 시간 증가 (본문 인라이닝). 코어 핫함수만 선택적.

- **Q. WMO와 빌드 시간 트레이드오프?**
  WMO 켜면 *Release 시 최적화 강력*, 빌드 시간 *증가*. Debug에선 끔.

- **Q. 측정 없이 *느낌으로* 최적화?**
  거의 실패. *왜 느린지 측정 → 가장 큰 비용부터*. Top-down 원칙.

## 참고

- WWDC 2022: Demystify parallelization in Xcode builds
- BuildTime Analyzer for Xcode (GitHub)
- swift.org: Compilation Performance Tips
- Tuist documentation
