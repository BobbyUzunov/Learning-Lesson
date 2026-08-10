import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildSchoolCurriculumSeedPayload } from "./seed-payload";

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("../supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("../supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock }))
}));

import { getCurriculumMissionLabs, getSchoolCurriculum } from "./index";
import { seedSchoolCurriculumToDatabase } from "./seed";

function readableQuery(data: unknown[], error: { message: string } | null = null) {
  const result = { data, error };
  const query = {
    order: vi.fn(() => query),
    select: vi.fn(() => query),
    then: (
      onFulfilled: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected)
  };
  return query;
}

describe("school curriculum database loader", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("loads the school curriculum from its canonical tables", async () => {
    const payload = buildSchoolCurriculumSeedPayload();
    const rowsByTable: Record<string, unknown[]> = {
      specialties: payload.specialties,
      curriculum_modules: payload.modules,
      curriculum_missions: payload.missions
    };
    fromMock.mockImplementation((table: string) => readableQuery(rowsByTable[table] ?? []));

    const curriculum = await getSchoolCurriculum();

    expect(curriculum.source).toBe("db");
    expect(curriculum.specialties).toHaveLength(4);
    expect(curriculum.modules).toHaveLength(8);
    expect(curriculum.missions).toHaveLength(64);
  });

  it("loads mission-to-lab links from the bridge table", async () => {
    fromMock.mockImplementation((table: string) =>
      readableQuery(
        table === "curriculum_mission_labs"
          ? [{ mission_id: "mission-db", lesson_id: "42", sort_order: 3 }]
          : []
      )
    );

    await expect(getCurriculumMissionLabs()).resolves.toEqual([
      { missionId: "mission-db", lessonId: "42", sortOrder: 3 }
    ]);
  });

  it("uses the checked-in bridge fallback when the database table is unavailable", async () => {
    fromMock.mockImplementation(() => readableQuery([], { message: "relation unavailable" }));

    await expect(getCurriculumMissionLabs()).resolves.toEqual([
      { missionId: "mission-first-class-page", lessonId: "1", sortOrder: 0 }
    ]);
  });

  it("seeds the canonical curriculum tables and mission lab bridge", async () => {
    const upsertedTables: string[] = [];

    fromMock.mockImplementation((table: string) => ({
      upsert: vi.fn(() => {
        upsertedTables.push(table);
        return Promise.resolve({ error: null });
      })
    }));

    const result = await seedSchoolCurriculumToDatabase();

    expect(upsertedTables).toEqual([
      "specialties",
      "curriculum_modules",
      "curriculum_missions",
      "curriculum_mission_labs"
    ]);
    expect(result.curriculumMissions).toBeGreaterThan(0);
    expect(result.curriculumMissionLabs).toBe(1);
  });
});
