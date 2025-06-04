#!/usr/bin/env python3
"""
Finish processing remaining supplements
"""
import json
import time
import csv
from typing import List, Dict, Any
import urllib.request
import urllib.parse
import os

# SERP API Configuration
SERP_API_KEY = "c473072afcd7d532f4a4b314a3a1c21a2d7538d449f849f4b0994280e05f93c5"

# Trusted supplement brands (reduced for faster testing)
BRAND_DOMAINS = {
    "Thorne": "thorne.com",
    "Pure Encapsulations": "pureencapsulations.com",
    "Designs for Health": "designsforhealth.com",
    "NOW Foods": "nowfoods.com",
    "Life Extension": "lifeextension.com"
}

def search_supplement_serp(supplement_name: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """Search for a supplement using SERP API across trusted brand sites"""
    all_results = []
    
    print(f"  Searching for: {supplement_name}")
    
    # Search top 3 brand websites
    for i, (brand, domain) in enumerate(list(BRAND_DOMAINS.items())[:3]):
        try:
            print(f"    [{i+1}/3] Searching {brand}...", end='', flush=True)
            
            # Use site-specific search
            query = f"site:{domain} {supplement_name}"
            
            params = {
                "q": query,
                "api_key": SERP_API_KEY,
                "num": 2,  # Only 2 results per brand
                "engine": "google"
            }
            
            url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(params)
            
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                found = 0
                # Extract organic results
                if "organic_results" in data:
                    for result in data["organic_results"][:2]:
                        product_info = {
                            "supplement": supplement_name,
                            "brand": brand,
                            "title": result.get("title", ""),
                            "url": result.get("link", ""),
                            "snippet": result.get("snippet", ""),
                            "domain": domain
                        }
                        all_results.append(product_info)
                        found += 1
                
                print(f" found {found} products")
            
            # Rate limiting
            time.sleep(0.3)
            
        except Exception as e:
            print(f" ERROR: {str(e)[:50]}")
    
    # Remove duplicates and limit results
    seen_urls = set()
    unique_results = []
    for result in all_results:
        if result["url"] not in seen_urls and len(unique_results) < max_results:
            seen_urls.add(result["url"])
            unique_results.append(result)
    
    return unique_results

def load_remaining_supplements():
    """Load the list of remaining supplements"""
    with open('remaining_supplements.txt', 'r') as f:
        return [line.strip() for line in f if line.strip()]

def process_remaining():
    """Process only the remaining supplements"""
    
    # Load existing results
    if os.path.exists('supplement_products.json'):
        with open('supplement_products.json', 'r') as f:
            all_products = json.load(f)
    else:
        all_products = {}
    
    # Load remaining supplements
    remaining = load_remaining_supplements()
    
    print(f"Starting search for {len(remaining)} remaining supplements")
    print(f"Already completed: {len(all_products)} supplements")
    print("=" * 60)
    
    for i, supplement in enumerate(remaining, 1):
        print(f"\n[{i}/{len(remaining)}] {supplement}")
        
        results = search_supplement_serp(supplement)
        if results:
            all_products[supplement] = results
            print(f"  ✓ Total found: {len(results)} products")
        else:
            all_products[supplement] = []
            print(f"  ✗ No products found")
        
        # Save progress every 5 supplements
        if i % 5 == 0:
            with open('supplement_products.json', 'w') as f:
                json.dump(all_products, f, indent=2)
            total_processed = len(all_products)
            print(f"\n>>> Progress saved! Total processed: {total_processed}/200 <<<\n")
    
    # Final save
    with open('supplement_products.json', 'w') as f:
        json.dump(all_products, f, indent=2)
    
    # Also save as CSV for easy viewing
    with open('supplement_products.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['supplement', 'brand', 'title', 'url', 'price', 'source'])
        writer.writeheader()
        for supplement, products in all_products.items():
            for product in products:
                writer.writerow({
                    'supplement': supplement,
                    'brand': product.get('brand', ''),
                    'title': product.get('title', ''),
                    'url': product.get('url', ''),
                    'price': product.get('price', ''),
                    'source': product.get('source', product.get('domain', ''))
                })
    
    return all_products

if __name__ == "__main__":
    print("Processing remaining supplements...")
    print("This will take approximately 5-10 minutes\n")
    
    start_time = time.time()
    results = process_remaining()
    elapsed = int(time.time() - start_time)
    
    print(f"\n{'='*60}")
    print(f"Complete! Total supplements in database: {len(results)}")
    print(f"Processing time: {elapsed}s ({elapsed//60}m {elapsed%60}s)")
    print(f"Results saved to supplement_products.json and supplement_products.csv")
    
    # Summary statistics
    total_products = sum(len(products) for products in results.values())
    print(f"Total products found: {total_products}")
    print(f"Average products per supplement: {total_products / len(results):.1f}") 
