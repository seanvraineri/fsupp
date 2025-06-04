// resolver.ts – resolves text/url/image to minimal product object (DSLD backed)

import "https://deno.land/std@0.224.0/dotenv/load.ts";

export interface ResolverPayload {
  text?: string;
  url?: string;
  image_base64?: string;
}
export interface ResolvedProduct {
  id: string; // DSLD ndbno
  name: string;
  brand?: string;
  html?: string; // raw html when scraped
  labelText?: string; // OCR when provided
}

const DSLD_ENDPOINT = Deno.env.get("DSLD_ENDPOINT") ?? "https://dsld.od.nih.gov/dsld";
const PROXY_URL = Deno.env.get("SCRAPER_PROXY_URL")!;
const OPENAI_KEY = Deno.env.get("OPENAI_KEY");

async function searchDSLD(query: string): Promise<ResolvedProduct | null> {
  const url = `${DSLD_ENDPOINT}/json.jsp?search=${encodeURIComponent(query)}&max=1`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j: any = await r.json();
  if (!j?.products?.length) return null;
  const p = j.products[0];
  return { id: p.ndbno, name: p.prodname, brand: p.company };
}

async function searchByUPC(upc: string) {
  // DSLD UPC search
  return searchDSLD(upc);
}

async function scrapeHtml(rawUrl: string) {
  const proxied = PROXY_URL ? `${PROXY_URL}?url=${encodeURIComponent(rawUrl)}` : rawUrl;
  const r = await fetch(proxied);
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
    {
      role: "system",
      content:
        'You are given a supplement label photo. Extract either the UPC (12+ digits) or the product title. Respond ONLY as JSON: {"upc":string|null,"title":string|null}. If unsure return nulls.'
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${img64}` }
        }
      ]
    }
  ];

  const body = {
    model: "gpt-4o-mini",
    messages,
    max_tokens: 50,
    temperature: 0
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify(body)
  });

  const j: any = await r.json();
  const txt = j.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(txt);
  } catch {
    return { upc: null, title: null };
  }
}

export async function resolveProduct(p: ResolverPayload): Promise<ResolvedProduct> {
  if (p.text) {
    const dsld = await searchDSLD(p.text);
    if (dsld) return dsld;
    throw new Error("Product not found");
  }
  if (p.url) {
    const html = await scrapeHtml(p.url);
    const upc = extractUPC(html);
    if (upc) {
      const dsld = await searchByUPC(upc);
      if (dsld) return { ...dsld, html };
    }
    // fallback title tag
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
      const dsld = await searchByUPC(upc);
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