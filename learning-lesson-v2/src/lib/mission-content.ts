import { getGameLesson, type GameLesson } from "./game-data";
import { createClient } from "./supabase/server";
import { hasSupabaseEnv } from "./supabase/env";

type MissionOverrideRow = {
  id: string;
  quest_id: string;
  title: string | null;
  title_bg: string | null;
  explanation: string | null;
  explanation_bg: string | null;
  code_example: string | null;
  mission: string | null;
  mission_bg: string | null;
  solution: string | null;
  hint1: string | null;
  hint1_bg: string | null;
  hint2: string | null;
  hint2_bg: string | null;
  hint3: string | null;
  hint3_bg: string | null;
};

function mergeLesson(base: GameLesson, override: MissionOverrideRow): GameLesson {
  return {
    ...base,
    title: override.title ?? base.title,
    titleBg: override.title_bg ?? base.titleBg,
    explanation: override.explanation ?? base.explanation,
    explanationBg: override.explanation_bg ?? base.explanationBg,
    codeExample: override.code_example ?? base.codeExample,
    mission: override.mission ?? base.mission,
    missionBg: override.mission_bg ?? base.missionBg,
    solution: override.solution ?? base.solution,
    hint1: override.hint1 ?? base.hint1,
    hint1Bg: override.hint1_bg ?? base.hint1Bg,
    hint2: override.hint2 ?? base.hint2,
    hint2Bg: override.hint2_bg ?? base.hint2Bg,
    hint3: override.hint3 ?? base.hint3,
    hint3Bg: override.hint3_bg ?? base.hint3Bg
  };
}

export async function getLessonWithOverrides(id: string) {
  const base = getGameLesson(id);
  if (!base || !hasSupabaseEnv()) {
    return base ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("game_missions").select("*").eq("id", id).maybeSingle();

  if (!data) {
    return base;
  }

  return mergeLesson(base, data as MissionOverrideRow);
}

export type MissionOverrideInput = {
  title?: string;
  titleBg?: string;
  explanation?: string;
  explanationBg?: string;
  codeExample?: string;
  mission?: string;
  missionBg?: string;
  solution?: string;
  hint1?: string;
  hint1Bg?: string;
  hint2?: string;
  hint2Bg?: string;
  hint3?: string;
  hint3Bg?: string;
};

export function toMissionOverrideRow(lesson: GameLesson, input: MissionOverrideInput) {
  return {
    id: lesson.id,
    quest_id: lesson.questId,
    title: input.title ?? lesson.title,
    title_bg: input.titleBg ?? lesson.titleBg ?? null,
    explanation: input.explanation ?? lesson.explanation,
    explanation_bg: input.explanationBg ?? lesson.explanationBg ?? null,
    code_example: input.codeExample ?? lesson.codeExample,
    mission: input.mission ?? lesson.mission,
    mission_bg: input.missionBg ?? lesson.missionBg ?? null,
    solution: input.solution ?? lesson.solution,
    hint1: input.hint1 ?? lesson.hint1 ?? lesson.hint ?? null,
    hint1_bg: input.hint1Bg ?? lesson.hint1Bg ?? lesson.hintBg ?? null,
    hint2: input.hint2 ?? lesson.hint2 ?? null,
    hint2_bg: input.hint2Bg ?? lesson.hint2Bg ?? null,
    hint3: input.hint3 ?? lesson.hint3 ?? null,
    hint3_bg: input.hint3Bg ?? lesson.hint3Bg ?? null,
    updated_at: new Date().toISOString()
  };
}
