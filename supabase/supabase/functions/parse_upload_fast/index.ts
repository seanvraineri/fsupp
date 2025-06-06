import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// Fast processing constants
const HIGHLIGHT_SNPS = [
  "rs1801133", // MTHFR C677T
  "rs1801131", // MTHFR A1298C
  "rs429358", // APOE
  "rs7412", // APOE
  "rs2228570", // VDR
  "rs1544410", // VDR
  "rs4680", // COMT
];

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co";
    const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.DZzvM9eC_4sDcTjndvdPEKVPJgJBg8-rB9M9Ax_DzCI";
    
    console.log('FAST PROCESSING WITH AI - Using hardcoded connection values');

    let body: { path?: string; file_id?: string; bucket?: string; file_type?: 'genetic' | 'lab_results' };
    try {
      body = await req.json();
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    
    const { path, file_id, bucket = 'uploads', file_type } = body;
    console.log('FAST PROCESSING WITH AI - Request body:', { path, file_id, bucket, file_type });
    
    if (!path && !file_id) {
      return new Response('Missing path or file_id parameter', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log('FAST PROCESSING WITH AI - Supabase client created');
    
    // Get file row - either by path or by file_id
    let fileRow: any;
    let storagePath: string;
    
    if (file_id) {
      console.log('FAST PROCESSING WITH AI - Looking up file by ID:', file_id);
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', file_id)
        .single();
      
      console.log('FAST PROCESSING WITH AI - File lookup result:', { fileData, frErr });
      
      if (frErr || !fileData) {
        console.error('FAST PROCESSING WITH AI - File not found by file_id:', frErr);
        return new Response(`FAST PROCESSING WITH AI - File not found by file_id: ${frErr?.message || 'No data'}`, { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = fileRow.storage_path;
    } else {
      // Look up by path (legacy behavior)
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('storage_path', path)
        .single();
      
      if (frErr || !fileData) {
        return new Response(`FAST PROCESSING WITH AI - File not found by path: ${frErr?.message || 'No data'}`, { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = path!;
    }
    
    console.log('FAST PROCESSING WITH AI - File found:', { id: fileRow.id, storage_path: storagePath });
    
    // Determine file_type if not provided
    const determinedFileType = file_type || fileRow.file_type;
    if (!determinedFileType) {
      return new Response('Unable to determine file_type', { status: 400 });
    }

    // Mark as processing
    await supabase
      .from('uploaded_files')
      .update({ 
        processing_status: 'processing', 
        processing_started_at: new Date().toISOString() 
      })
      .eq('id', fileRow.id);

    // Download file
    const { data: download, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(storagePath);
    
    if (dlErr || !download) {
      await supabase.from('uploaded_files').update({ 
        processing_status: 'failed', 
        processing_error: `Download failed: ${dlErr?.message || 'Unknown error'}`,
        processing_completed_at: new Date().toISOString()
      }).eq('id', fileRow.id);
      return new Response('Download failed', { status: 500 });
    }

    const arrayBuf = await download.arrayBuffer();
    
    // Simple file type detection
    const uint8 = new Uint8Array(arrayBuf);
    const isPdf = uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46;
    const format = isPdf ? 'pdf' : 'txt';
    
    let result: any;
    
    if (determinedFileType === 'genetic') {
      result = await processGeneticFileWithAI(arrayBuf, format, supabase, fileRow);
    } else {
      result = await processLabFileWithAI(arrayBuf, format, supabase, fileRow);
    }
    
    await supabase.from('uploaded_files').update({ 
      processing_status: 'completed',
      processing_completed_at: new Date().toISOString()
    }).eq('id', fileRow.id);
    
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('FAST PROCESSING WITH AI - Error:', err);
    return new Response(`FAST PROCESSING WITH AI - Processing failed: ${String(err)}`, { status: 500 });
  }
});

// Enhanced genetic processing with AI for PDFs
async function processGeneticFileWithAI(arrayBuf: ArrayBuffer, format: string, supabase: any, fileRow: any) {
  const text = new TextDecoder().decode(arrayBuf);
  const snpData: Record<string, string> = {};

  // Fast deterministic parsing first (for raw data files)
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

  console.log(`FAST PROCESSING WITH AI - Deterministic parsing found ${Object.keys(snpData).length} SNPs`);

  // If deterministic parsing found few SNPs and it's a PDF, use AI
  if (Object.keys(snpData).length < 10 && format === 'pdf') {
    console.log('FAST PROCESSING WITH AI - Using AI to parse PDF genetic report...');
    const aiSnps = await parseGeneticPDFWithAI(text);
    Object.assign(snpData, aiSnps);
    console.log(`FAST PROCESSING WITH AI - AI parsing found ${Object.keys(aiSnps).length} additional SNPs`);
  }

  // Extract highlights
  const highlights = extractHighlights(snpData);
  
  // Save to database immediately
  await saveGeneticData(supabase, fileRow, snpData, highlights);

  return {
    status: "ok",
    file_id: fileRow.id,
    highlights,
    snp_count: Object.keys(snpData).length,
    processing_mode: format === 'pdf' ? 'ai_enhanced' : 'deterministic',
  };
}

// Enhanced lab processing with AI for PDFs
async function processLabFileWithAI(arrayBuf: ArrayBuffer, format: string, supabase: any, fileRow: any) {
  const text = new TextDecoder().decode(arrayBuf);
  const biomarkerMap: Record<string, number> = {};

  if (format === 'pdf') {
    console.log('FAST PROCESSING WITH AI - Using AI to parse PDF lab report...');
    const aiBiomarkers = await parseLabPDFWithAI(text);
    Object.assign(biomarkerMap, aiBiomarkers);
  } else {
    // Simple regex parsing for text files
    const lineRegex = /([A-Za-z0-9_ \-]{3,40})[:\t, ]+(-?\d+(?:\.\d+)?)/g;
    let match;
    for (const line of text.split(/\r?\n/)) {
      lineRegex.lastIndex = 0;
      while ((match = lineRegex.exec(line)) !== null) {
        const name = sanitizeBiomarkerName(match[1]);
        const val = parseFloat(match[2]);
        if (!isNaN(val) && name) biomarkerMap[name] = val;
      }
    }
  }

  console.log(`FAST PROCESSING WITH AI - Found ${Object.keys(biomarkerMap).length} biomarkers`);

  // Save to database
  const mapped: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    biomarker_data: biomarkerMap,
    created_at: new Date().toISOString(),
  };

  await supabase.from("lab_biomarkers").upsert(mapped, { onConflict: "file_id" });

  return {
    status: "ok",
    file_id: fileRow.id,
    biomarkers: biomarkerMap,
    biomarker_count: Object.keys(biomarkerMap).length,
  };
}

// AI function to parse genetic PDF reports
async function parseGeneticPDFWithAI(text: string): Promise<Record<string, string>> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.warn("OPENAI_API_KEY not configured – AI parsing skipped.");
    return {};
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a genetic data extraction expert. Extract SNP data from genetic test reports.
            
Output ONLY a JSON object with rsID as keys and genotypes as values:
{"rs1801133": "CT", "rs1801131": "AA", "rs429358": "CC"}

Rules:
- Only include valid rsIDs (rs followed by numbers)
- Only include valid genotypes (combinations of A, T, G, C)
- Focus on clinically relevant SNPs like MTHFR, APOE, COMT, VDR
- If no SNPs found, return empty object {}`
          },
          {
            role: "user",
            content: `Extract genetic variants from this report:\n\n${text.slice(0, 8000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON response
    const snpData = JSON.parse(content);
    return snpData || {};
  } catch (error) {
    console.error("AI genetic parsing failed:", error);
    return {};
  }
}

// AI function to parse lab PDF reports
async function parseLabPDFWithAI(text: string): Promise<Record<string, number>> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.warn("OPENAI_API_KEY not configured – AI parsing skipped.");
    return {};
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a medical lab data extraction expert. Extract biomarker values from lab reports.

Output ONLY a JSON object with biomarker names as keys and numeric values:
{"vitamin_d": 35.2, "vitamin_b12": 450, "iron": 95, "testosterone": 520}

Rules:
- Use lowercase, underscore-separated names
- Only include numeric values (no units, ranges, or text)
- Focus on common biomarkers: vitamins, hormones, minerals, lipids
- If no values found, return empty object {}`
          },
          {
            role: "user",
            content: `Extract lab values from this report:\n\n${text.slice(0, 8000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON response
    const biomarkerData = JSON.parse(content);
    return biomarkerData || {};
  } catch (error) {
    console.error("AI lab parsing failed:", error);
    return {};
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
  
  return highlights;
}

async function saveGeneticData(supabase: any, fileRow: any, snpData: Record<string, string>, highlights: Record<string, any>) {
  const row: Record<string, unknown> = {
    user_id: fileRow.user_id,
    file_id: fileRow.id,
    snp_data: snpData,
    source_company: detectSourceCompany(fileRow.file_name),
    created_at: new Date().toISOString(),
    ...highlights
  };

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

function sanitizeBiomarkerName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
} 