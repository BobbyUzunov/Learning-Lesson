import { describe, expect, it } from "vitest";
import {
  assessmentTemplates,
  getAssessmentTemplatesForClassroom,
  localizeAssessmentTemplate
} from "./templates";

const specialties = [
  "software-development",
  "intelligent-systems",
  "computer-graphics",
  "cybersecurity"
] as const;

describe("grade 8 assessment templates", () => {
  it("provides three shared checks and one check for every specialty", () => {
    expect(assessmentTemplates).toHaveLength(7);
    expect(assessmentTemplates.filter((template) => template.specialtyId === null)).toHaveLength(3);
    expect(assessmentTemplates.flatMap((template) => template.questions)).toHaveLength(56);

    for (const specialtyId of specialties) {
      const templates = getAssessmentTemplatesForClassroom(specialtyId, 8);
      expect(templates).toHaveLength(4);
      expect(templates.filter((template) => template.specialtyId === specialtyId)).toHaveLength(1);
      expect(templates.filter((template) => template.specialtyId === null)).toHaveLength(3);
    }
  });

  it("does not suggest grade 8 templates to other grades", () => {
    expect(getAssessmentTemplatesForClassroom("software-development", 9)).toEqual([]);
  });

  it("contains valid bilingual questions and unambiguous answer indexes", () => {
    const templateIds = assessmentTemplates.map((template) => template.id);
    const questionIds = assessmentTemplates.flatMap((template) =>
      template.questions.map((question) => `${template.id}:${question.id}`)
    );

    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);

    for (const template of assessmentTemplates) {
      expect(template.questions).toHaveLength(8);
      expect(template.title.bg.length).toBeGreaterThan(5);
      expect(template.title.en.length).toBeGreaterThan(5);

      for (const question of template.questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options.map((option) => option.bg)).size).toBe(4);
        expect(new Set(question.options.map((option) => option.en)).size).toBe(4);
        expect(question.correctOption).toBeGreaterThanOrEqual(0);
        expect(question.correctOption).toBeLessThan(question.options.length);
        expect(question.prompt.bg.length).toBeGreaterThan(10);
        expect(question.prompt.en.length).toBeGreaterThan(10);
        expect(question.explanation.bg.length).toBeGreaterThan(10);
        expect(question.explanation.en.length).toBeGreaterThan(10);
        expect(question.options.every((option) => option.bg.length > 0 && option.en.length > 0)).toBe(true);
      }
    }
  });

  it("localizes content and balances correct answer positions", () => {
    for (const template of assessmentTemplates) {
      const localizedBg = localizeAssessmentTemplate(template, "bg");
      const localizedEn = localizeAssessmentTemplate(template, "en");
      const positionCounts = localizedBg.questions.reduce<Record<number, number>>((counts, question) => {
        counts[question.correctOption] = (counts[question.correctOption] ?? 0) + 1;
        return counts;
      }, {});

      expect(localizedBg.questions).toHaveLength(8);
      expect(localizedEn.questions).toHaveLength(8);
      expect(positionCounts).toEqual({ 0: 2, 1: 2, 2: 2, 3: 2 });
      expect(localizedBg.questions[0].prompt).toBe(template.questions[0].prompt.bg);
      expect(localizedEn.questions[0].prompt).toBe(template.questions[0].prompt.en);
    }
  });
});
