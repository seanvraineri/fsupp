// deno-lint-ignore-file
// @ts-nocheck
import { createHash } from "https://deno.land/std@0.208.0/hash/mod.ts";

export interface RagSummary { pmid: string; title: string; summary: string; }

interface RagContext {
  summaries: RagSummary[];
  textBlock: string; // formatted chunk for system prompt
}

const BUCKET = "pubmed_cache";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getRagContext(profile: any, query: string, supabase?: any): Promise<RagContext> {
  if (!supabase) return { summaries: [], textBlock: "" };

  const hash = sha256(query);
  const cachePath = `${hash}.json`;

  try {
    // Try cache first
    const { data: cached, error } = await supabase.storage.from(BUCKET).download(cachePath);
    if (cached && !error) {
      const metaRes = await supabase.storage.from(BUCKET).getMetadata(cachePath);
      const lastModified = metaRes?.data?.updated_at ? Date.parse(metaRes.data.updated_at) : 0;
      if (Date.now() - lastModified < TTL_MS) {
        const text = await cached.text();
        const summaries: RagSummary[] = JSON.parse(text);
        return { summaries, textBlock: formatSummaries(summaries) };
      }
    }
  } catch (_) {}

  // Cache miss – call embeddings RPC
  const { data, error } = await supabase.rpc("rpc_match_papers", { p_query: query, p_top_k: 3 });
  if (error || !data) {
    console.warn("rpc_match_papers error", error);
    return { summaries: [], textBlock: "" };
  }

  // Ensure correct shape
  const summaries: RagSummary[] = (data as any[]).map((d) => ({
    pmid: d.pmid ?? "",
    title: d.title ?? "",
    summary: d.summary ?? ""
  }));

  // Store cache (fire and forget)
  supabase.storage.from(BUCKET).upload(cachePath, JSON.stringify(summaries), { upsert: true, contentType: "application/json" }).catch(() => {});

  return { summaries, textBlock: formatSummaries(summaries) };
}

function formatSummaries(summaries: RagSummary[]): string {
  if (!summaries.length) return "";
  let block = "\n\n### PubMed Summaries:";
  for (const s of summaries) {
    block += `\n- (${s.pmid}) ${s.title} – ${s.summary.slice(0, 160)}…`;
  }
  return block;
}

function sha256(str: string): string {
  const h = createHash("sha256");
  h.update(str);
  return h.toString();
} 