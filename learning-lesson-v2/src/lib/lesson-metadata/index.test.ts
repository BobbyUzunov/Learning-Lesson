import { describe, expect, it } from "vitest";
import { gameLessons, gameQuests } from "../game-data";
import { getFallbackCatalog } from "../catalog/fallback";
import { getLessonModuleIndex, getQuestForLesson } from "../catalog/helpers";
import { resolveLessonMetadata } from "./generate";

describe("lesson metadata coverage", () => {
  const catalog = getFallbackCatalog();

  it("provides metadata for every lesson", () => {
    for (const lesson of gameLessons) {
      const quest = getQuestForLesson(catalog, lesson.id) ?? null;
      const moduleNumber = getLessonModuleIndex(lesson.id, quest);
      const metadata = resolveLessonMetadata(lesson, quest, moduleNumber, catalog.lessons);

      expect(metadata.learningObjectives.length).toBeGreaterThanOrEqual(3);
      expect(metadata.learningObjectivesBg.length).toBeGreaterThanOrEqual(3);
      expect(metadata.prerequisites.length).toBeGreaterThanOrEqual(1);
      expect(metadata.keyConcepts.length).toBeGreaterThanOrEqual(1);
      expect(metadata.readingTimeMinutes).toBeGreaterThanOrEqual(6);
    }
  });

  it("uses rich patches for all AI Product Builder lessons", () => {
    const quest = gameQuests.find((item) => item.id === "ai-product-builder");
    expect(quest).toBeTruthy();

    for (const lessonId of quest!.lessonIds) {
      const lesson = gameLessons.find((item) => item.id === lessonId);
      expect(lesson).toBeTruthy();

      const metadata = resolveLessonMetadata(lesson!, quest!, getLessonModuleIndex(lessonId, quest!), catalog.lessons);
      expect(metadata.learningObjectives[0]).not.toMatch(/Understand the core concept/i);
      expect(metadata.keyConcepts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
