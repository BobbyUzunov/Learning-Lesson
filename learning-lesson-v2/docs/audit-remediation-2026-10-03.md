# Audit remediation — 2026-10-03

Branch: `fix/audit-2026-10-03`  
Baseline audit commit: `827c640`  
Source audit: `docs/project-audit-2026-10-03.md`

## Findings status

| # | Finding | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Production deps (Next/Sharp) | **Fixed** | `next`/`eslint-config-next` `15.5.27`, Sharp override `0.35.5`; `npm audit --omit=dev` → 0 vulns |
| 2 | Rate-limit cleanup crosses buckets | **Fixed** | Migration `20261003120000_isolate_http_rate_limit_cleanup.sql` + `rate-limit-isolation-migration.test.ts` |
| 3 | Concurrent AI mentor double-charge | **Fixed** | Migration `20261003122000_assignment_mentor_atomic_slots.sql`; slot RPC + route/history updates; mentor route tests |
| 4 | Concurrent first assignment submit | **Fixed** | Migration `20261003121000_serialize_first_assignment_submit.sql` (advisory lock + guarded upsert) |
| 5 | Streak only from Profile | **Fixed** | `touchDailyStreak` on lesson complete + assignment submit; UTC day boundary documented; streak tests |
| 6 | Dashboard CTA prefers submitted | **Fixed** | `pickPrimaryAssignment` + dashboard wiring + `primary.test.ts` |
| 7 | Stale missionId on re-assign | **Fixed** | `resolveMissionId` + assign-mission-form tests |
| 8 | Teacher note UI ≠ payload | **Fixed** | `resolveTeacherNote` + assignment-report-table tests |
| 9 | Long solutions rejected by AI | **Fixed** | `effort-excerpt.ts`; accept long draft, bound model input; UI/header feedback |
| 10 | Production outage UI / nested html | **Fixed** | `throwLoadError` → `/unavailable`; segment `error.tsx` without html/body; `global-error.tsx` for root |
| 11 | Silent seed fallback (labs/projects) | **Fixed** | `hasSupabaseDataEnv` + throw on DB error; empty catalog stays empty |
| 12 | Profile outage invents student | **Fixed** | `auth.ts` returns `profileUnavailable`; `requireUser` redirects to unavailable |
| 13 | Profile repair inserts `role` | **Fixed** | Repair insert omits `role`; `profile-repair.test.ts` |
| 14 | Network failure locks forms | **Fixed** | try/catch/finally on classroom/delete forms; delete success with failed signOut still redirects |
| 15 | Login open redirect via `\` | **Fixed** | `safe-redirect.ts` + login page/form + redirect tests |
| 16 | Incomplete personal export | **Fixed** | Export adds mentor hints, assessments, review history RPC, consent, `review_notes` |
| 17 | Co-teacher sees owner controls | **Fixed** | `canManageClassroom` gates archive/rotate/enable; panel hidden for non-owners |

### Additional boundaries

| Topic | Status |
| --- | --- |
| `ADMIN_EMAIL_ALLOWLIST` vs `private.is_admin` | **Documented** — app-layer only; see `docs/admin-allowlist-contract.md` |
| Direct learner INSERT of AI history | **Hardened** — writes via security-definer slot RPCs; direct INSERT revoked in mentor slot migration |
| Empty AI effort after refresh as “new attempt” | **Aligned** — slot reservation + ready history filter; pending/idempotent returns |

## Migrations (apply order)

Do **not** rewrite older migrations. Apply these new ones after existing chain:

1. `20261003120000_isolate_http_rate_limit_cleanup.sql`
2. `20261003121000_serialize_first_assignment_submit.sql`
3. `20261003122000_assignment_mentor_atomic_slots.sql`
4. `20261003123000_export_private_personal_data.sql`

Safe apply (linked project / staging first):

```bash
cd learning-lesson-v2
npx supabase db push
# or local: npx supabase migration up
```

Use disposable accounts for destructive verification. Production apply requires an explicit publish instruction.

## Verification (local)

| Check | Result |
| --- | --- |
| Vitest | 110 files / 651 tests passed |
| Lint | clean |
| Typecheck | clean |
| Production build | Next.js 15.5.27 — success |
| Playwright E2E | 63/63 passed (Chromium, fake auth) |
| `npm audit --omit=dev` | 0 vulnerabilities after Next/Sharp bump |
| Live Postgres concurrency | **Not run** here (no disposable DB). Migration/unit tests cover contracts; confirm races on staging. |
| Live OpenAI | Mocked in unit tests only |

## Limitations

- Concurrent SQL races (rate-limit buckets, first submit, mentor slots) need staging Postgres confirmation with parallel sessions.
- Production outage UI for unexpected (non-`throwLoadError`) Server Component failures still shows the generic segment error; expected data outages use `/unavailable`.
- Admin allowlist still does not revoke direct Supabase admin RLS for DB-role admins.
