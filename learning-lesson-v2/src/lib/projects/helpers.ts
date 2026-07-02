import type { CourseProject, CourseProjectRow, ProjectType } from "./types";

export function mapProjectRows(rows: CourseProjectRow[]): CourseProject[] {
  return rows
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => ({
      id: row.id,
      courseId: row.course_id,
      afterLessonId: row.after_lesson_id,
      type: row.type as ProjectType,
      title: row.title,
      titleBg: row.title_bg ?? undefined,
      description: row.description,
      descriptionBg: row.description_bg ?? undefined,
      briefLabel: row.brief_label,
      briefLabelBg: row.brief_label_bg ?? undefined,
      briefPlaceholder: row.brief_placeholder,
      briefPlaceholderBg: row.brief_placeholder_bg ?? undefined,
      briefMinLength: row.brief_min_length,
      requiresRepo: row.requires_repo,
      requiresDeploy: row.requires_deploy,
      checklist: row.checklist,
      requiredForCertificate: row.required_for_certificate
    }));
}

export function getProjectById(projects: CourseProject[], projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getProjectsForCourse(projects: CourseProject[], courseId: string) {
  return projects.filter((project) => project.courseId === courseId);
}

export function getRequiredCertificateProjects(projects: CourseProject[], courseId: string) {
  return projects.filter((project) => project.courseId === courseId && project.requiredForCertificate);
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
  projects: CourseProject[],
  courseId: string,
  completedLessonIds: Iterable<string>,
  submittedProjectIds: Iterable<string>
) {
  const completed = new Set(completedLessonIds);
  const submitted = new Set(submittedProjectIds);

  return getProjectsForCourse(projects, courseId).find(
    (project) => isProjectUnlocked(project, completed) && !submitted.has(project.id)
  );
}

export function getNextPendingProject(
  projects: CourseProject[],
  completedLessonIds: Iterable<string>,
  submittedProjectIds: Iterable<string>
) {
  for (const project of projects) {
    if (isProjectUnlocked(project, completedLessonIds) && !isProjectSubmitted(project.id, submittedProjectIds)) {
      return project;
    }
  }

  return null;
}

export function courseCertificateRequirementsMet(
  projects: CourseProject[],
  courseId: string,
  completedLessonIds: Iterable<string>,
  submittedProjectIds: Iterable<string>
) {
  const required = getRequiredCertificateProjects(projects, courseId);
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
