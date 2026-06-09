"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CategoryMeta, Topic } from "@/lib/types";

interface TopicSearchProps {
  topics: Topic[];
  categories: CategoryMeta[];
}

export function TopicSearch({ topics, categories }: TopicSearchProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesCategory = categoryId === "all" || topic.categoryId === categoryId;
      const haystack = `${topic.title} ${topic.summary} ${topic.excerpt} ${topic.categoryTitle}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryId, query, topics]);

  return (
    <section className="tool-surface" aria-labelledby="topic-search-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Knowledge Base</p>
          <h1 id="topic-search-title">지식 베이스</h1>
        </div>
        <span className="count-pill">{filteredTopics.length}개 문서</span>
      </div>

      <div className="search-row">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">문서 검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="옵셔널, actor, Auto Layout..."
          />
        </label>
        <label className="select-field">
          <span className="sr-only">카테고리 선택</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="all">전체 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card-grid topic-grid">
        {filteredTopics.map((topic) => (
          <Link key={topic.slug} href={`/topics/${topic.slug}`} className="topic-card">
            <span className="card-meta">{topic.categoryTitle}</span>
            <h2>{topic.title}</h2>
            <p>{topic.excerpt}</p>
            <span className="read-time">{topic.readingMinutes}분 읽기</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
