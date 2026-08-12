import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH as patchCourse } from "./courses/[id]/route";
import { PATCH as patchKnowledgeCheck } from "./knowledge-checks/[id]/route";
import { PATCH as patchLesson } from "./lessons/[id]/route";
import { PATCH as patchProject } from "./projects/[id]/route";
import { PATCH as patchSubmission } from "./submissions/[id]/route";
import { POST as setUserRole } from "./users/[id]/role/route";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getAdminSubmissionById: vi.fn(),
  getCourseProjects: vi.fn(),
  logServerError: vi.fn(),
  requireAdminUser: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/observability", () => ({ logServerError: mocks.logServerError }));
vi.mock("@/lib/supabase/env", () => ({ hasSupabaseEnv: vi.fn(() => true) }));
vi.mock("@/lib/supabase/admin-auth", () => ({
  requireAdminUser: mocks.requireAdminUser
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/supabase/project-submissions", () => ({
  getAdminSubmissionById: mocks.getAdminSubmissionById
}));
vi.mock("@/lib/projects/store", () => ({ getCourseProjects: mocks.getCourseProjects }));

const rawDatabaseError = "relation private.internal_table does not exist";

function request(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function context(id = "record-1") {
  return { params: Promise.resolve({ id }) };
}

function mutationFailure(message = rawDatabaseError) {
  return {
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: null, error: { message } }))
        }))
      }))
    }))
  };
}

describe("admin API database errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminUser.mockResolvedValue({
      user: { id: "admin-1" },
      supabase: { from: mocks.from, rpc: mocks.rpc }
    });
    mocks.createClient.mockResolvedValue({ from: mocks.from });
    mocks.getAdminSubmissionById.mockResolvedValue({
      id: "submission-1",
      project_id: "project-1"
    });
    mocks.getCourseProjects.mockResolvedValue({ projects: [] });
    mocks.rpc.mockReturnValue({ single: mocks.single });
  });

  it.each([
    {
      label: "course",
      handler: patchCourse,
      path: "/api/admin/courses/course-1",
      body: { title: "Updated course" },
      code: "course_update_failed"
    },
    {
      label: "knowledge check",
      handler: patchKnowledgeCheck,
      path: "/api/admin/knowledge-checks/question-1",
      body: { question: "Updated question" },
      code: "knowledge_check_update_failed"
    },
    {
      label: "project",
      handler: patchProject,
      path: "/api/admin/projects/project-1",
      body: { title: "Updated project" },
      code: "project_update_failed"
    }
  ])("does not leak an unknown $label update error", async ({ handler, path, body, code }) => {
    mocks.from.mockReturnValue(mutationFailure());

    const response = await handler(request(path, body), context());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: code });
  });

  it("does not leak an unknown lesson lookup error", async () => {
    mocks.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: null, error: { message: rawDatabaseError } }))
        }))
      }))
    });

    const response = await patchLesson(
      request("/api/admin/lessons/lesson-1", { title: "Updated lesson" }),
      context("lesson-1")
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "lesson_update_failed" });
  });

  it("does not leak an unknown lesson row update error", async () => {
    let lessonCall = 0;
    mocks.from.mockImplementation(() => {
      lessonCall += 1;
      if (lessonCall === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: { id: "lesson-1", course_id: "course-1" },
                error: null
              }))
            }))
          }))
        };
      }

      return {
        update: vi.fn(() => ({
          eq: vi.fn(async () => ({ error: { message: rawDatabaseError } }))
        }))
      };
    });

    const response = await patchLesson(
      request("/api/admin/lessons/lesson-1", { title: "Updated lesson" }),
      context("lesson-1")
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "lesson_update_failed" });
  });

  it("does not leak an unknown lesson metadata update error", async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === "lessons") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: { id: "lesson-1", course_id: "course-1" },
                error: null
              }))
            }))
          }))
        };
      }

      return {
        upsert: vi.fn(async () => ({ error: { message: rawDatabaseError } }))
      };
    });

    const response = await patchLesson(
      request("/api/admin/lessons/lesson-1", { learningObjectives: ["Semantic HTML"] }),
      context("lesson-1")
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "lesson_update_failed" });
  });

  it("does not leak an unknown submission review error", async () => {
    mocks.from.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: { message: rawDatabaseError } }))
      }))
    });

    const response = await patchSubmission(
      request("/api/admin/submissions/submission-1", { action: "approve" }),
      context("submission-1")
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "submission_review_failed" });
  });

  it.each([
    ["unknown_user", 404],
    ["teacher_has_classrooms", 409],
    ["admin_role_protected", 409],
    ["invalid_role", 400],
    ["not_authenticated", 401],
    ["admin_required", 403]
  ])("preserves the %s set-user-role domain error", async (message, status) => {
    mocks.single.mockResolvedValue({ data: null, error: { message: `rpc failed: ${message}` } });

    const response = await setUserRole(
      request("/api/admin/users/user-1/role", { role: "teacher" }),
      context("user-1")
    );

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: message });
  });

  it("maps an unknown set-user-role error to a non-leaking 500 response", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: rawDatabaseError } });

    const response = await setUserRole(
      request("/api/admin/users/user-1/role", { role: "teacher" }),
      context("user-1")
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "set_user_role_failed" });
  });
});
