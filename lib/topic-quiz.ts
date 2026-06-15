import "server-only";
import { ulid } from "ulid";
import { getDb } from "@/lib/db";
import { objectiveExamQuestions } from "@/data/examQuestions";
import type { ExamQuestion } from "@/lib/types";
import { partIdFor } from "@/lib/exam-parts";
import { recordProgress } from "@/lib/topic-progress";

export const QUIZ_PASS_THRESHOLD = 0.8;
export const QUIZ_TARGET_LENGTH = 5;
export const QUIZ_MIN_LENGTH = 3;

export interface QuizQuestion extends ExamQuestion {
  partId: string;
}

export interface QuizAttempt {
  id: string;
  slug: string;
  takenAt: string;
  total: number;
  correct: number;
  passed: boolean;
}

export interface QuizStatus {
  available: boolean;
  totalAvailable: number;          // 풀에 들어 있는 문항 수
  required: number;                // 통과 기준 문항 수
  lastAttempt: QuizAttempt | null;
  passedEver: boolean;
  attemptCount: number;
}

function topicMatches(q: { relatedTopicSlugs: string[] }, slug: string): boolean {
  return q.relatedTopicSlugs.includes(slug);
}

export function getQuizPoolForTopic(slug: string): QuizQuestion[] {
  const matched = objectiveExamQuestions.filter((q) => topicMatches(q, slug));
  return matched.map((q) => ({ ...q, partId: partIdFor(q.category) }));
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickQuiz(slug: string): QuizQuestion[] {
  const pool = getQuizPoolForTopic(slug);
  if (pool.length === 0) return [];
  return shuffle(pool).slice(0, Math.min(QUIZ_TARGET_LENGTH, pool.length));
}

export function getQuizStatus(slug: string): QuizStatus {
  const pool = getQuizPoolForTopic(slug);
  const totalAvailable = pool.length;
  const available = totalAvailable >= QUIZ_MIN_LENGTH;
  const required = Math.min(QUIZ_TARGET_LENGTH, Math.max(QUIZ_MIN_LENGTH, totalAvailable));

  const db = getDb();
  const last = db
    .prepare(
      `SELECT * FROM topic_quiz_attempt WHERE slug = ? ORDER BY taken_at DESC LIMIT 1`
    )
    .get(slug) as
    | { id: string; slug: string; taken_at: string; total: number; correct: number; passed: number }
    | undefined;
  const passedRow = db
    .prepare(
      `SELECT 1 FROM topic_quiz_attempt WHERE slug = ? AND passed = 1 LIMIT 1`
    )
    .get(slug) as { 1?: number } | undefined;
  const countRow = db
    .prepare(`SELECT COUNT(*) AS c FROM topic_quiz_attempt WHERE slug = ?`)
    .get(slug) as { c: number };

  return {
    available,
    totalAvailable,
    required,
    lastAttempt: last
      ? {
          id: last.id,
          slug: last.slug,
          takenAt: last.taken_at,
          total: last.total,
          correct: last.correct,
          passed: last.passed === 1,
        }
      : null,
    passedEver: !!passedRow,
    attemptCount: countRow.c,
  };
}

interface AnswerInput {
  questionId: string;
  chosen: string;
  correct: string;
  isCorrect: boolean;
}

export interface QuizSubmissionResult {
  attempt: QuizAttempt;
  details: AnswerInput[];
}

export function submitQuiz(
  slug: string,
  details: AnswerInput[]
): QuizSubmissionResult {
  const db = getDb();
  const total = details.length;
  const correct = details.filter((d) => d.isCorrect).length;
  const ratio = total > 0 ? correct / total : 0;
  const passed = ratio >= QUIZ_PASS_THRESHOLD;

  const attemptId = ulid();
  const takenAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO topic_quiz_attempt (id, slug, taken_at, total, correct, passed, details_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    attemptId,
    slug,
    takenAt,
    total,
    correct,
    passed ? 1 : 0,
    JSON.stringify(details)
  );

  if (passed) {
    recordProgress(slug, "got-it");
  } else if (ratio >= 0.5) {
    recordProgress(slug, "unsure");
  } else {
    recordProgress(slug, "dont-know");
  }

  return {
    attempt: {
      id: attemptId,
      slug,
      takenAt,
      total,
      correct,
      passed,
    },
    details,
  };
}

interface CategoryTopicSummary {
  slug: string;
  hasQuiz: boolean;
  passed: boolean;
  lastTakenAt: string | null;
}

export interface CategoryQuizSummary {
  topics: CategoryTopicSummary[];
  coveredTopics: number;          // 퀴즈가 존재하는 토픽 수
  passedTopics: number;           // 퀴즈 통과한 토픽 수
  totalTopics: number;            // 카테고리 전체 토픽 수
  ready: boolean;                 // 모든 covered 토픽 통과 + 1개 이상 통과
}

export function summarizeCategoryQuiz(slugs: string[]): CategoryQuizSummary {
  const summaries: CategoryTopicSummary[] = slugs.map((slug) => {
    const status = getQuizStatus(slug);
    return {
      slug,
      hasQuiz: status.available,
      passed: status.passedEver,
      lastTakenAt: status.lastAttempt?.takenAt ?? null,
    };
  });
  const covered = summaries.filter((s) => s.hasQuiz);
  const passed = covered.filter((s) => s.passed).length;
  const ready = covered.length > 0 && passed === covered.length;
  return {
    topics: summaries,
    coveredTopics: covered.length,
    passedTopics: passed,
    totalTopics: summaries.length,
    ready,
  };
}
