#!/usr/bin/env python3

import requests
import json
import time

# Test configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTQ0OTAsImV4cCI6MjA2MzIzMDQ5MH0.Xqtf6JJSSwHaYDj2tnX3CkYa4KxNMpRmFy-2dN6Ld4c"

def test_ai_chat_with_supplements():
    """Test AI chat with supplement recommendations to check if product links are automatically added."""
    
    print("🧪 Testing AI Chat with Automatic Product Links Integration")
    print("=" * 60)
    
    # Test message that should trigger supplement recommendations
    test_message = "I'm feeling tired and want to improve my energy levels. What supplements would you recommend?"
    
    url = f"{SUPABASE_URL}/functions/v1/ai_chat"
    headers = {
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": test_message,
        "user_id": "test-user-123",
        "conversation_id": None
    }
    
    print(f"📤 Sending test message: {test_message}")
    print(f"🔗 URL: {url}")
    
    start_time = time.time()
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        duration = time.time() - start_time
        
        print(f"⏱️  Response time: {duration:.2f} seconds")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ SUCCESS - AI Chat Response Received")
            print("-" * 40)
            
            # Check response structure
            if 'message' in data:
                message = data['message']
                print(f"📝 Response length: {len(message)} characters")
                
                # Check if product links were added
                if '🛒 Recommended Products' in message:
                    print("✅ Product links section found!")
                    
                    # Count the number of product links
                    link_count = message.count('](http')
                    print(f"🔗 Number of product links: {link_count}")
                    
                    # Extract the products section
                    if '## 🛒 Recommended Products' in message:
                        products_section = message.split('## 🛒 Recommended Products')[1]
                        print("\n📦 Product Links Section:")
                        print("-" * 30)
                        print(products_section[:500] + "..." if len(products_section) > 500 else products_section)
                else:
                    print("⚠️  No product links section found in response")
                
                # Check for mentioned supplements
                if 'mentioned_supplements' in data:
                    supplements = data['mentioned_supplements']
                    print(f"\n🌿 Mentioned supplements: {supplements}")
                
                if 'product_links_added' in data:
                    links_added = data['product_links_added']
                    print(f"🔗 Product links added: {links_added}")
                
                # Display first part of the AI response
                print(f"\n🤖 AI Response Preview:")
                print("-" * 30)
                ai_response = message.split('## 🛒 Recommended Products')[0] if '## 🛒 Recommended Products' in message else message
                print(ai_response[:300] + "..." if len(ai_response) > 300 else ai_response)
                
            else:
                print("❌ No 'message' field in response")
                print(f"Response data: {data}")
                
        else:
            print(f"❌ ERROR - Status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT - Request took longer than 30 seconds")
    except requests.exceptions.RequestException as e:
        print(f"❌ REQUEST ERROR: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON DECODE ERROR: {e}")
        print(f"Raw response: {response.text}")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

def test_specific_supplement_query():
    """Test with a specific supplement to verify product link lookup."""
    
    print("\n" + "=" * 60)
    print("🧪 Testing Specific Supplement Query")
    print("=" * 60)
    
    test_message = "What's the best vitamin D3 supplement and dosage for immune support?"
    
    url = f"{SUPABASE_URL}/functions/v1/ai_chat"
    headers = {
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": test_message,
        "user_id": "test-user-456",
        "conversation_id": None
    }
    
    print(f"📤 Sending test message: {test_message}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            message = data.get('message', '')
            
            # Check for vitamin D3 product links
            if 'vitamin d' in message.lower() and '🛒' in message:
                print("✅ Vitamin D3 product links found!")
                
                # Extract brands mentioned
                brands = []
                for brand in ['Thorne', 'Pure Encapsulations', 'NOW Foods', 'Life Extension', 'Designs for Health']:
                    if brand in message:
                        brands.append(brand)
                
                if brands:
                    print(f"🏷️  Brands mentioned: {', '.join(brands)}")
                else:
                    print("⚠️  No specific brands found in response")
                    
            else:
                print("⚠️  No product links found for vitamin D3")
                
        else:
            print(f"❌ ERROR - Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_ai_chat_with_supplements()
    test_specific_supplement_query()
    
    print("\n" + "=" * 60)
    print("🎉 Test Complete!")
    print("=" * 60)
    print("\n💡 What to check:")
    print("1. ✅ AI responses should include specific supplement recommendations")
    print("2. ✅ Product links should be automatically added when supplements are mentioned")
    print("3. ✅ Links should be properly formatted with brand names and URLs")
    print("4. ✅ Response should be comprehensive and research-backed")
    print("5. ✅ Product section should be clearly separated with 🛒 emoji") 