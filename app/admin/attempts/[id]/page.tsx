import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttemptWithAnswers } from "@/lib/exam-store";
import { GradeForm } from "@/components/GradeForm";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttemptDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = getAttemptWithAnswers(id);
  if (!data) notFound();
  const { attempt, answers } = data;

  return (
    <section className="tool-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Attempt</p>
          <h1>{fmt(attempt.submittedAt)}</h1>
          <p className="muted">
            {attempt.level ?? "-"} · {attempt.mode ?? "-"} · 객관식{" "}
            {attempt.objectiveTotal > 0
              ? `${attempt.objectiveScore}/${attempt.objectiveTotal}`
              : "-"}{" "}
            · 문항 {attempt.totalAnswers} · 채점 대기 {attempt.subjectivePending}
          </p>
        </div>
        <Link href="/admin/attempts" className="secondary-button compact">
          ← 목록
        </Link>
      </div>

      <div className="result-list">
        {answers.map((ans, i) => (
          <article key={ans.id} className="result-card">
            <div className="question-topline">
              <span>Q{i + 1}</span>
              <span>{ans.type === "objective" ? "객관식" : "주관식"}</span>
              <span>{ans.category}</span>
            </div>
            <h2>{ans.prompt}</h2>

            {ans.type === "objective" ? (
              <div
                className={
                  ans.isCorrect === 1 ? "result-badge correct" : "result-badge wrong"
                }
              >
                {ans.isCorrect === 1 ? "정답" : "오답"}
              </div>
            ) : null}

            {ans.userAnswer ? (
              <pre className="answer-pre">{ans.userAnswer}</pre>
            ) : (
              <p className="answer-line muted">미응답</p>
            )}

            {ans.explanation ? (
              <details className="answer-explanation">
                <summary>해설 / 모범 답안</summary>
                {ans.modelAnswer ? <pre className="answer-pre">{ans.modelAnswer}</pre> : null}
                <p>{ans.explanation}</p>
                {ans.relatedSlugs.length > 0 ? (
                  <div className="related-links">
                    {ans.relatedSlugs.slice(0, 5).map((slug) => (
                      <Link key={slug} href={`/topics/${slug}`}>
                        {slug}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </details>
            ) : null}

            {ans.type === "subjective" ? (
              <GradeForm
                answerId={ans.id}
                grade={ans.grade}
                gradeNote={ans.gradeNote}
                gradedAt={ans.gradedAt}
              />
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
