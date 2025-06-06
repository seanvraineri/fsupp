export interface ResolverPayload {
  text?: string;
  url?: string;
  image_base64?: string;
}
export interface ResolvedProduct {
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

export async function resolveProduct(p: ResolverPayload): Promise<ResolvedProduct> {
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