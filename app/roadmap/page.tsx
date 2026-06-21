import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTopicsByCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "학습 로드맵"
};

const ROADMAP_CATEGORY_ID = "00-overview";

export default function RoadmapPage() {
  const categories = getTopicsByCategory().filter((c) => c.id !== ROADMAP_CATEGORY_ID);

  return (
    <div className="home-layout">
      <section className="roadmap-hero" aria-labelledby="roadmap-page-title">
        <p className="eyebrow">Roadmap</p>
        <h1 id="roadmap-page-title">학습 로드맵</h1>
        <p>면접까지 남은 시간에 따라 학습 순서를 잡는 전체 지도. 각 단계는 해당 영역의 첫 문서로 바로 이어집니다.</p>
      </section>

      <div className="roadmap-timeline">
        {categories.map((category) => {
          const first = category.topics[0];
          return (
            <Link
              key={category.id}
              href={`/topics/${first.slug}`}
              className="roadmap-node"
              data-order={String(category.order).padStart(2, "0")}
            >
              <div>
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>
              <span className="roadmap-node-meta">
                {category.topics.length}편
                <ArrowRight size={14} aria-hidden="true" style={{ marginLeft: 4 }} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
