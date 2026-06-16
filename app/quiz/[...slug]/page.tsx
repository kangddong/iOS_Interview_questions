import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTopicBySlug } from "@/lib/content";
import { pickQuiz, QUIZ_MIN_LENGTH, QUIZ_PASS_THRESHOLD } from "@/lib/topic-quiz";
import { TopicQuizClient } from "@/components/TopicQuizClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  return { title: topic ? `${topic.title} — 체크 퀴즈` : "체크 퀴즈" };
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const questions = pickQuiz(topic.slug);

  if (questions.length < QUIZ_MIN_LENGTH) {
    return (
      <section className="tool-surface narrow-state">
        <h1>{topic.title} — 체크 퀴즈 준비 중</h1>
        <p className="muted">
          이 토픽은 아직 객관식 문항이 {questions.length}개라 체크 퀴즈를 운영할 수
          없습니다 (최소 {QUIZ_MIN_LENGTH}개 필요). 본문을 읽은 뒤 토픽 페이지의
          *주관 마킹*으로 진도를 기록할 수 있습니다.
        </p>
        <Link href={`/topics/${topic.slug}`} className="primary-button compact">
          본문으로 이동
        </Link>
      </section>
    );
  }

  return (
    <TopicQuizClient
      slug={topic.slug}
      topicTitle={topic.title}
      questions={questions}
      threshold={QUIZ_PASS_THRESHOLD}
    />
  );
}
