import { describe, expect, it } from "vitest";
import {
  assessmentDraftKey,
  assignmentDraftKey,
  lessonDraftKey,
  mergeAssignmentSubmissionDraft,
  projectDraftKey
} from "./draft-storage";

describe("draft-storage", () => {
  it("builds stable lesson draft keys", () => {
    expect(lessonDraftKey("1")).toBe("learning-lesson-v2-lesson-draft:1");
    expect(lessonDraftKey("42")).toContain("42");
  });

  it("builds stable project draft keys", () => {
    expect(projectDraftKey("capstone-ai")).toBe("learning-lesson-v2-project-draft:capstone-ai");
  });

  it("builds stable assignment draft keys", () => {
    expect(assignmentDraftKey("a1")).toBe("learning-lesson-v2-assignment-draft:a1");
  });

  it("builds stable assessment draft keys", () => {
    expect(assessmentDraftKey("check-1")).toBe("learning-lesson-v2-assessment-draft:check-1");
  });

  it("prefers non-empty server assignment fields when merging a restored draft", () => {
    expect(
      mergeAssignmentSubmissionDraft(
        { text: "From server", url: "" },
        { text: "Local draft", url: "https://draft.example" }
      )
    ).toEqual({ text: "From server", url: "https://draft.example" });

    expect(
      mergeAssignmentSubmissionDraft(
        { text: "", url: "https://server.example" },
        { text: "Local draft", url: "https://draft.example" }
      )
    ).toEqual({ text: "Local draft", url: "https://server.example" });
  });
});
