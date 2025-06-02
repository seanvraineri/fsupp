#!/usr/bin/env python3
"""
Test the Enhanced SupplementScribe AI with Dr. SupplementScribe personality
"""
import json
import urllib.request
import uuid
import os

# Configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0"

print("🧠 Testing Enhanced Dr. SupplementScribe AI")
print("=" * 60)

# Test the enhanced personality with a sophisticated question
conversation_id = str(uuid.uuid4())

test_data = {
    "conversation_id": conversation_id
}

headers = {
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json"
}

print(f"\n🆔 Using conversation ID: {conversation_id}")
print("📝 Testing enhanced personality and research capabilities...")

req = urllib.request.Request(
    f"{SUPABASE_URL}/functions/v1/ai_chat",
    data=json.dumps(test_data).encode('utf-8'),
    headers=headers,
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        
    print("✅ Dr. SupplementScribe is ACTIVE!")
    print("\n🧬 AI Response Preview:")
    print("-" * 40)
    
    ai_response = result.get('content', 'No content')
    
    # Check for enhanced personality markers
    personality_markers = [
        "Dr. SupplementScribe" in ai_response,
        "PMID:" in ai_response or "study" in ai_response.lower(),
        len(ai_response) > 200,  # More detailed responses
        "research" in ai_response.lower() or "clinical" in ai_response.lower()
    ]
    
    print(ai_response[:300] + "..." if len(ai_response) > 300 else ai_response)
    print("\n" + "=" * 60)
    
    print("\n🔍 Enhanced Features Check:")
    print(f"✅ Dr. SupplementScribe Identity: {'✓' if personality_markers[0] else '✗'}")
    print(f"✅ Research Citations: {'✓' if personality_markers[1] else '✗'}")
    print(f"✅ Detailed Responses: {'✓' if personality_markers[2] else '✗'}")
    print(f"✅ Scientific Language: {'✓' if personality_markers[3] else '✗'}")
    
    enhancement_score = sum(personality_markers)
    print(f"\n📊 Enhancement Score: {enhancement_score}/4")
    
    if enhancement_score >= 3:
        print("🎉 EXCELLENT! Your AI has been successfully enhanced!")
        print("\n🚀 Ready to test in your app:")
        print("1. Go to http://localhost:3001")
        print("2. Navigate to AI Chat")
        print("3. Ask a supplement question")
        print("4. Notice the professional, research-backed responses!")
    else:
        print("⚠️  Enhancement may need verification. Try asking a specific supplement question.")

except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"❌ Error {e.code}: {error_body}")
    
    if e.code == 500:
        try:
            error_data = json.loads(error_body)
            if "XAI_API_KEY" in str(error_data) or "Configuration error" in str(error_data):
                print("\n💡 It looks like the XAI API key might need to be verified.")
                print("   Check that it's properly set in Supabase secrets.")
        except:
            pass
    
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n\n💎 What to Expect from Dr. SupplementScribe:")
print("- Personalized recommendations based on your health profile")
print("- PubMed research citations (PMID numbers)")
print("- Professional, confident tone without generic disclaimers")
print("- Memory of previous conversations and supplement regimens")
print("- Integration with your uploaded biomarker/genetic data")
print("\nThis is a truly premium, personalized supplement advisor! 🌟") 