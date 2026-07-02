import type { GameLesson, GameQuest } from "../game-data";

export type CourseCatalogSource = "db" | "fallback";

export type CourseCatalog = {
  courses: GameQuest[];
  lessons: GameLesson[];
  source: CourseCatalogSource;
};

export type CourseRow = {
  id: string;
  title: string;
  title_bg: string | null;
  description: string;
  description_bg: string | null;
  difficulty: string;
  difficulty_bg: string | null;
  estimated_time: string;
  estimated_time_bg: string | null;
  reward_badge: string;
  reward_badge_bg: string | null;
  xp_reward: number;
  sort_order: number;
};

export type LessonRow = {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  title_bg: string | null;
  explanation: string;
  explanation_bg: string | null;
  code_example: string;
  mission: string;
  mission_bg: string | null;
  solution: string;
  hint1: string | null;
  hint1_bg: string | null;
  hint2: string | null;
  hint2_bg: string | null;
  hint3: string | null;
  hint3_bg: string | null;
};

export type LessonMetadataRow = {
  lesson_id: string;
  learning_objectives: string[];
  learning_objectives_bg: string[];
  prerequisites: string[];
  prerequisites_bg: string[];
  key_concepts: string[];
  key_concepts_bg: string[];
  reading_time_minutes: number | null;
};
