import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260812180000_cast_teacher_classroom_grade_level.sql"
  ),
  "utf8"
);

describe("teacher classroom grade-level migration", () => {
  it.each(["list_teacher_classrooms", "get_teacher_classroom"])(
    "keeps the %s integer contract aligned with the smallint column",
    (name) => {
      const start = migration.indexOf(`create or replace function private.${name}`);
      expect(start).toBeGreaterThanOrEqual(0);

      const nextFunction = migration.indexOf("create or replace function private.", start + 1);
      const definition = migration.slice(start, nextFunction === -1 ? undefined : nextFunction);

      expect(definition).toContain("grade_level integer");
      expect(definition).toContain("classroom.grade_level::integer");
      expect(definition).toContain("security definer");
      expect(definition).toContain("set search_path = ''");
    }
  );

  it("preserves existing function privileges", () => {
    expect(migration).not.toMatch(/\b(?:grant|revoke|drop function)\b/i);
  });
});
