# Learning Lesson v2

Active version of Learning Lesson — a learning platform for shipping real products with structured courses, hands-on missions, quizzes, projects, and certificates.

**Live:** https://learning-lesson-v2.vercel.app

For repo overview and v1 legacy docs, see the [root README](../README.md).

## What it is

Learners follow sequential courses (Frontend → Backend → Full-Stack → AI → Mobile → AI Product Builder), complete lessons with theory + task + quiz, submit mini projects and a capstone, and earn certificates when requirements are met.

Content is **DB-first** with code fallbacks: courses, lessons, metadata, quiz questions, and projects load from Supabase when configured.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with course preview |
| `/paths` | Course syllabus and progress |
| `/lesson/[id]` | Lesson workspace (theory, example, mission, quiz) |
| `/projects/[id]` | Mini project or capstone submission |
| `/dashboard` | Continue learning, XP, pending projects |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Earned course certificate |
| `/login`, `/register` | Supabase auth |
| `/admin` | CMS — edit courses and lessons |
| `/admin/courses/[id]` | Course editor |
| `/admin/missions/[id]` | Lesson + metadata editor |
| `/admin/reviews` | Capstone submission review queue |
| `/admin/reviews/[id]` | Approve or request changes |

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
  supabase/          # Auth, progress, project submissions
```

Supabase tables include: `profiles`, `user_progress`, `courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `lesson_quiz_topics`, `course_projects`, `project_submissions`.

## Content

- **6 courses**, **63 lessons** (bilingual EN/BG)
- **100 XP** per completed lesson
- **Quiz** on every lesson page (topic-based question bank)
- **Projects** on AI Product Builder: product brief (mini), live deploy (mini), capstone with admin review
- **Certificates** require all lessons + required project submissions; capstone must be **approved**

Guests can complete the first Frontend lesson without an account; progress syncs on register/login.

## Features

- Textbook-style lesson flow: theory → example → task → quiz
- Lesson metadata: objectives, prerequisites, key concepts, reading time
- Progressive hints and solution reveal in mission panel
- Guest-first onboarding, mobile nav, BG/EN language switcher
- XP, levels, achievements, daily streak and challenge
- Admin CMS for courses, lessons, and metadata (writes to Supabase)
- Admin review workflow for capstone submissions
- Vitest unit tests; Playwright smoke test for mobile nav

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
npm run test     # Vitest unit tests
```

## Roadmap

- [x] Course catalog in Supabase + admin CMS
- [x] Quiz and projects in Supabase
- [x] Mini projects + capstone + review flow
- [x] Mobile layout polish
- [ ] AI Mentor (lesson-scoped assistant)
- [ ] Admin CMS for quiz and project content
- [ ] E2E coverage for auth, lesson completion, and certificate flow
