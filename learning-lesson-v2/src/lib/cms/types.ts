export type CourseUpdateInput = {
  title?: string;
  titleBg?: string;
  description?: string;
  descriptionBg?: string;
  difficulty?: string;
  difficultyBg?: string;
  estimatedTime?: string;
  estimatedTimeBg?: string;
  rewardBadge?: string;
  rewardBadgeBg?: string;
  xpReward?: number;
};

export type LessonUpdateInput = {
  title?: string;
  titleBg?: string;
  explanation?: string;
  explanationBg?: string;
  codeExample?: string;
  mission?: string;
  missionBg?: string;
  solution?: string;
  hint1?: string;
  hint1Bg?: string;
  hint2?: string;
  hint2Bg?: string;
  hint3?: string;
  hint3Bg?: string;
  learningObjectives?: string[];
  learningObjectivesBg?: string[];
  prerequisites?: string[];
  prerequisitesBg?: string[];
  keyConcepts?: string[];
  keyConceptsBg?: string[];
  readingTimeMinutes?: number | null;
};

export type ProjectUpdateInput = {
  afterLessonId?: string;
  type?: "mini" | "capstone";
  title?: string;
  titleBg?: string;
  description?: string;
  descriptionBg?: string;
  briefLabel?: string;
  briefLabelBg?: string;
  briefPlaceholder?: string;
  briefPlaceholderBg?: string;
  briefMinLength?: number;
  requiresRepo?: boolean;
  requiresDeploy?: boolean;
  requiredForCertificate?: boolean;
  checklist?: Array<{ id: string; label: string; labelBg?: string }>;
};

export type QuizUpdateInput = {
  topic?: string;
  question?: string;
  questionBg?: string;
  options?: string[];
  optionsBg?: string[];
  correctIndex?: number;
  explanation?: string;
  explanationBg?: string;
};
