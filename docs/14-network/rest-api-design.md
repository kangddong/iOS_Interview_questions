# REST API 설계

> 한 줄 요약 — REST는 **리소스를 URL로 표현하고, HTTP 메서드로 행동을 표현하는 설계 원칙**. 진짜 *RESTful*이려면 stateless, 표준 메서드, 캐시 가능성 등 제약을 따라야.

## 6가지 제약 (Roy Fielding)

1. **Client-Server**: 책임 분리.
2. **Stateless**: 서버는 클라 세션 상태를 보관 안 함. 매 요청에 인증 토큰 등 *충분한 정보* 포함.
3. **Cacheable**: 응답이 *캐시 가능 여부*를 명시.
4. **Layered System**: 클라는 직접 서버인지 프록시인지 구분 안 함.
5. **Uniform Interface**: 표준화된 메서드/URL/표현.
6. **Code on Demand** (선택): 서버가 클라에게 코드 전송 (드물게).

stateless가 가장 자주 묻는다 — 토큰을 *서버 메모리에 보관하지 않고*, 클라가 매번 보낸다.

## URL 설계

```
GET    /users                  # 목록
GET    /users/123              # 단건
POST   /users                  # 생성
PUT    /users/123              # 전체 교체
PATCH  /users/123              # 부분 수정
DELETE /users/123              # 삭제

GET    /users/123/posts        # 사용자의 포스트 목록 (관계)
POST   /users/123/posts
```

원칙:
- **명사 + 복수형**.
- 동사 X (`/getUser` ❌, `GET /users/1` ✅).
- 계층은 `/`로.
- 파라미터: query string (`?page=1&limit=20`).

## 멱등성 / 안전성 매핑

| | 안전 | 멱등 |
|---|---|---|
| GET, HEAD, OPTIONS | O | O |
| PUT, DELETE | X | O |
| POST | X | X (보통) |
| PATCH | X | 케이스별 |

→ [http-basics.md](http-basics.md)

## 페이지네이션

### Offset 기반

```
GET /posts?offset=0&limit=20
GET /posts?offset=20&limit=20
```

- 단순. 임의 페이지 점프 가능.
- 데이터 변경 시 *중복/누락* 발생 (글이 추가되면 같은 글이 두 페이지에 등장).

### Cursor 기반

```
GET /posts?cursor=abc123&limit=20
응답에 next_cursor 포함
```

- 안정적 (정렬 키 기준).
- 임의 페이지 점프 어려움.
- 무한 스크롤에 적합.

모바일은 *cursor*가 일반적.

## 응답 포맷

### 일관된 envelope

```json
{
  "data": {...},
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

또는 *성공이면 데이터 자체, 실패면 표준 에러*:

```json
// 200
{...리소스 그대로...}

// 4xx
{
  "code": "USER_NOT_FOUND",
  "message": "사용자가 없습니다"
}
```

팀 내 *일관성*이 핵심.

## 에러 응답

- HTTP status code로 *대분류* (4xx / 5xx).
- 본문에 *상세 코드 + 사용자에게 보일 메시지*.
- `code: "INVALID_PHONE"` 같은 *enum 형태*가 클라 분기에 좋음.
- *디버깅 ID* (request ID, trace ID) 포함.

## 인증

| 방식 | 헤더 |
|---|---|
| Bearer Token | `Authorization: Bearer eyJ...` |
| Basic | `Authorization: Basic base64(user:pw)` |
| API Key | `X-API-Key: ...` |

→ [07-networking/auth-and-token-refresh.md](../07-networking/auth-and-token-refresh.md)

## 버전 관리

```
/v1/users
/v2/users
```

또는 Accept 헤더:

```
Accept: application/vnd.app.v2+json
```

URL path가 *클라/디버깅 친화적*. Accept 헤더는 *깔끔하지만 직관성 떨어짐*.

브레이킹 변경은 새 버전, 호환 변경은 같은 버전 안에서 (필드 추가).

## Rate Limiting

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
Retry-After: 60
```

429를 받으면 *지수 백오프*로 재시도. iOS 클라가 폭주하지 않게.

## CORS — 모바일은 거의 무관

브라우저의 same-origin 정책. 네이티브 앱에선 제약 없음. 그래도 *서버 입장*에서 웹/모바일을 함께 지원하면 서버에서 CORS 설정.

## REST vs RPC vs GraphQL — 빠른 비교

| | REST | RPC (gRPC) | GraphQL |
|---|---|---|---|
| 모델 | 리소스 | 프로시저 호출 | 쿼리 |
| 응답 형식 | 정해진 리소스 | 정해진 메시지 | 클라가 필드 선택 |
| 캐시 | HTTP 캐시 친화 | 직접 | 어려움 |
| 학습 곡선 | 낮음 | 중 | 중 |
| 모바일 사용 | 많음 | 가끔 | 점차 증가 |

## 흔한 함정 / Follow-up

- **Q. 진짜 RESTful한가?**
  대부분의 "REST API"는 *Roy Fielding 기준*에선 RESTful 아님 (HATEOAS 빠짐). 실무에선 *URL/메서드 규칙*만 지켜도 REST라 부름.

- **Q. POST로 모든 걸 처리하는 API가 본 적 있다.**
  RPC 스타일. 빠르게 만들 순 있지만 *캐시/멱등 활용 어려움*. 표준 메서드 권장.

- **Q. 검색이 복잡해서 query string이 너무 김.**
  그래서 *POST /search* 패턴이 흔함. 진짜 RESTful은 아니지만 실용.

- **Q. PUT vs PATCH?**
  PUT = *전체 교체* (모든 필드를 보냄). PATCH = *일부 수정* (변경 필드만). 자원 절약 측면에서 PATCH.

- **Q. cursor 페이지네이션의 cursor는 뭐?**
  마지막 항목의 *정렬 키 + ID 조합*을 base64 인코드. 또는 그냥 ID (`?after=123`).

- **Q. 멱등하지 않은 POST 재시도?**
  Idempotency-Key 헤더 (UUID). 서버가 같은 키 재요청은 *이전 결과* 반환.

## 참고

- Roy Fielding's PhD thesis (REST 정의)
- Microsoft REST API Guidelines
- JSON:API 스펙
