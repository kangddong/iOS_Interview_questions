# Enum

> 한 줄 요약 — *유한한 케이스의 합 타입*. raw value(원시값), associated value(연관값), `indirect`(재귀)로 확장된다. Swift enum은 단순 정수 매핑이 아니라 *대수적 데이터 타입*.

## 케이스 유형

```swift
// 1) 단순 케이스
enum Direction { case up, down, left, right }

// 2) Raw value — 모든 케이스가 동일 타입의 원시값을 가짐
enum Status: Int { case ok = 200, notFound = 404 }
enum Lang: String { case ko, en }   // 자동: "ko", "en"

// 3) Associated value — 케이스마다 다른 타입의 페이로드
enum Result<T, E: Error> {
    case success(T)
    case failure(E)
}

// 4) Indirect — 재귀 케이스
indirect enum Tree<T> {
    case leaf
    case node(T, Tree<T>, Tree<T>)
}
```

raw value와 associated value는 **동시에 사용 불가**.

## 패턴 매칭

```swift
switch result {
case .success(let v) where v > 0: ...
case .success: ...
case .failure(let e): log(e)
}

if case .success(let v) = result { use(v) }
guard case .failure(let e) = result else { return }
```

## CaseIterable / RawRepresentable

```swift
enum Tab: String, CaseIterable { case home, search, me }

Tab.allCases    // [.home, .search, .me]
Tab(rawValue: "home")   // .home? (failable init)
```

- `CaseIterable`은 associated value 없는 enum에 자동 합성
- `RawRepresentable`은 raw value 선언 시 자동 채택

## 메모리 표현

- 단순 enum: `UInt8`로 충분하면 1바이트
- associated value enum: `max(case 페이로드 크기) + 태그 비트`
- 옵셔널이 enum이지만 *non-zero pointer optimization*으로 추가 비트 없이 저장되는 경우 있음

## 흔한 함정 / Follow-up

- **Q. enum에 stored property를 못 넣는 이유?**
  값이 케이스 자체로 결정되어야 하므로. *computed* property는 가능, static let도 가능.

- **Q. `mutating` 메서드에서 케이스 자체를 바꿀 수 있나?**
  가능. `self = .other`.

- **Q. raw value enum을 외부 입력으로 만들 때?**
  `init?(rawValue:)`은 failable. 알 수 없는 값에 대비해 nil 처리.

- **Q. 새 케이스 추가가 깨뜨리는 호환성?**
  `@frozen` enum은 향후 케이스 추가 안 함을 약속 (라이브러리 안정성). non-frozen에 대한 switch는 `@unknown default` 권장.

- **Q. `indirect`는 왜 필요?**
  enum은 값 타입이라 자기 자신을 직접 포함할 수 없음 (사이즈 무한). `indirect`가 그 케이스를 힙 박스로 감쌈.

- **Q. `OptionSet`과 enum 차이?**
  `OptionSet`은 비트마스크 기반 *조합 가능한* 옵션. enum은 단일 케이스 선택. 권한 플래그 같은 OR 조합엔 OptionSet.

## 참고

- Swift Language Guide: Enumerations
- SE-0192 (frozen enums)
