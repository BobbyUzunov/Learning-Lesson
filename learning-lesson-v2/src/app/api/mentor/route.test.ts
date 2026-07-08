import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const mockGetUser = vi.fn();
const mockFetchMentorUsage = vi.fn();
const mockReserveMentorHint = vi.fn();
const mockReleaseMentorHint = vi.fn();
const mockGetCatalogLesson = vi.fn();
const mockRequestMentorHint = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser
    }
  }))
}));

vi.mock("@/lib/supabase/env", () => ({
  hasSupabaseEnv: vi.fn(() => true)
}));

vi.mock("@/lib/mentor/env", () => ({
  hasOpenAIEnv: vi.fn(() => true),
  getOpenAIConfig: vi.fn(() => ({
    apiKey: "test-key",
    model: "gpt-4o-mini",
    dailyLimit: 5
  }))
}));

vi.mock("@/lib/supabase/mentor-usage", () => ({
  fetchMentorUsage: (...args: unknown[]) => mockFetchMentorUsage(...args),
  reserveMentorHint: (...args: unknown[]) => mockReserveMentorHint(...args),
  releaseMentorHint: (...args: unknown[]) => mockReleaseMentorHint(...args)
}));

vi.mock("@/lib/catalog", () => ({
  getCatalogLesson: (...args: unknown[]) => mockGetCatalogLesson(...args)
}));

vi.mock("@/lib/mentor/openai", () => ({
  requestMentorHint: (...args: unknown[]) => mockRequestMentorHint(...args)
}));

const lesson = {
  id: "1",
  title: "Lesson 1",
  explanation: "HTML basics",
  mission: "Build a page",
  codeExample: "<main></main>",
  learningObjectives: ["HTML"],
  keyConcepts: ["structure"]
};

describe("/api/mentor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "learner@test.local" } }
    });
    mockGetCatalogLesson.mockResolvedValue(lesson);
    mockFetchMentorUsage.mockResolvedValue({ count: 1, remaining: 4, limit: 5 });
    mockReserveMentorHint.mockResolvedValue({ ok: true, count: 2, remaining: 3, limit: 5 });
    mockReleaseMentorHint.mockResolvedValue(undefined);
    mockRequestMentorHint.mockResolvedValue("Start with semantic layout sections.");
  });

  it("GET returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("not_authenticated");
  });

  it("GET returns mentor usage for authenticated users", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ remaining: 4, limit: 5, count: 1 });
    expect(mockFetchMentorUsage).toHaveBeenCalledOnce();
  });

  it("POST returns 400 when question is too short", async () => {
    const response = await POST(
      new Request("http://localhost/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: "1",
          question: "short",
          language: "en"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("question_too_short");
    expect(mockReserveMentorHint).not.toHaveBeenCalled();
  });

  it("POST returns 429 when daily limit is reached", async () => {
    mockReserveMentorHint.mockResolvedValue({ ok: false, count: 5, remaining: 0, limit: 5 });

    const response = await POST(
      new Request("http://localhost/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: "1",
          question: "How should I structure the page sections?",
          language: "en"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe("daily_limit_reached");
    expect(mockRequestMentorHint).not.toHaveBeenCalled();
  });

  it("POST returns mentor hint on success", async () => {
    const response = await POST(
      new Request("http://localhost/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: "1",
          question: "How should I structure the page sections?",
          language: "en"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.hint).toBe("Start with semantic layout sections.");
    expect(body.remaining).toBe(3);
    expect(mockReserveMentorHint).toHaveBeenCalledBefore(mockRequestMentorHint);
  });

  it("POST releases mentor quota when OpenAI fails", async () => {
    mockRequestMentorHint.mockRejectedValue(new Error("OpenAI request failed"));

    const response = await POST(
      new Request("http://localhost/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: "1",
          question: "How should I structure the page sections?",
          language: "en"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("mentor_failed");
    expect(mockReleaseMentorHint).toHaveBeenCalledOnce();
  });
});
