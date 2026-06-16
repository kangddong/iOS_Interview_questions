"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import type { ExamResult } from "@/lib/types";
import { saveAttemptAction } from "@/lib/actions";

const RESULT_KEY = "ios-interview-exam-result";
const SAVED_KEY = "ios-interview-exam-saved-id";

export function ExamResultClient() {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const rawResult = localStorage.getItem(RESULT_KEY);
    if (!rawResult) return;
    const parsed = JSON.parse(rawResult) as ExamResult;
    setResult(parsed);

    const existing = localStorage.getItem(SAVED_KEY);
    if (existing) {
      setSavedId(existing);
      return;
    }
    saveAttemptAction(parsed)
      .then(({ id }) => {
        localStorage.setItem(SAVED_KEY, id);
        setSavedId(id);
      })
      .catch((e) => setSaveError(e instanceof Error ? e.message : "저장 실패"));
  }, []);

  const subjectiveCount = useMemo(() => {
    return result?.answers.filter((answer) => answer.type === "subjective").length ?? 0;
  }, [result]);

  if (!result) {
    return (
      <section className="tool-surface narrow-state">
        <h1>저장된 결과가 없습니다.</h1>
        <p>모의고사를 완료하면 이 화면에서 점수와 복습 링크를 확인할 수 있습니다.</p>
        <Link href="/exam" className="secondary-button">
          <ArrowLeft size={18} aria-hidden="true" />
          모의고사로 이동
        </Link>
      </section>
    );
  }

  return (
    <section className="tool-surface" aria-labelledby="result-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Result</p>
          <h1 id="result-title">모의고사 결과</h1>
        </div>
        <Link href="/exam" className="secondary-button compact">
          <RotateCcw size={17} aria-hidden="true" />
          다시 풀기
        </Link>
      </div>

      <div className="save-status" aria-live="polite">
        {saveError ? (
          <p className="save-error">DB 저장 실패: {saveError}</p>
        ) : savedId ? (
          <p className="save-ok">
            기록 저장 완료. <Link href="/admin/attempts">시도 기록</Link> ·{" "}
            <Link href="/admin/grading">채점 대기</Link>
          </p>
        ) : (
          <p className="save-pending">DB에 저장 중…</p>
        )}
      </div>

      <div className="result-summary">
        <div className="score-block">
          <strong>
            {result.objectiveTotal > 0 ? `${result.score}/${result.objectiveTotal}` : "자기 점검"}
          </strong>
          <span>{result.objectiveTotal > 0 ? "객관식 점수" : "주관식 전용 결과"}</span>
        </div>
        <div className="metric">
          <strong>{result.total}</strong>
          <span>전체 문항</span>
        </div>
        <div className="metric">
          <strong>{subjectiveCount}</strong>
          <span>주관식</span>
        </div>
      </div>

      <div className="self-check">
        <h2>주관식 자기 점검 기준</h2>
        <ul>
          <li>첫 문장에 개념의 목적과 결론을 말했는가?</li>
          <li>내부 동작 원리나 비용을 한 단계 이상 설명했는가?</li>
          <li>코드나 실무 상황 예시를 붙였는가?</li>
          <li>트레이드오프와 흔한 함정을 언급했는가?</li>
        </ul>
      </div>

      <div className="result-list">
        {result.answers.map((answer, index) => (
          <article key={answer.questionId} className="result-card">
            <div className="question-topline">
              <span>Q{index + 1}</span>
              <span>{answer.type === "objective" ? "객관식" : "주관식"}</span>
              <span>{answer.category}</span>
            </div>
            <h2>{answer.prompt}</h2>
            {answer.type === "objective" ? (
              <div className={answer.isCorrect ? "result-badge correct" : "result-badge wrong"}>
                {answer.isCorrect ? <Check size={17} aria-hidden="true" /> : <X size={17} aria-hidden="true" />}
                {answer.isCorrect ? "정답" : "오답"}
              </div>
            ) : null}
            {answer.type === "objective" ? (
              <p className="answer-line">
                선택: {answer.choices?.find((choice) => choice.id === answer.userAnswer)?.text ?? "미응답"}
              </p>
            ) : (
              <p className="answer-line">내 답변: {answer.userAnswer || "미응답"}</p>
            )}
            {answer.type === "objective" ? (
              <p className="answer-line">
                정답: {answer.choices?.find((choice) => choice.id === answer.correctChoiceId)?.text}
              </p>
            ) : null}
            <p>{answer.explanation}</p>
            {answer.relatedTopicSlugs.length > 0 ? (
              <div className="related-links">
                {answer.relatedTopicSlugs.slice(0, 3).map((slug) => (
                  <Link key={slug} href={`/topics/${slug}`}>
                    관련 문서 보기
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
