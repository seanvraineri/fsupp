"""
Product fetcher module for supplement shopping links from trusted brands.

This module provides functionality to search for supplement products from approved
clean-label brands using SerpApi and store the results in Supabase.
"""

import os
import time
import logging
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

import requests
from serpapi import GoogleSearch

# Supabase Python client (@supabase/supabase-py)
from supabase import create_client, Client  # pip install supabase_py

# Load env vars from .env if present
try:
    from dotenv import load_dotenv, find_dotenv  # type: ignore
    load_dotenv(find_dotenv())
except ImportError:
    pass  # dotenv is optional in production containers


# Configuration constants
DOMAIN_WHITELIST = {
    "pureencapsulations.com": "Pure Encapsulations",
    "thorne.com": "Thorne",
    "santacruzpaleo.com": "Santa Cruz Paleo",
    "lifeextension.com": "Life Extension",
    "nootropicsdepot.com": "Nootropics Depot",
    "nowfoods.com": "NOW",
    "nordicnaturals.com": "Nordic Naturals",
    "costco.com": "Kirkland",
    "swansonvitamins.com": "Swanson",
    "bluebonnetnutrition.com": "Bluebonnet",
}

BRANDS = list(DOMAIN_WHITELIST.values())

MAX_RETRIES = 3
RETRY_DELAY = 0.3  # 300ms delay between brand searches for more thorough results
BACKOFF_FACTOR = 2


@dataclass
class ProductLink:
    """Data class representing a product link with price and rating information."""
    url: str
    price: float
    rating: float
    brand: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format for JSON serialization."""
        return {
            "url": self.url,
            "price": self.price,
            "rating": self.rating,
            "brand": self.brand
        }


class ProductFetcher:
    """
    Main class for fetching supplement product links from trusted brands.
    
    Handles SerpApi integration, brand filtering, and Supabase storage.
    """
    
    def __init__(self):
        """Initialize with environment variables and Supabase client."""
        self.serpapi_key = self._get_env_var("SERPAPI_API_KEY")
        self.supabase_url = self._get_env_var("SUPABASE_URL")
        self.supabase_key = self._get_env_var("SUPABASE_SERVICE_ROLE_KEY")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    @staticmethod
    def _get_env_var(name: str) -> str:
        """Get required environment variable or raise ValueError."""
        value = os.getenv(name)
        if not value:
            raise ValueError(f"Environment variable {name} is required but not set")
        return value
    
    def _extract_domain(self, url: str) -> Optional[str]:
        """Extract domain from URL and check if it's in whitelist."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            # Remove www. prefix if present
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain
        except Exception:
            return None
    
    def _is_approved_domain(self, url: str) -> bool:
        """Check if URL is from an approved domain."""
        domain = self._extract_domain(url)
        return domain in DOMAIN_WHITELIST if domain else False
    
    def _get_brand_from_url(self, url: str) -> str:
        """Get brand name from URL domain."""
        domain = self._extract_domain(url)
        return DOMAIN_WHITELIST.get(domain, "Unknown")
    
    def _extract_price(self, result: Dict[str, Any]) -> float:
        """Extract price from SerpApi result."""
        try:
            # Try different price fields that SerpApi might return
            if 'extracted_price' in result:
                return float(result['extracted_price'])
            elif 'price' in result:
                price_str = str(result['price']).replace('$', '').replace(',', '')
                return float(price_str)
            elif 'snippet' in result:
                # Try to extract price from snippet
                snippet = result['snippet']
                import re
                price_match = re.search(r'\$([0-9,]+\.?[0-9]*)', snippet)
                if price_match:
                    return float(price_match.group(1).replace(',', ''))
        except (ValueError, TypeError):
            pass
        return 0.0
    
    def _extract_rating(self, result: Dict[str, Any]) -> float:
        """Extract rating from SerpApi result."""
        try:
            if 'rating' in result:
                return float(result['rating'])
            elif 'snippet' in result:
                # Try to extract rating from snippet
                snippet = result['snippet']
                import re
                rating_match = re.search(r'([0-9]\.?[0-9]*)\s*(?:out of|\/)\s*5', snippet)
                if rating_match:
                    return float(rating_match.group(1))
                # Look for star ratings
                star_match = re.search(r'([0-9]\.?[0-9]*)\s*star', snippet.lower())
                if star_match:
                    return float(star_match.group(1))
        except (ValueError, TypeError):
            pass
        return 0.0
    
    def _search_with_retry(self, query: str) -> List[Dict[str, Any]]:
        """
        Perform SerpApi search with retry logic for rate limiting and errors.
        
        Args:
            query: Search query string
            
        Returns:
            List of shopping results from SerpApi
            
        Raises:
            ValueError: If all retry attempts fail
        """
        for attempt in range(MAX_RETRIES):
            try:
                search = GoogleSearch({
                    "engine": "google",
                    "tbm": "shop",
                    "q": query,
                    "api_key": self.serpapi_key,
                    "num": 50  # Get more results to filter from for better coverage
                })
                
                results = search.get_dict()
                
                if "error" in results:
                    raise requests.RequestException(f"SerpApi error: {results['error']}")
                
                return results.get("shopping_results", [])
                
            except requests.RequestException as e:
                if "429" in str(e) or "500" in str(e):
                    if attempt < MAX_RETRIES - 1:
                        delay = RETRY_DELAY * (BACKOFF_FACTOR ** attempt)
                        logging.info(f"Rate limited, retrying in {delay}s (attempt {attempt + 1})")
                        time.sleep(delay)
                        continue
                
                if attempt == MAX_RETRIES - 1:
                    raise ValueError(f"SerpApi search failed after {MAX_RETRIES} attempts: {e}")
            
            except Exception as e:
                if attempt == MAX_RETRIES - 1:
                    raise ValueError(f"Unexpected error in SerpApi search: {e}")
                time.sleep(RETRY_DELAY)
    
    def _search_specific_supplement(self, brand: str, supplement: str) -> List[ProductLink]:
        """
        Search for a specific brand + supplement combination with multiple query variations.
        
        Args:
            brand: Brand name to search for
            supplement: Supplement name
            
        Returns:
            List of ProductLink objects from approved domains
        """
        # Multiple query variations for better specificity
        queries = [
            f'"{brand}" {supplement}',  # Exact brand match
            f'{brand} {supplement} supplement',  # Add supplement keyword
            f'{brand} {supplement} capsules',  # Common form
            f'{brand} {supplement} tablets',   # Alternative form
        ]
        
        all_product_links = []
        seen_urls = set()
        
        for query in queries:
            try:
                results = self._search_with_retry(query)
                
                for result in results:
                    link = result.get('link', '')
                    
                    if not self._is_approved_domain(link):
                        continue
                    
                    # Skip if we've already found this URL
                    if link in seen_urls:
                        continue
                    
                    # Additional filtering to ensure relevance
                    title = result.get('title', '').lower()
                    snippet = result.get('snippet', '').lower()
                    supplement_lower = supplement.lower()
                    
                    # Check if supplement name appears in title or snippet
                    if supplement_lower in title or supplement_lower in snippet:
                        product_link = ProductLink(
                            url=link,
                            price=self._extract_price(result),
                            rating=self._extract_rating(result),
                            brand=self._get_brand_from_url(link)
                        )
                        
                        all_product_links.append(product_link)
                        seen_urls.add(link)
                
                # Small delay between query variations
                time.sleep(0.1)
                
            except Exception as e:
                logging.warning(f"Failed query '{query}': {e}")
                continue
        
        return all_product_links
    
    def fetch_shopping_links(self, supplement: str, n_links: int = 5) -> List[Dict[str, Any]]:
        """
        Fetch shopping links for a supplement from trusted brands with targeted searches only.
        
        Args:
            supplement: Name of the supplement to search for
            n_links: Maximum number of links to return (default: 5)
            
        Returns:
            List of dictionaries with keys: url, price, rating, brand
            
        Raises:
            ValueError: If no results found or search fails
        """
        if not supplement.strip():
            raise ValueError("Supplement name cannot be empty")
        
        supplement = supplement.strip()
        all_links = []
        seen_urls = set()
        
        # Only search each brand specifically - NO FALLBACK
        logging.info(f"Searching for '{supplement}' across {len(BRANDS)} brands with targeted queries")
        
        for brand in BRANDS:
            try:
                brand_links = self._search_specific_supplement(brand, supplement)
                
                # Add unique links only
                for link in brand_links:
                    if link.url not in seen_urls:
                        all_links.append(link)
                        seen_urls.add(link.url)
                        
                        if len(all_links) >= n_links:
                            break
                
                # Rate limiting between brand searches
                time.sleep(RETRY_DELAY)
                
                if len(all_links) >= n_links:
                    break
                    
            except Exception as e:
                logging.warning(f"Failed to search {brand} for {supplement}: {e}")
                continue
        
        if not all_links:
            raise ValueError(f"No specific shopping links found for '{supplement}' from approved brands")
        
        # Return up to n_links results
        result_links = all_links[:n_links]
        
        logging.info(f"Found {len(result_links)} specific links for {supplement}")
        return [link.to_dict() for link in result_links]
    
    def upsert_product_links(self, supplement: str, links: List[Dict[str, Any]]) -> None:
        """
        Store or update product links in Supabase.
        
        Args:
            supplement: Supplement name (will be stored lowercase)
            links: List of product link dictionaries
            
        Raises:
            ValueError: If database operation fails
        """
        if not supplement.strip():
            raise ValueError("Supplement name cannot be empty")
        
        if not links:
            raise ValueError("Links list cannot be empty")
        
        supplement_key = supplement.strip().lower()
        
        try:
            # Upsert into product_links table
            result = self.supabase.table("product_links").upsert({
                "supplement": supplement_key,
                "links_json": links,
            }).execute()
            
            if not result.data:
                raise ValueError("Failed to upsert product links - no data returned")
            
            logging.info(f"Successfully stored {len(links)} links for '{supplement_key}'")
            
        except Exception as e:
            raise ValueError(f"Failed to store product links in database: {e}")


# Public API functions
def fetch_shopping_links(supplement: str, n_links: int = 5) -> List[Dict[str, Any]]:
    """
    Fetch shopping links for a supplement from trusted brands.
    
    Args:
        supplement: Name of the supplement to search for
        n_links: Maximum number of links to return (default: 5)
        
    Returns:
        List of dictionaries with keys: url, price, rating, brand
        
    Raises:
        ValueError: If no results found or search fails
    """
    fetcher = ProductFetcher()
    return fetcher.fetch_shopping_links(supplement, n_links)


def upsert_product_links(supplement: str, links: List[Dict[str, Any]]) -> None:
    """
    Store or update product links in Supabase.
    
    Args:
        supplement: Supplement name (will be stored lowercase)
        links: List of product link dictionaries
        
    Raises:
        ValueError: If database operation fails
    """
    fetcher = ProductFetcher()
    fetcher.upsert_product_links(supplement, links)


if __name__ == "__main__":
    # Example usage
    try:
        links = fetch_shopping_links("Magnesium Glycinate", n_links=3)
        print(f"Found {len(links)} links:")
        for i, link in enumerate(links, 1):
            print(f"{i}. {link['brand']}: ${link['price']:.2f} ({link['rating']} stars)")
            print(f"   {link['url']}")
        
        # Store results
        upsert_product_links("Magnesium Glycinate", links)
        print("Successfully stored links in database")
        
    except Exception as e:
        print(f"Error: {e}") 