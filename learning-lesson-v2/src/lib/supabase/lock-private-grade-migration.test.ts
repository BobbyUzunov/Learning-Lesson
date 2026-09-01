import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260901120000_lock_private_grade_and_display_names.sql"
  ),
  "utf8"
);

describe("lock private grade and display name writes", () => {
  it("revokes authenticated execute on the private knowledge-check grader", () => {
    expect(migration).toContain(
      "revoke all on function private.grade_knowledge_check(text, jsonb) from public, anon, authenticated"
    );
    expect(migration).toContain(
      "grant execute on function private.grade_knowledge_check(text, jsonb) to service_role"
    );
  });

  it("sanitizes profile display names on insert and update", () => {
    expect(migration).toContain("create or replace function public.profiles_sanitize_display_name()");
    expect(migration).toContain("before insert or update of display_name on public.profiles");
  });
});
