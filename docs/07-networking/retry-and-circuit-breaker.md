# Retry & Circuit Breaker

> 한 줄 요약 — 일시적 장애는 *지능적으로 재시도*하고, 지속적 장애는 *빠르게 끊어* 시스템 전체가 폭주(thundering herd)하지 않도록 격리하기 위해 존재한다.

관련 RFC: RFC 9110 §9 (Method idempotency), RFC 7231 §6.6 (5xx), RFC 6585 (429), `Retry-After` 헤더
도입 패턴: Netflix Hystrix, Polly, Alamofire `RequestRetrier`

## 핵심 개념

- **Transient vs Permanent error**: 5xx, 408, 429, 네트워크 끊김은 transient → 재시도 가치 있음. 400, 401(이건 refresh), 403, 404, 422는 재시도해도 동일 결과.
- **Exponential Backoff**: 지수적으로 간격 증가 — `base * 2^attempt`. 서버 회복 시간을 주고 동시 재시도로 인한 *재폭주* 방지.
- **Jitter**: 모든 클라이언트가 *동일한 시점에 재시도*하면 retry storm. 무작위 흔들기로 분산. **Full Jitter**: `rand(0, base * 2^attempt)`가 AWS 실험에서 가장 우수.
- **멱등성(Idempotency)**: *같은 요청을 N번 보내도 결과가 동일*. GET/PUT/DELETE는 정의상 멱등, POST는 아님. **POST를 재시도하려면 Idempotency-Key 필수**.
- **Idempotency-Key**: 클라이언트가 생성하는 UUID. 서버는 키별로 응답을 *캐싱*해 중복 요청에 같은 응답을 돌려줌(결제·송금 패턴 — Stripe).
- **Circuit Breaker**: 연속 실패 시 회로를 *열어(open)* 후속 요청을 즉시 실패시킴. 일정 시간 후 *half-open*에서 시험 호출로 회복 판정.

## Backoff + Jitter 비교

```
attempt:    1     2     3     4
base = 0.5s

No jitter:        0.5,  1.0,  2.0,  4.0   ← 동기화된 재시도 → 서버 폭격
Equal jitter:     0.25+rand(0..0.25), ...  ← 절반은 고정, 절반은 무작위
Full jitter:      rand(0..0.5), rand(0..1), rand(0..2), rand(0..4)  ← 권장
Decorrelated:     min(cap, rand(base, prev*3))
```

## Circuit Breaker 상태 머신

```
              connection ok N회 연속
       ┌──────────────────────────────┐
       ▼                              │
   ┌────────┐  연속 실패 ≥ threshold ┌────────┐
   │ CLOSED │ ───────────────────► │  OPEN  │
   └────────┘                       └────────┘
       ▲                              │ cool-down 타임아웃
       │ 성공                          ▼
       │                          ┌──────────┐
       └────────────────────────  │HALF-OPEN │
              실패 → OPEN 복귀     └──────────┘
                                   (시험 호출 1건만 허용)
```

- **CLOSED**: 정상. 모든 요청 통과. 실패 카운트만 증가.
- **OPEN**: 즉시 `CircuitOpenError` throw. **네트워크 호출 자체를 하지 않음** → 빠른 실패로 UI 응답성 보존, 서버 회복 시간 확보.
- **HALF-OPEN**: 쿨다운 후 1건만 통과시켜 회복 여부 판정. 성공이면 CLOSED, 실패면 OPEN 복귀(쿨다운 재설정).

## 코드 예시

```swift
// 1. Backoff 정책
struct BackoffPolicy {
    let base: Duration = .milliseconds(500)
    let cap: Duration = .seconds(30)
    let maxAttempts: Int = 4

    func delay(forAttempt n: Int, retryAfter: TimeInterval?) -> Duration {
        if let ra = retryAfter { return .seconds(ra) }       // 서버 지시 우선
        let exp = min(cap.seconds, base.seconds * pow(2, Double(n)))
        let jittered = Double.random(in: 0...exp)             // full jitter
        return .seconds(jittered)
    }
}

// 2. Retry 결정 — 멱등성 + 상태코드 기반
func shouldRetry(_ request: URLRequest, response: HTTPURLResponse?, error: Error?) -> Bool {
    if let err = error as? URLError {
        // 네트워크 끊김류만 재시도
        return [.timedOut, .networkConnectionLost, .notConnectedToInternet,
                .cannotConnectToHost, .dnsLookupFailed].contains(err.code)
    }
    guard let resp = response else { return false }
    switch resp.statusCode {
    case 408, 429: return true                                // 무조건 가능
    case 500...599 where resp.statusCode != 501: return isIdempotent(request)
    default: return false
    }
}

func isIdempotent(_ req: URLRequest) -> Bool {
    let method = req.httpMethod ?? "GET"
    if ["GET", "HEAD", "PUT", "DELETE", "OPTIONS"].contains(method) { return true }
    return req.value(forHTTPHeaderField: "Idempotency-Key") != nil
}

// 3. Circuit Breaker (actor — 상태 동시성 안전)
actor CircuitBreaker {
    enum State { case closed, open(until: ContinuousClock.Instant), halfOpen }
    private var state: State = .closed
    private var consecutiveFailures = 0
    private let threshold = 5
    private let cooldown: Duration = .seconds(20)

    func canPass() -> Bool {
        switch state {
        case .closed, .halfOpen: return true
        case .open(let until):
            if ContinuousClock.now >= until { state = .halfOpen; return true }
            return false
        }
    }

    func recordSuccess() { consecutiveFailures = 0; state = .closed }

    func recordFailure() {
        consecutiveFailures += 1
        if consecutiveFailures >= threshold || (if case .halfOpen = state { true } else { false }) {
            state = .open(until: ContinuousClock.now.advanced(by: cooldown))
        }
    }
}

// 4. 통합
func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
    guard await breaker.canPass() else { throw NetError.circuitOpen }
    var attempt = 0
    while true {
        do {
            let (data, resp) = try await session.data(for: request)
            let http = resp as! HTTPURLResponse
            if (200..<300).contains(http.statusCode) {
                await breaker.recordSuccess()
                return (data, http)
            }
            if attempt < policy.maxAttempts, shouldRetry(request, response: http, error: nil) {
                let ra = http.value(forHTTPHeaderField: "Retry-After").flatMap(TimeInterval.init)
                try await Task.sleep(for: policy.delay(forAttempt: attempt, retryAfter: ra))
                attempt += 1
                continue
            }
            await breaker.recordFailure()
            throw NetError.http(http.statusCode)
        } catch {
            if attempt < policy.maxAttempts, shouldRetry(request, response: nil, error: error) {
                try await Task.sleep(for: policy.delay(forAttempt: attempt, retryAfter: nil))
                attempt += 1
                continue
            }
            await breaker.recordFailure()
            throw error
        }
    }
}
```

## 비교

| 구분 | Retry | Circuit Breaker |
|---|---|---|
| 목적 | *일시적* 장애 극복 | *지속적* 장애 격리 |
| 동작 단위 | 단일 요청 | 호스트/엔드포인트 단위 |
| 비용 | 지연 증가, 서버 부하 ↑ | 사용자 fail-fast (의도된 실패) |
| 함께 쓰는가 | **반드시 결합** — retry가 무한히 시도하지 않도록 breaker가 상한 역할 |

| 메서드 | 멱등 | 재시도 안전 | 비고 |
|---|---|---|---|
| GET | ✓ | 안전 | 캐시 우회 주의 |
| HEAD | ✓ | 안전 | |
| PUT | ✓ | 안전 | 전체 교체이므로 |
| DELETE | ✓ | 안전 | 두 번째는 404일 수 있음 |
| POST | ✗ | **Idempotency-Key 필요** | 결제/주문 시 필수 |
| PATCH | ✗ (보통) | 키 필요 | 부분 수정이라 멱등 보장 안 됨 |

## 흔한 함정 / Follow-up

- **Q. 429를 받았을 때?**
  `Retry-After` 헤더(초 또는 HTTP date)를 *우선* 따른다. 무시하고 backoff하면 서버가 더 화남. `Retry-After`가 없으면 정책상 cap을 늘려 보수적으로.
- **Q. POST 재시도 시 결제 이중 청구?**
  Idempotency-Key 없이 POST 재시도는 **금지**. 결제·송금·예약 같은 부수효과 있는 API는 클라이언트가 UUID를 생성·저장하고 *모든 재시도에 동일 키* 사용. 서버는 키별 응답을 24시간 캐싱.
- **Q. Retry storm을 어떻게 알아채나?**
  서버 메트릭에서 50x 비율과 동시에 *지수적으로 증가하는 요청 RPS* 패턴. 클라이언트 측 jitter가 빠진 신호.
- **Q. Circuit이 호스트 단위? endpoint 단위?**
  보통 (host, path-prefix) 또는 (host, method) 단위. `/health`만 죽었는데 전체 차단하면 과보호. 너무 잘게 쪼개면 *상태가 분산되어 의미 없음*.
- **Q. 오프라인 vs 서버 다운?**
  `NWPathMonitor`로 reachability를 먼저 판정. 오프라인이면 backoff 의미 없으니 *연결 복구 이벤트* 발생 시 재시도(URLSession `waitsForConnectivity = true` 활용).
- **Q. 백그라운드 세션 재시도?**
  background URLSession은 시스템이 자체 재시도/재개를 함. 앱 레벨 retry는 *forground 세션*에만 적용. 중첩 시 중복 다운로드 위험.
- **Q. Jitter 없이 backoff만 쓰면?**
  N개의 클라이언트가 동일 시점 장애를 겪고 `2^k` 후 모두 동시 재시도 → 서버가 회복하자마자 다시 죽음(thundering herd). AWS Architecture Blog의 "Exponential Backoff And Jitter" 사례.
- **Q. Refresh token 갱신을 retry 안에 두면?**
  401 → refresh → 재시도는 *retry라기보다 token 인터셉터 책임*. 재시도 카운트와 분리해야 무한 루프/이중 갱신을 피한다.

## 참고

- AWS Architecture Blog — Exponential Backoff And Jitter (2015)
- Release It! (Michael Nygard) — Circuit Breaker, Bulkhead 패턴
- Stripe API — Idempotency Keys
- Polly (.NET), resilience4j 패턴 참고
- RFC 9110, RFC 6585, RFC 7231
