import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
  }

  try {
    // Verify the user owns this conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }

    // Delete the conversation itself
    const { error: conversationError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
