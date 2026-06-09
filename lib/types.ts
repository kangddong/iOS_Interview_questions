export type Level = "basic" | "intermediate" | "advanced";

export type QuestionType = "objective" | "subjective";

export interface CategoryMeta {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Topic {
  slug: string;
  slugSegments: string[];
  sourcePath: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  summary: string;
  excerpt: string;
  body: string;
  headings: string[];
  readingMinutes: number;
}

export interface Question {
  id: string;
  level: Level;
  category: string;
  prompt: string;
  sourcePath: string;
  relatedTopicSlugs: string[];
}

export interface ExamChoice {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  level: Level;
  category: string;
  partId: string;
  prompt: string;
  choices?: ExamChoice[];
  correctChoiceId?: string;
  modelAnswer?: string;
  explanation: string;
  relatedTopicSlugs: string[];
}

export interface ExamSettings {
  level: Level | "all";
  objectiveCount: number;
  subjectiveCount: number;
  partIds: string[];
  durationMinutes: number;
}

export interface ExamAnswerResult {
  questionId: string;
  type: QuestionType;
  level: Level;
  category: string;
  prompt: string;
  userAnswer: string;
  correctChoiceId?: string;
  choices?: ExamChoice[];
  isCorrect: boolean | null;
  modelAnswer?: string;
  explanation: string;
  relatedTopicSlugs: string[];
}

export interface ExamResult {
  startedAt: string;
  finishedAt: string;
  settings: ExamSettings;
  score: number;
  objectiveTotal: number;
  total: number;
  answers: ExamAnswerResult[];
}
