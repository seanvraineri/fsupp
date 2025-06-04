#!/usr/bin/env python3
"""
Fast scraper that gathers up to 5 purchase links per supplement using the
already-working `product_fetcher_fixed.fetch_shopping_links` helper.  Results are
written to `product_links.txt` as TAB-separated values:

supplement \t brand \t price \t url

Because this is I/O bound (network), we use a thread pool with ~10 workers to
parallelise the 200×(brands) searches.  Expected runtime with a healthy
SerpAPI quota: ~3-5 minutes.
"""
import os, json, logging, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from supplement_processor import SUPPLEMENTS  # 200-item list
from product_fetcher_fixed import fetch_shopping_links

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

OUTFILE = "product_links.txt"
MAX_LINKS_PER_SUPP = 5
WORKERS = 10


def scrape_one(supp: str):
    try:
        links = fetch_shopping_links(supplement_name=supp, n_links=MAX_LINKS_PER_SUPP)
        return {"supplement": supp, "links": links}
    except Exception as e:
        logging.error(f"Error scraping {supp}: {e}")
        return {"supplement": supp, "links": []}


def main():
    start = time.time()
    logging.info("Starting parallel scrape of supplement product links …")

    if not os.getenv("SERPAPI_API_KEY"):
        logging.error("SERPAPI_API_KEY environment variable not set – aborting.")
        return

    results = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        future_map = {pool.submit(scrape_one, supp): supp for supp in SUPPLEMENTS}
        for fut in as_completed(future_map):
            results.append(fut.result())
            supp = future_map[fut]
            logging.info(f"✓ Finished {supp}")

    # Write TSV
    with open(OUTFILE, "w") as f:
        for res in results:
            supp = res["supplement"]
            for link in res["links"]:
                f.write(f"{supp}\t{link['brand']}\t{link['price']}\t{link['url']}\n")
    logging.info(f"Wrote links for {len(results)} supplements to {OUTFILE}")
    logging.info("Elapsed %.1f s" % (time.time() - start))


if __name__ == "__main__":
    main() 
