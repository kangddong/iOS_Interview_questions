import SwiftUI
import Foundation

// 대부분 Obj-C는 historical 컨텍스트라 Theory 위주.
// KVO/runtime은 Swift의 NSObject 기반으로 실측 가능.

struct ObjCARCMRCDemo: Demo {
    static let id = "objc.arc-mrc"
    static let title = "Obj-C ARC vs MRC"
    static let summary = "iOS 5+에서 ARC가 컴파일러가 retain/release 자동 삽입. 기존 코드는 MRC."
    static let docPath = "docs/17-objective-c/arc-and-mrc.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "MRC: [obj retain]/release/autorelease 수동",
            "ARC: 컴파일러가 lifetime 추론, retain/release 자동 삽입",
            "strong/weak/copy/assign이 ownership 키워드",
            "Swift는 처음부터 ARC + 더 엄격한 ownership 모델",
        ])
    }
}

struct ObjCAutoreleasepoolDemo: Demo {
    static let id = "objc.autoreleasepool"
    static let title = "Obj-C @autoreleasepool"
    static let summary = "RunLoop 끝에 일괄 release. 큰 임시 객체 루프에서 명시적 풀로 메모리 피크 감소."
    static let docPath = "docs/17-objective-c/autoreleasepool.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            for i in 0..<3 {
                autoreleasepool {
                    let s = NSString(string: String(repeating: "x", count: 1_000_000))
                    log.log("iter \(i): \(s.length) chars (풀 종료시 release)")
                }
            }
        }
    }
}

struct ObjCBlocksDemo: Demo {
    static let id = "objc.blocks"
    static let title = "Obj-C Blocks"
    static let summary = "^{} 클로저. __block로 가변 캡처, __weak/__strong로 retain cycle 차단."
    static let docPath = "docs/17-objective-c/blocks.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Swift 클로저와 호환 — block typedef는 Swift에서 closure로 보임",
            "self 캡처 cycle 방지: __weak typeof(self) weakSelf = self;",
            "stack/heap/global 3종 블록. heap으로 자동 복사되는 시점에 캡처 객체 retain",
            "@escaping은 Swift의 ABI 차원에서 block의 'copy' 동작과 유사",
        ])
    }
}

struct ObjCCategoriesDemo: Demo {
    static let id = "objc.categories"
    static let title = "Categories & Extensions"
    static let summary = "기존 클래스에 메서드 추가. Swift extension은 비슷하지만 메서드 swizzle 불가."
    static let docPath = "docs/17-objective-c/categories-and-extensions.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Obj-C category(.h/.m): NSString+Trim 같은 식으로 분리",
            "런타임에 method를 클래스에 추가 — 충돌 시 미정의 동작",
            "Swift extension: 정적, 새 ivar 추가 불가, 오버라이드 제약",
            "Obj-C runtime 호출(method_swizzle)은 KVO/디버깅 도구에서 사용",
        ])
    }
}

struct ObjCKVOKVCDemo: Demo {
    static let id = "objc.kvo-kvc"
    static let title = "KVO / KVC"
    static let summary = "NSObject 기반 동적 옵저빙 + 키패스 기반 set/get. Swift에서도 @objc dynamic으로 사용 가능."
    static let docPath = "docs/17-objective-c/kvo-kvc.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            final class Obj: NSObject {
                @objc dynamic var name: String = "K"
            }
            let o = Obj()
            let token = o.observe(\.name, options: [.new]) { _, change in
                log.log("KVO: name → \(change.newValue ?? "")")
            }
            o.name = "Y"
            o.name = "D"
            token.invalidate()
        }
    }
}

struct ObjCMethodDispatchDemo: Demo {
    static let id = "objc.method-dispatch"
    static let title = "Obj-C Method Dispatch"
    static let summary = "objc_msgSend로 모든 메시지 전달. 동적이고 가로채기 가능."
    static let docPath = "docs/17-objective-c/method-dispatch.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "[obj foo] → objc_msgSend(obj, @selector(foo))",
            "Class별 method list 캐시 → 빠른 lookup",
            "respondsToSelector:, forwardingTargetForSelector: 등 메시지 가로채기",
            "Swift의 @objc dynamic이 이 경로를 명시적으로 선택",
        ])
    }
}

struct ObjCOwnershipDemo: Demo {
    static let id = "objc.ownership"
    static let title = "Obj-C Ownership Qualifiers"
    static let summary = "__strong(기본), __weak, __unsafe_unretained, __autoreleasing."
    static let docPath = "docs/17-objective-c/ownership-qualifiers.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "__strong: 기본. 객체 RC 증가",
            "__weak: RC 안 올림, 해제되면 nil로 안전",
            "__unsafe_unretained: weak처럼 nil 안 만들어줌 — dangling 위험",
            "__autoreleasing: out-parameter (NSError **) 같은 용도",
        ])
    }
}

struct ObjCPropertiesDemo: Demo {
    static let id = "objc.properties"
    static let title = "Obj-C Properties"
    static let summary = "@property (nonatomic, strong/weak/copy/assign) ownership/atomic/저장 방식 선언."
    static let docPath = "docs/17-objective-c/properties.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "atomic vs nonatomic: 보통 nonatomic 사용 (UIKit은 main thread 전제)",
            "copy: NSString/NSArray 같은 가변 변종 방어 (NSMutableString 받아 NSString으로 copy)",
            "readwrite/readonly: 외부에 readonly + 내부 .m에서 readwrite redefine 흔함",
            "Swift의 var/let/let private(set)이 대응 개념",
        ])
    }
}

struct ObjCProtocolsDemo: Demo {
    static let id = "objc.protocols"
    static let title = "Obj-C Protocols"
    static let summary = "@protocol 선언 + @required/@optional. Swift의 @objc protocol과 직접 호환."
    static let docPath = "docs/17-objective-c/protocols.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "@optional 메서드는 respondsToSelector: 체크 후 호출",
            "Swift에서 @objc protocol 채택하면 optional 가능",
            "Delegate 패턴이 대표 사용처",
            "Class-bound: @protocol Foo<NSObject> — Swift의 AnyObject 제약과 유사",
        ])
    }
}

struct ObjCRuntimeDemo: Demo {
    static let id = "objc.runtime"
    static let title = "Obj-C Runtime"
    static let summary = "class_addMethod, method_exchangeImplementations 등 동적 조작 API."
    static let docPath = "docs/17-objective-c/runtime.md"
    static func makeView() -> some View {
        ConsoleDemoView { log in
            let cls: AnyClass = NSString.self
            var count: UInt32 = 0
            if let methodList = class_copyMethodList(cls, &count) {
                log.log("NSString method 수 = \(count)")
                let some = (0..<min(5, Int(count))).map { String(cString: sel_getName(method_getName(methodList[$0]))) }
                for n in some { log.log(" • \(n)") }
                free(methodList)
            }
        }
    }
}

struct ObjCSwiftInteropDemo: Demo {
    static let id = "objc.swift-interop"
    static let title = "Obj-C ↔ Swift Interop"
    static let summary = "bridging header / module map. NSError ↔ Swift Error, nullable annotation."
    static let docPath = "docs/17-objective-c/swift-interop.md"
    static func makeView() -> some View {
        TheoryCard(bullets: [
            "Swift → Obj-C 노출: @objc, @objcMembers, dynamic",
            "Obj-C → Swift 노출: 헤더에 nullability + NS_SWIFT_NAME 어노테이션",
            "NSError → throws 자동 매핑 (마지막 NSError** 파라미터 패턴)",
            "Generic Obj-C class는 Swift에서 lightweight generic으로 노출",
        ])
    }
}
