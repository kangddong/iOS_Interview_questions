# OSI 7계층 / TCP-IP 4계층

> 한 줄 요약 — 네트워크 통신을 *역할별로 층층이 쌓은 추상*. OSI는 *교과서 7층*, 실무는 *TCP/IP 4층*. 각 층은 *자기 책임*만 하고 위/아래 층의 세부를 모른다 (캡슐화).

## OSI 7계층

| Layer | 이름 | 역할 | 예 |
|---|---|---|---|
| 7 | Application | 사용자 응용 | HTTP, SMTP, FTP |
| 6 | Presentation | 인코딩, 암호화 | TLS (일부), JSON |
| 5 | Session | 연결 관리 | RPC, NetBIOS |
| 4 | Transport | 종단 간 신뢰성 | TCP, UDP |
| 3 | Network | 라우팅 | IP, ICMP |
| 2 | Data Link | 물리 매체 위 프레임 | Ethernet, Wi-Fi MAC |
| 1 | Physical | 신호 | 전기, 광 |

## TCP-IP 4계층 (실무 기준)

```
┌─────────────────────────────┐
│  Application                │  HTTP, DNS, FTP, WebSocket
├─────────────────────────────┤
│  Transport                  │  TCP, UDP, QUIC
├─────────────────────────────┤
│  Internet                   │  IP, ICMP
├─────────────────────────────┤
│  Network Access (Link)      │  Ethernet, Wi-Fi
└─────────────────────────────┘
```

OSI 5/6/7을 *Application*으로 합치고, 1/2를 *Network Access*로 합친 모델.

## 캡슐화 (Encapsulation)

```
[App data]
[TCP header | App data]                            ← Transport
[IP header | TCP header | App data]                ← Network
[Ethernet header | IP | TCP | data | trailer]      ← Link
```

위층의 페이로드를 아래층이 *자기 헤더로 감싸서* 전송. 받는 쪽은 역순으로 벗김.

## 각 층의 *주소*

| Layer | 주소 |
|---|---|
| Application | URL, 도메인 |
| Transport | 포트 (16-bit) |
| Internet | IP 주소 (IPv4 32-bit, IPv6 128-bit) |
| Link | MAC 주소 (48-bit) |

`https://api.example.com:443/users/1`
- DNS: example.com → IP
- IP: 어떤 호스트로 보낼지
- TCP: 443 포트의 서비스
- HTTP: GET /users/1

## 면접 단골 — 데이터가 떠나는 순서

```
1. URL 파싱 → 도메인/포트/경로 추출
2. DNS 조회 (UDP 53) → IP
3. TCP 3-way handshake → 연결
4. (HTTPS) TLS handshake → 키 교환
5. HTTP 요청 송신
6. 응답 수신
7. 연결 유지(keep-alive) 또는 종료(4-way)
```

이 답을 *순서대로* 막힘없이 말할 수 있으면 신입/주니어 OK.

## 비교 — OSI vs TCP-IP

| | OSI | TCP-IP |
|---|---|---|
| 층 수 | 7 | 4 (또는 5) |
| 출처 | ISO 표준 (모델 중심) | 인터넷 실제 구현 |
| 사용 | 교과서/이론 | 실무 |
| Session/Presentation | 별도 | Application에 포함 |

## 흔한 함정 / Follow-up

- **Q. TLS는 어느 층?**
  엄밀히 *Presentation*이지만, TCP-IP 모델에선 *Transport와 Application 사이*에 끼어 있다고 본다. TCP 위, HTTP 아래.

- **Q. WebSocket은?**
  Application 층. TCP 위에서 동작. HTTP로 시작해 *Upgrade*로 전환.

- **Q. IPv4 주소가 부족하면?**
  NAT (Network Address Translation)로 사설 IP 공유. IPv6 점진 도입. 모바일 캐리어는 NAT 다수 운영.

- **Q. iOS 앱이 직접 IP/MAC을 다루는가?**
  거의 없음. URLSession이 다 추상화. 저수준 소켓이 필요하면 `Network.framework`.

- **Q. localhost / 127.0.0.1?**
  자기 자신을 가리키는 *루프백*. 외부 네트워크 안 거치고 바로.

## 참고

- TCP/IP Illustrated (Stevens)
- Apple Docs: Network framework
