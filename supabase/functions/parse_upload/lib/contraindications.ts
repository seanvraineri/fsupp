// deno-lint-ignore-file
// @ts-nocheck
// contraindications.ts - minimal demo rules mapping biomarkers / snps to user_flags

import type { ProcessResult } from "../index.ts";

export async function deriveContraindications(userId: string, result: ProcessResult, supabase: any) {
  const flags: string[] = [];

  // Genetic highlights
  if (result.highlights) {
    if (result.highlights["rs1801133"] === "TT") flags.push("mthfr_c677t_homozygous");
    if (result.highlights["apoe_variant"]?.includes("4")) flags.push("apoe_e4_carrier");
  }

  // Biomarker thresholds (example rules)
  if (result.biomarkers) {
    if ((result.biomarkers["vitamin_d"] ?? 50) < 30) flags.push("low_vitamin_d");
    if ((result.biomarkers["iron"] ?? 100) > 200) flags.push("high_iron");
  }

  if (flags.length === 0) return;

  for (const flag of flags) {
    await supabase.from("user_flags").upsert({ user_id: userId, flag }, { onConflict: "user_id,flag" });
  }
} 
