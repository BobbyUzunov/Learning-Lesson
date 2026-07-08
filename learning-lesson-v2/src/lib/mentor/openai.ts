import { getOpenAIConfig } from "./env";

type MentorMessage = {
  role: "system" | "user";
  content: string;
};

export async function requestMentorHint(messages: { system: string; user: string }) {
  const { apiKey, model } = getOpenAIConfig();

  const payload = {
    model,
    max_tokens: 280,
    temperature: 0.3,
    messages: [
      { role: "system", content: messages.system },
      { role: "user", content: messages.user }
    ] satisfies MentorMessage[]
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    const message = body?.error?.message ?? `OpenAI request failed (${response.status}).`;
    throw new Error(message);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const hint = result.choices?.[0]?.message?.content?.trim();
  if (!hint) {
    throw new Error("Empty mentor response.");
  }

  return hint;
}
