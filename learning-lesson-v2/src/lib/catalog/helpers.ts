import type { GameLesson, GameQuest } from "../game-data";
import type { CourseCatalog, CourseRow, LessonMetadataRow, LessonRow } from "./types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function mapRowsToCatalog(
  courseRows: CourseRow[],
  lessonRows: LessonRow[],
  metadataRows: LessonMetadataRow[]
): CourseCatalog {
  const metadataByLessonId = new Map(metadataRows.map((row) => [row.lesson_id, row]));
  const lessonsByCourseId = new Map<string, LessonRow[]>();

  for (const row of lessonRows) {
    const bucket = lessonsByCourseId.get(row.course_id) ?? [];
    bucket.push(row);
    lessonsByCourseId.set(row.course_id, bucket);
  }

  const lessons: GameLesson[] = lessonRows
    .slice()
    .sort((left, right) => left.course_id.localeCompare(right.course_id) || left.sort_order - right.sort_order)
    .map((row) => {
      const metadata = metadataByLessonId.get(row.id);

      return {
        id: row.id,
        questId: row.course_id,
        title: row.title,
        titleBg: row.title_bg ?? undefined,
        explanation: row.explanation,
        explanationBg: row.explanation_bg ?? undefined,
        codeExample: row.code_example,
        mission: row.mission,
        missionBg: row.mission_bg ?? undefined,
        solution: row.solution,
        hint1: row.hint1 ?? undefined,
        hint1Bg: row.hint1_bg ?? undefined,
        hint2: row.hint2 ?? undefined,
        hint2Bg: row.hint2_bg ?? undefined,
        hint3: row.hint3 ?? undefined,
        hint3Bg: row.hint3_bg ?? undefined,
        learningObjectives: metadata ? asStringArray(metadata.learning_objectives) : undefined,
        learningObjectivesBg: metadata ? asStringArray(metadata.learning_objectives_bg) : undefined,
        prerequisites: metadata ? asStringArray(metadata.prerequisites) : undefined,
        prerequisitesBg: metadata ? asStringArray(metadata.prerequisites_bg) : undefined,
        keyConcepts: metadata ? asStringArray(metadata.key_concepts) : undefined,
        keyConceptsBg: metadata ? asStringArray(metadata.key_concepts_bg) : undefined,
        readingTimeMinutes: metadata?.reading_time_minutes ?? undefined
      };
    });

  const courses: GameQuest[] = courseRows
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => {
      const courseLessons = (lessonsByCourseId.get(row.id) ?? []).slice().sort((left, right) => left.sort_order - right.sort_order);

      return {
        id: row.id,
        title: row.title,
        titleBg: row.title_bg ?? undefined,
        description: row.description,
        descriptionBg: row.description_bg ?? undefined,
        difficulty: row.difficulty,
        difficultyBg: row.difficulty_bg ?? undefined,
        estimatedTime: row.estimated_time,
        estimatedTimeBg: row.estimated_time_bg ?? undefined,
        rewardBadge: row.reward_badge,
        rewardBadgeBg: row.reward_badge_bg ?? undefined,
        xpReward: row.xp_reward,
        levels: courseLessons.length,
        lessonIds: courseLessons.map((lesson) => lesson.id)
      };
    });

  return {
    courses,
    lessons,
    source: "db"
  };
}

export function getLessonFromCatalog(catalog: CourseCatalog, lessonId: string) {
  return catalog.lessons.find((lesson) => lesson.id === lessonId);
}

export function getQuestFromCatalog(catalog: CourseCatalog, questId: string) {
  return catalog.courses.find((quest) => quest.id === questId);
}

export function getQuestForLesson(catalog: CourseCatalog, lessonId: string) {
  const lesson = getLessonFromCatalog(catalog, lessonId);
  return lesson ? getQuestFromCatalog(catalog, lesson.questId) : undefined;
}

export function getFirstLesson(catalog: CourseCatalog) {
  const firstCourse = catalog.courses[0];
  const firstLessonId = firstCourse?.lessonIds[0];
  return firstLessonId ? getLessonFromCatalog(catalog, firstLessonId) : catalog.lessons[0];
}

export function getLessonUnlockRule(catalog: CourseCatalog, lessonId: string) {
  const lesson = getLessonFromCatalog(catalog, lessonId);
  if (!lesson) {
    return null;
  }

  const quest = getQuestFromCatalog(catalog, lesson.questId);
  if (!quest) {
    return null;
  }

  const index = quest.lessonIds.indexOf(lessonId);
  return index > 0 ? quest.lessonIds[index - 1] : null;
}

export function isLessonUnlocked(catalog: CourseCatalog, lessonId: string, completedLessonIds: Iterable<string>) {
  const completed = new Set(completedLessonIds);

  if (completed.has(lessonId)) {
    return true;
  }

  const prerequisite = getLessonUnlockRule(catalog, lessonId);
  return !prerequisite || completed.has(prerequisite);
}

export function getNextLessonInQuest(catalog: CourseCatalog, questId: string, completedLessonIds: Iterable<string>) {
  const quest = getQuestFromCatalog(catalog, questId);
  if (!quest) {
    return null;
  }

  const completed = new Set(completedLessonIds);
  const nextIncomplete = quest.lessonIds.find((id) => !completed.has(id) && isLessonUnlocked(catalog, id, completed));
  if (nextIncomplete) {
    return nextIncomplete;
  }

  return quest.lessonIds.at(-1) ?? null;
}

export function getGlobalNextLesson(catalog: CourseCatalog, completedLessonIds: Iterable<string>) {
  const completed = new Set(completedLessonIds);

  for (const quest of catalog.courses) {
    for (const lessonId of quest.lessonIds) {
      if (!completed.has(lessonId) && isLessonUnlocked(catalog, lessonId, completed)) {
        return lessonId;
      }
    }
  }

  return null;
}

export function getGlobalNextLessonFromCourses(courses: GameQuest[], completedLessonIds: Iterable<string>) {
  return getGlobalNextLesson({ courses, lessons: [], source: "db" }, completedLessonIds);
}

export function getQuestLessons(catalog: CourseCatalog, questId: string) {
  const quest = getQuestFromCatalog(catalog, questId);
  if (!quest) {
    return [];
  }

  return quest.lessonIds
    .map((lessonId) => getLessonFromCatalog(catalog, lessonId))
    .filter((lesson): lesson is GameLesson => Boolean(lesson));
}

export function getLessonOrderInQuest(catalog: CourseCatalog, lessonId: string) {
  const lesson = getLessonFromCatalog(catalog, lessonId);
  if (!lesson) {
    return null;
  }

  const quest = getQuestFromCatalog(catalog, lesson.questId);
  if (!quest) {
    return null;
  }

  const order = quest.lessonIds.indexOf(lessonId);
  return order >= 0 ? order + 1 : null;
}

export function getTotalAvailableXp(catalog: CourseCatalog, xpPerLesson: number) {
  return catalog.lessons.length * xpPerLesson;
}

export function getLessonModuleIndex(lessonId: string, quest: GameQuest | null) {
  if (!quest) {
    return 1;
  }

  const index = quest.lessonIds.indexOf(lessonId);
  return index >= 0 ? index + 1 : 1;
}
