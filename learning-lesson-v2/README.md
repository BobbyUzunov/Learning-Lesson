# Learning Lesson v2

Активната версия на Learning Lesson — учебна платформа за **дигитални професии в професионална гимназия**.

Учениците избират направление, изпълняват практически мисии, участват в клас и решават проверки на знанията. Учителите създават класове, възлагат мисии, публикуват входни/текущи/финални проверки и следят резултатите.

**Live:** [learning-lesson-v2.vercel.app](https://learning-lesson-v2.vercel.app)

Общо описание на продукта: [root README](../README.md).

## Какво е това

Пилот за **VIII клас** по учебните планове на ПГКНМА (прием 2026/2027) за:

- разработка на софтуер;
- интелигентни системи;
- компютърна графика;
- киберсигурност.

Всяко направление свързва официални модули, учебни резултати и самостоятелни практически мисии. Общите предмети са отделени. Учителите работят с класове (код, архив, задания, справки без ученически имейл).

Паралелно остават достъпни практическите курсове в платформата (теория → задача → самопроверка, проекти, сертификати) като **допълнителни технологични лаборатории**, а не като задължителна част от програмата за VIII клас. Налични са и **AI подсказки** в урок — насоки, не готови решения — и отделни учителски проверки с автоматично оценяване.

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
| `/paths` | Избор на направление и мисии от програмата за VIII клас |
| `/missions/[id]` | Кратко условие, очакван резултат и план за работа по мисия |
| `/courses` | Технологични лаборатории с проверен прогрес, XP и сертификати |
| `/lesson/[id]` | Lesson workspace (theory, example, mission, **AI hint**, knowledge check) |
| `/projects/[id]` | Mini project or capstone submission |
| `/dashboard` | Continue learning, XP, pending projects |
| `/profile` | Stats, achievements, certificates |
| `/certificate/[questId]` | Earned course certificate |
| `/login`, `/register` | Sign in and registration |
| `/forgot-password`, `/reset-password`, `/verify-email` | Account recovery and email verification |
| `/admin` | CMS — edit courses and lessons |
| `/admin/courses/[id]` | Course editor |
| `/admin/missions/[id]` | Lesson + metadata editor |
| `/admin/knowledge-checks`, `/admin/knowledge-checks/[id]` | Knowledge-check question editor (`/admin/quiz/*` redirects for compatibility) |
| `/admin/projects`, `/admin/projects/[id]` | Project brief editor |
| `/admin/reviews` | Capstone submission review queue |
| `/admin/reviews/[id]` | Approve or request changes |
| `/teacher/assessments` | Всички проверки на учителя и справки по класове |
| `/teacher/classes/[id]/assessments/new` | Създаване на входна, текуща или финална проверка |
| `/teacher/classes/[id]/assessments/[assessmentId]` | Резултати по ученик и анализ по въпрос |
| `/assessments` | Възложените проверки на ученика |
| `/assessments/[id]` | Решаване, резултат и обяснения след предаване |
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

# Server-only; use the Supabase secret key and never expose it to the browser.
SUPABASE_SECRET_KEY=your-server-only-supabase-secret-key

# Optional — enables AI Learning Assistant
OPENAI_API_KEY=your-openai-api-key
```

### Database

Run migrations in order from `supabase/migrations/`. This migration chain is the canonical schema. The latest migrations add explicit Data API grants, RLS policies, constraints, protected learner-state RPCs, and move privileged implementations into the unexposed `private` schema.

With the Supabase CLI linked to the target project:

```bash
npx supabase db push
```

For a controlled initial import, temporarily set `ENABLE_ADMIN_CONTENT_SEED=1`, deploy, and seed content as an admin user:

```javascript
fetch('/api/admin/seed-catalog', { method: 'POST' }).then(r => r.json()).then(console.log)
```

Expected seed result: 6 courses, 63 lessons, 38 lesson knowledge-check questions, 3 projects (2 mini + 1 capstone), 4 specialties, 8 grade 8 curriculum modules, and 64 curriculum missions.

Set `profiles.role = 'admin'` for your user to access `/admin` and the seed endpoint. Set `ENABLE_ADMIN_CONTENT_SEED=0` again immediately after the import; the endpoint and button are disabled by default so a production admin cannot accidentally overwrite edited content.

## Architecture

```
src/lib/
  game-data.ts       # Fallback/seed source for courses and lessons
  catalog/           # DB-first courses, lessons, lesson_metadata
  curriculum/        # DB-first school specialties, grade modules, and missions
  quiz/              # Compatibility adapter for DB-first knowledge checks and lesson→topic mapping
  assessments/       # Classroom checks, reports, and editable curriculum templates
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
- Progress, streak, knowledge-check completion, and mentor quota changes are validated server-side.
- Privileged RPC implementations and `mentor_settings` live in the unexposed `private` schema.
- Public RPC wrappers preserve the client API while anonymous execution is revoked for protected operations.
- Guest completion proofs are issued only by the server with `SUPABASE_SECRET_KEY`; `SUPABASE_SERVICE_ROLE_KEY` remains a legacy environment alias.
- Admin APIs verify the authenticated user's `profiles.role` before making changes.

Public tables include `profiles`, `user_progress`, `courses`, `lessons`, `lesson_metadata`, `quiz_questions`, `lesson_quiz_topics`, `course_projects`, `project_submissions`, `mentor_daily_usage`, `specialties`, `curriculum_modules`, `curriculum_missions`, `curriculum_mission_labs`, `classrooms`, `classroom_members`, `classroom_assignments`, `assignment_submissions`, `classroom_assessments`, `assessment_questions`, and `assessment_attempts`. `private.mentor_settings` and guest-claim records are server-managed.

## Content

- **6 courses**, **63 lessons**, **38 lesson knowledge-check questions**, and **3 projects** (bilingual EN/BG)
- **4 vocational specialties**, **8 grade 8 curriculum modules**, and **64 curriculum missions**
- Selected Grade 8 missions offer curated technology-lab continuations; mission completion remains teacher-approved, while XP is awarded only by verified lesson completion
- **7 editable assessment templates** with **56 curriculum-aligned questions**: 3 shared checks and 1 specialty check per class
- **100 XP** per completed lesson
- **Knowledge check** on every lesson page; at least 2/3 correct answers are verified server-side before XP is awarded
- **Projects** on AI Product Builder: product brief (mini), live deploy (mini), capstone with admin review
- **Certificates** require all lessons + required project submissions; capstone must be **approved**

Guests can complete the first Frontend lesson without an account; progress syncs on register/login.

## Features

- Textbook-style lesson flow: theory → example → task → knowledge check
- **AI Learning Assistant** — lesson-scoped hints with daily quota and cost controls
- Lesson metadata: objectives, prerequisites, key concepts, reading time
- Progressive hints and solution reveal in mission panel
- Guest-first onboarding, mobile nav, BG/EN language switcher
- XP, levels, achievements, daily streak and challenge
- Admin CMS for courses, lessons, knowledge checks, projects, and metadata (writes to Supabase)
- Admin review workflow for capstone submissions
- Teacher classrooms, join codes, mission assignments, submissions, and feedback
- Diagnostic, formative, and summative classroom checks with one attempt, automatic scoring, post-submission explanations, and per-question analysis
- Grade 8 teacher templates for shared digital foundations, IT, entrepreneurship, and each of the four vocational specialties
- Self-contained mission guides with a clear brief, deliverable, work plan, skills, and classroom handoff
- Vitest and Playwright coverage for curriculum integrity, secure completion, mentor, auth, assessment helpers, and mobile flows

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
- [x] Knowledge checks and projects in Supabase
- [x] Mini projects + capstone + review flow
- [x] Mobile layout polish
- [x] AI Learning Assistant (lesson-scoped hints, quota, Supabase persistence)
- [x] Admin CMS for knowledge-check and project content
- [x] E2E coverage for auth, lesson completion, certificate, and mentor flows
- [x] Draft autosave for mission and project submissions
- [x] Certificate print/PDF and shareable link
- [x] Grade 8 vocational curriculum foundation for four professions
- [x] Teacher roles, classrooms, assignments, and school reports
- [x] Classroom knowledge checks with automatic scoring and question analysis
- [x] Curriculum-aligned Grade 8 question banks and editable teacher check templates
- [x] Separate the official Grade 8 missions from optional advanced technology labs
- [x] Connect selected school missions to verified labs without creating a second XP source
- [ ] Expand the official curriculum structure through grades 9–12
- [ ] Expanded mentor analytics and admin usage dashboard
