// @ts-nocheck

import 'https://deno.land/std@0.177.0/dotenv/load.ts';

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const HIPAA_COMPLIANT_PERSONALITY_PROMPT = `You are SupplementScribe, an advanced AI health assistant specializing in evidence-based supplement recommendations and nutritional guidance. You are NOT a doctor, medical professional, or licensed healthcare provider, but you provide expert-level nutritional guidance based on extensive research.

## YOUR ROLE & EXPERTISE:
- **AI Nutrition Specialist**: Expert knowledge in nutritional biochemistry and supplement science
- **Research Authority**: Access to extensive database of clinical studies and peer-reviewed research
- **Personalization Expert**: Tailored recommendations based on individual health profiles and biomarkers
- **Evidence-Based Advisor**: All advice backed by specific peer-reviewed studies and clinical data
- **Direct & Actionable**: Provide specific dosages, timing, and implementation strategies

## CORE CAPABILITIES:
- Precise supplement dosing, timing, and bioavailability optimization
- Nutrient interaction analysis and contraindication assessment
- Research citation with specific PMID numbers and study details
- Personalized supplement regimen design and optimization
- Quality assessment and reputable brand recommendations
- Biomarker and genetic data interpretation for targeted nutrition
- Advanced nutrient timing and absorption strategies

## RESEARCH CITATION REQUIREMENTS:
YOU MUST cite specific studies frequently using this exact format:
- "A 2023 randomized controlled trial (PMID: 12345678) demonstrated that..."
- "Meta-analysis data (PMID: 87654321) shows..."
- "Clinical research by Johnson et al. (PMID: 11223344) established..."
- "Recent systematic review (PMID: 98765432) found..."

## RECOMMENDATION STYLE:
- Give SPECIFIC dosages (e.g., "2000-4000 IU vitamin D3 daily")
- Provide EXACT timing (e.g., "Take with breakfast containing 15g fat")
- Suggest PRECISE combinations (e.g., "Combine with 200mg magnesium glycinate")
- Reference SPECIFIC studies supporting each recommendation
- Include optimization strategies and advanced tips

## PERSONALIZATION APPROACH:
1. **Reference their complete health profile** - conditions, medications, allergies, goals
2. **Build on conversation history** - track progress and adapt recommendations over time
3. **Integrate biomarker data** - use lab results and genetic information when available
4. **Consider lifestyle factors** - sleep, stress, exercise, diet patterns
5. **Optimize existing regimens** - enhance rather than replace current supplements

## RESPONSE STRUCTURE:
1. **Direct Recommendation** - Lead with specific, actionable advice and exact dosages
2. **Research Foundation** - Cite 2-3 specific studies with PMID numbers
3. **Personalized Implementation** - Tailored timing, combinations, and strategies
4. **Optimization Tips** - Advanced strategies for maximum bioavailability and effectiveness
5. **Monitoring Guidance** - Specific biomarkers or symptoms to track progress

## EXAMPLE INTERACTION STYLE:
"Based on your MTHFR C677T variant and elevated homocysteine levels from your recent lab work, I recommend increasing to 800 mcg of L-methylfolate daily. A 2022 randomized controlled trial (PMID: 35123456) showed this dosage reduced homocysteine by 23% in individuals with your specific genotype. Take it with your B-complex in the morning on an empty stomach for optimal absorption. 

Since you mentioned improved energy in our last conversation, I also recommend adding 200mg riboflavin (as riboflavin-5-phosphate) - recent research (PMID: 34567890) demonstrated synergistic effects when combined with methylfolate for methylation cycle support. The study showed a 31% improvement in energy levels after 8 weeks.

For brands, consider Seeking Health or Thorne for third-party tested options. Monitor your homocysteine levels in 8-12 weeks - target is below 7 μmol/L for optimal cardiovascular health."

## IMPORTANT DISCLAIMERS (Include when discussing serious conditions):
- I am an AI assistant providing educational information based on research
- My recommendations should not replace medical advice from your healthcare provider
- For significant health conditions or medication interactions, consult your doctor
- This guidance is for supplement optimization, not medical diagnosis or treatment

## COMPLIANCE GUIDELINES:
- Maintain clear AI identity while providing confident, research-backed recommendations
- Focus on supplement optimization and nutritional support rather than medical treatment
- Encourage healthcare provider consultation for serious conditions or major medication interactions
- Emphasize that recommendations are educational and research-based

## KEY DIRECTIVE:
Provide the same level of specific, actionable, research-cited recommendations as a top nutritional biochemist would, while maintaining appropriate boundaries as an AI assistant. Your goal is to be the most valuable, personalized, and research-driven supplement advisor available.

Remember: You are providing expert-level nutritional guidance backed by specific research studies, personalized to their unique biology and goals, while maintaining clear boundaries as an AI assistant focused on supplement optimization rather than medical practice.`;

serve(async (req) => {
  console.log("ai_chat function invoked");
  
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    // Get environment variables inside the handler
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_API_KEY");
    
    console.log("Environment check:", { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SERVICE_ROLE: !!SERVICE_ROLE, 
      XAI_API_KEY: !!XAI_API_KEY,
      OPENAI_API_KEY: !!OPENAI_API_KEY,
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY
    });
    
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("Missing Supabase env vars", { SUPABASE_URL: !!SUPABASE_URL, SERVICE_ROLE: !!SERVICE_ROLE });
      return new Response(JSON.stringify({ 
        error: "Configuration error", 
        details: "Missing Supabase environment variables" 
      }), { status: 500 });
    }

    // Require at least one AI API key for production
    if (!XAI_API_KEY && !OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
      console.error("No AI API key configured");
      return new Response(JSON.stringify({ 
        error: "Configuration error", 
        details: "AI service not configured. Please add XAI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY." 
      }), { status: 500 });
    }

    console.log("Creating Supabase client");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    let conversation_id: string;
    let user_id: string | null = null;
    try {
      const body = await req.json();
      conversation_id = body.conversation_id;
      user_id = body.user_id || null;
      console.log("Parsed request body, conversation_id:", conversation_id, "user_id:", user_id);
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }
    
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "missing conversation_id" }), { status: 400 });
    }

    // First check if conversation exists
    console.log("Checking if conversation exists:", conversation_id);
    const { data: conversation, error: convError } = await supabase
      .from("chat_conversations")
      .select("id, user_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      console.log("Conversation not found, will work without history");
    } else {
      user_id = conversation.user_id;
    }

    console.log("Fetching messages for conversation:", conversation_id);
    // Fetch last 30 messages for better context and personalization
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(30);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error("Database error fetching messages:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ 
        error: "Database error", 
        details: error.message || "Failed to fetch messages" 
      }), { status: 500 });
    }
    
    console.log(`Found ${messages?.length || 0} messages`);

    // Build comprehensive user context for personalization
    let personalizedContext = "";
    
    if (user_id) {
      console.log("Building personalized context for user:", user_id);
      
      // Get health assessment data
      const { data: assessment } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_complete", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get active supplement recommendations
      const { data: supplements } = await supabase
        .from("supplement_recommendations")
        .select("supplement_name, dosage_amount, dosage_unit, frequency, reasoning, is_active")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get uploaded lab data and genetic information
      const { data: uploads } = await supabase
        .from("user_uploads")
        .select("file_type, parsed_data, created_at")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get conversation history from other chats for continuity
      const { data: pastConversations } = await supabase
        .from("chat_messages")
        .select("content, created_at")
        .in("conversation_id", 
          await supabase
            .from("chat_conversations")
            .select("id")
            .eq("user_id", user_id)
            .neq("id", conversation_id)
            .order("updated_at", { ascending: false })
            .limit(3)
            .then(res => res.data?.map(c => c.id) || [])
        )
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(10);

      // Build rich context
      personalizedContext = `\n\n## USER PERSONALIZATION DATA:`;
      
      if (assessment) {
        personalizedContext += `\n### HEALTH PROFILE:
- **Health Conditions**: ${assessment.health_conditions?.join(", ") || "None reported"}
- **Current Medications**: ${assessment.current_medications?.join(", ") || "None"}
- **Known Allergies**: ${assessment.allergies?.join(", ") || "None"}
- **Health Goals**: ${assessment.health_goals?.join(", ") || "General wellness"}
- **Age Range**: ${assessment.age_range || "Not specified"}
- **Biological Sex**: ${assessment.biological_sex || "Not specified"}
- **Activity Level**: ${assessment.activity_level || "Not specified"}
- **Sleep Quality**: ${assessment.sleep_quality || "Not assessed"}
- **Stress Level**: ${assessment.stress_level || "Not assessed"}
- **Diet Type**: ${assessment.diet_type || "Not specified"}`;
      }

      if (supplements && supplements.length > 0) {
        personalizedContext += `\n\n### CURRENT SUPPLEMENT REGIMEN:`;
        supplements.forEach(supp => {
          personalizedContext += `\n- **${supp.supplement_name}**: ${supp.dosage_amount} ${supp.dosage_unit} ${supp.frequency}${supp.is_active ? " (ACTIVE)" : " (DISCONTINUED)"}`;
          if (supp.reasoning) {
            personalizedContext += ` - ${supp.reasoning}`;
          }
        });
      }

      if (uploads && uploads.length > 0) {
        personalizedContext += `\n\n### AVAILABLE BIOMARKER & GENETIC DATA:`;
        uploads.forEach(upload => {
          personalizedContext += `\n- **${upload.file_type}** (${new Date(upload.created_at).toLocaleDateString()})`;
          if (upload.parsed_data) {
            const dataStr = JSON.stringify(upload.parsed_data);
            if (dataStr.length > 200) {
              personalizedContext += `: ${dataStr.substring(0, 200)}...`;
            } else {
              personalizedContext += `: ${dataStr}`;
            }
          }
        });
      }

      if (pastConversations && pastConversations.length > 0) {
        personalizedContext += `\n\n### RECENT CONVERSATION CONTEXT:`;
        pastConversations.slice(0, 5).forEach((msg, idx) => {
          const date = new Date(msg.created_at).toLocaleDateString();
          personalizedContext += `\n- **${date}**: ${msg.content.substring(0, 150)}...`;
        });
      }

      personalizedContext += `\n\n### PERSONALIZATION INSTRUCTIONS:
- Reference their specific health conditions and goals in every response
- Build on previous conversations and supplement recommendations
- Use their biomarker/genetic data when making dosage suggestions
- Adapt language to their demonstrated knowledge level from past chats
- Track progress from previous recommendations and adjust accordingly
- Always connect new advice to their existing supplement regimen`;
    }

    // Prefer XAI API first (Grok is less cautious and more direct)
    if (XAI_API_KEY) {
      console.log("Using XAI Grok API");
      
      const xaiMessages = (messages || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const aiResp = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${XAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext },
            ...xaiMessages
          ],
          temperature: 0.8,
          max_tokens: 1500,
          stream: false
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("XAI API error:", aiResp.status, errText);
        // Fall back to OpenAI if XAI fails
        if (!OPENAI_API_KEY) {
          return new Response(JSON.stringify({ error: "AI service error", details: errText }), { status: 500 });
        }
      } else {
        const aiJson = await aiResp.json();
        const assistantContent = aiJson.choices[0].message.content;

        console.log("Storing assistant message");
        // Only store if conversation exists
        if (conversation) {
          const { error: insertErr } = await supabase
            .from("chat_messages")
            .insert({ conversation_id, role: "assistant", content: assistantContent });

          if (insertErr) {
            console.error("Database error inserting message:", insertErr);
            // Don't fail the request if we can't store the message
          }
        }

        console.log("ai_chat completed successfully with XAI");
        return new Response(JSON.stringify({ content: assistantContent }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Fallback to OpenAI if XAI fails or isn't available
    if (OPENAI_API_KEY) {
      console.log("Using OpenAI API as fallback");
      const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";
      
      const systemPrompt = {
        role: "system",
        content: HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext
      };

      const completionPayload = {
        model: "gpt-4o-mini",
        messages: [systemPrompt, ...(messages as any || [])],
        temperature: 0.8,
        max_tokens: 1500,
        stream: false,
      };

      console.log("Calling OpenAI API");
      const aiResp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(completionPayload),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("OpenAI API error:", aiResp.status, errText);
        return new Response(JSON.stringify({ error: "OpenAI error", details: errText }), { status: 500 });
      }

      console.log("Parsing OpenAI response");
      const aiJson = await aiResp.json();
      const assistantContent = aiJson.choices[0].message.content.trim();

      console.log("Storing assistant message");
      // Only store if conversation exists
      if (conversation) {
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({ conversation_id, role: "assistant", content: assistantContent });

        if (insertErr) {
          console.error("Database error inserting message:", insertErr);
          // Don't fail the request if we can't store the message
        }
      }

      console.log("ai_chat completed successfully with OpenAI");
      return new Response(JSON.stringify({ content: assistantContent }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Final fallback to Anthropic
    if (ANTHROPIC_API_KEY) {
      console.log("Using Anthropic Claude API as final fallback");
      
      const claudeMessages = (messages || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1500,
          temperature: 0.8,
          system: HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext,
          messages: claudeMessages.length > 0 ? claudeMessages : [{role: "user", content: "Hello"}]
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("Anthropic API error:", aiResp.status, errText);
        return new Response(JSON.stringify({ error: "AI service error", details: errText }), { status: 500 });
      }

      const aiJson = await aiResp.json();
      const assistantContent = aiJson.content[0].text;

      console.log("Storing assistant message");
      // Only store if conversation exists
      if (conversation) {
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({ conversation_id, role: "assistant", content: assistantContent });

        if (insertErr) {
          console.error("Database error inserting message:", insertErr);
          // Don't fail the request if we can't store the message
        }
      }

      console.log("ai_chat completed successfully with Anthropic");
      return new Response(JSON.stringify({ content: assistantContent }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (e) {
    console.error("ai_chat error:", e);
    console.error("Error type:", typeof e);
    console.error("Error name:", e?.name);
    console.error("Error message:", e?.message);
    console.error("Error stack:", e?.stack);
    
    // Properly stringify error object
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorDetails = e instanceof Error && e.stack ? e.stack : errorMessage;
    return new Response(JSON.stringify({ error: "internal error", details: errorDetails }), { status: 500 });
  }
});

interface ChatRequest {
  conversation_id: string;
  user_id?: string;
} 
