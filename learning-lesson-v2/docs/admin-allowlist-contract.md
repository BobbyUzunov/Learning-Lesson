# Admin allowlist contract

`ADMIN_EMAIL_ALLOWLIST` is enforced in **both** the Next.js app layer and Postgres.

## App layer

`isAdminEmailAllowed` (`src/lib/supabase/auth.ts`, `admin-auth.ts`) requires:

- `profiles.role = 'admin'`
- email present in `ADMIN_EMAIL_ALLOWLIST` when the list is non-empty or production requires it

## Database layer

Migration `20261003131000_admin_email_allowlist_db.sql`:

- Stores allowlisted emails in `private.admin_emails` (service_role only).
- `private.is_admin()` requires `profiles.role = 'admin'` **and**, when the table is non-empty, a matching email.
- Empty table → role-only admin (local/dev convenience).

## Sync

`syncAdminEmailAllowlist()` (`src/lib/supabase/sync-admin-allowlist.ts`) pushes the env list through `replace_admin_emails` (service role). It runs on successful `requireAdminUser()` so production admin use keeps the DB table current.

After deploying the migration, open any admin action once (or call sync manually) so the table is populated from Vercel env.
