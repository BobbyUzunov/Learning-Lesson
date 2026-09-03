import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260903140000_lock_assignment_resubmit.sql"
  ),
  "utf8"
);

function functionDefinition(name: string) {
  const start = migration.indexOf(`create or replace function private.${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextFunction = migration.indexOf("create or replace function private.", start + 1);
  return migration.slice(start, nextFunction === -1 ? undefined : nextFunction);
}

describe("lock assignment resubmit migration", () => {
  it("rejects submitted and approved work from being overwritten", () => {
    const definition = functionDefinition("submit_assignment");
    expect(definition).toContain("for update");
    expect(definition).toContain("v_current_status not in ('draft', 'needs_changes')");
    expect(definition).toContain("raise exception 'assignment_closed'");
  });

  it("archives the prior review before a needs_changes resubmit clears it", () => {
    const definition = functionDefinition("submit_assignment");
    expect(definition).toContain("private.assignment_submission_review_history");
    expect(definition).toContain("'cleared_on_resubmit'");
    expect(migration).toContain("create table if not exists private.assignment_submission_review_history");
  });

  it("records teacher reviews in the same history table", () => {
    const definition = functionDefinition("review_assignment_submission");
    expect(definition).toContain("'teacher_review'");
    expect(definition).toContain("for update of submission");
  });
});
