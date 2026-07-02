import { describe, expect, it } from "vitest";
import { gameQuests, getGameLesson } from "./game-data";
import { localizeLessonStructure } from "./lesson-structure";

describe("lesson-structure", () => {
  it("returns module index within quest order", () => {
    const lesson = getGameLesson("14");
    const quest = gameQuests.find((item) => item.id === "backend");
    expect(lesson).toBeTruthy();
    expect(quest).toBeTruthy();

    const structure = localizeLessonStructure(lesson!, quest!, "en");
    expect(structure.moduleNumber).toBe(2);
  });

  it("uses pilot objectives for lesson 1", () => {
    const lesson = getGameLesson("1");
    const quest = gameQuests.find((item) => item.id === "frontend");
    expect(lesson).toBeTruthy();
    expect(quest).toBeTruthy();

    const structure = localizeLessonStructure(lesson!, quest!, "bg");
    expect(structure.learningObjectives[0]).toContain("HTML");
    expect(structure.keyConcepts.length).toBeGreaterThan(0);
    expect(structure.readingTimeMinutes).toBeGreaterThanOrEqual(6);
  });
});
