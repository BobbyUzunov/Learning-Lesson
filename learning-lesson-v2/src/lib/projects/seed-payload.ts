import { fallbackCourseProjects } from "./fallback-data";
import type { CourseProjectRow } from "./types";

export function buildProjectsSeedPayload() {
  const projects: CourseProjectRow[] = fallbackCourseProjects.map((project, index) => ({
    id: project.id,
    course_id: project.courseId,
    after_lesson_id: project.afterLessonId,
    type: project.type,
    title: project.title,
    title_bg: project.titleBg ?? null,
    description: project.description,
    description_bg: project.descriptionBg ?? null,
    brief_label: project.briefLabel,
    brief_label_bg: project.briefLabelBg ?? null,
    brief_placeholder: project.briefPlaceholder,
    brief_placeholder_bg: project.briefPlaceholderBg ?? null,
    brief_min_length: project.briefMinLength,
    requires_repo: project.requiresRepo,
    requires_deploy: project.requiresDeploy,
    required_for_certificate: project.requiredForCertificate,
    checklist: project.checklist,
    sort_order: index
  }));

  return { projects };
}
