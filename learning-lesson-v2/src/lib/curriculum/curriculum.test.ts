import { describe, expect, it } from "vitest";
import { gameQuests } from "../game-data";
import { fallbackSchoolCurriculum } from "./data";
import {
  getActiveGradeLevel,
  getCommonModules,
  getCourseIdsForSpecialty,
  getMissionForModule,
  getMissionMinutesRange,
  getMissionsForModule,
  getMissionsForModules,
  getSpecialtyModules,
  mapRowsToSchoolCurriculum
} from "./helpers";
import { buildSchoolCurriculumSeedPayload } from "./seed-payload";

describe("school curriculum", () => {
  it("contains the four professions from the 2026/2027 admission plans", () => {
    expect(fallbackSchoolCurriculum.specialties.map((specialty) => specialty.professionCode)).toEqual([
      "061303",
      "061301",
      "021102",
      "103202"
    ]);
  });

  it("gives every profession an eighth-grade module and an introductory mission", () => {
    for (const specialty of fallbackSchoolCurriculum.specialties) {
      const modules = getSpecialtyModules(fallbackSchoolCurriculum, specialty.id, 8);
      expect(modules.length).toBeGreaterThan(0);
      expect(modules.some((module) => getMissionForModule(fallbackSchoolCurriculum, module.id))).toBe(true);
    }

    expect(getCommonModules(fallbackSchoolCurriculum, 8)).toHaveLength(3);
  });

  it("covers a full school year with eight ordered missions in every module", () => {
    for (const curriculumModule of fallbackSchoolCurriculum.modules) {
      const missions = getMissionsForModule(fallbackSchoolCurriculum, curriculumModule.id);
      expect(missions).toHaveLength(8);
      expect(missions.map((mission) => mission.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it("keeps every mission attached to an existing module with a unique id", () => {
    const moduleIds = new Set(fallbackSchoolCurriculum.modules.map((module) => module.id));
    const missionIds = fallbackSchoolCurriculum.missions.map((mission) => mission.id);

    expect(new Set(missionIds).size).toBe(missionIds.length);
    expect(fallbackSchoolCurriculum.missions.every((mission) => moduleIds.has(mission.moduleId))).toBe(true);
  });

  it("writes every mission in both languages", () => {
    for (const mission of fallbackSchoolCurriculum.missions) {
      for (const field of [mission.title, mission.brief, mission.deliverable]) {
        expect(field.bg.length).toBeGreaterThan(0);
        expect(field.en.length).toBeGreaterThan(0);
        expect(field.bg).not.toBe(field.en);
      }

      expect(mission.skills.length).toBeGreaterThanOrEqual(3);
      expect(mission.estimatedMinutes).toBeGreaterThanOrEqual(10);
      expect(mission.estimatedMinutes).toBeLessThanOrEqual(600);
    }
  });

  it("groups missions per module for the mission list", () => {
    const modules = getSpecialtyModules(fallbackSchoolCurriculum, "cybersecurity", 8);
    const groups = getMissionsForModules(fallbackSchoolCurriculum, modules);

    expect(groups).toHaveLength(2);
    expect(groups.flatMap((group) => group.missions)).toHaveLength(16);
    expect(getMissionsForModules(fallbackSchoolCurriculum, [])).toEqual([]);
  });

  it("links every recommended course to a course that exists in the catalog", () => {
    const knownCourseIds = new Set(gameQuests.map((course) => course.id));

    for (const specialty of fallbackSchoolCurriculum.specialties) {
      const courseIds = getCourseIdsForSpecialty(fallbackSchoolCurriculum, specialty.id, 8);
      expect(courseIds.length).toBeGreaterThan(0);
      expect(courseIds.every((courseId) => knownCourseIds.has(courseId))).toBe(true);
    }
  });

  it("derives the active grade from pilot modules instead of hardcoding it", () => {
    expect(getActiveGradeLevel(fallbackSchoolCurriculum)).toBe(8);

    const shifted = {
      ...fallbackSchoolCurriculum,
      modules: fallbackSchoolCurriculum.modules.map((entry) => ({ ...entry, gradeLevel: 9 as const }))
    };
    expect(getActiveGradeLevel(shifted)).toBe(9);

    expect(getActiveGradeLevel({ ...fallbackSchoolCurriculum, modules: [] })).toBe(8);
  });

  it("derives the mission minutes range from the data", () => {
    const range = getMissionMinutesRange(fallbackSchoolCurriculum);
    expect(range).toMatch(/^\d+(–\d+)?$/);

    expect(getMissionMinutesRange({ ...fallbackSchoolCurriculum, missions: [] })).toBe("45–60");
  });

  it("round-trips the Supabase seed payload", () => {
    const payload = buildSchoolCurriculumSeedPayload();
    const mapped = mapRowsToSchoolCurriculum(
      payload.specialties,
      payload.modules,
      payload.missions,
      payload.courseLinks
    );

    expect(mapped.source).toBe("db");
    expect(mapped.specialties).toHaveLength(4);
    expect(mapped.modules).toHaveLength(8);
    expect(mapped.missions).toHaveLength(64);
    expect(mapped.courseLinks).toHaveLength(11);
    expect(mapped.missions[0]?.sortOrder).toBe(0);
  });
});
