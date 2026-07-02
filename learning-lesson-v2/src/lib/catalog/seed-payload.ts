import { gameLessons, gameQuests } from "../game-data";
import { resolveLessonMetadata } from "../lesson-metadata";
import type { CourseRow, LessonMetadataRow, LessonRow } from "./types";

export function buildCatalogSeedPayload() {
  const courses: CourseRow[] = gameQuests.map((quest, index) => ({
    id: quest.id,
    title: quest.title,
    title_bg: quest.titleBg ?? null,
    description: quest.description,
    description_bg: quest.descriptionBg ?? null,
    difficulty: quest.difficulty,
    difficulty_bg: quest.difficultyBg ?? null,
    estimated_time: quest.estimatedTime,
    estimated_time_bg: quest.estimatedTimeBg ?? null,
    reward_badge: quest.rewardBadge,
    reward_badge_bg: quest.rewardBadgeBg ?? null,
    xp_reward: quest.xpReward,
    sort_order: index
  }));

  const lessons: LessonRow[] = [];
  const metadataRows: LessonMetadataRow[] = [];

  for (const quest of gameQuests) {
    quest.lessonIds.forEach((lessonId, index) => {
      const lesson = gameLessons.find((item) => item.id === lessonId);
      if (!lesson) {
        return;
      }

      lessons.push({
        id: lesson.id,
        course_id: quest.id,
        sort_order: index,
        title: lesson.title,
        title_bg: lesson.titleBg ?? null,
        explanation: lesson.explanation,
        explanation_bg: lesson.explanationBg ?? null,
        code_example: lesson.codeExample,
        mission: lesson.mission,
        mission_bg: lesson.missionBg ?? null,
        solution: lesson.solution,
        hint1: lesson.hint1 ?? lesson.hint ?? null,
        hint1_bg: lesson.hint1Bg ?? lesson.hintBg ?? null,
        hint2: lesson.hint2 ?? null,
        hint2_bg: lesson.hint2Bg ?? null,
        hint3: lesson.hint3 ?? null,
        hint3_bg: lesson.hint3Bg ?? null
      });

      const metadata = resolveLessonMetadata(lesson, quest, index + 1);
      metadataRows.push({
        lesson_id: lesson.id,
        learning_objectives: metadata.learningObjectives,
        learning_objectives_bg: metadata.learningObjectivesBg,
        prerequisites: metadata.prerequisites,
        prerequisites_bg: metadata.prerequisitesBg,
        key_concepts: metadata.keyConcepts,
        key_concepts_bg: metadata.keyConceptsBg,
        reading_time_minutes: metadata.readingTimeMinutes
      });
    });
  }

  return { courses, lessons, metadataRows };
}
