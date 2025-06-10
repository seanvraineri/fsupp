#!/usr/bin/env python3
import os

print("Reading .env.local file...")
with open('.env.local', 'r') as f:
    content = f.read()
    for line in content.split('\n'):
        if 'SUPABASE_SERVICE_ROLE_KEY' in line:
            print('Found line:', repr(line))
            if '=' in line:
                key, value = line.split('=', 1)
                print('Key:', repr(key))
                print('Value:', repr(value))
                print('Value length:', len(value))
                print('First 50 chars:', value[:50])
                print('Last 10 chars:', value[-10:])

# Test the supabase connection
from supabase import create_client, Client

def load_env_file():
    env_path = ".env.local"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

print(f"\nUsing Supabase URL: {SUPABASE_URL}")
print(f"Using API key: {SUPABASE_KEY[:50]}...")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase client created successfully")
    
    # Try a simple query
    result = supabase.table('supplement_recommendations').select('id').limit(1).execute()
    print(f"Test query successful: {len(result.data)} rows returned")
    
except Exception as e:
    print(f"Error: {e}") 