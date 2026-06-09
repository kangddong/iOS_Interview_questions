import Link from "next/link";
import type { Metadata } from "next";
import { listPendingSubjective } from "@/lib/exam-store";
import { GradeForm } from "@/components/GradeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "채점 대기"
};

export default function GradingPage() {
  const pending = listPendingSubjective();

  return (
    <section className="tool-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>채점 대기 — {pending.length}건</h1>
          <p className="muted">자기 점검 기준 4개를 기억하면서 0~5점으로 채점.</p>
        </div>
        <Link href="/admin/attempts" className="secondary-button compact">
          시도 기록 →
        </Link>
      </div>

      <div className="self-check">
        <h2>자기 점검 기준</h2>
        <ul>
          <li>첫 문장에 개념의 목적과 결론을 말했는가?</li>
          <li>내부 동작 원리나 비용을 한 단계 이상 설명했는가?</li>
          <li>코드나 실무 상황 예시를 붙였는가?</li>
          <li>트레이드오프와 흔한 함정을 언급했는가?</li>
        </ul>
      </div>

      {pending.length === 0 ? (
        <p>채점할 항목이 없습니다. <Link href="/exam">시험 보러 가기</Link></p>
      ) : (
        <div className="result-list">
          {pending.map((ans, i) => (
            <article key={ans.id} className="result-card">
              <div className="question-topline">
                <span>대기 {i + 1}</span>
                <span>{ans.category}</span>
                <span>{ans.level}</span>
              </div>
              <h2>{ans.prompt}</h2>

              {ans.userAnswer ? (
                <pre className="answer-pre">{ans.userAnswer}</pre>
              ) : (
                <p className="answer-line muted">미응답</p>
              )}

              {ans.explanation ? (
                <details className="answer-explanation">
                  <summary>해설 / 모범 답안 보기</summary>
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

              <GradeForm
                answerId={ans.id}
                grade={ans.grade}
                gradeNote={ans.gradeNote}
                gradedAt={ans.gradedAt}
              />
              <p className="muted">
                <Link href={`/admin/attempts/${ans.attemptId}`}>이 시도 전체 보기</Link>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
