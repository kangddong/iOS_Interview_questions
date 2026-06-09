"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { LEVEL_LABELS } from "@/lib/constants";
import type { Level, Question } from "@/lib/types";

interface QuestionsBankClientProps {
  questions: Question[];
  initialLevel?: Level | "all";
}

export function QuestionsBankClient({ questions, initialLevel = "all" }: QuestionsBankClientProps) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">(initialLevel);

  const categories = useMemo(() => {
    return Array.from(new Set(questions.map((question) => question.category))).sort((a, b) => a.localeCompare(b, "ko"));
  }, [questions]);

  const [category, setCategory] = useState("all");

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesLevel = level === "all" || question.level === level;
      const matchesCategory = category === "all" || question.category === category;
      const matchesQuery =
        !normalizedQuery ||
        `${question.prompt} ${question.category} ${LEVEL_LABELS[question.level]}`.toLowerCase().includes(normalizedQuery);

      return matchesLevel && matchesCategory && matchesQuery;
    });
  }, [category, level, query, questions]);

  return (
    <section className="tool-surface" aria-labelledby="questions-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Question Bank</p>
          <h1 id="questions-title">레벨별 질문 뱅크</h1>
        </div>
        <span className="count-pill">{filteredQuestions.length}개 질문</span>
      </div>

      <div className="search-row three">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">질문 검색</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="메인 스레드, weak, TLS..." />
        </label>
        <label className="select-field icon-select">
          <Filter size={17} aria-hidden="true" />
          <span className="sr-only">레벨 선택</span>
          <select value={level} onChange={(event) => setLevel(event.target.value as Level | "all")}>
            <option value="all">전체 레벨</option>
            <option value="basic">주니어</option>
            <option value="intermediate">3년차 미들</option>
            <option value="advanced">심화</option>
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">카테고리 선택</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">전체 카테고리</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="question-list">
        {filteredQuestions.map((question) => (
          <article key={question.id} className="question-card">
            <div className="question-topline">
              <span>{LEVEL_LABELS[question.level]}</span>
              <span>{question.category}</span>
            </div>
            <h2>{question.prompt}</h2>
            {question.relatedTopicSlugs.length > 0 ? (
              <div className="related-links">
                {question.relatedTopicSlugs.slice(0, 3).map((slug) => (
                  <Link key={slug} href={`/topics/${slug}`}>
                    관련 문서
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
