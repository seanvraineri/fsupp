// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";

function parseGeneticText(content: string) {
  const snpData: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [rsid, , , genotype] = line.split(/\s+/);
    if (rsid && genotype) snpData[rsid] = genotype;
  }
  return {
    snpData,
    mthfr_c677t: snpData['rs1801133'] ?? null,
    mthfr_a1298c: snpData['rs1801131'] ?? null,
    apoe_variant: snpData['rs429358'] && snpData['rs7412'] ? `${snpData['rs429358']}/${snpData['rs7412']}` : null,
    vdr_variants: {
      rs2228570: snpData['rs2228570'] ?? null,
      rs1544410: snpData['rs1544410'] ?? null,
    },
  } as const;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { path: string; bucket?: string; file_type: 'genetic' | 'lab_results' };
  try {
    body = await req.json();
  } catch (_) {
    return new Response('Invalid JSON', { status: 400 });
  }
  const { path, bucket = 'uploads', file_type } = body;
  if (!path || !file_type) return new Response('Missing path or file_type', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: fileRow, error: frErr } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('storage_path', path)
    .single();
  if (frErr || !fileRow) return new Response('upload row not found', { status: 404 });

  const { data: download, error: dlErr } = await supabase.storage.from(bucket).download(path);
  if (dlErr || !download) return new Response('download failed', { status: 500 });

  const arrayBuf = await download.arrayBuffer();
  try {
    if (file_type === 'genetic') {
      const parsed = parseGeneticText(new TextDecoder().decode(arrayBuf));
      await supabase.from('genetic_markers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        snp_data: parsed.snpData,
        mthfr_c677t: parsed.mthfr_c677t,
        mthfr_a1298c: parsed.mthfr_a1298c,
        apoe_variant: parsed.apoe_variant,
        vdr_variants: parsed.vdr_variants,
      });
    } else {
      const openai = new OpenAI();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'extract biomarkers json' },
          { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:application/octet-stream;base64,${base64}` } }] },
        ],
      });
      let biomarker = {} as Record<string, unknown>;
      try { biomarker = JSON.parse(resp.choices[0].message.content ?? '{}'); } catch {}
      const num = (k: string) => (typeof biomarker[k] === 'number' ? biomarker[k] : null);
      await supabase.from('lab_biomarkers').insert({
        user_id: fileRow.user_id,
        file_id: fileRow.id,
        biomarker_data: biomarker,
        vitamin_d: num('vitamin_d'),
        vitamin_b12: num('vitamin_b12'),
        iron: num('iron'),
        ferritin: num('ferritin'),
      });
    }
    await supabase.from('uploaded_files').update({ processing_status: 'completed' }).eq('id', fileRow.id);
    return new Response('Processed', { status: 200 });
  } catch (err) {
    await supabase.from('uploaded_files').update({ processing_status: 'failed', processing_error: String(err) }).eq('id', fileRow.id);
    return new Response('Failed', { status: 500 });
  }
}); 