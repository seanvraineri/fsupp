import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const recId = searchParams.get('rec');
  if (!recId) return NextResponse.json({ error: 'missing rec' }, { status: 400 });

  // Auth check
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  // Ensure recommendation belongs to user (using join)
  const { data: rec, error: recErr } = await supabase
    .from('supplement_recommendations')
    .select('id')
    .eq('id', recId)
    .eq('user_id', user.id)
    .single();
  if (recErr || !rec) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: cites } = await supabase
    .from('recommendation_citations')
    .select('*')
    .eq('recommendation_id', recId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ citations: cites ?? [] });
} 