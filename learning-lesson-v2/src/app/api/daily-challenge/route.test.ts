import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  createClient: vi.fn(),
  getUser: vi.fn(),
  eqCompleted: vi.fn(),
  eqUser: vi.fn(),
  select: vi.fn(),
  from: vi.fn()
}));

vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: mocks.hasSupabaseEnv }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

describe("GET /api/daily-challenge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "student-1" } } });
    mocks.eqCompleted.mockResolvedValue({ data: [], error: null });
    mocks.eqUser.mockReturnValue({ eq: mocks.eqCompleted });
    mocks.select.mockReturnValue({ eq: mocks.eqUser });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.createClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: mocks.from
    });
  });

  it("loads the authenticated learner progress", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith("user_progress");
    expect(mocks.eqUser).toHaveBeenCalledWith("user_id", "student-1");
    expect(mocks.eqCompleted).toHaveBeenCalledWith("completed", true);
  });

  it("does not leak database details when progress is unavailable", async () => {
    mocks.eqCompleted.mockResolvedValue({
      data: null,
      error: { message: "private.user_progress policy detail" }
    });

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "daily_challenge_unavailable" });
  });

  it("uses the guest status without creating a client when Supabase is unconfigured", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
