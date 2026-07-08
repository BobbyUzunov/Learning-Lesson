import type { SupabaseClient } from "@supabase/supabase-js";

export type MentorUsage = {
  count: number;
  remaining: number;
  limit: number;
};

type MentorUsageRow = {
  request_count: number;
  remaining: number;
  daily_limit: number;
};

type ReserveMentorRow = MentorUsageRow & {
  ok: boolean;
};

function mapUsage(row: MentorUsageRow): MentorUsage {
  return {
    count: row.request_count,
    remaining: row.remaining,
    limit: row.daily_limit
  };
}

export async function fetchMentorUsage(supabase: SupabaseClient, limit: number): Promise<MentorUsage> {
  const { data, error } = await supabase.rpc("get_mentor_usage", { p_limit: limit }).single<MentorUsageRow>();

  if (error) {
    throw error;
  }

  return mapUsage(data);
}

export async function reserveMentorHint(
  supabase: SupabaseClient,
  limit: number
): Promise<{ ok: boolean } & MentorUsage> {
  const { data, error } = await supabase.rpc("reserve_mentor_hint", { p_limit: limit }).single<ReserveMentorRow>();

  if (error) {
    throw error;
  }

  return {
    ok: data.ok,
    ...mapUsage(data)
  };
}

export async function releaseMentorHint(supabase: SupabaseClient) {
  const { error } = await supabase.rpc("release_mentor_hint");
  if (error) {
    throw error;
  }
}
