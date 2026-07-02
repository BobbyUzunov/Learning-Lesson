export type ProjectType = "mini" | "capstone";

export type ProjectChecklistItem = {
  id: string;
  label: string;
  labelBg?: string;
};

export type CourseProject = {
  id: string;
  courseId: string;
  afterLessonId: string;
  type: ProjectType;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  briefLabel: string;
  briefLabelBg?: string;
  briefPlaceholder: string;
  briefPlaceholderBg?: string;
  briefMinLength: number;
  requiresRepo: boolean;
  requiresDeploy: boolean;
  checklist: ProjectChecklistItem[];
  requiredForCertificate: boolean;
};

export const courseProjects: CourseProject[] = [
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
    briefPlaceholder:
      "User, problem, AI action, data to save, first deploy target...",
    briefPlaceholderBg:
      "User, проблем, AI action, данни за запис, първа deploy цел...",
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
  }
];

export type ProjectSubmissionRecord = {
  project_id: string;
  repo_url: string | null;
  deploy_url: string | null;
  notes: string | null;
  submitted_at: string | null;
};

export function getProjectById(projectId: string) {
  return courseProjects.find((project) => project.id === projectId);
}

export function getProjectsForCourse(courseId: string) {
  return courseProjects.filter((project) => project.courseId === courseId);
}

export function getRequiredCertificateProjects(courseId: string) {
  return courseProjects.filter((project) => project.courseId === courseId && project.requiredForCertificate);
}

export function isProjectUnlocked(project: CourseProject, completedLessonIds: Iterable<string>) {
  const completed = new Set(completedLessonIds);
  return completed.has(project.afterLessonId);
}

export function isProjectSubmitted(projectId: string, submissions: Iterable<string>) {
  return new Set(submissions).has(projectId);
}

export function localizeProject(project: CourseProject, language: "bg" | "en"): CourseProject {
  if (language === "en") {
    return project;
  }

  return {
    ...project,
    title: project.titleBg ?? project.title,
    description: project.descriptionBg ?? project.description,
    briefLabel: project.briefLabelBg ?? project.briefLabel,
    briefPlaceholder: project.briefPlaceholderBg ?? project.briefPlaceholder,
    checklist: project.checklist.map((item) => ({
      ...item,
      label: item.labelBg ?? item.label
    }))
  };
}

export function getPendingProjectForCourse(
  courseId: string,
  completedLessonIds: Iterable<string>,
  submittedProjectIds: Iterable<string>
) {
  const completed = new Set(completedLessonIds);
  const submitted = new Set(submittedProjectIds);

  return getProjectsForCourse(courseId).find(
    (project) => isProjectUnlocked(project, completed) && !submitted.has(project.id)
  );
}

export function getNextPendingProject(completedLessonIds: Iterable<string>, submittedProjectIds: Iterable<string>) {
  for (const project of courseProjects) {
    if (isProjectUnlocked(project, completedLessonIds) && !isProjectSubmitted(project.id, submittedProjectIds)) {
      return project;
    }
  }

  return null;
}

export function courseCertificateRequirementsMet(
  courseId: string,
  completedLessonIds: Iterable<string>,
  submittedProjectIds: Iterable<string>
) {
  const required = getRequiredCertificateProjects(courseId);
  if (required.length === 0) {
    return true;
  }

  return required.every((project) => isProjectSubmitted(project.id, submittedProjectIds));
}

export function validateProjectSubmissionInput(
  project: CourseProject,
  input: { notes?: string; repoUrl?: string; deployUrl?: string }
) {
  const notes = input.notes?.trim() ?? "";
  const repoUrl = input.repoUrl?.trim() ?? "";
  const deployUrl = input.deployUrl?.trim() ?? "";

  if (notes.length < project.briefMinLength) {
    return { ok: false as const, error: "brief_too_short" };
  }

  if (project.requiresRepo && !repoUrl) {
    return { ok: false as const, error: "repo_required" };
  }

  if (project.requiresDeploy && !deployUrl) {
    return { ok: false as const, error: "deploy_required" };
  }

  if (repoUrl && !/^https?:\/\//i.test(repoUrl)) {
    return { ok: false as const, error: "invalid_repo_url" };
  }

  if (deployUrl && !/^https?:\/\//i.test(deployUrl)) {
    return { ok: false as const, error: "invalid_deploy_url" };
  }

  return {
    ok: true as const,
    value: { notes, repoUrl: repoUrl || null, deployUrl: deployUrl || null }
  };
}
