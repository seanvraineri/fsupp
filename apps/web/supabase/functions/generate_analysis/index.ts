// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";
// Import gene reference list (bundler will inline)
import { geneReferences } from "../../../utils/genetics/reference.ts";
import { allergyConflicts, drugConflicts } from "../../../utils/interactions.ts";

interface AnalysisRequest {
  user_id: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  let body: AnalysisRequest;
  try {
    body = await req.json();
  } catch (_) {
    return new Response('Invalid JSON', { status: 400 });
  }
  const { user_id } = body;
  if (!user_id) return new Response('Missing user_id', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  // 1. Latest completed assessment
  const { data: assessment, error: assErr } = await supabase
    .from('health_assessments')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (assErr || !assessment) {
    return new Response('No completed assessment found', { status: 404 });
  }

  // 2. Genetic markers & lab biomarkers
  const { data: markers } = await supabase
    .from('genetic_markers')
    .select('*')
    .eq('user_id', user_id);
  const { data: labs } = await supabase
    .from('lab_biomarkers')
    .select('*')
    .eq('user_id', user_id);

  // 3. Compose model input
  const modelInput = {
    assessment,
    genetic_markers: markers,
    lab_biomarkers: labs,
    references: geneReferences,
  };

  const openai = new OpenAI();
  const promptSystem = `You are SupplementScribe, a medical-grade supplement–planning engine.
Rules:
• Read all patient data (demographics, lifestyle, meds, allergies, genes, labs, goals).
• Respect allergies and drug–nutrient interactions; note them in interaction_warnings.
• Use geneReferences for genotype-specific support.
• Correct lab deficiencies and align with patient goals.
• Grade evidence as high/moderate/low.
• Follow dosing bounds and avoid redundant nutrients.

STRICT OUTPUT – valid JSON only matching this schema:
interface Recommendation {
  supplement_name: string;
  dosage: { amount: number; unit: 'mg' | 'mcg' | 'IU' | 'g'; frequency: string; };
  reason: string;
  evidence: 'high' | 'moderate' | 'low';
  cautions?: string[];
}
interface AnalysisResponse {
  analysis_summary: string;
  interaction_warnings: string[];
  supplements: Recommendation[];
}`;
  const promptUser = `Schema:\n{\n  analysis_summary: string,\n  supplements: Array< {\n    supplement_name: string,\n    dosage_amount: number,\n    dosage_unit: string,\n    frequency: string,\n    reason: string,\n    evidence: 'high' | 'moderate' | 'low',\n    cautions?: string[]\n  }>\n}\n---\nPatient data: ${JSON.stringify(modelInput)}\nReturn the JSON.`;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser },
      ],
      max_tokens: 1024,
    });
  } catch (err) {
    console.error('OpenAI error', err);
    return new Response('AI error', { status: 500 });
  }

  let result;
  try {
    result = JSON.parse(completion.choices[0].message.content ?? '{}');
  } catch (_) {
    return new Response('Failed to parse AI JSON', { status: 500 });
  }

  let { analysis_summary, interaction_warnings = [], supplements } = result;

  // Build lowercase sets for quick lookup
  const allergies = new Set((assessment.allergies ?? []).map((a: string) => a.toLowerCase()));
  const meds = new Set((assessment.current_medications ?? []).map((m: string) => m.toLowerCase()));

  // Filter supplements against conflicts
  supplements = supplements.filter((s: any) => {
    const nameLower = s.supplement_name.toLowerCase();
    // Allergy
    for (const [allergy, badSupps] of Object.entries(allergyConflicts)) {
      if (allergies.has(allergy) && badSupps.some((b) => b.toLowerCase() === nameLower)) {
        interaction_warnings.push(`Avoid ${s.supplement_name} due to ${allergy} allergy.`);
        return false;
      }
    }
    // Drug conflicts
    for (const [drug, badSupps] of Object.entries(drugConflicts)) {
      if (Array.from(meds).some((m) => m.includes(drug))) {
        if (badSupps.some((b) => b.toLowerCase() === nameLower)) {
          interaction_warnings.push(`${s.supplement_name} may interact with ${drug}.`);
          return false;
        }
      }
    }
    return true;
  });

  // 4. Insert ai_analyses
  const { data: analysisRow, error: aiErr } = await supabase
    .from('ai_analyses')
    .insert({
      user_id,
      assessment_id: assessment.id,
      model_name: 'gpt-4o-mini',
      analysis_summary,
      risk_factors: null,
      deficiencies: null,
      genetic_considerations: null,
      interaction_warnings,
      overall_confidence: 0.8,
    })
    .select()
    .single();
  if (aiErr) {
    console.error(aiErr);
    return new Response('DB insert error', { status: 500 });
  }

  // 5. Insert supplement recommendations
  if (Array.isArray(supplements)) {
    const rows = supplements.map((s) => ({
      user_id,
      analysis_id: analysisRow.id,
      supplement_name: s.supplement_name,
      dosage_amount: s.dosage_amount,
      dosage_unit: s.dosage_unit,
      frequency: s.frequency,
      priority_score: 5,
      recommendation_reason: s.reason,
      expected_benefits: [],
      evidence_quality: s.evidence,
      contraindications: s.cautions ?? null,
      is_active: true,
    }));
    const { data: inserted } = await supabase
      .from('supplement_recommendations')
      .insert(rows)
      .select('id');

    // Trigger product search for each rec (fire and forget)
    const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/product_search`;
    inserted?.forEach(async (r) => {
      try {
        await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendation_id: r.id }),
        });
        // Trigger PubMed citation enrichment (fire and forget)
        const citationsFn = `${Deno.env.get('SUPABASE_URL')}/functions/v1/pubmed_citations`;
        await fetch(citationsFn, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendation_id: r.id }),
        });
      } catch (_) {}
    });
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 