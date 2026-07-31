import { describe, expect, it } from "vitest";
import {
  createSeededRandom,
  generateKnowledgeCheckQuestions,
  getFallbackKnowledgeCheckContent,
  getQuestionBankSize,
  getKnowledgeCheckTopicForLesson,
  getUnavailableKnowledgeCheckContent
} from "./index";
import { createKnowledgeCheckAnswer } from "./helpers";

describe("knowledge-check content", () => {
  const content = getFallbackKnowledgeCheckContent();

  it("maps lessons to the expected knowledge-check topics", () => {
    expect(getKnowledgeCheckTopicForLesson(content, "14")).toBe("api");
    expect(getKnowledgeCheckTopicForLesson(content, "24")).toBe("fullstack");
    expect(getKnowledgeCheckTopicForLesson(content, "30")).toBe("ai");
    expect(getKnowledgeCheckTopicForLesson(content, "36")).toBe("mobile");
    expect(getKnowledgeCheckTopicForLesson(content, "42")).toBe("product");
    expect(getKnowledgeCheckTopicForLesson(content, "missing-lesson")).toBeNull();
  });

  it("fails closed when database knowledge-check content is unavailable", () => {
    const unavailable = getUnavailableKnowledgeCheckContent();

    expect(unavailable.source).toBe("unavailable");
    expect(unavailable.questions).toEqual([]);
    expect(getKnowledgeCheckTopicForLesson(unavailable, "1")).toBeNull();
  });

  it("returns the requested number of questions when the bank is large enough", () => {
    const questions = generateKnowledgeCheckQuestions(content, "api", 3);
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.topic === "api")).toBe(true);
  });

  it("produces stable question sets for a seeded lesson attempt", () => {
    const first = generateKnowledgeCheckQuestions(content, "api", 3, createSeededRandom("14:0"));
    const second = generateKnowledgeCheckQuestions(content, "api", 3, createSeededRandom("14:0"));
    expect(second.map((question) => question.id)).toEqual(first.map((question) => question.id));
  });

  it("keeps every lesson topic bank large enough for a three-question knowledge check", () => {
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

    const [shuffled] = generateKnowledgeCheckQuestions(
      { ...content, questions: [original!] },
      "api",
      1,
      createSeededRandom("answer-order")
    );

    expect(shuffled.options[shuffled.correctIndex]).toBe(original!.options[original!.correctIndex]);
    expect(shuffled.optionsBg[shuffled.correctIndex]).toBe(original!.optionsBg[original!.correctIndex]);
    expect(createKnowledgeCheckAnswer(shuffled, shuffled.correctIndex)).toEqual({
      questionId: original!.id,
      selectedIndex: original!.correctIndex
    });
  });

  it("maps every shuffled option back to its stable database index", () => {
    const topics = [...new Set(content.questions.map((question) => question.topic))];

    for (const topic of topics) {
      for (let seed = 0; seed < 20; seed += 1) {
        const questions = generateKnowledgeCheckQuestions(
          content,
          topic,
          3,
          createSeededRandom(`${topic}:${seed}`)
        );

        for (const question of questions) {
          const original = content.questions.find((candidate) => candidate.id === question.id);
          expect(original).toBeDefined();
          expect(question.originalOptionIndexes).toHaveLength(original!.options.length);

          for (const [displayedIndex, originalIndex] of question.originalOptionIndexes.entries()) {
            expect(question.options[displayedIndex]).toBe(original!.options[originalIndex]);
            expect(question.optionsBg[displayedIndex]).toBe(original!.optionsBg[originalIndex]);
            expect(createKnowledgeCheckAnswer(question, displayedIndex)).toEqual({
              questionId: question.id,
              selectedIndex: originalIndex
            });
          }

          expect(createKnowledgeCheckAnswer(question, question.correctIndex).selectedIndex).toBe(
            original!.correctIndex
          );
        }
      }
    }
  });

  it("submits the original database indexes for the deterministic lesson 2 knowledge check", () => {
    const questions = generateKnowledgeCheckQuestions(content, "css", 3, createSeededRandom("2:0"));
    const submittedAnswers = questions.map((question) =>
      createKnowledgeCheckAnswer(question, question.correctIndex)
    );

    expect(submittedAnswers).toEqual([
      { questionId: "css-2", selectedIndex: 0 },
      { questionId: "css-1", selectedIndex: 1 },
      { questionId: "css-3", selectedIndex: 1 }
    ]);
  });

  it("mirrors the database HTML fallback when a topic has fewer than three questions", () => {
    const sparseContent = {
      ...content,
      questions: content.questions.filter(
        (question) => question.topic === "html" || (question.topic === "css" && question.id === "css-1")
      )
    };
    const questions = generateKnowledgeCheckQuestions(
      sparseContent,
      "css",
      3,
      createSeededRandom("sparse-css")
    );

    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.topic === "css" || question.topic === "html")).toBe(true);
    expect(questions.some((question) => question.topic === "html")).toBe(true);
  });
});
