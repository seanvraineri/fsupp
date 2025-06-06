#!/usr/bin/env python3
"""
Automated supplement search script that runs without interactive input.
"""

import os
import sys

# Set environment variables directly
os.environ['SUPABASE_URL'] = 'https://tcptynohlpggtufqanqg.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.3Rn1OQsqZGGqT9SfQ3C5avWEBLIrnJnNi8d8HzYtXiA'

# Check if SERPAPI_API_KEY is already set in environment
if not os.getenv('SERPAPI_API_KEY'):
    print("❌ ERROR: SERPAPI_API_KEY environment variable is required")
    print("Please set it with: export SERPAPI_API_KEY='your_key_here'")
    print("Or run the interactive version: python run_supplement_search.py")
    sys.exit(1)

print("🚀 Starting Automated Supplement Search")
print("=" * 60)
print(f"✅ SUPABASE_URL: {os.environ['SUPABASE_URL']}")
print(f"✅ SUPABASE_SERVICE_ROLE: {'*' * 20}...{os.environ['SUPABASE_SERVICE_ROLE'][-10:]}")
print(f"✅ SERPAPI_API_KEY: {'*' * 20}...{os.getenv('SERPAPI_API_KEY')[-6:]}")
print("=" * 60)

# Configuration (non-interactive)
start_index = 0
batch_size = 5

print(f"\n🎯 Configuration:")
print(f"   Starting from supplement #{start_index}")
print(f"   Saving progress every {batch_size} supplements")
print(f"   Total supplements to process: {200 - start_index}")

print("\n🔍 Starting supplement search process...")
print("=" * 60)

try:
    # Import and run the supplement processor
    from supplement_processor import SupplementProcessor
    
    processor = SupplementProcessor()
    processor.process_all_supplements(start_index=start_index, batch_size=batch_size)
    
except KeyboardInterrupt:
    print("\n⏸️  Search interrupted by user")
except Exception as e:
    print(f"\n💥 Error during search: {e}")
    print("\nCheck the supplement_search.log file for detailed error information")
finally:
    print("\n📊 Search process completed!")
    print("Check the generated JSON files for results") 