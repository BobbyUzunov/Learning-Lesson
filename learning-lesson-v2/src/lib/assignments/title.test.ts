import { describe, expect, it } from "vitest";
import { assignmentDisplayTitle, assignmentMentorBrief, isCustomAssignment } from "./title";
import type { ClassroomAssignment } from "./types";

const catalog: ClassroomAssignment = {
  id: "a1",
  classroomId: "c1",
  missionId: "mission-school-poster",
  assignedBy: "t1",
  titleOverride: null,
  customQuestions: [],
  instructions: null,
  dueAt: null,
  createdAt: "2026-08-20T12:00:00.000Z",
  missionTitle: "Poster mission",
  missionTitleBg: "Мисия плакат",
  missionBrief: "Make a poster.",
  missionBriefBg: "Направи плакат."
};

const custom: ClassroomAssignment = {
  ...catalog,
  missionId: null,
  titleOverride: "Interview five people",
  customQuestions: ["Who has the problem?", "What would they pay?"],
  missionTitle: undefined,
  missionTitleBg: undefined,
  missionBrief: undefined,
  missionBriefBg: undefined
};

describe("assignment titles", () => {
  it("prefers the teacher title for catalog and custom missions", () => {
    expect(assignmentDisplayTitle(catalog, "en")).toBe("Poster mission");
    expect(assignmentDisplayTitle(catalog, "bg")).toBe("Мисия плакат");
    expect(assignmentDisplayTitle({ ...catalog, titleOverride: "Class poster" }, "en")).toBe("Class poster");
    expect(assignmentDisplayTitle(custom, "bg")).toBe("Interview five people");
  });

  it("treats a missing catalog mission id as a custom assignment", () => {
    expect(isCustomAssignment(catalog)).toBe(false);
    expect(isCustomAssignment(custom)).toBe(true);
  });

  it("feeds custom questions to the mentor as the brief", () => {
    expect(assignmentMentorBrief(catalog, "bg")).toBe("Направи плакат.");
    expect(assignmentMentorBrief(custom, "en")).toBe("1. Who has the problem?\n2. What would they pay?");
  });
});
