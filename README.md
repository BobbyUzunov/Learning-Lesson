# Learning Lesson

AI-assisted learning platform for programming — interactive missions, XP progression, and practical exercises in the browser.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://learning-lesson-v2.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Active-success)](#)

**Live app:** https://learning-lesson-v2.vercel.app

---

## About

Learning Lesson helps beginners learn programming through structured quests, hands-on missions, and visible progress (XP, levels, achievements).

The active version is **v2** — a gamified Next.js app with Supabase auth and per-user progress. **v1** is the original Express + HTML learning environment, kept in the repo for reference.

---

## Repository structure

This repo contains two versions of the project in separate folders:

| Folder | Stack | Status |
|--------|-------|--------|
| [`learning-lesson-v2/`](learning-lesson-v2/) | Next.js 15, React 19, TypeScript, Tailwind, Supabase | **Active** — main product |
| [`learning-lesson-v1/`](learning-lesson-v1/) | Node.js, Express, HTML/JS | Legacy — original MVP |

---

## Features (v2)

- Quest-based learning paths (Frontend, Backend, Full-Stack, AI, Mobile, AI Product Builder)
- Mission workspace with code examples, progressive hints, and solutions
- Guest mode — try the first mission without an account
- Supabase email/password auth with progress sync on register/login
- XP, levels, achievements, and dashboard
- BG/EN language switcher
- Protected admin overview for quests and missions
- Mobile-first UI

---

## Quick start (v2)

```bash
git clone https://github.com/BobbyUzunov/Learning-Lesson.git
cd Learning-Lesson/learning-lesson-v2
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

### Environment variables

Add to `learning-lesson-v2/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run `learning-lesson-v2/supabase-schema.sql` in the Supabase SQL editor before testing auth and progress.

---

## Quick start (v1)

```bash
cd learning-lesson-v1
npm install
npm run dev
```

Open http://localhost:3000

Schema: `learning-lesson-v1/supabase-schema.sql`

---

## v2 routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/paths` | Quest selection |
| `/lesson/[id]` | Mission workspace |
| `/dashboard` | Progress summary |
| `/profile` | Stats and achievements |
| `/login`, `/register` | Auth |
| `/admin` | Admin-only quest/lesson overview |

---

## Tech stack

**v2 (active):** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel

**v1 (legacy):** Node.js, Express, vanilla HTML/JS, Supabase

---

## Data model (v2)

Quests and missions are defined in `learning-lesson-v2/src/lib/game-data.ts`:

- 6 quests, 7 missions (more planned per quest)
- 100 XP per completed mission
- Level thresholds in `src/lib/game-progress.ts`
- User progress in Supabase tables `profiles` and `user_progress`

---

## Roadmap

- [x] Gamified quest/mission flow
- [x] Supabase auth and progress API
- [x] Guest-first onboarding
- [x] i18n (BG/EN) for core UI
- [x] Mission unlock rules
- [ ] More missions per quest
- [ ] Move quests/lessons to Supabase tables
- [ ] Admin CRUD for missions
- [ ] Sync daily streak to Supabase
- [ ] Certificates and AI tutor

---

## Deployment

Deploy **v2** from the `learning-lesson-v2/` directory on Vercel. Set the same Supabase environment variables in the Vercel project settings.

---

## Author

**Boncho Uzunov** — [GitHub](https://github.com/BobbyUzunov)

If this project is useful to you, consider giving it a star.
