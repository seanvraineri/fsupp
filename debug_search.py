#!/usr/bin/env python3

import os
os.environ['SERPAPI_API_KEY'] = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92'

from serpapi import GoogleSearch

def debug_search(query):
    print(f"\n🔍 DEBUGGING SEARCH: {query}")
    print("=" * 60)
    
    search_params = {
        'engine': 'google',
        'tbm': 'shop',
        'q': query,
        'api_key': os.environ['SERPAPI_API_KEY'],
        'num': 10
    }
    
    search = GoogleSearch(search_params)
    results = search.get_dict()
    
    if 'shopping_results' in results:
        print(f"📊 Found {len(results['shopping_results'])} raw results")
        
        for i, result in enumerate(results['shopping_results'][:5], 1):
            print(f"\n{i}. {result.get('title', 'No title')}")
            print(f"   🔗 Link: {result.get('link', 'No link')}")
            print(f"   💰 Price: {result.get('price', 'No price')}")
            print(f"   🏪 Source: {result.get('source', 'No source')}")
            
            # Check if it would pass our domain filter
            link = result.get('link', '')
            approved_domains = [
                'pureencapsulations.com', 'thorne.com', 'shop.santacruzpaleo.com',
                'lifeextension.com', 'nootropicsdepot.com', 'nowfoods.com',
                'nordicnaturals.com', 'costco.com', 'swansonvitamins.com', 'bluebonnetnutrition.com'
            ]
            
            domain_match = any(domain in link for domain in approved_domains)
            print(f"   ✅ Domain approved: {domain_match}")
            
    else:
        print("❌ No shopping results found")
        print(f"Error: {results.get('error', 'No error info')}")

if __name__ == "__main__":
    debug_queries = [
        '"Pure Encapsulations" Magnesium Glycinate',
        'Thorne Magnesium',
        'Vitamin D3',
        'magnesium glycinate supplement'
    ]
    
    for query in debug_queries:
        debug_search(query) 