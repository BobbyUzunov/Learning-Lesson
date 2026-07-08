# Learning Lesson v2

Active version of Learning Lesson — a learning platform for shipping real products with structured courses, hands-on missions, quizzes, projects, certificates, and an integrated **AI Learning Assistant**.

**Live:** https://learning-lesson-v2.vercel.app

For repo overview and v1 legacy docs, see the [root README](../README.md).

## What it is

Learners follow sequential courses (Frontend → Backend → Full-Stack → AI → Mobile → AI Product Builder), complete lessons with theory + task + quiz, submit mini projects and a capstone, and earn certificates when requirements are met.

Content is **DB-first** with code fallbacks: courses, lessons, metadata, quiz questions, and projects load from Supabase when configured.

Registered learners can request **contextual AI hints** inside each lesson — guided help that nudges them forward without giving away full solutions.

## AI Learning Assistant

The platform includes a **lesson-scoped AI mentor** designed for productive learning, not answer dumping.

| Aspect | Detail |
|--------|--------|
| **Purpose** | Short, guided hints when a learner is stuck on the mission task |
| **Scope** | One lesson at a time — uses lesson theory, objectives, and the learner's draft effort |
| **Guardrails** | Prompts enforce no full solutions; responses are concise (~80 words) |
| **Access** | Registered users only; guests see a sign-up prompt on the lesson page |
| **Quota** | 5 hints per user per day (configurable), persisted in Supabase |
| **Cost control** | `gpt-4o-mini` by default, capped tokens, 20s request timeout |
| **Resilience** | Failed OpenAI calls do not consume daily quota |

### How it works

1. The learner opens a lesson and scrolls to the **task** section.
2. The **AI hint** panel shows remaining daily quota.
3. The learner describes where they are stuck and optionally includes their draft work.
4. The app calls `POST /api/mentor`, which reserves quota, requests a hint from OpenAI, and returns guided feedback.
5. If the provider call fails, the reserved quota is released automatically.

### Configuration

Add to `.env.local` (and Vercel env for production):

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini          # optional
MENTOR_DAILY_LIMIT=5              # optional
```

Apply the mentor usage migration:

`supabase/migrations/20260708210000_add_mentor_daily_usage.sql`

This creates the `mentor_daily_usage` table and RPC functions (`get_mentor_usage`, `reserve_mentor_hint`, `release_mentor_hint`).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with course preview |
| `/paths` | Course syllabus and progress |
| `/lesson/[id]` | Lesson workspace (theory, example, mission, **AI hint**, quiz) |
| `/projects/[id]` | Mini project or capstone submission |
| `/dashboard` | Continue learning, XP, pending projects |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Earned course certificate |
| `/login`, `/register` | Supabase auth |
| `/admin` | CMS — edit courses and lessons |
| `/admin/courses/[id]` | Course editor |
| `/admin/missions/[id]` | Lesson + metadata editor |
| `/admin/quiz`, `/admin/quiz/[id]` | Quiz question editor |
| `/admin/projects`, `/admin/projects/[id]` | Project brief editor |
| `/admin/reviews` | Capstone submission review queue |
| `/admin/reviews/[id]` | Approve or request changes |
| `POST /api/mentor` | Authenticated AI hint request |
| `GET /api/mentor` | Authenticated daily quota status |

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables AI Learning Assistant
OPENAI_API_KEY=your-openai-api-key
```

### Database

Run migrations in order from `supabase/migrations/` in the Supabase SQL editor (or apply `supabase-schema.sql` for a full schema snapshot).

Then seed content as an admin user:

```javascript
fetch('/api/admin/seed-catalog', { method: 'POST' }).then(r => r.json()).then(console.log)
```

Expected seed result: 6 courses, 63 lessons, quiz questions, 3 projects (2 mini + 1 capstone).

Set `profiles.role = 'admin'` for your user to access `/admin` and the seed endpoint.

## Architecture

```
src/lib/
  game-data.ts       # Fallback/seed source for courses and lessons
  catalog/           # DB-first courses, lessons, lesson_metadata
  quiz/              # DB-first quiz questions and lesson→topic mapping
  projects/          # DB-first course projects (mini + capstone)
  mentor/            # AI hint prompts, OpenAI client, quota helpers
  supabase/          # Auth, progress, project submissions, mentor usage RPC
src/app/api/mentor/  # AI hint API (GET quota, POST hint)
src/components/
  lesson-ai-hint.tsx # Lesson-scoped AI assistant UI
```

Supabase tables include: `profiles`, `user_progress`, `courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `lesson_quiz_topics`, `course_projects`, `project_submissions`, `mentor_daily_usage`.

## Content

- **6 courses**, **63 lessons** (bilingual EN/BG)
- **100 XP** per completed lesson
- **Quiz** on every lesson page (topic-based question bank)
- **Projects** on AI Product Builder: product brief (mini), live deploy (mini), capstone with admin review
- **Certificates** require all lessons + required project submissions; capstone must be **approved**

Guests can complete the first Frontend lesson without an account; progress syncs on register/login.

## Features

- Textbook-style lesson flow: theory → example → task → quiz
- **AI Learning Assistant** — lesson-scoped hints with daily quota and cost controls
- Lesson metadata: objectives, prerequisites, key concepts, reading time
- Progressive hints and solution reveal in mission panel
- Guest-first onboarding, mobile nav, BG/EN language switcher
- XP, levels, achievements, daily streak and challenge
- Admin CMS for courses, lessons, quiz, projects, and metadata (writes to Supabase)
- Admin review workflow for capstone submissions
- Vitest unit tests (47+) and Playwright E2E tests (17+), including mentor flows
- GitHub Actions CI: lint, unit tests, build, and E2E on every push to `main`

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```

## Roadmap

- [x] Course catalog in Supabase + admin CMS
- [x] Quiz and projects in Supabase
- [x] Mini projects + capstone + review flow
- [x] Mobile layout polish
- [x] AI Learning Assistant (lesson-scoped hints, quota, Supabase persistence)
- [x] Admin CMS for quiz and project content
- [x] E2E coverage for auth, lesson completion, certificate, and mentor flows
- [ ] Draft autosave for mission and project submissions
- [ ] Certificate download / share
- [ ] Expanded mentor analytics and admin usage dashboard
