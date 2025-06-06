import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { resolveProduct } from "./lib/resolver.ts";
import { getIngredients } from "./lib/ingredients.ts";
import { getClaims } from "./lib/claims.ts";
import { scoreScience } from "./lib/science.ts";
import { scorePersonal } from "./lib/personal.ts";
import { combineScore, emojiFor } from "./lib/score.ts";
import { getCache, setCache, logRun } from "./lib/cache.ts";

interface Payload {
  user_id: string;
  text?: string;
  url?: string;
  image_base64?: string;
  stream?: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, baggage, sentry-trace",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const started = performance.now();
  let cacheHit = false;
  let productId = "unknown";
  let userId = "unknown";

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const payload: Payload = await req.json();
    userId = payload.user_id || "anonymous";

    // Validate input
    const provided = [payload.text, payload.url, payload.image_base64].filter(Boolean).length;
    if (provided !== 1) {
      return new Response("Provide exactly one of text, url, image_base64", { status: 400, headers: corsHeaders });
    }

    // Resolve product
    const product = await resolveProduct(payload);
    productId = product.id;

    // Cache check
    const cached = await getCache(userId, productId);
    if (cached) {
      cacheHit = true;
      await logRun({
        user_id: userId,
        product_id: productId,
        ms: Math.round(performance.now() - started),
        tokens_used: 0,
        cache_hit: true,
      });
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run pipeline
    const ingredients = await getIngredients(product);
    const claims = await getClaims(product);
    const scienceScore = await scoreScience(claims);
    const personalScore = await scorePersonal(userId, ingredients);
    const overall = combineScore(scienceScore.score, personalScore.score);

    const verdict: any = {
      product: { name: product.name, brand: product.brand, id: product.id },
      score: overall,
      emoji: emojiFor(overall),
      science: scienceScore,
      personal: personalScore,
      ingredients,
      claims,
    };

    // Generate summary
    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
    if (OPENAI_KEY) {
      try {
        const prompt = `You are a functional medicine expert. Write a comprehensive analysis and recommendation based on the following product verdict JSON.
Structure your response with these sections:
- **Overall Score & Summary:** Start with the overall score and a concise summary of the recommendation.
- **Science-Based Analysis:** Review the product's claims. For each, state the verdict (Supported, Weak, Contradicted) and briefly explain the scientific reasoning.
- **Personalized Fit Analysis:** Detail the pros and cons for the user based on their specific health data. Use bullet points for clarity. Explain *why* each point is relevant to their profile (e.g., "Because your lab results show low Vitamin D, the D3 in this product is beneficial.").

Maintain a professional, empathetic, and clear tone.

JSON:
${JSON.stringify(verdict, null, 2)}`;

        const body = {
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful, expert assistant providing supplement analysis." },
            { role: "user", content: prompt },
          ],
          max_tokens: 240,
          temperature: 0.7,
        };
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify(body),
        });
        const j: any = await r.json();
        verdict.summary = j.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        console.error("summary generation failed", err);
      }
    }

    // Cache and log
    await setCache(userId, productId, verdict);
    await logRun({
      user_id: userId,
      product_id: productId,
      ms: Math.round(performance.now() - started),
      tokens_used: 0,
      cache_hit: false,
    });

    return new Response(JSON.stringify(verdict), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[product_checker] error", err);
    await logRun({
      user_id: userId,
      product_id: productId,
      ms: Math.round(performance.now() - started),
      tokens_used: 0,
      cache_hit: cacheHit,
      err: err?.message?.slice(0, 200),
    });
    return new Response(err.message || "Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}); 