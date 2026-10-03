import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20261003120000_isolate_http_rate_limit_cleanup.sql"),
  "utf8"
);

describe("isolate http rate limit cleanup migration", () => {
  it("deletes expired events only for the current bucket_key", () => {
    expect(migration).toContain("create or replace function private.consume_http_rate_limit");
    expect(migration).toMatch(
      /delete from private\.http_rate_limit_events event\s+where event\.bucket_key = p_bucket_key\s+and event\.created_at </
    );
    expect(migration).not.toMatch(
      /delete from private\.http_rate_limit_events event\s+where event\.created_at </
    );
  });
});
