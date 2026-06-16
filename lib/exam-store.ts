import "server-only";
import { ulid } from "ulid";
import { getDb } from "@/lib/db";
import type { ExamAnswerResult, ExamResult } from "@/lib/types";

export interface SavedAttemptSummary {
  id: string;
  submittedAt: string;
  level: string | null;
  mode: string | null;
  objectiveScore: number;
  objectiveTotal: number;
  totalAnswers: number;
  subjectivePending: number;
}

export interface SavedAnswerRow {
  id: string;
  attemptId: string;
  idx: number;
  questionId: string;
  type: "objective" | "subjective";
  category: string | null;
  level: string | null;
  prompt: string;
  userAnswer: string | null;
  correctChoiceId: string | null;
  isCorrect: 0 | 1 | null;
  modelAnswer: string | null;
  explanation: string | null;
  relatedSlugs: string[];
  grade: number | null;
  gradeNote: string | null;
  gradedAt: string | null;
}

interface AttemptRow {
  id: string;
  submitted_at: string;
  level: string | null;
  mode: string | null;
  duration_sec: number | null;
  objective_score: number;
  objective_total: number;
  settings_json: string | null;
}

interface AnswerRow {
  id: string;
  attempt_id: string;
  idx: number;
  question_id: string;
  type: "objective" | "subjective";
  category: string | null;
  level: string | null;
  prompt: string;
  user_answer: string | null;
  correct_id: string | null;
  is_correct: number | null;
  model_answer: string | null;
  explanation: string | null;
  related_slugs: string | null;
  grade: number | null;
  grade_note: string | null;
  graded_at: string | null;
}

function mapAnswer(row: AnswerRow): SavedAnswerRow {
  let related: string[] = [];
  if (row.related_slugs) {
    try {
      related = JSON.parse(row.related_slugs) as string[];
    } catch {
      related = [];
    }
  }
  return {
    id: row.id,
    attemptId: row.attempt_id,
    idx: row.idx,
    questionId: row.question_id,
    type: row.type,
    category: row.category,
    level: row.level,
    prompt: row.prompt,
    userAnswer: row.user_answer,
    correctChoiceId: row.correct_id,
    isCorrect: row.is_correct === null ? null : ((row.is_correct ? 1 : 0) as 0 | 1),
    modelAnswer: row.model_answer,
    explanation: row.explanation,
    relatedSlugs: related,
    grade: row.grade,
    gradeNote: row.grade_note,
    gradedAt: row.graded_at,
  };
}

export function saveAttempt(result: ExamResult): string {
  const db = getDb();
  const id = ulid();
  const durationSec = Math.max(
    0,
    Math.round((new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()) / 1000)
  );

  const insertAttempt = db.prepare(`
    INSERT INTO exam_attempt (
      id, submitted_at, level, mode, duration_sec,
      objective_score, objective_total, settings_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAnswer = db.prepare(`
    INSERT INTO exam_answer (
      id, attempt_id, idx, question_id, type, category, level,
      prompt, user_answer, correct_id, is_correct,
      model_answer, explanation, related_slugs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((result: ExamResult, id: string) => {
    const mode =
      result.settings.objectiveCount > 0 && result.settings.subjectiveCount > 0
        ? "mixed"
        : result.settings.subjectiveCount > 0
          ? "subjective"
          : "objective";
    insertAttempt.run(
      id,
      result.finishedAt,
      result.settings.level,
      mode,
      durationSec,
      result.score,
      result.objectiveTotal,
      JSON.stringify(result.settings)
    );
    result.answers.forEach((a: ExamAnswerResult, i: number) => {
      insertAnswer.run(
        ulid(),
        id,
        i,
        a.questionId,
        a.type,
        a.category,
        a.level,
        a.prompt,
        a.userAnswer ?? null,
        a.correctChoiceId ?? null,
        a.isCorrect === null ? null : a.isCorrect ? 1 : 0,
        a.modelAnswer ?? null,
        a.explanation,
        JSON.stringify(a.relatedTopicSlugs ?? [])
      );
    });
  });

  tx(result, id);
  return id;
}

export function listAttempts(): SavedAttemptSummary[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        a.id,
        a.submitted_at,
        a.level,
        a.mode,
        a.objective_score,
        a.objective_total,
        (SELECT COUNT(*) FROM exam_answer ans WHERE ans.attempt_id = a.id) AS total_answers,
        (SELECT COUNT(*) FROM exam_answer ans
          WHERE ans.attempt_id = a.id
            AND ans.type='subjective'
            AND ans.grade IS NULL) AS pending
      FROM exam_attempt a
      ORDER BY a.submitted_at DESC
    `
    )
    .all() as Array<{
    id: string;
    submitted_at: string;
    level: string | null;
    mode: string | null;
    objective_score: number;
    objective_total: number;
    total_answers: number;
    pending: number;
  }>;
  return rows.map((r) => ({
    id: r.id,
    submittedAt: r.submitted_at,
    level: r.level,
    mode: r.mode,
    objectiveScore: r.objective_score,
    objectiveTotal: r.objective_total,
    totalAnswers: r.total_answers,
    subjectivePending: r.pending,
  }));
}

export function getAttemptWithAnswers(
  attemptId: string
): { attempt: SavedAttemptSummary; answers: SavedAnswerRow[] } | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM exam_attempt WHERE id = ?`).get(attemptId) as
    | AttemptRow
    | undefined;
  if (!row) return null;
  const answers = db
    .prepare(`SELECT * FROM exam_answer WHERE attempt_id = ? ORDER BY idx ASC`)
    .all(attemptId) as AnswerRow[];

  const pending = answers.filter((a) => a.type === "subjective" && a.grade === null).length;

  const attempt: SavedAttemptSummary = {
    id: row.id,
    submittedAt: row.submitted_at,
    level: row.level,
    mode: row.mode,
    objectiveScore: row.objective_score,
    objectiveTotal: row.objective_total,
    totalAnswers: answers.length,
    subjectivePending: pending,
  };

  return { attempt, answers: answers.map(mapAnswer) };
}

export function listPendingSubjective(): SavedAnswerRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT ans.*
      FROM exam_answer ans
      JOIN exam_attempt att ON att.id = ans.attempt_id
      WHERE ans.type='subjective' AND ans.grade IS NULL
      ORDER BY att.submitted_at DESC, ans.idx ASC
    `
    )
    .all() as AnswerRow[];
  return rows.map(mapAnswer);
}

export function gradeAnswer(answerId: string, grade: number, note: string): void {
  const db = getDb();
  db.prepare(
    `
    UPDATE exam_answer
    SET grade = ?, grade_note = ?, graded_at = ?
    WHERE id = ? AND type='subjective'
  `
  ).run(grade, note || null, new Date().toISOString(), answerId);
}

export function ungradeAnswer(answerId: string): void {
  const db = getDb();
  db.prepare(
    `
    UPDATE exam_answer
    SET grade = NULL, grade_note = NULL, graded_at = NULL
    WHERE id = ? AND type='subjective'
  `
  ).run(answerId);
}

export function deleteAttempt(attemptId: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM exam_attempt WHERE id = ?`).run(attemptId);
}
