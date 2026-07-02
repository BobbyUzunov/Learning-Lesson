import { describe, expect, it } from "vitest";
import { getFallbackCatalog } from "./catalog/fallback";
import { getLessonFromCatalog } from "./catalog/helpers";
import { localizeLessonStructure } from "./lesson-structure";

describe("lesson structure", () => {
  const catalog = getFallbackCatalog();

  it("localizes backend lesson metadata for module 2", () => {
    const lesson = getLessonFromCatalog(catalog, "14");
    const quest = catalog.courses.find((item) => item.id === "backend");
    expect(lesson).toBeTruthy();
    expect(quest).toBeTruthy();

    const structure = localizeLessonStructure(lesson!, quest ?? null, "en");
    expect(structure.moduleNumber).toBe(2);
    expect(structure.learningObjectives.length).toBeGreaterThan(0);
  });

  it("localizes frontend lesson metadata for module 1", () => {
    const lesson = getLessonFromCatalog(catalog, "1");
    const quest = catalog.courses.find((item) => item.id === "frontend");
    expect(lesson).toBeTruthy();
    expect(quest).toBeTruthy();

    const structure = localizeLessonStructure(lesson!, quest ?? null, "bg");
    expect(structure.moduleNumber).toBe(1);
    expect(structure.prerequisites.length).toBeGreaterThan(0);
  });
});
