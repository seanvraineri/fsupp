#!/usr/bin/env python3
"""
Populate the product_links table via Supabase REST API
"""
import json
import urllib.request
import urllib.parse
import urllib.error
import os

# Configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
    print("Please run: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
    exit(1)

# Load the supplement products
with open('supplement_products.json', 'r') as f:
    products_data = json.load(f)

print(f"Loading {len(products_data)} supplements into product_links table...")

success_count = 0
error_count = 0

# Process in batches
batch_size = 10
all_links = []

for supplement_name, products in products_data.items():
    for product in products[:2]:  # Only take first 2 products per supplement
        link_data = {
            'supplement_name': supplement_name,
            'brand': product.get('brand', 'Unknown'),
            'product_name': product.get('title', supplement_name)[:200],
            'product_url': product.get('url', ''),
            'price': None,
            'verified': True
        }
        all_links.append(link_data)

print(f"Total links to insert: {len(all_links)}")

# Insert in batches
for i in range(0, len(all_links), batch_size):
    batch = all_links[i:i+batch_size]
    
    try:
        # Prepare request
        url = f"{SUPABASE_URL}/rest/v1/product_links"
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        data = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers)
        
        # Make request
        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                success_count += len(batch)
                print(f"✓ Inserted batch {i//batch_size + 1}/{(len(all_links) + batch_size - 1)//batch_size}")
            else:
                error_count += len(batch)
                print(f"✗ Error inserting batch: {response.status}")
                
    except urllib.error.HTTPError as e:
        error_count += len(batch)
        error_body = e.read().decode('utf-8')
        print(f"✗ HTTP Error {e.code}: {e.reason}")
        print(f"  Error details: {error_body[:200]}")
        if i == 0:  # Show full error for first batch only
            print(f"  Sample data: {json.dumps(batch[0], indent=2)}")
    except Exception as e:
        error_count += len(batch)
        print(f"✗ Error inserting batch: {str(e)}")

print(f"\nCompleted!")
print(f"Successfully inserted: {success_count} product links")
print(f"Errors: {error_count}")
print(f"Total products processed: {len(all_links)}")

# Try to get count from database
try:
    count_url = f"{SUPABASE_URL}/rest/v1/product_links?select=id&limit=1"
    count_headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Prefer': 'count=exact'
    }
    count_req = urllib.request.Request(count_url, headers=count_headers)
    with urllib.request.urlopen(count_req) as response:
        total_count = response.headers.get('content-range', '').split('/')[-1]
        if total_count and total_count != '*':
            print(f"Total product links in database: {total_count}")
except Exception as e:
    print(f"Could not get total count: {e}") 
