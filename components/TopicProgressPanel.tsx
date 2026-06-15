import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { markProgressAction, resetProgressAction } from "@/lib/actions";
import { getProgress } from "@/lib/topic-progress";
import { getQuizStatus } from "@/lib/topic-quiz";

interface Props {
  slug: string;
}

const MASTERY_LABEL: Record<number, string> = {
  0: "다시 학습 필요",
  1: "학습 중",
  2: "복습 중",
  3: "익힘",
};

const MASTERY_COLOR: Record<number, string> = {
  0: "mastery-0",
  1: "mastery-1",
  2: "mastery-2",
  3: "mastery-3",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function relativeFromNow(iso: string) {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "오늘";
  if (diff > 0) return `${diff}일 후`;
  return `${Math.abs(diff)}일 전`;
}

export function TopicProgressPanel({ slug }: Props) {
  const progress = getProgress(slug);
  const quiz = getQuizStatus(slug);

  return (
    <section className="topic-progress" aria-labelledby="topic-progress-title">
      <header className="topic-progress-head">
        <h2 id="topic-progress-title">학습 진도</h2>
        {progress ? (
          <span className={`mastery-pill ${MASTERY_COLOR[progress.masteryLevel]}`}>
            {MASTERY_LABEL[progress.masteryLevel]}
          </span>
        ) : (
          <span className="mastery-pill mastery-none">미학습</span>
        )}
      </header>

      {progress ? (
        <div className="progress-meta">
          <span>최근 학습 {fmtDate(progress.lastStudiedAt)}</span>
          <span>학습 {progress.studyCount}회</span>
          <span>
            다음 복습 {fmtDate(progress.nextReviewAt)} ({relativeFromNow(progress.nextReviewAt)})
          </span>
        </div>
      ) : null}

      <div className={`quiz-gate ${quiz.available ? "gate-on" : "gate-off"}`}>
        <div className="quiz-gate-head">
          {quiz.available ? (
            <ShieldCheck size={18} aria-hidden="true" />
          ) : (
            <Lock size={18} aria-hidden="true" />
          )}
          <strong>체크 퀴즈로 객관 검증</strong>
          {quiz.available ? (
            <span className="muted">{quiz.required}문항 · 통과 80%</span>
          ) : (
            <span className="muted">문항 부족 ({quiz.totalAvailable}/3)</span>
          )}
        </div>

        {quiz.lastAttempt ? (
          <p className="quiz-last">
            최근 {quiz.lastAttempt.correct}/{quiz.lastAttempt.total}{" "}
            ({Math.round((quiz.lastAttempt.correct / Math.max(1, quiz.lastAttempt.total)) * 100)}%) ·{" "}
            <span className={`mini-pill ${quiz.lastAttempt.passed ? "correct" : "wrong"}`}>
              {quiz.lastAttempt.passed ? "통과" : "미통과"}
            </span>{" "}
            · {fmtDate(quiz.lastAttempt.takenAt)} · 총 {quiz.attemptCount}회 시도
          </p>
        ) : (
          <p className="muted">
            아직 응시 기록이 없습니다. 본문을 읽은 뒤 퀴즈로 객관 검증하세요.
          </p>
        )}

        <div className="quiz-gate-actions">
          {quiz.available ? (
            <Link href={`/quiz/${slug}`} className="primary-button compact">
              {quiz.lastAttempt ? "퀴즈 다시 풀기" : "체크 퀴즈 풀기"}
            </Link>
          ) : (
            <p className="muted small">
              객관식 문항이 부족해 퀴즈로 검증할 수 없습니다. 아래 주관 마킹은 보조 도구입니다.
            </p>
          )}
        </div>
      </div>

      <details className="subjective-mark">
        <summary>
          주관 마킹 (퀴즈 없이 직접 기록){quiz.available ? " · 권장하지 않음" : ""}
        </summary>
        <p className="muted small">
          본인이 *주관적으로* 충분히 이해했다고 판단할 때만 사용하세요. 점수는 같이 올라가지만
          객관 검증된 마킹은 아닙니다.
        </p>
        <div className="progress-actions">
          <form action={markProgressAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="outcome" value="got-it" />
            <button type="submit" className="secondary-button compact">학습 완료</button>
          </form>
          <form action={markProgressAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="outcome" value="unsure" />
            <button type="submit" className="secondary-button compact">헷갈림</button>
          </form>
          <form action={markProgressAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="outcome" value="dont-know" />
            <button type="submit" className="secondary-button compact danger">모름</button>
          </form>

          {progress ? (
            <form action={resetProgressAction}>
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="link-danger">진도 리셋</button>
            </form>
          ) : null}
        </div>
      </details>

      <details className="progress-rule">
        <summary>복습 일정 규칙</summary>
        <ul>
          <li><strong>퀴즈 통과 / 학습 완료</strong> — mastery +1, 다음 복습 3 → 7 → 21일</li>
          <li><strong>퀴즈 50~79% / 헷갈림</strong> — mastery 유지, 1일 후 재시도</li>
          <li><strong>퀴즈 50% 미만 / 모름</strong> — mastery 1로 재설정, 1일 후 재시도</li>
        </ul>
      </details>
    </section>
  );
}
