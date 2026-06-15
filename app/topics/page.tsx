import type { Metadata } from "next";
import { TopicSearch } from "@/components/TopicSearch";
import { CATEGORIES, getAllTopics } from "@/lib/content";
import { getLevelsForSlug } from "@/lib/topic-levels";
import type { Level } from "@/lib/types";

export const metadata: Metadata = {
  title: "지식 베이스"
};

export default function TopicsPage() {
  const topics = getAllTopics();
  const topicLevels: Record<string, Level[]> = {};
  for (const t of topics) {
    topicLevels[t.slug] = getLevelsForSlug(t.slug);
  }
  return (
    <TopicSearch
      topics={topics}
      categories={CATEGORIES}
      topicLevels={topicLevels}
    />
  );
}
