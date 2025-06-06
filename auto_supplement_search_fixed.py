#!/usr/bin/env python3
"""
Fixed automated supplement search script that finds REAL purchase links.
"""

import os
import sys

# Set environment variables directly
os.environ['SUPABASE_URL'] = 'https://tcptynohlpggtufqanqg.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.3Rn1OQsqZGGqT9SfQ3C5avWEBLIrnJnNi8d8HzYtXiA'
os.environ['SERPAPI_API_KEY'] = '16b57124b51a1eb3542d0b6a5413e5ee39b65a4968c1f40657a15ddc10621f92'

# Check if SERPAPI_API_KEY is set
if not os.getenv('SERPAPI_API_KEY'):
    print("❌ ERROR: SERPAPI_API_KEY environment variable is required")
    sys.exit(1)

# Import the fixed processor that uses the working fetcher
try:
    # First replace the import in supplement_processor.py to use our fixed fetcher
    import supplement_processor
    # Monkey patch to use the fixed fetcher
    from product_fetcher_fixed import fetch_shopping_links
    supplement_processor.fetch_shopping_links = fetch_shopping_links
    
    print("✅ Using FIXED product fetcher that finds REAL links!")
    
except ImportError as e:
    print(f"❌ Failed to import supplement processor: {e}")
    sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting FIXED supplement search with REAL purchase links...")
    print("📊 This will search all 200 supplements across 10 trusted brands")
    print("🔗 Finding actual purchase URLs from brand websites")
    print("💾 Saving results to database and JSON files")
    print("=" * 60)
    
    try:
        # Start the supplement processing
        supplement_processor.main()
    except KeyboardInterrupt:
        print("\n🛑 Search interrupted by user")
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc() 