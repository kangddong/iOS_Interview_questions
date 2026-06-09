import type { Metadata } from "next";
import { ExamResultClient } from "@/components/ExamResultClient";

export const metadata: Metadata = {
  title: "모의고사 결과"
};

export default function ExamResultPage() {
  return <ExamResultClient />;
}
