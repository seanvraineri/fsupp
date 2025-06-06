import { Claim } from "./claims.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface Verdict { claim:string; verdict:"supported"|"weak"|"contradicted"; pmid?:string; title?:string; abstract?:string; blurb?:string }
export interface ScienceScore { score:number; evidence: Verdict[] }

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function pubmedSearch(term:string):Promise<string[]>{
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=3&term=${encodeURIComponent(term)}`;
  const r = await fetch(url);
  if(!r.ok) return [];
  const j:any = await r.json();
  return j.esearchresult?.idlist ?? [];
}

async function fetchDetails(ids:string[]):Promise<{pmid:string;title:string;abstract:string}[]>{
  if(!ids.length) return [];
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&retmode=text&rettype=abstract&id=${ids.join(",")}`;
  const txt = await (await fetch(url)).text();
  const parts = txt.split(/\n\nPMID: /).map((p,i)=> i?"PMID: "+p:p).filter(Boolean);
  return parts.map(raw=>{
    const pmatch = raw.match(/PMID: (\d+)/);
    const tmatch = raw.match(/Title: (.+)/);
    const amatch = raw.match(/Abstract\s*[\n\r]+([\s\S]+)/);
    return {
      pmid: pmatch?.[1]||"",
      title: tmatch?.[1]||"",
      abstract: amatch?.[1]||""
    };
  });
}

const SCIENCE_PROMPT = `
You are an expert at reviewing scientific literature.
A user has provided a supplement claim, and several abstracts from PubMed.
Your task is to determine if the abstracts support the claim.
Respond ONLY in JSON format: {"verdict": "supported" | "weak" | "contradicted", "reasoning": "A brief explanation for your verdict."}

Claim:
"""
{claim}
"""

Abstracts:
"""
{abstracts}
"""
`;

async function judgeWithLLM(claim: string, abstracts: {abstract:string}[]): Promise<{verdict:"supported"|"weak"|"contradicted", reasoning:string}> {
  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_KEY) return { verdict: "weak", reasoning: "OpenAI key not configured." };

  const content = SCIENCE_PROMPT
    .replace('{claim}', claim)
    .replace('{abstracts}', abstracts.map(a => a.abstract).join('\n\n'));

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
      max_tokens: 100,
      temperature: 0.1,
      response_format: { type: "json_object" },
    })
  });

  if (!r.ok) return { verdict: "weak", reasoning: "Failed to query OpenAI." };
  const j = await r.json();
  try {
    return JSON.parse(j.choices[0].message.content);
  } catch {
    return { verdict: "weak", reasoning: "Failed to parse OpenAI response." };
  }
}

function daysAgo(dateStr:string){
  return (Date.now() - new Date(dateStr).getTime())/ (1000*60*60*24);
}

export async function scoreScience(claims:Claim[]):Promise<ScienceScore>{
  const evidence:Verdict[]=[];
  let supported=0;

  for(const c of claims){
    const key = c.text.toLowerCase();
    const { data:cache } = await sb.from("claim_cache").select("verdict,pmid,title,abstract,updated_at,reasoning").eq("claim_key",key).maybeSingle();
    let row:Verdict|undefined;
    if(cache && daysAgo(cache.updated_at) < 30){
      row = { claim:c.text, verdict:cache.verdict as any, pmid:cache.pmid, title:cache.title, abstract:cache.abstract, blurb: cache.reasoning };
    }

    if(!row){
      const keyword = c.text.split(" ").slice(0,4).join(" ");
      const ids = await pubmedSearch(keyword);
      const details = await fetchDetails(ids);
      const { verdict, reasoning } = await judgeWithLLM(c.text, details);
      const first = details[0] ?? {pmid:"",title:"",abstract:""};
      row = { claim:c.text, verdict, pmid:first.pmid, title:first.title, abstract:first.abstract, blurb: reasoning };
      await sb.from("claim_cache").upsert({claim_key:key, verdict, pmid:first.pmid, title:first.title, abstract:first.abstract, reasoning });
    }

    if(row.verdict==="supported") supported++;
    evidence.push(row);
  }
  const score = claims.length > 0 ? Math.round((supported/claims.length)*100) : 50;
  return { score, evidence };
} 