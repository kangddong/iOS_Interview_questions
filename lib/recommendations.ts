import "server-only";
import { getDb } from "@/lib/db";
import { getAllProgress } from "@/lib/topic-progress";
import type { Topic, CategoryMeta } from "@/lib/types";

export interface TopicRec {
  slug: string;
  category: string;
  title: string;
  readingMinutes: number;
  reason: string;
}

export interface Recommendations {
  weakSpots: TopicRec[];
  continuation: TopicRec[];
  nextFrontier: TopicRec[];
  freshStart: TopicRec[];
}

interface AnswerMistakeRow {
  related_slugs: string | null;
  is_correct: number | null;
  grade: number | null;
  type: string;
}

/**
 * 시험에서 틀렸거나 채점 낮은 답변과 연결된 topic slug → 등장 횟수 맵.
 */
function collectMistakeSlugs(): Map<string, number> {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT related_slugs, is_correct, grade, type
      FROM exam_answer
      WHERE (type='objective' AND is_correct = 0)
         OR (type='subjective' AND grade IS NOT NULL AND grade <= 2)
    `
    )
    .all() as AnswerMistakeRow[];

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.related_slugs) continue;
    let slugs: string[] = [];
    try {
      slugs = JSON.parse(row.related_slugs) as string[];
    } catch {
      continue;
    }
    for (const slug of slugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return counts;
}

function topicToRec(topic: Topic, reason: string): TopicRec {
  return {
    slug: topic.slug,
    category: topic.categoryTitle,
    title: topic.title,
    readingMinutes: topic.readingMinutes,
    reason,
  };
}

type CategoryWithTopics = CategoryMeta & { topics: Topic[] };

interface BuildInput {
  allTopics: Topic[];
  categories: CategoryWithTopics[];
}

export function buildRecommendations({ allTopics, categories }: BuildInput): Recommendations {
  const progress = getAllProgress();
  const progressBySlug = new Map(progress.map((p) => [p.slug, p]));
  const mistakeSlugs = collectMistakeSlugs();
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));

  // 1) Weak spots — 시험에서 틀린 topic 중 mastery 3 미만 (또는 미학습)
  const weakSlugsRanked = [...mistakeSlugs.entries()]
    .filter(([slug]) => {
      const topic = topicBySlug.get(slug);
      if (!topic) return false;
      const p = progressBySlug.get(slug);
      return !p || p.masteryLevel < 3;
    })
    .sort(([slugA, a], [slugB, b]) => {
      if (b !== a) return b - a;
      // 동률이면 mastery 낮은 것 우선
      const ma = progressBySlug.get(slugA)?.masteryLevel ?? -1;
      const mb = progressBySlug.get(slugB)?.masteryLevel ?? -1;
      return ma - mb;
    })
    .slice(0, 4);

  const weakSpots: TopicRec[] = weakSlugsRanked
    .map(([slug, count]) => {
      const topic = topicBySlug.get(slug)!;
      const p = progressBySlug.get(slug);
      const reason = p
        ? `시험 오답 ${count}회 · 현재 ${["다시 학습", "학습 중", "복습 중", "익힘"][p.masteryLevel]}`
        : `시험 오답 ${count}회 · 미학습`;
      return topicToRec(topic, reason);
    });

  // 2) Continuation — 가장 최근에 학습한 토픽이 속한 카테고리에서 남은 토픽
  const recentProgress = progress
    .filter((p) => p.masteryLevel < 3)
    .sort((a, b) => (a.lastStudiedAt < b.lastStudiedAt ? 1 : -1));
  const recentTopic = recentProgress
    .map((p) => topicBySlug.get(p.slug))
    .find((t): t is Topic => !!t);

  let continuation: TopicRec[] = [];
  if (recentTopic) {
    const sameCat = categories.find((c) => c.id === recentTopic.categoryId);
    if (sameCat) {
      continuation = sameCat.topics
        .filter(
          (t) =>
            !progressBySlug.has(t.slug) &&
            t.slug !== recentTopic.slug &&
            !weakSpots.some((w) => w.slug === t.slug)
        )
        .slice(0, 3)
        .map((t) =>
          topicToRec(t, `${recentTopic.categoryTitle} 이어서 학습 · ${t.readingMinutes}분`)
        );
    }
  }

  // 3) Next frontier — 로드맵 순서상 진도가 미완인 가장 이른 카테고리 (continuation과 다른 카테고리)
  const continuationCategoryId = continuation[0]
    ? allTopics.find((t) => t.slug === continuation[0].slug)?.categoryId
    : undefined;

  const sortedCats = [...categories].sort((a, b) => a.order - b.order);

  let nextFrontier: TopicRec[] = [];
  for (const cat of sortedCats) {
    if (cat.id === "00-overview") continue;
    if (cat.id === continuationCategoryId) continue;
    const studied = cat.topics.filter((t) => progressBySlug.has(t.slug)).length;
    const complete = studied === cat.topics.length;
    if (complete) continue;
    if (studied === 0) continue; // 완전 새 카테고리는 freshStart로 별도

    const candidates = cat.topics
      .filter(
        (t) =>
          !progressBySlug.has(t.slug) && !weakSpots.some((w) => w.slug === t.slug)
      )
      .slice(0, 2)
      .map((t) =>
        topicToRec(t, `${cat.title} 진행 중 · 남은 ${cat.topics.length - studied}편`)
      );
    if (candidates.length > 0) {
      nextFrontier = candidates;
      break;
    }
  }

  // 4) Fresh start — 아직 한 번도 안 본 카테고리의 첫 토픽 (로드맵 순서)
  const studiedCategoryIds = new Set(
    progress
      .map((p) => topicBySlug.get(p.slug)?.categoryId)
      .filter((x): x is string => !!x)
  );

  const freshStart: TopicRec[] = [];
  for (const cat of sortedCats) {
    if (cat.id === "00-overview") continue;
    if (studiedCategoryIds.has(cat.id)) continue;
    const first = cat.topics[0];
    if (
      !first ||
      weakSpots.some((w) => w.slug === first.slug) ||
      continuation.some((c) => c.slug === first.slug) ||
      nextFrontier.some((n) => n.slug === first.slug)
    ) {
      continue;
    }
    freshStart.push(
      topicToRec(first, `${cat.title} 새 영역 · 로드맵 ${cat.order}단계`)
    );
    if (freshStart.length >= 3) break;
  }

  return { weakSpots, continuation, nextFrontier, freshStart };
}
