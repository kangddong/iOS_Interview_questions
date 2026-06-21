import type { ExamQuestion } from "@/lib/types";

type RawExamQuestion = Omit<ExamQuestion, "partId">;

export const questions: RawExamQuestion[] = [
  // ── dns-and-caching (5) ──────────────────────────────────────────────────
  {
    id: "objective-c14-basic-dns-and-caching-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "DNS 조회 순서로 올바른 것은?",
    choices: [
      { id: "a", text: "앱 → Root 서버 → TLD 서버 → Authoritative 서버" },
      { id: "b", text: "앱 → OS 캐시 → Recursive Resolver → Root → TLD → Authoritative 서버" },
      { id: "c", text: "앱 → ISP → OS 캐시 → Authoritative 서버" },
      { id: "d", text: "앱 → Authoritative 서버 → Root 서버" },
    ],
    correctChoiceId: "b",
    explanation:
      "DNS 조회는 앱이 OS resolver에 질의하고, OS 캐시에 없으면 Recursive Resolver(ISP/설정된 서버)가 Root → TLD(.com 등) → Authoritative 서버 순으로 질의한다. 첫 조회는 수십~수백 ms, 캐시 hit는 거의 0ms다.",
    relatedTopicSlugs: ["14-network/dns-and-caching"],
  },
  {
    id: "objective-c14-basic-dns-and-caching-002",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "DNS 레코드 중 도메인 이름을 IPv4 주소로 매핑하는 레코드 타입은?",
    choices: [
      { id: "a", text: "AAAA" },
      { id: "b", text: "CNAME" },
      { id: "c", text: "A" },
      { id: "d", text: "MX" },
    ],
    correctChoiceId: "c",
    explanation:
      "A 레코드는 도메인을 IPv4 주소로 매핑한다. AAAA는 IPv6, CNAME은 다른 도메인의 alias, MX는 메일 서버를 가리킨다.",
    relatedTopicSlugs: ["14-network/dns-and-caching"],
  },
  {
    id: "objective-c14-intermediate-dns-and-caching-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "서비스 도메인을 새 서버로 이전할 때 DNS TTL을 미리 짧게 설정하는 이유는?",
    choices: [
      { id: "a", text: "보안상 긴 TTL은 DNSSEC 위반이기 때문에" },
      { id: "b", text: "짧은 TTL은 DNS 서버 부하를 줄이기 때문에" },
      { id: "c", text: "변경된 IP가 전 세계 캐시에 빠르게 전파되도록 하기 위해" },
      { id: "d", text: "Recursive Resolver가 Root 서버에 질의하는 횟수를 늘려 정확도를 높이기 위해" },
    ],
    correctChoiceId: "c",
    explanation:
      "TTL이 길면 클라이언트와 중간 서버들이 오래된 IP를 캐시한다. 이전 전에 TTL을 짧게 낮춰두면 변경 후 새 IP가 전 세계 캐시에 빠르게 전파된다.",
    relatedTopicSlugs: ["14-network/dns-and-caching"],
  },
  {
    id: "objective-c14-intermediate-dns-and-caching-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "기본 DNS와 DoH(DNS over HTTPS)의 가장 큰 차이점은?",
    choices: [
      { id: "a", text: "DoH는 UDP 대신 TCP를 사용한다" },
      { id: "b", text: "기본 DNS는 평문 UDP 53번 포트를 사용해 도청·조작 가능하지만 DoH는 HTTPS 위에서 암호화된다" },
      { id: "c", text: "DoH는 Root 서버를 거치지 않아 속도가 빠르다" },
      { id: "d", text: "기본 DNS는 IPv6를 지원하지 않는다" },
    ],
    correctChoiceId: "b",
    explanation:
      "기본 DNS는 평문 UDP 53번 포트를 사용해 ISP나 공격자가 도청·조작할 수 있다. DoH는 HTTPS(TLS) 위에서 DNS 쿼리를 보내 기밀성과 무결성을 보장한다. iOS 14+에서 시스템 설정으로 지원된다.",
    relatedTopicSlugs: ["14-network/dns-and-caching"],
  },
  {
    id: "objective-c14-advanced-dns-and-caching-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "iOS에서 URLCache를 사용해 HTTP 응답 캐시를 효과적으로 활용하려면 서버가 응답 헤더에 무엇을 포함해야 하는가?",
    choices: [
      { id: "a", text: "Authorization 헤더" },
      { id: "b", text: "Cache-Control 헤더 (max-age, no-store 등 정책 명시)" },
      { id: "c", text: "Content-Encoding: gzip 헤더" },
      { id: "d", text: "X-Forwarded-For 헤더" },
    ],
    correctChoiceId: "b",
    explanation:
      "URLSession은 서버의 Cache-Control 헤더에 따라 자동으로 캐시 동작을 결정한다. max-age로 유효 시간을, no-store로 캐시 금지를 지정한다. 헤더가 없거나 no-store면 캐시되지 않는다.",
    relatedTopicSlugs: ["14-network/dns-and-caching"],
  },

  // ── http-basics (3 new) ──────────────────────────────────────────────────
  {
    id: "objective-c14-basic-http-basics-003",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "HTTP 상태 코드 401과 403의 차이를 올바르게 설명한 것은?",
    choices: [
      { id: "a", text: "401은 서버 오류, 403은 클라이언트 오류다" },
      { id: "b", text: "401은 인증되지 않음(토큰 없음/만료), 403은 인증됐지만 권한 부족이다" },
      { id: "c", text: "401은 리소스를 찾을 수 없음, 403은 요청 형식 오류다" },
      { id: "d", text: "401은 서버 과부하, 403은 rate limit 초과다" },
    ],
    correctChoiceId: "b",
    explanation:
      "401 Unauthorized는 인증이 안 됐거나 토큰이 만료된 상태로, 다시 로그인이 필요하다. 403 Forbidden은 인증은 됐지만 해당 리소스에 접근할 권한이 없는 상태다.",
    relatedTopicSlugs: ["14-network/http-basics"],
  },
  {
    id: "objective-c14-intermediate-http-basics-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "HTTP에서 '멱등성(Idempotent)'이란 무엇이며, 다음 중 멱등하지 않은 메서드는?",
    choices: [
      { id: "a", text: "멱등 = 서버 상태를 변경하지 않음. DELETE가 멱등하지 않다" },
      { id: "b", text: "멱등 = 여러 번 호출해도 결과가 같음. POST가 멱등하지 않다" },
      { id: "c", text: "멱등 = 요청에 body가 없음. GET이 멱등하지 않다" },
      { id: "d", text: "멱등 = HTTPS로만 전송해야 함. PUT이 멱등하지 않다" },
    ],
    correctChoiceId: "b",
    explanation:
      "멱등성은 동일 요청을 여러 번 보내도 서버 상태가 같은 결과를 내는 성질이다. POST는 호출할 때마다 새 리소스를 생성하므로 멱등하지 않다. 네트워크 재시도 시 멱등 메서드는 안전하게 재시도 가능하다.",
    relatedTopicSlugs: ["14-network/http-basics"],
  },
  {
    id: "objective-c14-intermediate-http-basics-005",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "서버가 응답에 ETag를 보내고, 클라이언트가 다음 요청에 If-None-Match 헤더를 포함했을 때 리소스가 변경되지 않았다면 서버는 어떤 상태 코드를 반환하는가?",
    choices: [
      { id: "a", text: "200 OK (전체 본문 재전송)" },
      { id: "b", text: "204 No Content" },
      { id: "c", text: "304 Not Modified (본문 없음)" },
      { id: "d", text: "302 Found (리다이렉트)" },
    ],
    correctChoiceId: "c",
    explanation:
      "ETag와 If-None-Match를 이용한 조건부 요청에서 리소스가 바뀌지 않았으면 서버는 304 Not Modified를 반환하고 본문을 보내지 않는다. 클라이언트는 로컬 캐시를 그대로 사용한다. 이로써 대역폭을 절약한다.",
    relatedTopicSlugs: ["14-network/http-basics"],
  },

  // ── http2-http3 (5) ──────────────────────────────────────────────────────
  {
    id: "objective-c14-basic-http2-http3-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "HTTP/2가 HTTP/1.1 대비 가장 핵심적으로 개선한 점은?",
    choices: [
      { id: "a", text: "UDP 기반 전송으로 속도 향상" },
      { id: "b", text: "단일 TCP 연결 위에서 여러 요청을 동시에 처리하는 멀티플렉싱" },
      { id: "c", text: "TLS 내장으로 HTTPS 불필요" },
      { id: "d", text: "DNS 조회 횟수 감소" },
    ],
    correctChoiceId: "b",
    explanation:
      "HTTP/2의 핵심 개선점은 멀티플렉싱(Multiplexing)이다. 단일 TCP 연결 안에서 여러 스트림을 병렬로 처리해 Head-of-line blocking을 HTTP 레벨에서 해소하고 연결 수립 오버헤드를 줄인다.",
    relatedTopicSlugs: ["14-network/http2-http3"],
  },
  {
    id: "objective-c14-basic-http2-http3-002",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "HTTP/3가 기반으로 하는 전송 계층 프로토콜은?",
    choices: [
      { id: "a", text: "TCP" },
      { id: "b", text: "UDP 위의 QUIC" },
      { id: "c", text: "SCTP" },
      { id: "d", text: "WebSocket" },
    ],
    correctChoiceId: "b",
    explanation:
      "HTTP/3는 UDP 위에 구현된 QUIC 프로토콜을 사용한다. QUIC은 UDP 위에서 TCP의 신뢰성, TLS 보안, 멀티플렉싱을 통합 구현한 프로토콜이다.",
    relatedTopicSlugs: ["14-network/http2-http3"],
  },
  {
    id: "objective-c14-intermediate-http2-http3-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "HTTP/2에서 TCP Head-of-line blocking이 여전히 발생하는 이유는?",
    choices: [
      { id: "a", text: "HTTP/2가 헤더 압축을 사용하기 때문에" },
      { id: "b", text: "여러 스트림이 하나의 TCP 연결을 공유하므로 TCP 패킷 손실 시 모든 스트림이 대기해야 하기 때문에" },
      { id: "c", text: "HTTP/2는 멀티플렉싱을 지원하지 않기 때문에" },
      { id: "d", text: "TLS handshake 단계가 너무 많기 때문에" },
    ],
    correctChoiceId: "b",
    explanation:
      "HTTP/2는 HTTP 레벨 HoL blocking은 해결했지만, 여러 스트림이 동일한 TCP 연결을 사용하기 때문에 TCP 패킷 하나가 손실되면 모든 스트림이 재전송을 기다려야 하는 TCP 레벨 HoL blocking은 남아있다. HTTP/3(QUIC)는 스트림별 독립 재전송으로 이를 해결한다.",
    relatedTopicSlugs: ["14-network/http2-http3"],
  },
  {
    id: "objective-c14-intermediate-http2-http3-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "HTTP/3의 Connection Migration이 모바일 환경에서 유용한 이유는?",
    choices: [
      { id: "a", text: "Wi-Fi와 LTE 전환 시 QUIC의 Connection ID로 연결을 유지할 수 있기 때문에" },
      { id: "b", text: "배터리 소모가 줄어들기 때문에" },
      { id: "c", text: "DNS 캐시를 공유하기 때문에" },
      { id: "d", text: "IPv4와 IPv6를 동시에 사용할 수 있기 때문에" },
    ],
    correctChoiceId: "a",
    explanation:
      "TCP 기반 연결은 IP 주소가 바뀌면(Wi-Fi ↔ LTE 전환) 끊기고 새로 수립해야 한다. QUIC는 Connection ID로 연결을 식별하므로 IP가 바뀌어도 연결을 유지할 수 있어 모바일 환경에서 체감 품질이 크게 향상된다.",
    relatedTopicSlugs: ["14-network/http2-http3"],
  },
  {
    id: "objective-c14-advanced-http2-http3-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "HTTP/2의 HPACK 헤더 압축이 반복 요청에서 효율적인 이유는?",
    choices: [
      { id: "a", text: "헤더를 gzip으로 압축하기 때문에" },
      { id: "b", text: "자주 쓰는 헤더를 인덱스 번호로 대체해 같은 세션에서 중복 전송을 없애기 때문에" },
      { id: "c", text: "헤더를 바이너리로 직렬화해서 크기가 절반으로 줄기 때문에" },
      { id: "d", text: "Authorization 헤더를 서버 측에 저장해 클라이언트가 다시 보내지 않아도 되기 때문에" },
    ],
    correctChoiceId: "b",
    explanation:
      "HPACK은 정적/동적 테이블을 이용해 자주 사용하는 헤더(User-Agent, Authorization 등)를 인덱스 번호로 대체한다. 100바이트짜리 헤더를 1바이트로 줄일 수 있으며, 같은 TCP 연결 내에서 이미 전송한 헤더는 재전송하지 않아도 된다.",
    relatedTopicSlugs: ["14-network/http2-http3"],
  },

  // ── https-and-tls (3 new) ────────────────────────────────────────────────
  {
    id: "objective-c14-basic-https-and-tls-003",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "iOS 9+의 ATS(App Transport Security)가 기본적으로 강제하는 것은?",
    choices: [
      { id: "a", text: "모든 네트워크 요청에 인증 토큰 포함" },
      { id: "b", text: "HTTP 대신 HTTPS 사용 강제" },
      { id: "c", text: "모든 응답을 URLCache에 저장" },
      { id: "d", text: "TLS 1.0 이하 사용 금지" },
    ],
    correctChoiceId: "b",
    explanation:
      "ATS는 iOS 9+부터 기본으로 활성화되며, HTTP 호출을 차단하고 HTTPS만 허용한다. HTTP를 사용하려면 Info.plist에 예외를 등록해야 하며, App Store 심사에서 정당한 사유가 없으면 거절될 수 있다. 추가로 TLS 1.2+ 및 Forward Secrecy 지원 cipher를 강제한다.",
    relatedTopicSlugs: ["14-network/https-and-tls"],
  },
  {
    id: "objective-c14-intermediate-https-and-tls-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "SSL Pinning에서 Certificate Pin보다 Public Key Pin이 선호되는 이유는?",
    choices: [
      { id: "a", text: "Public Key Pin은 구현이 더 단순하기 때문에" },
      { id: "b", text: "인증서를 갱신해도 공개키가 동일하면 앱 업데이트 없이 계속 동작하기 때문에" },
      { id: "c", text: "Public Key Pin은 Root CA를 신뢰하지 않아도 되기 때문에" },
      { id: "d", text: "Certificate Pin은 TLS 1.3에서 동작하지 않기 때문에" },
    ],
    correctChoiceId: "b",
    explanation:
      "Certificate Pin은 인증서 자체를 박아두므로 인증서 갱신 때마다 앱 업데이트가 필요하다. Public Key Pin은 공개키를 핀으로 사용하므로 인증서를 갱신해도 동일한 키 쌍을 유지하면 앱 업데이트 없이 계속 연결할 수 있다.",
    relatedTopicSlugs: ["14-network/https-and-tls"],
  },
  {
    id: "objective-c14-advanced-https-and-tls-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "TLS 1.3이 TLS 1.2 대비 RTT(Round Trip Time)를 줄인 핵심 이유는?",
    choices: [
      { id: "a", text: "AES-256 대신 AES-128을 사용하기 때문에" },
      { id: "b", text: "인증서 검증 단계를 제거했기 때문에" },
      { id: "c", text: "Handshake를 2 RTT에서 1 RTT로 줄이고, 재연결 시 0-RTT를 지원하기 때문에" },
      { id: "d", text: "UDP 기반으로 변경했기 때문에" },
    ],
    correctChoiceId: "c",
    explanation:
      "TLS 1.2는 2 RTT가 필요하지만, TLS 1.3은 ClientHello에 key_share를 포함해 서버가 한 번의 왕복으로 Finished까지 보낼 수 있어 1 RTT로 줄었다. 재방문 시 PSK(pre-shared key)를 사용하면 0-RTT도 가능하다(단, replay attack 주의).",
    relatedTopicSlugs: ["14-network/https-and-tls"],
  },

  // ── osi-and-tcp-ip (5) ───────────────────────────────────────────────────
  {
    id: "objective-c14-basic-osi-and-tcp-ip-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "OSI 7계층 모델에서 TCP/UDP가 속하는 계층은?",
    choices: [
      { id: "a", text: "3계층 — Network" },
      { id: "b", text: "4계층 — Transport" },
      { id: "c", text: "5계층 — Session" },
      { id: "d", text: "7계층 — Application" },
    ],
    correctChoiceId: "b",
    explanation:
      "TCP와 UDP는 OSI 4계층인 Transport 계층에 속한다. Transport 계층은 종단 간 신뢰성, 포트 기반 다중화, 흐름 제어를 담당한다.",
    relatedTopicSlugs: ["14-network/osi-and-tcp-ip"],
  },
  {
    id: "objective-c14-basic-osi-and-tcp-ip-002",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "TCP/IP 4계층 모델에서 HTTP는 어느 계층에 속하는가?",
    choices: [
      { id: "a", text: "Transport 계층" },
      { id: "b", text: "Internet 계층" },
      { id: "c", text: "Application 계층" },
      { id: "d", text: "Network Access 계층" },
    ],
    correctChoiceId: "c",
    explanation:
      "HTTP, DNS, FTP, WebSocket 등 사용자 응용 프로토콜은 TCP/IP 4계층 모델에서 Application 계층에 속한다. OSI 모델의 5/6/7계층이 TCP/IP의 Application 계층에 해당한다.",
    relatedTopicSlugs: ["14-network/osi-and-tcp-ip"],
  },
  {
    id: "objective-c14-intermediate-osi-and-tcp-ip-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "HTTPS 요청 시 클라이언트에서 데이터가 전송되는 순서를 올바르게 나열한 것은?",
    choices: [
      { id: "a", text: "DNS 조회 → TLS handshake → TCP 3-way handshake → HTTP 요청" },
      { id: "b", text: "DNS 조회 → TCP 3-way handshake → TLS handshake → HTTP 요청" },
      { id: "c", text: "TCP 3-way handshake → DNS 조회 → TLS handshake → HTTP 요청" },
      { id: "d", text: "TLS handshake → DNS 조회 → TCP 3-way handshake → HTTP 요청" },
    ],
    correctChoiceId: "b",
    explanation:
      "HTTPS 요청의 순서는 ① DNS 조회(도메인 → IP) → ② TCP 3-way handshake(연결 수립) → ③ TLS handshake(암호화 채널 구성) → ④ HTTP 요청 송신이다. TCP 연결이 수립된 후에야 TLS handshake를 진행할 수 있다.",
    relatedTopicSlugs: ["14-network/osi-and-tcp-ip"],
  },
  {
    id: "objective-c14-intermediate-osi-and-tcp-ip-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "캡슐화(Encapsulation) 과정에서 Transport 계층이 추가하는 주소 정보는?",
    choices: [
      { id: "a", text: "IP 주소" },
      { id: "b", text: "MAC 주소" },
      { id: "c", text: "포트 번호" },
      { id: "d", text: "도메인 이름" },
    ],
    correctChoiceId: "c",
    explanation:
      "Transport 계층(TCP/UDP)은 헤더에 출발지/목적지 포트 번호를 추가한다. IP 주소는 Network 계층(IP), MAC 주소는 Link 계층(Ethernet)이 담당한다.",
    relatedTopicSlugs: ["14-network/osi-and-tcp-ip"],
  },
  {
    id: "objective-c14-advanced-osi-and-tcp-ip-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "TLS는 OSI 7계층 모델에서 어디에 위치한다고 보는 것이 가장 정확한가?",
    choices: [
      { id: "a", text: "3계층 — Network (IP 암호화)" },
      { id: "b", text: "4계층 — Transport (TCP 암호화)" },
      { id: "c", text: "5/6계층 경계 — Session/Presentation (TCP 위, HTTP 아래)" },
      { id: "d", text: "7계층 — Application (HTTP의 일부)" },
    ],
    correctChoiceId: "c",
    explanation:
      "TLS는 엄밀히 Presentation 계층(6계층)에 가깝지만, TCP/IP 4계층 모델에서는 Transport(TCP)와 Application(HTTP) 사이에 위치한다고 본다. TCP 위에서 동작하며, HTTP보다 아래에서 암호화된 채널을 제공한다.",
    relatedTopicSlugs: ["14-network/osi-and-tcp-ip"],
  },

  // ── rest-api-design (5) ──────────────────────────────────────────────────
  {
    id: "objective-c14-basic-rest-api-design-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "REST API 설계 원칙 중 'Stateless'가 의미하는 것은?",
    choices: [
      { id: "a", text: "서버는 클라이언트의 세션 상태를 보관하지 않으며, 매 요청에 필요한 정보가 모두 포함되어야 한다" },
      { id: "b", text: "클라이언트는 서버 상태를 직접 조회할 수 없다" },
      { id: "c", text: "모든 응답은 캐시 가능해야 한다" },
      { id: "d", text: "서버는 응답 본문에 상태 코드를 포함하지 않는다" },
    ],
    correctChoiceId: "a",
    explanation:
      "Stateless는 서버가 클라이언트의 세션 상태를 메모리에 보관하지 않는다는 의미다. 각 요청은 인증 토큰 등 필요한 모든 정보를 포함해야 한다. 이는 수평 확장(scale-out)을 가능하게 한다.",
    relatedTopicSlugs: ["14-network/rest-api-design"],
  },
  {
    id: "objective-c14-basic-rest-api-design-002",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "REST API에서 사용자 목록을 조회하는 올바른 URL 설계는?",
    choices: [
      { id: "a", text: "GET /getUsers" },
      { id: "b", text: "POST /userList" },
      { id: "c", text: "GET /users" },
      { id: "d", text: "GET /user/list" },
    ],
    correctChoiceId: "c",
    explanation:
      "REST API URL은 명사 복수형을 사용하고 동사를 포함하지 않는다. 행동은 HTTP 메서드로 표현한다. /getUsers는 동사 포함이므로 잘못된 설계다. /users에 GET 메서드를 사용하는 것이 올바르다.",
    relatedTopicSlugs: ["14-network/rest-api-design"],
  },
  {
    id: "objective-c14-intermediate-rest-api-design-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "모바일 앱의 무한 스크롤에서 Cursor 기반 페이지네이션이 Offset 기반보다 권장되는 이유는?",
    choices: [
      { id: "a", text: "Cursor는 임의 페이지 접근이 가능하기 때문에" },
      { id: "b", text: "Cursor는 서버 부하가 없기 때문에" },
      { id: "c", text: "데이터 변경 시 중복/누락 없이 안정적으로 다음 페이지를 가져올 수 있기 때문에" },
      { id: "d", text: "Offset보다 URL이 짧아서 캐시에 유리하기 때문에" },
    ],
    correctChoiceId: "c",
    explanation:
      "Offset 기반은 새 데이터가 추가되면 오프셋이 밀려 같은 항목이 두 페이지에 나타나거나 누락될 수 있다. Cursor 기반은 마지막 항목의 정렬 키를 기준으로 하므로 데이터가 변경되어도 안정적으로 다음 페이지를 가져온다. 무한 스크롤에 적합하다.",
    relatedTopicSlugs: ["14-network/rest-api-design"],
  },
  {
    id: "objective-c14-intermediate-rest-api-design-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "REST API에서 429 Too Many Requests를 받은 클라이언트가 재시도할 때 권장되는 전략은?",
    choices: [
      { id: "a", text: "즉시 동일 요청을 반복 전송한다" },
      { id: "b", text: "Retry-After 헤더를 확인하고 지수 백오프(exponential backoff)로 재시도한다" },
      { id: "c", text: "요청 헤더에 Authorization을 제거하고 재전송한다" },
      { id: "d", text: "HTTP 메서드를 GET으로 변경해 재시도한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "429 응답의 Retry-After 헤더에 대기 시간이 명시된다. 재시도 시에는 즉시 반복하면 서버에 더 큰 부하를 주므로 지수 백오프(재시도 간격을 2배씩 늘림)와 jitter(무작위 지연)를 함께 적용하는 것이 표준이다.",
    relatedTopicSlugs: ["14-network/rest-api-design"],
  },
  {
    id: "objective-c14-advanced-rest-api-design-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "REST vs GraphQL vs gRPC(RPC) 비교에서 GraphQL의 주요 특징은?",
    choices: [
      { id: "a", text: "GraphQL은 HTTP 캐시와 가장 친화적이다" },
      { id: "b", text: "GraphQL은 클라이언트가 필요한 필드만 선택해 요청할 수 있어 over-fetching을 줄인다" },
      { id: "c", text: "GraphQL은 Protobuf 바이너리 직렬화로 속도가 가장 빠르다" },
      { id: "d", text: "GraphQL은 REST와 달리 서버 상태를 저장(stateful)한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "GraphQL의 핵심 특징은 클라이언트가 필요한 필드만 쿼리로 지정할 수 있다는 점이다. REST에서 발생하는 over-fetching(필요 없는 데이터까지 받음)과 under-fetching(여러 요청 필요)을 줄일 수 있다. 단, HTTP GET 기반 캐싱이 어렵다는 단점이 있다.",
    relatedTopicSlugs: ["14-network/rest-api-design"],
  },

  // ── tcp-vs-udp (3 new) ───────────────────────────────────────────────────
  {
    id: "objective-c14-basic-tcp-vs-udp-003",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "TCP 3-way Handshake의 단계를 올바른 순서로 나열한 것은?",
    choices: [
      { id: "a", text: "SYN → ACK → SYN+ACK" },
      { id: "b", text: "ACK → SYN → SYN+ACK" },
      { id: "c", text: "SYN → SYN+ACK → ACK" },
      { id: "d", text: "SYN+ACK → SYN → ACK" },
    ],
    correctChoiceId: "c",
    explanation:
      "TCP 연결 수립은 클라이언트가 SYN을 보내고, 서버가 SYN+ACK로 응답하며, 클라이언트가 ACK를 보내는 순서다. 이 과정에서 양측이 서로의 시퀀스 번호를 합의해 이후 패킷 순서와 누락을 검증할 수 있다.",
    relatedTopicSlugs: ["14-network/tcp-vs-udp"],
  },
  {
    id: "objective-c14-intermediate-tcp-vs-udp-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "음성 통화(VoIP) 앱이 TCP 대신 UDP를 선택하는 주된 이유는?",
    choices: [
      { id: "a", text: "UDP는 암호화를 내장해 보안이 더 강하기 때문에" },
      { id: "b", text: "음성에서는 패킷 손실보다 지연이 더 치명적이므로 재전송 없이 빠르게 전달하는 것이 중요하기 때문에" },
      { id: "c", text: "UDP는 연결 수립 없이도 신뢰성을 보장하기 때문에" },
      { id: "d", text: "TCP는 음성 코덱을 지원하지 않기 때문에" },
    ],
    correctChoiceId: "b",
    explanation:
      "음성/영상 스트리밍에서는 늦게 도착하는 패킷보다 다음 프레임이 더 유용하다. TCP의 재전송과 혼잡 제어는 지연을 유발하므로 UDP가 적합하다. 손실 보상은 애플리케이션 레벨(jitter buffer, FEC 등)에서 처리한다.",
    relatedTopicSlugs: ["14-network/tcp-vs-udp"],
  },
  {
    id: "objective-c14-advanced-tcp-vs-udp-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "TCP 4-way Close에서 Active Close 측이 TIME_WAIT 상태로 대기하는 이유는?",
    choices: [
      { id: "a", text: "서버가 새 연결 요청을 처리할 준비가 될 때까지 기다리기 위해" },
      { id: "b", text: "지연 도착한 이전 연결의 패킷이 새 연결에 섞이는 것을 방지하기 위해" },
      { id: "c", text: "TLS 세션 키를 안전하게 폐기하기 위해" },
      { id: "d", text: "DNS 캐시를 갱신하기 위해" },
    ],
    correctChoiceId: "b",
    explanation:
      "TIME_WAIT(2*MSL 동안)은 지연된 이전 연결의 패킷이 새 연결에 섞여 들어오는 것을 방지한다. 또한 마지막 ACK가 유실됐을 때 상대방이 재전송하는 FIN을 처리할 수 있는 시간을 확보한다. 서버에서 TIME_WAIT가 대량 누적되면 SO_REUSEADDR로 완화할 수 있다.",
    relatedTopicSlugs: ["14-network/tcp-vs-udp"],
  },

  // ── tls-handshake-deep (3 new) ───────────────────────────────────────────
  {
    id: "objective-c14-intermediate-tls-handshake-deep-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "TLS 인증서 체인 검증 실패의 흔한 원인이 아닌 것은?",
    choices: [
      { id: "a", text: "Intermediate CA 인증서가 서버 설정에 누락된 경우" },
      { id: "b", text: "인증서의 SAN(Subject Alternative Name)과 실제 hostname이 불일치하는 경우" },
      { id: "c", text: "서버가 TLS 1.3 대신 TLS 1.2를 사용하는 경우" },
      { id: "d", text: "인증서가 만료된 경우" },
    ],
    correctChoiceId: "c",
    explanation:
      "TLS 1.2와 1.3은 모두 유효한 버전이며, TLS 버전 자체가 인증서 체인 검증 실패 원인이 되지 않는다. 체인 검증 실패의 흔한 원인은 Intermediate 인증서 누락, hostname mismatch(CN vs SAN), 인증서 만료, 사설 CA가 디바이스 trust store에 없는 경우다.",
    relatedTopicSlugs: ["14-network/tls-handshake-deep"],
  },
  {
    id: "objective-c14-intermediate-tls-handshake-deep-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "OCSP Stapling이 일반 OCSP 조회 방식보다 나은 이유는?",
    choices: [
      { id: "a", text: "클라이언트가 OCSP 서버를 직접 조회하지 않아 RTT를 줄이고 프라이버시를 보호하기 때문에" },
      { id: "b", text: "OCSP Stapling은 인증서 만료를 자동으로 갱신하기 때문에" },
      { id: "c", text: "OCSP Stapling은 Root CA 없이도 인증서를 신뢰할 수 있게 해주기 때문에" },
      { id: "d", text: "OCSP Stapling은 TLS 1.2 이하에서만 동작하기 때문에" },
    ],
    correctChoiceId: "a",
    explanation:
      "일반 OCSP 조회는 클라이언트가 OCSP 서버에 직접 요청해 추가 RTT가 발생하고 어떤 사이트를 방문했는지 OCSP 서버에 노출된다. OCSP Stapling은 서버가 OCSP 응답을 미리 받아 TLS handshake에 첨부하므로 추가 RTT 없이 해지 여부를 확인하고 프라이버시도 보호된다.",
    relatedTopicSlugs: ["14-network/tls-handshake-deep"],
  },
  {
    id: "objective-c14-advanced-tls-handshake-deep-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "TLS 1.3 0-RTT(Early Data)에서 replay attack이 발생할 수 있는 이유와 올바른 대응책은?",
    choices: [
      { id: "a", text: "0-RTT는 암호화가 약하기 때문이다. AES-256으로 변경해야 한다" },
      { id: "b", text: "공격자가 캡처한 Early Data를 재전송할 수 있어 멱등하지 않은 요청에는 0-RTT를 사용하면 안 된다" },
      { id: "c", text: "0-RTT는 서버 인증을 건너뛰기 때문이다. 서버 인증서를 추가해야 한다" },
      { id: "d", text: "0-RTT는 TCP 연결을 재사용하기 때문이다. 새 TCP 연결을 수립해야 한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "0-RTT는 PSK(pre-shared key)로 ClientHello에 바로 애플리케이션 데이터를 첨부하는데, 공격자가 이 패킷을 캡처해 서버에 다시 보낼 수 있다(replay). 따라서 0-RTT는 멱등한 요청(GET 조회 등)에만 사용해야 하며, POST처럼 부작용이 있는 요청에는 사용하면 안 된다.",
    relatedTopicSlugs: ["14-network/tls-handshake-deep"],
  },

  // ── websocket (5) ────────────────────────────────────────────────────────
  {
    id: "objective-c14-basic-websocket-001",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "WebSocket 연결을 시작할 때 서버가 반환하는 HTTP 상태 코드는?",
    choices: [
      { id: "a", text: "200 OK" },
      { id: "b", text: "301 Moved Permanently" },
      { id: "c", text: "101 Switching Protocols" },
      { id: "d", text: "426 Upgrade Required" },
    ],
    correctChoiceId: "c",
    explanation:
      "클라이언트가 Upgrade: websocket 헤더를 포함한 HTTP 요청을 보내면, 서버는 101 Switching Protocols로 응답해 WebSocket 프로토콜로 전환을 확인한다. 이후 같은 TCP 연결 위에서 프레임 단위 양방향 통신이 시작된다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },
  {
    id: "objective-c14-basic-websocket-002",
    type: "objective",
    level: "basic",
    category: "Network",
    prompt: "iOS에서 URLSessionWebSocketTask의 receive 메서드 특성으로 올바른 것은?",
    choices: [
      { id: "a", text: "한 번 호출하면 연결이 끊길 때까지 모든 메시지를 자동으로 수신한다" },
      { id: "b", text: "한 번에 메시지 하나만 받으므로 계속 수신하려면 재귀 호출이 필요하다" },
      { id: "c", text: "백그라운드 상태에서도 자동으로 메시지를 수신한다" },
      { id: "d", text: "텍스트 메시지만 수신하고 바이너리는 별도 API를 사용해야 한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "URLSessionWebSocketTask의 receive는 한 번 호출하면 메시지 하나만 받고 완료된다. 계속 수신하려면 콜백 안에서 receive를 다시 호출하는 재귀 패턴을 사용해야 한다. 흐름 제어를 앱이 직접 관리하는 구조다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },
  {
    id: "objective-c14-intermediate-websocket-003",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "WebSocket 연결이 끊겼는지 감지하는 권장 방법은?",
    choices: [
      { id: "a", text: "URLSession의 invalidateAndCancel()을 주기적으로 호출한다" },
      { id: "b", text: "주기적으로 ping을 보내고 timeout 내에 pong이 오지 않으면 끊김으로 판단한다" },
      { id: "c", text: "URLSessionWebSocketTask는 자동으로 재연결하므로 별도 감지가 불필요하다" },
      { id: "d", text: "네트워크 인터페이스의 IP 변경 여부를 주기적으로 확인한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "WebSocket 자체는 연결 유지 확인 기능을 제공하지 않는다. URLSessionWebSocketTask의 sendPing을 주기적으로 호출(보통 30초~1분)하고 timeout 내에 pong 콜백이 오지 않으면 연결이 끊겼다고 판단한다. 이후 지수 백오프로 재연결을 시도한다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },
  {
    id: "objective-c14-intermediate-websocket-004",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "iOS 앱이 백그라운드에 진입했을 때 WebSocket 연결이 끊기는 이유와 올바른 대응은?",
    choices: [
      { id: "a", text: "ATS 정책이 백그라운드에서 적용되기 때문이다. wss:// 대신 ws://로 전환한다" },
      { id: "b", text: "iOS가 백그라운드 진입 후 약 5초 내에 네트워크 연결을 끊기 때문이다. 백그라운드 알림은 APNs Push로 대체한다" },
      { id: "c", text: "URLSessionWebSocketTask가 백그라운드 모드를 지원하지 않기 때문이다. Network.framework를 사용한다" },
      { id: "d", text: "WebSocket은 HTTP/2 위에서만 동작하기 때문에 백그라운드 HTTP/2 연결로 유지한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "iOS는 앱이 백그라운드에 진입하면 약 5초 내에 열린 네트워크 연결을 종료한다. 일반 앱은 VoIP 같은 특수 background mode 없이는 WebSocket을 유지할 수 없다. 백그라운드에서 서버 알림을 받으려면 APNs Push를 사용해야 한다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },
  {
    id: "objective-c14-advanced-websocket-005",
    type: "objective",
    level: "advanced",
    category: "Network",
    prompt: "채팅 앱에서 포그라운드/백그라운드 모두 메시지를 받아야 할 때 올바른 아키텍처는?",
    choices: [
      { id: "a", text: "WebSocket만 사용하고 백그라운드에서는 Long Polling으로 폴백한다" },
      { id: "b", text: "포그라운드에서는 WebSocket, 백그라운드에서는 APNs Push를 사용하며 메시지 ID로 중복을 제거한다" },
      { id: "c", text: "APNs Push만 사용하고 포그라운드에서는 Push 도착 시 API를 호출해 메시지를 가져온다" },
      { id: "d", text: "Server-Sent Events만 사용해 단방향 스트림으로 처리한다" },
    ],
    correctChoiceId: "b",
    explanation:
      "포그라운드에서는 WebSocket으로 실시간 메시지를 수신하고, 백그라운드에서는 APNs Push로 알림을 받는다. 서버는 메시지 발생 시 두 채널 모두 발송하고, 클라이언트는 메시지 ID로 중복을 제거(dedup)한다. 이것이 iOS 채팅 앱의 표준 패턴이다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },

  // ─── ws-vs-sse (add: 1) ──────────────────────────────────────────────────
  {
    id: "objective-c14-intermediate-ws-vs-sse-001",
    type: "objective",
    level: "intermediate",
    category: "Network",
    prompt: "WebSocket과 Server-Sent Events(SSE)의 핵심 차이로 가장 정확한 것은?",
    choices: [
      { id: "a", text: "WebSocket은 단일 TCP 연결 위 *양방향 풀듀플렉스*, SSE는 HTTP 위 *서버→클라이언트 단방향* 스트림이며 텍스트만 지원한다" },
      { id: "b", text: "둘 다 양방향이지만 SSE가 더 빠르다" },
      { id: "c", text: "SSE는 UDP, WebSocket은 TCP 위에서 동작한다" },
      { id: "d", text: "WebSocket은 HTTP/3에서만 동작하고 SSE는 HTTP/1.1에서만 동작한다" },
    ],
    correctChoiceId: "a",
    explanation:
      "WebSocket은 101 Switching Protocols 핸드셰이크 후 같은 TCP 연결을 *양방향 풀듀플렉스*로 사용한다(바이너리·텍스트 모두 가능). SSE는 일반 HTTP 응답을 끝없이 유지해 서버가 `text/event-stream`으로 *클라이언트로만* 이벤트를 흘려보내는 단방향 채널이며 텍스트만 지원하지만 자동 재연결·last event id 같은 기능이 표준에 포함되어 단순 푸시엔 가볍다. 채팅처럼 양방향이 필요하면 WebSocket, 알림·티커처럼 단방향이면 SSE가 어울린다.",
    relatedTopicSlugs: ["14-network/websocket"],
  },
];
