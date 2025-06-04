import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { message, conversation_id, file } = body;
  
  if (!message && !file) return NextResponse.json({ error: 'missing message or file' }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  let convoId = conversation_id;
  if (!convoId) {
    const { data: convo } = await supabase.from('chat_conversations').insert({ user_id: user.id, title: message?.slice(0, 60) || 'File Upload' }).select('id').single();
    convoId = convo?.id;
  } else {
    // verify ownership
    const { data: convo } = await supabase.from('chat_conversations').select('id').eq('id', convoId).eq('user_id', user.id).maybeSingle();
    if (!convo) return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // Get the user's access token for Edge Function authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // call edge function
  const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai_chat`;
  const resp = await fetch(fnUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ message, conversation_id: convoId, user_id: user.id, file }),
  });
  
  if (!resp.ok) {
    const json = await resp.json();
    console.error('Edge function error:', json);
    return NextResponse.json({ error: json.error || 'AI service error', details: json.details }, { status: 500 });
  }
  
  const json = await resp.json();

  // assistant message stored by function; return content for UI
  return NextResponse.json({ content: json.message, conversation_id: json.conversation_id || convoId });
} 