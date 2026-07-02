type Phase2Lesson = {
  id: string;
  questId: string;
  title: string;
  titleBg?: string;
  explanation: string;
  explanationBg?: string;
  codeExample: string;
  mission: string;
  missionBg?: string;
  hint?: string;
  hintBg?: string;
  hint1?: string;
  hint1Bg?: string;
  hint2?: string;
  hint2Bg?: string;
  hint3?: string;
  hint3Bg?: string;
  solution: string;
};

export const phase2Lessons: Phase2Lesson[] = [
  {
    id: "43",
    questId: "backend",
    title: "Database Schema Mission",
    titleBg: "Мисия: Database schema",
    explanation: "Tables and constraints define what data your API can safely store.",
    explanationBg: "Таблиците и constraint-ите определят какви данни API-то може безопасно да пази.",
    codeExample: "create table public.profiles (\n  id uuid primary key references auth.users(id),\n  xp integer not null default 0\n);",
    mission: "List the core tables this learning app needs for auth, progress and admin overrides.",
    missionBg: "Изброй основните таблици, които learning app-ът трябва да има за auth, progress и admin overrides.",
    hint1: "Think profiles, user_progress and game_missions.",
    hint1Bg: "Помисли за profiles, user_progress и game_missions.",
    solution: "profiles for users, user_progress for lesson completion, game_missions for admin content overrides."
  },
  {
    id: "44",
    questId: "backend",
    title: "Row Level Security Mission",
    titleBg: "Мисия: Row Level Security",
    explanation: "RLS ensures users can only read or write rows that belong to them.",
    explanationBg: "RLS гарантира, че users четат и пишат само редове, които им принадлежат.",
    codeExample: "create policy \"Users read own progress\"\non public.user_progress for select\nusing (auth.uid() = user_id);",
    mission: "Write one RLS policy idea for user_progress that blocks cross-user reads.",
    missionBg: "Напиши една RLS policy идея за user_progress, която блокира чужди reads.",
    hint1: "Compare auth.uid() with user_id in the policy.",
    hint1Bg: "Сравни auth.uid() с user_id в policy-то.",
    solution: "Allow select/update only when auth.uid() = user_id on user_progress."
  },
  {
    id: "45",
    questId: "backend",
    title: "Migrations Mission",
    titleBg: "Мисия: Migrations",
    explanation: "Schema changes should be versioned so production can be updated safely.",
    explanationBg: "Schema промените трябва да са versioned, за да се update-ва production безопасно.",
    codeExample: "-- supabase/migrations/20260702120000_fix_profiles.sql",
    mission: "Describe when to use a migration file instead of editing tables manually in the dashboard.",
    missionBg: "Опиши кога да ползваш migration файл вместо ръчна редакция в dashboard-а.",
    hint1: "Use migrations for repeatable deploys and team review.",
    hint1Bg: "Ползвай migrations за повторяеми deploy-и и team review.",
    solution: "Use migrations for registration fixes, new columns, RLS policies and anything that must match across dev and production."
  },
  {
    id: "46",
    questId: "backend",
    title: "Webhooks Mission",
    titleBg: "Мисия: Webhooks",
    explanation: "Webhooks let external systems react when something important happens in your backend.",
    explanationBg: "Webhooks позволяват на външни системи да реагират, когато нещо важно се случи в backend-а.",
    codeExample: "POST /api/webhooks/progress-completed\n{ userId, lessonId, xp }",
    mission: "Sketch one webhook payload that could notify a certificate service after quest completion.",
    missionBg: "Скицирай един webhook payload, който уведомява certificate service след quest completion.",
    hint1: "Include user id, quest id and completion timestamp.",
    hint1Bg: "Включи user id, quest id и completion timestamp.",
    solution: "{ event: 'quest.completed', userId, questId, completedAt, certificateUrl }"
  },
  {
    id: "47",
    questId: "fullstack",
    title: "Form Validation Mission",
    titleBg: "Мисия: Form validation",
    explanation: "Validate on the client for speed and on the server for safety.",
    explanationBg: "Валидирай на client за скорост и на server за сигурност.",
    codeExample: "if (!email.includes('@')) setError('Invalid email');",
    mission: "List two validations that belong in the API route for mission completion.",
    missionBg: "Изброй две валидации, които трябва да са в API route за mission completion.",
    hint1: "Check auth and lesson existence before writing progress.",
    hint1Bg: "Провери auth и дали урокът съществува преди запис на progress.",
    solution: "1) Reject unauthenticated requests. 2) Reject unknown lesson ids before upsert."
  },
  {
    id: "48",
    questId: "fullstack",
    title: "Optimistic UI Mission",
    titleBg: "Мисия: Optimistic UI",
    explanation: "Optimistic UI updates the interface before the server responds, then rolls back on failure.",
    explanationBg: "Optimistic UI update-ва интерфейса преди server response и се връща назад при грешка.",
    codeExample: "setCompleted(true);\nconst ok = await saveProgress();\nif (!ok) setCompleted(false);",
    mission: "Explain when optimistic completion is safe in this app and when it is not.",
    missionBg: "Обясни кога optimistic completion е безопасен в това app и кога не е.",
    hint1: "Guests can use local state; authenticated users need API truth.",
    hint1Bg: "Guests могат с local state; authenticated users трябва API truth.",
    solution: "Safe for guest localStorage demos. For logged-in users, only show success after /api/progress succeeds."
  },
  {
    id: "49",
    questId: "fullstack",
    title: "Server Actions Mission",
    titleBg: "Мисия: Server actions",
    explanation: "Server actions run trusted logic close to your data layer without exposing secrets.",
    explanationBg: "Server actions изпълняват trusted logic близо до data layer-а без излагане на secrets.",
    codeExample: "'use server';\nexport async function completeLesson(lessonId: string) { ... }",
    mission: "Name one lesson-related action that should stay server-side in this project.",
    missionBg: "Посочи едно lesson-related действие, което трябва да остане server-side в този проект.",
    hint1: "Progress writes and admin mission saves need trusted checks.",
    hint1Bg: "Progress writes и admin mission saves имат нужда от trusted checks.",
    solution: "Saving lesson completion and admin mission overrides should stay on the server with auth checks."
  },
  {
    id: "50",
    questId: "fullstack",
    title: "Middleware Mission",
    titleBg: "Мисия: Middleware",
    explanation: "Middleware can protect routes before a page renders.",
    explanationBg: "Middleware може да пази routes преди page render.",
    codeExample: "if (pathname.startsWith('/admin') && !isAdmin) redirect('/dashboard');",
    mission: "List the routes this app protects with middleware and why.",
    missionBg: "Изброй routes, които app-ът пази с middleware и защо.",
    hint1: "Dashboard, profile and admin need authenticated sessions.",
    hint1Bg: "Dashboard, profile и admin имат нужда от authenticated sessions.",
    solution: "Protect /dashboard and /profile for signed-in users; protect /admin for admin role only."
  },
  {
    id: "51",
    questId: "fullstack",
    title: "Deployment Mission",
    titleBg: "Мисия: Deployment",
    explanation: "A healthy deploy checks build, env vars, auth redirects and production data paths.",
    explanationBg: "Здрав deploy проверява build, env vars, auth redirects и production data paths.",
    codeExample: "npm run lint && npm run test && npm run build",
    mission: "Create a 5-step deploy checklist for Learning Lesson v2 on Vercel.",
    missionBg: "Създай 5-step deploy checklist за Learning Lesson v2 на Vercel.",
    hint1: "Include CI, env vars, Supabase redirects and smoke test.",
    hint1Bg: "Включи CI, env vars, Supabase redirects и smoke test.",
    solution: "1) CI green 2) env vars set 3) Supabase redirect URLs 4) build passes 5) smoke test login + lesson complete."
  },
  {
    id: "52",
    questId: "ai-product-builder",
    title: "Prompt Library Mission",
    titleBg: "Мисия: Prompt library",
    explanation: "Reusable prompts keep AI output consistent across features.",
    explanationBg: "Reusable prompts държат AI output консистентен между features.",
    codeExample: "const lessonSummaryPrompt = 'Return JSON with title, goals, quiz.';",
    mission: "Draft one reusable prompt for generating a mission summary in this app.",
    missionBg: "Напиши един reusable prompt за генериране на mission summary в това app.",
    hint1: "Ask for JSON fields the UI can render directly.",
    hint1Bg: "Поискай JSON полета, които UI може да render-не директно.",
    solution: "Return JSON: { title, mission, hints: string[], explanation } for lesson id {id}."
  },
  {
    id: "53",
    questId: "ai-product-builder",
    title: "Feature Flags Mission",
    titleBg: "Мисия: Feature flags",
    explanation: "Feature flags let you ship code safely and enable experiments gradually.",
    explanationBg: "Feature flags позволяват безопасен ship на код и постепенни experiments.",
    codeExample: "const showDailyChallenge = process.env.NEXT_PUBLIC_DAILY_CHALLENGE === 'true';",
    mission: "Suggest one feature in this app that deserves a flag during rollout.",
    missionBg: "Предложи една feature в това app, която заслужава flag при rollout.",
    hint1: "New profile charts or certificates could start behind a flag.",
    hint1Bg: "Новите profile charts или certificates могат да започнат зад flag.",
    solution: "Gate daily challenge or certificates behind an env flag until QA passes in production."
  },
  {
    id: "54",
    questId: "ai-product-builder",
    title: "Analytics Mission",
    titleBg: "Мисия: Analytics",
    explanation: "Track the learning funnel: visit, start lesson, complete lesson, return next day.",
    explanationBg: "Следи learning funnel-а: visit, start lesson, complete lesson, return next day.",
    codeExample: "events.track('lesson_completed', { lessonId, questId, xp: 100 });",
    mission: "Define three analytics events that would help improve retention in this app.",
    missionBg: "Дефинирай три analytics events, които биха подобрили retention в това app.",
    hint1: "Measure drop-off before registration and after first lesson.",
    hint1Bg: "Мери drop-off преди registration и след първия урок.",
    solution: "lesson_started, lesson_completed, daily_challenge_completed."
  },
  {
    id: "55",
    questId: "ai-product-builder",
    title: "Monetization Mission",
    titleBg: "Мисия: Monetization",
    explanation: "Even free learning products need a clear value ladder for future upgrades.",
    explanationBg: "Дори безплатните learning продукти имат нужда от ясна value ladder за бъдещи upgrades.",
    codeExample: "Free: first quest\nPro: all quests + certificates + AI tutor",
    mission: "Sketch a simple free vs pro split for Learning Lesson v2.",
    missionBg: "Скицирай прост free vs pro split за Learning Lesson v2.",
    hint1: "Keep the first quest free for acquisition.",
    hint1Bg: "Дръж първата quest free за acquisition.",
    solution: "Free: first mission + guest progress. Pro: all quests, cloud sync, certificates, daily challenge history."
  },
  {
    id: "56",
    questId: "ai-product-builder",
    title: "Onboarding Mission",
    titleBg: "Мисия: Onboarding",
    explanation: "Good onboarding gets the learner to one win in under five minutes.",
    explanationBg: "Добрият onboarding води learner-а до една победа за под пет минути.",
    codeExample: "Home → first lesson → complete → dashboard XP",
    mission: "Write the shortest onboarding path for a brand-new visitor in this app.",
    missionBg: "Напиши най-краткия onboarding path за чисто нов visitor в това app.",
    hint1: "Use guest-first lesson, then register to save progress.",
    hint1Bg: "Ползвай guest-first lesson, после register за запазване на progress.",
    solution: "Land on home → open first frontend lesson → complete → register → see XP on dashboard."
  },
  {
    id: "57",
    questId: "ai-product-builder",
    title: "Content Strategy Mission",
    titleBg: "Мисия: Content strategy",
    explanation: "Mission content should teach one concept and end with one clear action.",
    explanationBg: "Mission content трябва да учи една концепция и да завършва с едно ясно действие.",
    codeExample: "Concept → tiny example → mission → hints → solution",
    mission: "Audit one mission and list what makes it easy or hard for beginners.",
    missionBg: "Направи audit на една мисия и изброй какво я прави лесна или трудна за начинаещи.",
    hint1: "Short mission text and one code example reduce friction.",
    hint1Bg: "Кратък mission text и един code example намаляват friction.",
    solution: "Easy when mission is one sentence, hints escalate slowly, solution is copy-paste friendly."
  },
  {
    id: "58",
    questId: "ai-product-builder",
    title: "SEO Mission",
    titleBg: "Мисия: SEO",
    explanation: "Public lesson pages need meaningful titles, descriptions and crawlable structure.",
    explanationBg: "Публичните lesson pages имат нужда от смислени titles, descriptions и crawlable structure.",
    codeExample: "export const metadata = { title: 'HTML Structure Mission | Learning Lesson' };",
    mission: "Suggest metadata improvements for the paths and lesson pages.",
    missionBg: "Предложи metadata подобрения за paths и lesson pages.",
    hint1: "Use quest names and mission titles in page metadata.",
    hint1Bg: "Ползвай quest names и mission titles в page metadata.",
    solution: "Add quest-specific titles, localized descriptions and canonical URLs for lesson pages."
  },
  {
    id: "59",
    questId: "ai-product-builder",
    title: "Performance Mission",
    titleBg: "Мисия: Performance",
    explanation: "Fast pages keep learners in flow, especially on mobile networks.",
    explanationBg: "Бързите страници държат learners в flow, особено на mobile мрежи.",
    codeExample: "export const dynamic = 'force-dynamic'; // only where live data is required",
    mission: "Name one page that should stay dynamic and one that could be more static.",
    missionBg: "Посочи една страница, която трябва да е dynamic и една, която може да е по-static.",
    hint1: "Admin and dashboard need fresh data; marketing sections can be lighter.",
    hint1Bg: "Admin и dashboard имат нужда от fresh data; marketing секциите могат да са по-леки.",
    solution: "Keep dashboard/lesson/admin dynamic for live progress; home hero cards can use lighter server rendering."
  },
  {
    id: "60",
    questId: "ai-product-builder",
    title: "Accessibility Mission",
    titleBg: "Мисия: Accessibility",
    explanation: "Accessible apps work with keyboard, screen readers and sufficient contrast.",
    explanationBg: "Accessible apps работят с клавиатура, screen readers и достатъчен contrast.",
    codeExample: "<button aria-label=\"Open menu\" aria-expanded={open}>",
    mission: "List two accessibility wins already present in this project.",
    missionBg: "Изброй две accessibility победи, които вече са в този проект.",
    hint1: "Look at focus styles, labels and mobile menu button semantics.",
    hint1Bg: "Виж focus styles, labels и mobile menu button semantics.",
    solution: "Focus-ring classes on interactive controls and aria labels on the mobile menu toggle."
  },
  {
    id: "61",
    questId: "ai-product-builder",
    title: "Community Mission",
    titleBg: "Мисия: Community",
    explanation: "Learners stay longer when progress is visible and shareable.",
    explanationBg: "Learners остават по-дълго, когато progress е видим и споделяем.",
    codeExample: "Share certificate URL after quest completion",
    mission: "Propose one social loop using certificates or streaks.",
    missionBg: "Предложи един social loop с certificates или streaks.",
    hint1: "Certificates are natural share moments after quest completion.",
    hint1Bg: "Certificates са естествени share моменти след quest completion.",
    solution: "After earning a certificate, share the /certificate/[questId] page with a quest badge image."
  },
  {
    id: "62",
    questId: "ai-product-builder",
    title: "Roadmap Mission",
    titleBg: "Мисия: Roadmap",
    explanation: "Roadmaps turn feedback into sequenced product work.",
    explanationBg: "Roadmaps превръщат feedback в подредена product работа.",
    codeExample: "Phase 1: auth + mobile\nPhase 2: certificates + daily challenge",
    mission: "Write the next three roadmap items after Phase 2 for this project.",
    missionBg: "Напиши следващите три roadmap items след Phase 2 за този проект.",
    hint1: "Think AI tutor, payments and more quests.",
    hint1Bg: "Помисли за AI tutor, payments и още quests.",
    solution: "Phase 3: AI tutor + payments. Phase 4: team classrooms. Phase 5: mission authoring marketplace."
  },
  {
    id: "63",
    questId: "ai-product-builder",
    title: "Scale Mission",
    titleBg: "Мисия: Scale",
    explanation: "Scaling starts with clear data boundaries, caching rules and observability.",
    explanationBg: "Scaling започва с ясни data boundaries, caching rules и observability.",
    codeExample: "Logs: auth errors, progress writes, admin saves, deploy health",
    mission: "Identify the first three metrics you would monitor as this app grows.",
    missionBg: "Посочи първите три metrics, които бихе следил при растеж на app-а.",
    hint1: "Watch auth failures, lesson completion rate and API latency.",
    hint1Bg: "Следи auth failures, lesson completion rate и API latency.",
    solution: "signup success rate, lesson completion rate, p95 API response time."
  }
];
