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

- **6 quests** — Frontend, Backend, Full-Stack, AI, Mobile, AI Product Builder
- **7 missions** with hints, code examples, and solutions
- **100 XP** per completed mission
- Level thresholds in `src/lib/game-progress.ts`

Progress is stored in Supabase `user_progress` and `profiles`. Guests can complete the first mission without an account; progress syncs on register/login.

## Current scope

- Supabase email/password auth
- Guest-first onboarding
- Mission panel with progressive hints and solution reveal
- Mission unlock rules within each quest
- XP, levels, achievements, daily streak (local)
- Progress API backed by Supabase
- Read-only admin table
- BG/EN language switcher

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

## Next steps

- Add remaining missions per quest
- Move quests/lessons into Supabase tables
- Admin CRUD for missions
- Localize achievement titles
- Sync daily streak to Supabase
