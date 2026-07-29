import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildSchoolCurriculumSeedPayload } from "./seed-payload";

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("../supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("../supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock }))
}));

import { getSchoolCurriculum } from "./index";
import { seedSchoolCurriculumToDatabase } from "./seed";

function readableQuery(data: unknown[]) {
  const result = { data, error: null };
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

  it("seeds only the canonical curriculum tables", async () => {
    const upsertedTables: string[] = [];

    fromMock.mockImplementation((table: string) => ({
      upsert: vi.fn(() => {
        upsertedTables.push(table);
        return Promise.resolve({ error: null });
      })
    }));

    const result = await seedSchoolCurriculumToDatabase();

    expect(upsertedTables).toEqual(["specialties", "curriculum_modules", "curriculum_missions"]);
    expect(result.curriculumMissions).toBeGreaterThan(0);
  });
});
