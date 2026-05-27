# Learning Lesson v2

Clean MVP rebuild of the Learning Lesson platform using Next.js, React, TypeScript, Tailwind CSS, Supabase, and Vercel.

## MVP Pages

- `/`
- `/login`
- `/dashboard`
- `/paths`
- `/lesson/[id]`
- `/admin`

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

## Current MVP Scope

- Supabase email/password login and register form
- Local blueprint data for learning paths and lessons
- Game-style lesson unlocks through `lockedBy`
- XP and level summary
- Progress save endpoint backed by Supabase `user_progress`
- Read-only admin lesson table
- Mobile-first Tailwind UI

## Next Build Steps

- Move paths and lessons into Supabase tables
- Add protected route handling and admin role checks
- Add lesson create/edit/delete forms
- Add richer lesson content blocks and exercises
- Add Vercel env setup and deployment checks
