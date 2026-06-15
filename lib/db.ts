import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH = process.env.EXAM_DB_PATH ?? join(process.cwd(), "data", "exam.db");

let _db: Database.Database | null = null;

function open(): Database.Database {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  _db = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_attempt (
      id              TEXT PRIMARY KEY,
      submitted_at    TEXT NOT NULL,
      level           TEXT,
      mode            TEXT,
      duration_sec    INTEGER,
      objective_score INTEGER NOT NULL DEFAULT 0,
      objective_total INTEGER NOT NULL DEFAULT 0,
      settings_json   TEXT
    );

    CREATE TABLE IF NOT EXISTS exam_answer (
      id            TEXT PRIMARY KEY,
      attempt_id    TEXT NOT NULL REFERENCES exam_attempt(id) ON DELETE CASCADE,
      idx           INTEGER NOT NULL,
      question_id   TEXT NOT NULL,
      type          TEXT NOT NULL,
      category      TEXT,
      level         TEXT,
      prompt        TEXT NOT NULL,
      user_answer   TEXT,
      correct_id    TEXT,
      is_correct    INTEGER,
      model_answer  TEXT,
      explanation   TEXT,
      related_slugs TEXT,
      grade         INTEGER,
      grade_note    TEXT,
      graded_at     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_attempt_date ON exam_attempt(submitted_at DESC);
    CREATE INDEX IF NOT EXISTS idx_answer_attempt ON exam_answer(attempt_id, idx);
    CREATE INDEX IF NOT EXISTS idx_answer_pending
      ON exam_answer(graded_at)
      WHERE type='subjective' AND grade IS NULL;

    CREATE TABLE IF NOT EXISTS topic_progress (
      slug             TEXT PRIMARY KEY,
      first_studied_at TEXT NOT NULL,
      last_studied_at  TEXT NOT NULL,
      study_count      INTEGER NOT NULL DEFAULT 1,
      mastery_level    INTEGER NOT NULL DEFAULT 1,
      next_review_at   TEXT NOT NULL,
      interval_days    INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_progress_review  ON topic_progress(next_review_at);
    CREATE INDEX IF NOT EXISTS idx_progress_mastery ON topic_progress(mastery_level);
  `);
}

export function getDb(): Database.Database {
  return open();
}
