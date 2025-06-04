// deno-lint-ignore-file
// @ts-nocheck
// genetic.ts - v1 2025-06-03
// Deterministic SNP parser + GPT fallback

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
];

export async function processGeneticFile(text: string, supabase: any, fileRow: any): Promise<ProcessResult> {
  const snpData: Record<string, string> = {};

  // --- deterministic parse --------------------------------------------------
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

  // --- AI fallback if needed -----------------------------------------------
  if (Object.keys(snpData).length < 50) {
    const aiSnps = await aiParseGeneticTable(text);
    Object.assign(snpData, aiSnps);
  }

  // Highlights
  const highlights: Record<string, string | null> = {};
  for (const snp of HIGHLIGHT_SNPS) {
    highlights[snp] = snpData[snp] ?? null;
  }
  // APOE variant combo
  if (snpData["rs429358"] && snpData["rs7412"]) {
    highlights["apoe_variant"] = `${snpData["rs429358"]}/${snpData["rs7412"]}`;
  }

  // DB safe insert -----------------------------------------------------------
  // Check columns present
  const { data: cols } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "genetic_markers");
  const COL_SET = new Set(cols?.map((c: any) => c.column_name));

  const row: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    snp_data: snpData,
    highlights,
    created_at: new Date().toISOString(),
  };
  // add highlight columns if they exist
  for (const [key, val] of Object.entries(highlights)) {
    if (COL_SET.has(key)) row[key] = val;
  }

  await supabase.from("genetic_markers").upsert(row, { onConflict: "file_id" });

  return {
    status: "ok",
    file_id: fileRow.id,
    highlights,
    db_columns_used: Object.keys(row),
    skipped_columns: [],
  } as ProcessResult;
} 
