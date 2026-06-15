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

export function TopicSearch({ topics, categories, topicLevels }: TopicSearchProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [levelTab, setLevelTab] = useState<LevelTab>("all");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesCategory = categoryId === "all" || topic.categoryId === categoryId;
      const haystack = `${topic.title} ${topic.summary} ${topic.excerpt} ${topic.categoryTitle}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const levels = topicLevels[topic.slug] ?? [];
      const matchesLevel = levelTab === "all" || levels.includes(levelTab);

      return matchesCategory && matchesQuery && matchesLevel;
    });
  }, [categoryId, levelTab, query, topicLevels, topics]);

  const grouped = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const topic of filteredTopics) {
      const list = map.get(topic.categoryId) ?? [];
      list.push(topic);
      map.set(topic.categoryId, list);
    }
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        category,
        items: map.get(category.id) ?? []
      }))
      .filter((entry) => entry.items.length > 0);
  }, [categories, filteredTopics]);

  const countByLevel = useMemo(() => {
    const counts: Record<LevelTab, number> = {
      all: topics.length,
      basic: 0,
      intermediate: 0,
      advanced: 0
    };
    for (const topic of topics) {
      const levels = topicLevels[topic.slug] ?? [];
      for (const lvl of levels) counts[lvl] += 1;
    }
    return counts;
  }, [topicLevels, topics]);

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

      {grouped.length === 0 ? (
        <p className="muted">조건에 맞는 문서가 없습니다.</p>
      ) : (
        <div className="topic-category-blocks">
          {grouped.map(({ category, items }) => (
            <section key={category.id} className="topic-category-block">
              <header className="topic-category-head">
                <h2>{category.title}</h2>
                <span className="muted small">{items.length}편</span>
              </header>
              <div className="card-grid topic-grid">
                {items.map((topic) => {
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
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
