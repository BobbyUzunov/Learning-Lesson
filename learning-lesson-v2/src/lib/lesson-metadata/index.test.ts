import { describe, expect, it } from "vitest";
import { gameLessons, gameQuests, getQuestForLesson } from "../game-data";
import { getLessonModuleIndex } from "../lesson-structure";
import { resolveLessonMetadata } from "./generate";

describe("lesson metadata coverage", () => {
  it("provides metadata for every lesson", () => {
    for (const lesson of gameLessons) {
      const quest = getQuestForLesson(lesson.id) ?? null;
      const moduleNumber = quest ? getLessonModuleIndex(lesson.id, quest.id) : 1;
      const metadata = resolveLessonMetadata(lesson, quest, moduleNumber);

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

      const metadata = resolveLessonMetadata(lesson!, quest!, getLessonModuleIndex(lessonId, quest!.id));
      expect(metadata.learningObjectives[0]).not.toMatch(/Understand the core concept/i);
      expect(metadata.keyConcepts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
