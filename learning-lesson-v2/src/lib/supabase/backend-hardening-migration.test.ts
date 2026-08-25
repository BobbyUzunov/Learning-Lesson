import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260825100000_backend_hardening.sql"),
  "utf8"
);

function functionDefinition(marker: string) {
  const start = migration.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = migration.slice(start + marker.length);
  const next = rest.search(/\ncreate(?: or replace)? function /);
  return next === -1 ? migration.slice(start) : migration.slice(start, start + marker.length + next);
}

describe("backend hardening migration", () => {
  it("strips answer keys from the public knowledge-check grade wrapper", () => {
    expect(migration).toContain("drop function if exists public.grade_knowledge_check(text, jsonb)");

    const definition = functionDefinition("create function public.grade_knowledge_check");
    expect(definition).not.toContain("correct_index");
    expect(definition).toContain("result.is_correct");
    expect(definition).toContain("from private.grade_knowledge_check($1, $2) result");
    expect(definition).toContain("security definer");
    expect(definition).toContain("set search_path = ''");
    expect(migration).toContain(
      "grant execute on function public.grade_knowledge_check(text, jsonb) to anon, authenticated"
    );
  });

  it("maps a concurrent assessment insert to attempt_exists", () => {
    const definition = functionDefinition("create or replace function private.submit_assessment");
    expect(definition).toContain("raise exception 'attempt_exists'");
    expect(definition).toContain("when unique_violation then");
    expect(definition).toContain("security definer");
    expect(definition).toContain("set search_path = ''");
  });

  it("locks handle_new_user to an empty search_path", () => {
    const definition = functionDefinition("create or replace function public.handle_new_user()");
    expect(definition).toContain("set search_path = ''");
    expect(definition).not.toContain("set search_path = public");
    expect(definition).toContain("insert into public.profiles");
    expect(definition).toContain("public.derive_profile_display_name");
  });

  it("makes set_user_role service-role only and requires an actor", () => {
    expect(migration).toContain("drop function if exists public.set_user_role(uuid, text)");
    expect(migration).toContain("drop function if exists private.set_user_role(uuid, text)");
    expect(migration).toContain("p_actor_id uuid default null");
    expect(migration).toContain("raise exception 'admin_role_protected'");
    expect(migration).toContain("raise exception 'teacher_has_classrooms'");
    expect(migration).toContain(
      "grant execute on function public.set_user_role(uuid, text, uuid) to service_role"
    );
    expect(migration).toContain(
      "grant execute on function private.set_user_role(uuid, text, uuid) to service_role"
    );
    expect(migration).toContain(
      "revoke all on function public.set_user_role(uuid, text, uuid) from public, anon, authenticated"
    );
    expect(migration).not.toMatch(
      /grant execute on function public\.set_user_role\(uuid, text, uuid\) to authenticated/
    );
  });
});
