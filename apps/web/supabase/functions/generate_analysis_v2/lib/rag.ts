// deno-lint-ignore-file
// @ts-nocheck

export interface RagSummary { pmid: string; title: string; summary: string; }

interface RagContext {
  summaries: RagSummary[];
  textBlock: string;
}

const BUCKET = "pubmed_cache";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getRagContext(query: string, supabase?: any): Promise<RagContext> {
  if (!supabase) return { summaries: [], textBlock: "" };

  const hash = await sha256(query);
  const cachePath = `${hash}.json`;

  try {
    const { data: cached } = await supabase.storage.from(BUCKET).download(cachePath);
    if (cached) {
      const metaRes = await supabase.storage.from(BUCKET).getMetadata(cachePath);
      const lastModified = metaRes?.data?.updated_at ? Date.parse(metaRes.data.updated_at) : 0;
      if (Date.now() - lastModified < TTL_MS) {
        const text = await cached.text();
        const summaries: RagSummary[] = JSON.parse(text);
        return { summaries, textBlock: formatSummaries(summaries) };
      }
    }
  } catch (_) {}

  const { data, error } = await supabase.rpc("rpc_match_papers", { p_query: query, p_top_k: 3 });
  if (error || !data) return { summaries: [], textBlock: "" };

  const summaries: RagSummary[] = (data as any[]).map((d) => ({
    pmid: d.pmid ?? "",
    title: d.title ?? "",
    summary: d.summary ?? ""
  }));

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

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
} 
