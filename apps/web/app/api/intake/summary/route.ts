import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Add CORS headers to all responses
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Require authenticated user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauth' }, { status: 401, headers: corsHeaders() });
  }

  // Start of the current ISO week (Monday 00:00)
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  monday.setHours(0, 0, 0, 0);

  // Count doses taken this week
  const { count: taken } = await supabase
    .from('supplement_intake')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('taken_at', monday.toISOString());

  // Fetch active supplement recommendations to estimate expected doses
  const { data: recs } = await supabase
    .from('supplement_recommendations')
    .select('frequency')
    .eq('user_id', user.id)
    .eq('is_active', true);

  const expected = (recs ?? []).reduce((sum, rec) => {
    const freq = (rec as { frequency: string }).frequency?.toLowerCase() ?? '';
    if (freq === 'twice daily') return sum + 14;
    if (freq === 'daily') return sum + 7;
    return sum + 7; // default once daily
  }, 0);

  return NextResponse.json({ taken: taken ?? 0, expected }, { headers: corsHeaders() });
} 
