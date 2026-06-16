# 모듈 경계 설계 (Interface vs Impl, Public Surface, 의존 방향)

> 한 줄 요약 — 모듈을 *몇 개로* 자를지보다, **의존 방향을 한 방향으로 고정**하고 **public surface를 최소화**하는 게 더 중요. *Interface 모듈*과 *Implementation 모듈*을 분리하면 빌드 incremental + 테스트 mock 주입이 자연스러워진다.

## 의존 방향: 한 방향, 위→아래

```
Feature (Home, Search, Profile)
    │ depends on
    ▼
DomainInterface  (UserRepository protocol, Models)
    │ implemented by
    ▼
DomainImpl       (Live implementations, Network/DB 호출)
    │ depends on
    ▼
Core (Networking, Logging, Foundation 확장)
```

핵심:
- Feature는 *Interface*에만 의존, Impl을 모름 → 컴파일 그래프에서 분리
- Impl 교체(Mock, Stub)로 Feature 단독 테스트 가능
- Impl 변경 시 Feature 재컴파일 없음

## Interface vs Impl 분리

### 패턴 1: 별도 모듈 (강력)

```
DomainInterface   (protocols, value types)
DomainImpl        (concrete classes, network/db wired)
DomainTesting     (preview/test용 mock 구현)
```

- Feature는 `DomainInterface` + `DomainTesting`만 import
- App의 root composition만 `DomainImpl` import
- 가장 강한 경계, 빌드 시간 이득 큼

### 패턴 2: 같은 모듈 안 폴더 분리 (가벼움)

작은 프로젝트에선 폴더로 충분. 정말 경계가 필요해질 때 모듈로 승격.

## Public Surface 최소화

```swift
public struct User { ... }           // 외부 공개
public protocol UserRepository { ... }

internal struct UserRepositoryLive { ... }   // 외부 비공개
@usableFromInline internal func helper() { ... }   // ABI 노출 인지
```

원칙:
- `public`은 *클라이언트가 정말 필요*한 최소만
- `init`은 *필요한 경우만* public — 라이브러리가 팩토리/DI 제공이 일반적
- protocol의 default 구현으로 *변경 자유* 확보

## 의존성 역전 (DIP)

high-level 모듈이 low-level 모듈에 *직접 의존하지 않게*:

```
Feature              ──────▶ UserRepository (protocol, in Interface)
                                    △
                                    │ implements
DomainImpl/UserRepoLive ─────────────┘
```

Feature는 abstraction(protocol)만, Impl은 abstraction을 *implement*. DI 컨테이너 또는 composition root에서 wiring.

## 모듈 분리 *언제*가 적정?

분리 시점 신호:
- 한 모듈 빌드 시간 > 30초
- 한 폴더 / 디렉토리에서 *명백히 다른 도메인*이 섞임
- 두 팀이 같은 모듈을 동시 작업 → 충돌 잦음
- 재사용할 코드를 *복제*하지 않고 공유해야 할 때

분리하면 안 되는 신호:
- 모듈 간 *내부 모델*을 자주 주고받음 → public 타입 확장 압박
- 모듈 개수보다 *Package.swift*/Tuist 설정이 더 복잡해짐
- 한 PR이 *3+ 모듈 동시* 수정

## Feature-first vs Layer-first

| 구조 | 장점 | 단점 |
|---|---|---|
| Feature-first (Home/, Search/, Profile/) | 도메인 응집, 동시 작업 충돌 적음 | 공통 코드 위치 애매 |
| Layer-first (Models/, ViewModels/, Views/) | 같은 종류 파일 모음 | 한 기능 수정 시 여러 디렉토리 |
| Hybrid | 위 둘의 절충 | 정책 일관성 유지 노력 |

권장: Feature-first + Core/Domain 공통 모듈 + Feature 내부 layer 분리.

## Tuist / SPM 비교 (모듈화 도구)

| 도구 | 장점 | 단점 |
|---|---|---|
| **Tuist** | 의존 그래프 시각화, 빌드 캐시, 코드 생성 | 설치/학습 필요 |
| **SPM** | Xcode 통합, 외부 의존성 자연스러움 | 큰 그래프 시 빌드/제너레이션 느림 |
| **CocoaPods** | 성숙 | post-install 스크립트, 빌드 시간 |
| **Bazel/Buck2** | 대규모 (캐시, 원격) | 진입장벽 매우 큼 |

소규모: SPM. 중규모: Tuist. 대규모(수십~수백 모듈): Bazel 검토.

## Static vs Dynamic 링크

- **Static**: 바이너리 단일화 → launch time ↓ (dyld 단계 단축)
- **Dynamic**: 빌드 시간 ↓, 핫리로드 가능, 메모리 공유

Tuist `Project.swift`에서 *config별 분기*:

```swift
.framework(.staticFramework)   // Release
.framework(.dynamicFramework)  // Debug
```

자세히는 [10-performance/launch-time.md](../10-performance/launch-time.md), [11-build-system/build-time-optimization.md](../11-build-system/build-time-optimization.md).

## 모듈 간 *데이터* 전달

```swift
// In FeatureA
public struct Order { public let id: String }

// In FeatureB가 Order를 받을 때
import FeatureA           // ❌ FeatureA에 강결합

// 더 나은 패턴: 공통 Domain에 Order 정의
import Domain
```

Feature ↔ Feature는 *Domain*을 거쳐 통신. 또는 *Coordinator/Router*가 mediator.

## 흔한 함정 / Follow-up

- **Q. 모듈을 *너무 빨리* 자르면?**
  Interface가 안정 안 됐는데 분리 → 변경마다 *Interface와 Impl 둘 다 수정*. 안정화 후 승격.

- **Q. *너무 늦게* 자르면?**
  코드 그래프가 *얽혀* 분리 비용 큼. 일정 규모(5만~10만 줄) 넘기 전 분리 시도.

- **Q. SwiftUI Preview가 *Impl 의존*이라 느리다?**
  Preview에는 `DomainTesting`의 Mock 주입. Impl 모듈 import 안 함 → preview rebuild 시간 단축.

- **Q. circular dependency 해소?**
  *공통 의존만 별도 모듈*로 추출. 또는 *event/notification* 패턴으로 *경량 분리*.

- **Q. 모듈 간 *protocol을 어디에 두나*?**
  *호출하는 쪽*이 정의한다(host의 needs를 표현). DIP의 핵심.

- **Q. Swift Concurrency `Sendable`이 모듈 경계에 미치는 영향?**
  모듈 간 전달 타입은 *Sendable 보장* 필요(Swift 6 strict). Interface 모듈의 모델을 Sendable로 설계.

## 참고

- WWDC 2019: Modularizing your apps with Swift Packages
- WWDC 2022: Demystify parallelization in Xcode builds
- Tuist: Manifest Reference
- Robert C. Martin: Clean Architecture
