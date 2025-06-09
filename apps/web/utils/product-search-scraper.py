#!/usr/bin/env python3
"""
Product Search Scraper
Alternative to paid APIs - uses web scraping to find supplement products
"""
import requests # type: ignore
from bs4 import BeautifulSoup # type: ignore
import json
import time
from urllib.parse import quote_plus

def search_supplements(query, max_results=3):
    """Search for supplements across multiple retailers"""
    results = []
    
    # Headers to avoid bot detection
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Search on multiple sites
    retailers = [
        {
            'name': 'Amazon',
            'search_url': f'https://www.amazon.com/s?k={quote_plus(query + " supplement")}&i=hpc',
            'selector': 'div[data-component-type="s-search-result"]',
            'parse_func': parse_amazon
        },
        {
            'name': 'iHerb', 
            'search_url': f'https://www.iherb.com/search?kw={quote_plus(query)}',
            'selector': 'div.product-cell',
            'parse_func': parse_iherb
        }
    ]
    
    for retailer in retailers:
        try:
            response = requests.get(retailer['search_url'], headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                products = soup.select(retailer['selector'])[:max_results]
                
                for product in products:
                    parsed = retailer['parse_func'](product, retailer['name'])
                    if parsed:
                        results.append(parsed)
                        
            time.sleep(1)  # Be polite to servers
            
        except Exception as e:
            print(f"Error searching {retailer['name']}: {e}")
            
    return results

def parse_amazon(product_elem, source):
    """Parse Amazon product listing"""
    try:
        title_elem = product_elem.select_one('h2 a span')
        price_elem = product_elem.select_one('span.a-price-whole')
        link_elem = product_elem.select_one('h2 a')
        image_elem = product_elem.select_one('img.s-image')
        
        if title_elem and link_elem:
            return {
                'title': title_elem.text.strip(),
                'url': 'https://www.amazon.com' + link_elem.get('href', ''),
                'price': price_elem.text.strip() if price_elem else None,
                'image': image_elem.get('src', '') if image_elem else None,
                'source': source
            }
    except:
        pass
    return None

def parse_iherb(product_elem, source):
    """Parse iHerb product listing"""
    try:
        title_elem = product_elem.select_one('div.product-title')
        price_elem = product_elem.select_one('span.price')
        link_elem = product_elem.select_one('a.product-link')
        image_elem = product_elem.select_one('img')
        
        if title_elem and link_elem:
            return {
                'title': title_elem.text.strip(),
                'url': 'https://www.iherb.com' + link_elem.get('href', ''),
                'price': price_elem.text.strip() if price_elem else None,
                'image': image_elem.get('src', '') if image_elem else None,
                'source': source
            }
    except:
        pass
    return None

def search_and_save(supplement_name, dosage, output_file='product_results.json'):
    """Search for a supplement and save results"""
    query = f"{supplement_name} {dosage}"
    print(f"Searching for: {query}")
    
    results = search_supplements(query)
    
    if results:
        print(f"Found {len(results)} products")
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        return results
    else:
        print("No products found")
        return []

if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) > 1:
        supplement = ' '.join(sys.argv[1:])
        results = search_and_save(supplement, "")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['title']}")
            print(f"   Price: {result.get('price', 'N/A')}")
            print(f"   URL: {result['url']}")
    else:
        print("Usage: python product-search-scraper.py <supplement name> [dosage]")
        print("Example: python product-search-scraper.py 'Vitamin D3' '5000 IU'") 