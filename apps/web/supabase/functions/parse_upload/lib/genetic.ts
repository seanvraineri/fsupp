// deno-lint-ignore-file
// @ts-nocheck
// genetic.ts - v2 2025-06-06
// Comprehensive genetic parser (txt/csv/zip) with aggressive SNP extraction

import { aiParseGeneticTable } from "./ai.ts";
import type { FileFormat } from "./detectFileType.ts";
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

export async function processGeneticFile(text: string, supabase: any, fileRow: any, format: FileFormat, bytes: ArrayBuffer): Promise<ProcessResult> {
  let plainText = text;
  const snpMap: Record<string, string> = {};

  // Extract text content for ZIP files
  if (format === "zip") {
    plainText = await extractZipContents(bytes);
  }

  console.log('Processing genetic text length:', plainText.length);
  console.log('Sample:', plainText.slice(0, 500));

  // AGGRESSIVE MULTI-STRATEGY SNP PARSING =================================
  
  // Strategy 1: Standard rs-ID patterns
  extractRsIdPatterns(plainText, snpMap);
  
  // Strategy 2: Tabular data extraction
  extractTabularData(plainText, snpMap);
  
  // Strategy 3: CSV/TSV structure parsing
  extractStructuredData(plainText, snpMap);
  
  // Strategy 4: AI extraction for complex formats
  await extractWithAI(plainText, snpMap);

  console.log('Total SNPs extracted:', Object.keys(snpMap).length);
  console.log('Sample SNPs:', Object.keys(snpMap).slice(0, 10));

  // Save to database ======================================================
  const highlights = extractHighlights(snpMap);
  await saveGeneticData(supabase, fileRow, snpMap, highlights);

  // Vector embeddings =====================================================
  try {
    const allSnps = Object.entries(snpMap);
    const snpCount = allSnps.length;
    
    // Create summary with dynamic sampling
    const sampleSnps = snpCount <= 100 ? allSnps : allSnps.slice(0, 50);
    const summary = `Genetic file ${fileRow.file_name} parsed ${snpCount.toLocaleString()} SNPs. Sample: ${sampleSnps.map(([rs, gt]) => `${rs}:${gt}`).join('; ')}${snpCount > 50 ? ` +${snpCount - 50} more` : ''}`;
    
    const items = [
      { user_id: fileRow.user_id, source_type: 'genetic_summary', source_id: fileRow.id, content: summary }
    ];
    
    // Store ALL SNPs in embeddings, no limits
    for (const [rsid, genotype] of allSnps) {
      items.push({ user_id: fileRow.user_id, source_type: 'genetic', source_id: fileRow.id, content: `${rsid}: ${genotype}` });
    }
    
    console.log(`Creating ${items.length} embedding items for ${snpCount} SNPs`);
    await supabase.functions.invoke('embedding_worker', { body: { items } });
  } catch (err) {
    console.error('embedding_worker error (genetic)', err);
  }

  return {
    status: "ok",
    file_id: fileRow.id,
    highlights,
    snp_count: Object.keys(snpMap).length,
    sample_snps: Object.fromEntries(Object.entries(snpMap).slice(0, 10)),
  } as ProcessResult;
}

// EXTRACTION FUNCTIONS ===================================================

async function extractZipContents(bytes: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(bytes);
    
    let allText = '';
    for (const [filename, file] of Object.entries(zipFile.files)) {
      if (!file.dir && (filename.endsWith('.txt') || filename.endsWith('.csv') || filename.includes('genetic'))) {
        const content = await file.async('text');
        allText += `\n\n=== ${filename} ===\n${content}`;
      }
    }
    return allText;
  } catch (e) {
    console.error("ZIP extraction failed:", e);
    return '';
  }
}

function extractRsIdPatterns(text: string, snpMap: Record<string, string>): void {
  const patterns = [
    // Pattern 1: rs123456\tAA or rs123456 AA
    /(rs\d+)[\s\t]+([ATCGDI-]{1,4})/gi,
    // Pattern 2: rs123456,AA or rs123456;AA  
    /(rs\d+)[,;]([ATCGDI-]{1,4})/gi,
    // Pattern 3: rs123456:AA
    /(rs\d+):([ATCGDI-]{1,4})/gi,
    // Pattern 4: rs123456 = AA
    /(rs\d+)\s*=\s*([ATCGDI-]{1,4})/gi,
    // Pattern 5: Quote-wrapped formats
    /"(rs\d+)"\s*[,\t]\s*"([ATCGDI-]{1,4})"/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, rsid, genotype] = match;
      if (rsid && genotype && genotype.length <= 4) {
        snpMap[rsid.toLowerCase()] = genotype.toUpperCase();
      }
    }
  }
}

function extractTabularData(text: string, snpMap: Record<string, string>): void {
  const lines = text.split(/\r?\n/);
  
  for (const line of lines) {
    // Split by common delimiters
    const columns = line.split(/[\t,;|]/).map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length >= 2) {
      for (let i = 0; i < columns.length - 1; i++) {
        const col1 = columns[i];
        const col2 = columns[i + 1];
        
        // Check if first column is rs-ID and second is genotype
        if (/^rs\d+$/i.test(col1) && /^[ATCGDI-]{1,4}$/i.test(col2)) {
          snpMap[col1.toLowerCase()] = col2.toUpperCase();
        }
      }
    }
  }
}

function extractStructuredData(text: string, snpMap: Record<string, string>): void {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Look for header row to identify column positions
  let rsidCol = -1;
  let genotypeCol = -1;
  
  for (let lineIdx = 0; lineIdx < Math.min(5, lines.length); lineIdx++) {
    const line = lines[lineIdx];
    const columns = line.split(/[\t,;|]/).map(col => col.trim().toLowerCase());
    
    // Check for common header patterns
    rsidCol = columns.findIndex(col => 
      col.includes('rsid') || col.includes('snp') || col.includes('variant') || col.includes('rs_id')
    );
    genotypeCol = columns.findIndex(col => 
      col.includes('genotype') || col.includes('allele') || col.includes('call') || col.includes('gt')
    );
    
    if (rsidCol >= 0 && genotypeCol >= 0) {
      // Process data rows
      for (let dataIdx = lineIdx + 1; dataIdx < lines.length; dataIdx++) {
        const dataLine = lines[dataIdx];
        const dataCols = dataLine.split(/[\t,;|]/).map(col => col.trim().replace(/"/g, ''));
        
        if (dataCols.length > Math.max(rsidCol, genotypeCol)) {
          const rsid = dataCols[rsidCol];
          const genotype = dataCols[genotypeCol];
          
          if (/^rs\d+$/i.test(rsid) && /^[ATCGDI-]{1,4}$/i.test(genotype)) {
            snpMap[rsid.toLowerCase()] = genotype.toUpperCase();
          }
        }
      }
      break;
    }
  }
}

async function extractWithAI(text: string, snpMap: Record<string, string>): Promise<void> {
  try {
    const aiSnps = await aiParseGeneticTable(text);
    console.log('AI extracted SNPs:', Object.keys(aiSnps || {}).length);
    
    if (aiSnps && typeof aiSnps === 'object') {
      for (const [rsid, genotype] of Object.entries(aiSnps)) {
        if (/^rs\d+$/i.test(rsid) && typeof genotype === 'string' && /^[ATCGDI-]{1,4}$/i.test(genotype)) {
          snpMap[rsid.toLowerCase()] = genotype.toUpperCase();
        }
      }
    }
  } catch (err) {
    console.error('AI extraction failed (genetic):', err);
  }
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
  const row: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    snp_data: snpData,
    source_company: detectSourceCompany(fileRow.file_name),
    created_at: new Date().toISOString(),
  };
  
  // Add highlight columns
  if (highlights.mthfr_c677t) row.mthfr_c677t = highlights.mthfr_c677t;
  if (highlights.mthfr_a1298c) row.mthfr_a1298c = highlights.mthfr_a1298c;
  if (highlights.apoe_variant) row.apoe_variant = highlights.apoe_variant;
  if (highlights.vdr_variants) row.vdr_variants = highlights.vdr_variants;
  if (highlights.comt_variants) row.comt_variants = highlights.comt_variants;

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
        
        console.log(`