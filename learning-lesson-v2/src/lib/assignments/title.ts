import type { Language } from "@/lib/language";
import type { ClassroomAssignment } from "./types";

type AssignmentTitleSource = Pick<
  ClassroomAssignment,
  "titleOverride" | "missionTitle" | "missionTitleBg" | "missionId" | "customQuestions"
>;

export function isCustomAssignment(assignment: Pick<ClassroomAssignment, "missionId">) {
  return !assignment.missionId;
}

export function assignmentDisplayTitle(assignment: AssignmentTitleSource, language: Language) {
  const override = assignment.titleOverride?.trim();
  if (override) {
    return override;
  }

  if (language === "bg") {
    return assignment.missionTitleBg || assignment.missionTitle || assignment.missionId || "";
  }

  return assignment.missionTitle || assignment.missionId || "";
}

export function assignmentMentorBrief(assignment: ClassroomAssignment, language: Language) {
  if (assignment.customQuestions && assignment.customQuestions.length > 0) {
    return assignment.customQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n");
  }

  if (language === "bg") {
    return assignment.missionBriefBg || assignment.missionBrief || null;
  }

  return assignment.missionBrief ?? null;
}
