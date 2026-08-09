import { NextResponse } from "next/server";
import { readJsonObject } from "@/lib/http";
import {
  getSecretKnowledgeCheckBank,
  gradeKnowledgeCheckAnswers,
  parseKnowledgeCheckAnswers,
  type KnowledgeCheckGradeResult
} from "@/lib/knowledge-check";
import { isE2eAuthEnabled } from "@/lib/supabase/e2e-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type RpcGradeRow = {
  question_id: string;
  selected_index: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
  explanation_bg: string;
};

function fromRpcRows(
  rows: RpcGradeRow[],
  answers: { questionId: string; selectedIndex: number }[]
): KnowledgeCheckGradeResult {
  const results = rows.map((row) => ({
    questionId: row.question_id,
    selectedIndex: row.selected_index,
    correctIndex: row.correct_index,
    isCorrect: row.is_correct,
    explanation: row.explanation,
    explanationBg: row.explanation_bg
  }));
  const correct = results.filter((item) => item.isCorrect).length;
  const total = results.length;
  return {
    answers,
    correct,
    total,
    passed: total > 0 && correct * 3 >= total * 2,
    results
  };
}

async function gradeLocally(answers: { questionId: string; selectedIndex: number }[]) {
  const bank = await getSecretKnowledgeCheckBank();
  if (!bank) {
    return null;
  }
  return gradeKnowledgeCheckAnswers(bank, answers);
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId.trim() : "";
  const answers = parseKnowledgeCheckAnswers(body?.knowledgeCheckAnswers ?? body?.answers);

  if (!lessonId || lessonId.length > 100 || !answers) {
    return NextResponse.json({ error: "invalid_grade_payload" }, { status: 400 });
  }

  if (!hasSupabaseEnv() || isE2eAuthEnabled()) {
    const graded = await gradeLocally(answers);
    if (!graded) {
      return NextResponse.json({ error: "quiz_not_passed" }, { status: 403 });
    }
    return NextResponse.json(graded);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("grade_knowledge_check", {
    p_lesson_id: lessonId,
    p_answers: answers
  });

  if (!error) {
    const rows = (Array.isArray(data) ? data : []) as RpcGradeRow[];
    if (rows.length === 0) {
      return NextResponse.json({ error: "quiz_not_passed" }, { status: 403 });
    }
    return NextResponse.json(fromRpcRows(rows, answers));
  }

  const message = error.message ?? "";
  if (message.includes("quiz_unavailable") || message.includes("knowledge_check_unavailable")) {
    return NextResponse.json({ error: "quiz_unavailable" }, { status: 503 });
  }
  if (message.includes("quiz_not_passed") || message.includes("knowledge_check_not_passed")) {
    return NextResponse.json({ error: "quiz_not_passed" }, { status: 403 });
  }

  // Compatibility window before the RPC migration is applied: grade from a readable bank.
  const graded = await gradeLocally(answers);
  if (graded) {
    return NextResponse.json(graded);
  }

  console.error("grade_knowledge_check failed:", message);
  return NextResponse.json({ error: "grade_failed" }, { status: 500 });
}
