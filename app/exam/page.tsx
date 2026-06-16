import type { Metadata } from "next";
import { ExamSetupClient } from "@/components/ExamSetupClient";
import { getExamQuestionBank } from "@/lib/exam";

export const metadata: Metadata = {
  title: "실전 모의고사"
};

export default function ExamPage() {
  return <ExamSetupClient questions={getExamQuestionBank()} />;
}
