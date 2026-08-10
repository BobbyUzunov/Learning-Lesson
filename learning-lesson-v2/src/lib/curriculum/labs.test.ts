import { describe, expect, it } from "vitest";
import { getFallbackCatalog } from "@/lib/catalog";
import { fallbackSchoolCurriculum } from "./data";
import {
  fallbackCurriculumMissionLabs,
  mapCurriculumMissionLabRows,
  resolveCurriculumMissionLabs
} from "./labs";

describe("curriculum mission labs", () => {
  it("keeps every fallback bridge attached to existing mission and lesson content", () => {
    const missionIds = new Set(fallbackSchoolCurriculum.missions.map((mission) => mission.id));
    const lessonIds = new Set(getFallbackCatalog().lessons.map((lesson) => lesson.id));

    expect(fallbackCurriculumMissionLabs.length).toBeGreaterThan(0);
    expect(fallbackCurriculumMissionLabs.every((link) => missionIds.has(link.missionId))).toBe(true);
    expect(fallbackCurriculumMissionLabs.every((link) => lessonIds.has(link.lessonId))).toBe(true);
    expect(new Set(fallbackCurriculumMissionLabs.map((link) => `${link.missionId}:${link.lessonId}`)).size).toBe(
      fallbackCurriculumMissionLabs.length
    );
  });

  it("resolves the first class page mission to the first Frontend lab", () => {
    const labs = resolveCurriculumMissionLabs(
      fallbackCurriculumMissionLabs,
      getFallbackCatalog(),
      "mission-first-class-page"
    );

    expect(labs).toHaveLength(1);
    expect(labs[0]).toMatchObject({ lessonId: "1", completed: false });
    expect(labs[0]?.course.id).toBe("frontend");
  });

  it("derives completion from trusted lesson progress instead of the mission link", () => {
    const labs = resolveCurriculumMissionLabs(
      fallbackCurriculumMissionLabs,
      getFallbackCatalog(),
      "mission-first-class-page",
      ["1"]
    );

    expect(labs[0]?.completed).toBe(true);
  });

  it("maps and orders database rows", () => {
    expect(
      mapCurriculumMissionLabRows([
        { mission_id: "mission-b", lesson_id: "2", sort_order: 0 },
        { mission_id: "mission-a", lesson_id: "2", sort_order: 1 },
        { mission_id: "mission-a", lesson_id: "1", sort_order: 0 }
      ])
    ).toEqual([
      { missionId: "mission-a", lessonId: "1", sortOrder: 0 },
      { missionId: "mission-a", lessonId: "2", sortOrder: 1 },
      { missionId: "mission-b", lessonId: "2", sortOrder: 0 }
    ]);
  });
});
