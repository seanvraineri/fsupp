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
  const prompt = `You are an expert genetic data extraction AI. Extract ALL SNPs (rs-IDs) and their genotypes from this genetic report text, no matter how many there are.

INSTRUCTIONS:
- Extract ALL rs-IDs and genotypes - could be hundreds, thousands, or hundreds of thousands
- Handle any genetic testing format: 23andMe, AncestryDNA, MyHeritage, Nebula, WGS, WES, etc.
- Support any file format: CSV, TXT, VCF, tab-delimited, space-delimited
- Extract from raw data files OR formatted reports
- Convert ALL genotypes to standard format (e.g., AA, AT, CC, TT, etc.)

DO NOT LIMIT TO SPECIFIC SNPs. Extract everything you find.

Common patterns to look for (but extract ALL you find):
- CSV: rsid,genotype OR rs123,A,T OR rs123,AA
- Tab: rs123456\\tAT OR rs123456\\tA\\tT  
- Space: rs123456 AT OR rs123456 A T
- VCF format variations
- Any rs followed by numbers and genotype letters

Return comprehensive JSON mapping ALL rs-IDs to genotypes - this could be 600k+ SNPs:
{
  "rs1": "genotype1",
  "rs2": "genotype2", 
  ...
  "rsN": "genotypeN"
}

BE COMPLETELY THOROUGH. Extract EVERY rs-ID with a valid genotype, regardless of quantity.`;
  
  const input = rawText.slice(0, 100000); // Much larger for full genetic files
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    max_tokens: 8192, // Maximum for large genetic datasets
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
  const prompt = `You are an expert medical data extraction AI. Extract EVERY SINGLE numeric biomarker measurement from this lab report text, no matter how many there are.

INSTRUCTIONS:
- Extract ALL lab values with numbers - could be 10, could be 500+
- Include everything: basic panels, comprehensive panels, specialty tests, hormones, vitamins, enzymes, ratios, etc.
- Convert ALL names to snake_case (lowercase, underscores)
- Return ALL values as numbers (no strings, no nulls)
- Handle any lab format: Quest, LabCorp, hospital labs, international labs
- Extract from any section: chemistry, hematology, immunology, toxicology, genetics, etc.

DO NOT LIMIT YOURSELF TO SPECIFIC BIOMARKERS. Extract everything you find.

Return comprehensive JSON with ALL biomarkers found - this could be 50, 100, 200+ biomarkers:
{
  "biomarker_name_1": numeric_value,
  "biomarker_name_2": numeric_value,
  ...
  "biomarker_name_n": numeric_value
}

BE COMPLETELY THOROUGH. Extract EVERY numeric lab value regardless of what it is.`;
  
  const input = text.slice(0, 50000); // Increased for very large reports
  const res = await openai.chat.completions.create({
    model: "gpt-4o",  
    temperature: 0,
    max_tokens: 8192,  // Maximum possible for comprehensive extraction
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

// Vision parsing that returns JSON of biomarkers directly
export async function aiVisionLabJson(base64: string): Promise<Record<string, number>> {
  if (!openai) return {};
  await new Promise(r=>setTimeout(r,300));
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Extract all biomarker measurements from the lab PDF image and return JSON mapping { biomarker_snake_case: numeric_value }. Ignore units." },
      { role: "user", content: [ { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } } ] }
    ]
  });
  try {
    return JSON.parse(res.choices[0].message.content ?? "{}");
  } catch { return {}; }
} 
