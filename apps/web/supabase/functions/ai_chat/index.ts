// @ts-nocheck

import 'https://deno.land/std@0.177.0/dotenv/load.ts';

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ChatRequest {
  conversation_id: string;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { conversation_id }: ChatRequest = await req.json();
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "missing conversation_id" }), { status: 400 });
    }

    // Fetch last 15 messages for context
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(15);

    if (error) throw error;

    const systemPrompt = {
      role: "system",
      content:
        "You are SupplementScribe, an evidence-based supplement and health assistant. Provide concise, accurate responses citing reputable sources when relevant. If recommending supplements, double-check interactions and contraindications based on the user's described conditions. Keep the tone friendly yet professional.",
    };

    const completionPayload = {
      model: "gpt-3.5-turbo-0125",
      messages: [systemPrompt, ...(messages as any)],
      temperature: 0.7,
      max_tokens: 512,
      stream: false,
    };

    const aiResp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(completionPayload),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("OpenAI error", errText);
      return new Response(JSON.stringify({ error: "OpenAI error", details: errText }), { status: 500 });
    }

    const aiJson = await aiResp.json();
    const assistantContent = aiJson.choices[0].message.content.trim();

    // Store assistant message
    const { error: insertErr } = await supabase
      .from("chat_messages")
      .insert({ conversation_id, role: "assistant", content: assistantContent });

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ content: assistantContent }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "internal error", details: `${e}` }), { status: 500 });
  }
}); 