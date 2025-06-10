#!/usr/bin/env node

/**
 * Test script to verify the new edge function flow works correctly
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tcptynohlpggtufqanqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunctions() {
  console.log('🧪 Testing New Edge Function Flow');
  console.log('=' * 50);

  // Test 1: AI Chat Function
  console.log('\n📞 Test 1: AI Chat Function');
  try {
    const { data, error } = await supabase.functions.invoke('ai_chat', {
      body: {
        conversation_id: 'test-conversation-' + Date.now(),
        message: 'Hello, can you help me with supplements?'
      }
    });
    
    if (error) {
      console.log('❌ AI Chat Error:', error);
    } else {
      console.log('✅ AI Chat Success:', data?.response?.slice(0, 100) + '...');
    }
  } catch (err) {
    console.log('❌ AI Chat Exception:', err.message);
  }

  // Test 2: Generate Analysis Function
  console.log('\n🧬 Test 2: Generate Analysis Function');
  try {
    const { data, error } = await supabase.functions.invoke('generate_analysis', {
      body: {
        user_id: 'test-user-' + Date.now()
      }
    });
    
    if (error) {
      console.log('❌ Generate Analysis Error:', error);
    } else {
      console.log('✅ Generate Analysis Success:', data?.success ? 'Analysis generated' : 'No data to analyze');
    }
  } catch (err) {
    console.log('❌ Generate Analysis Exception:', err.message);
  }

  // Test 3: Parse Health Data Function (without actual file)
  console.log('\n📄 Test 3: Parse Health Data Function');
  try {
    const { data, error } = await supabase.functions.invoke('parse_health_data', {
      body: {
        file_id: 'test-file-id',
        user_id: 'test-user-id'
      }
    });
    
    if (error) {
      console.log('✅ Parse Health Data Expected Error (no file):', error.message);
    } else {
      console.log('✅ Parse Health Data Unexpected Success:', data);
    }
  } catch (err) {
    console.log('✅ Parse Health Data Expected Exception:', err.message);
  }

  // Test 4: Embedding Worker Function
  console.log('\n🔍 Test 4: Embedding Worker Function');
  try {
    const { data, error } = await supabase.functions.invoke('embedding_worker', {
      body: {
        items: [{
          user_id: 'test-user',
          source_type: 'test',
          source_id: 'test-id',
          content: 'This is test content for embedding generation'
        }]
      }
    });
    
    if (error) {
      console.log('❌ Embedding Worker Error:', error);
    } else {
      console.log('✅ Embedding Worker Success:', data?.processed_count || 'Processed');
    }
  } catch (err) {
    console.log('❌ Embedding Worker Exception:', err.message);
  }

  console.log('\n🎉 Edge Function Tests Complete!');
  console.log('\nIf you see mostly ✅ marks above, your edge functions are working correctly.');
  console.log('The parse_health_data function should show an expected error since we\'re not providing a real file.');
}

testEdgeFunctions().catch(console.error); 