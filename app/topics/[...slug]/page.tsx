import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { TopicProgressPanel } from "@/components/TopicProgressPanel";
import { getAllTopics, getQuestionBank, getTopicBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

interface TopicPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export function generateStaticParams() {
  return getAllTopics().map((topic) => ({
    slug: topic.slugSegments
  }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  return {
    title: topic?.title ?? "문서"
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const relatedQuestions = getQuestionBank()
    .filter((question) => question.relatedTopicSlugs.includes(topic.slug))
    .slice(0, 8);

  return (
    <div className="article-layout">
      <article className="article-shell">
        <Link href="/topics" className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          지식 베이스
        </Link>
        <header className="article-header">
          <p className="eyebrow">{topic.categoryTitle}</p>
          <h1>{topic.title}</h1>
          <div className="article-meta">
            <span>
              <Clock3 size={16} aria-hidden="true" />
              {topic.readingMinutes}분 읽기
            </span>
            <span>{topic.sourcePath}</span>
          </div>
          {topic.summary ? <p className="article-summary">{topic.summary}</p> : null}
        </header>
        <div className="markdown-body">
          <MarkdownArticle sourcePath={topic.sourcePath} body={topic.body} />
        </div>

        <TopicProgressPanel slug={topic.slug} />
      </article>

      <aside className="article-aside" aria-label="문서 보조 정보">
        {topic.headings.length > 0 ? (
          <section>
            <h2>문서 구성</h2>
            <ul>
              {topic.headings.map((heading) => (
                <li key={heading}>{heading}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedQuestions.length > 0 ? (
          <section>
            <h2>관련 질문</h2>
            <ul>
              {relatedQuestions.map((question) => (
                <li key={question.id}>
                  <Link href="/questions">{question.prompt}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
