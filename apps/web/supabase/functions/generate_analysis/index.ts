// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// --- Inlined data & helpers ( avoids cross-file imports ) ----
export const geneReferences = [
  {
    gene: 'MTHFR',
    rsids: ['rs1801133', 'rs1801131'],
    genotypesOfConcern: ['CT', 'TT', 'AC', 'CC'],
    impact: 'Reduced conversion of folate to 5-MTHF leading to elevated homocysteine',
    supplement: 'L-Methylfolate',
    dosage: '400–1000 µg daily',
    evidence: 'high',
    cautions: 'Avoid >800 µg folic acid as it can mask B-12 deficiency',
  },
  {
    gene: 'MTR / MTRR',
    rsids: ['rs1805087', 'rs1801394'],
    impact: 'Impaired remethylation of homocysteine → fatigue, high homocysteine',
    supplement: 'Methyl-B12; Betaine (TMG)',
    dosage: '1-5 mg B-12 sub-lingual, 500–1000 mg TMG',
    evidence: 'moderate',
    cautions: 'PPIs reduce B-12 absorption',
  },
  {
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypesOfConcern: ['ε3/ε4', 'ε4/ε4'],
    impact: "Higher LDL-C & increased Alzheimer's risk",
    supplement: 'DHA-rich fish oil; Mediterranean diet',
    dosage: 'EPA+DHA ≥ 1 g daily',
    evidence: 'high',
    cautions: 'High saturated-fat diet worsens lipids in ε4 carriers',
  },
  {
    gene: 'VDR',
    rsids: ['rs2228570', 'rs1544410'],
    impact: 'Reduced vitamin-D receptor activity',
    supplement: 'Vitamin D3 + K2',
    dosage: '2000–5000 IU D3 daily',
    evidence: 'moderate',
    cautions: 'Glucocorticoids can further reduce receptor activity',
  },
];

export const allergyConflicts = {
  shellfish: ['Glucosamine', 'Chondroitin', 'Chitosan', 'Marine Collagen', 'Krill Oil'],
  fish: ['Fish Oil', 'Cod Liver Oil'],
  soy: ['Soy Lecithin', 'Soy Isoflavones', 'Soy Protein'],
  ragweed: ['Chamomile', 'Echinacea', 'Dandelion', 'Milk Thistle', 'Artichoke'],
  latex: ['Avocado Powder', 'Banana Powder', 'Kiwi Powder', 'Papaya Powder', 'Mango Powder', 'Passionfruit Powder', 'Fig Powder', 'Melon Powder', 'Tomato Powder'],
  bee: ['Bee Pollen', 'Propolis', 'Royal Jelly'],
};

export const drugConflicts = {
  warfarin: ["Vitamin K", "St John's Wort", 'Ginkgo', 'Garlic', 'Fish Oil', 'Cranberry', 'Dong Quai', 'Feverfew'],
  anticoagulant: ['Fish Oil', 'Ginkgo'],
  ssri: ["St John's Wort", '5-HTP', 'Tryptophan', 'SAMe', 'Ginseng'],
  snri: ["St John's Wort", '5-HTP', 'SAMe'],
  maoi: ["St John's Wort", 'Ginseng', 'Tyramine'],
  benzo: ['Kava', 'Valerian', 'Melatonin', 'CBD'],
  opioid: ['Kava', 'Valerian'],
  levothyroxine: ['Calcium', 'Iron', 'Magnesium', 'Zinc', 'Soy Isoflavones'],
  statin: ['Red Yeast Rice', 'Grapefruit Extract'],
  insulin: ['Cinnamon', 'Chromium', 'Alpha-Lipoic Acid', 'Berberine', 'Fenugreek', 'Bitter Melon'],
  diuretic: ['Potassium', 'Magnesium', 'Licorice'],
  ace: ['Potassium'],
  arb: ['Potassium'],
  cyclosporine: ["St John's Wort", 'Echinacea', 'Astragalus'],
  tki: ["St John's Wort"],
};

// Base recommendations based on common health concerns
const baseRecommendations = {
  general: [
    {
      supplement_name: "Vitamin D3",
      dosage_amount: 2000,
      dosage_unit: "IU",
      frequency: "daily",
      reason: "Supports immune function, bone health, and mood regulation",
      evidence: "high"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports muscle function, sleep quality, and stress response",
      evidence: "high"
    },
    {
      supplement_name: "Omega-3 (EPA/DHA)",
      dosage_amount: 1000,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports heart health, brain function, and reduces inflammation",
      evidence: "high"
    }
  ],
  fatigue: [
    {
      supplement_name: "Vitamin B Complex",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "daily",
      reason: "Supports energy metabolism and nervous system function",
      evidence: "moderate"
    },
    {
      supplement_name: "CoQ10",
      dosage_amount: 100,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports cellular energy production and mitochondrial function",
      evidence: "moderate"
    },
    {
      supplement_name: "Iron",
      dosage_amount: 18,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Essential for oxygen transport and energy production (check levels first)",
      evidence: "high",
      cautions: "Only if deficient - excess iron can be harmful"
    }
  ],
  stress: [
    {
      supplement_name: "Ashwagandha",
      dosage_amount: 600,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Adaptogen that helps manage stress and cortisol levels",
      evidence: "moderate"
    },
    {
      supplement_name: "L-Theanine",
      dosage_amount: 200,
      dosage_unit: "mg",
      frequency: "as needed",
      reason: "Promotes relaxation without drowsiness",
      evidence: "moderate"
    }
  ],
  sleep: [
    {
      supplement_name: "Melatonin",
      dosage_amount: 3,
      dosage_unit: "mg",
      frequency: "nightly",
      reason: "Helps regulate sleep-wake cycle",
      evidence: "high",
      cautions: "Start with lower dose (1mg) and increase if needed"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "evening",
      reason: "Promotes muscle relaxation and better sleep quality",
      evidence: "moderate"
    }
  ],
  digestion: [
    {
      supplement_name: "Probiotic (Multi-strain)",
      dosage_amount: 10,
      dosage_unit: "billion CFU",
      frequency: "daily",
      reason: "Supports digestive health and immune function",
      evidence: "moderate"
    },
    {
      supplement_name: "Digestive Enzymes",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "with meals",
      reason: "Supports optimal digestion and nutrient absorption",
      evidence: "moderate"
    }
  ]
};

interface AnalysisRequest { user_id: string; }

serve(async (req) => {
  console.log("generate_analysis function invoked");
  
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    let body: AnalysisRequest;
    try { 
      body = await req.json(); 
      console.log("Request body:", body);
    } catch (_) { 
      return new Response('Invalid JSON', { status: 400 }); 
    }
    
    const { user_id } = body;
    if (!user_id) return new Response('Missing user_id', { status: 400 });

    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? Deno.env.get('CLAUDE_API_KEY');
    
    console.log("Environment check:", { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY, 
      OPENAI_API_KEY: !!OPENAI_API_KEY,
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY
    });
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return new Response('Configuration error', { status: 500 });
    }

    console.log("Creating Supabase client");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("Fetching assessment for user:", user_id);
    const { data: assessment, error: assessErr } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_complete', true)
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
      
    if (assessErr) {
      console.error('Error fetching assessment:', assessErr);
      console.error('Assessment error details:', JSON.stringify(assessErr, null, 2));
      return new Response('Database error', { status: 500 });
    }
    
    if (!assessment) {
      console.log("No completed assessment found for user:", user_id);
      return new Response('No completed assessment', { status: 404 });
    }
    
    console.log("Assessment found, ID:", assessment.id);

    console.log("Fetching genetic markers and lab biomarkers");
    const { data: markers, error: markersErr } = await supabase.from('genetic_markers').select('*').eq('user_id', user_id);
    const { data: labs, error: labsErr } = await supabase.from('lab_biomarkers').select('*').eq('user_id', user_id);
    
    if (markersErr) console.error("Error fetching genetic markers:", markersErr);
    if (labsErr) console.error("Error fetching lab biomarkers:", labsErr);
    
    console.log(`Found ${markers?.length || 0} genetic markers, ${labs?.length || 0} lab biomarkers`);

    // Prepare base analysis
    let analysis_summary = "Based on your health profile, here are personalized supplement recommendations to support your wellness goals.";
    let interaction_warnings: string[] = [];
    let supplements = [...baseRecommendations.general];

    // Add condition-specific recommendations
    const healthConcerns = assessment.health_concerns || [];
    if (healthConcerns.includes('fatigue') || healthConcerns.includes('low_energy')) {
      supplements.push(...baseRecommendations.fatigue);
      analysis_summary += " Focus areas include energy support.";
    }
    if (healthConcerns.includes('stress') || healthConcerns.includes('anxiety')) {
      supplements.push(...baseRecommendations.stress);
      analysis_summary += " Stress management support included.";
    }
    if (healthConcerns.includes('sleep_issues') || healthConcerns.includes('insomnia')) {
      supplements.push(...baseRecommendations.sleep);
      analysis_summary += " Sleep quality optimization addressed.";
    }
    if (healthConcerns.includes('digestive_issues') || healthConcerns.includes('bloating')) {
      supplements.push(...baseRecommendations.digestion);
      analysis_summary += " Digestive health support included.";
    }

    // Add genetic-based recommendations if available
    if (markers && markers.length > 0) {
      for (const marker of markers) {
        const geneRef = geneReferences.find(ref => ref.rsids.includes(marker.rsid));
        if (geneRef && geneRef.genotypesOfConcern?.includes(marker.genotype)) {
          // Check if we already have this supplement
          const existingSupp = supplements.find(s => s.supplement_name.toLowerCase().includes(geneRef.supplement.toLowerCase()));
          if (!existingSupp) {
            const [amount, unit] = geneRef.dosage.match(/(\d+(?:\.\d+)?)\s*(.+)/) || [0, 'mg'];
            supplements.push({
              supplement_name: geneRef.supplement.split(';')[0].trim(),
              dosage_amount: parseFloat(amount) || 1000,
              dosage_unit: unit || 'mg',
              frequency: 'daily',
              reason: `Genetic variation in ${geneRef.gene} - ${geneRef.impact}`,
              evidence: geneRef.evidence,
              cautions: geneRef.cautions
            });
          }
          analysis_summary += ` Genetic analysis shows ${geneRef.gene} variation.`;
        }
      }
    }

    // If we have AI API keys, try to use them for better analysis
    let aiAnalysisSuccessful = false;
    
    if (ANTHROPIC_API_KEY) {
      try {
        console.log("Using Anthropic Claude for analysis");
        const modelInput = { assessment, genetic_markers: markers, lab_biomarkers: labs, references: geneReferences };
        
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
            temperature: 0.3,
            system: `You are SupplementScribe, a medical-grade supplement-planning engine. Analyze the patient data and provide personalized supplement recommendations. You MUST return valid JSON only with this exact format: {"analysis_summary": "string", "interaction_warnings": ["string"], "supplements": [{"supplement_name": "string", "dosage_amount": number, "dosage_unit": "string", "frequency": "string", "reason": "string", "evidence": "high"|"moderate"|"low", "cautions": "string"|null}]}. Do not include any text outside the JSON.`,
            messages: [{
              role: "user",
              content: `Patient data: ${JSON.stringify(modelInput)}`
            }]
          }),
        });

        if (aiResp.ok) {
          const aiJson = await aiResp.json();
          const aiContent = aiJson.content[0].text;
          
          // Try to extract JSON from the response
          let jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            analysis_summary = result.analysis_summary;
            interaction_warnings = result.interaction_warnings || [];
            supplements = result.supplements;
            aiAnalysisSuccessful = true;
            console.log("Claude analysis successful");
          }
        }
      } catch (err) {
        console.error('Claude API error:', err);
      }
    }
    
    if (!aiAnalysisSuccessful && OPENAI_API_KEY) {
      try {
        console.log("Using OpenAI for analysis");
        const modelInput = { assessment, genetic_markers: markers, lab_biomarkers: labs, references: geneReferences };
        
        // Import OpenAI dynamically
        const OpenAI = (await import("npm:openai@4.18.0")).default;
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({ 
          model: 'gpt-3.5-turbo-0125', 
          messages: [
            {
              role:'system',
              content:`You are SupplementScribe, a medical-grade supplement-planning engine. Analyze the patient data and provide personalized supplement recommendations. Return ONLY valid JSON with format: {"analysis_summary": string, "interaction_warnings": string[], "supplements": [{"supplement_name": string, "dosage_amount": number, "dosage_unit": string, "frequency": string, "reason": string, "evidence": "high"|"moderate"|"low", "cautions": string|null}]}`
            },
            {
              role:'user',
              content:`Patient data: ${JSON.stringify(modelInput)}`
            }
          ], 
          max_tokens: 1024,
          temperature: 0.3,
          response_format: { type: "json_object" }
        });
        
        const result = JSON.parse(completion.choices[0].message.content ?? '{}');
        analysis_summary = result.analysis_summary;
        interaction_warnings = result.interaction_warnings || [];
        supplements = result.supplements;
        aiAnalysisSuccessful = true;
        console.log("OpenAI analysis successful");
      } catch (err) { 
        console.error('OpenAI error:', err);
      }
    }

    // Process allergies and drug interactions
    const allergies = new Set((assessment.allergies ?? []).map((a: string)=>a.toLowerCase()));
    const meds = new Set((assessment.current_medications ?? []).map((m: string)=>m.toLowerCase()));

    console.log(`Processing ${supplements.length} supplements for filtering`);
    supplements = supplements.filter((s)=>{
      const lower = s.supplement_name.toLowerCase();
      for (const [allergy,bad] of Object.entries(allergyConflicts)) {
        if (allergies.has(allergy) && bad.some((b)=>b.toLowerCase()===lower)) { 
          interaction_warnings.push(`Avoid ${s.supplement_name} due to ${allergy} allergy.`); 
          return false; 
        }
      }
      for (const [drug,bad] of Object.entries(drugConflicts)) {
        if ([...meds].some((m)=>m.includes(drug)) && bad.some((b)=>b.toLowerCase()===lower)) { 
          interaction_warnings.push(`${s.supplement_name} may interact with ${drug}.`); 
          return false; 
        }
      }
      return true;
    });

    // Remove duplicates
    const uniqueSupplements = supplements.reduce((acc: any[], curr) => {
      const exists = acc.find(s => s.supplement_name.toLowerCase() === curr.supplement_name.toLowerCase());
      if (!exists) {
        acc.push(curr);
      }
      return acc;
    }, []);

    console.log(`Filtered to ${uniqueSupplements.length} unique supplements`);
    console.log("Inserting AI analysis record");
    
    const analysisData = { 
      user_id, 
      assessment_id: assessment.id, 
      model_name: aiAnalysisSuccessful ? (ANTHROPIC_API_KEY ? 'claude-3-haiku' : 'gpt-3.5-turbo') : 'rule-based', 
      analysis_summary, 
      interaction_warnings: interaction_warnings || [],
      overall_confidence: aiAnalysisSuccessful ? 0.8 : 0.6
    };
    
    console.log("Analysis data:", JSON.stringify(analysisData, null, 2));
    
    const { data: analysisRow, error: analysisInsertErr } = await supabase
      .from('ai_analyses')
      .insert(analysisData)
      .select()
      .single();
      
    if (analysisInsertErr) {
      console.error("Error inserting analysis:", analysisInsertErr);
      console.error("Analysis insert error details:", JSON.stringify(analysisInsertErr, null, 2));
      return new Response('Database error: ' + analysisInsertErr.message, { status: 500 });
    }
    
    console.log("Analysis inserted, ID:", analysisRow?.id);

    if (Array.isArray(uniqueSupplements) && analysisRow) {
      const rows = uniqueSupplements.map((s)=>({ 
        user_id, 
        analysis_id: analysisRow.id, 
        supplement_name:s.supplement_name, 
        dosage_amount:s.dosage_amount, 
        dosage_unit:s.dosage_unit, 
        frequency:s.frequency, 
        priority_score: s.evidence === 'high' ? 5 : s.evidence === 'moderate' ? 3 : 2, 
        recommendation_reason:s.reason, 
        expected_benefits:[], 
        evidence_quality:s.evidence, 
        contraindications: s.cautions ? [s.cautions] : [],
        is_active:true 
      }));
      
      console.log(`Inserting ${rows.length} supplement recommendations`);
      const { error: recErr } = await supabase.from('supplement_recommendations').insert(rows);
      
      if (recErr) {
        console.error("Error inserting recommendations:", recErr);
        console.error("Recommendations error details:", JSON.stringify(recErr, null, 2));
      }
    }

    return new Response(JSON.stringify({ 
      status:'ok', 
      mode: aiAnalysisSuccessful ? 'ai' : 'rule-based',
      analysis_id: analysisRow?.id 
    }), { headers:{'Content-Type':'application/json'} });
  } catch (error) {
    console.error('generate_analysis error:', error);
    return new Response(JSON.stringify({ error: 'Internal error', details: String(error) }), { 
      status: 500, 
      headers:{'Content-Type':'application/json'} 
    });
  }
}); 