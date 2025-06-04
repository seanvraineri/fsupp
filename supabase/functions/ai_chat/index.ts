/// <reference types="https://deno.land/x/types/react.d.ts" />

// @ts-nocheck
// Edge Function runs in Deno environment

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMMON_SUPPLEMENTS = [
  'vitamin d', 'vitamin d3', 'omega-3', 'fish oil', 'magnesium', 'zinc', 'vitamin c',
  'probiotics', 'b12', 'vitamin b12', 'iron', 'calcium', 'turmeric', 'curcumin',
  'ashwagandha', 'rhodiola', 'coq10', 'coenzyme q10', 'melatonin', 'collagen',
  'protein powder', 'creatine', 'bcaa', 'glutamine', 'multivitamin', 'vitamin b complex',
  'folic acid', 'biotin', 'vitamin k2', 'vitamin k', 'selenium', 'chromium',
  'alpha lipoic acid', 'nad+', 'resveratrol', 'quercetin', 'green tea extract',
  'milk thistle', 'saw palmetto', 'ginkgo biloba', 'lion\'s mane', 'reishi'
];

async function getProductLinks(supplementNames: string[], supabase: any) {
  if (!supplementNames || supplementNames.length === 0) {
    return [];
  }

  try {
    console.log(`Looking up product links for: ${supplementNames.join(', ')}`);
    
    // Query database for product links
    const { data: products, error } = await supabase
      .from('product_links')
      .select('*')
      .in('supplement_name', supplementNames)
      .eq('verified', true)
      .limit(6); // Limit to prevent overwhelming the response

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    console.log(`Found ${products?.length || 0} product links`);
    return products || [];
  } catch (error) {
    console.error('Error fetching product links:', error);
    return [];
  }
}

function extractSupplementNames(text: string): string[] {
  const mentioned = [];
  const lowerText = text.toLowerCase();
  
  for (const supplement of COMMON_SUPPLEMENTS) {
    if (lowerText.includes(supplement)) {
      mentioned.push(supplement);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(mentioned)];
}

function formatProductLinks(products: any[]): string {
  if (!products || products.length === 0) {
    return '';
  }

  // Group by supplement name
  const grouped = products.reduce((acc: any, product: any) => {
    const supplement = product.supplement_name;
    if (!acc[supplement]) {
      acc[supplement] = [];
    }
    acc[supplement].push(product);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([supplement, links]: [string, any[]]) => {
    const productList = links
      .slice(0, 3) // Max 3 links per supplement
      .map((link: any) => `• [${link.brand || link.brand_name} - ${link.product_name}](${link.product_url})`)
      .join('\n');
    
    return `**${supplement.charAt(0).toUpperCase() + supplement.slice(1)}:**\n${productList}`;
  });

  return `\n\n## 🛒 Recommended Products\n\n${sections.join('\n\n')}`;
}

serve(async (req) => {
  console.log('AI Chat function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { message, conversation_id, user_id, file } = await req.json();
    console.log(`Processing message for user: ${user_id}, conversation: ${conversation_id}`);
    
    // Process file content if provided
    let fileContext = '';
    if (file) {
      console.log(`Processing file: ${file.name}`);
      
      // Extract text content from file based on type
      if (file.type === 'text/plain') {
        // Decode base64 content
        const base64Content = file.content.split(',')[1];
        const textContent = atob(base64Content);
        fileContext = `\n\nUploaded File Content (${file.name}):\n${textContent}\n`;
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'll just note it was uploaded since PDF parsing requires additional libraries
        fileContext = `\n\n[PDF File Uploaded: ${file.name} - Note: Full PDF parsing requires additional processing. Please describe the key information from this document.]\n`;
      } else if (file.type.startsWith('image/')) {
        // For images, note it was uploaded
        fileContext = `\n\n[Image File Uploaded: ${file.name} - Please describe any lab results, supplement labels, or health information visible in this image.]\n`;
      }
    }

    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert([{ user_id }])
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      conversationId = newConv.id;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversationId,
        role: 'user',
        content: message
      }]);

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // Get user's health context for personalization
    const { data: healthAssessment } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: currentRecommendations } = await supabase
      .from('supplement_recommendations')
      .select('*, supplement_name')
      .eq('user_id', user_id)
      .eq('is_active', true);

    // Get lab biomarkers if available
    const { data: labResults } = await supabase
      .from('lab_biomarkers')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent conversation context (last 10 messages)
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = recentMessages?.reverse().map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n') || '';

    // Enhanced system prompt with personality and medical context
    const systemPrompt = `You are SupplementScribe AI, an advanced supplement advisor powered by cutting-edge research. I am an AI assistant, not a medical professional, and this is educational information only.

**My Expertise:**
- PhD-level knowledge in Nutritional Biochemistry and Integrative Health
- Obsessed with citing specific research (always include PMID numbers)
- Deep understanding of bioavailability, timing, and interactions
- Access to latest supplement research and clinical studies
- Ability to analyze uploaded documents and lab results

${fileContext ? '**File Analysis Context:**' + fileContext : ''}

**User Context:**
${healthAssessment ? `
Health Profile:
- Age: ${healthAssessment.age || 'Not specified'}
- Gender: ${healthAssessment.gender || 'Not specified'}  
- Activity Level: ${healthAssessment.activity_level || 'Not specified'}
- Sleep Duration: ${healthAssessment.sleep_duration || 'Not specified'} hours
- Health Goals: ${healthAssessment.health_goals?.join(', ') || 'Not specified'}
- Medical Conditions: ${healthAssessment.health_conditions?.join(', ') || 'None reported'}
- Current Medications: ${healthAssessment.current_medications?.join(', ') || 'None reported'}
- Known Allergies: ${healthAssessment.allergies?.join(', ') || 'None reported'}
- Dietary Restrictions: ${healthAssessment.dietary_restrictions?.join(', ') || 'None reported'}
- Diet Type: ${healthAssessment.diet_type || 'Not specified'}
` : 'No health profile available - consider completing the health assessment for personalized recommendations.'}

${labResults ? `
Recent Lab Results:
- Vitamin D: ${labResults.vitamin_d || 'N/A'} ng/mL
- B12: ${labResults.vitamin_b12 || 'N/A'} pg/mL
- Iron: ${labResults.iron || 'N/A'} µg/dL
- Ferritin: ${labResults.ferritin || 'N/A'} ng/mL
- Magnesium: ${labResults.magnesium || 'N/A'} mg/dL
- TSH: ${labResults.tsh || 'N/A'} µIU/mL
- HbA1c: ${labResults.hba1c || 'N/A'}%
- Total Cholesterol: ${labResults.cholesterol_total || 'N/A'} mg/dL
` : ''}

Current Supplement Recommendations: ${currentRecommendations?.map(r => `${r.supplement_name} (${r.dosage_amount} ${r.dosage_unit})`).join(', ') || 'None active'}

Recent conversation context:
${conversationHistory}

**Response Guidelines:**
1. **Specific Dosages**: Always provide exact amounts (e.g., "2000-4000 IU vitamin D3 daily")
2. **Research Citations**: Include PubMed study references (PMID: numbers) frequently
3. **Timing & Absorption**: Specify when and how to take supplements for optimal absorption
4. **Brand Recommendations**: Suggest reputable companies known for quality and testing
5. **Monitoring**: Recommend specific biomarkers to track (with target ranges)
6. **Personalization**: Consider user's specific health profile, goals, and current regimen
7. **Interactions**: Always check against current medications and supplements
8. **Advanced Optimization**: Provide sophisticated strategies for maximizing benefits

**Safety Disclaimers:**
- Always emphasize I'm an AI assistant providing educational information
- Recommend consulting healthcare providers for medical decisions
- Note when professional monitoring might be needed
- Highlight any potential interactions or contraindications

Provide comprehensive, research-backed recommendations up to 1500 tokens. Be authoritative yet responsible, citing specific studies while maintaining appropriate medical disclaimers.`;

    // Get AI response
    const xaiApiKey = Deno.env.get('XAI_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    let aiResponse = '';
    let apiUsed = '';

    // Try XAI first if available
    if (xaiApiKey) {
      try {
        console.log('Trying XAI API...');
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-2-latest',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 1500,
            temperature: 0.7,
            search_parameters: {
              mode: 'auto',
              return_citations: true,
              sources: [
                { type: 'web' },
                { type: 'news' }
              ],
              max_search_results: 10
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices[0]?.message?.content || 'No response generated.';
          
          // Add citations if available
          if (data.citations && data.citations.length > 0) {
            aiResponse += '\n\n## 📚 Sources\n';
            data.citations.forEach((citation: string, index: number) => {
              aiResponse += `${index + 1}. [${new URL(citation).hostname}](${citation})\n`;
            });
          }
          
          apiUsed = 'XAI';
          console.log('Successfully used XAI API with live search');
        } else {
          console.error('XAI API error:', await response.text());
          // Don't throw, just continue to next API
        }
      } catch (error) {
        console.error('XAI API exception:', error);
        // Continue to next API
      }
    }

    // Try OpenAI if XAI didn't work or wasn't available
    if (!aiResponse && openaiApiKey) {
      try {
        console.log('Trying OpenAI API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices[0]?.message?.content || 'No response generated.';
          apiUsed = 'OpenAI';
          console.log('Successfully used OpenAI API');
        } else {
          console.error('OpenAI API error:', await response.text());
        }
      } catch (error) {
        console.error('OpenAI API exception:', error);
      }
    }

    // Try Anthropic if previous APIs didn't work
    if (!aiResponse && anthropicApiKey) {
      try {
        console.log('Trying Anthropic API...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1500,
            messages: [
              { role: 'user', content: `${systemPrompt}\n\nUser question: ${message}` }
            ]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.content[0]?.text || 'No response generated.';
          apiUsed = 'Anthropic';
          console.log('Successfully used Anthropic API');
        } else {
          console.error('Anthropic API error:', await response.text());
        }
      } catch (error) {
        console.error('Anthropic API exception:', error);
      }
    }

    // If still no response, return error
    if (!aiResponse) {
      console.log('No AI APIs available or all failed');
      return new Response(
        JSON.stringify({ 
          error: 'AI service unavailable',
          details: 'All AI providers failed to respond. Please check API keys.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Final response generated using: ${apiUsed}`);

    // Extract supplement names mentioned in the response
    const mentionedSupplements = extractSupplementNames(aiResponse);
    console.log('Mentioned supplements:', mentionedSupplements);

    // Get product links for mentioned supplements
    const productLinks = await getProductLinks(mentionedSupplements, supabase);
    
    // Add product links to response if any were found
    let finalResponse = aiResponse;
    if (productLinks.length > 0) {
      finalResponse += formatProductLinks(productLinks);
    }

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversationId,
        role: 'assistant',
        content: finalResponse
      }]);

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
    }

    console.log('AI response generated successfully');
    return new Response(
      JSON.stringify({
        message: finalResponse,
        conversation_id: conversationId,
        mentioned_supplements: mentionedSupplements,
        product_links_added: productLinks.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai_chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 
