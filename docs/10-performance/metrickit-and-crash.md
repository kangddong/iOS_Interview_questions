# MetricKit / Crash Symbolication / Binary Size

> 한 줄 요약 — *실제 사용자 디바이스*에서 일어난 hang/launch/energy/crash를 수집하는 **MetricKit**, 크래시 로그를 사람이 읽을 수 있게 만드는 **Symbolication(dSYM)**, 앱 사이즈를 줄이는 기본 노하우.

도입 버전: MetricKit iOS 13+, on-device hang detection iOS 16+.

## MetricKit

```swift
import MetricKit

final class MetricObserver: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXMetricPayload]) {
        for p in payloads {
            log(p.applicationLaunchMetrics?.timeToFirstFrameHistogram)
            log(p.cpuMetrics)
            log(p.memoryMetrics?.peakMemoryUsage)
        }
    }
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for p in payloads {
            for hang in p.hangDiagnostics ?? [] { upload(hang.jsonRepresentation()) }
            for crash in p.crashDiagnostics ?? [] { upload(crash.jsonRepresentation()) }
        }
    }
}

MXMetricManager.shared.add(MetricObserver())
```

- 시스템이 *24시간마다* metric/진단 payload 전달.
- crash, hang, disk write, CPU 과사용 등 자동 수집.
- 앱 코드가 별도 SDK 없이 JSON으로 받아 분석 서버로 업로드.

Crashlytics/Sentry 같은 SDK들도 상당 부분 MetricKit 기반.

## Crash 분석 — Symbolication

크래시 로그는 *주소 + 라이브러리 이름*만 있는 상태. 디버깅하려면 *함수 이름/줄 번호*로 변환 필요.

### dSYM이란

빌드 시 분리되는 *디버그 심볼* 번들. Release 빌드에서 바이너리는 strip되어 작아지고, 심볼은 dSYM에.

`Build Settings`:
- `Debug Information Format = DWARF with dSYM File` (Release 기본)
- `Strip Debug Symbols = Yes` (Release)

### 보관 정책

- **Archive에 자동 포함** (Xcode Organizer).
- App Store에 업로드 시 함께 첨부 (또는 ASC에서 추후 다운로드).
- Bitcode 시절에는 Apple이 재컴파일하는 dSYM이 따로 생성됨 (현재 Bitcode deprecated).
- Crashlytics/Sentry는 dSYM 자동 업로드 스크립트 제공.

### 절차

1. 크래시 로그 (`.crash` / `.ips`) 확보.
2. `symbolicatecrash` 또는 Xcode Organizer → Crashes에 드래그.
3. 함수/파일/줄 번호 표시.

`atos` 명령으로 단일 주소 풀이도 가능:

```bash
atos -arch arm64 -o MyApp.app.dSYM/Contents/Resources/DWARF/MyApp -l 0x100000000 0x10001a4f8
```

## 흔한 크래시 분류

| 종류 | 신호 |
|---|---|
| `EXC_BAD_ACCESS` | dangling/nil 참조, ARC 정정 실패 |
| `SIGABRT` | 명시적 abort (예: `fatalError`, `assert`) |
| `0xbaaaaaad` | watchdog (메인 스레드 응답 없음 → 강제 종료) |
| `0x8badf00d` | 시작 시간 초과 |
| `0xdeadfa11` | 사용자가 Force Quit |

코드 5xxx의 신호 코드도 의미 있음 (M1 환경 등).

## Binary Size 줄이기

### 측정
- Xcode Organizer → App Size Report. 기능별 사이즈 분포.
- App Thinning으로 디바이스 별 다운로드 크기 다름.

### 대응

| 항목 | 효과 |
|---|---|
| `DEAD_CODE_STRIPPING = YES` | 사용 안 한 심볼 제거 |
| `STRIP_INSTALLED_PRODUCT = YES` (Release) | 심볼 분리 |
| 동적 → 정적 링크 (적절히) | dylib 메타 줄임 |
| 큰 리소스 압축 (이미지, 폰트) | Asset 압축, vector 변환 |
| 사용 안 한 라이브러리 제거 | 큰 영향 |
| Asset Catalog 활용 | App Thinning 자동 |
| Vector PDF/Symbol Image | 다중 해상도 1세트 |

### Bitcode (deprecated)

iOS 14까지 Apple이 *서버에서 재컴파일* 가능하도록 Intermediate Representation 포함. iOS 14+ App Store는 더 이상 요구하지 않음. 신규 프로젝트는 무관.

## 흔한 함정 / Follow-up

- **Q. 크래시가 일부 사용자에게만 일어남.**
  iOS 버전, 디바이스, 언어, 메모리 압박 등 환경 변수. MetricKit이 디바이스 메타도 함께 줌. *언제 어디서*가 패턴화되면 원인 단서.

- **Q. Watchdog 크래시 (`0xbaaaaaad`)?**
  앱이 시작/포그라운드 진입 시 *제한 시간 내 응답 못 함*. 보통 메인 스레드 막힘. 시작 작업 lazy화.

- **Q. dSYM 잃어버렸다.**
  App Store Connect에서 *기존 빌드 dSYM 다운로드* 가능. 못 찾으면 그 빌드의 크래시는 영원히 unsymbolicated.

- **Q. Symbolicate가 일부만 됨.**
  앱 코드는 OK인데 *system framework 심볼*이 없는 경우 → 디바이스의 Symbols 누락. Xcode에 디바이스 연결 후 *Devices and Simulators*에서 자동 동기화.

- **Q. 메모리 폭증 추적?**
  MetricKit memory metrics + Instruments Allocations + Memory Graph. *peak* 확인 후 어떤 객체가 미해제인지 그래프로.

- **Q. 큰 앱 다운로드 사이즈가 100MB+ 면?**
  App Thinning으로 디바이스별 사이즈는 작을 수 있음. 그래도 Wi-Fi 외 다운로드 제한 (200MB → 일부 설정으로 늘릴 수 있지만 사용자 경험 영향).

## 참고

- WWDC 2019: Improving Battery Life and Performance (MetricKit)
- WWDC 2022: Track down hangs with Xcode and on-device detection
- Apple Docs: Analyzing Crash Reports
