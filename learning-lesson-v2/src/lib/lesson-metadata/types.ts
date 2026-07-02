export type LessonMetadataFields = {
  learningObjectives?: string[];
  learningObjectivesBg?: string[];
  prerequisites?: string[];
  prerequisitesBg?: string[];
  keyConcepts?: string[];
  keyConceptsBg?: string[];
  readingTimeMinutes?: number;
};

export type LessonMetadataPatch = LessonMetadataFields & {
  id: string;
};
