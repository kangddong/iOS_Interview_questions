# Process vs Thread

> 한 줄 요약 — 프로세스는 **독립된 메모리 공간을 가진 실행 단위**, 스레드는 **같은 프로세스 안에서 메모리를 공유하는 실행 흐름**. 컨텍스트 스위치 비용과 격리 수준이 다르다.

## 비교

| 구분 | Process | Thread |
|---|---|---|
| 메모리 공간 | 독립 (가상 주소 공간) | 같은 프로세스 안에서 *공유* |
| 통신 | IPC 필요 (pipe, socket, shared memory) | 메모리 공유 + 동기화 |
| 컨텍스트 스위치 | 비쌈 (page table, TLB flush) | 쌈 |
| 격리 | 한 프로세스 죽어도 다른 프로세스 영향 X | 한 스레드 크래시 = 프로세스 전체 죽음 |
| 생성 비용 | 큼 (fork) | 작음 |
| 통신 복잡도 | 높음 | 낮음 (단, 동기화 부담) |

## 메모리 구조 (한 프로세스)

```
+---------------------+ 0xFFFF...
|   Stack (스레드별)   |  ← 함수 호출 프레임, 지역 변수
|         ↓           |
|                     |
|         ↑           |
|   Heap              |  ← malloc/new로 동적 할당
|---------------------|
|   Data (BSS, data)  |  ← 전역/static 변수
|---------------------|
|   Text (code)       |  ← 실행 코드
+---------------------+ 0x0000...
```

스레드마다 *Stack은 별도*, Heap/Data/Text는 공유.

## 컨텍스트 스위치

CPU가 한 실행 단위에서 다른 단위로 전환할 때 *레지스터/PC/SP* 등을 저장/복원.

| | 비용 |
|---|---|
| Thread → Thread (같은 프로세스) | 레지스터 + 스레드 로컬만 |
| Process → Process | + page table 교체 + TLB flush + 캐시 무효화 |
| Mode switch (User → Kernel) | 시스템콜 시. context switch는 아님 |

빈번한 context switch는 *유효 CPU 시간*을 갉아먹는다.

## iOS / 모바일 컨텍스트

- iOS 앱 = *하나의 프로세스* (대부분). 익스텐션은 별도 프로세스.
- 우리가 "GCD/스레드"라고 부르는 건 모두 *프로세스 안의 스레드*.
- 시스템이 만든 **Render Server**는 별도 프로세스 — IPC로 layer 트리 전달.
- 앱과 익스텐션은 IPC + App Group으로 데이터 공유.

## 멀티프로세스가 필요한 케이스

- 보안 격리 (샌드박스).
- 한 모듈이 죽어도 전체 앱이 죽으면 안 될 때 (브라우저 탭 분리).
- iOS는 보통 백그라운드 작업도 *같은 프로세스 안*에서 GCD/Task로 처리. 시스템이 분리한 것만 별도.

## 스레드 풀 / Worker Thread

매 요청마다 스레드 만들면 비싸기 때문에 *미리 만들어 둔 풀*에서 꺼내 씀. iOS의 GCD가 내부적으로 그렇게 동작.

```swift
DispatchQueue.global(qos: .userInitiated).async { ... }
```

작업이 들어가면 시스템이 적절한 스레드를 *재활용*. 사용자가 스레드 개수를 직접 지정하지 않음.

## 동기화 — 공유 메모리 비용

스레드끼리 *같은 변수*를 동시에 읽고 쓰면 *데이터 레이스*. 결과가 비결정적 → 가끔 크래시.

```swift
var counter = 0
DispatchQueue.concurrentPerform(iterations: 1000) { _ in
    counter += 1   // ❌ 데이터 레이스
}
print(counter)    // 1000이 아닐 수 있음
```

해결: lock / actor / 직렬 큐 등.

→ [concurrency-primitives.md](concurrency-primitives.md)

## 흔한 함정 / Follow-up

- **Q. 스레드가 많을수록 빠른가?**
  CPU 코어 수보다 많아지면 *context switch 오버헤드*가 이득을 잡아먹음. 일반적으로 *코어 수 + 약간*이 적정. GCD는 자동 조절.

- **Q. iOS에서 스레드를 직접 만드는가?**
  거의 없음. `Thread`/`pthread_create` 직접 사용 시 RunLoop, 스택 크기 등 직접 관리해야 → GCD/async 권장.

- **Q. 한 스레드 크래시가 앱 전체를 죽이는 이유?**
  같은 프로세스 메모리 공간 안에서 일어난 segfault/abort는 프로세스 시그널로 전파. OS가 프로세스 자체를 종료.

- **Q. iOS 익스텐션이 별도 프로세스인 이유?**
  보안/안정성. 익스텐션이 크래시해도 호스트 앱은 정상. 메모리 한도도 따로 (보통 매우 작음).

- **Q. user space vs kernel space?**
  CPU 권한 레벨. 일반 코드는 user space, 시스템콜로 kernel space 진입. 메모리도 분리. iOS는 우리가 user space 코드만 작성.

## 참고

- Operating System Concepts (Silberschatz)
- WWDC 2018: iOS Memory Deep Dive
- Apple Docs: Threading Programming Guide (legacy)
