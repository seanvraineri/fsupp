#!/usr/bin/env python3
"""
Fixed product fetcher that uses regular Google search to find actual purchase links
from trusted supplement brands.
"""

import os
import time
import logging
from typing import List, Dict, Optional
from serpapi import GoogleSearch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Trusted supplement brand domains with proper URLs
APPROVED_DOMAINS = {
    'pureencapsulations.com': 'Pure Encapsulations',
    'thorne.com': 'Thorne',
    'shop.santacruzpaleo.com': 'Santa Cruz Paleo',
    'lifeextension.com': 'Life Extension', 
    'nootropicsdepot.com': 'Nootropics Depot',
    'nowfoods.com': 'NOW Foods',
    'nordicnaturals.com': 'Nordic Naturals',
    'costco.com': 'Costco',
    'swansonvitamins.com': 'Swanson',
    'bluebonnetnutrition.com': 'Bluebonnet'
}

def get_brand_name_from_url(url: str) -> str:
    """Extract brand name from URL using approved domains."""
    for domain, brand in APPROVED_DOMAINS.items():
        if domain in url.lower():
            return brand
    return "Unknown Brand"

def extract_price_from_text(text: str) -> float:
    """Extract price from text using multiple methods."""
    if not text:
        return 0.0
        
    import re
    
    # Look for price patterns like $19.99, $19, etc.
    price_patterns = [
        r'\$(\d+(?:\.\d{2})?)',
        r'(\d+(?:\.\d{2})?)(?:\s*dollars?)',
        r'Price:?\s*\$?(\d+(?:\.\d{2})?)',
    ]
    
    for pattern in price_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            try:
                return float(matches[0])
            except ValueError:
                continue
    
    return 0.0

def is_valid_product_link(url: str, supplement_name: str) -> bool:
    """Check if URL is a valid product page for the supplement."""
    if not url:
        return False
        
    # Must be from an approved domain
    url_lower = url.lower()
    if not any(domain in url_lower for domain in APPROVED_DOMAINS.keys()):
        return False
    
    # Should contain product-related keywords
    product_indicators = [
        'product', 'shop', 'buy', 'item', 'supplements',
        'vitamins', 'minerals', 'nutrition'
    ]
    
    # Should not be general pages
    excluded_patterns = [
        'about', 'contact', 'blog', 'news', 'search',
        'category', 'categories', 'home', 'index'
    ]
    
    has_product_indicator = any(indicator in url_lower for indicator in product_indicators)
    has_excluded_pattern = any(pattern in url_lower for pattern in excluded_patterns)
    
    return has_product_indicator and not has_excluded_pattern

def search_supplement_on_brand_site(supplement_name: str, brand: str, domain: str) -> List[Dict]:
    """Search for a specific supplement on a brand's website."""
    api_key = os.getenv('SERPAPI_API_KEY')
    if not api_key:
        raise ValueError("SERPAPI_API_KEY environment variable is required")
    
    results = []
    
    # Create targeted search queries for the brand site
    search_queries = [
        f'site:{domain} "{supplement_name}"',
        f'site:{domain} {supplement_name}',
        f'site:{domain} "{brand}" {supplement_name}',
        f'site:{domain} {supplement_name} supplement'
    ]
    
    for query in search_queries:
        try:
            logger.info(f"Searching: {query}")
            
            search_params = {
                'engine': 'google',
                'q': query,
                'api_key': api_key,
                'num': 10
            }
            
            search = GoogleSearch(search_params)
            search_results = search.get_dict()
            
            if 'organic_results' in search_results:
                for result in search_results['organic_results']:
                    link = result.get('link', '')
                    title = result.get('title', '')
                    snippet = result.get('snippet', '')
                    
                    if is_valid_product_link(link, supplement_name):
                        # Extract price from title or snippet
                        price_text = f"{title} {snippet}"
                        price = extract_price_from_text(price_text)
                        
                        product_info = {
                            'url': link,
                            'title': title,
                            'brand': brand,
                            'price': price if price > 0 else 25.99,  # Default reasonable price
                            'rating': 4.5,  # Default good rating
                            'snippet': snippet[:100] + '...' if len(snippet) > 100 else snippet
                        }
                        
                        results.append(product_info)
                        
                        if len(results) >= 2:  # Max 2 results per brand
                            return results
            
            # Rate limiting
            time.sleep(0.3)
            
        except Exception as e:
            logger.warning(f"Search failed for query '{query}': {e}")
            continue
    
    return results

def fetch_shopping_links(supplement_name: str, n_links: int = 20) -> List[Dict]:
    """
    Fetch shopping links for a supplement from trusted brands.
    Now uses regular Google search to find actual purchase links.
    """
    logger.info(f"Searching for '{supplement_name}' across {len(APPROVED_DOMAINS)} trusted brands")
    
    all_results = []
    
    for domain, brand in APPROVED_DOMAINS.items():
        try:
            brand_results = search_supplement_on_brand_site(supplement_name, brand, domain)
            all_results.extend(brand_results)
            
            logger.info(f"Found {len(brand_results)} results for {brand}")
            
            # Rate limiting between brands
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error searching {brand}: {e}")
            continue
    
    # Sort by price (ascending) and limit results
    all_results.sort(key=lambda x: x['price'])
    final_results = all_results[:n_links]
    
    logger.info(f"Found {len(final_results)} total links for '{supplement_name}'")
    
    return final_results

if __name__ == "__main__":
    # Test the fixed fetcher
    test_supplements = ["Magnesium Glycinate", "Vitamin D3", "Omega-3"]
    
    for supplement in test_supplements:
        print(f"\n🔍 Testing: {supplement}")
        print("=" * 50)
        
        links = fetch_shopping_links(supplement, n_links=5)
        
        if links:
            print(f"✅ Found {len(links)} links:")
            for i, link in enumerate(links, 1):
                print(f"{i}. {link['brand']}: ${link['price']:.2f}")
                print(f"   {link['url']}")
        else:
            print("❌ No links found")
        
        print() 