import { describe, expect, it, vi } from "vitest";
import {
  deleteAuthUserOrOrphanProfile,
  isAuthUserMissingError
} from "./user-deletion";

describe("isAuthUserMissingError", () => {
  it("matches Supabase Admin API wording", () => {
    expect(isAuthUserMissingError("User not found")).toBe(true);
    expect(isAuthUserMissingError("Database error deleting user")).toBe(false);
    expect(isAuthUserMissingError(undefined)).toBe(false);
  });
});

describe("deleteAuthUserOrOrphanProfile", () => {
  it("succeeds when Auth delete works", async () => {
    const admin = {
      auth: { admin: { deleteUser: vi.fn(async () => ({ error: null })) } },
      from: vi.fn()
    };

    await expect(deleteAuthUserOrOrphanProfile(admin as never, "user-1")).resolves.toEqual({ ok: true });
    expect(admin.from).not.toHaveBeenCalled();
  });

  it("removes an orphaned profile when Auth already has no user", async () => {
    const rpc = vi.fn(async () => ({ error: null }));
    const admin = {
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({ error: { message: "User not found" } }))
        }
      },
      rpc,
      from: vi.fn()
    };

    await expect(deleteAuthUserOrOrphanProfile(admin as never, "orphan-1")).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("purge_orphaned_profile", { p_user_id: "orphan-1" });
    expect(admin.from).not.toHaveBeenCalled();
  });

  it("falls back to direct profile delete when the purge RPC is missing", async () => {
    const deleteEq = vi.fn(async () => ({ error: null }));
    const admin = {
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({ error: { message: "User not found" } }))
        }
      },
      rpc: vi.fn(async () => ({ error: { message: "Could not find the function" } })),
      from: vi.fn(() => ({
        delete: () => ({
          eq: deleteEq
        })
      }))
    };

    await expect(deleteAuthUserOrOrphanProfile(admin as never, "orphan-1")).resolves.toEqual({ ok: true });
    expect(deleteEq).toHaveBeenCalledWith("id", "orphan-1");
  });

  it("returns the Auth error when it is not a missing user", async () => {
    const admin = {
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({ error: { message: "Database error deleting user" } }))
        }
      },
      from: vi.fn()
    };

    await expect(deleteAuthUserOrOrphanProfile(admin as never, "user-1")).resolves.toEqual({
      ok: false,
      detail: "Database error deleting user"
    });
    expect(admin.from).not.toHaveBeenCalled();
  });
});
