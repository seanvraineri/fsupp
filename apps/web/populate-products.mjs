#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing environment variables');
  console.error('SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_KEY:', !!SUPABASE_KEY);
  process.exit(1);
}

console.log('Using Supabase URL:', SUPABASE_URL);
console.log('Using API key:', SUPABASE_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Comprehensive supplement product database
const SUPPLEMENT_PRODUCTS = {
  "Vitamin D3": [
    {
      brand: "Thorne",
      product_name: "Vitamin D/K2 Liquid",
      product_url: "https://www.thorne.com/products/dp/vitamin-d-k2-liquid",
      price: 33.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Vitamin D3 5,000 IU",
      product_url: "https://www.pureencapsulations.com/vitamin-d3-5-000-iu.html",
      price: 24.60,
      verified: true
    },
    {
      brand: "Nordic Naturals",
      product_name: "Vitamin D3 Gummies",
      product_url: "https://www.nordicnaturals.com/products/vitamin-d3-gummies",
      price: 19.95,
      verified: true
    }
  ],
  "Magnesium Glycinate": [
    {
      brand: "Thorne",
      product_name: "Magnesium Bisglycinate",
      product_url: "https://www.thorne.com/products/dp/magnesium-bisglycinate",
      price: 18.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Magnesium Glycinate",
      product_url: "https://www.pureencapsulations.com/magnesium-glycinate.html",
      price: 20.90,
      verified: true
    },
    {
      brand: "NOW Foods",
      product_name: "Magnesium Glycinate 400mg",
      product_url: "https://www.nowfoods.com/products/supplements/magnesium-glycinate-400-mg-tablets",
      price: 15.99,
      verified: true
    }
  ],
  "Omega-3": [
    {
      brand: "Nordic Naturals",
      product_name: "Ultimate Omega",
      product_url: "https://www.nordicnaturals.com/products/ultimate-omega",
      price: 44.95,
      verified: true
    },
    {
      brand: "Thorne",
      product_name: "Super EPA",
      product_url: "https://www.thorne.com/products/dp/super-epa",
      price: 39.00,
      verified: true
    },
    {
      brand: "Life Extension",
      product_name: "Super Omega-3",
      product_url: "https://www.lifeextension.com/vitamins-supplements/item01937/super-omega-3-epa-dha-with-sesame-lignans-olive-extract",
      price: 32.00,
      verified: true
    }
  ],
  "Methylfolate": [
    {
      brand: "Thorne",
      product_name: "5-MTHF 1mg",
      product_url: "https://www.thorne.com/products/dp/5-mthf-1-mg",
      price: 22.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Folate 400",
      product_url: "https://www.pureencapsulations.com/folate-400.html",
      price: 17.60,
      verified: true
    },
    {
      brand: "Life Extension",
      product_name: "Optimized Folate",
      product_url: "https://www.lifeextension.com/vitamins-supplements/item01939/optimized-folate-l-methylfolate",
      price: 11.25,
      verified: true
    }
  ],
  "Methylcobalamin": [
    {
      brand: "Thorne",
      product_name: "Methylcobalamin",
      product_url: "https://www.thorne.com/products/dp/methylcobalamin",
      price: 14.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "B12 5,000",
      product_url: "https://www.pureencapsulations.com/b12-5-000.html",
      price: 18.40,
      verified: true
    }
  ],
  "Probiotics": [
    {
      brand: "Thorne",
      product_name: "FloraPro-LP",
      product_url: "https://www.thorne.com/products/dp/florapro-lp",
      price: 26.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Probiotic-5",
      product_url: "https://www.pureencapsulations.com/probiotic-5.html",
      price: 22.40,
      verified: true
    }
  ],
  "Zinc": [
    {
      brand: "Thorne",
      product_name: "Zinc Picolinate 15mg",
      product_url: "https://www.thorne.com/products/dp/zinc-picolinate-15-mg",
      price: 13.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Zinc 30",
      product_url: "https://www.pureencapsulations.com/zinc-30.html",
      price: 15.80,
      verified: true
    }
  ],
  "Iron": [
    {
      brand: "Thorne",
      product_name: "Iron Bisglycinate",
      product_url: "https://www.thorne.com/products/dp/iron-bisglycinate",
      price: 13.00,
      verified: true
    },
    {
      brand: "Pure Encapsulations",
      product_name: "Iron-C",
      product_url: "https://www.pureencapsulations.com/iron-c.html",
      price: 17.80,
      verified: true
    }
  ]
};

function normalizeSupplementName(name) {
  const normalized = name.toLowerCase().trim();
  
  const mappings = {
    "vitamin d": "vitamin d3",
    "magnesium": "magnesium glycinate",
    "folate": "methylfolate",
    "5-mthf": "methylfolate",
    "b12": "methylcobalamin",
    "vitamin b12": "methylcobalamin",
    "fish oil": "omega-3",
    "omega 3": "omega-3",
    "probiotic": "probiotics",
  };
  
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return normalized;
}

async function main() {
  try {
    console.log('🔍 Fetching existing recommendations...');
    
    // Get all active recommendations
    const { data: recommendations, error: recError } = await supabase
      .from('supplement_recommendations')
      .select('id, supplement_name, user_id')
      .eq('is_active', true);
    
    if (recError) {
      throw recError;
    }
    
    console.log(`📦 Found ${recommendations.length} active recommendations`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const rec of recommendations) {
      const { id: recId, supplement_name } = rec;
      
      // Check if this recommendation already has product links
      const { data: existingLinks } = await supabase
        .from('product_links')
        .select('id')
        .eq('recommendation_id', recId);
      
      if (existingLinks && existingLinks.length > 0) {
        console.log(`⏭️  Skipping ${supplement_name} - already has product links`);
        continue;
      }
      
      // Normalize supplement name for matching
      const normalizedName = normalizeSupplementName(supplement_name);
      
      // Find matching products
      let products = null;
      for (const [key, productList] of Object.entries(SUPPLEMENT_PRODUCTS)) {
        if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
          products = productList;
          break;
        }
      }
      
      if (!products) {
        console.log(`❌ No products found for: ${supplement_name}`);
        errorCount++;
        continue;
      }
      
      // Insert product links for this recommendation
      console.log(`📦 Adding ${products.length} product links for: ${supplement_name}`);
      
      for (const product of products) {
        try {
          const linkData = {
            recommendation_id: recId,
            product_name: product.product_name,
            brand: product.brand,
            product_url: product.product_url,
            price: product.price,
            verified: product.verified
          };
          
          const { error: insertError } = await supabase
            .from('product_links')
            .insert(linkData);
          
          if (insertError) {
            throw insertError;
          }
          
          successCount++;
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Error inserting ${product.brand} for ${supplement_name}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Completed!`);
    console.log(`Successfully created: ${successCount} product links`);
    console.log(`Errors: ${errorCount}`);
    
    // Show summary stats
    const { count } = await supabase
      .from('product_links')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total product links in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main(); 