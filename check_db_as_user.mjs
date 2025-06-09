import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0'
);

async function checkDB() {
  console.log('🔍 Checking database with ANON key (like web app)...\n');

  // Check for specific recommendation IDs from the logs
  const testIds = [
    '027af194-9fd5-4989-805a-bbad08f2d1e1',
    '95067d86-9485-42c2-8d29-462c2847b6f9',
    'ee134bc5-08e6-4cee-8ca1-d5ac9d32692e'
  ];
  
  console.log('Checking specific recommendation IDs from logs:');
  for (const id of testIds) {
    const { data: rec, error } = await supabase
      .from('supplement_recommendations')
      .select('supplement_name, recommendation_reason, user_id, created_at')
      .eq('id', id)
      .maybeSingle();
    
    if (rec) {
      console.log(`✅ Found: ${rec.supplement_name}`);
      console.log(`   Reason: ${rec.recommendation_reason}`);
      console.log(`   User: ${rec.user_id}`);
      console.log(`   Created: ${rec.created_at}`);
    } else if (error) {
      console.log(`❌ RLS/Auth error for ${id}: ${error.message}`);
    } else {
      console.log(`❓ No recommendation found for ${id}`);
    }
    console.log('');
  }

  // Check auth status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('🔐 Auth status:', user ? `Logged in as ${user.email} (${user.id})` : 'Not logged in');
  if (authError) console.log('Auth error:', authError.message);

  // Try to get any recommendations at all
  console.log('\n📊 Checking for ANY recommendations...');
  const { data: anyRecs, error: recsError } = await supabase
    .from('supplement_recommendations')
    .select('id, supplement_name, user_id, created_at')
    .limit(5);
  
  if (recsError) {
    console.log('❌ Error fetching recommendations:', recsError.message);
  } else {
    console.log(`Found ${anyRecs?.length || 0} recommendations`);
    anyRecs?.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.supplement_name} (${r.id}) for user ${r.user_id}`);
    });
  }
}

checkDB().catch(console.error); 