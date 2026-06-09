import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LEVEL_LABELS } from "@/lib/constants";
import type { CategoryMeta, Level, Question, Topic } from "@/lib/types";

const DOCS_ROOT = path.join(process.cwd(), "docs");

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "00-overview",
    title: "로드맵",
    description: "면접까지 남은 시간에 따라 학습 순서를 잡는 전체 지도",
    order: 0
  },
  {
    id: "01-swift-language",
    title: "Swift Language",
    description: "값/참조 타입, 옵셔널, 제네릭, 프로토콜, 매크로",
    order: 1
  },
  {
    id: "02-memory-management",
    title: "Memory",
    description: "ARC, retain cycle, weak/unowned, capture list",
    order: 2
  },
  {
    id: "03-concurrency",
    title: "Concurrency",
    description: "GCD, async/await, Actor, Sendable, Swift 6 strict concurrency",
    order: 3
  },
  {
    id: "04-uikit",
    title: "UIKit",
    description: "ViewController lifecycle, Auto Layout, rendering, responder chain",
    order: 4
  },
  {
    id: "05-swiftui",
    title: "SwiftUI",
    description: "상태 관리, identity, diffing, Observation, Layout",
    order: 5
  },
  {
    id: "06-architecture",
    title: "Architecture",
    description: "MVC/MVVM, Clean Architecture, Coordinator, TCA, DI",
    order: 6
  },
  {
    id: "07-networking",
    title: "Networking",
    description: "URLSession, Codable, 인증, 토큰 갱신",
    order: 7
  },
  {
    id: "08-persistence",
    title: "Persistence",
    description: "UserDefaults, Keychain, FileManager, Core Data, SwiftData",
    order: 8
  },
  {
    id: "09-testing",
    title: "Testing",
    description: "XCTest, Swift Testing, mocking, snapshot, UI testing",
    order: 9
  },
  {
    id: "10-performance",
    title: "Performance",
    description: "Instruments, launch time, hitch, 이미지/스크롤 최적화",
    order: 10
  },
  {
    id: "11-build-system",
    title: "Build System",
    description: "Xcode build, SPM, signing, CI/CD",
    order: 11
  },
  {
    id: "12-design-patterns",
    title: "Design Patterns",
    description: "Delegate, Observer, Singleton, Strategy, Builder",
    order: 12
  },
  {
    id: "13-cs-fundamentals",
    title: "CS Fundamentals",
    description: "프로세스/스레드, 메모리 모델, 자료구조, 알고리즘",
    order: 13
  },
  {
    id: "14-network",
    title: "Network",
    description: "TCP/UDP, HTTP, TLS, DNS, WebSocket",
    order: 14
  }
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

const LEVEL_FILES: Record<Level, string> = {
  basic: "basic.md",
  intermediate: "intermediate.md",
  advanced: "advanced.md"
};

export { LEVEL_LABELS };

function toPosix(filePath: string) {
  return filePath.split(path.sep).join(path.posix.sep);
}

function walkMarkdownFiles(directory: string, excludedDirectoryNames: Set<string>): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectoryNames.has(entry.name)) {
        return [];
      }

      return walkMarkdownFiles(absolutePath, excludedDirectoryNames);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
  });
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitle(markdown: string, sourcePath: string) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) {
    return heading.replace(/\s+#$/, "");
  }

  const basename = path.posix.basename(sourcePath, ".md");
  return basename === "README" ? path.posix.basename(path.posix.dirname(sourcePath)) : basename;
}

function getSummary(markdown: string) {
  const quote = markdown.match(/^>\s*(.+)$/m)?.[1]?.trim();
  if (!quote) {
    return "";
  }

  return quote.replace(/^한 줄 요약\s*[—-]\s*/, "").trim();
}

function getHeadings(markdown: string) {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

function getReadingMinutes(markdown: string) {
  const words = stripMarkdown(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 260));
}

function slugFromSourcePath(sourcePath: string) {
  const withoutExtension = sourcePath.replace(/\.md$/, "");
  if (withoutExtension.endsWith("/README")) {
    return withoutExtension.replace(/\/README$/, "");
  }

  return withoutExtension;
}

function getCategory(sourcePath: string) {
  const firstSegment = sourcePath.split("/")[0];
  return CATEGORY_BY_ID.get(firstSegment) ?? {
    id: firstSegment,
    title: firstSegment,
    description: "",
    order: 99
  };
}

function compareTopics(a: Topic, b: Topic) {
  const categoryOrderA = CATEGORY_BY_ID.get(a.categoryId)?.order ?? 99;
  const categoryOrderB = CATEGORY_BY_ID.get(b.categoryId)?.order ?? 99;

  if (categoryOrderA !== categoryOrderB) {
    return categoryOrderA - categoryOrderB;
  }

  const aIsIndex = a.sourcePath.endsWith("README.md") || a.sourcePath === "00-overview.md";
  const bIsIndex = b.sourcePath.endsWith("README.md") || b.sourcePath === "00-overview.md";

  if (aIsIndex !== bIsIndex) {
    return aIsIndex ? -1 : 1;
  }

  return a.title.localeCompare(b.title, "ko");
}

export function getAllTopics(): Topic[] {
  const files = walkMarkdownFiles(DOCS_ROOT, new Set(["questions", "_templates"]));

  return files
    .map((absolutePath) => {
      const sourcePath = toPosix(path.relative(DOCS_ROOT, absolutePath));
      const file = fs.readFileSync(absolutePath, "utf8");
      const parsed = matter(file);
      const body = parsed.content.trim();
      const title = getTitle(body, sourcePath);
      const summary = getSummary(body);
      const excerpt = summary || stripMarkdown(body).slice(0, 180);
      const category = getCategory(sourcePath);
      const slug = slugFromSourcePath(sourcePath);

      return {
        slug,
        slugSegments: slug.split("/"),
        sourcePath,
        title,
        categoryId: category.id,
        categoryTitle: category.title,
        summary,
        excerpt,
        body,
        headings: getHeadings(body),
        readingMinutes: getReadingMinutes(body)
      };
    })
    .sort(compareTopics);
}

export function getTopicBySlug(slugSegments: string[]) {
  const slug = slugSegments.join("/");
  return getAllTopics().find((topic) => topic.slug === slug);
}

export function getTopicsByCategory() {
  const topics = getAllTopics();
  return CATEGORIES.map((category) => ({
    ...category,
    topics: topics.filter((topic) => topic.categoryId === category.id)
  })).filter((category) => category.topics.length > 0);
}

export function resolveDocHref(sourcePath: string, href: string) {
  if (/^(https?:|mailto:|#)/.test(href)) {
    return href;
  }

  const [rawPath, hash] = href.split("#");
  if (!rawPath.endsWith(".md")) {
    return href;
  }

  const sourceDirectory = path.posix.dirname(sourcePath);
  const resolvedPath = path.posix.normalize(path.posix.join(sourceDirectory, rawPath));
  const slug = slugFromSourcePath(resolvedPath);

  return `/topics/${slug}${hash ? `#${hash}` : ""}`;
}

function cleanQuestionPrompt(rawLine: string) {
  const withoutLinks = rawLine
    .split("→")[0]
    .replace(/^\[[ x]\]\s*/i, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

  return withoutLinks.replace(/\s+/g, " ");
}

function extractRelatedTopicSlugs(rawLine: string, sourcePath: string) {
  const links = [...rawLine.matchAll(/\]\(([^)]+\.md(?:#[^)]+)?)\)/g)];

  return links
    .map((match) => resolveDocHref(sourcePath, match[1]))
    .filter((href) => href.startsWith("/topics/"))
    .map((href) => href.replace(/^\/topics\//, "").split("#")[0]);
}

export function getQuestionBank(): Question[] {
  return (Object.entries(LEVEL_FILES) as Array<[Level, string]>).flatMap(([level, fileName]) => {
    const sourcePath = `questions/${fileName}`;
    const absolutePath = path.join(DOCS_ROOT, sourcePath);
    const markdown = fs.readFileSync(absolutePath, "utf8");
    const questions: Question[] = [];
    let category = "General";

    markdown.split("\n").forEach((line) => {
      const heading = line.match(/^##\s+(.+)$/)?.[1]?.trim();
      if (heading) {
        category = heading;
        return;
      }

      if (!/^- /.test(line)) {
        return;
      }

      const prompt = cleanQuestionPrompt(line.replace(/^- /, ""));
      if (!prompt) {
        return;
      }

      questions.push({
        id: `${level}-${String(questions.length + 1).padStart(3, "0")}`,
        level,
        category,
        prompt,
        sourcePath,
        relatedTopicSlugs: extractRelatedTopicSlugs(line, sourcePath)
      });
    });

    return questions;
  });
}
