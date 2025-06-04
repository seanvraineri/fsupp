// deno-lint-ignore-file
// @ts-nocheck
// ai_chat_v4 index.ts – scaffolding
// Thin HTTP handler that will delegate to new helpers

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// New modular helpers (currently placeholders)
import { buildUserProfile } from "./lib/profile.ts";
import { getRagContext } from "./lib/rag.ts";
import { providerCascade } from "./lib/providers.ts";
import { fetchBestLinks } from "./lib/products.ts";
import { runModeration } from "./lib/moderate.ts";
import { logMetric, logCost } from "./lib/telemetry.ts";

interface ChatRequest {
  conversation_id: string;
  user_id?: string;
  prompt: string;
}

Deno.serve(async (req: Request) => {
  const start = Date.now();

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Feature flag – only run if env allows
  if (Deno.env.get("USE_AI_CHAT_V4") !== "true") {
    return new Response(JSON.stringify({ error: "ai_chat_v4 disabled" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Basic moderation guard
  if (!(await runModeration(body.prompt))) {
    return new Response(JSON.stringify({ error: "Content blocked" }), { status: 409 });
  }

  // Build profile & RAG context (placeholders)
  const profile = await buildUserProfile(supabase, body.user_id);
  const rag = await getRagContext(profile, body.prompt);

  // Provider cascade – returns full text
  const aiResult = await providerCascade(body.prompt, profile, rag);

  // Append product links (placeholder)
  const shopBlock = await fetchBestLinks(supabase, aiResult.text);

  const full = `${aiResult.text}

${shopBlock}`;

  // Log cost & metrics (placeholders)
  await logCost(supabase, aiResult.costUsd);
  await logMetric(supabase, { latency_ms: Date.now() - start });

  return new Response(JSON.stringify({ content: full }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}); 
