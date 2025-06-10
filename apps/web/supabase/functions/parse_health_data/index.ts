// deno-lint-ignore-file no-explicit-any
// @ts-nocheck - Disable TypeScript checking for Deno runtime code
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { parse } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Essential gene reference data from generate_analysis function
const geneReferences = [
  { gene: 'MTHFR', rsids: ['rs1801133', 'rs1801131'] },
  { gene: 'COMT', rsids: ['rs4680'] },
  { gene: 'VDR', rsids: ['rs2228570', 'rs1544410', 'rs7975232'] },
  { gene: 'APOE', rsids: ['rs429358', 'rs7412'] },
  { gene: 'FADS1', rsids: ['rs174547'] },
  { gene: 'FADS2', rsids: ['rs174575'] },
  { gene: 'GST', rsids: ['rs1695', 'rs366631'] },
  { gene: 'SOD2', rsids: ['rs4880'] },
  { gene: 'FUT2', rsids: ['rs601338'] },
  { gene: 'TCN2', rsids: ['rs1801198'] }
];

// Comprehensive SNP list (60+ variants matching generate_analysis)
const targetSNPs = [
  // METHYLATION & FOLATE PATHWAY
  'rs1801133', 'rs1801131', 'rs1805087', 'rs1801394', 'rs2236225',
  'rs1979277', 'rs3733890', 'rs70991108', 'rs34743033', 'rs819147',
  'rs1051266', 'rs2071010',
  // NEUROTRANSMITTER & MOOD
  'rs4680', 'rs6323', 'rs6265', 'rs6313', 'rs6295', 'rs25531',
  'rs5569', 'rs40184', 'rs1800497', 'rs1800955', 'rs1800532',
  'rs4570625', 'rs1611115',
  // DETOXIFICATION & ANTIOXIDANTS
  'rs366631', 'rs17856199', 'rs1695', 'rs3957357', 'rs4880',
  'rs4998557', 'rs1050450', 'rs1800566', 'rs1001179', 'rs2071746',
  'rs662', 'rs1051740',
  // VITAMIN METABOLISM & TRANSPORT
  'rs2228570', 'rs1544410', 'rs7975232', 'rs10741657', 'rs10877012',
  'rs6013897', 'rs2282679', 'rs12785878', 'rs601338', 'rs1801198',
  'rs1801222', 'rs2287921', 'rs7501331', 'rs33972313', 'rs6596473',
  // IRON METABOLISM
  'rs1800562', 'rs1799945', 'rs855791', 'rs3811647', 'rs7385804', 'rs11568350',
  // CARDIOVASCULAR & LIPIDS
  'rs429358', 'rs7412', 'rs174547', 'rs174575', 'rs6511720',
  'rs11591147', 'rs708272', 'rs1800588', 'rs4646994', 'rs699',
  // DRUG/SUPPLEMENT METABOLISM
  'rs762551', 'rs1065852', 'rs4244285', 'rs2740574', 'rs8175347',
  'rs4149056', 'rs1045642', 'rs1801280',
  // INFLAMMATION & IMMUNE
  'rs1800795', 'rs16944', 'rs1800629', 'rs1205', 'rs20417',
  // OTHER IMPORTANT PATHWAYS
  'rs234706', 'rs7946', 'rs671', 'rs5751876', 'rs1801260'
];

// Comprehensive biomarker reference ranges (matching your database schema)
const biomarkerRanges = {
  // === VITAMINS (Fat-Soluble) ===
  'vitamin_d': { min: 30, max: 100, unit: 'ng/mL', aliases: ['25-oh-d', '25ohd', '25-hydroxyvitamin-d', 'calcidiol', 'vitamin-d-25-oh'] },
  'vitamin_d_1_25': { min: 20, max: 79, unit: 'pg/mL', aliases: ['1,25-dihydroxyvitamin-d', 'calcitriol', 'active-vitamin-d'] },
  'vitamin_a': { min: 30, max: 65, unit: 'mcg/dL', aliases: ['retinol', 'retinol-binding-protein'] },
  'vitamin_e': { min: 12, max: 20, unit: 'mg/L', aliases: ['tocopherol', 'alpha-tocopherol', 'gamma-tocopherol'] },
  'vitamin_k': { min: 0.4, max: 2.0, unit: 'ng/mL', aliases: ['phylloquinone', 'vitamin-k1'] },
  'vitamin_k2': { min: 0.5, max: 5.0, unit: 'ng/mL', aliases: ['menaquinone', 'mk-7', 'mk-4'] },
  
  // === VITAMINS (Water-Soluble) ===
  'vitamin_c': { min: 11, max: 20, unit: 'mg/L', aliases: ['ascorbic-acid', 'ascorbate'] },
  'thiamine': { min: 70, max: 180, unit: 'nmol/L', aliases: ['b1', 'vitamin-b1', 'thiamin'] },
  'riboflavin': { min: 6.2, max: 39, unit: 'nmol/L', aliases: ['b2', 'vitamin-b2'] },
  'niacin': { min: 14, max: 50, unit: 'mcg/mL', aliases: ['b3', 'vitamin-b3', 'nicotinic-acid', 'nicotinamide'] },
  'pantothenic_acid': { min: 1.8, max: 6.0, unit: 'mg/L', aliases: ['b5', 'vitamin-b5', 'pantothenate'] },
  'pyridoxine': { min: 20, max: 125, unit: 'nmol/L', aliases: ['b6', 'vitamin-b6', 'pyridoxal', 'pyridoxal-5-phosphate', 'p5p'] },
  'biotin': { min: 400, max: 1200, unit: 'ng/L', aliases: ['b7', 'vitamin-b7', 'vitamin-h'] },
  'folate': { min: 5.4, max: 24, unit: 'ng/mL', aliases: ['folic-acid', 'vitamin-b9', 'b9', 'methylfolate'] },
  'folate_rbc': { min: 280, max: 1500, unit: 'ng/mL', aliases: ['red-cell-folate', 'rbc-folate'] },
  'vitamin_b12': { min: 300, max: 900, unit: 'pg/mL', aliases: ['b12', 'cobalamin', 'vitamin-b12', 'methylcobalamin'] },
  'methylmalonic_acid': { min: 0, max: 0.4, unit: 'umol/L', aliases: ['mma', 'methylmalonate'] },
  'choline': { min: 7, max: 20, unit: 'umol/L', aliases: ['phosphatidylcholine'] },
  
  // === MINERALS ===
  'calcium': { min: 8.5, max: 10.5, unit: 'mg/dL', aliases: ['ca', 'serum-calcium'] },
  'calcium_ionized': { min: 4.5, max: 5.3, unit: 'mg/dL', aliases: ['ionized-calcium', 'free-calcium'] },
  'magnesium': { min: 1.8, max: 2.6, unit: 'mg/dL', aliases: ['mg', 'serum-magnesium'] },
  'magnesium_rbc': { min: 4.2, max: 6.8, unit: 'mg/dL', aliases: ['rbc-magnesium', 'red-blood-cell-magnesium'] },
  'phosphorus': { min: 2.5, max: 4.5, unit: 'mg/dL', aliases: ['phosphate', 'po4'] },
  'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', aliases: ['k', 'serum-potassium'] },
  'sodium': { min: 136, max: 145, unit: 'mEq/L', aliases: ['na', 'serum-sodium'] },
  'chloride': { min: 96, max: 106, unit: 'mEq/L', aliases: ['cl', 'serum-chloride'] },
  'iron': { min: 60, max: 170, unit: 'mcg/dL', aliases: ['fe', 'serum-iron'] },
  'ferritin': { min: 30, max: 400, unit: 'ng/mL', aliases: ['iron-stores', 'serum-ferritin'] },
  'tibc': { min: 250, max: 450, unit: 'mcg/dL', aliases: ['total-iron-binding-capacity'] },
  'transferrin': { min: 200, max: 360, unit: 'mg/dL', aliases: ['transferrin-saturation'] },
  'zinc': { min: 70, max: 120, unit: 'mcg/dL', aliases: ['zn', 'serum-zinc'] },
  'zinc_rbc': { min: 11, max: 18, unit: 'mg/L', aliases: ['rbc-zinc', 'red-cell-zinc'] },
  'copper': { min: 70, max: 140, unit: 'mcg/dL', aliases: ['cu', 'serum-copper'] },
  'ceruloplasmin': { min: 20, max: 40, unit: 'mg/dL', aliases: ['copper-binding-protein'] },
  'selenium': { min: 120, max: 300, unit: 'mcg/L', aliases: ['se', 'serum-selenium'] },
  'manganese': { min: 0.4, max: 2.0, unit: 'mcg/L', aliases: ['mn'] },
  'chromium': { min: 0.2, max: 0.5, unit: 'mcg/L', aliases: ['cr'] },
  'molybdenum': { min: 0.5, max: 2.0, unit: 'mcg/L', aliases: ['mo'] },
  'iodine': { min: 40, max: 92, unit: 'mcg/L', aliases: ['urinary-iodine'] },
  
  // === METABOLIC MARKERS ===
  'glucose': { min: 70, max: 100, unit: 'mg/dL', aliases: ['blood-sugar', 'fasting-glucose', 'fbg'] },
  'glucose_pp': { min: 70, max: 140, unit: 'mg/dL', aliases: ['postprandial-glucose', '2hr-glucose'] },
  'hemoglobin_a1c': { min: 4.0, max: 5.6, unit: '%', aliases: ['hba1c', 'a1c', 'glycated-hemoglobin'] },
  'insulin': { min: 2.6, max: 24.9, unit: 'uIU/mL', aliases: ['fasting-insulin'] },
  'c_peptide': { min: 0.8, max: 3.2, unit: 'ng/mL', aliases: ['c-peptide', 'connecting-peptide'] },
  'homa_ir': { min: 0.5, max: 2.0, unit: 'ratio', aliases: ['insulin-resistance', 'homa'] },
  
  // === LIPID PANEL ===
  'total_cholesterol': { min: 125, max: 200, unit: 'mg/dL', aliases: ['cholesterol', 'tc'] },
  'ldl_cholesterol': { min: 0, max: 100, unit: 'mg/dL', aliases: ['ldl', 'ldl-c', 'bad-cholesterol'] },
  'hdl_cholesterol': { min: 40, max: 100, unit: 'mg/dL', aliases: ['hdl', 'hdl-c', 'good-cholesterol'] },
  'vldl_cholesterol': { min: 5, max: 40, unit: 'mg/dL', aliases: ['vldl', 'vldl-c'] },
  'triglycerides': { min: 0, max: 150, unit: 'mg/dL', aliases: ['tg', 'trigs'] },
  'apolipoprotein_a1': { min: 110, max: 205, unit: 'mg/dL', aliases: ['apo-a1', 'apoa1'] },
  'apolipoprotein_b': { min: 55, max: 140, unit: 'mg/dL', aliases: ['apo-b', 'apob'] },
  'lipoprotein_a': { min: 0, max: 30, unit: 'mg/dL', aliases: ['lp(a)', 'lpa'] },
  
  // === LIVER FUNCTION ===
  'alt': { min: 10, max: 40, unit: 'U/L', aliases: ['alanine-aminotransferase', 'sgpt'] },
  'ast': { min: 10, max: 40, unit: 'U/L', aliases: ['aspartate-aminotransferase', 'sgot'] },
  'alkaline_phosphatase': { min: 44, max: 147, unit: 'U/L', aliases: ['alp', 'alk-phos'] },
  'ggt': { min: 0, max: 65, unit: 'U/L', aliases: ['gamma-glutamyl-transferase', 'ggtp'] },
  'bilirubin_total': { min: 0.1, max: 1.2, unit: 'mg/dL', aliases: ['total-bilirubin'] },
  'bilirubin_direct': { min: 0, max: 0.3, unit: 'mg/dL', aliases: ['conjugated-bilirubin'] },
  'albumin': { min: 3.5, max: 5.0, unit: 'g/dL', aliases: ['serum-albumin'] },
  'total_protein': { min: 6.0, max: 8.3, unit: 'g/dL', aliases: ['tp', 'serum-protein'] },
  
  // === KIDNEY FUNCTION ===
  'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', aliases: ['cr', 'serum-creatinine'] },
  'bun': { min: 7, max: 20, unit: 'mg/dL', aliases: ['blood-urea-nitrogen', 'urea'] },
  'egfr': { min: 90, max: 120, unit: 'mL/min/1.73m2', aliases: ['estimated-gfr', 'glomerular-filtration-rate'] },
  'uric_acid': { min: 3.5, max: 7.2, unit: 'mg/dL', aliases: ['urate'] },
  
  // === COMPLETE BLOOD COUNT ===
  'hemoglobin': { min: 13.5, max: 17.5, unit: 'g/dL', aliases: ['hgb', 'hb'] },
  'hematocrit': { min: 41, max: 53, unit: '%', aliases: ['hct', 'packed-cell-volume'] },
  'rbc': { min: 4.5, max: 5.9, unit: 'million/uL', aliases: ['red-blood-cells', 'erythrocytes'] },
  'mcv': { min: 80, max: 100, unit: 'fL', aliases: ['mean-corpuscular-volume'] },
  'mch': { min: 27, max: 33, unit: 'pg', aliases: ['mean-corpuscular-hemoglobin'] },
  'mchc': { min: 32, max: 36, unit: 'g/dL', aliases: ['mean-corpuscular-hemoglobin-concentration'] },
  'wbc': { min: 4.5, max: 11.0, unit: 'thousand/uL', aliases: ['white-blood-cells', 'leukocytes'] },
  'neutrophils': { min: 45, max: 70, unit: '%', aliases: ['neut', 'pmn'] },
  'lymphocytes': { min: 20, max: 45, unit: '%', aliases: ['lymph'] },
  'monocytes': { min: 2, max: 10, unit: '%', aliases: ['mono'] },
  'eosinophils': { min: 1, max: 4, unit: '%', aliases: ['eos'] },
  'basophils': { min: 0, max: 2, unit: '%', aliases: ['baso'] },
  'platelets': { min: 150, max: 400, unit: 'thousand/uL', aliases: ['plt', 'thrombocytes'] },
  
  // === THYROID PANEL ===
  'tsh': { min: 0.5, max: 4.5, unit: 'mIU/L', aliases: ['thyroid-stimulating-hormone', 'thyrotropin'] },
  'free_t4': { min: 0.9, max: 1.7, unit: 'ng/dL', aliases: ['ft4', 'free-thyroxine'] },
  'free_t3': { min: 2.3, max: 4.2, unit: 'pg/mL', aliases: ['ft3', 'free-triiodothyronine'] },
  'total_t4': { min: 4.5, max: 12.0, unit: 'mcg/dL', aliases: ['t4', 'thyroxine'] },
  'total_t3': { min: 80, max: 200, unit: 'ng/dL', aliases: ['t3', 'triiodothyronine'] },
  'reverse_t3': { min: 9.2, max: 24.1, unit: 'ng/dL', aliases: ['rt3'] },
  'anti_tpo': { min: 0, max: 34, unit: 'IU/mL', aliases: ['thyroid-peroxidase-antibody', 'tpo-ab'] },
  
  // === INFLAMMATORY MARKERS ===
  'crp': { min: 0, max: 3.0, unit: 'mg/L', aliases: ['c-reactive-protein'] },
  'hs_crp': { min: 0, max: 1.0, unit: 'mg/L', aliases: ['high-sensitivity-crp', 'cardio-crp'] },
  'esr': { min: 0, max: 20, unit: 'mm/hr', aliases: ['sed-rate', 'erythrocyte-sedimentation-rate'] },
  
  // === HORMONES ===
  'testosterone_total': { min: 300, max: 1000, unit: 'ng/dL', aliases: ['testosterone', 'total-testosterone'] },
  'testosterone_free': { min: 8.7, max: 25.1, unit: 'pg/mL', aliases: ['free-testosterone'] },
  'estradiol': { min: 20, max: 55, unit: 'pg/mL', aliases: ['e2', 'estrogen'] },
  'progesterone': { min: 0.2, max: 1.4, unit: 'ng/mL', aliases: ['prog'] },
  'cortisol_morning': { min: 6, max: 23, unit: 'mcg/dL', aliases: ['am-cortisol', 'morning-cortisol'] },
  'dhea_s': { min: 80, max: 560, unit: 'mcg/dL', aliases: ['dhea-sulfate', 'dheas'] },
  
  // === CARDIOVASCULAR MARKERS ===
  'homocysteine': { min: 5, max: 15, unit: 'umol/L', aliases: ['hcy'] },
  
  // === NUTRITIONAL MARKERS ===
  'coq10': { min: 0.5, max: 1.5, unit: 'mg/L', aliases: ['coenzyme-q10', 'ubiquinone'] },
  'omega_3_index': { min: 8, max: 12, unit: '%', aliases: ['omega-3-index'] }
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

serve(async (req) => {
  console.log("[parse-health-data] Function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: cors });
  }

  let file_id = null;
  let user_id = null;
  let supabase = null;

  try {
    console.log("[parse-health-data] Step 1: Validating request");
    if (req.method !== "POST") {
      console.log("[parse-health-data] Error: Method not allowed");
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    console.log("[parse-health-data] Step 2: Parsing request body");
    const requestBody = await req.json();
    file_id = requestBody.file_id;
    user_id = requestBody.user_id;
    
    console.log("[parse-health-data] Request params:", { file_id: !!file_id, user_id: !!user_id });
    
    if (!file_id || !user_id) {
      console.log("[parse-health-data] Error: Missing required parameters");
      return new Response(JSON.stringify({ error: "Missing required parameters: file_id and user_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    console.log("[parse-health-data] Step 3: Initializing Supabase client");
    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_API_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.log("[parse-health-data] Error: Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
    
    supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("[parse-health-data] Step 4: Fetching file metadata");
    // Get file metadata
    const { data: fileRecord, error: fileError } = await supabase
      .from("user_uploads")
      .select("*")
      .eq("id", file_id)
      .eq("user_id", user_id)
      .single();

    if (fileError || !fileRecord) {
      console.log("[parse-health-data] Error: File record not found", fileError?.message);
      return new Response(JSON.stringify({ 
        error: "File not found", 
        details: "File record does not exist or access denied" 
      }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    console.log("[parse-health-data] Step 5: Updating processing status");
    // Update processing status
    await supabase
      .from("user_uploads")
      .update({ status: "processing" })
      .eq("id", file_id);

    console.log("[parse-health-data] Step 6: Handling file data");
    // Download file from storage OR use existing parsed content for testing
    let fileData;
    let fileSource = "unknown";
    
    // Check if we already have content in parsed_data (for testing) or no storage_path
    if (fileRecord.parsed_data?.content) {
      console.log("[parse-health-data] Using existing content from parsed_data");
      const content = fileRecord.parsed_data.content;
      fileData = new Blob([content], { type: fileRecord.mime_type || 'text/plain' });
      fileSource = "parsed_data";
    } else if (!fileRecord.storage_path) {
      console.log("[parse-health-data] No storage path found, creating test content");
      // For testing - create sample health data
      const testContent = `Patient: Test User
Date: 2024-01-15
Age: 35
Gender: Male

Vital Signs:
- Blood Pressure: 120/80 mmHg
- Heart Rate: 72 bpm
- Temperature: 98.6°F

Lab Results:
- Vitamin D: 35 ng/mL
- Hemoglobin: 14.2 g/dL
- Total Cholesterol: 180 mg/dL

Notes:
No storage path provided - using test data for processing demonstration.`;
      
      fileData = new Blob([testContent], { type: 'text/plain' });
      fileSource = "test_data";
    } else {
      console.log("[parse-health-data] Attempting download from storage:", fileRecord.storage_path);
      // Download from storage
      const { data: downloadedData, error: downloadError } = await supabase.storage
        .from("user-uploads")
        .download(fileRecord.storage_path);

      if (downloadError) {
        console.log("[parse-health-data] Storage download failed:", downloadError.message);
        // Return 404 instead of 500 for file not found
        return new Response(JSON.stringify({ 
          error: "File not found in storage", 
          details: `Storage error: ${downloadError.message}`,
          file_path: fileRecord.storage_path 
        }), {
          status: 404,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }
      
      fileData = downloadedData;
      fileSource = "storage";
    }

    console.log("[parse-health-data] Step 7: Processing file", { 
      source: fileSource, 
      size: fileData.size,
      type: fileRecord.mime_type || fileRecord.file_type 
    });

    let extractedData = {
      genetic_markers: [],
      biomarkers: {},
      raw_text: "",
      file_type: fileRecord.file_type,
      source_company: null,
      test_date: null,
      is_interpreted_report: false,
      interpretation_summary: null
    };

    // Process based on file type - use mime_type for actual file format
    const fileType = fileRecord.mime_type?.toLowerCase() || fileRecord.file_type?.toLowerCase() || 'unknown';
    
    console.log("[parse-health-data] Processing file type:", fileType);
    console.log("[parse-health-data] AI API keys available:", { 
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY, 
      OPENAI_API_KEY: !!OPENAI_API_KEY 
    });
    
    if (fileType === 'pdf' || fileType === 'application/pdf') {
      // Prioritize Anthropic for PDF processing since OpenAI cannot handle PDFs directly
      if (ANTHROPIC_API_KEY) {
        console.log("[parse-health-data] Using Anthropic Claude for PDF processing");
        extractedData = await parsePDF(fileData, ANTHROPIC_API_KEY);
      } else if (OPENAI_API_KEY) {
        console.log("[parse-health-data] WARNING: Using OpenAI for PDF processing - this may fail");
        extractedData = await parsePDF(fileData, OPENAI_API_KEY);
      } else {
        console.log("[parse-health-data] Error: No AI API key for PDF processing");
        return new Response(JSON.stringify({ 
          error: "PDF processing requires AI API key", 
          details: "Either ANTHROPIC_API_KEY or OPENAI_API_KEY must be configured" 
        }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }
    } else if (fileType === 'csv' || fileType === 'txt' || fileType === 'text/plain' || fileType === 'text/csv') {
      console.log("[parse-health-data] Processing text file");
      const text = await fileData.text();
      extractedData = await parseTextData(text, fileType);
    } else if (fileType === 'zip' || fileType === 'application/zip') {
      console.log("[parse-health-data] Processing ZIP file");
      extractedData = await parseZipFile(fileData);
    } else {
      console.log("[parse-health-data] Error: Unsupported file type");
      return new Response(JSON.stringify({ 
        error: "Unsupported file type", 
        details: `File type '${fileType}' is not supported. Supported types: PDF, CSV, TXT, ZIP` 
      }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    console.log("[parse-health-data] Step 8: Storing extracted data");
    // Store extracted data
    const storageResults = await storeExtractedData(supabase, user_id, extractedData, fileRecord, file_id);

    console.log("[parse-health-data] Step 9: Updating file status");
    // Update file processing status
    await supabase
      .from("user_uploads")
      .update({ 
        status: "completed",
        parsed_data: {
          ...storageResults,
          genetic_markers_count: extractedData.genetic_markers.length,
          biomarkers_count: Object.keys(extractedData.biomarkers).length,
          source_company: extractedData.source_company,
          test_date: extractedData.test_date,
          is_interpreted: extractedData.is_interpreted_report,
          processing_source: fileSource
        }
      })
      .eq("id", file_id);

    console.log("[parse-health-data] Step 10: Triggering embedding generation");
    // Trigger embedding generation for the parsed content
    if (extractedData.raw_text) {
      try {
        await supabase.functions.invoke('embedding_worker', {
          body: {
            items: [{
              user_id,
              source_type: 'file',
              source_id: file_id,
              content: extractedData.raw_text.slice(0, 10000) // Limit for embedding
            }]
          }
        });
        console.log("[parse-health-data] Embedding generation triggered");
      } catch (embeddingError) {
        console.warn("[parse-health-data] Embedding generation failed:", embeddingError.message);
      }
    }

    console.log("[parse-health-data] Success: Processing completed");
    return new Response(JSON.stringify({
      success: true,
      file_id,
      results: storageResults,
      summary: {
        genetic_markers_found: extractedData.genetic_markers.length,
        biomarkers_found: Object.keys(extractedData.biomarkers).length,
        source_company: extractedData.source_company,
        test_date: extractedData.test_date,
        is_interpreted_report: extractedData.is_interpreted_report,
        processing_source: fileSource
      },
      debug: {
        file_type: fileType,
        file_size: fileData.size,
        raw_text_length: extractedData.raw_text?.length || 0,
        raw_text_preview: extractedData.raw_text?.slice(0, 200) || "No text extracted"
      }
    }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[parse-health-data] Unhandled error:", error);
    
    // Update file status to failed if we have the necessary info
    if (file_id && supabase) {
      try {
        console.log("[parse-health-data] Updating file status to failed");
        await supabase
          .from("user_uploads")
          .update({ 
            status: "failed",
            error_message: error.message 
          })
          .eq("id", file_id);
      } catch (updateError) {
        console.error("[parse-health-data] Failed to update file status:", updateError.message);
      }
    }

    // Log the error for debugging purposes
    console.log("[parse-health-data] Error details for debugging:", {
      error_message: error.message,
      file_id: file_id || null,
      user_id: user_id || null,
      stack: error.stack
    });

    return new Response(JSON.stringify({
      error: "Processing failed",
      details: error.message,
      file_id: file_id || null
    }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});

// PDF parsing using AI with OCR for scanned images
async function parsePDF(fileData: Blob, apiKey: string): Promise<any> {
  console.log("Starting PDF parsing with AI OCR");
  console.log("API key available:", !!apiKey);
  console.log("API key type:", apiKey ? (apiKey.startsWith("sk-ant-") ? "Anthropic" : apiKey.startsWith("sk-") ? "OpenAI" : "Unknown") : "None");
  
  if (!apiKey) {
    console.log("No API key provided, returning empty results");
    return {
      genetic_markers: [],
      biomarkers: {},
      raw_text: "PDF parsing requires AI API key",
      source_company: null,
      test_date: null,
      is_interpreted_report: false,
      interpretation_summary: null
    };
  }
  
  // Convert PDF to base64 for AI processing
  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Check file size limit - increase for large medical reports (max 50MB)
  if (uint8Array.length > 50 * 1024 * 1024) {
    throw new Error("PDF file too large for AI processing (max 50MB)");
  }
  
  // Use proper base64 encoding
  console.log("Converting PDF to base64, file size:", uint8Array.length, "bytes");
  console.log("First few bytes:", Array.from(uint8Array.slice(0, 10)));
  
  // Use TextEncoder approach for better base64 handling
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  console.log("Base64 conversion completed, length:", base64.length);
  console.log("Base64 preview:", base64.slice(0, 100));
  
  // Validate the base64 by trying to decode it
  try {
    const decoded = atob(base64);
    console.log("Base64 validation successful, decoded length:", decoded.length);
  } catch (e) {
    console.error("Base64 validation failed:", e);
    throw new Error("Generated invalid base64 data");
  }
  
  const ocrPrompt = `
You are an OCR specialist for comprehensive medical documents. This PDF may contain 1-100+ pages with BOTH genetic data AND extensive biomarker lab results.

CRITICAL MISSION: Extract ALL text from ALL PAGES including:
1. GENETIC DATA (MaxGen Labs, 23andMe, AncestryDNA, or other formats)
2. COMPREHENSIVE LAB BIOMARKERS (potentially 100+ values across multiple panels)
3. ALL PAGES - even if the document is 50-100 pages long

SPECIFIC REQUIREMENTS:
1. EXTRACT EVERY PAGE - Process ALL pages completely (expect 10,000-100,000+ characters for large reports)
2. PRESERVE ALL LAB VALUES with units from comprehensive panels including:
   - VITAMINS: D, A, E, C, B1, B2, B3, B5, B6, B7, B12, folate, homocysteine
   - MINERALS: Calcium, magnesium, iron, ferritin, zinc, copper, selenium, phosphorus
   - METABOLIC: Glucose, HbA1c, insulin, HOMA-IR, C-peptide
   - LIPIDS: Total cholesterol, LDL, HDL, triglycerides, Apo A1/B, Lp(a)
   - LIVER: ALT, AST, alkaline phosphatase, GGT, bilirubin, albumin, total protein
   - KIDNEY: Creatinine, BUN, eGFR, uric acid, microalbumin
   - CBC: Hemoglobin, hematocrit, WBC, RBC, platelets, neutrophils, lymphocytes
   - THYROID: TSH, T4, T3, reverse T3, TPO antibodies, thyroglobulin antibodies
   - HORMONES: Testosterone, estradiol, progesterone, cortisol, DHEA-S, IGF-1
   - INFLAMMATION: CRP, hs-CRP, ESR, IL-6, TNF-alpha
   - SPECIALTY: CoQ10, Omega-3 index, amino acids, organic acids, food panels

3. PRESERVE SNP/GENETIC DATA from all formats:
   - MaxGen: "Gene RS# Result Client Minor" → "VDR-FOK rs2228570 ++ Homozygous AA A"
   - 23andMe: "rsid chromosome position genotype"
   - Standard: "rs12345 AA", "Gene: Variant (Genotype)"

4. INCLUDE ALL CONTENT - every page, table, value:
   - Patient demographics and test dates
   - All laboratory methodology and reference ranges
   - Complete genetic variant tables (potentially 100+ SNPs)
   - All biomarker result tables (potentially 150+ values)
   - Source company identification

QUALITY CHECK: Large comprehensive reports expect 20,000-100,000+ characters. Extract EVERYTHING.

Return the COMPLETE extracted text preserving all spacing, tables, and structure.`;

  const analysisPrompt = `
You are a medical data extraction specialist. Analyze this extracted text and find EVERY SINGLE genetic variant (SNP) AND every biomarker lab result.

MISSION 1: EXTRACT ALL BIOMARKERS WITH VALUES AND UNITS
Be extremely thorough - look for ALL lab values. Comprehensive lab reports can have 50-200+ biomarkers:

**SEARCH PATTERNS**: Look for these formats:
- "Biomarker Name: 25.3 ng/mL"
- "Vitamin D    25.3    ng/mL    Normal"
- "25.3 ng/mL (Vitamin D)"
- Table format with Name | Value | Unit | Reference Range

**VITAMINS**: Vitamin D (25-OH, 1,25-dihydroxy), Vitamin A, E, C, B1, B2, B3, B5, B6, B7, B9/Folate, B12, Methylfolate, Homocysteine, MMA, Choline
**MINERALS**: Calcium, Magnesium (serum, RBC), Iron, Ferritin, TIBC, Zinc, Copper, Selenium, Phosphorus, Potassium, Sodium
**METABOLIC**: Glucose, HbA1c, Insulin, C-peptide, HOMA-IR
**LIPIDS**: Cholesterol (total, LDL, HDL), Triglycerides, Apo A1, Apo B, Lp(a), particle numbers
**LIVER**: ALT, AST, Alk Phos, GGT, Bilirubin, Albumin, Total Protein
**KIDNEY**: Creatinine, BUN, eGFR, Uric Acid, Microalbumin, Cystatin C
**CBC**: Hemoglobin, Hematocrit, WBC, RBC, Platelets, MCV, MCH, MCHC, neutrophils, lymphocytes
**THYROID**: TSH, T4, T3, Reverse T3, TPO Ab, Thyroglobulin Ab
**HORMONES**: Testosterone, Estradiol, Progesterone, Cortisol, DHEA-S, IGF-1, FSH, LH, Prolactin
**INFLAMMATION**: CRP, hs-CRP, ESR, IL-6, TNF-alpha, Fibrinogen
**SPECIALTY**: CoQ10, Omega-3 index, Glutathione, Organic acids, Amino acids

MISSION 2: EXTRACT ALL GENETIC VARIANTS
Look for SNPs in these formats:
- MaxGen: "VDR-FOK rs2228570 ++ Homozygous AA A" → extract "rs2228570" and "AA"
- Standard: "rs1801133: CT", "rs1801133 CT"
- 23andMe: "rs1801133 1 11796321 CT"
- Gene format: "MTHFR C677T: CT"

TARGET 100+ SNPs including: rs1801133, rs1801131, rs4680, rs429358, rs7412, rs2228570, rs174547, etc.

CRITICAL: Extract EVERY value found - don't limit to examples. Many reports have 100-200+ individual biomarkers.

Return EXACTLY this JSON format:
{
  "is_interpreted_report": true/false,
  "interpretation_summary": "summary if interpreted, null if raw",
  "genetic_markers": [
    {"rsid": "rs1801133", "genotype": "CT"},
    {"rsid": "rs1801131", "genotype": "AC"}
  ],
  "biomarkers": {
    "vitamin_d": "25 ng/mL",
    "vitamin_b12": "850 pg/mL", 
    "hemoglobin": "14.5 g/dL",
    "alt": "35 U/L",
    "creatinine": "0.9 mg/dL"
  },
  "source_company": "company name or null",
  "test_date": "date or null", 
  "raw_text": "relevant text (limit 5000 chars)"
}

Include EVERY biomarker and genetic variant you find in the text.`;

  try {
    console.log("Step 1: Attempting OCR with AI...");
    let extractedText = "";
    
    if (apiKey.startsWith("sk-ant-")) {
      console.log("Using Anthropic Claude API for OCR");
      // Use Anthropic Claude for OCR
      const ocrResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8192,
          temperature: 0.1,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: ocrPrompt
              },
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64
                }
              }
            ]
          }]
        })
      });

      if (ocrResponse.ok) {
        console.log("Anthropic OCR call successful");
        const ocrResult = await ocrResponse.json();
        extractedText = ocrResult.content[0].text;
        console.log("📝 OCR extraction successful");
        console.log("Raw text length:", extractedText.length);
        console.log("Raw text preview (first 500 chars):", extractedText.substring(0, 500));
        console.log("Raw text middle (chars 5000-5500):", extractedText.substring(5000, 5500));
        console.log("Raw text end (last 500 chars):", extractedText.substring(Math.max(0, extractedText.length - 500)));
        
        // Detailed text extraction validation - improved for large documents
        const fileSizeMB = uint8Array.length / (1024 * 1024);
        const expectedMinChars = Math.max(5000, fileSizeMB * 2000); // ~2000 chars per MB minimum
        
        if (extractedText.length < expectedMinChars) {
          console.error(`🚨 CRITICAL: Extracted text is too short (${extractedText.length} chars). Expected ${expectedMinChars}+ for ${fileSizeMB.toFixed(1)}MB PDF.`);
          console.log("This suggests the PDF OCR was incomplete!");
          console.log("SNP table indicators found:", (extractedText.match(/rs\d+.*[+\-]{2}/g) || []).length);
          console.log("Biomarker indicators found:", (extractedText.match(/\d+\.?\d*\s*(mg\/dL|ng\/mL|mIU\/L|pg\/mL|U\/L|%)/g) || []).length);
          
          // For any report with significant size, incomplete extraction is critical
          if (fileSizeMB > 2 && extractedText.length < expectedMinChars * 0.5) {
            throw new Error(`Severely incomplete PDF extraction: Only ${extractedText.length} characters extracted from ${fileSizeMB.toFixed(1)}MB document. Expected ${expectedMinChars}+ characters. The AI may have hit token limits or missed critical pages with lab data and genetic information.`);
          }
        } else {
          console.log(`✅ Text length excellent (${extractedText.length} chars) - likely captured full ${fileSizeMB.toFixed(1)}MB document`);
          console.log("SNP table indicators found:", (extractedText.match(/rs\d+.*[+\-]{2}/g) || []).length);
          console.log("Biomarker indicators found:", (extractedText.match(/\d+\.?\d*\s*(mg\/dL|ng\/mL|mIU\/L|pg\/mL|U\/L|%)/g) || []).length);
        }
        
        // Check for MaxGen specific content
        const hasMaxGenMarkers = extractedText.includes("MaxGen") || extractedText.includes("Gene RS#") || extractedText.includes("Client Minor");
        console.log("MaxGen format detected:", hasMaxGenMarkers);
      } else {
        const errorText = await ocrResponse.text();
        console.error("Anthropic OCR call failed:", ocrResponse.status, errorText);
        throw new Error(`Anthropic OCR API error: ${ocrResponse.status} - ${errorText}`);
      }
    } else if (apiKey.startsWith("sk-")) {
      console.log("OpenAI API detected - but GPT-4V cannot process PDFs directly");
      console.log("GPT-4V only accepts image formats (PNG, JPEG, WebP, GIF)");
      console.log("Falling back to text-based extraction attempt...");
      
      // Try to extract text using OpenAI's text model with file content description
      try {
        const ocrResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 16384,
            temperature: 0.1,
            messages: [{
              role: "user",
              content: `I have a PDF file that I need to extract text from. The file is ${uint8Array.length} bytes in size and appears to be a genetic test report or lab results document. 

Unfortunately, I cannot send you the PDF directly since you cannot process PDF files, only images. However, if this PDF contains readable text (not scanned images), please respond with this message:

"I cannot process PDF files directly. To extract text from a PDF, you need to either:
1. Convert the PDF pages to images first
2. Use a PDF parsing library 
3. Use Anthropic Claude which can handle PDF documents directly

For genetic test reports, I recommend using Anthropic Claude API instead of OpenAI for PDF processing."

If this is a scanned PDF with images, the solution is to convert PDF pages to images and then send those images to me for OCR.`
            }]
          })
        });

        if (ocrResponse.ok) {
          const ocrResult = await ocrResponse.json();
          extractedText = ocrResult.choices[0].message.content;
          console.log("OpenAI response:", extractedText);
        } else {
          const errorText = await ocrResponse.text();
          console.error("OpenAI API error:", ocrResponse.status, errorText);
          throw new Error(`OpenAI API error: ${ocrResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.error("OpenAI processing failed:", error);
        throw new Error(`OpenAI cannot process PDFs directly: ${error.message}`);
      }
    }

    // Comprehensive input validation
    if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
      const errorMsg = apiKey.startsWith("sk-ant-") 
        ? "Anthropic Claude failed to extract text from PDF" 
        : "OpenAI cannot process PDF files - use Anthropic Claude instead";
      throw new Error(errorMsg);
    }
    
    // Quality validation - ensure we got substantial content
    if (extractedText.length < 1000) {
      console.error(`🚨 CRITICAL: PDF extraction too short (${extractedText.length} chars)`);
      throw new Error(`PDF text extraction incomplete - only ${extractedText.length} characters extracted. Expected 10,000+ for full document.`);
    }

    // Step 2: Analyze the extracted text
    console.log("Step 2: Analyzing extracted text...");
    
    if (apiKey.startsWith("sk-ant-")) {
      console.log("Using Anthropic Claude API for analysis");
      const analysisResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8192,
          temperature: 0.1,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt + "\n\nExtracted text to analyze:\n" + extractedText
              }
            ]
          }]
        })
      });

      if (analysisResponse.ok) {
        console.log("Anthropic analysis call successful");
        const analysisResult = await analysisResponse.json();
        const content = analysisResult.content[0].text;
        console.log("Analysis response length:", content.length);
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log("Found JSON in analysis response, parsing...");
            const parsed = JSON.parse(jsonMatch[0]);
            // Include extracted text in the result
            parsed.raw_text = extractedText.slice(0, 5000);
            
            // Enhanced debugging for genetic markers
            console.log("🧬 Genetic analysis results:");
            console.log("- Total genetic markers found:", parsed.genetic_markers?.length || 0);
            console.log("- Biomarkers found:", Object.keys(parsed.biomarkers || {}).length);
            console.log("- Source company:", parsed.source_company);
            console.log("- Test date:", parsed.test_date);
            console.log("- Is interpreted report:", parsed.is_interpreted_report);
            
            if (parsed.genetic_markers?.length > 0) {
              console.log("First 5 SNPs found:", parsed.genetic_markers.slice(0, 5));
            } else {
              console.warn("⚠️ No genetic markers found - this suggests:");
              console.warn("  1. OCR may have missed the SNP tables (pages 14-15)");
              console.warn("  2. Table format not recognized by AI");
              console.warn("  3. SNP data may be in images/tables that weren't extracted");
            }
            
            return parsed;
          } else {
            console.log("No JSON found in analysis response");
            console.log("Response preview:", content.slice(0, 500));
          }
        } catch (e) {
          console.error("Failed to parse analysis response as JSON:", e);
        }
              } else {
          const errorText = await analysisResponse.text();
          console.error("Anthropic analysis call failed:", analysisResponse.status, errorText);
          throw new Error(`Anthropic analysis API error: ${analysisResponse.status} - ${errorText}`);
        }
      } else if (apiKey.startsWith("sk-")) {
        console.log("Note: OpenAI analysis will work with extracted text, but OCR step may have failed");
        const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 16384,
            temperature: 0.1,
            messages: [{
              role: "user",
              content: analysisPrompt + "\n\nExtracted text to analyze:\n" + extractedText
            }]
          })
        });

        if (analysisResponse.ok) {
          console.log("OpenAI analysis call successful");
          const analysisResult = await analysisResponse.json();
          const content = analysisResult.choices[0].message.content;
          console.log("Analysis response length:", content.length);
          
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              console.log("Found JSON in analysis response, parsing...");
              const parsed = JSON.parse(jsonMatch[0]);
              // Include extracted text in the result
              parsed.raw_text = extractedText.slice(0, 5000);
              console.log("Parsed result:", { 
                genetic_markers: parsed.genetic_markers?.length || 0,
                biomarkers: Object.keys(parsed.biomarkers || {}).length 
              });
              return parsed;
            } else {
              console.log("No JSON found in analysis response");
              console.log("Raw response:", content.slice(0, 500));
              throw new Error("OpenAI analysis did not return valid JSON format");
            }
          } catch (e) {
            console.error("Failed to parse OpenAI analysis response as JSON:", e);
            throw new Error(`JSON parsing failed: ${e.message}`);
          }
        } else {
          const errorText = await analysisResponse.text();
          console.error("OpenAI analysis call failed:", analysisResponse.status, errorText);
          throw new Error(`OpenAI analysis API error: ${analysisResponse.status} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error("AI OCR/analysis error:", error);
      
      // Re-throw the error to make it explicit (don't hide failures)
      throw new Error(`PDF processing failed: ${error.message}`);
    }

    // This should never be reached due to error throwing above
    throw new Error("Unexpected: PDF processing completed without returning results");
}

// Enhanced text parsing for CSV/TXT with flexible detection
async function parseTextData(text: string, fileType: string): Promise<any> {
  console.log(`Parsing ${fileType} file with ${text.length} characters`);
  
  const extractedData = {
    genetic_markers: [],
    biomarkers: {},
    raw_text: text.slice(0, 5000),
    source_company: detectSourceCompany(text),
    test_date: extractTestDate(text),
    is_interpreted_report: false,
    interpretation_summary: null
  };

  // Check if it's an interpreted report
  const interpretationKeywords = [
    'recommendation', 'suggest', 'optimal', 'deficient', 'elevated',
    'your results show', 'interpretation', 'summary', 'analysis'
  ];
  const hasInterpretation = interpretationKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );

  if (fileType === 'csv') {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return extractedData;

      const headers = lines[0].toLowerCase().split(/[,\t]/).map(h => h.trim());
      
      // Genetic data detection patterns
      const geneticHeaders = ['rsid', 'snp', 'rs#', 'variant', 'genotype', 'allele'];
      const isGeneticData = headers.some(h => geneticHeaders.some(gh => h.includes(gh)));
      
      if (isGeneticData) {
        // Parse genetic CSV - handle various formats
        for (let i = 1; i < lines.length; i++) {
          const fields = lines[i].split(/[,\t]/);
          
          // Find rsid and genotype columns
          let rsid = null;
          let genotype = null;
          
          for (let j = 0; j < fields.length; j++) {
            const field = fields[j].trim();
            
            // Check if this field is an rsid
            if (field.match(/^rs\d+$/i)) {
              rsid = field.toLowerCase();
            }
            
            // Check if this field is a genotype
            if (field.match(/^[ACGT]{1,2}$/i)) {
              genotype = field.toUpperCase();
            }
            
            // Also check for genotypes with slashes or dashes
            if (field.match(/^[ACGT][\/\-][ACGT]$/i)) {
              genotype = field.replace(/[\/\-]/, '').toUpperCase();
            }
          }
          
          if (rsid && genotype && targetSNPs.includes(rsid)) {
            extractedData.genetic_markers.push({ rsid, genotype });
          }
        }
      } else {
        // Parse biomarker CSV - flexible format
        for (let i = 1; i < lines.length; i++) {
          const fields = lines[i].split(/[,\t]/);
          if (fields.length >= 2) {
            const nameField = fields[0].trim();
            const valueField = fields[1].trim();
            
            // Try to match biomarker name
            const normalizedName = normalizeBiomarkerName(nameField);
            const numericValue = extractNumericValue(valueField);
            
            if (normalizedName && numericValue !== null && biomarkerRanges[normalizedName]) {
              extractedData.biomarkers[normalizedName] = `${numericValue} ${biomarkerRanges[normalizedName].unit}`.trim();
            }
          }
        }
      }
    } catch (error) {
      console.error("CSV parsing error:", error);
    }
  } else {
    // Parse TXT file - check if it's tab-separated data first
    const lines = text.split('\n').filter(line => line.trim());
    
    // Check if this looks like tab-separated genetic data
    const hasTabSeparated = lines.some(line => 
      line.includes('\t') && line.match(/rs\d+/i)
    );
    
    if (hasTabSeparated) {
      // Treat as tab-separated genetic data
      console.log("Detected tab-separated genetic data in TXT file");
      
      for (const line of lines) {
        if (line.startsWith('#') || line.toLowerCase().includes('rsid') || line.toLowerCase().includes('chromosome')) {
          continue; // Skip header lines
        }
        
        const fields = line.split('\t').map(f => f.trim());
        if (fields.length >= 2) {
          const rsid = fields[0].toLowerCase();
          let genotype = null;
          
          // Look for genotype in any field after rsid
          for (let i = 1; i < fields.length; i++) {
            const field = fields[i];
            // Check if this field looks like a genotype
            if (field.match(/^[ACGT]{1,2}$/i)) {
              genotype = field.toUpperCase();
              break;
            }
            // Also check for genotypes with slashes or dashes
            if (field.match(/^[ACGT][\/\-][ACGT]$/i)) {
              genotype = field.replace(/[\/\-]/, '').toUpperCase();
              break;
            }
          }
          
          if (rsid.match(/^rs\d+$/) && genotype && targetSNPs.includes(rsid)) {
            extractedData.genetic_markers.push({ rsid, genotype });
          }
        }
      }
      } else {
    // Parse as free-form text - FIRST try MaxGen table format, then fallback to general patterns
    console.log("Parsing genetic data from text format");
    
    // COMPREHENSIVE SNP PARSER - Extract from ALL formats and locations
    console.log("🧬 Starting comprehensive SNP extraction...");
    console.log(`Text length: ${text.length} characters`);
    
    // STEP 1: Line-by-line parsing (most robust approach)
    const allLines = text.split('\n');
    const snpLines = allLines.filter(line => 
      line.includes('rs') && line.match(/rs\d{4,}/) // Find lines with rs numbers
    );
    
    console.log(`Found ${snpLines.length} lines containing rs numbers`);
    console.log("Sample SNP lines:", snpLines.slice(0, 5));
    
    for (const line of snpLines) {
      try {
        // Clean and split the line
        const cleanLine = line.trim().replace(/\s+/g, ' ');
        const parts = cleanLine.split(/\s+/);
        
        // Find rs number in the line
        const rsMatch = line.match(/(rs\d{4,})/i);
        if (!rsMatch) continue;
        
        const rsid = rsMatch[1].toLowerCase();
        let genotype = null;
        
        // METHOD 1: MaxGen table format
        // "VDR-FOK rs2228570 ++ Homozygous AA A"
        if (line.match(/[+\-]{2}/) && line.match(/[ACGT]{1,2}/)) {
          const genotypeMatch = line.match(/\b([ACGT]{1,2})\s+[ACGT]?\s*$/);
          if (genotypeMatch) {
            genotype = genotypeMatch[1].toUpperCase();
            console.log(`Table format: ${rsid} = ${genotype}`);
          }
        }
        
        // METHOD 2: Direct genotype in line
        // "rs1801133 CT" or "rs1801133: CT"
        if (!genotype) {
          const directMatch = line.match(new RegExp(`${rsid.replace(/rs/, 'rs')}[\\s:]+([ACGT]{1,2})`, 'i'));
          if (directMatch) {
            genotype = directMatch[1].toUpperCase();
            console.log(`Direct format: ${rsid} = ${genotype}`);
          }
        }
        
        // METHOD 3: Prose format with genotype nearby
        // "heterozygous for VDR rs2228570 (AA)"
        if (!genotype) {
          const proseMatch = line.match(/([ACGT]{1,2})\)/);
          if (proseMatch && line.includes(rsid)) {
            genotype = proseMatch[1].toUpperCase();
            console.log(`Prose format: ${rsid} = ${genotype}`);
          }
        }
        
        // METHOD 4: Look for genotype in parts array
        if (!genotype) {
          for (const part of parts) {
            if (part.match(/^[ACGT]{1,2}$/)) {
              genotype = part.toUpperCase();
              console.log(`Parts array: ${rsid} = ${genotype}`);
              break;
            }
          }
        }
        
        // Store if valid
        if (genotype && rsid.match(/^rs\d+$/) && genotype.match(/^[ACGT]{1,2}$/)) {
          // Avoid duplicates
          if (!extractedData.genetic_markers.some(m => m.rsid === rsid)) {
            extractedData.genetic_markers.push({ rsid, genotype });
          }
        }
        
      } catch (error) {
        console.warn(`Error parsing line: ${line}`, error);
      }
    }
    
    // STEP 2: Global regex patterns for any missed SNPs
    console.log("🔍 Applying global regex patterns for missed SNPs...");
    
    const globalPatterns = [
      // Pattern 1: rs12345 followed by genotype
      /(rs\d{4,})[^\w]*([ACGT]{1,2})(?![A-Z])/gi,
      
      // Pattern 2: rs12345 with colon/space then genotype  
      /(rs\d{4,})[\s:]+([ACGT]{1,2})\b/gi,
      
      // Pattern 3: Parenthetical genotypes
      /(rs\d{4,})[^)]*\(([ACGT]{1,2})\)/gi,
      
      // Pattern 4: Table row format
      /\b(rs\d{4,})\s+[+\-]{2}\s+\w+[\/\w]*\s+([ACGT]{1,2})/gi,
      
      // Pattern 5: Genotype followed by rs number (reverse)
      /\b([ACGT]{1,2})\s+[^rs]*?(rs\d{4,})/gi
    ];
    
    for (const pattern of globalPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(text)) !== null) {
        let rsid, genotype;
        
        // Handle different match group orders
        if (match[1] && match[1].startsWith('rs')) {
          rsid = match[1].toLowerCase();
          genotype = match[2]?.toUpperCase();
        } else if (match[2] && match[2].startsWith('rs')) {
          rsid = match[2].toLowerCase();
          genotype = match[1]?.toUpperCase();
        }
        
        // Validate and store
        if (rsid && genotype && 
            rsid.match(/^rs\d+$/) && 
            genotype.match(/^[ACGT]{1,2}$/) &&
            !extractedData.genetic_markers.some(m => m.rsid === rsid)) {
          
          extractedData.genetic_markers.push({ rsid, genotype });
          console.log(`Global pattern: ${rsid} = ${genotype}`);
        }
      }
    }
    
    // STEP 3: Final comprehensive search for any target SNPs
    console.log("🎯 Final sweep for target SNPs...");
    
    for (const targetRsid of targetSNPs) {
      // Skip if already found
      if (extractedData.genetic_markers.some(m => m.rsid === targetRsid)) {
        continue;
      }
      
      // Search specifically for this SNP
      const snpRegex = new RegExp(`\\b${targetRsid}\\b[^\\n]*?([ACGT]{1,2})`, 'gi');
      const snpMatch = text.match(snpRegex);
      
      if (snpMatch) {
        for (const match of snpMatch) {
          const genotypeMatch = match.match(/([ACGT]{1,2})/);
          if (genotypeMatch) {
            const genotype = genotypeMatch[1].toUpperCase();
            extractedData.genetic_markers.push({ rsid: targetRsid, genotype });
            console.log(`Target search: ${targetRsid} = ${genotype}`);
            break;
          }
        }
      }
    }
  }
    
    // Extract biomarkers with flexible patterns
    for (const [biomarker, config] of Object.entries(biomarkerRanges)) {
      // Create pattern with all aliases
      const names = [biomarker, ...config.aliases].map(n => 
        n.replace(/[_\-]/g, '[\\s\\-_]*')
      );
      
      const patterns = [
        // Standard patterns: "Vitamin D: 25 ng/mL"
        new RegExp(`(${names.join('|')})\\s*[:\\s]+\\s*([\\d.]+)\\s*(${config.unit}|[\\w/]+)?`, 'gi'),
        // Table patterns: "Vitamin D    25    ng/mL"
        new RegExp(`(${names.join('|')})\\s+([\\d.]+)\\s+(${config.unit}|[\\w/]+)?`, 'gi'),
        // Result patterns: "Vitamin D Result: 25"
        new RegExp(`(${names.join('|')})\\s*result\\s*[:\\s]+\\s*([\\d.]+)`, 'gi')
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const value = match[0].match(/[\d.]+/)[0];
          extractedData.biomarkers[biomarker] = `${value} ${config.unit}`;
          break;
        }
      }
    }
  }

  // Deduplicate genetic markers (defensive coding)
  if (extractedData.genetic_markers && Array.isArray(extractedData.genetic_markers)) {
    const uniqueMarkers = {};
    extractedData.genetic_markers.forEach(marker => {
      if (marker && marker.rsid) {
        uniqueMarkers[marker.rsid] = marker;
      }
    });
    extractedData.genetic_markers = Object.values(uniqueMarkers);
  } else {
    extractedData.genetic_markers = [];
  }

  // Enhanced source company detection
  if (!extractedData.source_company) {
    extractedData.source_company = detectSourceCompany(text);
  }

  // Set interpretation flag if needed
  if (hasInterpretation && extractedData.genetic_markers.length < 10 && Object.keys(extractedData.biomarkers || {}).length < 10) {
    extractedData.is_interpreted_report = true;
    extractedData.interpretation_summary = "This appears to be an interpreted report rather than raw data.";
  }

  // COMPREHENSIVE FINAL VALIDATION AND LOGGING
  console.log(`✅ Text parsing completed:`);
  console.log(`- Genetic markers found: ${extractedData.genetic_markers.length}`);
  console.log(`- Biomarkers found: ${Object.keys(extractedData.biomarkers || {}).length}`);
  console.log(`- Source company: ${extractedData.source_company || 'Unknown'}`);
  console.log(`- Test date: ${extractedData.test_date || 'Not found'}`);
  
  // Detailed SNP analysis
  if (extractedData.genetic_markers && extractedData.genetic_markers.length > 0) {
    const foundRsids = extractedData.genetic_markers.map(m => m.rsid);
    console.log(`🧬 SNPs successfully extracted:`, foundRsids.slice(0, 10), '...');
    
    // Check against target SNPs
    const targetFound = targetSNPs.filter(target => foundRsids.includes(target));
    const targetMissing = targetSNPs.filter(target => !foundRsids.includes(target));
    
    console.log(`🎯 Target SNPs found: ${targetFound.length}/${targetSNPs.length}`);
    if (targetMissing.length > 0 && targetMissing.length <= 10) {
      console.log(`❌ Missing target SNPs:`, targetMissing);
    } else if (targetMissing.length > 10) {
      console.log(`❌ Missing ${targetMissing.length} target SNPs:`, targetMissing.slice(0, 10), '...');
    }
    
    // Sample of found variants
    console.log(`📊 Sample extracted variants:`, 
      extractedData.genetic_markers.slice(0, 5).map(m => `${m.rsid}=${m.genotype}`)
    );
  }
  
  // Quality assessment
  if (extractedData.genetic_markers.length >= 80) {
    console.log(`🎉 EXCELLENT: Found ${extractedData.genetic_markers.length} SNPs - likely complete extraction!`);
  } else if (extractedData.genetic_markers.length >= 50) {
    console.log(`✅ GOOD: Found ${extractedData.genetic_markers.length} SNPs - substantial extraction`);
  } else if (extractedData.genetic_markers.length >= 20) {
    console.log(`⚠️ PARTIAL: Found ${extractedData.genetic_markers.length} SNPs - may be missing table data`);
  } else if (extractedData.genetic_markers.length > 0) {
    console.log(`🔴 LIMITED: Only found ${extractedData.genetic_markers.length} SNPs - check text extraction quality`);
  } else {
    console.log(`🚨 FAILED: No SNPs found - check parser logic or text content`);
  }
  
  // Text analysis for debugging
  const rsCount = (text?.match(/rs\d{4,}/g) || []).length;
  const genotypeCount = (text?.match(/\b[ACGT]{1,2}\b/g) || []).length;
  console.log(`📊 Text analysis: ${rsCount} rs-numbers, ${genotypeCount} potential genotypes in ${text?.length || 0} chars`);
  
  if (rsCount >= 80 && extractedData.genetic_markers.length < 50) {
    console.warn(`🔍 PARSER ISSUE: Found ${rsCount} rs-numbers in text but only extracted ${extractedData.genetic_markers.length} - parser needs improvement`);
  }

  return extractedData;
}

// Parse ZIP files containing multiple data files
async function parseZipFile(fileData: Blob): Promise<any> {
  console.log("Parsing ZIP file");
  
  const extractedData = {
    genetic_markers: [],
    biomarkers: {},
    raw_text: "",
    source_company: null,
    test_date: null,
    is_interpreted_report: false,
    interpretation_summary: null
  };

  try {
    const arrayBuffer = await fileData.arrayBuffer();
    const decompressed = await decompress(new Uint8Array(arrayBuffer));
    
    for (const file of decompressed) {
      console.log(`Processing file in ZIP: ${file.name}`);
      
      // Skip non-data files
      if (file.name.includes('__MACOSX') || file.name.startsWith('.')) {
        continue;
      }
      
      if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(file.content);
        const parsed = await parseTextData(text, file.name.endsWith('.csv') ? 'csv' : 'txt');
        
        // Merge results
        extractedData.genetic_markers.push(...parsed.genetic_markers);
        Object.assign(extractedData.biomarkers, parsed.biomarkers);
        extractedData.raw_text += parsed.raw_text.slice(0, 1000) + "\n";
        extractedData.source_company = extractedData.source_company || parsed.source_company;
        extractedData.test_date = extractedData.test_date || parsed.test_date;
        
        if (parsed.is_interpreted_report) {
          extractedData.is_interpreted_report = true;
        }
      }
    }
    
    // Deduplicate genetic markers
    const uniqueMarkers = {};
    extractedData.genetic_markers.forEach(marker => {
      uniqueMarkers[marker.rsid] = marker;
    });
    extractedData.genetic_markers = Object.values(uniqueMarkers);
    
  } catch (error) {
    console.error("ZIP parsing error:", error);
    throw error;
  }

  return extractedData;
}

// Enhanced storage function with validation
async function storeExtractedData(supabase: any, user_id: string, extractedData: any, fileRecord: any, file_id: string) {
  const results = {
    genetic_markers_stored: 0,
    biomarkers_stored: 0,
    out_of_range_count: 0,
    errors: [],
    warnings: []
  };

  // Store genetic markers if we have any
  if (extractedData.genetic_markers.length > 0) {
    try {
      // Create comprehensive SNP data object with individual columns
      const snpData = {};
      const geneticRecord = {
        user_id,
        source_company: extractedData.source_company || 'Unknown',
        file_name: fileRecord.file_name,
        snp_count: 0,
        is_interpreted: extractedData.is_interpreted_report
      };
      
      for (const marker of extractedData.genetic_markers) {
        // Validate marker and genotype
        if (!marker || !marker.rsid || !marker.genotype) {
          results.warnings.push(`Invalid marker data: ${JSON.stringify(marker)}`);
          continue;
        }
        
        // Handle APOE allele formats (E2, E3, E4) and convert to nucleotide genotypes
        let processedGenotype = marker.genotype;
        if ((marker.rsid === 'rs429358' || marker.rsid === 'rs7412') && marker.genotype.match(/E[234]/)) {
          // Convert APOE allele format to nucleotide format
          const alleleToNucleotide = {
            // rs429358 mappings
            'rs429358': { 'E2': 'T', 'E3': 'C', 'E4': 'C' },
            // rs7412 mappings  
            'rs7412': { 'E2': 'C', 'E3': 'C', 'E4': 'T' }
          };
          
          if (marker.genotype.includes('/')) {
            // Handle format like "E3/E3" or "E3/E4"
            const alleles = marker.genotype.split('/');
            if (alleles.length === 2 && alleleToNucleotide[marker.rsid]) {
              const nucleotide1 = alleleToNucleotide[marker.rsid][alleles[0]];
              const nucleotide2 = alleleToNucleotide[marker.rsid][alleles[1]];
              if (nucleotide1 && nucleotide2) {
                processedGenotype = nucleotide1 + nucleotide2;
                console.log(`Converted APOE ${marker.rsid} from ${marker.genotype} to ${processedGenotype}`);
              }
            }
          } else if (marker.genotype.length === 2 && marker.genotype.startsWith('E')) {
            // Handle format like "E3" (single allele)
            const allele = marker.genotype;
            if (alleleToNucleotide[marker.rsid] && alleleToNucleotide[marker.rsid][allele]) {
              const nucleotide = alleleToNucleotide[marker.rsid][allele];
              processedGenotype = nucleotide + nucleotide; // Homozygous
              console.log(`Converted APOE ${marker.rsid} from ${marker.genotype} to ${processedGenotype}`);
            }
          }
        }
        
        // FLEXIBLE genotype validation - accept ANY non-empty format
        if (!processedGenotype || processedGenotype.trim() === '') {
          results.warnings.push(`Empty genotype for ${marker.rsid}: ${marker.genotype}`);
          continue;
        }
        
        snpData[marker.rsid] = processedGenotype;
        
        // Store in individual columns if it's a target SNP
        if (targetSNPs.includes(marker.rsid)) {
          geneticRecord[marker.rsid] = processedGenotype;
        }
      }

      // Store SNP data as JSON for backup
      geneticRecord.snp_data = snpData;
      geneticRecord.snp_count = Object.keys(snpData).length;

      // Calculate derived variants
      if (geneticRecord.rs429358 && geneticRecord.rs7412) {
        geneticRecord.apoe_variant = calculateAPOE(geneticRecord.rs429358, geneticRecord.rs7412);
      }
      if (geneticRecord.rs4680) {
        geneticRecord.comt_val158met = geneticRecord.rs4680;
      }
      if (geneticRecord.rs1801133) {
        geneticRecord.mthfr_c677t = geneticRecord.rs1801133;
      }
      if (geneticRecord.rs2228570) {
        geneticRecord.vdr_fokl = geneticRecord.rs2228570;
      }
      if (geneticRecord.rs174547) {
        geneticRecord.fads1 = geneticRecord.rs174547;
      }

      // Store in genetic_data table (comprehensive schema)
      const { error } = await supabase
        .from("genetic_data")
        .insert(geneticRecord);

      if (error) throw error;
      
      // ALSO store in genetic_markers table (for generate_analysis compatibility)
      // First verify the file_id exists in user_uploads to prevent foreign key constraint errors
      console.log(`Verifying file_id ${file_id} exists in user_uploads...`);
      
      const { data: fileExists, error: fileCheckError } = await supabase
        .from("user_uploads")
        .select("id")
        .eq("id", file_id)
        .single();

      if (fileCheckError || !fileExists) {
        console.error(`File ${file_id} not found in user_uploads:`, fileCheckError?.message);
        results.warnings.push(`Skipping genetic_markers insert - file_id ${file_id} not found in user_uploads`);
      } else {
        console.log(`✅ File ${file_id} exists, proceeding with genetic_markers insert`);
        
        const geneticMarkersRecord = {
          user_id,
          file_id,
          snp_data: snpData,
          source_company: extractedData.source_company || 'Unknown',
          snp_count: Object.keys(snpData).length,
          mthfr_c677t: geneticRecord.rs1801133 || null,
          mthfr_a1298c: geneticRecord.rs1801131 || null,
          apoe_variant: geneticRecord.apoe_variant || null,
          rs1801133: geneticRecord.rs1801133 || null,
          rs1801131: geneticRecord.rs1801131 || null,
          rs429358: geneticRecord.rs429358 || null,
          rs7412: geneticRecord.rs7412 || null,
          rs2228570: geneticRecord.rs2228570 || null,
          rs1544410: geneticRecord.rs1544410 || null,
          rs4680: geneticRecord.rs4680 || null
        };

        const { error: markersError } = await supabase
          .from("genetic_markers")
          .insert(geneticMarkersRecord);

        if (markersError) {
          console.error("Warning: Failed to store in genetic_markers table:", markersError.message);
          results.warnings.push(`Failed to store compatibility data: ${markersError.message}`);
        } else {
          console.log(`✅ Successfully stored genetic markers in both tables`);
        }
      }
      
      results.genetic_markers_stored = Object.keys(snpData).length;
      console.log(`Stored ${results.genetic_markers_stored} genetic markers in both tables`);
    } catch (error) {
      console.error("Error storing genetic markers:", error);
      results.errors.push(`Genetic storage error: ${error.message}`);
    }
  }

  // Store biomarkers if we have any (handle both biomarkers and lab_results formats)
  const biomarkersData = extractedData.biomarkers || {};
  const labResultsData = extractedData.lab_results || [];
  
  // Convert lab_results array to biomarkers object if needed
  if (labResultsData.length > 0) {
    for (const result of labResultsData) {
      if (result.name && result.value !== undefined) {
        biomarkersData[result.name] = result.value;
      }
    }
  }
  
  if (Object.keys(biomarkersData).length > 0) {
    try {
      // Process biomarkers to extract numeric values and check ranges
      const processedBiomarkers = {};
      const flaggedBiomarkers = [];
      const biomarkerRecord = {
        user_id,
        lab_name: extractedData.source_company || 'Unknown',
        test_date: extractedData.test_date,
        file_name: fileRecord.file_name,
        biomarker_count: 0,
        is_interpreted: extractedData.is_interpreted_report
      };
      
      for (const [biomarker, valueStr] of Object.entries(biomarkersData)) {
        const normalizedName = normalizeBiomarkerName(biomarker);
        const numericValue = extractNumericValue(valueStr as string);
        
        if (numericValue !== null && biomarkerRanges[normalizedName]) {
          processedBiomarkers[normalizedName] = numericValue;
          
          // Store in individual column if it exists in our schema
          biomarkerRecord[normalizedName] = numericValue;
          
          // Check if out of range
          const range = biomarkerRanges[normalizedName];
          if (numericValue < range.min || numericValue > range.max) {
            flaggedBiomarkers.push({
              name: normalizedName,
              value: numericValue,
              unit: range.unit,
              status: numericValue < range.min ? 'low' : 'high',
              reference_range: `${range.min}-${range.max} ${range.unit}`,
              severity: calculateSeverity(numericValue, range)
            });
            results.out_of_range_count++;
          }
        }
      }

      // Store processed data as JSON for backup
      biomarkerRecord.biomarker_data = processedBiomarkers;
      biomarkerRecord.biomarker_count = Object.keys(processedBiomarkers).length;
      biomarkerRecord.flagged_biomarkers = flaggedBiomarkers;

      // Store in lab_data table (comprehensive schema)
      const { error } = await supabase
        .from("lab_data")
        .insert(biomarkerRecord);

      if (error) throw error;

      // ALSO store in lab_biomarkers table (for generate_analysis compatibility)
      // Verify file_id exists to prevent foreign key constraint errors
      console.log(`Verifying file_id ${file_id} exists for lab_biomarkers...`);
      
      const { data: fileExists, error: fileCheckError } = await supabase
        .from("user_uploads")
        .select("id")
        .eq("id", file_id)
        .single();

      if (fileCheckError || !fileExists) {
        console.error(`File ${file_id} not found in user_uploads:`, fileCheckError?.message);
        results.warnings.push(`Skipping lab_biomarkers insert - file_id ${file_id} not found in user_uploads`);
      } else {
        console.log(`✅ File ${file_id} exists, proceeding with lab_biomarkers insert`);
        
        const labBiomarkersRecord = {
          user_id,
          file_id,
          biomarker_data: processedBiomarkers,
          biomarker_count: Object.keys(processedBiomarkers).length
        };

        const { error: biomarkersError } = await supabase
          .from("lab_biomarkers")
          .insert(labBiomarkersRecord);

        if (biomarkersError) {
          console.error("Warning: Failed to store in lab_biomarkers table:", biomarkersError.message);
          results.warnings.push(`Failed to store lab compatibility data: ${biomarkersError.message}`);
        } else {
          console.log(`✅ Successfully stored lab biomarkers in both tables`);
        }
      }
      
      results.biomarkers_stored = Object.keys(processedBiomarkers).length;
      console.log(`Stored ${results.biomarkers_stored} biomarkers in both tables, ${results.out_of_range_count} flagged`);
    } catch (error) {
      console.error("Error storing biomarkers:", error);
      results.errors.push(`Biomarker storage error: ${error.message}`);
    }
  }

  return results;
}

// Helper functions
function detectSourceCompany(text: string): string | null {
  if (!text) return null;
  
  const companies = {
    'MaxGen Labs': /maxgen|max gen|Gene RS#|Client Minor|VDR-FOK|MTHFR/i,
    '23andMe': /23andme|23 and me|23andMe/i,
    'AncestryDNA': /ancestry\.com|ancestrydna|ancestry dna/i,
    'MyHeritage': /myheritage|my heritage/i,
    'Dante Labs': /dante labs|dantelabs/i,
    'Nebula Genomics': /nebula genomics|nebula/i,
    'LabCorp': /labcorp|laboratory corporation/i,
    'Quest Diagnostics': /quest diagnostics|quest/i,
    'Everlywell': /everlywell|everly well/i,
    'Thorne': /thorne|thorne research/i,
    'InsideTracker': /insidetracker|inside tracker/i,
    'SelfDecode': /selfdecode|self decode/i,
    'Genova Diagnostics': /genova diagnostics|genova/i,
    'Great Plains': /great plains|gpl/i,
    'Doctors Data': /doctors data|doctor's data/i,
    'ZRT Laboratory': /zrt laboratory|zrt lab/i
  };

  // Check patterns in order of priority (MaxGen first)
  for (const [company, pattern] of Object.entries(companies)) {
    if (pattern.test(text)) {
      console.log(`🏢 Source company detected: ${company}`);
      return company;
    }
  }
  
  // Fallback: check for any genetic test indicators
  if (text.match(/rs\d+.*[+\-]{2}/) && text.match(/[ACGT]{2}/)) {
    console.log(`🏢 Generic genetic test format detected`);
    return 'Unknown Genetic Lab';
  }
  
  return null;
}

function extractTestDate(text: string): string | null {
  const datePatterns = [
    /test date:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /collected:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /collection date:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /report date:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /date:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /(\w+ \d{1,2}, \d{4})/
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try to parse and standardize the date
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {
        return match[1];
      }
    }
  }
  
  return null;
}

function normalizeBiomarkerName(name: string): string | null {
  if (!name) return null;
  
  const normalized = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Check direct match first
  if (biomarkerRanges[normalized]) {
    return normalized;
  }
  
  // Check aliases
  for (const [standard, config] of Object.entries(biomarkerRanges)) {
    if (config.aliases.some(alias => 
      alias.replace(/[^a-z0-9]/g, '_') === normalized
    )) {
      return standard;
    }
  }
  
  // Fuzzy matching for common variations
  const fuzzyMatches = {
    'vitamin_d_25_oh': 'vitamin_d',
    '25_hydroxyvitamin_d': 'vitamin_d',
    'vit_d': 'vitamin_d',
    'b12': 'vitamin_b12',
    'cobalamin': 'vitamin_b12',
    'hgb': 'hemoglobin',
    'hb': 'hemoglobin',
    'hct': 'hematocrit',
    'chol': 'total_cholesterol',
    'trig': 'triglycerides',
    'hdl_c': 'hdl_cholesterol',
    'ldl_c': 'ldl_cholesterol'
  };
  
  if (fuzzyMatches[normalized]) {
    return fuzzyMatches[normalized];
  }
  
  return null;
}

function extractNumericValue(valueStr: string): number | null {
  if (!valueStr) return null;
  
  // Remove common non-numeric characters
  const cleaned = valueStr
    .replace(/[<>≤≥]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract first numeric value
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (match) {
    const value = parseFloat(match[1]);
    return isNaN(value) ? null : value;
  }
  
  return null;
}

function calculateAPOE(rs429358: string, rs7412: string): string {
  // APOE calculation based on the two SNPs
  const combos = {
    'TT_CC': 'E2/E2',
    'CT_CC': 'E2/E3', 
    'CC_CC': 'E3/E3',
    'TT_CT': 'E2/E4',
    'CT_CT': 'E3/E4',
    'CC_CT': 'E4/E4'
  };
  
  const key = `${rs429358}_${rs7412}`;
  return combos[key] || 'Unknown';
}

function calculateSeverity(value: number, range: { min: number, max: number }): string {
  const percentBelow = value < range.min ? ((range.min - value) / range.min) * 100 : 0;
  const percentAbove = value > range.max ? ((value - range.max) / range.max) * 100 : 0;
  
  if (percentBelow > 50 || percentAbove > 50) return 'severe';
  if (percentBelow > 25 || percentAbove > 25) return 'moderate';
  return 'mild';
} 