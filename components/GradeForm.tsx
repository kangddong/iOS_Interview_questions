import { gradeAnswerAction, ungradeAnswerAction } from "@/lib/actions";

interface Props {
  answerId: string;
  grade: number | null;
  gradeNote: string | null;
  gradedAt: string | null;
}

const SCALE = [0, 1, 2, 3, 4, 5];

export function GradeForm({ answerId, grade, gradeNote, gradedAt }: Props) {
  const isGraded = grade !== null;
  return (
    <div className="grade-block">
      {isGraded ? (
        <p className="grade-meta">
          현재 점수 <strong>{grade}/5</strong>
          {gradedAt ? ` · 채점 ${new Date(gradedAt).toLocaleString()}` : null}
        </p>
      ) : null}

      <form action={gradeAnswerAction} className="grade-form">
        <input type="hidden" name="answerId" value={answerId} />
        <div className="grade-scale">
          {SCALE.map((n) => (
            <label key={n} className="grade-pip">
              <input
                type="radio"
                name="grade"
                value={n}
                defaultChecked={grade === n}
                required
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
        <textarea
          name="note"
          rows={3}
          placeholder="채점 메모 (왜 이 점수인가)"
          defaultValue={gradeNote ?? ""}
        />
        <div className="grade-actions">
          <button type="submit" className="primary-button compact">
            {isGraded ? "재채점 저장" : "채점 저장"}
          </button>
        </div>
      </form>

      {isGraded ? (
        <form action={ungradeAnswerAction}>
          <input type="hidden" name="answerId" value={answerId} />
          <button type="submit" className="link-danger">채점 취소</button>
        </form>
      ) : null}
    </div>
  );
}
