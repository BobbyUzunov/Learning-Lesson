# Learning Lesson

AI-assisted learning platform for programming — structured courses, hands-on missions, quizzes, projects, certificates, and a lesson-scoped **AI Learning Assistant**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://learning-lesson-v2.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-AI%20Hints-412991)](https://openai.com/)
[![Status](https://img.shields.io/badge/Status-Active-success)](#)

**Live app:** [learning-lesson-v2.vercel.app](https://learning-lesson-v2.vercel.app)

---

## About

Learning Lesson helps beginners learn programming by shipping real work — not just reading tutorials. Learners follow sequential courses, complete missions with hints and quizzes, request **AI-guided hints** when stuck, submit projects (including a reviewed capstone on AI Product Builder), and earn certificates.

The active product is **v2** — Next.js 15 + Supabase + OpenAI + Vercel. **v1** is the original Express + HTML environment, kept for reference.

---

## Repository structure

| Folder | Stack | Status |
|--------|-------|--------|
| [`learning-lesson-v2/`](learning-lesson-v2/) | Next.js 15, React 19, TypeScript, Tailwind, Supabase, OpenAI | **Active** — main product |
| [`learning-lesson-v1/`](learning-lesson-v1/) | Node.js, Express, HTML/JS | Legacy — original MVP |

Detailed v2 docs: [learning-lesson-v2/README.md](learning-lesson-v2/README.md)

---

## Features (v2)

- **6 courses**, **63 lessons** — Frontend, Backend, Full-Stack, AI, Mobile, AI Product Builder (EN/BG)
- **AI Learning Assistant** — lesson-scoped hints with daily quota, Supabase persistence, and cost controls (`gpt-4o-mini`)
- DB-backed content catalog with admin CMS (courses, lessons, metadata, quiz, projects)
- Quiz question bank and course projects in Supabase
- Lesson flow: theory, code example, mission, **AI hint**, quiz
- Mini projects + capstone with admin review and certificate gating
- **Draft autosave** for lesson solutions and project submissions (localStorage)
- **Certificate print / share link** on earned certificates
- Guest mode — first Frontend lesson without an account
- Supabase auth, per-user progress, XP, levels, achievements, daily streak and challenge
- Mobile-first UI with responsive navigation, tap targets, and overflow fixes
- Protected admin area: CMS, seed endpoint, capstone review queue
- **57 Vitest unit tests** and **20 Playwright E2E tests** covering auth, secure lesson completion, certificates, AI mentor, navigation, and mobile layout
- Hardened Supabase access with RLS on Data API tables and privileged operations isolated in a private schema

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

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables AI Learning Assistant
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini          # optional
```

Apply Supabase migrations from `learning-lesson-v2/supabase/migrations/` (in order), then seed via `/api/admin/seed-catalog` as an admin user. See [learning-lesson-v2/README.md](learning-lesson-v2/README.md) for details.

---

## Quick start (v1)

```bash
cd learning-lesson-v1
npm install
npm run dev
```

Schema: `learning-lesson-v1/supabase-schema.sql`

---

## v2 routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/paths` | Course syllabus |
| `/lesson/[id]` | Lesson workspace (theory, mission, AI hint, quiz) |
| `/projects/[id]` | Project submission |
| `/dashboard` | Progress, streak, daily challenge |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Certificate view (print / share) |
| `/login`, `/register` | Auth |
| `/admin` | CMS dashboard |
| `/admin/quiz`, `/admin/projects` | Quiz and project editors |
| `/admin/reviews` | Capstone review queue |
| `GET /api/mentor` | Daily AI hint quota |
| `POST /api/mentor` | Request AI hint |

---

## Tech stack

**v2 (active):** Next.js, React, TypeScript, Tailwind CSS, Supabase, OpenAI, Vercel, Vitest, Playwright

**v1 (legacy):** Node.js, Express, vanilla HTML/JS, Supabase

---

## Data model (v2)

Content lives in Supabase (`courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `lesson_quiz_topics`, `course_projects`) with fallbacks in `src/lib/game-data.ts` and related modules.

User data: `profiles`, `user_progress`, `project_submissions`, `mentor_daily_usage`.

All Data API tables use Row Level Security. Privileged RPC implementations and the server-managed `mentor_settings` row live in Supabase's unexposed `private` schema; clients use authenticated public wrappers for protected operations.

---

## Roadmap

- [x] Gamified course/lesson flow with unlock rules
- [x] Supabase auth and progress API
- [x] Guest-first onboarding and i18n (BG/EN)
- [x] Lesson metadata and syllabus view
- [x] DB-backed catalog + admin CMS
- [x] Quiz and projects in Supabase + admin editors
- [x] Mini projects, capstone, admin review, certificates
- [x] AI Learning Assistant (lesson-scoped hints, quota, Supabase)
- [x] E2E tests for auth, lessons, certificates, mentor, and mobile layout
- [x] Mobile layout polish and learner UX (draft autosave, certificate actions)
- [ ] Mentor usage analytics in admin dashboard
- [ ] Server-side draft sync for logged-in learners

---

## Deployment

Deploy **v2** from the `learning-lesson-v2/` directory on Vercel. Set Supabase and OpenAI environment variables in the Vercel project settings, apply all Supabase migrations, then redeploy.

---

## Author

**Boncho Uzunov** — [GitHub](https://github.com/BobbyUzunov)

If this project is useful to you, consider giving it a star.
