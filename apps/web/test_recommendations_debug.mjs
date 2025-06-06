import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

async function debugRecommendations() {
  console.log('🔍 Debugging Recommendations System...\n');

  // Get recent health assessments
  console.log('1. Checking recent health assessments...');
  const { data: assessments } = await supabase
    .from('health_assessments')
    .select('user_id, id, health_goals, health_concerns, created_at')
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log(`Found ${assessments?.length || 0} completed assessments:`);
  assessments?.forEach((a, i) => {
    console.log(`  ${i+1}. User: ${a.user_id}, Goals: ${a.health_goals?.join(', ') || 'none'}, Concerns: ${a.health_concerns?.join(', ') || 'none'}`);
  });

  if (!assessments || assessments.length === 0) {
    console.log('❌ No completed health assessments found!');
    return;
  }

  const testUser = assessments[0];
  console.log(`\n2. Testing with most recent user: ${testUser.user_id}`);

  // Check existing recommendations for this user
  console.log('\n3. Checking existing recommendations...');
  const { data: existingRecs } = await supabase
    .from('supplement_recommendations')
    .select('supplement_name, recommendation_reason, created_at')
    .eq('user_id', testUser.user_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  console.log(`Found ${existingRecs?.length || 0} existing recommendations:`);
  existingRecs?.forEach((rec, i) => {
    console.log(`  ${i+1}. ${rec.supplement_name} - ${rec.recommendation_reason}`);
  });

  // Test the generate_analysis function
  console.log('\n4. Testing generate_analysis function...');
  try {
    const { data: result, error } = await supabase.functions.invoke('generate_analysis', {
      body: { user_id: testUser.user_id }
    });

    if (error) {
      console.log('❌ Function error:', error);
    } else {
      console.log('✅ Function succeeded:', result);
    }
  } catch (err) {
    console.log('❌ Function call failed:', err.message);
  }

  // Check if recommendations changed
  console.log('\n5. Checking if recommendations changed...');
  const { data: newRecs } = await supabase
    .from('supplement_recommendations')
    .select('supplement_name, recommendation_reason, created_at')
    .eq('user_id', testUser.user_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  console.log(`Now has ${newRecs?.length || 0} recommendations:`);
  newRecs?.slice(0, 5).forEach((rec, i) => {
    console.log(`  ${i+1}. ${rec.supplement_name} - ${rec.recommendation_reason}`);
  });

  // Check for the specific issue: are recommendations personalized?
  const hasPersonalizedReasons = newRecs?.some(rec => 
    rec.recommendation_reason.includes('health goal') || 
    rec.recommendation_reason.includes('Genetic') ||
    rec.recommendation_reason.includes(testUser.health_goals?.[0]) ||
    rec.recommendation_reason.includes(testUser.health_concerns?.[0])
  );

  console.log('\n📊 ANALYSIS:');
  console.log(`- Assessment has goals: ${testUser.health_goals?.length > 0 ? '✅' : '❌'}`);
  console.log(`- Assessment has concerns: ${testUser.health_concerns?.length > 0 ? '✅' : '❌'}`);
  console.log(`- Recommendations are personalized: ${hasPersonalizedReasons ? '✅' : '❌'}`);

  if (!hasPersonalizedReasons) {
    console.log('\n🔴 ISSUE IDENTIFIED: Recommendations are using generic base data instead of personalized AI analysis!');
    console.log('This means the AI processing (Claude/OpenAI) is failing and falling back to hardcoded recommendations.');
  }
}

debugRecommendations().catch(console.error); 