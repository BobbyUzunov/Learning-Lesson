import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260831120000_security_grade_rate_limit_and_account.sql"),
  "utf8"
);

describe("security grade rate limit migration", () => {
  it("stores HTTP rate-limit events in a private table", () => {
    expect(migration).toContain("create table private.http_rate_limit_events");
    expect(migration).toContain("revoke all on table private.http_rate_limit_events");
  });

  it("exposes consume_http_rate_limit to service role only", () => {
    expect(migration).toContain("create function public.consume_http_rate_limit");
    expect(migration).toMatch(
      /revoke all on function public\.consume_http_rate_limit\(text, integer, integer\)\s+from public, anon, authenticated/
    );
    expect(migration).toMatch(
      /grant execute on function public\.consume_http_rate_limit\(text, integer, integer\)\s+to service_role/
    );
  });

  it("removes direct anon access to knowledge-check grading", () => {
    expect(migration).toContain(
      "revoke all on function public.grade_knowledge_check(text, jsonb) from anon, authenticated"
    );
    expect(migration).toContain(
      "grant execute on function public.grade_knowledge_check(text, jsonb) to service_role"
    );
  });
});
