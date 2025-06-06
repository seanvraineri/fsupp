import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- lib/ingredients.ts ---
interface Ingredient { name:string; amount?:string; quality:"good"|"questionable" }
const badFillers = [
  "titanium dioxide","red 40","blue 1","yellow 6","magnesium stearate","propylene glycol","talc","bht"
];
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

// --- lib/claims.ts ---
interface Claim { text:string; }
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

// --- lib/science.ts ---
interface Verdict { claim:string; verdict:"supported"|"weak"|"contradicted"; pmid?:string; title?:string; abstract?:string }
interface ScienceScore { score:number; evidence: Verdict[] }
const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const sb_science = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
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
function daysAgo(dateStr:string){
  return (Date.now() - new Date(dateStr).getTime())/ (1000*60*60*24);
}
async function scoreScience(claims:Claim[]):Promise<ScienceScore>{
  const evidence:Verdict[]=[];
  let supported=0;

  for(const c of claims){
    const key = c.text.toLowerCase();
    const { data:cache } = await sb_science.from("claim_cache").select("verdict,pmid,title,abstract,updated_at").eq("claim_key",key).maybeSingle();
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
      await sb_science.from("claim_cache").upsert({claim_key:key, verdict:verdictCalc, pmid:first.pmid, title:first.title, abstract:first.abstract});
    }

    if(row.verdict==="supported") supported++;
    evidence.push(row);
  }
  const score = Math.round((supported/claims.length)*100);
  return { score, evidence };
} 

// --- lib/personal.ts ---
interface PersonalScore { score:number; bullets:string[] }
interface UserCtx {
  assessment?:{ allergies?:string[]; goals?:string[] };
  labs?: any[];
  genetics?: any;
  supplements?: any[];
}
const sb_personal = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function fetchContext(uid:string):Promise<UserCtx>{
  const { data } = await sb_personal.rpc("get_full_user_context", { _uid: uid });
  return (data as any)?.ctx ?? {};
}
async function scorePersonal(user_id:string, ingredients:Ingredient[]):Promise<PersonalScore>{
  const ctx = await fetchContext(user_id);
  let score = 80;
  const bullets:string[]=[];

  const allergies:string[] = ctx.assessment?.allergies ?? [];
  const conflicts = ingredients.filter(ing=> allergies.some(a=> ing.name.toLowerCase().includes(a.toLowerCase())));
  if(conflicts.length){
    score -= 30;
    bullets.push(`Possible allergy conflict: ${conflicts.map(c=>c.name).join(', ')}`);
  }

  const goodPct = ingredients.filter(i=>i.quality==="good").length / ingredients.length;
  score += Math.round(goodPct*10);

  const labs = ctx.labs?.[0] ?? {} as Record<string,number>;
  const low = (name:string, t:number)=> typeof labs[name]==="number" && labs[name] < t;
  const high = (name:string, t:number)=> typeof labs[name]==="number" && labs[name] > t;

  if(low("vitamin_d",30)){
    score -= 10;
    bullets.push("Low vitamin D level detected (lab) – product containing D3 may help.");
  }
  if(low("magnesium",1.8)){
    score += 5;
    bullets.push("Magnesium appears low; magnesium-containing product is a plus.");
  }
  if(high("cholesterol_total",200)){
    score -= 5;
    bullets.push("Elevated cholesterol – consult healthcare provider about supplement choice.");
  }

  const genes = ctx.genetics ?? {};
  if(genes.mthfr_c677t?.toUpperCase?.() === "TT"){
    score += 5;
    bullets.push("MTHFR TT variant – methylated forms in product beneficial.");
  }
  if(Array.isArray(genes.vdr_variants) && genes.vdr_variants.includes("FokI")){
    bullets.push("VDR variant detected – adequate vitamin D in product is important.");
  }

  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No direct conflicts detected.");
  return { score, bullets };
}

// --- lib/score.ts ---
function combineScore(science:number, personal:number):number{
  return Math.round(0.7*science + 0.3*personal);
}
function emojiFor(s:number){
  if(s>=80) return "😊";
  if(s>=60) return "🙂";
  return "😟";
} 

// --- lib/cache.ts ---
const sb_cache = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function getCache(uid:string, pid:string){
  const { data } = await sb_cache.from("product_verdict_cache").select("verdict,updated_at").eq("user_id",uid).eq("product_id",pid).maybeSingle();
  if(!data) return null;
  const ageMs = Date.now() - new Date(data.updated_at).getTime();
  if(ageMs > 7*24*60*60*1000) return null;
  return data.verdict;
}
async function setCache(uid:string,pid:string,verdict:any){
  await sb_cache.from("product_verdict_cache").upsert({user_id:uid,product_id:pid,verdict});
  await sb_cache.from("product_scans").insert({user_id:uid,product_id:pid,verdict}).select();
}
async function logRun(fields:{user_id:string;product_id:string;ms:number;tokens_used:number;cache_hit:boolean;err?:string}){
  await sb_cache.from("product_checker_logs").insert(fields);
} 

// --- lib/resolver.ts ---
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
const DSLD_ENDPOINT = Deno.env.get("DSLD_ENDPOINT") ?? "https://dsld.od.nih.gov/dsld";
const PROXY_URL = Deno.env.get("SCRAPER_PROXY_URL");
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
async function fetchWithProxy(url: string) {
  const proxied = PROXY_URL ? `${PROXY_URL}?url=${encodeURIComponent(url)}` : url;
  return fetch(proxied);
}
async function searchDSLD(query: string): Promise<ResolvedProduct | null> {
  const url = `${DSLD_ENDPOINT}/json.jsp?search=${encodeURIComponent(query)}&max=1`;
  const r = await fetchWithProxy(url);
  if (!r.ok) return null;
  let j: any;
  try {
    j = await r.json();
  } catch (_) {
    return null;
  }
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
  const link: string = res.link || "";
  const name: string = res.title || query;
  const idMatch = link.match(/(\d{4,})/);
  if (!idMatch) return null;
  return { id: idMatch[1], name, brand: undefined };
}
async function scrapeHtml(rawUrl: string) {
  const r = await fetchWithProxy(rawUrl);
  if (!r.ok) throw new Error("scrape failed");
  return await r.text();
}
function extractUPC(html: string): string | null {
  const m = html.match(/UPC(?:-|\s)?(?:Code)?:?\s*(\d{12,14})/i);
  return m ? m[1] : null;
}
async function resolveImage(img64: string) {
  if (!OPENAI_KEY) throw new Error("OPENAI_KEY missing");

  const messages = [
    { role: "system", content: 'You are given a supplement label photo. Extract either the UPC (12+ digits) or the product title. Respond ONLY as JSON: {"upc":string|null,"title":string|null}. If unsure return nulls.' },
    { role: "user", content: [{ type: "image_url", image_url: { url: `data:image/jpeg;base64,${img64}` } }] }
  ];

  const body = { model: "gpt-4o-mini", messages, max_tokens: 50, temperature: 0 };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify(body)
  });

  const j: any = await r.json();
  const txt = j.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(txt); } catch { return { upc: null, title: null }; }
}
async function resolveProduct(p: ResolverPayload): Promise<ResolvedProduct> {
  if (p.text) {
    let resolved = await searchDSLD(p.text);
    if (!resolved) resolved = await searchSerpApi(p.text);
    if (resolved) return resolved;
    return { id: crypto.randomUUID(), name: p.text, brand: "" };
  }
  if (p.url) {
    const html = await scrapeHtml(p.url);
    const upc = extractUPC(html);
    if (upc) {
      const dsld = await searchDSLD(upc);
      if (dsld) return { ...dsld, html };
    }
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      const dsld = await searchDSLD(titleMatch[1]);
      if (dsld) return { ...dsld, html };
    }
    throw new Error("Unable to resolve URL to product");
  }
  if (p.image_base64) {
    const { upc, title } = await resolveImage(p.image_base64);
    if (upc) {
      const dsld = await searchDSLD(upc);
      if (dsld) return dsld;
    }
    if (title) {
      const dsld = await searchDSLD(title);
      if (dsld) return dsld;
    }
    throw new Error("Unable to resolve image");
  }
  throw new Error("No input provided");
} 

// --- index.ts ---
interface Payload {
  user_id: string;
  text?: string;
  url?: string;
  image_base64?: string;
  stream?: boolean;
}

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
  let cacheHit = false;
  let productId = "unknown";
  let userId = "unknown";

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const payload: Payload = await req.json();
    userId = payload.user_id || "anonymous";

    // Validate input
    const provided = [payload.text, payload.url, payload.image_base64].filter(Boolean).length;
    if (provided !== 1) {
      return new Response("Provide exactly one of text, url, image_base64", { status: 400, headers: corsHeaders });
    }

    // Resolve product
    const product = await resolveProduct(payload);
    productId = product.id;

    // Cache check
    const cached = await getCache(userId, productId);
    if (cached) {
      cacheHit = true;
      await logRun({
        user_id: userId,
        product_id: productId,
        ms: Math.round(performance.now() - started),
        tokens_used: 0,
        cache_hit: true,
      });
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run pipeline
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
    };

    // Generate summary
    if (OPENAI_KEY) {
      try {
        const prompt = `Write a concise, plain-language explanation (≤3 short paragraphs) for the following product-checker verdict JSON. Highlight why the score was given, key evidence, and any personal fit issues.\n\nJSON:\n\n${JSON.stringify(verdict)}`;
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify(body),
        });
        const j: any = await r.json();
        verdict.summary = j.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        console.error("summary generation failed", err);
      }
    }

    // Cache and log
    await setCache(userId, productId, verdict);
    await logRun({
      user_id: userId,
      product_id: productId,
      ms: Math.round(performance.now() - started),
      tokens_used: 0,
      cache_hit: false,
    });

    return new Response(JSON.stringify(verdict), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[product_checker] error", err);
    await logRun({
      user_id: userId,
      product_id: productId,
      ms: Math.round(performance.now() - started),
      tokens_used: 0,
      cache_hit: cacheHit,
      err: err?.message?.slice(0, 200),
    });
    return new Response(err.message || "Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
