import type { Metadata } from "next";
import { TopicSearch } from "@/components/TopicSearch";
import { CATEGORIES, getAllTopics } from "@/lib/content";

export const metadata: Metadata = {
  title: "지식 베이스"
};

export default function TopicsPage() {
  return <TopicSearch topics={getAllTopics()} categories={CATEGORIES} />;
}
