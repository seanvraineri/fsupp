#!/usr/bin/env node

/**
 * Simple test to see what error messages the edge functions are returning
 */

// Using built-in fetch in Node.js 18+

const SUPABASE_URL = 'https://tcptynohlpggtufqanqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0';

async function testFunction(functionName, body) {
  console.log(`\n🧪 Testing ${functionName}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, text);
    
    if (response.ok) {
      console.log('✅ Success');
    } else {
      console.log('❌ Error');
    }
    
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

async function runTests() {
  console.log('🔍 Testing Edge Functions with Detailed Error Messages');
  console.log('='.repeat(60));

  // Test generate_analysis with a simple request
  await testFunction('generate_analysis', {
    user_id: 'test-user-123'
  });

  // Test ai_chat with a simple request
  await testFunction('ai_chat', {
    conversation_id: 'test-conv-123',
    message: 'Hello'
  });

  // Test parse_health_data with expected error
  await testFunction('parse_health_data', {
    file_id: 'nonexistent-file',
    user_id: 'test-user-123'
  });

  // Test embedding_worker
  await testFunction('embedding_worker', {
    items: [{
      user_id: 'test-user',
      source_type: 'test',
      source_id: 'test-id',
      content: 'test content'
    }]
  });

  console.log('\n🏁 Test complete!');
}

runTests().catch(console.error); 