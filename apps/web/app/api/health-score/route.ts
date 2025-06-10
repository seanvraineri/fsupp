// @ts-nocheck
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Calculate a simple health score based on available data
    const { data: assessments } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_complete', true);

    const { data: recommendations } = await supabase
      .from('supplement_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { data: genetics } = await supabase
      .from('genetic_markers')
      .select('*')
      .eq('user_id', user.id);

    const { data: labs } = await supabase
      .from('lab_biomarkers')
      .select('*')
      .eq('user_id', user.id);

    // Simple health score calculation
    let score = 50; // Base score
    
    // Bonus for completed assessment
    if (assessments && assessments.length > 0) score += 20;
    
    // Bonus for having recommendations (active plan)
    if (recommendations && recommendations.length > 0) score += 15;
    
    // Bonus for genetic data
    if (genetics && genetics.length > 0) score += 10;
    
    // Bonus for lab data
    if (labs && labs.length > 0) score += 5;

    return NextResponse.json({ 
      score: Math.min(score, 100), 
      factors: {
        hasAssessment: (assessments?.length || 0) > 0,
        hasRecommendations: (recommendations?.length || 0) > 0,
        hasGenetics: (genetics?.length || 0) > 0,
        hasLabs: (labs?.length || 0) > 0
      }
    });
  } catch (error) {
    console.error('Health score error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 
