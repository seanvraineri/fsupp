#!/usr/bin/env node

/**
 * Test edge functions with proper UUID formats
 */

// Using built-in fetch in Node.js 18+
import { randomUUID } from 'crypto';

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
    console.log(`Response:`, text.slice(0, 200) + (text.length > 200 ? '...' : ''));
    
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
  console.log('🔍 Testing Edge Functions with Valid UUIDs');
  console.log('='.repeat(60));

  const testUserId = randomUUID();
  const testConversationId = randomUUID();
  const testFileId = randomUUID();
  const testSourceId = randomUUID();

  console.log(`Using test user ID: ${testUserId}`);

  // Test generate_analysis with a valid UUID
  await testFunction('generate_analysis', {
    user_id: testUserId
  });

  // Test ai_chat with valid UUIDs
  await testFunction('ai_chat', {
    conversation_id: testConversationId,
    message: 'Hello, can you help me with supplements?'
  });

  // Test parse_health_data with valid UUIDs (should still fail since file doesn't exist)
  await testFunction('parse_health_data', {
    file_id: testFileId,
    user_id: testUserId
  });

  // Test embedding_worker with valid UUID
  await testFunction('embedding_worker', {
    items: [{
      user_id: testUserId,
      source_type: 'test',
      source_id: testSourceId,
      content: 'This is test content for embedding generation'
    }]
  });

  console.log('\n🏁 Test complete!');
  console.log('\nIf you see "success" or meaningful error messages, the functions are working correctly.');
}

runTests().catch(console.error); 