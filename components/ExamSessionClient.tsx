"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Send } from "lucide-react";
import type { ExamAnswerResult, ExamQuestion, ExamResult, ExamSettings } from "@/lib/types";
import { buildExamSet } from "@/lib/exam-builder";

const SETTINGS_KEY = "ios-interview-exam-settings";
const RESULT_KEY = "ios-interview-exam-result";

interface ExamSessionClientProps {
  questions: ExamQuestion[];
}

interface ExamSession {
  settings: ExamSettings;
  startedAt: string;
  questions: ExamQuestion[];
}

type AnswerMap = Record<string, string>;

export function ExamSessionClient({ questions }: ExamSessionClientProps) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (!rawSettings) {
      return;
    }

    const settings = JSON.parse(rawSettings) as ExamSettings;
    const selectedQuestions = buildExamSet({ bank: questions, settings });

    setSession({
      settings,
      startedAt: new Date().toISOString(),
      questions: selectedQuestions
    });
    setRemainingSeconds(settings.durationMinutes * 60);
  }, [questions]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((answer) => answer.trim().length > 0).length;
  }, [answers]);

  const finishExam = useCallback(() => {
    if (!session || finishedRef.current) {
      return;
    }

    finishedRef.current = true;

    let score = 0;
    let objectiveTotal = 0;
    const answerResults: ExamAnswerResult[] = session.questions.map((question) => {
      const userAnswer = answers[question.id] ?? "";
      const isObjective = question.type === "objective";
      const isCorrect = isObjective ? userAnswer === question.correctChoiceId : null;

      if (isObjective) {
        objectiveTotal += 1;
        if (isCorrect) {
          score += 1;
        }
      }

      return {
        questionId: question.id,
        type: question.type,
        level: question.level,
        category: question.category,
        prompt: question.prompt,
        userAnswer,
        correctChoiceId: question.correctChoiceId,
        choices: question.choices,
        isCorrect,
        modelAnswer: question.modelAnswer,
        explanation: question.explanation,
        relatedTopicSlugs: question.relatedTopicSlugs
      };
    });

    const result: ExamResult = {
      startedAt: session.startedAt,
      finishedAt: new Date().toISOString(),
      settings: session.settings,
      score,
      objectiveTotal,
      total: session.questions.length,
      answers: answerResults
    };

    localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    localStorage.removeItem("ios-interview-exam-saved-id");
    window.location.href = "/exam/result";
  }, [answers, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finishExam();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishExam, session]);

  if (!session) {
    return (
      <section className="tool-surface narrow-state">
        <h1>진행 중인 시험 설정이 없습니다.</h1>
        <p>모의고사 설정 화면에서 레벨과 문제 수를 선택한 뒤 다시 시작하세요.</p>
        <Link href="/exam" className="secondary-button">
          <ArrowLeft size={18} aria-hidden="true" />
          설정으로 이동
        </Link>
      </section>
    );
  }

  return (
    <section className="exam-session" aria-labelledby="session-title">
      <div className="exam-sticky-bar">
        <div>
          <p className="eyebrow">Mock Interview</p>
          <h1 id="session-title">실전 모의고사 진행 중</h1>
        </div>
        <div className="session-status">
          <span>
            <Clock size={17} aria-hidden="true" />
            {formatRemaining(remainingSeconds)}
          </span>
          <span>
            <CheckCircle2 size={17} aria-hidden="true" />
            {answeredCount}/{session.questions.length}
          </span>
          <button className="primary-button compact" onClick={finishExam}>
            <Send size={17} aria-hidden="true" />
            제출
          </button>
        </div>
      </div>

      <div className="exam-question-list">
        {session.questions.map((question, index) => (
          <article key={question.id} className="exam-question-card">
            <div className="question-topline">
              <span>Q{index + 1}</span>
              <span>{question.type === "objective" ? "객관식" : "주관식"}</span>
              <span>{question.category}</span>
            </div>
            <h2>{question.prompt}</h2>
            {question.type === "objective" ? (
              <div className="choice-list">
                {question.choices?.map((choice) => (
                  <label key={choice.id} className={answers[question.id] === choice.id ? "choice active" : "choice"}>
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))}
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <label className="answer-field">
                <span className="sr-only">주관식 답변</span>
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                  placeholder="한 줄 요약 → 핵심 원리 → 예시 → 트레이드오프 순서로 답변해보세요."
                />
              </label>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
