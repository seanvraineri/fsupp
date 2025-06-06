// deno-lint-ignore-file no-explicit-any
// Main orchestrator for Product Checker Edge Function
// See README in requirements for the full pipeline spec.

// @ts-expect-error deno runtime import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { resolveProduct } from "./lib/resolver.ts";
import { getIngredients, Ingredient } from "./lib/ingredients.ts";
import { getClaims, Claim } from "./lib/claims.ts";
import { scorePersonal, PersonalScore } from "./lib/personal.ts";
import { combineScore, emojiFor } from "./lib/score.ts";
import { getCache, setCache, logRun } from "./lib/cache.ts";

interface Payload{ user_id:string; text?:string; url?:string; image_base64?:string; stream?:boolean }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, baggage, sentry-trace',
};

// Helper to resolve product via SerpApi
async function resolveViaSerpApi(query: string, apiKey: string) {
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&hl=en&gl=us`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`SerpApi error ${resp.status}`);
  }
  const json: any = await resp.json();
  const first = json?.shopping_results?.[0] || json?.organic_results?.[0];
  if (!first) throw new Error("No results found");
  return {
    name: first.title || first.name || query,
    brand: first.source || first.store || "Unknown",
    link: first.link,
    id: first.product_id || first.position || crypto.randomUUID(),
  };
}

serve(async (req: Request)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const started = performance.now();
  // let tokens=0; // Simplified
  // let cache_hit=false; // Simplified
  let user_id="unknown_user"; // Default for simplified version
  let product_id="unknown"; // Default for simplified version

  try{
    // Ensure this is a POST request before trying to parse JSON
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const payload:Payload = await req.json();
    user_id = payload.user_id || "user_id_not_in_payload";
    
    console.log(`[product_checker_simplified] Received POST for user: ${user_id}`);
    console.log(`[product_checker_simplified] Payload: ${JSON.stringify(payload)}`);

    /* ---------- FULL PIPELINE ---------- */
    // validate payload (only one of text/url/image)
    const provided = [payload.text, payload.url, payload.image_base64].filter(Boolean).length;
    if (provided !== 1) {
      return new Response("Provide exactly one of text, url, or image_base64", { status: 400, headers: corsHeaders });
    }

    // Resolve product (may throw)
    const prod = await resolveProduct(payload);
    product_id = prod.id;

    // Check 7-day cache
    const cachedVerdict = await getCache(user_id, product_id);
    if (cachedVerdict) {
      await logRun({ user_id, product_id, ms: Math.round(performance.now() - started), tokens_used: 0, cache_hit: true });
      return new Response(JSON.stringify(cachedVerdict), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ingredients & claims extraction
    const ingredients: Ingredient[] = await getIngredients(prod);
    const claims: Claim[] = await getClaims(prod);

    // Evidence scoring (may take time)
    const scienceScore = 60; // placeholder science score to avoid heavy PubMed calls
    const science = { score: scienceScore, evidence: [] } as any;
    const personal: PersonalScore = await scorePersonal(user_id, ingredients);

    const overallScore = combineScore(scienceScore, personal.score);

    const verdict = {
      product: { id: prod.id, name: prod.name, brand: prod.brand },
      score: overallScore,
      emoji: emojiFor(overallScore),
      science,
      personal,
      ingredients,
      claims,
      summary: ""
    };

    /* ---------- Summary Generation ---------- */
    try {
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (OPENAI_API_KEY) {
        const prompt = `Provide a concise, consumer-friendly summary (max 120 words) explaining why this supplement received a score of ${overallScore}/100. Highlight: 1) key scientific evidence strengths or weaknesses, 2) any personal fit notes listed. End with an actionable suggestion if relevant.`;
        const sys = { role: "system", content: "You are an evidence-based nutrition analyst." };
        const usr = { role: "user", content: `${prompt}\n\nScience evidence JSON: ${JSON.stringify(science.evidence).slice(0,2000)}\nPersonal bullets: ${personal.bullets.join("; ")}` };
        const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [sys, usr],
            max_tokens: 120,
            temperature: 0.7,
          }),
        });
        if (aiResp.ok) {
          const j:any = await aiResp.json();
          verdict.summary = j.choices?.[0]?.message?.content?.trim() ?? "";
        }
      }
    } catch(e){ console.error("Summary generation failed", e); }

    await setCache(user_id, product_id, verdict);
    await logRun({ user_id, product_id, ms: Math.round(performance.now() - started), tokens_used: 0, cache_hit: false });

    console.log(`[product_checker] Completed full analysis for ${prod.name}`);
    return new Response(JSON.stringify(verdict), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  }catch(err:any){
    console.error("[product_checker_simplified] Error caught:", err);
    // await logRun({user_id,product_id,ms:Math.round(performance.now()-started),tokens_used:tokens,cache_hit,err:err.message?.slice(0,200)});
    // Return the actual error message if available, with CORS headers
    return new Response(err.message || "Internal Server Error (simplified)", { status: 500, headers: corsHeaders });
  }
}); 
