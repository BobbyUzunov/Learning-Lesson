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

export async function fetchMentorUsage(supabase: SupabaseClient): Promise<MentorUsage> {
  const { data, error } = await supabase.rpc("get_mentor_usage").single<MentorUsageRow>();

  if (error) {
    throw error;
  }

  return mapUsage(data);
}

export async function reserveMentorHint(
  supabase: SupabaseClient
): Promise<{ ok: boolean } & MentorUsage> {
  const { data, error } = await supabase.rpc("reserve_mentor_hint").single<ReserveMentorRow>();

  if (error) {
    throw error;
  }

  return {
    ok: data.ok,
    ...mapUsage(data)
  };
}
