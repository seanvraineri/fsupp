import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

// CSV data from user - processed supplement products
const csvData = `Vitamin A (Retinyl Palmitate),Thorne,Vitamin A & Reviews,https://www.thorne.com/products/dp/vitamin-a?srsltid=AfmBOori3SAjQ2JKCDjqTBHfQin5HIqJxNuqmlCoJWUCC7KLbR62fGyr,,thorne.com
Vitamin C (Ascorbic Acid),Thorne,Ascorbic Acid & Reviews,https://www.thorne.com/products/dp/ascorbic-acid?srsltid=AfmBOoq-D7yEOcyrANtYdMbBwC2RzYzl9dGQA9_Q0dQ5-hz8f21KRvG4,,thorne.com
Vitamin C (Ascorbic Acid),Pure Encapsulations,Vitamin C chewables,https://www.pureencapsulations.com/media/pdf_upload/20_09_PE_ProductOnePager_VitaminCChew_FIN_REV4_NP_np.pdf,,pureencapsulations.com
Vitamin D3 (Cholecalciferol),Thorne,Vitamin D-5000 - NSF Certified for Sport & Reviews,https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule?srsltid=AfmBOopKHNcdHIpmYnKckRYd5U8ML8zdkMS8W8-FzdJritjGkP-VCQNN,,thorne.com
Vitamin K2 (MK-7),Thorne,Vitamin K & Reviews,https://www.thorne.com/products/dp/3-k-complete?srsltid=AfmBOoo2Pl9QA6oP8GGTOBSwX1-Spxzjb8KX_AXhZGDpAL815qRG9sT4,,thorne.com
Vitamin E (Mixed Tocopherols),Thorne,Ultimate-E® & Reviews,https://www.thorne.com/products/dp/ultimate-e-reg?srsltid=AfmBOopiBYgbDzch5QMx4aEa6r1Y-9iYXmcQjoJ-V_NybqklNfm4XzBk,,thorne.com
Riboflavin-5′-Phosphate (B2),Thorne,Riboflavin 5'-Phosphate & Reviews,https://www.thorne.com/products/dp/riboflavin-5-phosphate?srsltid=AfmBOorMxiw_zd1kvll4z1NJEjzcJ2E0YC8MIZ2_HblSY4apjqRxMgG6,,thorne.com
Niacinamide (B3),Thorne,Niacinamide & Reviews,https://www.thorne.com/products/dp/niacinamide?srsltid=AfmBOoq8RvuxrSHbHTO-Tsaq4eVIqhZivwlmbkhG5BI3XcM0TXSroLb_,,thorne.com
Pantethine (B5),Thorne,Pantethine & Reviews,https://www.thorne.com/products/dp/pantethine?srsltid=AfmBOorI3uutGsPWswu-O11vHGUtNTfBtlJn-QOv20Ku12FXIets2vMS,,thorne.com
Pyridoxal-5′-Phosphate (B6),Thorne,Pyridoxal 5'-Phosphate & Reviews,https://www.thorne.com/products/dp/pyridoxal-5-phosphate-60-s-1?srsltid=AfmBOooTkbmzwGl72l4gVNfZPCYX0F8lfS1yRBNjeJx4U1qNsdGn1pqn,,thorne.com
Biotin (B7),Thorne,Biotin & Reviews,https://www.thorne.com/products/dp/biotin-8?srsltid=AfmBOor-yUStXt_Lb4cjQNLIYQpI7qfhwPDuNWcfpjPTpSa-UHTqZNqC,,thorne.com
5-MTHF (Methylfolate B9),Thorne,5-MTHF 5 mg & Reviews,https://www.thorne.com/products/dp/5-mthf-5-mg?srsltid=AfmBOoq5qEXp9l6UMzeuYXZnhvGFZLgeSl3U8TI5RC_krSILeK43jCgW,,thorne.com
5-MTHF (Methylfolate B9),Thorne,5-MTHF 1 mg & Reviews,https://www.thorne.com/products/dp/5-mthf-1-mg?srsltid=AfmBOooi6r1r-2YCeAy8gw6bZTkeTsvgvZLP_mJG_HH1SLo70oKNqey3,,thorne.com
Methylcobalamin (B12),Thorne,Vitamin B12 & Reviews,https://www.thorne.com/products/dp/methylcobalamin?srsltid=AfmBOopdXsDUc7Iybd-5JOB08S_xamt7O4mHagEzgScHb-UBMckuMQ1q,,thorne.com
Calcium Citrate,Thorne,Cal-Mag Citrate + Vitamin C & Reviews,https://www.thorne.com/products/dp/cal-mag-citrate-effervescent-powder?srsltid=AfmBOoolu7UNGSUIKX70DJG6I3k2cGxyWv5J6ZAWA6n1C8u9LhVQ-Lle,,thorne.com
Magnesium Bisglycinate,Thorne,Magnesium Bisglycinate & Reviews,https://www.thorne.com/products/dp/magnesium-bisglycinate?srsltid=AfmBOooRO5CvEYOnf7YuZB_3V_HpsV2x8T7lSr1yZFE3igQznz0lKwWX,,thorne.com
Zinc Picolinate,Thorne,Zinc Picolinate 30 mg (180 count) & Reviews,https://www.thorne.com/products/dp/double-strength-zinc-picolinate-60-s-1?srsltid=AfmBOophlAzOWHSQdFlUGe_8Hht3g5_CaaVf7PEUWnUY2Q_ziAbSVHnw,,thorne.com
Iron,Thorne,Iron Bisglycinate & Reviews,https://www.thorne.com/products/dp/iron-bisglycinate?srsltid=AfmBOorKHNcdHIpmYnKckRYd5U8ML8zdkMS8W8-FzdJritjGkP-VCQNN,,thorne.com
Selenium Methionine,Thorne,Selenium & Reviews,https://www.thorne.com/products/dp/selenomethionine?srsltid=AfmBOoqoD9A5XspbNY_fPArX3DpX70nQAilOjzzNOjrzuo3xwjOehSnK,,thorne.com
Fish-Oil (EPA/DHA),Thorne,Super EPA - NSF Certified for Sport & Reviews,https://www.thorne.com/products/dp/super-epa?srsltid=AfmBOophj_tJfSlCeETa-c3AcTwjTqs_pW0Tjv0fe0YWRReRBBu28Vv1,,thorne.com
Fish-Oil (EPA/DHA),Pure Encapsulations,PureNutrients EPA/DHA Gummy,https://www.pureencapsulations.com/media/pdf_upload/20_08_PE_ProductOnePager_PureNutrientsEPADHASoftChew_FIN.pdf,,pureencapsulations.com
Omega-3 (EPA/DHA),Nordic Naturals,Ultimate Omega,https://www.nordicnaturals.com/products/ultimate-omega,,nordicnaturals.com
Alpha-Lipoic Acid,Thorne,Alpha-Lipoic Acid & Reviews,https://www.thorne.com/products/dp/thiocid-300-reg?srsltid=AfmBOooKa_IvcJwNJeAAVCeIr-yKG5NU7QOFAecNXqAAh1KLdbvIvd-S,,thorne.com
CoQ10 (Ubiquinone),Thorne,CoQ10 & Reviews,https://www.thorne.com/products/dp/q-best-100?srsltid=AfmBOoovLwPh9Z9fFeffWpBSh2PhxHDIX_D0AfnGULRwWyZ-Xk6jyo2d,,thorne.com
Resveratrol,Thorne,PolyResveratrol-SR® & Reviews,https://www.thorne.com/products/dp/polyresveratrol-sr-reg?srsltid=AfmBOoryIrgWqrcEXp7Cjkv5huhT4ymBTJGF6itaYafJuPlZqXUsNXQU,,thorne.com
Meriva-SF (Curcumin Phytosome),Thorne,Curcumin Phytosome - Sustained Release & Reviews,https://www.thorne.com/products/dp/meriva-sf?srsltid=AfmBOop-DpPIj6Lo7Cn_NkMsAue9q2UqN9S8EXynwLcE9PErnXIamVR4,,thorne.com
Quercetin Phytosome,Thorne,Quercetin Phytosome & Reviews,https://www.thorne.com/products/dp/quercetin-phytosome?srsltid=AfmBOorXySZYaBaoCTWVzHHfwPO9V6brpj1t3KybzutrpEePJvH5wnX5,,thorne.com
Sulforaphane,Thorne,Broccoli Seed Extract (formerly Crucera-SGS) & Reviews,https://www.thorne.com/products/dp/crucera-sgs?srsltid=AfmBOoprlL2Adwr1EJcvXmnjpvuWOvsWVZ5NDp8ibt--xQx335pNii4L,,thorne.com
Glutathione (reduced),Thorne,Glutathione-SR & Reviews,https://www.thorne.com/products/dp/glutathione-sr?srsltid=AfmBOoqJfD7vMPKQa_nkGQh06VqHlrVc5MHE5zZKBUCiaM7_6sLyazBr,,thorne.com
N-Acetyl-Cysteine (NAC),Thorne,NAC - N-Acetylcysteine & Reviews,https://www.thorne.com/products/dp/cysteplus-reg?srsltid=AfmBOoqFNZ4N2KHtPgrvOVsctY7hk3sJFWSYgQRlBkeX34G4KlttvyzI,,thorne.com
Ashwagandha (KSM-66),Thorne,Ashwagandha,https://www.thorne.com/ingredients/ashwagandha?srsltid=AfmBOor_VamcRc9URsU-uu8GGWQIE-2FQb6wLe-n44nCVkW98sY604Cj,,thorne.com
Rhodiola rosea,Thorne,Rhodiola & Reviews,https://www.thorne.com/products/dp/rhodiola?srsltid=AfmBOookQtCIew2nS_ILrN_fDttTuKMICbHQZ8pn9Wps_dv1ukttw0cv,,thorne.com
Lion's Mane Mushroom,Thorne,Lion's Mane Mushroom Supplements & Reviews,https://www.thorne.com/products/by-ingredient/lion%E2%80%99s-mane-mushroom?srsltid=AfmBOook7CeGUDbTPx6oQTx6latT_6lyRIJEsLZxqfKc4TEPBdT8KCtu,,thorne.com
L-Theanine,Thorne,Theanine & Reviews,https://www.thorne.com/products/dp/theanine?srsltid=AfmBOopLt7T5xduQSw4umBSIHjz2HC27QqsOFT6v8WmPqaOPdlFhnAZO,,thorne.com
L-Tyrosine,Thorne,L-Tyrosine & Reviews,https://www.thorne.com/products/dp/l-tyrosine?srsltid=AfmBOoqwRzdx4iHvszlS3X9RAYMumh0AKvsBy7LpOxGrHkmayGgj6IXd,,thorne.com
Melatonin 0.3 mg,Thorne,Melaton-3™ & Reviews,https://www.thorne.com/products/dp/melaton-3-trade?srsltid=AfmBOopX3diL9i-EL3Ct9Vg1hdymN-Ty8Z_AGwQ3Gxf_nuVS-Ad3TNjs,,thorne.com
Multi-Strain Probiotic (50 B CFU),Thorne,Thorne Probiotics,https://www.thorne.com/products/set/probiotics?srsltid=AfmBOoqa4JP7m35Pr6FziCIO8Gznj8SJ9blmrKc63UBVWGgntytEkXEM,,thorne.com
Betaine HCl & Pepsin,Thorne,Betaine HCL & Pepsin & Reviews,https://www.thorne.com/products/dp/betaine-hcl-pepsin-225-s?srsltid=AfmBOool4kmwC-RBTX3RYCkPoNm7BAOb_1c17KLdw6HPIHiyweOaJWo1,,thorne.com
L-Methylfolate,Thorne,5-MTHF 1 mg & Reviews,https://www.thorne.com/products/dp/5-mthf-1-mg?srsltid=AfmBOooi6r1r-2YCeAy8gw6bZTkeTsvgvZLP_mJG_HH1SLo70oKNqey3,,thorne.com
Methylcobalamin,Thorne,Methylcobalamin & Reviews,https://www.thorne.com/products/dp/methylcobalamin?srsltid=AfmBOopdXsDUc7Iybd-5JOB08S_xamt7O4mHagEzgScHb-UBMckuMQ1q,,thorne.com
Vitamin D3,Thorne,Vitamin D-1000,https://www.thorne.com/products/dp/d-1000-vitamin-d-capsule,,thorne.com
Vitamin D3,Thorne,Vitamin D-5000,https://www.thorne.com/products/dp/d-5-000-vitamin-d-capsule,,thorne.com
Magnesium Glycinate,Thorne,Magnesium Bisglycinate,https://www.thorne.com/products/dp/magnesium-bisglycinate,,thorne.com
Vitamin B Complex,Thorne,Basic B Complex,https://www.thorne.com/products/dp/basic-b-complex,,thorne.com
Vitamin C,Pure Encapsulations,Vitamin C (ascorbic acid),https://www.pureencapsulations.com/products/vitamin-c-ascorbic-acid,,pureencapsulations.com
Zinc,Pure Encapsulations,Zinc (picolinate),https://www.pureencapsulations.com/products/zinc-picolinate,,pureencapsulations.com
Probiotics,Pure Encapsulations,Probiotic-5,https://www.pureencapsulations.com/products/probiotic-5,,pureencapsulations.com
Curcumin,Pure Encapsulations,Curcumin 500 with Bioperine,https://www.pureencapsulations.com/products/curcumin-500-with-bioperine,,pureencapsulations.com
Quercetin,Pure Encapsulations,Quercetin,https://www.pureencapsulations.com/products/quercetin,,pureencapsulations.com`;

// Function to parse CSV data and extract supplement info
function parseCSVData(csvString) {
  const lines = csvString.trim().split('\n');
  const products = [];
  
  for (const line of lines) {
    // Split on commas, but handle commas within quoted strings
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim()); // Add the last part
    
    if (parts.length >= 4) {
      const [supplement_name, brand, product_name, product_url, price, source] = parts;
      
      // Clean and validate data
      if (supplement_name && brand && product_url && product_url.startsWith('http')) {
        products.push({
          supplement_name: cleanSupplementName(supplement_name),
          brand: brand.trim(),
          product_name: cleanProductName(product_name || `${brand} ${supplement_name}`),
          product_url: product_url.trim(),
          price: parsePrice(price),
          search_query: `${supplement_name} ${brand}`,
          relevance_score: 10, // High score for manually curated products
          matches_dosage: true,
          third_party_tested: isThirdPartyTested(brand),
          gmp_certified: isGMPCertified(brand),
          serving_size: extractServingFromName(product_name),
          servings_per_container: null,
          is_direct_purchase: true,
          image_url: null
        });
      }
    }
  }
  
  return products;
}

// Helper functions
function cleanSupplementName(name) {
  return name.replace(/[()]/g, '').trim();
}

function cleanProductName(name) {
  return name
    .replace(/\s*&\s*Reviews?/gi, '')
    .replace(/\s*-\s*Reviews?/gi, '')
    .replace(/\|\s*.*$/, '')
    .trim();
}

function parsePrice(priceStr) {
  if (!priceStr || priceStr.trim() === '') return null;
  const match = priceStr.match(/(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : null;
}

function isThirdPartyTested(brand) {
  const testingBrands = ['Thorne', 'Pure Encapsulations', 'Nordic Naturals'];
  return testingBrands.includes(brand);
}

function isGMPCertified(brand) {
  const gmpBrands = ['Thorne', 'Pure Encapsulations', 'Nordic Naturals', 'Designs for Health'];
  return gmpBrands.includes(brand);
}

function extractServingFromName(productName) {
  const dosagePatterns = [
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*(mg|mcg|µg|ug|g|iu|international\s+units?)\b/gi,
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*milligrams?\b/gi,
    /(\d+(?:,\d+)?(?:\.\d+)?)\s*micrograms?\b/gi
  ];
  
  for (const pattern of dosagePatterns) {
    const match = productName.match(pattern);
    if (match) {
      return match[0].replace(',', '');
    }
  }
  
  return null;
}

// Add some verified pricing for known products
function addKnownPricing(products) {
  const knownPrices = {
    'Thorne Vitamin D-1000': 18.00,
    'Thorne Vitamin D-5000': 23.00,
    'Thorne Magnesium Bisglycinate': 25.00,
    'Thorne 5-MTHF 1 mg': 18.00,
    'Thorne Methylcobalamin': 19.00,
    'Nordic Naturals Ultimate Omega': 32.95,
    'Thorne Super EPA': 39.00,
    'Thorne NAC': 28.00,
    'Thorne Quercetin Phytosome': 32.00,
    'Thorne Ashwagandha': 25.00,
    'Thorne L-Theanine': 24.00,
    'Thorne Rhodiola': 26.00,
    'Pure Encapsulations Vitamin C': 19.95,
    'Pure Encapsulations Zinc': 15.95,
    'Pure Encapsulations Probiotic-5': 34.95,
    'Pure Encapsulations Curcumin 500': 41.95,
    'Pure Encapsulations Quercetin': 28.95
  };
  
  return products.map(product => {
    const key = `${product.brand} ${product.product_name.split(' &')[0].split(' -')[0].trim()}`;
    if (knownPrices[key] && !product.price) {
      product.price = knownPrices[key];
    }
    return product;
  });
}

// Main function to load existing products
async function loadExistingProducts() {
  console.log('🚀 Loading existing supplement products into database...');
  
  try {
    // Parse CSV data
    console.log('📊 Parsing product data...');
    let products = parseCSVData(csvData);
    
    // Add known pricing
    products = addKnownPricing(products);
    
    console.log(`✅ Parsed ${products.length} products`);
    
    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await supabase
      .from('supplement_products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert products in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('supplement_products')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        inserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} products`);
      }
    }
    
    console.log(`\n🎉 Successfully loaded ${inserted} products!`);
    
    // Test database queries
    console.log('\n🧪 Testing product queries...');
    
    const testSupplements = ['Vitamin D3', 'Magnesium Glycinate', 'Omega-3 (EPA/DHA)', 'L-Methylfolate', 'NAC'];
    
    for (const supplement of testSupplements) {
      const { data, error } = await supabase
        .from('supplement_products')
        .select('*')
        .ilike('supplement_name', `%${supplement}%`)
        .order('relevance_score', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        console.log(`\n📦 ${supplement}: ${data.length} products found`);
        data.forEach((product, i) => {
          const priceStr = product.price ? `$${product.price}` : 'Price TBD';
          console.log(`   ${i+1}. ${product.brand} - ${priceStr} - ${product.product_url}`);
        });
      }
    }
    
    // Get statistics
    const { data: stats } = await supabase
      .from('supplement_products')
      .select('brand, supplement_name')
      .order('brand');
    
    if (stats) {
      const brandCounts = {};
      const supplementCounts = {};
      
      stats.forEach(item => {
        brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
        supplementCounts[item.supplement_name] = (supplementCounts[item.supplement_name] || 0) + 1;
      });
      
      console.log('\n📊 Database Statistics:');
      console.log('Brands:', Object.keys(brandCounts).length);
      console.log('Unique supplements:', Object.keys(supplementCounts).length);
      console.log('Top brands by product count:');
      
      Object.entries(brandCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([brand, count]) => {
          console.log(`   ${brand}: ${count} products`);
        });
    }
    
    console.log('\n📱 Database is ready for recommendations system!');
    console.log('✨ Products will now automatically appear in supplement recommendations');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
if (process.argv[1].includes('load_existing_products.js')) {
  loadExistingProducts().catch(console.error);
}

export { loadExistingProducts }; 