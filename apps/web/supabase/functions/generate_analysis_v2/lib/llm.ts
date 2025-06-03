// deno-lint-ignore-file
// @ts-nocheck

interface LLMResult { text: string; tokens: number; costUsd: number; }

const MODEL = "gpt-4o-mini";
const PRICE_PER_1K = 0.01; // USD placeholder

export async function callOpenAI(systemPrompt: string, userMessage: string): Promise<LLMResult> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), 10000);
  try {
    const body = {
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.65,
      max_tokens: 700,
      stream: false
    };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const json = await res.json();
    const text = json.choices[0].message.content.trim();
    const tokens = json.usage?.total_tokens ?? 700;
    const cost = (tokens / 1000) * PRICE_PER_1K;
    return { text, tokens, costUsd: cost };
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
} 