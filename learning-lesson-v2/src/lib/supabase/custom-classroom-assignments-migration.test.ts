import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260820150000_custom_classroom_assignments.sql"),
  "utf8"
);

describe("custom classroom assignments migration", () => {
  it("allows catalog or teacher-authored missions on the same table", () => {
    expect(migration).toContain("alter column mission_id drop not null");
    expect(migration).toContain("add column if not exists custom_questions jsonb");
    expect(migration).toContain("classroom_assignments_source_check");
    expect(migration).toContain("mission_id is null");
    expect(migration).toContain("jsonb_array_length(custom_questions) between 1 and 8");
  });

  it("creates custom assignments through the shared classroom helper", () => {
    const start = migration.indexOf("create or replace function private.create_custom_classroom_assignment");
    expect(start).toBeGreaterThanOrEqual(0);

    const nextFunction = migration.indexOf("create or replace function public.create_custom_classroom_assignment");
    const definition = migration.slice(start, nextFunction === -1 ? undefined : nextFunction);

    expect(definition).toContain("private.is_classroom_teacher(");
    expect(definition).toContain("raise exception 'invalid_title'");
    expect(definition).toContain("raise exception 'invalid_questions'");
    expect(definition).not.toContain("classroom.teacher_id = v_user_id");
  });

  it("keeps custom assignments in the teacher review inbox", () => {
    const start = migration.indexOf("create or replace function private.get_pending_teacher_reviews");
    expect(start).toBeGreaterThanOrEqual(0);

    const definition = migration.slice(start);
    expect(definition).toContain("left join public.curriculum_missions mission on mission.id = assignment.mission_id");
    expect(definition).toContain("coalesce(nullif(btrim(assignment.title_override), ''), mission.title");
    expect(definition).not.toMatch(
      /(?<!left )join public.curriculum_missions mission on mission.id = assignment.mission_id/
    );
  });
});
