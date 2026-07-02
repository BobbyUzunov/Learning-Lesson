# Learning Lesson v2

Active version of Learning Lesson — a gamified learning platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

**Live:** https://learning-lesson-v2.vercel.app

For repo overview and v1 legacy docs, see the [root README](../README.md).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing with quest preview |
| `/paths` | Quest selection |
| `/lesson/[id]` | Mission workspace |
| `/dashboard` | XP, level, current quest |
| `/profile` | Stats and achievements |
| `/login`, `/register` | Auth |
| `/admin` | Protected quest/lesson overview |

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run `supabase-schema.sql` in the Supabase SQL editor.

## Data model

All quests and missions live in `src/lib/game-data.ts`:

- **6 quests** — each quest now has multiple missions (42 total)
- **42 missions** with hints, code examples, solutions, and quiz practice
- **100 XP** per completed mission
- Level thresholds in `src/lib/game-progress.ts`

Progress is stored in Supabase `user_progress` and `profiles`. Guests can complete the first mission without an account; progress syncs on register/login.

## Current scope

- Supabase email/password auth
- Guest-first onboarding
- Mission panel with progressive hints and solution reveal
- Quiz question generator with topic-based practice on every lesson page
- Mission unlock rules within each quest
- XP, levels, achievements, daily streak synced to Supabase
- Progress API backed by Supabase
- Admin mission editor with Supabase overrides
- Automatic profile creation on sign-up
- Auth middleware for dashboard, profile, and admin routes
- Vitest coverage for unlock rules, progress stats, and quiz generator
- BG/EN language switcher

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
npm run test     # Vitest unit tests
```

CI runs `lint`, `test`, and `build` on pushes to `main` via GitHub Actions.

## Next steps

- Expand mission count toward each quest's planned level target
- E2E tests for auth and mission completion flows
