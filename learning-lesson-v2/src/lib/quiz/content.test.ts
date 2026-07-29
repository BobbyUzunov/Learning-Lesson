import { describe, expect, it } from "vitest";
import {
  createSeededRandom,
  generateQuizQuestions,
  getFallbackQuizContent,
  getQuestionBankSize,
  getQuizTopicForLesson
} from "./index";

describe("quiz content", () => {
  const content = getFallbackQuizContent();

  it("maps lessons to the expected quiz topics", () => {
    expect(getQuizTopicForLesson(content, "14")).toBe("api");
    expect(getQuizTopicForLesson(content, "24")).toBe("fullstack");
    expect(getQuizTopicForLesson(content, "30")).toBe("ai");
    expect(getQuizTopicForLesson(content, "36")).toBe("mobile");
    expect(getQuizTopicForLesson(content, "42")).toBe("product");
  });

  it("returns the requested number of questions when the bank is large enough", () => {
    const questions = generateQuizQuestions(content, "api", 3);
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.topic === "api")).toBe(true);
  });

  it("produces stable question sets for a seeded lesson attempt", () => {
    const first = generateQuizQuestions(content, "api", 3, createSeededRandom("14:0"));
    const second = generateQuizQuestions(content, "api", 3, createSeededRandom("14:0"));
    expect(second.map((question) => question.id)).toEqual(first.map((question) => question.id));
  });

  it("keeps every lesson topic bank large enough for a three-question quiz", () => {
    for (const topic of [
      "html",
      "css",
      "javascript",
      "dom",
      "fetch",
      "react",
      "api",
      "quiz-generator",
      "fullstack",
      "ai",
      "mobile",
      "product"
    ] as const) {
      expect(getQuestionBankSize(content, topic)).toBeGreaterThanOrEqual(3);
    }
  });

  it("uses reviewed learning content instead of project-internal trivia", () => {
    const searchableContent = content.questions
      .flatMap((question) => [
        question.question,
        question.questionBg,
        question.explanation,
        question.explanationBg,
        ...question.options,
        ...question.optionsBg
      ])
      .join(" ");

    expect(content.questions).toHaveLength(38);
    expect(searchableContent).not.toMatch(/Supabase|Vercel|Cursor|Learning Lesson|Next\.js/i);
  });

  it("shuffles bilingual options together and preserves the correct answer", () => {
    const original = content.questions.find((question) => question.id === "api-1");
    expect(original).toBeDefined();

    const [shuffled] = generateQuizQuestions(
      { ...content, questions: [original!] },
      "api",
      1,
      createSeededRandom("answer-order")
    );

    expect(shuffled.options[shuffled.correctIndex]).toBe(original!.options[original!.correctIndex]);
    expect(shuffled.optionsBg[shuffled.correctIndex]).toBe(original!.optionsBg[original!.correctIndex]);
  });
});
