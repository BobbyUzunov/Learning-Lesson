import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const mockGetCurrentSession = vi.fn();
const mockGetE2eAuthState = vi.fn();
const mockGetAssignmentById = vi.fn();
const mockGetMySubmissionForAssignment = vi.fn();
const mockGetMyClassroomIds = vi.fn();
const mockFetchMentorUsage = vi.fn();
const mockReserveMentorHint = vi.fn();
const mockFetchMentorHintHistory = vi.fn();
const mockReserveAssignmentMentorSlot = vi.fn();
const mockFinalizeAssignmentMentorHint = vi.fn();
const mockFailAssignmentMentorHint = vi.fn();
const mockStreamMentorHint = vi.fn();
const mockStreamCachedMentorHint = vi.fn();
const mockToUIMessageStreamResponse = vi.fn();
const mockToCachedStreamResponse = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn()
    }
  }))
}));

vi.mock("@/lib/supabase/env", () => ({
  hasSupabaseEnv: vi.fn(() => true)
}));

vi.mock("@/lib/mentor/env", () => ({
  hasOpenAIEnv: vi.fn(() => true)
}));

vi.mock("@/lib/supabase/auth", () => ({
  getCurrentSession: (...args: unknown[]) => mockGetCurrentSession(...args)
}));

vi.mock("@/lib/supabase/e2e-auth", () => ({
  getE2eAuthState: (...args: unknown[]) => mockGetE2eAuthState(...args)
}));

vi.mock("@/lib/supabase/assignments", () => ({
  getAssignmentById: (...args: unknown[]) => mockGetAssignmentById(...args),
  getMySubmissionForAssignment: (...args: unknown[]) => mockGetMySubmissionForAssignment(...args)
}));

vi.mock("@/lib/supabase/memberships", () => ({
  getMyClassroomIds: (...args: unknown[]) => mockGetMyClassroomIds(...args)
}));

vi.mock("@/lib/supabase/mentor-usage", () => ({
  fetchMentorUsage: (...args: unknown[]) => mockFetchMentorUsage(...args),
  reserveMentorHint: (...args: unknown[]) => mockReserveMentorHint(...args)
}));

vi.mock("@/lib/supabase/mentor-history", () => ({
  fetchMentorHintHistory: (...args: unknown[]) => mockFetchMentorHintHistory(...args),
  reserveAssignmentMentorSlot: (...args: unknown[]) => mockReserveAssignmentMentorSlot(...args),
  finalizeAssignmentMentorHint: (...args: unknown[]) => mockFinalizeAssignmentMentorHint(...args),
  failAssignmentMentorHint: (...args: unknown[]) => mockFailAssignmentMentorHint(...args)
}));

vi.mock("@/lib/mentor/openai", () => ({
  streamMentorHint: (...args: unknown[]) => mockStreamMentorHint(...args),
  streamCachedMentorHint: (...args: unknown[]) => mockStreamCachedMentorHint(...args)
}));

const studentSession = {
  user: { id: "user-1", email: "learner@test.local" },
  isTeacher: false,
  isAdmin: false
};

const assignment = {
  id: "asg-1",
  classroomId: "class-1",
  missionId: "mission-file-organization",
  assignedBy: "teacher-1",
  titleOverride: null,
  instructions: "Write a folder plan.",
  dueAt: null,
  createdAt: "2026-08-18T10:00:00.000Z",
  missionTitle: "Bring order to your files",
  missionBrief: "Make a folder plan.",
  missionDeliverable: "A short written plan",
  submissionStatus: "missing"
};

const reservedSlot = {
  outcome: "reserved" as const,
  hintId: "hint-slot-1",
  hintText: null,
  count: 2,
  remaining: 3,
  limit: 5
};

function mentorRequest(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/mentor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assignmentId: "asg-1",
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
    mockGetCurrentSession.mockResolvedValue(studentSession);
    mockGetE2eAuthState.mockResolvedValue(null);
    mockGetAssignmentById.mockResolvedValue(assignment);
    mockGetMySubmissionForAssignment.mockResolvedValue(null);
    mockGetMyClassroomIds.mockResolvedValue(["class-1"]);
    mockFetchMentorUsage.mockResolvedValue({ count: 1, remaining: 4, limit: 5 });
    mockReserveMentorHint.mockResolvedValue({ ok: true, count: 2, remaining: 3, limit: 5 });
    mockFetchMentorHintHistory.mockResolvedValue([]);
    mockReserveAssignmentMentorSlot.mockResolvedValue(reservedSlot);
    mockFinalizeAssignmentMentorHint.mockResolvedValue(undefined);
    mockFailAssignmentMentorHint.mockResolvedValue(undefined);
    mockToUIMessageStreamResponse.mockImplementation(
      (options?: { headers?: HeadersInit }) => new Response("mock-stream", { headers: options?.headers })
    );
    mockToCachedStreamResponse.mockImplementation(
      (options?: { headers?: HeadersInit }) => new Response("cached-stream", { headers: options?.headers })
    );
    mockStreamMentorHint.mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse
    });
    mockStreamCachedMentorHint.mockReturnValue({
      toUIMessageStreamResponse: mockToCachedStreamResponse
    });
  });

  it("GET returns 401 when user is not authenticated", async () => {
    mockGetCurrentSession.mockResolvedValue({ user: null, isTeacher: false });

    const response = await GET(new Request("http://localhost/api/mentor"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("not_authenticated");
  });

  it("GET rejects teachers", async () => {
    mockGetCurrentSession.mockResolvedValue({
      user: { id: "teacher-1", email: "teacher@test.local" },
      isTeacher: true
    });

    const response = await GET(new Request("http://localhost/api/mentor"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("student_required");
    expect(mockFetchMentorUsage).not.toHaveBeenCalled();
  });

  it("GET returns mentor usage for authenticated students", async () => {
    const response = await GET(new Request("http://localhost/api/mentor"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ remaining: 4, limit: 5, count: 1, history: [] });
    expect(mockFetchMentorUsage).toHaveBeenCalledOnce();
  });

  it("GET returns persisted history for an authorized assignment", async () => {
    mockFetchMentorHintHistory.mockResolvedValue([
      { id: "hint-1", hintLevel: 1, mode: "start", effort: null, text: "Start small.", createdAt: "now" }
    ]);

    const response = await GET(new Request("http://localhost/api/mentor?assignmentId=asg-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.history).toHaveLength(1);
    expect(body.history[0].text).toBe("Start small.");
    expect(mockFetchMentorHintHistory).toHaveBeenCalledWith(expect.anything(), "asg-1");
  });

  it("POST rejects teachers before reserving quota", async () => {
    mockGetCurrentSession.mockResolvedValue({
      user: { id: "teacher-1", email: "teacher@test.local" },
      isTeacher: true
    });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("student_required");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST requires an assignment id", async () => {
    const response = await POST(mentorRequest({ assignmentId: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("assignment_required");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST rejects an unknown help mode before reserving quota", async () => {
    const response = await POST(mentorRequest({ mode: "give-answer" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_mentor_mode");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST requires a learner attempt for review mode", async () => {
    const response = await POST(mentorRequest({ mode: "review", effort: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("effort_required");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST rejects directions above level three", async () => {
    const response = await POST(mentorRequest({ hintLevel: 4 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_hint_level");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST returns 404 when the assignment is missing", async () => {
    mockGetAssignmentById.mockResolvedValue(null);

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("assignment_not_found");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST rejects students who are not in the assignment classroom", async () => {
    mockGetMyClassroomIds.mockResolvedValue(["other-class"]);

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("not_authorized");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST rejects closed assignments", async () => {
    mockGetMySubmissionForAssignment.mockResolvedValue({ status: "submitted" });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("assignment_closed");
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST returns 429 when the daily limit is reached", async () => {
    mockReserveAssignmentMentorSlot.mockResolvedValue({
      outcome: "daily_limit",
      hintId: null,
      hintText: null,
      count: 5,
      remaining: 0,
      limit: 5
    });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe("daily_limit_reached");
    expect(mockStreamMentorHint).not.toHaveBeenCalled();
  });

  it("POST enforces the persisted per-assignment direction limit before reserving daily quota", async () => {
    mockFetchMentorHintHistory.mockResolvedValue([
      { hintLevel: 1 },
      { hintLevel: 2 },
      { hintLevel: 3 }
    ]);

    const response = await POST(mentorRequest({ hintLevel: 3 }));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "task_limit_reached" });
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
    expect(mockStreamMentorHint).not.toHaveBeenCalled();
  });

  it("POST rejects a skipped persisted direction level", async () => {
    mockFetchMentorHintHistory.mockResolvedValue([{ hintLevel: 1 }]);

    const response = await POST(mentorRequest({ hintLevel: 3 }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "invalid_hint_level" });
    expect(mockReserveAssignmentMentorSlot).not.toHaveBeenCalled();
  });

  it("POST returns mentor_pending when another request owns the slot", async () => {
    mockReserveAssignmentMentorSlot.mockResolvedValue({
      outcome: "pending",
      hintId: "hint-slot-1",
      hintText: null,
      count: 2,
      remaining: 3,
      limit: 5
    });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("mentor_pending");
    expect(mockStreamMentorHint).not.toHaveBeenCalled();
  });

  it("POST streams a cached ready hint without calling the provider", async () => {
    mockReserveAssignmentMentorSlot.mockResolvedValue({
      outcome: "ready",
      hintId: "hint-ready-1",
      hintText: "Use semantic tags first.",
      count: 2,
      remaining: 3,
      limit: 5
    });

    const response = await POST(mentorRequest());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("cached-stream");
    expect(mockStreamCachedMentorHint).toHaveBeenCalledWith("Use semantic tags first.");
    expect(mockStreamMentorHint).not.toHaveBeenCalled();
  });

  it("POST streams a guarded direction and exposes remaining quota headers", async () => {
    mockFetchMentorHintHistory.mockResolvedValue([{ hintLevel: 1 }]);
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
    expect(response.headers.get("X-Mentor-Effort-Excerpt")).toBe("false");
    expect(mockReserveAssignmentMentorSlot).toHaveBeenCalledBefore(mockStreamMentorHint);

    const prompt = mockStreamMentorHint.mock.calls[0]?.[0] as { system: string; user: string };
    expect(prompt.system).toContain("Never provide the final answer");
    expect(prompt.user).toContain("Assigned mission");
    expect(prompt.user).toContain("Help mode: review");
    expect(prompt.user).toContain("Which semantic element could hold the main content?");
  });

  it("POST accepts long effort by sending a bounded excerpt to the model", async () => {
    const longEffort = `${"a".repeat(900)}\n${"b".repeat(900)}`;

    const response = await POST(
      mentorRequest({
        mode: "review",
        effort: longEffort
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Mentor-Effort-Excerpt")).toBe("true");

    const prompt = mockStreamMentorHint.mock.calls[0]?.[0] as { user: string };
    expect(prompt.user).toContain("omitted");
    expect(prompt.user).not.toContain(longEffort.slice(820, 980));
    expect(mockReserveAssignmentMentorSlot).toHaveBeenCalledWith(expect.anything(), {
      assignmentId: "asg-1",
      hintLevel: 1,
      mode: "review",
      effort: longEffort
    });
  });

  it("finalizes the reserved slot with generation metadata", async () => {
    await POST(mentorRequest());
    const onFinish = mockStreamMentorHint.mock.calls[0]?.[1] as (result: {
      text: string;
      inputTokens: number;
      outputTokens: number;
      model: string;
    }) => Promise<void>;

    await onFinish({ text: "  Start with the page structure.  ", inputTokens: 40, outputTokens: 9, model: "gpt-test" });

    expect(mockFinalizeAssignmentMentorHint).toHaveBeenCalledWith(expect.anything(), {
      hintId: "hint-slot-1",
      text: "Start with the page structure.",
      model: "gpt-test",
      inputTokens: 40,
      outputTokens: 9
    });
  });

  it("POST marks the slot failed and keeps quota when mentor setup fails synchronously", async () => {
    mockStreamMentorHint.mockImplementation(() => {
      throw new Error("OpenAI setup failed");
    });

    const response = await POST(mentorRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("mentor_failed");
    expect(mockReserveAssignmentMentorSlot).toHaveBeenCalledOnce();
    expect(mockFailAssignmentMentorHint).toHaveBeenCalledWith(expect.anything(), "hint-slot-1");
  });
});
