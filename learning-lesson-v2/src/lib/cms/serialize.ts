import type { CourseUpdateInput, LessonUpdateInput, ProjectUpdateInput, QuizUpdateInput } from "./types";

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

export function toProjectRow(input: ProjectUpdateInput) {
  return {
    ...(input.afterLessonId !== undefined ? { after_lesson_id: input.afterLessonId } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.titleBg !== undefined ? { title_bg: input.titleBg || null } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.descriptionBg !== undefined ? { description_bg: input.descriptionBg || null } : {}),
    ...(input.briefLabel !== undefined ? { brief_label: input.briefLabel } : {}),
    ...(input.briefLabelBg !== undefined ? { brief_label_bg: input.briefLabelBg || null } : {}),
    ...(input.briefPlaceholder !== undefined ? { brief_placeholder: input.briefPlaceholder } : {}),
    ...(input.briefPlaceholderBg !== undefined ? { brief_placeholder_bg: input.briefPlaceholderBg || null } : {}),
    ...(input.briefMinLength !== undefined ? { brief_min_length: input.briefMinLength } : {}),
    ...(input.requiresRepo !== undefined ? { requires_repo: input.requiresRepo } : {}),
    ...(input.requiresDeploy !== undefined ? { requires_deploy: input.requiresDeploy } : {}),
    ...(input.requiredForCertificate !== undefined ? { required_for_certificate: input.requiredForCertificate } : {}),
    ...(input.checklist !== undefined ? { checklist: input.checklist } : {}),
    updated_at: new Date().toISOString()
  };
}

export function toQuizQuestionRow(input: QuizUpdateInput) {
  return {
    ...(input.topic !== undefined ? { topic: input.topic } : {}),
    ...(input.question !== undefined ? { question: input.question } : {}),
    ...(input.questionBg !== undefined ? { question_bg: input.questionBg } : {}),
    ...(input.options !== undefined ? { options: input.options } : {}),
    ...(input.optionsBg !== undefined ? { options_bg: input.optionsBg } : {}),
    ...(input.correctIndex !== undefined ? { correct_index: input.correctIndex } : {}),
    ...(input.explanation !== undefined ? { explanation: input.explanation } : {}),
    ...(input.explanationBg !== undefined ? { explanation_bg: input.explanationBg } : {}),
    updated_at: new Date().toISOString()
  };
}

export function parseChecklistJson(value: string) {
  const parsed = JSON.parse(value) as Array<{ id?: string; label?: string; labelBg?: string }>;
  if (!Array.isArray(parsed)) {
    throw new Error("Checklist must be a JSON array.");
  }

  return parsed.map((item, index) => {
    const id = item.id?.trim();
    const label = item.label?.trim();
    if (!id || !label) {
      throw new Error(`Checklist item ${index + 1} needs id and label.`);
    }

    return {
      id,
      label,
      ...(item.labelBg?.trim() ? { labelBg: item.labelBg.trim() } : {})
    };
  });
}
