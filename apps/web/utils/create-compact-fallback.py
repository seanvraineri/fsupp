#!/usr/bin/env python3
"""
Create a compact version of supplement products for Edge Function
"""
import json

# Load the full data
with open('supplement_products.json', 'r') as f:
    data = json.load(f)

# Create compact version - only keep essential fields and limit to 2 products per supplement
compact_data = {}
for supplement, products in data.items():
    compact_data[supplement] = []
    for product in products[:2]:  # Only keep first 2 products
        compact_data[supplement].append({
            'b': product['brand'],  # b for brand
            't': product['title'][:80],  # t for title (truncated)
            'u': product['url']  # u for url
        })

# Generate TypeScript
ts_content = """// Compact supplement products fallback
export const PRODUCTS: Record<string, Array<{b:string,t:string,u:string}>> = {
"""

for supplement, products in compact_data.items():
    ts_content += f'  "{supplement}": [\n'
    for product in products:
        ts_content += '    {'
        ts_content += f'b:"{product["b"]}",'
        ts_content += f't:"{product["t"].replace('"', '\\"')}",'
        ts_content += f'u:"{product["u"]}"'
        ts_content += '},\n'
    ts_content += '  ],\n'

ts_content += """};\n
export function findProducts(name: string) {
  if (PRODUCTS[name]) return PRODUCTS[name].map(p => ({
    brand: p.b,
    product_name: p.t,
    url: p.u,
    price: null,
    verified: true
  }));
  
  const lower = name.toLowerCase();
  for (const [key, prods] of Object.entries(PRODUCTS)) {
    if (key.toLowerCase() === lower) {
      return prods.map(p => ({
        brand: p.b,
        product_name: p.t,
        url: p.u,
        price: null,
        verified: true
      }));
    }
  }
  return [];
}"""

# Save compact version
with open('../supabase/functions/product_search/products_compact.ts', 'w') as f:
    f.write(ts_content)

print(f"Created compact version with {len(compact_data)} supplements")
print(f"Average products per supplement: {sum(len(p) for p in compact_data.values()) / len(compact_data):.1f}") 
