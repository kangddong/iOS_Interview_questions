import type { Metadata } from "next";
import { QuestionsBankClient } from "@/components/QuestionsBankClient";
import { getQuestionBank } from "@/lib/content";
import type { Level } from "@/lib/types";

export const metadata: Metadata = {
  title: "질문 뱅크"
};

interface QuestionsPageProps {
  searchParams: Promise<{
    level?: string;
  }>;
}

const LEVELS = new Set(["basic", "intermediate", "advanced"]);

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const { level } = await searchParams;
  const initialLevel = level && LEVELS.has(level) ? (level as Level) : "all";

  return <QuestionsBankClient questions={getQuestionBank()} initialLevel={initialLevel} />;
}
