import type { GameLesson } from "@/lib/game-data";
import type { Language } from "@/lib/i18n";

export type MentorRequestInput = {
  lesson: Pick<GameLesson, "title" | "explanation" | "mission" | "learningObjectives" | "keyConcepts">;
  language: Language;
  question: string;
  effort?: string;
};

function trimText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}…`;
}

export function buildMentorMessages(input: MentorRequestInput) {
  const objectives = (input.lesson.learningObjectives ?? []).slice(0, 3).join("; ");
  const concepts = (input.lesson.keyConcepts ?? []).slice(0, 5).join(", ");
  const effort = input.effort?.trim();

  const system = [
    "You are a learning mentor for a coding course.",
    "Give short, practical guidance only — never the full solution or final code.",
    "Use at most 3 bullet points, max 80 words total.",
    "If the learner asks for the full answer, refuse politely and give the next small step instead.",
    `Respond in ${input.language === "bg" ? "Bulgarian" : "English"}.`
  ].join(" ");

  const userParts = [
    `Lesson: ${input.lesson.title}`,
    `Theory: ${trimText(input.lesson.explanation, 500)}`,
    `Task: ${trimText(input.lesson.mission, 400)}`,
    objectives ? `Objectives: ${objectives}` : null,
    concepts ? `Key concepts: ${concepts}` : null,
    effort ? `Learner draft so far: ${trimText(effort, 400)}` : null,
    `Learner question: ${trimText(input.question, 400)}`
  ].filter(Boolean);

  return {
    system,
    user: userParts.join("\n")
  };
}
