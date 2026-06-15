import { markProgressAction, resetProgressAction } from "@/lib/actions";
import { getProgress } from "@/lib/topic-progress";

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
      ) : (
        <p className="muted">이 토픽은 아직 학습 기록이 없습니다. 아래 버튼으로 첫 학습을 기록하세요.</p>
      )}

      <p className="muted">이번 학습은 어땠나요? 선택하면 다음 복습 일정이 자동으로 정해집니다.</p>

      <div className="progress-actions">
        <form action={markProgressAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="outcome" value="got-it" />
          <button type="submit" className="primary-button compact">학습 완료</button>
        </form>
        <form action={markProgressAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="outcome" value="unsure" />
          <button type="submit" className="secondary-button compact">헷갈림</button>
        </form>
        <form action={markProgressAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="outcome" value="dont-know" />
          <button type="submit" className="secondary-button compact danger">모름 (처음부터)</button>
        </form>

        {progress ? (
          <form action={resetProgressAction}>
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" className="link-danger">진도 리셋</button>
          </form>
        ) : null}
      </div>

      <details className="progress-rule">
        <summary>복습 일정 규칙</summary>
        <ul>
          <li><strong>학습 완료</strong> — mastery +1, 다음 복습 {`3 → 7 → 21일 간격으로 확장`}</li>
          <li><strong>헷갈림</strong> — mastery 유지, 다음 복습 1일 후</li>
          <li><strong>모름</strong> — mastery 1로 재설정, 다음 복습 1일 후</li>
        </ul>
      </details>
    </section>
  );
}
