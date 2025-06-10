import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Initialize OpenAI (optional - will use fallback if not available)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface SupplementProduct {
  supplement: string;
  brand: string;
  title: string;
  url: string;
  price: string;
  source: string;
}

// Cache for parsed CSV data
let supplementProductsCache: SupplementProduct[] | null = null;

// Load and parse the supplement products CSV
async function loadSupplementProducts(): Promise<SupplementProduct[]> {
  if (supplementProductsCache) {
    return supplementProductsCache;
  }

  try {
    // Try different possible paths for the CSV file
    const possiblePaths = [
      path.join(process.cwd(), 'apps', 'web', 'utils', 'supplement_products.csv'),
      path.join(process.cwd(), 'utils', 'supplement_products.csv'),
      path.join(process.cwd(), '..', '..', 'utils', 'supplement_products.csv'),
    ];
    
    let csvPath = '';
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        csvPath = testPath;
        break;
      }
    }
    console.log(`📂 Looking for CSV at path: ${csvPath}`);
    console.log(`📂 Current working directory: ${process.cwd()}`);
    
    if (!csvPath) {
      console.error('❌ CSV file not found in any of the expected locations');
      return [];
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.trim().split('\n');
    
    const products: SupplementProduct[] = lines.slice(1).map(line => {
      // Handle CSV parsing with quoted fields
      const regex = /("([^"]*)"|([^",]+))/g;
      const values: string[] = [];
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        values.push(match[2] || match[3] || '');
      }
      
      return {
        supplement: values[0] || '',
        brand: values[1] || '',
        title: values[2] || '',
        url: values[3] || '',
        price: values[4] || '',
        source: values[5] || '',
      };
    });

    supplementProductsCache = products;
    console.log(`📦 Loaded ${products.length} supplement products from CSV`);
    return products;
  } catch (error) {
    console.error('Error loading supplement products CSV:', error);
    return [];
  }
}

// Use AI to find the best matching supplement
async function findBestSupplementMatch(requestedSupplement: string): Promise<SupplementProduct | null> {
  try {
    console.log(`🔍 Finding AI match for: ${requestedSupplement}`);
    
    const products = await loadSupplementProducts();
    if (products.length === 0) {
      console.warn('No supplement products loaded from CSV');
      return null;
    }

    // If OpenAI is not available, skip AI matching
    if (!openai) {
      console.log('🤖 OpenAI not available, skipping AI matching');
      return null;
    }

    // Get unique supplement names for AI matching
    const uniqueSupplements = [...new Set(products.map(p => p.supplement))];
    
    // Use OpenAI to find the best semantic match
    const prompt = `You are a supplement matching expert. Find the best matching supplement from the provided list for the requested supplement.

Requested supplement: "${requestedSupplement}"

Available supplements:
${uniqueSupplements.slice(0, 50).map((s, i) => `${i + 1}. ${s}`).join('\n')}

Instructions:
- Look for exact matches first
- Consider different forms (e.g., "Magnesium Glycinate" matches "Magnesium Bisglycinate") 
- Consider alternative names (e.g., "5-MTHF" matches "Methylfolate")
- Consider broader categories (e.g., "Omega-3" matches "Fish-Oil (EPA/DHA)")
- Return ONLY the number (1-${Math.min(50, uniqueSupplements.length)}) of the best match
- If no reasonable match exists, return "0"

Best match number:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });

    const matchNumber = parseInt(response.choices[0]?.message?.content?.trim() || '0');
    
    if (matchNumber > 0 && matchNumber <= Math.min(50, uniqueSupplements.length)) {
      const matchedSupplement = uniqueSupplements[matchNumber - 1];
      
      // Find the best product for this supplement (prefer Thorne, then Pure Encapsulations)
      const matchingProducts = products.filter(p => p.supplement === matchedSupplement);
      
      const bestProduct = matchingProducts.find(p => p.brand === 'Thorne') ||
                         matchingProducts.find(p => p.brand === 'Pure Encapsulations') ||
                         matchingProducts.find(p => p.brand === 'Designs for Health') ||
                         matchingProducts[0];

      console.log(`✅ AI found match: ${requestedSupplement} → ${matchedSupplement} (${bestProduct?.brand})`);
      return bestProduct;
    }

    console.log(`❌ No AI match found for: ${requestedSupplement}`);
    return null;
    
  } catch (error) {
    console.error('Error in AI supplement matching:', error);
    return null;
  }
}

// Enhanced fallback keyword matching with smart mapping
function findFallbackMatch(requestedSupplement: string, products: SupplementProduct[]): SupplementProduct | null {
  const normalizedRequest = requestedSupplement.toLowerCase();
  
  // Smart supplement mapping for common variations
  const supplementMappings: { [key: string]: string[] } = {
    'vitamin d3': ['Vitamin D3 (Cholecalciferol)', 'Vitamin D3'],
    'vitamin d': ['Vitamin D3 (Cholecalciferol)', 'Vitamin D3'],
    'cholecalciferol': ['Vitamin D3 (Cholecalciferol)'],
    'omega-3': ['Fish-Oil (EPA/DHA)', 'Algae Oil (Vegan Ω-3)'],
    'omega 3': ['Fish-Oil (EPA/DHA)', 'Algae Oil (Vegan Ω-3)'],
    'fish oil': ['Fish-Oil (EPA/DHA)'],
    'epa dha': ['Fish-Oil (EPA/DHA)'],
    'methylfolate': ['5-MTHF (Methylfolate, B9)'],
    'l-methylfolate': ['5-MTHF (Methylfolate, B9)'],
    '5-mthf': ['5-MTHF (Methylfolate, B9)'],
    'magnesium glycinate': ['Magnesium Bisglycinate'],
    'magnesium bisglycinate': ['Magnesium Bisglycinate'],
    'b12': ['Methylcobalamin (B12)'],
    'methylcobalamin': ['Methylcobalamin (B12)'],
    'vitamin b12': ['Methylcobalamin (B12)'],
    'niacin': ['Niacinamide (B3)'],
    'vitamin b3': ['Niacinamide (B3)'],
    'niacinamide': ['Niacinamide (B3)'],
    'zinc': ['Zinc Picolinate'],
    'vitamin c': ['Vitamin C (Ascorbic Acid)', 'Liposomal Vitamin C'],
    'ascorbic acid': ['Vitamin C (Ascorbic Acid)'],
    'vitamin k2': ['Vitamin K2 (MK-7)'],
    'k2': ['Vitamin K2 (MK-7)'],
    'curcumin': ['Meriva-SF (Curcumin Phytosome)'],
    'turmeric': ['Meriva-SF (Curcumin Phytosome)'],
    'quercetin': ['Quercetin Phytosome'],
    'coq10': ['CoQ10 (Ubiquinone)', 'Ubiquinol'],
    'ubiquinol': ['Ubiquinol'],
    'ubiquinone': ['CoQ10 (Ubiquinone)'],
  };

  // Try direct mapping first
  const mappedSupplements = supplementMappings[normalizedRequest];
  if (mappedSupplements) {
    for (const mapped of mappedSupplements) {
      const exactMatch = products.find(p => p.supplement === mapped);
      if (exactMatch) {
        console.log(`✅ Direct mapping: ${requestedSupplement} → ${mapped} (${exactMatch.brand})`);
        // Prefer Thorne, then Pure Encapsulations for mapped matches
        const matches = products.filter(p => p.supplement === mapped);
        return matches.find(p => p.brand === 'Thorne') ||
               matches.find(p => p.brand === 'Pure Encapsulations') ||
               exactMatch;
      }
    }
  }

  // Enhanced keyword matching as fallback
  const keywordMatches = products.filter(p => {
    const normalizedProduct = p.supplement.toLowerCase();
    
    // Extract key terms from both
    const requestWords = normalizedRequest.split(/[\s\-\(\)]+/).filter(w => w.length > 2);
    const productWords = normalizedProduct.split(/[\s\-\(\)]+/).filter(w => w.length > 2);
    
    // Count matching words with better scoring
    let score = 0;
    for (const rw of requestWords) {
      for (const pw of productWords) {
        if (pw.includes(rw) || rw.includes(pw)) {
          score += rw.length > 4 ? 2 : 1; // Longer words get higher score
        }
        if (pw === rw) {
          score += 3; // Exact word matches get highest score
        }
      }
    }
    
    return score >= 2; // Require better matching threshold
  });

  // Sort by relevance and brand preference
  const sortedMatches = keywordMatches.sort((a, b) => {
    const aScore = (a.brand === 'Thorne' ? 10 : 0) + 
                   (a.brand === 'Pure Encapsulations' ? 5 : 0);
    const bScore = (b.brand === 'Thorne' ? 10 : 0) + 
                   (b.brand === 'Pure Encapsulations' ? 5 : 0);
    return bScore - aScore;
  });

  const bestMatch = sortedMatches[0] || null;

  if (bestMatch) {
    console.log(`✅ Enhanced fallback found match: ${requestedSupplement} → ${bestMatch.supplement} (${bestMatch.brand})`);
  }

  return bestMatch;
}

export async function POST(request: NextRequest) {
  try {
    const { supplementName } = await request.json();
    
    if (!supplementName) {
      return NextResponse.json({ error: 'Supplement name is required' }, { status: 400 });
    }

    console.log(`🔍 Matching supplement: ${supplementName}`);

    // Try AI matching first
    let match = await findBestSupplementMatch(supplementName);
    
    // If AI matching fails, try fallback keyword matching
    if (!match) {
      const products = await loadSupplementProducts();
      match = findFallbackMatch(supplementName, products);
    }
    
    if (match) {
      return NextResponse.json({
        success: true,
        match: {
          url: match.url,
          brand: match.brand,
          productName: match.title || match.supplement,
          price: match.price || undefined,
          supplement: match.supplement,
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'No matching supplement found'
    });
    
  } catch (error) {
    console.error('Error in supplement matching API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 