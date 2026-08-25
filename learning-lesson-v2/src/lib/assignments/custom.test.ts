import { describe, expect, it } from "vitest";
import { mapStoredCustomQuestions, parseCustomQuestions, parseCustomTitle } from "./custom";

describe("custom assignment questions", () => {
  it("accepts a trimmed title within limits", () => {
    expect(parseCustomTitle("  Interview five people  ")).toBe("Interview five people");
  });

  it("rejects missing or too-short titles", () => {
    expect(parseCustomTitle("ab")).toBeNull();
    expect(parseCustomTitle("")).toBeNull();
    expect(parseCustomTitle(12)).toBeNull();
  });

  it("accepts one to eight trimmed questions", () => {
    expect(parseCustomQuestions(["  What changed?  ", "Who did you ask?"])).toEqual([
      "What changed?",
      "Who did you ask?"
    ]);
  });

  it("rejects empty, oversized, or non-string questions", () => {
    expect(parseCustomQuestions([])).toBeNull();
    expect(parseCustomQuestions(["ok", "x".repeat(401)])).toBeNull();
    expect(parseCustomQuestions(["ok", 3])).toBeNull();
    expect(parseCustomQuestions("What changed?")).toBeNull();
  });

  it("maps stored jsonb questions and skips junk", () => {
    expect(mapStoredCustomQuestions([" One ", "", 2, "Two"])).toEqual(["One", "Two"]);
    expect(mapStoredCustomQuestions(null)).toEqual([]);
  });
});
