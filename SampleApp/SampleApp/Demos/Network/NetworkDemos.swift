import SwiftUI
import Network

struct OSITCPIPDemo: Demo {
    static let id = "network.osi-tcp-ip"
    static let title = "OSI / TCP-IP"
    static let summary = "L1 Physical ↔ L7 Application. iOS는 보통 L7 HTTP를 다루지만 하위 동작을 알면 디버깅 쉬움."
    static let docPath = "docs/14-network/osi-and-tcp-ip.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "OSI: Physical/Data Link/Network/Transport/Session/Presentation/Application",
            "TCP-IP: Link/Internet(IP)/Transport(TCP-UDP)/Application(HTTP-DNS-...)",
            "패킷 = 헤더(각 레이어) + 페이로드. 레이어 내려갈수록 헤더 추가",
            "Mobile 환경은 NAT, 셀룰러 PDP context, IPv4/IPv6 dual stack 등 이슈 많음",
        ])
    }
}

struct HTTPBasicsDemo: Demo {
    static let id = "network.http-basics"
    static let title = "HTTP Basics"
    static let summary = "Method/Status/Header/Body. stateless. caching/conditional request."
    static let docPath = "docs/14-network/http-basics.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            Task {
                var req = URLRequest(url: URL(string: "https://httpbin.org/get?foo=bar")!)
                req.httpMethod = "GET"
                req.setValue("application/json", forHTTPHeaderField: "Accept")
                do {
                    let (data, resp) = try await URLSession.shared.data(for: req)
                    if let http = resp as? HTTPURLResponse { log.log("status \(http.statusCode), CT=\(http.value(forHTTPHeaderField: "Content-Type") ?? "")") }
                    log.log(String(data: data, encoding: .utf8)?.prefix(200) ?? "")
                } catch { log.log("err: \(error)") }
            }
        }
    }
}

struct HTTP23Demo: Demo {
    static let id = "network.http-2-3"
    static let title = "HTTP/2 & HTTP/3"
    static let summary = "HTTP/2 = 다중화 + 헤더 압축. HTTP/3 = QUIC(UDP) 기반 — 패킷 손실 대응 ↑."
    static let docPath = "docs/14-network/http2-http3.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "HTTP/2: 한 TCP 연결에서 다중 stream → head-of-line blocking은 TCP 차원에서 여전",
            "HPACK: 정적/동적 테이블로 헤더 압축",
            "HTTP/3: QUIC(UDP+TLS1.3) — stream level loss는 다른 stream 영향 없음",
            "iOS는 URLSession이 자동 협상, 별도 설정 거의 불필요",
        ])
    }
}

struct HTTPSTLSDemo: Demo {
    static let id = "network.https-tls"
    static let title = "HTTPS / TLS"
    static let summary = "HTTP over TLS. 인증서 체인 검증 + 세션 키로 암호화."
    static let docPath = "docs/14-network/https-and-tls.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "TLS = handshake(키 교환/검증) + record(대칭 암호 통신)",
            "인증서 체인: 루트 CA → 중간 CA → 도메인. OS가 루트 신뢰 저장소 관리",
            "iOS: ATS(App Transport Security)가 HTTPS+TLS1.2+ 강제",
            "예외는 Info.plist NSAppTransportSecurity에 명시",
        ])
    }
}

struct TLSHandshakeDemo: Demo {
    static let id = "network.tls-handshake"
    static let title = "TLS Handshake Deep"
    static let summary = "ClientHello/ServerHello → 키 교환 → Finished. TLS1.3에서 1-RTT, 0-RTT 가능."
    static let docPath = "docs/14-network/tls-handshake-deep.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "ClientHello: 지원 cipher suite, random, sni 등",
            "ServerHello + Certificate + KeyShare(TLS1.3)",
            "Master Secret 도출 → record layer로 대칭 암호 시작",
            "1-RTT(TLS1.3 기본), 0-RTT(session resumption + early data)",
        ])
    }
}

struct DNSCachingDemo: Demo {
    static let id = "network.dns-caching"
    static let title = "DNS & Caching"
    static let summary = "도메인 → IP. OS/네트워크/CDN 단계마다 캐싱. TTL에 따라 만료."
    static let docPath = "docs/14-network/dns-and-caching.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let host = NWEndpoint.Host("apple.com")
            log.log("resolve \(host) 시도 (Network framework)")
            let monitor = NWPathMonitor()
            monitor.start(queue: .global())
            log.log("현재 path status = \(monitor.currentPath.status)")
            monitor.cancel()
        }
    }
}

struct TCPvsUDPDemo: Demo {
    static let id = "network.tcp-vs-udp"
    static let title = "TCP vs UDP"
    static let summary = "TCP: 연결지향·신뢰성·순서. UDP: 비연결·빠름·손실 가능."
    static let docPath = "docs/14-network/tcp-vs-udp.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "TCP: 3-way handshake, 순서 보장, 흐름/혼잡 제어. HTTP 1.1/2",
            "UDP: 패킷 그대로 보내고 끝. DNS, RTP, QUIC(HTTP/3)",
            "WebRTC 음성/영상 = UDP + 자체 재전송 (Latency 우선)",
            "iOS Network framework로 둘 다 직접 사용 가능",
        ])
    }
}

struct RESTAPIDemo: Demo {
    static let id = "network.rest"
    static let title = "REST API Design"
    static let summary = "리소스 중심 URI + HTTP method 동사. 멱등성, 상태코드 사용."
    static let docPath = "docs/14-network/rest-api-design.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "GET (안전·멱등), PUT (멱등), POST (생성), DELETE (멱등)",
            "URI는 명사: /users/123/orders/4 — 동사 금지",
            "Status: 200/201/204, 400 잘못된 요청, 401 인증, 403 권한, 404, 409, 422, 5xx",
            "버전은 /v1/... 또는 Accept header (vnd.app.v1+json)",
        ])
    }
}

struct WebSocketDemo: Demo {
    static let id = "network.websocket"
    static let title = "WebSocket"
    static let summary = "한 TCP 위 양방향 메시지. URLSessionWebSocketTask로 사용."
    static let docPath = "docs/14-network/websocket.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            guard let url = URL(string: "wss://echo.websocket.events") else { return }
            let task = URLSession.shared.webSocketTask(with: url)
            task.resume()
            task.send(.string("hello")) { err in
                if let err { log.log("send err: \(err)") } else { log.log("sent") }
            }
            task.receive { result in
                switch result {
                case .success(.string(let s)): log.log("echo: \(s)")
                case .success(.data(let d)):   log.log("echo data \(d.count)b")
                case .failure(let err):        log.log("recv err: \(err)")
                @unknown default: break
                }
                task.cancel(with: .normalClosure, reason: nil)
            }
        }
    }
}
