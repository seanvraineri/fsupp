#!/usr/bin/env python3
"""
Debug Edge Functions to identify specific issues
"""
import json
import urllib.request
import urllib.parse
import urllib.error
import os
import uuid
from datetime import datetime

# Configuration
SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
    exit(1)

def make_request(url, data=None, method='POST'):
    """Make HTTP request to Supabase with detailed error handling"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode('utf-8')
            try:
                json_body = json.loads(body)
            except:
                json_body = body
            return response.status, json_body
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            json_body = json.loads(body)
        except:
            json_body = body
        return e.code, json_body
    except Exception as e:
        return None, str(e)

def test_ai_chat_detailed():
    """Test ai_chat with detailed debugging"""
    print("\n=== Testing ai_chat with detailed debugging ===")
    
    # Use existing user ID for testing
    test_user_id = "236ad7cd-8b9a-497b-b623-7badd328ce46"
    
    # First, create a test conversation
    conv_url = f"{SUPABASE_URL}/rest/v1/chat_conversations"
    test_conversation_id = str(uuid.uuid4())
    conv_data = {
        "id": test_conversation_id,
        "user_id": test_user_id,
        "title": "Test conversation"
    }
    
    # Create conversation
    status, response = make_request(conv_url, conv_data)
    print(f"Creating test conversation record: Status {status}")
    
    if status == 201:
        # Now create a test message
        msg_url = f"{SUPABASE_URL}/rest/v1/chat_messages"
        test_data = {
            "conversation_id": test_conversation_id,
            "role": "user",
            "content": "Hello, test message"
        }
        
        # Insert a test message
        status, response = make_request(msg_url, test_data)
        print(f"Creating test message: Status {status}")
        
        if status == 201:
            # Now test the function
            fn_url = f"{SUPABASE_URL}/functions/v1/ai_chat"
            fn_data = {
                "conversation_id": test_conversation_id
            }
            
            status, response = make_request(fn_url, fn_data)
            print(f"\nai_chat response status: {status}")
            print(f"Response: {json.dumps(response, indent=2) if isinstance(response, dict) else response}")
            
            # Clean up
            delete_msg_url = f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{test_conversation_id}"
            delete_conv_url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{test_conversation_id}"
            make_request(delete_msg_url, method='DELETE')
            make_request(delete_conv_url, method='DELETE')
        else:
            print(f"Failed to create test message: {response}")
            # Clean up conversation
            delete_conv_url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{test_conversation_id}"
            make_request(delete_conv_url, method='DELETE')
    else:
        print(f"Failed to create test conversation: {response}")

def test_generate_analysis_detailed():
    """Test generate_analysis with detailed debugging"""
    print("\n=== Testing generate_analysis with detailed debugging ===")
    
    # Use existing user ID for testing
    user_id = "236ad7cd-8b9a-497b-b623-7badd328ce46"
    
    # Check if user already has a completed assessment
    check_url = f"{SUPABASE_URL}/rest/v1/health_assessments?user_id=eq.{user_id}&is_complete=eq.true&select=id"
    status, existing = make_request(check_url, method='GET')
    
    if status == 200 and existing:
        print(f"User already has {len(existing)} completed assessment(s)")
        
        # Test the function with existing assessment
        fn_url = f"{SUPABASE_URL}/functions/v1/generate_analysis"
        fn_data = {"user_id": user_id}
        
        status, response = make_request(fn_url, fn_data)
        print(f"\ngenerate_analysis response status: {status}")
        print(f"Response: {json.dumps(response, indent=2) if isinstance(response, dict) else response}")
        
        # Don't delete existing user data
        print("(Not deleting existing user data)")
    else:
        # Create test assessment with correct enum values
        assessment_data = {
            "user_id": user_id,
            "is_complete": True,
            "age": 30,
            "gender": "male",
            "weight_value": 170,
            "weight_unit": "lbs",
            "height_value": 70,
            "height_unit": "inches",
            "health_conditions": ["general wellness"],
            "health_goals": ["improve energy"],
            "allergies": [],
            "current_medications": [],
            "activity_level": "moderately_active",  # Fixed enum value
            "sleep_duration": 7.5,
            "diet_type": "omnivore"  # Fixed enum value
        }
        
        url = f"{SUPABASE_URL}/rest/v1/health_assessments"
        status, response = make_request(url, assessment_data)
        print(f"Creating test assessment: Status {status}")
        
        if status == 201:
            # Now test the function
            fn_url = f"{SUPABASE_URL}/functions/v1/generate_analysis"
            fn_data = {"user_id": user_id}
            
            status, response = make_request(fn_url, fn_data)
            print(f"\ngenerate_analysis response status: {status}")
            print(f"Response: {json.dumps(response, indent=2) if isinstance(response, dict) else response}")
            
            # Clean up only test data
            delete_assessment = f"{SUPABASE_URL}/rest/v1/health_assessments?user_id=eq.{user_id}&age=eq.30"
            delete_analysis = f"{SUPABASE_URL}/rest/v1/ai_analyses?user_id=eq.{user_id}"
            delete_recs = f"{SUPABASE_URL}/rest/v1/supplement_recommendations?user_id=eq.{user_id}"
            
            make_request(delete_recs, method='DELETE')
            make_request(delete_analysis, method='DELETE')
            make_request(delete_assessment, method='DELETE')
        else:
            print(f"Failed to create test assessment: {response}")

def check_env_vars():
    """Check which environment variables the functions expect"""
    print("\n=== Checking environment variable configuration ===")
    
    # Check what env vars are available in the function context
    test_url = f"{SUPABASE_URL}/functions/v1/ai_chat"
    
    # Send a request that will trigger the env var check
    status, response = make_request(test_url, {"conversation_id": "env-test"})
    
    if isinstance(response, dict) and 'error' in response:
        if 'Configuration error' in response.get('error', ''):
            print(f"ai_chat env var error: {response.get('details', 'Unknown')}")
        elif 'Configuration error' in str(response):
            print(f"Configuration issue detected: {response}")

def main():
    print("SupplementScribe Edge Functions Debug Tool")
    print("==========================================")
    print(f"Testing against: {SUPABASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    check_env_vars()
    test_ai_chat_detailed()
    test_generate_analysis_detailed()

if __name__ == "__main__":
    main() 