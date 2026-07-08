import { describe, expect, it } from "vitest";
import { lessonDraftKey, projectDraftKey } from "./draft-storage";

describe("draft-storage", () => {
  it("builds stable lesson draft keys", () => {
    expect(lessonDraftKey("1")).toBe("learning-lesson-v2-lesson-draft:1");
    expect(lessonDraftKey("42")).toContain("42");
  });

  it("builds stable project draft keys", () => {
    expect(projectDraftKey("capstone-ai")).toBe("learning-lesson-v2-project-draft:capstone-ai");
  });
});
