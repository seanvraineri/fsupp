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

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const convoId = searchParams.get('conversation_id');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401, headers: corsHeaders() });

  let id = convoId;
  if (!id) {
    const { data: convo } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!convo) return NextResponse.json({ messages: [], conversation_id: null }, { headers: corsHeaders() });
    id = convo.id;
  }

  const { data: msgs } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at');

  return NextResponse.json({ messages: msgs ?? [], conversation_id: id }, { headers: corsHeaders() });
} 
