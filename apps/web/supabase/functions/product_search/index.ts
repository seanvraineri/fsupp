// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

interface SearchBody { recommendation_id: string; }

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body: SearchBody;
  try { body = await req.json(); } catch (_) { return new Response('Invalid JSON', { status: 400 }); }
  const { recommendation_id } = body;
  if (!recommendation_id) return new Response('Missing id', { status: 400 });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SERVICE_ROLE_KEY')!);

  const { data: rec, error } = await supabase
    .from('supplement_recommendations')
    .select('*')
    .eq('id', recommendation_id)
    .single();
  if (error || !rec) return new Response('Recommendation not found', { status: 404 });

  // Call xAI search API (pseudo endpoint)
  const query = `${rec.supplement_name} ${rec.dosage_amount} ${rec.dosage_unit}`;
  const xaiKey = Deno.env.get('XAI_API_KEY');
  let product;
  try {
    const resp = await fetch('https://api.xai.io/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${xaiKey}` },
      body: JSON.stringify({ query, top_k: 1 }),
    });
    const json = await resp.json();
    product = json.results?.[0];
  } catch (err) {
    console.error('xAI error', err);
    return new Response('xAI error', { status: 500 });
  }
  if (!product) return new Response('No product found', { status: 404 });

  await supabase.from('product_links').insert({
    recommendation_id,
    product_name: product.title,
    brand: product.brand ?? 'Unknown',
    product_url: product.url,
    image_url: product.image,
    price: product.price ?? null,
    price_per_serving: null,
    currency: product.currency ?? 'USD',
    serving_size: product.serving ?? null,
    servings_per_container: product.servings ?? null,
    matches_dosage: true,
    third_party_tested: product.third_party_tested ?? null,
    gmp_certified: product.gmp ?? null,
    relevance_score: product.score ?? null,
  });

  return new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } });
}); 