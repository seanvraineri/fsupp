import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface ResolverPayload {
  text?: string;
  url?: string;
  image_base64?: string;
}
interface ResolvedProduct {
  id: string;
  name: string;
  brand?: string;
  html?: string;
  labelText?: string;
}
interface Ingredient { name:string; amount?:string; quality:"good"|"questionable" }
interface Claim { text:string; }
interface Verdict { claim:string; verdict:"supported"|"weak"|"contradicted"; pmid?:string; title?:string; abstract?:string }
interface ScienceScore { score:number; evidence: Verdict[] }
interface PersonalScore { score:number; bullets:string[] }
interface Payload {
  user_id: string;
  text?: string;
  url?: string;
  image_base64?: string;
  stream?: boolean;
}

// Constants and helpers
const DSLD_ENDPOINT = Deno.env.get("DSLD_ENDPOINT") ?? "https://dsld.od.nih.gov/dsld";
const PROXY_URL = Deno.env.get("SCRAPER_PROXY_URL");
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const badFillers = ["titanium dioxide","red 40","blue 1","yellow 6","magnesium stearate","propylene glycol","talc","bht"];

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Resolver functions
async function fetchWithProxy(url: string) {
  const proxied = PROXY_URL ? `${PROXY_URL}?url=${encodeURIComponent(url)}` : url;
  return fetch(proxied);
}

async function searchDSLD(query: string): Promise<ResolvedProduct | null> {
  const url = `${DSLD_ENDPOINT}/json.jsp?search=${encodeURIComponent(query)}&max=1`;
  const r = await fetchWithProxy(url);
  if (!r.ok) return null;
  let j: any;
  try { j = await r.json(); } catch (_) { return null; }
  if (!j?.products?.length) return null;
  const p = j.products[0];
  return { id: p.ndbno, name: p.prodname, brand: p.company };
}

async function searchSerpApi(query: string): Promise<ResolvedProduct | null> {
  const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
  if (!SERP_API_KEY) return null;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query + " site:dsld.od.nih.gov")}&num=1&api_key=${SERP_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j: any = await r.json();
  const res = j.organic_results?.[0];
  if (!res) return null;
  const idMatch = (res.link || "").match(/(\d{4,})/);
  if (!idMatch) return null;
  return { id: idMatch[1], name: res.title || query, brand: undefined };
}

async function resolveProduct(p: ResolverPayload): Promise<ResolvedProduct> {
  if (p.text) {
    let resolved = await searchDSLD(p.text);
    if (!resolved) resolved = await searchSerpApi(p.text);
    if (resolved) return resolved;
    return { id: crypto.randomUUID(), name: p.text, brand: "" };
  }
  throw new Error("URL and image resolution not implemented in bundled version");
}

// Ingredients
async function getIngredients(prod:ResolvedProduct):Promise<Ingredient[]>{
  if(/^[0-9]+$/.test(prod.id)){
    const url = `https://dsld.od.nih.gov/dsld/json_ingred.jsp?prodno=${prod.id}`;
    const r = await fetch(url);
    if(r.ok){
      const j:any = await r.json();
      if(j?.ingredients?.length){
        return j.ingredients.map((i:any)=>{
          const name:string = i.ingrednm;
          const amt:string|undefined = i.strngth ? `${i.strngth}`:undefined;
          return { name, amount:amt, quality: badFillers.some(b=>name.toLowerCase().includes(b))?"questionable":"good" };
        });
      }
    }
  }
  return [ { name:"Ingredient data unavailable", quality:"questionable" } ];
}

// Claims
function fromHtml(html:string):Claim[]{
  const claims:Claim[]=[];
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
  let m;
  while((m=liRegex.exec(html))!==null){
    const text = m[1].replace(/<[^>]+>/g,"").trim();
    if(text.length>5 && text.length<160) claims.push({text});
    if(claims.length>=5) break;
  }
  return claims;
}

async function getClaims(prod:ResolvedProduct):Promise<Claim[]>{
  if(prod.html){
    const claims = fromHtml(prod.html);
    if(claims.length) return claims.slice(0,5);
  }
  const generic = [`Helps support overall wellness of ${prod.name.split(" ")[0]}`];
  return generic.map(t=>({text:t}));
}

// Science scoring
async function pubmedSearch(term:string):Promise<string[]>{
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=3&term=${encodeURIComponent(term)}`;
  const r = await fetch(url);
  if(!r.ok) return [];
  const j:any = await r.json();
  return j.esearchresult?.idlist ?? [];
}

function judge(abstracts:string[]):"supported"|"weak"|"contradicted"{
  const joined = abstracts.join(" ").toLowerCase();
  if(/no (statistically )?significant effect|not effective/.test(joined)) return "contradicted";
  if(/significant (increase|improvement|reduction)/.test(joined) && /randomized|double[- ]blind/.test(joined)) return "supported";
  return "weak";
}

async function scoreScience(claims:Claim[]):Promise<ScienceScore>{
  const evidence:Verdict[]=[];
  let supported=0;
  for(const c of claims){
    const keyword = c.text.split(" ").slice(0,3).join(" ");
    const ids = await pubmedSearch(keyword);
    const verdictCalc = judge([]);
    const row = { claim:c.text, verdict:verdictCalc, pmid:"", title:"", abstract:"" };
    if(row.verdict==="supported") supported++;
    evidence.push(row);
  }
  return { score: Math.round((supported/claims.length)*100), evidence };
}

// Personal scoring
async function scorePersonal(user_id:string, ingredients:Ingredient[]):Promise<PersonalScore>{
  let score = 80;
  const bullets:string[]=[];
  const goodPct = ingredients.filter(i=>i.quality==="good").length / ingredients.length;
  score += Math.round(goodPct*10);
  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No direct conflicts detected.");
  return { score, bullets };
}

// Scoring helpers
function combineScore(science:number, personal:number):number{
  return Math.round(0.7*science + 0.3*personal);
}
function emojiFor(s:number){
  if(s>=80) return "😊";
  if(s>=60) return "🙂";
  return "😟";
}

// Cache functions (simplified)
async function getCache(uid:string, pid:string){ return null; }
async function setCache(uid:string,pid:string,verdict:any){ return; }
async function logRun(fields:any){ console.log('Product checker run:', fields); }

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
  let productId = "unknown";
  let userId = "unknown";

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const payload: Payload = await req.json();
    userId = payload.user_id || "anonymous";

    const provided = [payload.text, payload.url, payload.image_base64].filter(Boolean).length;
    if (provided !== 1) {
      return new Response("Provide exactly one of text, url, image_base64", { status: 400, headers: corsHeaders });
    }

    const product = await resolveProduct(payload);
    productId = product.id;

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
      message: "Full product checker deployed via CLI single file!"
    };

    // Generate summary
    if (OPENAI_KEY) {
      try {
        const prompt = `Write a concise explanation for this supplement verdict: ${JSON.stringify(verdict)}`;
        const body = {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 240,
          temperature: 0.7,
        };
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
          body: JSON.stringify(body),
        });
        const j: any = await r.json();
        verdict.summary = j.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        console.error("summary generation failed", err);
      }
    }

    await logRun({ user_id: userId, product_id: productId, ms: Math.round(performance.now() - started), tokens_used: 0, cache_hit: false });

    return new Response(JSON.stringify(verdict), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[product_checker] error", err);
    return new Response(err.message || "Internal Server Error", { status: 500, headers: corsHeaders });
  }
}); 