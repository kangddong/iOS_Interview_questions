import { objectiveExamQuestions } from "@/data/examQuestions";
import { getQuestionBank } from "@/lib/content";
import { partIdFor } from "@/lib/exam-parts";
import type { ExamQuestion } from "@/lib/types";

export function getExamQuestionBank(): ExamQuestion[] {
  const subjective: ExamQuestion[] = getQuestionBank().map((q) => ({
    id: `subjective-${q.id}`,
    type: "subjective",
    level: q.level,
    category: q.category,
    partId: partIdFor(q.category),
    prompt: q.prompt,
    modelAnswer:
      q.relatedTopicSlugs.length > 0
        ? "관련 학습 문서의 한 줄 요약, 핵심 메커니즘, 예시, 트레이드오프 순서로 답변을 구성하세요."
        : "문제를 한 문장으로 정의하고, 핵심 원리와 실무 주의점을 함께 설명하세요.",
    explanation:
      q.relatedTopicSlugs.length > 0
        ? "결과 화면의 관련 문서 링크에서 모범 답변 흐름을 확인할 수 있습니다."
        : "이 문항은 직접 답변을 작성한 뒤 체크리스트로 자기 점검하는 주관식 문항입니다.",
    relatedTopicSlugs: q.relatedTopicSlugs,
  }));

  const objective: ExamQuestion[] = objectiveExamQuestions.map((q) => ({
    ...q,
    partId: partIdFor(q.category),
  }));

  return [...objective, ...subjective];
}
