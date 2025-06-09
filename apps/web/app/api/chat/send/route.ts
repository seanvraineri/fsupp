import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Capture cookies synchronously to satisfy Next.js dynamic route constraints
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const body = await req.json();
  const { message, conversation_id, filePayload } = body;
  
  if (!message && !filePayload) {
    return NextResponse.json({ error: 'missing message or filePayload' }, { status: 400 });
  }

  // Validate user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: 'unauth' }, { status: 401 });
  }

  // Retrieve session to forward JWT to edge function
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: 'session_err' }, { status: 401 });
  }

  let convoId = conversation_id;
  if (!convoId) {
    const { data: convo } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title: message?.slice(0, 60) || 'File Upload' })
      .select('id')
      .single();
    convoId = convo?.id;
  } else {
    // Verify ownership of existing conversation
    const { data: convo } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', convoId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!convo) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
  }

  // Store user message immediately
  await supabase.from('chat_messages').insert({
    conversation_id: convoId,
    role: 'user',
    content: message || `File: ${filePayload?.name || 'attachment'}`,
  });

  try {
    // Call original ai_chat edge function on tsupp project
    const fnUrl = `https://tcptynohlpggtufqanqg.supabase.co/functions/v1/ai_chat`;
    console.log('Calling ai_chat Edge Function at:', fnUrl);

    const resp = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        conversation_id: convoId,
        user_id: user.id,
        message: message || `Please analyze this file: ${filePayload?.name}`,
        filePayload,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('ai_chat function error:', resp.status, text);
      throw new Error(`AI service error: ${text}`);
    }

    const json = await resp.json();
    console.log('ai_chat response:', json);

    // Store assistant message
    const assistantContent =
      json.content || json.message || 'I apologize, but I encountered an issue processing your request.';

    await supabase.from('chat_messages').insert({
      conversation_id: convoId,
      role: 'assistant',
      content: assistantContent,
    });

    return NextResponse.json({ content: assistantContent, conversation_id: convoId });
  } catch (error: any) {
    console.error('Error calling ai_chat:', error);

    const errorContent =
      'I apologize, but I\'m currently experiencing technical difficulties. Please try again in a moment.';

    // Store error message
    await supabase.from('chat_messages').insert({
      conversation_id: convoId,
      role: 'assistant',
      content: errorContent,
    });

    return NextResponse.json({ content: errorContent, conversation_id: convoId });
  }
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('magnesium') && lowerMessage.includes('sleep')) {
    return `## Magnesium for Sleep 💤

**Magnesium Glycinate** is the best form for sleep support:

- **Dosage**: 200-400mg taken 30-60 minutes before bed
- **Why it works**: Helps relax muscles and calm the nervous system
- **Research**: Studies show magnesium can improve sleep quality and reduce time to fall asleep

**Other good options:**
- Magnesium L-Threonate (crosses blood-brain barrier better)
- Magnesium Taurate (additional heart benefits)

**Important notes:**
- Start with 200mg to assess tolerance
- Take with food if it causes stomach upset
- May interact with certain medications - consult your doctor if you take prescription drugs

Always consult your healthcare provider before starting new supplements.`;
  }
  
  if (lowerMessage.includes('vitamin d') && lowerMessage.includes('calcium')) {
    return `## Vitamin D and Calcium Interaction ☀️

**Yes, you can take them together** - in fact, they work synergistically:

**How they work together:**
- Vitamin D increases calcium absorption in the intestines by up to 40%
- Without adequate vitamin D, you only absorb about 10-15% of dietary calcium

**Optimal dosing:**
- **Vitamin D3**: 1000-4000 IU daily (depending on blood levels)
- **Calcium**: 500-600mg at a time (body can't absorb more than this)

**Best practices:**
- Take calcium in divided doses throughout the day
- Take with meals for better absorption
- Consider magnesium (200-400mg) and vitamin K2 (100-200mcg) for optimal bone health

**Important**: Get your vitamin D blood level tested - aim for 30-50 ng/mL (75-125 nmol/L).

Consult your healthcare provider for personalized dosing recommendations.`;
  }
  
  if (lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
    return `## Natural Supplements for Anxiety Support 🧘‍♀️

**Evidence-based options:**

**1. L-Theanine**
- Dosage: 100-200mg, 1-3 times daily
- Benefits: Promotes calm alertness without sedation
- Research: Clinical studies show reduced stress and improved focus

**2. Magnesium Glycinate**
- Dosage: 200-400mg daily
- Benefits: Supports nervous system function and muscle relaxation
- Best taken in evening

**3. Ashwagandha**
- Dosage: 300-600mg daily (standardized extract)
- Benefits: Adaptogen that helps manage stress response
- Research: Multiple studies show reduced cortisol and anxiety

**4. GABA**
- Dosage: 100-750mg daily
- Benefits: Calming neurotransmitter support
- Take on empty stomach for better absorption

**Important considerations:**
- Start with one supplement at a time
- Give each 2-4 weeks to assess effectiveness
- May interact with anxiety medications
- Not a replacement for therapy or medical treatment

Please consult with a healthcare provider, especially if you have diagnosed anxiety or take medications.`;
  }
  
  // Default response
  return `Hello! I'm SupplementScribe AI, your personalized supplement expert. 

I can help you with:
- **Specific supplement recommendations** with dosages and timing
- **Interaction checks** between supplements and medications  
- **Evidence-based guidance** with research citations
- **Personalized advice** based on your health profile

What supplement questions can I help you with today?

*Note: I provide educational information only. Always consult your healthcare provider for medical advice.*`;
} 
