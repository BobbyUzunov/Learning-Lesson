import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260904120000_sync_student_display_name_source_of_truth.sql"
  ),
  "utf8"
);

describe("sync student display name source of truth", () => {
  it("makes profiles.display_name the rename target and report preference", () => {
    expect(migration).toContain("update public.profiles profile");
    expect(migration).toContain("set display_name = v_name");
    expect(migration).toContain("set roster_name = v_name");
    expect(migration).toContain("where member.student_id = p_student_id");
    expect(migration).toMatch(
      /coalesce\(\s*nullif\(btrim\(profile\.display_name\), ''\),\s*nullif\(btrim\(member\.roster_name\), ''\)/
    );
    expect(migration).toContain("insert into public.classroom_members as member (classroom_id, student_id, roster_name)");
  });
});
