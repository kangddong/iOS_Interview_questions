export interface ExamPart {
  id: string;
  label: string;
  match: RegExp;
}

export const EXAM_PARTS: ExamPart[] = [
  { id: "swift",        label: "Swift Language",        match: /^Swift($| |\/|\b)/i },
  { id: "memory",       label: "Memory / 성능 모델",      match: /Memory/i },
  { id: "concurrency",  label: "Concurrency",            match: /Concurrency/i },
  { id: "uikit",        label: "UIKit",                  match: /UIKit/i },
  { id: "swiftui",      label: "SwiftUI",                match: /SwiftUI/i },
  { id: "architecture", label: "Architecture",           match: /Architecture/i },
  { id: "networking",   label: "Networking / Persistence", match: /Networking|Persistence/i },
  { id: "testing",      label: "Testing",                match: /Testing/i },
  { id: "performance",  label: "Performance",            match: /Performance/i },
  { id: "build",        label: "Build / Release",        match: /Build|Release|DevOps/i },
  { id: "patterns",     label: "Design Patterns",        match: /Pattern/i },
  { id: "cs",           label: "CS Fundamentals",        match: /CS Fundamentals/i },
  { id: "network",      label: "Network",                match: /^Network($| |\/|\b)/i },
  { id: "security",     label: "보안",                    match: /보안|Security/i },
  { id: "scenario",     label: "통합 시나리오",            match: /시나리오|Scenario/i },
  { id: "paradigms",    label: "Paradigms (OOP/FP)",     match: /Paradigm|OOP|FP/i },
  { id: "realworld",    label: "Real-World iOS",         match: /Real-World|RealWorld|실무/i },
  { id: "objc",         label: "Objective-C",            match: /Objective-C|ObjC/i },
  { id: "etc",          label: "기타",                    match: /기타/i },
];

const FALLBACK_PART_ID = "etc";

export function partIdFor(category: string): string {
  for (const part of EXAM_PARTS) {
    if (part.match.test(category)) return part.id;
  }
  return FALLBACK_PART_ID;
}

export function partLabel(id: string): string {
  return EXAM_PARTS.find((p) => p.id === id)?.label ?? id;
}

const CATEGORY_TO_PART: Record<string, string> = {
  "01-swift-language":     "swift",
  "02-memory-management":  "memory",
  "03-concurrency":        "concurrency",
  "04-uikit":              "uikit",
  "05-swiftui":            "swiftui",
  "06-architecture":       "architecture",
  "07-networking":         "networking",
  "08-persistence":        "networking",
  "09-testing":            "testing",
  "10-performance":        "performance",
  "11-build-system":       "build",
  "12-design-patterns":    "patterns",
  "13-cs-fundamentals":    "cs",
  "14-network":            "network",
  "15-paradigms":          "paradigms",
  "16-real-world":         "realworld",
  "17-objective-c":        "objc",
};

export function partIdForCategory(categoryId: string): string | undefined {
  return CATEGORY_TO_PART[categoryId];
}
