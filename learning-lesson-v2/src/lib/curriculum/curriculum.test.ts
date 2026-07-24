import { describe, expect, it } from "vitest";
import { gameQuests } from "../game-data";
import { fallbackSchoolCurriculum } from "./data";
import {
  getActiveGradeLevel,
  getCommonModules,
  getCourseIdsForSpecialty,
  getMissionForModule,
  getMissionMinutesRange,
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

    expect(getCommonModules(fallbackSchoolCurriculum, 8)).toHaveLength(1);
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
      modules: fallbackSchoolCurriculum.modules.map((module) => ({ ...module, gradeLevel: 9 }))
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
    expect(mapped.modules).toHaveLength(6);
    expect(mapped.missions).toHaveLength(4);
    expect(mapped.courseLinks).toHaveLength(11);
  });
});
