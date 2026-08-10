import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTeacherAssessments } from "./assessments";
import { getTeacherClassrooms } from "./classrooms";
import { getMyClassroomIds } from "./memberships";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentSession: vi.fn()
}));

vi.mock("./auth", () => ({
  getCurrentSession: (...args: unknown[]) => mocks.getCurrentSession(...args)
}));

vi.mock("./server", () => ({
  createClient: (...args: unknown[]) => mocks.createClient(...args)
}));

describe("Supabase data fallbacks without usable public credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "example-anon-key");
    mocks.getCurrentSession.mockResolvedValue({
      user: { id: "e2e-user" },
      isAdmin: false
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["teacher classrooms", getTeacherClassrooms],
    ["teacher assessments", getTeacherAssessments],
    ["student classroom memberships", getMyClassroomIds]
  ])("returns an empty %s result without creating a client", async (_label, loadData) => {
    await expect(loadData()).resolves.toEqual([]);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
