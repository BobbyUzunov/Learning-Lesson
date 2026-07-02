import { describe, expect, it } from "vitest";
import { gameLessons, gameQuests } from "../game-data";
import { getFallbackCatalog } from "./fallback";
import {
  getFirstLesson,
  getGlobalNextLesson,
  getLessonFromCatalog,
  getQuestForLesson,
  isLessonUnlocked,
  mapRowsToCatalog
} from "./helpers";
import { buildCatalogSeedPayload } from "./seed-payload";

describe("catalog", () => {
  it("builds fallback catalog with all courses and lessons", () => {
    const catalog = getFallbackCatalog();

    expect(catalog.source).toBe("fallback");
    expect(catalog.courses).toHaveLength(gameQuests.length);
    expect(catalog.lessons).toHaveLength(gameLessons.length);
    expect(catalog.courses[0]?.lessonIds.length).toBeGreaterThan(0);
  });

  it("seeds 63 lessons across 6 courses", () => {
    const payload = buildCatalogSeedPayload();

    expect(payload.courses).toHaveLength(6);
    expect(payload.lessons).toHaveLength(63);
    expect(payload.metadataRows).toHaveLength(63);
  });

  it("maps database rows back into quest lesson order", () => {
    const payload = buildCatalogSeedPayload();
    const catalog = mapRowsToCatalog(payload.courses, payload.lessons, payload.metadataRows);
    const aiProductBuilder = catalog.courses.find((course) => course.id === "ai-product-builder");

    expect(catalog.source).toBe("db");
    expect(aiProductBuilder?.lessonIds[0]).toBe("7");
    expect(getFirstLesson(catalog)?.id).toBe("1");
    expect(getQuestForLesson(catalog, "14")?.id).toBe("backend");
  });

  it("keeps unlock rules aligned with course order", () => {
    const catalog = getFallbackCatalog();

    expect(isLessonUnlocked(catalog, "1", [])).toBe(true);
    expect(isLessonUnlocked(catalog, "2", [])).toBe(false);
    expect(isLessonUnlocked(catalog, "2", ["1"])).toBe(true);
    expect(getGlobalNextLesson(catalog, [])).toBe("1");
    expect(getGlobalNextLesson(catalog, ["1"])).toBe("2");
    expect(getLessonFromCatalog(catalog, "999")).toBeUndefined();
  });
});
