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

export type ProjectSubmissionStatus = "draft" | "submitted" | "approved" | "needs_changes";

export type ProjectSubmissionRecord = {
  project_id: string;
  repo_url: string | null;
  deploy_url: string | null;
  notes: string | null;
  submitted_at: string | null;
  status: ProjectSubmissionStatus;
  review_notes: string | null;
  reviewed_at: string | null;
};

export type AdminProjectSubmissionRecord = ProjectSubmissionRecord & {
  id: string;
  user_id: string;
  learner_email: string | null;
  learner_name: string | null;
};

export type CourseProjectsSource = "db" | "fallback";

export type CourseProjectsContent = {
  projects: CourseProject[];
  source: CourseProjectsSource;
};

export type CourseProjectRow = {
  id: string;
  course_id: string;
  after_lesson_id: string;
  type: string;
  title: string;
  title_bg: string | null;
  description: string;
  description_bg: string | null;
  brief_label: string;
  brief_label_bg: string | null;
  brief_placeholder: string;
  brief_placeholder_bg: string | null;
  brief_min_length: number;
  requires_repo: boolean;
  requires_deploy: boolean;
  required_for_certificate: boolean;
  checklist: ProjectChecklistItem[];
  sort_order: number;
};
