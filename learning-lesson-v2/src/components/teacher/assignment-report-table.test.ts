import { describe, expect, it } from "vitest";
import { resolveTeacherNote } from "./assignment-report-table";

describe("resolveTeacherNote", () => {
  it("falls back to the stored row note when the teacher has not edited", () => {
    expect(resolveTeacherNote({}, "s1", "Good work")).toBe("Good work");
  });

  it("uses an empty string when there is no stored note", () => {
    expect(resolveTeacherNote({}, "s1", null)).toBe("");
    expect(resolveTeacherNote({}, "s1", undefined)).toBe("");
  });

  it("prefers the edited note over the stored one", () => {
    expect(resolveTeacherNote({ s1: "Revise" }, "s1", "Good work")).toBe("Revise");
  });

  it("respects an intentionally cleared note", () => {
    expect(resolveTeacherNote({ s1: "" }, "s1", "Good work")).toBe("");
  });

  it("ignores notes of other submissions", () => {
    expect(resolveTeacherNote({ s2: "Other" }, "s1", "Good work")).toBe("Good work");
  });
});
