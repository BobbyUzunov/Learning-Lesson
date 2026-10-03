import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20261003130000_submission_review_history_for_teachers.sql"
  ),
  "utf8"
);

function functionDefinition(name: string) {
  const start = migration.indexOf(`create or replace function private.${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextFunction = migration.indexOf("create or replace function ", start + 1);
  return migration.slice(start, nextFunction === -1 ? undefined : nextFunction);
}

describe("submission review history for teachers migration", () => {
  it("scopes history to classroom teachers for the submission", () => {
    const definition = functionDefinition("get_submission_review_history");
    expect(definition).toContain("private.is_classroom_teacher(v_classroom_id)");
    expect(definition).toContain("private.assignment_submission_review_history");
    expect(definition).toContain("raise exception 'not_authorized'");
    expect(definition).toContain("raise exception 'submission_not_found'");
  });

  it("exposes a public RPC wrapper for authenticated callers", () => {
    expect(migration).toContain("create or replace function public.get_submission_review_history");
    expect(migration).toContain(
      "grant execute on function public.get_submission_review_history(uuid)"
    );
    expect(migration).toContain("to authenticated, service_role");
  });
});
