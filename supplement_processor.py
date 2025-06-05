"""
Comprehensive supplement processor for finding specific product links.

This script processes all 200 supplements and finds exact product links
from trusted brands using the enhanced product_fetcher module.
"""

import os
import time
import logging
import json
from typing import List, Dict, Any
from datetime import datetime

from product_fetcher import fetch_shopping_links, upsert_product_links

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('supplement_search.log'),
        logging.StreamHandler()
    ]
)

# Complete list of 200 supplements
SUPPLEMENTS = [
    # Vitamins (1-30)
    "Vitamin A (retinyl palmitate)",
    "Beta-carotene",
    "Vitamin C (ascorbic acid)",
    "Liposomal Vitamin C",
    "Vitamin D3 + K2",
    "Vitamin D3 (cholecalciferol)",
    "Vitamin K2 MK-7",
    "Vitamin E (mixed tocopherols)",
    "Vitamin E tocotrienols",
    "Vitamin B1 (thiamine HCl)",
    "Benfotiamine",
    "Vitamin B2 (riboflavin-5-phosphate)",
    "Vitamin B3 (niacin)",
    "Niacinamide",
    "Inositol hexanicotinate",
    "NMN (NAD⁺ precursor)",
    "Vitamin B5 (pantothenic acid)",
    "Vitamin B6 (pyridoxal-5-phosphate)",
    "Vitamin B7 (biotin)",
    "Folic acid (B9)",
    "L-Methylfolate (5-MTHF)",
    "Folinic acid",
    "Vitamin B12 (cyanocobalamin)",
    "Methylcobalamin",
    "Hydroxocobalamin",
    "Adenosylcobalamin",
    "Choline bitartrate",
    "Phosphatidylcholine",
    "Betaine (TMG)",
    "Trimethylglycine (TMG, anhydrous)",
    
    # Macro- & Trace-Minerals (31-52)
    "Magnesium glycinate",
    "Magnesium malate",
    "Magnesium threonate",
    "Magnesium citrate",
    "Zinc picolinate",
    "Zinc bisglycinate",
    "Selenium (selenomethionine)",
    "Copper bisglycinate",
    "Manganese chelate",
    "Chromium picolinate",
    "Molybdenum glycinate",
    "Boron",
    "Iodine (potassium iodide)",
    "Potassium citrate",
    "Potassium bicarbonate",
    "Sodium bicarbonate",
    "Calcium citrate",
    "Calcium hydroxyapatite",
    "Iron bisglycinate",
    "Lithium orotate",
    "Vanadium",
    "Trace-mineral complex",
    
    # Amino Acids & Thiols (53-84)
    "L-glutamine",
    "L-arginine",
    "L-citrulline",
    "Taurine",
    "Glycine",
    "Beta-alanine",
    "L-theanine",
    "L-tryptophan",
    "5-HTP",
    "L-tyrosine",
    "N-acetyl-L-tyrosine",
    "L-carnitine tartrate",
    "Acetyl-L-carnitine",
    "L-ornithine",
    "L-lysine",
    "L-histidine",
    "L-proline",
    "D-aspartic acid",
    "Creatine monohydrate",
    "Hydrolyzed collagen peptides",
    "Leucine",
    "Isoleucine",
    "Valine",
    "SAMe (S-adenosyl-methionine)",
    "Glutathione (reduced)",
    "NAC (N-acetyl-cysteine)",
    "N-acetyl-L-glutamate",
    "Betaine HCl",
    "Carnosine",
    "L-serine",
    "GlyNAC (glycine + NAC)",
    
    # Lipids & Fatty-Acid Derivatives (85-100)
    "Fish-oil (omega-3 EPA + DHA)",
    "Krill oil",
    "Algal DHA",
    "Phosphatidylserine",
    "MCT oil (C8 caprylic)",
    "CLA (conjugated linoleic acid)",
    "Evening-primrose oil (GLA)",
    "Borage oil",
    "Flaxseed oil",
    "Alpha-linolenic acid (ALA)",
    "Arachidonic acid",
    "Phosphatidylinositol",
    "Sphingomyelin",
    "Lecithin granules",
    "Sea-buckthorn oil (omega-7)",
    "Ubiquinol CoQ10",
    
    # Herbal Adaptogens & Botanicals (101-140)
    "Ashwagandha (KSM-66)",
    "Rhodiola rosea",
    "Panax ginseng",
    "American ginseng",
    "Siberian ginseng (eleuthero)",
    "Holy basil (tulsi)",
    "Bacopa monnieri",
    "Lion's Mane mushroom",
    "Cordyceps militaris",
    "Reishi mushroom",
    "Turkey-tail mushroom",
    "Maca root",
    "Shilajit",
    "Schisandra chinensis",
    "Astragalus membranaceus",
    "Ginkgo biloba",
    "Gotu kola",
    "Saffron extract",
    "Moringa oleifera",
    "Resveratrol",
    "PQQ",
    "Pterostilbene",
    "Olive-leaf extract",
    "Milk-thistle (silymarin)",
    "Turmeric (curcumin C3)",
    "Ginger extract",
    "Green-tea extract (EGCG)",
    "Black-seed oil",
    "Berberine HCl",
    "Fenugreek seed",
    "Saw palmetto",
    "Quercetin",
    "Rutin",
    "Hesperidin",
    "Pycnogenol (pine-bark)",
    "French-grape-seed extract",
    "Cinnamon bark",
    "Artichoke leaf",
    "Alpha-lipoic acid (ALA)",
    "Coenzyme Q10 (ubiquinone)",
    
    # Cognitive / Antioxidant & Misc. Actives (141-170)
    "Alpha-GPC",
    "CDP-choline (citicoline)",
    "Huperzine A",
    "Vinpocetine",
    "Lutein",
    "Zeaxanthin",
    "Astaxanthin",
    "Hydroxytyrosol",
    "Ergothioneine",
    "Beta-glucan (1,3/1,6)",
    "Melatonin",
    "Serrapeptase",
    "Bromelain",
    "Multi-digestive-enzyme blend",
    "Probiotic L. acidophilus",
    "Probiotic B. longum",
    "Saccharomyces boulardii",
    "Inulin (prebiotic)",
    "Psyllium husk",
    "Acacia-fiber",
    "DHEA (micronised)",
    "Pregnenolone",
    "Indole-3-carbinol (I3C)",
    "DIM",
    "Myo-inositol",
    "D-chiro-inositol",
    "Vanadyl sulfate",
    "Glucosamine sulfate",
    "Chondroitin sulfate",
    "MSM (methyl-sulfonyl-methane)",
    
    # Performance, Detox & "Edge-Case" Extras (171-200)
    "Collagen type II",
    "Hyaluronic acid",
    "HMB (β-hydroxy β-methyl-butyrate)",
    "Peak ATP",
    "Beet-root powder",
    "Citrulline malate",
    "Chlorophyll (sodium-copper chlorophyllin)",
    "Spirulina",
    "Chlorella",
    "Nattokinase",
    "Quercetin phytosome",
    "Boswellia serrata",
    "Salicin (white-willow bark)",
    "GABA",
    "Phenibut",
    "Magnesium L-threonate",
    "Sulforaphane (broccoli-sprout extract)",
    "Vitamin K2 MK-4",
    "Sesamin",
    "Gamma-oryzanol",
    "Hordenine",
    "Theacrine",
    "Dynamine (methylliberine)",
    "Beta-sitosterol",
    "Policosanol",
    "Red-yeast rice",
    "Citrus bergamot",
    "Lycopene",
    "Oregano oil",
    "Trace-mineral complex (fulvic/humic)"
]

class SupplementProcessor:
    """Main class for processing all supplements and finding product links."""
    
    def __init__(self):
        """Initialize processor with results tracking."""
        self.results = {}
        self.successful_searches = 0
        self.failed_searches = 0
        self.total_links_found = 0
        
    def process_supplement(self, supplement: str, max_links: int = 5) -> Dict[str, Any]:
        """
        Process a single supplement to find product links.
        
        Args:
            supplement: Name of the supplement
            max_links: Maximum number of links to find
            
        Returns:
            Dictionary with results
        """
        logging.info(f"Processing: {supplement}")
        
        try:
            # Search for product links
            links = fetch_shopping_links(supplement, n_links=max_links)
            
            if links:
                # Store in database
                upsert_product_links(supplement, links)
                
                result = {
                    "supplement": supplement,
                    "status": "success",
                    "links_found": len(links),
                    "links": links,
                    "timestamp": datetime.now().isoformat()
                }
                
                self.successful_searches += 1
                self.total_links_found += len(links)
                
                logging.info(f"✅ Found {len(links)} links for {supplement}")
                for i, link in enumerate(links[:3], 1):  # Log first 3 links
                    logging.info(f"   {i}. {link['brand']}: ${link['price']:.2f} - {link['url']}")
                
            else:
                result = {
                    "supplement": supplement,
                    "status": "no_results",
                    "links_found": 0,
                    "links": [],
                    "timestamp": datetime.now().isoformat()
                }
                self.failed_searches += 1
                logging.warning(f"❌ No links found for {supplement}")
                
        except Exception as e:
            result = {
                "supplement": supplement,
                "status": "error",
                "error": str(e),
                "links_found": 0,
                "links": [],
                "timestamp": datetime.now().isoformat()
            }
            self.failed_searches += 1
            logging.error(f"💥 Error processing {supplement}: {e}")
        
        return result
    
    def process_all_supplements(self, start_index: int = 0, batch_size: int = 10) -> None:
        """
        Process all supplements in batches.
        
        Args:
            start_index: Index to start from (for resuming)
            batch_size: Number of supplements to process before saving progress
        """
        logging.info(f"Starting supplement processing from index {start_index}")
        logging.info(f"Total supplements to process: {len(SUPPLEMENTS) - start_index}")
        
        for i in range(start_index, len(SUPPLEMENTS)):
            supplement = SUPPLEMENTS[i]
            
            # Process the supplement
            result = self.process_supplement(supplement)
            self.results[supplement] = result
            
            # Save progress every batch_size supplements
            if (i + 1) % batch_size == 0:
                self.save_progress(i + 1)
                logging.info(f"Completed batch ending at index {i}")
                
            # Rate limiting between supplements
            time.sleep(1.0)  # 1 second between supplements
        
        # Save final results
        self.save_progress(len(SUPPLEMENTS))
        self.print_summary()
    
    def save_progress(self, current_index: int) -> None:
        """Save current progress to file."""
        progress_data = {
            "current_index": current_index,
            "successful_searches": self.successful_searches,
            "failed_searches": self.failed_searches,
            "total_links_found": self.total_links_found,
            "results": self.results,
            "timestamp": datetime.now().isoformat()
        }
        
        filename = f"supplement_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(progress_data, f, indent=2)
        
        logging.info(f"Progress saved to {filename}")
    
    def print_summary(self) -> None:
        """Print final summary of results."""
        total_processed = self.successful_searches + self.failed_searches
        success_rate = (self.successful_searches / total_processed * 100) if total_processed > 0 else 0
        
        print("\n" + "="*80)
        print("🎯 SUPPLEMENT PROCESSING SUMMARY")
        print("="*80)
        print(f"Total Supplements Processed: {total_processed}")
        print(f"Successful Searches: {self.successful_searches}")
        print(f"Failed Searches: {self.failed_searches}")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Product Links Found: {self.total_links_found}")
        avg_links = (self.total_links_found / self.successful_searches) if self.successful_searches else 0
        print(f"Average Links per Successful Search: {avg_links:.1f}")
        print("="*80)
        
        # Show top performing supplements
        successful_supplements = [
            (supp, data["links_found"]) 
            for supp, data in self.results.items() 
            if data["status"] == "success"
        ]
        successful_supplements.sort(key=lambda x: x[1], reverse=True)
        
        print("\n🏆 TOP 10 SUPPLEMENTS BY LINKS FOUND:")
        for i, (supplement, count) in enumerate(successful_supplements[:10], 1):
            print(f"{i:2d}. {supplement}: {count} links")
        
        # Show failed supplements
        failed_supplements = [
            supp for supp, data in self.results.items() 
            if data["status"] in ["no_results", "error"]
        ]
        
        if failed_supplements:
            print(f"\n❌ SUPPLEMENTS WITH NO RESULTS ({len(failed_supplements)}):")
            for supplement in failed_supplements[:10]:  # Show first 10
                print(f"   • {supplement}")
            if len(failed_supplements) > 10:
                print(f"   ... and {len(failed_supplements) - 10} more")


def main():
    """Main function to run the supplement processing."""
    print("🚀 Starting Comprehensive Supplement Product Link Search")
    print("🎯 Target: 200 supplements from 10 trusted brands")
    print("⚡ Enhanced specificity - NO fallback searches")
    print("-" * 60)
    
    # Check environment variables
    required_env_vars = ["SERPAPI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these variables before running the script.")
        return
    
    processor = SupplementProcessor()
    
    try:
        # Process all supplements
        processor.process_all_supplements(start_index=0, batch_size=5)
        
    except KeyboardInterrupt:
        print("\n⏸️  Processing interrupted by user")
        processor.save_progress(len(processor.results))
        processor.print_summary()
        
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        processor.save_progress(len(processor.results))
        processor.print_summary()


if __name__ == "__main__":
    main() 
