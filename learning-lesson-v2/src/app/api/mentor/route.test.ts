import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const mockGetUser = vi.fn();
const mockFetchMentorUsage = vi.fn();
const mockReserveMentorHint = vi.fn();
const mockGetCatalogLesson = vi.fn();
const mockStreamMentorHint = vi.fn();
const mockToUIMessageStreamResponse = vi.fn();

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
  hasOpenAIEnv: vi.fn(() => true)
}));

vi.mock("@/lib/supabase/mentor-usage", () => ({
  fetchMentorUsage: (...args: unknown[]) => mockFetchMentorUsage(...args),
  reserveMentorHint: (...args: unknown[]) => mockReserveMentorHint(...args)
}));

vi.mock("@/lib/catalog", () => ({
  getCatalogLesson: (...args: unknown[]) => mockGetCatalogLesson(...args)
}));

vi.mock("@/lib/mentor/openai", () => ({
  streamMentorHint: (...args: unknown[]) => mockStreamMentorHint(...args)
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

function mentorRequest(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/mentor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonId: "1",
      language: "en",
      mode: "start",
      hintLevel: 1,
      effort: "",
      messages: [],
      ...overrides
    })
  });
}

describe("/api/mentor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "learner@test.local" } }
    });
    mockGetCatalogLesson.mockResolvedValue(lesson);
    mockFetchMentorUsage.mockResolvedValue({ count: 1, remaining: 4, limit: 5 });
    mockReserveMentorHint.mockResolvedValue({ ok: true, count: 2, remaining: 3, limit: 5 });
    mockToUIMessageStreamResponse.mockImplementation(
      (options?: { headers?: HeadersInit }) => new Response("mock-stream", { headers: options?.headers })
    );
    mockStreamMentorHint.mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse
    });
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

  it("POST rejects an unknown help mode before reserving quota", async () => {
    const response = await POST(mentorRequest({ mode: "give-answer" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_mentor_mode");
    expect(mockReserveMentorHint).not.toHaveBeenCalled();
  });

  it("POST requires a learner attempt for review mode", async () => {
    const response = await POST(mentorRequest({ mode: "review", effort: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("effort_required");
    expect(mockReserveMentorHint).not.toHaveBeenCalled();
  });

  it("POST rejects directions above level three", async () => {
    const response = await POST(mentorRequest({ hintLevel: 4 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_hint_level");
    expect(mockReserveMentorHint).not.toHaveBeenCalled();
  });

  it("POST returns 429 when the daily limit is reached", async () => {
    mockReserveMentorHint.mockResolvedValue({ ok: false, count: 5, remaining: 0, limit: 5 });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe("daily_limit_reached");
    expect(mockStreamMentorHint).not.toHaveBeenCalled();
  });

  it("POST streams a guarded direction and exposes remaining quota headers", async () => {
    const response = await POST(
      mentorRequest({
        mode: "review",
        hintLevel: 2,
        effort: "<header>My page</header>",
        messages: [
          {
            role: "assistant",
            parts: [{ type: "text", text: "Which semantic element could hold the main content?" }]
          }
        ]
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("mock-stream");
    expect(response.headers.get("X-Mentor-Remaining")).toBe("3");
    expect(mockReserveMentorHint).toHaveBeenCalledBefore(mockStreamMentorHint);

    const prompt = mockStreamMentorHint.mock.calls[0]?.[0] as { system: string; user: string };
    expect(prompt.system).toContain("Never provide the final answer");
    expect(prompt.user).toContain("Help mode: review");
    expect(prompt.user).toContain("Which semantic element could hold the main content?");
  });

  it("POST keeps the reserved quota when mentor setup fails synchronously", async () => {
    mockStreamMentorHint.mockImplementation(() => {
      throw new Error("OpenAI setup failed");
    });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("mentor_failed");
    expect(mockReserveMentorHint).toHaveBeenCalledOnce();
  });
});
