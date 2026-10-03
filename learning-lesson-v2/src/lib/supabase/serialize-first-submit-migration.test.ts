import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20261003121000_serialize_first_assignment_submit.sql"),
  "utf8"
);

describe("serialize first assignment submit migration", () => {
  it("takes an advisory lock before looking up the submission row", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("submit_assignment:");
    const lockAt = migration.indexOf("pg_advisory_xact_lock");
    const selectAt = migration.indexOf("from public.assignment_submissions submission");
    expect(lockAt).toBeGreaterThanOrEqual(0);
    expect(selectAt).toBeGreaterThan(lockAt);
  });

  it("refuses ON CONFLICT updates for already submitted or approved work", () => {
    expect(migration).toContain("where public.assignment_submissions.status in ('draft', 'needs_changes')");
    expect(migration).toContain("raise exception 'assignment_closed'");
  });
});
