import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(() => true),
  logServerError: vi.fn()
}));

vi.mock("server-only", () => ({}));
vi.mock("./admin-env", () => ({ hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv }));
vi.mock("./admin", () => ({
  createAdminClient: () => ({ rpc: mocks.rpc })
}));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));

import { syncAdminEmailAllowlist } from "./sync-admin-allowlist";

describe("syncAdminEmailAllowlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.rpc.mockResolvedValue({ data: 2, error: null });
  });

  it("pushes normalized emails through replace_admin_emails", async () => {
    const result = await syncAdminEmailAllowlist(["Admin@School.bg", "ops@school.bg"]);
    expect(result).toEqual({ ok: true, count: 2 });
    expect(mocks.rpc).toHaveBeenCalledWith("replace_admin_emails", {
      p_emails: ["Admin@School.bg", "ops@school.bg"]
    });
  });

  it("skips when admin env is missing", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);
    await expect(syncAdminEmailAllowlist(["a@b.c"])).resolves.toEqual({ ok: false, count: 0 });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("logs and returns failure when the RPC errors", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(syncAdminEmailAllowlist(["a@b.c"])).resolves.toEqual({ ok: false, count: 0 });
    expect(mocks.logServerError).toHaveBeenCalledWith("admin_allowlist_sync_failed", {
      detail: "boom"
    });
  });
});
