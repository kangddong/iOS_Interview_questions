import Link from "next/link";
import type { Metadata } from "next";
import { listAttempts } from "@/lib/exam-store";
import { deleteAttemptAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "시도 기록"
};

function fmt(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function AttemptsPage() {
  const attempts = listAttempts();
  return (
    <section className="tool-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>시도 기록</h1>
        </div>
        <Link href="/admin/grading" className="secondary-button compact">
          채점 대기로 →
        </Link>
      </div>

      {attempts.length === 0 ? (
        <p>아직 저장된 시도 기록이 없습니다. <Link href="/exam">시험 보러 가기</Link></p>
      ) : (
        <div className="attempt-table">
          <div className="attempt-row attempt-head">
            <span>일시</span>
            <span>레벨/모드</span>
            <span>객관식</span>
            <span>총 문항</span>
            <span>채점 대기</span>
            <span></span>
          </div>
          {attempts.map((a) => (
            <div key={a.id} className="attempt-row">
              <span>{fmt(a.submittedAt)}</span>
              <span>{a.level ?? "-"} / {a.mode ?? "-"}</span>
              <span>
                {a.objectiveTotal > 0 ? `${a.objectiveScore}/${a.objectiveTotal}` : "-"}
              </span>
              <span>{a.totalAnswers}</span>
              <span className={a.subjectivePending > 0 ? "pending-badge" : ""}>
                {a.subjectivePending}
              </span>
              <span className="row-actions">
                <Link href={`/admin/attempts/${a.id}`}>상세</Link>
                <form action={deleteAttemptAction}>
                  <input type="hidden" name="attemptId" value={a.id} />
                  <button type="submit" className="link-danger">삭제</button>
                </form>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
