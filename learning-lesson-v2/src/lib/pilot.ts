/** Pilot scope: student learning and classrooms are limited to grade 8 for now. */
export const PILOT_STUDENT_GRADE = 8;

export function isPilotStudentGrade(grade: number) {
  return grade === PILOT_STUDENT_GRADE;
}
