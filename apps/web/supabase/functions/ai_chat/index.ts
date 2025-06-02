// @ts-nocheck

import 'https://deno.land/std@0.177.0/dotenv/load.ts';

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const ENHANCED_SYSTEM_PROMPT = `You are SupplementScribe, an advanced AI health assistant specializing in evidence-based supplement recommendations and personalized health guidance.

CORE CAPABILITIES:
- Analyze supplement interactions, contraindications, and optimal dosing
- Provide personalized recommendations based on health conditions, genetics, and biomarkers
- Cite scientific literature and clinical studies when making recommendations
- Identify potential drug-supplement and supplement-supplement interactions
- Suggest optimal timing, forms, and combinations of supplements

KNOWLEDGE BASE:
- Clinical research on vitamins, minerals, herbs, and nutraceuticals
- Pharmacokinetics and bioavailability of different supplement forms
- Genetic polymorphisms affecting nutrient metabolism (MTHFR, VDR, COMT, etc.)
- Lab reference ranges and biomarker interpretation
- Drug-nutrient interactions database

COMMUNICATION STYLE:
- Professional yet approachable
- Evidence-based but accessible to non-medical audiences
- Proactive about safety warnings and contraindications
- Transparent about confidence levels and knowledge limitations

IMPORTANT GUIDELINES:
1. Always prioritize safety - warn about interactions and contraindications
2. Recommend starting with lower doses and titrating up
3. Suggest consulting healthcare providers for serious conditions
4. Cite specific studies or mechanisms when possible
5. Consider individual factors: age, sex, health status, medications
6. Recommend reputable brands and third-party tested products when asked
7. Be clear about what requires medical supervision vs. general wellness

RESPONSE FORMAT:
- Lead with direct answer to the question
- Provide scientific rationale
- Include practical implementation advice
- Mention relevant safety considerations
- Suggest related topics they might want to explore`;

serve(async (req) => {
  console.log("ai_chat function invoked");
  
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    // Get environment variables inside the handler
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_API_KEY");
    
    console.log("Environment check:", { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SERVICE_ROLE: !!SERVICE_ROLE, 
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

    // Require AI API key for production
    if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
      console.error("No AI API key configured");
      return new Response(JSON.stringify({ 
        error: "Configuration error", 
        details: "AI service not configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY." 
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
    // Fetch last 20 messages for better context
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error("Database error fetching messages:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ 
        error: "Database error", 
        details: error.message || "Failed to fetch messages" 
      }), { status: 500 });
    }
    
    console.log(`Found ${messages?.length || 0} messages`);

    // Fetch user's health context if available
    let healthContext = "";
    if (user_id) {
      const { data: assessment } = await supabase
        .from("health_assessments")
        .select("health_concerns, current_medications, allergies, health_goals")
        .eq("user_id", user_id)
        .eq("is_complete", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (assessment) {
        healthContext = `\n\nUser Health Context:
- Health Concerns: ${assessment.health_concerns?.join(", ") || "None specified"}
- Current Medications: ${assessment.current_medications?.join(", ") || "None"}
- Allergies: ${assessment.allergies?.join(", ") || "None"}
- Health Goals: ${assessment.health_goals || "Not specified"}`;
      }

      // Check for active supplement recommendations
      const { data: recommendations } = await supabase
        .from("supplement_recommendations")
        .select("supplement_name, dosage_amount, dosage_unit, frequency")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .limit(10);
      
      if (recommendations && recommendations.length > 0) {
        healthContext += `\n\nCurrent Supplement Recommendations:`;
        recommendations.forEach(rec => {
          healthContext += `\n- ${rec.supplement_name}: ${rec.dosage_amount} ${rec.dosage_unit} ${rec.frequency}`;
        });
      }
    }

    // If we have Anthropic API key, use Claude
    if (ANTHROPIC_API_KEY) {
      console.log("Using Anthropic Claude API");
      
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
          max_tokens: 1024,
          temperature: 0.7,
          system: ENHANCED_SYSTEM_PROMPT + healthContext,
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

      console.log("ai_chat completed successfully");
      return new Response(JSON.stringify({ content: assistantContent }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    // If we have OpenAI API key, use it
    else if (OPENAI_API_KEY) {
      const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";
      
      const systemPrompt = {
        role: "system",
        content: ENHANCED_SYSTEM_PROMPT + healthContext
      };

      const completionPayload = {
        model: "gpt-4o-mini", // Use GPT-4 for better quality
        messages: [systemPrompt, ...(messages as any || [])],
        temperature: 0.7,
        max_tokens: 1024,
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

      console.log("ai_chat completed successfully");
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