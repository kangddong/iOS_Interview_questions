import "server-only";
import { getDb } from "@/lib/db";

export type ProgressOutcome = "got-it" | "unsure" | "dont-know";

export interface TopicProgress {
  slug: string;
  firstStudiedAt: string;
  lastStudiedAt: string;
  studyCount: number;
  masteryLevel: number;
  nextReviewAt: string;
  intervalDays: number;
}

const INTERVALS: Record<number, number> = {
  0: 0,
  1: 3,
  2: 7,
  3: 21,
};

function isoDate(d: Date = new Date()): string {
  return d.toISOString();
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

interface ProgressRow {
  slug: string;
  first_studied_at: string;
  last_studied_at: string;
  study_count: number;
  mastery_level: number;
  next_review_at: string;
  interval_days: number;
}

function mapRow(row: ProgressRow): TopicProgress {
  return {
    slug: row.slug,
    firstStudiedAt: row.first_studied_at,
    lastStudiedAt: row.last_studied_at,
    studyCount: row.study_count,
    masteryLevel: row.mastery_level,
    nextReviewAt: row.next_review_at,
    intervalDays: row.interval_days,
  };
}

export function getProgress(slug: string): TopicProgress | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM topic_progress WHERE slug = ?`)
    .get(slug) as ProgressRow | undefined;
  return row ? mapRow(row) : null;
}

export function getAllProgress(): TopicProgress[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM topic_progress ORDER BY last_studied_at DESC`)
    .all() as ProgressRow[];
  return rows.map(mapRow);
}

export function recordProgress(slug: string, outcome: ProgressOutcome): TopicProgress {
  const db = getDb();
  const now = new Date();
  const nowISO = isoDate(now);
  const existing = getProgress(slug);

  const currentMastery = existing?.masteryLevel ?? 1;
  let nextMastery = currentMastery;
  let intervalDays = existing?.intervalDays ?? 1;

  if (outcome === "got-it") {
    nextMastery = Math.min(currentMastery + 1, 3);
    intervalDays = INTERVALS[nextMastery] || 1;
  } else if (outcome === "unsure") {
    nextMastery = Math.max(currentMastery, 1);
    intervalDays = 1;
  } else {
    nextMastery = 1;
    intervalDays = 1;
  }

  const nextReviewAt = isoDate(addDays(now, intervalDays));

  const upsert = db.prepare(`
    INSERT INTO topic_progress
      (slug, first_studied_at, last_studied_at, study_count, mastery_level, next_review_at, interval_days)
    VALUES (?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      last_studied_at = excluded.last_studied_at,
      study_count     = topic_progress.study_count + 1,
      mastery_level   = excluded.mastery_level,
      next_review_at  = excluded.next_review_at,
      interval_days   = excluded.interval_days
  `);
  upsert.run(slug, nowISO, nowISO, nextMastery, nextReviewAt, intervalDays);

  return getProgress(slug)!;
}

export function resetProgress(slug: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM topic_progress WHERE slug = ?`).run(slug);
}

export interface ReviewQueueItem {
  slug: string;
  masteryLevel: number;
  lastStudiedAt: string;
  nextReviewAt: string;
  daysOverdue: number;
}

export function getReviewQueue(): ReviewQueueItem[] {
  const db = getDb();
  const now = new Date();
  const rows = db
    .prepare(
      `SELECT * FROM topic_progress
       WHERE next_review_at <= ?
       ORDER BY next_review_at ASC, mastery_level ASC`
    )
    .all(isoDate(now)) as ProgressRow[];

  return rows.map((row) => {
    const due = new Date(row.next_review_at);
    const days = Math.max(
      0,
      Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    );
    return {
      slug: row.slug,
      masteryLevel: row.mastery_level,
      lastStudiedAt: row.last_studied_at,
      nextReviewAt: row.next_review_at,
      daysOverdue: days,
    };
  });
}

export interface ProgressStats {
  total: number;
  studied: number;
  mastered: number;
  dueForReview: number;
  byMastery: Record<number, number>;
}

export function getStats(allTopicSlugs: string[]): ProgressStats {
  const progress = getAllProgress();
  const queue = getReviewQueue();
  const byMastery: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const p of progress) {
    byMastery[p.masteryLevel] = (byMastery[p.masteryLevel] ?? 0) + 1;
  }
  return {
    total: allTopicSlugs.length,
    studied: progress.length,
    mastered: byMastery[3] ?? 0,
    dueForReview: queue.length,
    byMastery,
  };
}
