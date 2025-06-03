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

async function handleSingleSupplementSearch(supplement_name: string, supabase: any, corsHeaders: any) {
  // First try xAI API for intelligent search
  const xaiApiKey = Deno.env.get('XAI_API_KEY');
  
  if (xaiApiKey) {
    try {
      console.log(`Using xAI to search for: ${supplement_name}`);
      
      const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${xaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a supplement expert. Find the best trusted brand with 3rd party testing for the given supplement. Return ONLY a JSON object with: {"brand": "brand_name", "product_url": "direct_product_link", "price": "estimated_price"}. Use only these trusted brands: Thorne, Pure Encapsulations, Life Extension, NOW Foods, Jarrow Formulas, Doctor\'s Best, Nordic Naturals. Return actual product URLs, not search pages.'
            },
            {
              role: 'user',
              content: `Find the best ${supplement_name} supplement from a trusted brand with 3rd party testing.`
            }
          ],
          model: 'grok-beta',
          max_tokens: 200,
          temperature: 0.1
        })
      });

      if (xaiResponse.ok) {
        const xaiData = await xaiResponse.json();
        const content = xaiData.choices[0]?.message?.content;
        
        if (content) {
          try {
            const result = JSON.parse(content);
            if (result.product_url && result.product_url.startsWith('http')) {
              console.log(`xAI found: ${result.brand} - ${result.product_url}`);
              return new Response(JSON.stringify({
                success: true,
                product_url: result.product_url,
                brand: result.brand,
                price: result.price,
                source: 'xai'
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              });
            }
          } catch (parseError) {
            console.error('xAI response parsing error:', parseError);
          }
        }
      }
    } catch (xaiError) {
      console.error('xAI API error:', xaiError);
    }
  }

  // Fallback to scraped reference table
  console.log(`Falling back to scraped reference table for: ${supplement_name}`);
  
  const { data: products } = await supabase
    .from('product_links')
    .select('*')
    .ilike('supplement_name', `%${supplement_name}%`)
    .eq('verified', true)
    .order('price', { ascending: true })
    .limit(1);

  if (products && products.length > 0) {
    const product = products[0];
    console.log(`Reference table found: ${product.brand} - ${product.product_url}`);
    return new Response(JSON.stringify({
      success: true,
      product_url: product.product_url,
      brand: product.brand,
      price: product.price,
      source: 'reference_table'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  // Final fallback to trusted generic search
  const fallbackUrls = [
    `https://www.thorne.com/search?q=${encodeURIComponent(supplement_name)}`,
    `https://www.pureencapsulations.com/search?q=${encodeURIComponent(supplement_name)}`,
    `https://www.vitacost.com/search?t=${encodeURIComponent(supplement_name)}`
  ];
  
  const fallbackUrl = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
  
  return new Response(JSON.stringify({
    success: true,
    product_url: fallbackUrl,
    brand: 'Multiple Options',
    source: 'fallback_search'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const body = await req.json();
    const { supplements, supplement_name } = body;
    
    // Handle single supplement search (for Buy Now button)
    if (supplement_name) {
      return await handleSingleSupplementSearch(supplement_name, supabase, corsHeaders);
    }
    
    // Handle bulk supplement search (existing functionality)
    if (!supplements || !Array.isArray(supplements)) {
      throw new Error('supplements array or supplement_name is required');
    }

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