import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20261003131000_admin_email_allowlist_db.sql"),
  "utf8"
);

describe("admin email allowlist DB migration", () => {
  it("stores allowlisted emails privately and syncs via service role", () => {
    expect(migration).toContain("create table if not exists private.admin_emails");
    expect(migration).toContain("revoke all on table private.admin_emails from public, anon, authenticated");
    expect(migration).toContain("create or replace function private.replace_admin_emails");
    expect(migration).toMatch(
      /grant execute on function public\.replace_admin_emails\(text\[\]\)\s+to service_role/
    );
  });

  it("requires allowlist membership in private.is_admin when the table is non-empty", () => {
    expect(migration).toContain("create or replace function private.is_admin()");
    expect(migration).toContain("not exists (select 1 from private.admin_emails)");
    expect(migration).toContain("lower(allowlist.email) = lower(coalesce(profile.email, ''))");
  });
});
