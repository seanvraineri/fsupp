#!/usr/bin/env python3
"""
Script to run the comprehensive supplement search with proper environment setup.
"""

import os
import sys
import subprocess

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://tcptynohlpggtufqanqg.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.3Rn1OQsqZGGqT9SfQ3C5avWEBLIrnJnNi8d8HzYtXiA'

# Check if SERPAPI_API_KEY is provided
serpapi_key = input("Enter your SERPAPI_API_KEY (get one free at https://serpapi.com): ")
if not serpapi_key.strip():
    print("❌ SERPAPI_API_KEY is required to search for products")
    print("Please get a free API key from https://serpapi.com and run again")
    sys.exit(1)

os.environ['SERPAPI_API_KEY'] = serpapi_key.strip()

print("🚀 Starting Comprehensive Supplement Search")
print("=" * 60)
print(f"✅ SUPABASE_URL: {os.environ['SUPABASE_URL']}")
print(f"✅ SUPABASE_SERVICE_ROLE: {'*' * 20}...{os.environ['SUPABASE_SERVICE_ROLE'][-10:]}")
print(f"✅ SERPAPI_API_KEY: {'*' * 20}...{serpapi_key[-6:]}")
print("=" * 60)

# Ask for batch size and starting point
print("\nConfiguration Options:")
start_index = input("Start from supplement index (0-199, default 0): ").strip()
if start_index:
    try:
        start_index = int(start_index)
        if start_index < 0 or start_index >= 200:
            raise ValueError("Index must be between 0-199")
    except ValueError as e:
        print(f"❌ Invalid start index: {e}")
        sys.exit(1)
else:
    start_index = 0

batch_size = input("Batch size for progress saves (default 5): ").strip()
if batch_size:
    try:
        batch_size = int(batch_size)
        if batch_size < 1 or batch_size > 50:
            raise ValueError("Batch size must be between 1-50")
    except ValueError as e:
        print(f"❌ Invalid batch size: {e}")
        sys.exit(1)
else:
    batch_size = 5

print(f"\n🎯 Configuration:")
print(f"   Starting from supplement #{start_index}")
print(f"   Saving progress every {batch_size} supplements")
print(f"   Total supplements to process: {200 - start_index}")

confirm = input("\nStart the search? (y/N): ").strip().lower()
if confirm != 'y':
    print("Search cancelled.")
    sys.exit(0)

# Run the supplement processor
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