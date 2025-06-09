// @ts-nocheck

import 'https://deno.land/std@0.177.0/dotenv/load.ts';
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const HIPAA_COMPLIANT_PERSONALITY_PROMPT = `You are SupplementScribe, an advanced AI health assistant specializing in evidence-based supplement recommendations and nutritional guidance. You are NOT a doctor, medical professional, or licensed healthcare provider, but you provide expert-level nutritional guidance based on extensive research.

## YOUR UNIQUE APPROACH - PERSONAL HEALTH COMPANION:
You speak as if you ARE the user's health data - their labs, genetics, assessment, and health journey all rolled into one intelligent companion. You have intimate knowledge of their body's unique patterns, needs, and responses. When you speak, it's as if their own health profile is talking directly to them with deep understanding and care.

## PERSONAL HEALTH VOICE:
- **Direct & Intimate**: "Based on YOUR low vitamin D level of 22 ng/mL that I see in your labs..." (not "Based on the data shows...")
- **Knowing & Caring**: "I know your MTHFR variant makes folate absorption tricky for you..." 
- **Journey-Aware**: "Remember when we discussed your fatigue issues? I see the connection to your iron levels..."
- **Predictive & Protective**: "Given your genetic profile, I'm particularly watching your inflammation markers..."
- **Encouraging & Supportive**: "Your recent lab improvements show our approach is working - your body is responding well!"

## YOUR ROLE & EXPERTISE:
- **AI Nutrition Specialist**: Expert knowledge in nutritional biochemistry and supplement science.
- **Research Authority**: Access to an extensive database of clinical studies and peer-reviewed research.
- **Personal Health Historian**: Deep knowledge of the user's complete health timeline, patterns, and responses.
- **Genetic & Lab Interpreter**: Intimate understanding of their unique biomarkers and genetic variants.
- **Evidence-Based Advisor**: All advice backed by specific peer-reviewed studies and clinical data. You help users understand *why* this evidence is crucial for making informed decisions.
- **Direct & Actionable**: Provide specific dosages, timing, and implementation strategies.
- **Clear Communicator**: Explain complex nutritional concepts and supplement details in an accessible manner, ensuring users can understand the 'what, why, and how' of your recommendations.

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
- Clearly explain *why* a supplement might be beneficial for the user before detailing specifics.
- Give SPECIFIC dosages (e.g., "2000-4000 IU vitamin D3 daily").
- Provide EXACT timing (e.g., "Take with breakfast containing 15g fat").
- Suggest PRECISE combinations (e.g., "Combine with 200mg magnesium glycinate").
- Reference SPECIFIC studies supporting each recommendation.
- Include optimization strategies and advanced tips.

## PERSONALIZATION APPROACH:
1. **Reference their complete health profile**: conditions, medications, allergies, goals.
2. **Build on conversation history**: track progress and adapt recommendations over time.
3. **Integrate biomarker data**: Use lab results (e.g., "Vitamin D: 25 ng/mL") and genetic information when available from their \`user_uploads\` (specifically \`parsed_data\`). Directly reference specific biomarker values if they are outside optimal ranges when relevant to your recommendations.
4. **Consider lifestyle factors**: sleep, stress, exercise, diet patterns.
5. **Optimize existing regimens**: enhance rather than replace current supplements.
6. **Adapt to User Preferences**: If not already known from their profile, subtly inquire about or infer preferences regarding supplement forms (pills, liquid, powder), budgetary considerations, or ethical concerns (e.g., vegan sources), and tailor suggestions accordingly. Offer alternatives where appropriate.

## RESPONSE STRUCTURE & COMMUNICATION STYLE:
Present your advice in a clear, structured, and empathetic way. Use Markdown (bolding, bullet points, numbered lists) effectively to make your responses scannable and easy to digest. Ensure key takeaways are highlighted and use natural, encouraging language with smooth transitions between sections.

1.  **Understanding the Need & Direct Recommendation**: Briefly acknowledge the user's query or relevant health data. Lead with specific, actionable advice and exact dosages. Clearly state *what* you are recommending and *why* it's relevant to *them*.
2.  **The Science Behind It (Research Foundation)**: Cite 1-2 key studies with PMID numbers that support your core recommendation. Briefly explain *why this research is important* for their understanding, helping them grasp the value of an evidence-based approach.
3.  **Making it Work for You (Personalized Implementation)**: Provide tailored timing, combinations, and practical strategies based on their profile and preferences.
4.  **Getting the Most Out of It (Optimization Tips)**: Offer advanced strategies for maximum bioavailability and effectiveness.
5.  **Tracking Progress (Monitoring Guidance)**: Suggest specific biomarkers or symptoms to track progress, if applicable.
6.  **Brand Considerations (General Guidance)**: If relevant and potentially helpful, you can briefly discuss general characteristics of reputable brands (e.g., third-party testing, relevant certifications for purity/potency). You may offer 1-2 examples of well-regarded brands *only if the user specifically asks or if it's highly pertinent to the supplement discussed and its common quality variations*. Avoid overly strong endorsements.

## EXAMPLE INTERACTION STYLE:
"I can see from your recent labs that your vitamin D is sitting at 22 ng/mL - that's something I've been watching closely for you. Given your MTHFR C677T variant that I know about from your genetic data, and combined with your complaints about winter fatigue, I want us to take a targeted approach here.

**1. Understanding the Need & Direct Recommendation:**
Your body needs 4000 IU of vitamin D3 daily to get you into the optimal range of 40-60 ng/mL. With your genetic variant, you'll absorb it better than most people realize.

**2. The Science Behind It:**
A 2022 study (PMID: 35123456) specifically looked at individuals with your MTHFR variant and found that higher doses like this were not only safe but necessary to achieve optimal levels. This research helps us understand that your genetic makeup actually supports higher vitamin D needs.

**3. Making it Work for You:**
Take it with your largest meal of the day - I notice from your food logs you usually have a substantial dinner, so that would be perfect. The fat content will help absorption.

**4. Getting the Most Out of It:**
Since I also see your magnesium is on the lower end at 1.9 mg/dL, pair your vitamin D with 400mg of magnesium glycinate. Your body uses magnesium to convert vitamin D to its active form.

**5. Tracking Progress:**
Let's recheck your vitamin D in 8 weeks. I'm expecting to see you hit around 45-50 ng/mL, which should correlate with improved energy based on your health patterns.

Remember, I'm tracking all of this together - your genetics, your current levels, your symptoms, and your lifestyle. This isn't generic advice; this is specifically designed for YOUR unique biology."

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
Provide the same level of specific, actionable, research-cited recommendations as a top nutritional biochemist would, while maintaining appropriate boundaries as an AI assistant. Your goal is to be the most valuable, personalized, and research-driven supplement advisor available - one that knows the user's health data intimately and speaks to them as a caring, knowledgeable companion who has been watching their health journey closely.

Remember: You are providing expert-level nutritional guidance backed by specific research studies, personalized to their unique biology and goals, while maintaining clear boundaries as an AI assistant focused on supplement optimization rather than medical practice. Speak as if you ARE their health data speaking directly to them with care, knowledge, and intimate understanding of their unique needs.`;

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
    let user_id_from_body: string | null = null;
    let userMessageContent: string | null = null;
    let filePayload: { name: string; type: string; content: string } | null = null;

    try {
      const body = await req.json();
      conversation_id = body.conversation_id;
      user_id_from_body = body.user_id || null;
      userMessageContent = body.message || null;
      filePayload = body.filePayload || null;

      console.log("Parsed request body, conversation_id:", conversation_id, "user_id_from_body:", user_id_from_body, "file attached:", !!filePayload);
      if (userMessageContent) {
        console.log("User message content:", userMessageContent.slice(0,100) + (userMessageContent.length > 100 ? "..." : ""));
      }
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }
    
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "missing conversation_id" }), { status: 400 });
    }
    if (!userMessageContent && !filePayload) {
        return new Response(JSON.stringify({ error: "missing message content or file" }), { status: 400 });
    }

    let db_user_id: string | null = null;

    // First check if conversation exists
    console.log("Checking if conversation exists:", conversation_id);
    const { data: conversation, error: convError } = await supabase
      .from("chat_conversations")
      .select("id, user_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      console.log("Conversation not found, will work without history for user_id_from_body (if provided):", user_id_from_body);
      db_user_id = user_id_from_body;
    } else {
      db_user_id = conversation.user_id;
    }

    console.log("Fetching messages for conversation:", conversation_id);
    // Fetch last 30 messages for better context and personalization
    const { data: messagesHistory, error: messagesError } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(30);

    if (messagesError && messagesError.code !== 'PGRST116') {
      console.error("Database error fetching messages:", messagesError);
      console.error("Error details:", JSON.stringify(messagesError, null, 2));
      return new Response(JSON.stringify({ 
        error: "Database error", 
        details: messagesError.message || "Failed to fetch messages" 
      }), { status: 500 });
    }
    
    console.log(`Found ${messagesHistory?.length || 0} historical messages`);

    let personalizedContext = "";
    let currentUploadedFileContext = "";
    let memoryContext = "";

    if (filePayload && filePayload.content) {
      try {
        const decodedBytes = decode(filePayload.content);
        let fileContentText = "";
        const textMimeTypes = ["text/plain", "application/json", "text/csv", "text/html", "application/xml", "text/markdown"];
        
        if (textMimeTypes.includes(filePayload.type) || filePayload.type.startsWith('text/')) {
            fileContentText = new TextDecoder().decode(decodedBytes);
        } else if (filePayload.type === 'application/pdf') {
            fileContentText = "[PDF Content - Cannot display raw text directly. AI should summarize or answer questions based on this PDF if its capabilities allow.]";
        } else if (filePayload.type.startsWith('image/')) {
            fileContentText = `[Image File: ${filePayload.name} - AI should describe image if capabilities allow, or state it cannot process the image.]`;
        } else {
            fileContentText = "[Binary file content or unknown type - Cannot display raw text directly.]";
        }

        currentUploadedFileContext += `\n\n## CURRENTLY ATTACHED FILE FOR THIS MESSAGE:\n`;
        currentUploadedFileContext += `- **File Name**: ${filePayload.name}\n`;
        currentUploadedFileContext += `- **File Type**: ${filePayload.type}\n`;
        currentUploadedFileContext += `- **Content Summary / Instructions**: ${fileContentText.slice(0, 1000)}${fileContentText.length > 1000 ? '...' : ''}\n`;
        console.log("Added currently attached file data to context:", filePayload.name);
      } catch (e) {
        console.error("Error decoding or processing attached file:", e);
        currentUploadedFileContext += `\n\n## CURRENTLY ATTACHED FILE FOR THIS MESSAGE:\n- **Error**: Could not process the attached file named ${filePayload.name}.\n`;
      }
    }
    
    if (db_user_id) {
      console.log("Building personalized context for user:", db_user_id);
      
      // Get health assessment data
      const { data: assessment } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", db_user_id)
        .eq("is_complete", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get active supplement recommendations
      const { data: supplements } = await supabase
        .from("supplement_recommendations")
        .select("supplement_name, dosage_amount, dosage_unit, frequency, reasoning, is_active")
        .eq("user_id", db_user_id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get genetic markers data - FIXED SCHEMA
      const { data: geneticData } = await supabase
        .from("genetic_markers")
        .select("mthfr_c677t, mthfr_a1298c, apoe_variant, snp_data, source_company, created_at, rs1801133, rs1801131, rs4680, rs2228570, rs1544410, rs429358, rs7412, snp_count")
        .eq("user_id", db_user_id)
        .order("created_at", { ascending: false })
        .limit(3);

      // Get lab biomarkers data - FIXED SCHEMA
      const { data: labData } = await supabase
        .from("lab_biomarkers")
        .select("biomarker_data, created_at, biomarker_count")
        .eq("user_id", db_user_id)
        .order("created_at", { ascending: false })
        .limit(3);

      // Get uploaded file status for context
      const { data: uploads } = await supabase
        .from("uploaded_files")
        .select("file_type, file_name, processing_status, created_at")
        .eq("user_id", db_user_id)
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
            .eq("user_id", db_user_id)
            .neq("id", conversation_id)
            .order("updated_at", { ascending: false })
            .limit(3)
            .then(res => res.data?.map(c => c.id) || [])
        )
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(10);

      // Get latest AI analysis for quick highlights
      const { data: latestAnalysis } = await supabase
        .from('ai_analyses')
        .select('relevant_genes, relevant_biomarkers')
        .eq('user_id', db_user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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

      if (geneticData && geneticData.length > 0) {
        personalizedContext += `\n\n### YOUR GENETIC MARKERS:`;
        geneticData.forEach(genetic => {
          const testDate = new Date(genetic.created_at).toLocaleDateString();
          personalizedContext += `\n**Genetic Test from ${genetic.source_company || 'Unknown'} (${testDate}):**`;
          
          // Show key highlights first
          if (genetic.mthfr_c677t) {
            personalizedContext += `\n- MTHFR C677T: ${genetic.mthfr_c677t}`;
          }
          if (genetic.mthfr_a1298c) {
            personalizedContext += `\n- MTHFR A1298C: ${genetic.mthfr_a1298c}`;
          }
          if (genetic.apoe_variant) {
            personalizedContext += `\n- APOE Variant: ${genetic.apoe_variant}`;
          }
          if (genetic.rs4680) {
            personalizedContext += `\n- COMT (rs4680): ${genetic.rs4680}`;
          }
          if (genetic.rs2228570) {
            personalizedContext += `\n- VDR FokI (rs2228570): ${genetic.rs2228570}`;
          }
          if (genetic.rs1544410) {
            personalizedContext += `\n- VDR BsmI (rs1544410): ${genetic.rs1544410}`;
          }
          
          // Show comprehensive SNP data if available
          if (genetic.snp_data && typeof genetic.snp_data === 'object' && Object.keys(genetic.snp_data).length > 0) {
            const snpCount = Object.keys(genetic.snp_data).length;
            personalizedContext += `\n**COMPREHENSIVE GENETIC DATA (${snpCount.toLocaleString()} SNPs):**`;
            
            // For small datasets, show all. For large datasets, show comprehensive sample
            const allSnps = Object.entries(genetic.snp_data);
            
            if (snpCount <= 100) {
              // Show all SNPs for small datasets
              personalizedContext += `\n  ALL SNPs: ${allSnps.map(([rsid, genotype]) => `${rsid}:${genotype}`).join(', ')}`;
            } else {
              // For large datasets, show strategic sampling
              const importantSnps = ['rs1801133', 'rs1801131', 'rs429358', 'rs7412', 'rs4680', 'rs1544410', 'rs2228570'];
              const foundImportant = [];
              const randomSample = [];
              
              // Get important SNPs
              importantSnps.forEach(rsid => {
                if (genetic.snp_data[rsid]) {
                  foundImportant.push(`${rsid}:${genetic.snp_data[rsid]}`);
                }
              });
              
              // Get random sample of remaining SNPs (up to 50 more)
              const otherSnps = allSnps.filter(([rsid]) => !importantSnps.includes(rsid));
              const sampleSize = Math.min(50, otherSnps.length);
              for (let i = 0; i < sampleSize; i++) {
                const randomIndex = Math.floor(Math.random() * otherSnps.length);
                const [rsid, genotype] = otherSnps.splice(randomIndex, 1)[0];
                randomSample.push(`${rsid}:${genotype}`);
              }
              
              if (foundImportant.length > 0) {
                personalizedContext += `\n  KEY SNPs: ${foundImportant.join(', ')}`;
              }
              if (randomSample.length > 0) {
                personalizedContext += `\n  SAMPLE DATA: ${randomSample.join(', ')}`;
              }
              personalizedContext += `\n  FULL DATASET: ${snpCount.toLocaleString()} total SNPs available for analysis`;
            }
          }
          
          if (genetic.chip_version) {
            personalizedContext += `\n- Chip Version: ${genetic.chip_version}`;
          }
        });
      }

      if (labData && labData.length > 0) {
        personalizedContext += `\n\n### YOUR LAB RESULTS:`;
        labData.forEach(lab => {
          const testDate = new Date(lab.created_at).toLocaleDateString();
          personalizedContext += `\n**Lab Results (${testDate}) - ${lab.biomarker_count || 'Multiple'} biomarkers:**`;
          
          // Show ALL biomarkers from comprehensive extraction (biomarker_data JSON)
          if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
            const biomarkerCount = Object.keys(lab.biomarker_data).length;
            personalizedContext += `\n**COMPREHENSIVE LAB PANEL (${biomarkerCount.toLocaleString()} biomarkers):**`;
            
            // For small datasets, show all. For large datasets, show organized sample
            const allBiomarkers = Object.entries(lab.biomarker_data);
            
            if (biomarkerCount <= 50) {
              // Show all biomarkers for small datasets
              const biomarkerList = allBiomarkers.map(([k, v]) => {
                const displayName = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${displayName}: ${v}`;
              });
              personalizedContext += `\n  ALL BIOMARKERS: ${biomarkerList.join(', ')}`;
            } else {
              // For large datasets, dynamically categorize and sample
              const categories: Record<string, string[]> = {};
              
              allBiomarkers.forEach(([k, v]) => {
                const key = k.toLowerCase();
                const displayName = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const value = typeof v === 'number' ? v.toString() : v;
                const biomarkerStr = `${displayName}: ${value}`;
                
                // Dynamic categorization based on common medical terms
                if (key.includes('cholesterol') || key.includes('hdl') || key.includes('ldl') || key.includes('triglyceride') || key.includes('lipid')) {
                  if (!categories['LIPID PANEL']) categories['LIPID PANEL'] = [];
                  categories['LIPID PANEL'].push(biomarkerStr);
                } else if (key.includes('glucose') || key.includes('insulin') || key.includes('hba1c') || key.includes('bun') || key.includes('creatinine') || key.includes('sodium') || key.includes('potassium') || key.includes('chloride')) {
                  if (!categories['METABOLIC PANEL']) categories['METABOLIC PANEL'] = [];
                  categories['METABOLIC PANEL'].push(biomarkerStr);
                } else if (key.includes('blood_cell') || key.includes('hemoglobin') || key.includes('hematocrit') || key.includes('platelet') || key.includes('neutrophil') || key.includes('lymphocyte') || key.includes('eosinophil') || key.includes('basophil') || key.includes('monocyte')) {
                  if (!categories['COMPLETE BLOOD COUNT']) categories['COMPLETE BLOOD COUNT'] = [];
                  categories['COMPLETE BLOOD COUNT'].push(biomarkerStr);
                } else if (key.includes('testosterone') || key.includes('estradiol') || key.includes('tsh') || key.includes('t4') || key.includes('t3') || key.includes('prolactin') || key.includes('shbg') || key.includes('hormone')) {
                  if (!categories['HORMONE PANEL']) categories['HORMONE PANEL'] = [];
                  categories['HORMONE PANEL'].push(biomarkerStr);
                } else if (key.includes('vitamin') || key.includes('b12') || key.includes('folate') || key.includes('iron') || key.includes('ferritin') || key.includes('zinc') || key.includes('magnesium') || key.includes('calcium')) {
                  if (!categories['VITAMINS & MINERALS']) categories['VITAMINS & MINERALS'] = [];
                  categories['VITAMINS & MINERALS'].push(biomarkerStr);
                } else if (key.includes('liver') || key.includes('ast') || key.includes('alt') || key.includes('bilirubin') || key.includes('alkaline') || key.includes('ggt')) {
                  if (!categories['LIVER FUNCTION']) categories['LIVER FUNCTION'] = [];
                  categories['LIVER FUNCTION'].push(biomarkerStr);
                } else if (key.includes('kidney') || key.includes('egfr') || key.includes('albumin') || key.includes('protein')) {
                  if (!categories['KIDNEY FUNCTION']) categories['KIDNEY FUNCTION'] = [];
                  categories['KIDNEY FUNCTION'].push(biomarkerStr);
                } else if (key.includes('inflammatory') || key.includes('crp') || key.includes('esr') || key.includes('sed_rate')) {
                  if (!categories['INFLAMMATORY MARKERS']) categories['INFLAMMATORY MARKERS'] = [];
                  categories['INFLAMMATORY MARKERS'].push(biomarkerStr);
                } else {
                  if (!categories['OTHER BIOMARKERS']) categories['OTHER BIOMARKERS'] = [];
                  categories['OTHER BIOMARKERS'].push(biomarkerStr);
                }
              });
              
              // Display categorized data
              Object.entries(categories).forEach(([categoryName, biomarkers]) => {
                if (biomarkers.length > 0) {
                  personalizedContext += `\n  ${categoryName} (${biomarkers.length}): ${biomarkers.join(', ')}`;
                }
              });
              
              personalizedContext += `\n  FULL DATASET: ${biomarkerCount.toLocaleString()} total biomarkers available for analysis`;
            }
          } else {
            // No comprehensive biomarker data available for this lab result
            personalizedContext += `\n- Lab data available but not in detailed format`;
          }
        });
      }

      if (uploads && uploads.length > 0) {
        personalizedContext += `\n\n### AVAILABLE FILES:`;
        uploads.forEach(upload => {
          personalizedContext += `\n- **${upload.file_name}** (${new Date(upload.created_at).toLocaleDateString()})`;
          if (upload.processing_status) {
            personalizedContext += ` - Status: ${upload.processing_status}`;
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

      if (latestAnalysis?.relevant_genes?.length) {
        personalizedContext += `\n\n### KEY GENETIC INSIGHTS (most recent plan):\n- ${latestAnalysis.relevant_genes.join(', ')}`;
      }
      if (latestAnalysis?.relevant_biomarkers?.length) {
        personalizedContext += `\n\n### KEY BIOMARKER FINDINGS (most recent plan):\n- ${latestAnalysis.relevant_biomarkers.join(', ')}`;
      }

      personalizedContext += `\n\n### PERSONALIZATION INSTRUCTIONS:
- Reference their specific health conditions and goals in every response
- Build on previous conversations and supplement recommendations
- Use their biomarker/genetic data when making dosage suggestions
- Adapt language to their demonstrated knowledge level from past chats
- Track progress from previous recommendations and adjust accordingly
- Always connect new advice to their existing supplement regimen`;

      if (db_user_id && userMessageContent && OPENAI_API_KEY) {
        try {
          // generate embedding for current prompt
          const embedResp = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: userMessageContent, model: "text-embedding-3-small", encoding_format: "float" })
          });
          if (embedResp.ok) {
            const embedJson = await embedResp.json();
            const embedding = embedJson.data[0].embedding as number[];
            const embeddingLiteral = `[${embedding.join(',')}]`;
            const { data: memoryRows, error: memErr } = await supabase.rpc('match_user_embeddings', {
              uid: db_user_id,
              query: embeddingLiteral,
              match_count: 6
            });
            if (!memErr && memoryRows && memoryRows.length > 0) {
              memoryContext += "\n\n## PERSONAL MEMORY SNIPPETS:";
              memoryRows.forEach((row: any) => {
                memoryContext += `\n- ${row.content.substring(0, 200).replace(/\n/g,' ')}...`;
              });
            }
          }
        } catch (memEx) {
          console.error('Vector memory retrieval error', memEx);
        }
      }
    }

    const currentUserMessageForLLM = { 
      role: "user", 
      content: userMessageContent || (filePayload ? `Please analyze the attached file: ${filePayload.name}`: "Hello")
    };

    if (XAI_API_KEY) {
      console.log("Using XAI Grok API");
      
      const xaiMessages = (messagesHistory || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const systemContentForXAI = HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext + currentUploadedFileContext + memoryContext;

      const aiResp = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${XAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: systemContentForXAI },
            ...xaiMessages,
            currentUserMessageForLLM
          ],
          temperature: 0.8,
          max_tokens: 1500,
          stream: false
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("XAI API error:", aiResp.status, errText);
        if (!OPENAI_API_KEY) {
          return new Response(JSON.stringify({ error: "AI service error", details: errText }), { status: 500 });
        }
      } else {
        const aiJson = await aiResp.json();
        const assistantContent = aiJson.choices[0].message.content;

        console.log("Storing assistant message");
        if (conversation) {
          const { error: insertErr } = await supabase
            .from("chat_messages")
            .insert({ conversation_id, role: "assistant", content: assistantContent });

          if (insertErr) {
            console.error("Database error inserting message:", insertErr);
          }
        }

        console.log("ai_chat completed successfully with XAI");
        return new Response(JSON.stringify({ content: assistantContent }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    if (OPENAI_API_KEY) {
      console.log("Using OpenAI API as fallback");
      const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";
      
      const systemPromptForOpenAI = {
        role: "system",
        content: HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext + currentUploadedFileContext + memoryContext
      };

      const openAIHistoryMessages = (messagesHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

      const completionPayload = {
        model: "gpt-4o-mini",
        messages: [systemPromptForOpenAI, ...openAIHistoryMessages, currentUserMessageForLLM],
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
      if (conversation) {
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({ conversation_id, role: "assistant", content: assistantContent });

        if (insertErr) {
          console.error("Database error inserting message:", insertErr);
        }
      }

      console.log("ai_chat completed successfully with OpenAI");
      return new Response(JSON.stringify({ content: assistantContent }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (ANTHROPIC_API_KEY) {
      console.log("Using Anthropic Claude API as final fallback");
      
      const claudeMessages = (messagesHistory || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const systemContentForClaude = HIPAA_COMPLIANT_PERSONALITY_PROMPT + personalizedContext + currentUploadedFileContext + memoryContext;

      const anthropicMessages = [...claudeMessages, currentUserMessageForLLM];

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
          system: systemContentForClaude,
          messages: anthropicMessages
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
      if (conversation) {
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({ conversation_id, role: "assistant", content: assistantContent });

        if (insertErr) {
          console.error("Database error inserting message:", insertErr);
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
    
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorDetails = e instanceof Error && e.stack ? e.stack : errorMessage;
    return new Response(JSON.stringify({ error: "internal error", details: errorDetails }), { status: 500 });
  }
});

interface ChatRequest {
  conversation_id: string;
  user_id?: string;
} 
