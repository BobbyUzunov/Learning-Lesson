import type { LessonMetadataPatch } from "./types";

const aiProductBuilderPatches: LessonMetadataPatch[] = [
  {
    id: "7",
    readingTimeMinutes: 12,
    learningObjectives: [
      "Write a one-page AI product brief.",
      "Define user, problem, AI action and persistence model.",
      "Choose a realistic first deploy target on Vercel."
    ],
    learningObjectivesBg: [
      "Пишеш AI product brief на една страница.",
      "Дефинираш user, проблем, AI action и persistence model.",
      "Избираш реалистична първа deploy цел във Vercel."
    ],
    prerequisites: ["None — entry point for the AI Product Builder course."],
    prerequisitesBg: ["Няма — входна точка за AI Product Builder курса."],
    keyConcepts: ["Product brief", "MVP", "User problem", "Stack"],
    keyConceptsBg: ["Product brief", "MVP", "User проблем", "Stack"]
  },
  {
    id: "37",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Write effective Cursor task prompts with file context.",
      "Break features into reviewable implementation steps.",
      "Include bilingual content and unlock order in AI tasks."
    ],
    learningObjectivesBg: [
      "Пишеш ефективни Cursor prompts с file context.",
      "Разбиваш features на reviewable implementation стъпки.",
      "Включваш двуезично съдържание и unlock order в AI tasks."
    ],
    prerequisites: ["Completed Lesson 1: AI Product Brief."],
    prerequisitesBg: ["Завършен Урок 1: AI product brief."],
    keyConcepts: ["Cursor", "Prompting", "Context", "Iteration"],
    keyConceptsBg: ["Cursor", "Prompting", "Context", "Iteration"]
  },
  {
    id: "38",
    readingTimeMinutes: 11,
    learningObjectives: [
      "Map core Supabase tables for a learning product.",
      "Understand profiles, progress and content override tables.",
      "Plan idempotent SQL migrations."
    ],
    learningObjectivesBg: [
      "Картографираш core Supabase таблици за learning продукт.",
      "Разбираш profiles, progress и content override таблици.",
      "Планираш idempotent SQL migrations."
    ],
    prerequisites: ["Completed Lesson 2: Cursor Workflow."],
    prerequisitesBg: ["Завършен Урок 2: Cursor workflow."],
    keyConcepts: ["Supabase", "Schema", "RLS", "Migrations"],
    keyConceptsBg: ["Supabase", "Schema", "RLS", "Migrations"]
  },
  {
    id: "39",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Build a minimum deploy checklist for Vercel.",
      "Configure environment variables for Supabase.",
      "Smoke-test auth and lesson completion in production."
    ],
    learningObjectivesBg: [
      "Изграждаш минимален deploy checklist за Vercel.",
      "Конфигурираш environment variables за Supabase.",
      "Smoke-test-ваш auth и lesson completion в production."
    ],
    prerequisites: ["Completed Lesson 3: Supabase Schema."],
    prerequisitesBg: ["Завършен Урок 3: Supabase schema."],
    keyConcepts: ["Vercel", "Deploy", "Env vars", "Smoke test"],
    keyConceptsBg: ["Vercel", "Deploy", "Env vars", "Smoke test"]
  },
  {
    id: "40",
    readingTimeMinutes: 9,
    learningObjectives: [
      "Define a personal build loop: code → test → deploy → feedback.",
      "Ship small slices instead of large unreleased batches.",
      "Use production as a learning feedback surface."
    ],
    learningObjectivesBg: [
      "Дефинираш личен build loop: code → test → deploy → feedback.",
      "Ship-ваш малки парчета вместо големи неreleased batches.",
      "Ползваш production като learning feedback surface."
    ],
    prerequisites: ["Completed Lesson 4: Vercel Deploy."],
    prerequisitesBg: ["Завършен Урок 4: Vercel deploy."],
    keyConcepts: ["Iteration", "Feedback loop", "Shipping", "MVP"],
    keyConceptsBg: ["Iteration", "Feedback loop", "Shipping", "MVP"]
  },
  {
    id: "41",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Identify real learner friction points in your product.",
      "Connect UX issues to schema, auth or deploy root causes.",
      "Document fixes as repeatable playbooks."
    ],
    learningObjectivesBg: [
      "Идентифицираш реални friction точки при learners.",
      "Свързваш UX проблеми със schema, auth или deploy root causes.",
      "Документираш fixes като repeatable playbooks."
    ],
    prerequisites: ["Completed Lesson 5: Iteration Loop."],
    prerequisitesBg: ["Завършен Урок 5: Iteration loop."],
    keyConcepts: ["User feedback", "Friction", "Debugging", "UX"],
    keyConceptsBg: ["User feedback", "Friction", "Debugging", "UX"]
  },
  {
    id: "42",
    readingTimeMinutes: 11,
    learningObjectives: [
      "Create a launch checklist for an MVP learning platform.",
      "Verify auth, progress, content, admin and mobile readiness.",
      "Prioritize what blocks real users vs nice-to-haves."
    ],
    learningObjectivesBg: [
      "Създаваш launch checklist за MVP learning platform.",
      "Проверяваш auth, progress, content, admin и mobile readiness.",
      "Приоритизираш какво блокира реални users vs nice-to-haves."
    ],
    prerequisites: ["Completed Lesson 6: User Feedback."],
    prerequisitesBg: ["Завършен Урок 6: User feedback."],
    keyConcepts: ["Launch checklist", "MVP", "Readiness", "QA"],
    keyConceptsBg: ["Launch checklist", "MVP", "Readiness", "QA"]
  },
  {
    id: "52",
    readingTimeMinutes: 9,
    learningObjectives: [
      "Design reusable AI prompts with structured JSON output.",
      "Keep prompt templates versioned and testable.",
      "Align AI output fields with UI rendering needs."
    ],
    learningObjectivesBg: [
      "Проектираш reusable AI prompts със structured JSON output.",
      "Държиш prompt templates versioned и testable.",
      "Синхронизираш AI output fields с UI rendering needs."
    ],
    prerequisites: ["Completed Module 1 foundation lessons (7–42)."],
    prerequisitesBg: ["Завършени foundation уроците от модул 1 (7–42)."],
    keyConcepts: ["Prompt library", "JSON output", "Reusability"],
    keyConceptsBg: ["Prompt library", "JSON output", "Reusability"]
  },
  {
    id: "53",
    readingTimeMinutes: 8,
    learningObjectives: [
      "Use feature flags for safe rollouts.",
      "Identify features that should ship behind env toggles.",
      "Reduce production risk during experiments."
    ],
    learningObjectivesBg: [
      "Ползваш feature flags за безопасни rollouts.",
      "Идентифицираш features, които трябва да ship-ват зад env toggles.",
      "Намаляваш production risk по време на experiments."
    ],
    prerequisites: ["Completed Lesson: Prompt Library."],
    prerequisitesBg: ["Завършен урок: Prompt library."],
    keyConcepts: ["Feature flags", "Rollout", "Env config"],
    keyConceptsBg: ["Feature flags", "Rollout", "Env config"]
  },
  {
    id: "54",
    readingTimeMinutes: 9,
    learningObjectives: [
      "Define a learning funnel analytics model.",
      "Track lesson start, completion and return events.",
      "Use data to improve retention, not vanity metrics."
    ],
    learningObjectivesBg: [
      "Дефинираш learning funnel analytics model.",
      "Следиш lesson start, completion и return events.",
      "Ползваш data за retention, не vanity metrics."
    ],
    prerequisites: ["Completed Lesson: Feature Flags."],
    prerequisitesBg: ["Завършен урок: Feature flags."],
    keyConcepts: ["Analytics", "Funnel", "Retention", "Events"],
    keyConceptsBg: ["Analytics", "Funnel", "Retention", "Events"]
  },
  {
    id: "55",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Sketch a free vs pro value ladder.",
      "Keep acquisition free while defining upgrade path.",
      "Align monetization with learner outcomes."
    ],
    learningObjectivesBg: [
      "Скицираш free vs pro value ladder.",
      "Държиш acquisition free, но дефинираш upgrade path.",
      "Синхронизираш monetization с learner outcomes."
    ],
    prerequisites: ["Completed Lesson: Analytics."],
    prerequisitesBg: ["Завършен урок: Analytics."],
    keyConcepts: ["Monetization", "Value ladder", "Free tier"],
    keyConceptsBg: ["Monetization", "Value ladder", "Free tier"]
  },
  {
    id: "56",
    readingTimeMinutes: 8,
    learningObjectives: [
      "Design a sub-5-minute first win onboarding path.",
      "Use guest-first flow before registration.",
      "Reduce steps between landing and first completion."
    ],
    learningObjectivesBg: [
      "Проектираш onboarding path с първа победа под 5 минути.",
      "Ползваш guest-first flow преди registration.",
      "Намаляваш стъпките между landing и първо completion."
    ],
    prerequisites: ["Completed Lesson: Monetization."],
    prerequisitesBg: ["Завършен урок: Monetization."],
    keyConcepts: ["Onboarding", "Activation", "Guest flow"],
    keyConceptsBg: ["Onboarding", "Activation", "Guest flow"]
  },
  {
    id: "57",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Audit lesson content for beginner clarity.",
      "Apply one-concept-per-lesson content strategy.",
      "Improve mission text, hints and examples systematically."
    ],
    learningObjectivesBg: [
      "Правиш audit на lesson content за beginner clarity.",
      "Прилагаш one-concept-per-lesson content strategy.",
      "Подобряваш mission text, hints и examples систематично."
    ],
    prerequisites: ["Completed Lesson: Onboarding."],
    prerequisitesBg: ["Завършен урок: Onboarding."],
    keyConcepts: ["Content strategy", "Clarity", "Lesson design"],
    keyConceptsBg: ["Content strategy", "Clarity", "Lesson design"]
  },
  {
    id: "58",
    readingTimeMinutes: 9,
    learningObjectives: [
      "Improve SEO metadata for courses and lessons.",
      "Use meaningful titles and localized descriptions.",
      "Plan crawlable public structure for acquisition."
    ],
    learningObjectivesBg: [
      "Подобряваш SEO metadata за courses и lessons.",
      "Ползваш смислени titles и localized descriptions.",
      "Планираш crawlable public structure за acquisition."
    ],
    prerequisites: ["Completed Lesson: Content Strategy."],
    prerequisitesBg: ["Завършен урок: Content strategy."],
    keyConcepts: ["SEO", "Metadata", "Discovery"],
    keyConceptsBg: ["SEO", "Metadata", "Discovery"]
  },
  {
    id: "59",
    readingTimeMinutes: 9,
    learningObjectives: [
      "Choose dynamic vs static rendering per page type.",
      "Protect learner flow with fast page loads.",
      "Avoid unnecessary force-dynamic usage."
    ],
    learningObjectivesBg: [
      "Избираш dynamic vs static rendering по page type.",
      "Пазиш learner flow с бързи page loads.",
      "Избягваш ненужен force-dynamic."
    ],
    prerequisites: ["Completed Lesson: SEO."],
    prerequisitesBg: ["Завършен урок: SEO."],
    keyConcepts: ["Performance", "Rendering", "Caching"],
    keyConceptsBg: ["Performance", "Rendering", "Caching"]
  },
  {
    id: "60",
    readingTimeMinutes: 8,
    learningObjectives: [
      "Recognize accessibility wins in the current UI.",
      "Apply keyboard and screen reader friendly patterns.",
      "Audit focus states and semantic controls."
    ],
    learningObjectivesBg: [
      "Разпознаваш accessibility победи в текущия UI.",
      "Прилагаш keyboard и screen reader friendly patterns.",
      "Правиш audit на focus states и semantic controls."
    ],
    prerequisites: ["Completed Lesson: Performance."],
    prerequisitesBg: ["Завършен урок: Performance."],
    keyConcepts: ["Accessibility", "a11y", "Semantics"],
    keyConceptsBg: ["Accessibility", "a11y", "Semantics"]
  },
  {
    id: "61",
    readingTimeMinutes: 8,
    learningObjectives: [
      "Design shareable moments after course completion.",
      "Use certificates as social proof loops.",
      "Increase motivation without gamification overload."
    ],
    learningObjectivesBg: [
      "Проектираш shareable moments след course completion.",
      "Ползваш certificates като social proof loops.",
      "Увеличаваш motivation без gamification overload."
    ],
    prerequisites: ["Completed Lesson: Accessibility."],
    prerequisitesBg: ["Завършен урок: Accessibility."],
    keyConcepts: ["Community", "Certificates", "Sharing"],
    keyConceptsBg: ["Community", "Certificates", "Sharing"]
  },
  {
    id: "62",
    readingTimeMinutes: 10,
    learningObjectives: [
      "Turn feedback into a sequenced product roadmap.",
      "Prioritize projects, CMS and AI mentor phases.",
      "Communicate roadmap by learner value, not tech tasks."
    ],
    learningObjectivesBg: [
      "Превръщаш feedback в подреден product roadmap.",
      "Приоритизираш projects, CMS и AI mentor phases.",
      "Комunicираш roadmap по learner value, не tech tasks."
    ],
    prerequisites: ["Completed Lesson: Community."],
    prerequisitesBg: ["Завършен урок: Community."],
    keyConcepts: ["Roadmap", "Prioritization", "Product planning"],
    keyConceptsBg: ["Roadmap", "Prioritization", "Product planning"]
  },
  {
    id: "63",
    readingTimeMinutes: 11,
    learningObjectives: [
      "Identify first metrics for a growing learning platform.",
      "Plan observability for auth, progress and API latency.",
      "Design for maintainability at scale."
    ],
    learningObjectivesBg: [
      "Идентифицираш първите metrics за растяща learning platform.",
      "Планираш observability за auth, progress и API latency.",
      "Проектираш за maintainability at scale."
    ],
    prerequisites: ["Completed Lesson: Roadmap."],
    prerequisitesBg: ["Завършен урок: Roadmap."],
    keyConcepts: ["Scale", "Observability", "Metrics"],
    keyConceptsBg: ["Scale", "Observability", "Metrics"]
  }
];

export const lessonMetadataPatches: Record<string, LessonMetadataPatch> = Object.fromEntries(
  aiProductBuilderPatches.map((patch) => [patch.id, patch])
);
