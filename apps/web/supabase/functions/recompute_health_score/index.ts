// deno-lint-ignore-file
// @ts-nocheck – quick scaffold, will tighten types later
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { weightedScore, ema } from "./lib/scoreMath.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { user_id } = await req.json();
  if (!user_id) return new Response("Missing user_id", { status: 400 });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  // Fetch pieces
  const [microRes, inflamRes, geneticRes, lifestyleRes, adherenceRes, weightRes, prevRes] = await Promise.all([
    supabase.rpc("calc_micro_score", { uid: user_id }).single(),
    supabase.rpc("calc_inflam_score", { uid: user_id }).single(),
    supabase.rpc("calc_genetic_score", { uid: user_id }).single(),
    supabase.rpc("calc_lifestyle_score", { uid: user_id }).single(),
    supabase.rpc("calc_adherence_score", { uid: user_id }).single(),
    supabase.rpc("calc_weight_score", { uid: user_id }).single(),
    supabase.from("health_scores").select("score").eq("user_id", user_id).maybeSingle(),
  ]);

  if (microRes.error) console.error(microRes.error);
  if (inflamRes.error) console.error(inflamRes.error);
  if (geneticRes.error) console.error(geneticRes.error);
  if (lifestyleRes.error) console.error(lifestyleRes.error);
  if (adherenceRes.error) console.error(adherenceRes.error);
  if (weightRes.error) console.error(weightRes.error);

  const components = {
    micronutrients: microRes?.data?.score ?? 50,
    inflam_lipids: inflamRes?.data?.score ?? 50,
    genetics: geneticRes?.data?.score ?? 50,
    lifestyle: lifestyleRes?.data?.score ?? 50,
    adherence: adherenceRes?.data?.score ?? 50,
    weight_trend: weightRes?.data?.score ?? 50,
  } as any;

  const raw = weightedScore(components);
  const prev = prevRes?.data?.score ?? 50;
  const newScore = ema(prev, raw);

  // Clamp daily delta to ±3
  const clamped = Math.max(Math.min(newScore, prev + 3), prev - 3);

  // Upsert health_scores
  await supabase.from("health_scores").upsert({
    user_id,
    score: clamped,
    components,
    updated_at: new Date().toISOString(),
  });

  // Insert history row
  await supabase.from("health_score_history").upsert({
    user_id,
    date: new Date().toISOString().substring(0, 10),
    score: clamped,
  });

  return new Response(JSON.stringify({ ok: true, score: clamped }), { status: 200 });
}); 
