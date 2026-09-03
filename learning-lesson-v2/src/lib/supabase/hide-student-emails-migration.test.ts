import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260903150000_hide_student_emails_from_classroom_report.sql"
  ),
  "utf8"
);

describe("hide student emails from classroom report", () => {
  it("removes email from the classroom report return shape", () => {
    expect(migration).toContain("drop function if exists public.get_classroom_report(uuid)");
    expect(migration).toContain("drop function if exists private.get_classroom_report(uuid)");
    expect(migration).not.toMatch(/returns table\([\s\S]*email text/);
    expect(migration).toContain("roster_name text");
    expect(migration).toContain("upper(left(replace(member.student_id::text, '-', ''), 8))");
  });
});
