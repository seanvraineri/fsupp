// deno-lint-ignore-file
// @ts-nocheck
// genetic.ts - v2 2025-06-06 - Fast Processing Version
// Quick deterministic parsing + async AI fallback

import { aiParseGeneticTable } from "./ai.ts";
import type { ProcessResult } from "../index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const HIGHLIGHT_SNPS = [
  "rs1801133", // MTHFR C677T
  "rs1801131", // MTHFR A1298C
  "rs429358", // APOE
  "rs7412", // APOE
  "rs2228570", // VDR
  "rs1544410", // VDR
  "rs4680", // COMT
];

export async function processGeneticFile(text: string, supabase: any, fileRow: any, format?: string, bytes?: ArrayBuffer): Promise<ProcessResult> {
  const snpData: Record<string, string> = {};

  // --- FAST deterministic parse (always try first) -------------------------
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    const parts = line.split(/[\s,\t]+/);
    if (parts.length < 2) continue;
    const rsid = parts[0].trim();
    const genotype = parts[parts.length - 1].trim().toUpperCase();
    if (/^rs\d+$/.test(rsid) && /^[ACGT]{1,4}$/.test(genotype)) {
      snpData[rsid] = genotype;
    }
  }

  console.log(`Deterministic parsing found ${Object.keys(snpData).length} SNPs`);

  // --- QUICK AI text parsing if needed (not PDF vision) --------------------
  if (Object.keys(snpData).length < 50 && text.length > 100) {
    try {
      console.log("Running quick AI text parsing...");
      const aiSnps = await aiParseGeneticTable(text.slice(0, 10000)); // Limit text size for speed
      Object.assign(snpData, aiSnps);
      console.log(`AI text parsing added ${Object.keys(aiSnps).length} more SNPs`);
    } catch (error) {
      console.warn("AI text parsing failed:", error);
    }
  }

  // --- Save what we have immediately ----------------------------------------
  const highlights = extractHighlights(snpData);
  
  // DB insert with current data
  await saveGeneticData(supabase, fileRow, snpData, highlights);

  // --- Queue advanced AI processing if PDF and insufficient data ------------
  if (format === 'pdf' && Object.keys(snpData).length < 100 && bytes) {
    console.log("Queuing advanced PDF AI processing...");
    // Queue background processing (don't wait for it)
    queueAdvancedPDFProcessing(fileRow.id, bytes, supabase).catch(err => 
      console.error("Background PDF processing failed:", err)
    );
  }

  return {
    status: "ok",
    file_id: fileRow.id,
    highlights,
    snp_count: Object.keys(snpData).length,
    processing_mode: format === 'pdf' && Object.keys(snpData).length < 100 ? 'partial_with_background' : 'complete',
  } as ProcessResult;
}

function extractHighlights(snpData: Record<string, string>): Record<string, string | null> {
  const highlights: Record<string, string | null> = {};
  
  for (const snp of HIGHLIGHT_SNPS) {
    highlights[snp] = snpData[snp] ?? null;
  }
  
  // MTHFR variants
  if (snpData["rs1801133"]) {
    highlights["mthfr_c677t"] = snpData["rs1801133"];
  }
  if (snpData["rs1801131"]) {
    highlights["mthfr_a1298c"] = snpData["rs1801131"];
  }
  
  // APOE variant combo
  if (snpData["rs429358"] && snpData["rs7412"]) {
    highlights["apoe_variant"] = `${snpData["rs429358"]}/${snpData["rs7412"]}`;
  }
  
  // VDR variants
  const vdrVariants = [];
  if (snpData["rs2228570"]) vdrVariants.push(`rs2228570:${snpData["rs2228570"]}`);
  if (snpData["rs1544410"]) vdrVariants.push(`rs1544410:${snpData["rs1544410"]}`);
  if (vdrVariants.length > 0) {
    highlights["vdr_variants"] = vdrVariants;
  }
  
  // COMT variants
  if (snpData["rs4680"]) {
    highlights["comt_variants"] = [{ rs4680: snpData["rs4680"] }];
  }
  
  return highlights;
}

async function saveGeneticData(supabase: any, fileRow: any, snpData: Record<string, string>, highlights: Record<string, any>) {
  // Check available columns
  const { data: cols } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "genetic_markers");
  const COL_SET = new Set(cols?.map((c: any) => c.column_name) || []);

  const row: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    snp_data: snpData,
    source_company: detectSourceCompany(fileRow.file_name),
    created_at: new Date().toISOString(),
  };
  
  // Add highlight columns if they exist
  for (const [key, val] of Object.entries(highlights)) {
    if (COL_SET.has(key)) {
      row[key] = val;
    }
  }

  await supabase.from("genetic_markers").upsert(row, { onConflict: "file_id" });
}

function detectSourceCompany(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.includes('23andme')) return '23andMe';
  if (name.includes('ancestry')) return 'AncestryDNA';
  if (name.includes('myheritage')) return 'MyHeritage';
  if (name.includes('familytreedna')) return 'FamilyTreeDNA';
  if (name.includes('nebula')) return 'Nebula Genomics';
  return 'Unknown';
}

// Background processing function (async, doesn't block main response)
async function queueAdvancedPDFProcessing(fileId: string, bytes: ArrayBuffer, supabase: any) {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.warn("OPENAI_API_KEY not configured – advanced PDF processing skipped.");
    return;
  }

  try {
    console.log("Starting advanced PDF AI processing...");
    
    // Split PDF into smaller chunks for processing
    const chunks = await splitPDFIntoChunks(bytes);
    const allSnps: Record<string, string> = {};
    
    for (const [index, chunk] of chunks.entries()) {
      console.log(`Processing PDF chunk ${index + 1}/${chunks.length}...`);
      
      const chunkSnps = await processChunkWithAI(chunk, openaiApiKey);
      Object.assign(allSnps, chunkSnps);
      
      // Add small delay to avoid rate limits
      if (index < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Advanced PDF processing found ${Object.keys(allSnps).length} additional SNPs`);
    
    // Update the database with additional SNPs
    if (Object.keys(allSnps).length > 0) {
      const { data: existing } = await supabase
        .from("genetic_markers")
        .select("snp_data")
        .eq("file_id", fileId)
        .single();
      
      if (existing) {
        const combinedSnps = { ...existing.snp_data, ...allSnps };
        const newHighlights = extractHighlights(combinedSnps);
        
        await supabase
          .from("genetic_markers")
          .update({ 
            snp_data: combinedSnps,
            ...newHighlights 
          })
          .eq("file_id", fileId);
        
        console.log(`Updated genetic markers with ${Object.keys(combinedSnps).length} total SNPs`);
      }
    }
    
  } catch (error) {
    console.error("Advanced PDF processing failed:", error);
  }
}

async function splitPDFIntoChunks(bytes: ArrayBuffer): Promise<string[]> {
  // For now, just return the whole content as one chunk
  // In the future, we could implement actual PDF page splitting
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return [base64];
}

async function processChunkWithAI(base64Chunk: string, openaiApiKey: string): Promise<Record<string, string>> {
  try {
    const OpenAI = (await import("npm:openai@4.18.0")).default;
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const prompt = `Extract genetic SNP data from this document. Return ONLY a JSON object with rsID keys and genotype values. Example: {"rs1801133": "TT", "rs1801131": "CC"}. Only include valid rsIDs (rs + numbers) with 1-4 letter genotypes (A,C,G,T combinations).`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1500,
      messages: [
        { role: "system", content: prompt },
        { 
          role: "user", 
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Chunk}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(response.choices[0].message.content ?? "{}");
  } catch (error) {
    console.error("Error processing chunk with AI:", error);
    return {};
  }
} 
