// deno-lint-ignore-file
// @ts-nocheck
// lab.ts - v1 2025-06-03
// Deterministic lab parser (txt/csv/pdf) with AI fallback

import { aiParseLabText, aiVisionPdf } from "./ai.ts";
import type { FileFormat } from "./detectFileType.ts";
import type { ProcessResult } from "../index.ts";

export async function processLabFile(format: FileFormat, bytes: ArrayBuffer, text: string, supabase: any, fileRow: any): Promise<ProcessResult> {
  let plainText = text;

  // If PDF, attempt basic extraction via pdfjs – fallback to AI vision
  if (format === "pdf") {
    try {
      const pdfjs = await import("https://esm.sh/pdfjs-dist@4.2.59?no-check");
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      let pagesText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const txt = await (await page.getTextContent()).items.map((it:any)=>it.str).join(" ");
        pagesText += "\n" + txt;
      }
      plainText = pagesText;
    } catch (e) {
      console.warn("pdfjs failed, using AI vision", e);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      plainText = await aiVisionPdf(base64);
    }
  }

  // deterministic regex parse ------------------------------------------------
  const biomarkerMap: Record<string, number> = {};
  const lineRegex = /([A-Za-z0-9_ \-]{3,40})[:\t, ]+(-?\d+(?:\.\d+)?)/g;
  let match;
  for (const line of plainText.split(/\r?\n/)) {
    lineRegex.lastIndex = 0;
    while ((match = lineRegex.exec(line)) !== null) {
      const name = sanitizeBiomarkerName(match[1]);
      const val = parseFloat(match[2]);
      if (!isNaN(val) && name) biomarkerMap[name] = val;
    }
  }

  // AI fallback if very few biomarkers
  if (Object.keys(biomarkerMap).length < 3) {
    const aiBio = await aiParseLabText(plainText);
    Object.assign(biomarkerMap, aiBio);
  }

  // DB column check ----------------------------------------------------------
  const { data: cols } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "lab_biomarkers");
  const COL_SET = new Set(cols?.map((c:any)=>c.column_name));

  const mapped: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    biomarker_data: biomarkerMap,
    created_at: new Date().toISOString(),
  };
  const skipped: string[] = [];
  for (const [k,v] of Object.entries(biomarkerMap)) {
    if (COL_SET.has(k)) mapped[k] = v; else skipped.push(k);
  }

  await supabase.from("lab_biomarkers").upsert(mapped, { onConflict: "file_id" });

  return {
    status:"ok",
    file_id: fileRow.id,
    biomarkers: biomarkerMap,
    db_columns_used: Object.keys(mapped),
    skipped_columns: skipped,
  } as ProcessResult;
}

function sanitizeBiomarkerName(raw:string):string{
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
} 