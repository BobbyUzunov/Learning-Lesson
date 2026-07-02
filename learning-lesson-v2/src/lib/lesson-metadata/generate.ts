import { getGameLesson, getQuestById, type GameLesson, type GameQuest } from "../game-data";
import type { LessonMetadataFields } from "./types";
import { lessonMetadataPatches } from "./patches";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "with",
  "mission",
  "lesson",
  "мисия",
  "урок"
]);

function cleanTitle(title: string) {
  return title.replace(/^(Мисия|Урок|Lesson|Mission):?\s*/i, "").trim();
}

function firstSentence(text: string) {
  const sentence = text.split(/[.!?]/)[0]?.trim();
  return sentence && sentence.length > 12 ? sentence : text.trim();
}

function estimateReadingTime(lesson: GameLesson) {
  const text = [lesson.explanation, lesson.mission, lesson.codeExample].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(6, Math.min(22, Math.ceil((words / 180) * 5)));
}

function extractConcepts(title: string, mission: string) {
  const fromTitle = cleanTitle(title)
    .split(/[\s:/-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9+.#]/g, ""))
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()));

  const fromMission = mission
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9+.#]/g, ""))
    .filter((word) => word.length > 3 && /^[A-Z]/.test(word))
    .slice(0, 2);

  return [...new Set([...fromTitle.slice(0, 3), ...fromMission])].slice(0, 4);
}

function courseLabel(quest: GameQuest | null, language: "en" | "bg") {
  if (!quest) {
    return language === "bg" ? "курса" : "the course";
  }

  return language === "bg" ? quest.titleBg ?? quest.title : quest.title;
}

function previousLessonTitle(quest: GameQuest, moduleNumber: number, language: "en" | "bg") {
  if (moduleNumber <= 1) {
    return null;
  }

  const previousId = quest.lessonIds[moduleNumber - 2];
  const previous = previousId ? getGameLesson(previousId) : null;
  if (!previous) {
    return null;
  }

  return language === "bg" ? previous.titleBg ?? previous.title : previous.title;
}

export function generateLessonMetadata(
  lesson: GameLesson,
  quest: GameQuest | null,
  moduleNumber: number
): LessonMetadataFields {
  const topicEn = cleanTitle(lesson.title);
  const topicBg = cleanTitle(lesson.titleBg ?? lesson.title);
  const courseEn = courseLabel(quest, "en");
  const courseBg = courseLabel(quest, "bg");
  const missionEn = firstSentence(lesson.mission);
  const missionBg = firstSentence(lesson.missionBg ?? lesson.mission);
  const prevEn = quest ? previousLessonTitle(quest, moduleNumber, "en") : null;
  const prevBg = quest ? previousLessonTitle(quest, moduleNumber, "bg") : null;

  return {
    readingTimeMinutes: estimateReadingTime(lesson),
    learningObjectives: [
      `Understand ${topicEn.toLowerCase()} within ${courseEn}.`,
      `Apply the concept in practice: ${missionEn}.`,
      `Connect this step to a real product workflow.`
    ],
    learningObjectivesBg: [
      `Разбираш ${topicBg.toLowerCase()} в контекста на ${courseBg}.`,
      `Прилагаш концепцията на практика: ${missionBg}.`,
      `Свързваш тази стъпка с реален product workflow.`
    ],
    prerequisites:
      moduleNumber === 1
        ? [`None — first module in ${courseEn}.`]
        : [`Completed previous module: ${prevEn ?? `Module ${moduleNumber - 1}`}.`],
    prerequisitesBg:
      moduleNumber === 1
        ? [`Няма — първи модул в ${courseBg}.`]
        : [`Завършен предишен модул: ${prevBg ?? `Модул ${moduleNumber - 1}`}.`],
    keyConcepts: extractConcepts(lesson.title, lesson.mission),
    keyConceptsBg: extractConcepts(lesson.titleBg ?? lesson.title, lesson.missionBg ?? lesson.mission)
  };
}

export function resolveLessonMetadata(
  lesson: GameLesson,
  quest: GameQuest | null,
  moduleNumber: number
): Required<LessonMetadataFields> {
  const patch = lessonMetadataPatches[lesson.id];
  const generated = generateLessonMetadata(lesson, quest, moduleNumber);

  return {
    readingTimeMinutes: lesson.readingTimeMinutes ?? patch?.readingTimeMinutes ?? generated.readingTimeMinutes ?? 8,
    learningObjectives: lesson.learningObjectives ?? patch?.learningObjectives ?? generated.learningObjectives ?? [],
    learningObjectivesBg:
      lesson.learningObjectivesBg ?? patch?.learningObjectivesBg ?? generated.learningObjectivesBg ?? [],
    prerequisites: lesson.prerequisites ?? patch?.prerequisites ?? generated.prerequisites ?? [],
    prerequisitesBg: lesson.prerequisitesBg ?? patch?.prerequisitesBg ?? generated.prerequisitesBg ?? [],
    keyConcepts: lesson.keyConcepts ?? patch?.keyConcepts ?? generated.keyConcepts ?? [],
    keyConceptsBg: lesson.keyConceptsBg ?? patch?.keyConceptsBg ?? generated.keyConceptsBg ?? []
  };
}

export function enrichLessonWithMetadata(lesson: GameLesson, quest: GameQuest | null, moduleNumber: number): GameLesson {
  const metadata = resolveLessonMetadata(lesson, quest, moduleNumber);

  return {
    ...lesson,
    ...metadata
  };
}

export function getAllLessonIdsWithMetadata() {
  const quest = getQuestById("ai-product-builder");
  return quest?.lessonIds ?? [];
}
