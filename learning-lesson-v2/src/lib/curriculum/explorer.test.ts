import { describe, expect, it } from "vitest";
import { fallbackSchoolCurriculum } from "./data";
import { buildCurriculumExplorerData } from "./explorer";
import { getActiveGradeLevel } from "./helpers";

describe("curriculum explorer payload", () => {
  it("localizes once on the server and strips unused bilingual fields", () => {
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "bg");
    const firstSource = fallbackSchoolCurriculum.specialties[0];
    const firstResult = data.specialties[0];
    const serialized = JSON.stringify(data);

    expect(firstResult.title).toBe(firstSource.title.bg);
    expect(serialized).not.toContain('"bg":');
    expect(serialized).not.toContain('"en":');
    expect(serialized).not.toContain('"skills"');
    expect(serialized).not.toContain('"sortOrder"');
  });

  it("contains only modules from the active grade", () => {
    const activeGrade = getActiveGradeLevel(fallbackSchoolCurriculum);
    const expectedIds = new Set(
      fallbackSchoolCurriculum.modules
        .filter((module) => module.gradeLevel === activeGrade)
        .map((module) => module.id)
    );
    const data = buildCurriculumExplorerData(fallbackSchoolCurriculum, "en");
    const actualIds = [
      ...data.commonGroups,
      ...data.specialties.flatMap((specialty) => specialty.groups)
    ].map((group) => group.module.id);

    expect(new Set(actualIds)).toEqual(expectedIds);
  });

  it("is materially smaller than the full curriculum payload", () => {
    const fullSize = JSON.stringify(fallbackSchoolCurriculum).length;
    const explorerSize = JSON.stringify(buildCurriculumExplorerData(fallbackSchoolCurriculum, "bg")).length;

    expect(explorerSize).toBeLessThan(fullSize * 0.7);
  });
});
