import { describe, expect, it } from "vitest";
import { fallbackSchoolCurriculum } from "./data";
import { applyGuestLessonProgress, buildCurriculumExplorerData, getSpecialtyExplorerGroups, resolveStudentProgramSpecialtyId } from "./explorer";
import { getActiveGradeLevel } from "./helpers";

describe("curriculum explorer payload", () => {
  it("localizes once on the server and strips unused bilingual fields", () => {
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "bg");
    const firstSource = fallbackSchoolCurriculum.specialties[0];
    const firstResult = data.specialties[0];
    const serialized = JSON.stringify(data);

    expect(firstResult.title).toBe(firstSource.title.bg);
    expect(serialized).not.toContain('"bg":');
    expect(serialized).not.toContain('"en":');
    expect(serialized).not.toContain('"skills"');
    expect(serialized).not.toContain('"sortOrder"');
  });

  it("contains only modules from the active grade", () => {
    const activeGrade = getActiveGradeLevel(fallbackSchoolCurriculum);
    const expectedIds = new Set(
      fallbackSchoolCurriculum.modules
        .filter((module) => module.gradeLevel === activeGrade)
        .map((module) => module.id)
    );
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "en");
    const actualIds = [
      ...data.commonGroups,
      ...data.specialties.flatMap((specialty) => specialty.groups)
    ].map((group) => group.module.id);

    expect(new Set(actualIds)).toEqual(expectedIds);
  });

  it("carries trusted assignment status and linked lab availability into the student payload", () => {
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "en", {
      "mission-first-class-page": {
        assignmentId: "assignment-1",
        assignmentStatus: "approved",
        lab: {
          courseTitle: "Frontend Foundations",
          completedCount: 1,
          totalCount: 1,
          lessonIds: ["1"]
        }
      }
    });
    const mission = data.specialties
      .flatMap((specialty) => specialty.groups)
      .flatMap((group) => group.missions)
      .find((entry) => entry.id === "mission-first-class-page");

    expect(mission).toMatchObject({
      assignmentId: "assignment-1",
      assignmentStatus: "approved",
      lab: { completedCount: 1, totalCount: 1, lessonIds: ["1"] }
    });
  });

  it("derives guest bridge completion from linked lesson IDs without changing the server snapshot", () => {
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "en", {
      "mission-first-class-page": {
        assignmentId: null,
        assignmentStatus: null,
        lab: {
          courseTitle: "Frontend Foundations",
          completedCount: 0,
          totalCount: 1,
          lessonIds: ["1"]
        }
      }
    });
    const guestData = applyGuestLessonProgress(data, ["unrelated", "1"]);
    const findMission = (source: typeof data) =>
      source.specialties
        .flatMap((specialty) => specialty.groups)
        .flatMap((group) => group.missions)
        .find((mission) => mission.id === "mission-first-class-page");

    expect(findMission(data)?.lab?.completedCount).toBe(0);
    expect(findMission(guestData)?.lab).toMatchObject({
      completedCount: 1,
      totalCount: 1,
      lessonIds: ["1"]
    });
  });

  it("is materially smaller than the full curriculum payload", () => {
    const fullSize = JSON.stringify(fallbackSchoolCurriculum).length;
    const explorerSize = JSON.stringify(buildCurriculumExplorerData(fallbackSchoolCurriculum, "bg")).length;

    expect(explorerSize).toBeLessThan(fullSize * 0.7);
  });

  it("keeps each specialty's mission list inside that specialty", () => {
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "en");
    const intelligent = getSpecialtyExplorerGroups(data, "intelligent-systems");
    const otherModuleIds = new Set(
      fallbackSchoolCurriculum.modules
        .filter((module) => module.specialtyId && module.specialtyId !== "intelligent-systems")
        .map((module) => module.id)
    );

    expect(intelligent.length).toBeGreaterThan(0);
    expect(intelligent.some((group) => otherModuleIds.has(group.module.id))).toBe(false);
  });

  it("prefers the classroom specialty over a stored student choice", () => {
    const specialties = fallbackSchoolCurriculum.specialties.map((specialty) => ({ id: specialty.id }));

    expect(resolveStudentProgramSpecialtyId(specialties, "intelligent-systems", "cybersecurity")).toEqual({
      specialtyId: "intelligent-systems",
      locked: true
    });
    expect(resolveStudentProgramSpecialtyId(specialties, null, "cybersecurity")).toEqual({
      specialtyId: "cybersecurity",
      locked: false
    });
  });
});
