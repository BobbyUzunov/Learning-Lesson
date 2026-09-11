import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getOpenAIConfig } from "./env";

const MENTOR_REQUEST_TIMEOUT_MS = 20_000;

export function streamMentorHint(
  messages: { system: string; user: string },
  onFinish?: (result: {
    text: string;
    inputTokens?: number;
    outputTokens?: number;
    model: string;
  }) => Promise<void>
) {
  const { apiKey, model } = getOpenAIConfig();
  const openai = createOpenAI({ apiKey });

  return streamText({
    model: openai.chat(model),
    system: messages.system,
    prompt: messages.user,
    maxOutputTokens: 180,
    timeout: MENTOR_REQUEST_TIMEOUT_MS,
    onFinish: onFinish
      ? async ({ text, totalUsage }) => {
          await onFinish({
            text,
            inputTokens: totalUsage.inputTokens,
            outputTokens: totalUsage.outputTokens,
            model
          });
        }
      : undefined
  });
}
