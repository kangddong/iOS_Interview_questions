import Link from "next/link";
import type { Metadata } from "next";
import { getAllTopics } from "@/lib/content";
import { getReviewQueue } from "@/lib/topic-progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "복습하기"
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

export default function ReviewPage() {
  const queue = getReviewQueue();
  const topics = getAllTopics();
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

  return (
    <section className="tool-surface">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h1>복습 큐 — {queue.length}건</h1>
          <p className="muted">
            오늘 복습할 시간이 된 토픽들. mastery 낮은 / 오래된 순서로 정렬.
          </p>
        </div>
        <Link href="/learn" className="secondary-button compact">
          학습 대시보드
        </Link>
      </div>

      {queue.length === 0 ? (
        <div className="empty-state">
          <p>오늘 복습할 토픽이 없습니다. 잘하고 있어요.</p>
          <Link href="/learn" className="primary-button compact">
            새 토픽 학습하기
          </Link>
        </div>
      ) : (
        <div className="review-list">
          {queue.map((item) => {
            const topic = topicBySlug.get(item.slug);
            if (!topic) return null;
            return (
              <Link key={item.slug} href={`/topics/${item.slug}`} className="review-card">
                <div className="review-card-head">
                  <span className="card-eyebrow">{topic.categoryTitle}</span>
                  <span className={`mastery-pill mastery-${item.masteryLevel}`}>
                    {MASTERY_LABEL[item.masteryLevel]}
                  </span>
                </div>
                <h3>{topic.title}</h3>
                <p className="muted">{topic.summary}</p>
                <div className="review-meta">
                  <span>최근 학습 {fmtDate(item.lastStudiedAt)}</span>
                  <span>{topic.readingMinutes}분 읽기</span>
                  {item.daysOverdue > 0 ? (
                    <span className="overdue-pill">{item.daysOverdue}일 지남</span>
                  ) : (
                    <span className="muted">오늘 복습 예정</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
