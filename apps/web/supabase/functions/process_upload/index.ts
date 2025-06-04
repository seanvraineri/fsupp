// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";

// Helper: parse 23andMe / AncestryDNA raw text files
function parseGeneticText(content: string) {
  const snpData: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [rsid, _chrom, _pos, genotype] = line.split(/\s+/);
    if (rsid && genotype) {
      snpData[rsid] = genotype;
    }
  }
  // Highlighted markers (add more as needed)
  const mthfr_c677t = snpData['rs1801133'] ?? null; // C677T
  const mthfr_a1298c = snpData['rs1801131'] ?? null; // A1298C
  const apoe_variant = snpData['rs429358'] && snpData['rs7412'] ? `${snpData['rs429358']}/${snpData['rs7412']}` : null;
  const vdr_variants = {
    rs2228570: snpData['rs2228570'] ?? null,
    rs1544410: snpData['rs1544410'] ?? null,
  };

  return {
    snpData,
    mthfr_c677t,
    mthfr_a1298c,
    vdr_variants,
    comt_variants: null,
    apoe_variant,
  } as const;
}

serve(async (req) => {
  // Supabase sends a JSON body describing the Storage event
  const event = await req.json();

  // We only care about object-created events
  if (event.type !== 'OBJECT_CREATED') {
    return new Response('Ignored: not an object-created event', { status: 200 });
  }

  const record = event.record as { bucket: string; name: string };
  const bucket = record.bucket;
  const objectKey = record.name; // e.g. "userId/assessmentId/genetic/123_file.txt"

  // Admin Supabase client (service role key)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  // Fetch the matching uploaded_files row
  const { data: fileRow, error: fileErr } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('storage_path', objectKey)
    .single();

  if (fileErr || !fileRow) {
    console.error('uploaded_files row not found for object', objectKey, fileErr);
    return new Response('Row not found', { status: 200 });
  }

  // Mark as processing
  await supabase
    .from('uploaded_files')
    .update({ processing_status: 'processing', processing_started_at: new Date().toISOString() })
    .eq('id', fileRow.id);

  try {
    // Download the file from storage
    const { data: download, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(objectKey);
    if (dlErr || !download) throw dlErr || new Error('Download failed');

    const arrayBuf = await download.arrayBuffer();

    if (fileRow.file_type === 'genetic') {
      // ------- Genetic Parser -------
      const text = new TextDecoder().decode(arrayBuf);
      const parsed = parseGeneticText(text);

      // Insert into genetic_markers
      const { error: insertErr } = await supabase.from('genetic_markers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        snp_data: parsed.snpData,
        mthfr_c677t: parsed.mthfr_c677t,
        mthfr_a1298c: parsed.mthfr_a1298c,
        vdr_variants: parsed.vdr_variants,
        comt_variants: parsed.comt_variants,
        apoe_variant: parsed.apoe_variant,
        source_company: null,
        chip_version: null,
        created_at: new Date().toISOString(),
      });
      if (insertErr) throw insertErr;
    } else if (fileRow.file_type === 'lab_results') {
      // ------- Lab-Result Parser (PDF / image) -------
      // 1. Detect text vs scanned image. For now we send bytes straight to OpenAI vision.
      const openai = new OpenAI();

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
      const visionResp = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // vision-capable model
        messages: [
          {
            role: 'system',
            content: `You are a medical data extraction assistant. Extract biomarker measurements from lab work and return a JSON object with lowercase snake_case keys and numeric values. Ignore any biomarker without a numeric result.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/octet-stream;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
      });

      // The assistant should respond with JSON – try to parse it.
      let biomarkerData: Record<string, unknown> | null = null;
      try {
        biomarkerData = JSON.parse(visionResp.choices[0].message.content?.trim() ?? '{}');
      } catch (_) {
        throw new Error('Failed to parse JSON from OpenAI');
      }

      // Map a few common biomarkers into dedicated columns
      const toNum = (key: string) => {
        const val = biomarkerData?.[key];
        return typeof val === 'number' ? val : null;
      };

      const { error: labErr } = await supabase.from('lab_biomarkers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        biomarker_data: biomarkerData,
        vitamin_d: toNum('vitamin_d'),
        vitamin_b12: toNum('vitamin_b12'),
        iron: toNum('iron'),
        ferritin: toNum('ferritin'),
        magnesium: toNum('magnesium'),
        cholesterol_total: toNum('cholesterol_total'),
        hdl: toNum('hdl'),
        ldl: toNum('ldl'),
        triglycerides: toNum('triglycerides'),
        glucose: toNum('glucose'),
        hba1c: toNum('hba1c'),
        tsh: toNum('tsh'),
        created_at: new Date().toISOString(),
      });
      if (labErr) throw labErr;
    }

    // Mark as completed
    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'completed', processing_completed_at: new Date().toISOString() })
      .eq('id', fileRow.id);

    return new Response('Processed', { status: 200 });
  } catch (err) {
    console.error('Processing error:', err);
    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'failed', processing_error: `${err}`, processing_completed_at: new Date().toISOString() })
      .eq('id', fileRow.id);
    return new Response('Failed', { status: 200 });
  }
}); 
