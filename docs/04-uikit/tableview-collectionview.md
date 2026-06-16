# UITableView / UICollectionView

> 한 줄 요약 — 큰 리스트를 효율적으로 보여 주려고 **셀을 재사용**하는 뷰. *재사용 풀에서 빼서 모델 데이터로 다시 채우는* 사이클이 핵심.

## 셀 재사용 메커니즘

화면에 보이는 셀만 메모리에 유지. 스크롤로 사라진 셀은 **재사용 큐**로 돌아가, 다음에 등장할 셀에 다시 쓰임.

```swift
func tableView(_ tv: UITableView, cellForRowAt ip: IndexPath) -> UITableViewCell {
    let cell = tv.dequeueReusableCell(withIdentifier: "Cell", for: ip) as! MyCell
    cell.bind(items[ip.row])      // 매번 데이터 다시 채우기
    return cell
}
```

`dequeueReusableCell`은 풀에 여분이 있으면 그것을, 없으면 새로 만들어 반환. 재사용된 셀에는 *이전 데이터*가 남아있을 수 있어서 항상 *전체 상태*를 다시 세팅해야 한다.

### prepareForReuse

```swift
override func prepareForReuse() {
    super.prepareForReuse()
    imageView.image = nil          // 이전 이미지 잔상 제거
    cancelInFlightImageLoad?()
}
```

비동기 이미지 로딩, 진행 표시 등은 여기서 리셋.

## 셀 깜빡임 / 잘못된 이미지 — 재사용 함정

비동기 이미지 로딩 시 흔한 버그:

```swift
cell.imageView.image = nil
api.loadImage(url) { image in
    cell.imageView.image = image     // ❌ 이 셀이 이미 다른 row에 재사용됐을 수 있음
}
```

해결 — 셀에 *현재 어떤 식별자를 위해 로드 중인지* 기록:

```swift
cell.tag = ip.row    // 또는 더 안전하게 url 보관
api.loadImage(url) { [weak cell] image in
    guard cell?.tag == ip.row else { return }
    cell?.imageView.image = image
}
```

또는 NSCache + cancel 토큰을 셀에 저장.

## diffable data source (iOS 13+)

전통 `numberOfRows`/`cellForRow` 방식 대신 *스냅샷*으로 데이터 변경을 표현. 자동으로 insert/delete/move 애니메이션 계산.

```swift
var dataSource: UITableViewDiffableDataSource<Section, Item>!

func apply(items: [Item]) {
    var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
    snapshot.appendSections([.main])
    snapshot.appendItems(items, toSection: .main)
    dataSource.apply(snapshot, animatingDifferences: true)
}
```

`Item`은 `Hashable`이어야 함. *값 동일성*을 잘못 정의하면 변경되지 않은 셀이 reload됨.

## prefetching

스크롤 직전에 미리 데이터를 가져오는 훅.

```swift
extension VC: UITableViewDataSourcePrefetching {
    func tableView(_ tv: UITableView, prefetchRowsAt indexPaths: [IndexPath]) {
        for ip in indexPaths { ImageLoader.preload(items[ip.row].url) }
    }
    func tableView(_ tv: UITableView, cancelPrefetchingForRowsAt indexPaths: [IndexPath]) { ... }
}
tv.prefetchDataSource = self
```

## UITableView vs UICollectionView

| 구분 | UITableView | UICollectionView |
|---|---|---|
| 레이아웃 | 수직 단일 컬럼 | 임의 (Flow, Compositional, custom) |
| 셀 모양 | 고정된 row 높이 (또는 self-sizing) | 자유 |
| 헤더/푸터 | 섹션당 1개 | 섹션당 여러 supplementary view 가능 |
| 사용처 | 단순 리스트 (설정, 메시지) | 그리드, 복합 레이아웃 |

iOS 13+ `UICollectionViewCompositionalLayout`이 등장하면서 거의 모든 리스트를 collection view로 만드는 추세.

## 셀 높이 (self-sizing)

```swift
tv.rowHeight = UITableView.automaticDimension
tv.estimatedRowHeight = 80     // 추정값 — 스크롤바 부정확 방지
```

셀 내부 제약이 top→bottom으로 *닫혀 있어야* 자동 높이 계산 가능. 한 군데라도 우선순위 충돌이 있으면 콘솔 경고와 함께 잘못된 높이.

## 흔한 함정 / Follow-up

- **Q. 셀 재사용 시 이미지가 깜빡이는 원인은?**
  비동기 로드 결과가 *다른 row를 위해 재사용된 셀*에 도달. row 식별자/URL 검사로 가드.

- **Q. `numberOfRowsInSection`이 매우 느리면?**
  계산이 들어 있으면 안 됨. *상수 시간*에 반환되어야 함. 데이터 캐시.

- **Q. `reloadData()` vs `performBatchUpdates`?**
  reloadData는 통째 다시. 애니메이션 없음, 큰 비용. 부분 업데이트는 batch updates 또는 diffable.

- **Q. self-sizing이 안 먹는 이유?**
  - estimated 누락
  - 셀 contentView에 제약이 *세로로 닫히지 않음* (intrinsic만으로 결정 못 함)
  - UILabel의 `numberOfLines`가 1로 고정

- **Q. UICollectionViewCompositionalLayout의 장점?**
  Section/Group/Item 트리로 *레이아웃을 데이터처럼 조립*. 가로 스크롤 섹션, 워터폴, App Store 스타일 레이아웃을 코드로 표현 가능.

- **Q. cell registration (iOS 14+)?**
  `UICollectionView.CellRegistration`로 identifier 문자열 없이 등록. 최근 권장 방식.

## 참고

- Apple Docs: UITableView, UICollectionView
- WWDC 2019: Advances in UI Data Sources (Diffable Data Source)
- WWDC 2020: Advances in UICollectionView (Compositional Layout, Cell Registration)
