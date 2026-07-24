# Learning Lesson v2

Активната версия на Learning Lesson — учебна платформа за **дигитални професии в професионална гимназия**.

Учениците избират направление, изпълняват практически мисии с ясен резултат и участват в клас. Учителите създават класове, възлагат мисии и следят напредъка.

**Live:** [learning-lesson-v2.vercel.app](https://learning-lesson-v2.vercel.app)

Общо описание на продукта: [root README](../README.md).

## Какво е това

Пилот за **VIII клас** по учебните планове на ПГКНМА (прием 2026/2027) за:

- разработка на софтуер;
- интелигентни системи;
- компютърна графика;
- киберсигурност.

Всяко направление свързва официални модули, учебни резултати и практически мисии. Общите предмети са отделени. Учителите работят с класове (код, архив, задания, справки без ученически имейл).

Паралелно остават достъпни практическите курсове в платформата (теория → задача → quiz, проекти, сертификати) и **AI подсказки** в урок — насоки, не готови решения.

Съдържанието е **DB-first** с fallback в кода: курсове, уроци, мисии и проекти се зареждат от Supabase, когато е конфигуриран.

## AI Learning Assistant

The platform includes a **lesson-scoped AI mentor** designed for productive learning, not answer dumping.

| Aspect | Detail |
|--------|--------|
| **Purpose** | Short, guided hints when a learner is stuck on the mission task |
| **Scope** | One lesson at a time — uses lesson theory, objectives, and the learner's draft effort |
| **Guardrails** | Prompts enforce no full solutions; responses are concise (~80 words) |
| **Access** | Registered users only; guests see a sign-up prompt on the lesson page |
| **Quota** | 5 hints per user per day by default, persisted and enforced in Supabase |
| **Cost control** | `gpt-4o-mini` by default, capped tokens, 20s request timeout |
| **Abuse control** | A reserved attempt counts even if the provider fails, so clients cannot refund their own quota |

### How it works

1. The learner opens a lesson and scrolls to the **task** section.
2. The **AI hint** panel shows remaining daily quota.
3. The learner describes where they are stuck and optionally includes their draft work.
4. The app calls `POST /api/mentor`, which reserves quota, requests a hint from OpenAI, and returns guided feedback.
5. The quota is reserved atomically before the provider call, preventing concurrent overuse.

### Configuration

Add to `.env.local` (and Vercel env for production):

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini          # optional
```

The quota is controlled by a server-only row in the private schema (after applying migrations):

```sql
update private.mentor_settings
set daily_limit = 5
where singleton;
```

Run this only through the Supabase SQL Editor or another trusted administrator connection. The table is not exposed through the Data API.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with course preview |
| `/paths` | Grade 8 vocational curriculum explorer, course syllabus, and progress |
| `/lesson/[id]` | Lesson workspace (theory, example, mission, **AI hint**, quiz) |
| `/projects/[id]` | Mini project or capstone submission |
| `/dashboard` | Continue learning, XP, pending projects |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Earned course certificate |
| `/login`, `/register` | Sign in and registration |
| `/forgot-password`, `/reset-password`, `/verify-email` | Account recovery and email verification |
| `/admin` | CMS — edit courses and lessons |
| `/admin/courses/[id]` | Course editor |
| `/admin/missions/[id]` | Lesson + metadata editor |
| `/admin/quiz`, `/admin/quiz/[id]` | Quiz question editor |
| `/admin/projects`, `/admin/projects/[id]` | Project brief editor |
| `/admin/reviews` | Capstone submission review queue |
| `/admin/reviews/[id]` | Approve or request changes |
| `POST /api/mentor` | Authenticated AI hint request |
| `GET /api/mentor` | Authenticated daily quota status |
| `/api/progress`, `/api/streak`, `/api/daily-challenge` | Protected learner state APIs |
| `/api/projects/[projectId]` | Authenticated project submissions |
| `/api/admin/*` | Admin-only catalog, review, and seed APIs |

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

Run migrations in order from `supabase/migrations/`. This migration chain is the canonical schema. The latest migrations add explicit Data API grants, RLS policies, constraints, protected learner-state RPCs, and move privileged implementations into the unexposed `private` schema.

With the Supabase CLI linked to the target project:

```bash
npx supabase db push
```

Then seed content as an admin user:

```javascript
fetch('/api/admin/seed-catalog', { method: 'POST' }).then(r => r.json()).then(console.log)
```

Expected seed result: 6 courses, 63 lessons, 34 quiz questions, 3 projects (2 mini + 1 capstone), 4 specialties, 6 curriculum modules, and 4 orientation missions.

Set `profiles.role = 'admin'` for your user to access `/admin` and the seed endpoint.

## Architecture

```
src/lib/
  game-data.ts       # Fallback/seed source for courses and lessons
  catalog/           # DB-first courses, lessons, lesson_metadata
  curriculum/        # DB-first school specialties, grade modules, missions, course links
  quiz/              # DB-first quiz questions and lesson→topic mapping
  projects/          # DB-first course projects (mini + capstone)
  mentor/            # AI hint prompts, OpenAI client, quota helpers
  supabase/          # Auth, progress, project submissions, mentor usage RPC
src/app/api/mentor/  # AI hint API (GET quota, POST hint)
src/components/
  lesson-ai-hint.tsx # Lesson-scoped AI assistant UI
```

### Supabase security model

- All Data API tables have Row Level Security enabled.
- Content is publicly readable where appropriate; learner and submission data is owner-scoped.
- Progress, streak, quiz completion, and mentor quota changes are validated server-side.
- Privileged RPC implementations and `mentor_settings` live in the unexposed `private` schema.
- Public RPC wrappers preserve the client API while anonymous execution is revoked for protected operations.
- Admin APIs verify the authenticated user's `profiles.role` before making changes.

Public tables include `profiles`, `user_progress`, `courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `lesson_quiz_topics`, `course_projects`, `project_submissions`, `mentor_daily_usage`, `specialties`, `curriculum_modules`, `curriculum_missions`, and `curriculum_course_links`. `private.mentor_settings` is server-managed.

## Content

- **6 courses**, **63 lessons**, **34 quiz questions**, and **3 projects** (bilingual EN/BG)
- **4 vocational specialties**, **6 grade 8 curriculum modules**, and **4 orientation missions** mapped to the existing courses
- **100 XP** per completed lesson
- **Quiz** on every lesson page; at least 2/3 correct answers are verified server-side before XP is awarded
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
- 61 Vitest unit tests and 20 Playwright E2E tests, including curriculum integrity, secure completion, mentor, auth, and mobile flows

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
npm run check        # lint + typecheck + unit tests + production build
```

## Roadmap

- [x] Course catalog in Supabase + admin CMS
- [x] Quiz and projects in Supabase
- [x] Mini projects + capstone + review flow
- [x] Mobile layout polish
- [x] AI Learning Assistant (lesson-scoped hints, quota, Supabase persistence)
- [x] Admin CMS for quiz and project content
- [x] E2E coverage for auth, lesson completion, certificate, and mentor flows
- [x] Draft autosave for mission and project submissions
- [x] Certificate print/PDF and shareable link
- [x] Grade 8 vocational curriculum foundation for four professions
- [ ] Teacher roles, classrooms, assignments, and school reports
- [ ] Expand the official curriculum structure through grades 9–12
- [ ] Expanded mentor analytics and admin usage dashboard
