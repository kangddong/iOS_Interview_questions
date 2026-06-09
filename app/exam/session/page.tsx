import type { Metadata } from "next";
import { ExamSessionClient } from "@/components/ExamSessionClient";
import { getExamQuestionBank } from "@/lib/exam";

export const metadata: Metadata = {
  title: "모의고사 진행"
};

export default function ExamSessionPage() {
  return <ExamSessionClient questions={getExamQuestionBank()} />;
}
