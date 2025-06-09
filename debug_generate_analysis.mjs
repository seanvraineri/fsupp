import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

async function debugGenerateAnalysis() {
  console.log('🔍 Debugging generate_analysis Edge Function...\n');

  // Step 1: Find a real user with recommendations
  console.log('1. Finding users with existing recommendations...');
  const { data: existingRecs } = await supabase
    .from('supplement_recommendations')
    .select('user_id, supplement_name, recommendation_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!existingRecs || existingRecs.length === 0) {
    console.log('❌ No existing recommendations found!');
    return;
  }

  const testUserId = existingRecs[0].user_id;
  console.log(`📋 Using user: ${testUserId}`);
  console.log('Current recommendations:');
  existingRecs.forEach((rec, i) => {
    console.log(`  ${i+1}. ${rec.supplement_name} - ${rec.recommendation_reason}`);
  });

  // Step 2: Check if user has assessment
  console.log('\n2. Checking user assessment...');
  const { data: assessment } = await supabase
    .from('health_assessments')
    .select('*')
    .eq('user_id', testUserId)
    .eq('is_complete', true)
    .single();

  if (!assessment) {
    console.log('❌ No completed assessment found for this user!');
    return;
  }

  console.log('✅ Assessment found:');
  console.log(`   Goals: ${assessment.health_goals?.join(', ') || 'none'}`);
  console.log(`   Concerns: ${assessment.health_conditions?.join(', ') || 'none'}`);
  console.log(`   Age: ${assessment.age}, Gender: ${assessment.gender}`);

  // Step 3: Call generate_analysis function directly
  console.log('\n3. Testing generate_analysis function...');
  const startTime = Date.now();
  
  try {
    const { data: result, error } = await supabase.functions.invoke('generate_analysis', {
      body: { user_id: testUserId }
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  Function took ${duration}ms`);

    if (error) {
      console.log('❌ Function error:', error);
      return;
    }

    console.log('✅ Function response:', result);

    // Step 4: Check if new AI analysis was created
    console.log('\n4. Checking AI analysis records...');
    const { data: analyses } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log(`Found ${analyses?.length || 0} AI analyses for this user:`);
    analyses?.forEach((analysis, i) => {
      console.log(`\n  Analysis ${i+1}:`);
      console.log(`    Model: ${analysis.model_name}`);
      console.log(`    Confidence: ${analysis.overall_confidence}`);
      console.log(`    Summary: ${analysis.analysis_summary?.substring(0, 150)}...`);
      console.log(`    Warnings: ${analysis.interaction_warnings?.length || 0} warnings`);
      console.log(`    Created: ${analysis.created_at}`);
    });

    // Step 5: Check updated recommendations
    console.log('\n5. Checking updated recommendations...');
    const { data: newRecs } = await supabase
      .from('supplement_recommendations')
      .select('supplement_name, recommendation_reason, created_at, evidence_quality, priority_score')
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`\nNow has ${newRecs?.length || 0} active recommendations:`);
    newRecs?.forEach((rec, i) => {
      const isPersonalized = 
        rec.recommendation_reason.toLowerCase().includes('goal') ||
        rec.recommendation_reason.toLowerCase().includes('anxiety') ||
        rec.recommendation_reason.toLowerCase().includes('testosterone') ||
        rec.recommendation_reason.toLowerCase().includes('stress') ||
        rec.recommendation_reason.toLowerCase().includes('genetic') ||
        (assessment.health_goals && assessment.health_goals.some(goal => 
          rec.recommendation_reason.toLowerCase().includes(goal.toLowerCase())
        ));

      console.log(`\n  ${i+1}. ${rec.supplement_name} ${isPersonalized ? '🎯' : '🔄'}`);
      console.log(`      Reason: ${rec.recommendation_reason}`);
      console.log(`      Evidence: ${rec.evidence_quality}, Priority: ${rec.priority_score}`);
      console.log(`      ${isPersonalized ? 'PERSONALIZED' : 'GENERIC'}`);
    });

    // Step 6: Analysis summary
    console.log('\n📊 SUMMARY:');
    const hasPersonalizedRecs = newRecs?.some(rec => {
      const reason = rec.recommendation_reason.toLowerCase();
      return reason.includes('goal') || reason.includes('anxiety') || 
             reason.includes('testosterone') || reason.includes('genetic') ||
             (assessment.health_goals && assessment.health_goals.some(goal => 
               reason.includes(goal.toLowerCase())
             ));
    });

    const latestAnalysis = analyses?.[0];
    console.log(`✅ Assessment exists with goals: ${assessment.health_goals?.length > 0}`);
    console.log(`✅ Function executed successfully: ${!!result}`);
    console.log(`${latestAnalysis?.model_name?.includes('claude') || latestAnalysis?.model_name?.includes('gpt') ? '✅' : '❌'} AI model used: ${latestAnalysis?.model_name || 'none'}`);
    console.log(`${hasPersonalizedRecs ? '✅' : '❌'} Recommendations are personalized: ${hasPersonalizedRecs}`);

    if (!hasPersonalizedRecs) {
      console.log('\n🔴 ROOT CAUSE: AI enhancement is failing!');
      console.log('The function runs but falls back to generic base recommendations.');
      console.log('Likely causes:');
      console.log('- Claude/OpenAI API failures');
      console.log('- Invalid API keys');
      console.log('- JSON parsing errors in AI responses');
      console.log('- Token limits exceeded');
      
      if (latestAnalysis?.model_name === 'rule-based') {
        console.log('- Confirmed: AI enhancement failed, using rule-based fallback');
      }
    }

  } catch (err) {
    console.log('❌ Function call failed:', err.message);
  }
}

debugGenerateAnalysis().catch(console.error); 