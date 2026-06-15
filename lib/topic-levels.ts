import fs from "node:fs";
import path from "node:path";
import type { Level } from "@/lib/types";

const QUESTION_FILES: Array<{ level: Level; file: string }> = [
  { level: "basic",        file: "basic.md" },
  { level: "intermediate", file: "intermediate.md" },
  { level: "advanced",     file: "advanced.md" },
];

const ADVANCED_FILENAME_PATTERNS = [
  /-internals$/,
  /-deep$/,
  /^abi-/,
  /^runtime-/,
  /-optimization$/,
  /-pitfalls$/,
  /^swift6-/,
  /-budget-and-hitch$/,
  /-strategy$/,
  /^memory-tools$/,
  /^value-type-memory$/,
  /^module-boundary-design$/,
  /^naming-conventions$/,
  /^build-time-optimization$/,
  /^launch-time$/,
  /^rendering-pipeline$/,
  /^view-graph-and-diffing$/,
  /^custom-layout-and-animatable$/,
  /^performance$/,
  /^observation-macro$/,
  /^modularization$/,
  /^metrickit-and-crash$/,
  /^core-data-migration$/,
  /^storage-selection-guide$/,
  /^tls-handshake-deep$/,
  /^network-stack-and-pinning$/,
  /^background-tasks-and-retry$/,
  /^swift-idiomatic-patterns$/,
  /^system-design-intro$/,
  /^continuation$/,
  /^sendable$/,
  /^async-sequence-and-stream$/,
  /^actor-and-mainactor$/,
  /^method-dispatch$/,
  /^keypath$/,
  /^copy-on-write$/,
  /^result-builder-and-macro$/,
  /^ownership$/,
  /^variadic-generics$/,
  /^some-vs-any$/,
  /^equatable-hashable-codable$/,
  /^http2-http3$/,
];

const INTERMEDIATE_FILENAME_PATTERNS = [
  /^view-identity-and-lifetime$/,
  /^layout-system$/,
  /^auto-layout$/,
  /^tableview-collectionview$/,
  /^core-animation$/,
  /^viewcontroller-lifecycle$/,
  /^state-management$/,
  /^clean-architecture$/,
  /^coordinator$/,
  /^dependency-injection$/,
  /^tca$/,
  /^auth-and-token-refresh$/,
  /^urlsession$/,
  /^codable$/,
  /^core-data-and-swiftdata$/,
  /^keychain$/,
  /^heap-vs-stack$/,
  /^capture-list$/,
  /^autoreleasepool$/,
  /^async-await$/,
  /^gcd$/,
  /^operation-queue$/,
  /^xctest$/,
  /^swift-testing$/,
  /^mocking$/,
  /^snapshot-and-ui-testing$/,
  /^image-and-scroll$/,
  /^instruments$/,
  /^main-thread-and-hitch$/,
  /^spm$/,
  /^code-signing$/,
  /^ci-cd$/,
  /^xcode-build$/,
  /^memory-model$/,
  /^data-structures$/,
  /^algorithm-complexity$/,
  /^concurrency-primitives$/,
  /^process-vs-thread$/,
  /^https-and-tls$/,
  /^osi-and-tcp-ip$/,
  /^rest-api-design$/,
  /^websocket$/,
  /^dns-and-caching$/,
  /^closures$/,
  /^generics-and-pat$/,
  /^properties$/,
  /^pattern-matching$/,
  /^type-casting$/,
  /^error-handling$/,
  /^mutating-and-inout$/,
  /^enum$/,
  /^initialization$/,
  /^protocol-oriented-programming$/,
  /^string-and-unicode$/,
  /^subscript$/,
  /^access-control$/,
  /^retain-cycle$/,
  /^weak-vs-unowned$/,
  /^arc$/,
  /^arc-optimization$/,
  /^observer$/,
  /^delegate$/,
  /^factory-strategy-builder$/,
  /^composition-over-inheritance$/,
  /^singleton$/,
  /^responder-chain$/,
  /^app-lifecycle$/,
  /^frame-vs-bounds$/,
  /^file-manager$/,
  /^userdefaults$/,
  /^runloop-and-main-thread$/,
  /^runloop-deep$/,
  /^offscreen-rendering$/,
  /^tcp-vs-udp$/,
  /^http-basics$/,
  /^concurrency-runtime$/,
  /^oop-vs-fp$/,
  /^imperative-vs-declarative$/,
  /^fp$/,
];

const BASIC_FILENAME_PATTERNS = [
  /^optional$/,
  /^struct-vs-class$/,
  /^oop$/,
];

let cached: Record<string, Level[]> | null = null;

function parseRefs(filePath: string): Set<string> {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const matches = raw.matchAll(/\.\.\/([0-9]+-[a-z-]+\/[a-z0-9-]+)/g);
    const set = new Set<string>();
    for (const m of matches) {
      const slug = m[1];
      set.add(slug);
    }
    return set;
  } catch {
    return new Set();
  }
}

function buildMap(): Record<string, Level[]> {
  const docsDir = path.join(process.cwd(), "docs");
  const result: Record<string, Set<Level>> = {};

  for (const { level, file } of QUESTION_FILES) {
    const slugs = parseRefs(path.join(docsDir, "questions", file));
    for (const slug of slugs) {
      if (!result[slug]) result[slug] = new Set();
      result[slug].add(level);
    }
  }

  return Object.fromEntries(
    Object.entries(result).map(([k, v]) => [k, Array.from(v)])
  );
}

function fallbackLevels(slug: string): Level[] {
  const file = slug.split("/").pop() ?? "";
  if (ADVANCED_FILENAME_PATTERNS.some((p) => p.test(file))) return ["advanced"];
  if (INTERMEDIATE_FILENAME_PATTERNS.some((p) => p.test(file))) return ["intermediate"];
  if (BASIC_FILENAME_PATTERNS.some((p) => p.test(file))) return ["basic"];
  return ["intermediate"]; // 기본값
}

export function getLevelsForSlug(slug: string): Level[] {
  if (!cached) cached = buildMap();
  const fromRefs = cached[slug];
  if (fromRefs && fromRefs.length > 0) return fromRefs;
  return fallbackLevels(slug);
}

export function getLevelMap(slugs: string[]): Map<string, Level[]> {
  const map = new Map<string, Level[]>();
  for (const slug of slugs) {
    map.set(slug, getLevelsForSlug(slug));
  }
  return map;
}
