import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260812190000_fix_submission_rpcs.sql"),
  "utf8"
);

function functionDefinition(name: string) {
  const start = migration.indexOf(`create or replace function private.${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextFunction = migration.indexOf("create or replace function private.", start + 1);
  return migration.slice(start, nextFunction === -1 ? undefined : nextFunction);
}

describe("submission RPC migration", () => {
  it("uses named unique constraints for PL/pgSQL upserts", () => {
    const project = functionDefinition("submit_project");
    const assignment = functionDefinition("submit_assignment");
    expect(project).toContain(
      "on conflict on constraint project_submissions_user_id_project_id_key"
    );
    expect(project).not.toContain("on conflict (user_id, project_id)");
    expect(assignment).toContain(
      "on conflict on constraint assignment_submissions_assignment_id_student_id_key"
    );
    expect(assignment).not.toContain("on conflict (assignment_id, student_id)");
  });

  it("counts assessment answer keys with a supported PostgreSQL function", () => {
    const definition = functionDefinition("submit_assessment");
    expect(definition).toContain("p_answers is null");
    expect(definition).toContain("pg_catalog.jsonb_typeof(p_answers)");
    expect(definition).toContain("from pg_catalog.jsonb_object_keys(p_answers)");
    expect(definition).toContain("v_answer_count <> v_question_count");
    expect(definition).not.toContain("jsonb_object_length");
  });

  it.each(["submit_project", "submit_assignment", "submit_assessment"])(
    "preserves the %s security boundary",
    (name) => {
      const definition = functionDefinition(name);
      expect(definition).toContain("security definer");
      expect(definition).toContain("set search_path = ''");
    }
  );

  it("preserves existing function privileges and public wrappers", () => {
    expect(migration).not.toMatch(/\b(?:grant|revoke|drop function)\b/i);
    expect(migration).not.toContain("function public.");
  });
});
