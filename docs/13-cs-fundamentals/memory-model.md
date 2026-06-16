# 메모리 모델 (가상 메모리, 페이징, 캐시)

> 한 줄 요약 — 모든 프로세스는 **자기만의 가상 주소 공간**을 보고, OS가 *페이지 단위*로 물리 메모리에 매핑한다. CPU 캐시(L1/L2/L3)는 *공간/시간 지역성*에 따라 성능을 결정하며, iOS는 *jetsam*으로 메모리 압박 대응.

## 가상 메모리

```
   Process A의 가상 주소           Page Table              물리 메모리(RAM)
   0x0000_1000 ─────────────────→  page 1 ──→  Frame 5
   0x0000_2000 ─────────────────→  page 2 ──→  Frame 13
   0x0000_3000 ─────────────────→  page 3 ──→  (Disk/Swap)
```

- 프로세스가 보는 주소 = *가상 주소*. CPU의 MMU가 페이지 테이블을 통해 물리 주소로 변환.
- 페이지 크기: iOS 4KB / 16KB (디바이스에 따라).
- 큰 가상 공간을 쓰면 일부는 RAM, 일부는 *swap*(디스크)에 — iOS는 swap이 사실상 없고, 대신 메모리 압박 시 jetsam.

## TLB (Translation Lookaside Buffer)

페이지 테이블 조회 캐시. *최근 쓴 가상→물리 매핑*을 빠르게. context switch 시 *flush*되어 비싸짐 (그래서 process switch가 thread switch보다 비쌈).

## CPU 캐시 — 시간/공간 지역성

```
CPU ↔ L1 (32KB, ns) ↔ L2 (수백KB, 수 ns) ↔ L3 (수MB, 십 ns) ↔ RAM (수십 ns) ↔ Disk (ms)
```

캐시 hit/miss가 성능에 직격. *지역성* 두 가지:

- **시간 지역성**: 최근 접근한 데이터를 *곧 다시 접근*.
- **공간 지역성**: 인접한 메모리를 *함께 접근*.

배열을 순서대로 순회 = 공간 지역성 활용. 링크드 리스트 = 메모리가 흩어져 캐시 미스 다발 → 실제로 배열보다 훨씬 느린 경우 많다.

## False Sharing

서로 다른 스레드가 *같은 캐시 라인* 안의 *다른 변수*를 동시에 변경하면, 캐시가 무효화되어 성능 폭락. 64바이트(보통 캐시 라인) 정렬로 분리.

iOS 일반 앱에서 직면하기는 드물지만, 동시 카운터 등 핫 패스에서 의심.

## 메모리 압박 — iOS의 jetsam

iOS는 swap이 사실상 없고, 메모리가 부족하면 **저우선 프로세스를 종료**(jetsam):

| 우선순위 | 종류 |
|---|---|
| 가장 먼저 종료 | 백그라운드 앱 |
| 다음 | 아이들 백그라운드 작업 |
| 마지막 | 포그라운드 앱 |

앱이 받는 신호:
- `applicationDidReceiveMemoryWarning(_:)`
- `UIApplication.didReceiveMemoryWarningNotification`

이 신호가 오면 캐시 정리 / 큰 이미지 release.

## Memory Mapped Files (`mmap`)

파일을 *메모리에 매핑*해서 read/write를 메모리 접근처럼. 큰 파일을 효율적으로 처리.

iOS에서 `Data(contentsOf:options: .mappedIfSafe)` — 큰 JSON/이미지를 mmap으로 읽으면 메모리 부담 적음.

## Stack 크기

iOS 메인 스레드 stack: 보통 1MB. 워커 스레드: 512KB.
재귀 깊이가 너무 깊거나 큰 지역 배열을 만들면 *stack overflow* 크래시.

## 흔한 함정 / Follow-up

- **Q. iOS에서 swap이 없으면 메모리 부족 시?**
  jetsam으로 백그라운드 앱부터 종료. 포그라운드 앱도 한도 초과 시 강제 종료 (`MEMORY_RESOURCE_EXCEPTION`).

- **Q. 메모리 사용량이 100MB라면?**
  resident vs virtual을 구분. *resident*가 실제 RAM 점유. iOS Memory Report와 Instruments로 확인.

- **Q. 큰 이미지 표시 시 메모리 폭증?**
  *디코드 후 비트맵 크기*가 핵심: width × height × 4 bytes. 8000x8000 = 약 256MB. Downsampling 필수.

- **Q. 캐시 친화적 코드?**
  *연속 메모리* 배열 사용, struct of arrays(SoA) vs array of structs(AoS) 선택, 핫 데이터를 작게.

- **Q. iOS 디바이스 RAM은?**
  iPhone 모델별 2~8GB 정도. 실제 앱에 허용되는 메모리는 그보다 훨씬 작음 (50% 정도가 임계점).

## 참고

- Operating System Concepts
- WWDC 2018: iOS Memory Deep Dive
- WWDC 2022: Track down hangs / Optimize memory usage
