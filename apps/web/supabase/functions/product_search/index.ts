// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

interface ProductSearchRequest {
  supplement_name: string;
  dosage_amount?: number;
  dosage_unit?: string;
  budget_preference?: string; // 'budget', 'premium', 'any'
}

interface ProductResult {
  success: boolean;
  product_name: string;
  brand: string;
  product_url: string;
  price: number | null;
  image_url?: string;
  verified: boolean;
  rating?: number;
  description?: string;
}

// Enhanced product database with high-quality supplement brands
const productDatabase = {
  "vitamin d3": [
    {
      brand: "Thorne",
      product_name: "Vitamin D3 1000 IU",
      product_url: "https://www.vitacost.com/thorne-vitamin-d3-1000-iu-90-capsules",
      price: 18.00,
      verified: true,
      rating: 4.8,
      description: "High-quality vitamin D3 from trusted brand"
    },
    {
      brand: "Nordic Naturals", 
      product_name: "Vitamin D3 Gummies",
      product_url: "https://www.vitacost.com/nordic-naturals-vitamin-d3-gummies-1000-iu",
      price: 15.99,
      verified: true,
      rating: 4.7
    },
    {
      brand: "NOW Foods",
      product_name: "Vitamin D3 2000 IU",
      product_url: "https://www.vitacost.com/now-foods-vitamin-d3-2000-iu-240-softgels",
      price: 9.99,
      verified: true,
      rating: 4.5
    }
  ],
  "magnesium": [
    {
      brand: "Thorne",
      product_name: "Magnesium Bisglycinate",
      product_url: "https://www.vitacost.com/thorne-magnesium-bisglycinate-90-capsules",
      price: 25.00,
      verified: true,
      rating: 4.9,
      description: "Highly bioavailable chelated magnesium"
    },
    {
      brand: "Life Extension",
      product_name: "Magnesium Glycinate",
      product_url: "https://www.vitacost.com/life-extension-magnesium-glycinate-120-capsules",
      price: 18.00,
      verified: true,
      rating: 4.6
    },
    {
      brand: "Doctor's Best",
      product_name: "High Absorption Magnesium",
      product_url: "https://www.vitacost.com/doctors-best-high-absorption-magnesium-100-tablets",
      price: 12.99,
      verified: true,
      rating: 4.4
    }
  ],
  "omega-3": [
    {
      brand: "Nordic Naturals",
      product_name: "Ultimate Omega",
      product_url: "https://www.vitacost.com/nordic-naturals-ultimate-omega-180-soft-gels",
      price: 45.95,
      verified: true,
      rating: 4.8,
      description: "High-potency omega-3 with optimal EPA/DHA ratio"
    },
    {
      brand: "Life Extension",
      product_name: "Super Omega-3",
      product_url: "https://www.vitacost.com/life-extension-super-omega-3-epa-dha-120-softgels",
      price: 35.00,
      verified: true,
      rating: 4.7
    },
    {
      brand: "NOW Foods",
      product_name: "Ultra Omega-3",
      product_url: "https://www.vitacost.com/now-foods-ultra-omega-3-180-softgels",
      price: 24.99,
      verified: true,
      rating: 4.5
    }
  ],
  "methylfolate": [
    {
      brand: "Thorne",
      product_name: "5-MTHF 1mg",
      product_url: "https://www.vitacost.com/thorne-5-mthf-1-mg-60-capsules",
      price: 28.00,
      verified: true,
      rating: 4.9,
      description: "Active form of folate for MTHFR variants"
    },
    {
      brand: "Life Extension",
      product_name: "Optimized Folate",
      product_url: "https://www.vitacost.com/life-extension-optimized-folate-l-methylfolate-100-tablets",
      price: 18.00,
      verified: true,
      rating: 4.6
    },
    {
      brand: "Seeking Health",
      product_name: "L-MTHF",
      product_url: "https://www.vitacost.com/seeking-health-l-mthf-90-capsules",
      price: 32.95,
      verified: true,
      rating: 4.8
    }
  ],
  "methyl-b12": [
    {
      brand: "Thorne",
      product_name: "Methylcobalamin",
      product_url: "https://www.vitacost.com/thorne-methylcobalamin-60-capsules",
      price: 24.00,
      verified: true,
      rating: 4.8,
      description: "Active form of B12 for optimal absorption"
    },
    {
      brand: "Life Extension",
      product_name: "Methylcobalamin Lozenges",
      product_url: "https://www.vitacost.com/life-extension-methylcobalamin-1-mg-60-lozenges",
      price: 16.50,
      verified: true,
      rating: 4.7
    },
    {
      brand: "Jarrow Formulas",
      product_name: "Methyl B-12",
      product_url: "https://www.vitacost.com/jarrow-formulas-methyl-b-12-100-lozenges",
      price: 14.95,
      verified: true,
      rating: 4.6
    }
  ],
  "curcumin": [
    {
      brand: "Thorne",
      product_name: "Meriva 500-SF",
      product_url: "https://www.vitacost.com/thorne-meriva-500-sf-120-capsules",
      price: 58.00,
      verified: true,
      rating: 4.8,
      description: "Highly bioavailable curcumin phytosome"
    },
    {
      brand: "Life Extension",
      product_name: "Super Bio-Curcumin",
      product_url: "https://www.vitacost.com/life-extension-super-bio-curcumin-60-capsules",
      price: 32.00,
      verified: true,
      rating: 4.7
    },
    {
      brand: "NOW Foods",
      product_name: "CurcuBrain",
      product_url: "https://www.vitacost.com/now-foods-curcubrain-50-veg-capsules",
      price: 29.99,
      verified: true,
      rating: 4.5
    }
  ],
  "berberine": [
    {
      brand: "Thorne",
      product_name: "Berberine-500",
      product_url: "https://www.vitacost.com/thorne-berberine-500-60-capsules",
      price: 38.00,
      verified: true,
      rating: 4.8,
      description: "High-quality berberine for metabolic support"
    },
    {
      brand: "Life Extension",
      product_name: "Berberine",
      product_url: "https://www.vitacost.com/life-extension-berberine-90-capsules",
      price: 28.00,
      verified: true,
      rating: 4.6
    },
    {
      brand: "NOW Foods",
      product_name: "Berberine Glucose Support",
      product_url: "https://www.vitacost.com/now-foods-berberine-glucose-support-90-softgels",
      price: 22.99,
      verified: true,
      rating: 4.4
    }
  ],
  "coq10": [
    {
      brand: "Thorne",
      product_name: "Q-Best 100",
      product_url: "https://www.vitacost.com/thorne-q-best-100-60-gelcaps",
      price: 52.00,
      verified: true,
      rating: 4.9,
      description: "Highly absorbable CoQ10 in crystal-free form"
    },
    {
      brand: "Life Extension",
      product_name: "Super Ubiquinol CoQ10",
      product_url: "https://www.vitacost.com/life-extension-super-ubiquinol-coq10-100-mg-60-softgels",
      price: 44.00,
      verified: true,
      rating: 4.7
    },
    {
      brand: "Jarrow Formulas",
      product_name: "QH-Absorb",
      product_url: "https://www.vitacost.com/jarrow-formulas-qh-absorb-100-mg-120-softgels",
      price: 58.95,
      verified: true,
      rating: 4.8
    }
  ],
  "nac": [
    {
      brand: "Thorne",
      product_name: "NAC",
      product_url: "https://www.vitacost.com/thorne-nac-90-capsules",
      price: 24.00,
      verified: true,
      rating: 4.8,
      description: "N-Acetylcysteine for glutathione support"
    },
    {
      brand: "Life Extension",
      product_name: "N-Acetyl-L-Cysteine",
      product_url: "https://www.vitacost.com/life-extension-n-acetyl-l-cysteine-600-mg-60-capsules",
      price: 16.50,
      verified: true,
      rating: 4.6
    },
    {
      brand: "NOW Foods",
      product_name: "NAC",
      product_url: "https://www.vitacost.com/now-foods-nac-600-mg-250-veg-capsules",
      price: 24.99,
      verified: true,
      rating: 4.5
    }
  ]
};

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: ProductSearchRequest = await req.json();
    console.log('Product search request:', body);

    const { supplement_name, dosage_amount, dosage_unit, budget_preference = 'any' } = body;

    if (!supplement_name) {
      return new Response(JSON.stringify({ 
        error: 'supplement_name is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normalize supplement name for lookup
    const normalizedName = supplement_name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Searching for:', normalizedName);

    // Find matching products in our database
    let matchedProducts = [];
    
    for (const [key, products] of Object.entries(productDatabase)) {
      if (normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])) {
        matchedProducts = products;
        break;
      }
    }

    // If no exact match, try fuzzy matching
    if (matchedProducts.length === 0) {
      for (const [key, products] of Object.entries(productDatabase)) {
        const keyWords = key.split(' ');
        const nameWords = normalizedName.split(' ');
        
        const hasMatch = keyWords.some(keyWord => 
          nameWords.some(nameWord => 
            nameWord.includes(keyWord) || keyWord.includes(nameWord)
          )
        );
        
        if (hasMatch) {
          matchedProducts = products;
          break;
        }
      }
    }

    if (matchedProducts.length === 0) {
      console.log('No products found in database, using fallback');
      
      // Fallback to generic search URLs
      const fallbackResult: ProductResult = {
        success: true,
        product_name: `${supplement_name} - Find Best Price`,
        brand: "Multiple Options",
        product_url: `https://www.vitacost.com/search?t=${encodeURIComponent(supplement_name)}`,
        price: null,
        verified: true,
        description: `Compare prices and brands for ${supplement_name}`
      };

      return new Response(JSON.stringify(fallbackResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter products based on budget preference
    let filteredProducts = [...matchedProducts];
    
    if (budget_preference === 'budget') {
      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (budget_preference === 'premium') {
      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // For 'any', prefer high-rated products
      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Return the best match
    const selectedProduct = filteredProducts[0];

    const result: ProductResult = {
      success: true,
      product_name: selectedProduct.product_name,
      brand: selectedProduct.brand,
      product_url: selectedProduct.product_url,
      price: selectedProduct.price,
      image_url: selectedProduct.image_url,
      verified: selectedProduct.verified,
      rating: selectedProduct.rating,
      description: selectedProduct.description
    };

    console.log('Product search result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 
