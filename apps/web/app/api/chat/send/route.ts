import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { message, conversation_id } = body;
  if (!message) return NextResponse.json({ error: 'missing message' }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  let convoId = conversation_id;
  if (!convoId) {
    const { data: convo } = await supabase.from('chat_conversations').insert({ user_id: user.id, title: message.slice(0, 60) }).select('id').single();
    convoId = convo?.id;
  } else {
    // verify ownership
    const { data: convo } = await supabase.from('chat_conversations').select('id').eq('id', convoId).eq('user_id', user.id).maybeSingle();
    if (!convo) return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // insert user message
  const { error: insertErr } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: convoId, role: 'user', content: message });
  if (insertErr) {
    console.error('insertErr', insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // call edge function
  const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai_chat`;
  const resp = await fetch(fnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: convoId }),
  });
  const json = await resp.json();
  if (!resp.ok) return NextResponse.json({ error: json.error || 'ai error' }, { status: 500 });

  // assistant message stored by function; return content for UI
  return NextResponse.json({ content: json.content, conversation_id: convoId });
} 