import { Claim } from "./claims.ts";

export interface Verdict { claim:string; verdict:"supported"|"weak"|"contradicted"; pmid?:string; title?:string }
export interface ScienceScore { score:number; evidence: Verdict[] }

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

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

function judge(abstracts:string[]):"supported"|"weak"|"contradicted"{
  const joined = abstracts.join(" ").toLowerCase();
  if(/no (statistically )?significant effect|not effective/.test(joined)) return "contradicted";
  if(/significant (increase|improvement|reduction)/.test(joined) && /randomized|double[- ]blind/.test(joined)) return "supported";
  return "weak";
}

export async function scoreScience(claims:Claim[]):Promise<ScienceScore>{
  const evidence:Verdict[]=[];
  let supported=0;

  for(const c of claims){
    const keyword = c.text.split(" ").slice(0,3).join(" ");
    const ids = await pubmedSearch(keyword);
    const details = await fetchDetails(ids);
    const verdict = judge(details.map(d=>d.abstract));
    if(verdict==="supported") supported++;
    evidence.push({claim:c.text, verdict, pmid:details[0]?.pmid,title:details[0]?.title});
  }
  const score = Math.round((supported/claims.length)*100);
  return { score, evidence };
} 