import { describe, expect, it } from "vitest";
import {
  buildMentorEffortForModel,
  MAX_MODEL_MENTOR_EFFORT,
  MAX_STORED_MENTOR_EFFORT
} from "./effort-excerpt";

describe("buildMentorEffortForModel", () => {
  it("passes through short effort unchanged", () => {
    const effort = "My short attempt";
    expect(buildMentorEffortForModel(effort)).toEqual({
      text: effort,
      excerpted: false,
      storedLength: effort.length
    });
  });

  it("builds a bounded first/last excerpt for long effort", () => {
    const effort = "a".repeat(1700);
    const result = buildMentorEffortForModel(effort);

    expect(result.excerpted).toBe(true);
    expect(result.storedLength).toBe(1700);
    expect(result.text.length).toBeLessThanOrEqual(MAX_MODEL_MENTOR_EFFORT);
    expect(result.text).toContain("omitted");
    expect(result.text.startsWith("a".repeat(100))).toBe(true);
    expect(result.text.endsWith("a".repeat(100))).toBe(true);
  });

  it("caps stored effort at the assignment-aligned limit", () => {
    const effort = "b".repeat(MAX_STORED_MENTOR_EFFORT + 500);
    const result = buildMentorEffortForModel(effort);
    expect(result.storedLength).toBe(MAX_STORED_MENTOR_EFFORT);
  });
});
