#!/usr/bin/env python3

import os
os.environ['SERPAPI_API_KEY'] = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92'

from product_fetcher_fixed import fetch_shopping_links

def show_links_for_supplement(supplement_name):
    print(f"\n🎯 ACTUAL LINKS FOR: {supplement_name}")
    print("=" * 60)
    
    links = fetch_shopping_links(supplement_name, n_links=8)
    
    if links:
        print(f"✅ SUCCESS! Found {len(links)} actual purchase links:")
        for i, link in enumerate(links, 1):
            print(f"\n{i}. {link['brand']}")
            print(f"   💰 ${link['price']:.2f}")
            print(f"   🔗 {link['url']}")
            print(f"   📝 {link['title'][:60]}...")
    else:
        print("❌ No links found")

if __name__ == "__main__":
    # Test one supplement to show actual working links
    show_links_for_supplement("Magnesium Glycinate") 