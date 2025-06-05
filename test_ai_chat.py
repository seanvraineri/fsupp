#!/usr/bin/env python3
"""
Test AI Chat Edge Function
"""
import json
import sys, os, pytest, requests # type: ignore
import uuid

# Configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# If you don't have the anon key, you can use the service role key for testing
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY and not SUPABASE_ANON_KEY:
    print("❌ Error: Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable")
    exit(1)

# Use whichever key is available
API_KEY = SUPABASE_ANON_KEY if SUPABASE_ANON_KEY else SUPABASE_KEY

# skip if no internet
if os.getenv("CI_SKIP_NETWORK_TESTS", "1") == "1":
    pytest.skip("Skipping ai_chat network test", allow_module_level=True)

def test_ai_chat():
    """Test the AI chat function"""
    print("🧪 Testing AI Chat Edge Function")
    print(f"📍 Endpoint: {SUPABASE_URL}/functions/v1/ai_chat")
    print("-" * 50)
    
    # Generate a new conversation ID
    conversation_id = str(uuid.uuid4())
    print(f"🆔 Using conversation ID: {conversation_id}")
    
    # Test data
    test_message = {
        "conversation_id": conversation_id
    }
    
    # Make request
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("\n📤 Sending request...")
    print(f"Headers: {json.dumps({k: v[:20] + '...' if k == 'Authorization' else v for k, v in headers.items()}, indent=2)}")
    print(f"Body: {json.dumps(test_message, indent=2)}")
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/ai_chat",
            headers=headers,
            json=test_message
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"AI Response: {data.get('content', 'No content')[:200]}...")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
            if response.status_code == 500:
                error_data = response.json() if response.text else {}
                if "Configuration error" in str(error_data):
                    print("\n⚠️  The AI chat requires an API key to be configured.")
                    print("   Please ensure OPENAI_API_KEY or ANTHROPIC_API_KEY is set in Edge Function secrets.")
                elif "missing conversation_id" in str(error_data):
                    print("\n⚠️  The conversation_id is required.")
                else:
                    print(f"\n⚠️  Server error: {error_data}")
            elif response.status_code == 401:
                print("\n⚠️  Authentication error. Check your API key.")
            elif response.status_code == 404:
                print("\n⚠️  Edge Function not found. Make sure it's deployed.")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_with_message():
    """Test the AI chat with an actual message"""
    print("\n\n🧪 Testing AI Chat with Message")
    print("-" * 50)
    
    # Create a conversation in the database first
    conversation_id = str(uuid.uuid4())
    user_id = "test-user-" + str(uuid.uuid4())
    
    # Create conversation
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Insert test conversation
    conv_data = {
        "id": conversation_id,
        "user_id": user_id
    }
    
    print(f"📝 Creating test conversation: {conversation_id}")
    conv_response = requests.post(
        f"{SUPABASE_URL}/rest/v1/chat_conversations",
        headers=headers,
        json=conv_data
    )
    
    if conv_response.status_code == 201:
        print("✅ Conversation created")
        
        # Insert a user message
        message_data = {
            "conversation_id": conversation_id,
            "role": "user",
            "content": "What are the benefits of vitamin D3 supplementation?"
        }
        
        msg_response = requests.post(
            f"{SUPABASE_URL}/rest/v1/chat_messages",
            headers=headers,
            json=message_data
        )
        
        if msg_response.status_code == 201:
            print("✅ User message added")
            
            # Now test AI chat
            test_message = {
                "conversation_id": conversation_id,
                "user_id": user_id
            }
            
            print("\n📤 Calling AI chat...")
            response = requests.post(
                f"{SUPABASE_URL}/functions/v1/ai_chat",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json=test_message
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI Response received!")
                print(f"\nAI says: {data.get('content', 'No content')}")
            else:
                print(f"❌ AI chat error: {response.status_code}")
                print(f"Response: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("SupplementScribe AI Chat Test")
    print("=" * 60)
    
    # First test without conversation
    test_ai_chat()
    
    # Then test with proper conversation setup
    test_with_message()
    
    print("\n\n💡 Note: The AI chat is deployed at:")
    print(f"   {SUPABASE_URL}/functions/v1/ai_chat")
    print("   NOT on localhost!")
    print("\n   Make sure your app is calling the Supabase Edge Function URL,"
          "\n   not a local development server.") 
