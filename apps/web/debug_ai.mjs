import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

async function debug() {
  console.log('🔍 Debugging AI personalization failure...\n');
  
  // Find recent recommendations
  const { data: recs } = await supabase
    .from('supplement_recommendations')
    .select('user_id, supplement_name, recommendation_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (!recs || recs.length === 0) {
    console.log('❌ No recommendations found!');
    return;
  }

  const userId = recs[0].user_id;
  console.log(`📋 Testing with user: ${userId}`);
  console.log('Current recommendations:');
  recs.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.supplement_name}: ${r.recommendation_reason}`);
  });

  // Check assessment
  const { data: assessment } = await supabase
    .from('health_assessments')
    .select('health_goals, health_conditions, age, gender')
    .eq('user_id', userId)
    .single();

  if (assessment) {
    console.log(`\n📊 User profile:`);
    console.log(`   Goals: ${assessment.health_goals?.join(', ') || 'none'}`);
    console.log(`   Conditions: ${assessment.health_conditions?.join(', ') || 'none'}`);
  }

  // Test generate_analysis
  console.log('\n🔧 Testing generate_analysis function...');
  const { data: result, error } = await supabase.functions.invoke('generate_analysis', {
    body: { user_id: userId }
  });

  if (error) {
    console.log('❌ Function error:', error);
    return;
  }
  
  console.log('✅ Function result:', result);

  // Check AI analysis record
  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select('model_name, overall_confidence, analysis_summary, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (analyses && analyses[0]) {
    const analysis = analyses[0];
    console.log(`\n🤖 AI Analysis:`);
    console.log(`   Model: ${analysis.model_name}`);
    console.log(`   Confidence: ${analysis.overall_confidence}`);
    console.log(`   Created: ${analysis.created_at}`);
    console.log(`   Summary: ${analysis.analysis_summary?.substring(0, 150)}...`);
    
    // Check if it's using AI or rule-based fallback
    if (analysis.model_name === 'rule-based') {
      console.log('\n🔴 PROBLEM IDENTIFIED: Using rule-based fallback!');
      console.log('   This means Claude/OpenAI API calls are failing.');
    } else if (analysis.model_name.includes('claude') || analysis.model_name.includes('gpt')) {
      console.log('\n🟡 AI model used, but recommendations may still be generic due to prompt issues.');
    }
  }

  // Check newest recommendations 
  const { data: newRecs } = await supabase
    .from('supplement_recommendations')
    .select('supplement_name, recommendation_reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log(`\n💊 Updated recommendations (${newRecs?.length || 0}):`);
  newRecs?.forEach((rec, i) => {
    const isGeneric = rec.recommendation_reason.includes('Supports immune function') || 
                     rec.recommendation_reason.includes('Supports muscle function') ||
                     rec.recommendation_reason.includes('Supports energy metabolism');
    console.log(`  ${i+1}. ${rec.supplement_name} ${isGeneric ? '🔄' : '🎯'}`);
    console.log(`      ${rec.recommendation_reason}`);
  });
}

debug().catch(console.error); 