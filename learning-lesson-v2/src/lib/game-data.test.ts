import { describe, expect, it } from "vitest";
import { getFallbackCatalog } from "./catalog/fallback";
import {
  getGlobalNextLesson,
  getLessonUnlockRule,
  getNextLessonInQuest,
  isLessonUnlocked
} from "./catalog/helpers";

describe("catalog unlock rules", () => {
  const catalog = getFallbackCatalog();

  it("unlocks the first lesson in each quest without prerequisites", () => {
    expect(isLessonUnlocked(catalog, "1", [])).toBe(true);
    expect(isLessonUnlocked(catalog, "3", [])).toBe(true);
    expect(isLessonUnlocked(catalog, "4", [])).toBe(true);
    expect(isLessonUnlocked(catalog, "5", [])).toBe(true);
  });

  it("locks later lessons until the previous mission is completed", () => {
    expect(isLessonUnlocked(catalog, "14", [])).toBe(false);
    expect(isLessonUnlocked(catalog, "14", ["3"])).toBe(true);
    expect(getLessonUnlockRule(catalog, "20")).toBe("19");
    expect(getLessonUnlockRule(catalog, "43")).toBe("18");
    expect(getLessonUnlockRule(catalog, "47")).toBe("24");
    expect(getLessonUnlockRule(catalog, "52")).toBe("42");
  });

  it("returns the next incomplete lesson in quest order", () => {
    expect(getNextLessonInQuest(catalog, "backend", [])).toBe("3");
    expect(getNextLessonInQuest(catalog, "backend", ["3"])).toBe("14");
    expect(getGlobalNextLesson(catalog, ["1", "2", "8", "9", "10", "11", "12", "13"])).toBe("3");
  });
});
