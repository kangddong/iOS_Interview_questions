"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAttempt as dbDeleteAttempt,
  gradeAnswer as dbGradeAnswer,
  saveAttempt as dbSaveAttempt,
  ungradeAnswer as dbUngradeAnswer,
} from "@/lib/exam-store";
import type { ExamResult } from "@/lib/types";

export async function saveAttemptAction(result: ExamResult): Promise<{ id: string }> {
  const id = dbSaveAttempt(result);
  revalidatePath("/admin/attempts");
  revalidatePath("/admin/grading");
  return { id };
}

export async function gradeAnswerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("answerId") ?? "");
  const grade = Number(formData.get("grade") ?? 0);
  const note = String(formData.get("note") ?? "");
  if (!id || Number.isNaN(grade) || grade < 0 || grade > 5) return;
  dbGradeAnswer(id, grade, note);
  revalidatePath("/admin/grading");
  revalidatePath("/admin/attempts");
}

export async function ungradeAnswerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("answerId") ?? "");
  if (!id) return;
  dbUngradeAnswer(id);
  revalidatePath("/admin/grading");
  revalidatePath("/admin/attempts");
}

export async function deleteAttemptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("attemptId") ?? "");
  if (!id) return;
  dbDeleteAttempt(id);
  revalidatePath("/admin/attempts");
  revalidatePath("/admin/grading");
}
