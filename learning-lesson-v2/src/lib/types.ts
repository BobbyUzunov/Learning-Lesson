export type Difficulty = "beginner" | "intermediate" | "advanced";

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  color: string;
  difficulty: Difficulty;
  requiredLevel: number;
  lessonIds: string[];
};

export type Lesson = {
  id: string;
  pathId: string;
  title: string;
  summary: string;
  content: string;
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
