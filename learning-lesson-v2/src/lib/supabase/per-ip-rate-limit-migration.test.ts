import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260831140000_per_ip_rate_limits.sql"),
  "utf8"
);

describe("per-ip rate limits migration", () => {
  it("removes the global guest-claim per-minute cap", () => {
    expect(migration).toContain("create or replace function private.issue_guest_progress_claim");
    expect(migration).not.toContain("guest_claim_rate_limited");
    expect(migration).not.toContain("v_recent_claim_count");
  });
});
