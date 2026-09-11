import { readFileSync, writeFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { t } from "../src/lib/i18n";

type Account = {
  id: string;
  kind: "teacher" | "student" | "outsider";
  email: string;
  password: string;
  name: string;
};
type Fixture = { runId: string; users: Account[] };

const fixture = JSON.parse(readFileSync(process.env.LIVE_CYCLE_CREDENTIALS_FILE!, "utf8")) as Fixture;
const copy = t("en");

function account(kind: Account["kind"]) {
  const user = fixture.users.find((entry) => entry.kind === kind);
  if (!user || !user.email.endsWith("@example.invalid") || !user.email.startsWith(`ll-live-${fixture.runId}-`)) {
    throw new Error("Only dedicated ll-live test accounts are accepted.");
  }
  return user;
}

async function login(page: Page, user: Account) {
  await page.context().addCookies([{ name: "ll_lang", value: "en", url: "http://127.0.0.1:3101" }]);
  await page.goto("/login");
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(user.kind === "student" ? /\/dashboard$/ : /\/teacher$/);
  expect((await page.context().cookies()).some((cookie) => cookie.name === "e2e-auth")).toBe(false);
}

async function mutate(page: Page, path: string, action: () => Promise<unknown>) {
  const responsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname === path && response.request().method() === "POST"
  );
  await action();
  const response = await responsePromise;
  const body = await response.json();
  expect(response.status(), JSON.stringify(body)).toBe(200);
  expect(body.ok).toBe(true);
  return body;
}

test("real classroom cycle for program and custom assignments", async ({ browser }, testInfo) => {
  const teacher = account("teacher");
  const student = account("student");
  const outsider = account("outsider");
  const contexts = await Promise.all([teacher, student, outsider].map(() => browser.newContext({
    baseURL: "http://127.0.0.1:3101", viewport: { width: 1280, height: 900 }
  })));
  const [teacherPage, studentPage, outsiderPage] = await Promise.all(contexts.map((context) => context.newPage()));
  contexts.forEach((context) => {
    context.setDefaultTimeout(15_000);
    context.setDefaultNavigationTimeout(30_000);
  });
  const clients: SupabaseClient[] = [];
  const evidence: Record<string, unknown>[] = [];
  const errors: string[] = [];
  [teacherPage, studentPage, outsiderPage].forEach((page) => page.on("pageerror", (error) => errors.push(error.message)));

  async function dataClient(user: Account) {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    clients.push(client);
    const result = await client.auth.signInWithPassword({ email: user.email, password: user.password });
    expect(result.error?.message).toBeUndefined();
    expect(result.data.user?.id).toBe(user.id);
    return client;
  }

  try {
    await test.step("Real Auth login in separate teacher, student and unrelated-teacher browsers", async () => {
      await login(teacherPage, teacher);
      await login(studentPage, student);
      await login(outsiderPage, outsider);
    });
    const teacherDb = await dataClient(teacher);
    const studentDb = await dataClient(student);
    const outsiderDb = await dataClient(outsider);
    let classroomId = "";

    await test.step("Teacher creates a class; student joins using its real code", async () => {
      await teacherPage.goto("/teacher/classes?create=1");
      await teacherPage.locator("#classroom-name").fill(`LIVE CYCLE ${fixture.runId}`);
      await teacherPage.locator("#classroom-specialty").selectOption({ index: 1 });
      const body = await mutate(teacherPage, "/api/teacher/classrooms", () =>
        teacherPage.getByRole("button", { name: copy.teacher.createButton, exact: true }).click()
      );
      classroomId = body.classroom.id;
      await expect(teacherPage).toHaveURL(`/teacher/classes/${classroomId}`);
      const { data: classroom, error } = await teacherDb.rpc("get_teacher_classroom", { p_classroom_id: classroomId })
        .single<{ join_code: string }>();
      expect(error).toBeNull();
      expect(classroom?.join_code).toMatch(/^[A-Z0-9]{6}$/);
      await expect(teacherPage.getByText(classroom!.join_code, { exact: true })).toBeVisible();

      await studentPage.goto("/classes");
      await studentPage.locator("summary").filter({ hasText: copy.classroom.joinSectionTitle }).click();
      await studentPage.getByRole("textbox", { name: copy.classroom.joinTitle, exact: true }).fill(classroom!.join_code);
      await mutate(studentPage, "/api/classrooms/join", () =>
        studentPage.getByRole("button", { name: copy.classroom.joinButton, exact: true }).click()
      );
      await expect(studentPage.getByText(copy.classroom.joinSuccess, { exact: true })).toBeVisible();
      const membership = await studentDb.from("classroom_members").select("student_id").eq("classroom_id", classroomId).single();
      expect(membership.error).toBeNull();
      expect(membership.data?.student_id).toBe(student.id);
      evidence.push({ step: "class_joined", classroomId, studentId: student.id });
    });

    for (const source of ["program", "custom"] as const) {
      let assignmentId = "";
      let submissionId = "";
      let title = "";
      const initialWork = `${source}: Initial test deliverable with a draft plan.`;
      const revisedWork = `${source}: Revised deliverable with a concrete example and verification steps.`;
      const feedback = `${source}: Add a concrete example and describe how you checked it.`;
      const reportPath = () => `/teacher/classes/${classroomId}/assignments/${assignmentId}`;
      const studentPath = () => `/assignments/${assignmentId}`;
      const queueLink = () => teacherPage.locator(`a[href="${reportPath()}"]`);

      async function verifySubmission(status: string, text: string) {
        const result = await studentDb.from("assignment_submissions")
          .select("id, status, deliverable_text, teacher_note, reviewed_at")
          .eq("assignment_id", assignmentId).eq("student_id", student.id).single();
        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({ id: submissionId, status, deliverable_text: text });
        evidence.push({ source, assignmentId, submissionId, status, text: result.data!.deliverable_text });
        return result.data!;
      }

      await test.step(`${source}: teacher assigns through the form`, async () => {
        await teacherPage.goto(`/teacher/classes/${classroomId}`);
        await teacherPage.getByRole("button", { name: copy.teacher.assignButton, exact: true }).click();
        if (source === "custom") {
          await teacherPage.getByRole("button", { name: copy.teacher.assignSourceCustom, exact: true }).click();
          title = `LIVE custom ${fixture.runId}`;
          await teacherPage.getByRole("textbox", { name: copy.teacher.customMissionTitle, exact: true }).fill(title);
          await teacherPage.getByRole("textbox", { name: copy.teacher.customQuestionN.replace("{n}", "1"), exact: true })
            .fill("Describe a solution and give one concrete example.");
        } else {
          const select = teacherPage.getByRole("combobox", { name: copy.teacher.missionLabel, exact: true });
          await select.selectOption({ index: 0 });
          title = (await select.locator("option:checked").textContent())!.trim();
        }
        const body = await mutate(teacherPage, `/api/teacher/classrooms/${classroomId}/assignments`, () =>
          teacherPage.locator("form").filter({ has: teacherPage.getByRole("heading", { name: copy.teacher.assignButton, exact: true }) })
            .getByRole("button", { name: copy.teacher.assignButton, exact: true }).click()
        );
        assignmentId = body.assignment.id;
        await expect(teacherPage.getByRole("status").filter({ hasText: copy.teacher.assignSuccess })).toBeVisible();
        expect(Boolean(body.assignment.missionId)).toBe(source === "program");
        await studentPage.goto("/classes");
        await expect(studentPage.locator(`a[href="${studentPath()}"]`)).toBeVisible();
        await studentPage.goto(studentPath());
        await expect(studentPage.getByRole("heading", { level: 1 })).toBeVisible();
        if (source === "custom") await expect(studentPage.getByRole("heading", { name: title, exact: true })).toBeVisible();
        evidence.push({ source, step: "assigned", assignmentId, title });
      });

      await test.step(`${source}: student submits; real review queue contains the assignment`, async () => {
        await studentPage.getByRole("textbox", { name: copy.classroom.deliverableTextLabel, exact: true }).fill(initialWork);
        const body = await mutate(studentPage, `/api/assignments/${assignmentId}/submit`, () =>
          studentPage.getByRole("button", { name: copy.classroom.submitButton, exact: true }).click()
        );
        submissionId = body.submission.id;
        await verifySubmission("submitted", initialWork);
        await studentPage.reload();
        await expect(studentPage.getByText(copy.classroom.statusSubmitted, { exact: true })).toBeVisible();
        await expect(studentPage.getByRole("textbox", { name: copy.classroom.deliverableTextLabel, exact: true })).toBeDisabled();
        await teacherPage.goto("/teacher/reviews");
        await expect(queueLink()).toBeVisible();
        const pending = await teacherDb.rpc("get_pending_teacher_reviews");
        expect(pending.error).toBeNull();
        expect(pending.data.find((row: { assignment_id: string }) => row.assignment_id === assignmentId)?.pending_count).toBe(1);
        await queueLink().click();
        await expect(teacherPage.getByText(initialWork, { exact: true })).toBeVisible();
      });

      await test.step(`${source}: unauthorized review and overwriting submitted work are rejected`, async () => {
        const forgedReview = await studentPage.request.post(`/api/teacher/submissions/${submissionId}/review`, { data: { action: "approve" } });
        expect(forgedReview.status()).toBe(403);
        const outsideReview = await outsiderPage.request.post(`/api/teacher/submissions/${submissionId}/review`, { data: { action: "approve" } });
        expect(outsideReview.status()).toBe(403);
        const outsiderRead = await outsiderDb.from("assignment_submissions").select("id").eq("id", submissionId);
        expect(outsiderRead.error).toBeNull();
        expect(outsiderRead.data).toEqual([]);
        const overwrite = await studentPage.request.post(`/api/assignments/${assignmentId}/submit`, { data: { deliverableText: "Unauthorized overwrite" } });
        expect(overwrite.status()).toBe(409);
        await verifySubmission("submitted", initialWork);
      });

      await test.step(`${source}: teacher returns work; student sees the note and editable original`, async () => {
        await teacherPage.getByRole("button", { name: copy.teacher.requestChanges, exact: true }).click();
        await teacherPage.getByPlaceholder(copy.teacher.teacherNoteReturnPlaceholder).fill(feedback);
        await mutate(teacherPage, `/api/teacher/submissions/${submissionId}/review`, () =>
          teacherPage.getByRole("button", { name: copy.teacher.requestChanges, exact: true }).click()
        );
        expect((await verifySubmission("needs_changes", initialWork)).teacher_note).toBe(feedback);
        await teacherPage.goto("/teacher/reviews");
        await expect(queueLink()).toHaveCount(0);
        await studentPage.reload();
        await expect(studentPage.getByText(feedback, { exact: true })).toBeVisible();
        const draft = studentPage.getByRole("textbox", { name: copy.classroom.deliverableTextLabel, exact: true });
        await expect(draft).toBeEditable();
        await expect(draft).toHaveValue(initialWork);
        await studentPage.screenshot({ path: testInfo.outputPath(`${source}-returned.png`), fullPage: true });
      });

      await test.step(`${source}: student resubmits the same submission; queue returns exactly once`, async () => {
        await studentPage.getByRole("textbox", { name: copy.classroom.deliverableTextLabel, exact: true }).fill(revisedWork);
        const body = await mutate(studentPage, `/api/assignments/${assignmentId}/submit`, () =>
          studentPage.getByRole("button", { name: copy.classroom.submitButton, exact: true }).click()
        );
        expect(body.submission.id).toBe(submissionId);
        const record = await verifySubmission("submitted", revisedWork);
        expect(record.teacher_note).toBeNull();
        expect(record.reviewed_at).toBeNull();
        await teacherPage.goto("/teacher/reviews");
        await expect(queueLink()).toHaveCount(1);
        const pending = await teacherDb.rpc("get_pending_teacher_reviews");
        expect(pending.error).toBeNull();
        expect(pending.data.find((row: { assignment_id: string }) => row.assignment_id === assignmentId)?.pending_count).toBe(1);
        await queueLink().click();
        await expect(teacherPage.getByText(revisedWork, { exact: true })).toBeVisible();
      });

      await test.step(`${source}: teacher approves; both roles and gradebook retain the final status`, async () => {
        await mutate(teacherPage, `/api/teacher/submissions/${submissionId}/review`, () =>
          teacherPage.getByRole("button", { name: copy.teacher.approve, exact: true }).click()
        );
        await verifySubmission("approved", revisedWork);
        await teacherPage.reload();
        await expect(teacherPage.getByText(copy.teacher.statusApproved, { exact: true })).toBeVisible();
        await teacherPage.goto("/teacher/reviews");
        await expect(queueLink()).toHaveCount(0);
        await studentPage.reload();
        await expect(studentPage.getByText(copy.classroom.statusApproved, { exact: true })).toBeVisible();
        await expect(studentPage.getByRole("textbox", { name: copy.classroom.deliverableTextLabel, exact: true })).toBeDisabled();
        await studentPage.screenshot({ path: testInfo.outputPath(`${source}-approved.png`), fullPage: true });
        const overwrite = await studentPage.request.post(`/api/assignments/${assignmentId}/submit`, { data: { deliverableText: "Overwrite approved work" } });
        expect(overwrite.status()).toBe(409);
        await verifySubmission("approved", revisedWork);
        await teacherPage.goto(`/teacher/classes/${classroomId}/gradebook`);
        await expect(teacherPage.getByText(student.name, { exact: true })).toBeVisible();
        await expect(teacherPage.getByText(copy.teacher.statusApproved, { exact: true }).first()).toBeVisible();
      });
    }
    expect(errors).toEqual([]);
  } finally {
    writeFileSync(testInfo.outputPath("evidence.json"), JSON.stringify({ runId: fixture.runId, evidence, errors }, null, 2));
    await Promise.allSettled(clients.map((client) => client.auth.signOut()));
    await Promise.all(contexts.map((context) => context.close()));
  }
});
