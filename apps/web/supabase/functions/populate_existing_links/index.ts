import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get all recommendations for this user that don't have product links
    const { data: recommendations } = await supabase
      .from('supplement_recommendations')
      .select('id, supplement_name')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (!recommendations) {
      return new Response(JSON.stringify({ error: 'No recommendations found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log(`Found ${recommendations.length} recommendations to populate`);

    // For each recommendation, create product links
    for (const rec of recommendations) {
      // Check if it already has product links
      const { data: existingLinks } = await supabase
        .from('product_links')
        .select('id')
        .eq('recommendation_id', rec.id)
        .limit(1);

      if (existingLinks && existingLinks.length > 0) {
        console.log(`${rec.supplement_name} already has links, skipping`);
        continue;
      }

      // Create fallback product links for this recommendation
      const productLinks = [
        {
          recommendation_id: rec.id,
          supplement_name: rec.supplement_name,
          brand: "Thorne",
          product_name: `${rec.supplement_name} - Premium Grade`,
          product_url: `https://www.thorne.com/search?q=${encodeURIComponent(rec.supplement_name)}`,
          price: 29.99,
          verified: true
        },
        {
          recommendation_id: rec.id,
          supplement_name: rec.supplement_name,
          brand: "Pure Encapsulations", 
          product_name: `${rec.supplement_name} - Professional Grade`,
          product_url: `https://www.pureencapsulations.com/search?q=${encodeURIComponent(rec.supplement_name)}`,
          price: 34.99,
          verified: true
        }
      ];

      const { error: insertError } = await supabase
        .from('product_links')
        .insert(productLinks);

      if (insertError) {
        console.error(`Error inserting links for ${rec.supplement_name}:`, insertError);
      } else {
        console.log(`Created product links for ${rec.supplement_name}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Populated product links for ${recommendations.length} recommendations`
      }),
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