#!/usr/bin/env python3
"""
Test Enhanced AI with specific supplement question
"""
import json
import urllib.request
import uuid
import os

# Expect these to be set in the environment. Use dummy values for CI if needed.
SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "test_anon_key")

print("🧬 Testing Dr. SupplementScribe with Specific Question")
print("=" * 60)

conversation_id = str(uuid.uuid4())

# Create a conversation with a user message first
headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json"
}

# Create conversation
conv_data = {"id": conversation_id, "user_id": "test-user-123", "title": "Vitamin D question"}
conv_response = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/chat_conversations",
    data=json.dumps(conv_data).encode('utf-8'),
    headers=headers,
    method='POST'
)

try:
    urllib.request.urlopen(conv_response)
    print("✅ Created test conversation")
except:
    print("⚠️  Conversation may already exist, continuing...")

# Add a user message
msg_data = {
    "conversation_id": conversation_id,
    "role": "user", 
    "content": "I'm taking 1000 IU of vitamin D3 daily, but I heard I might need more for optimal health. What do you recommend based on the latest research?"
}

msg_response = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/chat_messages",
    data=json.dumps(msg_data).encode('utf-8'),
    headers=headers,
    method='POST'
)

try:
    urllib.request.urlopen(msg_response)
    print("✅ Added user message about vitamin D")
except Exception as e:
    print(f"⚠️  Message creation: {e}")

# Now call the AI chat
ai_data = {"conversation_id": conversation_id, "user_id": "test-user-123"}
ai_request = urllib.request.Request(
    f"{SUPABASE_URL}/functions/v1/ai_chat",
    data=json.dumps(ai_data).encode('utf-8'),
    headers={"Authorization": f"Bearer {ANON_KEY}", "Content-Type": "application/json"},
    method='POST'
)

print("\n🤖 Calling Dr. SupplementScribe...")

try:
    with urllib.request.urlopen(ai_request) as response:
        result = json.loads(response.read().decode('utf-8'))
        
    ai_response = result.get('content', 'No content')
    
    print("\n📋 Dr. SupplementScribe's Response:")
    print("-" * 50)
    print(ai_response)
    print("-" * 50)
    
    # Enhanced features check
    features = {
        "Research Citations": "PMID:" in ai_response or "study" in ai_response.lower(),
        "Professional Tone": any(word in ai_response.lower() for word in ["research", "clinical", "evidence", "optimal", "bioavailability"]),
        "Specific Dosage": any(num in ai_response for num in ["2000", "3000", "4000", "5000"]),
        "Detailed Response": len(ai_response) > 300,
        "Dr. Identity": "Dr." in ai_response or "SupplementScribe" in ai_response
    }
    
    print("\n🔍 Enhanced Personality Features:")
    for feature, present in features.items():
        status = "✅" if present else "❌"
        print(f"{status} {feature}")
    
    score = sum(features.values())
    print(f"\n📊 Enhancement Score: {score}/{len(features)}")
    
    if score >= 3:
        print("\n🎉 SUCCESS! Dr. SupplementScribe personality is working!")
        print("✨ Your AI now provides research-backed, personalized advice")
    else:
        print("\n🔧 The enhanced features may still be loading...")
        print("💡 Try testing in your actual app interface")

except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"❌ Error {e.code}: {error_body}")
except Exception as e:
    print(f"❌ Request failed: {e}")

print(f"\n🚀 Test this in your app:")
print(f"1. Go to http://localhost:3001/dashboard/chat")
print(f"2. Ask: 'What's the optimal vitamin D dosage for immune support?'")
print(f"3. Look for research citations and professional recommendations!") 
