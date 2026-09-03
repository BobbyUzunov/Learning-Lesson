import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  profileMaybeSingle: vi.fn(),
  classroomsLimit: vi.fn(),
  coTeachersLimit: vi.fn(),
  deleteUser: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  hasSupabaseAdminEnv: vi.fn(() => true),
  consumeRateLimit: vi.fn(() => Promise.resolve("allowed"))
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/admin-env", () => ({ hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv }));
vi.mock("@/lib/http/rate-limit", () => ({ consumeRateLimit: mocks.consumeRateLimit }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { deleteUser: mocks.deleteUser } },
    rpc: vi.fn(async () => ({ error: null })),
    from: vi.fn(() => ({
      delete: () => ({
        eq: vi.fn(async () => ({ error: null }))
      })
    }))
  })
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mocks.profileMaybeSingle
            })
          })
        };
      }
      if (table === "classrooms") {
        return {
          select: () => ({
            eq: () => ({
              limit: mocks.classroomsLimit
            })
          })
        };
      }
      if (table === "classroom_teachers") {
        return {
          select: () => ({
            eq: () => ({
              limit: mocks.coTeachersLimit
            })
          })
        };
      }
      throw new Error(`Unexpected table ${table}`);
    }
  }))
}));

function request(body: unknown = { confirm: true, confirmPhrase: "DELETE" }) {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("/api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.profileMaybeSingle.mockResolvedValue({ data: { role: "user" }, error: null });
    mocks.classroomsLimit.mockResolvedValue({ data: [], error: null });
    mocks.coTeachersLimit.mockResolvedValue({ data: [], error: null });
    mocks.consumeRateLimit.mockResolvedValue("allowed");
    mocks.deleteUser.mockResolvedValue({ error: null });
  });

  it("requires confirmation", async () => {
    const response = await POST(request({ confirm: false }));
    expect(response.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("requires the typed confirmation phrase, not only confirm: true", async () => {
    const response = await POST(request({ confirm: true }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "confirmation_required" });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a student account", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("blocks admin self-delete", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { role: "admin" }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "admin_account_protected" });
  });

  it("blocks teachers with active classrooms", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: { role: "teacher" }, error: null });
    mocks.classroomsLimit.mockResolvedValue({ data: [{ id: "class-1" }], error: null });
    const response = await POST(request());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "teacher_has_classrooms" });
  });
});
