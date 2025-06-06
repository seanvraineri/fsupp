#!/usr/bin/env python3

import os
os.environ['SERPAPI_API_KEY'] = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92'
os.environ['SUPABASE_URL'] = 'https://tcptynohlpggtufqanqg.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.3Rn1OQsqZGGqT9SfQ3C5avWEBLIrnJnNi8d8HzYtXiA'

from product_fetcher import fetch_shopping_links

def test_supplement(name):
    print(f"\n🔍 SEARCHING FOR: {name}")
    print("=" * 50)
    
    try:
        links = fetch_shopping_links(name, n_links=5)
        
        if links:
            print(f"🎯 FOUND {len(links)} LINKS:")
            for i, link in enumerate(links, 1):
                print(f"\n{i}. {link['brand']}")
                print(f"   💰 Price: ${link['price']:.2f}")
                print(f"   ⭐ Rating: {link['rating']} stars")
                print(f"   🔗 URL: {link['url']}")
        else:
            print("❌ No links found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Test a few popular supplements
    supplements = [
        "Magnesium Glycinate", 
        "Vitamin D3", 
        "Omega-3",
        "Vitamin C",
        "Zinc"
    ]
    
    for supplement in supplements:
        test_supplement(supplement)
        print() 