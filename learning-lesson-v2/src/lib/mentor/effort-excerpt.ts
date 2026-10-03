export const MAX_STORED_MENTOR_EFFORT = 12_000;
export const MAX_MODEL_MENTOR_EFFORT = 1_600;

const EXCERPT_MARKER = "\n\n[… middle of your draft omitted for review …]\n\n";

export type MentorEffortForModel = {
  text: string;
  excerpted: boolean;
  storedLength: number;
};

export function buildMentorEffortForModel(effort: string): MentorEffortForModel {
  const stored = effort.trim().slice(0, MAX_STORED_MENTOR_EFFORT);
  if (stored.length <= MAX_MODEL_MENTOR_EFFORT) {
    return { text: stored, excerpted: false, storedLength: stored.length };
  }

  const markerBudget = EXCERPT_MARKER.length;
  const sideBudget = Math.floor((MAX_MODEL_MENTOR_EFFORT - markerBudget) / 2);
  const head = stored.slice(0, sideBudget);
  const tail = stored.slice(stored.length - sideBudget);

  return {
    text: `${head}${EXCERPT_MARKER}${tail}`,
    excerpted: true,
    storedLength: stored.length
  };
}
