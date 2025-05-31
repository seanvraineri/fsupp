// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";

interface CitationBody {
  recommendation_id: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: CitationBody;
  try {
    body = await req.json();
  } catch (_) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { recommendation_id } = body;
  if (!recommendation_id) return new Response('Missing id', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  // Fetch recommendation row (need supplement_name & user_id)
  const { data: rec, error } = await supabase
    .from('supplement_recommendations')
    .select('id, supplement_name, user_id')
    .eq('id', recommendation_id)
    .single();
  if (error || !rec) {
    console.error('Recommendation not found', error);
    return new Response('Recommendation not found', { status: 404 });
  }

  // Latest completed assessment – used for personalization context
  const { data: assessment } = await supabase
    .from('health_assessments')
    .select('health_conditions, health_goals, allergies')
    .eq('user_id', rec.user_id)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const extraKeywords: string[] = [];
  if (assessment?.health_conditions?.length) extraKeywords.push(...assessment.health_conditions.slice(0, 2));
  if (assessment?.health_goals?.length) extraKeywords.push(assessment.health_goals[0]);

  const apiKey = Deno.env.get('PUBMED_API_KEY');
  if (!apiKey) {
    return new Response('PUBMED_API_KEY not set', { status: 500 });
  }

  // Build search query – supplement name + personalized keywords
  const term = encodeURIComponent(`${rec.supplement_name} supplementation ${extraKeywords.join(' ')}`);
  const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=3&sort=relevance&term=${term}&api_key=${apiKey}`;

  let ids: string[] = [];
  try {
    const resp = await fetch(esearchUrl);
    const json = await resp.json();
    ids = json.esearchresult?.idlist ?? [];
  } catch (err) {
    console.error('PubMed search error', err);
    return new Response('PubMed error', { status: 500 });
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
  const inserted: any[] = [];

  for (const pmid of ids) {
    // Title via esummary
    let title = '';
    try {
      const su = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json&api_key=${apiKey}`;
      const sRes = await fetch(su);
      const sJson = await sRes.json();
      title = sJson.result?.[pmid]?.title ?? '';
    } catch (_) {}

    // Abstract via efetch
    let abstractText = '';
    try {
      const au = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text&api_key=${apiKey}`;
      const aRes = await fetch(au);
      abstractText = await aRes.text();
    } catch (_) {}

    // Personalized summary with OpenAI
    let summary = '';
    if (openai && abstractText) {
      try {
        const prompt = `Patient profile: ${JSON.stringify(assessment)}\n\nArticle abstract: ${abstractText}\n\nIn 2 concise sentences, explain why the findings of this study are specifically relevant for this patient.`;
        const comp = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-0125',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 120,
        });
        summary = comp.choices?.[0]?.message?.content?.trim() ?? '';
      } catch (err) {
        console.error('OpenAI error', err);
      }
    }

    // Insert into recommendation_citations table (ignore duplicates)
    const { data: row } = await supabase
      .from('recommendation_citations')
      .insert({ recommendation_id, pmid, title, summary }, { onConflict: 'recommendation_id,pmid' })
      .select()
      .maybeSingle();
    if (row) inserted.push(row);
  }

  return new Response(JSON.stringify({ inserted }), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 