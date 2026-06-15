import Link from "next/link";
import type { Metadata } from "next";
import { getAllTopics, getTopicsByCategory } from "@/lib/content";
import { getAllProgress, getReviewQueue, getStats } from "@/lib/topic-progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "학습하기"
};

const MASTERY_LABEL: Record<number, string> = {
  0: "다시 학습",
  1: "학습 중",
  2: "복습 중",
  3: "익힘",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function LearnPage() {
  const allTopics = getAllTopics();
  const categories = getTopicsByCategory();
  const slugs = allTopics.map((t) => t.slug);
  const stats = getStats(slugs);
  const queue = getReviewQueue();
  const progress = getAllProgress();

  const progressBySlug = new Map(progress.map((p) => [p.slug, p]));

  // 추천 — 처음 보는 토픽 (해당 카테고리에서 진도 없는 첫 항목)
  const recommendations = categories
    .flatMap((cat) =>
      cat.topics
        .filter((t) => !progressBySlug.has(t.slug))
        .slice(0, 1)
        .map((t) => ({ category: cat.title, topic: t }))
    )
    .slice(0, 6);

  const lastStudied = progress.slice(0, 5);

  return (
    <section className="tool-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Learn</p>
          <h1>학습하기</h1>
          <p className="muted">전체 진도와 다음에 학습할 토픽을 한눈에.</p>
        </div>
        <Link href="/review" className="primary-button compact">
          복습 큐 ({queue.length})
        </Link>
      </div>

      <div className="metric-row">
        <div className="metric">
          <strong>{stats.studied}/{stats.total}</strong>
          <span>학습한 토픽</span>
        </div>
        <div className="metric">
          <strong>{stats.mastered}</strong>
          <span>익힘 (mastery 3)</span>
        </div>
        <div className="metric">
          <strong>{queue.length}</strong>
          <span>오늘 복습 대상</span>
        </div>
        <div className="metric">
          <strong>{Math.round((stats.studied / Math.max(1, stats.total)) * 100)}%</strong>
          <span>진도율</span>
        </div>
      </div>

      <section className="section-block">
        <h2>처음 보는 토픽 추천</h2>
        {recommendations.length === 0 ? (
          <p className="muted">모든 카테고리의 첫 토픽을 학습했습니다. <Link href="/review">복습 큐</Link>로 이동하세요.</p>
        ) : (
          <div className="card-grid recommendation-grid">
            {recommendations.map(({ category, topic }) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="learn-card">
                <span className="card-eyebrow">{category}</span>
                <strong>{topic.title}</strong>
                <span className="card-meta">{topic.readingMinutes}분 읽기</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <h2>카테고리별 진도</h2>
        <div className="category-progress-list">
          {categories.map((cat) => {
            const studiedHere = cat.topics.filter((t) => progressBySlug.has(t.slug)).length;
            const total = cat.topics.length;
            const pct = total > 0 ? Math.round((studiedHere / total) * 100) : 0;
            return (
              <div key={cat.id} className="category-progress-row">
                <Link href={`/topics`} className="category-name">
                  {cat.title}
                </Link>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="category-count">
                  {studiedHere}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {lastStudied.length > 0 ? (
        <section className="section-block">
          <h2>최근 학습</h2>
          <div className="recent-list">
            {lastStudied.map((p) => {
              const topic = allTopics.find((t) => t.slug === p.slug);
              if (!topic) return null;
              return (
                <Link key={p.slug} href={`/topics/${p.slug}`} className="recent-row">
                  <span className="recent-title">{topic.title}</span>
                  <span className={`mastery-pill mastery-${p.masteryLevel}`}>
                    {MASTERY_LABEL[p.masteryLevel]}
                  </span>
                  <span className="muted">최근 {fmtDate(p.lastStudiedAt)}</span>
                  <span className="muted">다음 {fmtDate(p.nextReviewAt)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
