import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0'
);

async function checkAssessments() {
  console.log('🔍 Checking database with ANON KEY (like web app)...\n');

  // Check all assessments regardless of completion status
  const { data: allAssessments, error: assessError } = await supabase
    .from('health_assessments')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log(`Found ${allAssessments?.length || 0} total health assessments:`, assessError);
  
  allAssessments?.forEach((a, i) => {
    console.log(`\n${i+1}. Assessment ID: ${a.id}`);
    console.log(`   User: ${a.user_id}`);
    console.log(`   Complete: ${a.is_complete ? '✅' : '❌'}`);
    console.log(`   Created: ${a.created_at}`);
    console.log(`   Goals: ${a.health_goals?.join(', ') || 'none'}`);
    console.log(`   Concerns: ${a.health_conditions?.join(', ') || 'none'}`);
    console.log(`   Age: ${a.age || 'not set'}`);
    console.log(`   Gender: ${a.gender || 'not set'}`);
  });

  // Check for any recommendations that exist (including the IDs from logs)
  console.log('\n💊 Checking supplement recommendations...');
  const testIds = [
    '027af194-9fd5-4989-805a-bbad08f2d1e1',
    '95067d86-9485-42c2-8d29-462c2847b6f9', 
    'ee134bc5-08e6-4cee-8ca1-d5ac9d32692e',
    'b42c0789-5f7d-48cf-8bfb-28e3932b7c4c',
    '41b709a4-4520-4637-976b-55de5b52a0a5'
  ];
  
  for (const id of testIds) {
    const { data: rec, error } = await supabase
      .from('supplement_recommendations')
      .select('supplement_name, recommendation_reason, user_id, created_at')
      .eq('id', id)
      .maybeSingle();
    
    if (rec) {
      console.log(`✅ Found rec ${id}: ${rec.supplement_name} - ${rec.recommendation_reason}`);
    } else if (error) {
      console.log(`❌ Error checking ${id}:`, error.message);
    } else {
      console.log(`❓ No rec found for ${id}`);
    }
  }

  // Check all recommendations without filtering
  const { data: allRecs, error: recsError } = await supabase
    .from('supplement_recommendations')
    .select('user_id, supplement_name, recommendation_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log(`\nAll recommendations:`, recsError);
  allRecs?.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.supplement_name} for user ${r.user_id} - ${r.recommendation_reason}`);
  });

  // Check auth status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('\n🔐 Auth status:', user ? `Logged in as ${user.email}` : 'Not logged in', authError);
}

checkAssessments().catch(console.error); 