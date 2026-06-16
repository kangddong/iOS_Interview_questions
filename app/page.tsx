import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, ListChecks, PenLine } from "lucide-react";
import { CATEGORIES, getAllTopics, getQuestionBank, getTopicsByCategory, LEVEL_LABELS } from "@/lib/content";
import type { Level, Topic } from "@/lib/types";

const FEATURED_SLUGS = [
  "01-swift-language/optional",
  "02-memory-management/retain-cycle",
  "03-concurrency/async-await",
  "04-uikit/viewcontroller-lifecycle",
  "05-swiftui/state-management",
  "10-performance/main-thread-and-hitch"
];

export default function HomePage() {
  const topics = getAllTopics();
  const groupedTopics = getTopicsByCategory();
  const questions = getQuestionBank();
  const featuredTopics = FEATURED_SLUGS.map((slug) => topics.find((topic) => topic.slug === slug)).filter(
    (topic): topic is Topic => Boolean(topic)
  );
  const questionCounts = (["basic", "intermediate", "advanced"] as Level[]).map((level) => ({
    level,
    label: LEVEL_LABELS[level],
    count: questions.filter((question) => question.level === level).length
  }));

  return (
    <div className="home-layout">
      <section className="dashboard-hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">Swift Interview Study</p>
          <h1 id="home-title">지식처럼 찾아보고, 실전처럼 풀어보는 iOS 면접 준비</h1>
          <p>
            현재 저장소의 Markdown 문서를 웹 지식 베이스로 묶고, 레벨별 질문을 모의고사로 변환했습니다.
            개념 정리에서 답변 연습까지 한 흐름으로 진행합니다.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/topics" className="primary-button">
            <BookOpen size={18} aria-hidden="true" />
            지식 베이스 열기
          </Link>
          <Link href="/exam" className="secondary-button">
            <PenLine size={18} aria-hidden="true" />
            모의고사 시작
          </Link>
        </div>
      </section>

      <section className="metric-row" aria-label="콘텐츠 현황">
        <div className="metric">
          <strong>{topics.length}</strong>
          <span>학습 문서</span>
        </div>
        <div className="metric">
          <strong>{questions.length}</strong>
          <span>면접 질문</span>
        </div>
        <div className="metric">
          <strong>{CATEGORIES.length}</strong>
          <span>학습 영역</span>
        </div>
      </section>

      <section className="content-band" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Roadmap</p>
            <h2 id="roadmap-title">학습 로드맵</h2>
          </div>
          <Link href="/topics/00-overview" className="text-link">
            전체 로드맵
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-list">
          {groupedTopics.slice(0, 6).map((category) => (
            <Link key={category.id} href={`/topics/${category.topics[0].slug}`} className="roadmap-item">
              <span>{category.order}</span>
              <div>
                <strong>{category.title}</strong>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Core Topics</p>
            <h2 id="featured-title">바로 복습할 핵심 주제</h2>
          </div>
          <Link href="/topics" className="text-link">
            전체 문서
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="card-grid">
          {featuredTopics.map((topic) => (
            <Link key={topic.slug} href={`/topics/${topic.slug}`} className="topic-card">
              <span className="card-meta">{topic.categoryTitle}</span>
              <h3>{topic.title}</h3>
              <p>{topic.excerpt}</p>
              <span className="read-time">
                <Clock3 size={15} aria-hidden="true" />
                {topic.readingMinutes}분
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band" aria-labelledby="level-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Practice</p>
            <h2 id="level-title">레벨별 질문</h2>
          </div>
          <Link href="/questions" className="text-link">
            질문 뱅크
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="level-grid">
          {questionCounts.map((item) => (
            <Link key={item.level} href={`/questions?level=${item.level}`} className="level-card">
              <ListChecks size={20} aria-hidden="true" />
              <strong>{item.label}</strong>
              <span>{item.count}개 질문</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
