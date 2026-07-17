import { describe, expect, it } from "vitest";
import { validateCourseUpdate, validateLessonUpdate, validateProjectUpdate, validateQuizUpdate } from "./validate";

describe("CMS update validation", () => {
  it("accepts valid partial updates", () => {
    expect(validateCourseUpdate({ title: "Frontend", xpReward: 100 }).ok).toBe(true);
    expect(validateLessonUpdate({ title: "HTML", readingTimeMinutes: 12 }).ok).toBe(true);
    expect(validateProjectUpdate({ type: "capstone", briefMinLength: 100 }).ok).toBe(true);
    expect(validateQuizUpdate({ options: ["A", "B"], correctIndex: 1 }).ok).toBe(true);
  });

  it("rejects unknown, malformed, or oversized fields", () => {
    expect(validateCourseUpdate({ role: "admin" })).toEqual({ ok: false, error: "invalid_role" });
    expect(validateLessonUpdate({ learningObjectives: "not-an-array" }).ok).toBe(false);
    expect(validateProjectUpdate({ briefMinLength: 0 }).ok).toBe(false);
    expect(validateQuizUpdate({ correctIndex: 99 }).ok).toBe(false);
  });

  it("rejects empty and non-object payloads", () => {
    expect(validateCourseUpdate({}).ok).toBe(false);
    expect(validateCourseUpdate(null).ok).toBe(false);
  });
});
