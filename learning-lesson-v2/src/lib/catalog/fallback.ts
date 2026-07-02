import { gameLessons, gameQuests } from "../game-data";
import { resolveLessonMetadata } from "../lesson-metadata";
import type { CourseCatalog } from "./types";

export function getFallbackCatalog(): CourseCatalog {
  const courses = gameQuests.map((quest) => ({ ...quest }));
  const lessons = gameLessons.map((lesson) => {
    const quest = courses.find((item) => item.id === lesson.questId) ?? null;
    const moduleNumber = quest ? quest.lessonIds.indexOf(lesson.id) + 1 : 1;
    const metadata = resolveLessonMetadata(lesson, quest, moduleNumber);

    return {
      ...lesson,
      ...metadata
    };
  });

  return {
    courses,
    lessons,
    source: "fallback"
  };
}
