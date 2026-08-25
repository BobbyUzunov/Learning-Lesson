import { describe, expect, it } from "vitest";
import { gradeKnowledgeCheckAnswers, parseKnowledgeCheckAnswers, toPublicKnowledgeCheckGrade } from "./grade";
import { getFallbackKnowledgeCheckContent, toPublicKnowledgeCheckContent } from "./index";

describe("knowledge-check grading", () => {
  const bank = getFallbackKnowledgeCheckContent().questions;

  it("parses a valid answer payload", () => {
    expect(
      parseKnowledgeCheckAnswers([
        { questionId: "html-1", selectedIndex: 1 },
        { questionId: "html-2", selectedIndex: 0 }
      ])
    ).toEqual([
      { questionId: "html-1", selectedIndex: 1 },
      { questionId: "html-2", selectedIndex: 0 }
    ]);
  });

  it("rejects duplicate question ids", () => {
    expect(
      parseKnowledgeCheckAnswers([
        { questionId: "html-1", selectedIndex: 1 },
        { questionId: "html-1", selectedIndex: 0 }
      ])
    ).toBeNull();
  });

  it("grades against the secret bank and enforces the 2/3 pass threshold", () => {
    const sample = bank.filter((question) => question.topic === "html").slice(0, 3);
    const answers = sample.map((question) => ({
      questionId: question.id,
      selectedIndex: question.correctIndex!
    }));

    const graded = gradeKnowledgeCheckAnswers(sample, answers);
    expect(graded?.passed).toBe(true);
    expect(graded?.correct).toBe(3);
    expect(graded?.results.every((item) => item.isCorrect)).toBe(true);
    expect(graded?.results.every((item) => item.correctIndex !== undefined)).toBe(true);

    const publicGrade = toPublicKnowledgeCheckGrade(graded!);
    expect(publicGrade.passed).toBe(true);
    expect(publicGrade.results.every((item) => item.isCorrect)).toBe(true);
    expect(
      JSON.parse(JSON.stringify(publicGrade)).results.every(
        (item: { correctIndex?: number }) => !("correctIndex" in item)
      )
    ).toBe(true);
  });

  it("strips secrets from learner-facing content", () => {
    const publicContent = toPublicKnowledgeCheckContent(getFallbackKnowledgeCheckContent());
    expect(publicContent.questions.length).toBeGreaterThan(0);
    expect(
      publicContent.questions.every(
        (question) =>
          question.correctIndex === undefined &&
          question.explanation === undefined &&
          question.explanationBg === undefined
      )
    ).toBe(true);
  });
});
