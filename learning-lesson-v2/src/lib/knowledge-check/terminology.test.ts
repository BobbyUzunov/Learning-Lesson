import { describe, expect, it } from "vitest";
import { gameLessons } from "@/lib/game-data";
import { t } from "@/lib/i18n";
import { fallbackKnowledgeCheckBank } from "./fallback-data";
import { getKnowledgeCheckTopicLabel } from "./helpers";

const retiredProductTerm = /\bquiz\b|quiz-ът|куиз/iu;

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function collectVisibleFields(value: Record<string, unknown>, excludedKeys: Set<string>) {
  return Object.entries(value).flatMap(([key, fieldValue]) =>
    excludedKeys.has(key) ? [] : collectStrings(fieldValue)
  );
}

describe("knowledge-check terminology", () => {
  it("does not expose the retired product term in translated interface copy", () => {
    const interfaceCopy = [...collectStrings(t("bg")), ...collectStrings(t("en"))].join("\n");
    expect(interfaceCopy).not.toMatch(retiredProductTerm);
  });

  it("does not expose the retired product term in lesson content", () => {
    const lessonContent = gameLessons
      .flatMap((lesson) => collectVisibleFields(lesson, new Set(["id", "questId"])))
      .join("\n");
    expect(lessonContent).not.toMatch(retiredProductTerm);
  });

  it("does not expose the retired product term in knowledge-check questions", () => {
    const questionContent = fallbackKnowledgeCheckBank
      .flatMap((question) => collectVisibleFields(question, new Set(["id", "topic"])))
      .join("\n");
    expect(questionContent).not.toMatch(retiredProductTerm);
  });

  it("uses a learner-friendly label for the legacy topic key", () => {
    expect(getKnowledgeCheckTopicLabel("quiz-generator", "bg")).toBe("Дизайн на самопроверка");
    expect(getKnowledgeCheckTopicLabel("quiz-generator", "en")).toBe("Knowledge-check design");
  });
});
