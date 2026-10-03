import { describe, expect, it } from "vitest";
import { resolveMissionId } from "./assign-mission-form";

describe("resolveMissionId", () => {
  const missions = [{ id: "m1" }, { id: "m2" }];

  it("keeps the current id while it is still available", () => {
    expect(resolveMissionId(missions, "m2")).toBe("m2");
  });

  it("falls back to the first mission when the current one was removed", () => {
    expect(resolveMissionId([{ id: "m2" }], "m1")).toBe("m2");
  });

  it("selects the first mission when nothing is selected", () => {
    expect(resolveMissionId(missions, "")).toBe("m1");
  });

  it("returns an empty id when no missions remain", () => {
    expect(resolveMissionId([], "m1")).toBe("");
  });
});
