# Audit follow-ups — 2026-10-03

Branch work after PR #12 merge. Completes the remaining items from the post-audit list.

| Item | Status | Notes |
| --- | --- | --- |
| Admin allowlist in DB | **Done** | `20261003131000_admin_email_allowlist_db.sql` + `syncAdminEmailAllowlist` on admin API use |
| Draft persistence | **Done** | localStorage autosave for assignment + assessment forms |
| Assessment duration | **Done** | Labeled as suggested/ориентировъчно time (no hard timer) |
| Teacher review history UI | **Done** | RPC + `/api/teacher/submissions/[id]/history` + История toggle |
| Unexpected SC errors | **Done** | Segment `error.tsx` treats digest as temporarily unavailable |
| Live RLS/concurrency smoke | **Ops** | Still needs disposable accounts on staging; not a code change |
| Gradebook N+1 RPCs | **Deferred** | Scale risk only; not broken for pilot class sizes |
| Roadmap (9–12, bulk assign, calendar/push, tenancy) | **Deferred** | Product scope beyond stabilization |

## Migrations to apply

1. `20261003130000_submission_review_history_for_teachers.sql`
2. `20261003131000_admin_email_allowlist_db.sql`
