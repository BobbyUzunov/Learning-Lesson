import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  deleteUser: vi.fn(),
  from: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(() => true),
  logServerError: vi.fn(),
  maybeSingle: vi.fn(),
  requireAdminUser: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));
vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("@/lib/supabase/admin-env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient
}));
vi.mock("@/lib/supabase/admin-auth", () => ({
  requireAdminUser: mocks.requireAdminUser
}));

function request(userId: string, body: unknown = { confirm: true }) {
  return new Request(`http://localhost/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function context(userId = "user-1") {
  return { params: Promise.resolve({ id: userId }) };
}

describe("DELETE /api/admin/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.requireAdminUser.mockResolvedValue({
      user: { id: "admin-1" },
      supabase: {
        from: mocks.from
      }
    });
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: mocks.maybeSingle
        })
      })
    });
    mocks.maybeSingle.mockResolvedValue({ data: { id: "user-1", role: "user" }, error: null });
    mocks.createAdminClient.mockReturnValue({
      auth: { admin: { deleteUser: mocks.deleteUser } }
    });
    mocks.deleteUser.mockResolvedValue({ error: null });
  });

  it("requires confirmation", async () => {
    const response = await DELETE(request("user-1", { confirm: false }), context());

    expect(response.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a student account", async () => {
    const response = await DELETE(request("user-1"), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, userId: "user-1" });
    expect(mocks.deleteUser).toHaveBeenCalledWith("user-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/teachers");
  });

  it("blocks deleting admin accounts", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "user-2", role: "admin" }, error: null });

    const response = await DELETE(request("user-2"), context("user-2"));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "admin_account_protected" });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("blocks deleting yourself", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "admin-1", role: "admin" }, error: null });

    const response = await DELETE(request("admin-1"), context("admin-1"));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "cannot_delete_self" });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("blocks deleting teachers with active classrooms", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "teacher-1", role: "teacher" }, error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mocks.maybeSingle
            })
          })
        };
      }
      if (table === "classrooms") {
        return {
          select: () => ({
            eq: () => ({
              limit: vi.fn(async () => ({ data: [{ id: "class-1" }], error: null }))
            })
          })
        };
      }
      if (table === "classroom_teachers") {
        return {
          select: () => ({
            eq: () => ({
              limit: vi.fn(async () => ({ data: [], error: null }))
            })
          })
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await DELETE(request("teacher-1"), context("teacher-1"));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "teacher_has_classrooms" });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
