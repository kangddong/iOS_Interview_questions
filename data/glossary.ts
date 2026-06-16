export interface GlossaryEntry {
  term: string;
  summary: string;
  references?: { label: string; href: string }[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  specialization: {
    term: "타입 특수화 (Specialization)",
    summary:
      "Swift 컴파일러가 제네릭 함수의 호출 지점마다 구체 타입을 박은 전용 버전을 만들어내는 최적화. 결과적으로 박싱·동적 디스패치·witness table 조회가 사라지고, 호출 비용이 비제네릭과 동일해진다. 단 모듈 경계를 넘으면 호출처에서 본문을 볼 수 없어 특수화가 일어나지 않으므로, 라이브러리에서는 `@inlinable` / `@usableFromInline`로 본문을 노출시켜야 한다.",
    references: [
      {
        label: "Swift Forums — Generic specialization",
        href: "https://forums.swift.org/t/generic-specialization/45117"
      },
      {
        label: "Swift Optimization Tips — Generics",
        href: "https://github.com/apple/swift/blob/main/docs/OptimizationTips.rst#generics"
      }
    ]
  },
  pat: {
    term: "PAT (Protocol with Associated Type)",
    summary:
      "associatedtype을 가진 프로토콜. 타입이 컴파일 타임에 고정되지 않아 변수 타입으로 직접 쓰지 못하고(`Self or associated type requirements`), 제네릭 제약(`some P` / `any P` / `where`)으로만 사용할 수 있다. Swift 5.7부터 `any P`로 existential 사용 폭이 넓어졌고, `some P`는 opaque 반환 타입으로 단일 구체 타입을 숨길 때 쓴다.",
    references: [
      {
        label: "SE-0309 — Unlock existentials for all protocols",
        href: "https://github.com/apple/swift-evolution/blob/main/proposals/0309-unlock-existential-types-for-all-protocols.md"
      }
    ]
  }
};
