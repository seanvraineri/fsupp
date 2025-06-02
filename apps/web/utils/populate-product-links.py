#!/usr/bin/env python3
"""
Populate the product_links table with supplement products
"""
import json
import os
from supabase import create_client, Client

# Load environment variables
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
    print("Please set it with: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load the supplement products
with open('supplement_products.json', 'r') as f:
    products_data = json.load(f)

print(f"Loading {len(products_data)} supplements into product_links table...")

success_count = 0
error_count = 0

for supplement_name, products in products_data.items():
    for product in products[:3]:  # Only take first 3 products per supplement
        try:
            # Prepare the data
            link_data = {
                'supplement_name': supplement_name,
                'brand': product.get('brand', 'Unknown'),
                'product_name': product.get('title', supplement_name)[:200],  # Truncate if too long
                'url': product.get('url', ''),
                'price': None,  # We don't have price data
                'verified': True
            }
            
            # Insert into database
            result = supabase.table('product_links').insert(link_data).execute()
            success_count += 1
            
        except Exception as e:
            error_count += 1
            print(f"Error inserting {supplement_name} - {product.get('brand', 'Unknown')}: {str(e)}")

print(f"\nCompleted!")
print(f"Successfully inserted: {success_count} product links")
print(f"Errors: {error_count}")

# Verify by counting total records
result = supabase.table('product_links').select('id', count='exact').execute()
print(f"Total product links in database: {result.count}") 