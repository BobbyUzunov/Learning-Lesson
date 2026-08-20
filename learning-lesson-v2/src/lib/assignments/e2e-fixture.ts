import type { ClassroomAssignment } from "./types";

export const E2E_ASSIGNMENT_ID = "e2e-assignment";
export const E2E_CLASSROOM_ID = "e2e-classroom";

export function e2eStudentAssignment(): ClassroomAssignment {
  return {
    id: E2E_ASSIGNMENT_ID,
    classroomId: E2E_CLASSROOM_ID,
    missionId: "mission-file-organization",
    assignedBy: "e2e-teacher",
    titleOverride: null,
    instructions: "Upload a short note about how you organised the files.",
    dueAt: null,
    createdAt: "2026-08-18T10:00:00.000Z",
    missionTitle: "Mission: Bring order to your files",
    missionTitleBg: "Мисия: Въведи ред във файловете си",
    missionBrief: "Make a simple folder plan before you start moving files.",
    missionBriefBg: "Направи прост план за папките, преди да местиш файлове.",
    missionDeliverable: "A short written plan and a screenshot of the folders.",
    missionDeliverableBg: "Кратък писмен план и снимка на папките.",
    estimatedMinutes: 40,
    submissionStatus: "missing",
    classroomName: "E2E class"
  };
}
