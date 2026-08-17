export type GradebookColumnKind = "assignment" | "assessment";

export type GradebookCellTone = "ok" | "warn" | "missing" | "neutral";

export type GradebookColumn = {
  id: string;
  kind: GradebookColumnKind;
  label: string;
  href: string;
};

export type GradebookCell = {
  label: string;
  tone: GradebookCellTone;
};

export type GradebookStudentRow = {
  studentId: string;
  name: string;
  xp: number;
  completedLessons: number;
  cells: Record<string, GradebookCell>;
};

export type ClassroomGradebook = {
  columns: GradebookColumn[];
  rows: GradebookStudentRow[];
};

export type GradebookStatusLabels = {
  missing: string;
  draft: string;
  submitted: string;
  approved: string;
  needsChanges: string;
};
