import { env } from "../config/env";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export async function callDeepseekJson<T>(messages: ChatMessage[]): Promise<T> {
  const response = await fetch(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DeepSeek API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API returned empty content");
  }

  return JSON.parse(content) as T;
}
