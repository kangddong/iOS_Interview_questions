# HTTP 기본 (메서드 / 상태 코드 / 헤더 / 캐시 / 멱등성)

> 한 줄 요약 — 클라이언트가 *요청*을 보내고 서버가 *응답*하는 텍스트 기반 프로토콜. 메서드/상태 코드/헤더의 의미와 *멱등성/안전성*을 정확히 답할 수 있어야 한다.

## 요청 형식

```
POST /users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJ...
Content-Type: application/json
Content-Length: 24

{"name":"kdy","age":30}
```

- 시작 라인: `메서드 경로 버전`
- 헤더: 키-값
- 빈 줄 후 body

## 메서드

| 메서드 | 의미 | 멱등 | 안전 | body |
|---|---|---|---|---|
| **GET** | 조회 | O | O | 보통 X |
| **HEAD** | GET의 헤더만 | O | O | X |
| **POST** | 생성/액션 | X | X | O |
| **PUT** | 전체 교체 | O | X | O |
| **PATCH** | 일부 수정 | X (보통) | X | O |
| **DELETE** | 삭제 | O | X | 가능 |
| **OPTIONS** | 가능한 메서드 조회 | O | O | X |

- **안전(Safe)**: 서버 상태 변경 X.
- **멱등(Idempotent)**: 여러 번 호출해도 결과 같음.

## 멱등성 — 면접 단골

```
PUT /users/1 with {name: "kdy"}    여러 번 → 결과 동일
POST /users with {name: "kdy"}     여러 번 → 새 user 여러 개
```

네트워크 재시도 시 *멱등 메서드는 안전하게 재시도 가능*. POST는 중복 생성 위험.

해결: POST에 *Idempotency-Key* 헤더로 클라가 발행한 UUID 전달 → 서버가 중복 검사.

## 상태 코드

| 군 | 의미 |
|---|---|
| 1xx | 정보 (`100 Continue`) |
| 2xx | 성공 |
| 3xx | 리다이렉션 |
| 4xx | 클라 에러 |
| 5xx | 서버 에러 |

자주 묻는 코드:

| 코드 | 의미 | 흔한 시나리오 |
|---|---|---|
| 200 | OK | 정상 |
| 201 | Created | POST 생성 성공 |
| 204 | No Content | 응답 본문 없음 (DELETE 후) |
| 301 | Moved Permanently | 영구 이동 |
| 302 | Found | 임시 리다이렉트 |
| 304 | Not Modified | 캐시 유효 |
| 400 | Bad Request | 클라 잘못된 입력 |
| 401 | Unauthorized | 인증 안 됨 / 만료 |
| 403 | Forbidden | 인증은 됐지만 권한 X |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 동시 수정 충돌 |
| 422 | Unprocessable | 형식은 OK인데 의미 실패 |
| 429 | Too Many Requests | rate limit |
| 500 | Internal Server Error | 서버 버그 |
| 502 | Bad Gateway | 게이트웨이 다운 |
| 503 | Service Unavailable | 서비스 점검 |
| 504 | Gateway Timeout | 백엔드 응답 timeout |

## 헤더 — 자주 보이는

| 헤더 | 의미 |
|---|---|
| `Authorization` | Bearer / Basic 인증 |
| `Content-Type` | 본문 형식 (`application/json`, `multipart/form-data`) |
| `Accept` | 받고 싶은 형식 |
| `Cache-Control` | 캐시 정책 |
| `ETag` | 리소스 버전 hash |
| `If-None-Match` | ETag 비교 → 304 |
| `Cookie` / `Set-Cookie` | 쿠키 |
| `User-Agent` | 클라이언트 정보 |
| `X-Forwarded-For` | 원래 클라 IP (proxy 뒤) |
| `Content-Encoding` | 압축 (`gzip`, `br`) |

## 캐시

```
요청 ─→ Cache-Control: max-age=3600
       서버 응답 시 헤더 부착
       클라(또는 중간 프록시)가 1시간 동안 캐시
```

- `Cache-Control: no-cache` → 매번 검증.
- `Cache-Control: no-store` → 절대 저장 X.
- `Cache-Control: max-age=3600` → 1시간.
- `Cache-Control: public/private` → 중간 프록시 캐시 가능 여부.

### Conditional Request — 304

```
요청: If-None-Match: "v123"
응답: 304 Not Modified  (본문 없음)
```

ETag/Last-Modified 비교로 *바뀌지 않은 리소스*는 본문 없이 304만. 대역폭 절약.

iOS `URLSession`은 자동 처리 — `URLCache` 설정 시.

## Connection Keep-Alive

HTTP/1.1 기본. 한 TCP 연결로 *여러 요청*. 매번 handshake 비용 절감.

## Redirect

```
GET /old → 301 Location: /new
GET /new → 200 ...
```

iOS `URLSession`은 자동 follow. 원치 않으면 delegate에서 nil 반환.

## 비교 — REST 메서드 매핑

```
GET    /users           → 목록
GET    /users/1         → 단건
POST   /users           → 생성
PUT    /users/1         → 전체 수정
PATCH  /users/1         → 부분 수정
DELETE /users/1         → 삭제
```

→ [rest-api-design.md](rest-api-design.md)

## 흔한 함정 / Follow-up

- **Q. POST와 PUT의 의미적 차이?**
  POST는 *서버가 ID 결정 (생성)*, PUT은 *클라가 ID 결정 + 전체 교체*. 그래서 PUT은 멱등.

- **Q. 401과 403?**
  401 = 인증 *안 됨/만료* (다시 로그인). 403 = 인증은 됐지만 *권한 부족*.

- **Q. 304와 200의 차이?**
  304는 본문 없음. 클라는 자기 캐시를 *그대로 사용*. 200은 새 본문.

- **Q. PATCH가 멱등?**
  *형식에 따라*. JSON Patch는 멱등이 아니지만, JSON Merge Patch에 *절대값* 부여하면 멱등 가능. 보통 안전하게 *POST와 비슷하게* 취급.

- **Q. iOS에서 200 응답인데 JSON 파싱 실패?**
  서버가 200 + 에러 메시지 본문을 보내는 경우. *서버 명세*가 일관되지 않은 안티패턴. 클라는 status code로 분기하는 게 정석.

- **Q. 같은 GET을 두 번 보내면 캐시?**
  URLSession + URLCache 설정 시 자동. 헤더 정책에 따름. 서버가 `no-store`면 캐시 안 함.

## 참고

- RFC 9110 (HTTP Semantics), 9111 (Caching)
- MDN: HTTP 메서드 / 상태 코드
