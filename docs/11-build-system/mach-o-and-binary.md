# Mach-O와 바이너리 구조

> 한 줄 요약 — Mach-O는 macOS/iOS의 실행 파일·라이브러리·dylib·번들이 공유하는 표준 바이너리 포맷이며, dyld가 이 파일을 읽어 코드/데이터를 메모리에 매핑하기 위해 존재한다.

대상: macOS / iOS / iPadOS / tvOS / watchOS / visionOS 전 플랫폼. (Apple 플랫폼의 모든 실행 가능한 산출물)

## 핵심 개념

- **Mach-O (Mach Object)**: Apple 플랫폼의 네이티브 바이너리 포맷. `executable`, `dylib`, `bundle`, `object(.o)`, `dSYM` 모두 동일한 헤더 구조를 사용한다.
- **3계층 구조**: `Header → Load Commands → Segments(=Sections)`.
- **Segment**: 가상 메모리에 매핑되는 단위. 페이지(16KB on arm64) 정렬. 예: `__TEXT`, `__DATA`, `__DATA_CONST`, `__LINKEDIT`.
- **Section**: Segment 내부의 논리적 영역. `__TEXT,__text`(코드), `__TEXT,__cstring`(문자열 리터럴) 등.
- **Load Command**: dyld에게 "어떻게 로드할지"를 알려주는 지시문. `LC_SEGMENT_64`, `LC_LOAD_DYLIB`, `LC_MAIN`, `LC_CODE_SIGNATURE`, `LC_DYLD_CHAINED_FIXUPS` 등.
- **Fat / Universal Binary**: 여러 아키텍처(arm64, x86_64, arm64e)를 하나의 파일에 묶은 형태. 헤더 앞에 `FAT_MAGIC`이 붙는다.

## 주요 Segment / Section

| Segment | 권한 | 대표 Section | 역할 |
|---|---|---|---|
| `__TEXT` | r-x | `__text`, `__stubs`, `__cstring`, `__objc_methname` | 실행 코드, 읽기 전용 데이터. 페이지 공유 가능 |
| `__DATA` | rw- | `__data`, `__bss`, `__common` | 쓰기 가능한 전역/정적 변수 |
| `__DATA_CONST` | r-- (런타임 sealed) | `__got`, `__const`, `__objc_classlist` | dyld 바인딩 후 read-only로 mprotect. iOS 9+ |
| `__LINKEDIT` | r-- | symbol table, string table, chained fixups, code signature | dyld·codesign 전용 메타데이터. 끝부분에 위치 |
| `__OBJC` (legacy) | — | — | 구버전 Objective-C 메타. 현재는 `__DATA`/`__DATA_CONST`로 분산 |

## dyld가 Mach-O에서 읽는 것

1. **Header**: magic(`MH_MAGIC_64`), cputype, filetype(`MH_EXECUTE`/`MH_DYLIB`).
2. **Load Commands 순회**:
   - `LC_SEGMENT_64` → 가상 메모리에 mmap.
   - `LC_LOAD_DYLIB` → 의존 dylib 경로(`/usr/lib/libSystem.B.dylib` 등)를 재귀적으로 로드.
   - `LC_DYLD_CHAINED_FIXUPS` (iOS 13.4+) → rebase/bind를 압축한 chained fixup 정보.
   - `LC_MAIN` → 진입점(`_main`) 오프셋.
   - `LC_CODE_SIGNATURE` → 코드 서명 검증.
3. **`__LINKEDIT` 파싱**: 심볼 테이블, 외부 심볼 바인딩 대상.

## 코드 예시 (확인 명령)

```shell
# 헤더 + 모든 load command
otool -l MyApp.app/MyApp | less

# 의존 dylib 목록
otool -L MyApp.app/MyApp

# Segment 크기 한눈에
size -m -l -x MyApp.app/MyApp

# 아키텍처 (fat binary 분해)
lipo -info MyApp.app/MyApp
lipo -thin arm64 MyApp -output MyApp.arm64

# 심볼
nm -gU MyApp.app/MyApp        # 외부로 노출된 심볼만
dyld_info -fixups MyApp       # chained fixups (Xcode 14+)
```

```shell
# Mach-O 첫 4바이트로 종류 판별
# CF FA ED FE  → MH_MAGIC_64 (little endian, 64bit)
# CA FE BA BE  → FAT_MAGIC
xxd MyApp | head -1
```

## App Store 제출 시 변환

- 빌드 산출물은 fat binary지만, App Store는 *Thinning*을 거쳐 디바이스별 단일 아키텍처 Mach-O로 다운로드시킨다.
- Bitcode는 Xcode 14에서 deprecated, iOS 17 SDK부터 제거됨. 현재 App Store 제출은 *컴파일된 Mach-O* 그대로.

## 흔한 함정 / Follow-up

- **Q. `__TEXT`와 `__DATA_CONST`의 차이는?**
  `__TEXT`는 빌드 타임에 read-only로 결정되어 페이지를 *모든 프로세스 간 공유*할 수 있다. `__DATA_CONST`는 dyld가 바인딩(주소 채우기)을 끝낸 *뒤* `mprotect`로 read-only로 만든다. 둘 다 ROP 공격 방지에 기여.
- **Q. 바이너리 크기를 줄이려면 어디를 봐야 하나?**
  `size -m`으로 `__TEXT`(코드), `__cstring`(문자열), `__objc_classname`(클래스명) 비중을 본다. Swift는 generic specialization과 reflection metadata(`__swift5_types`) 때문에 Objective-C보다 큰 경우가 많다.
- **Q. App launch 시간이 Mach-O 구조와 어떻게 연결되나?**
  load command 수, 의존 dylib 수, `__DATA` rebase/bind 양이 늘면 dyld의 pre-main 시간이 증가한다. WWDC22 "Link fast" 참고.
- **Q. dyld 4(iOS 16+)에서 바뀐 점?**
  Chained fixups 포맷이 기본화되어 `LC_DYLD_INFO_ONLY` 대신 `LC_DYLD_CHAINED_FIXUPS` 사용. 바인딩 작업이 페이지 단위로 압축되어 launch 비용 감소.

## 참고

- Apple Open Source: `dyld` ([github.com/apple-oss-distributions/dyld](https://github.com/apple-oss-distributions/dyld))
- Apple Docs: *Overview of the Mach-O Executable Format* (Mach-O Programming Topics, archived)
- WWDC22 *Link fast: Improve build and launch times* (Session 110362)
- WWDC22 *App Store Connect — Thinning*
- `man otool`, `man dyld_info`, `man lipo`
