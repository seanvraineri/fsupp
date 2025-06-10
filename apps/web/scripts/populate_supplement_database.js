import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase
const supabaseUrl = 'https://vkujjzmnwddfggtphebm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// SERPAPI configuration
const SERPAPI_KEY = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92';

// Comprehensive list of ALL supplements the system can recommend
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
  
  // Methylation & Folate pathway
  'L-Methylfolate',
  'Methylcobalamin',
  'Betaine (TMG)',
  'Glycine',
  'Serine',
  'B-Complex',
  'Folinic Acid',
  
  // Neurotransmitter & Mood
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
  
  // Detoxification & Antioxidants
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
  
  // Vitamin Metabolism & Transport
  'Vitamin K2',
  'Iron with Vitamin C',
  'Sublingual B12',
  'Intrinsic Factor',
  'High-dose B12',
  'Preformed Vitamin A (Retinol)',
  'Bioflavonoids',
  'Lactoferrin',
  'IP6',
  
  // Cardiovascular & Lipids
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
  
  // Inflammation & Immune
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
  'New Chapter',
  'Designs for Health',
  'Klaire Labs',
  'Seeking Health',
  'Ortho Molecular Products',
  'Integrative Therapeutics',
  'Metagenics'
];

// Sleep to avoid rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search for products using SERPAPI Google Shopping + Direct Retailer Search
async function searchProducts(supplementName, brand = null) {
  try {
    const searchQuery = brand ? `${supplementName} ${brand}` : supplementName;
    console.log(`🔍 Searching for: ${searchQuery}`);
    
    let allProducts = [];
    
    // 1. First try Google Shopping for general results
    const googleProducts = await searchGoogleShopping(searchQuery, supplementName);
    allProducts.push(...googleProducts);
    
    // 2. Search specific trusted retailers directly
    const retailerProducts = await searchTrustedRetailers(supplementName, brand);
    allProducts.push(...retailerProducts);
    
    // Remove duplicates and sort by quality
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.product_url === product.product_url)
    );
    
    const topProducts = uniqueProducts
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 15);
    
    console.log(`✅ Found ${topProducts.length} direct purchase links for: ${searchQuery}`);
    
    return topProducts;
    
  } catch (error) {
    console.error(`❌ Error searching for ${supplementName}:`, error.message);
    return [];
  }
}

// Search Google Shopping for products
async function searchGoogleShopping(searchQuery, supplementName) {
  try {
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_KEY}&num=30`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SERPAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.shopping_results || data.shopping_results.length === 0) {
      return [];
    }
    
    return data.shopping_results
      .filter(product => isRelevantProduct(product, supplementName))
      .map(product => processGoogleShoppingProduct(product, supplementName, searchQuery))
      .filter(product => product !== null);
      
  } catch (error) {
    console.error(`Error in Google Shopping search:`, error);
    return [];
  }
}

// Search trusted retailers directly
async function searchTrustedRetailers(supplementName, brand) {
  const products = [];
  
  // Define direct retailer search strategies
  const retailers = [
    {
      name: 'Thorne',
      baseUrl: 'https://www.thorne.com',
      searchUrl: (query) => `https://serpapi.com/search.json?engine=google&q=site:thorne.com ${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`,
      brand: 'Thorne'
    },
    {
      name: 'Pure Encapsulations',
      baseUrl: 'https://www.purecaps.com',
      searchUrl: (query) => `https://serpapi.com/search.json?engine=google&q=site:purecaps.com ${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`,
      brand: 'Pure Encapsulations'
    },
    {
      name: 'Nordic Naturals',
      baseUrl: 'https://www.nordicnaturals.com',
      searchUrl: (query) => `https://serpapi.com/search.json?engine=google&q=site:nordicnaturals.com ${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`,
      brand: 'Nordic Naturals'
    },
    {
      name: 'Life Extension',
      baseUrl: 'https://www.lifeextension.com',
      searchUrl: (query) => `https://serpapi.com/search.json?engine=google&q=site:lifeextension.com ${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`,
      brand: 'Life Extension'
    },
    {
      name: 'Vitacost',
      baseUrl: 'https://www.vitacost.com',
      searchUrl: (query) => `https://serpapi.com/search.json?engine=google&q=site:vitacost.com ${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`,
      brand: 'Multiple Brands'
    }
  ];
  
  // If brand is specified, prioritize that retailer
  const prioritizedRetailers = brand ? 
    retailers.filter(r => r.brand.toLowerCase().includes(brand.toLowerCase())).concat(
      retailers.filter(r => !r.brand.toLowerCase().includes(brand.toLowerCase()))
    ) : retailers;
  
  for (const retailer of prioritizedRetailers.slice(0, 3)) { // Limit to 3 retailers to avoid rate limits
    try {
      const retailerProducts = await searchSingleRetailer(retailer, supplementName);
      products.push(...retailerProducts);
      await sleep(1000); // Rate limiting
    } catch (error) {
      console.error(`Error searching ${retailer.name}:`, error.message);
    }
  }
  
  return products;
}

// Search a single retailer
async function searchSingleRetailer(retailer, supplementName) {
  try {
    const searchUrl = retailer.searchUrl(supplementName);
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.organic_results || data.organic_results.length === 0) {
      return [];
    }
    
    return data.organic_results
      .filter(result => {
        const title = result.title?.toLowerCase() || '';
        const snippet = result.snippet?.toLowerCase() || '';
        const supplementLower = supplementName.toLowerCase();
        
        // Must be a product page (not category/search pages)
        return (title.includes(supplementLower) || snippet.includes(supplementLower)) &&
               !result.link.includes('/search') &&
               !result.link.includes('/category') &&
               !result.link.includes('/blog') &&
               (result.link.includes('/product') || 
                result.link.includes('/item') || 
                result.link.includes(supplementLower.replace(/\s+/g, '-')));
      })
      .slice(0, 3) // Top 3 results per retailer
      .map(result => {
        // Extract product information from title and snippet
        const productInfo = extractProductInfo(result.title, result.snippet, supplementName);
        
        return {
          product_name: result.title,
          brand: retailer.brand,
          product_url: result.link,
          image_url: null, // Will be populated if available
          price: extractPriceFromText(result.snippet),
          search_query: supplementName,
          relevance_score: calculateRetailerRelevanceScore(result, supplementName, retailer),
          matches_dosage: productInfo.matches_dosage,
          third_party_tested: checkThirdPartyTested(result.title + ' ' + (result.snippet || '')),
          gmp_certified: checkGMPCertified(result.title + ' ' + (result.snippet || '')),
          serving_size: productInfo.serving_size,
          servings_per_container: productInfo.servings_per_container,
          is_direct_purchase: true // These are direct retailer links
        };
      })
      .filter(product => product !== null);
      
  } catch (error) {
    console.error(`Error searching ${retailer.name}:`, error);
    return [];
  }
}

// Process Google Shopping product
function processGoogleShoppingProduct(product, supplementName, searchQuery) {
  try {
    // Extract brand from title or source
    let productBrand = product.source || 'Unknown';
    
    // Try to identify known brands in the title
    const titleUpper = product.title.toUpperCase();
    for (const trustedBrand of TRUSTED_BRANDS) {
      if (titleUpper.includes(trustedBrand.toUpperCase())) {
        productBrand = trustedBrand;
        break;
      }
    }
    
    // Extract price (remove $ and convert to number)
    let price = null;
    if (product.price) {
      const priceMatch = product.price.toString().match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        price = parseFloat(priceMatch[0].replace(/,/g, ''));
      }
    }
    
    // Extract product details
    const productInfo = extractProductInfo(product.title, '', supplementName);
    
    return {
      product_name: product.title,
      brand: productBrand,
      product_url: product.link,
      image_url: product.thumbnail,
      price: price,
      search_query: searchQuery,
      relevance_score: calculateRelevanceScore(product, supplementName, productBrand),
      matches_dosage: productInfo.matches_dosage,
      third_party_tested: checkThirdPartyTested(product.title),
      gmp_certified: checkGMPCertified(product.title),
      serving_size: productInfo.serving_size,
      servings_per_container: productInfo.servings_per_container,
      is_direct_purchase: isDirectPurchaseLink(product.link)
    };
  } catch (error) {
    console.error('Error processing Google Shopping product:', error);
    return null;
  }
}

// Check if product is relevant to the supplement search
function isRelevantProduct(product, supplementName) {
  const title = product.title?.toLowerCase() || '';
  const supplementLower = supplementName.toLowerCase();
  
  // Must contain supplement name (or key parts)
  const keyTerms = supplementLower.split(/[\s\(\)]/);
  const hasRelevantTerms = keyTerms.some(term => 
    term.length > 2 && title.includes(term)
  );
  
  return hasRelevantTerms && 
         !title.includes('book') && 
         !title.includes('poster') &&
         !title.includes('t-shirt') &&
         !title.includes('clothing') &&
         product.price;
}

// Extract product information from title and description
function extractProductInfo(title, description, supplementName) {
  const fullText = `${title} ${description}`.toLowerCase();
  
  // Extract dosage information
  const dosagePatterns = [
    /(\d+(?:\.\d+)?)\s*(mg|mcg|µg|ug|g|iu|international units?)/gi,
    /(\d+(?:\.\d+)?)\s*milligrams?/gi,
    /(\d+(?:\.\d+)?)\s*micrograms?/gi
  ];
  
  let serving_size = null;
  let matches_dosage = false;
  
  for (const pattern of dosagePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      serving_size = match[0];
      matches_dosage = true;
      break;
    }
  }
  
  // Extract serving information
  const servingPatterns = [
    /(\d+)\s*capsules?/gi,
    /(\d+)\s*tablets?/gi,
    /(\d+)\s*softgels?/gi,
    /(\d+)\s*servings?/gi
  ];
  
  let servings_per_container = null;
  
  for (const pattern of servingPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      servings_per_container = parseInt(match[1]);
      break;
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

// Check if this is a direct purchase link
function isDirectPurchaseLink(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const directIndicators = [
    '/product/',
    '/item/',
    '/p/',
    'thorne.com/',
    'purecaps.com/',
    'nordicnaturals.com/',
    'lifeextension.com/',
    'vitacost.com/',
    'amazon.com/dp/',
    'amazon.com/gp/product/'
  ];
  
  return directIndicators.some(indicator => url.includes(indicator));
}

// Calculate relevance score for retailer results
function calculateRetailerRelevanceScore(result, supplementName, retailer) {
  let score = 0;
  const title = result.title.toLowerCase();
  const supplement = supplementName.toLowerCase();
  
  // Trusted brand bonus
  if (TRUSTED_BRANDS.some(tb => retailer.brand.toLowerCase().includes(tb.toLowerCase()))) {
    score += 4;
  }
  
  // Direct product page bonus
  if (isDirectPurchaseLink(result.link)) {
    score += 3;
  }
  
  // Title relevance
  if (title.includes(supplement)) score += 3;
  
  // Exact match bonus
  if (title === supplement || title.includes(`${supplement} `)) score += 2;
  
  // Contains dosage information
  if (extractProductInfo(result.title, result.snippet || '', supplementName).matches_dosage) {
    score += 2;
  }
  
  // Product page indicators
  if (result.link.includes('/product') || result.link.includes('/item')) score += 1;
  
  return score;
}

// Calculate relevance score for filtering
function calculateRelevanceScore(product, supplementName, brand) {
  let score = 0;
  const title = product.title.toLowerCase();
  const supplement = supplementName.toLowerCase();
  
  // Brand bonus
  if (TRUSTED_BRANDS.some(tb => brand.toLowerCase().includes(tb.toLowerCase()))) {
    score += 3;
  }
  
  // Title relevance
  if (title.includes(supplement)) score += 2;
  
  // Contains "supplement" or "vitamin"
  if (title.includes('supplement') || title.includes('vitamin') || title.includes('capsule')) score += 1;
  
  // Third-party tested bonus
  if (checkThirdPartyTested(title)) score += 1;
  
  // Avoid multi-vitamins for specific supplements (unless it's the supplement we want)
  if (title.includes('multi') && !supplement.includes('multi')) score -= 1;
  
  return score;
}

// Check if product mentions third-party testing
function checkThirdPartyTested(title) {
  if (!title || typeof title !== 'string') {
    return false;
  }
  
  const testingTerms = ['third party tested', '3rd party tested', 'nsf certified', 'usp verified'];
  const titleLower = title.toLowerCase();
  return testingTerms.some(term => titleLower.includes(term));
}

// Check if product mentions GMP certification
function checkGMPCertified(title) {
  if (!title || typeof title !== 'string') {
    return false;
  }
  
  const titleLower = title.toLowerCase();
  return titleLower.includes('gmp') || titleLower.includes('good manufacturing');
}

// Create a base supplements table (acts like a catalog)
async function createSupplementsCatalog() {
  console.log('📝 Creating supplements catalog...');
  
  // Create table if it doesn't exist
  const { error: tableError } = await supabase.rpc('exec', {
    query: `
      CREATE TABLE IF NOT EXISTS supplements_catalog (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplement_name TEXT UNIQUE NOT NULL,
        common_names TEXT[],
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  if (tableError) {
    console.error('Error creating supplements catalog:', tableError);
    return;
  }
  
  // Insert all supplements
  const supplementsToInsert = ALL_SUPPLEMENTS.map(name => ({
    supplement_name: name,
    category: categorizeSupplementByName(name)
  }));
  
  const { error: insertError } = await supabase
    .from('supplements_catalog')
    .upsert(supplementsToInsert, { onConflict: 'supplement_name' });
    
  if (insertError) {
    console.error('Error inserting supplements:', insertError);
  } else {
    console.log(`✅ Created catalog with ${ALL_SUPPLEMENTS.length} supplements`);
  }
}

// Categorize supplements for better organization
function categorizeSupplementByName(name) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('vitamin')) return 'Vitamins';
  if (nameLower.includes('mineral') || nameLower.includes('magnesium') || nameLower.includes('calcium') || nameLower.includes('zinc') || nameLower.includes('iron')) return 'Minerals';
  if (nameLower.includes('omega') || nameLower.includes('fish oil') || nameLower.includes('dha') || nameLower.includes('epa')) return 'Fatty Acids';
  if (nameLower.includes('probiotic') || nameLower.includes('enzyme')) return 'Digestive Health';
  if (nameLower.includes('ashwagandha') || nameLower.includes('rhodiola') || nameLower.includes('ginseng')) return 'Adaptogens';
  if (nameLower.includes('antioxidant') || nameLower.includes('glutathione') || nameLower.includes('nac')) return 'Antioxidants';
  if (nameLower.includes('amino') || nameLower.includes('tyrosine') || nameLower.includes('glycine')) return 'Amino Acids';
  
  return 'Other';
}

// Main function to populate the database
async function populateSupplementDatabase() {
  console.log('🚀 Starting comprehensive supplement database population...');
  console.log(`📊 Total supplements to process: ${ALL_SUPPLEMENTS.length}`);
  
  // Create catalog first
  await createSupplementsCatalog();
  
  let totalProducts = 0;
  let processedSupplements = 0;
  
  // Process each supplement
  for (const supplement of ALL_SUPPLEMENTS) {
    try {
      console.log(`\n🔄 Processing ${processedSupplements + 1}/${ALL_SUPPLEMENTS.length}: ${supplement}`);
      
      // Search for products from trusted brands first
      let allProducts = [];
      
      // Search with top trusted brands
      for (const brand of TRUSTED_BRANDS.slice(0, 5)) { // Top 5 brands
        const products = await searchProducts(supplement, brand);
        allProducts.push(...products);
        
        await sleep(1000); // Rate limiting
      }
      
      // Search without brand specification for more options
      const genericProducts = await searchProducts(supplement);
      allProducts.push(...genericProducts);
      
      // Remove duplicates based on URL
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.product_url === product.product_url)
      );
      
      // Sort by relevance and take top 15
      const topProducts = uniqueProducts
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 15);
      
      console.log(`📦 Found ${topProducts.length} unique products for ${supplement}`);
      
      if (topProducts.length > 0) {
        // For now, we'll create mock recommendations to attach products to
        // In a real scenario, these would be created when generating recommendations for users
        
        // Just store the products in a temporary table for now
        // We'll create the actual links when recommendations are generated
        
        // Create a products table for the catalog
        const { error: productsError } = await supabase.rpc('exec', {
          query: `
            CREATE TABLE IF NOT EXISTS supplement_products (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              supplement_name TEXT NOT NULL,
              product_name TEXT NOT NULL,
              brand TEXT NOT NULL,
              product_url TEXT NOT NULL,
              image_url TEXT,
              price NUMERIC,
              search_query TEXT,
              relevance_score NUMERIC,
              matches_dosage BOOLEAN DEFAULT FALSE,
              third_party_tested BOOLEAN DEFAULT FALSE,
              gmp_certified BOOLEAN DEFAULT FALSE,
              serving_size TEXT,
              servings_per_container INTEGER,
              is_direct_purchase BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Add index for faster lookups
            CREATE INDEX IF NOT EXISTS idx_supplement_products_name 
            ON supplement_products(supplement_name);
            
            CREATE INDEX IF NOT EXISTS idx_supplement_products_relevance 
            ON supplement_products(relevance_score DESC);
          `
        });
        
        if (productsError) {
          console.error('Error creating products table:', productsError);
          continue;
        }
        
        // Insert products for this supplement
        const productsToInsert = topProducts.map(product => ({
          supplement_name: supplement,
          ...product
        }));
        
        const { error: insertError } = await supabase
          .from('supplement_products')
          .insert(productsToInsert);
          
        if (insertError) {
          console.error(`❌ Error inserting products for ${supplement}:`, insertError);
        } else {
          console.log(`✅ Inserted ${topProducts.length} products for ${supplement}`);
          totalProducts += topProducts.length;
        }
      }
      
      processedSupplements++;
      
      // Rate limiting - wait 2 seconds between supplements
      await sleep(2000);
      
    } catch (error) {
      console.error(`❌ Error processing ${supplement}:`, error.message);
      processedSupplements++;
      continue;
    }
  }
  
  console.log('\n🎉 Database population completed!');
  console.log(`📊 Final stats:`);
  console.log(`   - Supplements processed: ${processedSupplements}/${ALL_SUPPLEMENTS.length}`);
  console.log(`   - Total products found: ${totalProducts}`);
  console.log(`   - Average products per supplement: ${(totalProducts / processedSupplements).toFixed(1)}`);
  
  // Now create a function to link products to recommendations
  await createProductLinkingFunction();
}

// Create a function that will be called when recommendations are generated
async function createProductLinkingFunction() {
  console.log('📝 Creating product linking function...');
  
  const { error } = await supabase.rpc('exec', {
    query: `
      CREATE OR REPLACE FUNCTION link_products_to_recommendation(
        rec_id UUID,
        supplement_name_param TEXT
      ) RETURNS VOID AS $$
      BEGIN
        -- Delete existing links for this recommendation
        DELETE FROM product_links WHERE recommendation_id = rec_id;
        
        -- Insert top 5 products for this supplement, prioritizing direct purchase links
        INSERT INTO product_links (
          recommendation_id,
          product_name,
          brand,
          product_url,
          image_url,
          price,
          search_query,
          relevance_score,
          matches_dosage,
          third_party_tested,
          gmp_certified,
          serving_size,
          servings_per_container
        )
        SELECT 
          rec_id,
          sp.product_name,
          sp.brand,
          sp.product_url,
          sp.image_url,
          sp.price,
          sp.search_query,
          sp.relevance_score,
          sp.matches_dosage,
          sp.third_party_tested,
          sp.gmp_certified,
          sp.serving_size,
          sp.servings_per_container
        FROM supplement_products sp
        WHERE LOWER(sp.supplement_name) = LOWER(supplement_name_param)
        ORDER BY 
          sp.is_direct_purchase DESC,  -- Prioritize direct purchase links
          sp.relevance_score DESC, 
          sp.price ASC
        LIMIT 5;
      END;
      $$ LANGUAGE plpgsql;
    `
  });
  
  if (error) {
    console.error('Error creating linking function:', error);
  } else {
    console.log('✅ Product linking function created');
  }
}

// Test with a few supplements first
async function testSearch() {
  console.log('🧪 Testing search functionality...');
  
  const testSupplements = ['Vitamin D3', 'Magnesium Glycinate', 'Omega-3'];
  
  for (const supplement of testSupplements) {
    console.log(`\n🔍 Testing: ${supplement}`);
    const products = await searchProducts(supplement, 'Thorne');
    console.log(`Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log('Sample product:', {
        name: products[0].product_name,
        brand: products[0].brand,
        price: products[0].price,
        score: products[0].relevance_score
      });
    }
    
    await sleep(2000);
  }
}

// Run the script
const isMainModule = process.argv[1].includes('populate_supplement_database.js');

if (isMainModule) {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    testSearch().catch(console.error);
  } else {
    populateSupplementDatabase().catch(console.error);
  }
}

export {
  searchProducts,
  populateSupplementDatabase,
  createProductLinkingFunction
}; 