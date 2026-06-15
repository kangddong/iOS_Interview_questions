# String, Character, Unicode

> 한 줄 요약 — Swift `String`은 *Unicode 정확성*을 위해 **grapheme cluster**(사용자 인식 문자)를 기본 단위로 다룬다. 그 대가로 `s[i]` 같은 *정수 인덱싱이 불가*하고, 길이/슬라이싱이 O(n)이며 메모리 레이아웃이 small string optimization + heap buffer 조합으로 복잡하다.

도입: Swift 5+ 현재 ABI 안정. small string은 64bit 시스템에서 15바이트까지 inline.

## 왜 정수 인덱싱이 안 되는가

```swift
let s = "café"
s.count          // 4 (Character 단위)
s[1]             // ❌ 컴파일 에러
let i = s.index(s.startIndex, offsetBy: 1)
s[i]             // "a"
```

- UTF-8 인코딩에서 한 *문자*가 1~4바이트
- 게다가 **grapheme cluster**: `"e\u{0301}"` (e + combining acute)는 2 스칼라지만 1 character
- 따라서 *임의 위치 접근*은 처음부터 grapheme 경계를 다시 세어야 함 → 정수 인덱싱이 O(1)일 수 없음
- Swift는 "거짓 O(1) 인덱싱"을 *허용하지 않는 설계 결정*을 했다 (NSString이 UTF-16 단위로 인덱싱하던 함정과 대조)

## 4개의 View — 같은 문자열의 다른 단위

```swift
let s = "café👍"

s.count              // 5 (Character)
s.unicodeScalars.count   // 5 (Unicode scalars, e+acute가 분리되면 6)
s.utf16.count        // 6 (UTF-16 code unit, 👍 surrogate pair)
s.utf8.count         // 9 (UTF-8 bytes)
```

| View | 단위 | 용도 |
|---|---|---|
| `String` | Grapheme cluster (Character) | 사용자 인식 문자, 가장 자주 사용 |
| `UnicodeScalarView` | Unicode scalar (U+...) | 정규화/분류 작업 |
| `UTF16View` | UTF-16 code unit | NSString/AttributedString 인터롭 |
| `UTF8View` | UTF-8 byte | 네트워크/파일 I/O, JSON 인코딩 |

## 메모리 레이아웃 (Small String Optimization)

64bit 시스템에서 `String`은 *16바이트 슬롯* 두 개로 구성:

| 상태 | 내용 |
|---|---|
| Small (≤15 UTF-8 bytes) | inline 저장, **힙 할당 X** |
| Large | `_StringStorage` 클래스 인스턴스 참조 + flags |
| Bridged from NSString | NSString 참조 (lazy bridging) |

```swift
let small  = "hello"          // inline, retain count 없음
let large  = String(repeating: "a", count: 100)   // heap buffer, CoW 대상
let bridged = (NSString("from objc") as String)   // bridged
```

## 성능 함정

### `.count`는 O(n)

```swift
// ❌ 매 반복마다 O(n)
for i in 0..<s.count { ... }

// ✅ 인덱스로 순회
for ch in s { ... }
```

### 문자열 결합

```swift
// ❌ O(n²) — 매번 새 버퍼 할당
var r = ""
for chunk in chunks { r += chunk }

// ✅ Array of String → 한 번에 결합
chunks.joined()                  // O(n)
```

`+=`는 작은 문자열에는 SSO + CoW로 빠르지만, 큰 누적엔 `joined`가 명백히 빠름.

### `range(of:)` vs `firstIndex(of:)`

- `range(of:)`는 Foundation 의존, locale-aware 검색 가능
- `firstIndex(of:)`는 단순 binary compare. 더 빠르지만 *Equatable* 비교만

### 정규화

- `s == "café"` 비교는 *normalize 후 grapheme 비교*
- 이미 정규화된 두 문자열 비교는 빠르지만, mixed 정규화는 O(n)

## 인터롭

### NSString ↔ String

Swift 5+에선 lazy bridging:
- ObjC API가 String을 받으면 *원본 NSString 참조를 유지*하고, 필요할 때만 복사
- `as NSString`/`as String` 캐스트는 즉시 복사 X

### CString / withCString

```swift
"hello".withCString { cstr in
    // const char* — 함수 호출 동안만 유효
    strlen(cstr)
}
```

## AttributedString (iOS 15+)

- `AttributedString`은 *값 타입 + Codable*, NSAttributedString은 *참조 타입 + ObjC*
- SwiftUI/UIKit 양쪽에서 사용. 새 코드는 AttributedString 우선
- 단점: 일부 ObjC 전용 attribute는 변환 손실

## 흔한 함정 / Follow-up

- **Q. `s[s.startIndex.advanced(by: 5)]`가 안전한가?**
  안전하지 않음. `s.count`보다 큰 offset이면 trap. `index(_:offsetBy:limitedBy:)` 사용.

- **Q. `String.count`가 왜 O(n)인가?**
  grapheme cluster 경계를 다시 세야 하므로. *length를 따로 저장하면 mutation마다 비용*이 들어 trade-off로 O(n)을 선택.

- **Q. emoji는 어떻게 표현되나?**
  대부분 1 scalar = 1 character. 단, ZWJ sequence (👨‍👩‍👧)는 *여러 scalar가 한 character*로 묶임. `.count`가 1이어야 정상.

- **Q. `String`은 thread-safe?**
  *읽기*만 동시 접근하면 안전(값 의미론, CoW가 unique 보장). 두 스레드가 같은 변수를 mutating하면 race.

- **Q. ASCII 전용 fast path가 있나?**
  있다. small string에서도 ASCII bit이 켜져 있으면 비교/iteration이 더 빠름. 한글/emoji가 섞이면 fast path 미적용.

## 참고

- Swift Language Guide: Strings and Characters
- WWDC 2019: What's new in Swift (String ABI)
- swift-evolution: SE-0163 (String ABI), SE-0178 (Add unicodeScalars property)
