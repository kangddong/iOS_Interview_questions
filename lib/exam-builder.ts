import type { ExamQuestion, ExamSettings } from "@/lib/types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function stratifiedPick(pool: ExamQuestion[], limit: number): ExamQuestion[] {
  if (limit <= 0 || pool.length === 0) return [];
  const byPart = new Map<string, ExamQuestion[]>();
  for (const q of pool) {
    const arr = byPart.get(q.partId) ?? [];
    arr.push(q);
    byPart.set(q.partId, arr);
  }
  for (const [k, v] of byPart) byPart.set(k, shuffle(v));

  const partIds = shuffle([...byPart.keys()]);
  const picked: ExamQuestion[] = [];

  while (picked.length < limit) {
    let progressed = false;
    for (const id of partIds) {
      if (picked.length >= limit) break;
      const next = byPart.get(id)!.shift();
      if (next) {
        picked.push(next);
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  return picked;
}

export interface BuildExamSetInput {
  bank: ExamQuestion[];
  settings: ExamSettings;
}

export function filterPool(input: BuildExamSetInput): {
  objectivePool: ExamQuestion[];
  subjectivePool: ExamQuestion[];
} {
  const { bank, settings } = input;
  const allowedParts = new Set(settings.partIds);
  const partFilter = (q: ExamQuestion) =>
    settings.partIds.length === 0 || allowedParts.has(q.partId);
  const levelFilter = (q: ExamQuestion) =>
    settings.level === "all" || q.level === settings.level;

  const objectivePool = bank.filter(
    (q) => q.type === "objective" && levelFilter(q) && partFilter(q)
  );
  const subjectivePool = bank.filter(
    (q) => q.type === "subjective" && levelFilter(q) && partFilter(q)
  );
  return { objectivePool, subjectivePool };
}

export function buildExamSet(input: BuildExamSetInput): ExamQuestion[] {
  const { settings } = input;
  const { objectivePool, subjectivePool } = filterPool(input);
  const objectives = stratifiedPick(objectivePool, settings.objectiveCount);
  const subjectives = stratifiedPick(subjectivePool, settings.subjectiveCount);
  return shuffle([...objectives, ...subjectives]);
}
