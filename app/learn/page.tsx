import Link from "next/link";
import type { Metadata } from "next";
import { AlertCircle, Compass, Flag, Sparkles } from "lucide-react";
import { getAllTopics, getTopicsByCategory } from "@/lib/content";
import { getAllProgress, getReviewQueue, getStats } from "@/lib/topic-progress";
import { buildRecommendations, type TopicRec } from "@/lib/recommendations";

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

  const recs = buildRecommendations({ allTopics, categories });

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

      <RecBlock
        title="놓친 부분 메우기"
        hint="모의고사에서 틀린 / 채점 낮은 답변과 연결된 토픽"
        items={recs.weakSpots}
        Icon={AlertCircle}
        accent="weak"
        emptyHint="아직 시험 데이터가 없거나, 틀린 토픽이 모두 익힘 상태입니다."
      />

      <RecBlock
        title="이어서 학습"
        hint="가장 최근에 학습한 카테고리에서 남은 토픽"
        items={recs.continuation}
        Icon={Sparkles}
        accent="continue"
        emptyHint="진행 중인 카테고리가 없습니다. 아래 추천에서 시작해보세요."
      />

      <RecBlock
        title="다음 영역으로"
        hint="이미 시작한 카테고리들 중 우선 마무리할 곳"
        items={recs.nextFrontier}
        Icon={Compass}
        accent="next"
        emptyHint="진행 중인 다른 카테고리가 없습니다."
      />

      <RecBlock
        title="새 영역 도전"
        hint="아직 한 번도 안 본 카테고리의 시작 토픽"
        items={recs.freshStart}
        Icon={Flag}
        accent="fresh"
        emptyHint="모든 카테고리에 한 발을 들여놓았습니다."
      />

      {recs.weakSpots.length === 0 &&
      recs.continuation.length === 0 &&
      recs.nextFrontier.length === 0 &&
      recs.freshStart.length === 0 ? (
        <p className="muted">
          모든 카테고리 진도가 완료됐습니다. <Link href="/review">복습 큐</Link>로 이동하세요.
        </p>
      ) : null}

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

interface RecBlockProps {
  title: string;
  hint: string;
  items: TopicRec[];
  Icon: typeof Sparkles;
  accent: "weak" | "continue" | "next" | "fresh";
  emptyHint: string;
}

function RecBlock({ title, hint, items, Icon, accent, emptyHint }: RecBlockProps) {
  if (items.length === 0) {
    return (
      <section className={`section-block rec-block rec-${accent}`}>
        <div className="rec-head">
          <Icon size={18} aria-hidden="true" />
          <h2>{title}</h2>
        </div>
        <p className="muted">{emptyHint}</p>
      </section>
    );
  }
  return (
    <section className={`section-block rec-block rec-${accent}`}>
      <div className="rec-head">
        <Icon size={18} aria-hidden="true" />
        <h2>{title}</h2>
        <span className="rec-hint">{hint}</span>
      </div>
      <div className="card-grid recommendation-grid">
        {items.map((rec) => (
          <Link key={rec.slug} href={`/topics/${rec.slug}`} className="learn-card">
            <span className="card-eyebrow">{rec.category}</span>
            <strong>{rec.title}</strong>
            <span className="card-meta">{rec.reason}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
