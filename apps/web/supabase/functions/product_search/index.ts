// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Helper function to normalize supplement names for better matching
function normalizeSupplementName(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Enhanced helper function to find the best matching supplement in database
function findBestMatch(searchName: string, availableNames: string[]): string | null {
  const normalizedSearch = normalizeSupplementName(searchName);
  
  // Exact match first
  const exactMatch = availableNames.find(name => 
    normalizeSupplementName(name) === normalizedSearch
  );
  if (exactMatch) return exactMatch;
  
  // Create very specific variations for the search term
  const searchVariations = [
    searchName.toLowerCase(),
    // Handle specific supplement name variations with exact patterns
    searchName.toLowerCase().replace(/^dha.*fish.*oil$|^fish.*oil.*dha$|^dha.*oil$/, 'omega-3'),
    searchName.toLowerCase().replace(/^l[-\s]*methylfolate$|^methylfolate$/, '5-mthf'),
    searchName.toLowerCase().replace(/^methyl[-\s]*b12$|^methylcobalamin$/, 'methylcobalamin'),
    searchName.toLowerCase().replace(/^betaine.*tmg$|^tmg$/, 'betaine'),
    searchName.toLowerCase().replace(/^vitamin\s*d3\s*\+?\s*k2$|^d3\s*\+?\s*k2$/, 'vitamin d k2'),
    searchName.toLowerCase().replace(/^vitamin\s*d3?$/, 'vitamin d'),
    searchName.toLowerCase().replace(/^vitamin\s*b12$/, 'b12'),
    searchName.toLowerCase().replace(/^omega[-\s]*3$/, 'omega')
  ];
  
  // Very strict matching - only accept if the match is very close
  for (const variation of searchVariations) {
    if (!variation.trim() || variation.length < 3) continue;
    
    const match = availableNames.find(name => {
      const normalizedAvailable = normalizeSupplementName(name);
      const normalizedVariation = normalizeSupplementName(variation);
      
      // Exact match
      if (normalizedAvailable === normalizedVariation) return true;
      
      // Very strict partial matching - must be substantial overlap
      const searchWords = normalizedVariation.split(' ').filter(w => w.length > 2);
      const availableWords = normalizedAvailable.split(' ').filter(w => w.length > 2);
      
      if (searchWords.length === 0 || availableWords.length === 0) return false;
      
      // For vitamins, require exact vitamin type match
      if (normalizedVariation.includes('vitamin')) {
        const searchVitamin = normalizedVariation.match(/vitamin\s*([a-z0-9]+)/);
        const availableVitamin = normalizedAvailable.match(/vitamin\s*([a-z0-9]+)/);
        
        if (searchVitamin && availableVitamin) {
          return searchVitamin[1] === availableVitamin[1];
        }
        
        // If one has vitamin and other doesn't, no match
        if (!normalizedAvailable.includes('vitamin')) return false;
      }
      
      // Require at least 70% of search words to be found in available name
      const matchedWords = searchWords.filter(searchWord => 
        availableWords.some(availableWord => 
          availableWord.includes(searchWord) || searchWord.includes(availableWord)
        )
      );
      
      const matchPercentage = matchedWords.length / searchWords.length;
      return matchPercentage >= 0.7;
    });
    
    if (match) {
      console.log(`Found match: "${searchName}" -> "${match}" via variation "${variation}"`);
      return match;
    }
  }
  
  return null;
}

// Enhanced hardcoded fallback data for common supplements with direct product URLs
const FALLBACK_PRODUCTS: Record<string, Array<{brand: string, title: string, url: string}>> = {
  "Vitamin D3": [
    {brand: "Thorne", title: "Vitamin D-5000", url: "https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule"},
    {brand: "Pure Encapsulations", title: "Vitamin D3 5000 IU", url: "https://www.pureencapsulations.com/vitamin-d3-5-000-iu.html"}
  ],
  "Vitamin D": [
    {brand: "Thorne", title: "Vitamin D-5000", url: "https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule"},
    {brand: "Pure Encapsulations", title: "Vitamin D3 5000 IU", url: "https://www.pureencapsulations.com/vitamin-d3-5-000-iu.html"}
  ],
  "Vitamin D3 + K2": [
    {brand: "Thorne", title: "Vitamin D/K2", url: "https://www.thorne.com/products/dp/vitamin-d-k2"},
    {brand: "Pure Encapsulations", title: "Vitamin D3 with K2", url: "https://www.pureencapsulations.com/vitamin-d3-with-k2-60-capsules.html"}
  ],
  "Vitamin A": [
    {brand: "Thorne", title: "Vitamin A", url: "https://www.thorne.com/products/dp/vitamin-a"},
    {brand: "Pure Encapsulations", title: "Vitamin A", url: "https://www.pureencapsulations.com/vitamin-a-10-000-iu-250-capsules.html"}
  ],
  "Magnesium": [
    {brand: "Thorne", title: "Magnesium Bisglycinate", url: "https://www.thorne.com/products/dp/magnesium-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Magnesium Glycinate", url: "https://www.pureencapsulations.com/magnesium-glycinate.html"}
  ],
  "Magnesium Glycinate": [
    {brand: "Thorne", title: "Magnesium Bisglycinate", url: "https://www.thorne.com/products/dp/magnesium-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Magnesium Glycinate", url: "https://www.pureencapsulations.com/magnesium-glycinate.html"}
  ],
  "Omega-3": [
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"},
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"}
  ],
  "Omega-3 (EPA/DHA)": [
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"},
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"}
  ],
  "DHA-rich fish oil": [
    {brand: "Nordic Naturals", title: "DHA", url: "https://www.nordicnaturals.com/products/dha"},
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"}
  ],
  "EPA/DHA (preformed)": [
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"},
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"}
  ],
  "Fish Oil": [
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"},
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"}
  ],
  "Fish Oil (EPA/DHA)": [
    {brand: "Thorne", title: "Super EPA", url: "https://www.thorne.com/products/dp/super-epa"},
    {brand: "Nordic Naturals", title: "Ultimate Omega", url: "https://www.nordicnaturals.com/products/ultimate-omega"}
  ],
  "B Complex": [
    {brand: "Thorne", title: "Stress B-Complex", url: "https://www.thorne.com/products/dp/stress-b-complex"},
    {brand: "Pure Encapsulations", title: "B-Complex Plus", url: "https://www.pureencapsulations.com/b-complex-plus.html"}
  ],
  "Vitamin B Complex": [
    {brand: "Thorne", title: "Stress B-Complex", url: "https://www.thorne.com/products/dp/stress-b-complex"},
    {brand: "Pure Encapsulations", title: "B-Complex Plus", url: "https://www.pureencapsulations.com/b-complex-plus.html"}
  ],
  "Methyl-B12": [
    {brand: "Thorne", title: "Methylcobalamin", url: "https://www.thorne.com/products/dp/methylcobalamin"},
    {brand: "Pure Encapsulations", title: "B12 Methylcobalamin", url: "https://www.pureencapsulations.com/b12-methylcobalamin-1000-mcg-60-capsules.html"}
  ],
  "Methyl-B12 (sublingual)": [
    {brand: "Thorne", title: "Methylcobalamin", url: "https://www.thorne.com/products/dp/methylcobalamin"},
    {brand: "Pure Encapsulations", title: "B12 Methylcobalamin", url: "https://www.pureencapsulations.com/b12-methylcobalamin-1000-mcg-60-capsules.html"}
  ],
  "High-dose B12 (methylcobalamin)": [
    {brand: "Thorne", title: "Methylcobalamin", url: "https://www.thorne.com/products/dp/methylcobalamin"},
    {brand: "Pure Encapsulations", title: "B12 Methylcobalamin", url: "https://www.pureencapsulations.com/b12-methylcobalamin-1000-mcg-60-capsules.html"}
  ],
  "B12": [
    {brand: "Thorne", title: "Methylcobalamin", url: "https://www.thorne.com/products/dp/methylcobalamin"},
    {brand: "Pure Encapsulations", title: "B12 Methylcobalamin", url: "https://www.pureencapsulations.com/b12-methylcobalamin-1000-mcg-60-capsules.html"}
  ],
  "L-Methylfolate": [
    {brand: "Thorne", title: "5-MTHF 1 mg", url: "https://www.thorne.com/products/dp/5-mthf-1-mg"},
    {brand: "Pure Encapsulations", title: "Folate 400", url: "https://www.pureencapsulations.com/folate-400-90-capsules.html"}
  ],
  "Betaine (TMG)": [
    {brand: "Thorne", title: "Betaine", url: "https://www.thorne.com/products/dp/betaine"},
    {brand: "Pure Encapsulations", title: "Betaine HCl", url: "https://www.pureencapsulations.com/betaine-hcl-pepsin-250-capsules.html"}
  ],
  "CoQ10": [
    {brand: "Thorne", title: "Q-Best 100", url: "https://www.thorne.com/products/dp/q-best-100"},
    {brand: "Pure Encapsulations", title: "CoQ10 120 mg", url: "https://www.pureencapsulations.com/coq10-120-mg.html"}
  ],
  "SAMe": [
    {brand: "Thorne", title: "SAMe", url: "https://www.thorne.com/products/dp/s-adenosylmethionine"},
    {brand: "Pure Encapsulations", title: "SAMe", url: "https://www.pureencapsulations.com/s-adenosylmethionine-sam-e-400-mg-60-capsules.html"}
  ],
  "L-Tyrosine": [
    {brand: "Thorne", title: "Tyrosine", url: "https://www.thorne.com/products/dp/tyrosine"},
    {brand: "Pure Encapsulations", title: "L-Tyrosine", url: "https://www.pureencapsulations.com/l-tyrosine-500-mg-90-capsules.html"}
  ],
  "Green Tea Extract": [
    {brand: "Thorne", title: "Green Tea Phytosome", url: "https://www.thorne.com/products/dp/green-tea-phytosome"},
    {brand: "Pure Encapsulations", title: "Green Tea Extract", url: "https://www.pureencapsulations.com/green-tea-extract-400-mg-60-capsules.html"}
  ],
  "Glycine": [
    {brand: "Thorne", title: "Glycine", url: "https://www.thorne.com/products/dp/glycine"},
    {brand: "Pure Encapsulations", title: "Glycine", url: "https://www.pureencapsulations.com/glycine-500-mg-90-capsules.html"}
  ],
  "Molybdenum": [
    {brand: "Thorne", title: "Molybdenum Glycinate", url: "https://www.thorne.com/products/dp/molybdenum-glycinate"},
    {brand: "Pure Encapsulations", title: "Molybdenum", url: "https://www.pureencapsulations.com/molybdenum-75-mcg-60-capsules.html"}
  ],
  "Vitamin B6": [
    {brand: "Thorne", title: "Pyridoxal 5'-Phosphate", url: "https://www.thorne.com/products/dp/pyridoxal-5-phosphate"},
    {brand: "Pure Encapsulations", title: "P5P 50", url: "https://www.pureencapsulations.com/p5p-50-60-capsules.html"}
  ],
  "Selenium": [
    {brand: "Thorne", title: "Selenomethionine", url: "https://www.thorne.com/products/dp/selenomethionine"},
    {brand: "Pure Encapsulations", title: "Selenium", url: "https://www.pureencapsulations.com/selenium-selenomethionine-200-mcg-60-capsules.html"}
  ],
  "NAC": [
    {brand: "Thorne", title: "NAC", url: "https://www.thorne.com/products/dp/nac"},
    {brand: "Pure Encapsulations", title: "NAC", url: "https://www.pureencapsulations.com/nac-n-acetyl-l-cysteine-900-mg-120-capsules.html"}
  ],
  "Glutathione": [
    {brand: "Thorne", title: "Glutathione-SR", url: "https://www.thorne.com/products/dp/glutathione-sr"},
    {brand: "Pure Encapsulations", title: "Liposomal Glutathione", url: "https://www.pureencapsulations.com/liposomal-glutathione-30-capsules.html"}
  ],
  "Manganese": [
    {brand: "Thorne", title: "Manganese Bisglycinate", url: "https://www.thorne.com/products/dp/manganese-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Manganese", url: "https://www.pureencapsulations.com/manganese-citrate-60-capsules.html"}
  ],
  "PQQ": [
    {brand: "Thorne", title: "PQQ Complex", url: "https://www.thorne.com/products/dp/pqq-complex"},
    {brand: "Pure Encapsulations", title: "PQQ", url: "https://www.pureencapsulations.com/pqq-10-mg-30-capsules.html"}
  ],
  "Milk Thistle": [
    {brand: "Thorne", title: "Silymarin", url: "https://www.thorne.com/products/dp/silymarin"},
    {brand: "Pure Encapsulations", title: "Silymarin", url: "https://www.pureencapsulations.com/silymarin-250-mg-60-capsules.html"}
  ],
  "Cruciferous Extract": [
    {brand: "Thorne", title: "Crucera-SGS", url: "https://www.thorne.com/products/dp/crucera-sgs"},
    {brand: "Pure Encapsulations", title: "DIM-PRO", url: "https://www.pureencapsulations.com/dim-pro-60-capsules.html"}
  ],
  "Alpha-Lipoic Acid": [
    {brand: "Thorne", title: "Alpha-Lipoic Acid", url: "https://www.thorne.com/products/dp/alpha-lipoic-acid"},
    {brand: "Pure Encapsulations", title: "Alpha Lipoic Acid", url: "https://www.pureencapsulations.com/alpha-lipoic-acid-400-mg-120-capsules.html"}
  ],
  "Curcumin": [
    {brand: "Thorne", title: "Meriva 500-SF", url: "https://www.thorne.com/products/dp/meriva-500-sf"},
    {brand: "Pure Encapsulations", title: "Curcumin 500", url: "https://www.pureencapsulations.com/curcumin-500-with-bioperine-60-capsules.html"}
  ],
  "Niacin": [
    {brand: "Thorne", title: "Niacin", url: "https://www.thorne.com/products/dp/niacin"},
    {brand: "Pure Encapsulations", title: "Niacin", url: "https://www.pureencapsulations.com/niacin-500-mg-250-capsules.html"}
  ],
  "Potassium": [
    {brand: "Thorne", title: "Potassium Citrate", url: "https://www.thorne.com/products/dp/potassium-citrate"},
    {brand: "Pure Encapsulations", title: "Potassium", url: "https://www.pureencapsulations.com/potassium-aspartate-90-capsules.html"}
  ],
  "Hawthorn": [
    {brand: "Thorne", title: "Hawthorn", url: "https://www.thorne.com/products/dp/hawthorn"},
    {brand: "Pure Encapsulations", title: "Hawthorn", url: "https://www.pureencapsulations.com/hawthorn-250-mg-60-capsules.html"}
  ],
  "Iron": [
    {brand: "Thorne", title: "Iron Bisglycinate", url: "https://www.thorne.com/products/dp/iron-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Iron-C", url: "https://www.pureencapsulations.com/iron-c-60-capsules.html"}
  ],
  "Iron (with Vitamin C)": [
    {brand: "Thorne", title: "Iron Bisglycinate", url: "https://www.thorne.com/products/dp/iron-bisglycinate"},
    {brand: "Pure Encapsulations", title: "Iron-C", url: "https://www.pureencapsulations.com/iron-c-60-capsules.html"}
  ],
  "Lactoferrin": [
    {brand: "Thorne", title: "Lactoferrin", url: "https://www.thorne.com/products/dp/lactoferrin"},
    {brand: "Pure Encapsulations", title: "Lactoferrin", url: "https://www.pureencapsulations.com/lactoferrin-250-mg-60-capsules.html"}
  ],
  "L-Theanine": [
    {brand: "Thorne", title: "Theanine", url: "https://www.thorne.com/products/dp/theanine"},
    {brand: "Pure Encapsulations", title: "L-Theanine", url: "https://www.pureencapsulations.com/l-theanine-200-mg-60-capsules.html"}
  ],
  "Vitamin C": [
    {brand: "Thorne", title: "Vitamin C with Flavonoids", url: "https://www.thorne.com/products/dp/vitamin-c-with-flavonoids"},
    {brand: "Pure Encapsulations", title: "Vitamin C", url: "https://www.pureencapsulations.com/vitamin-c-1000-mg-250-capsules.html"}
  ],
  "NAD+": [
    {brand: "Thorne", title: "NAD+ Precursor", url: "https://www.thorne.com/products/dp/resveracel"},
    {brand: "Pure Encapsulations", title: "NAD+ Support", url: "https://www.pureencapsulations.com/nad-support-60-capsules.html"}
  ],
  "Berberine": [
    {brand: "Thorne", title: "Berberine-500", url: "https://www.thorne.com/products/dp/berberine-500"},
    {brand: "Pure Encapsulations", title: "Berberine UltraSorb", url: "https://www.pureencapsulations.com/berberine-ultrasorb-60-capsules.html"}
  ],
  "Plant Sterols": [
    {brand: "Thorne", title: "Choleast", url: "https://www.thorne.com/products/dp/choleast"},
    {brand: "Pure Encapsulations", title: "Phytosterol Complex", url: "https://www.pureencapsulations.com/phytosterol-complex-180-capsules.html"}
  ],
  "Red Yeast Rice": [
    {brand: "Thorne", title: "Choleast", url: "https://www.thorne.com/products/dp/choleast"},
    {brand: "Pure Encapsulations", title: "Red Yeast Rice", url: "https://www.pureencapsulations.com/red-yeast-rice-120-capsules.html"}
  ],
  "Ashwagandha": [
    {brand: "Thorne", title: "Ashwagandha", url: "https://www.thorne.com/products/dp/ashwagandha"},
    {brand: "Pure Encapsulations", title: "Ashwagandha", url: "https://www.pureencapsulations.com/ashwagandha-60-capsules.html"}
  ],
  "Melatonin": [
    {brand: "Thorne", title: "Melaton-3", url: "https://www.thorne.com/products/dp/melaton-3"},
    {brand: "Pure Encapsulations", title: "Melatonin", url: "https://www.pureencapsulations.com/melatonin-3-mg-60-capsules.html"}
  ],
  "Probiotic (Multi-strain)": [
    {brand: "Thorne", title: "FloraPro-LP", url: "https://www.thorne.com/products/dp/florapro-lp"},
    {brand: "Pure Encapsulations", title: "Probiotic 50B", url: "https://www.pureencapsulations.com/probiotic-50b-60-capsules.html"}
  ],
  "Digestive Enzymes": [
    {brand: "Thorne", title: "Digestzyme-V", url: "https://www.thorne.com/products/dp/digestzyme-v"},
    {brand: "Pure Encapsulations", title: "Digestive Enzymes Ultra", url: "https://www.pureencapsulations.com/digestive-enzymes-ultra-90-capsules.html"}
  ]
};

async function handleSingleSupplementSearch(supplement_name: string, supabase: any, corsHeaders: any) {
  console.log(`Searching for single supplement: ${supplement_name}`);
  
  try {
    // Get all available supplement names from database
    const { data: allSupplements } = await supabase
      .from('product_links')
      .select('supplement_name')
      .eq('verified', true)
      .not('supplement_name', 'is', null);
    
    const availableNames = [...new Set(allSupplements?.map(s => s.supplement_name) || [])];
    console.log(`Found ${availableNames.length} unique supplements in database`);
    
    // Find best matching supplement name
    const bestMatch = findBestMatch(supplement_name, availableNames);
    console.log(`Best match for "${supplement_name}": ${bestMatch || 'none'}`);
    
    // If we found a match in database, use it
    if (bestMatch) {
      const { data: products } = await supabase
        .from('product_links')
        .select('*')
        .eq('supplement_name', bestMatch)
        .eq('verified', true)
        .order('price', { ascending: true })
        .limit(5);

      if (products && products.length > 0) {
        // Prefer URLs that look like a direct product page (no search query)
        const cleanProduct = products.find(p => 
          p.product_url && 
          !/search|\?.+=|dispensary|pdf$/i.test(p.product_url) &&
          /products\/dp\/|products\/[^\/]+\.html$/i.test(p.product_url)
        ) || products[0];
        
        console.log(`Database found: ${cleanProduct.brand} - ${cleanProduct.product_url}`);
        
        return new Response(JSON.stringify({
          success: true,
          product_url: cleanProduct.product_url,
          brand: cleanProduct.brand,
          product_name: cleanProduct.product_name,
          price: cleanProduct.price,
          source: 'database',
          matched_name: bestMatch
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    // Primary fallback to enhanced predefined trusted products map
    console.log('Falling back to predefined trusted products list');
    const fallbackKey = Object.keys(FALLBACK_PRODUCTS).find(key => {
      const normalizedKey = normalizeSupplementName(key);
      const normalizedSearch = normalizeSupplementName(supplement_name);
      
      // Exact match first
      if (normalizedKey === normalizedSearch) return true;
      
      // For vitamins, be extremely strict - require exact vitamin letter/number match
      if (supplement_name.toLowerCase().includes('vitamin')) {
        const searchVitamin = supplement_name.toLowerCase().match(/vitamin\s*([a-z0-9]+)/);
        const keyVitamin = key.toLowerCase().match(/vitamin\s*([a-z0-9]+)/);
        
        if (searchVitamin && keyVitamin) {
          // Only match if the vitamin types are exactly the same
          return searchVitamin[1] === keyVitamin[1] && 
                 (supplement_name.toLowerCase().includes('k2') ? key.toLowerCase().includes('k2') : !key.toLowerCase().includes('k2'));
        }
        return false; // If vitamin parsing failed, no match
      }
      
      // For non-vitamin supplements, check specific cases
      const lowerSearch = supplement_name.toLowerCase();
      const lowerKey = key.toLowerCase();
      
      // Specific supplement matching with strict rules
      if (lowerSearch.includes('fish oil') || lowerSearch.includes('dha')) {
        return lowerKey.includes('fish oil') || lowerKey.includes('dha') || lowerKey.includes('omega');
      }
      
      if (lowerSearch.includes('methylfolate')) {
        return lowerKey.includes('methylfolate');
      }
      
      if (lowerSearch.includes('methyl-b12') || lowerSearch.includes('methylcobalamin')) {
        return lowerKey.includes('methyl-b12') || lowerKey.includes('b12');
      }
      
      if (lowerSearch.includes('betaine')) {
        return lowerKey.includes('betaine');
      }
      
      // For other cases, require substantial word overlap
      const searchWords = normalizedSearch.split(' ').filter(w => w.length > 2);
      const keyWords = normalizedKey.split(' ').filter(w => w.length > 2);
      
      if (searchWords.length === 0 || keyWords.length === 0) return false;
      
      const matchedWords = searchWords.filter(searchWord => 
        keyWords.some(keyWord => 
          keyWord === searchWord || 
          (keyWord.length > 3 && searchWord.length > 3 && 
           (keyWord.includes(searchWord) || searchWord.includes(keyWord)))
        )
      );
      
      // Require at least 80% word match for fallback
      return matchedWords.length / searchWords.length >= 0.8;
    });

    if (fallbackKey) {
      const pick = FALLBACK_PRODUCTS[fallbackKey][0];
      console.log(`Fallback found: ${pick.brand} - ${pick.url}`);
      
      return new Response(JSON.stringify({
        success: true,
        product_url: pick.url,
        brand: pick.brand,
        product_name: pick.title,
        price: null,
        source: 'predefined_fallback',
        matched_name: fallbackKey
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Final fallback to trusted brand search pages
    const fallbackUrls = [
      `https://www.thorne.com/search?q=${encodeURIComponent(supplement_name)}`,
      `https://www.pureencapsulations.com/search?q=${encodeURIComponent(supplement_name)}`,
      `https://www.vitacost.com/search?t=${encodeURIComponent(supplement_name)}`
    ];

    const fallbackUrl = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
    console.log(`Using search fallback: ${fallbackUrl}`);
    
    return new Response(JSON.stringify({
      success: true,
      product_url: fallbackUrl,
      brand: 'Multiple Options',
      product_name: `Search for ${supplement_name}`,
      price: null,
      source: 'fallback_search'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in handleSingleSupplementSearch:', error);
    
    // Emergency fallback
    return new Response(JSON.stringify({
      success: true,
      product_url: `https://www.vitacost.com/search?t=${encodeURIComponent(supplement_name)}`,
      brand: 'Vitacost',
      product_name: `Search for ${supplement_name}`,
      price: null,
      source: 'error_fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
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
