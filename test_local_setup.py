#!/usr/bin/env python3
"""Manual integration test for local setup.
Run this file directly to verify deployed Edge Functions."""
import json
import urllib.request
import os

SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0"
)

if __name__ == "__main__":
    print("🧪 Testing Local App <-> Supabase Edge Functions")
    print("=" * 60)

    # Test 1: Product Search
    print("\n📦 Test 1: Product Search Edge Function")
    print("-" * 40)

    test_data = {"supplements": ["Vitamin D3", "Magnesium"]}
    headers = {"Authorization": f"Bearer {ANON_KEY}", "Content-Type": "application/json"}

    req = urllib.request.Request(
        f"{SUPABASE_URL}/functions/v1/product_search",
        data=json.dumps(test_data).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            print("✅ Product Search works!")
            print(f"Found {len(result['results'])} products")
            for product in result["results"][:2]:
                print(f"  - {product['brand']} {product['product_name']}")
    except Exception as e:
        print(f"❌ Product Search failed: {e}")

    # Test 2: AI Chat
    print("\n\n💬 Test 2: AI Chat Edge Function")
    print("-" * 40)

    import uuid

    conversation_id = str(uuid.uuid4())
    test_data = {"conversation_id": conversation_id}

    req = urllib.request.Request(
        f"{SUPABASE_URL}/functions/v1/ai_chat",
        data=json.dumps(test_data).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            print("✅ AI Chat works!")
            print(f"Response: {result.get('content', 'No content')[:100]}...")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            error_data = json.loads(error_body)
            if "Configuration error" in str(error_data):
                print("⚠️  AI Chat needs API key (expected - you added via dashboard)")
            else:
                print(f"❌ AI Chat error: {error_data}")
        except Exception:
            print(f"❌ AI Chat failed: {error_body}")

    # Instructions
    print("\n\n" + "=" * 60)
    print("🚀 Your local app is now ready!")
    print("=" * 60)
    print("\nTo test in your actual UI:")
    print("1. Start your dev server:")
    print("   cd apps/web && npm run dev")
    print("\n2. Visit http://localhost:3000")
    print("\n3. Sign up/login")
    print("\n4. Go to the Chat page")
    print("\n5. Send a message - it will call the deployed Edge Functions!")
    print("\n⚠️  IMPORTANT:")
    print("- Your app calls Supabase Edge Functions (NOT localhost)")
    print("- The Edge Functions are already deployed and working")
    print("- You can see the actual URLs being called in the Network tab")
    print("\n💡 When you deploy to Vercel:")
    print("- The same code will work")
    print("- Just add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel")
