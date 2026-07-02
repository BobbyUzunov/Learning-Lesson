import type { GameLesson, GameQuest } from "./game-data";
import type { Language } from "./i18n";
import { resolveLessonMetadata } from "./lesson-metadata/generate";

export type LocalizedLessonStructure = {
  moduleNumber: number;
  moduleTotal: number;
  learningObjectives: string[];
  prerequisites: string[];
  keyConcepts: string[];
  readingTimeMinutes: number;
};

export function localizeLessonStructure(
  lesson: GameLesson,
  quest: GameQuest | null,
  language: Language
): LocalizedLessonStructure {
  const moduleNumber = quest ? quest.lessonIds.indexOf(lesson.id) + 1 : 1;
  const moduleTotal = quest?.lessonIds.length ?? 1;
  const metadata = resolveLessonMetadata(lesson, quest, moduleNumber);

  const learningObjectives =
    language === "bg"
      ? metadata.learningObjectivesBg.length
        ? metadata.learningObjectivesBg
        : metadata.learningObjectives
      : metadata.learningObjectives;

  const prerequisites =
    language === "bg"
      ? metadata.prerequisitesBg.length
        ? metadata.prerequisitesBg
        : metadata.prerequisites
      : metadata.prerequisites;

  const keyConcepts =
    language === "bg"
      ? metadata.keyConceptsBg.length
        ? metadata.keyConceptsBg
        : metadata.keyConcepts
      : metadata.keyConcepts;

  return {
    moduleNumber: moduleNumber > 0 ? moduleNumber : 1,
    moduleTotal,
    learningObjectives,
    prerequisites,
    keyConcepts,
    readingTimeMinutes: metadata.readingTimeMinutes
  };
}
