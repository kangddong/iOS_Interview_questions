"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CategoryMeta, Level, Topic } from "@/lib/types";

interface TopicSearchProps {
  topics: Topic[];
  categories: CategoryMeta[];
  topicLevels: Record<string, Level[]>;
}

type LevelTab = "all" | Level;

const LEVEL_TABS: Array<{ id: LevelTab; label: string; hint: string }> = [
  { id: "all",          label: "전체",   hint: "모든 토픽" },
  { id: "basic",        label: "주니어", hint: "신입~1년차 빈출" },
  { id: "intermediate", label: "미들",   hint: "3년차 깊이/원리/트레이드오프" },
  { id: "advanced",     label: "시니어", hint: "ABI / 런타임 / 시스템 디자인" }
];

const ROADMAP_CATEGORY_ID = "00-overview";

export function TopicSearch({ topics, categories, topicLevels }: TopicSearchProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [levelTab, setLevelTab] = useState<LevelTab>("all");

  const visibleCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      if (categoryId === "all" && topic.categoryId === ROADMAP_CATEGORY_ID) {
        return false;
      }
      const matchesCategory = categoryId === "all" || topic.categoryId === categoryId;
      const haystack = `${topic.title} ${topic.summary} ${topic.excerpt} ${topic.categoryTitle}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const levels = topicLevels[topic.slug] ?? [];
      const matchesLevel = levelTab === "all" || levels.includes(levelTab);

      return matchesCategory && matchesQuery && matchesLevel;
    });
  }, [categoryId, levelTab, query, topicLevels, topics]);

  const countByLevel = useMemo(() => {
    const counts: Record<LevelTab, number> = {
      all: 0,
      basic: 0,
      intermediate: 0,
      advanced: 0
    };
    for (const topic of topics) {
      if (topic.categoryId === ROADMAP_CATEGORY_ID) continue;
      counts.all += 1;
      const levels = topicLevels[topic.slug] ?? [];
      for (const lvl of levels) counts[lvl] += 1;
    }
    return counts;
  }, [topicLevels, topics]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const topic of topics) {
      if (topic.categoryId !== ROADMAP_CATEGORY_ID) counts.all += 1;
      counts[topic.categoryId] = (counts[topic.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [topics]);

  return (
    <section className="tool-surface" aria-labelledby="topic-search-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Knowledge Base</p>
          <h1 id="topic-search-title">지식 베이스</h1>
        </div>
        <span className="count-pill">{filteredTopics.length}개 문서</span>
      </div>

      <div className="level-tabs" role="tablist" aria-label="레벨 탭">
        {LEVEL_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={levelTab === tab.id}
            className={levelTab === tab.id ? "level-tab active" : "level-tab"}
            onClick={() => setLevelTab(tab.id)}
            title={tab.hint}
          >
            <strong>{tab.label}</strong>
            <span className="level-tab-count">{countByLevel[tab.id]}</span>
          </button>
        ))}
      </div>

      <div className="category-chips" role="group" aria-label="카테고리 필터">
        <button
          type="button"
          aria-pressed={categoryId === "all"}
          className={categoryId === "all" ? "category-chip active" : "category-chip"}
          onClick={() => setCategoryId("all")}
        >
          전체
          <span className="category-chip-count">{countByCategory.all ?? 0}</span>
        </button>
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={categoryId === category.id}
            className={categoryId === category.id ? "category-chip active" : "category-chip"}
            onClick={() => setCategoryId(category.id)}
            title={category.description}
          >
            {category.title}
            <span className="category-chip-count">{countByCategory[category.id] ?? 0}</span>
          </button>
        ))}
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
      </div>

      {filteredTopics.length === 0 ? (
        <p className="muted">조건에 맞는 문서가 없습니다.</p>
      ) : (
        <div className="card-grid topic-grid">
          {filteredTopics.map((topic) => {
            const levels = topicLevels[topic.slug] ?? [];
            return (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="topic-card">
                <span className="card-meta">{topic.categoryTitle}</span>
                <h2>{topic.title}</h2>
                <p>{topic.excerpt}</p>
                <div className="topic-card-foot">
                  <span className="read-time">{topic.readingMinutes}분 읽기</span>
                  {levels.map((lvl) => (
                    <span key={lvl} className={`level-chip level-${lvl}`}>
                      {lvl === "basic" ? "주니어" : lvl === "intermediate" ? "미들" : "시니어"}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
