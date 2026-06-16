# Linker(ld)와 dyld

> 한 줄 요약 — `ld`는 *빌드 타임에* `.o`/`.dylib`을 묶어 Mach-O를 만들고, `dyld`는 *런치 타임에* 그 Mach-O와 의존 dylib을 메모리에 매핑·연결한다. 둘은 같은 "링크"라는 단어를 쓰지만 *시점과 역할*이 다르다.

대상: dyld 3(iOS 13+) closure cache, dyld 4(iOS 16+) chained fixups 기준.

## 핵심 개념

- **ld (정적 링커)**: Xcode 15부터 `ld_prime`(Apple의 새 링커)이 기본. 입력은 `.o`, `.a`, `.dylib`, `.tbd`. 출력은 단일 Mach-O.
- **dyld (동적 링커/로더)**: `/usr/lib/dyld`. 커널이 exec 시 가장 먼저 실행하는 사용자 프로그램. 메인 바이너리와 의존 dylib을 매핑하고 `main()`을 호출.
- **rebase**: ASLR(주소 무작위화)로 인해 빌드 타임 주소가 어긋남 → `__DATA`의 내부 포인터를 슬라이드 값만큼 보정.
- **bind**: 외부 dylib의 심볼 주소를 GOT(`__got`)에 채워 넣음.
- **lazy bind (legacy)**: 함수 첫 호출 시점에 stub를 통해 dyld가 주소 해결. dyld 3+에선 chained fixups로 대체되며 lazy 비중 감소.
- **dyld shared cache**: 시스템 dylib 수천 개를 미리 prebind·결합한 *단일* 매핑 파일(`/System/Library/dyld/dyld_shared_cache_*`). 모든 프로세스가 공유.

## ld의 역할 (빌드 타임)

1. **심볼 수집**: 입력 `.o`들의 `__LINKEDIT` 심볼 테이블을 전부 읽어 *글로벌 심볼 그래프* 작성.
2. **resolution**: undefined → defined 매칭. `.a`에선 *필요한 `.o`만* 추출. `.dylib`에선 심볼 *존재 여부만* 확인하고 `LC_LOAD_DYLIB` 기록.
3. **dead-code stripping** (`-dead_strip`): 도달 불가 함수/데이터 제거. Swift는 모듈 단위 `-whole-module-optimization` + `internal/private` 가시성과 결합되어 효과적.
4. **Section 배치**: `__TEXT`/`__DATA`/`__DATA_CONST` 별로 모아 페이지 정렬.
5. **fixup 정보 생성**: dyld가 런타임에 적용할 rebase/bind 목록을 `__LINKEDIT`에 작성 (chained fixups 포맷).
6. **codesign 자리 확보** → `codesign`이 이어서 서명 삽입.

## dyld의 실행 흐름 (런치 타임)

```
exec() → 커널이 dyld 매핑 → dyld가:
  1. main executable 분석 (LC_LOAD_DYLIB 추출)
  2. 의존 dylib 재귀 로드
       → dyld shared cache hit → 매핑만
       → 아니면 파일 열고 mmap
  3. 모든 이미지에 대해 fixups 적용 (rebase + bind)
  4. __DATA_CONST를 mprotect로 read-only 전환
  5. ObjC 런타임 초기화 (class realize, +load)
  6. C++ static initializer, Swift static let 등 실행
  7. LC_MAIN의 main() 호출 → 우리 코드 시작
```

이 1~6 단계가 *pre-main 시간*. WWDC19/22 권고: 400ms 이하 목표.

## dyld 세대별 차이

| 세대 | OS | 핵심 변화 |
|---|---|---|
| dyld 2 | ~iOS 12 | 매 launch마다 의존성 그래프 새로 계산. lazy bind 다용 |
| dyld 3 | iOS 13+ | *launch closure* 캐싱. 인자/환경이 같으면 그래프를 디스크에서 재사용 → cold launch 가속 |
| dyld 4 | iOS 16+ | *chained fixups* 기본화, dyld 자체가 shared cache 일부로 포함. bind 비용 ↓ |

## Chained Fixups

기존: rebase 리스트 + bind 리스트 *두 개*를 dyld가 순회 → 페이지를 dirty로 만들고 디스크 I/O 유발.

Chained fixups: `__DATA`의 *포인터 자체* 안에 "다음 fixup의 오프셋"을 인코딩 → 페이지를 따라가며 *한 패스*에 처리. `__LINKEDIT` 크기 ↓, 페이지 dirty ↓.

```shell
# fixup 정보 확인 (Xcode 14+)
dyld_info -fixups MyApp.app/MyApp | head
```

## 코드 예시 (측정과 디버깅)

```shell
# pre-main 단계별 시간
DYLD_PRINT_STATISTICS=1 ./MyApp                # 요약
DYLD_PRINT_STATISTICS_DETAILS=1 ./MyApp        # dylib별

# 어떤 dylib을 어떤 순서로 로드했는지
DYLD_PRINT_LIBRARIES=1 ./MyApp

# 환경 변수 적용은 Xcode Scheme → Arguments → Env Vars
```

```shell
# 링커 옵션 예
# Other Linker Flags
-dead_strip                  # 미사용 코드 제거
-Wl,-no_compact_unwind       # 디버깅 시
-Wl,-map,$(TARGET_TEMP_DIR)/$(PRODUCT_NAME)-LinkMap.txt   # 링크 맵 (어떤 .o가 얼마나 차지)
```

```shell
# 시스템 dyld shared cache 들여다보기
dyld_shared_cache_util -list /System/Library/dyld/dyld_shared_cache_arm64e
```

## ld와 dyld의 책임 비교

| 항목 | ld (정적) | dyld (동적) |
|---|---|---|
| 시점 | 빌드 타임 | 프로세스 시작 / dlopen |
| 입력 | `.o`, `.a`, `.dylib`, `.tbd` | Mach-O + 의존 dylib |
| 심볼 해결 | 전역적, 완결 | 로드된 이미지 집합 내 |
| ASLR 대응 | 자리만 비워둠 | rebase로 실제 주소 보정 |
| 실패 시점 | 빌드 실패 ("undefined symbol") | 런치 크래시 ("Symbol not found") |

## 흔한 함정 / Follow-up

- **Q. "Undefined symbols for architecture arm64"는 누구의 메시지?**
  `ld`. 해당 심볼을 제공하는 `.o`/라이브러리가 링크 명령에 빠졌거나, C++ name mangling/Swift module 불일치.
- **Q. "dyld: Symbol not found"가 런치 직후 뜨는 이유?**
  빌드 시 본 SDK의 dylib과 *실행 디바이스*의 dylib 버전이 달라 심볼이 없을 때. `-weak_framework` 또는 `@available`로 가드 필요.
- **Q. `+load`와 `+initialize`의 비용 차이?**
  `+load`는 dyld 단계에서 *모든* 클래스에 대해 호출 → pre-main에 큰 영향. `+initialize`는 *첫 메시지 전송 시* lazy 호출. 가능하면 `+initialize` 또는 dispatch_once 사용.
- **Q. dyld closure가 무효화되는 조건?**
  앱 업데이트, OS 업데이트, 의존 dylib 변경. 첫 실행에서 closure를 새로 만들고 두 번째 실행부터 가속.
- **Q. interposing이 가능한가?**
  `DYLD_INSERT_LIBRARIES`로 가능하지만 iOS에선 Hardened Runtime/Entitlement 제약으로 자체 앱에 한정. App Store 배포 시엔 거부됨.

## 참고

- WWDC22 *Link fast: Improve build and launch times* (Session 110362)
- WWDC19 *Optimizing App Launch* (Session 423)
- WWDC17 *App Startup Time: Past, Present, and Future* (Session 413)
- Apple Open Source: `dyld`, `ld64`/`ld_prime`
- `man dyld`, `man ld`, `man dyld_info`
