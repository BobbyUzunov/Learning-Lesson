import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildSchoolCurriculumSeedPayload } from "./seed-payload";

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("../supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("../supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock }))
}));

import { getSchoolCurriculum, seedSchoolCurriculumToDatabase } from "./index";

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

  it("keeps using the database when optional course links are empty", async () => {
    const payload = buildSchoolCurriculumSeedPayload();
    const rowsByTable: Record<string, unknown[]> = {
      specialties: payload.specialties,
      curriculum_modules: payload.modules,
      curriculum_missions: payload.missions,
      curriculum_course_links: []
    };
    fromMock.mockImplementation((table: string) => readableQuery(rowsByTable[table] ?? []));

    const curriculum = await getSchoolCurriculum();

    expect(curriculum.source).toBe("db");
    expect(curriculum.specialties).toHaveLength(4);
    expect(curriculum.modules).toHaveLength(8);
    expect(curriculum.missions).toHaveLength(64);
    expect(curriculum.courseLinks).toEqual([]);
  });

  it("clears managed links without sending an empty upsert during a repeatable seed", async () => {
    const payload = buildSchoolCurriculumSeedPayload();
    const upsertedTables: string[] = [];
    const clearedLinks: Array<{ column: string; values: unknown[] }> = [];

    fromMock.mockImplementation((table: string) => ({
      delete: vi.fn(() => ({
        in: vi.fn((column: string, values: unknown[]) => {
          clearedLinks.push({ column, values });
          return Promise.resolve({ error: null });
        })
      })),
      upsert: vi.fn(() => {
        upsertedTables.push(table);
        return Promise.resolve({ error: null });
      })
    }));

    const result = await seedSchoolCurriculumToDatabase();

    expect(upsertedTables).toEqual(["specialties", "curriculum_modules", "curriculum_missions"]);
    expect(clearedLinks).toEqual([
      { column: "module_id", values: payload.modules.map((curriculumModule) => curriculumModule.id) }
    ]);
    expect(result.curriculumCourseLinks).toBe(0);
  });
});
