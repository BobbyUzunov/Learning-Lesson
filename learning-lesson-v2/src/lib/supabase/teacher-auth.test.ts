import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireTeacherUser } from "./teacher-auth";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createE2eUser: vi.fn(),
  getE2eAuthState: vi.fn(),
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn()
}));

vi.mock("./e2e-auth", () => ({
  createE2eUser: (...args: unknown[]) => mocks.createE2eUser(...args),
  getE2eAuthState: (...args: unknown[]) => mocks.getE2eAuthState(...args)
}));

vi.mock("./server", () => ({
  createClient: (...args: unknown[]) => mocks.createClient(...args)
}));

const supabase = {
  auth: { getUser: mocks.getUser },
  from: mocks.from
};

describe("requireTeacherUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue(supabase);
    mocks.getE2eAuthState.mockResolvedValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    mocks.maybeSingle.mockResolvedValue({ data: null });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
  });

  it.each(["teacher", "admin"] as const)("accepts protected E2E %s auth", async (role) => {
    const user = { id: `e2e-${role}` };
    mocks.getE2eAuthState.mockResolvedValue({ role });
    mocks.createE2eUser.mockReturnValue(user);

    const result = await requireTeacherUser();

    expect(result).toEqual({ supabase, user });
    expect(mocks.createE2eUser).toHaveBeenCalledWith(role);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("does not elevate an E2E learner", async () => {
    mocks.getE2eAuthState.mockResolvedValue({ role: "user" });

    const result = await requireTeacherUser();

    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(403);
      expect(await result.error.json()).toEqual({ error: "teacher_required" });
    }
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.createE2eUser).not.toHaveBeenCalled();
  });

  it("keeps the regular Supabase authentication check when E2E auth is unavailable", async () => {
    const result = await requireTeacherUser();

    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(401);
      expect(await result.error.json()).toEqual({ error: "not_authenticated" });
    }
    expect(mocks.getUser).toHaveBeenCalledOnce();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.createE2eUser).not.toHaveBeenCalled();
  });

  it("authorizes a real user only from the server-side profile role", async () => {
    const user = { id: "teacher-1" };
    mocks.getUser.mockResolvedValue({ data: { user } });
    mocks.maybeSingle.mockResolvedValue({ data: { role: "teacher" } });

    const result = await requireTeacherUser();

    expect(result).toEqual({ supabase, user });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.select).toHaveBeenCalledWith("role");
    expect(mocks.eq).toHaveBeenCalledWith("id", user.id);
  });
});
