#!/usr/bin/env python3
"""
Quick test for AI Chat Edge Function
"""
import json
import urllib.request
import uuid
import os

# Configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("❌ Error: Please set SUPABASE_SERVICE_ROLE_KEY environment variable")
    exit(1)

print("🧪 Testing AI Chat Edge Function")
print(f"📍 Endpoint: {SUPABASE_URL}/functions/v1/ai_chat")
print("-" * 50)

# Generate a new conversation ID
conversation_id = str(uuid.uuid4())
print(f"🆔 Using conversation ID: {conversation_id}")

# Test data
test_data = {
    "conversation_id": conversation_id
}

# Make request
headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

data = json.dumps(test_data).encode('utf-8')
req = urllib.request.Request(
    f"{SUPABASE_URL}/functions/v1/ai_chat",
    data=data,
    headers=headers,
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        status = response.status
        result = response.read().decode('utf-8')
        
    print(f"\n✅ Success! Status: {status}")
    response_data = json.loads(result)
    print(f"AI Response: {response_data.get('content', 'No content')[:200]}...")
    
except urllib.error.HTTPError as e:
    print(f"\n❌ Error! Status: {e.code}")
    error_body = e.read().decode('utf-8')
    print(f"Error: {error_body}")
    
    if e.code == 500:
        try:
            error_data = json.loads(error_body)
            if "Configuration error" in str(error_data):
                print("\n⚠️  This error means the API key is not configured in Edge Functions.")
                print("   You said you added it via the dashboard - let me check if it's working...")
            else:
                print(f"\n⚠️  Server error details: {error_data}")
        except:
            print(f"Raw error: {error_body}")
    
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n\n💡 Important Notes:")
print("1. The AI chat is deployed at Supabase, NOT localhost")
print(f"2. Use this URL in your app: {SUPABASE_URL}/functions/v1/ai_chat")
print("3. The function requires a valid conversation_id")
print("4. Make sure your app is NOT calling localhost:3000 or similar") 
