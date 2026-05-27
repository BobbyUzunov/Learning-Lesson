export type Difficulty = "beginner" | "intermediate" | "advanced";

export type LearningPath = {
  id: string;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  color: string;
  difficulty: Difficulty;
  requiredLevel: number;
  lessonIds: string[];
};

export type Lesson = {
  id: string;
  pathId: string;
  title: string;
  titleBg?: string;
  summary: string;
  summaryBg?: string;
  content: string;
  contentBg?: string;
  xp: number;
  order: number;
  lockedBy?: string;
};

export type ProgressRecord = {
  lesson_id: string;
  completed: boolean;
  xp_earned: number;
  completed_at: string | null;
};
