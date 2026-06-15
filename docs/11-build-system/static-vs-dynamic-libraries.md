# Static vs Dynamic Library

> 한 줄 요약 — 정적 라이브러리는 *링크 타임에* 실행 파일에 코드를 박아 넣고, 동적 라이브러리는 *런치/런타임에* dyld가 로드한다. 선택은 런치 시간·바이너리 크기·코드 공유·ABI 안정성의 트레이드오프 문제다.

대상: iOS 8+ (third-party dylib 허용 이후), Swift 5.0+ (ABI 안정).

## 핵심 개념

- **Static Library (`.a`, `MH_OBJECT` 모음)**: 컴파일된 `.o`(object) 파일들의 아카이브. `ld`가 필요한 심볼만 골라 실행 파일에 *복사*한다. 런타임 의존성 없음.
- **Dynamic Library (`.dylib`, `MH_DYLIB`)**: dyld가 런치 시 또는 `dlopen`으로 메모리에 매핑하는 Mach-O. 여러 프로세스가 페이지를 공유할 수 있음.
- **Framework**: `.a`/`.dylib`에 헤더·리소스·Info.plist를 묶은 *디렉터리 번들*. iOS 8 이전엔 static framework만 가능했고, 이후 dynamic framework 허용.
- **Static Framework**: 내부 바이너리가 `.a`. 링크 시 호스트 앱에 흡수.
- **iOS의 제약**: 시스템 dylib(`/usr/lib`, `/System/Library/Frameworks/*`)만 *공유*된다. 앱 번들의 `Frameworks/`에 들어간 third-party dylib은 *프로세스 단위* 로드 → 코드 공유 이점 없음.

## 비교

| 구분 | Static (`.a` / static framework) | Dynamic (`.dylib` / dynamic framework) |
|---|---|---|
| 결합 시점 | 링크 타임 (ld) | 런치 / 런타임 (dyld) |
| 실행 파일 크기 | 사용 심볼만 포함되어 증가 | 본체엔 stub만, 별도 파일 |
| 런치 시간 | 추가 비용 거의 없음 | dyld가 각 dylib 매핑·바인딩 → pre-main 증가 |
| 메모리 공유 | 불가 (각 프로세스에 복사) | 시스템 dylib만 페이지 공유 가능 |
| 업데이트 | 재컴파일·재배포 필요 | 파일 교체만으로 가능 (시스템 한정) |
| dead-code stripping | `-dead_strip`으로 효과적 | dylib 내부는 제거 불가 (export 보장) |
| App Extension 공유 | 코드가 복제됨 → 총 용량 증가 | embedded framework로 *번들 내* 공유 |
| Swift 사용 시 | runtime 중복 우려 없음 | Swift 5+ ABI 안정으로 OS dylib 사용 가능 |

## 동작 원리

### Static link
1. `clang -c a.c → a.o` (Mach-O `MH_OBJECT`)
2. `ar rcs libFoo.a a.o b.o` — 단순 아카이브.
3. `ld -lFoo` 시 ld가 *undefined symbol*을 만족시키는 `.o`만 골라 실행 파일에 병합. → 사용 안 한 함수는 자동 제외(`-dead_strip` 권장).

### Dynamic link
1. `clang -dynamiclib a.c -o libFoo.dylib` — `MH_DYLIB` 생성. `install_name`(설치 경로) 기록.
2. 앱 빌드 시 ld는 심볼이 *어느 dylib에 있는지만* 기록(`LC_LOAD_DYLIB`). 실제 코드는 복사 안 함.
3. 런치 시 dyld가 `LC_LOAD_DYLIB`를 따라 dylib을 mmap → rebase/bind로 GOT/lazy stub 채움 → 앱 코드 실행.

## 코드 예시

```shell
# 정적 라이브러리 생성
clang -c -arch arm64 -isysroot $(xcrun --sdk iphoneos --show-sdk-path) Foo.m -o Foo.o
ar rcs libFoo.a Foo.o
lipo -create libFoo-arm64.a libFoo-x86_64.a -output libFoo.a

# 동적 라이브러리 생성
clang -dynamiclib -arch arm64 Foo.m \
  -install_name @rpath/libFoo.dylib \
  -o libFoo.dylib

# 의존성 / 로드 경로 확인
otool -L MyApp.app/MyApp
otool -l MyApp.app/MyApp | grep -A2 LC_RPATH
```

```ruby
# CocoaPods — Podfile에서 선택
use_frameworks!                       # dynamic framework
use_frameworks! :linkage => :static   # static framework (CocoaPods 1.9+)
```

```swift
// SwiftPM — Package.swift 명시
.library(name: "Foo", type: .static,  targets: ["Foo"])
.library(name: "Foo", type: .dynamic, targets: ["Foo"])
.library(name: "Foo",                   targets: ["Foo"])  // 자동(소비자 선택)
```

## Swift 특수 사항

- **Swift 5.0 이전**: ABI 미안정 → 앱마다 Swift 런타임을 *embedded dylib*로 동봉 (수 MB). `SWIFT_FORCE_STATIC_LINK_STDLIB` 같은 옵션도 있었음.
- **Swift 5.0+ / iOS 12.2+**: stdlib이 OS에 포함된 dylib이 되어 동봉 불필요.
- **mergeable libraries (Xcode 15, iOS 17+)**: 개발 시엔 dynamic framework로 빠른 빌드, 릴리스 시엔 ld가 dylib들을 호스트 바이너리에 *static하게 병합*. 런치 시간↓ + 디버그 빌드 속도↑ 양립.

## 런치 타임 영향 (측정)

```shell
# 환경 변수로 dyld 단계별 시간 출력
DYLD_PRINT_STATISTICS=1 ./MyApp
# 또는 Xcode Scheme → Run → Arguments → Environment Variables 추가
```

| 단계 | 영향 요인 |
|---|---|
| dylib loading | embedded dylib 개수 (≈ each ms 단위) |
| rebase / bind | `__DATA` 포인터 수, chained fixups 사용 여부 |
| ObjC setup | `+load`, class registration 수 |
| initializer | `__attribute__((constructor))`, Swift `static let` |

WWDC19 "Optimizing App Launch": embedded dylib 6개 이하 권장. 그 이상이면 정적 결합 또는 mergeable libraries 검토.

## 흔한 함정 / Follow-up

- **Q. static과 dynamic 중복 링크 시 무슨 일?**
  같은 심볼이 두 모듈에서 정의되면 "duplicate symbol" 에러 또는 *둘 다 로드되어* 클래스/싱글톤이 2개 존재 → `+load`가 두 번 불리고 `dispatch_once` 기반 싱글톤이 둘로 갈라진다. CocoaPods에서 흔히 발생.
- **Q. dynamic framework를 static으로 바꾸면 자동으로 빨라지나?**
  pre-main은 줄지만, App Extension과 공유하는 코드는 *복제*되므로 총 다운로드/메모리는 증가. 측정 후 결정.
- **Q. `dlopen`은 iOS에서 쓸 수 있나?**
  앱 번들 내부의 dylib·framework에 한해 가능. 시스템 외부 경로는 codesign 제약으로 불가.
- **Q. `@rpath`, `@executable_path`, `@loader_path` 차이?**
  `@rpath`는 호스트가 `LC_RPATH`로 지정한 탐색 경로 집합. `@executable_path`는 메인 실행 파일 기준. `@loader_path`는 *이 dylib을 로드한 모듈* 기준. embedded framework는 보통 `@rpath/Foo.framework/Foo` + `LC_RPATH @executable_path/Frameworks`.
- **Q. App Store는 어떻게 검사하나?**
  앱 바이너리와 `Frameworks/` 내 모든 dylib이 codesign 되어 있어야 하며, `Frameworks/` 외부 dylib 로드는 거부된다.

## 참고

- WWDC19 *Optimizing App Launch* (Session 423)
- WWDC22 *Link fast: Improve build and launch times* (Session 110362)
- WWDC23 *Meet mergeable libraries* (Session 10268)
- Apple Docs: *Dynamic Library Programming Topics* (archived)
- `man ld`, `man dyld`, `man ar`
