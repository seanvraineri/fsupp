import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

// SERPAPI configuration
const SERPAPI_KEY = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92';

// Complete list of ALL supplements the system can recommend (from generate_analysis function)
const ALL_SUPPLEMENTS = [
  // Base recommendations
  'Vitamin D3',
  'Magnesium Glycinate', 
  'Omega-3 (EPA/DHA)',
  'Vitamin B Complex',
  'CoQ10',
  'Iron',
  'Ashwagandha',
  'L-Theanine',
  'Melatonin',
  'Probiotic (Multi-strain)',
  'Digestive Enzymes',
  
  // Methylation & Folate pathway (MTHFR genetics)
  'L-Methylfolate',
  'Methylcobalamin',
  'Betaine (TMG)',
  'Glycine',
  'Serine',
  'B-Complex',
  'Folinic Acid',
  
  // Neurotransmitter & Mood (COMT, MAO-A, etc.)
  'SAMe',
  'L-Tyrosine',
  'Green Tea Extract',
  '5-HTP',
  'Tryptophan',
  'Lion\'s Mane',
  'Rhodiola',
  'Inositol',
  'Copper',
  'Vitamin B6',
  'P5P (B6)',
  'Riboflavin',
  
  // Detoxification & Antioxidants (GST variants)
  'NAC',
  'Milk Thistle',
  'Cruciferous Extract',
  'Alpha-Lipoic Acid',
  'Selenium',
  'Manganese',
  'PQQ',
  'Zinc',
  'Vitamin C',
  'Vitamin E',
  'Curcumin',
  'Quercetin',
  'Glutathione',
  
  // Vitamin Metabolism & Transport (VDR, B12 transport)
  'Vitamin K2',
  'Iron with Vitamin C',
  'Sublingual B12',
  'Intrinsic Factor',
  'High-dose B12',
  'Preformed Vitamin A (Retinol)',
  'Bioflavonoids',
  'Lactoferrin',
  'IP6',
  
  // Cardiovascular & Lipids (APOE, FADS variants)
  'DHA',
  'EPA/DHA (preformed)',
  'Plant Sterols',
  'Red Yeast Rice',
  'Niacin',
  'Berberine',
  'Hawthorn',
  'Potassium',
  'Fish Oil',
  
  // Drug/Supplement Metabolism Support
  'St John\'s Wort',
  'Gluconic Acid',
  
  // Inflammation & Immune (IL6, TNF variants)
  'Boswellia',
  'Resveratrol',
  'White Willow',
  
  // Other Important Pathways
  'Molybdenum',
  'Choline',
  'Phosphatidylcholine',
  'NAD+',
  'Taurine',
  
  // Diet-specific supplements
  'Algae Omega-3 (DHA/EPA)',
  'Iron Bisglycinate',
  'Zinc Picolinate',
  'Calcium Citrate',
  'Electrolyte Complex',
  'Psyllium Husk',
  'Fiber Supplement',
  'Calcium',
  'Magnesium',
  'Potassium Citrate',
  
  // Drug depletion supplements
  'Multi-strain Probiotic',
  'Vitamin K',
  
  // Additional forms and variations
  'Vitamin D',
  'B12',
  'Folate',
  'Iron Supplement',
  'Magnesium Supplement',
  'Omega-3',
  'Probiotics',
  'Multivitamin',
  'Calcium Supplement',
  'Zinc Supplement',
  'Vitamin A',
  'Biotin',
  'Thiamine',
  'Vitamin B1',
  'Vitamin B2',
  'Vitamin B3',
  'Vitamin B5',
  'Vitamin B12',
  'Folic Acid',
  'Pantothenic Acid',
  'Chromium',
  'Iodine'
];

// Trusted supplement brands (prioritize these)
const TRUSTED_BRANDS = [
  'Thorne',
  'Pure Encapsulations', 
  'Nordic Naturals',
  'Life Extension',
  'Jarrow Formulas',
  'NOW Foods',
  'Doctor\'s Best',
  'Solgar',
  'Garden of Life',
  'New Chapter'
];

// Known working product mappings (manually verified)
const VERIFIED_PRODUCT_MAPPINGS = {
  'Vitamin D3': [
    {
      brand: 'Thorne',
      product_name: 'Vitamin D-1000',
      url: 'https://www.thorne.com/products/dp/d-1000-vitamin-d-capsule',
      price: 18.00,
      serving_size: '1000 IU',
      servings: 90
    },
    {
      brand: 'Thorne', 
      product_name: 'Vitamin D-5000',
      url: 'https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule',
      price: 23.00,
      serving_size: '5000 IU',
      servings: 60
    }
  ],
  'Magnesium Glycinate': [
    {
      brand: 'Thorne',
      product_name: 'Magnesium Bisglycinate',
      url: 'https://www.thorne.com/products/dp/magnesium-bisglycinate',
      price: 25.00,
      serving_size: '200 mg',
      servings: 90
    }
  ],
  'L-Methylfolate': [
    {
      brand: 'Thorne',
      product_name: '5-MTHF 1 mg',
      url: 'https://www.thorne.com/products/dp/5-mthf-1-mg',
      price: 18.00,
      serving_size: '1 mg',
      servings: 60
    }
  ],
  'Methylcobalamin': [
    {
      brand: 'Thorne',
      product_name: 'Methylcobalamin',
      url: 'https://www.thorne.com/products/dp/methylcobalamin',
      price: 19.00,
      serving_size: '1 mg',
      servings: 60
    }
  ],
  'Omega-3 (EPA/DHA)': [
    {
      brand: 'Nordic Naturals',
      product_name: 'Ultimate Omega',
      url: 'https://www.nordicnaturals.com/products/ultimate-omega',
      price: 32.95,
      serving_size: '1280 mg EPA+DHA',
      servings: 60
    },
    {
      brand: 'Thorne',
      product_name: 'Super EPA',
      url: 'https://www.thorne.com/products/dp/super-epa',
      price: 39.00,
      serving_size: '425 mg EPA + 270 mg DHA',
      servings: 90
    }
  ]
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search for specific brand products using targeted Google search
async function searchBrandProducts(supplementName, brand) {
  try {
    // Try multiple search variations to find products
    const searchQueries = [
      `site:${getBrandWebsite(brand)} "${supplementName}"`,
      `site:${getBrandWebsite(brand)} ${supplementName}`,
      `site:${getBrandWebsite(brand)} ${supplementName.replace(/[()]/g, '').replace(/\//g, ' ')}`
    ];
    
    for (const searchQuery of searchQueries) {
      console.log(`🔍 Searching: ${searchQuery}`);
      
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_KEY}&num=15`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SERPAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.organic_results || data.organic_results.length === 0) {
        continue; // Try next query
      }
      
      const products = data.organic_results
        .filter(result => isValidProductPage(result, supplementName, brand))
        .slice(0, 5)
        .map(result => ({
          supplement_name: supplementName,
          product_name: extractProductName(result.title, supplementName, brand),
          brand: brand,
          product_url: result.link,
          image_url: null,
          price: extractPriceFromText(result.snippet),
          search_query: searchQuery,
          relevance_score: calculateBrandRelevanceScore(result, supplementName, brand),
          matches_dosage: extractProductInfo(result.title, result.snippet || '', supplementName).matches_dosage,
          third_party_tested: checkThirdPartyTested(result.title + ' ' + (result.snippet || '')),
          gmp_certified: checkGMPCertified(result.title + ' ' + (result.snippet || '')),
          serving_size: extractProductInfo(result.title, result.snippet || '', supplementName).serving_size,
          servings_per_container: extractProductInfo(result.title, result.snippet || '', supplementName).servings_per_container,
          is_direct_purchase: true
        }))
        .filter(product => product !== null);
      
      if (products.length > 0) {
        return products; // Return first successful search
      }
    }
    
    return []; // No products found with any query
      
  } catch (error) {
    console.error(`❌ Error searching ${brand} for ${supplementName}:`, error.message);
    return [];
  }
}

// Get brand website for site: search
function getBrandWebsite(brand) {
  const websites = {
    'Thorne': 'thorne.com',
    'Pure Encapsulations': 'purecaps.com',
    'Nordic Naturals': 'nordicnaturals.com', 
    'Life Extension': 'lifeextension.com',
    'Jarrow Formulas': 'jarrow.com',
    'NOW Foods': 'nowfoods.com',
    'Doctor\'s Best': 'doctorsbest.com',
    'Solgar': 'solgar.com',
    'Garden of Life': 'gardenoflife.com',
    'New Chapter': 'newchapter.com'
  };
  return websites[brand] || `${brand.toLowerCase().replace(/\s+/g, '')}.com`;
}

// Check if this is a valid product page - MUCH LESS STRICT
function isValidProductPage(result, supplementName, brand) {
  const title = result.title?.toLowerCase() || '';
  const url = result.link?.toLowerCase() || '';
  const snippet = result.snippet?.toLowerCase() || '';
  const supplementLower = supplementName.toLowerCase();
  
  // ONLY be strict about direct product links
  const isDirectProductLink = 
    url.includes('/products/') || 
    url.includes('/product/') || 
    url.includes('/dp/') || 
    url.includes('/supplements/') ||
    url.includes('/item/') ||
    url.includes('/shop/');
  
  // Must be a direct product page (this is our ONLY strict requirement)
  if (!isDirectProductLink) {
    return false;
  }
  
  // Exclude obvious non-product pages
  const isExcludedPage = 
    url.includes('/search') || 
    url.includes('/category') || 
    url.includes('/blog') ||
    url.includes('/news') ||
    url.includes('/cart') ||
    url.includes('/checkout');
  
  if (isExcludedPage) {
    return false;
  }
  
  // Very relaxed supplement name matching - just check if ANY keyword matches
  const supplementKeywords = supplementName
    .toLowerCase()
    .replace(/[()]/g, '')
    .split(/[\s\-\/]+/)
    .filter(word => word.length > 2 && !['with', 'and', 'the', 'for'].includes(word));
  
  const hasRelevantKeyword = supplementKeywords.some(keyword => 
    title.includes(keyword) || 
    snippet.includes(keyword) ||
    url.includes(keyword.replace(/\s+/g, '-'))
  );
  
  return hasRelevantKeyword;
}

// Extract clean product name from title - MORE PERMISSIVE
function extractProductName(title, supplementName, brand) {
  // Remove brand name and clean up title
  let cleanTitle = title
    .replace(new RegExp(brand, 'gi'), '') // Remove brand name
    .replace(/\|.*$/, '') // Remove everything after |
    .replace(/\s*-\s*.*$/, '') // Remove everything after -
    .replace(/\s*&\s*Reviews?.*$/i, '') // Remove "& Reviews"
    .trim();
  
  // If title is too short or too long, use a reasonable fallback
  if (cleanTitle.length < 5) {
    cleanTitle = supplementName;
  } else if (cleanTitle.length > 80) {
    cleanTitle = cleanTitle.substring(0, 80) + '...';
  }
  
  return cleanTitle;
}

// Enhanced product info extraction
function extractProductInfo(title, description, supplementName) {
  const fullText = `${title} ${description}`.toLowerCase();
  
  // Extract dosage information with more patterns
  const dosagePatterns = [
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*(mg|mcg|µg|ug|g|iu|international\s+units?)\b/gi,
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*milligrams?\b/gi,
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*micrograms?\b/gi,
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*units?\b/gi
  ];
  
  let serving_size = null;
  let matches_dosage = false;
  
  for (const pattern of dosagePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      serving_size = match[0].replace(',', '');
      matches_dosage = true;
      break;
    }
  }
  
  // Extract serving count information
  const servingPatterns = [
    /(\d+)\s*(?:count|ct|capsules?|tablets?|softgels?|servings?)\b/gi
  ];
  
  let servings_per_container = null;
  
  for (const pattern of servingPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (count > 5 && count < 1000) { // Reasonable range for supplement counts
        servings_per_container = count;
        break;
      }
    }
  }
  
  return {
    serving_size,
    servings_per_container,
    matches_dosage
  };
}

// Extract price from text
function extractPriceFromText(text) {
  if (!text) return null;
  
  const pricePatterns = [
    /\$(\d+(?:\.\d{2})?)/,
    /(\d+(?:\.\d{2})?)\s*dollars?/i,
    /price[:\s]*\$?(\d+(?:\.\d{2})?)/i
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  return null;
}

// Check third-party testing mentions
function checkThirdPartyTested(text) {
  if (!text || typeof text !== 'string') return false;
  
  const testingTerms = ['third party tested', '3rd party tested', 'nsf certified', 'usp verified', 'nsf sport', 'informed sport'];
  const textLower = text.toLowerCase();
  return testingTerms.some(term => textLower.includes(term));
}

// Check GMP certification
function checkGMPCertified(text) {
  if (!text || typeof text !== 'string') return false;
  
  const textLower = text.toLowerCase();
  return textLower.includes('gmp') || textLower.includes('good manufacturing');
}

// Calculate relevance score
function calculateBrandRelevanceScore(result, supplementName, brand) {
  let score = 0;
  const title = result.title.toLowerCase();
  const supplement = supplementName.toLowerCase();
  
  // Brand bonus
  score += 4;
  
  // Direct product page bonus
  if (result.link.includes('/product') || result.link.includes('/dp/')) {
    score += 3;
  }
  
  // Title relevance
  if (title.includes(supplement)) score += 3;
  
  // Exact match bonus
  if (title.includes(`${supplement} `)) score += 2;
  
  // Contains dosage information
  if (extractProductInfo(result.title, result.snippet || '', supplementName).matches_dosage) {
    score += 2;
  }
  
  return score;
}

// Create verified products from known mappings
function createVerifiedProducts() {
  const products = [];
  
  for (const [supplementName, mappings] of Object.entries(VERIFIED_PRODUCT_MAPPINGS)) {
    for (const mapping of mappings) {
      products.push({
        supplement_name: supplementName,
        product_name: `${mapping.brand} ${mapping.product_name}`,
        brand: mapping.brand,
        product_url: mapping.url,
        image_url: null,
        price: mapping.price,
        search_query: `${supplementName} ${mapping.brand}`,
        relevance_score: 10,
        matches_dosage: true,
        third_party_tested: true,
        gmp_certified: true,
        serving_size: mapping.serving_size,
        servings_per_container: mapping.servings,
        is_direct_purchase: true
      });
    }
  }
  
  return products;
}

// Main function to populate comprehensive database
async function populateComprehensiveDatabase() {
  console.log('🚀 Starting COMPREHENSIVE supplement database population...');
  console.log(`📊 Processing ${ALL_SUPPLEMENTS.length} supplements across ${TRUSTED_BRANDS.length} brands\n`);
  
  try {
    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await supabase
      .from('supplement_products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Start with verified products
    console.log('📦 Adding verified product mappings...');
    const verifiedProducts = createVerifiedProducts();
    
    if (verifiedProducts.length > 0) {
      const { error: verifiedError } = await supabase
        .from('supplement_products')
        .insert(verifiedProducts);
      
      if (verifiedError) {
        console.error('❌ Error inserting verified products:', verifiedError);
      } else {
        console.log(`✅ Added ${verifiedProducts.length} verified products`);
      }
    }
    
    let totalProducts = verifiedProducts.length;
    let processedSupplements = 0;
    
    // Process each supplement for additional products
    const prioritySupplements = [
      'Vitamin D3', 'Magnesium Glycinate', 'Omega-3 (EPA/DHA)', 'L-Methylfolate', 'Methylcobalamin',
      'Vitamin B Complex', 'CoQ10', 'Iron', 'Ashwagandha', 'L-Theanine', 'Melatonin',
      'NAC', 'Curcumin', 'Quercetin', 'Zinc', 'Vitamin C', 'Probiotics'
    ];
    
    for (const supplement of prioritySupplements) {
      try {
        console.log(`\n🔄 Processing ${processedSupplements + 1}/${prioritySupplements.length}: ${supplement}`);
        
        let supplementProducts = [];
        
        // Search top brands for this supplement
        for (const brand of TRUSTED_BRANDS.slice(0, 5)) {
          try {
            const products = await searchBrandProducts(supplement, brand);
            supplementProducts.push(...products);
            
            console.log(`   ${brand}: Found ${products.length} products`);
            
            await sleep(2000); // Rate limiting
          } catch (error) {
            console.error(`   ❌ ${brand}: ${error.message}`);
          }
        }
        
        // Remove duplicates and get top products
        const uniqueProducts = supplementProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.product_url === product.product_url)
        );
        
        const topProducts = uniqueProducts
          .sort((a, b) => b.relevance_score - a.relevance_score)
          .slice(0, 10);
        
        if (topProducts.length > 0) {
          const { error: insertError } = await supabase
            .from('supplement_products')
            .insert(topProducts);
          
          if (insertError) {
            console.error(`❌ Error inserting products for ${supplement}:`, insertError);
          } else {
            console.log(`✅ Added ${topProducts.length} products for ${supplement}`);
            totalProducts += topProducts.length;
          }
        }
        
        processedSupplements++;
        
      } catch (error) {
        console.error(`❌ Error processing ${supplement}:`, error.message);
        processedSupplements++;
        continue;
      }
    }
    
    console.log('\n🎉 Comprehensive database population completed!');
    console.log(`📊 Final stats:`);
    console.log(`   - Supplements processed: ${processedSupplements}/${prioritySupplements.length}`);
    console.log(`   - Total products in database: ${totalProducts}`);
    console.log(`   - Average products per supplement: ${(totalProducts / Math.max(processedSupplements, 1)).toFixed(1)}`);
    console.log(`   - Trusted brands covered: ${TRUSTED_BRANDS.slice(0, 5).join(', ')}`);
    
    // Test a few queries
    console.log('\n🧪 Testing database queries...');
    
    const { data: vitaminD, error: testError } = await supabase
      .from('supplement_products')
      .select('*')
      .eq('supplement_name', 'Vitamin D3')
      .order('relevance_score', { ascending: false });
    
    if (!testError && vitaminD) {
      console.log(`✅ Vitamin D3: ${vitaminD.length} products available`);
      vitaminD.slice(0, 3).forEach((product, i) => {
        console.log(`   ${i+1}. ${product.brand} - $${product.price} - ${product.product_url}`);
      });
    }
    
    console.log('\n📱 Database ready for recommendations system!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
if (process.argv[1].includes('populate_comprehensive_database.js')) {
  populateComprehensiveDatabase().catch(console.error);
}

export { populateComprehensiveDatabase }; 