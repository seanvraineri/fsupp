import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const convoId = searchParams.get('conversation_id');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  let id = convoId;
  if (!id) {
    const { data: convo } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!convo) return NextResponse.json({ messages: [], conversation_id: null });
    id = convo.id;
  }

  const { data: msgs } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at');

  return NextResponse.json({ messages: msgs ?? [], conversation_id: id });
} 