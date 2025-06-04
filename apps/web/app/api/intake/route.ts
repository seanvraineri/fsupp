import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { recommendation_id } = await req.json();
  if (!recommendation_id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { error } = await supabase.from('supplement_intake').insert({
    user_id: user.id,
    recommendation_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // return count for today
  const { count } = await supabase
    .from('supplement_intake')
    .select('*', { count: 'exact', head: true })
    .eq('recommendation_id', recommendation_id)
    .gte('taken_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

  return NextResponse.json({ count });
}

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('recommendation_id');
  if (!id) return NextResponse.json({ error: 'id' }, { status: 400 });
  // week start
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  monday.setHours(0,0,0,0);
  const { count } = await supabase
    .from('supplement_intake')
    .select('*', { count: 'exact', head: true })
    .eq('recommendation_id', id)
    .gte('taken_at', monday.toISOString());
  return NextResponse.json({ count });
} 
