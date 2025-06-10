// deno-lint-ignore-file
// @ts-nocheck
// ai.ts - v2 2025-06-06
// Enhanced AI wrappers with better error handling and fallback behavior

import OpenAI from "npm:openai@4.18.0";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Track if we've already warned about missing API key
let hasWarnedAboutMissingKey = false;

function warnAboutMissingApiKey(context: string) {
  if (!hasWarnedAboutMissingKey) {
    console.error("🚨 CRITICAL: OPENAI_API_KEY not configured!");
    console.error("📄 PDF parsing for genetic/lab files will fail without AI assistance.");
    console.error("🔧 Set OPENAI_API_KEY in Supabase Edge Functions environment.");
    console.error("🔗 Get API key from: https://platform.openai.com/api-keys");
    hasWarnedAboutMissingKey = true;
  }
  console.warn(`⚠️  AI parsing skipped for ${context} - missing OPENAI_API_KEY`);
}

export async function aiParseGeneticTable(rawText: string): Promise<Record<string, string>> {
  if (!openai) {
    warnAboutMissingApiKey("genetic table parsing");
    return {};
  }

  try {
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
    
    const result = JSON.parse(res.choices[0].message.content ?? "{}");
    console.log(`✅ AI genetic parsing extracted ${Object.keys(result).length} SNPs`);
    return result;
  } catch (error) {
    console.error("❌ AI genetic parsing failed:", error);
    return {};
  }
}

export async function aiParseLabText(text: string): Promise<Record<string, number>> {
  if (!openai) {
    warnAboutMissingApiKey("lab text parsing");
    return {};
  }

  try {
    const prompt = `Extract biomarker measurements from the lab text and return JSON mapping { biomarker_snake_case: numeric_value }. Ignore units. Examples: {"vitamin_d": 32.5, "testosterone": 450, "cholesterol_total": 180}`;
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
    
    const result = JSON.parse(res.choices[0].message.content ?? "{}");
    console.log(`✅ AI lab parsing extracted ${Object.keys(result).length} biomarkers`);
    return result;
  } catch (error) {
    console.error("❌ AI lab parsing failed:", error);
    return {};
  }
}

export async function aiVisionPdf(base64: string): Promise<string> {
  if (!openai) {
    warnAboutMissingApiKey("PDF vision parsing");
    return "";
  }

  try {
    // rate-limit for vision calls
    await new Promise((r) => setTimeout(r, 300));
    
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      temperature: 0,
      messages: [
        { role: "system", content: "Extract lab biomarkers from the PDF image and output plain text table with biomarker names and values." },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
          ],
        },
      ],
    });
    
    const result = res.choices[0].message.content ?? "";
    console.log("✅ AI vision parsing completed");
    return result;
  } catch (error) {
    console.error("❌ AI vision parsing failed:", error);
    return "";
  }
}

export async function aiVisionPdfGenetic(base64: string): Promise<string> {
  if (!openai) {
    warnAboutMissingApiKey("genetic PDF vision parsing");
    return "";
  }
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      temperature: 0,
      messages: [
        { role: "system", content: "You are an OCR assistant. Extract every SNP (rsID) and its genotype from the PDF image provided. Respond ONLY with a plain text table, one rsID and genotype per line separated by a space." },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } }
          ]
        }
      ]
    });
    return res.choices[0].message.content ?? "";
  } catch (e) {
    console.error("❌ aiVisionPdfGenetic failed:", e);
    return "";
  }
}

export async function aiVisionProcessPages(pages: string[]): Promise<string> {
  if (!openai) {
    warnAboutMissingApiKey("vision processing");
    return "";
  }

  let fullText = "";
  for (const page of pages) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
        messages: [
          {
            role: "system",
            content:
              "You are an OCR assistant. Extract all text from the image, paying close attention to tables containing genetic data (SNPs).",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${page}` },
              },
            ],
          },
        ],
      });
      fullText += res.choices[0].message.content || "";
    } catch (e) {
      console.error("Error processing page with vision:", e);
    }
  }

  return fullText;
}

// Helper function to check if AI is available
export function isAIAvailable(): boolean {
  return !!openai;
}

// Get configuration status for debugging
export function getAIStatus(): { available: boolean; reason?: string } {
  if (!openaiApiKey) {
    return { available: false, reason: "OPENAI_API_KEY not configured" };
  }
  if (!openai) {
    return { available: false, reason: "OpenAI client initialization failed" };
  }
  return { available: true };
} 
