import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), logServerError: vi.fn() }));

vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("../supabase/data-env", () => ({ hasSupabaseDataEnv: vi.fn(() => true) }));
vi.mock("../supabase/server", () => ({ createClient: vi.fn(async () => ({ from: mocks.from })) }));
vi.mock("../observability", () => ({ logServerError: mocks.logServerError }));

function query(error: { message: string } | null, data: unknown[] = []) {
  const result = { data, error };
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject)
  };
  chain.select.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

describe("course catalog database loader", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fails visibly instead of serving the checked-in seed when the database is down", async () => {
    mocks.from.mockReturnValue(query({ message: "database unavailable" }));
    const { getCourseCatalog } = await import("./index");

    await expect(getCourseCatalog()).rejects.toThrow("catalog_courses_unavailable");
    expect(mocks.logServerError).toHaveBeenCalledWith("catalog_courses_unavailable", {
      message: "database unavailable"
    });
  });
});
