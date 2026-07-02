import type { CourseUpdateInput, LessonUpdateInput } from "./types";

export function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

export function toCourseRow(input: CourseUpdateInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.titleBg !== undefined ? { title_bg: input.titleBg || null } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.descriptionBg !== undefined ? { description_bg: input.descriptionBg || null } : {}),
    ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
    ...(input.difficultyBg !== undefined ? { difficulty_bg: input.difficultyBg || null } : {}),
    ...(input.estimatedTime !== undefined ? { estimated_time: input.estimatedTime } : {}),
    ...(input.estimatedTimeBg !== undefined ? { estimated_time_bg: input.estimatedTimeBg || null } : {}),
    ...(input.rewardBadge !== undefined ? { reward_badge: input.rewardBadge } : {}),
    ...(input.rewardBadgeBg !== undefined ? { reward_badge_bg: input.rewardBadgeBg || null } : {}),
    ...(input.xpReward !== undefined ? { xp_reward: input.xpReward } : {}),
    updated_at: new Date().toISOString()
  };
}

export function toLessonRow(input: LessonUpdateInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.titleBg !== undefined ? { title_bg: input.titleBg || null } : {}),
    ...(input.explanation !== undefined ? { explanation: input.explanation } : {}),
    ...(input.explanationBg !== undefined ? { explanation_bg: input.explanationBg || null } : {}),
    ...(input.codeExample !== undefined ? { code_example: input.codeExample } : {}),
    ...(input.mission !== undefined ? { mission: input.mission } : {}),
    ...(input.missionBg !== undefined ? { mission_bg: input.missionBg || null } : {}),
    ...(input.solution !== undefined ? { solution: input.solution } : {}),
    ...(input.hint1 !== undefined ? { hint1: input.hint1 || null } : {}),
    ...(input.hint1Bg !== undefined ? { hint1_bg: input.hint1Bg || null } : {}),
    ...(input.hint2 !== undefined ? { hint2: input.hint2 || null } : {}),
    ...(input.hint2Bg !== undefined ? { hint2_bg: input.hint2Bg || null } : {}),
    ...(input.hint3 !== undefined ? { hint3: input.hint3 || null } : {}),
    ...(input.hint3Bg !== undefined ? { hint3_bg: input.hint3Bg || null } : {}),
    updated_at: new Date().toISOString()
  };
}

export function toMetadataRow(lessonId: string, input: LessonUpdateInput) {
  const hasMetadata =
    input.learningObjectives !== undefined ||
    input.learningObjectivesBg !== undefined ||
    input.prerequisites !== undefined ||
    input.prerequisitesBg !== undefined ||
    input.keyConcepts !== undefined ||
    input.keyConceptsBg !== undefined ||
    input.readingTimeMinutes !== undefined;

  if (!hasMetadata) {
    return null;
  }

  return {
    lesson_id: lessonId,
    ...(input.learningObjectives !== undefined ? { learning_objectives: input.learningObjectives } : {}),
    ...(input.learningObjectivesBg !== undefined ? { learning_objectives_bg: input.learningObjectivesBg } : {}),
    ...(input.prerequisites !== undefined ? { prerequisites: input.prerequisites } : {}),
    ...(input.prerequisitesBg !== undefined ? { prerequisites_bg: input.prerequisitesBg } : {}),
    ...(input.keyConcepts !== undefined ? { key_concepts: input.keyConcepts } : {}),
    ...(input.keyConceptsBg !== undefined ? { key_concepts_bg: input.keyConceptsBg } : {}),
    ...(input.readingTimeMinutes !== undefined ? { reading_time_minutes: input.readingTimeMinutes } : {}),
    updated_at: new Date().toISOString()
  };
}
