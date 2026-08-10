import type { Language } from "../language";
import type { AssignmentStatus } from "../assignments/types";
import { getActiveGradeLevel, localizeCurriculumText } from "./helpers";
import type {
  CurriculumAccent,
  CurriculumIcon,
  CurriculumMission,
  CurriculumModule,
  SchoolCurriculum
} from "./types";

export type CurriculumExplorerMission = {
  id: string;
  moduleId: string;
  title: string;
  brief: string;
  deliverable: string;
  estimatedMinutes: number;
  assignmentId: string | null;
  assignmentStatus: AssignmentStatus | null;
  lab: {
    courseTitle: string;
    completedCount: number;
    totalCount: number;
    lessonIds: string[];
  } | null;
};

export type CurriculumExplorerMissionState = Pick<
  CurriculumExplorerMission,
  "assignmentId" | "assignmentStatus" | "lab"
>;

export type CurriculumExplorerModule = {
  id: string;
  title: string;
  description: string;
  learningOutcomes: string[];
  theoryHours: number | null;
  practiceHours: number | null;
  sourceUrl: string | null;
};

export type CurriculumExplorerGroup = {
  module: CurriculumExplorerModule;
  missions: CurriculumExplorerMission[];
};

export type CurriculumExplorerSpecialty = {
  id: string;
  professionCode: string;
  title: string;
  accent: CurriculumAccent;
  icon: CurriculumIcon;
  groups: CurriculumExplorerGroup[];
};

export type CurriculumExplorerData = {
  specialties: CurriculumExplorerSpecialty[];
  commonGroups: CurriculumExplorerGroup[];
};

export type CurriculumExplorerCopy = {
  allMissions: string;
  allMissionsHint: string;
  assignmentApproved: string;
  assignmentAssigned: string;
  assignmentNeedsChanges: string;
  assignmentSubmitted: string;
  browseAllMissions: string;
  changeDirection: string;
  chooseSpecialty: string;
  commonFoundation: string;
  commonSubjects: string;
  commonSubjectsHint: string;
  currentDirection: string;
  minutes: string;
  labAvailable: string;
  labCompleted: string;
  missionsLabel: string;
  officialDetails: string;
  officialDetailsHint: string;
  officialModules: string;
  officialPlan: string;
  openMission: string;
  pathsSubtitle: string;
  practice: string;
  professionCode: string;
  recommendedMission: string;
  seeMore: string;
  selectLabel: string;
  selectedLabel: string;
  showLess: string;
  sourceLabel: string;
  theory: string;
  viewSource: string;
  whatYouWillDo: string;
  whatYouWillSubmit: string;
};

function mapMission(
  mission: CurriculumMission,
  language: Language,
  state?: CurriculumExplorerMissionState
): CurriculumExplorerMission {
  return {
    id: mission.id,
    moduleId: mission.moduleId,
    title: localizeCurriculumText(mission.title, language),
    brief: localizeCurriculumText(mission.brief, language),
    deliverable: localizeCurriculumText(mission.deliverable, language),
    estimatedMinutes: mission.estimatedMinutes,
    assignmentId: state?.assignmentId ?? null,
    assignmentStatus: state?.assignmentStatus ?? null,
    lab: state?.lab ?? null
  };
}

function mapModule(module: CurriculumModule, language: Language): CurriculumExplorerModule {
  return {
    id: module.id,
    title: localizeCurriculumText(module.title, language),
    description: localizeCurriculumText(module.description, language),
    learningOutcomes: module.learningOutcomes.map((outcome) => localizeCurriculumText(outcome, language)),
    theoryHours: module.theoryHours,
    practiceHours: module.practiceHours,
    sourceUrl: module.sourceUrl
  };
}

export function buildCurriculumExplorerData(
  curriculum: SchoolCurriculum,
  language: Language,
  missionStates: Record<string, CurriculumExplorerMissionState> = {}
): CurriculumExplorerData {
  const activeGrade = getActiveGradeLevel(curriculum);
  const missionsByModule = new Map<string, CurriculumExplorerMission[]>();

  for (const mission of curriculum.missions) {
    const list = missionsByModule.get(mission.moduleId) ?? [];
    list.push(mapMission(mission, language, missionStates[mission.id]));
    missionsByModule.set(mission.moduleId, list);
  }

  function groupsFor(modules: CurriculumModule[]) {
    return modules
      .filter((module) => module.gradeLevel === activeGrade)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((module) => ({
        module: mapModule(module, language),
        missions: missionsByModule.get(module.id) ?? []
      }))
      .filter((group) => group.missions.length > 0);
  }

  return {
    specialties: curriculum.specialties.map((specialty) => ({
      id: specialty.id,
      professionCode: specialty.professionCode,
      title: localizeCurriculumText(specialty.title, language),
      accent: specialty.accent,
      icon: specialty.icon,
      groups: groupsFor(curriculum.modules.filter((module) => module.specialtyId === specialty.id))
    })),
    commonGroups: groupsFor(curriculum.modules.filter((module) => module.specialtyId === null))
  };
}

function applyGuestProgressToMission(
  mission: CurriculumExplorerMission,
  completedLessonIds: Set<string>
): CurriculumExplorerMission {
  if (!mission.lab || mission.lab.lessonIds.length === 0) {
    return mission;
  }

  const completedCount = mission.lab.lessonIds.reduce(
    (count, lessonId) => count + Number(completedLessonIds.has(lessonId)),
    0
  );
  const totalCount = mission.lab.lessonIds.length;

  if (completedCount === mission.lab.completedCount && totalCount === mission.lab.totalCount) {
    return mission;
  }

  return {
    ...mission,
    lab: { ...mission.lab, completedCount, totalCount }
  };
}

export function applyGuestLessonProgress(
  data: CurriculumExplorerData,
  completedLessonIds: Iterable<string>
): CurriculumExplorerData {
  const completed = new Set(completedLessonIds);
  const mapGroups = (groups: CurriculumExplorerGroup[]) =>
    groups.map((group) => ({
      ...group,
      missions: group.missions.map((mission) => applyGuestProgressToMission(mission, completed))
    }));

  return {
    specialties: data.specialties.map((specialty) => ({
      ...specialty,
      groups: mapGroups(specialty.groups)
    })),
    commonGroups: mapGroups(data.commonGroups)
  };
}

export function pickCurriculumExplorerCopy(source: CurriculumExplorerCopy): CurriculumExplorerCopy {
  return {
    allMissions: source.allMissions,
    allMissionsHint: source.allMissionsHint,
    assignmentApproved: source.assignmentApproved,
    assignmentAssigned: source.assignmentAssigned,
    assignmentNeedsChanges: source.assignmentNeedsChanges,
    assignmentSubmitted: source.assignmentSubmitted,
    browseAllMissions: source.browseAllMissions,
    changeDirection: source.changeDirection,
    chooseSpecialty: source.chooseSpecialty,
    commonFoundation: source.commonFoundation,
    commonSubjects: source.commonSubjects,
    commonSubjectsHint: source.commonSubjectsHint,
    currentDirection: source.currentDirection,
    minutes: source.minutes,
    labAvailable: source.labAvailable,
    labCompleted: source.labCompleted,
    missionsLabel: source.missionsLabel,
    officialDetails: source.officialDetails,
    officialDetailsHint: source.officialDetailsHint,
    officialModules: source.officialModules,
    officialPlan: source.officialPlan,
    openMission: source.openMission,
    pathsSubtitle: source.pathsSubtitle,
    practice: source.practice,
    professionCode: source.professionCode,
    recommendedMission: source.recommendedMission,
    seeMore: source.seeMore,
    selectLabel: source.selectLabel,
    selectedLabel: source.selectedLabel,
    showLess: source.showLess,
    sourceLabel: source.sourceLabel,
    theory: source.theory,
    viewSource: source.viewSource,
    whatYouWillDo: source.whatYouWillDo,
    whatYouWillSubmit: source.whatYouWillSubmit
  };
}
