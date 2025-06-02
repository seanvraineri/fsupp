#!/usr/bin/env python3
"""
Convert supplement_products.json to TypeScript fallback data
"""
import json
import sys

def json_to_ts(input_file='supplement_products.json', output_file='../supabase/functions/product_search/supplement_products_fallback.ts'):
    """Convert JSON supplement data to TypeScript"""
    
    try:
        with open(input_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Run the supplement search first.")
        return False
    
    # Start building the TypeScript file
    ts_content = """// This file is auto-generated from supplement_products.json
// Generated from supplement-brand-searcher-simple.py
export const SUPPLEMENT_PRODUCTS_FALLBACK: Record<string, Array<{
  supplement: string;
  brand: string;
  title: string;
  url: string;
  price?: string;
  source?: string;
  domain?: string;
  snippet?: string;
  image?: string;
}>> = {
"""
    
    # Convert each supplement's products
    for supplement, products in data.items():
        # Escape the supplement name for TypeScript
        escaped_supplement = supplement.replace('"', '\\"')
        ts_content += f'  "{escaped_supplement}": [\n'
        
        for product in products:
            ts_content += '    {\n'
            for key, value in product.items():
                if value:  # Only include non-empty values
                    # Escape string values
                    if isinstance(value, str):
                        escaped_value = value.replace('"', '\\"').replace('\n', '\\n')
                        ts_content += f'      {key}: "{escaped_value}",\n'
                    else:
                        ts_content += f'      {key}: {json.dumps(value)},\n'
            ts_content += '    },\n'
        
        ts_content += '  ],\n'
    
    ts_content += """};\n
// Helper function to find products for a supplement
export function findSupplementProducts(supplementName: string): Array<any> {
  // Try exact match first
  if (SUPPLEMENT_PRODUCTS_FALLBACK[supplementName]) {
    return SUPPLEMENT_PRODUCTS_FALLBACK[supplementName];
  }
  
  // Try case-insensitive match
  const lowerName = supplementName.toLowerCase();
  for (const [key, products] of Object.entries(SUPPLEMENT_PRODUCTS_FALLBACK)) {
    if (key.toLowerCase() === lowerName) {
      return products;
    }
  }
  
  // Try partial match
  for (const [key, products] of Object.entries(SUPPLEMENT_PRODUCTS_FALLBACK)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return products;
    }
  }
  
  return [];
}"""
    
    # Write the TypeScript file
    with open(output_file, 'w') as f:
        f.write(ts_content)
    
    print(f"Successfully converted {input_file} to {output_file}")
    print(f"Total supplements: {len(data)}")
    print(f"Total products: {sum(len(products) for products in data.values())}")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        json_to_ts(sys.argv[1])
    else:
        json_to_ts() 