import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  requireAdminUser: vi.fn(),
  seedAllContentToDatabase: vi.fn(),
  logServerError: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/admin-auth", () => ({
  requireAdminUser: mocks.requireAdminUser
}));
vi.mock("@/lib/catalog/seed", () => ({
  seedAllContentToDatabase: mocks.seedAllContentToDatabase
}));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));

describe("POST /api/admin/seed-catalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("ENABLE_ADMIN_CONTENT_SEED", "1");
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.requireAdminUser.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.seedAllContentToDatabase.mockResolvedValue({ courses: 6, lessons: 63 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the seed route disabled unless explicitly enabled", async () => {
    vi.stubEnv("ENABLE_ADMIN_CONTENT_SEED", "0");

    const response = await POST();

    expect(response.status).toBe(404);
    expect(mocks.requireAdminUser).not.toHaveBeenCalled();
  });

  it("revalidates the catalog views after a successful seed", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, courses: 6, lessons: 63 });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/paths");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("does not expose Supabase details when seeding fails", async () => {
    mocks.seedAllContentToDatabase.mockRejectedValue(
      new Error("duplicate key violates private.catalog_constraint")
    );

    const response = await POST();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "catalog_seed_failed" });
    expect(mocks.logServerError).toHaveBeenCalledWith("catalog_seed_failed", {
      detail: "duplicate key violates private.catalog_constraint"
    });
  });
});
