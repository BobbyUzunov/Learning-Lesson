import { describe, expect, it } from "vitest";
import { deriveDisplayName } from "./profile";

describe("deriveDisplayName", () => {
  it("prefers display_name from user metadata", () => {
    const name = deriveDisplayName({
      email: "bobby@example.com",
      user_metadata: { display_name: "Bobby" }
    });

    expect(name).toBe("Bobby");
  });

  it("falls back to the email local part", () => {
    const name = deriveDisplayName({
      email: "learner@example.com",
      user_metadata: {}
    });

    expect(name).toBe("learner");
  });
});
