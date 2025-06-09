import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

async function testAIKeys() {
  console.log('🔍 Testing AI API access in Edge Function...\n');
  
  // Create a simple test to trigger the generate_analysis function
  try {
    const { data, error } = await supabase.functions.invoke('generate_analysis', {
      body: { user_id: 'test' }
    });
    
    console.log('Edge Function Response:', JSON.stringify(data, null, 2));
    if (error) {
      console.log('Edge Function Error:', JSON.stringify(error, null, 2));
    }
    
  } catch (err) {
    console.error('Error calling Edge Function:', err);
  }
}

testAIKeys(); 