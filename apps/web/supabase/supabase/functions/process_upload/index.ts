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

  return {
    snpData,
    mthfr_c677t,
    mthfr_a1298c,
    // Place-holders for future variants
    vdr_variants: null,
    comt_variants: null,
    apoe_variant: null,
  } as const;
}

serve(async (req) => {
  const event = await req.json();
  if (event.type !== 'OBJECT_CREATED') return new Response('Ignored', { status: 200 });

  const record = event.record as { bucket: string; name: string };
  const objectKey = record.name;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: fileRow } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('storage_path', objectKey)
    .single();
  if (!fileRow) return new Response('Row not found', { status: 200 });

  await supabase
    .from('uploaded_files')
    .update({ processing_status: 'processing', processing_started_at: new Date().toISOString() })
    .eq('id', fileRow.id);

  try {
    const { data: download } = await supabase.storage
      .from(record.bucket)
      .download(objectKey);
    if (!download) throw new Error('Download failed');

    const arrayBuf = await download.arrayBuffer();

    if (fileRow.file_type === 'genetic') {
      const text = new TextDecoder().decode(arrayBuf);
      const parsed = parseGeneticText(text);

      await supabase.from('genetic_markers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        snp_data: parsed.snpData,
        mthfr_c677t: parsed.mthfr_c677t,
        mthfr_a1298c: parsed.mthfr_a1298c,
        vdr_variants: parsed.vdr_variants,
        comt_variants: parsed.comt_variants,
        apoe_variant: parsed.apoe_variant,
        created_at: new Date().toISOString(),
      });
    } else if (fileRow.file_type === 'lab_results') {
      const openai = new OpenAI();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
      const visionResp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Extract biomarkers JSON.' },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:application/octet-stream;base64,${base64}` } },
            ],
          },
        ],
        max_tokens: 1024,
      });
      let biomarkerData: Record<string, unknown> = {};
      try { biomarkerData = JSON.parse(visionResp.choices[0].message.content ?? '{}'); } catch {}
      const num = (k: string) => (typeof biomarkerData[k] === 'number' ? biomarkerData[k] : null);

      await supabase.from('lab_biomarkers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        biomarker_data: biomarkerData,
        vitamin_d: num('vitamin_d'),
        vitamin_b12: num('vitamin_b12'),
        iron: num('iron'),
        ferritin: num('ferritin'),
        magnesium: num('magnesium'),
        cholesterol_total: num('cholesterol_total'),
        hdl: num('hdl'),
        ldl: num('ldl'),
        triglycerides: num('triglycerides'),
        glucose: num('glucose'),
        hba1c: num('hba1c'),
        tsh: num('tsh'),
        created_at: new Date().toISOString(),
      });
    }

    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'completed', processing_completed_at: new Date().toISOString() })
      .eq('id', fileRow.id);
    return new Response('Processed', { status: 200 });
  } catch (err) {
    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'failed', processing_error: String(err), processing_completed_at: new Date().toISOString() })
      .eq('id', fileRow.id);
    return new Response('Failed', { status: 200 });
  }
}); 