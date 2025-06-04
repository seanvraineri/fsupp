#!/usr/bin/env python3
"""
Supplement Brand Searcher (Simple Version)
Searches for supplements from specific trusted brands using SERP API
"""
import json
import time
import csv
from typing import List, Dict, Any
import urllib.request
import urllib.parse

# SERP API Configuration
SERP_API_KEY = "c473072afcd7d532f4a4b314a3a1c21a2d7538d449f849f4b0994280e05f93c5"

# Trusted supplement brands
TRUSTED_BRANDS = [
    "Thorne",
    "Pure Encapsulations",
    "Designs for Health",
    "Integrative Therapeutics",
    "Santa Cruz Paleo",
    "Vital Nutrients",
    "Life Extension",
    "NOW Foods",
    "Garden of Life",
    "Gaia Herbs",
    "Nordic Naturals"
]

# Brand domains for direct site searches
BRAND_DOMAINS = {
    "Thorne": "thorne.com",
    "Pure Encapsulations": "pureencapsulations.com",
    "Designs for Health": "designsforhealth.com",
    "Integrative Therapeutics": "integrativepro.com",
    "Santa Cruz Paleo": "santacruzpaleo.com",
    "Vital Nutrients": "vitalnutrients.net",
    "Life Extension": "lifeextension.com",
    "NOW Foods": "nowfoods.com",
    "Garden of Life": "gardenoflife.com",
    "Gaia Herbs": "gaiaherbs.com",
    "Nordic Naturals": "nordicnaturals.com"
}

def search_supplement_serp(supplement_name: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search for a supplement using SERP API across trusted brand sites"""
    all_results = []
    
    # Search each brand's website
    for brand, domain in BRAND_DOMAINS.items():
        try:
            # Use site-specific search
            query = f"site:{domain} {supplement_name}"
            
            params = {
                "q": query,
                "api_key": SERP_API_KEY,
                "num": 3,
                "engine": "google"
            }
            
            url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(params)
            
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                # Extract organic results
                if "organic_results" in data:
                    for result in data["organic_results"][:3]:
                        product_info = {
                            "supplement": supplement_name,
                            "brand": brand,
                            "title": result.get("title", ""),
                            "url": result.get("link", ""),
                            "snippet": result.get("snippet", ""),
                            "domain": domain
                        }
                        all_results.append(product_info)
                
                # Also check shopping results if available
                if "shopping_results" in data:
                    for result in data["shopping_results"][:2]:
                        if any(b.lower() in result.get("source", "").lower() for b in [brand.lower()]):
                            product_info = {
                                "supplement": supplement_name,
                                "brand": brand,
                                "title": result.get("title", ""),
                                "url": result.get("link", ""),
                                "price": result.get("extracted_price", result.get("price", "")),
                                "source": result.get("source", ""),
                                "domain": domain
                            }
                            all_results.append(product_info)
            
            # Be respectful to the API
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error searching {brand} for {supplement_name}: {e}")
    
    # Also do a general shopping search for the supplement
    try:
        shopping_query = f"{supplement_name} supplement " + " OR ".join([f'"{brand}"' for brand in TRUSTED_BRANDS])
        
        params = {
            "q": shopping_query,
            "api_key": SERP_API_KEY,
            "num": 10,
            "engine": "google_shopping"
        }
        
        url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(params)
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            
            if "shopping_results" in data:
                for result in data["shopping_results"]:
                    # Check if it's from a trusted brand
                    source = result.get("source", "").lower()
                    title = result.get("title", "").lower()
                    
                    for brand in TRUSTED_BRANDS:
                        if brand.lower() in source or brand.lower() in title:
                            product_info = {
                                "supplement": supplement_name,
                                "brand": brand,
                                "title": result.get("title", ""),
                                "url": result.get("link", ""),
                                "price": result.get("extracted_price", result.get("price", "")),
                                "source": result.get("source", ""),
                                "image": result.get("thumbnail", "")
                            }
                            all_results.append(product_info)
                            break
    
    except Exception as e:
        print(f"Error in shopping search for {supplement_name}: {e}")
    
    # Remove duplicates and limit results
    seen_urls = set()
    unique_results = []
    for result in all_results:
        if result["url"] not in seen_urls and len(unique_results) < max_results:
            seen_urls.add(result["url"])
            unique_results.append(result)
    
    return unique_results

def process_all_supplements(supplements: List[str], output_file: str = "supplement_products.json"):
    """Process all supplements and save results"""
    all_products = {}
    
    for i, supplement in enumerate(supplements, 1):
        print(f"Processing {i}/{len(supplements)}: {supplement}")
        
        results = search_supplement_serp(supplement)
        if results:
            all_products[supplement] = results
            print(f"  Found {len(results)} products")
        else:
            print(f"  No products found")
        
        # Save progress every 10 supplements
        if i % 10 == 0:
            with open(output_file, 'w') as f:
                json.dump(all_products, f, indent=2)
            print(f"Progress saved to {output_file}")
        
        # Rate limiting
        time.sleep(1)
    
    # Final save
    with open(output_file, 'w') as f:
        json.dump(all_products, f, indent=2)
    
    # Also save as CSV for easy viewing
    csv_file = output_file.replace('.json', '.csv')
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
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

# List of 200 supplements
SUPPLEMENTS = [
    "Vitamin A (Retinyl Palmitate)",
    "Vitamin C (Ascorbic Acid)",
    "Vitamin D3 (Cholecalciferol)",
    "Vitamin K2 (MK-7)",
    "Vitamin E (Mixed Tocopherols)",
    "Thiamin (B1)",
    "Riboflavin-5′-Phosphate (B2)",
    "Niacinamide (B3)",
    "Pantethine (B5)",
    "Pyridoxal-5′-Phosphate (B6)",
    "Biotin (B7)",
    "5-MTHF (Methylfolate, B9)",
    "Methylcobalamin (B12)",
    "Choline Bitartrate",
    "Myo-Inositol",
    "Calcium Citrate",
    "Magnesium Bisglycinate",
    "Zinc Picolinate",
    "Selenium Methionine",
    "Iodine (Potassium Iodide)",
    "Manganese Bisglycinate",
    "Copper Bisglycinate",
    "Chromium Picolinate",
    "Boron Glycinate",
    "Molybdenum Glycinate",
    "Fish-Oil (EPA/DHA)",
    "Algae Oil (Vegan Ω-3)",
    "Krill Oil",
    "Cod-Liver Oil",
    "Evening-Primrose Oil",
    "Borage-Seed Oil",
    "Flaxseed Oil",
    "CLA",
    "GLA",
    "Phosphatidylcholine (Sunflower Lecithin)",
    "L-Glutamine",
    "L-Taurine",
    "L-Tyrosine",
    "L-Tryptophan",
    "Glycine",
    "L-Theanine",
    "L-Arginine",
    "L-Citrulline",
    "Creatine Monohydrate",
    "Beta-Alanine",
    "Carnitine Tartrate",
    "Acetyl-L-Carnitine",
    "Carnosine",
    "BCAA Blend",
    "L-Methionine",
    "L-Ornithine",
    "L-Histidine",
    "Collagen Peptides",
    "Alpha-Lipoic Acid",
    "CoQ10 (Ubiquinone)",
    "Ubiquinol",
    "PQQ",
    "Resveratrol",
    "Meriva-SF (Curcumin Phytosome)",
    "Quercetin Phytosome",
    "Sulforaphane",
    "Astaxanthin",
    "Glutathione (reduced)",
    "N-Acetyl-Cysteine (NAC)",
    "Liposomal Vitamin C",
    "Grape-Seed Extract",
    "Green-Tea Extract (EGCG)",
    "Lycopene",
    "β-Carotene",
    "R-Lipoic Acid",
    "Ashwagandha (KSM-66)",
    "Rhodiola rosea",
    "Panax Ginseng",
    "American Ginseng",
    "Eleuthero (Siberian Ginseng)",
    "Holy Basil",
    "Bacopa monnieri",
    "Lion's Mane Mushroom",
    "Cordyceps militaris",
    "Reishi Mushroom",
    "Chaga Mushroom",
    "Maitake Mushroom",
    "Ginkgo biloba",
    "Gotu Kola",
    "Maca Root",
    "Schisandra chinensis",
    "Astragalus membranaceus",
    "Saffron Extract",
    "Huperzine A",
    "Alpha-GPC",
    "Phosphatidylserine",
    "Pterostilbene",
    "DHEA",
    "Pregnenolone",
    "7-Keto DHEA",
    "Iodoral (High-Dose Iodine)",
    "DIM (Diindolylmethane)",
    "Calcium-D-Glucarate",
    "Betaine Anhydrous (TMG)",
    "Berberine HCl",
    "Chromium–Vanadium Complex",
    "Cinnulin-PF (Cinnamon Extract)",
    "Green-Coffee-Bean Extract",
    "White-Kidney-Bean Extract",
    "Fucoxanthin",
    "Cayenne Extract",
    "Glucosamine Sulfate",
    "Chondroitin Sulfate",
    "MSM",
    "Hyaluronic Acid",
    "Strontium Citrate",
    "Boswellia Serrata",
    "BCM-95 (Curcugreen Turmeric)",
    "Multi-Strain Probiotic (50 B CFU)",
    "Saccharomyces boulardii",
    "Spore-Based Probiotic",
    "Betaine HCl & Pepsin",
    "Pancreatin Enzymes",
    "Ox Bile Extract",
    "Bromelain",
    "Papain",
    "Serrapeptase",
    "Slippery Elm Bark",
    "Aloe-Vera Extract",
    "DGL Licorice",
    "Enteric-Coated Peppermint Oil",
    "Butyrate (Tributyrin)",
    "Zinc Carnosine",
    "Colostrum (Bovine)",
    "Melatonin 0.3 mg",
    "Valerian Root",
    "Passionflower",
    "Lemon Balm",
    "GABA",
    "Relora",
    "5-HTP",
    "CBD Softgels",
    "Apigenin",
    "Elderberry Extract",
    "Echinacea Purpurea",
    "Andrographis",
    "Olive-Leaf Extract",
    "Oregano-Oil Softgels",
    "β-Glucans",
    "10X Optimize Methylated Multivitamin",
    "10X Magnesium Glycinate",
    "10X Vitamin D3/K2",
    "10X Zinc Complex",
    "Thorne Basic Nutrients 2/Day",
    "Thorne Basic Nutrients 5/Day",
    "Thorne Methyl-Guard Plus",
    "Thorne NAC 900",
    "Thorne ResveraCel (NR + PT)",
    "Thorne Niacel 400",
    "Thorne Q-Best 100",
    "Thorne FloraMend Prime",
    "Thorne Berbercap",
    "Thorne Perma-Clear",
    "Thorne D-Glucarate",
    "Thorne Creatine",
    "Thorne Magnesium Bisglycinate Powder",
    "Thorne Vitamin D/K2 Liquid",
    "Thorne PolyResveratrol-SRT",
    "Pure Encap O.N.E. Multivitamin",
    "Pure Encap PureGenomics Multi",
    "Pure Encap B-Complex Plus",
    "Pure Encap 5-MTHF 1 mg",
    "Pure Encap Methyl-B12 5 mg",
    "Pure Encap Magnesium Glycinate",
    "Pure Encap Resveratrol 200",
    "Pure Encap Quercetin 250",
    "Pure Encap Alpha-Lipoic Acid 600",
    "Pure Encap NAC 600",
    "Pure Encap EPA/DHA Essentials",
    "Pure Encap L-Theanine 200",
    "Pure Encap L-Tryptophan",
    "Pure Encap Probiotic G.I.",
    "Pure Encap DHEA 25 mg",
    "Pure Encap Curcumin 500",
    "Pure Encap Pancreatic Enzyme",
    "Pure Encap CoQ10 250",
    "Pure Encap Vitamin D3 5000 IU",
    "Pure Encap Iron-C",
    "NMN (Nicotinamide Mononucleotide)",
    "NR (Nicotinamide Riboside)",
    "Spermidine",
    "D-Ribose",
    "HMB (β-Hydroxy-β-Methylbutyrate)",
    "PEA (Palmitoylethanolamide)",
    "Serratiopeptidase",
    "S-Adenosyl-L-Methionine (SAMe)",
    "Tauroursodeoxycholic Acid (TUDCA)",
    "Policosanol",
    "Red-Yeast Rice",
    "Citrus Bergamot Extract",
    "Guggulsterone",
    "Propolis Extract",
    "Bee Pollen",
    "Royal Jelly",
    "Triphala (Indian Herbal Blend)"
]

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            # Test with first 5 supplements
            print("Testing with first 5 supplements...")
            test_results = process_all_supplements(SUPPLEMENTS[:5], "test_supplements.json")
            print(f"\nTest complete! Found products for {len(test_results)} supplements")
        else:
            # Search for specific supplement
            supplement = ' '.join(sys.argv[1:])
            results = search_supplement_serp(supplement)
            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result['brand']} - {result['title']}")
                print(f"   URL: {result['url']}")
                if 'price' in result:
                    print(f"   Price: {result['price']}")
    else:
        print("Processing all 200 supplements...")
        print("This will take approximately 20-30 minutes due to rate limiting")
        print("Progress will be saved every 10 supplements\n")
        
        results = process_all_supplements(SUPPLEMENTS)
        
        print(f"\nComplete! Processed {len(SUPPLEMENTS)} supplements")
        print(f"Results saved to supplement_products.json and supplement_products.csv")
        
        # Summary statistics
        total_products = sum(len(products) for products in results.values())
        print(f"Total products found: {total_products}")
        print(f"Average products per supplement: {total_products / len(SUPPLEMENTS):.1f}") 
