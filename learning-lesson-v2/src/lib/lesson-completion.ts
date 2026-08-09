export function canCompleteLessonMission(input: {
  effortChars: number;
  minEffortChars: number;
  hintsUsed: number;
  hintCount: number;
  knowledgeCheckPassed: boolean;
}): { ok: true } | { ok: false; reason: "effort" | "knowledge_check" } {
  const hasEffort = input.effortChars >= input.minEffortChars;
  const allHintsUsed = input.hintsUsed >= input.hintCount;

  if (!hasEffort && !allHintsUsed) {
    return { ok: false, reason: "effort" };
  }

  if (!input.knowledgeCheckPassed) {
    return { ok: false, reason: "knowledge_check" };
  }

  return { ok: true };
}
