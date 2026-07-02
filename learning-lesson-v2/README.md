# Learning Lesson v2

Gamified learning platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Pages

- `/` — landing with quest preview
- `/login`, `/register` — auth
- `/dashboard` — XP, level, current quest
- `/paths` — quest selection
- `/lesson/[id]` — mission workspace
- `/profile` — stats and achievements
- `/admin` — protected quest/lesson overview

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Add Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run `supabase-schema.sql` in the Supabase SQL editor to enable per-user lesson progress.

## Data Model

All quests and lessons live in `src/lib/game-data.ts`:

- **6 quests** (Frontend, Backend, Full-Stack, AI, Mobile, AI Product Builder)
- **7 missions** with hints, code examples, and solutions
- **100 XP** per completed mission
- Level thresholds in `src/lib/game-progress.ts`

Progress is stored in Supabase `user_progress` and `profiles`. Guests can try the first mission without an account; progress syncs on register/login.

## Current Scope

- Supabase email/password auth
- Guest-first onboarding (first mission free)
- Mission panel with progressive hints and solution reveal
- XP, levels, achievements, daily streak (local)
- Progress API backed by Supabase
- Read-only admin table for quests and missions
- BG/EN language switcher

## Next Steps

- Add remaining missions per quest (most quests are placeholders)
- Move quests/lessons into Supabase tables
- Admin CRUD for missions
- Finish i18n cleanup for achievement titles in `game-progress.ts`
- Sync daily streak to Supabase
