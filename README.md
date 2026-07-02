# Learning Lesson

AI-assisted learning platform for programming — structured courses, hands-on missions, quizzes, projects, and certificates.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://learning-lesson-v2.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Active-success)](#)

**Live app:** https://learning-lesson-v2.vercel.app

---

## About

Learning Lesson helps beginners learn programming by shipping real work — not just reading tutorials. Learners follow sequential courses, complete missions with hints and quizzes, submit projects (including a reviewed capstone on AI Product Builder), and earn certificates.

The active product is **v2** — Next.js 15 + Supabase + Vercel. **v1** is the original Express + HTML environment, kept for reference.

---

## Repository structure

| Folder | Stack | Status |
|--------|-------|--------|
| [`learning-lesson-v2/`](learning-lesson-v2/) | Next.js 15, React 19, TypeScript, Tailwind, Supabase | **Active** — main product |
| [`learning-lesson-v1/`](learning-lesson-v1/) | Node.js, Express, HTML/JS | Legacy — original MVP |

Detailed v2 docs: [learning-lesson-v2/README.md](learning-lesson-v2/README.md)

---

## Features (v2)

- **6 courses**, **63 lessons** — Frontend, Backend, Full-Stack, AI, Mobile, AI Product Builder (EN/BG)
- DB-backed content catalog with admin CMS (courses, lessons, metadata)
- Quiz question bank and course projects in Supabase
- Lesson flow: theory, code example, mission, quiz
- Mini projects + capstone with admin review and certificate gating
- Guest mode — first Frontend lesson without an account
- Supabase auth, per-user progress, XP, levels, achievements, daily streak
- Mobile-first UI with responsive admin tables
- Protected admin area: CMS, seed endpoint, capstone review queue

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
| `/lesson/[id]` | Lesson workspace |
| `/projects/[id]` | Project submission |
| `/dashboard` | Progress summary |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Certificate view |
| `/login`, `/register` | Auth |
| `/admin` | CMS dashboard |
| `/admin/reviews` | Capstone review queue |

---

## Tech stack

**v2 (active):** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel

**v1 (legacy):** Node.js, Express, vanilla HTML/JS, Supabase

---

## Data model (v2)

Content lives in Supabase (`courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `course_projects`) with fallbacks in `src/lib/game-data.ts` and related modules.

User data: `profiles`, `user_progress`, `project_submissions`.

---

## Roadmap

- [x] Gamified course/lesson flow with unlock rules
- [x] Supabase auth and progress API
- [x] Guest-first onboarding and i18n (BG/EN)
- [x] Lesson metadata and syllabus view
- [x] DB-backed catalog + admin CMS
- [x] Quiz and projects in Supabase
- [x] Mini projects, capstone, admin review, certificates
- [x] Mobile layout improvements
- [ ] AI Mentor (lesson-scoped assistant)
- [ ] Admin CMS for quiz and project editing
- [ ] E2E tests for core learner flows

---

## Deployment

Deploy **v2** from the `learning-lesson-v2/` directory on Vercel. Set Supabase environment variables in the Vercel project settings.

---

## Author

**Boncho Uzunov** — [GitHub](https://github.com/BobbyUzunov)

If this project is useful to you, consider giving it a star.
