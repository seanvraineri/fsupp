import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test supplement recommendations that the system might generate
const testRecommendations = [
  {
    supplement_name: 'Vitamin D3',
    dosage: '1000-5000 IU',
    reason: 'Based on your health assessment, vitamin D supplementation may support bone health'
  },
  {
    supplement_name: 'Magnesium Glycinate', 
    dosage: '200-400 mg',
    reason: 'May help with sleep quality and muscle relaxation'
  },
  {
    supplement_name: 'L-Methylfolate',
    dosage: '1-5 mg',
    reason: 'Based on genetic variants, methylated folate may be better absorbed'
  },
  {
    supplement_name: 'Omega-3 (EPA/DHA)',
    dosage: '1000-2000 mg',
    reason: 'May support cardiovascular and brain health'
  },
  {
    supplement_name: 'NAC',
    dosage: '600-900 mg', 
    reason: 'May support antioxidant pathways and liver detoxification'
  }
];

// Function to find products for a supplement with improved matching
async function findProductsForSupplement(supplementName) {
  console.log(`🔍 Searching products for: ${supplementName}`);
  
  try {
    // Normalize the supplement name for better matching
    const normalizedSupplement = normalizeSupplementName(supplementName);
    
    // Try exact match first
    let { data: products, error } = await supabase
      .from('supplement_products')
      .select('*')
      .eq('supplement_name', supplementName)
      .order('relevance_score', { ascending: false })
      .limit(3);
    
    // If no exact match, try normalized name
    if (!products || products.length === 0) {
      const { data: normalizedProducts, error: normalizedError } = await supabase
        .from('supplement_products')
        .select('*')
        .eq('supplement_name', normalizedSupplement)
        .order('relevance_score', { ascending: false })
        .limit(3);
      
      products = normalizedProducts;
      error = normalizedError;
    }
    
    // If still no match, try fuzzy matching with multiple variations
    if (!products || products.length === 0) {
      const searchVariations = generateSearchVariations(supplementName);
      
      for (const variation of searchVariations) {
        const { data: fuzzyProducts, error: fuzzyError } = await supabase
          .from('supplement_products')
          .select('*')
          .ilike('supplement_name', `%${variation}%`)
          .order('relevance_score', { ascending: false })
          .limit(3);
        
        if (fuzzyProducts && fuzzyProducts.length > 0) {
          products = fuzzyProducts;
          error = fuzzyError;
          console.log(`   ✨ Found match using variation: "${variation}"`);
          break;
        }
      }
    }
    
    if (error) {
      console.error(`❌ Error searching for ${supplementName}:`, error);
      return [];
    }
    
    return products || [];
    
  } catch (error) {
    console.error(`❌ Unexpected error searching for ${supplementName}:`, error);
    return [];
  }
}

// Helper function to normalize supplement names
function normalizeSupplementName(name) {
  return name
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Generate search variations for better matching
function generateSearchVariations(supplementName) {
  const variations = new Set();
  
  // Original name
  variations.add(supplementName);
  
  // Remove parentheses and brackets
  variations.add(supplementName.replace(/[()[\]]/g, ''));
  
  // Replace parentheses with spaces
  variations.add(supplementName.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim());
  
  // Common variations for omega-3
  if (supplementName.toLowerCase().includes('omega-3')) {
    variations.add('Omega-3 EPA/DHA');
    variations.add('Fish-Oil EPA/DHA');
    variations.add('Omega-3');
    variations.add('Fish Oil');
  }
  
  // Common variations for magnesium
  if (supplementName.toLowerCase().includes('magnesium')) {
    if (supplementName.toLowerCase().includes('glycinate')) {
      variations.add('Magnesium Bisglycinate');
      variations.add('Magnesium Glycinate');
    }
  }
  
  // Common variations for methylfolate
  if (supplementName.toLowerCase().includes('methylfolate') || supplementName.toLowerCase().includes('mthf')) {
    variations.add('5-MTHF');
    variations.add('L-Methylfolate');
    variations.add('Methylfolate');
  }
  
  // Common variations for B vitamins
  if (supplementName.toLowerCase().includes('b12')) {
    variations.add('Methylcobalamin');
    variations.add('B12');
    variations.add('Vitamin B12');
  }
  
  // Common variations for vitamin D
  if (supplementName.toLowerCase().includes('vitamin d')) {
    variations.add('Vitamin D3');
    variations.add('Vitamin D');
    variations.add('Cholecalciferol');
  }
  
  // Extract key words for partial matching
  const words = supplementName.split(/[\s\-()]+/).filter(word => word.length > 2);
  words.forEach(word => variations.add(word));
  
  return Array.from(variations);
}

// Test product linking for recommendations
async function testProductLinking() {
  console.log('🧪 Testing Product Linking for Recommendations\n');
  
  for (const recommendation of testRecommendations) {
    const products = await findProductsForSupplement(recommendation.supplement_name);
    
    console.log(`📦 ${recommendation.supplement_name} (${recommendation.dosage})`);
    console.log(`   Reason: ${recommendation.reason}`);
    
    if (products.length > 0) {
      console.log(`   ✅ Found ${products.length} products:`);
      products.forEach((product, i) => {
        const priceDisplay = product.price ? `$${product.price}` : 'Price TBD';
        const brandDisplay = `Buy from ${product.brand}`;
        console.log(`      ${i+1}. ${brandDisplay} ${priceDisplay}`);
        console.log(`         📧 ${product.product_name}`);
        console.log(`         🔗 ${product.product_url}`);
      });
    } else {
      console.log(`   ❌ No products found - would show generic search fallback`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test summary
  console.log('\n📊 Product Linking Summary:');
  
  let totalRecommendations = testRecommendations.length;
  let linkedRecommendations = 0;
  let totalProducts = 0;
  
  for (const recommendation of testRecommendations) {
    const products = await findProductsForSupplement(recommendation.supplement_name);
    if (products.length > 0) {
      linkedRecommendations++;
      totalProducts += products.length;
    }
  }
  
  console.log(`✅ Recommendations with products: ${linkedRecommendations}/${totalRecommendations}`);
  console.log(`📦 Total products found: ${totalProducts}`);
  console.log(`🎯 Success rate: ${Math.round((linkedRecommendations/totalRecommendations) * 100)}%`);
  
  if (linkedRecommendations === totalRecommendations) {
    console.log('\n🎉 Perfect! All recommendations can be linked to real products');
    console.log('💡 Users will see "Buy from [Brand] $XX.XX" buttons instead of generic search');
  } else {
    console.log('\n⚠️  Some recommendations need more product coverage');
    console.log('💡 Consider adding more products for missing supplements');
  }
}

// Run the test
if (process.argv[1].includes('test_product_linking.js')) {
  testProductLinking().catch(console.error);
}

export { testProductLinking }; 