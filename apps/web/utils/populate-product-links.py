#!/usr/bin/env python3
"""
Populate the product_links table with supplement products for existing recommendations
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

# Comprehensive supplement product database with real URLs from trusted retailers
SUPPLEMENT_PRODUCTS = {
    "Vitamin D3": [
        {
            "brand": "Thorne",
            "product_name": "Vitamin D/K2 Liquid",
            "product_url": "https://www.thorne.com/products/dp/vitamin-d-k2-liquid",
            "price": 33.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Vitamin D3 5,000 IU",
            "product_url": "https://www.pureencapsulations.com/vitamin-d3-5-000-iu.html",
            "price": 24.60,
            "verified": True
        },
        {
            "brand": "Nordic Naturals",
            "product_name": "Vitamin D3 Gummies",
            "product_url": "https://www.nordicnaturals.com/products/vitamin-d3-gummies",
            "price": 19.95,
            "verified": True
        }
    ],
    "Magnesium Glycinate": [
        {
            "brand": "Thorne",
            "product_name": "Magnesium Bisglycinate",
            "product_url": "https://www.thorne.com/products/dp/magnesium-bisglycinate",
            "price": 18.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Magnesium Glycinate",
            "product_url": "https://www.pureencapsulations.com/magnesium-glycinate.html",
            "price": 20.90,
            "verified": True
        },
        {
            "brand": "NOW Foods",
            "product_name": "Magnesium Glycinate 400mg",
            "product_url": "https://www.nowfoods.com/products/supplements/magnesium-glycinate-400-mg-tablets",
            "price": 15.99,
            "verified": True
        }
    ],
    "Omega-3": [
        {
            "brand": "Nordic Naturals",
            "product_name": "Ultimate Omega",
            "product_url": "https://www.nordicnaturals.com/products/ultimate-omega",
            "price": 44.95,
            "verified": True
        },
        {
            "brand": "Thorne",
            "product_name": "Super EPA",
            "product_url": "https://www.thorne.com/products/dp/super-epa",
            "price": 39.00,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "Super Omega-3",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item01937/super-omega-3-epa-dha-with-sesame-lignans-olive-extract",
            "price": 32.00,
            "verified": True
        }
    ],
    "Methylfolate": [
        {
            "brand": "Thorne",
            "product_name": "5-MTHF 1mg",
            "product_url": "https://www.thorne.com/products/dp/5-mthf-1-mg",
            "price": 22.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Folate 400",
            "product_url": "https://www.pureencapsulations.com/folate-400.html",
            "price": 17.60,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "Optimized Folate",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item01939/optimized-folate-l-methylfolate",
            "price": 11.25,
            "verified": True
        }
    ],
    "Methylcobalamin": [
        {
            "brand": "Thorne",
            "product_name": "Methylcobalamin",
            "product_url": "https://www.thorne.com/products/dp/methylcobalamin",
            "price": 14.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "B12 5,000",
            "product_url": "https://www.pureencapsulations.com/b12-5-000.html",
            "price": 18.40,
            "verified": True
        },
        {
            "brand": "Nordic Naturals",
            "product_name": "Vitamin B12 Gummies",
            "product_url": "https://www.nordicnaturals.com/products/vitamin-b12-gummies",
            "price": 19.95,
            "verified": True
        }
    ],
    "Probiotics": [
        {
            "brand": "Thorne",
            "product_name": "FloraPro-LP",
            "product_url": "https://www.thorne.com/products/dp/florapro-lp",
            "price": 26.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Probiotic-5",
            "product_url": "https://www.pureencapsulations.com/probiotic-5.html",
            "price": 22.40,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "FLORASSIST GI",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item02125/florassist-gi-with-phage-technology",
            "price": 36.00,
            "verified": True
        }
    ],
    "Zinc": [
        {
            "brand": "Thorne",
            "product_name": "Zinc Picolinate 15mg",
            "product_url": "https://www.thorne.com/products/dp/zinc-picolinate-15-mg",
            "price": 13.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Zinc 30",
            "product_url": "https://www.pureencapsulations.com/zinc-30.html",
            "price": 15.80,
            "verified": True
        },
        {
            "brand": "NOW Foods",
            "product_name": "Zinc Glycinate 30mg",
            "product_url": "https://www.nowfoods.com/products/supplements/zinc-glycinate-30-mg-softgels",
            "price": 9.99,
            "verified": True
        }
    ],
    "Iron": [
        {
            "brand": "Thorne",
            "product_name": "Iron Bisglycinate",
            "product_url": "https://www.thorne.com/products/dp/iron-bisglycinate",
            "price": 13.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Iron-C",
            "product_url": "https://www.pureencapsulations.com/iron-c.html",
            "price": 17.80,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "Iron Protein Plus",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item00229/iron-protein-plus",
            "price": 14.00,
            "verified": True
        }
    ],
    "Ashwagandha": [
        {
            "brand": "Thorne",
            "product_name": "Ashwagandha",
            "product_url": "https://www.thorne.com/products/dp/ashwagandha",
            "price": 32.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Ashwagandha",
            "product_url": "https://www.pureencapsulations.com/ashwagandha.html",
            "price": 26.20,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "Optimized Ashwagandha",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item02176/optimized-ashwagandha-extract",
            "price": 15.00,
            "verified": True
        }
    ],
    "Curcumin": [
        {
            "brand": "Thorne",
            "product_name": "Meriva 500-SF",
            "product_url": "https://www.thorne.com/products/dp/meriva-500-sf",
            "price": 49.00,
            "verified": True
        },
        {
            "brand": "Pure Encapsulations",
            "product_name": "Curcumin 500",
            "product_url": "https://www.pureencapsulations.com/curcumin-500-with-bioperine.html",
            "price": 38.60,
            "verified": True
        },
        {
            "brand": "Life Extension",
            "product_name": "Super Bio-Curcumin",
            "product_url": "https://www.lifeextension.com/vitamins-supplements/item00407/super-bio-curcumin",
            "price": 38.00,
            "verified": True
        }
    ]
}

def normalize_supplement_name(name):
    """Normalize supplement names for matching"""
    name = name.lower().strip()
    
    # Common variations
    mappings = {
        "vitamin d": "vitamin d3",
        "magnesium": "magnesium glycinate",
        "folate": "methylfolate",
        "5-mthf": "methylfolate",
        "b12": "methylcobalamin",
        "vitamin b12": "methylcobalamin",
        "fish oil": "omega-3",
        "omega 3": "omega-3",
        "turmeric": "curcumin",
        "probiotic": "probiotics",
    }
    
    for key, value in mappings.items():
        if key in name:
            return value
    
    return name

def main():
    print("Fetching existing recommendations...")
    
    # Get all active recommendations that don't have product links
    result = supabase.table('supplement_recommendations').select('''
        id,
        supplement_name,
        user_id
    ''').eq('is_active', True).execute()
    
    recommendations = result.data
    print(f"Found {len(recommendations)} active recommendations")
    
    success_count = 0
    error_count = 0
    
    for rec in recommendations:
        rec_id = rec['id']
        supplement_name = rec['supplement_name']
        
        # Check if this recommendation already has product links
        existing_links = supabase.table('product_links').select('id').eq('recommendation_id', rec_id).execute()
        if existing_links.data:
            print(f"⏭️  Skipping {supplement_name} - already has product links")
            continue
        
        # Normalize supplement name for matching
        normalized_name = normalize_supplement_name(supplement_name)
        
        # Find matching products
        products = None
        for key, product_list in SUPPLEMENT_PRODUCTS.items():
            if normalized_name in key.lower() or key.lower() in normalized_name:
                products = product_list
                break
        
        if not products:
            print(f"❌ No products found for: {supplement_name}")
            error_count += 1
            continue
        
        # Insert product links for this recommendation
        print(f"📦 Adding {len(products)} product links for: {supplement_name}")
        
        for product in products:
            try:
                link_data = {
                    'recommendation_id': rec_id,
                    'product_name': product['product_name'],
                    'brand': product['brand'],
                    'product_url': product['product_url'],
                    'price': product['price'],
                    'verified': product['verified']
                }
                
                supabase.table('product_links').insert(link_data).execute()
                success_count += 1
                
            except Exception as e:
                error_count += 1
                print(f"❌ Error inserting {product['brand']} for {supplement_name}: {str(e)}")
    
    print(f"\n✅ Completed!")
    print(f"Successfully created: {success_count} product links")
    print(f"Errors: {error_count}")
    
    # Show summary stats
    total_links = supabase.table('product_links').select('id', count='exact').execute()
    print(f"Total product links in database: {total_links.count}")
    
    # Show recommendations with and without links
    recs_with_links = supabase.rpc('get_recommendations_with_product_count').execute()
    if recs_with_links.data:
        with_links = len([r for r in recs_with_links.data if r.get('product_count', 0) > 0])
        without_links = len([r for r in recs_with_links.data if r.get('product_count', 0) == 0])
        print(f"Recommendations with product links: {with_links}")
        print(f"Recommendations without product links: {without_links}")

if __name__ == "__main__":
    main() 