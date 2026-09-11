import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260910120920_persist_assignment_mentor_hints.sql"),
  "utf8"
);

describe("assignment mentor history migration", () => {
  it("stores one direction per learner, assignment, and level", () => {
    expect(migration).toContain("create table public.assignment_mentor_hints");
    expect(migration).toContain("unique (user_id, assignment_id, hint_level)");
    expect(migration).toContain("hint_level between 1 and 3");
    expect(migration).toContain("references public.classroom_assignments(id) on delete cascade");
  });

  it("limits learners to reading and inserting their own history", () => {
    expect(migration).toContain("alter table public.assignment_mentor_hints enable row level security");
    expect(migration).toContain("using ((select auth.uid()) = user_id)");
    expect(migration).toContain("with check (");
    expect(migration).toContain("private.is_classroom_member(assignment.classroom_id)");
    expect(migration).toContain("grant select, insert on table public.assignment_mentor_hints to authenticated");
  });
});
