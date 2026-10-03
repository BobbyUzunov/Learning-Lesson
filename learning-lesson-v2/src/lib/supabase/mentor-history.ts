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

export type MentorSlotOutcome = "ready" | "pending" | "reserved" | "daily_limit" | "task_limit";

export type MentorSlotReservation = {
  outcome: MentorSlotOutcome;
  hintId: string | null;
  hintText: string | null;
  count: number;
  remaining: number;
  limit: number;
};

type MentorHintRow = {
  id: string;
  hint_level: MentorHintLevel;
  mode: MentorMode;
  effort: string | null;
  hint_text: string;
  created_at: string;
};

type MentorSlotRow = {
  outcome: MentorSlotOutcome;
  hint_id: string | null;
  hint_text: string | null;
  request_count: number;
  remaining: number;
  daily_limit: number;
};

export async function fetchMentorHintHistory(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<MentorHintHistoryItem[]> {
  const { data, error } = await supabase
    .from("assignment_mentor_hints")
    .select("id, hint_level, mode, effort, hint_text, created_at")
    .eq("assignment_id", assignmentId)
    .eq("status", "ready")
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

export async function reserveAssignmentMentorSlot(
  supabase: SupabaseClient,
  input: {
    assignmentId: string;
    hintLevel: MentorHintLevel;
    mode: MentorMode;
    effort: string;
  }
): Promise<MentorSlotReservation> {
  const { data, error } = await supabase
    .rpc("reserve_assignment_mentor_slot", {
      p_assignment_id: input.assignmentId,
      p_hint_level: input.hintLevel,
      p_mode: input.mode,
      p_effort: input.effort
    })
    .single<MentorSlotRow>();

  if (error) {
    throw error;
  }

  return {
    outcome: data.outcome,
    hintId: data.hint_id,
    hintText: data.hint_text,
    count: data.request_count,
    remaining: data.remaining,
    limit: data.daily_limit
  };
}

export async function finalizeAssignmentMentorHint(
  supabase: SupabaseClient,
  input: {
    hintId: string;
    text: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
  }
) {
  const { error } = await supabase.rpc("finalize_assignment_mentor_hint", {
    p_hint_id: input.hintId,
    p_hint_text: input.text,
    p_model: input.model,
    p_input_tokens: input.inputTokens ?? null,
    p_output_tokens: input.outputTokens ?? null
  });

  if (error) {
    throw error;
  }
}

export async function failAssignmentMentorHint(supabase: SupabaseClient, hintId: string) {
  const { error } = await supabase.rpc("fail_assignment_mentor_hint", {
    p_hint_id: hintId
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
