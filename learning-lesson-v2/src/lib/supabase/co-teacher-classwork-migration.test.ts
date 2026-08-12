import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260812170000_authorize_co_teachers_for_classwork.sql"
  ),
  "utf8"
);

const classworkFunctions = [
  "create_classroom_assignment",
  "review_assignment_submission",
  "create_classroom_assessment",
  "get_assessment_report",
  "get_assessment_question_analysis",
  "close_classroom_assessment"
] as const;

describe("co-teacher classwork authorization migration", () => {
  it.each(classworkFunctions)("authorizes %s through the shared classroom helper", (name) => {
    const start = migration.indexOf(`create or replace function private.${name}`);
    expect(start).toBeGreaterThanOrEqual(0);

    const nextFunction = migration.indexOf("create or replace function private.", start + 1);
    const definition = migration.slice(start, nextFunction === -1 ? undefined : nextFunction);

    expect(definition).toContain("private.is_classroom_teacher(");
    expect(definition).not.toContain("classroom.teacher_id = v_user_id");
    expect(definition).not.toContain("private.is_admin()");
  });

  it("keeps assessment creation limited to active classrooms", () => {
    expect(migration).toContain("and classroom.status = 'active'");
  });

  it("does not replace the already co-teacher-aware assignment report", () => {
    expect(migration).not.toContain(
      "create or replace function private.get_assignment_report"
    );
  });

  it("retains the existing function privileges", () => {
    expect(migration).not.toMatch(/\b(?:grant|revoke|drop function)\b/i);
  });
});
