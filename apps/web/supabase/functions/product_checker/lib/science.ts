import { Claim } from "./claims.ts";
// @ts-ignore deno remote import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface Verdict { claim:string; verdict:"supported"|"weak"|"contradicted"; pmid?:string; title?:string; abstract?:string }
export interface ScienceScore { score:number; evidence: Verdict[] }

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Supabase client for caching
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function pubmedSearch(term:string):Promise<string[]>{
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=3&term=${encodeURIComponent(term)}`;
  try{
    const r = await fetch(url);
    if(!r.ok) return [];
    const j:any = await r.json();
    return j.esearchresult?.idlist ?? [];
  }catch(err){
    console.error("pubmedSearch error",err);
    return [];
  }
}

async function fetchDetails(ids:string[]):Promise<{pmid:string;title:string;abstract:string}[]>{
  if(!ids.length) return [];
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&retmode=text&rettype=abstract&id=${ids.join(",")}`;
  try{
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
  }catch(err){
    console.error("pubmed fetchDetails error",err);
    return [];
  }
}

function judge(abstracts:string[]):"supported"|"weak"|"contradicted"{
  const joined = abstracts.join(" ").toLowerCase();
  if(/no (statistically )?significant effect|not effective/.test(joined)) return "contradicted";
  if(/significant (increase|improvement|reduction)/.test(joined) && /randomized|double[- ]blind/.test(joined)) return "supported";
  return "weak";
}

function daysAgo(dateStr:string){
  return (Date.now() - new Date(dateStr).getTime())/ (1000*60*60*24);
}

export async function scoreScience(claims:Claim[]):Promise<ScienceScore>{
  const evidence:Verdict[]=[];
  let supported=0;

  for(const c of claims){
    const key = c.text.toLowerCase();
    // check cache (30-day)
    const { data:cache } = await sb.from("claim_cache").select("verdict,pmid,title,abstract,updated_at").eq("claim_key",key).maybeSingle();
    let row:Verdict|undefined;
    if(cache && daysAgo(cache.updated_at) < 30){
      row = { claim:c.text, verdict:cache.verdict as any, pmid:cache.pmid, title:cache.title, abstract:cache.abstract };
    }

    if(!row){
      const keyword = c.text.split(" ").slice(0,3).join(" ");
      const ids = await pubmedSearch(keyword);
      const details = await fetchDetails(ids);
      const verdictCalc = judge(details.map(d=>d.abstract));
      const first = details[0] ?? {pmid:"",title:"",abstract:""};
      row = { claim:c.text, verdict:verdictCalc, pmid:first.pmid, title:first.title, abstract:first.abstract };
      // store cache
      await sb.from("claim_cache").upsert({claim_key:key, verdict:verdictCalc, pmid:first.pmid, title:first.title, abstract:first.abstract});
    }

    if(row.verdict==="supported") supported++;
    evidence.push(row);
  }
  const score = Math.round((supported/claims.length)*100);
  return { score, evidence };
} 
