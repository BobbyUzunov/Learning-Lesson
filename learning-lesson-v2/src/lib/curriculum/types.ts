export type CurriculumCatalogSource = "db" | "fallback";

export type CurriculumAccent = "violet" | "mint" | "coral" | "ink";
export type CurriculumIcon = "code" | "brain" | "palette" | "shield";
export type CurriculumModuleType = "foundation" | "sectoral" | "specialized";
export type CurriculumStatus = "pilot" | "planned";
export type GradeLevel = 8 | 9 | 10 | 11 | 12;

export type LocalizedText = {
  en: string;
  bg: string;
};

export type SchoolSpecialty = {
  id: string;
  professionCode: string;
  title: LocalizedText;
  description: LocalizedText;
  accent: CurriculumAccent;
  icon: CurriculumIcon;
  sourceUrl: string;
  sortOrder: number;
};

export type CurriculumModule = {
  id: string;
  specialtyId: string | null;
  gradeLevel: GradeLevel;
  type: CurriculumModuleType;
  status: CurriculumStatus;
  title: LocalizedText;
  description: LocalizedText;
  learningOutcomes: LocalizedText[];
  theoryHours: number | null;
  practiceHours: number | null;
  sourceUrl: string | null;
  sortOrder: number;
};

export type CurriculumMission = {
  id: string;
  moduleId: string;
  title: LocalizedText;
  brief: LocalizedText;
  deliverable: LocalizedText;
  skills: LocalizedText[];
  estimatedMinutes: number;
};

export type CurriculumCourseLink = {
  moduleId: string;
  courseId: string;
  sortOrder: number;
};

export type SchoolCurriculum = {
  specialties: SchoolSpecialty[];
  modules: CurriculumModule[];
  missions: CurriculumMission[];
  courseLinks: CurriculumCourseLink[];
  source: CurriculumCatalogSource;
};

export type SpecialtyRow = {
  id: string;
  profession_code: string;
  title: string;
  title_bg: string;
  description: string;
  description_bg: string;
  accent: CurriculumAccent;
  icon: CurriculumIcon;
  source_url: string;
  sort_order: number;
};

export type CurriculumModuleRow = {
  id: string;
  specialty_id: string | null;
  grade_level: GradeLevel;
  module_type: CurriculumModuleType;
  status: CurriculumStatus;
  title: string;
  title_bg: string;
  description: string;
  description_bg: string;
  learning_outcomes: string[];
  learning_outcomes_bg: string[];
  theory_hours: number | null;
  practice_hours: number | null;
  source_url: string | null;
  sort_order: number;
};

export type CurriculumMissionRow = {
  id: string;
  module_id: string;
  title: string;
  title_bg: string;
  brief: string;
  brief_bg: string;
  deliverable: string;
  deliverable_bg: string;
  skills: string[];
  skills_bg: string[];
  estimated_minutes: number;
};

export type CurriculumCourseLinkRow = {
  module_id: string;
  course_id: string;
  sort_order: number;
};
