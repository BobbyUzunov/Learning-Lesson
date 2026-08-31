import { describe, expect, it } from "vitest";
import { isPilotStudentGrade, PILOT_STUDENT_GRADE } from "./pilot";

describe("pilot student grade", () => {
  it("locks the platform to grade 8 during the pilot", () => {
    expect(PILOT_STUDENT_GRADE).toBe(8);
    expect(isPilotStudentGrade(8)).toBe(true);
    expect(isPilotStudentGrade(9)).toBe(false);
  });
});
