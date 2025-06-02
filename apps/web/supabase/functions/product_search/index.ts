// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Hardcoded fallback data for common supplements
const FALLBACK_PRODUCTS: Record<string, Array<{brand: string, title: string, url: string}>> = {
  "Vitamin D3": [
    {brand: "Thorne", title: "Vitamin D-5000", url: "https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule"},
    {brand: "Pure Encapsulations", title: "Vitamin D3 5000 IU", url: "https://www.pureencapsulations.com/vitamin-d3-5-000-iu.html"}
  ],
  "Magnesium": [
    {brand: "Thorne", title: "Magnesium Bisglycinate", url: "https://www.thorne.com/products/dp/magnesium-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Magnesium Glycinate", url: "https://www.pureencapsulations.com/magnesium-glycinate.html"}
  ],
  "Omega-3": [
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"},
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"}
  ]
};

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { supplements } = await req.json();
    
    if (!supplements || !Array.isArray(supplements)) {
      throw new Error('supplements array is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const results = [];

    for (const supplement of supplements) {
      try {
        // First check if we have it in the product_links table
        const { data: existingLinks, error } = await supabase
          .from('product_links')
          .select('*')
          .eq('supplement_name', supplement)
          .limit(3);

        if (!error && existingLinks && existingLinks.length > 0) {
          results.push({
            supplement_name: supplement,
            links: existingLinks.map(link => ({
              brand: link.brand,
              product_name: link.product_name,
              url: link.product_url,
              price: link.price,
              verified: link.verified
            })),
            source: 'database'
          });
          continue;
        }

        // Check fallback data
        const fallbackKey = Object.keys(FALLBACK_PRODUCTS).find(key => 
          supplement.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(supplement.toLowerCase())
        );

        if (fallbackKey) {
          const products = FALLBACK_PRODUCTS[fallbackKey];
          const links = products.map(p => ({
            brand: p.brand,
            product_name: p.title,
            url: p.url,
            price: null,
            verified: true
          }));

          // Store in database for future use
          for (const link of links) {
            await supabase.from('product_links').insert({
              supplement_name: supplement,
              brand: link.brand,
              product_name: link.product_name,
              product_url: link.url,
              verified: link.verified
            });
          }

          results.push({
            supplement_name: supplement,
            links,
            source: 'fallback'
          });
          continue;
        }

        // If no data found, return empty
        results.push({
          supplement_name: supplement,
          links: [],
          source: 'none'
        });
        
      } catch (error) {
        console.error(`Error finding products for ${supplement}:`, error);
        results.push({
          supplement_name: supplement,
          links: [],
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 