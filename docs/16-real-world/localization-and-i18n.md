# Localization & i18n

> 한 줄 요약 — **i18n(internationalization)은 "현지화 가능하도록 코드를 짜는 것"이고, l10n(localization)은 "실제 언어/지역 데이터를 채우는 것"**이다. iOS는 문자열 추출·복수형·날짜·통화·RTL을 *서로 다른 시스템*으로 다루기 때문에, 하나라도 빼면 특정 로케일에서 UI가 무너진다.

도입 버전: `Localizable.strings` (iOS 2+), `Localizable.stringsdict` (iOS 7+ pluralization), `NumberFormatter`/`DateFormatter` (iOS 2+), `RelativeDateTimeFormatter` (iOS 13+), `Date.FormatStyle`/`Measurement.FormatStyle` (iOS 15+), **String Catalogs (`.xcstrings`)** (iOS 17+/Xcode 15+)

## 핵심 개념

- **String Catalogs (`.xcstrings`)** — iOS 17+ Xcode 15부터의 *공식 권장 포맷*. JSON 기반, Xcode 빌드 시 *코드에서 사용하는 키*를 자동 추출, 누락된 번역을 GUI에서 추적. `Localizable.strings` + `stringsdict`를 한 파일로 통합.
- **키 전략**
  - **Key as English text**: `NSLocalizedString("Sign in", comment: "")` — 직관적, 번역가도 컨텍스트 쉽게 파악. 영어가 *원본*인 팀에 적합.
  - **Semantic key**: `NSLocalizedString("auth.signin.cta", ...)` — 같은 영문이 화면마다 다른 의미일 때 분리 가능. 대형 팀에 적합.
- **Pluralization** — `stringsdict` 또는 String Catalog의 plural variation. 언어마다 `zero/one/two/few/many/other` 카테고리가 다름 (예: 러시아어는 5/few/many 모두 사용).
- **Format specifier** — `%@` (object), `%lld` (Int64), `%1$@` 처럼 *위치 인덱스*로 어순 차이 흡수.
- **RTL (아랍어/히브리어)** — `UISemanticContentAttribute` + Auto Layout이 leading/trailing 사용 시 자동 미러링. *image asset*은 별도 미러링 키 (`imageFlippedForRightToLeftLayoutDirection`).
- **Dynamic Type** — 텍스트 크기를 시스템 설정에 따라 확장. 다국어와 *별개 축*이지만 같이 깨지기 쉬움.
- **포맷터 (locale-aware)**
  - 숫자: `Decimal.FormatStyle`, 통화: `.currency(code:)`, 측정값: `Measurement.FormatStyle`, 날짜/상대: `Date.FormatStyle`, `RelativeDateTimeFormatter`.
- **List/Person Name**: `ListFormatter`, `PersonNameComponentsFormatter` — 이름 순서/리스트 구분자도 로케일별.

## 동작 흐름 (단계별)

1. 코드에서 `String(localized: "auth.signin.cta", defaultValue: "Sign in")` 사용.
2. 빌드 시 Xcode가 String Catalog에 자동 등록.
3. 번역가가 Catalog에서 언어별 번역 입력 (또는 XLIFF export/import로 외부 도구 연동).
4. 런타임에 시스템이 *Bundle.preferredLocalizations*와 *사용자 설정*을 매칭해 해당 언어 리소스 로드.
5. 누락된 번역은 *fallback 체인* (앱 dev language → en → key 자체).

## 코드 / 설정 예시

```swift
// Swift 5.9 / iOS 17+ — String Catalog와 가장 잘 어울리는 API
let title = String(localized: "checkout.title", defaultValue: "Checkout", comment: "결제 화면 헤더")

// 매개변수 + 어순 흡수
let msg = String(localized: "search.results \(query) \(count)",
                 defaultValue: "‘\(query)’에 대한 결과 \(count)건")

// SwiftUI
Text("checkout.title")               // 자동 추출
Text("search.results \(query) \(count)")
```

```json
// Localizable.xcstrings (발췌)
{
  "sourceLanguage": "en",
  "strings": {
    "items.count": {
      "localizations": {
        "en": { "variations": { "plural": {
          "zero":  { "stringUnit": { "value": "No items" } },
          "one":   { "stringUnit": { "value": "%lld item" } },
          "other": { "stringUnit": { "value": "%lld items" } }
        }}},
        "ru": { "variations": { "plural": {
          "one":   { "stringUnit": { "value": "%lld предмет" } },
          "few":   { "stringUnit": { "value": "%lld предмета" } },
          "many":  { "stringUnit": { "value": "%lld предметов" } },
          "other": { "stringUnit": { "value": "%lld предмета" } }
        }}},
        "ko": { "stringUnit": { "value": "항목 %lld개" } }
      }
    }
  }
}
```

```swift
// 포맷터 — 사용자의 로케일/통화를 따른다
let price = Decimal(12990)
let formatted = price.formatted(.currency(code: "KRW"))   // "₩12,990"

let date = Date()
let s1 = date.formatted(.dateTime.year().month().day())    // 로케일별 어순
let rel = date.addingTimeInterval(-3600)
            .formatted(.relative(presentation: .named))    // "1 hour ago" / "1시간 전"
```

```swift
// Dynamic Type
Text("greeting")
    .font(.body)                       // 자동 확장
    .dynamicTypeSize(...DynamicTypeSize.accessibility3)  // 상한 권장
```

## 비교

| 구분 | `Localizable.strings` + `stringsdict` | String Catalog (`.xcstrings`) |
|---|---|---|
| 도입 | iOS 7~ | iOS 17 / Xcode 15+ |
| 키 추출 | 수동 `genstrings` | 빌드 시 자동 |
| 누락 추적 | 없음 | Xcode UI에서 상태 표시 |
| pluralization | 별 파일 | 한 파일 |
| 외부 협업 | XLIFF | XLIFF + JSON |
| 마이그레이션 | — | Xcode 메뉴 "Migrate" |

## 보안 / 함정

- **`String(format:)` + 사용자 입력**: 형식 문자열을 *사용자 입력으로 만들면* format string vulnerability 가능. 항상 *리터럴*로 형식을 정의하고 인자만 변수로.
- **Hardcoded 문자열 누락**: 디자인 QA 단계에서 *영문 잔존*이 가장 흔한 버그. CI에 *non-localized literal 스캐너* 추천 (SwiftLint `nslocalizedstring_key`, swift-translate).
- **DateFormatter 캐시**: 매번 생성하면 *수십 ms* 비용. 한 번 만들어 재사용 (단 `locale`이 바뀌면 갱신).
- **RTL에서 이미지**: 화살표/말풍선 꼬리는 미러링이 필요, 로고는 미러링 금지. asset별 *mirroring 정책*을 명시.
- **글자수 가정 금지**: 독일어는 영어 대비 30~50% 길고, 일본어는 짧지만 줄바꿈 규칙이 다르다. 고정 폭 layout은 *Dynamic Type + 다국어*에서 먼저 깨진다.
- **숫자/통화 직접 포매팅 금지**: `String(format: "%.2f")`는 *소수점·자릿수 구분자*를 로케일별로 처리하지 못한다 (예: `1,234.5` vs `1.234,5`). 반드시 FormatStyle.
- **검색/정렬**: `localizedCompare`, `localizedCaseInsensitiveCompare` — 한글 자모 정렬이 의도와 다를 수 있어 *검색 인덱스*는 별도 정규화.

## 흔한 함정 / Follow-up

- **Q. 앱 안에서 언어를 따로 고르게 하고 싶다.**
  - A. iOS 13+ Settings 앱에 *앱별 언어* 자동 제공 (Info.plist `CFBundleLocalizations` 채우면 됨). 앱 내부에서 강제 변경은 `Bundle` swizzling이 필요한데 비권장.
- **Q. pluralization을 if/else로 처리하면 안 되나?**
  - A. 동작은 하지만 *러시아어/아랍어* 같은 다중 카테고리 언어에서 깨진다. plural 규칙은 *CLDR* 표준을 따라야 함.
- **Q. RelativeDateTimeFormatter가 "0초 전"을 어색하게 출력.**
  - A. *임계값* (5초, 1분) 안쪽은 "방금"으로 직접 매핑하고 그 이상만 포매터에 넘기는 게 정석.
- **Q. SwiftUI `Text("Hello")`는 자동 번역되나?**
  - A. *LocalizedStringKey*로 추론되어 자동 번역. 단 `Text(someStringVar)`는 *문자열 리터럴이 아니므로* 번역되지 않음. `Text(LocalizedStringKey(someVar))` 또는 `String(localized:)`.
- **Q. Dynamic Type AX5에서 버튼이 잘린다.**
  - A. `ViewThatFits`, `Layout` 프로토콜, 또는 *vertical stack 폴백*. Apple은 *AX 사이즈에서 별도 레이아웃 분기*를 권장.
- **Q. 회귀 테스트는 어떻게?**
  - A. (1) `-AppleLocale` launch argument로 UI test 다국어 실행, (2) snapshot test의 *언어 × Dynamic Type* 매트릭스, (3) `pseudo-localization` (Xcode Scheme의 *Show non-localized strings*).

## 참고

- WWDC 2023 — *Discover String Catalogs*
- WWDC 2021 — *Localize your SwiftUI app*
- WWDC 2020 — *Streamline your localized strings*
- Apple Docs: *Preparing your app for localization*, *Date.FormatStyle*
- CLDR: cldr.unicode.org
