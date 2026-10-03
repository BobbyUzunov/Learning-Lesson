# Admin allowlist contract

`ADMIN_EMAIL_ALLOWLIST` is enforced in the Next.js app layer (`isAdminEmailAllowed` in `src/lib/supabase/auth.ts`).

- App `isAdmin` requires **both** `profiles.role = 'admin'` **and** an allowlisted email (when the allowlist is required in production).
- Postgres `private.is_admin` continues to check **only** the DB role. Direct Supabase access with a user JWT therefore still follows RLS based on `profiles.role`.

## Current product decision

The allowlist is an **application gate** for Next.js admin routes and APIs. It does **not** revoke direct Data API admin privileges for an existing DB admin who is missing from the allowlist.

If operators need the allowlist to also revoke direct Supabase access, add a matching DB check (for example sync allowlisted emails into a private table consulted by `private.is_admin`). That change is intentionally out of scope for the 2026-10-03 audit remediation unless explicitly requested.
