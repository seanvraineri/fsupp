// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper – call OpenAI embeddings endpoint
async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }
  const json = await res.json();
  return json.data[0].embedding as number[];
}

interface Item {
  user_id: string;
  source_type: string; // gene | lab | assessment | chat | plan | other
  source_id: string;
  content: string;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { items }: { items: Item[] } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response("No items provided", { status: 400 });
    }

    const inserts: any[] = [];

    for (const item of items) {
      // naive chunking – split by 1500 characters (≈600 tokens)
      const chunks = item.content.match(/.{1,1500}(?:\s|$)/gs) || [item.content];
      let chunkIndex = 0;
      for (const chunk of chunks) {
        const emb = await getEmbedding(chunk);
        inserts.push({
          user_id: item.user_id,
          source_type: item.source_type,
          source_id: item.source_id,
          chunk_index: chunkIndex++,
          content: chunk,
          embedding: `[${emb.join(",")}]`, // pgvector expects vector literal string
        });
      }
    }

    const { error } = await supabase.from("user_embeddings").insert(inserts);
    if (error) throw error;

    return new Response(JSON.stringify({ status: "ok", inserted: inserts.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 