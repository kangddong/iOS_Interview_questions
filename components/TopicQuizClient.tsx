"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { submitQuizAction, type QuizActionResult } from "@/lib/actions";
import type { ExamQuestion } from "@/lib/types";

interface Props {
  slug: string;
  topicTitle: string;
  questions: ExamQuestion[];
  threshold: number;
}

export function TopicQuizClient({ slug, topicTitle, questions, threshold }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizActionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = questions.length;
  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[k]).length,
    [answers]
  );

  const canSubmit = answeredCount === total && !submitting && !result;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        slug,
        answers: questions.map((q) => ({
          questionId: q.id,
          chosen: answers[q.id] ?? "",
        })),
      };
      const res = await submitQuizAction(payload);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  const correctByQuestion = useMemo(() => {
    if (!result) return new Map<string, boolean>();
    return new Map(result.details.map((d) => [d.questionId, d.isCorrect]));
  }, [result]);

  const correctChoiceByQuestion = useMemo(() => {
    if (!result) return new Map<string, string>();
    return new Map(result.details.map((d) => [d.questionId, d.correct]));
  }, [result]);

  const passRatio = result ? result.correct / Math.max(1, result.total) : 0;

  return (
    <section className="tool-surface" aria-labelledby="quiz-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Check Quiz</p>
          <h1 id="quiz-title">{topicTitle} — 체크 퀴즈</h1>
          <p className="muted">
            총 {total}문항 · 통과 기준 {Math.round(threshold * 100)}%
          </p>
        </div>
        <Link href={`/topics/${slug}`} className="secondary-button compact">
          토픽으로 돌아가기
        </Link>
      </div>

      {result ? (
        <div className={`quiz-result ${result.passed ? "pass" : "fail"}`}>
          <div className="quiz-result-head">
            {result.passed ? (
              <CheckCircle2 size={22} aria-hidden="true" />
            ) : (
              <XCircle size={22} aria-hidden="true" />
            )}
            <strong>
              {result.correct}/{result.total} ({Math.round(passRatio * 100)}%) ·{" "}
              {result.passed ? "통과" : "미통과"}
            </strong>
          </div>
          <p className="muted">
            {result.passed
              ? "진도 mastery가 한 단계 올라가고 다음 복습일이 자동 연장됐습니다."
              : passRatio >= 0.5
                ? "절반 이상 맞췄지만 통과 기준엔 부족합니다. 본문을 다시 보고 재도전하세요."
                : "기초가 흔들리는 신호입니다. 본문을 다시 정독한 뒤 도전하세요."}
          </p>
          <div className="quiz-actions">
            <button type="button" className="primary-button compact" onClick={reset}>
              다시 풀기
            </button>
            <Link href={`/topics/${slug}`} className="secondary-button compact">
              본문으로
            </Link>
          </div>
        </div>
      ) : (
        <div className="quiz-status">
          <span>
            응답 {answeredCount}/{total}
          </span>
          <button
            type="button"
            className="primary-button compact"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "채점 중..." : "제출"}
          </button>
        </div>
      )}

      <ol className="quiz-list">
        {questions.map((q, idx) => {
          const chosen = answers[q.id];
          const isCorrect = correctByQuestion.get(q.id);
          const correctChoiceId = correctChoiceByQuestion.get(q.id);
          return (
            <li key={q.id} className="quiz-card">
              <div className="quiz-card-head">
                <span>Q{idx + 1}</span>
                {result ? (
                  isCorrect ? (
                    <span className="mini-pill correct">정답</span>
                  ) : (
                    <span className="mini-pill wrong">오답</span>
                  )
                ) : null}
              </div>
              <p className="quiz-prompt">{q.prompt}</p>
              <div className="choice-list">
                {q.choices?.map((choice) => {
                  const selected = chosen === choice.id;
                  const isResolvedCorrect =
                    result && correctChoiceId === choice.id;
                  let cls = "choice";
                  if (selected) cls += " active";
                  if (result && selected && isCorrect === false) cls += " choice-wrong";
                  if (isResolvedCorrect) cls += " choice-correct";
                  return (
                    <label key={choice.id} className={cls}>
                      <input
                        type="radio"
                        name={q.id}
                        value={choice.id}
                        checked={selected}
                        disabled={!!result}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [q.id]: choice.id,
                          }))
                        }
                      />
                      <span>{choice.text}</span>
                    </label>
                  );
                })}
              </div>
              {result ? (
                <details className="quiz-explanation">
                  <summary>해설</summary>
                  <p>{q.explanation}</p>
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
