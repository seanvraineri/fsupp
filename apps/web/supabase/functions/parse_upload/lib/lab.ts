// deno-lint-ignore-file
// @ts-nocheck
// lab.ts - v2 2025-06-06
// Comprehensive lab parser (txt/csv/pdf/zip) with aggressive extraction

import { aiParseLabText, aiVisionPdf } from "./ai.ts";
import type { FileFormat } from "./detectFileType.ts";
import type { ProcessResult } from "../index.ts";

export async function processLabFile(format: FileFormat, bytes: ArrayBuffer, text: string, supabase: any, fileRow: any): Promise<ProcessResult> {
  let plainText = text;
  const biomarkerMap: Record<string, number> = {};

  // Extract text content based on format ===================================
  if (format === "pdf") {
    plainText = await extractPdfText(bytes);
  } else if (format === "zip") {
    plainText = await extractZipContents(bytes);
  }

  console.log('Processing text length:', plainText.length);
  console.log('Sample:', plainText.slice(0, 500));

  // COMPREHENSIVE EXTRACTION LIKE CLAUDE PDF ANALYSIS ==================
  
  // Strategy 1: AI extraction FIRST (most comprehensive - like Claude analyzing a PDF)
  await extractWithAI(plainText, biomarkerMap);
  
  // Strategy 2: Deterministic regex patterns (fill any gaps AI missed)
  extractWithRegexPatterns(plainText, biomarkerMap);
  
  // Strategy 3: Sequential line-by-line parsing (catch edge cases)
  extractSequentialValues(plainText, biomarkerMap);
  
  // Strategy 4: Table structure detection (final safety net)
  extractTableStructure(plainText, biomarkerMap);

  console.log('Total biomarkers extracted:', Object.keys(biomarkerMap).length);
  console.log('Biomarkers:', Object.keys(biomarkerMap));

  // Save to database ======================================================
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

  // Vector embeddings ===================================================
  try {
    const allBiomarkers = Object.keys(biomarkerMap);
    const biomarkerCount = allBiomarkers.length;
    
    // Create summary with dynamic sampling
    const headlineKeys = biomarkerCount <= 50 ? allBiomarkers : allBiomarkers.slice(0, 30);
    const summary = `Lab file ${fileRow.file_name} parsed ${biomarkerCount.toLocaleString()} biomarkers. Sample: ${headlineKeys.map(k=>`${k}:${biomarkerMap[k]}`).join('; ')}${biomarkerCount > 30 ? ` +${biomarkerCount - 30} more` : ''}`;
    
    const items = [
      { user_id: fileRow.user_id, source_type: 'lab_summary', source_id: fileRow.id, content: summary }
    ];
    
    // Store ALL biomarkers in embeddings, no limits
    for (const [k,v] of Object.entries(biomarkerMap)) {
      items.push({ user_id: fileRow.user_id, source_type: 'lab', source_id: fileRow.id, content: `${k}: ${v}` });
    }
    
    console.log(`Creating ${items.length} embedding items for ${biomarkerCount} biomarkers`);
    await supabase.functions.invoke('embedding_worker', { body: { items } });
  } catch(err) {
    console.error('embedding_worker error (lab)', err);
  }

  return {
    status:"ok",
    file_id: fileRow.id,
    biomarkers: biomarkerMap,
    db_columns_used: Object.keys(mapped),
    skipped_columns: skipped,
  } as ProcessResult;
}

// EXTRACTION FUNCTIONS ===================================================

async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  try {
    const pdfjs = await import("https://esm.sh/pdfjs-dist@4.2.59?no-check");
    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let pagesText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item:any) => item.str).join(" ");
      pagesText += "\n" + pageText;
    }
    return pagesText;
  } catch (e) {
    console.error("PDF extraction failed:", e);
    return '';
  }
}

async function extractZipContents(bytes: ArrayBuffer): Promise<string> {
  try {
    // Use JSZip for ZIP extraction
    const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(bytes);
    
    let allText = '';
    for (const [filename, file] of Object.entries(zipFile.files)) {
      if (!file.dir && (filename.endsWith('.txt') || filename.endsWith('.csv'))) {
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

function extractWithRegexPatterns(text: string, biomarkerMap: Record<string, number>): void {
  const patterns = [
    // Pattern 1: "Name: Value" or "Name Value"
    /([A-Za-z][A-Za-z0-9\s\-_,()]{2,50})\s*[:=]\s*([<>]?\s*\d+(?:\.\d+)?)/g,
    // Pattern 2: "Name mg/dL Value" 
    /([A-Za-z][A-Za-z0-9\s\-_,()]{2,50})\s+(?:mg\/dL|mmol\/L|IU\/L|ng\/mL|pg\/mL|g\/dL|%|cells\/uL|thousand\/uL|million\/uL)\s+([<>]?\s*\d+(?:\.\d+)?)/gi,
    // Pattern 3: "Value mg/dL Name"
    /([<>]?\s*\d+(?:\.\d+)?)\s+(?:mg\/dL|mmol\/L|IU\/L|ng\/mL|pg\/mL|g\/dL|%)\s+([A-Za-z][A-Za-z0-9\s\-_,()]{2,50})/gi,
    // Pattern 4: Standalone numbers after biomarker names
    /([A-Za-z][A-Za-z0-9\s\-_,()]{2,50})\s+([<>]?\s*\d+(?:\.\d+)?)\s*(?:HIGH|LOW|NORMAL)?/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, name, value] = match;
      const cleanName = sanitizeBiomarkerName(name);
      const numValue = parseFloat(value.replace(/[<>]/g, ''));
      if (!isNaN(numValue) && cleanName && cleanName.length > 2) {
        biomarkerMap[cleanName] = numValue;
      }
    }
  }
}

function extractSequentialValues(text: string, biomarkerMap: Record<string, number>): void {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let pendingHeader: string | null = null;
  
  const skipRegex = /^(desired range|unit|reference range|see note|result|collected date|patient|dob|sex|specimen|laboratory|doctor|phone|\d+\/\d+\/\d+|page \d+)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is purely numeric (with optional flags)
    const numericMatch = line.match(/^([<>]?\s*\d+(?:\.\d+)?)\s*(?:HIGH|LOW|NORMAL|\*)?$/i);
    
    if (numericMatch && pendingHeader) {
      const value = parseFloat(numericMatch[1].replace(/[<>]/g, ''));
      if (!isNaN(value)) {
        biomarkerMap[pendingHeader] = value;
      }
      pendingHeader = null;
      continue;
    }
    
    // Check if this line looks like a biomarker header
    if (!numericMatch && line.length > 2 && /[A-Za-z]/.test(line) && !skipRegex.test(line)) {
      const cleanName = sanitizeBiomarkerName(line);
      if (cleanName && cleanName.length > 2) {
        pendingHeader = cleanName;
      }
    }
  }
}

function extractTableStructure(text: string, biomarkerMap: Record<string, number>): void {
  const lines = text.split(/\r?\n/);
  
  for (const line of lines) {
    // Look for table-like structures with multiple columns
    const columns = line.split(/\s{2,}|\t/); // Split on multiple spaces or tabs
    
    if (columns.length >= 2) {
      for (let i = 0; i < columns.length - 1; i++) {
        const nameCol = columns[i].trim();
        const valueCol = columns[i + 1].trim();
        
        const valueMatch = valueCol.match(/^([<>]?\s*\d+(?:\.\d+)?)/);
        if (valueMatch && nameCol.length > 2 && /[A-Za-z]/.test(nameCol)) {
          const cleanName = sanitizeBiomarkerName(nameCol);
          const value = parseFloat(valueMatch[1].replace(/[<>]/g, ''));
          if (!isNaN(value) && cleanName) {
            biomarkerMap[cleanName] = value;
          }
        }
      }
    }
  }
}

async function extractWithAI(text: string, biomarkerMap: Record<string, number>): Promise<void> {
  try {
    const aiBio = await aiParseLabText(text);
    console.log('AI extracted biomarkers:', Object.keys(aiBio || {}).length);
    
    if (aiBio && typeof aiBio === 'object') {
      const source = 'biomarker_measurements' in aiBio && typeof aiBio.biomarker_measurements === 'object'
        ? aiBio.biomarker_measurements as Record<string, number>
        : aiBio as Record<string, number>;
        
      for (const [k, v] of Object.entries(source)) {
        const num = Number(v);
        if (!isNaN(num) && num !== null && num !== undefined) {
          const cleanName = sanitizeBiomarkerName(k);
          if (cleanName) {
            biomarkerMap[cleanName] = num;
          }
        }
      }
    }
  } catch (err) {
    console.error('AI extraction failed:', err);
  }
}

function sanitizeBiomarkerName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .replace(/_{2,}/g, "_");
} 
