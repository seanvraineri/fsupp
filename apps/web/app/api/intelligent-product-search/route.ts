import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { supplement_name } = await request.json();
    
    if (!supplement_name) {
      return NextResponse.json({ success: false, error: 'Supplement name required' }, { status: 400 });
    }

    const supabase = createServerComponentClient({ cookies });

    // First try xAI API for intelligent search
    const xaiApiKey = process.env.XAI_API_KEY;
    
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
                return NextResponse.json({
                  success: true,
                  product_url: result.product_url,
                  brand: result.brand,
                  price: result.price,
                  source: 'xai'
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
      return NextResponse.json({
        success: true,
        product_url: product.product_url,
        brand: product.brand,
        price: product.price,
        source: 'reference_table'
      });
    }

    // Final fallback to trusted generic search
    const fallbackUrls = [
      `https://www.thorne.com/search?q=${encodeURIComponent(supplement_name)}`,
      `https://www.pureencapsulations.com/search?q=${encodeURIComponent(supplement_name)}`,
      `https://www.vitacost.com/search?t=${encodeURIComponent(supplement_name)}`
    ];
    
    const fallbackUrl = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
    
    return NextResponse.json({
      success: true,
      product_url: fallbackUrl,
      brand: 'Multiple Options',
      source: 'fallback_search'
    });

  } catch (error) {
    console.error('Intelligent product search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
} 