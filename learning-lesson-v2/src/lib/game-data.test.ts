import { describe, expect, it } from "vitest";
import {
  getGlobalNextLesson,
  getLessonUnlockRule,
  getNextLessonInQuest,
  isLessonUnlocked
} from "./game-data";

describe("game-data unlock rules", () => {
  it("unlocks the first lesson in each quest without prerequisites", () => {
    expect(isLessonUnlocked("1", [])).toBe(true);
    expect(isLessonUnlocked("3", [])).toBe(true);
    expect(isLessonUnlocked("4", [])).toBe(true);
    expect(isLessonUnlocked("5", [])).toBe(true);
  });

  it("locks later lessons until the previous mission is completed", () => {
    expect(isLessonUnlocked("14", [])).toBe(false);
    expect(isLessonUnlocked("14", ["3"])).toBe(true);
    expect(getLessonUnlockRule("20")).toBe("19");
  });

  it("returns the next incomplete lesson in quest order", () => {
    expect(getNextLessonInQuest("backend", [])).toBe("3");
    expect(getNextLessonInQuest("backend", ["3"])).toBe("14");
    expect(getGlobalNextLesson(["1", "2", "8", "9", "10", "11", "12", "13"])).toBe("3");
  });
});
