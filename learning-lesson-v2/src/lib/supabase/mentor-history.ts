import type { SupabaseClient } from "@supabase/supabase-js";
import type { MentorHintLevel, MentorMode } from "@/lib/mentor/prompt";
import { getCurrentSession } from "./auth";
import { hasSupabaseDataEnv } from "./data-env";
import { throwLoadError } from "./load-error";
import { createClient } from "./server";

export type MentorHintHistoryItem = {
  id: string;
  hintLevel: MentorHintLevel;
  mode: MentorMode;
  effort: string | null;
  text: string;
  createdAt: string;
};

type MentorHintRow = {
  id: string;
  hint_level: MentorHintLevel;
  mode: MentorMode;
  effort: string | null;
  hint_text: string;
  created_at: string;
};

export async function fetchMentorHintHistory(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<MentorHintHistoryItem[]> {
  const { data, error } = await supabase
    .from("assignment_mentor_hints")
    .select("id, hint_level, mode, effort, hint_text, created_at")
    .eq("assignment_id", assignmentId)
    .order("hint_level");

  if (error) {
    throw error;
  }

  return ((data ?? []) as MentorHintRow[]).map((row) => ({
    id: row.id,
    hintLevel: row.hint_level,
    mode: row.mode,
    effort: row.effort,
    text: row.hint_text,
    createdAt: row.created_at
  }));
}

export async function saveMentorHint(
  supabase: SupabaseClient,
  input: {
    userId: string;
    assignmentId: string;
    hintLevel: MentorHintLevel;
    mode: MentorMode;
    effort: string;
    text: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
  }
) {
  const { error } = await supabase.from("assignment_mentor_hints").insert({
    user_id: input.userId,
    assignment_id: input.assignmentId,
    hint_level: input.hintLevel,
    mode: input.mode,
    effort: input.effort || null,
    hint_text: input.text,
    model: input.model,
    input_tokens: input.inputTokens ?? null,
    output_tokens: input.outputTokens ?? null
  });

  if (error) {
    throw error;
  }
}

export async function getMyMentorHintHistory(assignmentId: string) {
  if (!hasSupabaseDataEnv()) {
    return [];
  }

  const session = await getCurrentSession();
  if (!session.user) {
    return [];
  }

  try {
    return await fetchMentorHintHistory(await createClient(), assignmentId);
  } catch (error) {
    throwLoadError("mentor_history_unavailable", error instanceof Error ? error : null);
  }
}
