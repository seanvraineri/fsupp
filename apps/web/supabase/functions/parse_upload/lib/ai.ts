// deno-lint-ignore-file
// @ts-nocheck
// ai.ts - v1 2025-06-03
// Minimal wrappers around OpenAI GPT-4o-mini for text & vision parsing with safe truncation

import OpenAI from "npm:openai@4.18.0";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

if (!openai) {
  console.warn("OPENAI_API_KEY not configured – AI fallbacks will be skipped.");
}

export async function aiParseGeneticTable(rawText: string): Promise<Record<string, string>> {
  if (!openai) return {};
  const prompt = `You are a genetic report parser. Input is a text table with SNP IDs and genotypes. Return JSON mapping { rsid: genotype }. Only include rows with valid rsIDs (rs followed by numbers) and genotype of 1-4 letters. Example: { "rs1801133": "TT" }.`;
  const input = rawText.slice(0, 15000); // truncate to 15k chars
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 1024,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: input },
    ],
    response_format: { type: "json_object" },
  });
  try {
    return JSON.parse(res.choices[0].message.content ?? "{}");
  } catch {
    return {};
  }
}

export async function aiParseLabText(text: string): Promise<Record<string, number>> {
  if (!openai) return {};
  const prompt = `Extract biomarker measurements from the lab text and return JSON mapping { biomarker_snake_case: numeric_value }. Ignore units.`;
  const input = text.slice(0, 15000);
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 1024,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: input },
    ],
    response_format: { type: "json_object" },
  });
  try {
    return JSON.parse(res.choices[0].message.content ?? "{}");
  } catch {
    return {};
  }
}

export async function aiVisionPdf(base64: string): Promise<string> {
  if (!openai) return "";
  // rate-limit for vision calls
  await new Promise((r) => setTimeout(r, 300));
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    temperature: 0,
    messages: [
      { role: "system", content: "Extract lab biomarkers from the PDF image and output plain text table." },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
        ],
      },
    ],
  });
  return res.choices[0].message.content ?? "";
} 