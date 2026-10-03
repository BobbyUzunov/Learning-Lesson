import { describe, expect, it, vi } from "vitest";
import { ensureUserProfile } from "./profile";

describe("ensureUserProfile repair insert", () => {
  it("does not send role in the authenticated insert payload", async () => {
    const insert = vi.fn(() => ({
      select: () => ({
        maybeSingle: vi.fn(async () => ({
          data: {
            id: "user-1",
            auth_user_id: "user-1",
            email: "student@school.bg",
            display_name: "Student",
            role: "user",
            xp: 0,
            level: 1,
            streak_count: 0
          },
          error: null
        }))
      })
    }));

    const supabase = {
      from: vi.fn((table: string) => {
        if (table !== "profiles") {
          throw new Error(`unexpected table ${table}`);
        }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null }))
            })
          }),
          insert
        };
      })
    };

    const result = await ensureUserProfile(supabase as never, {
      id: "user-1",
      email: "student@school.bg",
      user_metadata: { display_name: "Student" }
    });

    expect(result.error).toBeNull();
    expect(insert).toHaveBeenCalledWith(
      expect.not.objectContaining({
        role: expect.anything()
      })
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-1",
        auth_user_id: "user-1",
        email: "student@school.bg"
      })
    );
  });
});
