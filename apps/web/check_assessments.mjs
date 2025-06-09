import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

async function checkAssessments() {
  console.log('🔍 Checking ALL health assessment data...\n');

  // Check all assessments regardless of completion status
  const { data: allAssessments } = await supabase
    .from('health_assessments')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log(`Found ${allAssessments?.length || 0} total health assessments:`);
  
  allAssessments?.forEach((a, i) => {
    console.log(`\n${i+1}. Assessment ID: ${a.id}`);
    console.log(`   User: ${a.user_id}`);
    console.log(`   Complete: ${a.is_complete ? '✅' : '❌'}`);
    console.log(`   Created: ${a.created_at}`);
    console.log(`   Goals: ${a.health_goals?.join(', ') || 'none'}`);
    console.log(`   Concerns: ${a.health_concerns?.join(', ') || 'none'}`);
    console.log(`   Age: ${a.age || 'not set'}`);
    console.log(`   Sex: ${a.sex || 'not set'}`);
  });

  // Check users table to see who exists
  console.log('\n📊 Checking users...');
  const { data: users } = await supabase
    .from('users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`Found ${users?.length || 0} users:`);
  users?.forEach((u, i) => {
    console.log(`  ${i+1}. ${u.email} (${u.id})`);
  });

  // Check for any recommendations that exist
  console.log('\n💊 Checking supplement recommendations...');
  const { data: allRecs } = await supabase
    .from('supplement_recommendations')
    .select('user_id, supplement_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log(`Found ${allRecs?.length || 0} recommendations:`);
  allRecs?.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.supplement_name} for user ${r.user_id}`);
  });
}

checkAssessments().catch(console.error); 