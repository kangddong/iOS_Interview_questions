# Framework vs Library

> 한 줄 요약 — Apple의 *framework*는 단순한 라이브러리가 아니라 "바이너리 + 헤더 + 리소스 + 모듈 맵"을 하나의 *디렉터리 번들*로 묶은 배포 단위이며, library는 그중 바이너리만을 가리킨다. 멀티 아키텍처/리소스/Swift 모듈을 한 번에 다루기 위해 framework가 존재한다.

대상: iOS 8+ (third-party dynamic framework 허용), Xcode 11+ (XCFramework), Xcode 15+ / iOS 17+ (mergeable libraries).

## 핵심 개념

- **Library**: 단일 바이너리 파일. `.a`(static) 또는 `.dylib`(dynamic). 헤더는 별도로 배포.
- **Framework**: 정해진 디렉터리 레이아웃을 가진 번들. 바이너리·헤더·`Info.plist`·리소스·모듈 맵·코드 서명을 *한 단위로* 배포·서명·임베드.
- **Umbrella Header**: framework의 진입 헤더(`Foo/Foo.h`). 내부 public 헤더를 `#import` 모음. modulemap이 이를 가리켜 `@import Foo` 사용 가능.
- **module.modulemap**: Clang 모듈 시스템 정의. Swift의 `import Foo`가 이걸 통해 framework를 모듈로 인식.
- **Resource bundle**: framework 내부 `Resources/`. xib, asset catalog, localized strings 등.
- **XCFramework**: 여러 (플랫폼, 아키텍처, variant) 조합의 framework/library를 *하나의 배포 단위*로 묶은 디렉터리. fat binary가 처리 못 하던 *동일 아키텍처·다른 SDK*(예: iOS device arm64 vs iOS simulator arm64) 문제를 해결.
- **Mergeable Libraries** (Xcode 15+): dynamic framework를 *Release 빌드 시* 호스트 바이너리에 static하게 병합. 개발 빌드는 빠르게, 출시 빌드는 가볍게.

## Framework 디렉터리 레이아웃

```
Foo.framework/
├── Foo                  # Mach-O (dylib 또는 .a로부터 변환)
├── Headers/             # 공개 헤더
│   └── Foo.h
├── Modules/
│   ├── module.modulemap
│   └── Foo.swiftmodule/        # Swift 인터페이스 (arm64.swiftinterface 등)
├── Resources/
│   ├── Info.plist
│   └── Assets.car
└── _CodeSignature/      # framework도 별도 서명
```

iOS는 *flat* 구조, macOS는 `Versions/A/...` 심볼릭 링크 구조라는 차이가 있다.

## 비교

| 구분 | Library (`.a`/`.dylib`) | Framework | XCFramework |
|---|---|---|---|
| 단위 | 바이너리 1개 | 번들 (바이너리+헤더+리소스+모듈) | 여러 플랫폼/아키텍처 framework·library 묶음 |
| 리소스 동봉 | 불가 (별도 bundle 필요) | 가능 (`Resources/`) | 내부 framework가 가능 |
| 모듈 import | 불가 (`#include` only) | `import Foo` 가능 | 동일 |
| 멀티 SDK | lipo로 fat binary | 동일 SDK 한정 | iOS device + iOS sim + macCatalyst + visionOS 등 *분리 슬라이스* |
| 시뮬레이터 arm64 | fat 충돌 (M1 Mac) | 충돌 발생 | 슬라이스 분리로 해결 |
| 배포 형태 | 헤더 별도 제공 | zip된 디렉터리 | zip 또는 SPM `binaryTarget` |
| App Store | 그대로 사용 가능 | 그대로 사용 가능 | 빌드 시 적합 슬라이스만 추출 |

## XCFramework가 등장한 이유

Apple Silicon Mac이 등장하면서 *iOS Simulator도 arm64*가 됨. 기존 fat binary는 "device arm64 + simulator arm64"를 같은 슬롯에 못 담는다(`lipo` 충돌). XCFramework는 이를 SDK/플랫폼 단위 디렉터리로 *분리*해 해결.

```
Foo.xcframework/
├── Info.plist
├── ios-arm64/Foo.framework
├── ios-arm64_x86_64-simulator/Foo.framework
├── macos-arm64_x86_64/Foo.framework
└── ios-arm64_x86_64-maccatalyst/Foo.framework
```

## 코드 예시

```shell
# 동적 framework 빌드 (archive로 .xcarchive 생성 후 묶기)
xcodebuild archive \
  -scheme Foo -destination "generic/platform=iOS" \
  -archivePath build/ios.xcarchive SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES

xcodebuild archive \
  -scheme Foo -destination "generic/platform=iOS Simulator" \
  -archivePath build/sim.xcarchive SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES

xcodebuild -create-xcframework \
  -framework build/ios.xcarchive/Products/Library/Frameworks/Foo.framework \
  -framework build/sim.xcarchive/Products/Library/Frameworks/Foo.framework \
  -output Foo.xcframework
```

```swift
// SwiftPM에서 XCFramework 배포
.binaryTarget(
    name: "Foo",
    url: "https://cdn.example.com/Foo-1.2.0.xcframework.zip",
    checksum: "abc123..."
)
```

```
// module.modulemap (직접 작성 시)
framework module Foo {
    umbrella header "Foo.h"
    export *
    module * { export * }
}
```

## `BUILD_LIBRARY_FOR_DISTRIBUTION`

Swift framework를 외부 배포할 때 *반드시* `YES`로 빌드해야 한다. 이유:

- `.swiftinterface` 생성 → 컴파일러 버전 간 호환.
- *Library Evolution* 모드 → ABI 안정 호출 규약. 소비자가 다른 Swift 버전이어도 링크 가능.
- 미설정 시 "module compiled with Swift X.Y cannot be imported by Swift X.Z" 에러.

## Mergeable Libraries (Xcode 15, iOS 17+)

```
Build Setting: MERGEABLE_LIBRARY = YES         (각 framework)
Build Setting: MERGED_BINARY_TYPE = automatic  (host app)
```

- Debug: framework는 *그대로 dynamic*. 빠른 incremental 빌드.
- Release: ld가 mergeable framework의 코드를 호스트에 흡수 → 런치 시 dylib 로딩 비용 0.
- pre-main 개선과 모듈화의 *동시 달성*. 기존엔 "분리하면 launch 느려짐" 트레이드오프가 컸음.

## 흔한 함정 / Follow-up

- **Q. `import Foo` vs `#import <Foo/Foo.h>` 차이?**
  전자는 Clang module 시스템을 사용 → 컴파일된 모듈 캐시(`.pcm`) 재사용으로 빌드 빠름. 후자는 매 컴파일마다 헤더 파싱. modulemap이 있어야 `import` 사용 가능.
- **Q. Static framework에 리소스 넣으면 어떻게 되나?**
  바이너리는 호스트에 흡수되지만 리소스는 별도 `.bundle`로 추출되어 호스트 앱 번들에 복사. SPM은 `Bundle.module`로 자동 접근.
- **Q. XCFramework 배포 시 `BUILD_LIBRARY_FOR_DISTRIBUTION`을 빼면?**
  소비자 Xcode/Swift 버전이 *정확히 같지* 않으면 import 실패. 오픈소스 배포에선 사실상 필수.
- **Q. `Embed & Sign` vs `Do Not Embed`?**
  앱 번들 `Frameworks/`에 넣고 codesign할지 결정. *시스템 framework*는 OS에 있으므로 Do Not Embed, *third-party dynamic framework*는 Embed & Sign. static이면 임베드 불필요.
- **Q. fat binary와 XCFramework 차이를 한 줄로?**
  fat은 *아키텍처별 슬라이스*를 한 파일에, XCFramework는 *플랫폼·SDK·아키텍처 조합*을 디렉터리로 분리.
- **Q. mergeable libraries 적용 후 측정 포인트?**
  `DYLD_PRINT_STATISTICS`로 dylib 로딩 시간, Instruments App Launch 템플릿으로 pre-main 시간 비교.

## 참고

- WWDC19 *Binary Frameworks in Swift* (Session 416)
- WWDC20 *Distribute binary frameworks as Swift packages* (Session 10147)
- WWDC23 *Meet mergeable libraries* (Session 10268)
- WWDC22 *Link fast: Improve build and launch times* (Session 110362)
- Apple Docs: *Creating a multiplatform binary framework bundle* / *Framework Programming Guide*
