import type { CourseProject } from "./types";

export const fallbackCourseProjects: CourseProject[] = [
  {
    id: "aipb-product-brief",
    courseId: "ai-product-builder",
    afterLessonId: "7",
    type: "mini",
    title: "Mini Project: Product Brief",
    titleBg: "Mini project: Product brief",
    description:
      "Turn lesson 1 into a one-page brief for the AI learning feature you will build with Cursor, Supabase and Vercel.",
    descriptionBg:
      "Превърни урок 1 в one-page brief за AI learning функцията, която ще изградиш с Cursor, Supabase и Vercel.",
    briefLabel: "Your product brief",
    briefLabelBg: "Твоят product brief",
    briefPlaceholder: "User, problem, AI action, data to save, first deploy target...",
    briefPlaceholderBg: "User, проблем, AI action, данни за запис, първа deploy цел...",
    briefMinLength: 80,
    requiresRepo: false,
    requiresDeploy: false,
    requiredForCertificate: false,
    checklist: [
      { id: "user", label: "Define the target user", labelBg: "Дефинирай target user" },
      { id: "problem", label: "Describe the core problem", labelBg: "Опиши core проблема" },
      { id: "ai", label: "Explain the AI workflow step", labelBg: "Обясни AI workflow стъпката" },
      { id: "stack", label: "List Cursor, Supabase and Vercel roles", labelBg: "Изброй ролите на Cursor, Supabase и Vercel" }
    ]
  },
  {
    id: "aipb-live-deploy",
    courseId: "ai-product-builder",
    afterLessonId: "39",
    type: "mini",
    title: "Mini Project: Live Deploy",
    titleBg: "Mini project: Live deploy",
    description:
      "Deploy a small Next.js app to Vercel, connect Supabase env vars, and submit your live URLs as proof of work.",
    descriptionBg:
      "Deploy-ни малко Next.js app във Vercel, свържи Supabase env vars и submit-ни live URL-ите като proof of work.",
    briefLabel: "What did you deploy?",
    briefLabelBg: "Какво deploy-на?",
    briefPlaceholder: "Landing page, auth flow, progress API, or learning dashboard slice...",
    briefPlaceholderBg: "Landing page, auth flow, progress API или learning dashboard slice...",
    briefMinLength: 40,
    requiresRepo: true,
    requiresDeploy: true,
    requiredForCertificate: true,
    checklist: [
      { id: "repo", label: "Push code to GitHub", labelBg: "Качи код в GitHub" },
      { id: "vercel", label: "Connect Vercel and deploy", labelBg: "Свържи Vercel и deploy-ни" },
      { id: "env", label: "Add Supabase env vars in Vercel", labelBg: "Добави Supabase env vars във Vercel" },
      { id: "smoke", label: "Smoke-test register/login or lesson flow", labelBg: "Smoke-test register/login или lesson flow" }
    ]
  },
  {
    id: "aipb-capstone",
    courseId: "ai-product-builder",
    afterLessonId: "63",
    type: "capstone",
    title: "Capstone: Ship the Learning Platform",
    titleBg: "Capstone: Ship-ни learning platform-а",
    description:
      "Submit your full learning platform: auth, progress, DB-backed catalog, projects, admin CMS, and a live Vercel deploy ready for learners.",
    descriptionBg:
      "Submit-ни пълната learning platform: auth, progress, DB catalog, projects, admin CMS и live Vercel deploy, готов за learners.",
    briefLabel: "Capstone summary",
    briefLabelBg: "Capstone обобщение",
    briefPlaceholder:
      "What you built, who it serves, core flows shipped, Supabase tables used, and what you would improve next...",
    briefPlaceholderBg:
      "Какво изгради, за кого е, core flows, Supabase tables и какво би подобрил след deploy...",
    briefMinLength: 120,
    requiresRepo: true,
    requiresDeploy: true,
    requiredForCertificate: true,
    checklist: [
      { id: "auth", label: "Register/login and protected routes work", labelBg: "Register/login и protected routes работят" },
      { id: "progress", label: "Lesson progress saves and unlock rules work", labelBg: "Lesson progress и unlock rules работят" },
      { id: "catalog", label: "Courses and lessons load from Supabase", labelBg: "Courses и lessons идват от Supabase" },
      { id: "projects", label: "Mini projects and submissions are wired", labelBg: "Mini projects и submissions са свързани" },
      { id: "admin", label: "Admin CMS can edit content in DB", labelBg: "Admin CMS edit-ва content в DB" },
      { id: "deploy", label: "Production deploy is live on Vercel", labelBg: "Production deploy е live във Vercel" }
    ]
  }
];
