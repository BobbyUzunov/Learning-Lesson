import { parseMentorDailyLimit } from "./usage";

export function hasOpenAIEnv() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    dailyLimit: parseMentorDailyLimit(process.env.MENTOR_DAILY_LIMIT)
  };
}
