import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20261003122000_assignment_mentor_atomic_slots.sql"),
  "utf8"
);

function functionDefinition(name: string) {
  const start = migration.indexOf(`create or replace function private.${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextFunction = migration.indexOf("create or replace function private.", start + 1);
  return migration.slice(start, nextFunction === -1 ? undefined : nextFunction);
}

describe("assignment mentor atomic slot migration", () => {
  it("reserves quota and hint slots under an advisory lock", () => {
    const definition = functionDefinition("reserve_assignment_mentor_slot");
    expect(definition).toContain("pg_catalog.pg_advisory_xact_lock");
    expect(definition).toContain("private.reserve_mentor_hint()");
    expect(definition).toContain("status = 'ready'");
    expect(definition).toContain("outcome := 'pending'");
    expect(definition).toContain("outcome := 'reserved'");
  });

  it("finalizes and fails pending hints through security definer RPCs", () => {
    expect(functionDefinition("finalize_assignment_mentor_hint")).toContain("status = 'ready'");
    expect(functionDefinition("fail_assignment_mentor_hint")).toContain("status = 'failed'");
    expect(migration).toContain("revoke insert on table public.assignment_mentor_hints from authenticated");
    expect(migration).toContain("grant execute on function public.reserve_assignment_mentor_slot");
  });

  it("documents that failed generations keep the daily charge", () => {
    expect(migration).toContain("The daily quota charge is not refunded");
  });
});
