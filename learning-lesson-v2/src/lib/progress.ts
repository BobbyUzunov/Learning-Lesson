import { xpPerLesson } from "./game-data";
import type { ProgressRecord } from "./types";

export const demoProgress: ProgressRecord[] = [
  {
    lesson_id: "1",
    completed: true,
    xp_earned: xpPerLesson,
    completed_at: new Date().toISOString()
  }
];
