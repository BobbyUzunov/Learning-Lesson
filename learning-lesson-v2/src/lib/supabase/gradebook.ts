import { t, type Language } from "@/lib/i18n";
import { getClassroomAssessments, getAssessmentReport } from "./assessments";
import { getClassroomAssignments, getAssignmentReport } from "./assignments";
import { getClassroomReport } from "./classrooms";
import { buildClassroomGradebook } from "@/lib/gradebook/build-classroom-gradebook";
import type { ClassroomGradebook } from "@/lib/gradebook/types";

export async function getClassroomGradebook(
  classroomId: string,
  language: Language
): Promise<ClassroomGradebook> {
  const copy = t(language).teacher;
  const [students, assignments, assessments] = await Promise.all([
    getClassroomReport(classroomId),
    getClassroomAssignments(classroomId),
    getClassroomAssessments(classroomId)
  ]);

  const [assignmentReportEntries, assessmentReportEntries] = await Promise.all([
    Promise.all(
      assignments.map(async (assignment) => [assignment.id, await getAssignmentReport(assignment.id)] as const)
    ),
    Promise.all(
      assessments.map(async (assessment) => [assessment.id, await getAssessmentReport(assessment.id)] as const)
    )
  ]);

  return buildClassroomGradebook({
    classroomId,
    students,
    assignments,
    assessments,
    assignmentReports: Object.fromEntries(assignmentReportEntries),
    assessmentReports: Object.fromEntries(assessmentReportEntries),
    language,
    labels: {
      missing: copy.statusMissing,
      draft: copy.statusDraft,
      submitted: copy.statusSubmitted,
      approved: copy.statusApproved,
      needsChanges: copy.statusNeedsChanges
    }
  });
}
